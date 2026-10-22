"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, type MutableRefObject } from "react";
import * as THREE from "three";
import { infusionFragment, infusionVertex } from "./TeaInfusionShader";
import { CUP, infusion, smooth, type LeafPlan, impactsOf } from "./timeline";

const H = CUP.water - CUP.floor;

/**
 * One continuous cup of liquid. `uInf`, plume sources, bed and ripples are all
 * derived from the shared timeline value each frame.
 */
export function TeaLiquid({
  tRef,
  plans,
  steps,
}: {
  tRef: MutableRefObject<number>;
  plans: LeafPlan[];
  steps: number;
}) {
  const impacts = useMemo(() => impactsOf(plans), [plans]);

  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0.001, 0)];
    for (let k = 0; k <= 8; k++) {
      const y = (k / 8) * H;
      pts.push(new THREE.Vector2(CUP.inner(CUP.floor + y) - 0.004, y));
    }
    pts.push(new THREE.Vector2(0.001, H));
    return new THREE.LatheGeometry(pts, 64);
  }, []);

  const mat = useMemo(() => {
    const src = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 0, -1));
    const rip = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 0, 0));
    return new THREE.ShaderMaterial({
      vertexShader: infusionVertex,
      fragmentShader: infusionFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      uniforms: {
        uT: { value: 0 },
        uInf: { value: 0 },
        uBed: { value: 0 },
        uH: { value: H },
        uSrc: { value: src },
        uRip: { value: rip },
        uLight: { value: new THREE.Vector3(-0.6, 0.8, 0.5) },
        uSteps: { value: steps },
      },
    });
  }, [steps]);

  // plume sources: eight leaf impacts spread over the pour
  const sources = useMemo(() => {
    const pick = Math.max(1, Math.floor(impacts.length / 8));
    return Array.from({ length: 8 }, (_, i) => impacts[Math.min(impacts.length - 1, i * pick)]);
  }, [impacts]);

  useFrame(() => {
    const t = tRef.current;
    const u = mat.uniforms;
    u.uT.value = t;
    u.uInf.value = infusion(t);
    u.uBed.value = smooth(4.8, 7.6, t);
    (u.uSrc.value as THREE.Vector4[]).forEach((v, i) => {
      const s = sources[i];
      v.set(s.x, H, s.z, s.t);
    });
    // most recent ripples (≤ 8 within 1.6 s)
    const rip = u.uRip.value as THREE.Vector4[];
    let n = 0;
    for (let i = impacts.length - 1; i >= 0 && n < 8; i--) {
      const im = impacts[i];
      if (im.t <= t && t - im.t < 1.6) rip[n++].set(im.x, im.z, im.t, 0.0145);
    }
    for (; n < 8; n++) rip[n].set(0, 0, 0, 0);
  });

  return <mesh geometry={geo} material={mat} position={[CUP.x, CUP.floor, CUP.z]} renderOrder={2} />;
}
