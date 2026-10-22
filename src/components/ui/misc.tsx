"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, ChevronRight, Info, Minus, Plus, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatBDT, percentOff } from "@/lib/format";
import { ease, fadeUp, reveal, stagger } from "@/lib/motion";
import { Button } from "./Button";

/* ── Price ────────────────────────────────────────────────── */
export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = percentOff(price, compareAt);
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-bold tabular-nums text-ink",
          size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-base",
        )}
      >
        <span className="sr-only">Price: </span>
        {formatBDT(price)}
      </span>
      {off && compareAt && (
        <>
          <s className="text-sm tabular-nums text-ink-mute">
            <span className="sr-only">Original price: </span>
            {formatBDT(compareAt)}
          </s>
          <span className="rounded-full bg-lime-500 px-2 py-0.5 text-xs font-bold text-tea-950">-{off}%</span>
        </>
      )}
    </p>
  );
}

/* ── Rating (verified only) ───────────────────────────────── */
export function Rating({ avg, count }: { avg: number; count: number }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-ink-soft">
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn("size-4", n <= Math.round(avg) ? "fill-lime-500 text-lime-600" : "text-line")}
          />
        ))}
      </span>
      <span>
        <span className="sr-only">Rated </span>
        {avg.toFixed(1)}
        <span className="sr-only"> out of 5</span> ({count}
        <span className="sr-only"> verified reviews</span>)
      </span>
    </p>
  );
}

/* ── Quantity stepper ─────────────────────────────────────── */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Quantity",
  compact,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  compact?: boolean;
}) {
  const btn =
    "grid cursor-pointer place-items-center text-ink transition-colors hover:bg-tea-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
  const size = compact ? "size-11" : "size-12";
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center overflow-hidden rounded-full border border-line bg-paper"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        className={cn(btn, size)}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="size-4" aria-hidden />
      </motion.button>
      <span
        className="grid min-w-9 place-items-center text-center font-semibold tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
        <span className="sr-only"> selected</span>
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        className={cn(btn, size)}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="size-4" aria-hidden />
      </motion.button>
    </div>
  );
}

/* ── Skeleton / states ────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="container-x py-10" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-56" />
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <Skeleton className="aspect-square w-full rounded-card lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      {icon && <div className="grid size-16 place-items-center rounded-full bg-tea-100 text-tea-600">{icon}</div>}
      <h2 className="t-h3 text-balance">{title}</h2>
      {body && <p className="max-w-md text-ink-soft text-pretty">{body}</p>}
      {action &&
        (action.href ? (
          <Button href={action.href} variant="primary" className="mt-2">
            {action.label}
          </Button>
        ) : (
          <Button onClick={action.onClick} variant="primary" className="mt-2">
            {action.label}
          </Button>
        ))}
    </div>
  );
}

const alertTone = {
  info: { cls: "bg-info-bg text-info border-info/20", Icon: Info },
  success: { cls: "bg-success-bg text-success border-success/20", Icon: CheckCircle2 },
  warn: { cls: "bg-warn-bg text-warn border-warn/25", Icon: AlertTriangle },
  danger: { cls: "bg-danger-bg text-danger border-danger/25", Icon: AlertTriangle },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  className,
  live,
}: {
  tone?: keyof typeof alertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
  live?: boolean;
}) {
  const { cls, Icon } = alertTone[tone];
  return (
    <div
      role={live ? (tone === "danger" ? "alert" : "status") : undefined}
      className={cn("flex gap-3 rounded-md border p-4 text-sm", cls, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-[0.92rem] leading-relaxed opacity-95">{children}</div>}
      </div>
    </div>
  );
}

/* ── Breadcrumbs ──────────────────────────────────────────── */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-mute">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={`${i}-${it.label}`} className="flex items-center gap-1">
            {it.href ? (
              <Link href={it.href} className="rounded px-1 py-2 hover:text-tea-700 hover:underline underline-offset-4">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="px-1 font-medium text-ink">
                {it.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight className="size-3.5" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Section heading + Reveal ─────────────────────────────── */
export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
  align = "left",
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <motion.div
      {...reveal}
      variants={stagger(0.08)}
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-4", align === "center" && "mx-auto")}>
        {eyebrow && (
          <motion.p
            variants={fadeUp}
            className={cn("t-eyebrow", tone === "dark" ? "text-lime-300" : "text-tea-600")}
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.div variants={fadeUp}>
          <Tag className={cn("t-h2 text-balance", tone === "dark" ? "text-cream" : "text-tea-900")}>{title}</Tag>
        </motion.div>
        {body && (
          <motion.p
            variants={fadeUp}
            className={cn("t-lead text-pretty", tone === "dark" ? "text-cream/80" : "text-ink-soft")}
          >
            {body}
          </motion.p>
        )}
      </div>
      {action && <motion.div variants={fadeUp}>{action}</motion.div>}
    </motion.div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article" | "section";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      {...reveal}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } },
      }}
      className={className}
    >
      {children}
    </M>
  );
}

export { AnimatePresence };
