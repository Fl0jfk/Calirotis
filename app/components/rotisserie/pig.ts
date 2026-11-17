import * as THREE from "three";
import { INK, inked, skinTexture, toon } from "./toon";

/**
 * Repère local de la broche : X = axe de la broche (le museau est à +X),
 * Y = « haut du cochon » au repos, Z = vers la caméra.
 * Un « pivot » tourné de φ autour de X place ses enfants à l'angle φ depuis le haut.
 */
const PROFILE: [number, number][] = [
  [-2.0, 0.0],
  [-1.94, 0.4],
  [-1.7, 0.78],
  [-1.25, 1.08],
  [-0.6, 1.2],
  [0.1, 1.2],
  [0.65, 1.08],
  [1.0, 0.9],
  [1.25, 0.88],
  [1.55, 0.94],
  [1.85, 0.86],
  [2.1, 0.66],
  [2.28, 0.5],
  [2.36, 0.42],
];

const curve = new THREE.SplineCurve(PROFILE.map(([a, r]) => new THREE.Vector2(a, r)));
const samples = curve.getPoints(160);

export function radiusAt(a: number) {
  if (a <= samples[0].x) return 0;
  for (let i = 1; i < samples.length; i++) {
    if (samples[i].x >= a) {
      const p = samples[i - 1];
      const q = samples[i];
      const t = (a - p.x) / (q.x - p.x || 1);
      return Math.max(0, p.y + (q.y - p.y) * t);
    }
  }
  return samples[samples.length - 1].y;
}

function slopeAt(a: number) {
  return (radiusAt(a + 0.02) - radiusAt(a - 0.02)) / 0.04;
}

function pivot(phi: number) {
  const g = new THREE.Group();
  g.rotation.x = phi;
  return g;
}

function limb(p0: THREE.Vector3, p1: THREE.Vector3, r0: number, r1: number, mat: THREE.Material, width = 3.5) {
  const dir = new THREE.Vector3().subVectors(p1, p0);
  const len = dir.length();
  const group = new THREE.Group();
  const geo = new THREE.CylinderGeometry(r1, r0, len, 20, 1);
  const body = inked(geo, mat, { width });
  body.position.copy(p0).addScaledVector(dir, 0.5);
  body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  group.add(body);
  const joint = inked(new THREE.SphereGeometry(r1, 20, 14), mat, { width });
  joint.position.copy(p1);
  group.add(joint);
  return group;
}

function earShape(scale = 1) {
  const s = new THREE.Shape();
  s.moveTo(-0.34 * scale, 0);
  s.bezierCurveTo(-0.4 * scale, 0.28 * scale, -0.2 * scale, 0.62 * scale, 0.14 * scale, 0.84 * scale);
  s.bezierCurveTo(0.34 * scale, 0.7 * scale, 0.46 * scale, 0.3 * scale, 0.34 * scale, 0);
  s.bezierCurveTo(0.2 * scale, -0.08 * scale, -0.2 * scale, -0.08 * scale, -0.34 * scale, 0);
  return s;
}

