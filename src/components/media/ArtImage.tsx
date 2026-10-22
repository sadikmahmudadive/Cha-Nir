import { useId } from "react";
import type { ArtKind, ArtTone } from "@/types/catalog";

/**
 * Designed image placeholders.
 *
 * The brief calls for real photography (Cloudinary). Until that is supplied,
 * every image slot renders one of these deterministic SVG compositions in the
 * brand palette, sized by the container with `slice` cropping (like
 * object-fit: cover). Real images drop in through <Photo src="…" /> with no
 * layout change. These are placeholders, not documentary imagery.
 */

/** Round to 1 decimal so Math.sin/cos last-digit differences between Node and browsers cannot cause hydration mismatches. */
const q = (n: number) => Math.round(n * 10) / 10;

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const T = {
  light: { bg1: "#F7F4E9", bg2: "#E4EBD0", ink: "#536D3B", glow: "#FFFDF2" },
  deep: { bg1: "#2C3A20", bg2: "#182011", ink: "#A5BE16", glow: "#4B6334" },
  warm: { bg1: "#F2E2C0", bg2: "#DDB77A", ink: "#6B3F18", glow: "#FFF1D2" },
} as const;

export function ArtImage({
  kind,
  tone = "light",
  seed = 7,
  className,
  bare,
}: {
  kind: ArtKind;
  tone?: ArtTone;
  seed?: number;
  className?: string;
  /** Omit the background so the subject can sit on any surface (used by the hero fallback). */
  bare?: boolean;
}) {
  const raw = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${raw}`;
  const p = T[tone];
  const sd = seed * 97 + kind.length * 31 + tone.length;

  return (
    <svg
      viewBox="0 0 800 1000"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.bg1} />
          <stop offset="1" stopColor={p.bg2} />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("tea")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D98A2B" />
          <stop offset="1" stopColor="#8E3F10" />
        </linearGradient>
        <linearGradient id={id("pouch")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {!bare && <rect width="800" height="1000" fill={`url(#${id("bg")})`} />}
      {!bare && <rect width="800" height="1000" fill={`url(#${id("glow")})`} />}

      {kind === "garden" && <Garden sd={sd} tone={tone} />}
      {kind === "leaf" && <Leaves sd={sd} tone={tone} />}
      {kind === "glass" && <Glass idt={id("tea")} tone={tone} sd={sd} />}
      {kind === "cup" && <Cup idt={id("tea")} sd={sd} tone={tone} />}
      {kind === "pack" && <Pack idp={id("pouch")} tone={tone} seed={seed} />}
      {kind === "bulk" && <Bulk tone={tone} />}
      {kind === "ritual" && <Ritual idt={id("tea")} tone={tone} />}
      {kind === "stall" && <Stall idt={id("tea")} />}
    </svg>
  );
}

/* ── Tea garden hills with bush rows ─────────────────────── */
function Garden({ sd, tone }: { sd: number; tone: ArtTone }) {
  const r = rng(sd);
  const layers =
    tone === "deep"
      ? ["#34452A", "#2C3A20", "#243019", "#182011"]
      : ["#D4DFBB", "#B4C690", "#8AA261", "#536D3B"];
  const rows = (y: number, color: string, n: number, amp: number, gap: number) =>
    Array.from({ length: n }, (_, k) => {
      const yy = y + 30 + k * gap;
      const a = amp * (1 + k * 0.12);
      return (
        <path
          key={k}
          d={`M-20 ${yy} C 160 ${yy - a}, 330 ${yy + a * 0.6}, 520 ${yy - a * 0.5} S 760 ${yy + a * 0.2}, 840 ${yy - a * 0.3}`}
          stroke={color}
          strokeWidth={5 + k * 1.2}
          strokeDasharray={`${3 + k} ${9 + k * 2.2}`}
          strokeLinecap="round"
          fill="none"
          opacity={0.75}
        />
      );
    });
  return (
    <g>
      <circle cx="590" cy="300" r="72" fill={tone === "deep" ? "#A5BE16" : "#FFFDF2"} opacity={tone === "deep" ? 0.55 : 0.9} />
      <path d="M0 470 C 140 400 260 440 400 390 S 700 380 800 420 V1000 H0Z" fill={layers[0]} />
      <path d="M0 540 C 150 470 300 530 470 470 S 700 480 800 500 V1000 H0Z" fill={layers[1]} />
      {rows(540, "#ffffff22", 3, 18, 26)}
      <path d="M0 660 C 170 590 330 650 520 600 S 720 610 800 630 V1000 H0Z" fill={layers[2]} />
      {rows(660, "#ffffff2e", 4, 22, 30)}
      <path d="M0 800 C 200 740 380 800 560 750 S 740 760 800 780 V1000 H0Z" fill={layers[3]} />
      {rows(800, "#A5BE1666", 5, 26, 34)}
      <rect y="440" width="800" height="90" fill="#fff" opacity="0.14" />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={r() * 800} cy={380 + r() * 80} rx={90 + r() * 120} ry={7} fill="#fff" opacity={0.2} />
      ))}
    </g>
  );
}

