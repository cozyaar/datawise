import { adminPool } from './db';
import { z } from 'zod';

export const ScenarioTypeSchema = z.enum([
  'course_capacity',
  'attendance_shift',
  'tutoring_intervention',
]);

export type ScenarioType = z.infer<typeof ScenarioTypeSchema>;

export interface CourseCapacityParams {
  courseId: number;
  newCapacity: number;
}

export interface AttendanceShiftParams {
  courseId?: number; // optional, or for all courses
  attendanceDeltaPct: number; // e.g. +10, -5
  elasticityFactor?: number; // default 0.32
}

export interface TutoringInterventionParams {
  courseId: number;
  thresholdScore: number; // e.g. 50 or 55 (students below this score get tutoring)
  projectedPointGain: number; // e.g. 8.0 points
  attendanceBonus?: boolean;
}

export interface SimulationResultPayload {
  scenarioId?: number;
  title: string;
  scenarioType: ScenarioType;
  originSessionId?: number | null;
  courseId?: number | null;
  courseCode?: string;
  courseTitle?: string;
  parameters: any;
  baselineSummary: any;
  simulationSummary: any;
  formulaExplanation: string;
  items: Array<{
    entityId: number;
    label: string;
    subLabel?: string;
    baselineMetric: number;
    simulatedMetric: number;
    deltaMetric: number;
    statusChange?: string;
  }>;
}

/**
 * 1. SIMULATE COURSE CAPACITY ADJUSTMENT
 */
export async function simulateCourseCapacity(
  params: CourseCapacityParams,
  originSessionId?: number | null
): Promise<SimulationResultPayload> {
  const { courseId, newCapacity } = params;

  // Retrieve course baseline & current enrollment
  const courseQuery = `
    SELECT 
      c.course_id,
      c.code,
      c.title,
      c.capacity AS baseline_capacity,
      c.semester,
      COUNT(e.enrollment_id) AS enrolled_count
    FROM courses c
    LEFT JOIN enrollments e ON c.course_id = e.course_id
    WHERE c.course_id = $1
    GROUP BY c.course_id, c.code, c.title, c.capacity, c.semester;
  `;
  const { rows } = await adminPool.query(courseQuery, [courseId]);
  if (rows.length === 0) {
    throw new Error(`Course with ID ${courseId} not found.`);
  }

  const course = rows[0];
  const enrolledCount = parseInt(course.enrolled_count, 10);
  const baselineCap = parseInt(course.baseline_capacity, 10);

  const baselineUtil = Number(((enrolledCount / baselineCap) * 100).toFixed(1));
  const simulatedUtil = Number(((enrolledCount / newCapacity) * 100).toFixed(1));
  const capacityDelta = newCapacity - baselineCap;

  // Determine waitlist or available seats
  const baselineSeatsLeft = baselineCap - enrolledCount;
  const simulatedSeatsLeft = newCapacity - enrolledCount;

  const baselineSummary = {
    courseCode: course.code,
    courseTitle: course.title,
    semester: course.semester,
    enrolledCount,
    baselineCapacity: baselineCap,
    baselineUtilizationPct: baselineUtil,
    availableSeats: baselineSeatsLeft,
  };

  const simulationSummary = {
    newCapacity,
    capacityDelta,
    simulatedUtilizationPct: simulatedUtil,
    simulatedAvailableSeats: simulatedSeatsLeft,
    status: simulatedSeatsLeft < 0 ? 'Overcapacity / Waitlist Needed' : 'Seats Accommodated',
  };

  const formulaExplanation = `
Hypothetical Capacity Simulation:
- Baseline Utilization = (Enrolled [${enrolledCount}] / Baseline Capacity [${baselineCap}]) * 100 = ${baselineUtil}%
- Simulated Utilization = (Enrolled [${enrolledCount}] / New Capacity [${newCapacity}]) * 100 = ${simulatedUtil}%
- Net Available Seat Variance = ${simulatedSeatsLeft} seats (Delta: ${capacityDelta > 0 ? '+' : ''}${capacityDelta})
Source records in PostgreSQL are strictly untouched.
`.trim();

  return {
    title: `Capacity Adjustment: ${course.code} (${course.semester})`,
    scenarioType: 'course_capacity',
    originSessionId: originSessionId || null,
    courseId,
    courseCode: course.code,
    courseTitle: course.title,
    parameters: params,
    baselineSummary,
    simulationSummary,
    formulaExplanation,
    items: [
      {
        entityId: courseId,
        label: `${course.code} - Total Capacity`,
        subLabel: course.semester,
        baselineMetric: baselineCap,
        simulatedMetric: newCapacity,
        deltaMetric: capacityDelta,
        statusChange: `${baselineCap} seats -> ${newCapacity} seats`,
      },
      {
        entityId: courseId,
        label: `${course.code} - Utilization Rate (%)`,
        subLabel: `${enrolledCount} enrolled students`,
        baselineMetric: baselineUtil,
        simulatedMetric: simulatedUtil,
        deltaMetric: Number((simulatedUtil - baselineUtil).toFixed(1)),
        statusChange: `${baselineUtil}% -> ${simulatedUtil}%`,
      },
    ],
  };
}

