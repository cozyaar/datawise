const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Exact schema extracted from PostgreSQL 18
const tables = [
  {
    name: 'departments',
    schema: 'public',
    category: 'academic',
    x: 60,
    y: 90,
    width: 270,
    columns: [
      { name: 'department_id', type: 'INT4', key: 'PK' },
      { name: 'code', type: 'VARCHAR(10)' },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'building', type: 'VARCHAR(50)' },
      { name: 'budget', type: 'NUMERIC(12,2)' },
      { name: 'established_year', type: 'INT4' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'courses',
    schema: 'public',
    category: 'academic',
    x: 60,
    y: 350,
    width: 270,
    columns: [
      { name: 'course_id', type: 'INT4', key: 'PK' },
      { name: 'department_id', type: 'INT4', key: 'FK' },
      { name: 'code', type: 'VARCHAR(20)' },
      { name: 'title', type: 'VARCHAR(150)' },
      { name: 'credits', type: 'INT4' },
      { name: 'capacity', type: 'INT4' },
      { name: 'semester', type: 'VARCHAR(20)' },
      { name: 'instructor_name', type: 'VARCHAR(100)' },
      { name: 'passing_grade', type: 'NUMERIC(5,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'students',
    schema: 'public',
    category: 'academic',
    x: 390,
    y: 90,
    width: 270,
    columns: [
      { name: 'student_id', type: 'INT4', key: 'PK' },
      { name: 'student_number', type: 'VARCHAR(20)' },
      { name: 'first_name', type: 'VARCHAR(50)' },
      { name: 'last_name', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'department_id', type: 'INT4', key: 'FK' },
      { name: 'enrollment_year', type: 'INT4' },
      { name: 'status', type: 'VARCHAR(20)' },
      { name: 'gpa', type: 'NUMERIC(3,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'enrollments',
    schema: 'public',
    category: 'academic',
    x: 390,
    y: 400,
    width: 270,
    columns: [
      { name: 'enrollment_id', type: 'INT4', key: 'PK' },
      { name: 'student_id', type: 'INT4', key: 'FK' },
      { name: 'course_id', type: 'INT4', key: 'FK' },
      { name: 'semester', type: 'VARCHAR(20)' },
      { name: 'final_score', type: 'NUMERIC(5,2)' },
      { name: 'letter_grade', type: 'VARCHAR(5)' },
      { name: 'is_passed', type: 'BOOL (STORED)' },
      { name: 'enrollment_date', type: 'DATE' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'attendance',
    schema: 'public',
    category: 'activity',
    x: 720,
    y: 350,
    width: 260,
    columns: [
      { name: 'attendance_id', type: 'INT4', key: 'PK' },
      { name: 'enrollment_id', type: 'INT4', key: 'FK' },
      { name: 'session_date', type: 'DATE' },
      { name: 'status', type: 'VARCHAR(15)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'assessments',
    schema: 'public',
    category: 'activity',
    x: 720,
    y: 540,
    width: 260,
    columns: [
      { name: 'assessment_id', type: 'INT4', key: 'PK' },
      { name: 'enrollment_id', type: 'INT4', key: 'FK' },
      { name: 'assessment_type', type: 'VARCHAR(20)' },
      { name: 'title', type: 'VARCHAR(100)' },
      { name: 'max_score', type: 'NUMERIC(5,2)' },
      { name: 'score_obtained', type: 'NUMERIC(5,2)' },
      { name: 'assessment_date', type: 'DATE' },
      { name: 'weight_percentage', type: 'NUMERIC(5,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'analysis_sessions',
    schema: 'public',
    category: 'analytics',
    x: 1040,
    y: 90,
    width: 280,
    columns: [
      { name: 'session_id', type: 'INT4', key: 'PK' },
      { name: 'title', type: 'VARCHAR(200)' },
      { name: 'natural_language_question', type: 'TEXT' },
      { name: 'explanation', type: 'TEXT' },
      { name: 'assumptions', type: 'TEXT' },
      { name: 'chart_type', type: 'VARCHAR(20)' },
      { name: 'chart_config', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'generated_queries',
    schema: 'public',
    category: 'analytics',
    x: 1040,
    y: 350,
    width: 280,
    columns: [
      { name: 'query_id', type: 'INT4', key: 'PK' },
      { name: 'session_id', type: 'INT4', key: 'FK' },
      { name: 'sql_query', type: 'TEXT' },
      { name: 'execution_status', type: 'VARCHAR(20)' },
      { name: 'execution_time_ms', type: 'INT4' },
      { name: 'rows_returned', type: 'INT4' },
      { name: 'error_message', type: 'TEXT' },
      { name: 'executed_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'scenarios',
    schema: 'public',
    category: 'analytics',
    x: 1040,
    y: 600,
    width: 280,
    columns: [
      { name: 'scenario_id', type: 'INT4', key: 'PK' },
      { name: 'title', type: 'VARCHAR(200)' },
      { name: 'scenario_type', type: 'VARCHAR(50)' },
      { name: 'origin_session_id', type: 'INT4', key: 'FK' },
      { name: 'course_id', type: 'INT4', key: 'FK' },
      { name: 'parameters', type: 'JSONB' },
      { name: 'baseline_summary', type: 'JSONB' },
      { name: 'simulation_summary', type: 'JSONB' },
      { name: 'formula_explanation', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    name: 'scenario_results',
    schema: 'public',
    category: 'analytics',
    x: 1380,
    y: 600,
    width: 280,
    columns: [
      { name: 'result_id', type: 'INT4', key: 'PK' },
      { name: 'scenario_id', type: 'INT4', key: 'FK' },
      { name: 'entity_id', type: 'INT4' },
      { name: 'baseline_metric', type: 'NUMERIC(8,2)' },
      { name: 'simulated_metric', type: 'NUMERIC(8,2)' },
      { name: 'delta_metric', type: 'NUMERIC(8,2)' },
      { name: 'details', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  }
];

function generateSVG() {
  const width = 1720;
  const height = 980;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#141720; font-family:'Segoe UI', -apple-system, sans-serif;">
  
  <defs>
    <!-- Workbench Grid Pattern -->
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1"/>
    </pattern>

    <!-- Crow's Foot Connector Markers -->
    <marker id="crow-blue" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
      <line x1="10" y1="1" x2="10" y2="11" stroke="#38bdf8" stroke-width="1.8"/>
    </marker>
    <marker id="crow-emerald" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#34d399" stroke-width="1.8"/>
      <line x1="10" y1="1" x2="10" y2="11" stroke="#34d399" stroke-width="1.8"/>
    </marker>
    <marker id="crow-purple" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#a78bfa" stroke-width="1.8"/>
      <line x1="10" y1="1" x2="10" y2="11" stroke="#a78bfa" stroke-width="1.8"/>
    </marker>
  </defs>

  <!-- Background Grid -->
  <rect width="100%" height="100%" fill="#141720"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>

  <!-- Top Toolbar Bar -->
  <rect x="0" y="0" width="${width}" height="54" fill="#0c0e15" stroke="#232734" stroke-width="1"/>
  
  <text x="24" y="34" fill="#38bdf8" font-size="16" font-weight="bold" font-family="'Segoe UI', sans-serif">
    PostgreSQL 18.6 — Official Relational ER Diagram (3NF)
  </text>
  
  <g transform="translate(480, 18)">
    <rect x="0" y="0" width="135" height="22" rx="4" fill="#181e2b" stroke="#334155"/>
    <text x="10" y="15" fill="#94a3b8" font-size="11" font-family="monospace">Host: 127.0.0.1:5432</text>
  </g>
  <g transform="translate(625, 18)">
    <rect x="0" y="0" width="115" height="22" rx="4" fill="#181e2b" stroke="#334155"/>
    <text x="10" y="15" fill="#38bdf8" font-size="11" font-family="monospace">DB: datawise</text>
  </g>
  <g transform="translate(750, 18)">
    <rect x="0" y="0" width="115" height="22" rx="4" fill="#181e2b" stroke="#334155"/>
    <text x="10" y="15" fill="#34d399" font-size="11" font-family="monospace">Schema: public</text>
  </g>
  <g transform="translate(875, 18)">
    <rect x="0" y="0" width="95" height="22" rx="4" fill="#181e2b" stroke="#334155"/>
    <text x="10" y="15" fill="#e2e8f0" font-size="11" font-family="monospace">10 Tables</text>
  </g>

  <!-- Legend -->
  <g transform="translate(1320, 16)">
    <rect x="0" y="0" width="370" height="24" rx="4" fill="#181e2b" stroke="#334155"/>
    <rect x="12" y="5" width="22" height="14" rx="2" fill="#eab308"/>
    <text x="15" y="16" fill="#000" font-size="9" font-weight="bold" font-family="monospace">PK</text>
    <text x="40" y="16" fill="#cbd5e1" font-size="11">Primary Key</text>

    <rect x="122" y="5" width="22" height="14" rx="2" fill="#0284c7"/>
    <text x="126" y="16" fill="#fff" font-size="9" font-weight="bold" font-family="monospace">FK</text>
    <text x="150" y="16" fill="#cbd5e1" font-size="11">Foreign Key</text>

    <line x1="235" y1="12" x2="265" y2="12" stroke="#38bdf8" stroke-width="2" marker-end="url(#crow-blue)"/>
    <text x="275" y="16" fill="#cbd5e1" font-size="11">1 : N Cardinality</text>
  </g>

  <!-- CONNECTOR PATHS -->
  <!-- 1. departments -> students (330, 115) -> (360, 115) -> (360, 205) -> (390, 205) -->
  <path d="M 330 115 L 360 115 L 360 205 L 390 205" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#crow-blue)"/>

  <!-- 2. departments -> courses (195, 255) -> (195, 350) -->
  <path d="M 195 255 L 195 350" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#crow-blue)"/>

  <!-- 3. students -> enrollments (525, 315) -> (525, 400) -->
  <path d="M 525 315 L 525 400" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#crow-blue)"/>

  <!-- 4. courses -> enrollments (330, 395) -> (360, 395) -> (360, 465) -> (390, 465) -->
  <path d="M 330 395 L 360 395 L 360 465 L 390 465" fill="none" stroke="#38bdf8" stroke-width="1.8" marker-end="url(#crow-blue)"/>

  <!-- 5. enrollments -> attendance (660, 425) -> (690, 425) -> (690, 395) -> (720, 395) -->
  <path d="M 660 425 L 690 425 L 690 395 L 720 395" fill="none" stroke="#34d399" stroke-width="1.8" marker-end="url(#crow-emerald)"/>

  <!-- 6. enrollments -> assessments (660, 425) -> (690, 425) -> (690, 585) -> (720, 585) -->
  <path d="M 660 425 L 690 425 L 690 585 L 720 585" fill="none" stroke="#34d399" stroke-width="1.8" marker-end="url(#crow-emerald)"/>

  <!-- 7. courses -> scenarios (195, 575) -> (195, 870) -> (1180, 870) -> (1180, 825) -->
  <path d="M 195 575 L 195 870 L 1180 870 L 1180 825" fill="none" stroke="#a78bfa" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#crow-purple)"/>

  <!-- 8. analysis_sessions -> generated_queries (1180, 275) -> (1180, 350) -->
  <path d="M 1180 275 L 1180 350" fill="none" stroke="#a78bfa" stroke-width="1.8" marker-end="url(#crow-purple)"/>

  <!-- 9. analysis_sessions -> scenarios (1320, 115) -> (1350, 115) -> (1350, 685) -> (1320, 685) -->
  <path d="M 1320 115 L 1350 115 L 1350 685 L 1320 685" fill="none" stroke="#a78bfa" stroke-width="1.8" marker-end="url(#crow-purple)"/>

  <!-- 10. scenarios -> scenario_results (1320, 625) -> (1380, 625) -->
  <path d="M 1320 625 L 1380 625" fill="none" stroke="#a78bfa" stroke-width="1.8" marker-end="url(#crow-purple)"/>
`;

  // Render each table card
  for (const t of tables) {
    const headerHeight = 32;
    const rowHeight = 22;
    const tableHeight = headerHeight + (t.columns.length * rowHeight) + 6;

    let headerBg = '#1e293b';
    let headerBorder = '#38bdf8';
    if (t.category === 'activity') {
      headerBg = '#132e27';
      headerBorder = '#34d399';
    } else if (t.category === 'analytics') {
      headerBg = '#271f38';
      headerBorder = '#a78bfa';
    }

    svg += `
  <!-- TABLE: ${t.name} -->
  <g transform="translate(${t.x}, ${t.y})">
    <!-- Drop Shadow -->
    <rect x="2" y="2" width="${t.width}" height="${tableHeight}" rx="6" fill="rgba(0,0,0,0.4)"/>
    <!-- Outer Card -->
    <rect x="0" y="0" width="${t.width}" height="${tableHeight}" rx="6" fill="#1b202c" stroke="#2f374a" stroke-width="1"/>
    
    <!-- Table Header Bar -->
    <path d="M 0 6 Q 0 0 6 0 L ${t.width - 6} 0 Q ${t.width} 0 ${t.width} 6 L ${t.width} ${headerHeight} L 0 ${headerHeight} Z" fill="${headerBg}"/>
    <line x1="0" y1="0" x2="${t.width}" y2="0" stroke="${headerBorder}" stroke-width="3"/>
    <line x1="0" y1="${headerHeight}" x2="${t.width}" y2="${headerHeight}" stroke="#2f374a" stroke-width="1"/>

    <!-- Table Title -->
    <text x="12" y="21" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">${t.name}</text>
    <text x="${t.width - 12}" y="20" text-anchor="end" fill="#94a3b8" font-size="10" font-family="monospace">${t.schema}</text>

    <!-- Column Rows -->
    <g transform="translate(0, ${headerHeight + 4})">
`;

    t.columns.forEach((col, idx) => {
      const y = (idx * rowHeight);
      
      // Zebra hover tint
      if (idx % 2 === 1) {
        svg += `      <rect x="0" y="${y}" width="${t.width}" height="${rowHeight}" fill="rgba(255,255,255,0.015)"/>\n`;
      }

      // Key Badge
      if (col.key === 'PK') {
        svg += `      <rect x="10" y="${y + 4}" width="20" height="13" rx="2" fill="#eab308"/>\n`;
        svg += `      <text x="13" y="${y + 14}" fill="#000" font-size="8.5" font-weight="bold" font-family="monospace">PK</text>\n`;
      } else if (col.key === 'FK') {
        svg += `      <rect x="10" y="${y + 4}" width="20" height="13" rx="2" fill="#0284c7"/>\n`;
        svg += `      <text x="14" y="${y + 14}" fill="#fff" font-size="8.5" font-weight="bold" font-family="monospace">FK</text>\n`;
      } else {
        svg += `      <circle cx="20" cy="${y + 11}" r="2" fill="#475569"/>\n`;
      }

      // Column Name
      const colNameColor = col.key === 'PK' ? '#fde047' : (col.key === 'FK' ? '#7dd3fc' : '#e2e8f0');
      svg += `      <text x="36" y="${y + 15}" fill="${colNameColor}" font-size="11" font-family="monospace">${col.name}</text>\n`;

      // Column Type
      svg += `      <text x="${t.width - 10}" y="${y + 15}" text-anchor="end" fill="#64748b" font-size="10" font-family="monospace">${col.type}</text>\n`;
    });

    svg += `    </g>
  </g>
`;
  }

  // Bottom Footer Stamp
  svg += `
  <g transform="translate(60, 915)">
    <rect x="0" y="0" width="700" height="42" rx="6" fill="#0f172a" stroke="#334155"/>
    <text x="16" y="18" fill="#f8fafc" font-size="12" font-weight="bold" font-family="monospace">DataWise Relational Schema Proof &#8226; Fully Normalized 3NF</text>
    <text x="16" y="33" fill="#94a3b8" font-size="11" font-family="monospace">PostgreSQL 18.6 Enterprise &#8226; Physical Storage: C:/Program Files/PostgreSQL/18/data</text>
  </g>
</svg>`;

  return svg;
}

async function render() {
  console.log('Generating official ER diagram SVG and PNG...');
  const svgContent = generateSVG();

  // Save SVG
  const svgPath = path.join(__dirname, '../public/datawise_er_diagram.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log('Saved SVG to:', svgPath);

  // Render High-Res PNG with Sharp (2x density for crisp retina display)
  const pngPathPublic = path.join(__dirname, '../public/datawise_er_diagram.png');
  const pngPathArtifact = 'C:\\Users\\kpn_i\\.gemini\\antigravity-ide\\brain\\5fbe7655-2649-4017-a78f-7d0a7d2f2c0c\\datawise_er_diagram_official.png';
  const pngPathWorkspace = path.join(__dirname, '../datawise_er_diagram.png');

  const pngBuffer = await sharp(Buffer.from(svgContent), { density: 150 })
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync(pngPathPublic, pngBuffer);
  fs.writeFileSync(pngPathArtifact, pngBuffer);
  fs.writeFileSync(pngPathWorkspace, pngBuffer);

  console.log('Rendered High-Res PNG to:');
  console.log(' - Public:', pngPathPublic);
  console.log(' - Artifact:', pngPathArtifact);
  console.log(' - Workspace:', pngPathWorkspace);
}

render().catch(console.error);
