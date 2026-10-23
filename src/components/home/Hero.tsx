"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, PackageCheck, Truck } from "lucide-react";
import { SplitHeading } from "@/components/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const TRUST = [
  { icon: Leaf, text: "Hand-picked garden leaf" },
  { icon: PackageCheck, text: "Packed in-house, 50 g to 25 kg" },
  { icon: Truck, text: "Free delivery over ৳2,500" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-26%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-6 lg:pb-24 lg:pt-10">
      {/* soft garden wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[44rem] rounded-full bg-lime/15 blur-3xl"
      />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <motion.div style={{ y: textY }} className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-leaf/25 bg-[#fffdf6] px-4 py-2 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-leaf"
          >
            <span className="size-2 rounded-full bg-lime" aria-hidden />
            Pure • Organic • Deshi
            <span className="hidden font-bn font-semibold normal-case tracking-normal text-brown-soft sm:inline">
              খাঁটি • জৈব • দেশি
            </span>
          </motion.p>

          <SplitHeading
            as="h1"
            delay={0.15}
            text="Real Bangladeshi tea, packed for every cup."
            accent={["Bangladeshi"]}
            className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            className="mt-6 max-w-xl text-lg text-brown-soft"
          >
            We source fresh leaf from the best tea gardens of Bangladesh, process it ourselves and
            pack it for tea stalls, shops, hotels, restaurants and homes. Wholesale or retail,
            the same honest tea.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/shop" className="btn btn-lime group">
              Shop tea
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/wholesale" className="btn btn-ghost">
              Wholesale pricing
            </Link>
          </motion.div>

          <motion.ul
            initial="hide"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1.05 } } }}
            className="mt-10 grid gap-3 sm:grid-cols-3"
          >
            {TRUST.map(({ icon: Icon, text }) => (
              <motion.li
                key={text}
                variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-3 text-[0.9375rem] font-semibold"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf">
                  <Icon className="size-5" aria-hidden />
                </span>
                {text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-leaf-soft shadow-[0_40px_80px_-40px_rgb(47_63_33/0.6)]"
          >
            <motion.div style={{ y: imgY }} className="absolute inset-x-0 -top-[8%] h-[116%]">
              <Image
                src="/img/picker.webp"
                alt="A tea picker in a conical hat plucking young leaf on a sunlit Bangladeshi hillside"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
                style={{ objectPosition: "58% 50%" }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: cardY }}
            className="absolute -bottom-6 -left-3 w-[46%] sm:-left-8"
          >
            <motion.div
              initial={{ opacity: 0, x: -24, rotate: -6 }}
              animate={{ opacity: 1, x: 0, rotate: -3 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
              className="overflow-hidden rounded-3xl border-4 border-cream bg-cream shadow-xl"
            >
              <div className="relative aspect-square">
                <Image
                  src="/img/cup-steam.webp"
                  alt="A steaming white cup of Cha Nir tea"
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  className="object-cover"
                />
              </div>
              <p className="px-3 py-2 text-center text-[0.8125rem] font-bold text-leaf">
                Brewed fresh, every cup
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -40 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: EASE }}
            className="absolute -right-2 top-[12%] grid size-28 place-items-center rounded-full bg-leaf text-cream shadow-xl sm:-right-6 sm:size-32"
          >
            <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0" aria-hidden>
              <defs>
                <path id="ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
              </defs>
              <text fill="currentColor" fontSize="11.5" fontWeight="700" letterSpacing="3.2">
                <textPath href="#ring">PURE • ORGANIC • DESHI • PURE • ORGANIC •</textPath>
              </text>
            </svg>
            <Image
              src="/img/logo-mark.webp"
              alt=""
              width={400}
              height={396}
              className="size-12 rounded-full bg-cream p-0.5 sm:size-14"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
