"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { lerp, smooth } from "./timeline";

/**
 * Three-point lighting, no real-time shadow maps:
 *  key   warm morning sun from the upper-left (sweeps across the pack in the intro)
 *  fill  soft cool light from the right
 *  back  rim light behind/right to lift glass edges and steam
 * Reflections come from a baked Lightformer "studio" (frames=1) so the glass
 * shows window-like highlights without any HDR download.
 * Grounding uses one low-res ContactShadows pass (updated while animating so
 * the box shadow follows the tilt).
 */
export function TeaLighting({
  tRef,
  animate,
  lowPower,
  debugOff,
}: {
  tRef: MutableRefObject<number>;
  animate: boolean;
  lowPower: boolean;
  debugOff?: Set<string>;
}) {
  const key = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const k = key.current;
    if (!k) return;
    const sweep = smooth(0, 2.4, tRef.current);
    k.position.set(lerp(-9.5, -5.2, sweep), lerp(5.5, 7.5, sweep), 6.5);
    k.intensity = lerp(1.2, 2.5, smooth(0, 1.2, tRef.current));
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#fff6e6" />
      <directionalLight ref={key} intensity={2.4} color="#ffe6bf" position={[-5.2, 7.5, 6.5]} />
      <directionalLight intensity={0.55} color="#dbe7ff" position={[7, 3.5, 4]} />
      <directionalLight intensity={1.25} color="#ffffff" position={[4, 5, -6]} />

      {!debugOff?.has("env") && (
      <Environment resolution={lowPower ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[-5, 4, 5]} scale={[4.5, 6, 1]} color="#fff0d2" />
        <Lightformer form="rect" intensity={1.6} position={[6.5, 2.2, 3]} scale={[1.6, 6, 1]} color="#eaf1ff" />
        <Lightformer form="rect" intensity={2.2} position={[0, 7, 1]} scale={[8, 2.2, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.4} position={[2, 3, -6]} scale={5} color="#fffaf0" />
      </Environment>
      )}

      {!debugOff?.has("contact") && (
      <ContactShadows
        position={[0, 0.003, 0]}
        scale={[16, 9]}
        opacity={0.5}
        blur={2.8}
        far={3.2}
        resolution={lowPower ? 128 : 256}
        frames={animate ? Infinity : 1}
        color="#2a2012"
      />
      )}
    </>
  );
}
