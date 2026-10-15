'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Database,
  Search,
  FlaskConical,
  Layers,
  History,
  GraduationCap,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    name: 'Overview',
    href: '/',
    icon: Layers,
  },
  {
    name: 'Investigate',
    href: '/investigate',
    icon: Search,
  },
  {
    name: 'Scenario Lab',
    href: '/scenarios',
    icon: FlaskConical,
  },
  {
    name: 'Data Explorer',
    href: '/explorer',
    icon: Database,
  },
  {
    name: 'Saved Analyses',
    href: '/history',
    icon: History,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-white/[0.06] bg-black flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-violet-900/30">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">DataWise</span>
            </div>
            <p className="text-[10px] text-zinc-400">Academic Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Analytics
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/25 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-violet-400' : 'text-zinc-400'
                }`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sleek Minimal Status Footer */}
      <div className="p-3 m-3 rounded-2xl bg-neutral-950/80 border border-white/[0.06] text-[11px] space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Database Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>
        <div className="flex items-center justify-between text-zinc-300 font-medium">
          <span>PostgreSQL</span>
          <span className="font-mono text-zinc-400 text-[10px]">v18.6</span>
        </div>
      </div>
    </aside>
  );
}
