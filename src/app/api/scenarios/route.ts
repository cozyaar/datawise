import { NextResponse } from 'next/server';
import { adminPool } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        s.scenario_id,
        s.title,
        s.scenario_type,
        s.origin_session_id,
        s.course_id,
        s.parameters,
        s.baseline_summary,
        s.simulation_summary,
        s.formula_explanation,
        s.created_at,
        c.code AS course_code,
        c.title AS course_title,
        c.semester AS course_semester,
        ses.natural_language_question AS origin_question
      FROM scenarios s
      LEFT JOIN courses c ON s.course_id = c.course_id
      LEFT JOIN analysis_sessions ses ON s.origin_session_id = ses.session_id
      ORDER BY s.scenario_id DESC;
    `;

    const { rows } = await adminPool.query(query);

    return NextResponse.json({
      success: true,
      scenarios: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved scenarios' },
      { status: 500 }
    );
  }
}
