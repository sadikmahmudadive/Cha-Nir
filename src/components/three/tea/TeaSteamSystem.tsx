"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, type MutableRefObject } from "react";
import * as THREE from "three";
import { steamFragment, steamVertex } from "./TeaInfusionShader";
import { CUP, steamAmount } from "./timeline";

function setSteam(mats: THREE.ShaderMaterial[], t: number) {
  const a = steamAmount(t);
  for (const m of mats) {
    m.uniforms.uT.value = t;
    m.uniforms.uAmount.value = a;
  }
}

/**
 * Steam: a few tall, narrow ribbons crossed at different angles around the
 * cup axis (so wisps read from any camera angle), each running a
 * domain-warped noise shader. No particles, no big alpha quads: thin
 * wisps only, so overdraw stays low. Rises from the liquid surface, widens and
 * drifts sideways, then dissipates.
 */
export function TeaSteamSystem({ tRef, ribbons }: { tRef: MutableRefObject<number>; ribbons: number }) {
  const items = useMemo(() => {
    const angles = [0.1, 1.15, 2.2, 0.65].slice(0, ribbons);
    return angles.map((a, i) => {
      const geo = new THREE.PlaneGeometry(0.62, 2.7, 10, 40);
      geo.translate(0, 1.35, 0);
      const mat = new THREE.ShaderMaterial({
        vertexShader: steamVertex,
        fragmentShader: steamFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uT: { value: 0 },
          uAmount: { value: 0 },
          uSwayAmt: { value: 1 + i * 0.15 },
          uPhase: { value: i * 2.3 },
        },
      });
      return { geo, mat, angle: a, off: (i - 1) * 0.12 };
    });
  }, [ribbons]);

  const mats = useMemo(() => items.map((i) => i.mat), [items]);
  useFrame(() => setSteam(mats, tRef.current));

  return (
    <group position={[CUP.x, CUP.water + 0.02, CUP.z]}>
      {items.map((it, i) => (
        <mesh key={i} geometry={it.geo} material={it.mat} rotation={[0, it.angle, 0]} position={[it.off, 0, -it.off * 0.5]} renderOrder={4} />
      ))}
    </group>
  );
}
