"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal, SplitHeading } from "@/components/Reveal";

// Draft answers. Confirm each with the real policy before launch.
const FAQ = [
  {
    q: "Is there a minimum order?",
    a: "No minimum for retail orders. Bulk discounts begin at 10 kg of tea in one basket, and you can mix any teas to reach it.",
  },
  {
    q: "How fast do you deliver?",
    a: "We aim for 1–2 days inside Dhaka and 2–4 days elsewhere in Bangladesh. Delivery is free over ৳2,500, otherwise ৳80.",
  },
  {
    q: "How can I pay?",
    a: "Cash on delivery today, with bKash and Nagad coming soon. Businesses can ask for invoice-based terms after a first order.",
  },
  {
    q: "Can I try a sample before buying a sack?",
    a: "Yes. Ask for a 100 g sample in your wholesale quote request and we'll send it with your reply.",
  },
  {
    q: "Do you offer invoices for hotels and restaurants?",
    a: "Yes. Tell us your business name at checkout or in the quote form and we'll issue a proper invoice with every delivery.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="container-x scroll-mt-24 py-24 lg:py-32" aria-labelledby="faq-h">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Reveal>
            <p className="eyebrow">Questions</p>
          </Reveal>
          <SplitHeading text="Good to know before you order." className="mt-3 text-4xl sm:text-5xl" />
          <h2 id="faq-h" className="sr-only">
            Frequently asked questions
          </h2>
        </div>
        <ul className="divide-y divide-line border-y border-line">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q}>
                <h3 className="font-sans text-lg font-bold tracking-normal">
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    {f.q}
                    <motion.span
                      animate={{ rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf"
                    >
                      <Plus className="size-5" aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-${i}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-6 text-brown-soft">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
