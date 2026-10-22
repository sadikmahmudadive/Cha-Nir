"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { FloatingLeaves, TeaCup, TeaTin, palette } from "./props";

/**
 * Tea-journey scene: four illustrative stages laid out on the X axis. The
 * camera glides along that path, driven by page scroll progress (0..1) that
 * the parent writes into `progress.current`. Scroll is never locked; this is a
 * normal sticky canvas. Visuals are illustrative, NOT documentary footage.
 */
export const GAP = 7;

function Hills() {
  const rows = useMemo(
    () =>
      Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => ({ x: -2.8 + c * 0.7 + (r % 2) * 0.35, z: -1.6 + r * 0.8 })),
      ),
    [],
  );
  return (
    <group>
      <mesh position={[0, -0.9, -1]} scale={[3.4, 1.2, 2.4]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8AA261" roughness={0.9} />
      </mesh>
      <mesh position={[2.2, -0.9, -2.4]} scale={[2.6, 1.6, 1.8]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#B4C690" roughness={0.9} />
      </mesh>
      {rows.map((row, r) =>
        row.map((b, c) => (
          <mesh key={`${r}-${c}`} position={[b.x, 0.28 + Math.sin(b.x * 0.9) * -0.05 - r * 0.07, b.z]} scale={[0.3, 0.2, 0.26]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={(r + c) % 5 === 0 ? "#6A844A" : "#536D3B"} roughness={0.85} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Drum() {
  const drum = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (drum.current) drum.current.rotation.x += dt * 0.6;
  });
  return (
    <group position={[0, 0.9, 0]}>
      <group ref={drum}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1, 1, 2.8, 40, 1, true]} />
          <meshPhysicalMaterial color="#D8D2BC" metalness={0.35} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        {[-1.4, 1.4].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1, 0.06, 10, 40]} />
            <meshStandardMaterial color={palette.lime} roughness={0.5} />
          </mesh>
        ))}
        <group scale={0.34} position={[0, -0.5, 0]}>
          <FloatingLeaves count={14} animate={false} seed={3} />
        </group>
      </group>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, -0.95, 0]}>
          <boxGeometry args={[0.2, 1.1, 1.5]} />
          <meshStandardMaterial color={palette.tinDark} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Packing() {
  const tin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (tin.current) tin.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.45;
  });
  return (
    <group>
      <group ref={tin}>
        <TeaTin />
      </group>
      <group position={[2.1, 0, 0.6]} scale={0.55} rotation={[0, -0.5, 0]}>
        <TeaTin tint="#6a844a" height={2} />
      </group>
      <group position={[-2.1, 0, 0.4]} scale={0.5} rotation={[0, 0.5, 0]}>
        <TeaTin tint="#2C3C21" height={1.8} />
      </group>
    </group>
  );
}

function Serving() {
  return (
    <group>
      <group scale={1.5} position={[-0.3, 0, 0]}>
        <TeaCup />
      </group>
      <group position={[1.9, 0, 0.4]} scale={1.05}>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.5, 0.42, 1.9, 24, 1, true]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.46, 0.4, 1.15, 24]} />
          <meshStandardMaterial color="#B8651B" roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

function Path({ progress }: { progress: MutableRefObject<number> }) {
  const lookAt = useRef(new THREE.Vector3());
  useFrame(({ camera }, dt) => {
    // map 0..1 scroll so that step i is centred when progress = (i + .5) / 4
    const stage = THREE.MathUtils.clamp(progress.current * 4 - 0.5, 0, 3);
    const x = stage * GAP;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 3.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 3.3 + Math.sin(stage * Math.PI) * 0.35, 3, dt);
    lookAt.current.set(camera.position.x, 0.7, 0);
    camera.lookAt(lookAt.current);
  });
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  // lives inside <Suspense>, so it only mounts once textures/materials are ready
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

export default function JourneyScene({
  progress,
  active,
  onReady,
}: {
  progress: MutableRefObject<number>;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "demand"}
      dpr={[1, 1.4]}
      camera={{ position: [0, 3.3, 13], fov: 30, near: 0.5, far: 60 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <Path progress={progress} />
        <group position={[0, 0, 0]}>
          <Hills />
        </group>
        <group position={[GAP, 0, 0]}>
          <Drum />
        </group>
        <group position={[GAP * 2, 0, 0]}>
          <Packing />
        </group>
        <group position={[GAP * 3, 0, 0]}>
          <Serving />
        </group>
        <ContactShadows position={[GAP * 1.5, 0.002, 0]} opacity={0.3} scale={[GAP * 4 + 6, 9]} blur={2.4} far={4} frames={1} resolution={1024} color="#2a3a1c" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 7, 6]} intensity={1.5} color="#fff4de" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[-4, 4, 4]} scale={[6, 4, 1]} color="#fff3d6" />
          <Lightformer form="rect" intensity={1} position={[6, 1, 2]} scale={[3, 6, 1]} color="#e3edc6" />
        </Environment>
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
