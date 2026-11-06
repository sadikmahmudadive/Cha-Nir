"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

/** SVG-safe unique id (React's useId may contain characters invalid in url(#id)). */
function useSvgId(prefix: string) {
  const raw = useId();
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Brand palette for SVG strokes (Tailwind classes can't be used for stroke gradients). */
export const CHART_COLORS = {
  leaf: "#536d3b",
  leafDeep: "#2f3f21",
  lime: "#a5be16",
  limeSoft: "#c3d65a",
  cream2: "#efebd9",
  amber: "#f59e0b",
  amberSoft: "#fbbf24",
  blue: "#3b82f6",
  purple: "#9333ea",
  emerald: "#10b981",
  rose: "#f43f5e",
  stone: "#a8a29e",
} as const;

/* ------------------------------------------------------------------ */
/*  RadialRing – single rounded progress ring                         */
/* ------------------------------------------------------------------ */

export function RadialRing({
  value,
  max = 100,
  size = 72,
  stroke = 8,
  color = CHART_COLORS.leaf,
  colorTo,
  trackColor = CHART_COLORS.cream2,
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  colorTo?: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const gradId = useSvgId("ring");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? clamp01(value / max) : 0;
  const offset = c * (1 - pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={colorTo ?? color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="ring-anim"
            style={{ "--ring-from": `${c}` } as CSSProperties}
          />
        )}
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DonutChart – rounded, gapped multi-segment donut with hover focus */
/* ------------------------------------------------------------------ */

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
  display?: string;
};

export function DonutChart({
  segments,
  size = 96,
  thickness = 11,
  centerValue,
  centerLabel,
  trackColor = CHART_COLORS.cream2,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
  trackColor?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const visibleCount = segments.filter((s) => s.value > 0).length;
  // Round caps extend each arc by thickness/2 on both ends, so the gap must cover that.
  const gap = visibleCount > 1 ? thickness + 3 : 0;

  const lengths = segments.map((s) => (total > 0 ? (Math.max(0, s.value) / total) * c : 0));
  const arcs = segments.map((s, i) => ({
    s,
    i,
    len: lengths[i],
    start: lengths.slice(0, i).reduce((sum, l) => sum + l, 0),
  }));

  const focused = active !== null ? segments[active] : null;
  const big = size >= 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 overflow-visible">
        <circle cx={center} cy={center} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        {arcs.map(({ s, i, len, start }) => {
          if (len <= 0) return null;
          const draw = Math.max(0.01, len - gap);
          const dimmed = active !== null && active !== i;
          return (
            <circle
              key={s.label}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={active === i ? thickness + 3 : thickness}
              strokeLinecap="round"
              strokeDasharray={`${draw} ${c}`}
              strokeDashoffset={-(start + gap / 2)}
              className="donut-seg cursor-pointer transition-[stroke-width,opacity] duration-200"
              style={{ opacity: dimmed ? 0.3 : 1, "--c": `${c}` } as CSSProperties}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <title>{`${s.label}: ${s.display ?? s.value}`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center leading-tight px-1.5">
        {focused ? (
          <>
            <span className={`font-mono font-extrabold text-brown ${big ? "text-base sm:text-lg" : "text-[0.78rem]"}`}>
              {focused.display ?? focused.value}
            </span>
            <span className={`truncate max-w-full font-semibold text-brown-soft ${big ? "text-[0.68rem]" : "text-[0.56rem]"}`}>
              {focused.label}
            </span>
          </>
        ) : (
          <>
            {centerValue !== undefined && (
              <span className={`font-mono font-extrabold text-brown ${big ? "text-2xl" : "text-sm"}`}>
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className={`font-semibold uppercase tracking-wider text-brown-soft/80 ${big ? "text-[0.6rem]" : "text-[0.52rem]"}`}>
                {centerLabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ActivityRings – concentric rounded rings (Apple-Watch style)      */
/* ------------------------------------------------------------------ */

export type ActivityRing = {
  label: string;
  value: number;
  max?: number;
  color: string;
  colorTo?: string;
};

export function ActivityRings({
  rings,
  size = 150,
  stroke = 13,
  gap = 5,
  children,
}: {
  rings: ActivityRing[];
  size?: number;
  stroke?: number;
  gap?: number;
  children?: ReactNode;
}) {
  const baseId = useSvgId("act");
  const center = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          {rings.map((ring, i) => (
            <linearGradient key={i} id={`${baseId}-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={ring.color} />
              <stop offset="100%" stopColor={ring.colorTo ?? ring.color} />
            </linearGradient>
          ))}
        </defs>
        {rings.map((ring, i) => {
          const radius = (size - stroke) / 2 - i * (stroke + gap);
          if (radius <= 0) return null;
          const c = 2 * Math.PI * radius;
          const pct = clamp01(ring.value / (ring.max ?? 100));
          return (
            <g key={ring.label}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeOpacity={0.14}
                strokeWidth={stroke}
              />
              {pct > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={`url(#${baseId}-${i})`}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - pct)}
                  className="ring-anim"
                  style={{ "--ring-from": `${c}`, animationDelay: `${i * 120}ms` } as CSSProperties}
                >
                  <title>{`${ring.label}: ${Math.round(pct * 100)}%`}</title>
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChartLegend – compact dot legend with right-aligned values        */
/* ------------------------------------------------------------------ */

export function ChartLegend({
  items,
}: {
  items: { label: string; color: string; value: string }[];
}) {
  return (
    <ul className="min-w-0 flex-1 space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-2 text-[0.72rem]">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="truncate text-brown-soft font-medium">{item.label}</span>
          </span>
          <span className="shrink-0 font-mono font-bold text-brown">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  smoothPath – Catmull-Rom → cubic Bézier for soft trend lines      */
/* ------------------------------------------------------------------ */

export function smoothPath(points: [number, number][], tension = 0.2) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * tension;
    const c1y = p1[1] + (p2[1] - p0[1]) * tension;
    const c2x = p2[0] - (p3[0] - p1[0]) * tension;
    const c2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
