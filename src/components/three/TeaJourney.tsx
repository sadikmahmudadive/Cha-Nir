"use client";

import dynamic from "next/dynamic";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArtImage } from "@/components/media/ArtImage";
import { SectionHeading } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import type { ArtKind, ArtTone } from "@/types/catalog";
import { useCapability } from "./capability";

const JourneyScene = dynamic(() => import("./JourneyScene"), { ssr: false });

const steps: { n: string; title: string; body: string; kind: ArtKind; tone: ArtTone }[] = [
  {
    n: "01",
    title: "Sourcing",
    body: "Cha Nir sources tea from quality tea gardens across Bangladesh, choosing leaf for character, colour and consistency.",
    kind: "garden",
    tone: "light",
  },
  {
    n: "02",
    title: "Processing",
    body: "The leaf is carefully processed and graded so every pack brews the way you expect it to.",
    kind: "leaf",
    tone: "deep",
  },
  {
    n: "03",
    title: "Packaging",
    body: "Tea is packed in sizes for homes and businesses, from small retail packs to bulk supply.",
    kind: "pack",
    tone: "light",
  },
  {
    n: "04",
    title: "Enjoying & sharing",
    body: "Then comes the best part: a pot on the table, a glass in the hand, a conversation worth staying for.",
    kind: "ritual",
    tone: "warm",
  },
];

/**
 * Story section = scroll-driven 3D journey on large screens with capable
 * devices; otherwise (phones, low-end, no WebGL) an equally complete
 * image-led 4-step layout. Copy is identical either way.
 */
export function TeaJourney() {
  const cap = useCapability();
  const list = useRef<HTMLOListElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [wide, setWide] = useState(false);
  const stageVisible = useInView(stage, { margin: "100px" });
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 50%", "end 50%"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    setActive(Math.min(3, Math.max(0, Math.floor(v * 4))));
  });

  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  const show3d = cap === "yes" && wide;

  return (
    <section id="journey" className="section-y bg-paper" aria-labelledby="journey-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our story"
          title={
            <span id="journey-title">
              From Bangladesh&rsquo;s Tea Gardens <em className="text-tea-600">to Your Cup.</em>
            </span>
          }
          body="Four steps, one idea: honest tea, handled with care from the leaf to the last sip."
        />

        <div className={cn("mt-14 grid gap-10", show3d ? "lg:grid-cols-12" : "sm:grid-cols-2 xl:grid-cols-4")}>
          <ol ref={list} className={cn(show3d ? "lg:col-span-5 lg:space-y-0" : "contents", "space-y-10")}>
            {steps.map((s, i) => (
              <li
                key={s.n}
                className={cn(
                  "transition-opacity duration-500",
                  show3d && "lg:flex lg:min-h-[62vh] lg:items-center",
                  show3d && active !== i && "lg:opacity-40",
                )}
              >
                <div>
                  {!show3d && (
                    <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-card">
                      <ArtImage kind={s.kind} tone={s.tone} seed={i + 3} className="absolute inset-0 size-full" />
                    </div>
                  )}
                  <p className="font-display text-5xl text-lime-600">{s.n}</p>
                  <h3 className="t-h3 mt-2 text-tea-900">{s.title}</h3>
                  <p className="mt-3 max-w-md text-ink-soft text-pretty">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {show3d && (
            <div className="lg:col-span-7">
              <div
                ref={stage}
                className="sticky top-28 h-[min(72vh,620px)] overflow-hidden rounded-xl bg-tea-100"
                role="img"
                aria-label="Illustrative 3D scene moving from tea garden to processing, packing and serving"
              >
                <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
                  <JourneyScene progress={progress} active={stageVisible} onReady={() => setReady(true)} />
                </div>
                {!ready && <ArtImage kind={steps[active].kind} tone={steps[active].tone} seed={active + 3} className="absolute inset-0 size-full" />}
                <p className="absolute inset-x-4 bottom-3 rounded-full bg-cream/85 px-4 py-2 text-center text-xs font-medium text-ink-soft">
                  {steps[active].n} · {steps[active].title}. Illustrative 3D visuals, not footage of Cha Nir&rsquo;s facilities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
