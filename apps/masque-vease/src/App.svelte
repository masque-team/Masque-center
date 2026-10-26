<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ArrowUpRight, Check, LoaderCircle, Lock, PawPrint, RotateCcw, Save, Shirt, ShoppingBag, Sparkles, X } from '@lucide/svelte';
  import { AVATARS, PETS, WINGS } from './lib/data/config';
  import { isHostMessage, packet, toTownPlayer, trustedSender, type Outfit, type SceneMessage, type SceneMode, type SceneState } from './lib/embed/protocol';
  import type MasqueVease from './lib/MasqueVease.svelte';
  import type { createPortrait } from './lib/world/portraitScene';

  const embedded = window.parent !== window;
  const query = new URLSearchParams(location.search);
  let mode = $state<SceneMode>(query.get('mode') === 'portrait' ? 'portrait' : query.get('mode') === 'wardrobe' ? 'wardrobe' : 'town');
  let initialized = $state(!embedded);
  let active = $state(true);
  let sceneState = $state<SceneState>({
    appearance: { name: 'Mali', level: 18, avatarId: 'mali', petId: 'pudding', wingId: null, frameId: null, vip: false },
    owned: { avatarIds: ['mali', 'nami'], petIds: ['pudding', 'cloud'], wingIds: ['sky-feather'] },
    theme: 'water', enabled: true, announcement: 'Welcome to Masque Vease', games: [
      { id: 'bird', name: 'Bird', cover: 'bird.webp' }, { id: 'memory', name: 'Memory', cover: 'mem.png' },
    ],
  });
  let draft = $state<Outfit>({ avatarId: 'mali', petId: 'pudding', wingId: null });
  let dirty = $state(false);
  let pending = $state('');
  let tab = $state<'avatar' | 'pet' | 'wing'>('avatar');
  let error = $state('');
  let notice = $state('');
  let hostOrigin = '';
  let walkRequest = $state<{ id: string; destination: string }>();
  let TownScene = $state<typeof MasqueVease | null>(null);
  let portraitHost = $state<HTMLDivElement>();
  let contentHost = $state<HTMLDivElement>();
  let portrait = $state<ReturnType<typeof createPortrait> | null>(null);
  let portraitReady = $state(false);
  let townPlayer = $derived(toTownPlayer(sceneState));
  let choices = $derived(tab === 'avatar' ? AVATARS : tab === 'pet' ? PETS : WINGS);
  let owned = $derived(tab === 'avatar' ? sceneState.owned.avatarIds : tab === 'pet' ? sceneState.owned.petIds : sceneState.owned.wingIds);
  let selected = $derived(tab === 'avatar' ? draft.avatarId : tab === 'pet' ? draft.petId : draft.wingId);
  let canSave = $derived(dirty && !pending && sceneState.owned.avatarIds.includes(draft.avatarId) && (draft.petId === null || sceneState.owned.petIds.includes(draft.petId)) && (draft.wingId === null || sceneState.owned.wingIds.includes(draft.wingId)));

  function post(message: SceneMessage) { if (embedded && hostOrigin) window.parent.postMessage(message, hostOrigin); }
  function resetDraft() { draft = { avatarId: sceneState.appearance.avatarId, petId: sceneState.appearance.petId, wingId: sceneState.appearance.wingId }; dirty = false; }
  function navigate(route: string) {
    if (embedded) post(packet('NAVIGATE', { route }));
    else if (route === 'avatar' || route === 'world') mode = route === 'avatar' ? 'wardrobe' : 'town';
    else {
      const fallback = import.meta.env.DEV ? `${location.protocol}//${location.hostname}:5173/maque-center/` : '../masque-center/';
      const target = new URL(import.meta.env.VITE_GAME_CENTER_URL || fallback, document.baseURI);
      target.hash = route;
      location.assign(target.href);
    }
  }
  function arrived(id: string, destination: string, cancelled: boolean) {
    if (walkRequest?.id !== id) return;
    walkRequest = undefined;
    post(packet('ARRIVED', { destination, cancelled }, id));
  }
  function cancelWalk() { if (walkRequest) arrived(walkRequest.id, walkRequest.destination, true); }
  function requestOutfit(outfit: Outfit) {
    if (pending) return;
    if (embedded) {
      const message = packet('EQUIP_REQUEST', { avatarId: outfit.avatarId, petId: outfit.petId, wingId: outfit.wingId });
      pending = message.id;
      post(message);
    } else {
      if (!sceneState.owned.avatarIds.includes(outfit.avatarId) || outfit.petId !== null && !sceneState.owned.petIds.includes(outfit.petId) || outfit.wingId !== null && !sceneState.owned.wingIds.includes(outfit.wingId)) return;
      sceneState = { ...sceneState, appearance: { ...sceneState.appearance, ...outfit } };
      dirty = false;
      notice = 'บันทึกลุคสำหรับรอบนี้แล้ว';
    }
  }
  function pick(id: string | null) {
    if (pending) return;
    if (tab === 'avatar' && id) draft.avatarId = id;
    else if (tab === 'pet') draft.petId = id;
    else if (tab === 'wing') draft.wingId = id;
    dirty = true;
    notice = '';
  }
  onMount(() => {
    let readyTimer: ReturnType<typeof setInterval> | undefined;
    const seen = new Set<string>();
    if (embedded) {
      const allowed = [location.origin, 'http://localhost:5173', 'http://127.0.0.1:5173', ...(import.meta.env.VITE_ALLOWED_PARENT_ORIGINS || '').split(',').map((value: string) => value.trim()).filter(Boolean)];
      const requested = query.get('parentOrigin');
      if (!requested || !allowed.includes(requested)) { error = 'ไม่อนุญาตให้เปิดจากเว็บไซต์นี้'; return; }
      hostOrigin = requested;
    }
    function receive(event: MessageEvent) {
      if (!trustedSender(event, hostOrigin, window.parent) || !isHostMessage(event.data)) return;
      const message = event.data;
      if (seen.has(message.id)) { post(packet('ACK', {}, message.id)); return; }
      seen.add(message.id);
      if (seen.size > 256) seen.delete(seen.values().next().value!);
      switch (message.type) {
        case 'INIT': sceneState = message.payload.state; mode = message.payload.mode; initialized = true; resetDraft(); clearInterval(readyTimer); break;
        case 'STATE': sceneState = message.payload.state; break;
        case 'MODE': if (message.payload.mode !== mode) { cancelWalk(); dirty = false; mode = message.payload.mode; } break;
        case 'ACTIVE': active = message.payload.active; break;
        case 'WALK_TO':
          cancelWalk();
          if (mode !== 'town' || !sceneState.enabled) { post(packet('ERROR', { message: 'เปิดเมืองก่อนเดินทาง' }, message.id)); break; }
          walkRequest = { id: message.id, destination: message.payload.destination };
          break;
        case 'EQUIP_RESULT':
          if (message.id === pending) { sceneState = message.payload.state; pending = ''; notice = message.payload.message; if (message.payload.ok) { dirty = false; resetDraft(); } }
          break;
      }
      post(packet('ACK', {}, message.id));
    }
    window.addEventListener('message', receive);
    if (embedded) { post(packet('READY', {})); readyTimer = setInterval(() => post(packet('READY', {})), 500); }
    return () => { clearInterval(readyTimer); window.removeEventListener('message', receive); };
  });
  $effect(() => { if (!dirty) { const look = sceneState.appearance; draft = { avatarId: look.avatarId, petId: look.petId, wingId: look.wingId }; } });
  $effect(() => {
    if (mode === 'town' && initialized && !TownScene) void import('./lib/MasqueVease.svelte').then((module) => { TownScene = module.default; }).catch(() => { error = 'โหลดเมืองไม่สำเร็จ'; });
  });
  $effect(() => {
    const node = portraitHost;
    if (!node || !initialized) return;
    let cancelled = false;
    let local: ReturnType<typeof createPortrait> | undefined;
    portraitReady = false;
    void import('./lib/world/portraitScene').then((module) => {
      if (cancelled) return;
      local = module.createPortrait(node, untrack(() => sceneState.appearance), () => { portraitReady = true; }, (message) => { error = message; });
      portrait = local;
    }).catch(() => { error = 'โหลดตัวละครไม่สำเร็จ'; });
    return () => { cancelled = true; local?.dispose(); portrait = null; };
  });
  $effect(() => { portrait?.updateAppearance({ ...sceneState.appearance, ...(mode === 'wardrobe' ? draft : {}) }); portrait?.setActive(active); });
  $effect(() => {
    const node = contentHost;
    if (!node || mode !== 'wardrobe') return;
    const reportSize = () => post(packet('SIZE', { height: Math.max(350, Math.min(4000, Math.ceil(node.getBoundingClientRect().height))) }));
    const observer = new ResizeObserver(reportSize);
    observer.observe(node);
    reportSize();
    return () => observer.disconnect();
  });
