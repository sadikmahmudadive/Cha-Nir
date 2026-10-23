"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { Mountain, Sparkles, Sprout } from "lucide-react";
import type { TeaVariety } from "./varieties";

interface HeroSensoryBadgesProps {
  variety: TeaVariety;
  pointerEnabled: boolean;
}

export function HeroSensoryBadges({ variety, pointerEnabled }: HeroSensoryBadgesProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 130, mass: 0.6 };
  const smoothX = useSpring(mx, springConfig);
  const smoothY = useSpring(my, springConfig);

  const b1X = useTransform(smoothX, (v) => v * 20);
  const b1Y = useTransform(smoothY, (v) => v * 15);

  const b2X = useTransform(smoothX, (v) => v * -16);
  const b2Y = useTransform(smoothY, (v) => v * -18);

  const b3X = useTransform(smoothX, (v) => v * 12);
  const b3Y = useTransform(smoothY, (v) => v * -12);

  useEffect(() => {
    if (!pointerEnabled) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(nx);
      my.set(ny);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerEnabled, mx, my]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden select-none max-lg:hidden">
      {/* Badge 1: Terroir & Elevation (Top right of 3D stage) */}
      <motion.div
        style={{ x: b1X, y: b1Y }}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="pointer-events-auto absolute right-10 top-16 flex items-center gap-3 rounded-2xl border border-tea-900/10 bg-cream/80 px-4 py-2.5 shadow-soft backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-cream/95 xl:right-20"
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-500"
          style={{ backgroundColor: `${variety.accentColor}20`, color: variety.accentColor }}
        >
          <Mountain className="size-4.5" aria-hidden />
        </div>
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full animate-pulse"
              style={{ backgroundColor: variety.accentColor }}
              aria-hidden
            />
            <span className="text-xs font-bold uppercase tracking-wider text-tea-900">
              {variety.elevation}
            </span>
          </div>
          <p className="truncate text-xs font-medium text-ink-soft">
            {variety.estate}
          </p>
        </div>
      </motion.div>

      {/* Badge 2: Plucking & Harvest Standard (Bottom right of 3D stage) */}
      <motion.div
        style={{ x: b2X, y: b2Y }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="pointer-events-auto absolute bottom-24 right-8 flex items-center gap-3 rounded-2xl border border-tea-900/10 bg-cream/85 px-4 py-2.5 shadow-soft backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-cream/95 xl:right-16"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-tea-700/10 text-tea-700">
          <Sprout className="size-4.5" aria-hidden />
        </div>
        <div className="min-w-0 pr-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-tea-800">
            {variety.plucking}
          </span>
          <span className="block text-xs text-ink-mute">
            {variety.harvest} · Zero Pesticide
          </span>
        </div>
      </motion.div>

      {/* Badge 3: Live Aroma Profile Notes (Floating beside bowl) */}
      <motion.div
        style={{ x: b3X, y: b3Y }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="pointer-events-auto absolute left-[44%] top-[22%] hidden rounded-2xl border border-tea-900/10 bg-cream/75 p-3 shadow-soft backdrop-blur-md transition-all duration-300 hover:bg-cream/90 xl:block"
      >
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-tea-900">
          <Sparkles className="size-3.5 text-tea-600" aria-hidden />
          <span>Aroma Profile</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={variety.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex flex-wrap gap-1.5"
            >
              {variety.tastingNotes.map((note) => (
                <span
                  key={note}
                  className="rounded-full border border-tea-900/10 bg-white/70 px-2.5 py-0.5 text-xs font-medium text-ink transition-colors hover:bg-white"
                >
                  {note}
                </span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
