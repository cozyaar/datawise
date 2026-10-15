const fs = require('fs');

// We will generate a complete, valid draw.io XML file for DataWise
const tables = [
  {
    id: 'tbl_departments',
    name: 'departments',
    category: 'academic',
    x: 60,
    y: 80,
    width: 260,
    headerColor: '#1e3a8a',
    headerBorder: '#3b82f6',
    columns: [
      { key: 'PK', name: 'department_id', type: 'INT4' },
      { key: 'UQ', name: 'code', type: 'VARCHAR(10)' },
      { key: '', name: 'name', type: 'VARCHAR(100)' },
      { key: '', name: 'building', type: 'VARCHAR(50)' },
      { key: '', name: 'budget', type: 'NUMERIC(12,2)' },
      { key: '', name: 'established_year', type: 'INT4' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_students',
    name: 'students',
    category: 'academic',
    x: 400,
    y: 80,
    width: 270,
    headerColor: '#1e3a8a',
    headerBorder: '#3b82f6',
    columns: [
      { key: 'PK', name: 'student_id', type: 'INT4' },
      { key: 'UQ', name: 'student_number', type: 'VARCHAR(20)' },
      { key: '', name: 'first_name', type: 'VARCHAR(50)' },
      { key: '', name: 'last_name', type: 'VARCHAR(50)' },
      { key: 'UQ', name: 'email', type: 'VARCHAR(100)' },
      { key: 'FK', name: 'department_id', type: 'INT4' },
      { key: '', name: 'enrollment_year', type: 'INT4' },
      { key: '', name: 'status', type: 'VARCHAR(20)' },
      { key: '', name: 'gpa', type: 'NUMERIC(3,2)' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_courses',
    name: 'courses',
    category: 'academic',
    x: 60,
    y: 380,
    width: 260,
    headerColor: '#1e3a8a',
    headerBorder: '#3b82f6',
    columns: [
      { key: 'PK', name: 'course_id', type: 'INT4' },
      { key: 'FK', name: 'department_id', type: 'INT4' },
      { key: '', name: 'code', type: 'VARCHAR(20)' },
      { key: '', name: 'title', type: 'VARCHAR(150)' },
      { key: '', name: 'credits', type: 'INT4' },
      { key: '', name: 'capacity', type: 'INT4' },
      { key: '', name: 'semester', type: 'VARCHAR(20)' },
      { key: '', name: 'instructor_name', type: 'VARCHAR(100)' },
      { key: '', name: 'passing_grade', type: 'NUMERIC(5,2)' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_enrollments',
    name: 'enrollments',
    category: 'academic',
    x: 400,
    y: 420,
    width: 270,
    headerColor: '#1e3a8a',
    headerBorder: '#3b82f6',
    columns: [
      { key: 'PK', name: 'enrollment_id', type: 'INT4' },
      { key: 'FK', name: 'student_id', type: 'INT4' },
      { key: 'FK', name: 'course_id', type: 'INT4' },
      { key: '', name: 'semester', type: 'VARCHAR(20)' },
      { key: '', name: 'final_score', type: 'NUMERIC(5,2)' },
      { key: '', name: 'letter_grade', type: 'VARCHAR(5)' },
      { key: '', name: 'is_passed', type: 'BOOL (STORED)' },
      { key: '', name: 'enrollment_date', type: 'DATE' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_attendance',
    name: 'attendance',
    category: 'activity',
    x: 740,
    y: 360,
    width: 260,
    headerColor: '#065f46',
    headerBorder: '#059669',
    columns: [
      { key: 'PK', name: 'attendance_id', type: 'INT4' },
      { key: 'FK', name: 'enrollment_id', type: 'INT4' },
      { key: '', name: 'session_date', type: 'DATE' },
      { key: '', name: 'status', type: 'VARCHAR(20)' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_assessments',
    name: 'assessments',
    category: 'activity',
    x: 740,
    y: 560,
    width: 260,
    headerColor: '#065f46',
    headerBorder: '#059669',
    columns: [
      { key: 'PK', name: 'assessment_id', type: 'INT4' },
      { key: 'FK', name: 'enrollment_id', type: 'INT4' },
      { key: '', name: 'assessment_type', type: 'VARCHAR(30)' },
      { key: '', name: 'title', type: 'VARCHAR(100)' },
      { key: '', name: 'max_score', type: 'NUMERIC(5,2)' },
      { key: '', name: 'score_obtained', type: 'NUMERIC(5,2)' },
      { key: '', name: 'assessment_date', type: 'DATE' },
      { key: '', name: 'weight_percentage', type: 'NUMERIC(5,2)' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_analysis_sessions',
    name: 'analysis_sessions',
    category: 'analytics',
    x: 1070,
    y: 80,
    width: 290,
    headerColor: '#581c87',
    headerBorder: '#7c3aed',
    columns: [
      { key: 'PK', name: 'session_id', type: 'INT4' },
      { key: '', name: 'title', type: 'VARCHAR(255)' },
      { key: '', name: 'natural_language_question', type: 'TEXT' },
      { key: '', name: 'explanation', type: 'TEXT' },
      { key: '', name: 'assumptions', type: 'TEXT' },
      { key: '', name: 'chart_type', type: 'VARCHAR(50)' },
      { key: '', name: 'chart_config', type: 'JSONB' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_generated_queries',
    name: 'generated_queries',
    category: 'analytics',
    x: 1070,
    y: 360,
    width: 290,
    headerColor: '#581c87',
    headerBorder: '#7c3aed',
    columns: [
      { key: 'PK', name: 'query_id', type: 'INT4' },
      { key: 'FK', name: 'session_id', type: 'INT4' },
      { key: '', name: 'sql_query', type: 'TEXT' },
      { key: '', name: 'execution_status', type: 'VARCHAR(30)' },
      { key: '', name: 'execution_time_ms', type: 'INT4' },
      { key: '', name: 'rows_returned', type: 'INT4' },
      { key: '', name: 'error_message', type: 'TEXT' },
      { key: '', name: 'executed_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_scenarios',
    name: 'scenarios',
    category: 'analytics',
    x: 1070,
    y: 640,
    width: 290,
    headerColor: '#581c87',
    headerBorder: '#7c3aed',
    columns: [
      { key: 'PK', name: 'scenario_id', type: 'INT4' },
      { key: '', name: 'title', type: 'VARCHAR(255)' },
      { key: '', name: 'scenario_type', type: 'VARCHAR(50)' },
      { key: 'FK', name: 'origin_session_id', type: 'INT4' },
      { key: 'FK', name: 'course_id', type: 'INT4' },
      { key: '', name: 'parameters', type: 'JSONB' },
      { key: '', name: 'baseline_summary', type: 'JSONB' },
      { key: '', name: 'simulation_summary', type: 'JSONB' },
      { key: '', name: 'formula_explanation', type: 'TEXT' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  },
  {
    id: 'tbl_scenario_results',
    name: 'scenario_results',
    category: 'analytics',
    x: 1430,
    y: 640,
    width: 280,
    headerColor: '#581c87',
    headerBorder: '#7c3aed',
    columns: [
      { key: 'PK', name: 'result_id', type: 'INT4' },
      { key: 'FK', name: 'scenario_id', type: 'INT4' },
      { key: '', name: 'entity_id', type: 'INT4' },
      { key: '', name: 'baseline_metric', type: 'NUMERIC(8,2)' },
      { key: '', name: 'simulated_metric', type: 'NUMERIC(8,2)' },
      { key: '', name: 'delta_metric', type: 'NUMERIC(8,2)' },
      { key: '', name: 'details', type: 'JSONB' },
      { key: '', name: 'created_at', type: 'TIMESTAMPTZ' }
    ]
  }
];

const relationships = [
  { id: 'rel_dept_students', source: 'tbl_departments', target: 'tbl_students', label: '1 : N (offers)', color: '#3b82f6' },
  { id: 'rel_dept_courses', source: 'tbl_departments', target: 'tbl_courses', label: '1 : N (manages)', color: '#3b82f6' },
  { id: 'rel_students_enrollments', source: 'tbl_students', target: 'tbl_enrollments', label: '1 : N (enrolls)', color: '#38bdf8' },
  { id: 'rel_courses_enrollments', source: 'tbl_courses', target: 'tbl_enrollments', label: '1 : N (registers)', color: '#38bdf8' },
  { id: 'rel_enrollments_attendance', source: 'tbl_enrollments', target: 'tbl_attendance', label: '1 : N (sessions)', color: '#10b981' },
  { id: 'rel_enrollments_assessments', source: 'tbl_enrollments', target: 'tbl_assessments', label: '1 : N (grades)', color: '#10b981' },
  { id: 'rel_courses_scenarios', source: 'tbl_courses', target: 'tbl_scenarios', label: '1 : N (simulates)', color: '#8b5cf6' },
  { id: 'rel_sessions_queries', source: 'tbl_analysis_sessions', target: 'tbl_generated_queries', label: '1 : N (queries)', color: '#a855f7' },
  { id: 'rel_sessions_scenarios', source: 'tbl_analysis_sessions', target: 'tbl_scenarios', label: '1 : N (branches)', color: '#a855f7' },
  { id: 'rel_scenarios_results', source: 'tbl_scenarios', target: 'tbl_scenario_results', label: '1 : N (records)', color: '#c084fc' }
];

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildDrawioXml() {
  let xml = `<mxfile host="app.diagrams.net" modified="2026-10-15T00:00:00.000Z" agent="Mozilla/5.0" version="24.0.0" type="device">
  <diagram id="datawise-er-diagram" name="DataWise ER Diagram">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1800" pageHeight="1100" background="#0f172a" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title Banner -->
        <mxCell id="banner" value="&lt;b&gt;DATAWISE DATABASE SYSTEM — RELATIONAL SCHEMA ER DIAGRAM (3NF)&lt;/b&gt;&lt;br&gt;&lt;span style=&quot;font-size: 11px; opacity: 0.8;&quot;&gt;PostgreSQL 18.6 • 10 Relational Tables • Enforced Referential Integrity (PK/FK)&lt;/span&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#1e293b;strokeColor=#475569;strokeWidth=1;fontColor=#f8fafc;fontSize=14;align=left;spacingLeft=16;fontFamily=Segoe UI,Helvetica,Arial,sans-serif;" vertex="1" parent="1">
          <mxGeometry x="60" y="16" width="1650" height="42" as="geometry" />
        </mxCell>
`;

  // Tables
  tables.forEach(tbl => {
    const rowHeight = 22;
    const headerHeight = 28;
    const totalHeight = headerHeight + tbl.columns.length * rowHeight;

    xml += `
        <!-- Table: ${tbl.name} -->
        <mxCell id="${tbl.id}" value="${tbl.name.toUpperCase()}" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=${headerHeight};horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;fillColor=${tbl.headerColor};strokeColor=${tbl.headerBorder};strokeWidth=2;fontColor=#ffffff;fontSize=13;fontFamily=Segoe UI,Helvetica,Arial,sans-serif;swimlaneFillColor=#111827;rounded=1;shadow=1;" vertex="1" parent="1">
          <mxGeometry x="${tbl.x}" y="${tbl.y}" width="${tbl.width}" height="${totalHeight}" as="geometry" />
        </mxCell>`;

    tbl.columns.forEach((col, idx) => {
      let keyBadge = '';
      if (col.key === 'PK') {
        keyBadge = `&lt;span style=&quot;color:#f59e0b; font-weight:bold;&quot;&gt;[PK]&lt;/span&gt; `;
      } else if (col.key === 'FK') {
        keyBadge = `&lt;span style=&quot;color:#38bdf8; font-weight:bold;&quot;&gt;[FK]&lt;/span&gt; `;
      } else if (col.key === 'UQ') {
        keyBadge = `&lt;span style=&quot;color:#a3e635; font-weight:bold;&quot;&gt;[UQ]&lt;/span&gt; `;
      } else {
        keyBadge = `&lt;span style=&quot;color:#64748b;&quot;&gt;• &lt;/span&gt;`;
      }

      const colNameEscaped = col.name;
      const colTypeEscaped = `&lt;span style=&quot;color:#94a3b8; font-size:10px;&quot;&gt;${col.type}&lt;/span&gt;`;
      const cellValue = `${keyBadge}&lt;b style=&quot;color:#f1f5f9;&quot;&gt;${colNameEscaped}&lt;/b&gt; &lt;span style=&quot;float:right;&quot;&gt;${colTypeEscaped}&lt;/span&gt;`;

      const borderBottom = idx < tbl.columns.length - 1 ? 'strokeColor=#1e293b;strokeWidth=1;' : 'strokeColor=none;';
      const cellY = headerHeight + idx * rowHeight;

      xml += `
        <mxCell id="${tbl.id}_c${idx}" value="${cellValue}" style="text;${borderBottom}fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;spacingRight=8;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=11;fontFamily=Consolas,Courier New,monospace;" vertex="1" parent="${tbl.id}">
          <mxGeometry y="${cellY}" width="${tbl.width}" height="${rowHeight}" as="geometry" />
        </mxCell>`;
    });
  });

  // Relationships / Edges
  relationships.forEach(rel => {
    xml += `
        <!-- Edge: ${rel.label} -->
        <mxCell id="${rel.id}" value="${rel.label}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;startArrow=ERone;endArrow=ERmany;startFill=0;endFill=0;strokeColor=${rel.color};strokeWidth=2;fontColor=${rel.color};fontSize=10;fontFamily=Segoe UI,Helvetica,Arial,sans-serif;labelBackgroundColor=#0f172a;" edge="1" parent="1" source="${rel.source}" target="${rel.target}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`;
  });

  xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
}

const xmlOutput = buildDrawioXml();
fs.writeFileSync('c:/Users/kpn_i/.gemini/antigravity-ide/scratch/datawise/datawise_er_diagram.drawio', xmlOutput, 'utf8');
console.log('Saved datawise_er_diagram.drawio successfully. Size: ' + xmlOutput.length + ' bytes');
