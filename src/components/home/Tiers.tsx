"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";
import { Reveal, SplitHeading } from "@/components/Reveal";
import { TIERS } from "@/lib/pricing";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const c = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = Math.round(v) + suffix;
      },
    });
    return () => c.stop();
  }, [inView, to, suffix]);
  return (
    <span ref={ref} className="tabular-nums">
      {to}
      {suffix}
    </span>
  );
}

export function Tiers() {
  return (
    <section className="container-x py-24 lg:py-32" aria-labelledby="tiers-h">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Reveal>
            <p className="eyebrow">Wholesale pricing</p>
          </Reveal>
          <SplitHeading
            text="Buy more tea, pay less per cup."
            className="mt-3 text-4xl sm:text-5xl lg:text-6xl"
          />
          <h2 id="tiers-h" className="sr-only">
            Bulk discounts
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg text-brown-soft">
              Mix and match any of our teas. Discounts apply automatically in your cart by total
              weight, with no account or minimum for retail orders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wholesale#quote" className="btn btn-lime">
                Request a custom quote
              </Link>
              <Link href="/wholesale" className="btn btn-ghost">
                How wholesale works
              </Link>
            </div>
          </Reveal>
        </div>

        <ol className="grid gap-4 sm:grid-cols-3">
          {TIERS.map((t, i) => (
            <motion.li
              key={t.kg}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className={`flex flex-col rounded-3xl p-6 ${
                i === 2 ? "bg-leaf text-cream" : "border border-line bg-[#fffdf6]"
              }`}
            >
              <p className={`eyebrow ${i === 2 ? "!text-lime" : ""}`}>{t.label}</p>
              <p className="mt-6 font-serif text-6xl font-semibold leading-none">
                <Counter to={t.pct} suffix="%" />
              </p>
              <p className={`mt-1 text-sm font-semibold ${i === 2 ? "text-cream/85" : "text-brown-soft"}`}>
                off the basket
              </p>
              <p className="mt-6 border-t border-current/15 pt-4 text-[0.9375rem] font-semibold">
                From {t.kg} kg
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
