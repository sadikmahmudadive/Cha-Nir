"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { CUP } from "./timeline";

/**
 * Drinking glass as a single solid lathe with real wall + base thickness
 * (thick heavy base, thin rim). Transparent PBR with strong environment
 * reflections and a fresnel boost injected into the standard shader so the
 * silhouette edges read clearly while the centre stays clear.
 * No transmission pass is used on purpose (it re-renders the scene; too costly
 * on mid-range phones). The liquid is drawn first so it shows through.
 */
export function glassProfile(): THREE.Vector2[] {
  const o = CUP.outer;
  const i = CUP.inner;
  const H = CUP.height;
  const pts: [number, number][] = [
    [0.001, 0],
    [0.42, 0],
    [0.52, 0.012],
    [o(0.05) - 0.012, 0.045],
    [o(0.09), 0.1],
    [o(0.4), 0.4],
    [o(0.9), 0.9],
    [o(H - 0.03), H - 0.03],
    [o(H) - 0.004, H - 0.006],
    [(o(H) + i(H)) / 2, H + 0.008], // rounded rim
    [i(H) + 0.004, H - 0.006],
    [i(H), H - 0.03],
    [i(0.9), 0.9],
    [i(0.4), 0.4],
    [i(CUP.floor + 0.04), CUP.floor + 0.04],
    [i(CUP.floor) - 0.05, CUP.floor + 0.012],
    [0.001, CUP.floor],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(x, y));
}

export function TeaGlass() {
  const geo = useMemo(() => new THREE.LatheGeometry(glassProfile(), 72), []);
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: "#8fa6a6",
      roughness: 0.035,
      metalness: 0,
      ior: 1.5,
      transparent: true,
      opacity: 0.05,
      envMapIntensity: 1.7,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      specularIntensity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        float fres = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 2.6);
        diffuseColor.a = clamp(diffuseColor.a + fres * 0.5, 0.0, 0.9);
        #include <opaque_fragment>
        `,
      );
    };
    return m;
  }, []);

  return <mesh geometry={geo} material={mat} position={[CUP.x, 0, CUP.z]} renderOrder={3} />;
}
