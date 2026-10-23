/**
 * Quiet, natural backdrop for the hero: warm sun-wash, soft sage pooling, grain and
 * two blurred tea-branch shadows that sway very slowly (as if cast through a window).
 * Purely decorative and aria-hidden; motion is switched off for reduced-motion users.
 */
function Branch({ className }: { className?: string }) {
  const leaf = "M0 0 C 26 -14 60 -10 82 12 C 58 22 24 22 0 0 Z";
  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden fill="currentColor">
      <path d="M8 250 C 70 190 150 140 300 40" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
      {[
        [60, 205, -20, 0.9], [110, 170, 30, 1], [150, 140, -25, 1.05], [196, 108, 28, 1],
        [236, 80, -22, 0.95], [274, 54, 24, 0.85], [92, 196, 160, 0.8], [168, 150, 150, 0.9],
      ].map(([x, y, r, s], i) => (
        <path key={i} d={leaf} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} />
      ))}
    </svg>
  );
}

export function HeroNature() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_78%_22%,rgba(205,224,92,0.20),transparent_70%),radial-gradient(60%_55%_at_8%_95%,rgba(180,198,144,0.38),transparent_70%),radial-gradient(40%_40%_at_50%_0%,rgba(255,236,190,0.35),transparent_70%)]" />
      <Branch className="absolute -right-10 -top-10 w-[34rem] origin-top-right rotate-[8deg] text-tea-700/[0.09] blur-[3px] motion-safe:animate-[sway_9s_ease-in-out_infinite] max-lg:w-[22rem]" />
      <Branch className="absolute -bottom-16 -left-14 w-[30rem] origin-bottom-left -rotate-[24deg] scale-x-[-1] text-tea-700/[0.08] blur-[4px] motion-safe:animate-[sway_12s_ease-in-out_infinite_reverse] max-lg:w-[18rem]" />
      <div className="grain absolute inset-0 opacity-70 mix-blend-multiply" />
    </div>
  );
}
