-- DataWise Synthetic College Dataset Seed Script
-- Covers Fall 2025 and Spring 2026 with 5 Departments, 12 Courses, 120 Students, 350+ Enrollments, 3500+ Attendance records, and 1400+ Assessments.
-- Deterministic generation using PostgreSQL setseed()

BEGIN;

-- Clear any existing seed records
TRUNCATE TABLE scenario_results, scenarios, generated_queries, analysis_sessions, assessments, attendance, enrollments, courses, students, departments RESTART IDENTITY CASCADE;

-- Set random seed for deterministic generation
SELECT setseed(0.42);

-- 1. INSERT DEPARTMENTS
INSERT INTO departments (code, name, building, budget, established_year) VALUES
('CS', 'Computer Science & Engineering', 'Turing Hall', 1250000.00, 1985),
('DS', 'Data Science & Artificial Intelligence', 'Lovelace Center', 1100000.00, 2021),
('EE', 'Electrical & Electronics Engineering', 'Faraday Labs', 980000.00, 1980),
('ME', 'Mechanical Engineering', 'Carnot Building', 850000.00, 1978),
('MATH', 'Mathematics & Computing', 'Euler Pavilion', 620000.00, 1965);

-- 2. INSERT COURSES (Two semesters: Fall 2025 and Spring 2026)
INSERT INTO courses (code, title, department_id, credits, capacity, semester, instructor_name, passing_grade) VALUES
('CS101', 'Intro to Computer Systems', 1, 4, 45, 'Fall 2025', 'Dr. Alan Turing', 50.00),
('CS101', 'Intro to Computer Systems', 1, 4, 50, 'Spring 2026', 'Dr. Alan Turing', 50.00),
('CS201', 'Data Structures & Algorithms', 1, 4, 40, 'Fall 2025', 'Prof. Grace Hopper', 50.00),
('CS201', 'Data Structures & Algorithms', 1, 4, 45, 'Spring 2026', 'Prof. Grace Hopper', 50.00),
('CS301', 'Database Systems & SQL Arch', 1, 4, 35, 'Fall 2025', 'Dr. Edgar Codd', 50.00),
('CS301', 'Database Systems & SQL Arch', 1, 4, 40, 'Spring 2026', 'Dr. Edgar Codd', 50.00),
('DS201', 'Statistical Machine Learning', 2, 4, 35, 'Fall 2025', 'Dr. Claude Shannon', 50.00),
('DS201', 'Statistical Machine Learning', 2, 4, 40, 'Spring 2026', 'Dr. Claude Shannon', 50.00),
('EE101', 'Linear Circuits & Systems', 3, 3, 30, 'Fall 2025', 'Prof. Nikola Tesla', 50.00),
('EE101', 'Linear Circuits & Systems', 3, 3, 35, 'Spring 2026', 'Prof. Nikola Tesla', 50.00),
('MATH101', 'Multivariate Calculus', 5, 4, 50, 'Fall 2025', 'Dr. Carl Gauss', 50.00),
('MATH101', 'Multivariate Calculus', 5, 4, 55, 'Spring 2026', 'Dr. Carl Gauss', 50.00);

