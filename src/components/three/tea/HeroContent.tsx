"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeUp, stagger } from "@/lib/motion";

/** Real HTML hero copy and CTAs (never rendered into the canvas). */
export function HeroContent() {
  return (
    <motion.div
      variants={stagger(0.09, 0.05)}
      initial="hidden"
      animate="show"
      className="relative z-10 flex flex-col items-start gap-6 py-6 lg:max-w-[34rem] lg:py-0"
    >
      <motion.p variants={fadeUp} className="t-eyebrow text-lime-300">
        Authentic Bangladeshi tea
      </motion.p>
      <motion.h1 variants={fadeUp} id="hero-title" className="t-display text-balance text-cream">
        Every Cup
        <br />
        Tells a <em className="text-lime-300">Story.</em>
      </motion.h1>
      <motion.p variants={fadeUp} className="t-lead max-w-xl text-cream/75 text-pretty">
        Carefully sourced tea, thoughtfully processed, and packed to bring the richness of Bangladeshi tea culture to every cup.
      </motion.p>
      <motion.div variants={fadeUp} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button href="/shop" size="lg" variant="accent" iconRight={<ArrowRight className="size-5" aria-hidden />}>
          Shop Tea
        </Button>
        <Button href="/wholesale" size="lg" variant="outlineLight">
          Explore Wholesale
        </Button>
      </motion.div>
      <motion.p variants={fadeUp} className="text-sm text-cream/55 max-lg:hidden">
        Pure • Organic • Deshi · for homes, tea stalls, shops, hotels and restaurants.
      </motion.p>
    </motion.div>
  );
}
