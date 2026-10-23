"use client";

import { MotionConfig } from "framer-motion";

/** `reducedMotion="user"` turns off transform/layout animation for people who ask for less motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
