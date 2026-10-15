'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Database,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileCode2,
} from 'lucide-react';

interface HistoryViewProps {
  onLoadSessionInInvestigate: (question: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onLoadSessionInInvestigate,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'scenarios' | 'audit'>('sessions');

  const fetchHistory = () => {
    setLoading(true);
    fetch('/api/history')
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success) {
          setData(resJson);
        }
      })
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Analysis History &amp; Audit Trail</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audit log of past natural language investigations, generated queries, and saved scenario models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-white/[0.08] transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Investigations ({data?.sessions?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'scenarios'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Scenarios ({data?.scenarios?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Audit Log ({data?.queries?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* SESSIONS TAB */}
      {activeTab === 'sessions' && (
        <div className="rounded-xl border border-white/10 bg-[#0d111a] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-emerald-400" />
              <span>Analysis Sessions Archive</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">analysis_sessions table</span>
          </div>

          <div className="divide-y divide-white/5">
            {data?.sessions?.map((session: any) => (
              <div
                key={session.session_id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-white/10 font-mono">
                      Session #{session.session_id}
                    </span>
                    <span className="text-xs font-semibold text-white">{session.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(session.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    &ldquo;{session.natural_language_question}&rdquo;
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {session.explanation}
                  </p>

                  {session.sql_query && (
                    <div className="pt-1 font-mono text-[11px] text-emerald-300/80 line-clamp-1">
                      SQL: {session.sql_query}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onLoadSessionInInvestigate(session.natural_language_question)}
                  className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 hover:text-white text-xs font-medium text-slate-300 border border-white/10 transition-colors cursor-pointer"
                >
                  <span>Re-run</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAVED SCENARIOS TAB */}
      {activeTab === 'scenarios' && (
        <div className="rounded-xl border border-white/10 bg-[#0d111a] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Saved What-If Decision Scenarios</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">scenarios table</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.scenarios?.map((sc: any) => {
              const baseline = sc.baseline_summary || {};
              const simulation = sc.simulation_summary || {};
              return (
                <div
                  key={sc.scenario_id}
                  className="p-4 rounded-xl bg-[#080a0f] border border-white/10 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-white/10 font-mono">
                        Scenario #{sc.scenario_id}
                      </span>
                      {sc.origin_session_id && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Linked to Session #{sc.origin_session_id}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white">{sc.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono uppercase">
                      Type: {sc.scenario_type.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1.5 text-xs">
                    {sc.scenario_type === 'course_capacity' ? (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Capacity Shift:</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          {baseline.baselineCapacity} seats &rarr; {simulation.newCapacity} seats
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pass Rate:</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {baseline.baselinePassRate}% &rarr; {simulation.simulatedPassRate}%
                          </span>
                        </div>
                        {simulation.studentsRescued !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Students Rescued:</span>
                            <span className="text-cyan-400 font-mono font-semibold">
                              +{simulation.studentsRescued} students
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Created: {new Date(sc.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUERY AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="rounded-xl border border-white/10 bg-[#0d111a] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-emerald-400" />
              <span>Generated SQL Audit &amp; Lineage Log</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">generated_queries table</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#080a0f]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0b0e14] text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="px-3 py-2.5">Query ID</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">SQL Statement</th>
                  <th className="px-3 py-2.5 text-right">Runtime</th>
                  <th className="px-3 py-2.5 text-right">Rows</th>
                  <th className="px-3 py-2.5">Executed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {data?.queries?.map((q: any) => (
                  <tr key={q.query_id} className="hover:bg-slate-900/60">
                    <td className="px-3 py-2 text-slate-400">#{q.query_id}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          q.execution_status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {q.execution_status === 'success' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{q.execution_status}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-emerald-300/90 max-w-md truncate" title={q.sql_query}>
                      {q.sql_query}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">
                      {q.execution_time_ms ? `${q.execution_time_ms}ms` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">
                      {q.rows_returned !== null ? q.rows_returned : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-[10px]">
                      {new Date(q.executed_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
