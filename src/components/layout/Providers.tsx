"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AddedToast } from "@/components/cart/AddedToast";
import { CartDrawer } from "@/components/cart/CartDrawer";

/** Client-only app chrome: motion config (honours reduced-motion), cart drawer, toasts + live region. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <CartDrawer />
      <AddedToast />
    </MotionConfig>
  );
}
