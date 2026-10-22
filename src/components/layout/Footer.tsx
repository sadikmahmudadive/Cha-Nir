import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { Banknote, CreditCard, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { categories } from "@/data/demo/catalog";
import { policyLinks, site } from "@/lib/site";

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const col = "space-y-3";
const h = "t-eyebrow mb-5 text-lime-300";
const a = "inline-flex min-h-9 items-center text-cream/85 hover:text-white hover:underline underline-offset-4";

export function Footer() {
  return (
    <footer className="mt-auto bg-tea-900 text-cream" data-surface="dark">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="inline-block rounded-card bg-cream p-3">
            <Image src="/brand/logo.webp" alt="Cha Nir" width={1768} height={1303} className="h-24 w-auto" />
          </div>
          <p className="mt-5 font-display text-2xl">{site.tagline}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/75">
            Authentic Bangladeshi tea, carefully sourced, thoughtfully processed and packed for every tea moment.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
            {site.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/25 px-4 text-sm hover:bg-white/10"
                  aria-label={`${s.label} (link to be added)`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Shop" className="md:col-span-2">
          <h2 className={h}>Shop</h2>
          <ul className={col}>
            <li><Link className={a} href="/shop">All tea</Link></li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link className={a} href={`/shop?category=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="md:col-span-2">
          <h2 className={h}>Cha Nir</h2>
          <ul className={col}>
            <li><Link className={a} href="/story">Our story</Link></li>
            <li><Link className={a} href="/wholesale">Wholesale</Link></li>
            <li><Link className={a} href="/wholesale#inquiry">Wholesale inquiry</Link></li>
            <li><Link className={a} href="/journal">Tea journal</Link></li>
            <li><Link className={a} href="/account">My account</Link></li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className={h}>Contact</h2>
          <ul className="space-y-3 text-sm text-cream/85">
            <li className="flex items-start gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-lime-300" aria-hidden /><span>{site.contact.phone} <span className="text-cream/55">(placeholder)</span></span></li>
            <li className="flex items-start gap-3"><MessageCircle className="mt-0.5 size-4 shrink-0 text-lime-300" aria-hidden /><span>WhatsApp: {site.contact.whatsapp} <span className="text-cream/55">(placeholder)</span></span></li>
            <li className="flex items-start gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-lime-300" aria-hidden /><span>{site.contact.email} <span className="text-cream/55">(placeholder)</span></span></li>
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-lime-300" aria-hidden /><span>{site.contact.address}</span></li>
          </ul>
          <h2 className={`${h} mt-8`}>Accepted payments</h2>
          <ul className="flex flex-wrap gap-2 text-xs">
            {site.payments.cod.enabled && (
              <li className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-3.5"><Banknote className="size-4" aria-hidden />{site.payments.cod.label}</li>
            )}
            {site.payments.gateway.enabled && (
              <li className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-3.5"><CreditCard className="size-4" aria-hidden />Online payment (when enabled)</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="container-x flex flex-col gap-4 py-6 text-sm text-cream/70 md:flex-row md:items-center md:justify-between">
          <p>© <Year /> {site.name}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {policyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-9 items-center hover:text-white hover:underline underline-offset-4">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
