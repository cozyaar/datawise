const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:kausthubh@127.0.0.1:5432/datawise',
});

async function main() {
  const seedFile = path.join(__dirname, '../database/seeds/001_seed.sql');
  const sql = fs.readFileSync(seedFile, 'utf8');
  console.log('Running re-seed script...');
  await pool.query(sql);
  console.log('Re-seed completed successfully!');

  const checkSql = `
    SELECT c.code, c.semester, count(*) as total, 
           sum(case when e.is_passed = false then 1 else 0 end) as fails,
           round(100.0 * sum(case when e.is_passed = false then 1 else 0 end) / count(*), 1) as fail_pct,
           min(e.final_score) as min_score,
           max(e.final_score) as max_score,
           round(avg(e.final_score), 2) as avg_score
    FROM enrollments e 
    JOIN courses c ON e.course_id = c.course_id 
    GROUP BY c.code, c.semester
    ORDER BY fail_pct DESC;
  `;
  const res = await pool.query(checkSql);
  console.table(res.rows);

  // Check attendance vs score correlation
  const attendSql = `
    WITH student_att AS (
      SELECT 
        e.enrollment_id,
        e.final_score,
        ROUND(100.0 * COUNT(CASE WHEN a.status = 'present' THEN 1 END) / NULLIF(COUNT(a.attendance_id), 0), 1) AS attendance_rate
      FROM enrollments e
      JOIN attendance a ON e.enrollment_id = a.enrollment_id
      GROUP BY e.enrollment_id, e.final_score
    )
    SELECT 
      CASE 
        WHEN attendance_rate >= 80 THEN '80% - 100%'
        WHEN attendance_rate >= 60 THEN '60% - 79%'
        ELSE 'Below 60%'
      END AS bracket,
      COUNT(*) AS total_students,
      ROUND(AVG(final_score), 1) AS avg_score,
      ROUND(100.0 * SUM(CASE WHEN final_score >= 50 THEN 1 ELSE 0 END) / COUNT(*), 1) AS pass_rate_pct
    FROM student_att
    GROUP BY 1
    ORDER BY avg_score DESC;
  `;
  const attendRes = await pool.query(attendSql);
  console.log('\nAttendance Correlation Check:');
  console.table(attendRes.rows);

  await pool.end();
}

main().catch(err => {
  console.error('Seed error:', err);
  pool.end();
});
