"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cartActions, useCart } from "@/lib/cart";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/#story", label: "Our story" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const { summary, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || menu
          ? "bg-cream/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between gap-4 py-2.5">
        <Link
          href="/"
          aria-label="Cha Nir home"
          onClick={() => setMenu(false)}
          className="shrink-0"
        >
          <Image
            src="/img/logo-full.webp"
            alt="Cha Nir, pure organic deshi tea"
            width={900}
            height={659}
            priority
            className={`w-auto transition-[height] duration-300 ${scrolled ? "h-12" : "h-16"}`}
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === pathname;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className="relative rounded-full px-4 py-2.5 text-[0.9375rem] font-semibold text-brown transition-colors hover:text-leaf"
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-lime"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cartActions.open}
            aria-label={`Open cart, ${summary.count} item${summary.count === 1 ? "" : "s"}`}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="relative inline-flex size-11 items-center justify-center rounded-full border border-line bg-[#fffdf6] text-brown transition-colors hover:border-leaf hover:text-leaf"
          >
            <ShoppingBag className="size-5" aria-hidden />
            <AnimatePresence>
              {summary.count > 0 && (
                <motion.span
                  key={summary.count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-lime px-1 text-[0.75rem] font-bold leading-5 text-brown"
                >
                  {summary.count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Link href="/wholesale#quote" className="btn btn-lime hidden sm:inline-flex">
            Get a quote
          </Link>

          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-[#fffdf6] md:hidden"
          >
            {menu ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <ul className="container-x flex flex-col py-3">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className="block border-b border-line/70 py-3.5 font-serif text-2xl font-semibold"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <li className="pt-4 pb-2">
                <Link
                  href="/wholesale#quote"
                  onClick={() => setMenu(false)}
                  className="btn btn-lime w-full"
                >
                  Get a wholesale quote
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
