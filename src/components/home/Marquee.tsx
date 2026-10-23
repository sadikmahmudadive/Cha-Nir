const ITEMS = [
  "Pure",
  "Organic",
  "Deshi",
  "Straight from Bangladesh's gardens",
  "Wholesale & retail",
  "খাঁটি চা",
  "Packed in-house",
  "Tea stalls · Shops · Hotels · Homes",
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          <span className="px-8 font-serif text-xl italic sm:text-2xl">{t}</span>
          <svg viewBox="0 0 24 24" className="size-5 text-lime" aria-hidden>
            <path d="M12 2C6 8 4 14 12 22c8-8 6-14 0-20Z" fill="currentColor" />
          </svg>
        </li>
      ))}
    </ul>
  );
}

export function Marquee() {
  return (
    <section aria-label="What we stand for" className="overflow-hidden bg-leaf py-5 text-cream">
      <div className="marquee-track">
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