/* ── Loose tea leaves ────────────────────────────────────── */
function Leaves({ sd, tone }: { sd: number; tone: ArtTone }) {
  const r = rng(sd);
  const cols =
    tone === "warm"
      ? ["#5B3A1E", "#7A4C25", "#9A6330", "#3D2514", "#B57A3C"]
      : ["#1B130E", "#3A2518", "#52341F", "#6B4527", "#8A5A2F", "#2A1B10"];
  const strands = Array.from({ length: 70 }, (_, i) => {
    const x = q(r() * 800);
    const y = q(80 + r() * 900);
    const len = q(70 + r() * 90);
    const a = r() * Math.PI * 2;
    const c1 = q((r() - 0.5) * 90);
    const c2 = q((r() - 0.5) * 90);
    const x2 = q(x + Math.cos(a) * len);
    const y2 = q(y + Math.sin(a) * len);
    const w = q(8 + r() * 10);
    return (
      <g key={i}>
        <path
          d={`M${x} ${y} Q ${q(x + Math.cos(a) * len * 0.5 + c1)} ${q(y + Math.sin(a) * len * 0.5 + c2)} ${x2} ${y2}`}
          stroke={cols[Math.floor(r() * cols.length)]}
          strokeWidth={w}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${q(x + 1)} ${q(y - 1)} Q ${q(x + Math.cos(a) * len * 0.5 + c1 + 2)} ${q(y + Math.sin(a) * len * 0.5 + c2 - 2)} ${q(x2 - 3)} ${q(y2 - 2)}`}
          stroke="#E7B36A"
          strokeWidth={q(w * 0.18)}
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
      </g>
    );
  });
  return (
    <g>
      <rect width="800" height="1000" fill={tone === "warm" ? "#3A2616" : "#20160F"} opacity={tone === "light" ? 0 : 0.92} />
      {strands}
      <rect width="800" height="1000" fill="#000" opacity="0.12" />
    </g>
  );
}

/* ── Glass of tea ────────────────────────────────────────── */
function Glass({ idt, tone, sd }: { idt: string; tone: ArtTone; sd: number }) {
  const r = rng(sd);
  const ink = tone === "deep" ? "#F7F4E9" : "#fff";
  return (
    <g>
      <rect y="760" width="800" height="240" fill={tone === "deep" ? "#243019" : "#8B6034"} opacity={tone === "deep" ? 1 : 0.55} />
      <ellipse cx="400" cy="765" rx="180" ry="22" fill="#000" opacity="0.18" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${350 + i * 40} 300 C ${320 + i * 40 + r() * 30} 230, ${400 + i * 20} 200, ${370 + i * 45} 120`}
          stroke={ink}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.28"
        />
      ))}
      <path d="M300 340 L330 740 Q335 765 360 765 L440 765 Q465 765 470 740 L500 340 Z" fill={ink} opacity="0.22" />
      <path d="M306 400 L333 735 Q337 756 360 756 L440 756 Q463 756 467 735 L494 400 Z" fill={`url(#${idt})`} />
      <path d="M318 410 L335 700" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity="0.45" />
      <path d="M300 340 L330 740 Q335 765 360 765 L440 765 Q465 765 470 740 L500 340" stroke={ink} strokeWidth="5" fill="none" opacity="0.7" />
      <ellipse cx="400" cy="400" rx="94" ry="14" fill="#E9A74C" />
      <ellipse cx="400" cy="340" rx="100" ry="13" fill="none" stroke={ink} strokeWidth="5" opacity="0.7" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${360 + r() * 80} ${700 + r() * 40} q 12 -10 24 2`} stroke="#3A2010" strokeWidth="8" strokeLinecap="round" fill="none" />
      ))}
    </g>
  );
}

/* ── Cup from above ──────────────────────────────────────── */
function Cup({ idt, sd, tone }: { idt: string; sd: number; tone: ArtTone }) {
  const r = rng(sd);
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + r();
        const d = 320 + r() * 110;
        const cx = q(400 + Math.cos(a) * d);
        const cy = q(500 + Math.sin(a) * d);
        return (
          <ellipse key={i} cx={cx} cy={cy} rx={26} ry={9} fill="#3A2010" opacity={0.75} transform={`rotate(${q(r() * 180)} ${cx} ${cy})`} />
        );
      })}
      <circle cx="400" cy="520" r="285" fill="#000" opacity="0.14" />
      <circle cx="400" cy="500" r="280" fill={tone === "deep" ? "#E9EEDB" : "#FFFDF7"} />
      <circle cx="400" cy="500" r="248" fill="none" stroke="#536D3B" strokeWidth="3" opacity="0.35" />
      <path d="M560 470 q 90 -10 90 30 t -90 30" fill="none" stroke="#FFFDF7" strokeWidth="34" strokeLinecap="round" />
      <circle cx="400" cy="500" r="190" fill="#FFFDF7" stroke="#D8D2BE" strokeWidth="3" />
      <circle cx="400" cy="500" r="158" fill={`url(#${idt})`} />
      <circle cx="400" cy="500" r="158" fill="none" stroke="#fff" strokeWidth="5" opacity="0.3" />
      <ellipse cx="350" cy="450" rx="46" ry="22" fill="#fff" opacity="0.28" transform="rotate(-30 350 450)" />
    </g>
  );
}

