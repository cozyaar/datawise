import { NextRequest, NextResponse } from 'next/server';
import { executeReadOnlyQuery, validateReadOnlySQL } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sql } = await req.json();

    if (!sql) {
      return NextResponse.json({ error: 'SQL query is required' }, { status: 400 });
    }

    const validation = validateReadOnlySQL(sql);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Security Rejected: ${validation.reason}` },
        { status: 400 }
      );
    }

    const queryResult = await executeReadOnlyQuery(validation.sanitizedSql!);

    return NextResponse.json({
      success: true,
      sql: validation.sanitizedSql,
      rows: queryResult.rows,
      fields: queryResult.fields,
      executionTimeMs: queryResult.executionTimeMs,
      rowCount: queryResult.rowCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 400 }
    );
  }
}