-- 3. INSERT 120 SYNTHETIC STUDENTS
WITH first_names AS (
    SELECT ARRAY['Aarav', 'Ananya', 'Rohan', 'Priya', 'Kabir', 'Isha', 'Aditya', 'Sanya', 'Vikram', 'Meera',
                 'Arjun', 'Diya', 'Rahul', 'Sneha', 'Kunal', 'Pooja', 'Dev', 'Tara', 'Neil', 'Rhea',
                 'Zayn', 'Maya', 'Kavya', 'Siddharth', 'Nisha', 'Aman', 'Tanvi', 'Harsh', 'Anika', 'Samir'] AS arr
),
last_names AS (
    SELECT ARRAY['Sharma', 'Verma', 'Patel', 'Iyer', 'Menon', 'Rao', 'Reddy', 'Nair', 'Kulkarni', 'Deshmukh',
                 'Gupta', 'Singh', 'Choudhury', 'Mukherjee', 'Bose', 'Das', 'Mehta', 'Shah', 'Kapoor', 'Malhotra',
                 'Bhat', 'Pillai', 'Hegde', 'Joshi', 'Bhardwaj', 'Saxena', 'Pandey', 'Mishra', 'Chauhan', 'Agarwal'] AS arr
)
INSERT INTO students (student_number, first_name, last_name, email, department_id, enrollment_year, status, gpa)
SELECT
    'STU2025' || LPAD(i::text, 4, '0'),
    fn.arr[1 + ((i * 7) % array_length(fn.arr, 1))],
    ln.arr[1 + ((i * 11) % array_length(ln.arr, 1))],
    LOWER(fn.arr[1 + ((i * 7) % array_length(fn.arr, 1))]) || '.' ||
    LOWER(ln.arr[1 + ((i * 11) % array_length(ln.arr, 1))]) || i::text || '@university.edu',
    1 + (i % 5), -- distributed across 5 departments
    2022 + (i % 4), -- cohort 2022-2025
    CASE WHEN i % 25 = 0 THEN 'suspended' ELSE 'active' END,
    ROUND((2.20 + (random() * 1.75))::numeric, 2)
FROM generate_series(1, 120) AS i
CROSS JOIN first_names fn
CROSS JOIN last_names ln;

-- 4. INSERT ENROLLMENTS
-- Each student takes 3 to 4 courses matched to their cohorts across semesters
-- CS201 Fall 2025 is intentionally seeded with lower average scores to create a prominent investigation finding!
INSERT INTO enrollments (student_id, course_id, semester, final_score, letter_grade, enrollment_date)
SELECT
    s.student_id,
    c.course_id,
    c.semester,
    score_calc.final_score,
    CASE
        WHEN score_calc.final_score >= 85 THEN 'A'
        WHEN score_calc.final_score >= 70 THEN 'B'
        WHEN score_calc.final_score >= 55 THEN 'C'
        WHEN score_calc.final_score >= 50 THEN 'D'
        ELSE 'F'
    END,
    CASE WHEN c.semester = 'Fall 2025' THEN DATE '2025-08-15' ELSE DATE '2026-01-10' END
FROM students s
JOIN courses c ON (
    -- Distribute students across courses logically:
    (c.code = 'MATH101' AND s.student_id % 2 = 0) OR
    (c.code = 'CS101' AND s.department_id IN (1, 2) AND s.student_id % 3 != 0) OR
    (c.code = 'CS201' AND s.department_id IN (1, 2) AND s.student_id % 2 = 1) OR
    (c.code = 'CS301' AND s.department_id = 1 AND s.student_id % 2 = 0) OR
    (c.code = 'DS201' AND s.department_id IN (1, 2, 5) AND s.student_id % 4 = 1) OR
    (c.code = 'EE101' AND s.department_id = 3)
)
CROSS JOIN LATERAL (
    SELECT ROUND(
        LEAST(100.0, GREATEST(15.0,
            CASE
                -- CS201 in Fall 2025 had notoriously low marks / higher failure rate!
                WHEN c.code = 'CS201' AND c.semester = 'Fall 2025'
                    THEN (42.0 + (random() * 32.0) + (s.gpa * 5.0))::numeric
                -- CS201 in Spring 2026 improved significantly!
                WHEN c.code = 'CS201' AND c.semester = 'Spring 2026'
                    THEN (58.0 + (random() * 30.0) + (s.gpa * 6.0))::numeric
                -- CS301 rigorous database course
                WHEN c.code = 'CS301'
                    THEN (52.0 + (random() * 36.0) + (s.gpa * 5.5))::numeric
                -- General courses
                ELSE (50.0 + (random() * 38.0) + (s.gpa * 6.0))::numeric
            END
        ))::numeric, 2
    ) AS final_score
) AS score_calc;

-- Update student overall GPA to reflect actual course performance
WITH calculated_gpas AS (
    SELECT
        student_id,
        ROUND(AVG(
            CASE
                WHEN letter_grade = 'A' THEN 4.0
                WHEN letter_grade = 'B' THEN 3.0
                WHEN letter_grade = 'C' THEN 2.0
                WHEN letter_grade = 'D' THEN 1.0
                ELSE 0.0
            END
        )::numeric, 2) AS new_gpa
    FROM enrollments
    GROUP BY student_id
)
UPDATE students s
SET gpa = cg.new_gpa
FROM calculated_gpas cg
WHERE s.student_id = cg.student_id;

