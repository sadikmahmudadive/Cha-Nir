"use client";

import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHead({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-tea-900">{title}</h1>
        {desc && <p className="mt-1 text-ink-soft">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-card border border-line bg-paper", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "warn" }) {
  return (
    <div className="rounded-card border border-line bg-paper p-5">
      <p className="text-sm text-ink-mute">{label}</p>
      <p className={cn("mt-1 font-display text-3xl tabular-nums", tone === "warn" ? "text-warn" : "text-tea-900")}>{value}</p>
      {note && <p className="mt-1 text-xs text-ink-mute">{note}</p>}
    </div>
  );
}

export interface Col<T> {
  key: string;
  header: string;
  align?: "right";
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  caption,
  cols,
  rows,
  rowKey,
  empty = "Nothing to show yet.",
}: {
  caption: string;
  cols: Col<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="grid place-items-center gap-2 rounded-card border border-dashed border-line bg-paper py-14 text-center text-ink-mute">
        <Inbox className="size-8" aria-hidden />
        <p>{empty}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-paper">
      <table className="w-full min-w-[40rem] text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wider text-ink-mute">
          <tr>
            {cols.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-3 font-bold", c.align === "right" && "text-right")}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.map((r) => (
            <tr key={rowKey(r)} className="hover:bg-tea-50/60">
              {cols.map((c) => (
                <td key={c.key} className={cn("px-4 py-3 align-middle", c.align === "right" && "text-right tabular-nums")}>{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-3">{children}</div>;
}
