import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { AVATARS, PETS, WINGS } from '../data/config';
import { worldAura } from '../data/rarity';
import { MOCK_CITIZENS, TOWN_BUILDINGS, TOWN_MENUS, findTownPath, moveInTown, townArrival, townDestination, type TownBuilding, type TownPoint } from './town';

export interface WorldAppearance {
  name: string;
  level: number;
  avatarId: string;
  petId: string | null;
  frameId: string | null;
  wingId: string | null;
  vip: boolean;
}
export interface WorldSnapshot {
  position: TownPoint;
  district: string;
  frames: number;
}
interface WorldOptions {
  appearance: WorldAppearance;
  theme: 'water' | 'lantern';
  onReady: () => void;
  onFrame: (snapshot: WorldSnapshot) => void;
  onSelect: (kind: 'peer' | 'place', id: string) => void;
  onError: (message: string) => void;
}
export interface VeaseController {
  stopWalking: () => void;
  guideTo: (route: string) => void;
  setActive: (active: boolean) => void;
  updateAppearance: (appearance: WorldAppearance) => void;
  updateTheme: (theme: 'water' | 'lantern') => void;
  zoom: (amount: number) => void;
  rotate: () => void;
  recenter: () => void;
  travel: (id: string, cinematic?: boolean) => boolean;
  dispose: () => void;
}
interface TownActor {
  id: string;
  name: string;
  point: TownPoint;
  sprite: THREE.Sprite;
  nameplate: THREE.Sprite | null;
  aura: THREE.Sprite;
  auraStrength: number;
  shadow: THREE.Mesh;
  height: number;
  width: number;
  walking: boolean;
  direction: number;
  revision: number;
  targetIndex: number;
}

