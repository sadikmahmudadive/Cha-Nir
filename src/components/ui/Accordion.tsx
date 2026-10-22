"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/** Accessible disclosure list. `single` keeps one panel open at a time. */
export function Accordion({
  items,
  single = true,
  defaultOpen = [],
  className,
  tone = "light",
}: {
  items: AccordionItem[];
  single?: boolean;
  defaultOpen?: string[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const base = useId();
  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : single ? [id] : [...cur, id]));

  return (
    <div className={cn("divide-y", tone === "dark" ? "divide-white/15" : "divide-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const pid = `${base}-${item.id}`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={`${pid}-btn`}
                aria-expanded={isOpen}
                aria-controls={`${pid}-panel`}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-[1.02rem] font-semibold"
              >
                <span>{item.title}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.24, ease }}>
                  <ChevronDown className="size-5 shrink-0" aria-hidden />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${pid}-panel`}
                  role="region"
                  aria-labelledby={`${pid}-btn`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease }}
                  className="overflow-hidden"
                >
                  <div className={cn("pb-5 pr-8 text-[0.97rem] leading-relaxed", tone === "dark" ? "text-cream/80" : "text-ink-soft")}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
