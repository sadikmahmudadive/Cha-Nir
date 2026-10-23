"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** Soft, procedurally grained timber so the whole set sits on a natural surface. */
function makeWoodTexture() {
  const W = 1024;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#d8bd92";
  g.fillRect(0, 0, W, H);
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    const y = r() * H;
    g.strokeStyle = `rgba(${120 + r() * 40}, ${86 + r() * 30}, ${50 + r() * 20}, ${0.05 + r() * 0.1})`;
    g.lineWidth = 1 + r() * 3;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= W; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * (2 + r() * 4));
    g.stroke();
  }
  // plank seams
  g.strokeStyle = "rgba(90,62,34,0.28)";
  g.lineWidth = 2;
  for (const y of [H * 0.25, H * 0.5, H * 0.75]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.repeat.set(2, 1);
  return t;
}

/** Wide tabletop; its far edge runs behind the cup where the elder sits. */
export function TeaTable() {
  const geo = useMemo(() => new RoundedBoxGeometry(26, 0.5, 16, 2, 0.05), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: makeWoodTexture(), roughness: 0.78, metalness: 0, color: "#ffffff" }),
    [],
  );
  return <mesh geometry={geo} material={mat} position={[0.8, -0.25, 5.2]} receiveShadow />;
}
