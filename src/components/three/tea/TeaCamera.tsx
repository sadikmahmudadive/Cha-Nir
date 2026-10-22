"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { cameraKey } from "./timeline";

const pos = new THREE.Vector3();
const look = new THREE.Vector3();

function place(camera: THREE.PerspectiveCamera, pointer: { x: number; y: number }, t: number, aspect: number, wide: boolean, dt: number) {
  cameraKey(t, pos, look);
  // distance compensation so the whole ritual fits narrow (portrait) viewports
  const zoomOut = Math.max(0.88, 6.1 / (0.4986 * 12 * aspect));
  pos.sub(look).multiplyScalar(zoomOut).add(look);
  // pan the composition right on wide layouts, leaving headline space on the left
  const shift = wide ? 2.3 * Math.min(1.25, aspect / 1.75) : 0;
  pos.x -= shift;
  look.x -= shift;
  // desktop pointer parallax (small, additive, damped - never touches the timeline)
  pos.x += pointer.x * 0.5;
  pos.y += -pointer.y * 0.25;
  camera.position.x = THREE.MathUtils.damp(camera.position.x, pos.x, 6, dt);
  camera.position.y = THREE.MathUtils.damp(camera.position.y, pos.y, 6, dt);
  camera.position.z = THREE.MathUtils.damp(camera.position.z, pos.z, 6, dt);
  camera.lookAt(look);
}

/** Single owner of the camera. Cinematic path from the timeline + optional pointer parallax. */
export function TeaCamera({
  tRef,
  pointerEnabled,
  wide,
}: {
  tRef: MutableRefObject<number>;
  pointerEnabled: boolean;
  wide: boolean;
}) {
  const target = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!pointerEnabled) return;
    const move = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [pointerEnabled]);

  useFrame((state, dt) => {
    const sm = smoothed.current;
    sm.x = THREE.MathUtils.damp(sm.x, target.current.x, 3, dt);
    sm.y = THREE.MathUtils.damp(sm.y, target.current.y, 3, dt);
    const aspect = state.size.width / state.size.height;
    place(state.camera as THREE.PerspectiveCamera, sm, tRef.current, aspect, wide, Math.min(dt, 0.1) + 1e-4);
  });
  return null;
}
