"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useState } from "react";

const CHAPTERS = [
  {
    n: "01",
    title: "The garden",
    body: "Cool hills and morning mist. Our tea starts where the air is soft and the leaf grows slow.",
    image: "/img/garden-mist.webp",
    alt: "Rolling green tea hills lost in morning mist",
    pos: "50% 60%",
  },
  {
    n: "02",
    title: "The pluck",
    body: "Young leaf and bud, picked by hand at first light, because the cup is only as good as the pluck.",
    image: "/img/picker.webp",
    alt: "A picker in a conical hat plucking tea leaf on a hillside",
    pos: "60% 50%",
  },
  {
    n: "03",
    title: "The factory",
    body: "Fresh leaf is withered, rolled and dried within hours, so the flavour stays bright and alive.",
    image: "/img/factory-withering.webp",
    alt: "Troughs of fresh green leaf withering inside the tea factory",
    pos: "50% 50%",
  },
  {
    n: "04",
    title: "The pack",
    body: "We grade, blend and seal every pack ourselves, from a 50 g home pouch to a 25 kg stall sack.",
    image: "/img/kraft-spill.webp",
    alt: "Black tea spilling from a kraft pack onto a wooden surface",
    pos: "50% 55%",
  },
  {
    n: "05",
    title: "The cup",
    body: "Then it's yours. Ready in three minutes and warm for as long as the conversation lasts.",
    image: "/img/cup-steam.webp",
    alt: "A steaming cup of tea on a wooden table",
    pos: "50% 55%",
  },
] as const;

const N = CHAPTERS.length;

function Chapter({
  i,
  progress,
}: {
  i: number;
  progress: MotionValue<number>;
}) {
  const a = i / N;
  const b = (i + 1) / N;
  const fade = 0.05;
  const first = i === 0;
  const last = i === N - 1;

  // Keyframe offsets must stay inside 0..1, so the first and last chapters
  // drop their outer fade point instead of using a negative / >1 offset.
  const inRange = [
    ...(first ? [] : [a - fade]),
    a + fade,
    b - fade,
    ...(last ? [] : [b + fade]),
  ];
  const lo = first ? 0 : a - fade;
  const hi = last ? 1 : b + fade;
  const fadeIn = (inV: number) => (first ? [] : [inV]);
  const fadeOut = (outV: number) => (last ? [] : [outV]);

  const opacity = useTransform(progress, inRange, [...fadeIn(0), 1, 1, ...fadeOut(0)]);
  const scale = useTransform(progress, [lo, hi], [1.16, 1.02]);
  const textY = useTransform(progress, inRange, [...fadeIn(48), 0, 0, ...fadeOut(-48)]);
  const c = CHAPTERS[i];

  return (
    <motion.div style={{ opacity }} className="absolute inset-0" aria-hidden={undefined}>
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src={c.image}
          alt={c.alt}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: c.pos }}
          priority={first}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-leaf-deep/95 via-leaf-deep/45 to-leaf-deep/10 lg:bg-gradient-to-r lg:from-leaf-deep/90 lg:via-leaf-deep/40 lg:to-transparent" />
      <div className="container-x absolute inset-0 flex items-end pb-20 lg:items-center lg:pb-0">
        <motion.div style={{ y: textY }} className="max-w-xl">
          <p className="font-serif text-7xl italic leading-none text-lime sm:text-8xl">{c.n}</p>
          <h3 className="mt-3 text-4xl text-cream sm:text-6xl">{c.title}</h3>
          <p className="mt-4 max-w-md text-lg text-cream/90">{c.body}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setActive(Math.min(N - 1, Math.max(0, Math.floor(p * N)))),
  );
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="story"
      aria-label="From garden to cup"
      ref={ref}
      className="relative bg-leaf-deep"
      style={{ height: `${N * 90}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {CHAPTERS.map((_, i) => (
          <Chapter key={i} i={i} progress={scrollYProgress} />
        ))}

        <p className="eyebrow absolute left-0 right-0 top-24 z-10 text-center !text-lime lg:top-28">
          <span className="container-x block text-left">From garden to counter</span>
        </p>

        {/* progress rail */}
        <div
          className="absolute bottom-6 right-5 z-10 flex items-center gap-3 lg:bottom-auto lg:right-8 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col"
          aria-hidden
        >
          {CHAPTERS.map((c, i) => (
            <span
              key={c.n}
              className={`block rounded-full transition-all duration-300 ${
                i === active ? "h-2.5 w-8 bg-lime lg:h-8 lg:w-2.5" : "size-2.5 bg-cream/50"
              }`}
            />
          ))}
        </div>
        <motion.div
          aria-hidden
          style={{ scaleX: barScale }}
          className="absolute inset-x-0 bottom-0 z-10 h-1 origin-left bg-lime"
        />
      </div>
    </section>
  );
}
