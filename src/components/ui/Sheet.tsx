"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { ease, panelBottom, panelRight, scrim } from "@/lib/motion";

type Side = "right" | "bottom" | "center";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal surface used for the cart drawer, filter drawer, mobile
 * menu and confirmation dialogs: role=dialog, aria-modal, labelled title,
 * focus moved in and trapped, Escape to close, scroll lock, focus restored.
 */
export function Sheet({
  open,
  onClose,
  title,
  side = "right",
  children,
  footer,
  hideTitle,
  className,
  initialFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: Side;
  children: ReactNode;
  footer?: ReactNode;
  hideTitle?: boolean;
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const returnTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => {
      const el = initialFocusRef?.current ?? panel.current?.querySelector<HTMLElement>("[data-autofocus]");
      (el ?? panel.current)?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (typeof document === "undefined") return null;

  const variants = side === "right" ? panelRight : side === "bottom" ? panelBottom : undefined;
  const pos =
    side === "right"
      ? "right-0 top-0 h-dvh w-full max-w-[26rem] sm:max-w-[28rem]"
      : side === "bottom"
        ? "bottom-0 left-0 right-0 max-h-[88dvh] rounded-t-xl"
        : "left-1/2 top-1/2 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            variants={scrim}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-0 bg-tea-950/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            variants={variants}
            initial={side === "center" ? { opacity: 0, scale: 0.97 } : "hidden"}
            animate={side === "center" ? { opacity: 1, scale: 1, transition: { duration: 0.24, ease } } : "show"}
            exit={side === "center" ? { opacity: 0, scale: 0.98, transition: { duration: 0.14 } } : "exit"}
            className={cn(
              "absolute flex flex-col bg-cream shadow-drawer outline-none",
              pos,
              side === "center" && "shadow-lift",
              className,
            )}
          >
            <header className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
              <h2 id={titleId} className={cn("t-h3", hideTitle && "sr-only")}>
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${title}`}
                className="tap -mr-2 grid cursor-pointer place-items-center rounded-full text-ink hover:bg-tea-100"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
            {footer && <footer className="border-t border-line-soft bg-paper px-5 py-4">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
