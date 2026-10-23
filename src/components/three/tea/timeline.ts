/**
 * Central timeline for the tea-ritual hero.
 *
 * Everything that moves (box flaps, box tilt, every falling leaf, infusion,
 * steam, camera) is a PURE function of one number: the loop time `t` in
 * seconds. One driver advances `t`; no component owns its own animation loop.
 * Consequences: dropped frames cannot desynchronise anything, any moment can be
 * rendered on demand (`?tea_t=4.5`), and the leaf "physics" is analytic
 * (ballistic arcs solved to land inside the cup) so leaves can never pass
 * through the glass walls.
 *
 * World units: roughly 1 unit ≈ 7 cm. +x is right, +y up, +z toward camera.
 */
import * as THREE from "three";

/* ── phases (seconds) ─────────────────────────────────────────── */
export const T = {
  introEnd: 1.5,
  open0: 1.5,
  open1: 3.0,
  tilt0: 2.9,
  tilt1: 3.9,
  tiltHold: 5.35,
  tiltBack: 6.35,
  pour0: 3.45,
  pour1: 5.25,
  infuse0: 4.1,
  infuse1: 8.4,
  steam0: 4.9,
  steam1: 8.0,
  fadeOut0: 11.7,
  fadeOut1: 12.35,
  fadeInEnd: 0.55,
} as const;
/** Full loop: ~8 s story, ~3.7 s hold on the final composition, then a dissolve reset. */
export const LOOP = 12.6;
/** A representative "final composition" moment, used for posters and reduced motion. */
export const T_FINAL = 10.2;
/** The scroll story continues past the ritual: an elder sips the tea. */
export const T_SIP_END = 16.2;
/** Frame used for posters / reduced-motion: mid-sip. */
export const T_POSTER = 15.8;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export function easeOutBack(x: number, s = 1.1) {
  const c = clamp01(x) - 1;
  return 1 + c * c * ((s + 1) * c + s);
}

/** Wrap-aware dissolve opacity (fade in at loop start, out at loop end). */
export const loopOpacity = (t: number) => smooth(0, T.fadeInEnd, t) * (1 - smooth(T.fadeOut0, T.fadeOut1, t));

/* ── scene dimensions ─────────────────────────────────────────── */
export const BOX = { w: 1.4, h: 2.0, d: 0.9, t: 0.022 };
export const CUP = {
  x: 1.65,
  z: 0.8,
  height: 1.55,
  floor: 0.2, // inner floor height
  water: 1.2, // water surface height
  /** outer / inner radius at height y (slightly tapered glass). */
  outer: (y: number) => 0.575 + 0.085 * (y / 1.55),
  inner: (y: number) => 0.575 + 0.085 * (y / 1.55) - 0.05,
};

/* ── box pose ─────────────────────────────────────────────────── */
const REST = { x: -1.25, y: 0, z: -0.1, ry: -0.3 };
const THETA = THREE.MathUtils.degToRad(58);
/** Where the pouring lip must be (world) at full tilt: just inside the cup rim. */
const LIP_TARGET = new THREE.Vector3(CUP.x - 0.22, CUP.height + 0.62, CUP.z);
const LIP_LOCAL = new THREE.Vector3(BOX.w / 2, BOX.h, 0);

const POUR = (() => {
  const m = new THREE.Matrix4().makeRotationZ(-THETA);
  const lip = LIP_LOCAL.clone().applyMatrix4(m);
  return { x: LIP_TARGET.x - lip.x, y: LIP_TARGET.y - lip.y, z: LIP_TARGET.z, ry: 0 };
})();

export interface BoxPose {
  x: number;
  y: number;
  z: number;
  ry: number;
  /** Tilt about world Z (clockwise toward the cup), radians. */
  tilt: number;
  /** 0..1 amount of tilt. */
  k: number;
}

export function boxPose(t: number): BoxPose {
  const k = smooth(T.tilt0, T.tilt1, t) * (1 - smooth(T.tiltHold, T.tiltBack, t));
  // anticipation: a tiny lift before the tilt begins
  const lift = Math.sin(smooth(T.tilt0 - 0.4, T.tilt0 + 0.1, t) * Math.PI) * 0.05;
  return {
    x: lerp(REST.x, POUR.x, k),
    y: lerp(REST.y, POUR.y, k) + lift,
    z: lerp(REST.z, POUR.z, k),
    ry: lerp(REST.ry, POUR.ry, k),
    tilt: k * THETA,
    k,
  };
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3(1, 1, 1);
export function boxMatrix(t: number, out = new THREE.Matrix4()): THREE.Matrix4 {
  const p = boxPose(t);
  // world = T(pos) * Rz(-tilt) * Ry(yaw)
  _e.set(0, p.ry, 0);
  _q.setFromEuler(_e);
  _m.makeRotationZ(-p.tilt);
  out.compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion().setFromRotationMatrix(_m).multiply(_q), _s);
  return out;
}

