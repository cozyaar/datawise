'use client';

import { useState } from 'react';
import { Copy, Check, Terminal, Clock, Rows } from 'lucide-react';

interface SqlViewerProps {
  sql: string;
  executionTimeMs?: number;
  rowCount?: number;
  title?: string;
}

export function SqlViewer({ sql, executionTimeMs, rowCount, title = 'PostgreSQL Execution Plan' }: SqlViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-lg">
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {executionTimeMs !== undefined && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              {executionTimeMs}ms
            </span>
          )}
          {rowCount !== undefined && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Rows className="w-3 h-3 text-slate-500" />
              {rowCount} rows
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy SQL to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-cyan-300 bg-slate-950/80 selection:bg-cyan-900 selection:text-white">
        <pre className="whitespace-pre-wrap break-words">{sql}</pre>
      </div>
    </div>
  );
}
