import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { Breadcrumbs, Reveal } from "@/components/ui/misc";
import { journal } from "@/data/demo/content";

export const metadata: Metadata = { title: "Tea Journal", description: "Brewing guides, tea culture and tips for tea businesses." };

export default function JournalPage() {
  return (
    <div className="container-x pb-24 pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tea Journal" }]} />
      <header className="mb-12 mt-6 max-w-2xl space-y-3">
        <h1 className="t-h1 text-balance text-tea-900">Tea Journal</h1>
        <p className="t-lead text-ink-soft">Brewing, culture and care: notes for tea lovers and tea businesses. Articles are placeholders until written.</p>
      </header>
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {journal.map((a, i) => (
          <Reveal as="li" key={a.slug} delay={(i % 3) * 0.06}>
            <article className="group">
              <Link href={`/journal/${a.slug}`} className="block overflow-hidden rounded-card" tabIndex={-1} aria-hidden>
                <div className="transition-transform duration-700 ease-out-quint group-hover:scale-[1.045]">
                  <Photo image={a.image} ratio="4/3" rounded={false} seed={i + 9} />
                </div>
              </Link>
              <p className="t-eyebrow mt-5 text-tea-600">
                {a.category} <span className="text-ink-mute">· {a.readingTime}</span>
              </p>
              <h2 className="mt-3 font-display text-2xl leading-snug text-tea-900">
                <Link href={`/journal/${a.slug}`} className="decoration-lime-500 decoration-2 underline-offset-4 hover:underline">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-2 text-ink-soft">{a.excerpt}</p>
            </article>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