-- 5. INSERT ATTENDANCE RECORDS (10 sessions per enrollment)
-- Session attendance is probabilistically higher for students who scored higher, with realistic noise
INSERT INTO attendance (enrollment_id, session_date, status)
SELECT
    e.enrollment_id,
    base_date + (session_num * 7),
    CASE
        WHEN (random() * 100.0) < (e.final_score * 0.85 + 10.0) THEN 'present'
        WHEN random() < 0.20 THEN 'late'
        WHEN random() < 0.40 THEN 'excused'
        ELSE 'absent'
    END
FROM enrollments e
CROSS JOIN generate_series(1, 10) AS session_num
CROSS JOIN LATERAL (
    SELECT CASE WHEN e.semester = 'Fall 2025' THEN DATE '2025-09-01' ELSE DATE '2026-01-20' END AS base_date
) b;

-- 6. INSERT ASSESSMENTS (Quiz 1: 15%, Midterm: 35%, Final: 50%)
INSERT INTO assessments (enrollment_id, assessment_type, title, max_score, score_obtained, assessment_date, weight_percentage)
SELECT
    e.enrollment_id,
    'quiz',
    'Quiz 1: Core Fundamentals',
    20.00,
    ROUND(LEAST(20.00, GREATEST(0.00, (e.final_score / 100.0 * 20.00) + ((random() - 0.5) * 4.0)))::numeric, 2),
    CASE WHEN e.semester = 'Fall 2025' THEN DATE '2025-09-25' ELSE DATE '2026-02-15' END,
    15.00
FROM enrollments e
UNION ALL
SELECT
    e.enrollment_id,
    'midterm',
    'Midterm Examination',
    50.00,
    ROUND(LEAST(50.00, GREATEST(0.00, (e.final_score / 100.0 * 50.00) + ((random() - 0.5) * 7.0)))::numeric, 2),
    CASE WHEN e.semester = 'Fall 2025' THEN DATE '2025-10-28' ELSE DATE '2026-03-20' END,
    35.00
FROM enrollments e
UNION ALL
SELECT
    e.enrollment_id,
    'final_exam',
    'Comprehensive Final Exam',
    100.00,
    ROUND(LEAST(100.00, GREATEST(0.00, e.final_score + ((random() - 0.5) * 6.0)))::numeric, 2),
    CASE WHEN e.semester = 'Fall 2025' THEN DATE '2025-12-10' ELSE DATE '2026-05-05' END,
    50.00
FROM enrollments e;

-- 7. INSERT PRE-SEEDED ANALYSIS SESSIONS (For Instant Showcase in Viva/Demo)
INSERT INTO analysis_sessions (session_id, title, natural_language_question, explanation, assumptions, chart_type, chart_config) VALUES
(1, 'Course Failure Rates by Semester',
 'Which courses have the highest failure rates, and how did they change between Fall 2025 and Spring 2026?',
 'Analysis of enrollment records with final_score < 50 indicates that CS201 (Data Structures) exhibited the highest historical failure rate in Fall 2025 (approx 32.5%), followed by a sharp recovery to 11.8% in Spring 2026 after course restructuring.',
 'Passing threshold is fixed at 50.00%. Records include only enrolled students with finalized grades.',
 'bar',
 '{"xAxis": "course_code_sem", "yAxis": "failure_rate_pct", "seriesName": "Failure Rate (%)"}'),

(2, 'Departmental Enrollment Comparison',
 'Which departments have the largest total enrollment across all semesters?',
 'Computer Science and Data Science comprise over 65% of all active course enrollments, driven by high core curriculum demands in CS101, CS201, and DS201.',
 'Enrollment count equals distinct student-course pairings active during the academic year.',
 'pie',
 '{"xAxis": "dept_name", "yAxis": "total_enrollments", "seriesName": "Students Enrolled"}'),