export function createVeaseWorld(host: HTMLElement, options: WorldOptions): VeaseController {
  let disposed = false;
  let active = true;
  let appearance = options.appearance;
  let theme = options.theme;
  let walkPath: TownPoint[] = [];
  let backdropTarget: TownBuilding | undefined;
    let guided = false;
    let travelSpeed = 5;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heading = Math.PI / 5;
  let zoom = 1;
  let frames = 0;
  let lastTime = performance.now();
  let lastReport = 0;
  let animation = 0;
  let ready = false;
  let elapsed = 0;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 180);
  const renderer = new THREE.WebGLRenderer({ antialias: host.clientWidth >= 600, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = host.clientWidth >= 600;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-label', 'เมือง 3D Masque Vease');
  canvas.setAttribute('role', 'img');
  canvas.dataset.ready = 'false';
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  host.append(canvas);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const materialCache = new Map<string, THREE.MeshStandardMaterial>();
  const textureCache = new Map<string, THREE.Texture>();
  const interactables: THREE.Object3D[] = [];
  const buildingBadges: THREE.Sprite[] = [];
  const loader = new THREE.TextureLoader();
  const assetRoot = new URL('assets/world/', document.baseURI).href;
  let loadedAssets = 0;
  let requestedAssets = 0;

  function texture(file: string, onLoad?: (map: THREE.Texture) => void): THREE.Texture {
    const cached = textureCache.get(file);
    if (cached) {
      if ((cached.image as HTMLImageElement | undefined)?.width) onLoad?.(cached);
      else if (onLoad) cached.userData.callbacks.push(onLoad);
      return cached;
    }
    requestedAssets += 1;
    const map = loader.load(`${assetRoot}${file}`, (loaded) => {
      if (disposed) { loaded.dispose(); return; }
      loadedAssets += 1;
      onLoad?.(loaded);
      for (const callback of loaded.userData.callbacks) callback(loaded);
      loaded.userData.callbacks = [];
    }, undefined, () => { if (!disposed) options.onError(`โหลดภาพเมืองไม่สำเร็จ: ${file}`); });
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    map.userData.callbacks = [];
    textures.add(map);
    textureCache.set(file, map);
    return map;
  }
  function paint(color: string, roughness = 0.8): THREE.MeshStandardMaterial {
    const key = `${color}:${roughness}`;
    const cached = materialCache.get(key);
    if (cached) return cached;
    const material = new THREE.MeshStandardMaterial({ color, roughness });
    materials.add(material);
    materialCache.set(key, material);
    return material;
  }
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], x: number, y: number, z: number, parent: THREE.Object3D = scene): THREE.Mesh {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(width: number, height: number, depth: number, x: number, y: number, z: number, color: string, parent: THREE.Object3D = scene) {
    return mesh(new THREE.BoxGeometry(width, height, depth), paint(color), x, y, z, parent);
  }
  function cylinder(top: number, bottom: number, height: number, x: number, y: number, z: number, color: string, segments = 20) {
    return mesh(new THREE.CylinderGeometry(top, bottom, height, segments), paint(color), x, y, z);
  }
  function textMap(text: string, color = '#315a70', background = '#fffaf2'): THREE.CanvasTexture {
    const surface = document.createElement('canvas');
    surface.width = 1024;
    surface.height = 160;
    const context = surface.getContext('2d')!;
    context.fillStyle = background;
    context.fillRect(0, 0, 1024, 160);
    context.strokeStyle = color;
    context.lineWidth = 8;
    context.strokeRect(12, 12, 1000, 136);
    context.fillStyle = color;
    context.font = '700 64px "Kanit", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 512, 83, 930);
    const map = new THREE.CanvasTexture(surface);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.add(map);
    return map;
  }

  const skyLight = new THREE.HemisphereLight('#e8f8ff', '#bdacaa', 2.1);
  scene.add(skyLight);
  const sunlight = new THREE.DirectionalLight('#fff0da', 2.7);
  sunlight.position.set(-14, 30, 16);
  sunlight.castShadow = renderer.shadowMap.enabled;
  sunlight.shadow.mapSize.set(512, 512);
  Object.assign(sunlight.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 90 });
  sunlight.shadow.normalBias = 0.07;
  sunlight.shadow.bias = -0.0003;
  scene.add(sunlight);
  const plazaLight = new THREE.PointLight('#ffe3a3', 18, 19, 2);
  plazaLight.position.set(0, 4.5, -1.5);
  scene.add(plazaLight);
  const marketLight = new THREE.PointLight('#9ce9ff', 12, 14, 2);
  marketLight.position.set(-21, 4, 5);
  scene.add(marketLight);

  const pavingMap = texture('paving.webp');
  pavingMap.wrapS = pavingMap.wrapT = THREE.RepeatWrapping;
  pavingMap.repeat.set(18, 18);
  const pavingMaterial = new THREE.MeshStandardMaterial({ map: pavingMap, color: '#fcfbf8', roughness: 0.95 });
  materials.add(pavingMaterial);
  box(42, 1.6, 56, -11, -0.8, 0, '#b4cbd6');
  box(18, 1.6, 56, 23, -0.8, 0, '#b4cbd6');
  const westGround = mesh(new THREE.PlaneGeometry(42, 56), pavingMaterial, -11, 0.015, 0);
  westGround.rotation.x = -Math.PI / 2;
  const eastGround = mesh(new THREE.PlaneGeometry(18, 56), pavingMaterial, 23, 0.015, 0);
  eastGround.rotation.x = -Math.PI / 2;

  const waterMaterial = new THREE.MeshStandardMaterial({ color: '#57bdce', transparent: true, opacity: 0.88, roughness: 0.28, metalness: 0.15 });
  materials.add(waterMaterial);
  const sea = mesh(new THREE.PlaneGeometry(220, 220), paint('#a5d9e2', 0.5), 0, -1.65, 0);
  sea.rotation.x = -Math.PI / 2;
  const water = mesh(new THREE.PlaneGeometry(4, 58, 8, 72), waterMaterial, 12, -0.14, 0);
  water.rotation.x = -Math.PI / 2;
  water.castShadow = false;
  const waterPositions = water.geometry.getAttribute('position');
  const waterBase = Float32Array.from(waterPositions.array);
  for (const bank of [9.85, 14.15]) box(0.28, 0.5, 56, bank, -0.1, 0, '#f9fbfc');

  for (const bridgeZ of [4, -14]) {
    box(5.3, 0.32, 3.4, 12, 0.04, bridgeZ, '#e5eff2');
    for (const side of [-1, 1]) {
      box(5.3, 0.15, 0.14, 12, 1.03, bridgeZ + side * 1.65, '#f7fcfc');
      box(5.3, 0.1, 0.12, 12, 0.5, bridgeZ + side * 1.65, '#8ab6ca');
      for (let index = 0; index < 6; index += 1) box(0.12, 1, 0.12, 9.55 + index * 0.98, 0.52, bridgeZ + side * 1.65, '#f7fcfc');
    }
  }

  const plaza = mesh(new THREE.CylinderGeometry(7.7, 7.7, 0.06, 64), paint('#f4f1f1'), 0, 0.045, 0);
  plaza.receiveShadow = true;
  const plazaRing = mesh(new THREE.RingGeometry(7.15, 7.32, 64), paint('#8ebecf'), 0, 0.084, 0);
  plazaRing.rotation.x = -Math.PI / 2;
  for (const [roadX, roadZ, width, depth] of [[0, 6, 60, 1.7], [0, 0, 1.6, 48], [-12, 0, 1.4, 48]] as const) {
    const road = mesh(new THREE.PlaneGeometry(width, depth), paint('#d0dfe5'), roadX, 0.034, roadZ);
    road.rotation.x = -Math.PI / 2;
  }

  const colors = { coral: { wall: '#fff1e8', trim: '#dc7d75', roof: '#bc5e67' }, sky: { wall: '#edf8fa', trim: '#559db5', roof: '#4c829c' }, lemon: { wall: '#fff8e5', trim: '#d6ad5c', roof: '#ae8452' }, lilac: { wall: '#f6f0fc', trim: '#a18db9', roof: '#7e6b9d' } };
  const windowMaterial = new THREE.MeshStandardMaterial({ color: '#fff1c8', emissive: '#ffcb75', emissiveIntensity: 0.6, roughness: 0.3 });
  materials.add(windowMaterial);
  for (const building of TOWN_BUILDINGS) {
    const palette = colors[building.palette];
    const group = new THREE.Group();
    group.position.set(building.x, 0, building.z);
    group.userData = { kind: 'place', id: building.id };
    scene.add(group);
    const facade = new THREE.MeshStandardMaterial({ map: texture(`facade-${building.palette}.webp`), roughness: 0.85 });
    const roofMap = texture(`roof-${building.palette}.webp`);
    roofMap.wrapS = roofMap.wrapT = THREE.RepeatWrapping;
    roofMap.repeat.set(0.18, 0.22);
    const roofMaterial = new THREE.MeshStandardMaterial({ map: roofMap, roughness: 0.85 });
    materials.add(facade);
    materials.add(roofMaterial);
    box(building.width + 0.5, 0.28, building.depth + 0.5, 0, 0.14, 0, '#f8faf8', group);
    const walls = mesh(new THREE.BoxGeometry(building.width, building.height, building.depth), [paint(palette.wall), paint(palette.wall), paint(palette.wall), paint(palette.wall), facade, facade], 0, building.height / 2 + 0.28, 0, group);
    interactables.push(walls);
    const roofShape = new THREE.Shape();
    const roofWidth = building.width / 2 + 0.5;
    roofShape.moveTo(-roofWidth, 0);
    roofShape.lineTo(0, 1.9);
    roofShape.lineTo(roofWidth, 0);
    roofShape.closePath();
    const roof = mesh(new THREE.ExtrudeGeometry(roofShape, { depth: building.depth + 0.85, bevelEnabled: false }), [paint(palette.roof), roofMaterial], 0, building.height + 0.28, -building.depth / 2 - 0.42, group);
    interactables.push(roof);
    box(0.75, 1.6, 0.75, -building.width / 3, building.height + 1.3, -0.8, palette.wall, group);
    box(0.92, 0.16, 0.92, -building.width / 3, building.height + 2.08, -0.8, palette.trim, group);
    const signMaterial = new THREE.MeshStandardMaterial({ map: textMap(building.sign, palette.roof), roughness: 0.85 });
    materials.add(signMaterial);
    const sign = mesh(new THREE.PlaneGeometry(building.width * 0.8, 0.65), signMaterial, 0, 2.95, building.depth / 2 + 0.025, group);
    interactables.push(sign);
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 640;
    badgeCanvas.height = 168;
    const context = badgeCanvas.getContext('2d')!;
    context.fillStyle = '#fffffff2';
    context.beginPath();
    context.roundRect(4, 4, 632, 160, 22);
    context.fill();
    context.strokeStyle = palette.trim;
    context.lineWidth = 6;
    context.stroke();
    context.textAlign = 'center';
    context.fillStyle = '#25566d';
    context.font = '600 56px Kanit, sans-serif';
    context.fillText(`${TOWN_MENUS[building.id]} ↗`, 320, 76, 592);
    context.fillStyle = '#58798a';
    context.font = '400 36px Kanit, sans-serif';
    context.fillText(building.name, 320, 131, 592);
    const badgeMap = new THREE.CanvasTexture(badgeCanvas);
    badgeMap.colorSpace = THREE.SRGBColorSpace;
    textures.add(badgeMap);
    const badgeMaterial = new THREE.SpriteMaterial({ map: badgeMap, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
    materials.add(badgeMaterial);
    const badge = new THREE.Sprite(badgeMaterial);
    badge.scale.set(7.6, 2, 1);
    badge.position.set(building.x, building.height + 3.2, building.z);
    badge.userData = { kind: 'place', id: building.id };
    badge.renderOrder = 5;
    scene.add(badge);
    buildingBadges.push(badge);
    interactables.push(badge);
    for (const side of [-1, 1]) {
      mesh(new THREE.PlaneGeometry(0.82, 0.95), windowMaterial, side * building.width * 0.3, 1.8, building.depth / 2 + 0.04, group);
      box(0.94, 0.08, 0.12, side * building.width * 0.3, 2.3, building.depth / 2 + 0.06, palette.trim, group);
      box(0.07, 0.95, 0.08, side * building.width * 0.3, 1.8, building.depth / 2 + 0.09, palette.trim, group);
    }
    for (let stripe = 0; stripe < 10; stripe += 1) {
      const awning = box(building.width * 0.073, 0.13, 1.1, -building.width * 0.365 + stripe * building.width * 0.081, 2.32, building.depth / 2 + 0.45, stripe % 2 ? '#fffaf0' : palette.trim, group);
      awning.rotation.x = 0.14;
    }
    box(2, 0.18, 0.9, 0, 0.18, building.depth / 2 + 0.6, '#f6f7f5', group);
    box(2.5, 0.1, 0.7, 0, 0.07, building.depth / 2 + 1.2, '#dce7eb', group);
    for (const side of [-1, 1]) {
      box(1.2, 0.4, 0.55, side * building.width * 0.32, 1.15, building.depth / 2 + 0.26, palette.trim, group);
      for (let flower = 0; flower < 3; flower += 1) {
        const blossom = mesh(new THREE.IcosahedronGeometry(0.19, 0), paint(flower % 2 ? '#f0b458' : '#e59bac'), side * building.width * 0.32 - 0.35 + flower * 0.35, 1.46, building.depth / 2 + 0.26, group);
        blossom.castShadow = false;
      }
    }
  }

  cylinder(2.05, 2.2, 0.25, 0, 0.18, -1.5, '#c4d7df', 48);
  cylinder(1.85, 1.85, 0.14, 0, 0.35, -1.5, '#f4f9fa', 48);
  const fountainWater = cylinder(1.6, 1.6, 0.07, 0, 0.44, -1.5, '#70c8d6', 48);
  fountainWater.material = waterMaterial;
  cylinder(0.23, 0.42, 1.4, 0, 1.1, -1.5, '#e6eef1');
  cylinder(0.95, 0.36, 0.3, 0, 1.8, -1.5, '#f4f9fa');
  cylinder(0.18, 0.18, 0.7, 0, 2.25, -1.5, '#b6d5df');
  const droplets: THREE.Mesh[] = [];
  for (let index = 0; index < 8; index += 1) {
    const angle = index / 8 * Math.PI * 2;
    const points = Array.from({ length: 13 }, (_, step) => {
      const fraction = step / 12;
      return new THREE.Vector3(Math.sin(angle) * fraction * 1.5, 2.5 - fraction ** 2 * 2.1, -1.5 + Math.cos(angle) * fraction * 1.5);
    });
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 14, 0.025, 4, false), waterMaterial, 0, 0, 0);
    droplets.push(mesh(new THREE.SphereGeometry(0.075, 6, 4), waterMaterial, 0, 2.5, -1.5));
  }

  const treeSpots = [[-25, -9], [-25, 13], [-18, -6], [-18, 16], [-6, -19], [5, -19], [6, 15], [-5, 19], [17, -20], [27, -16], [27, 1], [18, 13], [-26, 23], [7, -8], [-19, 23]];
  for (const [index, [treeX, treeZ]] of treeSpots.entries()) {
    cylinder(0.15, 0.24, 1.9, treeX, 0.95, treeZ, '#a48171', 7);
    const canopy = mesh(new THREE.DodecahedronGeometry(1.2 + index % 3 * 0.14, 0), paint(index % 3 === 0 ? '#e9b4c4' : index % 3 === 1 ? '#9dc5bd' : '#b5ced2'), treeX, 2.6, treeZ);
    canopy.scale.y = 1.2;
    cylinder(0.85, 0.9, 0.23, treeX, 0.12, treeZ, '#dae1e3', 12);
  }
  for (const [benchX, benchZ, direction] of [[-5.9, 0, Math.PI / 2], [5.8, 0, -Math.PI / 2], [-5.9, 10, 0], [17, 8, Math.PI / 2]] as const) {
    const group = new THREE.Group(); group.position.set(benchX, 0, benchZ); group.rotation.y = direction; scene.add(group);
    for (const side of [-1, 1]) { box(0.15, 0.7, 0.8, side * 1.1, 0.35, 0, '#547383', group); box(0.15, 1.25, 0.12, side * 1.1, 0.65, -0.35, '#547383', group); }
    for (let slat = 0; slat < 3; slat += 1) { box(2.6, 0.12, 0.22, 0, 0.75, -0.27 + slat * 0.27, '#c7a58b', group); box(2.6, 0.2, 0.1, 0, 1.05 + slat * 0.22, -0.4, '#c7a58b', group); }
  }
  const lampMaterial = new THREE.MeshStandardMaterial({ color: '#fff0c0', emissive: '#ffc76b', emissiveIntensity: 0.35 });
  materials.add(lampMaterial);
  for (const [lampX, lampZ] of [[-7, 5], [7, 5], [-7, -6], [7, -6], [17, 4], [-17, 8], [17, -14], [-3, 12]]) {
    cylinder(0.07, 0.12, 3, lampX, 1.5, lampZ, '#4d7181', 8);
    box(0.55, 0.1, 0.55, lampX, 2.95, lampZ, '#4d7181');
    mesh(new THREE.BoxGeometry(0.34, 0.48, 0.34), lampMaterial, lampX, 3.23, lampZ);
    const cap = mesh(new THREE.ConeGeometry(0.4, 0.28, 4), paint('#4d7181'), lampX, 3.6, lampZ); cap.rotation.y = Math.PI / 4;
  }
  for (let index = 0; index < 13; index += 1) {
    const pennant = mesh(new THREE.ConeGeometry(0.23, 0.45, 3), paint(index % 3 === 0 ? '#df8fa0' : index % 3 === 1 ? '#e9bb62' : '#88bfd1'), -7 + index * 1.15, 5.1 - Math.sin(index / 12 * Math.PI) * 0.6, 5.5);
    pennant.rotation.z = Math.PI;
  }
  const sparkleGeometry = new THREE.BufferGeometry();
  const sparklePositions = new Float32Array(48 * 3);
  for (let index = 0; index < 48; index += 1) {
    sparklePositions[index * 3] = Math.sin(index * 2.4) * 24;
    sparklePositions[index * 3 + 1] = 1 + index % 7 * 0.6;
    sparklePositions[index * 3 + 2] = Math.cos(index * 1.9) * 23;
  }
  sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
  geometries.add(sparkleGeometry);
  const sparkleMaterial = new THREE.PointsMaterial({ color: '#fff0b0', size: 0.1, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
  materials.add(sparkleMaterial);
  scene.add(new THREE.Points(sparkleGeometry, sparkleMaterial));

  scene.updateMatrixWorld(true);
  const staticBatches = new Map<string, { material: THREE.Material; objects: THREE.Mesh[]; castShadow: boolean; receiveShadow: boolean }>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material) || object === water || object === fountainWater || droplets.includes(object) || interactables.includes(object)) return;
    const key = `${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
    const batch = staticBatches.get(key) ?? { material: object.material, objects: new Array<THREE.Mesh>(), castShadow: object.castShadow, receiveShadow: object.receiveShadow };
    batch.objects.push(object);
    staticBatches.set(key, batch);
  });
  for (const batch of staticBatches.values()) {
    if (batch.objects.length < 2) continue;
    const parts = batch.objects.map((object) => {
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      return geometry.applyMatrix4(object.matrixWorld);
    });
    const combined = mergeGeometries(parts, false);
    for (const part of parts) part.dispose();
    if (!combined) continue;
    const object = mesh(combined, batch.material, 0, 0, 0);
    object.castShadow = batch.castShadow;
    object.receiveShadow = batch.receiveShadow;
    for (const original of batch.objects) original.visible = false;
  }

  const actors: TownActor[] = [];
  const auraCanvas = document.createElement('canvas');
  auraCanvas.width = auraCanvas.height = 128;
  const auraContext = auraCanvas.getContext('2d')!;
  const gradient = auraContext.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, '#ffffffb0');
  gradient.addColorStop(0.35, '#ffffff80');
  gradient.addColorStop(0.65, '#ffffff30');
  gradient.addColorStop(1, '#ffffff00');
  auraContext.fillStyle = gradient;
  auraContext.fillRect(0, 0, 128, 128);
  const auraMap = new THREE.CanvasTexture(auraCanvas);
  textures.add(auraMap);
  function nameplateTexture(actor: TownActor): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 112;
    const context = canvas.getContext('2d')!;
    context.beginPath();
    context.roundRect(5, 5, 502, 102, 26);
    context.fillStyle = actor.id === 'self' ? '#25566deb' : '#ffffffeb';
    context.fill();
    context.strokeStyle = actor.id === 'self' ? '#ffffffc9' : '#7eabbf';
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = actor.id === 'self' ? '#fff' : '#254b61';
    const caption = actor.id === 'self' ? `${actor.name} · YOU` : `${actor.name} · MOCK`;
    context.font = '700 60px Kanit, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(caption, canvas.width / 2, canvas.height / 2, 460);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.add(map);
    return map;
  }
  function updateNameplate(actor: TownActor) {
    if (!actor.nameplate) return;
    const material = actor.nameplate.material as THREE.SpriteMaterial;
    const previous = material.map;
    material.map = nameplateTexture(actor);
    material.needsUpdate = true;
    if (previous) { textures.delete(previous); previous.dispose(); }
  }
  function dressActor(actor: TownActor, id: string, pet = false) {
    const revision = ++actor.revision;
    texture(`actors/${pet ? 'pets' : 'avatars'}-${id}.webp`, (source) => {
      if (disposed || actor.revision !== revision) return;
      const image = source.image as HTMLImageElement;
      const map = source.clone();
      map.center.set(0.5, 0.5);
      map.needsUpdate = true;
      textures.add(map);
      const previous = actor.sprite.material.map;
      actor.sprite.material.map = map;
      actor.sprite.material.needsUpdate = true;
      if (previous) { textures.delete(previous); previous.dispose(); }
      actor.width = actor.height * image.width / image.height;
      actor.sprite.scale.set(actor.width, actor.height, 1);
    });
  }
  function addActor(id: string, name: string, avatarId: string, point: TownPoint, height: number, pet = false): TownActor {
    const material = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.08, depthWrite: false, toneMapped: false });
    materials.add(material);
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 2;
    sprite.center.set(0.5, 0);
    sprite.position.set(point.x, 0.12, point.z);
    sprite.userData = { kind: 'peer', id };
    scene.add(sprite);
    if (id !== 'self' && id !== 'pet') interactables.push(sprite);
    const shadowMaterial = new THREE.MeshBasicMaterial({ color: '#426a7f', transparent: true, opacity: 0.18, depthWrite: false });
    materials.add(shadowMaterial);
    const shadow = mesh(new THREE.CircleGeometry(pet ? 0.32 : 0.48, 24), shadowMaterial, point.x, 0.055, point.z);
    shadow.rotation.x = -Math.PI / 2;
    shadow.castShadow = false;
    const rarity = (pet ? PETS : AVATARS).find((entry) => entry.id === avatarId)?.rarity ?? 'Common';
    const style = worldAura(rarity, id === 'self' ? appearance.level : MOCK_CITIZENS.find((citizen) => citizen.id === id)?.level ?? 0, id === 'self' && appearance.vip);
    const auraMaterial = new THREE.SpriteMaterial({ map: auraMap, color: style.color, transparent: true, opacity: style.strength, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    materials.add(auraMaterial);
    const aura = new THREE.Sprite(auraMaterial);
    aura.visible = style.strength > 0;
    aura.scale.setScalar(height * 1.7);
    scene.add(aura);
    const actor: TownActor = { id, name, point: { ...point }, sprite, nameplate: null, aura, auraStrength: style.strength, shadow, height, width: height * 0.6, walking: false, direction: 1, revision: 0, targetIndex: 1 };
    actor.nameplate = pet ? null : new THREE.Sprite(new THREE.SpriteMaterial({ map: nameplateTexture(actor), transparent: true, depthWrite: false, toneMapped: false }));
    if (actor.nameplate) {
      materials.add(actor.nameplate.material);
      actor.nameplate.center.set(0.5, 0);
      actor.nameplate.scale.set(4.2, 0.8, 1);
      actor.nameplate.position.set(point.x, height + 0.14, point.z);
      actor.nameplate.userData = { kind: 'peer', id };
      scene.add(actor.nameplate);
      if (id !== 'self') interactables.push(actor.nameplate);
    }
    actors.push(actor);
    dressActor(actor, avatarId, pet);
    return actor;
  }
  const player = addActor('self', appearance.name, appearance.avatarId, { x: 0, z: 6 }, 3.1);
  for (const citizen of MOCK_CITIZENS) addActor(citizen.id, citizen.name, citizen.avatarId, citizen.points[0], 2.8);
  let companion: TownActor | null = appearance.petId ? addActor('pet', '', appearance.petId, { x: -1.2, z: 6.8 }, 1.15, true) : null;
  const wingMaterial = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.02, depthWrite: false, toneMapped: false });
  materials.add(wingMaterial);
  const wings = new THREE.Sprite(wingMaterial);
  wings.renderOrder = 1;
  wings.center.set(0.5, 0.55);
  wings.visible = false;
  scene.add(wings);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#47aaca', transparent: true, opacity: 0.8, depthWrite: false });
  materials.add(ringMaterial);
  const playerRing = mesh(new THREE.RingGeometry(0.56, 0.63, 40), ringMaterial, 0, 0.065, 6);
  playerRing.rotation.x = -Math.PI / 2;
  playerRing.castShadow = false;
  function setAppearance(next: WorldAppearance) {
    if (next.avatarId !== appearance.avatarId) dressActor(player, next.avatarId);
    if (next.petId !== appearance.petId) {
      if (next.petId && companion) { companion.sprite.visible = true; companion.shadow.visible = true; dressActor(companion, next.petId, true); }
      else if (next.petId) companion = addActor('pet', '', next.petId, { x: player.point.x - 1, z: player.point.z + 0.7 }, 1.15, true);
      else if (companion) { companion.sprite.visible = false; companion.shadow.visible = false; }
    }
    player.name = next.name;
    if (next.name !== appearance.name) updateNameplate(player);
    const aura = worldAura(AVATARS.find((avatar) => avatar.id === next.avatarId)?.rarity ?? 'Common', next.level, next.vip);
    player.aura.material.color.set(aura.color);
    player.auraStrength = aura.strength;
    if (companion) {
      const petAura = worldAura(PETS.find((pet) => pet.id === next.petId)?.rarity ?? 'Common');
      companion.aura.material.color.set(petAura.color);
      companion.auraStrength = next.petId ? petAura.strength : 0;
    }
    const wing = WINGS.find((item) => item.id === next.wingId);
    wings.visible = !!wing;
    if (wing && wingMaterial.userData.id !== wing.id) {
      wingMaterial.map = texture(`../wings/${wing.id}.png`);
      wingMaterial.userData.id = wing.id;
      wingMaterial.needsUpdate = true;
    }
    ringMaterial.color.set(next.vip || next.frameId === 'sunrise' ? '#e7af4b' : next.frameId === 'ocean' ? '#4fb8de' : '#47aaca');
    appearance = next;
  }
  setAppearance(appearance);
  function setTheme(next: 'water' | 'lantern') {
    theme = next;
    scene.background = new THREE.Color(next === 'lantern' ? '#bcc9e2' : '#c5e5ee');
    scene.fog = new THREE.Fog(next === 'lantern' ? '#bcc9e2' : '#c5e5ee', 65, 125);
    skyLight.intensity = next === 'lantern' ? 1.65 : 2.1;
    sunlight.intensity = next === 'lantern' ? 1.8 : 2.7;
    lampMaterial.emissiveIntensity = next === 'lantern' ? 1.7 : 0.35;
    windowMaterial.emissiveIntensity = next === 'lantern' ? 1.4 : 0.6;
  }
  setTheme(theme);

  const cameraTarget = new THREE.Vector3(0, 0, 3);
  const lookTarget = new THREE.Vector3();
  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const aspect = width / height;
    const span = Math.max(25, 21 / aspect);
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.zoom = zoom;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.setSize(width, height, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const destinationGeometry = new THREE.RingGeometry(0.32, 0.46, 32);
  const destinationMaterial = new THREE.MeshBasicMaterial({ color: '#2685af', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
  geometries.add(destinationGeometry);
  materials.add(destinationMaterial);
  const destination = new THREE.Mesh(destinationGeometry, destinationMaterial);
  destination.rotation.x = -Math.PI / 2;
  destination.visible = false;
  scene.add(destination);
  function stopWalking() { walkPath = []; destination.visible = false; travelSpeed = 5; }
  function walkTo(target: TownPoint): boolean {
    const path = findTownPath(player.point, target);
    if (!path.length) return false;
    walkPath = path;
    destination.position.set(target.x, 0.12, target.z);
    destination.visible = true;
    canvas.dataset.destinationX = target.x.toFixed(3);
    canvas.dataset.destinationZ = target.z.toFixed(3);
    return true;
  }
  let pointerStart: { x: number; y: number; id: number } | null = null;
  function pointerDown(event: PointerEvent) {
    if (guided || !event.isPrimary || event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }
  function pointerCancel() { pointerStart = null; }
  function pointerUp(event: PointerEvent) {
    const start = pointerStart;
    pointerStart = null;
    if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactables, false)[0];
    if (hit) {
      const data = hit.object.userData.kind ? hit.object.userData : hit.object.parent?.userData;
      if (data?.kind && data.id) { options.onSelect(data.kind, data.id); return; }
    }
    const point = raycaster.ray.intersectPlane(groundPlane, new THREE.Vector3());
    if (point) walkTo({ x: point.x, z: point.z });
  }
  function contextLost(event: Event) { event.preventDefault(); options.onError('WebGL หยุดทำงานชั่วคราว กรุณาเปิดเมืองอีกครั้ง'); }
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerCancel);
  canvas.addEventListener('webglcontextlost', contextLost);

  function draw(time: number) {
    if (disposed) return;
    animation = requestAnimationFrame(draw);
    if (guided && time - lastTime < 32) return;
    const seconds = Math.min(0.05, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    if (document.hidden || !active) return;
    elapsed += seconds;
    frames += 1;
    const beforeWalk = player.point;
    let remaining = seconds * travelSpeed;
    while (walkPath.length && remaining > 0) {
      const waypoint = walkPath[0];
      const distance = Math.hypot(waypoint.x - player.point.x, waypoint.z - player.point.z);
      if (distance < 0.04) { walkPath.shift(); continue; }
      const step = Math.min(remaining, distance);
      const next = moveInTown(player.point, (waypoint.x - player.point.x) / distance, (waypoint.z - player.point.z) / distance, step / travelSpeed, travelSpeed);
      if (Math.hypot(next.x - player.point.x, next.z - player.point.z) < 0.0001) { stopWalking(); break; }
      player.direction = next.x < player.point.x ? -1 : 1;
      player.point = next;
      remaining -= step;
    }
    player.walking = Math.hypot(player.point.x - beforeWalk.x, player.point.z - beforeWalk.z) > 0.0001;
    destination.visible = walkPath.length > 0;
    destination.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.12);
    for (const actor of actors) {
      if (actor.id === 'self' || actor.id === 'pet') continue;
      const citizen = MOCK_CITIZENS.find((entry) => entry.id === actor.id)!;
      const destination = citizen.points[actor.targetIndex];
      const distance = Math.hypot(destination.x - actor.point.x, destination.z - actor.point.z);
      if (distance < 0.4) actor.targetIndex = (actor.targetIndex + 1) % citizen.points.length;
      const before = actor.point;
      actor.point = moveInTown(actor.point, (destination.x - actor.point.x) / Math.max(distance, 0.1), (destination.z - actor.point.z) / Math.max(distance, 0.1), seconds, 1.1 + actors.indexOf(actor) * 0.07);
      actor.walking = Math.hypot(actor.point.x - before.x, actor.point.z - before.z) > 0.001;
      if (!actor.walking && distance > 0.5) actor.targetIndex = (actor.targetIndex + 1) % citizen.points.length;
      actor.direction = actor.point.x < before.x ? -1 : 1;
    }
    if (companion && appearance.petId) {
      const target = { x: player.point.x - player.direction * 1.1, z: player.point.z + 0.7 };
      companion.walking = Math.hypot(companion.point.x - target.x, companion.point.z - target.z) > 0.16;
      const damping = 1 - Math.exp(-seconds * 5);
      companion.point.x += (target.x - companion.point.x) * damping;
      companion.point.z += (target.z - companion.point.z) * damping;
      companion.direction = player.direction;
    }
    for (const actor of actors) {
      const hop = reducedMotion.matches ? 0 : actor.walking ? Math.abs(Math.sin(elapsed * 11 + actors.indexOf(actor))) * 0.15 : Math.sin(elapsed * 2 + actors.indexOf(actor)) * 0.025;
      actor.sprite.position.set(actor.point.x, 0.1 + hop, actor.point.z);
      if (actor.nameplate) actor.nameplate.position.set(actor.point.x, actor.height + 0.14 + hop, actor.point.z);
      actor.sprite.material.rotation = actor.walking && !reducedMotion.matches ? Math.sin(elapsed * 11) * 0.035 : 0;
      if (actor.sprite.material.map && actor.sprite.material.map.repeat.x !== actor.direction) { actor.sprite.material.map.repeat.x = actor.direction; actor.sprite.material.map.updateMatrix(); }
      actor.shadow.position.set(actor.point.x, 0.06, actor.point.z);
      actor.shadow.scale.setScalar(1 - hop * 0.4);
      actor.aura.visible = actor.auraStrength > 0;
      actor.aura.position.set(actor.point.x - Math.sin(heading) * 0.18, actor.height * 0.52 + hop, actor.point.z - Math.cos(heading) * 0.18);
      actor.aura.material.opacity = actor.auraStrength * (reducedMotion.matches ? 1 : 0.88 + Math.sin(elapsed * 2.2) * 0.12);
    }
    wings.position.set(player.point.x - Math.sin(heading) * 0.12, player.height * 0.6, player.point.z - Math.cos(heading) * 0.12);
    wings.scale.set(5.1 * (reducedMotion.matches ? 1 : 1 + Math.sin(elapsed * 2.4) * 0.025), 5.1, 1);
    playerRing.position.set(player.point.x, 0.065, player.point.z);
    for (let index = 0; index < waterPositions.count; index += 1) waterPositions.setZ(index, Math.sin(waterBase[index * 3 + 1] * 2 + elapsed * 2.1) * 0.035 + Math.sin(waterBase[index * 3] * 4 + elapsed * 1.5) * 0.02);
    waterPositions.needsUpdate = true;
    for (const [index, drop] of droplets.entries()) {
      const fraction = (elapsed * 0.7 + index / 8) % 1;
      const angle = index / 8 * Math.PI * 2;
      drop.position.set(Math.sin(angle) * fraction * 1.5, 2.5 - fraction ** 2 * 2.1, -1.5 + Math.cos(angle) * fraction * 1.5);
    }
    if (!reducedMotion.matches) {
      for (let index = 0; index < 48; index += 1) sparklePositions[index * 3 + 1] = 1.4 + (index * 0.7 + elapsed * 0.15) % 4;
      sparkleGeometry.attributes.position.needsUpdate = true;
    }
    lookTarget.set(backdropTarget?.x ?? player.point.x, 0, backdropTarget?.z ?? player.point.z - 2);
    cameraTarget.lerp(lookTarget, reducedMotion.matches ? 1 : 1 - Math.exp(-seconds * 5));
    camera.position.set(cameraTarget.x + Math.sin(heading) * 32, 31, cameraTarget.z + Math.cos(heading) * 32);
    lookTarget.copy(cameraTarget); lookTarget.y = guided ? 2 : 0.5;
    camera.lookAt(lookTarget);
    renderer.render(scene, camera);
    if (!ready && loadedAssets >= requestedAssets) { ready = true; canvas.dataset.ready = 'true'; options.onReady(); }
    if (time - lastReport > 250) {
      lastReport = time;
      canvas.dataset.playerX = player.point.x.toFixed(3);
      canvas.dataset.playerZ = player.point.z.toFixed(3);
      canvas.dataset.frames = String(frames);
      canvas.dataset.assets = `${loadedAssets}/${requestedAssets}`;
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.walking = String(walkPath.length > 0);
      canvas.dataset.cameraX = cameraTarget.x.toFixed(3);
      canvas.dataset.cameraZ = cameraTarget.z.toFixed(3);
      canvas.dataset.buildingBadges = String(TOWN_BUILDINGS.length);
      canvas.dataset.pet = appearance.petId ?? '';
      canvas.dataset.petX = companion?.point.x.toFixed(3) ?? '';
      canvas.dataset.petZ = companion?.point.z.toFixed(3) ?? '';
      canvas.dataset.aura = String(player.auraStrength);
      canvas.dataset.petAura = String(companion?.auraStrength ?? 0);
      canvas.dataset.wing = appearance.wingId ?? '';
      options.onFrame({ position: { ...player.point }, district: player.point.x > 14 ? 'Canal Quarter' : player.point.z > 10 ? 'Atelier Lane' : 'Fountain Square', frames });
    }
  }
  animation = requestAnimationFrame(draw);

  return {
    stopWalking,
    setActive(value) { active = value; canvas.dataset.active = String(value); },
    guideTo(route) {
      guided = route !== 'world';
      backdropTarget = guided ? townDestination(route) : undefined;
      zoom = guided ? 1.55 : 1;
      for (const badge of buildingBadges) badge.visible = !guided;
      for (const actor of actors) if (actor.nameplate) actor.nameplate.visible = !guided;
      canvas.dataset.route = route;
      stopWalking();
      const building = townDestination(route);
      if (building) {
        const arrival = townArrival(building);
        if (reducedMotion.matches) player.point = arrival;
        else if (walkTo(arrival)) {
          let previous = player.point;
          let length = 0;
          for (const point of walkPath) { length += Math.hypot(point.x - previous.x, point.z - previous.z); previous = point; }
          travelSpeed = Math.max(8, length / 0.45);
        }
      }
      resize();
    },
    updateAppearance: setAppearance,
    updateTheme: setTheme,
    zoom(amount) { zoom = THREE.MathUtils.clamp(zoom + amount, 0.65, 1.7); resize(); },
    rotate() { heading += Math.PI / 4; },
    recenter() { heading = Math.PI / 5; zoom = 1; cameraTarget.set(player.point.x, 0, player.point.z - 2); resize(); },
    travel(id, cinematic = false) {
      const building = TOWN_BUILDINGS.find((entry) => entry.id === id);
      if (!building) return false;
      const arrival = townArrival(building);
      stopWalking();
      if (reducedMotion.matches) { player.point = arrival; return true; }
      if (!walkTo(arrival)) return false;
      if (cinematic) {
        let previous = player.point;
        let length = 0;
        for (const point of walkPath) { length += Math.hypot(point.x - previous.x, point.z - previous.z); previous = point; }
        travelSpeed = Math.max(10, length / 0.45);
      }
      return true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(animation);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerCancel);
      canvas.removeEventListener('webglcontextlost', contextLost);
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const map of textures) map.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      scene.clear();
    },
  };
}