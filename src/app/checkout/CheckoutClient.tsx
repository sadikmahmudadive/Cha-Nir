"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock } from "lucide-react";
import { Field } from "@/components/Field";
import { cartActions, useCart } from "@/lib/cart";
import { bdt, summarize } from "@/lib/pricing";

const BUYER = ["Home", "Tea stall", "Tea shop / retailer", "Hotel", "Restaurant / café", "Other business"];
type Key = "name" | "phone" | "address" | "city" | "buyer";
type Errors = Partial<Record<Key, string>>;
type Placed = { id: string; name: string; summary: ReturnType<typeof summarize> };

export function CheckoutClient() {
  const { summary } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [buyer, setBuyer] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) ?? "").trim();
    const next: Errors = {};
    if (val("name").length < 2) next.name = "Please enter your full name.";
    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(val("phone").replace(/[\s-]/g, "")))
      next.phone = "Enter a Bangladeshi mobile number, like 01712 345678.";
    if (val("address").length < 8) next.address = "Add a street address so our rider can find you.";
    if (!val("city")) next.city = "Tell us the city or district.";
    if (!val("buyer")) next.buyer = "Choose who the tea is for.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    setBusy(true);
    // TODO: POST the order to your backend. This stub only simulates the request.
    await new Promise((r) => setTimeout(r, 800));
    const id = `CN-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setPlaced({ id, name: val("name").split(" ")[0], summary });
    cartActions.clear();
    setBusy(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        className="mx-auto max-w-xl py-10 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
          className="mx-auto grid size-24 place-items-center rounded-full bg-leaf-soft text-leaf"
        >
          <CheckCircle2 className="size-12" aria-hidden />
        </motion.span>
        <h1 className="mt-6 text-4xl sm:text-5xl">Thank you, {placed.name}.</h1>
        <p className="mt-3 text-lg text-brown-soft">
          Order <strong className="text-brown">{placed.id}</strong> is placed. Pay{" "}
          <strong className="text-brown">{bdt(placed.summary.total)}</strong> in cash when it arrives.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/shop" className="btn btn-lime">
            Keep shopping
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </motion.div>
    );
  }

  if (summary.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-brown-soft">Add a tea or two, then come back to check out.</p>
        <Link href="/shop" className="btn btn-lime mt-8">
          Browse the shop
        </Link>
      </div>
    );
  }

  const business = buyer !== "" && buyer !== "Home";

  return (
    <>
      <h1 className="text-5xl sm:text-6xl">Checkout</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
          <h2 className="font-sans text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-leaf sm:col-span-2">
            Delivery details
          </h2>
          <Field id="c-name" label="Full name" error={errors.name}>
            {(p) => <input {...p} name="name" autoComplete="name" className="field" />}
          </Field>
          <Field id="c-phone" label="Mobile number" error={errors.phone}>
            {(p) => (
              <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX XXXXXX" className="field" />
            )}
          </Field>
          <Field id="c-address" label="Street address" error={errors.address} className="sm:col-span-2">
            {(p) => <input {...p} name="address" autoComplete="street-address" className="field" />}
          </Field>
          <Field id="c-city" label="City / district" error={errors.city}>
            {(p) => <input {...p} name="city" autoComplete="address-level2" className="field" />}
          </Field>
          <Field id="c-buyer" label="This tea is for" error={errors.buyer}>
            {(p) => (
              <select {...p} name="buyer" value={buyer} onChange={(e) => setBuyer(e.target.value)} className="field">
                <option value="" disabled>
                  Select one
                </option>
                {BUYER.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            )}
          </Field>
          <AnimatePresence>
            {business && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden sm:col-span-2"
              >
                <Field
                  id="c-business"
                  label="Business name"
                  optional
                  hint="We'll print it on your invoice."
                  className="pb-1"
                >
                  {(p) => <input {...p} name="business" autoComplete="organization" className="field" />}
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
          <Field id="c-note" label="Delivery note" optional className="sm:col-span-2">
            {(p) => <textarea {...p} name="note" rows={2} className="field" />}
          </Field>

          <fieldset className="sm:col-span-2">
            <legend className="mb-3 font-sans text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-leaf">
              Payment
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-leaf bg-leaf-soft px-4 font-bold">
                <input type="radio" name="pay" defaultChecked className="size-4 accent-[#536d3b]" />
                Cash on delivery
              </label>
              {["bKash", "Nagad"].map((m) => (
                <label
                  key={m}
                  className="flex min-h-14 cursor-not-allowed items-center justify-between gap-3 rounded-2xl border-2 border-line px-4 font-bold opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="pay" disabled className="size-4" />
                    {m}
                  </span>
                  <span className="text-[0.75rem] font-semibold">Soon</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sm:col-span-2">
            <button type="submit" disabled={busy} className="btn btn-lime h-14 w-full gap-2 text-base">
              <Lock className="size-4" aria-hidden />
              {busy ? "Placing order…" : `Place order · ${bdt(summary.total)}`}
            </button>
          </div>
        </form>

        <aside aria-labelledby="sum-h" className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 id="sum-h" className="text-2xl">
            Order summary
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {summary.items.map((it) => (
              <li key={it.slug + it.variantId} className="flex gap-4 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream-2">
                  <Image
                    src={it.product.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    style={{ objectPosition: it.product.focus }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{it.product.name}</p>
                  <p className="text-[0.875rem] text-brown-soft">
                    {it.variant.label} × {it.qty}
                  </p>
                </div>
                <p className="font-bold tabular-nums">{bdt(it.total)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-4 text-[0.9375rem]">
            <div className="flex justify-between">
              <dt className="text-brown-soft">Subtotal ({summary.kg.toFixed(1)} kg)</dt>
              <dd className="font-semibold tabular-nums">{bdt(summary.subtotal)}</dd>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-leaf">
                <dt>Bulk saving ({summary.tier?.pct}%)</dt>
                <dd className="font-semibold tabular-nums">−{bdt(summary.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-brown-soft">Delivery</dt>
              <dd className="font-semibold tabular-nums">{summary.delivery === 0 ? "Free" : bdt(summary.delivery)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-serif text-xl">Total</dt>
              <dd className="font-bn text-3xl font-bold tabular-nums">{bdt(summary.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
