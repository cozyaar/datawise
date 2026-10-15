import { NextResponse } from 'next/server';
import { adminPool } from '@/lib/db';

export async function GET() {
  try {
    const client = await adminPool.connect();
    try {
      // 1. Basic server info
      const infoRes = await client.query(`
        SELECT 
          version(), 
          current_database() as database_name, 
          inet_server_port() as port,
          current_user as user_name,
          pg_postmaster_start_time() as start_time;
      `);

      // 2. Physical directory paths
      const dirRes = await client.query('SHOW data_directory;');
      const confRes = await client.query('SHOW config_file;');
      const hbaRes = await client.query('SHOW hba_file;');

      // 3. Database total disk size
      const dbSizeRes = await client.query(`
        SELECT 
          pg_database.oid as database_oid,
          pg_size_pretty(pg_database_size(current_database())) as formatted_size,
          pg_database_size(current_database()) as raw_bytes
        FROM pg_database 
        WHERE datname = current_database();
      `);

      // 4. Physical file paths and sizes for each relation
      const tablesRes = await client.query(`
        SELECT 
          relname as table_name,
          pg_size_pretty(pg_total_relation_size(relid)) as total_size,
          pg_size_pretty(pg_relation_size(relid)) as table_size,
          pg_size_pretty(pg_indexes_size(relid)) as index_size,
          pg_relation_filepath(relid) as file_path
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC;
      `);

      // 5. Active connections
      const connRes = await client.query(`
        SELECT count(*)::int as active_connections
        FROM pg_stat_activity 
        WHERE datname = current_database();
      `);

      const info = infoRes.rows[0];
      const dbInfo = dbSizeRes.rows[0];

      return NextResponse.json({
        success: true,
        server: {
          version: info.version,
          database: info.database_name,
          port: info.port || 5432,
          user: info.user_name,
          startTime: info.start_time,
          activeConnections: connRes.rows[0]?.active_connections || 1,
        },
        storage: {
          dataDirectory: dirRes.rows[0]?.data_directory,
          configFile: confRes.rows[0]?.config_file,
          hbaFile: hbaRes.rows[0]?.hba_file,
          databaseOid: dbInfo?.database_oid,
          databaseSubfolder: `${dirRes.rows[0]?.data_directory}/base/${dbInfo?.database_oid}`,
          databaseSize: dbInfo?.formatted_size,
          rawBytes: dbInfo?.raw_bytes,
        },
        tables: tablesRes.rows,
        cliCommands: {
          psqlConnect: `psql -U postgres -d datawise -h 127.0.0.1 -p 5432`,
          showDataDir: `SHOW data_directory;`,
          listTables: `\\dt`,
          sampleQuery: `SELECT * FROM students LIMIT 5;`,
          checkTableFile: `SELECT pg_relation_filepath('students');`,
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to inspect database storage',
      },
      { status: 500 }
    );
  }
}
