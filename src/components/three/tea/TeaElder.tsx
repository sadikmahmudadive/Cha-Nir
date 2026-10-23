"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { HAND_REST_LEFT, MAN, handPosition, manAppear, sipState } from "./timeline";

/**
 * A stylised elder with a white beard and skullcap who reaches for the glass,
 * lifts it and sips. Built from simple primitives (no model download). Arms use
 * analytic two-bone IK from shoulder to the gripping hand, whose position is a pure
 * function of the shared timeline, so scrolling scrubs the whole motion both ways.
 */
const L1 = 2.3;
const L2 = 2.3;
const Y = new THREE.Vector3(0, 1, 0);

const _d = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _perp = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _q = new THREE.Quaternion();

/** Solves an elbow position for a shoulder → hand reach. */
function solveElbow(s: THREE.Vector3, h: THREE.Vector3, pole: THREE.Vector3, out: THREE.Vector3) {
  _d.subVectors(h, s);
  const dist = Math.min(Math.max(_d.length(), 0.2), L1 + L2 - 0.002);
  _d.normalize();
  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
  const hh = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
  _mid.copy(s).addScaledVector(_d, a);
  _perp.copy(pole).addScaledVector(_d, -pole.dot(_d)).normalize();
  return out.copy(_mid).addScaledVector(_perp, hh);
}

function place(mesh: THREE.Object3D | null, a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  if (!mesh) return;
  const len = a.distanceTo(b);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  _d.subVectors(b, a).normalize();
  _q.setFromUnitVectors(Y, _d);
  mesh.quaternion.copy(_q);
  mesh.scale.set(radius, len, radius);
}