/**
 * 2. SIMULATE ATTENDANCE SHIFT
 */
export async function simulateAttendanceShift(
  params: AttendanceShiftParams,
  originSessionId?: number | null
): Promise<SimulationResultPayload> {
  const { courseId, attendanceDeltaPct, elasticityFactor = 0.32 } = params;

  let query = `
    SELECT 
      e.enrollment_id,
      e.student_id,
      s.student_number,
      s.first_name || ' ' || s.last_name AS student_name,
      c.code AS course_code,
      c.title AS course_title,
      c.course_id,
      e.final_score::numeric,
      ROUND(100.0 * COUNT(CASE WHEN a.status = 'present' THEN 1 END) / NULLIF(COUNT(a.attendance_id), 0), 1) AS baseline_attendance
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN courses c ON e.course_id = c.course_id
    LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
  `;

  const values: any[] = [];
  if (courseId) {
    query += ` WHERE c.course_id = $1`;
    values.push(courseId);
  }

  query += `
    GROUP BY e.enrollment_id, e.student_id, s.student_number, s.first_name, s.last_name, c.code, c.title, c.course_id, e.final_score
    ORDER BY e.final_score ASC;
  `;

  const { rows } = await adminPool.query(query, values);
  if (rows.length === 0) {
    throw new Error('No enrollment records found to simulate attendance shift.');
  }

  const items = rows.map((r) => {
    const baselineScore = parseFloat(r.final_score);
    const baselineAtt = parseFloat(r.baseline_attendance) || 50.0;

    // Simulated attendance clamped between 0 and 100
    const simulatedAtt = Math.min(100, Math.max(0, baselineAtt + attendanceDeltaPct));

    // Elasticity formula with diminishing returns:
    // Low scoring students with room to improve have higher score sensitivity
    const headroomFactor = (100.0 - baselineScore) / 100.0;
    const scoreImpact = attendanceDeltaPct * elasticityFactor * headroomFactor;
    const simulatedScore = Number(Math.min(100, Math.max(0, baselineScore + scoreImpact)).toFixed(1));
    const delta = Number((simulatedScore - baselineScore).toFixed(1));

    const wasPassed = baselineScore >= 50.0;
    const nowPassed = simulatedScore >= 50.0;
    let statusChange = wasPassed ? 'Maintained Pass' : 'Still Below 50';
    if (!wasPassed && nowPassed) statusChange = 'Rescued (Fail -> Pass)';
    if (wasPassed && !nowPassed) statusChange = 'Regressed (Pass -> Fail)';

    return {
      entityId: r.student_id,
      label: `${r.student_number} (${r.student_name})`,
      subLabel: `${r.course_code} - Att: ${baselineAtt}% -> ${simulatedAtt}%`,
      baselineMetric: baselineScore,
      simulatedMetric: simulatedScore,
      deltaMetric: delta,
      statusChange,
    };
  });

  const totalStudents = items.length;
  const baselineAvgScore = Number(
    (items.reduce((acc, i) => acc + i.baselineMetric, 0) / totalStudents).toFixed(1)
  );
  const simulatedAvgScore = Number(
    (items.reduce((acc, i) => acc + i.simulatedMetric, 0) / totalStudents).toFixed(1)
  );
  const baselinePassedCount = items.filter((i) => i.baselineMetric >= 50.0).length;
  const simulatedPassedCount = items.filter((i) => i.simulatedMetric >= 50.0).length;

  const baselinePassRate = Number(((baselinePassedCount / totalStudents) * 100).toFixed(1));
  const simulatedPassRate = Number(((simulatedPassedCount / totalStudents) * 100).toFixed(1));

  const baselineSummary = {
    totalStudents,
    baselineAvgScore,
    baselinePassRate,
    baselinePassedCount,
    baselineFailCount: totalStudents - baselinePassedCount,
  };

  const simulationSummary = {
    attendanceDeltaPct,
    simulatedAvgScore,
    simulatedPassRate,
    simulatedPassedCount,
    studentsRescued: Math.max(0, simulatedPassedCount - baselinePassedCount),
    netScoreLift: Number((simulatedAvgScore - baselineAvgScore).toFixed(1)),
  };

  const formulaExplanation = `
Attendance Shift Modeling Formula:
- Simulated Attendance = CLAMP(0, 100, Baseline_Attendance + (${attendanceDeltaPct}%))
- Score Elasticity Lift = Attendance_Delta [${attendanceDeltaPct}] * Elasticity_Factor [${elasticityFactor}] * Headroom [(100 - Baseline_Score) / 100]
- Modeled assumption: Attendance improvements exhibit diminishing marginal utility for students already achieving A grades, but produce meaningful pass/fail threshold flips for at-risk cohorts.
Original PostgreSQL attendance logs remain strictly unmodified.
`.trim();

  return {
    title: `Attendance Shift: ${attendanceDeltaPct > 0 ? '+' : ''}${attendanceDeltaPct}% Assumption`,
    scenarioType: 'attendance_shift',
    originSessionId: originSessionId || null,
    courseId: courseId || null,
    courseCode: rows[0]?.course_code,
    courseTitle: rows[0]?.course_title,
    parameters: params,
    baselineSummary,
    simulationSummary,
    formulaExplanation,
    items,
  };
}

