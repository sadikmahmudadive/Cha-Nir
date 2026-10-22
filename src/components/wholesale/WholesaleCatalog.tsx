"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/misc";
import { cartActions } from "@/context/cart-store";
import { products } from "@/data/demo/catalog";
import { cn } from "@/lib/cn";
import { formatBDT } from "@/lib/format";
import { ease } from "@/lib/motion";

type Mode = "public" | "approved";

const tiers = [
  { band: "Small order", qty: "Minimum order quantity", price: "Set per product" },
  { band: "Volume tier 1", qty: "Quantity band (e.g. 25 kg+)", price: "Configured by Cha Nir" },
  { band: "Volume tier 2", qty: "Quantity band (e.g. 100 kg+)", price: "Configured by Cha Nir" },
  { band: "Contract / repeat", qty: "Negotiated", price: "Quoted per account" },
];

const bulk = products.filter((p) => p.isBulk);

/**
 * Wholesale catalogue supporting both operating models:
 *  - "public":   business pricing is visible to everyone
 *  - "approved": pricing is shown only to approved wholesale accounts
 * The toggle exists only to preview both in this prototype; in production the
 * mode is a single admin setting (Firestore `settings/wholesale.mode`).
 */
export function WholesaleCatalog() {
  const [mode, setMode] = useState<Mode>("public");
  const showPrice = mode === "public";

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-tea-400 bg-tea-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="t-eyebrow text-tea-600">Prototype preview</p>
          <p className="mt-1 text-sm text-ink-soft">Switch the operating model Cha Nir chooses in Admin → Wholesale settings.</p>
        </div>
        <div role="radiogroup" aria-label="Wholesale pricing model" className="relative inline-flex rounded-full bg-paper p-1 ring-1 ring-line">
          {([["public", "Public pricing"], ["approved", "Approved accounts"]] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={mode === id}
              onClick={() => setMode(id)}
              className={cn("relative min-h-11 cursor-pointer rounded-full px-5 text-sm font-semibold transition-colors", mode === id ? "text-white" : "text-ink-soft hover:text-ink")}
            >
              {mode === id && <motion.span layoutId="ws-mode" className="absolute inset-0 rounded-full bg-tea-600" transition={{ duration: 0.28, ease }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <h3 className="font-display text-2xl">Bulk catalogue</h3>
          <ul className="divide-y divide-line rounded-card border border-line bg-paper">
            {bulk.map((p) => (
              <li key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Photo image={p.image} ratio="1/1" className="w-24 shrink-0" sizes="96px" />
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${p.slug}`} className="font-semibold text-tea-900 hover:underline">{p.name}</Link>
                  <p className="text-sm text-ink-soft">{p.short}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {p.variants.map((v) => (
                      <li key={v.id} className="rounded-md bg-cream px-3 py-2 text-sm">
                        <span className="font-semibold">{v.label}</span>{" "}
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="tabular-nums text-ink-soft">
                            {showPrice ? (
                              <>· {formatBDT(v.wholesalePrice ?? v.price)} <span className="text-xs">(demo)</span></>
                            ) : (
                              <span className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden /> Sign in</span>
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!showPrice || p.variants.every((v) => v.stock <= 0)}
                  onClick={() => {
                    const v = p.variants.find((x) => x.stock > 0);
                    if (v) cartActions.add(p, v, 1);
                  }}
                >
                  {showPrice ? "Add to cart" : "Approval required"}
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-mute">Demo catalogue and prices. Minimum quantities and volume discounts below are set by Cha Nir.</p>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <h3 className="font-display text-2xl">Volume pricing</h3>
          <div className="overflow-hidden rounded-card border border-line bg-paper">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Configurable volume pricing tiers</caption>
              <thead className="bg-tea-100 text-tea-900">
                <tr><th scope="col" className="px-4 py-3 font-semibold">Tier</th><th scope="col" className="px-4 py-3 font-semibold">Pricing</th></tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {tiers.map((t) => (
                  <tr key={t.band}>
                    <th scope="row" className="px-4 py-3 align-top font-semibold">{t.band}<span className="block text-xs font-normal text-ink-mute">{t.qty}</span></th>
                    <td className="px-4 py-3 align-top text-ink-soft">{showPrice ? t.price : <span className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden />Approved accounts</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AnimatePresence initial={false}>
            {!showPrice && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Alert tone="info" title="Business pricing is for approved accounts">
                  <ol className="mt-1 list-decimal space-y-1 pl-4">
                    <li><Link href="/account/register?type=business" className="font-semibold underline">Register a business account</Link></li>
                    <li>Cha Nir reviews and approves your account</li>
                    <li>Negotiated pricing and reorder tools unlock</li>
                  </ol>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function ApprovalFlow() {
  const steps = [
    { t: "Send an inquiry", d: "Tell us about your business and how much tea you serve." },
    { t: "We review & approve", d: "Cha Nir confirms your details and sets up your pricing." },
    { t: "Order & repeat", d: "Place bulk orders online and reorder in a couple of taps." },
  ];
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.t} className="rounded-card border border-line bg-paper p-6">
          <span className="grid size-10 place-items-center rounded-full bg-lime-500 font-bold text-tea-950">{i + 1}</span>
          <h3 className="mt-4 font-display text-2xl text-tea-900">{s.t}</h3>
          <p className="mt-2 text-ink-soft">{s.d}</p>
        </li>
      ))}
      <li className="flex items-center gap-2 text-sm text-ink-mute md:col-span-3"><ShieldCheck className="size-4 text-tea-600" aria-hidden /> Business details are used only to set up your wholesale account.</li>
    </ol>
  );
}
