"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import { TeaBox } from "./TeaBox";
import { TeaCamera } from "./TeaCamera";
import { TeaGlass } from "./TeaGlass";
import { TeaLeafSystem } from "./TeaLeafSystem";
import { TeaLighting } from "./TeaLighting";
import { TeaLiquid } from "./TeaLiquid";
import { TeaSteamSystem } from "./TeaSteamSystem";
import { LOOP, loopOpacity, makeLeafPlans } from "./timeline";

export interface TeaSceneProps {
  /** Scene is on-screen and tab visible: render. Otherwise rendering stops. */
  active: boolean;
  /** User pressed "pause": freeze the timeline on the current frame. */
  paused: boolean;
  /** Phone-class device: fewer particles, cheaper shader, fixed camera. */
  lowPower: boolean;
  /** Pointer parallax (fine pointers only). */
  pointerEnabled: boolean;
  /** Wide layout: pan composition right to leave headline space. */
  wide: boolean;
  /** Dissolve wrapper that receives the loop's fade opacity. */
  fadeRef: RefObject<HTMLDivElement | null>;
  onReady: () => void;
  /** Debug/capture: freeze at this time (seconds). */
  fixedT?: number;
}

/** Advances the single shared clock, applies the loop dissolve, exposes capture. */
function Director({
  tRef,
  pausedRef,
  startedRef,
  fadeRef,
  fixedT,
}: {
  tRef: MutableRefObject<number>;
  pausedRef: MutableRefObject<boolean>;
  /** The loop only starts once the scene is on screen (textures ready), so viewers always see the intro. */
  startedRef: MutableRefObject<boolean>;
  fadeRef: RefObject<HTMLDivElement | null>;
  fixedT?: number;
}) {
  useFrame((state, delta) => {
    if (fixedT !== undefined) tRef.current = fixedT;
    else if (startedRef.current && !pausedRef.current) tRef.current = (tRef.current + Math.min(delta, 0.1)) % LOOP;
    const el = fadeRef.current;
    if (el) el.style.opacity = String(fixedT !== undefined ? 1 : loopOpacity(tRef.current));
  }, -10);

  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (typeof window === "undefined" || !new URLSearchParams(window.location.search).has("capture")) return;
    (window as unknown as { __teaCapture: () => string }).__teaCapture = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    };
  }, [gl, scene, camera]);
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // two frames after Suspense resolves: textures uploaded, first frame painted
    let b = 0;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(onReady);
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [onReady]);
  return null;
}

export default function TeaScene({ active, paused, lowPower, pointerEnabled, wide, fadeRef, onReady, fixedT }: TeaSceneProps) {
  const tRef = useRef(fixedT ?? 0);
  const pausedRef = useRef(paused);
  const startedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const heroPlans = useMemo(() => makeLeafPlans(lowPower ? 21 : 30, 5, true), [lowPower]);
  const smallPlans = useMemo(() => makeLeafPlans(lowPower ? 60 : 150, 9, false), [lowPower]);

  const animate = fixedT === undefined;
  const dprOverride = useMemo(() => {
    const v = typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("tea_dpr")) : 0;
    return v > 0 ? v : undefined; // capture aid: render the poster frames at a fixed pixel ratio
  }, []);
  // debug: ?tea_off=liquid,steam,glass,leaves,box,shadow (profiling aid)
  const off = useMemo(() => new Set((typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tea_off") ?? "" : "").split(",")), []);
  return (
    <Canvas
      frameloop={!active ? "never" : paused ? "demand" : "always"}
      dpr={dprOverride ?? (lowPower ? [1, 1.25] : [1, 1.6])}
      camera={{ fov: 28, near: 1, far: 70, position: [0.5, 2.9, 13.6] }}
      gl={{ alpha: true, antialias: !lowPower, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <Director tRef={tRef} pausedRef={pausedRef} startedRef={startedRef} fadeRef={fadeRef} fixedT={fixedT} />
      <Suspense fallback={null}>
        <TeaCamera tRef={tRef} pointerEnabled={pointerEnabled} wide={wide} />
        <TeaLighting tRef={tRef} animate={animate && !off.has("shadow")} lowPower={lowPower} debugOff={off} />
        {!off.has("box") && <TeaBox tRef={tRef} />}
        {!off.has("glass") && <TeaGlass />}
        {!off.has("liquid") && <TeaLiquid tRef={tRef} plans={heroPlans} steps={lowPower ? 3 : 4} />}
        {!off.has("leaves") && <TeaLeafSystem tRef={tRef} heroPlans={heroPlans} smallPlans={smallPlans} />}
        {!off.has("steam") && <TeaSteamSystem tRef={tRef} ribbons={lowPower ? 2 : 4} />}
        <Ready
          onReady={() => {
            startedRef.current = true;
            onReady();
          }}
        />
      </Suspense>
    </Canvas>
  );
}
