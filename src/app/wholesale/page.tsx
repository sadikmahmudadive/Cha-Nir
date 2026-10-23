import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClipboardList, PackageOpen, Truck } from "lucide-react";
import { Reveal, SplitHeading } from "@/components/Reveal";
import { TIERS } from "@/lib/pricing";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Bulk Bangladeshi tea for tea stalls, shops, hotels and restaurants. Tiered discounts from 10 kg, sample packs and invoices.",
};

const STEPS = [
  { icon: ClipboardList, title: "Tell us what you pour", text: "Share your business type and monthly volume. Two minutes, no account." },
  { icon: PackageOpen, title: "Taste a sample", text: "We send a 100 g sample of the tea we'd recommend for your counter." },
  { icon: Truck, title: "Reorder on repeat", text: "Order sacks online or by phone. We deliver and invoice every time." },
];

export default function WholesalePage() {
  return (
    <>
      <section className="container-x grid items-center gap-12 pb-20 pt-10 lg:grid-cols-2 lg:pt-16">
        <div>
          <p className="eyebrow">Wholesale</p>
          <SplitHeading
            as="h1"
            text="Tea for the counters that never close."
            className="mt-3 text-5xl sm:text-6xl"
          />
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-lg text-lg text-brown-soft">
              We import fresh leaf from Bangladesh’s best gardens, process it and pack it by the
              kilo. Steady supply, steady taste and a price that keeps your margin on every cup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#quote" className="btn btn-lime">
                Request a quote
              </Link>
              <Link href="/shop?for=stall" className="btn btn-ghost">
                Browse sacks
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal y={20}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
            <Image
              src="/img/factory-withering.webp"
              alt="Troughs of freshly plucked leaf withering in our tea factory"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-cream-2 py-20" aria-labelledby="tiers-t">
        <div className="container-x">
          <h2 id="tiers-t" className="text-3xl sm:text-4xl">
            Bulk pricing, applied automatically
          </h2>
          <p className="mt-3 max-w-xl text-brown-soft">
            Discounts are based on the total weight in your basket. Mix any teas to reach a tier.
          </p>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-[#fffdf6]">
            <table className="w-full min-w-[28rem] text-left">
              <caption className="sr-only">Bulk discount tiers</caption>
              <thead>
                <tr className="border-b border-line text-[0.8125rem] uppercase tracking-wider text-brown-soft">
                  <th scope="col" className="px-6 py-4">Tier</th>
                  <th scope="col" className="px-6 py-4">Basket weight</th>
                  <th scope="col" className="px-6 py-4">Discount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <th scope="row" className="px-6 py-4 font-semibold">Retail</th>
                  <td className="px-6 py-4">Under {TIERS[0].kg} kg</td>
                  <td className="px-6 py-4 text-brown-soft">Standard price</td>
                </tr>
                {TIERS.map((t, i) => (
                  <tr key={t.kg} className={i < TIERS.length - 1 ? "border-b border-line" : ""}>
                    <th scope="row" className="px-6 py-4 font-semibold">{t.label}</th>
                    <td className="px-6 py-4">{t.kg} kg and above</td>
                    <td className="px-6 py-4 font-bold text-leaf">{t.pct}% off</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-x py-20" aria-labelledby="how-t">
        <h2 id="how-t" className="text-3xl sm:text-4xl">
          How wholesale works
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 0.1} className="card h-full p-7">
                <span className="grid size-12 place-items-center rounded-full bg-leaf-soft text-leaf">
                  <Icon className="size-6" aria-hidden />
                </span>
                <p className="mt-5 font-serif text-xl font-semibold">
                  <span className="text-leaf">{i + 1}.</span> {title}
                </p>
                <p className="mt-2 text-brown-soft">{text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section id="quote" className="container-x scroll-mt-24 pb-8" aria-labelledby="quote-t">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Get a quote</p>
            <h2 id="quote-t" className="mt-3 text-4xl sm:text-5xl">
              Tell us about your counter.
            </h2>
            <p className="mt-4 max-w-sm text-lg text-brown-soft">
              We’ll come back with a recommended tea, a price per kilo and a sample.
            </p>
          </div>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
