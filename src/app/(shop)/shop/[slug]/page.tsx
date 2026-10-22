import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductExperience } from "@/components/product/ProductExperience";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs, PageSkeleton, SectionHeading } from "@/components/ui/misc";
import { categoryById, productBySlug, products, relatedTo } from "@/data/demo/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return { title: p.name, description: p.short };
}

async function ProductContent({ params }: Pick<PageProps<"/shop/[slug]">, "params">) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const cat = categoryById(product.categoryId);

  return (
    <div className="pb-28 lg:pb-24">
      <div className="container-x pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop Tea", href: "/shop" },
            ...(cat ? [{ label: cat.name, href: `/shop?category=${cat.slug}` }] : []),
            { label: product.name },
          ]}
        />
        <div className="mt-6">
          <ProductExperience product={product} />
        </div>
      </div>

      <div className="container-x mt-20">
        <ProductInfo product={product} />
      </div>

      <section className="container-x mt-24" aria-labelledby="rel-title">
        <SectionHeading eyebrow="Keep exploring" title={<span id="rel-title">You may also like</span>} />
        <ProductGrid items={relatedTo(product)} className="mt-10" />
      </section>
    </div>
  );
}

export default function Page({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
