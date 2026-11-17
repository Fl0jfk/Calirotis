import * as THREE from "three";
import { barkTexture, glowTexture, inked, logEndTexture, toon } from "./toon";

export const GROUND_Y = -3.3;
const SUPPORT_X = 3.45;

export function createStage() {
  const root = new THREE.Group();

  // --- sol : terre battue + liseré d'herbe ------------------------------------------------------
  const earth = toon("#5a3f2e", { spec: 0.1 });
  const ground = inked(new THREE.CylinderGeometry(4.6, 4.8, 0.4, 72), earth, { width: 5, cast: false });
  ground.scale.z = 0.46;
  ground.position.y = GROUND_Y - 0.2;
  root.add(ground);

  const grassMat = toon("#3f7a35", { spec: 0.1 });
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.06, 72), grassMat);
  grass.scale.z = 0.46;
  grass.position.y = GROUND_Y + 0.01;
  grass.receiveShadow = true;
  root.add(grass);

  const ash = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.08, 48), toon("#2a1d16", { spec: 0 }));
  ash.scale.z = 0.5;
  ash.position.y = GROUND_Y + 0.04;
  ash.receiveShadow = true;
  root.add(ash);

  // --- pierres du foyer ------------------------------------------------------------------------------
  const stoneColors = ["#6f757c", "#5d636b", "#7d8288", "#686e75"];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const size = 0.34 + (i % 3) * 0.05;
    const stone = inked(new THREE.DodecahedronGeometry(size, 0), toon(stoneColors[i % 4], { spec: 0.25 }), { width: 4 });
    stone.position.set(Math.cos(t) * 2.25, GROUND_Y + size * 0.55, Math.sin(t) * 1.15);
    stone.scale.set(1.15, 0.8, 1);
    stone.rotation.set(i * 0.7, i * 1.3, i * 0.4);
    root.add(stone);
  }

  // --- bûches --------------------------------------------------------------------------------------------
  const bark = toon("#ffffff", { map: barkTexture(), spec: 0.12 });
  const end = toon("#ffffff", { map: logEndTexture(), spec: 0.1 });
  const logs: { x: number; y: number; z: number; ry: number; rz: number; len: number; r: number }[] = [
    { x: -0.15, y: GROUND_Y + 0.28, z: 0.45, ry: 0.28, rz: 0, len: 2.5, r: 0.24 },
    { x: 0.2, y: GROUND_Y + 0.28, z: -0.38, ry: -0.32, rz: 0, len: 2.6, r: 0.25 },
    { x: 0.05, y: GROUND_Y + 0.7, z: 0.02, ry: 0.05, rz: 0.04, len: 2.2, r: 0.22 },
    { x: 0.55, y: GROUND_Y + 0.26, z: 0.85, ry: 1.25, rz: 0, len: 1.5, r: 0.2 },
  ];
  for (const l of logs) {
    const g = new THREE.CylinderGeometry(l.r, l.r, l.len, 24, 1);
    const log = inked(g, [bark, end, end], { width: 4, smoothNormals: false });
    const inner = log.children[0] as THREE.Mesh;
    inner.rotation.z = Math.PI / 2 + l.rz;
    (log.children[1] as THREE.Mesh).rotation.z = Math.PI / 2 + l.rz;
    log.position.set(l.x, l.y, l.z);
    log.rotation.y = l.ry;
    root.add(log);
  }

  // --- braises -------------------------------------------------------------------------------------------
  const embers: { mat: THREE.MeshBasicMaterial; phase: number }[] = [];
  const emberGeo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 20; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: "#ff5a22" });
    const m = new THREE.Mesh(emberGeo, mat);
    const s = 0.1 + ((i * 37) % 10) / 70;
    m.scale.set(s * 1.3, s * 0.7, s);
    const a = (i / 20) * Math.PI * 2 + i;
    m.position.set(Math.cos(a) * (0.2 + ((i * 53) % 10) / 6), GROUND_Y + 0.12, Math.sin(a) * (0.1 + ((i * 29) % 10) / 14));
    m.rotation.set(i, i * 2, 0);
    root.add(m);
    embers.push({ mat, phase: i * 1.7 });
  }

  // --- halo chaud sur le sol -----------------------------------------------------------------------------
  const poolMat = new THREE.MeshBasicMaterial({
    map: glowTexture("rgba(255,150,60,0.75)", "rgba(255,110,40,0)"),
    transparent: true,
    depthWrite: false,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 4.6), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = GROUND_Y + 0.09;
  pool.renderOrder = 1;
  root.add(pool);

  // --- supports métalliques en A ---------------------------------------------------------------------------
  const steel = toon("#7b8a98", { spec: 0.7, shininess: 45 });
  const dark = toon("#4a5560", { spec: 0.5 });
  for (const side of [-1, 1]) {
    const cx = side * SUPPORT_X;
    const top = new THREE.Vector3(cx, -0.14, 0);
    for (const s of [-1, 1]) {
      const foot = new THREE.Vector3(cx + s * 0.62, GROUND_Y + 0.1, s * 0.22);
      const dir = new THREE.Vector3().subVectors(foot, top);
      const len = dir.length();
      const leg = inked(new THREE.CylinderGeometry(0.1, 0.13, len, 14), steel, { width: 4 });
      leg.position.copy(top).addScaledVector(dir, 0.5);
      leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      root.add(leg);
      const plate = inked(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 20), dark, { width: 4 });
      plate.position.set(foot.x, GROUND_Y + 0.08, foot.z);
      root.add(plate);
    }
    const ring = inked(new THREE.TorusGeometry(0.2, 0.065, 12, 36).rotateY(Math.PI / 2), steel, { width: 4 });
    ring.position.set(cx, 0, 0);
    root.add(ring);
    const hub = inked(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 16).rotateZ(-Math.PI / 2), dark, { width: 3.5 });
    hub.position.set(cx, -0.2, 0);
    root.add(hub);
    const brace = inked(new THREE.CylinderGeometry(0.055, 0.055, 0.78, 12).rotateZ(Math.PI / 2), steel, { width: 3.5 });
    brace.position.set(cx, -1.75, 0);
    root.add(brace);
  }

  return { root, embers, poolMat };
}

