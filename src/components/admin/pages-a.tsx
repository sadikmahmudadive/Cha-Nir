"use client";

import Link from "next/link";
import { AlertTriangle, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/Sheet";
import { Photo } from "@/components/media/Photo";
import { adminOrders, applicants, nextStatus, salesWeek, type AdminOrder } from "@/data/demo/admin";
import { categories, products as seed } from "@/data/demo/catalog";
import { cn } from "@/lib/cn";
import { formatBDT, formatDate } from "@/lib/format";
import { stockState, type OrderStatus, type Product, type Variant } from "@/types/catalog";
import { Card, DataTable, PageHead, Stat, Toolbar, type Col } from "./parts";

/* ── bar chart (single series, direct labels, table fallback) ── */
export function SalesChart() {
  const max = Math.max(...salesWeek.map((d) => d.v));
  return (
    <figure>
      <div className="flex h-48 items-end gap-3" aria-hidden>
        {salesWeek.map((d) => (
          <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold tabular-nums text-ink-soft">{(d.v / 1000).toFixed(1)}k</span>
            <div className="w-full rounded-t-md bg-tea-600" style={{ height: `${(d.v / max) * 100}%` }} />
            <span className="text-xs text-ink-mute">{d.d}</span>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">
        Demo sales by day: {salesWeek.map((d) => `${d.d} ${formatBDT(d.v)}`).join(", ")}
      </figcaption>
    </figure>
  );
}

/* ── Dashboard ─────────────────────────────────────────── */
export function DashboardPage() {
  const low = seed.flatMap((p) => p.variants.filter((v) => stockState(v.stock) !== "in").map((v) => ({ p, v })));
  const pending = applicants.filter((a) => a.status === "pending").length;
  return (
    <>
      <PageHead title="Dashboard" desc="Orders, stock and wholesale at a glance (demo data)." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Sales this week" value={formatBDT(salesWeek.reduce((s, d) => s + d.v, 0))} note="Demo figure" />
        <Stat label="Open orders" value={String(adminOrders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length)} />
        <Stat label="Low or out of stock" value={String(low.length)} tone="warn" note="Variants needing attention" />
        <Stat label="Wholesale approvals" value={String(pending)} note="Waiting for review" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Sales, last 7 days" className="xl:col-span-2"><SalesChart /></Card>
        <Card title="Needs attention" action={<Link href="/admin/inventory" className="text-sm font-semibold text-tea-700 underline underline-offset-4">Inventory</Link>}>
          <ul className="space-y-3">
            {low.slice(0, 6).map(({ p, v }) => (
              <li key={v.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{p.name} · {v.label}</span>
                <StatusBadge status={stockState(v.stock)} label={v.stock <= 0 ? "Out" : `${v.stock} left`} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-6">
        <h2 className="mb-3 font-semibold">Recent orders</h2>
        <DataTable
          caption="Recent orders"
          rows={adminOrders.slice(0, 5)}
          rowKey={(o) => o.id}
          cols={[
            { key: "id", header: "Order", cell: (o) => <span className="font-semibold">{o.id}</span> },
            { key: "c", header: "Customer", cell: (o) => o.customer },
            { key: "t", header: "Total", align: "right", cell: (o) => formatBDT(o.total) },
            { key: "s", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
          ]}
        />
      </div>
    </>
  );
}

/* ── Orders ────────────────────────────────────────────── */
const statuses: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

export function OrdersPage() {
  const [rows, setRows] = useState<AdminOrder[]>(adminOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [cancel, setCancel] = useState<AdminOrder | null>(null);

  const shown = rows.filter((o) => (filter === "all" || o.status === filter) && `${o.id} ${o.customer}`.toLowerCase().includes(q.toLowerCase()));
  const set = (id: string, status: OrderStatus) => setRows((r) => r.map((o) => (o.id === id ? { ...o, status } : o)));

  const cols: Col<AdminOrder>[] = [
    { key: "id", header: "Order", cell: (o) => <span className="font-semibold">{o.id}</span> },
    { key: "d", header: "Date", cell: (o) => formatDate(o.date) },
    { key: "c", header: "Customer", cell: (o) => <>{o.customer} <Badge tone={o.type === "Wholesale" ? "info" : "neutral"} className="ml-1">{o.type}</Badge></> },
    { key: "i", header: "Items", align: "right", cell: (o) => o.items },
    { key: "t", header: "Total", align: "right", cell: (o) => formatBDT(o.total) },
    { key: "p", header: "Payment", cell: (o) => o.payment },
    { key: "s", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
    {
      key: "a",
      header: "Actions",
      cell: (o) => {
        const n = nextStatus[o.status];
        return (
          <div className="flex gap-2">
            {n && <Button size="sm" variant="secondary" className="min-h-9" onClick={() => set(o.id, n)}>Mark {n}</Button>}
            {n && <Button size="sm" variant="ghost" className="min-h-9" onClick={() => setCancel(o)}>Cancel</Button>}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHead title="Orders" desc="Review, confirm and fulfil orders." />
      <Toolbar>
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders" className="min-h-11 w-64 rounded-md border border-line bg-paper pl-9 pr-3 focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(["all", ...statuses] as const).map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={cn("min-h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold capitalize", filter === s ? "border-tea-600 bg-tea-600 text-white" : "border-line bg-paper hover:bg-tea-100")}>{s}</button>
          ))}
        </div>
      </Toolbar>
      <DataTable caption="Orders" rows={shown} rowKey={(o) => o.id} cols={cols} empty="No orders match these filters." />
      <Sheet open={!!cancel} onClose={() => setCancel(null)} title="Cancel this order?" side="center">
        <p className="text-ink-soft">Cancel <strong>{cancel?.id}</strong> for {cancel?.customer}? Stock will be returned to inventory and the customer notified.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancel(null)}>Keep order</Button>
          <Button variant="danger" onClick={() => { if (cancel) set(cancel.id, "cancelled"); setCancel(null); }}>Cancel order</Button>
        </div>
      </Sheet>
    </>
  );
}

/* ── Products ──────────────────────────────────────────── */
interface Draft { id?: string; name: string; categoryId: string; short: string; variants: Variant[] }
const blankVariant = (): Variant => ({ id: `v${Math.random().toString(36).slice(2, 7)}`, label: "", sku: "", price: 0, wholesalePrice: 0, stock: 0 });

export function ProductsPage() {
  const [list, setList] = useState<Product[]>(seed);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [del, setDel] = useState<Product | null>(null);
  const [err, setErr] = useState("");
  const shown = useMemo(() => list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [list, q]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim() || draft.variants.some((v) => !v.label.trim() || v.price <= 0)) {
      setErr("Give the product a name and every pack size a label and a retail price above 0.");
      return;
    }
    setErr("");
    if (draft.id) setList((l) => l.map((p) => (p.id === draft.id ? { ...p, name: draft.name, categoryId: draft.categoryId, short: draft.short, variants: draft.variants } : p)));
    else
      setList((l) => [
        { ...seed[0], id: `p-${Date.now()}`, slug: draft.name.toLowerCase().replace(/\W+/g, "-"), name: draft.name, categoryId: draft.categoryId, short: draft.short, variants: draft.variants, badge: undefined, featured: false, bestseller: false, viewer: undefined },
        ...l,
      ]);
    setDraft(null);
  };
  const patchVariant = (i: number, patch: Partial<Variant>) =>
    setDraft((d) => d && { ...d, variants: d.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) });

  return (
    <>
      <PageHead
        title="Products"
        desc="Products, categories, pack sizes and retail & wholesale pricing."
        actions={<Button iconLeft={<Plus className="size-4" aria-hidden />} onClick={() => setDraft({ name: "", categoryId: categories[0].id, short: "", variants: [blankVariant()] })}>Add product</Button>}
      />
      <Toolbar>
        <label className="relative">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="min-h-11 w-64 rounded-md border border-line bg-paper pl-9 pr-3 focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30" />
        </label>
      </Toolbar>
      <DataTable
        caption="Products"
        rows={shown}
        rowKey={(p) => p.id}
        empty="No products match your search."
        cols={[
          { key: "n", header: "Product", cell: (p) => (
            <div className="flex items-center gap-3"><Photo image={p.image} ratio="1/1" className="w-11 shrink-0" rounded sizes="44px" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-ink-mute">{categories.find((c) => c.id === p.categoryId)?.name}</p></div></div>
          ) },
          { key: "v", header: "Pack sizes", cell: (p) => p.variants.map((v) => v.label).join(", ") },
          { key: "r", header: "Retail", align: "right", cell: (p) => { const x = p.variants.map((v) => v.price); return `${formatBDT(Math.min(...x))}–${formatBDT(Math.max(...x))}`; } },
          { key: "w", header: "Wholesale", align: "right", cell: (p) => (p.variants.some((v) => v.wholesalePrice) ? formatBDT(Math.min(...p.variants.map((v) => v.wholesalePrice ?? Infinity))) + "+" : "-") },
          { key: "a", header: "Actions", cell: (p) => (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="min-h-9" onClick={() => setDraft({ id: p.id, name: p.name, categoryId: p.categoryId, short: p.short, variants: p.variants.map((v) => ({ ...v })) })}>Edit</Button>
              <Button size="sm" variant="ghost" className="min-h-9" onClick={() => setDel(p)} aria-label={`Delete ${p.name}`}><Trash2 className="size-4" aria-hidden /></Button>
            </div>
          ) },
        ]}
      />

      <Sheet open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Edit product" : "Add product"} side="right" className="max-w-[34rem]!">
        {draft && (
          <form noValidate onSubmit={save} className="space-y-5">
            {err && <Alert tone="danger" live title={err} />}
            <Input label="Product name" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Select label="Category" required value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label="Short description" value={draft.short} onChange={(e) => setDraft({ ...draft, short: e.target.value })} />
            <fieldset className="space-y-3">
              <legend className="mb-1 font-semibold">Pack sizes &amp; pricing</legend>
              {draft.variants.map((v, i) => (
                <div key={v.id} className="rounded-md border border-line bg-paper p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Label" required placeholder="250 g" value={v.label} onChange={(e) => patchVariant(i, { label: e.target.value })} />
                    <Input label="SKU" value={v.sku} onChange={(e) => patchVariant(i, { sku: e.target.value })} />
                    <Input label="Retail price (৳)" required inputMode="numeric" value={v.price || ""} onChange={(e) => patchVariant(i, { price: Number(e.target.value.replace(/\D/g, "")) })} />
                    <Input label="Wholesale price (৳)" inputMode="numeric" value={v.wholesalePrice || ""} onChange={(e) => patchVariant(i, { wholesalePrice: Number(e.target.value.replace(/\D/g, "")) })} />
                    <Input label="Stock" required inputMode="numeric" value={v.stock} onChange={(e) => patchVariant(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} />
                    <div className="flex items-end"><Button size="sm" variant="ghost" disabled={draft.variants.length === 1} onClick={() => setDraft({ ...draft, variants: draft.variants.filter((_, j) => j !== i) })}>Remove size</Button></div>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="secondary" iconLeft={<Plus className="size-4" aria-hidden />} onClick={() => setDraft({ ...draft, variants: [...draft.variants, blankVariant()] })}>Add pack size</Button>
            </fieldset>
            <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-line-soft bg-cream px-5 py-4">
              <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
              <Button type="submit">Save product</Button>
            </div>
          </form>
        )}
      </Sheet>

      <Sheet open={!!del} onClose={() => setDel(null)} title="Delete product?" side="center">
        <p className="flex gap-3 text-ink-soft"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden /> <span>Delete <strong>{del?.name}</strong>? It will disappear from the storefront. Existing orders keep their history.</span></p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDel(null)}>Keep product</Button>
          <Button variant="danger" onClick={() => { setList((l) => l.filter((p) => p.id !== del?.id)); setDel(null); }}>Delete product</Button>
        </div>
      </Sheet>
    </>
  );
}

/* ── Inventory ─────────────────────────────────────────── */
export function InventoryPage() {
  const [stock, setStock] = useState<Record<string, number>>(() => Object.fromEntries(seed.flatMap((p) => p.variants.map((v) => [v.id, v.stock]))));
  const [onlyLow, setOnlyLow] = useState(false);
  const [adj, setAdj] = useState<{ p: Product; v: Variant } | null>(null);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("Restock");
  const rows = seed.flatMap((p) => p.variants.map((v) => ({ p, v }))).filter(({ v }) => !onlyLow || stockState(stock[v.id]) !== "in");

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(delta);
    if (!adj || !n) return;
    setStock((s) => ({ ...s, [adj.v.id]: Math.max(0, s[adj.v.id] + n) }));
    setAdj(null);
    setDelta("");
  };

  return (
    <>
      <PageHead title="Inventory" desc="Track stock per pack size and record adjustments." />
      <Toolbar><Checkbox label="Show low & out of stock only" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} /></Toolbar>
      <DataTable
        caption="Inventory by pack size"
        rows={rows}
        rowKey={({ v }) => v.id}
        empty="Everything is well stocked."
        cols={[
          { key: "p", header: "Product", cell: ({ p }) => <span className="font-semibold">{p.name}</span> },
          { key: "v", header: "Pack size", cell: ({ v }) => v.label },
          { key: "k", header: "SKU", cell: ({ v }) => <code className="text-xs">{v.sku}</code> },
          { key: "s", header: "In stock", align: "right", cell: ({ v }) => stock[v.id] },
          { key: "st", header: "Status", cell: ({ v }) => <StatusBadge status={stockState(stock[v.id])} label={{ in: "In stock", low: "Low", out: "Out" }[stockState(stock[v.id])]} /> },
          { key: "a", header: "", cell: (r) => <Button size="sm" variant="secondary" className="min-h-9" onClick={() => setAdj(r)}>Adjust</Button> },
        ]}
      />
      <Sheet open={!!adj} onClose={() => setAdj(null)} title="Adjust stock" side="center">
        {adj && (
          <form noValidate onSubmit={apply} className="space-y-5">
            <p className="text-ink-soft">{adj.p.name} · {adj.v.label}. Currently <strong>{stock[adj.v.id]}</strong> in stock.</p>
            <Input label="Change (use a minus to remove)" required inputMode="numeric" placeholder="e.g. 20 or -5" value={delta} onChange={(e) => setDelta(e.target.value.replace(/[^\d-]/g, ""))} data-autofocus />
            <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {["Restock", "Damaged / expired", "Stock count correction", "Sample / internal use"].map((r) => <option key={r}>{r}</option>)}
            </Select>
            <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setAdj(null)}>Cancel</Button><Button type="submit" disabled={!Number(delta)}>Save adjustment</Button></div>
          </form>
        )}
      </Sheet>
    </>
  );
}
