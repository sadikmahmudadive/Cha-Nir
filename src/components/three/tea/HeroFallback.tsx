import { cn } from "@/lib/cn";

/**
 * Static hero image: a pre-rendered frame of the final composition (box, tea,
 * steam) captured from the real 3D scene. It is the LCP element, is always in
 * the DOM (no layout shift), and is what visitors get when WebGL is missing,
 * the device is constrained, data-saver is on, or reduced motion is requested.
 * The wide crop leaves the left side clear for the headline.
 */
export function HeroFallback({ hidden, className }: { hidden?: boolean; className?: string }) {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet="/hero/tea-ritual-wide.webp" type="image/webp" />
      <img
        src="/hero/tea-ritual-square.webp"
        alt={hidden ? "" : "A Cha Nir tea carton, a glass of freshly brewed black tea and loose tea leaves, with steam rising"}
        width={1000}
        height={1000}
        fetchPriority="high"
        decoding="async"
        className={cn(
          "absolute inset-0 size-full object-cover object-center transition-opacity duration-700 lg:object-[60%_55%]",
          hidden && "opacity-0",
          className,
        )}
      />
    </picture>
  );
}
