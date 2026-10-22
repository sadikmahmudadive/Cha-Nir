import type { Transition, Variants } from "motion/react";

/**
 * Shared motion language for Cha Nir.
 * - Only transform + opacity are animated.
 * - One easing curve, three durations. Exit is faster than enter.
 * - `MotionConfig reducedMotion="user"` (see Providers) strips transforms for
 *   users who prefer reduced motion; every essential interaction still works.
 */
export const ease = [0.22, 1, 0.36, 1] as const;

export const dur = { fast: 0.16, base: 0.3, slow: 0.6 } as const;

export const tEnter: Transition = { duration: dur.base, ease };
export const tExit: Transition = { duration: dur.fast, ease: [0.4, 0, 1, 1] };
export const tSlow: Transition = { duration: dur.slow, ease };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: tSlow },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: tEnter },
};

export const stagger = (gap = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const reveal = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, margin: "0px 0px -80px 0px" },
} as const;

/** Slide-in panel (cart drawer, filter drawer, mobile nav). */
export const panelRight: Variants = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { duration: 0.38, ease } },
  exit: { x: "100%", transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
};

export const panelBottom: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: { duration: 0.38, ease } },
  exit: { y: "100%", transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
};

export const scrim: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.base } },
  exit: { opacity: 0, transition: { duration: dur.fast } },
};

export const press = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97 },
  transition: { duration: dur.fast, ease },
} as const;
