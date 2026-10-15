import { NextRequest, NextResponse } from 'next/server';
import {
  simulateCourseCapacity,
  simulateAttendanceShift,
  simulateTutoringIntervention,
  saveScenarioToDatabase,
  ScenarioType,
} from '@/lib/simulator';
import { adminPool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenarioType, parameters, originSessionId, save = true } = body;

    if (!scenarioType) {
      return NextResponse.json({ error: 'scenarioType is required' }, { status: 400 });
    }

    let result;

    switch (scenarioType as ScenarioType) {
      case 'course_capacity': {
        const courseId = parseInt(parameters.courseId, 10);
        const newCapacity = parseInt(parameters.newCapacity, 10);
        if (!courseId || isNaN(courseId) || !newCapacity || isNaN(newCapacity)) {
          return NextResponse.json(
            { error: 'Valid courseId and newCapacity are required for course capacity simulation.' },
            { status: 400 }
          );
        }
        result = await simulateCourseCapacity({ courseId, newCapacity }, originSessionId);
        break;
      }

      case 'attendance_shift': {
        const attendanceDeltaPct = parseFloat(parameters.attendanceDeltaPct);
        const courseId = parameters.courseId ? parseInt(parameters.courseId, 10) : undefined;
        const elasticityFactor = parameters.elasticityFactor ? parseFloat(parameters.elasticityFactor) : 0.32;

        if (isNaN(attendanceDeltaPct)) {
          return NextResponse.json(
            { error: 'Valid attendanceDeltaPct is required.' },
            { status: 400 }
          );
        }
        result = await simulateAttendanceShift(
          { courseId, attendanceDeltaPct, elasticityFactor },
          originSessionId
        );
        break;
      }

      case 'tutoring_intervention': {
        const courseId = parseInt(parameters.courseId, 10);
        const thresholdScore = parseFloat(parameters.thresholdScore || 50.0);
        const projectedPointGain = parseFloat(parameters.projectedPointGain || 8.0);

        if (!courseId || isNaN(courseId)) {
          return NextResponse.json(
            { error: 'Valid courseId is required for tutoring simulation.' },
            { status: 400 }
          );
        }
        result = await simulateTutoringIntervention(
          { courseId, thresholdScore, projectedPointGain },
          originSessionId
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unsupported scenarioType: ${scenarioType}` },
          { status: 400 }
        );
    }

    let savedScenarioId: number | undefined;
    if (save) {
      savedScenarioId = await saveScenarioToDatabase(result);
      result.scenarioId = savedScenarioId;
    }

    return NextResponse.json({
      success: true,
      result,
      ...result,
    });
  } catch (error: any) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: error.message || 'Simulation execution failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch available courses for scenario dropdowns
export async function GET() {
  try {
    const query = `
      SELECT 
        c.course_id,
        c.code,
        c.title,
        c.semester,
        c.capacity,
        COUNT(e.enrollment_id) AS enrolled_count,
        ROUND(AVG(e.final_score), 1) AS avg_score,
        ROUND(100.0 * SUM(CASE WHEN e.is_passed = false THEN 1 ELSE 0 END) / NULLIF(COUNT(e.enrollment_id), 0), 1) AS failure_rate_pct
      FROM courses c
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      GROUP BY c.course_id, c.code, c.title, c.semester, c.capacity
      ORDER BY c.code, c.semester;
    `;
    const { rows } = await adminPool.query(query);
    return NextResponse.json({ courses: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