export function createPig() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(1.15);
  root.add(body);

  const skin = toon("#ffffff", { map: skinTexture(), spec: 0.5, shininess: 80 });
  const golden = toon("#c98428", { spec: 0.5, shininess: 36 });
  const innerEar = toon("#b9582c", { spec: 0.2 });
  const snoutMat = toon("#f2a58a", { spec: 0.6, shininess: 30 });
  const hoofMat = toon("#7c4119", { spec: 0.5, shininess: 24 });
  const steel = toon("#c4cbd3", { spec: 0.9, shininess: 55 });
  const nutMat = toon("#9aa3ad", { spec: 0.8, shininess: 45 });
  const wood = toon("#8b552b", { spec: 0.3 });
  const rope = toon("#d8bf88", { spec: 0.05 });
  const inkBasic = new THREE.MeshBasicMaterial({ color: INK });

  // --- Corps + tête : révolution autour de l'axe de la broche -------------------------
  const lathe = new THREE.LatheGeometry(
    samples.map((p) => new THREE.Vector2(Math.max(p.y, 0.0001), p.x)),
    72,
  );
  lathe.rotateZ(-Math.PI / 2);
  body.add(inked(lathe, skin, { width: 5 }));

  // --- Groin ---------------------------------------------------------------------------
  const snoutProfile = [
    [0.0001, -0.18],
    [0.36, -0.18],
    [0.41, -0.13],
    [0.43, 0.0],
    [0.39, 0.12],
    [0.3, 0.165],
    [0.0001, 0.17],
  ].map(([r, a]) => new THREE.Vector2(r, a));
  const snoutGeo = new THREE.LatheGeometry(snoutProfile, 40);
  snoutGeo.rotateZ(-Math.PI / 2);
  const snout = inked(snoutGeo, snoutMat, { width: 4.5 });
  snout.position.x = 2.45;
  snout.scale.set(1, 1.18, 1.18);
  body.add(snout);
  for (const z of [-0.18, 0.18]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), inkBasic);
    n.scale.set(0.03, 0.1, 0.055);
    n.position.set(2.63, 0.08, z);
    n.rotation.x = z > 0 ? -0.25 : 0.25;
    body.add(n);
  }

  // --- Lunettes de soleil (clin d'œil aux mascottes du site) -----------------------------
  const eyeA = 1.8;
  const eyeR = radiusAt(eyeA);
  const bandPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 28; i++) {
    const phi = -1.5 + (3 / 28) * i;
    const k = Math.max(0, (Math.abs(phi) - 0.85) / 0.65);
    const a = eyeA - 0.38 * k * k;
    const r = radiusAt(a) + 0.04;
    bandPts.push(new THREE.Vector3(a, r * Math.cos(phi), r * Math.sin(phi)));
  }
  const band = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bandPts), 60, 0.045, 8),
    inkBasic,
  );
  body.add(band);

  for (const side of [-1, 1]) {
    const p = pivot(side * 0.62);
    const lens = inked(new THREE.SphereGeometry(1, 28, 18), toon("#141c26", { spec: 1, shininess: 16 }), {
      width: 3,
      cast: false,
    });
    lens.scale.set(0.3, 0.1, 0.27);
    lens.position.set(eyeA, eyeR + 0.045, 0);
    lens.rotation.z = Math.atan(slopeAt(eyeA));
    p.add(lens);
    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 8),
      new THREE.MeshBasicMaterial({ color: "#ffffff" }),
    );
    glint.scale.set(0.1, 0.012, 0.035);
    glint.position.set(eyeA + 0.05, eyeR + 0.145, -side * 0.0);
    glint.rotation.z = lens.rotation.z;
    glint.rotation.y = 0.7;
    glint.position.z = 0.1 * side * -1;
    p.add(glint);
    body.add(p);
  }

  // --- Oreilles --------------------------------------------------------------------------
  for (const side of [-1, 1]) {
    const p = pivot(side * 1.0);
    const tilt = new THREE.Group();
    tilt.position.set(1.4, radiusAt(1.4) * 0.86, 0);
    tilt.rotation.x = side * 0.5;
    tilt.rotation.z = -0.42;
    const opts = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5, curveSegments: 18 };
    const outer = inked(new THREE.ExtrudeGeometry(earShape(1.3), opts), golden, { width: 4.5, smoothNormals: true });
    outer.position.z = -0.05;
    tilt.add(outer);
    const inner = inked(new THREE.ExtrudeGeometry(earShape(0.8), { ...opts, depth: 0.02, bevelThickness: 0.03, bevelSize: 0.03 }), innerEar, {
      width: 0,
      smoothNormals: true,
      cast: false,
    });
    inner.position.set(0.02, 0.07, 0.115);
    tilt.add(inner);
    const inner2 = inner.clone();
    inner2.position.z = -0.115;
    tilt.add(inner2);
    p.add(tilt);
    body.add(p);
  }

  // --- Pattes : avant repliées vers la tête, arrière tendues vers l'arrière -------------------
  for (const side of [-1, 1]) {
    const p = pivot(Math.PI + side * 0.78);
    const front = limb(new THREE.Vector3(0.7, 0.85, 0), new THREE.Vector3(1.15, 1.34, 0), 0.27, 0.21, golden);
    p.add(front);
    const fShin = limb(new THREE.Vector3(1.15, 1.34, 0), new THREE.Vector3(1.78, 1.14, 0), 0.21, 0.16, golden);
    p.add(fShin);
    const fHoof = inked(new THREE.SphereGeometry(0.17, 16, 12), hoofMat, { width: 3 });
    fHoof.scale.set(1.15, 0.85, 1.25);
    fHoof.position.set(1.86, 1.11, 0);
    fHoof.rotation.z = -0.3;
    p.add(fHoof);

    const hind = limb(new THREE.Vector3(-1.1, 0.88, 0), new THREE.Vector3(-1.6, 1.38, 0), 0.36, 0.25, golden);
    p.add(hind);
    const hShin = limb(new THREE.Vector3(-1.6, 1.38, 0), new THREE.Vector3(-2.22, 1.1, 0), 0.25, 0.17, golden);
    p.add(hShin);
    const hHoof = inked(new THREE.SphereGeometry(0.18, 16, 12), hoofMat, { width: 3 });
    hHoof.scale.set(1.2, 0.85, 1.25);
    hHoof.position.set(-2.32, 1.06, 0);
    hHoof.rotation.z = 0.35;
    p.add(hHoof);
    body.add(p);
  }

  // --- Queue en tire-bouchon ---------------------------------------------------------------
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.84, 0.4, 0),
    new THREE.Vector3(-2.04, 0.54, 0),
    new THREE.Vector3(-2.22, 0.7, 0.03),
    new THREE.Vector3(-2.36, 0.66, 0.05),
    new THREE.Vector3(-2.4, 0.5, 0.03),
    new THREE.Vector3(-2.3, 0.4, 0.0),
    new THREE.Vector3(-2.18, 0.46, -0.02),
    new THREE.Vector3(-2.2, 0.58, 0),
    new THREE.Vector3(-2.3, 0.6, 0.0),
  ]);
  body.add(inked(new THREE.TubeGeometry(tailCurve, 50, 0.065, 10), golden, { width: 3.5 }));

  // --- Ficelle de boucher -------------------------------------------------------------------
  for (const a of [0.1, -0.95]) {
    const ring = inked(new THREE.TorusGeometry(radiusAt(a) + 0.005, 0.032, 10, 72).rotateY(Math.PI / 2), rope, {
      width: 2.5,
    });
    ring.position.x = a;
    body.add(ring);
  }

  // --- Broche, disque d'arrêt, manivelle ---------------------------------------------------------
  const spit = inked(new THREE.CylinderGeometry(0.08, 0.08, 8.1, 20).rotateZ(-Math.PI / 2), steel, {
    width: 3.5,
    cast: false,
  });
  spit.position.x = 0.05;
  root.add(spit);
  const tip = inked(new THREE.ConeGeometry(0.08, 0.4, 16).rotateZ(-Math.PI / 2), steel, { width: 3.5, cast: false });
  tip.position.x = 4.3;
  root.add(tip);

  const disc = inked(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 40).rotateZ(-Math.PI / 2), steel, { width: 4 });
  disc.position.x = -2.55;
  root.add(disc);
  const nut = inked(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 6).rotateZ(-Math.PI / 2), nutMat, { width: 3 });
  nut.position.x = -2.7;
  root.add(nut);

  const armA = limb(new THREE.Vector3(-3.95, 0, 0), new THREE.Vector3(-3.95, 0.8, 0), 0.075, 0.075, steel, 3.5);
  root.add(armA);
  const grip = inked(new THREE.CylinderGeometry(0.11, 0.11, 0.55, 16).rotateZ(-Math.PI / 2), wood, { width: 3.5 });
  grip.position.set(-4.22, 0.8, 0);
  root.add(grip);
  const knob = inked(new THREE.SphereGeometry(0.15, 14, 10), wood, { width: 3.5 });
  knob.position.set(-4.52, 0.8, 0);
  root.add(knob);

  return root;
}





