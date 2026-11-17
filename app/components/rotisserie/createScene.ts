import * as THREE from "three";
import { createPig } from "./pig";
import { createStage } from "./stage";
import { createFire } from "./fire";
import { shared } from "./toon";

type Options = {
  reducedMotion?: boolean;
  onReady?: () => void;
};

const AZIMUTH = 0.5;
const FOV = 24;
const TARGET = new THREE.Vector3(0, -1.0, 0);
const REV_SECONDS = 22;
const START_ANGLE = 0.55;

export function createRotisserieScene(host: HTMLElement, { reducedMotion = false, onReady }: Options = {}) {
  const small = window.matchMedia("(max-width: 640px)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1.75, 1, 80);

  // --- Lumières : clé chaude de face, rim doré à l'arrière, ciel/sol colorés, feu dessous ---------
  const hemi = new THREE.HemisphereLight("#fff0dc", "#7a5a50", 1.0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight("#fff0d4", 1.9);
  key.position.set(-4.5, 7.5, 6);
  key.castShadow = true;
  const shadowSize = small ? 1024 : 2048;
  key.shadow.mapSize.set(shadowSize, shadowSize);
  const sc = key.shadow.camera;
  sc.left = -7.5;
  sc.right = 7.5;
  sc.top = 6;
  sc.bottom = -6;
  sc.near = 1;
  sc.far = 24;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.04;
  key.shadow.radius = 3;
  scene.add(key);

  const rim = new THREE.DirectionalLight("#ffe0b0", 1.1);
  rim.position.set(4, 9, -5);
  rim.castShadow = true;
  rim.shadow.mapSize.set(1024, 1024);
  Object.assign(rim.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 1, far: 26 });
  rim.shadow.bias = -0.0006;
  rim.shadow.normalBias = 0.04;
  rim.shadow.radius = 3;
  scene.add(rim);

  // --- Contenu -------------------------------------------------------------------------------------------
  const stage = createStage();
  scene.add(stage.root);

  const pig = createPig();
  pig.rotation.x = START_ANGLE;
  scene.add(pig);

  const fire = createFire(AZIMUTH);
  scene.add(fire.root);

  // --- Cadrage adaptatif (caméra fixe) ---------------------------------------------------------------------
  const CONTENT_W = 10.6;
  const CONTENT_H = 7.0;
  function fit() {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const dist = Math.max(CONTENT_H / (2 * t), CONTENT_W / (2 * t * aspect));
    camera.position.set(
      TARGET.x + Math.sin(AZIMUTH) * dist,
      TARGET.y + dist * 0.16,
      TARGET.z + Math.cos(AZIMUTH) * dist,
    );
    camera.lookAt(TARGET);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const visibleH = 2 * dist * t;
    const px = h / visibleH;
    shared.uWorldPerPx.value = (1 / px) * Math.max(0.62, Math.min(1.15, h / 400));
    fire.sparkMat.uniforms.uPx.value = dpr * Math.max(0.6, Math.min(1.2, h / 400));

    const dir = key.position.clone().normalize().transformDirection(camera.matrixWorldInverse);
    shared.uSpecDir.value.copy(dir);
  }
  fit();

  // --- Boucle d'animation -----------------------------------------------------------------------------------
  let raf = 0;
  let running = false;
  let visible = true;
  let last = 0;
  let time = 2;
  let readyFired = false;

  function frame(now: number) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    time += dt;
    pig.rotation.x += ((Math.PI * 2) / REV_SECONDS) * dt;
    fire.update(time, dt);
    stage.embers.forEach((e, i) => {
      const k = 0.5 + 0.5 * Math.sin(time * 2.4 + e.phase) * Math.sin(time * 1.3 + i);
      e.mat.color.setRGB(1, 0.2 + 0.5 * k, 0.04 + 0.12 * k);
    });
    stage.poolMat.opacity = 0.85 + 0.15 * Math.sin(time * 4.7);
    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      onReady?.();
    }
    raf = requestAnimationFrame(frame);
  }

  function renderStill() {
    fire.update(time, 0.016);
    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      onReady?.();
    }
  }

  function start() {
    if (running || reducedMotion) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function sync() {
    if (visible && !document.hidden) start();
    else stop();
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    },
    { threshold: 0.01 },
  );
  io.observe(host);

  const ro = new ResizeObserver(() => {
    fit();
    if (!running) renderer.render(scene, camera);
  });
  ro.observe(host);

  const onVis = () => sync();
  document.addEventListener("visibilitychange", onVis);

  if (reducedMotion) renderStill();
  else start();

  function dispose() {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (mat) {
        (Array.isArray(mat) ? mat : [mat]).forEach((x) => {
          const anyMat = x as THREE.Material & { map?: THREE.Texture | null };
          anyMat.map?.dispose();
          x.dispose();
        });
      }
    });
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }

  return dispose;
}








