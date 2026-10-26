import * as THREE from 'three';
import { AVATARS, PETS } from '../data/config';
import { worldAura } from '../data/rarity';
import type { Appearance } from '../embed/protocol';

export function createPortrait(host: HTMLElement, initial: Appearance, onReady: () => void, onError: (message: string) => void) {
  let appearance = initial;
  let disposed = false;
  let active = true;
  let frame = 0;
  let previous = 0;
  let revision = 0;
  let ready = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eaf3f7');
  const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.1, 40);
  camera.position.set(0.2, 4, 12);
  camera.lookAt(0.2, 2.35, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  canvas.setAttribute('aria-label', 'Avatar and companion');
  canvas.dataset.scene = 'portrait';
  canvas.dataset.ready = 'false';
  host.append(canvas);
  const textures = new Map<string, THREE.Texture<HTMLImageElement>>();
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.PlaneGeometry(200, 200);
  const floorMaterial = new THREE.MeshBasicMaterial({ color: '#e2edf2' });
  const floor = new THREE.Mesh(geometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  scene.add(floor);
  const actorMaterial = new THREE.SpriteMaterial({ transparent: true, depthWrite: false, alphaTest: 0.02, toneMapped: false });
  const petMaterial = actorMaterial.clone();
  const wingMaterial = actorMaterial.clone();
  const avatar = new THREE.Sprite(actorMaterial);
  const pet = new THREE.Sprite(petMaterial);
  const wings = new THREE.Sprite(wingMaterial);
  avatar.center.set(0.5, 0);
  pet.center.set(0.5, 0);
  avatar.position.set(-0.5, 0.08, 0);
  pet.position.set(1.35, 0.08, 0.1);
  wings.position.set(-0.5, 2.55, -0.01);
  wings.center.set(0.5, 0.55);
  wings.scale.set(5.1, 5.1, 1);
  wings.renderOrder = 1;
  avatar.renderOrder = pet.renderOrder = 2;
  scene.add(avatar, pet, wings);
  const ringGeometry = new THREE.RingGeometry(0.7, 0.73, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#80d9ff', transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-0.5, 0.01, 0);
  scene.add(ring);
  const petRingMaterial = ringMaterial.clone();
  const petRing = new THREE.Mesh(ringGeometry, petRingMaterial);
  petRing.scale.setScalar(0.6);
  petRing.rotation.x = -Math.PI / 2;
  petRing.position.set(1.35, 0.015, 0.1);
  scene.add(petRing);

  async function load(path: string): Promise<THREE.Texture<HTMLImageElement>> {
    const existing = textures.get(path);
    if (existing) return existing;
    const map = await loader.loadAsync(new URL(path, document.baseURI).href);
    if (disposed) { map.dispose(); return map; }
    map.colorSpace = THREE.SRGBColorSpace;
    textures.set(path, map);
    return map;
  }
  async function dress(next: Appearance) {
    appearance = next;
    const current = ++revision;
    try {
      const [body, companion, feathers] = await Promise.all([
        load(`assets/world/actors/avatars-${next.avatarId}.webp`),
        next.petId ? load(`assets/world/actors/pets-${next.petId}.webp`) : null,
        next.wingId ? load(`assets/wings/${next.wingId}.png`) : null,
      ]);
      if (disposed || revision !== current) return;
      actorMaterial.map = body;
      actorMaterial.needsUpdate = true;
      avatar.scale.set(4.4 * body.image.width / body.image.height, 4.4, 1);
      pet.visible = !!companion;
      if (companion) {
        petMaterial.map = companion;
        petMaterial.needsUpdate = true;
        pet.scale.set(1.65 * companion.image.width / companion.image.height, 1.65, 1);
      }
      wings.visible = !!feathers;
      wingMaterial.map = feathers;
      wingMaterial.needsUpdate = true;
      const aura = worldAura(AVATARS.find((item) => item.id === next.avatarId)?.rarity ?? 'Common', next.level, next.vip);
      ring.visible = aura.strength > 0;
      ringMaterial.color.set(aura.color);
      const petAura = worldAura(PETS.find((item) => item.id === next.petId)?.rarity ?? 'Common');
      petRing.visible = !!companion && petAura.strength > 0;
      petRingMaterial.color.set(petAura.color);
      canvas.dataset.avatar = next.avatarId;
      canvas.dataset.pet = next.petId ?? '';
      canvas.dataset.wing = next.wingId ?? '';
      canvas.dataset.ready = 'true';
      ready = true;
      onReady();
    } catch { if (!disposed && revision === current) onError('Character artwork could not be loaded'); }
  }
  function resize() {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    const aspect = width / height;
    const span = Math.max(5.8, 6.3 / aspect);
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  void dress(initial);
  function draw(time: number) {
    if (disposed) return;
    frame = requestAnimationFrame(draw);
    if (!active || document.hidden || time - previous < 32) return;
    previous = time;
    const breath = reduced.matches ? 0 : Math.sin(time * 0.0016) * 0.018;
    avatar.position.y = 0.08 + breath;
    pet.position.y = 0.08 - breath * 0.7;
    wings.position.y = 2.55 + breath;
    renderer.render(scene, camera);
    canvas.dataset.frames = String(Number(canvas.dataset.frames ?? 0) + 1);
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
  }
  frame = requestAnimationFrame(draw);
  return {
    updateAppearance(next: Appearance) {
      if (appearance.avatarId !== next.avatarId || appearance.petId !== next.petId || appearance.wingId !== next.wingId || appearance.level !== next.level || appearance.vip !== next.vip) void dress(next);
    },
    setActive(value: boolean) { active = value; canvas.dataset.active = String(value); },
    get ready() { return ready; },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const map of textures.values()) map.dispose();
      for (const material of [actorMaterial, petMaterial, wingMaterial, floorMaterial, ringMaterial, petRingMaterial]) material.dispose();
      geometry.dispose(); ringGeometry.dispose();
      renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); scene.clear();
    },
  };
}