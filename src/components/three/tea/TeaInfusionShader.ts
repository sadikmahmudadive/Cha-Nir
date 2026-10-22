/**
 * Tea infusion: a continuous, single-liquid shader (no object swap).
 *
 * Approach (documented trade-off): instead of a fluid solver, tea "density" is a
 * procedural 3-D field driven by the central timeline:
 *   • up to 8 plumes, one per early leaf impact, that spread outward, trail
 *     down toward the leaf bed and are broken up by fbm noise (wisps),
 *   • a global infusion term that fades the whole cup to full strength,
 *   • a dark bed near the floor once leaves settle.
 * The ray is marched through the cup with 3–4 samples and attenuated with
 * Beer–Lambert using wavelength-dependent absorption (blue dies first), so the
 * colour goes clear → golden → amber → deep red-brown, darker through the
 * centre (long path) and warmer toward the glass edge (short path).
 * The top surface adds ripples from leaf impacts + a soft specular/fresnel.
 */
export const infusionVertex = /* glsl */ `
varying vec3 vP;
varying vec3 vN;
varying vec3 vCam;
void main() {
  vP = position;
  vN = normal;
  vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const infusionFragment = /* glsl */ `
precision highp float;
uniform float uT;
uniform float uInf;
uniform float uBed;
uniform float uH;
uniform vec4 uSrc[8];
uniform vec4 uRip[8];
uniform vec3 uLight;
uniform float uSteps;
varying vec3 vP;
varying vec3 vN;
varying vec3 vCam;

const float R = 0.55;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  return 0.55 * vnoise(p) + 0.3 * vnoise(p * 2.1) + 0.15 * vnoise(p * 4.3);
}

float density(vec3 p) {
  float nz = fbm(p * vec3(3.2, 2.4, 3.2) + vec3(0.0, -uT * 0.16, uT * 0.05));
  float d = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 s = uSrc[i];
    float age = uT - s.w;
    if (s.w < 0.0 || age <= 0.0) continue;
    float r = 0.11 + age * 0.17;
    // plume falls toward the leaf bed as the leaf sinks
    float cy = mix(s.y, 0.1, smoothstep(0.0, 2.4, age));
    vec3 q = vec3(p.x - s.x, (p.y - cy) * 0.55, p.z - s.z);
    float dist2 = dot(q, q);
    d += exp(-dist2 / (r * r)) * smoothstep(0.0, 0.45, age) * (0.4 + 1.25 * nz);
  }
  d += uInf * (0.28 + 0.9 * nz) * (1.0 - 0.18 * p.y / uH);
  d += uBed * smoothstep(0.38, 0.0, p.y) * 0.9;
  return d;
}

float exitDist(vec3 p, vec3 d) {
  float a = dot(d.xz, d.xz);
  float b = dot(p.xz, d.xz);
  float c = dot(p.xz, p.xz) - R * R;
  float t1 = (-b + sqrt(max(b * b - a * c, 0.0))) / max(a, 1e-5);
  float t2 = 1e5;
  if (d.y > 1e-4) t2 = (uH - p.y) / d.y;
  else if (d.y < -1e-4) t2 = (0.0 - p.y) / d.y;
  return max(min(t1, t2), 0.0);
}

float ripple(vec2 xz) {
  float h = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 r = uRip[i];
    float age = uT - r.z;
    if (r.w <= 0.0 || age < 0.0) continue;
    float dist = length(xz - r.xy);
    float front = age * 0.7;
    float env = exp(-age * 2.6) * exp(-abs(dist - front) * 7.0) * smoothstep(0.0, 0.05, age);
    h += sin((dist - front) * 40.0) * env * r.w;
  }
  return h;
}

