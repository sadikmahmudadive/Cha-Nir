"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-store";
import { cartActions, useCart } from "@/context/cart-store";
import { categories, products } from "@/data/demo/catalog";
import { Sheet } from "@/components/ui/Sheet";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatBDT } from "@/lib/format";
import { ease, stagger, fadeUp } from "@/lib/motion";
import { site } from "@/lib/site";

function CartButton() {
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={cartActions.open}
      className="tap relative grid cursor-pointer place-items-center rounded-full text-tea-900 transition-colors hover:bg-tea-100"
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <ShoppingBag className="size-[1.4rem]" aria-hidden />
      <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center overflow-hidden rounded-full bg-tea-600 px-1 text-[0.7rem] font-bold leading-none text-white">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className="block tabular-nums"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const term = q.trim().toLowerCase();
  const results = term
    ? products
        .filter((p) => `${p.name} ${p.short} ${categories.find((c) => c.id === p.categoryId)?.name}`.toLowerCase().includes(term))
        .slice(0, 5)
    : [];

  return (
    <Sheet open={open} onClose={onClose} title="Search tea" side="center" initialFocusRef={inputRef}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
          router.push(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <div className="flex items-center gap-3 rounded-full border border-line bg-paper px-4 focus-within:border-tea-600 focus-within:ring-4 focus-within:ring-lime-500/30">
          <Search className="size-5 text-ink-mute" aria-hidden />
          <input
            id="site-search"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search black tea, green tea, bulk…"
            autoComplete="off"
            className="min-h-12 w-full bg-transparent text-base outline-none placeholder:text-ink-mute/70"
          />
        </div>
      </form>
      <div className="mt-4 min-h-40" aria-live="polite">
        {term && results.length === 0 && (
          <p className="py-6 text-center text-ink-soft">No tea matches &ldquo;{q}&rdquo;. Try a different word.</p>
        )}
        {!term && (
          <div>
            <p className="t-eyebrow mb-3 text-ink-mute">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {["Black tea", "Green tea", "Gift", "Bulk"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQ(s)}
                  className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-sm font-medium hover:border-tea-600 hover:bg-tea-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <ul className="divide-y divide-line-soft">
          {results.map((p) => (
            <li key={p.id}>
              <Link href={`/shop/${p.slug}`} onClick={onClose} className="flex items-center gap-4 py-3 hover:bg-tea-50">
                <Photo image={p.image} ratio="1/1" className="w-14 shrink-0" sizes="56px" rounded />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.name}</span>
                  <span className="block truncate text-sm text-ink-mute">{p.short}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">from {formatBDT(Math.min(...p.variants.map((v) => v.price)))}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow] duration-300",
          scrolled ? "bg-cream/95 shadow-[0_1px_0_var(--color-line),0_8px_24px_-16px_rgb(48_42_35/0.25)] backdrop-blur-md" : "bg-cream",
        )}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="tap -ml-2 grid cursor-pointer place-items-center rounded-full hover:bg-tea-100"
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>

          <Link href="/" className="shrink-0 max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2" aria-label="Cha Nir home">
            <Image src="/brand/logo.webp" alt="Cha Nir: Pure, Organic, Deshi" width={1768} height={1303} priority className="h-[58px] w-auto" />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-tea-100",
                      isActive(n.href) && "text-tea-700",
                    )}
                  >
                    {n.label}
                    {isActive(n.href) && (
                      <motion.span layoutId="nav-underline" className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-lime-500" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="tap grid cursor-pointer place-items-center rounded-full hover:bg-tea-100"
              aria-label="Search"
              aria-haspopup="dialog"
            >
              <Search className="size-[1.35rem]" aria-hidden />
            </button>
            <Link
              href={user ? "/account" : "/account/login"}
              className="tap hidden place-items-center rounded-full hover:bg-tea-100 sm:grid"
              aria-label={user ? `Account for ${user.name}` : "Log in or register"}
            >
              <User className="size-[1.35rem]" aria-hidden />
            </Link>
            <CartButton />
          </div>
        </div>
      </header>

      <SearchSheet open={search} onClose={() => setSearch(false)} />

      <Sheet open={menu} onClose={() => setMenu(false)} title="Menu" side="right">
        <motion.nav aria-label="Mobile" variants={stagger(0.05)} initial="hidden" animate="show">
          <ul className="space-y-1">
            {site.nav.map((n) => (
              <motion.li key={n.href} variants={fadeUp}>
                <Link
                  href={n.href}
                  onClick={() => setMenu(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="flex min-h-14 items-center rounded-md px-3 font-display text-3xl text-tea-900 hover:bg-tea-100"
                >
                  {n.label}
                </Link>
              </motion.li>
            ))}
          </ul>
          <motion.div variants={fadeUp} className="mt-6 space-y-3 border-t border-line-soft pt-6">
            <Button href={user ? "/account" : "/account/login"} variant="secondary" full onClick={() => setMenu(false)} iconLeft={<User className="size-4" aria-hidden />}>
              {user ? "My account" : "Log in / Register"}
            </Button>
            <Button href="/wholesale#inquiry" full onClick={() => setMenu(false)}>
              Request wholesale pricing
            </Button>
          </motion.div>
        </motion.nav>
      </Sheet>
    </>
  );
}
