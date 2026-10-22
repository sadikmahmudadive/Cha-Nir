import { Accordion } from "@/components/ui/Accordion";
import type { Product } from "@/types/catalog";

const faqs = [
  { id: "f1", q: "How should I store my tea?", a: "Keep it sealed in a cool, dry place away from sunlight and strong smells. Reseal the pack after each use." },
  { id: "f2", q: "How is delivery charged?", a: "The delivery charge is calculated at checkout from your district. Delivery times are confirmed by Cha Nir after you place your order." },
  { id: "f3", q: "Can I order in bulk for my business?", a: "Yes. Use the wholesale inquiry form to ask about bulk packs, volume pricing and repeat orders." },
  { id: "f4", q: "What payment methods are accepted?", a: "Cash on Delivery, and online payment through a local gateway when the business has enabled it." },
];

export function ProductInfo({ product }: { product: Product }) {
  const items = [
    {
      id: "details",
      title: "Product details",
      content: (
        <div className="space-y-4">
          <p>{product.description}</p>
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {product.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-4 border-b border-line-soft py-2">
                <dt className="text-ink-mute">{d.label}</dt>
                <dd className="text-right font-semibold text-ink">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ),
    },
    ...(product.ingredients ? [{ id: "ingredients", title: "Ingredients", content: <p>{product.ingredients}</p> }] : []),
    ...(product.brewing
      ? [{
          id: "brewing",
          title: "Brewing instructions",
          content: (
            <ol className="list-decimal space-y-1.5 pl-5">
              {product.brewing.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ol>
          ),
        }]
      : []),
    { id: "storage", title: "Storage instructions", content: <p>{product.storage}</p> },
    ...faqs.map((f) => ({ id: f.id, title: f.q, content: <p>{f.a}</p> })),
  ];

  return (
    <section aria-labelledby="pi-title" className="mx-auto max-w-3xl">
      <h2 id="pi-title" className="t-h2 mb-6 text-tea-900">About this tea</h2>
      <Accordion items={items} defaultOpen={["details"]} />
      <p className="mt-6 text-xs text-ink-mute">
        Brewing and storage guidance is general. Cha Nir should confirm product-specific details before launch.
      </p>
    </section>
  );
}
