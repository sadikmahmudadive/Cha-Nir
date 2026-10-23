"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import { CUP_PIVOT, cupPose } from "./timeline";

const _m = new THREE.Matrix4();
const _r = new THREE.Matrix4();
const _t0 = new THREE.Matrix4();

/**
 * Carries everything that belongs to the cup (glass, tea, floating leaves, steam)
 * together: world = T(pivot') · Rx(-tilt) · T(-pivot). Identity until the elder lifts it.
 */
export function CupRig({ tRef, children }: { tRef: MutableRefObject<number>; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const neg = useMemo(() => _t0.clone().makeTranslation(-CUP_PIVOT.x, -CUP_PIVOT.y, -CUP_PIVOT.z), []);

  useFrame(() => {
    const grp = g.current;
    if (!grp) return;
    const { pos, tilt } = cupPose(tRef.current);
    _r.makeRotationX(-tilt);
    _m.makeTranslation(pos.x, pos.y, pos.z).multiply(_r).multiply(neg);
    grp.matrix.copy(_m);
    grp.matrixWorldNeedsUpdate = true;
  });

  return (
    <group ref={g} matrixAutoUpdate={false}>
      {children}
    </group>
  );
}
