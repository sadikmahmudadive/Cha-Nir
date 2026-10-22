"use client";

import Link from "next/link";
import { ArrowRight, Check, Package, RotateCcw } from "lucide-react";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/misc";
import { cartActions } from "@/context/cart-store";
import { productById, variantOf } from "@/data/demo/catalog";
import { demoOrders, orderTimeline } from "@/data/demo/content";
import { cn } from "@/lib/cn";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order } from "@/types/catalog";

function reorder(o: Order) {
  o.lines.forEach((l) => {
    const p = productById(l.productId);
    if (!p) return;
    cartActions.add(p, variantOf(p, l.variantId), l.qty);
  });
  cartActions.open();
}

export function OrdersList() {
  const orders = [...demoOrders].reverse();
  if (!orders.length)
    return <EmptyState icon={<Package className="size-8" aria-hidden />} title="No orders yet" body="When you place an order it will appear here." action={{ label: "Shop tea", href: "/shop" }} />;
  return (
    <div>
      <p className="mb-4 text-sm text-ink-mute">Demo orders shown for the prototype.</p>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-card border border-line bg-paper p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{o.id}</p>
                <p className="text-sm text-ink-mute">Placed {formatDate(o.placedAt)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {o.lines.map((l) => {
                const p = productById(l.productId);
                if (!p) return null;
                return (
                  <li key={l.variantId} className="flex items-center gap-2 rounded-full bg-cream py-1 pl-1 pr-3 text-sm">
                    <Photo image={p.image} ratio="1/1" className="w-8" rounded sizes="32px" />
                    {p.name} · {variantOf(p, l.variantId).label} × {l.qty}
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
              <p className="font-bold tabular-nums">{formatBDT(o.total)}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => reorder(o)} iconLeft={<RotateCcw className="size-4" aria-hidden />}>Reorder</Button>
                <Button size="sm" href={`/account/orders/${o.id}`} iconRight={<ArrowRight className="size-4" aria-hidden />}>Details</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const o = demoOrders.find((x) => x.id === id);
  if (!o) return <EmptyState title="Order not found" body="We couldn't find that order." action={{ label: "All orders", href: "/account/orders" }} />;
  const stage = o.status === "cancelled" ? -1 : orderTimeline.indexOf(o.status as (typeof orderTimeline)[number]);

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex min-h-10 items-center text-sm font-semibold text-tea-700 underline underline-offset-4">← All orders</Link>
      <div className="rounded-card border border-line bg-paper p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="font-display text-3xl">{o.id}</h2><p className="text-sm text-ink-mute">Placed {formatDate(o.placedAt)} · {o.payment === "cod" ? "Cash on Delivery" : "Online payment"}</p></div>
          <StatusBadge status={o.status} />
        </div>
        {stage >= 0 && (
          <ol className="mt-8 grid grid-cols-5 gap-1" aria-label="Order status">
            {orderTimeline.map((s, i) => (
              <li key={s} className="text-center" aria-current={i === stage ? "step" : undefined}>
                <div className="relative mx-auto grid size-9 place-items-center">
                  <span className={cn("grid size-9 place-items-center rounded-full text-xs font-bold", i < stage ? "bg-tea-600 text-white" : i === stage ? "bg-lime-500 text-tea-950" : "bg-cream-deep text-ink-mute")}>
                    {i < stage ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
                  </span>
                </div>
                <p className={cn("mt-2 text-xs font-semibold capitalize", i <= stage ? "text-ink" : "text-ink-mute")}>{s}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="divide-y divide-line-soft rounded-card border border-line bg-paper">
          {o.lines.map((l) => {
            const p = productById(l.productId);
            if (!p) return null;
            return (
              <li key={l.variantId} className="flex gap-4 p-4">
                <Photo image={p.image} ratio="1/1" className="w-20" sizes="80px" />
                <div className="min-w-0 flex-1"><Link href={`/shop/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link><p className="text-sm text-ink-mute">{variantOf(p, l.variantId).label} × {l.qty}</p></div>
                <p className="font-semibold tabular-nums">{formatBDT(l.unitPrice * l.qty)}</p>
              </li>
            );
          })}
        </ul>
        <div className="space-y-4">
          <dl className="space-y-2 rounded-card border border-line bg-paper p-5 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="tabular-nums">{formatBDT(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd className="tabular-nums">-{formatBDT(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd className="tabular-nums">{formatBDT(o.delivery)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatBDT(o.total)}</dd></div>
          </dl>
          <div className="rounded-card border border-line bg-paper p-5 text-sm"><p className="font-semibold">Delivery address</p><p className="mt-1 text-ink-soft">{o.address}, {o.district}</p></div>
          <Button full onClick={() => reorder(o)} iconLeft={<RotateCcw className="size-4" aria-hidden />}>Reorder these items</Button>
        </div>
      </div>
    </div>
  );
}
