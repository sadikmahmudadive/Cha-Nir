import type { ReactNode } from "react";
import clsx from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  highlight,
  progress,
  children,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
  progress?: number; // 0 to 100 optional progress indicator
  children?: ReactNode; // Optional custom charts, bars, or segmented breakdown
}) {
  return (
    <div
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5.5 transition-all duration-200 hover:-translate-y-0.5",
        highlight
          ? "border-leaf/30 bg-linear-to-br from-[#ffffff] via-[#f7f9f2] to-[#ecf2e1] shadow-[0_4px_20px_-4px_rgba(83,109,59,0.12)] dark:from-[#182317] dark:via-[#151e14] dark:to-[#111711] dark:border-leaf/40 dark:shadow-[0_4px_28px_rgba(83,109,59,0.25)]"
          : "border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:bg-[#141a14] dark:border-white/[0.08] dark:hover:border-leaf/35 dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
      )}
    >
      {/* Subtle top ambient glow */}
      {highlight && (
        <div className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-lime/25 blur-2xl dark:bg-lime/15" />
      )}

      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brown-soft/80 dark:text-[#98a793] font-sans">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight text-brown dark:text-[#f4f7f2]">
              {value}
            </p>
          </div>

          <div
            className={clsx(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 duration-200 shadow-2xs",
              highlight
                ? "bg-leaf text-cream dark:bg-leaf dark:text-[#f4f7f2]"
                : "bg-leaf-soft/60 text-leaf-deep border border-leaf/15 dark:bg-leaf/20 dark:text-lime-soft dark:border-leaf/30"
            )}
          >
            {icon}
          </div>
        </div>

        {(subtitle || trend) && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.07] text-xs">
            {trend && (
              <span
                className={clsx(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.68rem] font-bold",
                  trendUp
                    ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/35"
                    : "bg-rose-500/10 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/35"
                )}
              >
                {trendUp ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                <span>{trend}</span>
              </span>
            )}
            {subtitle && (
              <span className="text-[0.72rem] text-brown-soft/85 dark:text-[#98a793] truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar / Custom Visual Bars & Charts */}
      {children ? (
        <div className="mt-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.07]">{children}</div>
      ) : typeof progress === "number" ? (
        <div className="mt-3 w-full bg-cream-2 dark:bg-[#20291e] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-leaf dark:bg-lime h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * 7-Day Sparkline Micro-Bars for weekly activity visualization
 */
export function MiniSparklineBars({
  data,
  height = 36,
}: {
  data: { label: string; value: number; isToday?: boolean; display?: string }[];
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between gap-1.5 pt-1">
        {data.map((item, idx) => {
          const heightPct = Math.round((item.value / maxValue) * 100);
          return (
            <div key={idx} className="group/bar relative flex flex-1 flex-col items-center gap-1">
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-7 opacity-0 transition-opacity group-hover/bar:opacity-100 z-10 whitespace-nowrap rounded-md bg-brown dark:bg-[#0d120d] border dark:border-white/15 px-1.5 py-0.5 text-[0.62rem] font-bold font-mono text-cream dark:text-[#f4f7f2] shadow-xs">
                {item.label}: {item.display || item.value}
              </div>
              {/* Bar */}
              <div
                className="w-full max-w-3.5 rounded-full bg-cream-2/80 dark:bg-[#20291e] overflow-hidden flex items-end"
                style={{ height }}
              >
                <div
                  className={clsx(
                    "bar-grow w-full rounded-full transition-colors duration-300",
                    item.isToday
                      ? "bg-linear-to-t from-leaf to-lime"
                      : "bg-leaf/40 group-hover/bar:bg-leaf/75 dark:bg-leaf/35 dark:group-hover/bar:bg-leaf/65"
                  )}
                  style={{ height: `${Math.max(18, heightPct)}%`, animationDelay: `${idx * 50}ms` }}
                />
              </div>
              <span
                className={clsx(
                  "text-[0.6rem] font-bold",
                  item.isToday ? "text-leaf dark:text-lime-soft font-extrabold" : "text-brown-soft/60 dark:text-[#98a793]/70"
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Multi-segment stacked distribution bar (e.g. buyer channels, courier split)
 */
export function SegmentedBar({
  segments,
}: {
  segments: { label: string; pct: number; colorClass: string; valueLabel?: string }[];
}) {
  return (
    <div className="space-y-1.5">
      {/* Multi-segment stacked bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-cream-2 dark:bg-[#20291e] gap-0.5">
        {segments.map((s, idx) => (
          <div
            key={idx}
            className={clsx(
              "h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full",
              s.colorClass
            )}
            style={{ width: `${s.pct}%` }}
            title={`${s.label}: ${s.pct}% (${s.valueLabel || ""})`}
          />
        ))}
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-[0.68rem] text-brown-soft dark:text-[#98a793]">
        {segments.map((s, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={clsx("size-1.5 rounded-full shrink-0", s.colorClass)} />
            <span className="truncate">{s.label}</span>
            <span className="font-mono font-bold text-brown dark:text-[#f4f7f2] text-[0.65rem]">({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Progress bar with label, milestone numbers, and percentage badge
 */
export function MetricProgressBar({
  current,
  target,
  currentLabel,
  unit = "",
  colorClass = "bg-leaf dark:bg-lime",
}: {
  current: number;
  target: number;
  currentLabel?: string;
  unit?: string;
  colorClass?: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[0.68rem] font-bold">
        <span className="text-brown-soft dark:text-[#98a793]">
          {currentLabel || "Goal"}: <span className="font-mono text-brown dark:text-[#f4f7f2]">{current} {unit}</span>
        </span>
        <span className="font-mono font-bold text-leaf-deep dark:text-lime-soft">
          {pct}% <span className="font-normal text-brown-soft/70 dark:text-[#98a793]/60">/ {target} {unit}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-2 dark:bg-[#20291e]">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
