'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from 'lucide-react';

interface ResultChartProps {
  rows: any[];
  chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'table';
  chartConfig?: {
    xAxis: string;
    yAxis: string;
    seriesName?: string;
  };
}

// Sophisticated Midnight Luxury Palette
const PALETTE = [
  '#8b5cf6', // Electric Violet
  '#ec4899', // Hot Pink
  '#f59e0b', // Amber Gold
  '#10b981', // Mint Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#a855f7', // Purple
];

export function ResultChart({ rows, chartType: initialType = 'bar', chartConfig: initialConfig }: ResultChartProps) {
  if (!rows || rows.length === 0) {
    return (
      <div className="w-full h-64 rounded-2xl border border-white/[0.06] bg-neutral-950/60 p-6 flex flex-col items-center justify-center text-zinc-500 text-xs">
        <span>No query records available to render visual chart.</span>
      </div>
    );
  }

  const sampleRow = rows[0] || {};
  const allColumns = Object.keys(sampleRow);

  // Auto-detect numeric vs categorical columns
  const numericColumns = allColumns.filter((col) => {
    const val = sampleRow[col];
    return val !== null && val !== undefined && !isNaN(Number(val));
  });

  const categoricalColumns = allColumns.filter((col) => !numericColumns.includes(col));

  // Determine active X-axis with fallback
  const defaultX =
    (initialConfig?.xAxis && allColumns.includes(initialConfig.xAxis) ? initialConfig.xAxis : null) ||
    categoricalColumns[0] ||
    allColumns[0];

  // Determine active Y-axis with fallback
  const defaultY =
    (initialConfig?.yAxis && numericColumns.includes(initialConfig.yAxis) ? initialConfig.yAxis : null) ||
    numericColumns[0] ||
    allColumns[1] ||
    allColumns[0];

  const [activeType, setActiveType] = useState<'bar' | 'line' | 'area' | 'pie'>(
    initialType === 'line' ? 'line' : initialType === 'pie' ? 'pie' : 'bar'
  );
  const [selectedX, setSelectedX] = useState<string>(defaultX);
  const [selectedY, setSelectedY] = useState<string>(defaultY);

  // Re-sync axes when query rows change
  useEffect(() => {
    setSelectedX(defaultX);
    setSelectedY(defaultY);
    if (initialType === 'line' || initialType === 'pie') {
      setActiveType(initialType);
    } else {
      setActiveType('bar');
    }
  }, [rows, initialConfig?.xAxis, initialConfig?.yAxis]);

  const effectiveX = allColumns.includes(selectedX) ? selectedX : defaultX;
  const effectiveY = numericColumns.includes(selectedY) ? selectedY : defaultY;

  // Format data for Recharts, disambiguating repeating labels like course codes across semesters
  const formattedData = useMemo(() => {
    return rows.slice(0, 25).map((r, idx) => {
      const rawY = r[effectiveY];
      const numY = rawY !== null && rawY !== undefined ? parseFloat(String(rawY)) : 0;
      const rawX = r[effectiveX];
      let strX = rawX !== null && rawX !== undefined ? String(rawX) : `Item ${idx + 1}`;

      // Disambiguate if there's a semester column and effectiveX is course_code
      if (effectiveX.includes('course') && r.semester) {
        strX = `${strX} (${r.semester.replace('20', "'")})`;
      }

      return {
        ...r,
        _displayLabel: strX,
        _displayValue: isNaN(numY) ? 0 : numY,
      };
    });
  }, [rows, effectiveX, effectiveY]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="bg-neutral-900 border border-white/[0.12] p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-semibold text-zinc-100 border-b border-white/[0.08] pb-1">
            {label || p?.name}
          </p>
          <div className="flex items-center justify-between gap-4 text-zinc-300">
            <span className="text-zinc-400 capitalize">{effectiveY.replace(/_/g, ' ')}:</span>
            <span className="font-semibold text-violet-400 font-mono">
              {typeof p?.value === 'number'
                ? p.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
                : p?.value}
              {effectiveY.toLowerCase().includes('rate') || effectiveY.toLowerCase().includes('pct') ? '%' : ''}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-white/[0.06] bg-[#07070a] p-5 space-y-4 shadow-xl">
      {/* Chart Toolbar: Sleek Pill Type Selector & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-full border border-white/[0.08]">
          <button
            onClick={() => setActiveType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeType === 'bar'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Bar</span>
          </button>

          <button
            onClick={() => setActiveType('line')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeType === 'line'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LineIcon className="h-3.5 w-3.5" />
            <span>Line</span>
          </button>

          <button
            onClick={() => setActiveType('area')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeType === 'area'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="text-xs">▲</span>
            <span>Area</span>
          </button>

          <button
            onClick={() => setActiveType('pie')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeType === 'pie'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PieIcon className="h-3.5 w-3.5" />
            <span>Pie</span>
          </button>
        </div>

        {/* Dynamic Axis Selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">X-Axis:</span>
            <select
              value={effectiveX}
              onChange={(e) => setSelectedX(e.target.value)}
              className="bg-neutral-900 border border-white/[0.08] text-zinc-200 text-xs rounded-full px-3 py-1 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {allColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">Metric (Y):</span>
            <select
              value={effectiveY}
              onChange={(e) => setSelectedY(e.target.value)}
              className="bg-neutral-900 border border-white/[0.08] text-violet-400 text-xs rounded-full px-3 py-1 focus:outline-none focus:border-violet-500 font-mono cursor-pointer"
            >
              {numericColumns.length > 0
                ? numericColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))
                : allColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
            </select>
          </div>
        </div>
      </div>

      {/* SVG Canvas with Guaranteed Min-Height & Clean Spacing */}
      <div className="w-full h-72 min-h-[280px]">
        <ResponsiveContainer width="100%" height={280}>
          {activeType === 'line' ? (
            <LineChart data={formattedData} margin={{ top: 15, right: 25, left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
              <XAxis
                dataKey="_displayLabel"
                stroke="#52525b"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="_displayValue"
                name={effectiveY}
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#8b5cf6', stroke: '#6d28d9', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#a78bfa' }}
              />
            </LineChart>
          ) : activeType === 'area' ? (
            <AreaChart data={formattedData} margin={{ top: 15, right: 25, left: -10, bottom: 60 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
              <XAxis
                dataKey="_displayLabel"
                stroke="#52525b"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="_displayValue"
                name={effectiveY}
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          ) : activeType === 'pie' ? (
            <PieChart>
              <Pie
                data={formattedData}
                dataKey="_displayValue"
                nameKey="_displayLabel"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={45}
                paddingAngle={3}
                label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {formattedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} verticalAlign="bottom" />
            </PieChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 15, right: 25, left: -10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#181820" vertical={false} />
              <XAxis
                dataKey="_displayLabel"
                stroke="#52525b"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                stroke="#52525b"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="_displayValue"
                name={effectiveY}
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                minPointSize={4}
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      entry._displayValue > 25 && effectiveY.toLowerCase().includes('fail')
                        ? '#f43f5e' // Vibrant Coral for high failure rates
                        : PALETTE[index % PALETTE.length]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-2 border-t border-white/[0.06]">
        <span>Plotting {formattedData.length} records</span>
        <span className="text-violet-400">Metric: {effectiveY}</span>
      </div>
    </div>
  );
}
