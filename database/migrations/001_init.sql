-- DataWise University Database Systems Project
-- Migration 001: Core Schema & Normalized Relations

-- Create schema if needed
CREATE SCHEMA IF NOT EXISTS public;

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    building VARCHAR(50) NOT NULL,
    budget NUMERIC(12, 2) CHECK (budget >= 0),
    established_year INT CHECK (established_year >= 1800 AND established_year <= 2026),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    student_id SERIAL PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    enrollment_year INT NOT NULL CHECK (enrollment_year >= 2020),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'suspended', 'withdrawn')),
    gpa NUMERIC(3, 2) DEFAULT 0.00 CHECK (gpa >= 0.00 AND gpa <= 4.00),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(150) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 6),
    capacity INT NOT NULL CHECK (capacity > 0),
    semester VARCHAR(20) NOT NULL,
    instructor_name VARCHAR(100) NOT NULL,
    passing_grade NUMERIC(5, 2) DEFAULT 50.00 CHECK (passing_grade >= 0 AND passing_grade <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_course_code_semester UNIQUE (code, semester)
);

-- 4. ENROLLMENTS
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    final_score NUMERIC(5, 2) CHECK (final_score >= 0 AND final_score <= 100),
    letter_grade VARCHAR(5) CHECK (letter_grade IN ('A+', 'A', 'B', 'C', 'D', 'F', 'W', 'I')),
    is_passed BOOLEAN GENERATED ALWAYS AS (final_score >= 50.00) STORED,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);

-- 5. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_enrollment_date UNIQUE (enrollment_id, session_date)
);

-- 6. ASSESSMENTS
CREATE TABLE IF NOT EXISTS assessments (
    assessment_id SERIAL PRIMARY KEY,
    enrollment_id INT NOT NULL REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    assessment_type VARCHAR(30) NOT NULL CHECK (assessment_type IN ('quiz', 'midterm', 'final_exam', 'assignment', 'lab_project')),
    title VARCHAR(100) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL CHECK (max_score > 0),
    score_obtained NUMERIC(5, 2) NOT NULL CHECK (score_obtained >= 0 AND score_obtained <= max_score),
    assessment_date DATE NOT NULL,
    weight_percentage NUMERIC(5, 2) NOT NULL CHECK (weight_percentage > 0 AND weight_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANALYSIS SESSIONS (For BlackBox Investigation history)
CREATE TABLE IF NOT EXISTS analysis_sessions (
    session_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    natural_language_question TEXT NOT NULL,
    explanation TEXT,
    assumptions TEXT,
    chart_type VARCHAR(50) DEFAULT 'bar',
    chart_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GENERATED QUERIES (Audit log and lineage of model-proposed SQL)
CREATE TABLE IF NOT EXISTS generated_queries (
    query_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES analysis_sessions(session_id) ON DELETE CASCADE,
    sql_query TEXT NOT NULL,
    execution_status VARCHAR(30) NOT NULL CHECK (execution_status IN ('success', 'error', 'rejected_unsafe')),
    execution_time_ms INT,
    rows_returned INT,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SCENARIOS (What-If Simulation definitions & links to investigations)
CREATE TABLE IF NOT EXISTS scenarios (
    scenario_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN ('course_capacity', 'attendance_shift', 'tutoring_intervention')),
    origin_session_id INT REFERENCES analysis_sessions(session_id) ON DELETE SET NULL,
    course_id INT REFERENCES courses(course_id) ON DELETE SET NULL,
    parameters JSONB NOT NULL,
    baseline_summary JSONB NOT NULL,
    simulation_summary JSONB NOT NULL,
    formula_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SCENARIO RESULTS (Per-entity baseline vs simulated comparison data points)
CREATE TABLE IF NOT EXISTS scenario_results (
    result_id SERIAL PRIMARY KEY,
    scenario_id INT NOT NULL REFERENCES scenarios(scenario_id) ON DELETE CASCADE,
    entity_id INT NOT NULL,
    baseline_metric NUMERIC(8, 2) NOT NULL,
    simulated_metric NUMERIC(8, 2) NOT NULL,
    delta_metric NUMERIC(8, 2) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE & ANALYTICAL INDEXES
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_sem ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_sem ON enrollments(semester);
CREATE INDEX IF NOT EXISTS idx_enrollments_passed ON enrollments(is_passed);
CREATE INDEX IF NOT EXISTS idx_attendance_enrollment ON attendance(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(session_date);
CREATE INDEX IF NOT EXISTS idx_assessments_enrollment ON assessments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_queries_session ON generated_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_origin ON scenarios(origin_session_id);
CREATE INDEX IF NOT EXISTS idx_scenario_results_scen ON scenario_results(scenario_id);

-- RESTRICTED READ-ONLY ANALYTICAL ROLE SETUP
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'datawise_readonly') THEN
        CREATE ROLE datawise_readonly WITH LOGIN PASSWORD 'datawise_read_only_pass';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE datawise TO datawise_readonly;
GRANT USAGE ON SCHEMA public TO datawise_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO datawise_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO datawise_readonly;
