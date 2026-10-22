"use client";

/**
 * Procedural 3D props: tea tin, cup and loose leaves.
 *
 * No external model is needed for the hero, so there is nothing large to
 * download. The geometry is low-poly (64-segment lathes) and every material
 * is shared. To use an approved GLB later, swap <TeaTin/> for a drei
 * `useGLTF` model with the same props (see docs/IMPLEMENTATION.md).
 */
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export const palette = {
  tin: "#536D3B",
  tinDark: "#3A4D29",
  lime: "#A5BE16",
  cream: "#F7F4E9",
  leafDry: "#3A2518",
  leafFresh: "#7C9A3A",
};

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Tea tin with the real Cha Nir logo on the label ─────────────── */
export function TeaTin({ tint = palette.tin, height = 2.3 }: { tint?: string; height?: number }) {
  const logo = useTexture("/brand/logo.png", (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  });

  const body = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.001, 0],
          [0.92, 0],
          [1.0, 0.07],
          [1.0, height - 0.05],
          [0.97, height],
          [0.97, height + 0.06],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64,
      ),
    [height],
  );
  const lid = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.001, 0],
          [1.05, 0],
          [1.05, 0.12],
          [1.01, 0.18],
          [1.01, 0.34],
          [0.9, 0.4],
          [0.52, 0.4],
          [0.5, 0.43],
          [0.001, 0.43],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64,
      ),
    [],
  );

  const labelH = Math.min(1.35, height * 0.6);
  const arc = 1.72;
  const logoH = (1.02 * arc) / (1768 / 1303);
  const y0 = height * 0.5;

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={tint} metalness={0.3} roughness={0.42} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>
      <mesh geometry={lid} position={[0, height + 0.02, 0]}>
        <meshPhysicalMaterial color={palette.tinDark} metalness={0.55} roughness={0.34} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, height + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.045, 0.022, 12, 64]} />
        <meshStandardMaterial color={palette.lime} metalness={0.2} roughness={0.4} />
      </mesh>
      {/* cream label band */}
      <mesh position={[0, y0, 0]}>
        <cylinderGeometry args={[1.008, 1.008, labelH, 64, 1, true]} />
        <meshStandardMaterial color={palette.cream} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* logo, unmodified artwork, facing the camera */}
      <mesh position={[0, y0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.016, 1.016, logoH, 48, 1, true, -arc / 2, arc]} />
        <meshStandardMaterial map={logo} transparent roughness={0.7} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}

/* ── Cup & saucer with a little tea ──────────────────────────────── */
export function TeaCup() {
  const cup = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.001, 0],
          [0.34, 0],
          [0.5, 0.05],
          [0.64, 0.42],
          [0.66, 0.55],
          [0.6, 0.55],
          [0.58, 0.42],
          [0.45, 0.12],
          [0.001, 0.1],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );
  const saucer = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.001, 0],
          [0.7, 0.02],
          [1.0, 0.1],
          [1.04, 0.13],
          [1.0, 0.13],
          [0.7, 0.07],
          [0.001, 0.07],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );
  return (
    <group>
      <mesh geometry={saucer}>
        <meshStandardMaterial color="#FFFDF7" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cup} position={[0, 0.08, 0]}>
        <meshStandardMaterial color="#FFFDF7" roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 40]} />
        <meshStandardMaterial color="#B8651B" roughness={0.15} metalness={0.1} />
      </mesh>
      <mesh position={[0.7, 0.36, 0]} rotation={[0, 0, Math.PI * 0.5]}>
        <torusGeometry args={[0.17, 0.045, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#FFFDF7" roughness={0.25} />
      </mesh>
    </group>
  );
}

/* ── Leaves ──────────────────────────────────────────────────────── */
function useLeafGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.2, 0.12, 0.24, 0.5, 0, 1);
    s.bezierCurveTo(-0.24, 0.5, -0.2, 0.12, 0, 0);
    const g = new THREE.ShapeGeometry(s, 6);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, x * x * 1.4 + y * y * 0.12);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

/**
 * A handful of decorative leaves that drift slowly. One shared geometry,
 * two shared materials, one animation loop for the whole group.
 */
export function FloatingLeaves({
  count = 12,
  animate = true,
  seed = 11,
}: {
  count?: number;
  animate?: boolean;
  seed?: number;
}) {
  const geo = useLeafGeometry();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const leaves = useMemo(() => {
    const r = mulberry(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = r() * Math.PI * 2;
      const d = 1.7 + r() * 1.7;
      return {
        pos: [Math.cos(a) * d, 0.4 + r() * 3.2, Math.sin(a) * d * 0.55 - 0.4] as const,
        rot: [r() * 3, r() * 3, r() * 3] as const,
        s: 0.28 + r() * 0.3,
        sp: 0.3 + r() * 0.5,
        ph: r() * 6.28,
        fresh: i % 4 === 0,
      };
    });
  }, [count, seed]);

  useFrame(({ clock }, dt) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    leaves.forEach((l, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.y = l.pos[1] + Math.sin(t * l.sp + l.ph) * 0.14;
      m.rotation.y += dt * 0.25 * (i % 2 ? 1 : -1);
      m.rotation.x += dt * 0.08;
    });
  });

  return (
    <group>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={geo}
          position={[...l.pos]}
          rotation={[...l.rot]}
          scale={l.s}
        >
          <meshStandardMaterial
            color={l.fresh ? palette.leafFresh : palette.leafDry}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Leaves resting on the ground beside the tin. */
export function GroundLeaves({ seed = 5 }: { seed?: number }) {
  const geo = useLeafGeometry();
  const items = useMemo(() => {
    const r = mulberry(seed);
    return Array.from({ length: 9 }, () => ({
      x: -2.6 + r() * 5.2,
      z: 0.7 + r() * 1.6,
      ry: r() * 6.28,
      s: 0.22 + r() * 0.22,
    }));
  }, [seed]);
  return (
    <group>
      {items.map((l, i) => (
        <mesh key={i} geometry={geo} position={[l.x, 0.03 + i * 0.001, l.z]} rotation={[-Math.PI / 2 + 0.12, 0, l.ry]} scale={l.s}>
          <meshStandardMaterial color={i % 3 === 0 ? palette.leafFresh : palette.leafDry} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
