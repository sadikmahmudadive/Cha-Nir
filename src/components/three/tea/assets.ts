import * as THREE from "three";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Curled, irregular dry tea leaf: a pointed blade whose cross-section is a
 * rolled "trough", with a lengthwise bend and twist and jittered edges.
 * Length is 1 along +y (centred), so instance scale = leaf length.
 */
export function makeLeafGeometry(seed: number, lenSeg: number, widSeg: number, curl: number, bend: number, twist: number) {
  const r = rng(seed);
  const pos: number[] = [];
  const idx: number[] = [];
  const uv: number[] = [];
  const phase = r() * 6.28;
  for (let i = 0; i <= lenSeg; i++) {
    const u = i / lenSeg;
    const base = Math.sin(Math.PI * Math.pow(u, 0.72));
    for (let j = 0; j <= widSeg; j++) {
      const v = (j / widSeg) * 2 - 1;
      const edge = Math.abs(v) > 0.99 ? 1 + (r() - 0.5) * 0.35 : 1;
      const w = 0.2 * base * edge * (1 + 0.1 * Math.sin(u * 9 + phase));
      const phi = v * curl;
      let x = curl > 0.01 ? (Math.sin(phi) / Math.sin(curl)) * w : v * w;
      let z = curl > 0.01 ? ((1 - Math.cos(phi)) / (1 - Math.cos(curl))) * w * 0.55 * Math.min(1, curl) : 0;
      let y = u - 0.5;
      // bend along the length (arc in the y-z plane), then twist about y
      z += bend * Math.sin(u * Math.PI) * 0.25 + bend * 0.1 * Math.sin(u * 5 + phase) * 0.3;
      const a = twist * (u - 0.5);
      const xr = x * Math.cos(a) - z * Math.sin(a);
      const zr = x * Math.sin(a) + z * Math.cos(a);
      x = xr;
      z = zr;
      y += 0.03 * Math.sin(v * 3 + phase) * base;
      pos.push(x, y, z);
      uv.push(j / widSeg, u);
    }
  }
  const row = widSeg + 1;
  for (let i = 0; i < lenSeg; i++) {
    for (let j = 0; j < widSeg; j++) {
      const a = i * row + j;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Dark brown → near-black dry-leaf palette (sRGB hex). */
export const LEAF_COLORS = ["#120b07", "#1c120b", "#26180f", "#321f12", "#3d2716", "#1a0f09"].map((c) => new THREE.Color(c));

/** Fine paper-grain noise used as bump + roughness variation on the carton. */
export function makePaperTexture(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = rng(42);
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const n = 150 + r() * 105;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = n;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // faint fibres
  g.globalAlpha = 0.08;
  g.strokeStyle = "#000";
  for (let i = 0; i < 900; i++) {
    const x = r() * size;
    const y = r() * size;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 14, y + (r() - 0.5) * 14);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 4);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

const GREEN = "#4b6535";
const GREEN_DEEP = "#3d5229";
const CREAM = "#F7F4E9";
const LIME = "#A5BE16";

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function printBase(g: CanvasRenderingContext2D, w: number, h: number) {
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, GREEN);
  grad.addColorStop(1, GREEN_DEEP);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  // subtle ink speckle
  const r = rng(7);
  g.globalAlpha = 0.05;
  for (let i = 0; i < 1500; i++) {
    g.fillStyle = r() > 0.5 ? "#fff" : "#000";
    g.fillRect(r() * w, r() * h, 2, 2);
  }
  g.globalAlpha = 1;
}

/** Front panel: printed carton with the unmodified Cha Nir logo on a cream label. */
export function makeFrontTexture(onLoad?: () => void) {
  const W = 1024;
  const H = Math.round((W * 2.0) / 1.4);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const draw = (logo?: HTMLImageElement) => {
    printBase(g, W, H);
    // thin lime keyline
    g.strokeStyle = LIME;
    g.lineWidth = 6;
    roundRect(g, 44, 44, W - 88, H - 88, 30);
    g.stroke();
    // cream label
    const lx = 92;
    const ly = 210;
    const lw = W - 184;
    const lh = 840;
    g.fillStyle = CREAM;
    roundRect(g, lx, ly, lw, lh, 44);
    g.fill();
    if (logo) {
      const ar = logo.naturalWidth / logo.naturalHeight;
      const w = lw - 80;
      const h = w / ar;
      g.drawImage(logo, lx + 40, ly + (lh - h) / 2 - 10, w, h);
    }
    g.fillStyle = CREAM;
    g.textAlign = "center";
    g.font = "600 74px Georgia, 'Times New Roman', serif";
    g.fillText("Premium Black Tea", W / 2, ly + lh + 150);
    g.fillStyle = LIME;
    g.fillRect(W / 2 - 70, ly + lh + 188, 140, 6);
    g.fillStyle = "rgba(247,244,233,0.85)";
    g.font = "600 38px Arial, sans-serif";
    g.fillText("LOOSE LEAF  ·  BANGLADESH", W / 2, ly + lh + 262);
    g.font = "600 34px Arial, sans-serif";
    g.fillText("PURE  •  ORGANIC  •  DESHI", W / 2, H - 120);
    tex.needsUpdate = true;
  };

  draw();
  const img = new Image();
  img.onload = () => {
    draw(img);
    onLoad?.();
  };
  img.src = "/brand/logo.png";
  return tex;
}

export function makeSideTexture() {
  const W = 640;
  const H = Math.round((W * 2.0) / 0.9);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  printBase(g, W, H);
  g.save();
  g.translate(W / 2, H / 2);
  g.rotate(-Math.PI / 2);
  g.fillStyle = CREAM;
  g.textAlign = "center";
  g.font = "600 92px Georgia, 'Times New Roman', serif";
  g.fillText("Cha Nir", 0, -20);
  g.fillStyle = LIME;
  g.fillRect(-90, 14, 180, 6);
  g.fillStyle = "rgba(247,244,233,0.85)";
  g.font = "600 38px Arial, sans-serif";
  g.fillText("PURE  •  ORGANIC  •  DESHI", 0, 80);
  g.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function makePlainTexture(color = GREEN) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = color;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
