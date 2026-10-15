'use client';

import React from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BrainCircuit,
  Sliders,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface OverviewViewProps {
  stats: {
    totalStudents: number;
    totalDepartments: number;
    totalCourses: number;
    totalEnrollments: number;
    avgGpa: number;
    overallPassRate: number;
    totalInvestigations: number;
    totalScenarios: number;
  } | null;
  gradeDistribution: Array<{ letter_grade: string; count: number }>;
  onSelectSampleQuestion: (question: string) => void;
  onNavigateToScenarios: () => void;
  onNavigateToExplorer: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  gradeDistribution,
  onSelectSampleQuestion,
  onNavigateToScenarios,
  onNavigateToExplorer,
}) => {
  const sampleQuestions = [
    {
      q: 'Which courses have the highest failure rates?',
      tag: 'Academic Risk',
      accent: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    },
    {
      q: 'How did average marks change between semesters?',
      tag: 'Semester Trends',
      accent: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    },
    {
      q: 'Is attendance associated with assessment performance?',
      tag: 'Behavioral Correlation',
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      q: 'Which departments have the largest enrollment?',
      tag: 'Department Distribution',
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
  ];

  const gradeColors: Record<string, string> = {
    A: '#10b981',
    B: '#38bdf8',
    C: '#6366f1',
    D: '#f59e0b',
    F: '#ef4444',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 border border-white/10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PostgreSQL 18 & LLM Analytics Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered Database Intelligence & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              Deterministic Decision Simulator
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            DataWise connects an LLM reasoning engine to an authoritative normalized PostgreSQL database.
            Investigate deep relational anomalies with validated SQL, explain findings grounded in real database records,
            and model hypothetical interventions without ever mutating original data.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectSampleQuestion('Which courses have the highest failure rates?')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>Launch Live Investigation</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onNavigateToScenarios}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-white/10 transition-all cursor-pointer"
            >
              <Sliders className="h-4 w-4 text-purple-400" />
              <span>What-If Scenario Lab</span>
            </button>

            <button
              onClick={onNavigateToExplorer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-white/10 transition-all cursor-pointer"
            >
              <Database className="h-4 w-4 text-sky-400" />
              <span>Explore Schema & ERD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real PostgreSQL KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Students</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats ? stats.totalStudents : '—'}
          </div>
          <p className="text-[11px] text-slate-400">Across 5 departments</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Courses</span>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats ? stats.totalCourses : '—'}
          </div>
          <p className="text-[11px] text-slate-400">Fall 2025 & Spring 2026</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Pass Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
            {stats ? `${stats.overallPassRate}%` : '—'}
          </div>
          <p className="text-[11px] text-slate-400">
            {stats ? `${stats.totalEnrollments} active enrollments` : 'Loading...'}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2 glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Average GPA</span>
            <GraduationCap className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats ? stats.avgGpa.toFixed(2) : '—'}
          </div>
          <p className="text-[11px] text-slate-400">Calculated over 4.00 scale</p>
        </div>
      </div>

      {/* Main Two-Column Section: Showcase Questions & Relational Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Showcase Questions (Left 2 columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Investigate with Natural Language</h2>
            </div>
            <span className="text-xs text-slate-400">Click any question to run live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sampleQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => onSelectSampleQuestion(item.q)}
                className="text-left p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-sky-500/30 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.accent}`}>
                    {item.tag}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  &ldquo;{item.q}&rdquo;
                </p>
              </button>
            ))}
          </div>

          {/* DBMS Architecture Highlights */}
          <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-white/5">
              <ShieldCheck className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Read-Only Role</p>
                <p className="text-[11px] text-slate-400">Strictly isolated role prevents DML/DDL mutations.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-white/5">
              <Database className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Normalized 3NF Schema</p>
                <p className="text-[11px] text-slate-400">10 tables with foreign keys and check constraints.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-white/5">
              <Sliders className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Deterministic Models</p>
                <p className="text-[11px] text-slate-400">Calculates simulations without hallucinating data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real Grade Distribution Chart (Right column) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Grade Distribution</h2>
            </div>
            <span className="text-xs text-slate-400">Live Cohort</span>
          </div>

          <div className="h-52 w-full">
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={208}>
                <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="letter_grade" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={gradeColors[entry.letter_grade] || '#38bdf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Loading database records...
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Minimum passing grade:</span>
            <span className="font-semibold text-amber-400">50.00% (Grade D)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
