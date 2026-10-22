"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Checkbox, Input, RadioCard, Select, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/Sheet";
import { adminCustomers, adminOrders, applicants as seedApplicants, discounts as seedDiscounts, type Applicant } from "@/data/demo/admin";
import { products } from "@/data/demo/catalog";
import { deliveryConfig } from "@/data/demo/content";
import { site } from "@/lib/site";
import { formatBDT, formatDate } from "@/lib/format";
import { Card, DataTable, PageHead, Stat } from "./parts";
import { SalesChart } from "./pages-a";

function useSaved() {
  const [saved, setSaved] = useState(false);
  return { saved, flash: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); } };
}

/* ── Customers ─────────────────────────────────────────── */
export function CustomersPage() {
  return (
    <>
      <PageHead title="Customers" desc="Retail and wholesale customers (demo data)." />
      <DataTable
        caption="Customers"
        rows={adminCustomers}
        rowKey={(c) => c.id}
        cols={[
          { key: "n", header: "Customer", cell: (c) => <div><p className="font-semibold">{c.name}</p><p className="text-xs text-ink-mute">{c.email}</p></div> },
          { key: "t", header: "Type", cell: (c) => <Badge tone={c.type === "Wholesale" ? "info" : "neutral"}>{c.type}</Badge> },
          { key: "o", header: "Orders", align: "right", cell: (c) => c.orders },
          { key: "s", header: "Lifetime spend", align: "right", cell: (c) => formatBDT(c.spent) },
          { key: "j", header: "Joined", cell: (c) => formatDate(c.joined) },
        ]}
      />
    </>
  );
}

