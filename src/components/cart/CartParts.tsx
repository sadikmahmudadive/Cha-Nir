"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { cartActions, useCart, type CartLine } from "@/context/cart-store";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { Price, QuantityStepper } from "@/components/ui/misc";
import { formatBDT } from "@/lib/format";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function CartLineItem({ line, compact }: { line: CartLine; compact?: boolean }) {
  const { product, variant, item } = line;
  const low = variant.stock > 0 && item.qty >= variant.stock;
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ duration: 0.3, ease }}
      className="flex gap-4 py-5"
    >
      <Link href={`/shop/${product.slug}`} className="shrink-0" aria-label={`${product.name} details`}>
        <Photo image={product.image} ratio="1/1" className={compact ? "w-20" : "w-24 sm:w-28"} sizes="112px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/shop/${product.slug}`} className="block font-semibold leading-snug text-ink hover:text-tea-700">
              {product.name}
            </Link>
            <p className="text-sm text-ink-mute">{variant.label}</p>
          </div>
          <button
            type="button"
            onClick={() => cartActions.remove(variant.id)}
            className="tap -mr-2 -mt-2 grid cursor-pointer place-items-center rounded-full text-ink-mute transition-colors hover:bg-danger-bg hover:text-danger"
            aria-label={`Remove ${product.name}, ${variant.label}`}
          >
            <Trash2 className="size-[1.1rem]" aria-hidden />
          </button>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            compact
            value={item.qty}
            max={Math.max(variant.stock, 1)}
            label={`Quantity of ${product.name} ${variant.label}`}
            onChange={(n) => cartActions.setQty(variant.id, n)}
          />
          <Price price={line.lineTotal} size="sm" />
        </div>
        {low && <p className="text-xs font-medium text-warn">Maximum available quantity selected.</p>}
      </div>
    </motion.li>
  );
}

export function DiscountForm({ className }: { className?: string }) {
  const { discount, discountLabel } = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (discount) {
    return (
      <div className={cn("flex items-center justify-between gap-3 rounded-md bg-tea-100 px-4 py-3 text-sm", className)}>
        <span className="flex items-center gap-2 font-medium text-tea-800">
          <Check className="size-4" aria-hidden />
          <span>
            <span className="font-bold">{discount}</span> · {discountLabel}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            cartActions.removeDiscount();
            setMsg(null);
          }}
          className="tap -mr-2 grid cursor-pointer place-items-center rounded-full text-tea-800 hover:bg-tea-200"
          aria-label="Remove discount code"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <form
      className={className}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const res = cartActions.applyDiscount(code);
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok) setCode("");
      }}
    >
      <label htmlFor="discount-code" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
        <Tag className="size-4 text-tea-600" aria-hidden /> Discount code
      </label>
      <div className="flex gap-2">
        <input
          id="discount-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          aria-invalid={msg && !msg.ok ? true : undefined}
          aria-describedby="discount-msg"
          placeholder="Enter code"
          className="min-h-12 min-w-0 flex-1 rounded-md border border-line bg-paper px-4 uppercase placeholder:normal-case focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30"
        />
        <Button type="submit" variant="secondary" size="sm">
          Apply
        </Button>
      </div>
      <p id="discount-msg" role="status" className={cn("mt-1.5 min-h-5 text-sm", msg?.ok ? "text-success" : "text-danger")}>
        {msg?.text}
      </p>
    </form>
  );
}

export function SummaryRows({
  subtotal,
  discountAmount,
  discountLabel,
  deliveryFee,
  total,
  deliveryNote,
}: {
  subtotal: number;
  discountAmount: number;
  discountLabel?: string;
  deliveryFee: number | null;
  total: number;
  deliveryNote?: string;
}) {
  return (
    <dl className="space-y-2.5 text-[0.97rem]">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="font-semibold tabular-nums">{formatBDT(subtotal)}</dd>
      </div>
      <AnimatePresence initial={false}>
        {discountAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-between overflow-hidden text-success"
          >
            <dt>Discount{discountLabel ? ` (${discountLabel})` : ""}</dt>
            <dd className="font-semibold tabular-nums">-{formatBDT(discountAmount)}</dd>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Delivery</dt>
        <dd className="text-right font-semibold tabular-nums">
          {deliveryFee === null ? <span className="text-sm font-normal text-ink-mute">{deliveryNote ?? "Calculated at checkout"}</span> : formatBDT(deliveryFee)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3 text-lg">
        <dt className="font-bold">Total</dt>
        <dd className="font-bold tabular-nums">
          <motion.span key={total} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="inline-block">
            {formatBDT(total)}
          </motion.span>
        </dd>
      </div>
    </dl>
  );
}
