import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Alert, Breadcrumbs, PageSkeleton } from "@/components/ui/misc";

const policies: Record<string, { title: string; intro: string }> = {
  delivery: { title: "Delivery policy", intro: "Delivery areas, charges and timing will be described here once confirmed by Cha Nir." },
  returns: { title: "Returns & refunds", intro: "Return, replacement and refund terms will be described here once confirmed by Cha Nir." },
  privacy: { title: "Privacy policy", intro: "How customer data is collected, used and protected will be described here." },
  terms: { title: "Terms & conditions", intro: "Terms of sale and use of this website will be described here." },
};

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return policies[slug] ? { title: policies[slug].title } : {};
}

async function PolicyContent({ params }: Pick<PageProps<"/policies/[slug]">, "params">) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) notFound();
  return (
    <div className="container-x pb-24 pt-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: p.title }]} />
      <div className="mx-auto mt-8 max-w-2xl space-y-6">
        <h1 className="t-h1 text-tea-900">{p.title}</h1>
        <p className="t-lead text-ink-soft">{p.intro}</p>
        <Alert tone="warn" title="Placeholder policy">
          This page contains no real policy. Do not launch until the business has supplied and approved the final text.
        </Alert>
      </div>
    </div>
  );
}

export default function Page({ params }: PageProps<"/policies/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PolicyContent params={params} />
    </Suspense>
  );
}
