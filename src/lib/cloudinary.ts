/**
 * Cloudinary helpers. Only the public cloud name is used client-side.
 * Uploads must be signed on the server (route handler) - never ship API secrets.
 */
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const cloudinaryEnabled = Boolean(cloud);

/**
 * Build an optimised Cloudinary delivery URL from a public id.
 * `f_auto,q_auto` lets Cloudinary pick AVIF/WebP and a sensible quality.
 * Absolute URLs and local paths pass through untouched.
 */
export function cldUrl(src: string, opts: { w?: number; h?: number; crop?: "fill" | "fit" } = {}) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  if (!cloud) return src;
  const t = ["f_auto", "q_auto", opts.w && `w_${opts.w}`, opts.h && `h_${opts.h}`, opts.crop && `c_${opts.crop}`]
    .filter(Boolean)
    .join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${src}`;
}

/** next/image loader: Cloudinary handles resizing, so Next does not re-encode. */
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${quality ?? "auto"},w_${width}/${src}`;
}
