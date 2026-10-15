import { NextResponse } from 'next/server';
import { adminPool } from '@/lib/db';

export async function GET() {
  try {
    // 1. Total Active Students
    const studentRes = await adminPool.query(
      `SELECT count(*)::int AS total FROM students WHERE status = 'active';`
    );

    // 2. Overall Pass Rate across all enrollments
    const passRateRes = await adminPool.query(`
      SELECT 
        COUNT(*)::int AS total_enrollments,
        ROUND(100.0 * SUM(CASE WHEN is_passed THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS pass_rate
      FROM enrollments;
    `);

    // 3. Most at-risk course by failure rate
    const atRiskRes = await adminPool.query(`
      SELECT 
        c.code,
        c.title,
        c.semester,
        c.course_id,
        ROUND(100.0 * SUM(CASE WHEN e.is_passed = false THEN 1 ELSE 0 END) / NULLIF(COUNT(e.enrollment_id), 0), 1) AS fail_rate
      FROM courses c
      JOIN enrollments e ON c.course_id = e.course_id
      GROUP BY c.code, c.title, c.semester, c.course_id
      ORDER BY fail_rate DESC
      LIMIT 1;
    `);

    // 4. Department course count
    const deptRes = await adminPool.query(`
      SELECT count(*)::int AS count FROM departments;
    `);

    // 5. Semester aggregates
    const semRes = await adminPool.query(`
      SELECT 
        semester,
        COUNT(enrollment_id)::int AS enrollments,
        ROUND(AVG(final_score), 1) AS avg_score,
        ROUND(100.0 * SUM(CASE WHEN is_passed THEN 1 ELSE 0 END) / NULLIF(COUNT(enrollment_id), 0), 1) AS pass_rate
      FROM enrollments
      GROUP BY semester
      ORDER BY semester ASC;
    `);

    return NextResponse.json({
      activeStudents: studentRes.rows[0]?.total ?? 0,
      passRate: passRateRes.rows[0]?.pass_rate ?? '0.0',
      totalEnrollments: passRateRes.rows[0]?.total_enrollments ?? 0,
      atRiskCourse: atRiskRes.rows[0] ?? null,
      deptCount: deptRes.rows[0]?.count ?? 0,
      semesterBreakdown: semRes.rows,
    });
  } catch (err: any) {
    console.error('Metrics fetch error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
