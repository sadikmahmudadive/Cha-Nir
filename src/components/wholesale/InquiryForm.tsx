"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/misc";
import { categories, products } from "@/data/demo/catalog";
import { districts } from "@/data/demo/content";
import { isBdPhone, isEmail } from "@/lib/format";
import { ease } from "@/lib/motion";

const businessTypes = ["Tea stall", "Tea shop", "Hotel", "Restaurant / café", "Retailer / reseller", "Office / institution", "Other"];

interface F {
  business: string;
  contact: string;
  phone: string;
  email: string;
  type: string;
  location: string;
  products: string[];
  qty: string;
  unit: string;
  message: string;
}
const blank: F = { business: "", contact: "", phone: "", email: "", type: "", location: "", products: [], qty: "", unit: "kg per month", message: "" };

export function InquiryForm() {
  const [f, setF] = useState<F>(blank);
  const [err, setErr] = useState<Partial<Record<keyof F, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");

  const set = <K extends keyof F>(k: K, v: F[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (err[k]) setErr((e) => ({ ...e, [k]: undefined }));
  };

  const options = [...categories.filter((c) => c.slug !== "bulk-tea").map((c) => c.name), ...products.filter((p) => p.isBulk).map((p) => p.name)];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: typeof err = {};
    if (f.business.trim().length < 2) x.business = "Enter your business name.";
    if (f.contact.trim().length < 2) x.contact = "Enter a contact person's name.";
    if (!isBdPhone(f.phone)) x.phone = "Enter a valid Bangladesh mobile number, like 01712 345678.";
    if (!isEmail(f.email)) x.email = "Enter a valid email address, like name@example.com.";
    if (!f.type) x.type = "Choose your business type.";
    if (f.location.trim().length < 2) x.location = "Tell us where your business is located.";
    if (!f.qty || Number(f.qty) <= 0) x.qty = "Enter an estimated quantity (a rough number is fine).";
    setErr(x);
    if (Object.keys(x).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("#inquiry [aria-invalid='true']")?.focus());
      return;
    }
    setStatus("sending");
    // PROTOTYPE: backend integration point.
    // POST /api/wholesale-inquiries → validate (zod) → write Firestore `wholesaleInquiries` → notify the team.
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("done");
  };

  return (
    <div id="inquiry" className="scroll-mt-28 rounded-xl border border-line bg-paper p-6 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="py-6 text-center" role="status">
            <CheckCircle2 className="mx-auto size-14 text-tea-600" aria-hidden />
            <h3 className="t-h2 mt-4 text-tea-900">Inquiry received (prototype)</h3>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">
              Thanks, {f.contact.split(" ")[0]}. In production the Cha Nir team would review your request and follow up on {f.phone} or {f.email}. Nothing was sent from this prototype.
            </p>
            <Button variant="secondary" className="mt-6" onClick={() => { setF(blank); setStatus("idle"); }}>Send another inquiry</Button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={submit} initial={false} className="space-y-6" aria-labelledby="inq-title">
            <div>
              <h3 id="inq-title" className="t-h2 text-tea-900">Wholesale inquiry</h3>
              <p className="mt-2 text-ink-soft">Tell us about your business and what you need. We&rsquo;ll respond with pricing and minimum order details.</p>
            </div>
            {status === "error" && <Alert tone="danger" live title="We couldn't send your inquiry">Please check your connection and try again. Your answers are still here.</Alert>}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Business name" required autoComplete="organization" value={f.business} onChange={(e) => set("business", e.target.value)} error={err.business} />
              <Input label="Contact person" required autoComplete="name" value={f.contact} onChange={(e) => set("contact", e.target.value)} error={err.contact} />
              <Input label="Phone number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX XXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} error={err.phone} />
              <Input label="Email" required type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} error={err.email} />
              <Select label="Business type" required value={f.type} onChange={(e) => set("type", e.target.value)} error={err.type}>
                <option value="">Select type</option>
                {businessTypes.map((t) => <option key={t}>{t}</option>)}
              </Select>
              <Input label="Business location" required list="districts" autoComplete="address-level1" placeholder="District or area" value={f.location} onChange={(e) => set("location", e.target.value)} error={err.location} />
              <datalist id="districts">{districts.map((d) => <option key={d} value={d} />)}</datalist>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Interested products <span className="font-normal text-ink-mute">(optional)</span></legend>
              <div className="grid gap-x-4 sm:grid-cols-2">
                {options.map((o) => (
                  <Checkbox key={o} label={o} checked={f.products.includes(o)} onChange={() => set("products", f.products.includes(o) ? f.products.filter((x) => x !== o) : [...f.products, o])} />
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
              <Input label="Estimated order quantity" required inputMode="numeric" placeholder="e.g. 50" value={f.qty} onChange={(e) => set("qty", e.target.value.replace(/[^\d.]/g, ""))} error={err.qty} />
              <Select label="Unit" required value={f.unit} onChange={(e) => set("unit", e.target.value)}>
                <option>kg per month</option>
                <option>kg per order</option>
                <option>packs per month</option>
              </Select>
            </div>
            <Textarea label="Message" placeholder="Anything else we should know? Delivery location, current tea, how often you order…" value={f.message} onChange={(e) => set("message", e.target.value)} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-mute">We use these details only to respond to your inquiry.</p>
              <Button type="submit" size="lg" loading={status === "sending"} iconRight={<Send className="size-4" aria-hidden />}>
                {status === "sending" ? "Sending…" : "Send inquiry"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
