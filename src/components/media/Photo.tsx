import Image from "next/image";
import { cn } from "@/lib/cn";
import { cloudinaryLoader } from "@/lib/cloudinary";
import type { ImageRef } from "@/types/catalog";
import { ArtImage } from "./ArtImage";

/**
 * Single entry point for every photo slot.
 * - With `image.src` (Cloudinary public id or URL): optimised next/image with lazy loading.
 * - Without: a designed brand placeholder (see ArtImage).
 * The wrapper always reserves its aspect ratio so images never shift layout.
 */
export function Photo({
  image,
  ratio = "4/5",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  className,
  seed,
  rounded = true,
  decorative,
  fill,
}: {
  image: ImageRef;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  seed?: number;
  rounded?: boolean;
  decorative?: boolean;
  /** Fill the (positioned) parent instead of reserving its own aspect ratio. */
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-cream-deep",
        fill ? "absolute inset-0" : "relative",
        rounded && "rounded-card",
        className,
      )}
      style={fill ? undefined : { aspectRatio: ratio }}
      role={image.src || decorative ? undefined : "img"}
      aria-label={image.src || decorative ? undefined : image.alt}
    >
      {image.src ? (
        <Image
          loader={image.src.startsWith("/") ? undefined : cloudinaryLoader}
          src={image.src}
          alt={decorative ? "" : image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <ArtImage kind={image.kind} tone={image.tone} seed={seed} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
