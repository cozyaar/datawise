import { NextResponse } from 'next/server';
import { adminPool } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch analysis sessions with their latest generated query
    const sessionsQuery = `
      SELECT 
        s.session_id,
        s.title,
        s.natural_language_question,
        s.explanation,
        s.assumptions,
        s.chart_type,
        s.chart_config,
        s.created_at,
        q.query_id,
        q.sql_query,
        q.execution_status,
        q.execution_time_ms,
        q.rows_returned,
        q.error_message
      FROM analysis_sessions s
      LEFT JOIN LATERAL (
        SELECT * FROM generated_queries 
        WHERE session_id = s.session_id 
        ORDER BY query_id DESC 
        LIMIT 1
      ) q ON true
      ORDER BY s.session_id DESC;
    `;
    const sessionsRes = await adminPool.query(sessionsQuery);

    // 2. Fetch all generated queries log (including standalone / rejected queries)
    const allQueriesQuery = `
      SELECT 
        q.query_id,
        q.session_id,
        q.sql_query,
        q.execution_status,
        q.execution_time_ms,
        q.rows_returned,
        q.error_message,
        q.executed_at,
        s.title as session_title
      FROM generated_queries q
      LEFT JOIN analysis_sessions s ON q.session_id = s.session_id
      ORDER BY q.query_id DESC
      LIMIT 50;
    `;
    const queriesRes = await adminPool.query(allQueriesQuery);

    // 3. Fetch scenarios
    const scenariosQuery = `
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
        c.title AS course_title
      FROM scenarios s
      LEFT JOIN courses c ON s.course_id = c.course_id
      ORDER BY s.scenario_id DESC;
    `;
    const scenariosRes = await adminPool.query(scenariosQuery);

    return NextResponse.json({
      success: true,
      sessions: sessionsRes.rows,
      queries: queriesRes.rows,
      scenarios: scenariosRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
