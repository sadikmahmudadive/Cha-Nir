import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "green" | "lime" | "warn" | "danger" | "info" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-cream-deep text-ink-soft",
  green: "bg-tea-100 text-tea-800",
  lime: "bg-lime-500 text-tea-950",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  dark: "bg-tea-800 text-cream",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  pending: "warn",
  confirmed: "info",
  packed: "info",
  shipped: "info",
  delivered: "green",
  cancelled: "danger",
  approved: "green",
  rejected: "danger",
  active: "green",
  paused: "neutral",
  expired: "neutral",
  in: "green",
  low: "warn",
  out: "danger",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <Badge tone={statusTone[status] ?? "neutral"} dot className="capitalize">
      {label ?? status}
    </Badge>
  );
}