/* ── Wholesale approvals ───────────────────────────────── */
export function WholesaleAdminPage() {
  const [rows, setRows] = useState<Applicant[]>(seedApplicants);
  const [reject, setReject] = useState<Applicant | null>(null);
  const [mode, setMode] = useState<"public" | "approved">("public");
  const [moq, setMoq] = useState("25");
  const { saved, flash } = useSaved();
  const setStatus = (id: string, status: Applicant["status"]) => setRows((r) => r.map((a) => (a.id === id ? { ...a, status } : a)));

  return (
    <>
      <PageHead title="Wholesale" desc="Approve business accounts and choose how wholesale pricing is shown." />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DataTable
            caption="Wholesale applications"
            rows={rows}
            rowKey={(a) => a.id}
            empty="No applications waiting."
            cols={[
              { key: "b", header: "Business", cell: (a) => <div><p className="font-semibold">{a.business}</p><p className="text-xs text-ink-mute">{a.contact} · {a.location}</p></div> },
              { key: "t", header: "Type", cell: (a) => a.type },
              { key: "e", header: "Estimate", cell: (a) => a.estimate },
              { key: "s", header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
              { key: "a", header: "Actions", cell: (a) =>
                a.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="min-h-9" onClick={() => setStatus(a.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="secondary" className="min-h-9" onClick={() => setReject(a)}>Reject</Button>
                  </div>
                ) : <span className="text-xs text-ink-mute">Reviewed</span> },
            ]}
          />
        </div>
        <Card title="Wholesale settings">
          <form noValidate onSubmit={(e) => { e.preventDefault(); flash(); }} className="space-y-4">
            <div role="radiogroup" aria-label="Pricing model" className="space-y-2.5">
              <RadioCard name="mode" value="public" checked={mode === "public"} onChange={() => setMode("public")} title="Public catalogue" description="Business pricing visible to everyone." />
              <RadioCard name="mode" value="approved" checked={mode === "approved"} onChange={() => setMode("approved")} title="Approved accounts" description="Negotiated pricing shown after approval." />
            </div>
            <Input label="Default minimum order (kg)" inputMode="numeric" value={moq} onChange={(e) => setMoq(e.target.value.replace(/\D/g, ""))} />
            <div className="flex items-center gap-3"><Button type="submit">Save settings</Button>{saved && <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-success"><Check className="size-4" aria-hidden /> Saved</span>}</div>
          </form>
        </Card>
      </div>
      <Sheet open={!!reject} onClose={() => setReject(null)} title="Reject application?" side="center">
        <p className="text-ink-soft">Reject <strong>{reject?.business}</strong>? They&rsquo;ll be notified and can re-apply.</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="ghost" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (reject) setStatus(reject.id, "rejected"); setReject(null); }}>Reject</Button></div>
      </Sheet>
    </>
  );
}

/* ── Discounts ─────────────────────────────────────────── */
export function DiscountsPage() {
  const [rows, setRows] = useState(seedDiscounts);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ code: "", type: "Percent", value: "" });
  const [err, setErr] = useState<Record<string, string>>({});

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (!/^[A-Z0-9-]{3,20}$/.test(f.code.toUpperCase())) x.code = "Use 3-20 letters, numbers or dashes.";
    if (!f.value || Number(f.value) <= 0 || (f.type === "Percent" && Number(f.value) > 100)) x.value = f.type === "Percent" ? "Enter a percentage from 1 to 100." : "Enter an amount above 0.";
    setErr(x);
    if (Object.keys(x).length) return;
    setRows((r) => [{ id: `d${Date.now()}`, code: f.code.toUpperCase(), type: f.type, value: f.type === "Percent" ? `${f.value}%` : `৳${f.value}`, uses: 0, limit: "Unlimited", status: "active" }, ...r]);
    setF({ code: "", type: "Percent", value: "" });
    setOpen(false);
  };

  return (
    <>
      <PageHead title="Discounts" desc="Create and manage discount codes." actions={<Button iconLeft={<Plus className="size-4" aria-hidden />} onClick={() => setOpen(true)}>New code</Button>} />
      <DataTable
        caption="Discount codes"
        rows={rows}
        rowKey={(d) => d.id}
        cols={[
          { key: "c", header: "Code", cell: (d) => <code className="rounded bg-cream px-2 py-1 font-bold">{d.code}</code> },
          { key: "t", header: "Type", cell: (d) => d.type },
          { key: "v", header: "Value", align: "right", cell: (d) => d.value },
          { key: "u", header: "Uses", align: "right", cell: (d) => `${d.uses} / ${d.limit}` },
          { key: "s", header: "Status", cell: (d) => <StatusBadge status={d.status} /> },
          { key: "a", header: "", cell: (d) => d.status === "expired" ? null : <Button size="sm" variant="secondary" className="min-h-9" onClick={() => setRows((r) => r.map((x) => (x.id === d.id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x)))}>{d.status === "active" ? "Pause" : "Activate"}</Button> },
        ]}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title="New discount code" side="center">
        <form noValidate onSubmit={add} className="space-y-5">
          <Input label="Code" required placeholder="WELCOME10" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} error={err.code} data-autofocus />
          <Select label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option>Percent</option><option>Fixed</option></Select>
          <Input label={f.type === "Percent" ? "Percent off" : "Amount off (৳)"} required inputMode="numeric" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value.replace(/\D/g, "") })} error={err.value} />
          <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create code</Button></div>
        </form>
      </Sheet>
    </>
  );
}

