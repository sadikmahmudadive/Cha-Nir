import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SEGMENTS, type Segment } from "@/lib/products";

const COLS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All teas" },
      { href: "/shop?cat=Black+Tea", label: "Black tea" },
      { href: "/shop?cat=Green+Tea", label: "Green tea" },
      { href: "/shop?cat=Specialty", label: "Specialty" },
    ],
  },
  {
    title: "Buy for business",
    links: (Object.keys(SEGMENTS) as Segment[])
      .filter((s) => s !== "home")
      .map((s) => ({ href: `/shop?for=${s}`, label: SEGMENTS[s].plural })),
  },
  {
    title: "Company",
    links: [
      { href: "/#story", label: "Garden to cup" },
      { href: "/wholesale", label: "Wholesale pricing" },
      { href: "/#faq", label: "FAQ" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-leaf-deep text-cream">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <div className="inline-block rounded-3xl bg-cream p-4">
            <Image
              src="/img/logo-full.webp"
              alt="Cha Nir, pure organic deshi tea"
              width={900}
              height={659}
              className="h-24 w-auto"
            />
          </div>
          <p className="mt-6 max-w-sm text-cream/85">
            Authentic tea from the best gardens of Bangladesh, processed and packed by us for
            tea shops, stalls, hotels, restaurants and homes.
          </p>
          <ul className="mt-6 space-y-3 text-[0.9375rem] text-cream/85">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
              Bangladesh (add warehouse address)
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
              +880 (add phone / WhatsApp)
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
              hello@chanir.example
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="font-sans text-[0.8125rem] font-bold uppercase tracking-[0.16em] text-lime">
                {c.title}
              </h2>
              <ul className="mt-4 space-y-1">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-block py-1.5 text-cream/85 transition-colors hover:text-lime"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="container-x flex flex-col gap-2 py-6 text-[0.875rem] text-cream/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cha Nir. All rights reserved.</p>
          <p className="font-bn tracking-wide">খাঁটি • জৈব • দেশি &nbsp;|&nbsp; Pure • Organic • Deshi</p>
        </div>
      </div>
    </footer>
  );
}
