"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { TeaTin } from "./props";

/**
 * Reusable 3D product viewer scene.
 * - Procedural tin by default (no download); pass `modelUrl` for an approved,
 *   Draco/Meshopt-compressed GLB. `variantScale` animates between pack sizes.
 * - Drag-to-rotate (horizontal; vertical is left to the page so touch scrolling still works).
 * - Mouse-wheel zoom is OFF to avoid trapping page scroll; zoom is controlled via buttons.
 */
function Model({ modelUrl, scale }: { modelUrl?: string; scale: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = THREE.MathUtils.damp(g.current.scale.x, scale, 6, dt);
    g.current.scale.setScalar(s);
  });
  return (
    <group ref={g} position={[0, -1.25, 0]}>
      {modelUrl ? <GlbModel url={modelUrl} /> : <TeaTin />}
    </group>
  );
}

function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Framing({ zoom }: { zoom: number }) {
  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    // narrower containers need more distance to keep the product framed
    const base = aspect < 1 ? 1 : 1.15;
    cam.zoom = THREE.MathUtils.damp(cam.zoom, zoom * base * Math.min(1, aspect + 0.15), 6, dt);
    cam.updateProjectionMatrix();
  });
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

export default function ViewerScene({
  modelUrl,
  scale,
  zoom,
  autoRotate,
  resetKey,
  onReady,
}: {
  modelUrl?: string;
  scale: number;
  zoom: number;
  autoRotate: boolean;
  resetKey: number;
  onReady: () => void;
}) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  useEffect(() => {
    controls.current?.reset();
  }, [resetKey]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 9], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      frameloop="always"
      aria-hidden
    >
      <Suspense fallback={null}>
        <Model modelUrl={modelUrl} scale={scale} />
        <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={9} blur={2.4} far={4} frames={1} resolution={512} color="#2a3a1c" />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff4de" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[-4, 4, 4]} scale={[6, 4, 1]} color="#fff3d6" />
          <Lightformer form="rect" intensity={1.1} position={[6, 1, 2]} scale={[3, 6, 1]} color="#e3edc6" />
        </Environment>
        <Framing zoom={zoom} />
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableZoom={false}
          enableDamping
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2.05}
        />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
