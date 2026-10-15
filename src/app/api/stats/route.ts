import { NextResponse } from 'next/server';
import { adminPool } from '@/lib/db';

export async function GET() {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*)::int FROM students) AS total_students,
        (SELECT COUNT(*)::int FROM departments) AS total_departments,
        (SELECT COUNT(*)::int FROM courses) AS total_courses,
        (SELECT COUNT(*)::int FROM enrollments) AS total_enrollments,
        (SELECT ROUND(AVG(gpa)::numeric, 2) FROM students) AS avg_gpa,
        (SELECT ROUND(100.0 * COUNT(CASE WHEN is_passed = true THEN 1 END) / NULLIF(COUNT(*), 0), 1) FROM enrollments) AS overall_pass_rate,
        (SELECT COUNT(*)::int FROM analysis_sessions) AS total_investigations,
        (SELECT COUNT(*)::int FROM scenarios) AS total_scenarios;
    `;

    const { rows } = await adminPool.query(statsQuery);
    const stats = rows[0] || {};

    // Also get distribution of grades for a quick dashboard widget
    const gradeDistQuery = `
      SELECT letter_grade, COUNT(*)::int as count 
      FROM enrollments 
      WHERE letter_grade IS NOT NULL 
      GROUP BY letter_grade 
      ORDER BY letter_grade;
    `;
    const gradeRes = await adminPool.query(gradeDistQuery);

    // Get recent activities (recent 3 sessions and recent 3 scenarios)
    const recentSessionsQuery = `
      SELECT session_id, title, natural_language_question, created_at 
      FROM analysis_sessions 
      ORDER BY session_id DESC 
      LIMIT 3;
    `;
    const recentSessions = (await adminPool.query(recentSessionsQuery)).rows;

    const recentScenariosQuery = `
      SELECT scenario_id, title, scenario_type, created_at 
      FROM scenarios 
      ORDER BY scenario_id DESC 
      LIMIT 3;
    `;
    const recentScenarios = (await adminPool.query(recentScenariosQuery)).rows;

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: stats.total_students || 0,
        totalDepartments: stats.total_departments || 0,
        totalCourses: stats.total_courses || 0,
        totalEnrollments: stats.total_enrollments || 0,
        avgGpa: parseFloat(stats.avg_gpa) || 0,
        overallPassRate: parseFloat(stats.overall_pass_rate) || 0,
        totalInvestigations: stats.total_investigations || 0,
        totalScenarios: stats.total_scenarios || 0,
      },
      gradeDistribution: gradeRes.rows,
      recentActivity: {
        sessions: recentSessions,
        scenarios: recentScenarios,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch dashboard statistics',
      },
      { status: 500 }
    );
  }
}
