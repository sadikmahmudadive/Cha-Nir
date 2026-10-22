"use client";

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { Photo } from "@/components/media/Photo";
import { cn } from "@/lib/cn";
import type { ImageRef } from "@/types/catalog";
import { useCapability, usePrefersReducedMotion } from "./capability";

const ViewerScene = dynamic(() => import("./ViewerScene"), { ssr: false });

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const SCALE_BY_LABEL: Record<string, number> = { "50 g": 0.72, "100 g": 0.82, "250 g": 1, "500 g": 1.12, "1 kg": 1.25 };

/**
 * Optional 3D product viewer. Always renders a static product image first
 * (no layout shift, works without WebGL), then upgrades to 3D after the user
 * opts in, so the model is never downloaded for people who don't want it.
 *
 * Product info, price, variant, quantity and purchase controls stay in HTML.
 */
export function ProductViewer({
  fallback,
  variantLabel,
  modelUrl,
  className,
}: {
  fallback: ImageRef;
  variantLabel: string;
  modelUrl?: string;
  className?: string;
}) {
  const cap = useCapability();
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  const supported = cap === "yes" && !failed;

  return (
    <div className={cn("relative overflow-hidden rounded-card bg-tea-50", className)}>
      <div className={cn("transition-opacity duration-500", on && supported && ready && "opacity-0")}>
        <Photo image={fallback} ratio="1/1" rounded={false} sizes="(min-width:1024px) 50vw, 100vw" />
      </div>

      {on && supported && (
        <div className={cn("absolute inset-0 transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}>
          <Boundary onError={() => setFailed(true)}>
            <ViewerScene
              modelUrl={modelUrl}
              scale={SCALE_BY_LABEL[variantLabel] ?? 1}
              zoom={zoom}
              autoRotate={!reduced}
              resetKey={resetKey}
              onReady={() => setReady(true)}
            />
          </Boundary>
        </div>
      )}

      {on && supported && !ready && (
        <div className="absolute inset-0 grid place-items-center bg-tea-50/70" role="status">
          <span className="flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-medium shadow-soft">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Loading 3D view…
          </span>
        </div>
      )}

      {!on && cap !== "no" && (
        <button
          type="button"
          onClick={() => setOn(true)}
          className="absolute bottom-3 left-1/2 min-h-12 -translate-x-1/2 cursor-pointer rounded-full bg-tea-900 px-6 text-sm font-bold text-cream shadow-lift hover:bg-tea-800"
        >
          View in 3D
        </button>
      )}

      {on && supported && ready && (
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          <p className="rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium text-ink-soft">Drag to rotate</p>
          <div className="flex gap-1.5" role="group" aria-label="3D view controls">
            {[
              { label: "Zoom out", icon: Minus, act: () => setZoom((z) => Math.max(0.8, +(z - 0.25).toFixed(2))) },
              { label: "Zoom in", icon: Plus, act: () => setZoom((z) => Math.min(1.8, +(z + 0.25).toFixed(2))) },
              { label: "Reset view", icon: RotateCcw, act: () => { setZoom(1); setResetKey((k) => k + 1); } },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.act}
                aria-label={b.label}
                className="tap grid cursor-pointer place-items-center rounded-full bg-cream/90 text-ink shadow-soft hover:bg-white"
              >
                <b.icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      )}

      {failed && (
        <p role="alert" className="absolute inset-x-3 bottom-3 rounded-full bg-warn-bg px-4 py-2 text-center text-xs font-medium text-warn">
          3D view isn&rsquo;t available on this device. Showing the product image.
        </p>
      )}
    </div>
  );
}