/**
 * 3. SIMULATE TUTORING INTERVENTION
 */
export async function simulateTutoringIntervention(
  params: TutoringInterventionParams,
  originSessionId?: number | null
): Promise<SimulationResultPayload> {
  const { courseId, thresholdScore, projectedPointGain } = params;

  const query = `
    SELECT 
      e.enrollment_id,
      e.student_id,
      s.student_number,
      s.first_name || ' ' || s.last_name AS student_name,
      c.code AS course_code,
      c.title AS course_title,
      c.semester,
      e.final_score::numeric
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN courses c ON e.course_id = c.course_id
    WHERE c.course_id = $1
    ORDER BY e.final_score ASC;
  `;

  const { rows } = await adminPool.query(query, [courseId]);
  if (rows.length === 0) {
    throw new Error(`No enrollments found for course ID ${courseId}.`);
  }

  const course = rows[0];

  const items = rows.map((r) => {
    const baselineScore = parseFloat(r.final_score);
    const isTargeted = baselineScore < thresholdScore;

    let simulatedScore = baselineScore;
    let statusChange = 'Not Targeted (> threshold)';

    if (isTargeted) {
      // Tutoring impact formula: targeted students receive projected point gain,
      // scaled inversely by distance to 100 to prevent artificial inflation
      const scale = (100.0 - baselineScore) / 100.0;
      const gain = projectedPointGain * scale;
      simulatedScore = Number(Math.min(100, baselineScore + gain).toFixed(1));

      if (baselineScore < 50.0 && simulatedScore >= 50.0) {
        statusChange = 'Rescued: Fail -> Pass';
      } else if (baselineScore < 50.0 && simulatedScore < 50.0) {
        statusChange = 'Improved (Still < 50)';
      } else {
        statusChange = 'Tutoring Boosted';
      }
    }

    const delta = Number((simulatedScore - baselineScore).toFixed(1));

    return {
      entityId: r.student_id,
      label: `${r.student_number} (${r.student_name})`,
      subLabel: isTargeted ? `Targeted (Score < ${thresholdScore})` : 'Baseline Cohort',
      baselineMetric: baselineScore,
      simulatedMetric: simulatedScore,
      deltaMetric: delta,
      statusChange,
    };
  });

  const totalStudents = items.length;
  const targetedStudents = items.filter((i) => i.baselineMetric < thresholdScore);
  const baselinePassedCount = items.filter((i) => i.baselineMetric >= 50.0).length;
  const simulatedPassedCount = items.filter((i) => i.simulatedMetric >= 50.0).length;

  const baselineAvgScore = Number(
    (items.reduce((acc, i) => acc + i.baselineMetric, 0) / totalStudents).toFixed(1)
  );
  const simulatedAvgScore = Number(
    (items.reduce((acc, i) => acc + i.simulatedMetric, 0) / totalStudents).toFixed(1)
  );

  const baselinePassRate = Number(((baselinePassedCount / totalStudents) * 100).toFixed(1));
  const simulatedPassRate = Number(((simulatedPassedCount / totalStudents) * 100).toFixed(1));
  const studentsRescued = Math.max(0, simulatedPassedCount - baselinePassedCount);

  const baselineSummary = {
    courseCode: course.course_code,
    courseTitle: course.course_title,
    semester: course.semester,
    totalStudents,
    targetedCount: targetedStudents.length,
    baselineAvgScore,
    baselinePassRate,
    baselineFailCount: totalStudents - baselinePassedCount,
  };

  const simulationSummary = {
    thresholdScore,
    projectedPointGain,
    simulatedAvgScore,
    simulatedPassRate,
    studentsRescued,
    remainingFailCount: totalStudents - simulatedPassedCount,
    overallPassRateGainPct: Number((simulatedPassRate - baselinePassRate).toFixed(1)),
  };

  const formulaExplanation = `
Targeted Tutoring Intervention Formula:
- Eligible Criteria: Student Baseline Final Score < ${thresholdScore}.00
- Targeted Uplift: Simulated_Score = MIN(100, Baseline_Score + (${projectedPointGain} * ((100 - Baseline_Score) / 100)))
- Impact Result: Out of ${targetedStudents.length} targeted students, ${studentsRescued} are modeled to cross the 50.00% pass threshold.
- No original database records were altered.
`.trim();

  return {
    title: `Tutoring Intervention: ${course.course_code} (${course.semester})`,
    scenarioType: 'tutoring_intervention',
    originSessionId: originSessionId || null,
    courseId,
    courseCode: course.course_code,
    courseTitle: course.course_title,
    parameters: params,
    baselineSummary,
    simulationSummary,
    formulaExplanation,
    items,
  };
}