export function TeaElder({ tRef }: { tRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lids = useRef<(THREE.Mesh | null)[]>([]);
  const upperR = useRef<THREE.Mesh>(null);
  const foreR = useRef<THREE.Mesh>(null);
  const upperL = useRef<THREE.Mesh>(null);
  const foreL = useRef<THREE.Mesh>(null);
  const handR = useRef<THREE.Mesh>(null);
  const handL = useRef<THREE.Mesh>(null);
  const elbowR = useRef<THREE.Mesh>(null);
  const elbowL = useRef<THREE.Mesh>(null);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: "#b98055", roughness: 0.72, transparent: true }),
      cloth: new THREE.MeshStandardMaterial({ color: "#a8b98a", roughness: 0.92, transparent: true }),
      hair: new THREE.MeshStandardMaterial({ color: "#f3f1ea", roughness: 0.95, transparent: true }),
      cap: new THREE.MeshStandardMaterial({ color: "#f7f5ee", roughness: 0.9, transparent: true }),
      dark: new THREE.MeshStandardMaterial({ color: "#2a1d14", roughness: 0.5, transparent: true }),
    }),
    [],
  );

  const shoulderR = useMemo(() => new THREE.Vector3(MAN.x - 1.18, 2.7, MAN.z + 0.05), []);
  const shoulderL = useMemo(() => new THREE.Vector3(MAN.x + 1.18, 2.7, MAN.z + 0.05), []);
  const elbow = useMemo(() => new THREE.Vector3(), []);
  const hand = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const t = tRef.current;
    const appear = manAppear(t);
    const { reach, lift, sipping } = sipState(t);

    if (group.current) group.current.visible = appear > 0.001;
    Object.values(mats).forEach((m) => {
      m.opacity = appear;
    });

    if (head.current) {
      // lean toward the table while reaching, then tip back to drink
      head.current.rotation.x = 0.1 * reach * (1 - lift) - 0.2 * sipping;
      head.current.position.y = 3.3 + 0.03 * Math.sin(t * 1.6) * appear;
    }
    // eyes close during the sip
    lids.current.forEach((m) => {
      if (m) m.scale.y = 0.085 * (1 - 0.9 * sipping) + 0.006;
    });

    // right arm (viewer's left) reaches for and lifts the glass
    handPosition(t, hand);
    solveElbow(shoulderR, hand, _pole.set(-0.7, -1, -0.15), elbow);
    place(upperR.current, shoulderR, elbow, 0.34);
    place(foreR.current, elbow, hand, 0.28);
    elbowR.current?.position.copy(elbow);
    handR.current?.position.copy(hand);

    // left arm rests on the table
    solveElbow(shoulderL, HAND_REST_LEFT, _pole.set(0.8, -1, -0.1), elbow);
    place(upperL.current, shoulderL, elbow, 0.34);
    place(foreL.current, elbow, HAND_REST_LEFT, 0.28);
    elbowL.current?.position.copy(elbow);
    handL.current?.position.copy(HAND_REST_LEFT);
  });

  const { skin, cloth, hair, cap, dark } = mats;
  return (
    <group ref={group} visible={false}>
      {/* torso: rounded shoulders down into the table */}
      <mesh material={cloth} position={[MAN.x, 1.4, MAN.z]} scale={[1.3, 1.95, 0.9]}>
        <sphereGeometry args={[1, 40, 24]} />
      </mesh>
      <mesh material={cloth} position={[MAN.x, -0.1, MAN.z]} scale={[1.1, 1.4, 0.82]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
      </mesh>
      {/* collar band + placket */}
      <mesh material={cloth} position={[MAN.x, 3.2, MAN.z + 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.12, 12, 28]} />
      </mesh>
      <mesh material={dark} position={[MAN.x, 2.2, MAN.z + 0.93]} scale={[0.04, 1.0, 0.03]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {/* neck */}
      <mesh material={skin} position={[MAN.x, 3.35, MAN.z]}>
        <cylinderGeometry args={[0.38, 0.45, 0.6, 20]} />
      </mesh>

      {/* head */}
      <group ref={head} position={[MAN.x, 3.3, MAN.z]}>
        <mesh material={skin} position={[0, 1.1, 0.05]} scale={[0.95, 1.1, 0.98]}>
          <sphereGeometry args={[1, 40, 28]} />
        </mesh>
        {/* skullcap */}
        <mesh material={cap} position={[0, 1.55, 0.0]} scale={[1.0, 0.78, 1.02]}>
          <sphereGeometry args={[1.0, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.15]} />
        </mesh>
        <mesh material={cap} position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1.04, 0.26]}>
          <torusGeometry args={[0.99, 0.09, 10, 40]} />
        </mesh>
        {/* ears */}
        {[-1, 1].map((x) => (
          <mesh key={x} material={skin} position={[x * 0.95, 1.1, 0.0]} scale={[0.16, 0.3, 0.22]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
        {/* brows + eyes */}
        {[-1, 1].map((x, i) => (
          <group key={x}>
            <mesh material={hair} position={[x * 0.38, 1.52, 0.86]} rotation={[0, 0, x * -0.15]} scale={[0.26, 0.07, 0.1]}>
              <sphereGeometry args={[1, 14, 10]} />
            </mesh>
            <mesh
              ref={(m) => {
                lids.current[i] = m;
              }}
              material={dark}
              position={[x * 0.36, 1.32, 0.9]}
              scale={[0.11, 0.085, 0.07]}
            >
              <sphereGeometry args={[1, 14, 10]} />
            </mesh>
          </group>
        ))}
        {/* nose */}
        <mesh material={skin} position={[0, 1.05, 1.0]} scale={[0.17, 0.3, 0.24]}>
          <sphereGeometry args={[1, 18, 14]} />
        </mesh>
        {/* mustache and beard */}
        {[-1, 1].map((x) => (
          <mesh key={x} material={hair} position={[x * 0.2, 0.72, 0.96]} rotation={[0, 0, x * -0.35]} scale={[0.32, 0.1, 0.12]}>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
        ))}
        <mesh material={hair} position={[0, 0.2, 0.55]} scale={[0.86, 0.95, 0.55]}>
          <sphereGeometry args={[1, 32, 24]} />
        </mesh>
        <mesh material={hair} position={[0, -0.35, 0.65]} scale={[0.5, 0.7, 0.35]}>
          <sphereGeometry args={[1, 28, 20]} />
        </mesh>
      </group>

      {/* arms: unit cylinders, scaled/rotated each frame */}
      <mesh ref={upperR} material={cloth}><cylinderGeometry args={[1, 1, 1, 16]} /></mesh>
      <mesh ref={foreR} material={cloth}><cylinderGeometry args={[1, 0.85, 1, 16]} /></mesh>
      <mesh ref={elbowR} material={cloth} scale={0.34}><sphereGeometry args={[1, 16, 12]} /></mesh>
      <mesh ref={handR} material={skin} scale={[0.3, 0.26, 0.3]}><sphereGeometry args={[1, 18, 14]} /></mesh>
      <mesh ref={upperL} material={cloth}><cylinderGeometry args={[1, 1, 1, 16]} /></mesh>
      <mesh ref={foreL} material={cloth}><cylinderGeometry args={[1, 0.85, 1, 16]} /></mesh>
      <mesh ref={elbowL} material={cloth} scale={0.34}><sphereGeometry args={[1, 16, 12]} /></mesh>
      <mesh ref={handL} material={skin} scale={[0.3, 0.22, 0.3]}><sphereGeometry args={[1, 18, 14]} /></mesh>
    </group>
  );
}
