"use client";

import { useSyncExternalStore } from "react";

/**
 * Decides whether a WebGL scene should render at all.
 * 3D is an enhancement: commerce must work (and look intentional) without it.
 *   ?3d=off  force the static fallback (useful for testing)
 *   ?3d=on   skip device heuristics
 */
export type Capability = "unknown" | "yes" | "no";

let cached: Capability | null = null;

function detect(): Capability {
  if (cached) return cached;
  try {
    const q = new URLSearchParams(window.location.search).get("3d");
    if (q === "off") return (cached = "no");
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return (cached = "no");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (q === "on") return (cached = "yes");

    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return (cached = "no");
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return (cached = "no");
    if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return (cached = "no");
    return (cached = "yes");
  } catch {
    return (cached = "no");
  }
}

const noopSubscribe = () => () => {};

export function useCapability(): Capability {
  return useSyncExternalStore(noopSubscribe, detect, () => "unknown" as Capability);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Fine pointer + hover = desktop-like: enable mouse-responsive camera. */
export function useHasFinePointer(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(hover: hover) and (pointer: fine)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false,
  );
}
