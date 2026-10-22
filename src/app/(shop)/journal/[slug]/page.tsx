import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Photo } from "@/components/media/Photo";
import { Alert, Breadcrumbs, PageSkeleton } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { journal } from "@/data/demo/content";

export function generateStaticParams() {
  return journal.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = journal.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.excerpt } : {};
}

async function ArticleContent({ params }: Pick<PageProps<"/journal/[slug]">, "params">) {
  const { slug } = await params;
  const a = journal.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <article className="container-x pb-24 pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tea Journal", href: "/journal" }, { label: a.title }]} />
      <header className="mx-auto mt-8 max-w-3xl space-y-4 text-center">
        <p className="t-eyebrow text-tea-600">
          {a.category} · {a.readingTime}
        </p>
        <h1 className="t-h1 text-balance text-tea-900">{a.title}</h1>
        <p className="t-lead text-ink-soft">{a.excerpt}</p>
      </header>
      <div className="mx-auto mt-10 max-w-4xl">
        <Photo image={a.image} ratio="16/9" priority sizes="(min-width:1024px) 60vw, 100vw" />
      </div>
      <div className="mx-auto mt-10 max-w-2xl space-y-6">
        <Alert tone="info" title="Article placeholder">
          This template is ready for editorial content (headings, images, pull quotes and related products). Connect it to Firestore or a CMS.
        </Alert>
        <Button href="/journal" variant="secondary">
          Back to the journal
        </Button>
      </div>
    </article>
  );
}

export default function Page({ params }: PageProps<"/journal/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}
