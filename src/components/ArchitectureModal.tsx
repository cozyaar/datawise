'use client';

import React, { useState } from 'react';
import { X, Layers, Server, Monitor, Database, Cpu, ShieldCheck, ArrowRight, Code2, HardDrive, RefreshCw } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'stack' | 'flow' | 'llm_vs_db'>('stack');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0c0e14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#11141c]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>System Architecture: Frontend vs. Backend</span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Full-Stack Audit
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed boundary breakdown between Client-Side React and Server-Side PostgreSQL + LLM Agents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setActiveTab('stack')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  activeTab === 'stack' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Architecture Stack
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  activeTab === 'flow' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Data Pipeline Flow
              </button>
              <button
                onClick={() => setActiveTab('llm_vs_db')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  activeTab === 'llm_vs_db' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Neuro-Symbolic (Why not an AI wrapper?)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          
          {/* TAB 1: ARCHITECTURE STACK BREAKDOWN */}
          {activeTab === 'stack' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* FRONTEND COLUMN */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-blue-500/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Monitor className="h-4 w-4" />
                    <span>FRONTEND LAYER (Client)</span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                    Next.js App Router (Client Components)
                  </span>
                </div>

                <p className="text-slate-400 text-xs">
                  Runs directly in the browser via React 19 client components with reactive state, zero-latency visualizations, and interactive control decks.
                </p>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5 text-blue-400" />
                      <span>Workbench &amp; Studios (`src/components/`)</span>
                    </div>
                    <ul className="text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                      <li>`InvestigateView.tsx`: NL-to-SQL studio, SQL editor, and tabbed op visualizer</li>
                      <li>`ScenarioLabView.tsx`: Interactive counterfactual simulation sliders &amp; delta meters</li>
                      <li>`ExplorerView.tsx`: 3NF ER diagram viewer &amp; live relational table browser</li>
                      <li>`OverviewView.tsx`: Capstone summary and live database telemetry cards</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-blue-400" />
                      <span>Data Visualization &amp; UX</span>
                    </div>
                    <ul className="text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                      <li>`ResultChart.tsx`: Recharts multi-series Bar, Scatter, Line visualizer</li>
                      <li>`DataTable.tsx`: Real-time sortable and searchable relational grid with CSV export</li>
                      <li>`SqlViewer.tsx`: Syntax-highlighted SQL with copy &amp; edit triggers</li>
                      <li>Agent Trace Stepper: Visual pipeline progress with stage durations</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Client State &amp; Ergonomics</span>
                    </div>
                    <ul className="text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                      <li>Interactive parameter tuning (sample prompts, active queries)</li>
                      <li>Zero mockups: All views consume live JSON contracts from backend</li>
                      <li>Full responsiveness across desktop and laptop viewports</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* BACKEND COLUMN */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Server className="h-4 w-4" />
                    <span>BACKEND LAYER (Server &amp; Database)</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    Node.js + PostgreSQL 18.6
                  </span>
                </div>

                <p className="text-slate-400 text-xs">
                  Runs securely on the server with dual-pool PostgreSQL isolation, anti-injection AST parsers, Google Gemini agent workflows, and deterministic simulation algorithms.
                </p>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      <Database className="h-3.5 w-3.5 text-emerald-400" />
                      <span>API Route Handlers (`src/app/api/`)</span>
                    </div>
                    <ul className="text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                      <li>`POST /api/investigate`: Multi-stage SQL synthesis, sandbox execution, EXPLAIN parsing, and factual grounding</li>
                      <li>`POST /api/simulate`: Counterfactual what-if simulation engine logging to `scenarios` and `scenario_results`</li>
                      <li>`GET /api/db-storage`: Direct filesystem inspector reading cluster path and OID relfilenodes</li>
                      <li>`GET /api/explorer`: Schema metadata introspector and live relation pagination</li>
                      <li>`GET /api/health`: PostgreSQL and LLM provider connectivity monitor</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      <span>Database Engine &amp; Security (`src/lib/db.ts`)</span>
                    </div>
                    <ul className="text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                      <li>PostgreSQL 18.6 with 10 3NF tables on `127.0.0.1:5432/datawise`</li>
                      <li>Dual Connection Pool: `postgres` (Admin state log) vs `datawise_readonly` (Sandbox query executor)</li>
                      <li>AST Anti-Injection Guard: Enforces SELECT/CTE only, 6,000ms statement timeout, LIMIT 100</li>
                      <li>Deep PostgreSQL `EXPLAIN (ANALYZE, COSTS, VERBOSE, FORMAT JSON)` optimizer extractor</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-white font-semibold flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-purple-400" />
                      <span>LLM &amp; Autonomous Agent (`src/lib/llm.ts`)</span>
                    </div>
                    <ul className="text-slate-400 list-disc list-inside space-y-0.5 pl-1">
                      <li>Google Gemini SDK (`gemini-flash-lite-latest`) with Zod-enforced JSON schema</li>
                      <li><strong className="text-purple-300">Autonomous Reflection Loop (`healQueryWithFeedback`)</strong>: Catches engine errors and self-corrects SQL automatically</li>
                      <li>Grounded Provenance Synthesizer: 100% row-citation factual summary</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA PIPELINE FLOW */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2">End-to-End Request &amp; Execution Pipeline</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Trace how an analytical question flows from the user interface down to the PostgreSQL physical storage and back.
                </p>

                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-950/20 border border-blue-500/30">
                    <span className="px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-bold">1</span>
                    <div>
                      <strong className="text-white">User Prompt Formulated (Frontend)</strong>
                      <p className="text-slate-400">User enters a question in `InvestigateView.tsx` or chooses a preset inquiry like &quot;Which courses have the highest failure rates?&quot;.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-slate-500">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-950/20 border border-purple-500/30">
                    <span className="px-2 py-0.5 rounded bg-purple-900 text-purple-200 font-bold">2</span>
                    <div>
                      <strong className="text-white">API Call &amp; Semantic Translation (Backend - Next.js &amp; Gemini)</strong>
                      <p className="text-slate-400">`POST /api/investigate` receives prompt. `src/lib/db.ts` introspects schema metadata and passes it with domain constraints to Gemini (`src/lib/llm.ts`). Gemini translates analytical intent into a PostgreSQL 18 query proposal adhering to strict Zod JSON structure.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-slate-500">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/30">
                    <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-200 font-bold">3</span>
                    <div>
                      <strong className="text-white">AST Linter &amp; Sandbox Role Enforcement (Backend - Security)</strong>
                      <p className="text-slate-400">`validateReadOnlySQL` inspects the query string to verify zero DML/DDL mutation keywords. The query is then executed on the dedicated `datawise_readonly` PostgreSQL connection pool with a 6,000ms statement timeout.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-slate-500">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 font-bold">4</span>
                    <div>
                      <strong className="text-white">PostgreSQL Engine Execution &amp; Optimizer Analysis (Backend - Database)</strong>
                      <p className="text-slate-400">PostgreSQL 18.6 executes the query on disk, compiles raw row records, and runs `EXPLAIN (ANALYZE, COSTS, VERBOSE, FORMAT JSON)` to reveal exact planning times, scan types, buffer hits, and node costs.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-slate-500">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                    <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 font-bold">5</span>
                    <div>
                      <strong className="text-white">Grounded Provenance Synthesis &amp; UI Rendering (Frontend)</strong>
                      <p className="text-slate-400">Gemini synthesizes a factual natural language summary grounded strictly in the returned rows (no hallucinated statistics). The frontend receives rows, query, explain tree, and agent trace, rendering the searchable table, dynamic Recharts chart, and optimizer tree.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEURO-SYMBOLIC LLM VS TRADITIONAL WRAPPER */}
          {activeTab === 'llm_vs_db' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span>Why DataWise is NOT a Generic AI Wrapper</span>
                </h3>
                <p className="text-slate-300">
                  Most student projects and shallow AI wrappers use a naive &quot;Text-in &rarr; Text-out&quot; chatbot architecture where an LLM hallucinates numbers, averages, and statistics. DataWise uses a production <strong className="text-white">Neuro-Symbolic Architecture</strong>:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                    ❌ Shallow AI Wrapper (What we avoided)
                  </span>
                  <ul className="text-slate-400 space-y-2 text-xs list-disc list-inside">
                    <li>Takes user prompt and directly asks LLM: &quot;What are the failure rates?&quot;</li>
                    <li>LLM hallucinates fictional percentages without querying a real database.</li>
                    <li>LLM does floating-point arithmetic (LLMs are notoriously bad at math).</li>
                    <li>No database schema constraints, no normalization, no query optimizer.</li>
                    <li>If something fails, the app crashes or outputs raw error traces.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    ✅ DataWise Neuro-Symbolic Agent (Enterprise Standard)
                  </span>
                  <ul className="text-slate-300 space-y-2 text-xs list-disc list-inside">
                    <li><strong className="text-white">Neural Role (Gemini):</strong> Translates ambiguous human intent into structured, normalized SQL expressions and explains findings.</li>
                    <li><strong className="text-white">Symbolic Role (PostgreSQL 18):</strong> Computes exact sums, averages, joins, foreign key integrity, and query planning on disk.</li>
                    <li><strong className="text-white">Autonomous Self-Healing:</strong> If PostgreSQL throws an engine error, the agent feeds the error back to the LLM to auto-correct the query in a closed loop!</li>
                    <li><strong className="text-white">100% Provenance:</strong> Every sentence generated in the summary cites concrete rows returned by the database.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="text-white font-bold block">Authoritative Local PostgreSQL Cluster</span>
                    <span className="text-slate-400 font-mono text-[11px]">Database OID: 16388 | C:\Program Files\PostgreSQL\18\data</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Return to Studio
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-[#0e1118] text-xs text-slate-400">
          <span>DataWise Capstone Architecture | University Database Systems</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
