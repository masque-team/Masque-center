<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, ArrowUpRight, Compass, Footprints, Gamepad2, House, LoaderCircle, LocateFixed, Map, MessageCircle, PawPrint, RotateCw, Send, Shirt, Smile, UsersRound, X, ZoomIn, ZoomOut } from '@lucide/svelte';
  import { AVATARS, PETS } from './data/config';
  import AssetPortrait from './AssetPortrait.svelte';
  import { MOCK_CITIZENS, TOWN_BUILDINGS, TOWN_MENUS, townArrival } from './world/town';
  import type { VeaseController, WorldSnapshot } from './world/veaseWorld';
  import type { TownPlayer } from './embed/protocol';

  let { player, vipActive = false, activeRoute = 'world', active = true, walkRequest, onArrived, onEquipPet, onNavigate, onToast }: { player: TownPlayer; vipActive?: boolean; activeRoute?: string; active?: boolean; walkRequest?: { id: string; destination: string }; onArrived?: (id: string, destination: string, cancelled: boolean) => void; onEquipPet: (id: string | null) => void; onNavigate: (route: string) => void; onToast: (message: string) => void } = $props();
  let host = $state<HTMLDivElement>();
  let dialog = $state<HTMLDialogElement>();
  let controller = $state<VeaseController | null>(null);
  let ready = $state(false);
  let error = $state('');
  let snapshot = $state<WorldSnapshot>({ position: { x: 0, z: 6 }, district: 'Fountain Square', frames: 0 });
  let panel = $state<'map' | 'people' | 'pets' | null>(null);
  let peerId = $state<string | null>(null);
  let placeId = $state<string | null>(null);
  let emotesOpen = $state(false);
  let message = $state('');
  let speech = $state('');
  let peerReply = $state('');
  let mounted = false;
  let bootVersion = 0;
  let speechTimer: ReturnType<typeof setTimeout> | undefined;
  const EMOTES = ['👋', '😄', '❤️', '✨'];
  const destinationLabels: Record<string, string> = { shop: 'เปิดร้านค้า', avatar: 'เปิดห้องแต่งตัว', room: 'แต่งโปรไฟล์ของฉัน', rewards: 'เปิด Battle Pass และภารกิจ', battle: 'เข้า Battle Arena' };
  let peer = $derived(MOCK_CITIZENS.find((citizen) => citizen.id === peerId));
  let place = $derived(TOWN_BUILDINGS.find((building) => building.id === placeId));
  let appearance = $derived({ name: player.displayName, level: player.level, avatarId: player.avatarId, petId: player.petId, frameId: player.demo.frameId, wingId: player.demo.wingId, vip: vipActive });
  let selectedAvatar = $derived(AVATARS.find((avatar) => avatar.id === peer?.avatarId) ?? AVATARS[0]);
  let equippedPet = $derived(PETS.find((pet) => pet.id === player.petId));
  let enabled = $derived(player.demo.config.worldEnabled);

  function closePanels() { panel = null; peerId = null; placeId = null; }
  function stopMoving() { controller?.stopWalking(); if (walkRequest) onArrived?.(walkRequest.id, walkRequest.destination, true); }
  function say(value: string) {
    speech = value.slice(0, 60); emotesOpen = false;
    if (speechTimer) clearTimeout(speechTimer);
    speechTimer = setTimeout(() => { speech = ''; peerReply = ''; }, 4000);
  }
  function sendChat() {
    if (!message.trim()) return;
    say(message.trim()); message = ''; peerReply = 'แล้วเจอกันที่พลาซ่านะ!';
  }
  function travel(id: string) {
    stopMoving();
    const walking = controller?.travel(id);
    closePanels();
    onToast(walking ? `กำลังเดินไป ${TOWN_BUILDINGS.find((building) => building.id === id)?.name ?? 'พลาซ่า'}` : 'เดินไปจุดนี้ไม่ได้');
  }
  async function boot() {
    const version = ++bootVersion;
    controller?.dispose(); controller = null; ready = false; error = '';
    if (!enabled) return;
    try {
      await document.fonts.ready;
      const { createVeaseWorld } = await import('./world/veaseWorld');
      if (!mounted || !host || version !== bootVersion) return;
      controller = createVeaseWorld(host, {
        appearance, theme: player.demo.config.worldTheme,
        onReady: () => { if (mounted && version === bootVersion) ready = true; },
        onFrame: (next) => {
          if (!mounted || version !== bootVersion) return;
          snapshot = next;
          const building = TOWN_BUILDINGS.find((entry) => entry.id === walkRequest?.destination);
          if (building && walkRequest) {
            const target = townArrival(building);
            if (Math.hypot(next.position.x - target.x, next.position.z - target.z) < 0.15) onArrived?.(walkRequest.id, building.id, false);
          }
        },
        onSelect: (kind, id) => { stopMoving(); closePanels(); if (kind === 'peer') peerId = id; else placeId = id; },
        onError: (reason) => { if (mounted && version === bootVersion) error = reason; },
      });
    } catch { error = 'อุปกรณ์นี้ยังเปิด WebGL ไม่สำเร็จ'; }
  }

  onMount(() => {
    mounted = true;
    const previousTitle = document.title;
    void boot();
    return () => { mounted = false; bootVersion += 1; stopMoving(); controller?.dispose(); if (speechTimer) clearTimeout(speechTimer); document.title = previousTitle; };
  });
  $effect(() => { controller?.updateAppearance(appearance); });
  $effect(() => { controller?.updateTheme(player.demo.config.worldTheme); });
  $effect(() => { controller?.setActive(active); });
  $effect(() => {
    if (ready && controller && walkRequest && !controller.travel(walkRequest.destination, true)) onArrived?.(walkRequest.id, walkRequest.destination, true);
  });
  $effect(() => { const route = activeRoute; closePanels(); controller?.guideTo(route); document.title = route === 'world' ? 'Masque Vease | MasqueGame' : 'MasqueGame'; });
  $effect(() => {
    const open = !!panel || !!peerId || !!placeId;
    if (dialog) { if (open && !dialog.open) { stopMoving(); dialog.showModal(); } else if (!open && dialog.open) dialog.close(); }
  });