/** Normalised flap openings (1 ≈ fully open). Includes a damped flutter for secondary motion. */
export function flapOpen(t: number) {
  const flutter = (k: number) => 0.035 * Math.exp(-(t - k) * 5) * Math.sin((t - k) * 20) * (t > k ? 1 : 0);
  return {
    front: easeOut(smooth(1.5, 2.25, t)) + flutter(2.25),
    sideL: easeOut(smooth(1.62, 2.5, t)) + flutter(2.5),
    sideR: easeOut(smooth(1.7, 2.6, t)) + flutter(2.6),
    main: easeOutBack(smooth(1.5, 2.95, t), 0.9) + flutter(2.95),
  };
}

/* ── liquid state ─────────────────────────────────────────────── */
export const infusion = (t: number) => smooth(T.infuse0, T.infuse1, t);
export const steamAmount = (t: number) => Math.max(0.1 * smooth(0.4, 1.4, t), smooth(T.steam0, T.steam1, t));

/* ── leaves ───────────────────────────────────────────────────── */
export interface LeafPlan {
  ts: number; // spawn time
  tau: number; // flight time
  p0: THREE.Vector3; // spawn position (world)
  v0: THREE.Vector3; // launch velocity solving the arc to the target
  target: THREE.Vector3; // surface entry point
  rest: THREE.Vector3; // resting place on the cup floor
  sink: number; // seconds to settle
  scale: number;
  spin: THREE.Vector3; // tumbling rate (rad/s)
  rot0: THREE.Euler;
  restQ: THREE.Quaternion;
  colorT: number;
  variant: number;
}

const GRAV = 5.2;

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

export function makeLeafPlans(count: number, seed: number, hero: boolean): LeafPlan[] {
  const r = mulberry(seed);
  const plans: LeafPlan[] = [];
  for (let i = 0; i < count; i++) {
    const u = (i + r() * 0.8) / count;
    const ts = T.pour0 + (T.pour1 - T.pour0) * Math.pow(u, 1.15) + r() * 0.03;
    const tau = hero ? 0.62 + r() * 0.2 : 0.5 + r() * 0.22;

    const lipLocal = new THREE.Vector3(BOX.w / 2 - 0.06 - r() * 0.3, BOX.h - 0.02, (r() - 0.5) * 0.55);
    const p0 = lipLocal.applyMatrix4(boxMatrix(ts));

    const a = r() * Math.PI * 2;
    const rr = (hero ? 0.3 : 0.36) * Math.sqrt(r());
    const target = new THREE.Vector3(CUP.x + Math.cos(a) * rr, CUP.water, CUP.z + Math.sin(a) * rr);
    // v0 = (target - p0 - ½ g τ²) / τ   (g points down)
    const v0 = new THREE.Vector3(
      (target.x - p0.x) / tau,
      (target.y - p0.y + 0.5 * GRAV * tau * tau) / tau,
      (target.z - p0.z) / tau,
    );

    const ra = r() * Math.PI * 2;
    const rrest = 0.4 * Math.sqrt(r());
    const rest = new THREE.Vector3(CUP.x + Math.cos(ra) * rrest, CUP.floor + 0.025 + r() * 0.15, CUP.z + Math.sin(ra) * rrest);

    const flat = new THREE.Euler(-Math.PI / 2 + (r() - 0.5) * 0.7, r() * Math.PI * 2, (r() - 0.5) * 0.9, "YXZ");
    plans.push({
      ts,
      tau,
      p0,
      v0,
      target,
      rest,
      sink: 1.1 + r() * 1.3,
      scale: hero ? 0.2 + r() * 0.13 : 0.075 + r() * 0.06,
      spin: new THREE.Vector3((r() - 0.5) * 12, (r() - 0.5) * 14, (r() - 0.5) * 12),
      rot0: new THREE.Euler(r() * 6.28, r() * 6.28, r() * 6.28),
      restQ: new THREE.Quaternion().setFromEuler(flat),
      colorT: r(),
      variant: Math.floor(r() * 3),
    });
  }
  return plans;
}

const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();
const _ee = new THREE.Euler();

/**
 * Writes the instance transform of one leaf at time `t`.
 * Returns false when the leaf is not visible yet (not spawned).
 */
