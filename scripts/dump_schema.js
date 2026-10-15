const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:kausthubh@127.0.0.1:5432/datawise' });

async function dumpSchema() {
  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  const tables = tablesRes.rows.map(r => r.table_name);

  const colRes = await pool.query(`
    SELECT table_name, column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  const fkRes = await pool.query(`
    SELECT
      tc.table_name AS from_table,
      kcu.column_name AS from_column,
      ccu.table_name AS to_table,
      ccu.column_name AS to_column
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY';
  `);

  const pkRes = await pool.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY';
  `);

  console.log(JSON.stringify({
    tables,
    columns: colRes.rows,
    fks: fkRes.rows,
    pks: pkRes.rows
  }, null, 2));
}

dumpSchema().then(() => pool.end());
