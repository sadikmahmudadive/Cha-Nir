"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Award, Flame, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeUp, stagger } from "@/lib/motion";
import { TEA_VARIETIES, type TeaVariety } from "./varieties";

interface HeroContentProps {
  activeVariety: TeaVariety;
  onSelectVariety: (variety: TeaVariety) => void;
}

/** Real HTML hero copy, variety selector and sensory brew telemetry. */
export function HeroContent({ activeVariety, onSelectVariety }: HeroContentProps) {
  return (
    <motion.div
      variants={stagger(0.08, 0.04)}
      initial="hidden"
      animate="show"
      className="relative z-10 flex flex-col items-start gap-5 py-6 lg:max-w-[36rem] lg:py-0"
    >
      {/* Eyebrow with dynamic variety terroir indicator */}
      <motion.div
        variants={fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-tea-900/15 bg-cream/90 px-3.5 py-1 text-xs font-semibold text-tea-800 shadow-xs backdrop-blur"
      >
        <span
          className="size-2 rounded-full transition-colors duration-500 animate-pulse"
          style={{ backgroundColor: activeVariety.accentColor }}
          aria-hidden
        />
        <span className="font-bold uppercase tracking-wider text-[11px] text-tea-900">
          Single-Origin Tasting Room
        </span>
        <span className="text-ink-mute" aria-hidden>·</span>
        <span className="truncate text-ink-soft">{activeVariety.estate}</span>
      </motion.div>

      {/* Hero Display Title */}
      <motion.h1 variants={fadeUp} id="hero-title" className="t-display text-balance text-tea-900">
        Every Cup
        <br />
        Tells a <em className="text-tea-600">Story.</em>
      </motion.h1>

      <motion.p variants={fadeUp} className="t-lead max-w-xl text-ink-soft text-pretty">
        Carefully sourced artisanal tea from the misty slopes of Bangladesh, thoughtfully crafted to bring ancient terroir and modern ritual to every pour.
      </motion.p>

      {/* Sensory Ritual Variety Selector (Interactive Tasting Tabs) */}
      <motion.div variants={fadeUp} className="w-full space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-tea-900">
            Select Harvest Profile
          </span>
          <span className="text-[11px] text-ink-mute">
            Live 3D liquid & aroma shift
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Tea varieties"
          className="flex flex-wrap gap-2 rounded-2xl border border-tea-900/10 bg-tea-900/5 p-1.5 backdrop-blur-xs"
        >
          {TEA_VARIETIES.map((variety) => {
            const isSelected = variety.id === activeVariety.id;
            return (
              <button
                key={variety.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectVariety(variety)}
                className={`relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "text-tea-950 shadow-xs"
                    : "text-ink-soft hover:text-tea-900 hover:bg-cream/50"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-variety-tab"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-white border border-tea-900/10 shadow-xs"
                  />
                )}
                <span
                  className="relative z-10 size-2 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: variety.accentColor }}
                  aria-hidden
                />
                <span className="relative z-10">{variety.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Live Brew Telemetry Dashboard (Temp, Steep, Cupping Score, Aroma) */}
      <motion.div
        variants={fadeUp}
        className="w-full rounded-2xl border border-tea-900/10 bg-white/70 p-3.5 shadow-soft backdrop-blur-md"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Water Temp */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tea-100 text-tea-800">
              <Flame className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                Water Temp
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeVariety.brewTemp}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="block text-xs font-bold text-tea-950"
                >
                  {activeVariety.brewTemp}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Steep Time */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tea-100 text-tea-800">
              <Timer className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                Infusion
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeVariety.steepTime}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="block text-xs font-bold text-tea-950"
                >
                  {activeVariety.steepTime}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Cupping Score */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tea-100 text-tea-800">
              <Award className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                Score
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeVariety.cuppingScore}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="block text-xs font-bold text-tea-950"
                >
                  {activeVariety.cuppingScore}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Sensory Profile Notes */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tea-100 text-tea-800">
              <Sparkles className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                Primary Note
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeVariety.tastingNotes[0]}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="block truncate text-xs font-bold text-tea-950"
                >
                  {activeVariety.tastingNotes[0]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div variants={fadeUp} className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
        <Button
          href={`/shop`}
          size="lg"
          iconRight={<ArrowRight className="size-5" aria-hidden />}
        >
          Taste {activeVariety.name}
        </Button>
        <Button href="/wholesale" size="lg" variant="secondary">
          B2B Wholesale Samples
        </Button>
      </motion.div>

      {/* Trust & Provenance proofs */}
      <motion.p variants={fadeUp} className="text-xs text-ink-mute">
        100% Organic • Hand-harvested • Airtight Nitrogen Tins • Direct from Srimangal & Panchagarh.
      </motion.p>
    </motion.div>
  );
}
