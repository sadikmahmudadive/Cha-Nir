"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeFrontTexture, makePaperTexture, makePlainTexture, makeSideTexture } from "./assets";
import { getLeafKit, leafColor } from "./leafKit";
import { BOX, T, boxPose, flapOpen, smooth } from "./timeline";

const DEG = Math.PI / 180;

/**
 * Retail tea carton built from real paperboard-thickness panels with softened
 * edges. The four top flaps are separate hinged meshes; their rotations come
 * from the central timeline (`flapOpen`) so they unfold in sequence:
 * front tuck → side flaps → main lid (with a small settle).
 */
export function TeaBox({ tRef }: { tRef: MutableRefObject<number> }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const main = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const sideL = useRef<THREE.Group>(null);
  const sideR = useRef<THREE.Group>(null);
  const heap = useRef<THREE.Group>(null);

  const { w, h, d, t } = BOX;

  const mats = useMemo(() => {
    const paper = makePaperTexture();
    const mk = (map: THREE.Texture | null, color = "#ffffff") =>
      new THREE.MeshStandardMaterial({ map, color, roughness: 0.84, metalness: 0, bumpMap: paper, bumpScale: 0.35 });
    const frontTex = makeFrontTexture();
    const sideTex = makeSideTexture();
    const plain = makePlainTexture("#46602f");
    return {
      front: mk(frontTex),
      side: mk(sideTex),
      back: mk(plain),
      top: mk(plain),
      edge: mk(null, "#3f5a2b"),
      liner: new THREE.MeshStandardMaterial({ color: "#e9dfc6", roughness: 0.9, bumpMap: paper, bumpScale: 0.25 }),
    };
  }, []);

  const geo = useMemo(() => {
    const rb = (x: number, y: number, z: number) => new RoundedBoxGeometry(x, y, z, 2, 0.008);
    return {
      front: rb(w, h, t),
      back: rb(w, h, t),
      side: rb(t, h, d - 2 * t),
      bottom: rb(w - 2 * t, t, d - 2 * t),
      main: rb(w, t, d),
      frontFlap: rb(w - 2 * t - 0.02, t, 0.3),
      sideFlap: rb(0.32, t, d - 0.16),
    };
  }, [w, h, d, t]);

  // static leaf heap inside the carton (visible through the opened top)
  const kit = useMemo(() => getLeafKit(), []);
  const heapMesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = heapMesh.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    let seed = 91;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) {
      dummy.position.set((rnd() - 0.5) * (w - 0.2), h - 0.22 + rnd() * 0.34, (rnd() - 0.5) * (d - 0.2));
      dummy.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
      dummy.scale.setScalar(0.2 + rnd() * 0.16);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, leafColor(rnd(), c));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [w, h, d]);

  useFrame(() => {
    const time = tRef.current;
    const p = boxPose(time);
    if (outer.current) {
      outer.current.position.set(p.x, p.y, p.z);
      outer.current.rotation.set(0, 0, -p.tilt);
    }
    if (inner.current) inner.current.rotation.y = p.ry;
    const f = flapOpen(time);
    if (main.current) main.current.rotation.x = -118 * DEG * f.main;
    if (front.current) front.current.rotation.x = 165 * DEG * f.front;
    if (sideL.current) sideL.current.rotation.z = 108 * DEG * f.sideL;
    if (sideR.current) sideR.current.rotation.z = -108 * DEG * f.sideR;
    if (heap.current) {
      heap.current.visible = f.main > 0.4; // hidden inside while the lid is still closed
      heap.current.position.y = -0.24 * smooth(T.pour0, T.pour1 + 0.4, time);
    }
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        {/* body panels: [+x, -x, +y, -y, +z, -z] */}
        <mesh geometry={geo.front} position={[0, h / 2, d / 2 - t / 2]} material={[mats.edge, mats.edge, mats.edge, mats.edge, mats.front, mats.liner]} />
        <mesh geometry={geo.back} position={[0, h / 2, -d / 2 + t / 2]} material={[mats.edge, mats.edge, mats.edge, mats.edge, mats.liner, mats.back]} />
        <mesh geometry={geo.side} position={[-w / 2 + t / 2, h / 2, 0]} material={[mats.liner, mats.side, mats.edge, mats.edge, mats.edge, mats.edge]} />
        <mesh geometry={geo.side} position={[w / 2 - t / 2, h / 2, 0]} material={[mats.side, mats.liner, mats.edge, mats.edge, mats.edge, mats.edge]} />
        <mesh geometry={geo.bottom} position={[0, t / 2, 0]} material={mats.liner} />

        {/* hinged top flaps */}
        <group ref={main} position={[0, h, -d / 2]}>
          <mesh geometry={geo.main} position={[0, t / 2, d / 2]} material={[mats.edge, mats.edge, mats.top, mats.liner, mats.edge, mats.edge]} />
        </group>
        <group ref={front} position={[0, h - 0.012, d / 2]}>
          <mesh geometry={geo.frontFlap} position={[0, t / 2, -0.15]} material={[mats.edge, mats.edge, mats.top, mats.liner, mats.edge, mats.edge]} />
        </group>
        <group ref={sideL} position={[-w / 2 + t, h - 0.006, 0]}>
          <mesh geometry={geo.sideFlap} position={[0.16, t / 2, 0]} material={[mats.edge, mats.edge, mats.top, mats.liner, mats.edge, mats.edge]} />
        </group>
        <group ref={sideR} position={[w / 2 - t, h - 0.006, 0]}>
          <mesh geometry={geo.sideFlap} position={[-0.16, t / 2, 0]} material={[mats.edge, mats.edge, mats.top, mats.liner, mats.edge, mats.edge]} />
        </group>

        <group ref={heap}>
          <instancedMesh ref={heapMesh} args={[kit.hero[1], kit.material, 90]} />
        </group>
      </group>
    </group>
  );
}