void main() {
  vec3 rd = normalize(vP - vCam);
  float L = exitDist(vP, rd);

  float dens = 0.0;
  float j = hash(vP * 91.7 + uT);
  for (int k = 0; k < 4; k++) {
    if (float(k) >= uSteps) break;
    float tt = (float(k) + 0.25 + 0.5 * j) / uSteps * L;
    dens += density(vP + rd * tt);
  }
  dens /= uSteps;

  // wavelength-dependent absorption: blue first, then green, red last
  vec3 sigma = vec3(0.75, 2.4, 5.4);
  vec3 T = exp(-sigma * dens * L * 1.12);
  // The canvas is composited over the cream page, so we reproduce "background × T"
  // exactly with one scalar alpha: A = 1 - min(T), colour = B·(T - min T)/A (never negative).
  float Tm = min(T.r, min(T.g, T.b));
  float a = clamp(1.0 - Tm, 0.015, 0.95);
  vec3 B = vec3(0.95, 0.93, 0.87);
  vec3 c = clamp(B * (T - Tm) / a, 0.0, 1.0);
  c += vec3(0.55, 0.34, 0.1) * (1.0 - Tm) * 0.16;       // warm in-scatter
  // faint glass-edge warmth (short path) so the rim never goes muddy
  float edge = smoothstep(0.0, 0.6, 0.55 - L * 0.5);
  c += vec3(0.3, 0.14, 0.03) * edge * (1.0 - Tm) * 0.3;

  vec3 refl = vec3(0.0);
  float ra = 0.0;
  if (vN.y > 0.9) {
    vec2 xz = vP.xz;
    float h0 = ripple(xz);
    float e = 0.012;
    float hx = ripple(xz + vec2(e, 0.0)) - h0;
    float hz = ripple(xz + vec2(0.0, e)) - h0;
    vec3 n = normalize(vec3(-hx / e, 1.0, -hz / e));
    n.xz += (vec2(vnoise(vec3(xz * 5.0, uT * 0.6)), vnoise(vec3(xz * 5.0 + 9.0, uT * 0.6))) - 0.5) * 0.05;
    n = normalize(n);
    float fr = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
    float spec = pow(max(dot(reflect(rd, n), normalize(uLight)), 0.0), 110.0);
    refl = vec3(0.93, 0.9, 0.82) * fr * 0.55 + vec3(1.0, 0.97, 0.88) * spec * 1.2;
    ra = clamp(fr * 0.5 + spec, 0.0, 1.0);
  }
  float a2 = clamp(a + ra * (1.0 - a), 0.0, 0.97);
  vec3 rgb = (c * a + refl * (1.0 - a)) / max(a2, 1e-3);
  gl_FragColor = vec4(rgb, a2);
}
`;

export const steamVertex = /* glsl */ `
uniform float uT;
uniform float uSwayAmt;
uniform float uPhase;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  float y = uv.y;
  // widen as it rises, sway on two incommensurate sines, then drift sideways
  p.x *= mix(0.45, 1.25, y);
  p.x += (sin(y * 3.1 + uT * 0.9 + uPhase) * 0.09 + sin(y * 6.7 - uT * 0.6 + uPhase * 2.0) * 0.04) * uSwayAmt * y;
  p.x += 0.2 * y * y * uSwayAmt;
  p.z += sin(y * 2.3 + uT * 0.7 + uPhase) * 0.05 * y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const steamFragment = /* glsl */ `
precision highp float;
uniform float uT;
uniform float uAmount;
uniform float uPhase;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  float t = uT * 0.32 + uPhase;
  // domain-warped, upward-scrolling noise gives thin, curling, irregular wisps
  vec2 q = vec2(uv.x * 2.6, uv.y * 3.4 - t);
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.4)), fbm(q + vec2(5.2, 1.3)));
  float n = fbm(q * 1.15 + w * 1.7);
  float wisp = smoothstep(0.46, 0.78, n);

  float side = smoothstep(0.0, 0.32, uv.x) * smoothstep(1.0, 0.68, uv.x);
  float rise = smoothstep(0.0, 0.1, uv.y) * (1.0 - smoothstep(0.45, 1.0, uv.y));
  float alpha = wisp * side * rise * uAmount * 0.72;

  // pale grey-white with a cooler core so it reads on cream and on sage
  vec3 col = mix(vec3(0.74, 0.77, 0.77), vec3(0.97, 0.97, 0.95), smoothstep(0.35, 0.9, n));
  gl_FragColor = vec4(col, alpha);
}
`;
