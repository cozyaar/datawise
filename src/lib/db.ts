import { Pool, QueryResult } from 'pg';

// Validate environment variables gracefully without crashing
const primaryDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:kausthubh@127.0.0.1:5432/datawise';
const readOnlyDbUrl = process.env.DATABASE_READONLY_URL || primaryDbUrl;

// Shared Admin Pool (for session recording, saved scenarios, health checks)
export const adminPool = new Pool({
  connectionString: primaryDbUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Restricted Read-Only Pool (for executing AI/analytical queries)
export const readOnlyPool = new Pool({
  connectionString: readOnlyDbUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Health check verification for database connectivity
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  database?: string;
  tableCount?: number;
  error?: string;
}> {
  try {
    const res = await adminPool.query('SELECT version(), current_database();');
    const tableRes = await adminPool.query(`
      SELECT count(*)::int AS count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    return {
      connected: true,
      version: res.rows[0].version,
      database: res.rows[0].current_database,
      tableCount: tableRes.rows[0].count,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Unknown database connection error',
    };
  }
}

/**
 * Introspect current database schema for dynamic LLM context injection
 */
export async function getDatabaseSchemaMetadata(): Promise<{
  schemaPrompt: string;
  tables: Array<{
    tableName: string;
    columns: Array<{ name: string; type: string; isNullable: boolean; isPrimaryKey?: boolean }>;
    foreignKeys: Array<{ column: string; foreignTable: string; foreignColumn: string }>;
  }>;
}> {
  const query = `
    SELECT 
      c.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable,
      tc.constraint_type,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu 
      ON c.table_name = kcu.table_name 
      AND c.column_name = kcu.column_name
      AND c.table_schema = kcu.table_schema
    LEFT JOIN information_schema.table_constraints tc 
      ON kcu.constraint_name = tc.constraint_name 
      AND kcu.table_schema = tc.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name 
      AND tc.constraint_type = 'FOREIGN KEY'
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position;
  `;

  const { rows } = await adminPool.query(query);

  const tablesMap = new Map<string, {
    tableName: string;
    columns: Array<{ name: string; type: string; isNullable: boolean; isPrimaryKey?: boolean }>;
    foreignKeys: Array<{ column: string; foreignTable: string; foreignColumn: string }>;
  }>();

  for (const row of rows) {
    if (!tablesMap.has(row.table_name)) {
      tablesMap.set(row.table_name, {
        tableName: row.table_name,
        columns: [],
        foreignKeys: [],
      });
    }

    const table = tablesMap.get(row.table_name)!;
    const existingCol = table.columns.find((c) => c.name === row.column_name);

    if (!existingCol) {
      table.columns.push({
        name: row.column_name,
        type: row.data_type,
        isNullable: row.is_nullable === 'YES',
        isPrimaryKey: row.constraint_type === 'PRIMARY KEY',
      });
    } else if (row.constraint_type === 'PRIMARY KEY') {
      existingCol.isPrimaryKey = true;
    }

    if (row.constraint_type === 'FOREIGN KEY' && row.foreign_table_name) {
      table.foreignKeys.push({
        column: row.column_name,
        foreignTable: row.foreign_table_name,
        foreignColumn: row.foreign_column_name,
      });
    }
  }

  const tables = Array.from(tablesMap.values());

  // Generate a concise prompt representation for the LLM
  let schemaPrompt = 'Database Schema (PostgreSQL 18 - "datawise"):\n';
  for (const t of tables) {
    schemaPrompt += `\nTable "${t.tableName}":\n`;
    for (const c of t.columns) {
      schemaPrompt += `  - ${c.name} (${c.type})${c.isPrimaryKey ? ' [PRIMARY KEY]' : ''}${c.isNullable ? '' : ' NOT NULL'}\n`;
    }
    if (t.foreignKeys.length > 0) {
      schemaPrompt += '  Foreign Keys:\n';
      for (const fk of t.foreignKeys) {
        schemaPrompt += `    - ${fk.column} -> ${fk.foreignTable}(${fk.foreignColumn})\n`;
      }
    }
  }

  return { schemaPrompt, tables };
}

/**
 * Validates whether SQL statement is safe and strictly read-only
 */
export function validateReadOnlySQL(sql: string): { isValid: boolean; reason?: string; sanitizedSql?: string } {
  const trimmed = sql.trim();

  // Strip trailing semicolons
  const cleanSql = trimmed.replace(/;+\s*$/, '');

  // Must not be empty
  if (!cleanSql) {
    return { isValid: false, reason: 'Query cannot be empty.' };
  }

  // Reject multiple statements separated by semicolons (SQL injection protection)
  if (cleanSql.includes(';')) {
    return { isValid: false, reason: 'Multi-statement execution is strictly disallowed.' };
  }

  // Must begin with SELECT or WITH (CTE)
  const startsWithSelectOrWith = /^(SELECT|WITH)\b/i.test(cleanSql);
  if (!startsWithSelectOrWith) {
    return { isValid: false, reason: 'Only read-only SELECT or WITH (CTE) queries are permitted.' };
  }

  // Disallow forbidden DML / DDL / Admin commands
  const forbiddenKeywords = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE',
    'CREATE', 'RENAME', 'GRANT', 'REVOKE', 'SET', 'EXEC', 'EXECUTE',
    'CALL', 'COPY', 'DO', 'LOCK', 'VACUUM', 'REINDEX', 'CLUSTER',
    'EXPLAIN ANALYZE', 'INTO OUTFILE', 'INTO DUMPFILE'
  ];

  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(cleanSql)) {
      return { isValid: false, reason: `Query contains forbidden DML/DDL or administrative keyword: "${keyword}".` };
    }
  }

  // Enforce a row limit if not already present
  let sanitizedSql = cleanSql;
  const maxRows = parseInt(process.env.MAX_QUERY_ROWS || '100', 10);
  if (!/\bLIMIT\s+\d+/i.test(sanitizedSql)) {
    sanitizedSql = `${sanitizedSql} LIMIT ${maxRows}`;
  }

  return { isValid: true, sanitizedSql };
}

/**
 * Safely executes analytical read-only SQL with timeout and restricted privileges
 */
export async function executeReadOnlyQuery(sql: string): Promise<{
  rows: any[];
  fields: Array<{ name: string; dataTypeID: number }>;
  executionTimeMs: number;
  rowCount: number;
}> {
  const validation = validateReadOnlySQL(sql);
  if (!validation.isValid) {
    throw new Error(`Security validation failed: ${validation.reason}`);
  }

  const queryToRun = validation.sanitizedSql!;
  const timeoutMs = parseInt(process.env.QUERY_TIMEOUT_MS || '6000', 10);

  const startTime = Date.now();
  const client = await readOnlyPool.connect();

  try {
    // Set explicit session constraints for safety
    await client.query(`SET statement_timeout = ${timeoutMs};`);
    await client.query('SET default_transaction_read_only = on;');

    const res: QueryResult = await client.query(queryToRun);
    const executionTimeMs = Date.now() - startTime;

    return {
      rows: res.rows,
      fields: res.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
      executionTimeMs,
      rowCount: res.rowCount || res.rows.length,
    };
  } finally {
    client.release();
  }
}

/**
 * Safely executes PostgreSQL EXPLAIN (ANALYZE, COSTS, VERBOSE, FORMAT JSON)
 * to retrieve the engine's query optimizer execution plan.
 */
export async function executeExplainPlan(sql: string): Promise<any> {
  const validation = validateReadOnlySQL(sql);
  if (!validation.isValid || !validation.sanitizedSql) {
    return null;
  }

  const client = await readOnlyPool.connect();
  try {
    await client.query('SET statement_timeout = 4000;');
    const explainSql = `EXPLAIN (ANALYZE, COSTS, VERBOSE, FORMAT JSON) ${validation.sanitizedSql}`;
    const res = await client.query(explainSql);
    const planWrapper = res.rows[0]?.['QUERY PLAN'];
    return Array.isArray(planWrapper) ? planWrapper[0] : planWrapper;
  } catch (err: any) {
    console.warn('Explain plan execution error:', err.message);
    return null;
  } finally {
    client.release();
  }
}