/** Stable numeric seed from a string id (used to vary placeholder packs per product). */
export function hashSeed(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) % 997;
}

const accents = ["#A5BE16", "#E0A030", "#7FB069", "#D8744F", "#E7C34A", "#9CCBD8"];

/* ── Stand-up pouch with the Cha Nir logo ────────────────── */
function Pack({ idp, tone, seed }: { idp: string; tone: ArtTone; seed: number }) {
  const accent = accents[seed % accents.length];
  const body = tone === "deep" ? "#F1ECD9" : tone === "warm" ? "#435830" : "#536D3B";
  return (
    <g>
      <ellipse cx="400" cy="860" rx="230" ry="26" fill="#000" opacity="0.2" />
      <path
        d="M215 250 Q 400 215 585 250 L 612 800 Q 612 850 565 856 Q 400 872 235 856 Q 188 850 188 800 Z"
        fill={body}
      />
      <path d="M215 250 Q 400 215 585 250 L 588 292 Q 400 262 212 292 Z" fill="#000" opacity="0.16" />
      <path d="M212 292 Q 400 262 588 292" stroke="#fff" strokeWidth="2" opacity="0.25" fill="none" />
      <path d="M222 330 Q 400 302 578 330" stroke="#fff" strokeWidth="2" strokeDasharray="3 6" opacity="0.25" fill="none" />
      <rect x="236" y="400" width="328" height="330" rx="30" fill="#F7F4E9" />
      <image href="/brand/logo.webp" x="246" y="420" width="308" height="290" preserveAspectRatio="xMidYMid meet" />
      <path d="M215 250 Q 400 215 585 250 L 612 800 Q 612 850 565 856 Q 400 872 235 856 Q 188 850 188 800 Z" fill={`url(#${idp})`} />
      <path d="M224 800 Q 400 826 576 800" stroke={accent} strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.95" />
    </g>
  );
}

