import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const INK = new THREE.Color("#17110d");

/** Uniforms partagés par tous les matériaux : mis à jour une seule fois par frame / resize. */
export const shared = {
  uSpecDir: { value: new THREE.Vector3(-0.4, 0.7, 0.6) },
  uWorldPerPx: { value: 0.012 },
};

let gradient: THREE.DataTexture | null = null;

function toonGradient() {
  if (gradient) return gradient;
  const steps = new Uint8Array([70, 130, 195, 255]);
  gradient = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

type ToonOptions = {
  map?: THREE.Texture | null;
  spec?: number;
  shininess?: number;
  emissive?: THREE.ColorRepresentation;
};

/** Matériau toon à 4 paliers + reflet spéculaire dur « autocollant » façon BD. */
export function toon(color: THREE.ColorRepresentation, opts: ToonOptions = {}) {
  const { map = null, spec = 0.45, shininess = 40, emissive } = opts;
  const mat = new THREE.MeshToonMaterial({
    color,
    map,
    gradientMap: toonGradient(),
    ...(emissive !== undefined ? { emissive: new THREE.Color(emissive) } : {}),
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSpecDir = shared.uSpecDir;
    shader.uniforms.uSpec = { value: spec };
    shader.uniforms.uShin = { value: shininess };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform vec3 uSpecDir; uniform float uSpec; uniform float uShin;`,
      )
      .replace(
        "#include <opaque_fragment>",
        `{
           vec3 Vv = normalize(vViewPosition);
           vec3 Hh = normalize(normalize(uSpecDir) + Vv);
           float nh = max(dot(normal, Hh), 0.0);
           float hard = step(0.5, pow(nh, uShin));
           float soft = step(0.5, pow(nh, uShin * 0.22)) * 0.15;
           outgoingLight += vec3(1.0, 0.96, 0.82) * (hard + soft) * uSpec;
         }
         #include <opaque_fragment>`,
      );
  };
  return mat;
}

const outlineVert = /* glsl */ `
  uniform float uWidth;
  uniform float uWorldPerPx;
  void main() {
    vec3 p = position + normalize(normal) * uWidth * uWorldPerPx;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const outlineFrag = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`;

/** Géométrie aux normales lissées : volume « gonflé » et coque de contour sans fissures. */
export function smooth(geo: THREE.BufferGeometry) {
  const g = geo.clone();
  g.deleteAttribute("normal");
  const uv = g.getAttribute("uv");
  if (uv) g.deleteAttribute("uv");
  const merged = mergeVertices(g, 1e-3);
  merged.computeVertexNormals();
  return merged;
}

export function outlineMaterial(widthPx: number) {
  return new THREE.ShaderMaterial({
    vertexShader: outlineVert,
    fragmentShader: outlineFrag,
    side: THREE.BackSide,
    uniforms: {
      uWidth: { value: widthPx },
      uColor: { value: INK },
      uWorldPerPx: shared.uWorldPerPx,
    },
  });
}

type InkOptions = { width?: number; cast?: boolean; receive?: boolean; smoothNormals?: boolean };

/** Crée un mesh toon + sa coque de contour noir (technique « inverted hull »). */
export function inked(
  geo: THREE.BufferGeometry,
  mat: THREE.Material | THREE.Material[],
  { width = 4, cast = true, receive = true, smoothNormals = false }: InkOptions = {},
) {
  const g = smoothNormals ? smooth(geo) : geo;
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(g, mat);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  group.add(mesh);
  if (width > 0) {
    const hullGeo = smoothNormals ? g : smooth(geo);
    const hull = new THREE.Mesh(hullGeo, outlineMaterial(width));
    group.add(hull);
  }
  return group;
}

/** Texture de peau de cochon rôti : dorée, cloques, brunissements, reflets, peinte à la main. */
export function skinTexture() {
  const W = 1024;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#8a4614");
  base.addColorStop(0.5, "#c27a24");
  base.addColorStop(1, "#a35c1a");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const wrap = (fn: (dx: number) => void) => [-W, 0, W].forEach(fn);

  // grandes plaques brunies
  for (let i = 0; i < 38; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 40 + rnd() * 90;
    wrap((dx) => {
      const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, r);
      g.addColorStop(0, "rgba(110,44,10,0.7)");
      g.addColorStop(1, "rgba(140,62,16,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x + dx, y, r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // zones claires, dorées
  for (let i = 0; i < 30; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 30 + rnd() * 70;
    wrap((dx) => {
      const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, r);
      g.addColorStop(0, "rgba(255,206,110,0.45)");
      g.addColorStop(1, "rgba(255,214,120,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + dx, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // cloques de la peau croustillante : bord sombre + cœur clair
  for (let i = 0; i < 520; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = 5 + rnd() * 11;
    wrap((dx) => {
      ctx.fillStyle = "rgba(122,52,12,0.42)";
      ctx.beginPath();
      ctx.ellipse(x + dx + 1.5, y + 2, r, r * 0.82, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,214,120,0.38)";
      ctx.beginPath();
      ctx.ellipse(x + dx - 1, y - 1.5, r * 0.62, r * 0.46, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // petites craquelures
  ctx.strokeStyle = "rgba(95,40,10,0.45)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const a = rnd() * Math.PI;
    const l = 10 + rnd() * 22;
    wrap((dx) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y);
      ctx.quadraticCurveTo(x + dx + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.7, x + dx + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    });
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function barkTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#6a3f22";
  ctx.fillRect(0, 0, 256, 128);
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 46; i++) {
    const x = rnd() * 256;
    ctx.strokeStyle = rnd() > 0.5 ? "rgba(32,16,8,0.7)" : "rgba(150,96,52,0.55)";
    ctx.lineWidth = 2 + rnd() * 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 10, 40, x - 10, 80, x + 4, 128);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function logEndTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d9a468";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#8a5428";
  ctx.lineWidth = 4;
  for (let r = 10; r < 64; r += 13) {
    ctx.beginPath();
    ctx.arc(64, 64, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function glowTexture(inner: string, outer = "rgba(0,0,0,0)") {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}



