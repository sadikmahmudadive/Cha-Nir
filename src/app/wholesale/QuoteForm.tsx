"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Field } from "@/components/Field";
import { PRODUCTS } from "@/lib/products";

const TYPES = ["Tea stall", "Tea shop / retailer", "Hotel", "Restaurant / café", "Office / institution", "Other"];
const VOLUMES = ["Under 25 kg", "25–100 kg", "100–500 kg", "500 kg+"];

type Errors = Partial<Record<"name" | "phone" | "type" | "volume", string>>;

export function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) ?? "").trim();
    const next: Errors = {};
    if (val("name").length < 2) next.name = "Please tell us your name.";
    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(val("phone").replace(/[\s-]/g, "")))
      next.phone = "Enter a Bangladeshi mobile number, like 01712 345678.";
    if (!val("type")) next.type = "Choose the closest match.";
    if (!val("volume")) next.volume = "Give us a rough monthly volume.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`q-${first}`)?.focus();
      return;
    }
    setBusy(true);
    // TODO: send to your backend / CRM / WhatsApp. This stub only simulates the request.
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setSent(val("name").split(" ")[0]);
  }

  return (
    <div className="card relative overflow-hidden p-6 sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
              className="grid size-20 place-items-center rounded-full bg-leaf-soft text-leaf"
            >
              <CheckCircle2 className="size-10" aria-hidden />
            </motion.span>
            <h3 className="mt-6 text-3xl">Thank you, {sent}.</h3>
            <p className="mt-3 max-w-md text-brown-soft">
              Your request is in. We’ll reply with prices and a sample offer for your business.
            </p>
            <button type="button" onClick={() => setSent(null)} className="btn btn-ghost mt-8">
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            exit={{ opacity: 0 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <Field id="q-name" label="Your name" error={errors.name}>
              {(p) => <input {...p} name="name" autoComplete="name" className="field" />}
            </Field>
            <Field id="q-phone" label="Mobile / WhatsApp" error={errors.phone}>
              {(p) => (
                <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX XXXXXX" className="field" />
              )}
            </Field>
            <Field id="q-business" label="Business name" optional>
              {(p) => <input {...p} name="business" autoComplete="organization" className="field" />}
            </Field>
            <Field id="q-type" label="Type of business" error={errors.type}>
              {(p) => (
                <select {...p} name="type" defaultValue="" className="field">
                  <option value="" disabled>
                    Select one
                  </option>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field id="q-volume" label="Tea you use each month" error={errors.volume} className="sm:col-span-2">
              {(p) => (
                <select {...p} name="volume" defaultValue="" className="field">
                  <option value="" disabled>
                    Select a range
                  </option>
                  {VOLUMES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              )}
            </Field>

            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-[0.9375rem] font-bold">
                Teas you’re interested in <span className="font-medium text-brown-soft">(optional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map((p) => (
                  <label
                    key={p.slug}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-cream px-4 text-[0.9375rem] font-semibold has-[:checked]:border-leaf has-[:checked]:bg-leaf-soft has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-lime"
                  >
                    <input type="checkbox" name="teas" value={p.slug} className="size-4 accent-[#536d3b]" />
                    {p.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="q-note" label="Anything else?" optional className="sm:col-span-2">
              {(p) => (
                <textarea {...p} name="note" rows={3} placeholder="Delivery area, sample request, preferred pack size…" className="field" />
              )}
            </Field>

            <div className="sm:col-span-2">
              <button type="submit" disabled={busy} className="btn btn-lime w-full sm:w-auto">
                {busy ? "Sending…" : "Request my quote"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
