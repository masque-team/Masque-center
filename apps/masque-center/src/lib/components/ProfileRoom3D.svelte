<script lang="ts">
  import { onMount } from 'svelte';
  import AssetPortrait from './AssetPortrait.svelte';

  let {
    avatar,
    pet = undefined,
    wing = undefined,
    background,
    frameId = null,
    vipActive = false,
  }: {
    avatar: { id: string; name: string; imagePath: string; placeholder: string; color: string };
    pet?: { id: string; name: string; imagePath: string; placeholder: string; color: string };
    wing?: { id: string; name: string; imagePath: string; color: string };
    background: { id: string; name: string; imagePath: string };
    frameId?: string | null;
    vipActive?: boolean;
  } = $props();

  let canvasHost = $state<HTMLDivElement>();
  let webglReady = $state(false);
  let webglFailed = $state(false);
  let pointerX = $state(0);
  let pointerY = $state(0);
  let isDragging = $state(false);

  // Lazy-loaded Three.js state references for reactive texture updates
  let updateSceneAssets: (() => void) | null = null;

  $effect(() => {
    // Track reactive props so changes to avatar, pet, wing, background, or vip update the 3D planes
    avatar.id;
    pet?.id;
    wing?.id;
    background.id;
    vipActive;
    updateSceneAssets?.();
  });

  function resolveUrl(path: string): string {
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    const base = import.meta.env.BASE_URL || '/';
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  function actorAvatarUrl(item: typeof avatar): string {
    // Prefer pre-trimmed transparent WebP actor sprite when available
    const trimmedIds = ['aqua', 'ember', 'fawn', 'flora', 'luna', 'mali-vip', 'mali', 'mimi', 'nami', 'nyx'];
    if (trimmedIds.includes(item.id)) {
      return resolveUrl(`assets/world/actors/avatars-${item.id}.webp`);
    }
    return resolveUrl(item.imagePath);
  }

  function actorPetUrl(item: NonNullable<typeof pet>): string {
    return resolveUrl(`assets/world/actors/pets-${item.id}.webp`);
  }

  function handlePointerDown(event: PointerEvent) {
    isDragging = true;
    updatePointer(event);
  }

  function handlePointerMove(event: PointerEvent) {
    updatePointer(event);
  }

  function handlePointerUp() {
    isDragging = false;
  }

  function updatePointer(event: PointerEvent) {
    if (!canvasHost) return;
    const rect = canvasHost.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    pointerX = Math.max(-1, Math.min(1, nx));
    pointerY = Math.max(-1, Math.min(1, ny));
  }

  function resetPointer() {
    isDragging = false;
    pointerX = 0;
    pointerY = 0;
  }

  onMount(() => {
    let disposed = false;
    let animationFrame = 0;
    let cleanupFn: (() => void) | null = null;
    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      try {
        const THREE = await import('three');
        if (disposed || !canvasHost) return;

        const width = Math.max(280, canvasHost.clientWidth || 360);
        const height = Math.max(280, canvasHost.clientHeight || 350);

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
        camera.position.set(0, 1.35, 6.4);
        camera.lookAt(0, 1.0, 0);

        // Soft Casual Fantasy 3D Room Lighting
        const ambientLight = new THREE.AmbientLight(0xfffaf0, 1.55);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff2cc, 1.35);
        keyLight.position.set(2.8, 4.5, 4.2);
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(0x7dd3fc, 1.2, 12);
        rimLight.position.set(-2.6, 2.4, 2.0);
        scene.add(rimLight);

        const goldLight = new THREE.PointLight(0xffcf56, 0.95, 10);
        goldLight.position.set(0, 0.6, 2.2);
        scene.add(goldLight);

        // 1. Curved 3D Room Backdrop Wall
        const wallGeo = new THREE.CylinderGeometry(5.6, 5.6, 5.2, 32, 1, true, Math.PI * 0.68, Math.PI * 0.64);
        wallGeo.scale(-1, 1, 1);
        const wallMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
        });
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.position.set(0, 1.55, -0.4);
        scene.add(wallMesh);

        // 2. 3D Room Floor & Royal Pedestal
        const floorGeo = new THREE.CircleGeometry(4.8, 48);
        const floorMat = new THREE.MeshStandardMaterial({
          color: 0xe6f4fe,
          roughness: 0.65,
          metalness: 0.05,
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, -0.48, -0.2);
        scene.add(floorMesh);

        // Outer Pedestal Base (Ivory & Sky Blue 2.5D Disc)
        const baseGeo = new THREE.CylinderGeometry(1.42, 1.56, 0.24, 48);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0xfffcf2,
          roughness: 0.35,
          metalness: 0.12,
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.set(0, -0.35, 0.35);
        scene.add(baseMesh);

        // Golden Trim Ring around Pedestal
        const ringGeo = new THREE.TorusGeometry(1.44, 0.055, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xffc845,
          roughness: 0.25,
          metalness: 0.65,
          emissive: 0x6b4400,
          emissiveIntensity: 0.2,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(0, -0.23, 0.35);
        scene.add(ringMesh);

        // Inner Glowing Magic Stage Top
        const stageTopGeo = new THREE.CylinderGeometry(1.32, 1.32, 0.04, 48);
        const stageTopMat = new THREE.MeshBasicMaterial({
          color: 0xbfe8ff,
        });
        const stageTopMesh = new THREE.Mesh(stageTopGeo, stageTopMat);
        stageTopMesh.position.set(0, -0.22, 0.35);
        scene.add(stageTopMesh);

        // Soft Contact Shadow under Avatar
        const shadowGeo = new THREE.CircleGeometry(0.85, 32);
        const shadowMat = new THREE.MeshBasicMaterial({
          color: 0x1e3a5f,
          transparent: true,
          opacity: 0.22,
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.set(0, -0.19, 0.42);
        scene.add(shadowMesh);

        // Decorative 3D Columns on Left & Right of the Room
        const pillarGeo = new THREE.CylinderGeometry(0.16, 0.2, 3.8, 20);
        const pillarMat = new THREE.MeshStandardMaterial({
          color: 0xfff9ea,
          roughness: 0.4,
          metalness: 0.1,
        });
        const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
        leftPillar.position.set(-2.35, 1.3, -0.6);
        const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
        rightPillar.position.set(2.35, 1.3, -0.6);
        scene.add(leftPillar, rightPillar);

        // 3. 2D Cosmetics & Character Planes in 3D Space
        const characterGroup = new THREE.Group();
        characterGroup.position.set(0, -0.18, 0.45);
        scene.add(characterGroup);

        // Wing Plane (behind Avatar)
        const wingGeo = new THREE.PlaneGeometry(2.85, 2.55);
        const wingMat = new THREE.MeshBasicMaterial({
          transparent: true,
          alphaTest: 0.03,
          side: THREE.DoubleSide,
        });
        const wingMesh = new THREE.Mesh(wingGeo, wingMat);
        wingMesh.position.set(0, 1.32, -0.14);
        wingMesh.visible = false;
        characterGroup.add(wingMesh);

        // Avatar 2D Plane (Main Character)
        const avatarGeo = new THREE.PlaneGeometry(2.15, 2.48);
        const avatarMat = new THREE.MeshBasicMaterial({
          transparent: true,
          alphaTest: 0.03,
          side: THREE.DoubleSide,
        });
        const avatarMesh = new THREE.Mesh(avatarGeo, avatarMat);
        avatarMesh.position.set(0, 1.24, 0.05);
        characterGroup.add(avatarMesh);

        // Pet Mini Pedestal & 2D Plane
        const petGroup = new THREE.Group();
        petGroup.position.set(1.08, 0.08, 0.36);
        scene.add(petGroup);

        const petBaseGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.12, 32);
        const petBaseMesh = new THREE.Mesh(petBaseGeo, baseMat);
        petBaseMesh.position.set(0, -0.22, 0);
        petGroup.add(petBaseMesh);

        const petRingGeo = new THREE.TorusGeometry(0.43, 0.025, 12, 32);
        const petRingMesh = new THREE.Mesh(petRingGeo, ringMat);
        petRingMesh.rotation.x = Math.PI / 2;
        petRingMesh.position.set(0, -0.16, 0);
        petGroup.add(petRingMesh);

        const petGeo = new THREE.PlaneGeometry(0.95, 0.95);
        const petMat = new THREE.MeshBasicMaterial({
          transparent: true,
          alphaTest: 0.03,
          side: THREE.DoubleSide,
        });
        const petMesh = new THREE.Mesh(petGeo, petMat);
        petMesh.position.set(0, 0.36, 0.05);
        petGroup.add(petMesh);

        // 4. Floating 3D Starlight Crystals
        const starsGroup = new THREE.Group();
        scene.add(starsGroup);
        const starGeo = new THREE.OctahedronGeometry(0.065, 0);
        const starMatGold = new THREE.MeshStandardMaterial({
          color: 0xffe066,
          emissive: 0xffb703,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.8,
        });
        const starMatSky = new THREE.MeshStandardMaterial({
          color: 0x90e0ef,
          emissive: 0x00b4d8,
          emissiveIntensity: 0.5,
          roughness: 0.2,
          metalness: 0.6,
        });
        const starNodes: { mesh: InstanceType<typeof THREE.Mesh>; baseY: number; speed: number; phase: number }[] = [];
        const starPositions = [
          [-1.55, 1.95, 0.2],
          [1.62, 2.05, 0.1],
          [-1.25, 0.75, 0.6],
          [1.48, 1.25, 0.5],
          [-0.65, 2.35, -0.2],
          [0.75, 2.3, -0.15],
        ];
        starPositions.forEach(([x, y, z], idx) => {
          const mesh = new THREE.Mesh(starGeo, idx % 2 === 0 ? starMatGold : starMatSky);
          mesh.position.set(x, y, z);
          starsGroup.add(mesh);
          starNodes.push({ mesh, baseY: y, speed: 1.4 + idx * 0.25, phase: idx * 1.1 });
        });

        // Texture Loader with caching
        const loader = new THREE.TextureLoader();
        const textureCache = new Map<string, InstanceType<typeof THREE.Texture>>();

        function loadTex(url: string, onLoaded: (tex: InstanceType<typeof THREE.Texture>) => void, onError?: () => void) {
          const cached = textureCache.get(url);
          if (cached) {
            onLoaded(cached);
            return;
          }
          loader.load(
            url,
            (tex) => {
              if (disposed) {
                tex.dispose();
                return;
              }
              tex.colorSpace = THREE.SRGBColorSpace;
              textureCache.set(url, tex);
              onLoaded(tex);
            },
            undefined,
            () => onError?.(),
          );
        }

        function syncAssets() {
          if (disposed) return;

          // Theme lighting tint
          if (background.id === 'atelier-dusk') {
            ambientLight.color.setHex(0xffeef8);
            keyLight.color.setHex(0xffcf96);
            stageTopMat.color.setHex(0xfce7f3);
            floorMat.color.setHex(0xf5e8f7);
          } else if (background.id === 'cloud-club') {
            ambientLight.color.setHex(0xf4faff);
            keyLight.color.setHex(0xe0f2fe);
            stageTopMat.color.setHex(0xd8f3ff);
            floorMat.color.setHex(0xe0f2fe);
          } else {
            ambientLight.color.setHex(0xfffaf0);
            keyLight.color.setHex(0xfff2cc);
            stageTopMat.color.setHex(0xbfe8ff);
            floorMat.color.setHex(0xe6f4fe);
          }

          // Background wall texture
          loadTex(resolveUrl(background.imagePath), (tex) => {
            wallMat.map = tex;
            wallMat.needsUpdate = true;
          });

          // Avatar plane texture (try actor trimmed WebP first, fallback to standard imagePath)
          const primaryAvatarUrl = actorAvatarUrl(avatar);
          loadTex(
            primaryAvatarUrl,
            (tex) => {
              avatarMat.map = tex;
              avatarMat.needsUpdate = true;
            },
            () => {
              loadTex(resolveUrl(avatar.imagePath), (tex) => {
                avatarMat.map = tex;
                avatarMat.needsUpdate = true;
              });
            },
          );

          // Wing plane texture
          if (wing) {
            loadTex(resolveUrl(wing.imagePath), (tex) => {
              wingMat.map = tex;
              wingMat.needsUpdate = true;
              wingMesh.visible = true;
            });
          } else {
            wingMesh.visible = false;
          }

          // Pet plane texture
          if (pet) {
            petGroup.visible = true;
            const currentPet = pet;
            loadTex(
              actorPetUrl(currentPet),
              (tex) => {
                petMat.map = tex;
                petMat.needsUpdate = true;
              },
              () => {
                loadTex(resolveUrl(currentPet.imagePath), (tex) => {
                  petMat.map = tex;
                  petMat.needsUpdate = true;
                });
              },
            );
          } else {
            petGroup.visible = false;
          }
        }

        updateSceneAssets = syncAssets;
        syncAssets();

        // Mount canvas
        // eslint-disable-next-line svelte/no-dom-manipulating
        canvasHost.appendChild(renderer.domElement);
        webglReady = true;

        const resizeObserver = new ResizeObserver(() => {
          if (!canvasHost || disposed) return;
          const w = Math.max(280, canvasHost.clientWidth);
          const h = Math.max(280, canvasHost.clientHeight);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        resizeObserver.observe(canvasHost);

        const startTime = performance.now();
        let currentCamX = 0;
        let currentCamY = 1.35;

        function animate(nowMs: number) {
          if (disposed) return;
          const elapsed = (nowMs - startTime) * 0.001;

          // Smooth camera parallax from touch/pointer
          const targetCamX = pointerX * 0.65;
          const targetCamY = 1.35 - pointerY * 0.25;
          currentCamX += (targetCamX - currentCamX) * 0.08;
          currentCamY += (targetCamY - currentCamY) * 0.08;
          camera.position.x = currentCamX;
          camera.position.y = currentCamY;
          camera.lookAt(0, 1.02, 0);

          if (!motionReduced) {
            // Gentle breathing/floating on 2D Avatar Plane
            const bob = Math.sin(elapsed * 2.1) * 0.035;
            characterGroup.position.y = -0.18 + bob;
            characterGroup.rotation.y = currentCamX * 0.18;
            shadowMesh.scale.setScalar(1 - bob * 1.1);

            if (wingMesh.visible) {
              wingMesh.scale.x = 1 + Math.sin(elapsed * 3.2) * 0.03;
            }

            if (petGroup.visible) {
              petMesh.position.y = 0.36 + Math.sin(elapsed * 2.8 + 1.2) * 0.04;
              petGroup.rotation.y = currentCamX * 0.15;
            }

            for (const node of starNodes) {
              node.mesh.position.y = node.baseY + Math.sin(elapsed * node.speed + node.phase) * 0.08;
              node.mesh.rotation.y = elapsed * 1.2 + node.phase;
            }
          }

          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(animate);
        }

        animationFrame = requestAnimationFrame(animate);

        cleanupFn = () => {
          resizeObserver.disconnect();
          cancelAnimationFrame(animationFrame);
          updateSceneAssets = null;
          textureCache.forEach((tex) => tex.dispose());
          textureCache.clear();
          wallGeo.dispose();
          wallMat.dispose();
          floorGeo.dispose();
          floorMat.dispose();
          baseGeo.dispose();
          baseMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          stageTopGeo.dispose();
          stageTopMat.dispose();
          shadowGeo.dispose();
          shadowMat.dispose();
          pillarGeo.dispose();
          pillarMat.dispose();
          wingGeo.dispose();
          wingMat.dispose();
          avatarGeo.dispose();
          avatarMat.dispose();
          petBaseGeo.dispose();
          petRingGeo.dispose();
          petGeo.dispose();
          petMat.dispose();
          starGeo.dispose();
          starMatGold.dispose();
          starMatSky.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        webglFailed = true;
      }
    })();

    return () => {
      disposed = true;
      cleanupFn?.();
    };
  });
</script>

<div
  class="room-stage relative isolate h-full min-h-[360px] w-full overflow-hidden select-none"
  role="region"
  aria-label="ห้อง 3D โปรไฟล์"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointerleave={resetPointer}
>
  <!-- Rich 2.5D Room Backdrop Layer (Always visible underneath Three.js canvas & serves as instant fallback) -->
  <img
    class="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-300"
    style:transform={`scale(1.05) translate(${pointerX * -8}px, ${pointerY * -5}px)`}
    src={background.imagePath}
    alt={background.name}
  />
  <div class="pointer-events-none absolute inset-0 -z-15 bg-gradient-to-b from-sky-900/10 via-transparent to-[#132a42]/85"></div>

  <!-- Three.js WebGL Stage Host -->
  <div
    bind:this={canvasHost}
    class={['absolute inset-0 z-0 transition-opacity duration-300', webglReady && !webglFailed ? 'opacity-100' : 'opacity-0 pointer-events-none']}
    aria-hidden="true"
  ></div>

  <!-- Accessible & Fallback 2.5D Character Plane Layer (Shown when WebGL is loading/unavailable, and keeps DOM accessible for tests) -->
  <div
    class={[
      'relative z-10 mx-auto mt-7 flex h-60 w-56 items-center justify-center transition-opacity duration-300',
      webglReady && !webglFailed ? 'opacity-0 pointer-events-none' : 'opacity-100',
    ]}
  >
    <span class="pedestal-fallback" aria-hidden="true"></span>
    {#if wing}
      <img class="pointer-events-none absolute inset-0 h-full w-full scale-140 object-contain drop-shadow-[0_6px_12px_rgba(60,40,120,0.3)]" src={wing.imagePath} alt={wing.name} />
    {/if}
    <span class="relative block h-52 w-44 drop-shadow-[0_10px_16px_rgba(25,45,85,0.38)]" data-frame={frameId}>
      <AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" loading="eager" />
    </span>
    {#if pet}
      <span class=" absolute -right-4 bottom-2 h-24 w-20 drop-shadow-[0_6px_10px_rgba(25,45,85,0.35)]">
        <AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" />
      </span>
    {/if}
  </div>

  <!-- Frame Aura Indicator Badge when Frame is Equipped in 3D Mode -->
  {#if frameId && webglReady && !webglFailed}
    <div
      class="pointer-events-none absolute top-14 left-1/2 z-10 h-52 w-44 -translate-x-1/2 rounded-2xl"
      data-frame={frameId}
      aria-hidden="true"
    ></div>
  {/if}
</div>

<style>
  .room-stage {
    touch-action: pan-y;
  }
  .pedestal-fallback {
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 176px;
    height: 34px;
    transform: translateX(-50%);
    border-radius: 50%;
    border: 3px solid #ffe484;
    background: radial-gradient(circle, #e0f4ff 0%, #9ad9f5 68%, #fff8dc 100%);
    box-shadow:
      0 6px 0 #c98a1e,
      0 12px 24px rgba(20, 45, 80, 0.38);
  }
</style>
