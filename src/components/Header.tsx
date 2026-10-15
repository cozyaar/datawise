'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HealthData {
  status: string;
  database: {
    connected: boolean;
    version?: string;
    database?: string;
    tableCount?: number;
    error?: string;
  };
  llm: {
    provider: string;
    model: string;
    hasKey?: boolean;
    hasApiKey?: boolean;
  };
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Institutional Overview', subtitle: 'Academic cohort performance and analytics' },
  '/investigate': { title: 'Query Workbench', subtitle: 'Natural language analytical investigation' },
  '/scenarios': { title: 'Scenario Lab', subtitle: 'What-If decision simulation & policy modeling' },
  '/explorer': { title: 'Data Explorer', subtitle: '3NF relational schema and storage dictionary' },
  '/history': { title: 'Analysis History', subtitle: 'Audit log of historical queries and simulations' },
};

export function Header() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      // Degraded fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const routeInfo = ROUTE_TITLES[pathname] || { title: 'DataWise Platform', subtitle: 'Academic Intelligence' };

  return (
    <header className="h-14 border-b border-white/[0.06] bg-black/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 tracking-tight leading-tight">
            {routeInfo.title}
          </h2>
          <p className="text-[11px] text-zinc-400 hidden sm:block leading-tight">
            {routeInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Database Connection Pill */}
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/80 border border-white/[0.08] text-xs text-zinc-300"
          title={health?.database?.connected ? 'Connected to local PostgreSQL database' : 'Connecting to database...'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${health?.database?.connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'}`} />
          <span className="font-medium text-[11px] text-zinc-300">
            {health?.database?.connected ? 'PostgreSQL Active' : 'Connecting'}
          </span>
        </div>

        {/* Refresh Status Button */}
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-1.5 rounded-full border border-white/[0.08] bg-neutral-900/80 text-zinc-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Refresh database connection status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