</script>

<main class="mx-auto h-full w-full max-w-[460px] overflow-x-hidden bg-[#eaf3f7] text-[#254b61]" data-mode={mode} data-connected={initialized}>
  {#if error}
    <div class="grid min-h-48 place-content-center gap-3 p-6 text-center" role="alert"><p>{error}</p><button class="mx-auto flex min-h-11 items-center gap-2" onclick={() => location.reload()}><RotateCcw size={16} />ลองอีกครั้ง</button></div>
  {:else if !initialized}
    <div class="grid h-full place-content-center" role="status"><LoaderCircle class="animate-spin" size={24} /></div>
  {:else if mode === 'town'}
    {#if TownScene}<TownScene player={townPlayer} vipActive={sceneState.appearance.vip} {active} {walkRequest} onArrived={arrived} onNavigate={navigate} onEquipPet={(petId) => requestOutfit({ ...sceneState.appearance, petId })} onToast={(message) => { notice = message; }} />{:else}<div class="grid h-full place-content-center" role="status"><LoaderCircle class="animate-spin" size={24} /></div>{/if}
  {:else}
    <div bind:this={contentHost} class={mode === 'portrait' ? 'h-full' : ''}>
    <section class={['relative w-full overflow-hidden', mode === 'wardrobe' ? 'h-[310px]' : 'h-full']} aria-label="ตัวละครและสัตว์เลี้ยง">
      <div bind:this={portraitHost} class="absolute inset-0"></div>
      <div class="pointer-events-none absolute top-4 left-4 max-w-[calc(100%_-_32px)]"><p class="text-[10px] font-semibold text-[#70909f]">MASQUE VEASE</p><h1 class="truncate text-lg font-semibold">{sceneState.appearance.name}<span class="ml-2 text-xs font-normal">LV.{sceneState.appearance.level}</span></h1></div>
      {#if !portraitReady}<div class="absolute inset-0 grid place-content-center bg-[#eaf3f7]" role="status"><LoaderCircle class="animate-spin" size={22} /></div>{/if}
      {#if mode === 'portrait'}<div class="absolute right-4 bottom-3 left-4 flex justify-between gap-2"><button class="flex min-h-10 items-center gap-1.5 rounded-md border border-white bg-white/85 px-3 text-xs font-semibold" onclick={() => navigate('avatar')}><Shirt size={16} />แต่งตัว</button><button class="flex min-h-10 items-center gap-1.5 rounded-md border border-white bg-white/85 px-3 text-xs font-semibold" onclick={() => navigate('world')}>เข้าเมือง<ArrowUpRight size={16} /></button></div>{/if}
    </section>
    {#if mode === 'wardrobe'}
      <section class="border-t border-white bg-[#f7fafc] px-4 pt-3 pb-4" aria-label="ห้องแต่งตัว">
        <div class="flex items-center justify-between"><h2 class="text-base font-semibold">ห้องแต่งตัว</h2><button class="grid size-10 place-items-center" aria-label="ออกจากห้องแต่งตัว" title="ออก" onclick={() => navigate('home')}><X size={18} /></button></div>
        <div class="my-2 grid grid-cols-3 border-b border-[#d4e3eb]" role="tablist" aria-label="หมวดของแต่งตัว">{#each [{ id: 'avatar', label: 'ตัวละคร', icon: Shirt }, { id: 'pet', label: 'สัตว์เลี้ยง', icon: PawPrint }, { id: 'wing', label: 'ปีก', icon: Sparkles }] as item (item.id)}<button class={['flex min-h-11 items-center justify-center gap-1.5 border-b-2 text-xs', tab === item.id ? 'border-[#3d839d] font-semibold text-[#28657d]' : 'border-transparent text-[#7b949f]']} role="tab" aria-selected={tab === item.id} onclick={() => { tab = item.id as typeof tab; }}><item.icon size={15} />{item.label}</button>{/each}</div>
        <div class="grid grid-cols-3 gap-2">
          {#if tab !== 'avatar'}<button class={['grid min-h-[120px] content-center justify-items-center gap-2 rounded-md border bg-white text-xs', selected === null ? 'border-[#3d839d] ring-1 ring-[#3d839d]' : 'border-[#dbe7ed]']} aria-pressed={selected === null} onclick={() => pick(null)}><X size={24} />ไม่ใส่</button>{/if}
          {#each choices as item (item.id)}<button class={['relative grid min-w-0 content-start justify-items-center gap-1 rounded-md border bg-white p-2 text-xs', selected === item.id ? 'border-[#3d839d] ring-1 ring-[#3d839d]' : 'border-[#dbe7ed]']} aria-label={`ลอง ${item.name}`} aria-pressed={selected === item.id} onclick={() => pick(item.id)}><img class="h-20 w-full object-contain" src={item.imagePath} alt="" loading="lazy" /><span class="max-w-full break-words text-center">{item.name}</span><small class="text-[9px] text-[#7b949f]">{item.rarity}</small>{#if !owned.includes(item.id)}<Lock class="absolute top-1 right-1 text-[#7893a0]" size={12} />{:else if selected === item.id}<Check class="absolute top-1 right-1 text-[#347f9b]" size={13} />{/if}</button>{/each}
        </div>
        <div class="sticky bottom-0 mt-3 flex items-center gap-2 border-t border-[#dbe7ed] bg-[#f7fafc]/95 pt-3 pb-2"><button class="grid size-11 shrink-0 place-items-center rounded-md border border-[#dbe7ed]" aria-label="คืนชุดเดิม" title="คืนชุดเดิม" disabled={!!pending} onclick={resetDraft}><RotateCcw size={18} /></button><button class="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#337e99] px-3 text-sm font-semibold text-white disabled:bg-[#b4c9d3]" disabled={!canSave} onclick={() => requestOutfit(draft)}>{#if pending}<LoaderCircle class="animate-spin" size={17} />{:else}<Save size={17} />{/if}บันทึกชุด</button><button class="grid size-11 shrink-0 place-items-center rounded-md border border-[#dbe7ed]" aria-label="ซื้อของแต่งตัว" title="Shop" onclick={() => navigate('shop')}><ShoppingBag size={18} /></button></div>
      </section>
    {/if}
    </div>
  {/if}
  {#if notice && mode !== 'portrait'}<div class="fixed right-4 bottom-3 left-4 z-50 mx-auto flex max-w-[420px] items-center gap-2 rounded-md bg-[#254b61] px-3 py-2 text-xs text-white"><p class="flex-1 text-center" role="status">{notice}</p><button class="grid size-8 shrink-0 place-items-center" aria-label="ปิดข้อความ" title="ปิด" onclick={() => { notice = ''; }}><X size={15} /></button></div>{/if}
</main>