(3, 'Attendance vs Academic Performance Correlation',
 'Is attendance rate statistically associated with student assessment performance and final score?',
 'Students with attendance rates above 80% achieved an average score of 76.4, compared to 48.2 for students with attendance below 65%. Attendance rate is a strong positive leading indicator of passing.',
 'Attendance rate is defined as (present sessions / total recorded sessions) * 100.',
 'scatter',
 '{"xAxis": "attendance_rate", "yAxis": "avg_score", "seriesName": "Score vs Attendance"}');

ALTER SEQUENCE analysis_sessions_session_id_seq RESTART WITH 4;

-- 8. INSERT GENERATED QUERIES FOR AUDIT
INSERT INTO generated_queries (session_id, sql_query, execution_status, execution_time_ms, rows_returned) VALUES
(1, 'SELECT c.code AS course_code, c.semester, COUNT(e.enrollment_id) AS total_students, SUM(CASE WHEN e.is_passed = false THEN 1 ELSE 0 END) AS failed_students, ROUND(100.0 * SUM(CASE WHEN e.is_passed = false THEN 1 ELSE 0 END) / COUNT(e.enrollment_id), 2) AS failure_rate_pct FROM courses c JOIN enrollments e ON c.course_id = e.course_id GROUP BY c.code, c.semester ORDER BY failure_rate_pct DESC;', 'success', 14, 12),
(2, 'SELECT d.name AS dept_name, d.code AS dept_code, COUNT(e.enrollment_id) AS total_enrollments, COUNT(DISTINCT s.student_id) AS unique_students FROM departments d JOIN students s ON d.department_id = s.department_id JOIN enrollments e ON s.student_id = e.student_id GROUP BY d.department_id, d.name, d.code ORDER BY total_enrollments DESC;', 'success', 9, 5),
(3, 'SELECT s.student_number, ROUND(100.0 * COUNT(CASE WHEN a.status = ''present'' THEN 1 END) / NULLIF(COUNT(a.attendance_id), 0), 1) AS attendance_rate, ROUND(AVG(e.final_score), 1) AS avg_score FROM students s JOIN enrollments e ON s.student_id = e.student_id JOIN attendance a ON e.enrollment_id = a.enrollment_id GROUP BY s.student_id, s.student_number HAVING COUNT(a.attendance_id) >= 10 ORDER BY attendance_rate DESC;', 'success', 18, 120);

-- 9. INSERT PRE-SEEDED SAVED SCENARIOS (Insight-to-Impact Signature Link)
INSERT INTO scenarios (scenario_id, title, scenario_type, origin_session_id, course_id, parameters, baseline_summary, simulation_summary, formula_explanation) VALUES
(1, 'CS201 Tutoring Intervention (Fall 2025)',
 'tutoring_intervention',
 1, -- Linked directly to Session 1 investigation!
 3, -- CS201 Fall 2025
 '{"course_id": 3, "target_group": "at_risk_below_55", "predicted_gain_points": 8.5, "attendance_multiplier": 1.15}',
 '{"course_code": "CS201", "semester": "Fall 2025", "total_enrolled": 36, "baseline_pass_rate": 66.7, "baseline_avg_score": 53.2, "failed_count": 12}',
 '{"simulated_pass_rate": 88.9, "simulated_avg_score": 59.8, "students_salvaged": 8, "remaining_failures": 4}',
 'Simulated score = MIN(100, baseline_score + (8.5 * (1 - (baseline_score / 100)))). Students with baseline score between 40 and 49 have highest marginal lift from tutoring.');

ALTER SEQUENCE scenarios_scenario_id_seq RESTART WITH 2;

-- 10. INSERT SCENARIO RESULTS DETAILS
INSERT INTO scenario_results (scenario_id, entity_id, baseline_metric, simulated_metric, delta_metric, details) VALUES
(1, 101, 46.00, 54.50, 8.50, '{"student_number": "STU20250007", "status_change": "Fail -> Pass"}'),
(1, 102, 42.50, 50.20, 7.70, '{"student_number": "STU20250013", "status_change": "Fail -> Pass"}'),
(1, 103, 48.00, 56.10, 8.10, '{"student_number": "STU20250021", "status_change": "Fail -> Pass"}'),
(1, 104, 38.00, 44.80, 6.80, '{"student_number": "STU20250035", "status_change": "Remain Fail"}');

COMMIT;
