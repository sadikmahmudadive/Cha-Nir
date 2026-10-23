import Image from "next/image";
import { Reveal, SplitHeading } from "@/components/Reveal";

const PILLARS = [
  {
    en: "Pure",
    bn: "খাঁটি",
    text: "Tea and nothing else. What's written on the pack is what goes into your cup.",
  },
  {
    en: "Organic",
    bn: "জৈব",
    text: "Leaf from hill gardens, handled gently from the pluck to the pouch.",
  },
  {
    en: "Deshi",
    bn: "দেশি",
    text: "Grown, processed and packed in Bangladesh, supporting the gardens and the people who work them.",
  },
];

export function Pillars() {
  return (
    <section className="bg-cream-2 py-24 lg:py-32" aria-labelledby="pillars-h">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
            <Image
              src="/img/garden-house.webp"
              alt="A small house among terraced tea rows in morning mist"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 right-4 grid size-28 place-items-center rounded-full bg-cream p-3 shadow-xl sm:-right-6 sm:size-32">
            <Image src="/img/logo-mark.webp" alt="" width={400} height={396} className="size-full" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Why Cha Nir</p>
          </Reveal>
          <SplitHeading
            text="A tea house that never forgot the garden."
            className="mt-3 text-4xl sm:text-5xl"
          />
          <h2 id="pillars-h" className="sr-only">
            Why Cha Nir
          </h2>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {PILLARS.map((p, i) => (
              <li key={p.en}>
                <Reveal delay={i * 0.1} className="flex gap-5 py-6">
                  <div className="w-28 shrink-0">
                    <p className="font-serif text-3xl font-semibold text-leaf">{p.en}</p>
                    <p className="font-bn text-lg text-brown-soft">{p.bn}</p>
                  </div>
                  <p className="text-lg text-brown-soft">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
