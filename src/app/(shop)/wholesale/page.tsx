import type { Metadata } from "next";
import { Coffee, Hotel, Mail, MessageCircle, Phone, Store, Utensils, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Photo } from "@/components/media/Photo";
import { Reveal, SectionHeading } from "@/components/ui/misc";
import { ApprovalFlow, WholesaleCatalog } from "@/components/wholesale/WholesaleCatalog";
import { InquiryForm } from "@/components/wholesale/InquiryForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wholesale tea supply",
  description: "Packaged and bulk tea supply for tea stalls, tea shops, hotels, restaurants and retailers.",
};

const customers = [
  { icon: Coffee, label: "Tea stalls", body: "Dependable bulk tea for all-day pouring." },
  { icon: Store, label: "Tea shops", body: "A consistent cup your regulars come back for." },
  { icon: Hotel, label: "Hotels", body: "Better tea for guests and breakfast service." },
  { icon: Utensils, label: "Restaurants & cafés", body: "Tea that suits your menu and your margins." },
  { icon: Warehouse, label: "Retailers & resellers", body: "Retail-ready packs for your shelves." },
];

const faqs = [
  { id: "w1", title: "What is the minimum order?", content: "Minimum order quantities are set by Cha Nir per product and shown in the bulk catalogue once configured." },
  { id: "w2", title: "Can I see wholesale prices before I register?", content: "That depends on how Cha Nir runs wholesale. Prices can be public, or visible only to approved business accounts. Use the preview above to see both." },
  { id: "w3", title: "How do repeat orders work?", content: "Approved accounts can reorder previous purchases from their order history in a couple of taps." },
  { id: "w4", title: "How is delivery handled?", content: "Delivery options and charges for bulk orders are confirmed by Cha Nir when you send an inquiry." },
  { id: "w5", title: "Which payment methods can businesses use?", content: "Cash on Delivery and online payment where enabled. Business payment terms, if any, are agreed with Cha Nir." },
];

export default function WholesalePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-tea-900 text-cream" data-surface="dark" aria-labelledby="w-title">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-tea-800" />
        <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="t-eyebrow text-lime-300">Cha Nir Wholesale</p>
            <h1 id="w-title" className="t-display mt-4 text-balance">
              Your Tea Business Deserves a <em className="text-lime-300">Better Supply.</em>
            </h1>
            <p className="t-lead mt-6 max-w-xl text-cream/80 text-pretty">
              Packaged tea and bulk supply for the businesses that serve tea every day.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#inquiry" variant="accent" size="lg">Request Wholesale Pricing</Button>
              <Button href="#catalog" variant="light" size="lg">View Bulk Catalogue</Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Photo image={{ kind: "stall", tone: "warm", alt: "A tea stall serving glasses of tea" }} ratio="4/3" priority sizes="(min-width:1024px) 40vw, 100vw" />
          </div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="who-title">
        <div className="container-x">
          <SectionHeading eyebrow="Who we supply" title={<span id="who-title">Built for businesses that pour tea all day</span>} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {customers.map((c, i) => (
              <Reveal as="li" key={c.label} delay={i * 0.05} className="rounded-card border border-line bg-paper p-6">
                <span className="grid size-12 place-items-center rounded-full bg-tea-100 text-tea-600"><c.icon className="size-6" aria-hidden /></span>
                <h3 className="mt-4 font-display text-xl text-tea-900">{c.label}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{c.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="catalog" className="section-y scroll-mt-24 bg-paper" aria-labelledby="cat-w">
        <div className="container-x">
          <SectionHeading eyebrow="Bulk catalogue & pricing" title={<span id="cat-w">Bulk packs, clear terms</span>} body="Configurable volume pricing and minimum order quantities, visible publicly or to approved accounts." />
          <div className="mt-10"><WholesaleCatalog /></div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="flow-title">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title={<span id="flow-title">From inquiry to repeat order</span>} />
          <div className="mt-10"><ApprovalFlow /></div>
        </div>
      </section>

      <section className="section-y bg-tea-100" aria-label="Inquiry form">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <p className="t-eyebrow text-tea-600">Get in touch</p>
            <h2 className="t-h2 text-tea-900 text-balance">Let&rsquo;s talk about your supply.</h2>
            <p className="text-ink-soft">Prefer to talk? Reach us directly. Contact details below are placeholders to be replaced.</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><Phone className="size-5 text-tea-600" aria-hidden />{site.contact.phone}</li>
              <li className="flex items-center gap-3"><MessageCircle className="size-5 text-tea-600" aria-hidden />WhatsApp {site.contact.whatsapp}</li>
              <li className="flex items-center gap-3"><Mail className="size-5 text-tea-600" aria-hidden />{site.contact.email}</li>
            </ul>
          </div>
          <div className="lg:col-span-8"><InquiryForm /></div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="wf-title">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <h2 id="wf-title" className="t-h2 text-tea-900 lg:col-span-4">Wholesale questions</h2>
          <div className="lg:col-span-8"><Accordion items={faqs} /></div>
        </div>
      </section>
    </>
  );
}
