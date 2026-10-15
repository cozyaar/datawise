const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:kausthubh@127.0.0.1:5432/datawise' });

async function getCols() {
  const tables = ['departments', 'students', 'courses', 'enrollments', 'attendance', 'assessments', 'analysis_sessions', 'generated_queries', 'scenarios', 'scenario_results'];
  const res = await pool.query(
    "SELECT table_name, column_name, data_type, udt_name, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ANY($1) ORDER BY table_name, ordinal_position;",
    [tables]
  );
  
  const byTable = {};
  for (const row of res.rows) {
    if (!byTable[row.table_name]) byTable[row.table_name] = [];
    byTable[row.table_name].push({
      name: row.column_name,
      type: row.udt_name || row.data_type,
      nullable: row.is_nullable === 'YES'
    });
  }
  console.log(JSON.stringify(byTable, null, 2));
}
getCols().then(() => pool.end());
