"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArtImage } from "@/components/media/ArtImage";
import { Mountain, Wind, PackageCheck, Coffee, Volume2, VolumeX } from "lucide-react";
import type { ArtKind, ArtTone } from "@/types/catalog";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

interface ChapterData {
  n: string;
  phase: string;
  title: string;
  subtitle: string;
  body: string;
  stats: { label: string; value: string }[];
  accent: string;
  icon: typeof Mountain;
  image?: string;
  kind: ArtKind;
  tone: ArtTone;
}

const chapters: ChapterData[] = [
  {
    n: "01",
    phase: "Highland Dawn",
    title: "Sourcing from the Hills",
    subtitle: "Highland Terroir · 05:30 AM First Light",
    body: "Before morning mist lifts from the Srimangal valleys, skilled pluckers hand-harvest tender two-leaves-and-a-bud. We partner directly with historic single-estate gardens, choosing leaf for bold character, liquor clarity, and organic soil health.",
    stats: [
      { label: "Elevation", value: "1,450m ASL" },
      { label: "Standard", value: "Top Bud & 2 Leaves" },
      { label: "Terroir", value: "Srimangal Rainforest" },
    ],
    accent: "#A5BE16",
    icon: Mountain,
    image: "/images/image_sourching.webp",
    kind: "garden",
    tone: "deep",
  },
  {
    n: "02",
    phase: "Artisan Craft",
    title: "Withering & Orthodox Rolling",
    subtitle: "Slow Enzymatic Oxidation · 18 Hours",
    body: "The fresh leaf rests on open-air withering beds before being gently rolled in orthodox copper barrels to break cellular walls. Controlled fermentation unlocks natural muscatel florals and deep malty honey undertones.",
    stats: [
      { label: "Withering", value: "18h Ambient Air" },
      { label: "Technique", value: "Orthodox Gentle Roll" },
      { label: "Moisture Cut", value: "Strict 3% Target" },
    ],
    accent: "#D4A338",
    icon: Wind,
    image: "/images/image_processing.webp",
    kind: "leaf",
    tone: "deep",
  },
  {
    n: "03",
    phase: "Aroma Barrier",
    title: "Nitrogen Barrier Packaging",
    subtitle: "Zero Humidity · Airtight Freshness Lock",
    body: "Light and oxygen degrade delicate tea volatiles. Our leaves are hermetically packaged in food-grade barrier tins and nitrogen-flushed pouches, locking in garden-fresh aromatics until the seal is broken in your kitchen.",
    stats: [
      { label: "Protection", value: "99.8% Nitrogen Flush" },
      { label: "Format", value: "50g Tin to 10kg Bulk" },
      { label: "Purity", value: "Zero Plastic Contact" },
    ],
    accent: "#7EA835",
    icon: PackageCheck,
    image: "/images/image_packeging.webp",
    kind: "pack",
    tone: "deep",
  },
  {
    n: "04",
    phase: "The Tasting Ritual",
    title: "The Community Pour",
    subtitle: "Clay & Glass · Golden Amber Liquor",
    body: "The ultimate destination of the harvest: simmering water, the aroma of rising steam, and a shared glass that invites conversation. From contemplative morning cups to lively evening adda, Cha Nir is tea made to bring people together.",
    stats: [
      { label: "Optimal Temp", value: "95°C Steeping" },
      { label: "Liquor Hue", value: "Deep Amber Copper" },
      { label: "Heritage", value: "Bengali Adda Culture" },
    ],
    accent: "#E28743",
    icon: Coffee,
    kind: "ritual",
    tone: "warm",
  },
];

/**
 * Pinned four-chapter story: Dark-to-Dawn Terroir Journey (Concept 3).
 * Seamless scroll-driven timeline with real photography wipes, parallax depth,
 * interactive chapter spine, terroir telemetry chips, and opt-in ambient breeze sound.
 */
