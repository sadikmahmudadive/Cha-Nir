"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cartActions, useCart } from "@/context/cart-store";
import { ease } from "@/lib/motion";

/**
 * Success feedback after add-to-cart + a polite aria-live region that also
 * announces quantity/removal/discount changes to screen-reader users.
 */
export function AddedToast() {
  const { added, announce, open } = useCart();
  const [visible, setVisible] = useState<number | null>(null);

  useEffect(() => {
    if (!added) return;
    const show = setTimeout(() => setVisible(added.key), 0);
    const hide = setTimeout(() => setVisible(null), 4200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [added]);

  const showing = visible !== null && added && visible === added.key && !open;

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-live">
        {announce}
      </div>
      <AnimatePresence>
        {showing && added && (
          <motion.div
            key={added.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease } }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.16 } }}
            className="fixed inset-x-4 bottom-24 z-[70] mx-auto flex max-w-md items-center gap-3 rounded-full bg-tea-900 py-2.5 pl-3 pr-2.5 text-cream shadow-lift md:bottom-6 md:left-auto md:right-6 md:mx-0"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-500 text-tea-950">
              <Check className="size-4" aria-hidden strokeWidth={3} />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="font-semibold">{added.name}</span> · {added.label} added
            </p>
            <button
              type="button"
              onClick={() => {
                setVisible(null);
                cartActions.open();
              }}
              className="min-h-10 shrink-0 cursor-pointer rounded-full bg-cream px-4 text-sm font-bold text-tea-800 hover:bg-white"
            >
              View cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
