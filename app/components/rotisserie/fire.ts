import * as THREE from "three";
import { glowTexture, INK } from "./toon";
import { GROUND_Y } from "./stage";

const flameVert = /* glsl */ `
  attribute float aT;
  uniform float uTime;
  uniform float uSeed;
  uniform float uSpeed;
  void main() {
    vec3 p = position;
    float t = aT;
    float ti = uTime * uSpeed;
    float sway = sin(ti * 2.3 + uSeed + t * 3.2) * 0.17 + sin(ti * 5.1 + uSeed * 1.7 + t * 5.0) * 0.06;
    p.x += sway * pow(t, 1.4);
    p.y *= 1.0 + 0.09 * sin(ti * 3.7 + uSeed * 2.1) + 0.05 * sin(ti * 8.3 + uSeed);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const flameFrag = /* glsl */ `
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <colorspace_fragment>
  }
`;

function flameGeometry(lean: number) {
  const N = 28;
  const pos: number[] = [];
  const ts: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const w = 0.5 * Math.sin(Math.PI * Math.pow(t, 0.55));
    const c = lean * Math.pow(t, 2.2);
    pos.push(c - w, t, 0, c + w, t, 0);
    ts.push(t, t);
    if (i < N) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
  g.setIndex(idx);
  return g;
}

const LAYERS = [
  { color: "#d7453a", sx: 1, sy: 1, dz: 0.01, ph: 0 },
  { color: "#ff8a2a", sx: 0.68, sy: 0.74, dz: 0.02, ph: 0.25 },
  { color: "#ffd452", sx: 0.42, sy: 0.48, dz: 0.03, ph: 0.5 },
  { color: "#fff4c8", sx: 0.2, sy: 0.24, dz: 0.04, ph: 0.75 },
] as const;

type FlameSpec = { x: number; z: number; w: number; h: number; lean: number; seed: number; speed: number };

const FLAMES: FlameSpec[] = [
  { x: 0.0, z: -0.12, w: 1.05, h: 1.95, lean: 0.12, seed: 0.0, speed: 0.85 },
  { x: -0.72, z: -0.04, w: 0.82, h: 1.55, lean: -0.22, seed: 1.9, speed: 1.0 },
  { x: 0.74, z: -0.02, w: 0.82, h: 1.65, lean: 0.24, seed: 3.4, speed: 0.92 },
  { x: -1.3, z: 0.06, w: 0.56, h: 1.0, lean: -0.2, seed: 5.1, speed: 1.15 },
  { x: 1.32, z: 0.06, w: 0.56, h: 1.1, lean: 0.2, seed: 2.6, speed: 1.1 },
  { x: -0.28, z: 0.18, w: 0.52, h: 1.0, lean: -0.12, seed: 4.2, speed: 1.3 },
  { x: 0.42, z: 0.2, w: 0.46, h: 0.88, lean: 0.16, seed: 0.9, speed: 1.4 },
];

export function createFire(azimuth: number) {
  const root = new THREE.Group();

  // Halo derrière les flammes
  const backGlowMat = new THREE.MeshBasicMaterial({
    map: glowTexture("rgba(255,140,50,0.55)", "rgba(255,100,30,0)"),
    transparent: true,
    depthWrite: false,
  });
  const backGlow = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), backGlowMat);
  backGlow.position.set(0, GROUND_Y + 1.5, -0.9);
  backGlow.rotation.y = azimuth;
  root.add(backGlow);

  // Flammes : plans face caméra, vrai mouvement indépendant par langue de feu
  const flames = new THREE.Group();
  flames.rotation.y = azimuth;
  const materials: THREE.ShaderMaterial[] = [];
  const baseY = GROUND_Y + 0.25;

  const makeMat = (color: THREE.ColorRepresentation, f: FlameSpec, ph: number) => {
    const m = new THREE.ShaderMaterial({
      vertexShader: flameVert,
      fragmentShader: flameFrag,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: f.seed + ph },
        uSpeed: { value: f.speed },
        uColor: { value: new THREE.Color(color) },
      },
    });
    materials.push(m);
    return m;
  };

  for (const f of FLAMES) {
    const geo = flameGeometry(f.lean);
    const g = new THREE.Group();
    g.position.set(f.x, baseY, f.z);
    const outline = new THREE.Mesh(geo, makeMat(INK, f, 0));
    outline.scale.set(f.w * 1.1 + 0.2, f.h * 1.2 + 0.16, 1);
    outline.position.y = -0.07;
    g.add(outline);
    for (const L of LAYERS) {
      const m = new THREE.Mesh(geo, makeMat(L.color, f, L.ph));
      m.scale.set(f.w * 1.1 * L.sx, f.h * 1.2 * L.sy, 1);
      m.position.z = L.dz;
      g.add(m);
    }
    flames.add(g);
  }
  root.add(flames);

  // Étincelles montantes
  const N = 46;
  const positions = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const lifeAttr = new Float32Array(N);
  const state = Array.from({ length: N }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, age: 0, life: 1, size: 1, ph: 0 }));
  const respawn = (p: (typeof state)[number], initial: boolean) => {
    p.x = (Math.random() - 0.5) * 2.4;
    p.y = baseY + 0.3 + Math.random() * 0.4;
    p.z = (Math.random() - 0.3) * 0.8;
    p.vx = (Math.random() - 0.5) * 0.25;
    p.vy = 0.8 + Math.random() * 1.1;
    p.life = 1.6 + Math.random() * 2.2;
    p.age = initial ? Math.random() * p.life : 0;
    p.size = 5 + Math.random() * 7;
    p.ph = Math.random() * 6.28;
  };
  state.forEach((p) => respawn(p, true));
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  sparkGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  sparkGeo.setAttribute("aLife", new THREE.BufferAttribute(lifeAttr, 1));
  const sparkMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uPx: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSize; attribute float aLife; uniform float uPx; varying float vLife;
      void main() {
        vLife = aLife;
        gl_PointSize = aSize * uPx * (1.0 - aLife * 0.55);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying float vLife;
      void main() {
        vec2 q = abs(gl_PointCoord - 0.5);
        float d = q.x + q.y;
        if (d > 0.5) discard;
        vec3 col = mix(vec3(1.0, 0.86, 0.38), vec3(0.95, 0.28, 0.1), smoothstep(0.0, 0.9, vLife));
        gl_FragColor = vec4(col, 1.0 - vLife * vLife);
        #include <colorspace_fragment>
      }`,
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  sparks.renderOrder = 5;
  root.add(sparks);

  // Lumière du feu
  const light = new THREE.PointLight("#ff7a2c", 16, 10, 1.7);
  light.position.set(0, GROUND_Y + 1.2, 1.3);
  root.add(light);

  function update(time: number, dt: number) {
    for (const m of materials) m.uniforms.uTime.value = time;
    const flick = 1 + 0.16 * Math.sin(time * 9.1) + 0.1 * Math.sin(time * 14.7 + 1.3) + 0.06 * Math.sin(time * 23.0);
    light.intensity = 16 * flick;
    light.position.x = Math.sin(time * 3.1) * 0.35;
    backGlowMat.opacity = 0.8 + 0.2 * Math.sin(time * 5.3);

    for (let i = 0; i < N; i++) {
      const p = state[i];
      p.age += dt;
      if (p.age >= p.life) respawn(p, false);
      const k = p.age / p.life;
      p.x += (p.vx + Math.sin(time * 2.2 + p.ph) * 0.25) * dt;
      p.y += p.vy * (1 - k * 0.35) * dt;
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      sizes[i] = p.size;
      lifeAttr[i] = k;
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.aSize.needsUpdate = true;
    sparkGeo.attributes.aLife.needsUpdate = true;
  }

  return { root, light, update, sparkMat };
}



