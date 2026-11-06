"use client";

import { useState, type CSSProperties } from "react";
import { BarChart3 } from "lucide-react";
import { bdt } from "@/lib/pricing";
import { CHART_COLORS, smoothPath } from "@/components/admin/charts";

// Sample 7-day series (seed orders don't span a full week of history yet).
const DAYS_DATA = [
  { day: "Sat", fullDay: "Saturday", revenue: 16400, volumeKg: 24.5 },
  { day: "Sun", fullDay: "Sunday", revenue: 18900, volumeKg: 28.0 },
  { day: "Mon", fullDay: "Monday", revenue: 24200, volumeKg: 38.5 },
  { day: "Tue", fullDay: "Tuesday", revenue: 17800, volumeKg: 26.0 },
  { day: "Wed", fullDay: "Wednesday", revenue: 26500, volumeKg: 42.5 },
  { day: "Thu", fullDay: "Thursday", revenue: 21100, volumeKg: 33.5 },
  { day: "Fri", fullDay: "Friday", revenue: 14607, volumeKg: 21.0, isToday: true },
];

export function WeeklyPerformanceChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxRevenue = Math.max(...DAYS_DATA.map((d) => d.revenue));
  const maxVolume = Math.max(...DAYS_DATA.map((d) => d.volumeKg));
  const totalRevenue = DAYS_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalVolume = DAYS_DATA.reduce((s, d) => s + d.volumeKg, 0);
  const avgRevenue = Math.round(totalRevenue / DAYS_DATA.length);
  const peakIdx = DAYS_DATA.findIndex((d) => d.revenue === maxRevenue);

  // Volume trend line points in a 0–100 viewBox, centred over each bar column.
  const n = DAYS_DATA.length;
  const linePoints: [number, number][] = DAYS_DATA.map((d, i) => [
    ((i + 0.5) / n) * 100,
    100 - (d.volumeKg / maxVolume) * 82 - 6,
  ]);
  const line = smoothPath(linePoints);
  const area = `${line} L ${linePoints[n - 1][0]} 100 L ${linePoints[0][0]} 100 Z`;
  const avgTop = 100 - (avgRevenue / maxRevenue) * 100;

  return (
    <div className="h-full rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#141a14] p-6 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-black/[0.06] dark:border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-leaf-soft dark:bg-leaf/25 text-leaf-deep dark:text-lime-soft">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-brown dark:text-[#f4f7f2]">Weekly Performance</h3>
            <p className="text-xs text-brown-soft dark:text-[#98a793]">Daily revenue vs. kilograms dispatched</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[0.7rem] font-semibold text-brown-soft dark:text-[#98a793]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-2 rounded-full bg-linear-to-t from-leaf to-lime" />
            <span>Revenue</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-amber-500" />
            <span>Volume</span>
          </span>
        </div>
      </div>

      {/* Summary pills */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "7-day revenue", value: bdt(totalRevenue) },
          { label: "7-day volume", value: `${totalVolume.toFixed(1)} kg` },
          { label: "Daily average", value: bdt(avgRevenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-cream/50 dark:bg-[#192218] dark:border dark:border-white/[0.06] px-3 py-2">
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793]">{s.label}</p>
            <p className="font-mono text-sm font-extrabold text-brown dark:text-[#f4f7f2]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6">
        <div className="relative h-64 sm:h-72">
          {/* Horizontal grid lines */}
          {[25, 50, 75].map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-black/[0.04] dark:border-white/[0.05]" style={{ top: `${t}%` }} />
          ))}

          {/* Average benchmark */}
          <div className="absolute inset-x-0 z-0 border-t border-dashed border-leaf/30 dark:border-lime/30" style={{ top: `${avgTop}%` }}>
            <span className="absolute -top-2.5 right-0 rounded-full bg-white dark:bg-[#141a14] border dark:border-white/10 px-1.5 font-mono text-[0.58rem] font-bold text-leaf dark:text-lime-soft">
              avg
            </span>
          </div>

          {/* Rounded pill bars */}
          <div className="relative z-10 grid h-full grid-cols-7">
            {DAYS_DATA.map((d, i) => {
              const h = (d.revenue / maxRevenue) * 100;
              const isHover = hovered === i;
              return (
                <div
                  key={d.day}
                  className="relative flex h-full cursor-pointer items-end justify-center px-1.5 sm:px-3"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Track */}
                  <div className="absolute inset-x-1.5 bottom-0 top-0 mx-auto max-w-10 rounded-full bg-cream-2/50 dark:bg-[#20291e] sm:inset-x-3" />
                  {/* Fill */}
                  <div
                    className={`bar-grow relative w-full max-w-10 rounded-full transition-[filter,box-shadow] duration-200 ${
                      d.isToday || i === peakIdx
                        ? "bg-linear-to-t from-leaf to-lime"
                        : "bg-linear-to-t from-leaf/55 to-leaf/30 dark:from-leaf/65 dark:to-leaf/40"
                    } ${isHover ? "shadow-[0_6px_18px_-4px_rgba(83,109,59,0.55)] brightness-110" : ""}`}
                    style={{ height: `${Math.max(8, h)}%`, animationDelay: `${i * 60}ms` } as CSSProperties}
                  />

                  {/* Tooltip */}
                  {isHover && (
                    <div
                      className="absolute z-30 -translate-y-full whitespace-nowrap rounded-xl bg-brown dark:bg-[#0c100c] border dark:border-white/15 px-2.5 py-1.5 text-[0.65rem] text-cream dark:text-[#f4f7f2] shadow-lg"
                      style={{ bottom: `calc(${Math.max(8, h)}% + 10px)` }}
                    >
                      <p className="font-bold">{d.fullDay}{d.isToday ? " · today" : ""}</p>
                      <p className="font-mono text-lime">{bdt(d.revenue)}</p>
                      <p className="font-mono text-amber-300">{d.volumeKg} kg</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Smooth volume trend line */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="weekly-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.amber} stopOpacity="0.18" />
                <stop offset="100%" stopColor={CHART_COLORS.amber} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#weekly-area)" />
            <path
              d={line}
              fill="none"
              stroke={CHART_COLORS.amber}
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              className="line-draw"
            />
          </svg>

          {/* Line dots (HTML so they stay perfectly round) */}
          {linePoints.map(([x, y], i) => (
            <span
              key={i}
              className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-[#141a14] bg-amber-500 shadow-sm transition-transform duration-200 ${
                hovered === i ? "size-3.5" : "size-2.5"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))}
        </div>

        {/* Day labels */}
        <div className="mt-3 grid grid-cols-7">
          {DAYS_DATA.map((d, i) => (
            <div key={d.day} className="flex flex-col items-center gap-1">
              <span
                className={`text-[0.7rem] font-bold ${
                  d.isToday
                    ? "text-leaf dark:text-lime-soft font-extrabold"
                    : hovered === i
                    ? "text-brown dark:text-[#f4f7f2]"
                    : "text-brown-soft/70 dark:text-[#98a793]/70"
                }`}
              >
                {d.day}
              </span>
              {d.isToday && <span className="size-1.5 rounded-full bg-lime" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
