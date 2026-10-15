# DataWise

DataWise is an academic intelligence platform and database systems simulator built with Next.js, PostgreSQL, and Google Gemini. It allows university administrators and researchers to query institutional data using natural language, execute validated read-only SQL against a normalized relational schema, visualize trends, and model counterfactual "what-if" scenarios (such as attendance interventions or course capacity adjustments) without mutating underlying records.

---

## Overview

The application addresses two core workflows:

1. **Analytical Investigation**: Translates natural language questions into safe, read-only PostgreSQL queries, executes them against normalized academic tables, and renders interactive charts and summary insights.
2. **What-If Scenario Simulation**: Runs deterministic, counterfactual projections on baseline course and student metrics (e.g., assessing the impact of tutoring programs or attendance shifts on pass rates) and records the simulation lineage for historical comparison.

---

## System Architecture

```
                          +------------------------+
                          |   Next.js App Router   |
                          |  (React, TypeScript)   |
                          +-----------+------------+
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v                                         v
       /api/investigate                           /api/scenarios
  - Schema introspection                    - Baseline metric extraction
  - SQL generation (Gemini / fallback)      - Counterfactual logic engine
  - Read-only AST validation                - Delta computation
  - Execution via restricted role           - Simulation persistence
                 |                                         |
                 +--------------------+--------------------+
                                      |
                                      v
                        +----------------------------+
                        |     PostgreSQL Engine      |
                        |  - 10 Relational Tables    |
                        |  - 17 B-tree Indexes       |
                        |  - Read-only Role (RBAC)   |
                        +----------------------------+
```

---

## Database Schema

The database design adheres to Third Normal Form (3NF) across 10 tables:

### Academic Core
- `departments`: Academic divisions with budget constraints and founding years.
- `students`: Student identity, department affiliation, enrollment year, status, and GPA constraints (`0.00 <= gpa <= 4.00`).
- `courses`: Course offerings, credit weights, capacity limits, semesters, and passing thresholds.
- `enrollments`: Student-course registrations, grade records, and a generated stored column (`is_passed`).

### Activity Tracking
- `attendance`: Granular session records tracking attendance status (`present`, `absent`, `late`, `excused`).
- `assessments`: Coursework components (quizzes, midterms, finals) with weighted scoring.

### Analytics & Audit Lineage
- `analysis_sessions`: Log of natural language queries, generated explanations, and chart configs.
- `generated_queries`: Audit trail of model-proposed SQL queries, execution latency, and return status.
- `scenarios`: Scenario definitions, parameters, baseline aggregates, and projected outcomes.
- `scenario_results`: Row-level comparison records showing baseline vs. simulated metric deltas.

An Entity-Relationship (ER) diagram is provided in `datawise_er_diagram.drawio` and can be opened directly in [diagrams.net (Draw.io)](https://app.diagrams.net).

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 18
- **Database Client**: `pg` (node-postgres) with connection pooling
- **Charts**: Recharts
- **AI Integration**: `@google/genai` (Google Gemini 2.5 / 1.5 Flash) with an offline rule-based fallback planner

---

## Project Structure

```
datawise/
├── database/
│   ├── migrations/
│   │   └── 001_init.sql          # Tables, constraints, indexes, and roles
│   └── seeds/
│       └── 001_seed.sql          # Seed data (departments, courses, students, grades)
├── public/
│   ├── datawise_er_diagram.png   # Rendered ER diagram
│   └── datawise_er_diagram.svg   # Vector ER diagram
├── scripts/
│   ├── generate_drawio_xml.js    # Draw.io XML generator
│   └── verify_all.js             # Automated database & API verification suite
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── explorer/         # Schema inspection and live sample queries
│   │   │   ├── history/          # Analytical session archives
│   │   │   ├── investigate/      # Natural language SQL execution endpoint
│   │   │   └── scenarios/        # Simulation calculation and storage endpoint
│   │   ├── explorer/             # Schema browser and DBMS demonstration page
│   │   ├── history/              # Historical investigation and scenario log
│   │   ├── investigate/          # Natural language SQL investigation interface
│   │   ├── scenarios/            # What-If scenario laboratory
│   │   └── page.tsx              # Executive dashboard
│   ├── components/               # UI components (Navigation, charts, tables)
│   └── lib/
│       ├── db.ts                 # PostgreSQL connection pool and safety wrappers
│       ├── gemini.ts             # LLM query generation and safe fallback logic
│       └── sql-validator.ts      # Read-only query enforcement and statement filtering
├── .env.example                  # Environment configuration template
├── datawise_er_diagram.drawio    # Source ER diagram file for Draw.io
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL 15+ (tested on PostgreSQL 18)
- npm or yarn

### 1. Database Setup

Create the database and execute the migration and seed scripts:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE datawise;"

# Run schema migrations
psql -U postgres -d datawise -f database/migrations/001_init.sql

# Seed data
psql -U postgres -d datawise -f database/seeds/001_seed.sql
```

The migration script creates:
- 10 normalized tables with primary and foreign key constraints
- 17 B-tree indexes for query optimization
- A restricted PostgreSQL role (`datawise_readonly`) with `SELECT`-only privileges

### 2. Environment Configuration

Copy the example configuration:

```bash
cp .env.example .env.local
```

Configure `.env.local` with your database credentials:

```env
DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/datawise
DATABASE_READONLY_URL=postgresql://datawise_readonly:datawise_read_only_pass@127.0.0.1:5432/datawise

# Optional: Google Gemini API key for dynamic query planning
# If omitted, the application uses the built-in offline analytical planner
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

DEMO_MODE=false
MAX_QUERY_ROWS=100
QUERY_TIMEOUT_MS=6000
```

### 3. Install Dependencies and Run

```bash
# Install packages
npm install

# Optional: Run the automated verification suite
node scripts/verify_all.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create an optimized production build:

```bash
npm run build
npm start
```

---

## Security & Query Safety

To ensure database integrity when running model-proposed SQL:

1. **Role-Based Access Control**: All analytical queries execute through `datawise_readonly`, a dedicated PostgreSQL role with strictly `SELECT` permissions. Mutations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`) are denied at the database engine level.
2. **Server-Side Validation**: The API validates incoming SQL using regex and keyword checks before transmission to the database driver. Multiple statements (`;`), comments, and schema modification commands are blocked.
3. **Execution Limits**: Queries are bounded by statement timeouts (`6000ms`) and result limits (`LIMIT 100`) to prevent denial-of-service from unindexed full table scans.