/* ── Bulk packs ──────────────────────────────────────────── */
function Bulk({ tone }: { tone: ArtTone }) {
  const kraft = tone === "warm" ? "#C79A5E" : "#B88A52";
  const sack = (x: number, y: number, s: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="0" cy="250" rx="170" ry="20" fill="#000" opacity="0.2" />
      <path d="M-150 -170 Q 0 -200 150 -170 L 168 220 Q 168 252 130 254 L -130 254 Q -168 252 -168 220 Z" fill={kraft} />
      <path d="M-150 -170 Q 0 -200 150 -170 L 152 -130 Q 0 -160 -152 -130 Z" fill="#000" opacity="0.14" />
      <path d="M-140 -120 Q 0 -150 140 -120" stroke="#3A2616" strokeWidth="3" strokeDasharray="6 8" fill="none" opacity="0.5" />
      <rect x="-110" y="-70" width="220" height="230" rx="18" fill="#F7F4E9" />
      <image href="/brand/logo.webp" x="-100" y="-62" width="200" height="214" preserveAspectRatio="xMidYMid meet" />
      <path d="M-150 -170 Q 0 -200 150 -170 L 168 220 Q 168 252 130 254 L -130 254 Q -168 252 -168 220 Z" fill="#fff" opacity="0.05" />
    </g>
  );
  return (
    <g>
      {sack(255, 470, 0.7, -4)}
      {sack(550, 430, 0.78, 3)}
      {sack(400, 690, 0.66, 0)}
    </g>
  );
}

/* ── Tea being served ────────────────────────────────────── */
function Ritual({ idt, tone }: { idt: string; tone: ArtTone }) {
  const pot = tone === "deep" ? "#F1ECD9" : "#536D3B";
  return (
    <g>
      <rect y="700" width="800" height="300" fill="#000" opacity="0.1" />
      <g transform="rotate(-18 280 400)">
        <ellipse cx="270" cy="400" rx="130" ry="105" fill={pot} />
        <path d="M385 380 Q 470 330 520 250 L 540 262 Q 490 360 395 430 Z" fill={pot} />
        <path d="M150 360 q -70 10 -50 90 q 20 40 70 20" fill="none" stroke={pot} strokeWidth="26" strokeLinecap="round" />
        <ellipse cx="270" cy="305" rx="64" ry="22" fill={pot} />
        <circle cx="270" cy="278" r="16" fill="#A5BE16" />
        <path d="M180 380 Q 270 350 360 380" stroke="#fff" strokeWidth="8" opacity="0.2" fill="none" strokeLinecap="round" />
      </g>
      <path d="M525 258 C 560 330, 590 420, 580 560" stroke="#D98A2B" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M505 560 L 520 740 Q 523 760 545 760 L 615 760 Q 637 760 640 740 L 655 560 Z" fill="#fff" opacity="0.28" />
      <path d="M510 610 L 522 735 Q 525 752 545 752 L 615 752 Q 635 752 638 735 L 650 610 Z" fill={`url(#${idt})`} />
      <ellipse cx="580" cy="560" rx="75" ry="10" fill="#fff" opacity="0.5" />
    </g>
  );
}

/* ── Tea stall counter ───────────────────────────────────── */
function Stall({ idt }: { idt: string }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${i * 100} 170 h100 l-14 120 h-72 z`} fill={i % 2 ? "#F7F4E9" : "#536D3B"} />
      ))}
      <rect y="170" width="800" height="14" fill="#2C3A20" />
      <rect y="620" width="800" height="380" fill="#6B4527" />
      <rect y="620" width="800" height="16" fill="#8A5A2F" />
      <g transform="translate(140 410)">
        <ellipse cx="90" cy="200" rx="100" ry="14" fill="#000" opacity="0.25" />
        <path d="M0 60 Q 90 -10 180 60 L 170 200 L 10 200 Z" fill="#9AA0A6" />
        <path d="M170 90 q 70 -10 70 60" fill="none" stroke="#9AA0A6" strokeWidth="18" strokeLinecap="round" />
        <rect x="70" y="-14" width="40" height="24" rx="8" fill="#6C7278" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${470 + i * 70} 520)`}>
          <path d="M0 0 L 8 100 Q 9 106 16 106 L 36 106 Q 43 106 44 100 L 52 0 Z" fill="#fff" opacity="0.5" />
          <path d="M3 22 L 9 98 Q 10 102 16 102 L 36 102 Q 42 102 43 98 L 49 22 Z" fill={`url(#${idt})`} />
        </g>
      ))}
    </g>
  );
}
