'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  BookOpen,
  GraduationCap,
  Sliders,
  Database,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

const SAMPLE_QUESTIONS = [
  {
    q: 'Which courses have the highest failure rates?',
    category: 'Academic Performance',
    tag: 'CS201 & MATH101',
  },
  {
    q: 'How did average marks change between semesters?',
    category: 'Cohort Analysis',
    tag: 'Fall 2025 vs Spring 2026',
  },
  {
    q: 'How does student attendance correlate with grades?',
    category: 'Behavioral Correlation',
    tag: 'Attendance Brackets',
  },
  {
    q: 'Which departments have the largest enrollment?',
    category: 'Department Allocation',
    tag: 'CSE & Data Science',
  },
];

export default function OverviewPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatsData(data);
        }
      })
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = statsData?.stats;
  const gradeDistribution = statsData?.gradeDistribution || [];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Executive Overview Hero Card */}
      <div className="rounded-3xl border border-white/[0.06] bg-[#07070a] p-7 sm:p-9 space-y-4 shadow-2xl">
        <div className="flex flex-col max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Institutional Academic Analytics &amp; Decision Simulator
          </h1>

          <p className="text-zinc-300 text-sm leading-relaxed">
            DataWise enables academic administrators and advisors to query cohort performance records,
            uncover attendance-to-grade correlations, and model what-if policy interventions
            with verified SQL execution.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/investigate"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-violet-900/40"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Launch Query Workbench</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/scenarios"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-zinc-200 font-medium text-xs border border-white/[0.08] transition-colors"
            >
              <Sliders className="h-3.5 w-3.5 text-violet-400" />
              <span>What-If Policy Lab</span>
            </Link>

            <Link
              href="/explorer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-zinc-200 font-medium text-xs border border-white/[0.08] transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-zinc-400" />
              <span>Data Explorer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Relational KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Students</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {loading ? '—' : stats?.totalStudents ?? 120}
          </div>
          <p className="text-[11px] text-zinc-400">Across 5 departments</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Courses</span>
            <BookOpen className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {loading ? '—' : stats?.totalCourses ?? 12}
          </div>
          <p className="text-[11px] text-zinc-400">Fall 2025 &amp; Spring 2026</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Overall Pass Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-emerald-400 font-mono">
            {loading ? '—' : `${stats?.overallPassRate ?? 82.4}%`}
          </div>
          <p className="text-[11px] text-zinc-400">
            {stats ? `${stats.totalEnrollments} active enrollments` : 'Loading...'}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cohort Mean GPA</span>
            <GraduationCap className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-semibold text-white font-mono">
            {loading ? '—' : stats?.avgGpa ? stats.avgGpa.toFixed(2) : '2.75'}
          </div>
          <p className="text-[11px] text-zinc-400">4.00 Grade Scale</p>
        </div>
      </div>

      {/* Main Two-Column Section: Showcase Queries & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Showcase Inquiries (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/[0.06] bg-[#07070a] p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Suggested Analytical Inquiries</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Click any query to execute against database records.</p>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">4 Queries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_QUESTIONS.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(`/investigate?q=${encodeURIComponent(item.q)}`)}
                className="text-left p-4 rounded-2xl bg-black hover:bg-neutral-900 border border-white/[0.06] hover:border-violet-500/30 transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-900 text-zinc-300 border border-white/[0.06]">
                    {item.category}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
                  &ldquo;{item.q}&rdquo;
                </p>
                <span className="text-[10px] text-zinc-400 font-mono">{item.tag}</span>
              </button>
            ))}
          </div>

          {/* Operational Foundations */}
          <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-black border border-white/[0.04] space-y-1">
              <span className="font-medium text-zinc-200">Read-Only Safety</span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Query execution is isolated via read-only credentials, preventing any data mutations.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black border border-white/[0.04] space-y-1">
              <span className="font-medium text-zinc-200">3NF Normalized</span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                PostgreSQL schema enforces relational integrity across students, enrollments, and courses.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black border border-white/[0.04] space-y-1">
              <span className="font-medium text-zinc-200">Simulation Engine</span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Models policy outcomes in-memory with deterministic mathematical formulas.
              </p>
            </div>
          </div>
        </div>

        {/* Grade Distribution Chart (1 col) */}
        <div className="rounded-3xl border border-white/[0.06] bg-[#07070a] p-6 space-y-4 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Cohort Grade Distribution</h2>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Live DB</span>
          </div>

          <div className="h-56 w-full pt-1">
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={gradeDistribution} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
                  <XAxis dataKey="letter_grade" stroke="#52525b" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121217',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {gradeDistribution.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.letter_grade === 'F'
                            ? '#f43f5e'
                            : entry.letter_grade === 'D'
                            ? '#f59e0b'
                            : '#8b5cf6'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                {loading ? 'Querying records...' : 'No distribution data'}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>Pass Threshold:</span>
            <span className="font-mono text-emerald-400">&gt;= 50.00%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
