"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Banknote, Check, CreditCard, PackageCheck, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cartActions, useCart } from "@/context/cart-store";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, RadioCard, Select, Textarea } from "@/components/ui/Field";
import { Alert, EmptyState } from "@/components/ui/misc";
import { DiscountForm, SummaryRows } from "@/components/cart/CartParts";
import { deliveryConfig, districts } from "@/data/demo/content";
import { cn } from "@/lib/cn";
import { formatBDT, isBdPhone, isEmail } from "@/lib/format";
import { ease } from "@/lib/motion";
import { site } from "@/lib/site";

type Method = "cod" | "gateway";
interface Form {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  area: string;
  notes: string;
  payment: Method;
  agree: boolean;
}
type Errors = Partial<Record<keyof Form, string>>;

const initial: Form = { name: "", phone: "", email: "", address: "", district: "", area: "", notes: "", payment: "cod", agree: false };
const steps = ["Details", "Payment", "Review"] as const;

function validate(step: number, f: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (f.name.trim().length < 2) e.name = "Enter your full name.";
    if (!isBdPhone(f.phone)) e.phone = "Enter a valid Bangladesh mobile number, like 01712 345678.";
    if (f.email && !isEmail(f.email)) e.email = "Enter a valid email address, like name@example.com.";
    if (f.address.trim().length < 8) e.address = "Enter your full delivery address (house, road, area).";
    if (!f.district) e.district = "Choose your district so we can calculate delivery.";
  }
  if (step === 1 && f.payment === "gateway" && !isEmail(f.email)) {
    e.email = "An email address is required for online payment receipts.";
  }
  if (step === 2 && !f.agree) e.agree = "Please accept the terms to place your order.";
  return e;
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Checkout progress">
      {steps.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={current ? "step" : undefined}>
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                done ? "bg-tea-600 text-white" : current ? "bg-lime-500 text-tea-950" : "bg-cream-deep text-ink-mute",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={cn("text-sm font-semibold", current ? "text-ink" : "text-ink-mute", !current && "max-sm:sr-only")}>{s}</span>
            {i < steps.length - 1 && <span aria-hidden className={cn("h-px flex-1", done ? "bg-tea-600" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}

function OrderSummary({ district }: { district: string }) {
  const cart = useCart(district);
  return (
    <div className="rounded-card border border-line bg-paper p-5 sm:p-6">
      <h2 className="font-display text-2xl">Order summary</h2>
      <ul className="mt-4 divide-y divide-line-soft">
        {cart.lines.map((l) => (
          <li key={l.variant.id} className="flex gap-3 py-3">
            <div className="relative">
              <Photo image={l.product.image} ratio="1/1" className="w-16" sizes="64px" />
              <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-tea-800 text-xs font-bold text-white">{l.item.qty}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{l.product.name}</p>
              <p className="text-sm text-ink-mute">{l.variant.label}</p>
            </div>
            <p className="font-semibold tabular-nums">{formatBDT(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <DiscountForm className="mt-4" />
      <div className="mt-4 border-t border-line pt-4">
        <SummaryRows {...cart} deliveryNote="Choose district" />
        {deliveryConfig.isDemo && cart.deliveryFee !== null && (
          <p className="mt-3 text-xs text-ink-mute">Demo delivery rate. Real rates are set in Admin → Delivery.</p>
        )}
      </div>
    </div>
  );
}

export function Checkout() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "placing" | "failed" | "success">("idle");
  const [simulateFail, setSimulateFail] = useState(false);
  const [done, setDone] = useState<null | { id: string; total: number; payment: Method; name: string; district: string; lines: number }>(null);
  const cart = useCart(form.district);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step, status]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const next = () => {
    const e = validate(step, form);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setStep((s) => s + 1);
  };

  const place = async () => {
    const e = validate(2, form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus("placing");
    await new Promise((r) => setTimeout(r, 1400));
    if (form.payment === "gateway" && simulateFail) {
      setStatus("failed");
      return;
    }
    // PROTOTYPE: no order is created or charged. Backend integration point:
    // POST /api/orders (server action) → validate cart & prices server-side →
    // write Firestore order → create payment session with the local gateway.
    const id = `CN-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    setDone({ id, total: cart.total, payment: form.payment, name: form.name, district: form.district, lines: cart.count });
    cartActions.clear();
    setStatus("success");
  };

  /* ── success ─────────────────────────────────────── */
  if (status === "success" && done) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease }} className="mx-auto grid size-20 place-items-center rounded-full bg-lime-500 text-tea-950">
          <PackageCheck className="size-10" aria-hidden />
        </motion.div>
        <h1 ref={heading} tabIndex={-1} className="t-h1 mt-6 text-tea-900 outline-none">Thank you, {done.name.split(" ")[0]}.</h1>
        <p className="t-lead mt-3 text-ink-soft">Your order <strong className="text-ink">{done.id}</strong> is confirmed (prototype).</p>
        <div className="mt-8 space-y-4 text-left">
          <Alert tone="info" title="This is a design prototype">
            No order was placed, no payment was taken and no confirmation was sent. In production this screen appears after the server has saved the order{done.payment === "gateway" ? " and the payment gateway has confirmed payment" : ""}.
          </Alert>
          <dl className="grid gap-3 rounded-card border border-line bg-paper p-5 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-mute">Order total</dt><dd className="text-lg font-bold">{formatBDT(done.total)}</dd></div>
            <div><dt className="text-ink-mute">Payment</dt><dd className="font-semibold">{done.payment === "cod" ? "Cash on Delivery" : "Online payment"}</dd></div>
            <div><dt className="text-ink-mute">Delivering to</dt><dd className="font-semibold">{done.district}</dd></div>
            <div><dt className="text-ink-mute">Items</dt><dd className="font-semibold">{done.lines}</dd></div>
          </dl>
          <p className="text-sm text-ink-soft">Delivery timing is confirmed by Cha Nir once the order is processed.</p>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/account/orders" variant="secondary">View my orders</Button>
          <Button href="/shop">Continue shopping</Button>
        </div>
      </div>
    );
  }

  /* ── empty ───────────────────────────────────────── */
  if (cart.lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-8" aria-hidden />}
        title="Your cart is empty"
        body="Add something to your cart before checking out."
        action={{ label: "Shop tea", href: "/shop" }}
      />
    );
  }

  const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.28, ease } };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_26rem] xl:grid-cols-[1fr_28rem]">
      <div>
        <Stepper step={step} />

        {/* mobile summary */}
        <details className="group mt-6 rounded-card border border-line bg-paper lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 font-semibold">
            <span className="flex items-center gap-2"><ShoppingBag className="size-5 text-tea-600" aria-hidden /> Order summary ({cart.count})</span>
            <span className="tabular-nums">{formatBDT(cart.total)}</span>
          </summary>
          <div className="border-t border-line-soft p-2"><OrderSummary district={form.district} /></div>
        </details>

        <form
          noValidate
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) next();
            else void place();
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <motion.fieldset key="s0" {...slide} className="space-y-5">
                <legend className="mb-2"><h1 ref={heading} tabIndex={-1} className="t-h2 text-tea-900 outline-none">Your details</h1></legend>
                <Input label="Full name" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Mobile number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX XXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} hint="We call to confirm your order." />
                  <Input label="Email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} hint="For order updates and receipts." />
                </div>
                <Textarea label="Delivery address" required autoComplete="street-address" rows={3} placeholder="House, road, area" value={form.address} onChange={(e) => set("address", e.target.value)} error={errors.address} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select label="District" required autoComplete="address-level1" value={form.district} onChange={(e) => set("district", e.target.value)} error={errors.district}>
                    <option value="">Select district</option>
                    {districts.map((d) => <option key={d}>{d}</option>)}
                  </Select>
                  <Input label="Area / thana" autoComplete="address-level2" value={form.area} onChange={(e) => set("area", e.target.value)} />
                </div>
                <Textarea label="Order notes" rows={2} placeholder="Anything we should know about delivery?" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </motion.fieldset>
            )}

            {step === 1 && (
              <motion.fieldset key="s1" {...slide} className="space-y-4">
                <legend className="mb-2"><h1 ref={heading} tabIndex={-1} className="t-h2 text-tea-900 outline-none">Payment</h1></legend>
                <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                  {site.payments.cod.enabled && (
                    <RadioCard name="pay" value="cod" checked={form.payment === "cod"} onChange={() => set("payment", "cod")} title={site.payments.cod.label} description={site.payments.cod.note} right={<Banknote className="size-6 text-tea-600" aria-hidden />} />
                  )}
                  {site.payments.gateway.enabled && (
                    <RadioCard name="pay" value="gateway" checked={form.payment === "gateway"} onChange={() => set("payment", "gateway")} title={site.payments.gateway.label} description={site.payments.gateway.note} right={<CreditCard className="size-6 text-tea-600" aria-hidden />} />
                  )}
                </div>
                {form.payment === "gateway" && (
                  <>
                    <Input label="Email for receipt" required type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                    <Alert tone="info" title="Online payment (prototype)">
                      In production you are redirected to the secure gateway page. Cha Nir never sees or stores card or wallet details.
                    </Alert>
                  </>
                )}
              </motion.fieldset>
            )}

            {step === 2 && (
              <motion.div key="s2" {...slide} className="space-y-6">
                <h1 ref={heading} tabIndex={-1} className="t-h2 text-tea-900 outline-none">Review your order</h1>
                {status === "failed" && (
                  <Alert tone="danger" live title="Payment didn't go through">
                    Your payment was not completed and you have not been charged. Try again, or switch to Cash on Delivery.
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="danger" onClick={() => { setStatus("idle"); void place(); }}>Try again</Button>
                      <Button size="sm" variant="secondary" onClick={() => { set("payment", "cod"); setStatus("idle"); }}>Pay on delivery instead</Button>
                    </div>
                  </Alert>
                )}
                <dl className="divide-y divide-line-soft rounded-card border border-line bg-paper">
                  {[
                    { label: "Contact", value: `${form.name} · ${form.phone}${form.email ? ` · ${form.email}` : ""}`, step: 0 },
                    { label: "Deliver to", value: `${form.address}${form.area ? `, ${form.area}` : ""}, ${form.district}`, step: 0 },
                    { label: "Payment", value: form.payment === "cod" ? "Cash on Delivery" : "Online payment", step: 1 },
                    ...(form.notes ? [{ label: "Notes", value: form.notes, step: 0 }] : []),
                  ].map((r) => (
                    <div key={r.label} className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0"><dt className="text-sm text-ink-mute">{r.label}</dt><dd className="break-words font-medium">{r.value}</dd></div>
                      <button type="button" onClick={() => setStep(r.step)} className="min-h-10 shrink-0 cursor-pointer px-2 text-sm font-semibold text-tea-700 underline underline-offset-4">Edit</button>
                    </div>
                  ))}
                </dl>
                <Checkbox
                  checked={form.agree}
                  onChange={(e) => set("agree", e.target.checked)}
                  aria-invalid={errors.agree ? true : undefined}
                  label={<>I agree to the <Link href="/policies/terms" className="underline">terms &amp; conditions</Link> and <Link href="/policies/returns" className="underline">returns policy</Link>.</>}
                />
                {errors.agree && <p role="alert" className="-mt-4 text-sm font-medium text-danger">{errors.agree}</p>}

                {form.payment === "gateway" && (
                  <div className="rounded-md border border-dashed border-tea-400 bg-tea-50 p-4">
                    <p className="t-eyebrow mb-2 text-tea-600">Prototype control</p>
                    <Checkbox checked={simulateFail} onChange={(e) => setSimulateFail(e.target.checked)} label="Simulate a failed payment to preview the error state" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} iconLeft={<ArrowLeft className="size-4" aria-hidden />} disabled={status === "placing"}>Back</Button>
            ) : (
              <Button href="/cart" variant="ghost" iconLeft={<ArrowLeft className="size-4" aria-hidden />}>Back to cart</Button>
            )}
            <Button type="submit" size="lg" loading={status === "placing"} disabled={status === "placing"}>
              {step < 2 ? "Continue" : status === "placing" ? "Placing order…" : `Place order · ${formatBDT(cart.total)}`}
            </Button>
          </div>
          {step === 2 && <p className="mt-3 text-xs text-ink-mute sm:text-right">Prototype: no real order or payment is created.</p>}
        </form>
      </div>

      <aside className="hidden lg:block" aria-label="Order summary">
        <div className="sticky top-28"><OrderSummary district={form.district} /></div>
      </aside>
    </div>
  );
}