/* ── Delivery ──────────────────────────────────────────── */
export function DeliveryPage() {
  const [fees, setFees] = useState(deliveryConfig.zones.map((z) => String(z.fee)));
  const [free, setFree] = useState("");
  const { saved, flash } = useSaved();
  return (
    <>
      <PageHead title="Delivery" desc="Set delivery charges by area. The storefront reads these values at checkout." />
      <Card className="max-w-2xl">
        <form noValidate onSubmit={(e) => { e.preventDefault(); flash(); }} className="space-y-5">
          <Alert tone="warn" title="Demo values">The fees below are placeholders. Enter the real delivery charges before launch.</Alert>
          {deliveryConfig.zones.map((z, i) => (
            <Input key={z.id} label={`${z.label} (৳)`} required inputMode="numeric" hint={z.districts.length ? `Applies to: ${z.districts.join(", ")}` : "All other districts"} value={fees[i]} onChange={(e) => setFees((f) => f.map((x, j) => (j === i ? e.target.value.replace(/\D/g, "") : x)))} />
          ))}
          <Input label="Free delivery over (৳)" inputMode="numeric" hint="Leave empty to disable free delivery." value={free} onChange={(e) => setFree(e.target.value.replace(/\D/g, ""))} />
          <div className="flex items-center gap-3"><Button type="submit">Save delivery settings</Button>{saved && <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-success"><Check className="size-4" aria-hidden /> Saved</span>}</div>
        </form>
      </Card>
    </>
  );
}

/* ── Homepage content ──────────────────────────────────── */
export function ContentPage() {
  const [msg, setMsg] = useState<string>(site.announcement.message ?? "");
  const [show, setShow] = useState(!!site.announcement.message);
  const [headline, setHeadline] = useState("Every Cup Tells a Story.");
  const [sub, setSub] = useState("Authentic Bangladeshi tea, carefully sourced, thoughtfully processed, and packed for every tea moment.");
  const [featured, setFeatured] = useState<string[]>(products.filter((p) => p.featured).map((p) => p.id));
  const { saved, flash } = useSaved();
  return (
    <>
      <PageHead title="Homepage content" desc="Edit the announcement bar, hero copy and featured products." />
      <form noValidate onSubmit={(e) => { e.preventDefault(); flash(); }} className="grid gap-6 xl:grid-cols-2">
        <Card title="Announcement bar">
          <div className="space-y-4">
            <Checkbox label="Show announcement bar" checked={show} onChange={(e) => setShow(e.target.checked)} />
            <Input label="Message" value={msg} onChange={(e) => setMsg(e.target.value)} disabled={!show} hint="Only publish promotions the business has confirmed." />
            {show && msg && <p className="rounded-md bg-tea-800 px-4 py-2.5 text-center text-sm text-cream">{msg}</p>}
          </div>
        </Card>
        <Card title="Hero">
          <div className="space-y-4">
            <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            <Textarea label="Supporting copy" value={sub} onChange={(e) => setSub(e.target.value)} />
          </div>
        </Card>
        <Card title="Featured products" className="xl:col-span-2">
          <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}><Checkbox label={p.name} checked={featured.includes(p.id)} onChange={() => setFeatured((f) => (f.includes(p.id) ? f.filter((x) => x !== p.id) : [...f, p.id]))} /></li>
            ))}
          </ul>
        </Card>
        <div className="flex items-center gap-3 xl:col-span-2"><Button type="submit">Save homepage</Button>{saved && <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-success"><Check className="size-4" aria-hidden /> Saved (prototype)</span>}</div>
      </form>
    </>
  );
}

/* ── Reports ───────────────────────────────────────────── */
export function ReportsPage() {
  const byStatus = adminOrders.reduce<Record<string, number>>((m, o) => ({ ...m, [o.status]: (m[o.status] ?? 0) + 1 }), {});
  const revenue = adminOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  return (
    <>
      <PageHead title="Reports" desc="Basic sales and order reports (demo data)." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Revenue (demo orders)" value={formatBDT(revenue)} />
        <Stat label="Orders" value={String(adminOrders.length)} />
        <Stat label="Average order" value={formatBDT(revenue / Math.max(1, adminOrders.filter((o) => o.status !== "cancelled").length))} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Sales by day" className="xl:col-span-2"><SalesChart /></Card>
        <Card title="Orders by status">
          <ul className="space-y-3">
            {Object.entries(byStatus).map(([s, n]) => (
              <li key={s} className="flex items-center justify-between"><StatusBadge status={s} /><span className="font-semibold tabular-nums">{n}</span></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
