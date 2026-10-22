import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/media/Photo";
import { Alert, Reveal, SectionHeading } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Our Story",
  description: "How Cha Nir brings authentic Bangladeshi tea from the garden to your cup.",
};

const principles = [
  { t: "Pure", d: "Honest tea, with nothing hidden behind the label." },
  { t: "Organic", d: "A commitment to natural, careful handling. Certifications will be listed here only once verified." },
  { t: "Deshi", d: "Proudly Bangladeshi: our tea, our people, our way of sharing a cup." },
];

export default function StoryPage() {
  return (
    <>
      <section className="container-x grid items-center gap-10 py-12 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-6">
          <p className="t-eyebrow text-tea-600">Our story</p>
          <h1 className="t-display mt-4 text-balance text-tea-900">
            A cup that feels like <em className="text-tea-600">home.</em>
          </h1>
          <p className="t-lead mt-6 max-w-xl text-ink-soft text-pretty">
            Cha Nir sources authentic tea from quality tea gardens in Bangladesh, processes and packs it, and brings it to homes, tea stalls, hotels and restaurants.
          </p>
        </div>
        <div className="lg:col-span-6">
          <Photo image={{ kind: "garden", tone: "light", alt: "Rolling tea garden hills" }} ratio="5/4" priority sizes="(min-width:1024px) 50vw, 100vw" />
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x">
          <SectionHeading eyebrow="What we stand for" title="Pure. Organic. Deshi." />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.t} delay={i * 0.06} className="rounded-card border border-line bg-cream p-7">
                <h3 className="font-display text-3xl text-tea-900">{p.t}</h3>
                <p className="mt-3 text-ink-soft">{p.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Photo image={{ kind: "ritual", tone: "warm", alt: "Tea being poured into a cup" }} ratio="4/5" />
          <div className="flex flex-col justify-center gap-5">
            <h2 className="t-h2 text-tea-900">The ritual of sharing tea</h2>
            <p className="text-ink-soft text-pretty">
              In Bangladesh, tea is how we welcome, how we pause and how we talk. This page will be completed with the founders&rsquo; own words, real photography and verified facts about sourcing and processing.
            </p>
            <Alert tone="info" title="Content placeholder">
              Replace this copy and imagery with the real Cha Nir story. Avoid claims about gardens, certifications or traceability until they can be substantiated.
            </Alert>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/shop">Shop Tea</Button>
              <Button href="/wholesale" variant="secondary">
                Explore Wholesale
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