export function leafTransform(p: LeafPlan, t: number, pos: THREE.Vector3, quat: THREE.Quaternion, scaleOut: { v: number }): boolean {
  const s = t - p.ts;
  if (s < 0) return false;

  if (s < p.tau) {
    // ballistic flight: p0 + v0 s − ½ g s² (y)
    pos.set(p.p0.x + p.v0.x * s, p.p0.y + p.v0.y * s - 0.5 * GRAV * s * s, p.p0.z + p.v0.z * s);
    _ee.set(p.rot0.x + p.spin.x * s, p.rot0.y + p.spin.y * s, p.rot0.z + p.spin.z * s);
    quat.setFromEuler(_ee);
    scaleOut.v = p.scale * smooth(0, 0.12, s);
    return true;
  }

  // in the water: float for a beat, drift, then sink and lie down on the floor
  const w = s - p.tau;
  const f = smooth(0.15 + p.colorT * 0.25, 0.15 + p.colorT * 0.25 + p.sink, w);
  const swirl = (1 - f) * Math.min(1, w * 3) * 0.05;
  const surfaceY = CUP.water + 0.012 * Math.sin(w * 6 + p.colorT * 6) * (1 - f);
  pos.set(
    lerp(p.target.x, p.rest.x, f) + Math.sin(w * 3 + p.colorT * 9) * swirl,
    lerp(surfaceY, p.rest.y, f),
    lerp(p.target.z, p.rest.z, f) + Math.cos(w * 2.4 + p.colorT * 9) * swirl,
  );
  const decay = 1 - Math.exp(-w * 2.2);
  _ee.set(
    p.rot0.x + p.spin.x * (p.tau + decay * 0.25),
    p.rot0.y + p.spin.y * (p.tau + decay * 0.25),
    p.rot0.z + p.spin.z * (p.tau + decay * 0.25),
  );
  _qa.setFromEuler(_ee);
  _qb.copy(p.restQ);
  quat.copy(_qa).slerp(_qb, f);
  scaleOut.v = p.scale;
  return true;
}

/** Impact list (time + local-to-liquid position) used for ripples and infusion sources. */
export function impactsOf(plans: LeafPlan[]) {
  return plans
    .map((p) => ({ t: p.ts + p.tau, x: p.target.x - CUP.x, z: p.target.z - CUP.z, strength: p.scale }))
    .sort((a, b) => a.t - b.t);
}

/* ── camera ───────────────────────────────────────────────────── */
interface Key {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
}
const KEYS: Key[] = [
  { t: 0, pos: [0.5, 2.9, 13.6], look: [0.2, 1.55, 0] },
  { t: 1.5, pos: [0.4, 2.8, 12.5], look: [0.2, 1.55, 0] },
  // rise slightly so the viewer can look into the opening carton
  { t: 2.6, pos: [0.3, 4.5, 12.7], look: [0.15, 1.8, 0] },
  { t: 3.6, pos: [0.55, 4.0, 13.0], look: [0.4, 2.0, 0] },
  { t: 4.8, pos: [0.85, 3.5, 13.1], look: [0.65, 2.05, 0] },
  { t: 7.0, pos: [0.8, 3.0, 12.4], look: [0.5, 1.8, 0] },
  { t: 9.0, pos: [0.65, 2.8, 12.0], look: [0.4, 1.7, 0] },
  { t: 10.2, pos: [0.65, 2.8, 12.0], look: [0.4, 1.7, 0] },
  // pull back and up: the elder is revealed behind the table
  { t: 12.0, pos: [1.0, 4.4, 17.2], look: [1.0, 2.9, -0.8] },
  { t: T_SIP_END, pos: [1.1, 4.2, 16.4], look: [1.1, 3.0, -0.8] },
];

export function cameraKey(t: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = smooth(a.t, b.t, t);
  outPos.set(lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k));
  outLook.set(lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k), lerp(a.look[2], b.look[2], k));
}

/* ── the elder and the sip ────────────────────────────────────── */
export const MAN = { x: CUP.x, z: -2.35 };
export const manAppear = (t: number) => smooth(10.3, 11.7, t);

/** Cup pivot at rest (middle of the glass). */
export const CUP_PIVOT = new THREE.Vector3(CUP.x, CUP.height * 0.5, CUP.z);
const MOUTH_PIVOT = new THREE.Vector3(CUP.x, 3.2, MAN.z + 1.4);
const SIP_TILT = THREE.MathUtils.degToRad(30);

export function sipState(t: number) {
  const reach = smooth(11.8, 12.8, t);
  const lift = smooth(12.8, 14.7, t);
  const tilt = smooth(14.1, 15.2, t) * SIP_TILT;
  const sipping = smooth(14.6, 15.2, t);
  return { reach, lift, tilt, sipping };
}

/** World-space offset of the cup pivot from rest and the tilt (about X, rim toward the elder). */
export function cupPose(t: number) {
  const { lift, tilt } = sipState(t);
  const e = lift * lift * (3 - 2 * lift);
  const arc = Math.sin(Math.PI * e) * 0.55;
  const pos = new THREE.Vector3().lerpVectors(CUP_PIVOT, MOUTH_PIVOT, e);
  pos.z += arc;
  return { pos, tilt };
}

const GRIP_LOCAL = new THREE.Vector3(-0.76, 0.12, 0);
const HAND_REST = new THREE.Vector3(CUP.x - 1.55, 0.5, MAN.z + 1.0);

/** World position of the gripping hand. */
export function handPosition(t: number, out = new THREE.Vector3()) {
  const { reach } = sipState(t);
  const { pos, tilt } = cupPose(t);
  const grip = GRIP_LOCAL.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), -tilt).add(pos);
  return out.lerpVectors(HAND_REST, grip, reach * reach * (3 - 2 * reach));
}
export const HAND_REST_LEFT = new THREE.Vector3(CUP.x + 1.55, 0.5, MAN.z + 1.0);
