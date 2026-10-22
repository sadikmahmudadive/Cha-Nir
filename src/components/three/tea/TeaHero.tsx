"use client";

import dynamic from "next/dynamic";
import { useInView } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { useCapability, useHasFinePointer, usePrefersReducedMotion } from "../capability";
import { HeroContent } from "./HeroContent";
import { HeroFallback } from "./HeroFallback";

// The entire 3D scene (three + R3F + drei + shaders) is a separate chunk,
// requested only when this hero is going to render it.
const TeaScene = dynamic(() => import("./TeaScene"), { ssr: false });

const noop = () => () => {};
/** Reads `?tea_t=<seconds>` (debug / poster capture): freezes the timeline at that moment. */
function useFixedT(): number | undefined {
  const raw = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("tea_t"),
    () => null,
  );
  return raw !== null && !Number.isNaN(Number(raw)) ? Number(raw) : undefined;
}

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function TeaHero() {
  const stage = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "160px" });
  const cap = useCapability();
  const reduced = usePrefersReducedMotion();
  const finePointer = useHasFinePointer();
  const wide = useMedia("(min-width: 1024px)");
  const phone = useMedia("(max-width: 767px)");
  const fixedT = useFixedT();
  const [idle, setIdle] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  // let the headline, CTAs and poster paint first; then fetch the 3D chunk
  useEffect(() => {
    const id = window.setTimeout(() => setIdle(true), 600);
    return () => clearTimeout(id);
  }, []);

  const lowPower = phone || (typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4);
  const render3d = cap === "yes" && idle && (!reduced || fixedT !== undefined);

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Text column (real HTML, above the stage on every breakpoint) */}
      <div className="container-x relative z-10 lg:flex lg:min-h-[min(46rem,calc(100svh-7.5rem))] lg:items-center">
        <HeroContent />
      </div>

      {/* Stage: reserved size → no layout shift. Overlays the section on desktop. */}
      <div
        ref={stage}
        className="relative -mt-4 aspect-square w-full sm:aspect-[5/4] lg:absolute lg:inset-0 lg:z-0 lg:mt-0 lg:aspect-auto"
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-[52%] aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tea-100 sm:w-[70%] lg:left-[64%] lg:w-[min(44rem,52vw)]"
        />
        <HeroFallback hidden={ready} />

        {render3d && (
          <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
            <div ref={fade} className="absolute inset-0">
              <TeaScene
                active={inView}
                paused={paused}
                lowPower={lowPower}
                pointerEnabled={finePointer && !reduced && !phone}
                wide={wide}
                fadeRef={fade}
                onReady={() => setReady(true)}
                fixedT={fixedT}
              />
            </div>
          </div>
        )}

        {render3d && ready && fixedT === undefined && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="absolute bottom-3 right-3 z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-cream/85 px-4 text-sm font-semibold text-ink shadow-soft backdrop-blur hover:bg-white lg:bottom-6 lg:right-[var(--gutter)]"
          >
            {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
            {paused ? "Play animation" : "Pause animation"}
          </button>
        )}
      </div>
    </section>
  );
}
