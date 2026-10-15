import { NextResponse } from 'next/server';
import { adminPool } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        c.course_id,
        c.code,
        c.title,
        c.semester,
        c.credits,
        c.capacity,
        c.instructor_name,
        d.name AS department_name,
        COUNT(e.enrollment_id) AS enrolled_count,
        ROUND(AVG(e.final_score), 1) AS avg_score,
        ROUND(100.0 * SUM(CASE WHEN e.is_passed = true THEN 1 ELSE 0 END) / NULLIF(COUNT(e.enrollment_id), 0), 1) AS pass_rate_pct
      FROM courses c
      JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      GROUP BY c.course_id, c.code, c.title, c.semester, c.credits, c.capacity, c.instructor_name, d.name
      ORDER BY c.code, c.semester;
    `;

    const { rows } = await adminPool.query(query);
    return NextResponse.json({ courses: rows });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch courses.' },
      { status: 500 }
    );
  }
}
