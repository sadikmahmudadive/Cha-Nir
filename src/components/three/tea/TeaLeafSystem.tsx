"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { getLeafKit, leafColor } from "./leafKit";
import { leafTransform, type LeafPlan } from "./timeline";

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _mat = new THREE.Matrix4();
const _s = { v: 1 };
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

function updateInstances(mesh: THREE.InstancedMesh, plans: LeafPlan[], idx: number[], t: number) {
  for (let k = 0; k < idx.length; k++) {
    const p = plans[idx[k]];
    if (leafTransform(p, t, _pos, _quat, _s)) {
      _scale.setScalar(_s.v);
      // leaf geometry is long along y and flat in z; stretch slightly for variety
      _scale.y *= 1 + p.colorT * 0.25;
      _mat.compose(_pos, _quat, _scale);
      mesh.setMatrixAt(k, _mat);
    } else {
      mesh.setMatrixAt(k, HIDDEN);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/**
 * Two instanced systems share one analytic physics model (`leafTransform`):
 *  - hero leaves: a few dozen detailed, curled leaves in 3 silhouettes
 *  - secondary leaves/flakes: many small, low-poly fragments for volume
 * Instancing keeps the whole pour at 4 draw calls.
 */
export function TeaLeafSystem({
  tRef,
  heroPlans,
  smallPlans,
}: {
  tRef: MutableRefObject<number>;
  heroPlans: LeafPlan[];
  smallPlans: LeafPlan[];
}) {
  const kit = useMemo(() => getLeafKit(), []);
  const heroRefs = useRef<(THREE.InstancedMesh | null)[]>([null, null, null]);
  const smallRef = useRef<THREE.InstancedMesh>(null);

  const heroIdx = useMemo(() => [0, 1, 2].map((v) => heroPlans.map((p, i) => (p.variant === v ? i : -1)).filter((i) => i >= 0)), [heroPlans]);
  const smallIdx = useMemo(() => smallPlans.map((_, i) => i), [smallPlans]);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    heroRefs.current.forEach((m, v) => {
      if (!m) return;
      heroIdx[v].forEach((pi, k) => m.setColorAt(k, leafColor(heroPlans[pi].colorT, c)));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.frustumCulled = false;
    });
    const s = smallRef.current;
    if (s) {
      smallPlans.forEach((p, k) => s.setColorAt(k, leafColor(p.colorT, c)));
      if (s.instanceColor) s.instanceColor.needsUpdate = true;
      s.frustumCulled = false;
    }
  }, [heroIdx, heroPlans, smallPlans]);

  useFrame(() => {
    const t = tRef.current;
    heroRefs.current.forEach((m, v) => m && updateInstances(m, heroPlans, heroIdx[v], t));
    if (smallRef.current) updateInstances(smallRef.current, smallPlans, smallIdx, t);
  });

  return (
    <group>
      {[0, 1, 2].map((v) => (
        <instancedMesh
          key={v}
          ref={(m) => {
            heroRefs.current[v] = m;
          }}
          args={[kit.hero[v], kit.material, Math.max(1, heroIdx[v].length)]}
        />
      ))}
      <instancedMesh ref={smallRef} args={[kit.small, kit.material, Math.max(1, smallPlans.length)]} />
    </group>
  );
}