export function StoryChapters() {
  const root = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Web Audio organic breeze synthesizer (opt-in ambient soundscape)
  useEffect(() => {
    if (!soundEnabled) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.4);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Generate gentle pink noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.07;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to deep organic mountain breeze
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 1.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      gainNodeRef.current = gain;
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }

    return () => {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
      }
    };
  }, [soundEnabled]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", el);
      const copies = gsap.utils.toArray<HTMLElement>("[data-copy]", el);
      const arts = gsap.utils.toArray<HTMLElement>("[data-art]", el);
      const spineFill = el.querySelector<HTMLElement>("[data-spine-fill]");

      gsap.set(layers.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(copies.slice(1), { autoAlpha: 0, y: 48 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top 72px",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const idx = Math.min(
              chapters.length - 1,
              Math.floor(self.progress * chapters.length)
            );
            setActiveChapter(idx);
            if (spineFill) {
              spineFill.style.height = `${self.progress * 100}%`;
            }
          },
        },
      });

      // Subtle slow push-in on photography for depth
      tl.fromTo(arts, { scale: 1.12 }, { scale: 1.0, duration: chapters.length }, 0);

      // Scrubbed chapter reveal transitions
      for (let i = 1; i < chapters.length; i++) {
        const at = i - 0.12;
        tl.to(
          layers[i],
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power2.inOut" },
          at
        );
        tl.to(copies[i - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, at - 0.05);
        tl.to(copies[i], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.28);
      }
    });

    return () => mm.revert();
  }, []);

  const scrollToChapter = (index: number) => {
    if (!root.current) return;
    const rect = root.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const start = rect.top + scrollTop - 72;
    const totalDist = root.current.offsetHeight - window.innerHeight;
    const targetY = start + (index / (chapters.length - 1)) * totalDist;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      id="story"
      aria-label="From Bangladesh's tea gardens to your cup"
      className="relative h-[480svh] bg-night text-cream motion-reduce:h-auto"
    >
      <div className="sticky top-[var(--header-h)] h-[calc(100svh-var(--header-h))] overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:space-y-4 motion-reduce:overflow-visible">
        {chapters.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={c.n}
              data-layer
              className="absolute inset-0 motion-reduce:relative motion-reduce:h-[80svh]"
            >
              {/* Background Photography with slow zoom */}
              <div data-art className="absolute inset-0">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    priority={i === 0}
                    className="size-full object-cover object-center"
                    sizes="100vw"
                  />
                ) : (
                  <ArtImage
                    kind={c.kind}
                    tone={c.tone}
                    seed={i + 14}
                    className="absolute inset-0 size-full"
                  />
                )}
              </div>

              {/* Cinematic Vignette Gradients */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/20"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/40 to-transparent"
              />

              {/* Chapter Narrative & Telemetry Content */}
              <div
                data-copy
                className="container-x absolute inset-x-0 bottom-0 pb-[10svh] motion-reduce:pb-12 z-10"
              >
                <div className="max-w-2xl">
                  {/* Phase & Terroir Tag */}
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-night/70 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                    <span
                      className="size-2 rounded-full animate-pulse"
                      style={{ backgroundColor: c.accent }}
                      aria-hidden
                    />
                    <Icon className="size-3.5" style={{ color: c.accent }} aria-hidden />
                    <span className="font-bold uppercase tracking-wider text-xs text-cream">
                      {c.phase}
                    </span>
                    <span className="text-cream/40" aria-hidden>·</span>
                    <span className="text-cream/80">{c.subtitle}</span>
                  </div>

                  {/* Watermarked Chapter Numeral & Heading */}
                  <div className="relative">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -left-4 -top-16 font-display text-[clamp(6rem,18vw,14rem)] italic leading-none opacity-20 select-none"
                      style={{ color: c.accent }}
                    >
                      {c.n}
                    </span>
                    <h2 className="t-h1 relative -mt-2 text-balance text-cream drop-shadow-sm">
                      {c.title}
                    </h2>
                  </div>

                  {/* Narrative Prose */}
                  <p className="mt-3.5 max-w-xl text-base sm:text-lg text-cream/85 text-pretty leading-relaxed">
                    {c.body}
                  </p>

                  {/* Terroir & Processing Telemetry Chips */}
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {c.stats.map((st) => (
                      <div
                        key={st.label}
                        className="rounded-xl border border-cream/10 bg-white/5 px-3 py-1.5 backdrop-blur-xs transition-colors hover:bg-white/10"
                      >
                        <span className="block text-xs font-bold uppercase tracking-wider text-cream/50">
                          {st.label}
                        </span>
                        <span className="block text-xs font-semibold text-cream">
                          {st.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Top Controls: Provenance Note & Ambient Breeze Audio Toggle */}
        <div className="absolute right-[var(--gutter)] top-6 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-pressed={soundEnabled}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer shadow-soft",
              soundEnabled
                ? "border-lime-400/40 bg-lime-400/20 text-lime-300"
                : "border-cream/15 bg-night/60 text-cream/75 hover:bg-night/90 hover:text-cream"
            )}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5 text-lime-300" aria-hidden />
            ) : (
              <VolumeX className="size-3.5" aria-hidden />
            )}
            <span>{soundEnabled ? "Breeze Audio: On" : "Ambient Breeze"}</span>
          </button>

          <p className="rounded-full border border-cream/15 bg-night/60 px-4 py-1.5 text-xs font-medium text-cream/70 backdrop-blur-md max-lg:hidden">
            Documented single-estate harvest narrative
          </p>
        </div>

        {/* Interactive Vertical Timeline Spine (Desktop Right) */}
        <nav
          aria-label="Story chapter navigation"
          className="absolute bottom-[10svh] right-[var(--gutter)] z-20 hidden md:flex items-center gap-4"
        >
          {/* Chapter Station Buttons */}
          <div className="flex flex-col gap-3">
            {chapters.map((ch, idx) => {
              const isActive = idx === activeChapter;
              return (
                <button
                  key={ch.n}
                  type="button"
                  onClick={() => scrollToChapter(idx)}
                  className={cn(
                    "group flex items-center justify-end gap-3 text-right transition-all duration-200 cursor-pointer",
                    isActive ? "opacity-100" : "opacity-45 hover:opacity-80"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <div className="hidden lg:flex flex-col items-end">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: isActive ? ch.accent : "currentColor" }}
                    >
                      {ch.phase}
                    </span>
                    <span className="text-xs font-medium text-cream/90">{ch.title}</span>
                  </div>
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                      isActive
                        ? "text-night shadow-sm scale-110"
                        : "border border-cream/20 bg-night/60 text-cream/70 group-hover:border-cream/40"
                    )}
                    style={isActive ? { backgroundColor: ch.accent } : undefined}
                  >
                    {ch.n}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Vertical scrub progress track */}
          <div
            aria-hidden
            className="relative h-44 w-1 rounded-full bg-cream/15 overflow-hidden"
          >
            <div
              data-spine-fill
              className="absolute left-0 top-0 w-full rounded-full bg-lime-400 transition-all duration-150 ease-out"
              style={{ height: `${((activeChapter + 1) / chapters.length) * 100}%` }}
            />
          </div>
        </nav>
      </div>
    </section>
  );
}
