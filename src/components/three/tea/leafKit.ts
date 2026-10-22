import * as THREE from "three";
import { LEAF_COLORS, makeLeafGeometry } from "./assets";

let kit: {
  hero: THREE.BufferGeometry[];
  small: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
} | null = null;

/** Shared leaf geometries + material (created once, client only). */
export function getLeafKit() {
  if (!kit) {
    kit = {
      // three hand-tuned silhouettes: tightly rolled, half-curled, twisted
      hero: [
        makeLeafGeometry(11, 10, 4, 1.5, 0.9, 0.9),
        makeLeafGeometry(23, 10, 4, 1.0, -0.6, 1.8),
        makeLeafGeometry(37, 9, 4, 1.8, 0.5, -1.2),
      ],
      small: makeLeafGeometry(5, 4, 2, 1.1, 0.5, 0.8),
      material: new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.62,
        metalness: 0,
        side: THREE.DoubleSide,
        envMapIntensity: 0.8,
      }),
    };
  }
  return kit;
}

export function leafColor(t: number, out = new THREE.Color()) {
  const i = Math.floor(t * LEAF_COLORS.length) % LEAF_COLORS.length;
  return out.copy(LEAF_COLORS[i]).offsetHSL(0, 0, (Math.sin(t * 91) * 0.5) * 0.015);
}
