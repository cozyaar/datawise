'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Sparkles,
  Save,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Database,
  Users,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export type ScenarioType = 'course_capacity' | 'attendance_shift' | 'tutoring_intervention';

export interface InsightContext {
  courseId?: number;
  courseCode?: string;
  sessionId: number;
  scenarioType: ScenarioType;
  note?: string;
}

interface ScenarioLabViewProps {
  insightContext?: InsightContext | null;
  onClearInsightContext?: () => void;
}

export const ScenarioLabView: React.FC<ScenarioLabViewProps> = ({
  insightContext,
  onClearInsightContext,
}) => {
  const [scenarioType, setScenarioType] = useState<ScenarioType>(
    insightContext?.scenarioType || 'tutoring_intervention'
  );

  // Available courses from database
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(insightContext?.courseId || 3); // CS201 Fall default

  // Parameters for each scenario
  const [capacity, setCapacity] = useState<number>(55);
  const [attendanceDelta, setAttendanceDelta] = useState<number>(10);
  const [tutoringThreshold, setTutoringThreshold] = useState<number>(50);
  const [tutoringGain, setTutoringGain] = useState<number>(8.5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Load courses on mount
  useEffect(() => {
    fetch('/api/simulate')
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
          if (!insightContext?.courseId && data.courses.length > 0) {
            setSelectedCourseId(data.courses[2]?.course_id || data.courses[0].course_id);
          }
        }
      })
      .catch((err) => console.error('Failed to load courses for simulation:', err));
  }, []);

  // Sync if insightContext updates
  useEffect(() => {
    if (insightContext) {
      if (insightContext.scenarioType) setScenarioType(insightContext.scenarioType);
      if (insightContext.courseId) setSelectedCourseId(insightContext.courseId);
    }
  }, [insightContext]);

  const handleRunSimulation = async (saveToDb = true) => {
    setLoading(true);
    setError(null);
    setIsSaved(false);

    let params: any = {};
    if (scenarioType === 'course_capacity') {
      params = { courseId: selectedCourseId, newCapacity: capacity };
    } else if (scenarioType === 'attendance_shift') {
      params = { courseId: selectedCourseId, attendanceDeltaPct: attendanceDelta };
    } else if (scenarioType === 'tutoring_intervention') {
      params = {
        courseId: selectedCourseId,
        thresholdScore: tutoringThreshold,
        projectedPointGain: tutoringGain,
      };
    }

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioType,
          parameters: params,
          originSessionId: insightContext?.sessionId || null,
          save: saveToDb,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Simulation calculation failed');
      }

      setSimulationResult(data.result);
      if (data.result.scenarioId) {
        setIsSaved(true);
        setSavedId(data.result.scenarioId);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during simulation.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically run initial simulation when course or scenarioType changes
  useEffect(() => {
    if (selectedCourseId) {
      handleRunSimulation(false);
    }
  }, [scenarioType, selectedCourseId]);

  const selectedCourse = courses.find((c) => c.course_id === selectedCourseId);

  // Filter items in student ledger table
  const filteredItems = simulationResult?.items?.filter((item: any) => {
    if (!studentSearch) return true;
    const term = studentSearch.toLowerCase();
    return (
      item.label.toLowerCase().includes(term) ||
      (item.subLabel && item.subLabel.toLowerCase().includes(term)) ||
      (item.statusChange && item.statusChange.toLowerCase().includes(term))
    );
  }) || [];

  // Clean formatted items for comparative chart with short display labels
  const chartItems = useMemo(() => {
    if (!simulationResult?.items) return [];
    return simulationResult.items.slice(0, 14).map((item: any) => {
      let shortLabel = item.label;
      const match = item.label.match(/\((.*?)\)/);
      if (match && match[1]) {
        const parts = match[1].trim().split(' ');
        shortLabel = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
      } else if (item.label.length > 12) {
        shortLabel = item.label.substring(0, 10) + '…';
      }
      return {
        ...item,
        shortLabel,
      };
    });
  }, [simulationResult]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      {/* Linked context notice */}
      {insightContext && (
        <div className="p-4 rounded-2xl bg-neutral-950 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">Investigation Context: </span>
              <span className="text-violet-300">
                {insightContext.note || `Simulating policy intervention for ${insightContext.courseCode || 'selected course'}`}
              </span>
            </div>
          </div>

          {onClearInsightContext && (
            <button
              onClick={onClearInsightContext}
              className="px-3 py-1 text-xs text-zinc-300 hover:text-white rounded-full bg-neutral-900 hover:bg-neutral-800 border border-white/[0.08] transition-colors cursor-pointer self-start sm:self-auto"
            >
              Reset Context
            </button>
          )}
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="rounded-3xl border border-white/[0.06] bg-[#07070a] p-6 sm:p-7 space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">
              What-If Policy &amp; Decision Simulator
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Model hypothetical policy scenarios without modifying underlying database records.
            </p>
          </div>

          {/* Scenario Type Pill Selector */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setScenarioType('course_capacity')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                scenarioType === 'course_capacity'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1. Capacity
            </button>
            <button
              onClick={() => setScenarioType('attendance_shift')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                scenarioType === 'attendance_shift'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              2. Attendance Policy
            </button>
            <button
              onClick={() => setScenarioType('tutoring_intervention')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                scenarioType === 'tutoring_intervention'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              3. Tutoring Intervention
            </button>
          </div>
        </div>

        {/* Dynamic Parameter Sliders & Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-white/[0.06]">
          {/* Target Course Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>Target Course</span>
              <span className="text-[11px] text-zinc-500 font-mono">From courses table</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-900 border border-white/[0.08] text-white text-xs font-medium focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.code} — {c.title} ({c.semester})
                </option>
              ))}
            </select>
            {selectedCourse && (
              <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-neutral-900/50 border border-white/[0.05] text-zinc-400">
                <span>Baseline: <strong className="text-white">{selectedCourse.enrolled_count}</strong> enrolled</span>
                <span>Fail Rate: <strong className="text-rose-400">{selectedCourse.failure_rate_pct}%</strong></span>
              </div>
            )}
          </div>

          {/* Dynamic Controls based on Scenario Type */}
          {scenarioType === 'course_capacity' && (
            <div className="space-y-2.5 md:col-span-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300">Simulated Capacity</span>
                <span className="font-mono font-semibold text-xs text-violet-400 px-2.5 py-0.5 rounded-full bg-violet-950/60 border border-violet-800/60">
                  {capacity} seats
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-neutral-800 rounded-full"
              />
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>20 seats (Restricted)</span>
                <span className="text-zinc-300">Current baseline: {selectedCourse?.capacity || 40} seats</span>
                <span>80 seats (Expanded)</span>
              </div>
            </div>
          )}

          {scenarioType === 'attendance_shift' && (
            <div className="space-y-2.5 md:col-span-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300">Attendance Shift Assumption</span>
                <span className={`font-mono font-semibold text-xs px-2.5 py-0.5 rounded-full border ${
                  attendanceDelta >= 0
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                    : 'text-rose-400 bg-rose-950/60 border-rose-800/60'
                }`}>
                  {attendanceDelta > 0 ? `+${attendanceDelta}%` : `${attendanceDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="25"
                step="5"
                value={attendanceDelta}
                onChange={(e) => setAttendanceDelta(parseInt(e.target.value, 10))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-neutral-800 rounded-full"
              />
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="text-rose-400">-20% (Absenteeism)</span>
                <span>0% (Neutral)</span>
                <span className="text-emerald-400">+25% (Mandatory Policy)</span>
              </div>
            </div>
          )}

          {scenarioType === 'tutoring_intervention' && (
            <>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300">At-Risk Threshold</span>
                  <span className="font-mono font-semibold text-xs text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60">
                    &lt; {tutoringThreshold} pts
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="65"
                  step="5"
                  value={tutoringThreshold}
                  onChange={(e) => setTutoringThreshold(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-full"
                />
                <p className="text-[11px] text-zinc-400">Target students with baseline scores below threshold.</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300">Projected Uplift</span>
                  <span className="font-mono font-semibold text-xs text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60">
                    +{tutoringGain} pts
                  </span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="15.0"
                  step="0.5"
                  value={tutoringGain}
                  onChange={(e) => setTutoringGain(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-full"
                />
                <p className="text-[11px] text-zinc-400">Diminishing returns scaled by score headroom.</p>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Database className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sandboxed: Computations performed in-memory without altering database records.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRunSimulation(true)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-all cursor-pointer shadow-lg shadow-violet-900/30"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaved ? `Saved to Database (#${savedId})` : 'Simulate & Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center gap-2.5 text-xs">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Simulation Result Presentation */}
      {simulationResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Comparative KPI Cards: Baseline vs Simulated */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarioType === 'course_capacity' && (
              <>
                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Baseline Capacity</span>
                  <div className="text-2xl font-bold text-white font-mono">
                    {simulationResult.baselineSummary?.baselineCapacity} <span className="text-xs font-normal text-zinc-400">seats</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Utilization: <strong className="text-white">{simulationResult.baselineSummary?.baselineUtilizationPct}%</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Simulated Capacity</span>
                  <div className="text-2xl font-bold text-violet-400 font-mono">
                    {simulationResult.simulationSummary?.newCapacity} <span className="text-xs font-normal text-zinc-400">seats</span>
                  </div>
                  <span className="text-xs text-violet-300">
                    Utilization: <strong>{simulationResult.simulationSummary?.simulatedUtilizationPct}%</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Capacity Delta</span>
                  <div className={`text-2xl font-bold font-mono ${simulationResult.simulationSummary?.capacityDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulationResult.simulationSummary?.capacityDelta > 0 ? '+' : ''}
                    {simulationResult.simulationSummary?.capacityDelta} <span className="text-xs font-normal text-zinc-400">seats</span>
                  </div>
                  <span className="text-xs text-zinc-400">Slot difference</span>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Available Buffer</span>
                  <div className="text-2xl font-bold text-zinc-200 font-mono">
                    {simulationResult.simulationSummary?.simulatedAvailableSeats} <span className="text-xs font-normal text-zinc-400">left</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {simulationResult.simulationSummary?.status}
                  </span>
                </div>
              </>
            )}

            {(scenarioType === 'attendance_shift' || scenarioType === 'tutoring_intervention') && (
              <>
                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Baseline Pass Rate</span>
                  <div className="text-2xl font-bold text-zinc-200 font-mono">
                    {simulationResult.baselineSummary?.baselinePassRate}%
                  </div>
                  <span className="text-xs text-zinc-400">
                    Avg score: <strong className="text-white">{simulationResult.baselineSummary?.baselineAvgScore}</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Simulated Pass Rate</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {simulationResult.simulationSummary?.simulatedPassRate}%
                  </div>
                  <span className="text-xs text-emerald-300">
                    Avg score: <strong>{simulationResult.simulationSummary?.simulatedAvgScore}</strong>
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Students Rescued</span>
                  <div className="text-2xl font-bold text-violet-400 font-mono flex items-center gap-1.5">
                    <span>+{simulationResult.simulationSummary?.studentsRescued}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/80 uppercase font-sans">Rescued</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Threshold: &gt;= 50.00%
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {scenarioType === 'tutoring_intervention' ? 'Targeted Cohort' : 'Assumption Delta'}
                  </span>
                  <div className="text-2xl font-bold text-zinc-200 font-mono">
                    {scenarioType === 'tutoring_intervention'
                      ? `${simulationResult.baselineSummary?.targetedCount} students`
                      : `${attendanceDelta > 0 ? '+' : ''}${attendanceDelta}%`}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {scenarioType === 'tutoring_intervention' ? 'Eligible for tutoring' : 'Applied across cohort'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Transparent Formula & Mathematical Explanation */}
          <div className="p-5 rounded-2xl border border-white/[0.06] bg-[#07070a] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-violet-400" />
                <h3 className="text-xs font-semibold text-zinc-200">
                  Mathematical Model Specification
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">In-Memory Projection</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black font-mono text-xs text-zinc-300 leading-relaxed border border-white/[0.06] whitespace-pre-line">
              {simulationResult.formulaExplanation}
            </div>
          </div>

          {/* Visual Comparative Chart */}
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#07070a] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Baseline vs. Simulated Outcome Comparison</h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {scenarioType === 'course_capacity' ? 'Capacity Variance' : 'Per-Student Score Movement'}
              </span>
            </div>

            <div className="w-full h-72 min-h-[280px]">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartItems}
                  margin={{ top: 10, right: 25, left: -10, bottom: 65 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    stroke="#52525b"
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: '#a1a1aa' }} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121217',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    labelFormatter={(label, items) => {
                      const fullItem = items?.[0]?.payload;
                      return fullItem?.label ? `${fullItem.label} (${fullItem.subLabel || ''})` : label;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                  />
                  <Bar
                    dataKey="baselineMetric"
                    name={scenarioType === 'course_capacity' ? 'Baseline Capacity' : 'Baseline Score'}
                    fill="#3f3f46"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="simulatedMetric"
                    name={scenarioType === 'course_capacity' ? 'Simulated Capacity' : 'Simulated Score'}
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Ledger Comparison Table */}
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#07070a] space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-400" />
                  <span>Student Ledger &amp; Outcome Projections ({simulationResult.items.length} records)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Individual student score movements before and after modeled intervention.
                </p>
              </div>

              {/* Table search filter */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Filter student or status..."
                  className="pl-9 pr-4 py-1.5 rounded-full bg-neutral-900 border border-white/[0.08] text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 w-52"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-black">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-neutral-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-white/[0.06] text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Student Record</th>
                    <th className="px-5 py-3">Cohort Details</th>
                    <th className="px-5 py-3 text-right">Baseline Score</th>
                    <th className="px-5 py-3 text-right">Simulated Score</th>
                    <th className="px-5 py-3 text-right">Delta Gain</th>
                    <th className="px-5 py-3 text-center">Status Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                  {filteredItems.slice(0, 25).map((item: any, idx: number) => {
                    const isRescued = item.statusChange?.includes('Rescued');
                    const isPass = item.simulatedMetric >= 50.0;
                    return (
                      <tr key={idx} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="px-5 py-2.5 font-bold text-white">{item.label}</td>
                        <td className="px-5 py-2.5 text-zinc-400 font-sans">{item.subLabel || '—'}</td>
                        <td className="px-5 py-2.5 text-right text-zinc-400">{item.baselineMetric}</td>
                        <td className="px-5 py-2.5 text-right text-violet-400 font-bold">{item.simulatedMetric}</td>
                        <td className="px-5 py-2.5 text-right text-emerald-400 font-semibold">
                          {item.deltaMetric > 0 ? `+${item.deltaMetric}` : item.deltaMetric}
                        </td>
                        <td className="px-5 py-2.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase font-sans border ${
                              isRescued
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                                : isPass
                                ? 'bg-violet-950/80 text-violet-300 border-violet-800/80'
                                : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                            }`}
                          >
                            {item.statusChange || (isPass ? 'Passed' : 'Failed')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