</script>

<svelte:window onblur={stopMoving} />

<section class="vease relative h-dvh min-h-0 w-full overflow-hidden bg-[#c5e5ee] text-[#254b61]" class:pointer-events-none={activeRoute !== 'world'} aria-label="Masque Vease">
  <div bind:this={host} class="absolute inset-0" data-testid="vease-stage"></div>

  {#if activeRoute === 'world'}
  {#if !ready && !error && enabled}
    <div class="absolute inset-0 z-20 grid place-content-center justify-items-center gap-3 bg-[#e4f1f5] text-center" role="status">
      <img class="w-56 max-w-[70vw]" src="assets/world/house-coral.webp" alt="บ้านในเมือง Masque Vease" />
      <h2 class="text-2xl font-bold">Masque Vease</h2>
      <span class="flex items-center gap-2 text-sm"><LoaderCircle size={17} class="animate-spin" />กำลังเปิดเมือง</span>
    </div>
  {/if}

  <header class="pointer-events-none absolute inset-x-0 top-0 z-20 border-b border-white/60 bg-white/85 px-3 pt-[max(10px,env(safe-area-inset-top))] pb-3 backdrop-blur-md sm:px-6">
    <div class="flex items-center gap-2">
      <button class="hud-button pointer-events-auto shrink-0" title="กลับ Game Center" aria-label="กลับ Game Center" onclick={() => onNavigate('home')}><ArrowLeft size={21} /></button>
      <div class="min-w-0 flex-1"><div class="flex items-center gap-1"><h1 class="text-[18px] font-bold leading-tight sm:text-2xl">Masque Vease</h1><span class="text-[9px] font-semibold text-[#668798]">DEMO</span></div><p class="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#668798]"><Compass size={11} />{snapshot.district}<span class="mx-1 opacity-40">/</span>{MOCK_CITIZENS.length} MOCK</p></div>
      <button class="hud-button pointer-events-auto shrink-0" disabled={!ready} title="ผู้เล่นจำลอง" aria-label="ผู้เล่นจำลอง" onclick={() => { closePanels(); panel = 'people'; }}><UsersRound size={20} /></button>
      <button class="hud-button pointer-events-auto shrink-0" disabled={!ready} title="แผนที่เมือง" aria-label="แผนที่เมือง" onclick={() => { closePanels(); panel = 'map'; }}><Map size={20} /></button>
    </div>
  </header>

  {#if ready && enabled}
    <div class="pointer-events-none absolute top-[104px] left-4 z-10 max-w-[calc(100%_-_84px)] rounded-md bg-white/70 px-2.5 py-1.5 text-[10px] font-medium break-words backdrop-blur-sm sm:left-6">{player.demo.config.announcement}</div>
    <div class="absolute top-[104px] right-3 z-20 grid gap-1.5 sm:right-6" aria-label="กล้อง">
      <button class="hud-button" title="ซูมเข้า" aria-label="ซูมเข้า" onclick={() => controller?.zoom(0.15)}><ZoomIn size={19} /></button>
      <button class="hud-button" title="ซูมออก" aria-label="ซูมออก" onclick={() => controller?.zoom(-0.15)}><ZoomOut size={19} /></button>
      <button class="hud-button" title="หมุนกล้อง" aria-label="หมุนกล้อง" onclick={() => controller?.rotate()}><RotateCw size={18} /></button>
      <button class="hud-button" title="กล้องตามตัวละคร" aria-label="กล้องตามตัวละคร" onclick={() => controller?.recenter()}><LocateFixed size={19} /></button>
    </div>
    {#if speech}<div class="pointer-events-none absolute bottom-[142px] left-1/2 z-20 flex max-w-[min(90vw,380px)] -translate-x-1/2 flex-col items-center gap-1" aria-live="polite"><span class="rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold shadow-sm">{player.displayName}: {speech}</span>{#if peerReply}<span class="rounded-lg bg-[#25566d]/90 px-3 py-2 text-xs text-white shadow-sm">Luna: {peerReply}</span>{/if}</div>{/if}

    <footer class="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pt-5 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6">
      <div class="mx-auto grid max-w-[430px] items-end gap-3">
        <div class="pointer-events-auto relative grid gap-2">
          {#if emotesOpen}<div class="absolute right-0 bottom-[108px] flex gap-1 rounded-lg border border-white bg-white/95 p-2 shadow-lg" aria-label="อีโมจิ">{#each EMOTES as emote (emote)}<button class="grid size-10 place-items-center text-xl" aria-label={`ส่ง ${emote}`} onclick={() => say(emote)}>{emote}</button>{/each}</div>{/if}
          <div class="flex justify-end gap-2"><button class="hud-button" title="อีโมจิ" aria-label="อีโมจิ" aria-pressed={emotesOpen} onclick={() => emotesOpen = !emotesOpen}><Smile size={21} /></button><button class="hud-button" title="สัตว์เลี้ยงเดินตาม" aria-label="เลือกสัตว์เลี้ยงเดินตาม" onclick={() => { closePanels(); panel = 'pets'; }}><PawPrint size={20} /></button><button class="hud-button" title="Avatar & Pets" aria-label="เปลี่ยน Avatar และ Pet" onclick={() => onNavigate('avatar')}><Shirt size={20} /></button><button class="hud-button" title="แต่งโปรไฟล์" aria-label="แต่งโปรไฟล์ของฉัน" onclick={() => onNavigate('room')}><House size={20} /></button></div>
          <form class="flex min-h-12 min-w-0 items-center gap-1 rounded-lg border border-white bg-white/85 p-1.5 shadow-sm backdrop-blur-md" onsubmit={(event) => { event.preventDefault(); sendChat(); }}><MessageCircle size={16} class="ml-1 hidden shrink-0 text-[#6e92a3] sm:block" /><input class="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-[#8aa1ac]" aria-label="ข้อความ Masque Vease" maxlength="60" placeholder="ทักทาย..." bind:value={message} onfocus={stopMoving} /><button class="grid size-9 shrink-0 place-items-center rounded-md bg-[#387f9c] text-white disabled:bg-[#b0c6d0]" type="submit" aria-label="ส่งข้อความ" disabled={!message.trim()}><Send size={16} /></button></form>
        </div>
      </div>
    </footer>
  {/if}

  {#if error || !enabled}
    <section class="absolute inset-0 z-10 grid place-content-center justify-items-center gap-4 bg-[#e6f1f5] px-8 text-center"><img class="w-56 max-w-[70vw]" src="assets/world/house-sky.webp" alt="บ้านใน Masque Vease" /><h2 class="text-xl font-bold">{!enabled ? 'Masque Vease ปิดชั่วคราว' : 'เปิดเมืองไม่สำเร็จ'}</h2>{#if error}<p class="max-w-sm break-words text-sm">{error}</p><button class="flex min-h-11 items-center gap-2 rounded-md bg-[#387f9c] px-5 text-sm text-white" onclick={() => void boot()}><RotateCw size={16} />ลองอีกครั้ง</button>{/if}</section>
  {/if}

  <dialog bind:this={dialog} class="vease-dialog text-[#254b61]" aria-label={panel === 'map' ? 'แผนที่ Masque Vease' : panel === 'people' ? 'ผู้เล่นจำลอง' : peer ? `โปรไฟล์ ${peer.name}` : place?.name ?? 'Masque Vease'} oncancel={closePanels} onclose={closePanels}>
    <div class="relative p-5">
      <button class="hud-button absolute top-3 right-3 z-10" aria-label="ปิดหน้าต่าง" title="ปิด" onclick={closePanels}><X size={18} /></button>
      {#if panel === 'pets'}
        <h2 class="pr-12 text-xl font-bold">สัตว์เลี้ยงเดินตาม</h2>
        <div class="mt-4 grid grid-cols-2 gap-3">{#each PETS.filter((pet) => player.ownedPetIds.includes(pet.id)) as pet (pet.id)}<button class="grid justify-items-center gap-2 rounded-lg border border-sky-200 bg-white/70 p-3 text-sm" class:ring-2={player.petId === pet.id} aria-pressed={player.petId === pet.id} aria-label={`เดินตามด้วย ${pet.name}`} onclick={() => { onEquipPet(pet.id); closePanels(); }}><span class="h-24 w-20"><AssetPortrait src={pet.imagePath} alt="" placeholder={pet.placeholder} kind="pet" /></span>{pet.name}</button>{/each}</div>
        <button class="mt-3 min-h-11 w-full text-sm underline" onclick={() => { onEquipPet(null); closePanels(); }}>ถอดสัตว์เลี้ยง</button>
      {:else if panel === 'map'}
        <h2 class="pr-12 text-xl font-bold">Town Map</h2><p class="mt-1 text-xs text-[#7b95a2]">MASQUE VEASE</p>
        <svg class="my-4 aspect-[6/5] w-full rounded-lg bg-[#edf4f5]" viewBox="-32 -27 64 54" role="img" aria-label="แผนที่เมืองและคลอง"><path d="M12-27v54" stroke="#8dccdc" stroke-width="4" /><path d="M-30 6h60M0-25v50M-12-25v50" stroke="#d0e0e5" stroke-width="2" /><circle cx="0" cy="-1.5" r="7" fill="#fafaf7" stroke="#b7d3df" stroke-width=".3" /><circle cx="0" cy="-1.5" r="2" fill="#85c8d7" /><path d="M9 4h6M9-14h6" stroke="#fff" stroke-width="3" />{#each TOWN_BUILDINGS as building (building.id)}<rect x={building.x - building.width / 2} y={building.z - building.depth / 2} width={building.width} height={building.depth} rx=".6" fill={building.palette === 'coral' ? '#df9c9b' : building.palette === 'sky' ? '#8dbbcb' : building.palette === 'lemon' ? '#dbbf81' : '#b9a5c9'} />{/each}<circle cx={snapshot.position.x} cy={snapshot.position.z} r="1.1" fill="#337f9d" stroke="white" stroke-width=".5" /></svg>
        <div class="grid grid-cols-2 gap-x-3">{#each TOWN_BUILDINGS as building (building.id)}<button class="flex min-w-0 items-center gap-2 border-b border-[#e1ebef] py-3 text-left" aria-label={`เดินทางไป ${building.name}`} onclick={() => travel(building.id)}><img class="h-11 w-14 shrink-0 rounded-md object-cover" src={`assets/world/house-${building.palette}.webp`} alt="" /><span class="min-w-0 text-xs font-semibold">{building.name}</span></button>{/each}</div>
      {:else if panel === 'people'}
        <h2 class="pr-12 text-xl font-bold">Around Town</h2><p class="mt-1 text-xs text-[#7b95a2]">{MOCK_CITIZENS.length} MOCK CITIZENS</p>
        <div class="mt-4 divide-y divide-[#e1ebef]">{#each MOCK_CITIZENS as citizen (citizen.id)}{@const art = AVATARS.find((avatar) => avatar.id === citizen.avatarId)!}<button class="flex w-full items-center gap-3 py-3 text-left" aria-label={`ดูโปรไฟล์ ${citizen.name} จำลอง`} onclick={() => { panel = null; peerId = citizen.id; }}><span class="h-14 w-12 shrink-0"><AssetPortrait src={art.imagePath} alt="" placeholder={art.placeholder} kind="avatar" /></span><span class="flex-1"><strong class="block text-sm">{citizen.name}</strong><span class="text-xs text-[#7b95a2]">LV.{citizen.level} · {citizen.title}</span></span><span class="text-[9px] text-[#7b95a2]">MOCK</span></button>{/each}</div>
      {:else if peer}
        <span class="text-[10px] font-semibold text-[#7b95a2]">MOCK CITIZEN</span><div class="mx-auto mt-3 h-44 w-32"><AssetPortrait src={selectedAvatar.imagePath} alt={peer.name} placeholder={selectedAvatar.placeholder} kind="avatar" /></div><h2 class="mt-3 text-center text-2xl font-bold">{peer.name}</h2><p class="mt-1 text-center text-xs text-[#7b95a2]">LV.{peer.level} · {peer.title}</p><button class="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#387f9c] text-sm font-semibold text-white" onclick={() => { closePanels(); say('👋'); peerReply = 'สวัสดี ยินดีที่ได้รู้จัก!'; }}><MessageCircle size={17} />ทักทาย</button>
      {:else if place}
        <img class="-mx-5 -mt-5 mb-4 h-32 w-[calc(100%_+_40px)] max-w-none object-cover" src={`assets/world/house-${place.palette}.webp`} alt={place.name} />
        <p class="text-[10px] text-[#7b95a2]">MASQUE VEASE / {TOWN_MENUS[place.id]}</p><h2 class="mt-1 pr-10 text-xl font-bold">{place.name}</h2>
        {#if place.id === 'arcade'}
          <h3 class="mt-4 flex items-center gap-2 text-sm font-semibold"><Gamepad2 size={17} />เลือกเกม</h3>
          <div class="mt-2 grid grid-cols-2 gap-2">
            {#each player.demo.config.games.filter((game) => game.published !== false) as game (game.id)}
              <button class="min-w-0 overflow-hidden rounded-lg border border-[#dbe7ec] bg-white text-left" aria-label={`เปิดเกม ${game.name}`} onclick={() => onNavigate(`detail/${game.id}`)}>{#if game.cover}<img class="aspect-[16/9] w-full object-cover" src={`images/${game.cover}`} alt="" />{:else}<span class="grid aspect-[16/9] place-items-center bg-sky-100"><Gamepad2 size={28} /></span>{/if}<span class="block p-2 text-xs font-semibold">{game.name}</span></button>
            {/each}
          </div>
        {:else if place.route}
          <button class="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#387f9c] px-3 text-sm font-semibold text-white" onclick={() => { if (place?.route) onNavigate(place.route); }}>{destinationLabels[place.route] ?? 'เข้าใช้งาน'}<ArrowUpRight size={17} /></button>
        {/if}
        <button class="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#cfdee6] text-sm font-semibold" onclick={() => { if (place) travel(place.id); }}><Footprints size={17} />เดินไปหน้าร้าน</button>
      {/if}
    </div>
  </dialog>
  {#if equippedPet && ready}<span class="pointer-events-none absolute bottom-[140px] left-4 z-10 text-[9px] font-medium text-[#5c7d8e] sm:left-6">{equippedPet.name} · COMPANION</span>{/if}
  {/if}
</section>

<style>
  .hud-button { display: grid; place-items: center; width: 40px; height: 40px; padding: 0; border: 1px solid rgb(255 255 255 / 90%); border-radius: 8px; color: #356b85; background: rgb(255 255 255 / 88%); box-shadow: 0 2px 8px #416a8610; touch-action: manipulation; }
  .hud-button:hover { background: #e8f4f9; }
  .hud-button:active { transform: translateY(1px); }
  .hud-button:disabled { opacity: 0.45; }
  .vease-dialog { position: fixed; inset: auto 12px max(16px, env(safe-area-inset-bottom)); width: min(420px, calc(100vw - 24px)); max-height: min(76dvh, 720px); margin: 0 auto; padding: 0; overflow-y: auto; overscroll-behavior: contain; border: 1px solid #ffffff; border-radius: 8px; background: #f7fbfdf5; box-shadow: 0 24px 100px #254b6130; }
  .vease-dialog::backdrop { background: #26495d33; backdrop-filter: blur(4px); }
  @media (min-width: 768px) { .vease-dialog { inset: 50% 0 auto; transform: translateY(-50%); } }
</style>