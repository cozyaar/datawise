import { NextRequest, NextResponse } from 'next/server';
import { adminPool, executeReadOnlyQuery } from '@/lib/db';

const VALID_TABLES = [
  'departments',
  'students',
  'courses',
  'enrollments',
  'attendance',
  'assessments',
  'analysis_sessions',
  'generated_queries',
  'scenarios',
  'scenario_results',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTable = searchParams.get('table');

    // 1. Get all tables and their row counts
    const tableCountsQuery = `
      SELECT 
        table_name,
        (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
      FROM (
        SELECT 
          table_name,
          query_to_xml(format('select count(*) as cnt from %I', table_name), false, true, '') as xml_count
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ANY($1)
      ) t
      ORDER BY table_name;
    `;
    const tableCountsRes = await adminPool.query(tableCountsQuery, [VALID_TABLES]);

    // 2. Get columns, types, primary keys, and nullable attributes for all tables
    const columnsQuery = `
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type
      FROM information_schema.columns c
      LEFT JOIN information_schema.key_column_usage kcu 
        ON c.table_name = kcu.table_name 
        AND c.column_name = kcu.column_name 
        AND c.table_schema = kcu.table_schema
      LEFT JOIN information_schema.table_constraints tc 
        ON kcu.constraint_name = tc.constraint_name 
        AND kcu.table_schema = tc.table_schema
      WHERE c.table_schema = 'public' AND c.table_name = ANY($1)
      ORDER BY c.table_name, c.ordinal_position;
    `;
    const columnsRes = await adminPool.query(columnsQuery, [VALID_TABLES]);

    // 3. Get all foreign keys for the ER diagram
    const foreignKeysQuery = `
      SELECT
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;
    const fksRes = await adminPool.query(foreignKeysQuery);

    // 4. Get indexes
    const indexesQuery = `
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    const indexesRes = await adminPool.query(indexesQuery);

    // 5. If a specific valid table is requested, fetch up to 25 sample rows
    let tableRows: any[] = [];
    let selectedTable = requestedTable && VALID_TABLES.includes(requestedTable) ? requestedTable : 'courses';

    const sampleDataRes = await adminPool.query(
      `SELECT * FROM ${selectedTable} ORDER BY 1 DESC LIMIT 25;`
    );
    tableRows = sampleDataRes.rows;

    // 6. Relational SQL Benchmarks with code and explanations
    const dbmsConcepts = [
      {
        id: 'multi_join',
        title: 'Multi-Table Relational JOIN',
        concept: 'Inner Joins across 4 Normalized Relations (Students, Enrollments, Courses, Departments)',
        sql: `SELECT 
  s.student_number,
  s.first_name || ' ' || s.last_name AS student_name,
  d.name AS department_name,
  c.code AS course_code,
  c.title AS course_title,
  e.final_score,
  e.letter_grade
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN departments d ON s.department_id = d.department_id
JOIN courses c ON e.course_id = c.course_id
ORDER BY e.final_score DESC
LIMIT 15;`,
        explanation: 'Combines normalized entities across foreign keys to project a consolidated academic record without data redundancy.',
      },
      {
        id: 'group_by_having',
        title: 'GROUP BY with Aggregation & HAVING Filter',
        concept: 'Conditional Aggregation filtering Course Cohorts with minimum enrollments',
        sql: `SELECT 
  c.code AS course_code,
  c.title AS course_title,
  c.semester,
  COUNT(e.enrollment_id) AS enrolled_students,
  ROUND(AVG(e.final_score), 2) AS average_score,
  ROUND(MIN(e.final_score), 2) AS lowest_score,
  ROUND(MAX(e.final_score), 2) AS highest_score
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.code, c.title, c.semester
HAVING COUNT(e.enrollment_id) >= 15
ORDER BY average_score ASC;`,
        explanation: 'Applies aggregate functions (COUNT, AVG, MIN, MAX) and filters aggregated groups using the HAVING clause after grouping.',
      },
      {
        id: 'cte_subquery',
        title: 'Common Table Expressions (WITH / CTE)',
        concept: 'Two-tier relational pipeline computing attendance rates and correlation with pass status',
        sql: `WITH attendance_metrics AS (
  SELECT 
    e.enrollment_id,
    e.student_id,
    e.course_id,
    e.final_score,
    ROUND(100.0 * COUNT(CASE WHEN a.status = 'present' THEN 1 END) / NULLIF(COUNT(a.attendance_id), 0), 1) AS att_pct
  FROM enrollments e
  JOIN attendance a ON e.enrollment_id = a.enrollment_id
  GROUP BY e.enrollment_id, e.student_id, e.course_id, e.final_score
)
SELECT 
  CASE 
    WHEN att_pct >= 85 THEN 'Tier 1: High Attendance (>=85%)'
    WHEN att_pct >= 70 THEN 'Tier 2: Moderate Attendance (70-84%)'
    ELSE 'Tier 3: Low Attendance (<70%)'
  END AS attendance_bracket,
  COUNT(*) AS total_students,
  ROUND(AVG(final_score), 2) AS avg_final_score,
  ROUND(100.0 * SUM(CASE WHEN final_score >= 50 THEN 1 ELSE 0 END) / COUNT(*), 1) AS pass_rate_pct
FROM attendance_metrics
GROUP BY 1
ORDER BY avg_final_score DESC;`,
        explanation: 'Encapsulates complex intermediate joins inside a readable CTE, feeding an analytical bracket aggregation.',
      },
      {
        id: 'window_functions',
        title: 'Window Functions (RANK & AVG OVER PARTITION)',
        concept: 'Non-collapsing analytics computing within-course rank and departmental score deviations',
        sql: `SELECT 
  s.student_number,
  s.first_name || ' ' || s.last_name AS student_name,
  c.code AS course_code,
  e.final_score,
  RANK() OVER (PARTITION BY e.course_id ORDER BY e.final_score DESC) AS class_rank,
  ROUND(AVG(e.final_score) OVER (PARTITION BY e.course_id), 2) AS course_avg,
  ROUND(e.final_score - AVG(e.final_score) OVER (PARTITION BY e.course_id), 2) AS diff_from_avg
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE c.code = 'CS201' AND c.semester = 'Fall 2025'
ORDER BY class_rank ASC
LIMIT 15;`,
        explanation: 'Demonstrates window functions that compute analytical rankings and partition averages without reducing row cardinality.',
      },
      {
        id: 'indexes_and_constraints',
        title: 'Check Constraints & Generated Always Columns',
        concept: 'Enforcing data integrity at the database engine level (STORED generated column for is_passed)',
        sql: `SELECT 
  e.enrollment_id,
  e.final_score,
  e.is_passed,
  e.letter_grade,
  CASE WHEN e.is_passed = (e.final_score >= 50.0) THEN 'Constraint Verified' ELSE 'Mismatch' END as integrity_check
FROM enrollments e
ORDER BY random()
LIMIT 10;`,
        explanation: 'Demonstrates PostgreSQL GENERATED ALWAYS AS STORED columns ensuring business rules are enforced automatically in storage.',
      },
    ];

    return NextResponse.json({
      success: true,
      tables: tableCountsRes.rows,
      columns: columnsRes.rows,
      foreignKeys: fksRes.rows,
      indexes: indexesRes.rows,
      selectedTable,
      tableRows,
      dbmsConcepts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch explorer data' },
      { status: 500 }
    );
  }
}