/**
 * PERSIST A SCENARIO RUN INTO POSTGRESQL
 */
export async function saveScenarioToDatabase(payload: SimulationResultPayload): Promise<number> {
  const client = await adminPool.connect();
  try {
    await client.query('BEGIN');

    const insertScenarioQuery = `
      INSERT INTO scenarios (
        title,
        scenario_type,
        origin_session_id,
        course_id,
        parameters,
        baseline_summary,
        simulation_summary,
        formula_explanation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING scenario_id;
    `;

    const res = await client.query(insertScenarioQuery, [
      payload.title,
      payload.scenarioType,
      payload.originSessionId || null,
      payload.courseId || null,
      JSON.stringify(payload.parameters),
      JSON.stringify(payload.baselineSummary),
      JSON.stringify(payload.simulationSummary),
      payload.formulaExplanation,
    ]);

    const scenarioId = res.rows[0].scenario_id;

    // Insert per-entity results (top 50 items for detailed comparison tables)
    for (const item of payload.items.slice(0, 50)) {
      await client.query(
        `INSERT INTO scenario_results (
          scenario_id, entity_id, baseline_metric, simulated_metric, delta_metric, details
        ) VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          scenarioId,
          item.entityId,
          item.baselineMetric,
          item.simulatedMetric,
          item.deltaMetric,
          JSON.stringify({
            label: item.label,
            subLabel: item.subLabel,
            statusChange: item.statusChange,
          }),
        ]
      );
    }

    await client.query('COMMIT');
    return scenarioId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
