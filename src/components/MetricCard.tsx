'use client';

import { useState } from 'react';
import { LucideIcon, Code2, ChevronDown, ChevronUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  sqlExplanation?: string;
  accentColor?: 'cyan' | 'emerald' | 'indigo' | 'amber' | 'purple';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  sqlExplanation,
  accentColor = 'cyan',
}: MetricCardProps) {
  const [showSql, setShowSql] = useState(false);

  const colorStyles = {
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
  }[accentColor];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            {title}
          </span>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorStyles} border`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {sqlExplanation && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowSql(!showSql)}
            className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Code2 className="w-3 h-3 text-cyan-400" />
              <span>PostgreSQL Engine Proof</span>
            </span>
            {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showSql && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {sqlExplanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
