'use client';

import React from 'react';
import { Database, ShieldCheck, Activity, BrainCircuit, Sliders, Layers, Clock, Cpu } from 'lucide-react';

export type NavTab = 'overview' | 'investigate' | 'scenarios' | 'explorer' | 'history';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  dbStatus: { connected: boolean; version?: string } | null;
  llmStatus: { provider: string; model: string; hasKey: boolean; demoMode: boolean } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  dbStatus,
  llmStatus,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#060911]/85 backdrop-blur-md px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">DataWise</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0 DBMS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Understand your data. Discover why. Decide what next.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('investigate')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'investigate'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Investigate</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'scenarios'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Scenario Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'explorer'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Database Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>History</span>
          </button>
        </nav>

        {/* System Badges & Health */}
        <div className="flex items-center gap-2 text-xs">
          {/* DB Health Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              dbStatus?.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
            title={dbStatus?.version || 'PostgreSQL Connection'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="font-medium">
              {dbStatus?.connected ? 'PostgreSQL Active' : 'DB Disconnected'}
            </span>
          </div>

          {/* Sandbox & Security Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-white/10" title="Analytical queries run in restricted SELECT-only role">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>Read-Only Sandbox</span>
          </div>

          {/* LLM Status Badge */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>{llmStatus?.hasKey ? 'Gemini 2.5' : 'Deterministic Mode'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
