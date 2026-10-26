<script lang="ts">
  import { onMount } from 'svelte';
  import { Armchair, Check, Copy, Flower2, Home, LampFloor, Music2, Plus, Save, Trash2, UserPlus } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { AVATARS, PETS } from '../data/config';
  import { isVip } from '../services/energyService';
  import { demoNow } from '../services/demoService';
  import type { DemoState, PlayerState } from '../types';
  type Room = NonNullable<DemoState['room']>;
  let { player, inviteCode = '', onSave, onStart, onToast, onBuyDecor }: { player: PlayerState; inviteCode?: string; onSave: (room: Room) => void; onStart: (room: Room) => void; onToast: (message: string) => void; onBuyDecor: (kind: string) => void } = $props();
  let draft = $state<Room | null>(null);
  let selected = $state<string | null>(null);
  let dirty = $state(false);
  let joinCode = $state('');
  const decor = [{ kind: 'sofa', label: 'Sofa', icon: Armchair }, { kind: 'plant', label: 'Plant', icon: Flower2 }, { kind: 'lamp', label: 'Lamp', icon: LampFloor }, { kind: 'music', label: 'Music', icon: Music2 }];
  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let mayCreate = $derived(!player.demo.config.roomVipOnly || isVip(player, demoNow(player)));
  onMount(() => { if (player.demo.room) draft = structuredClone($state.snapshot(player.demo.room)); joinCode = inviteCode; });
  function create() { draft = { code: crypto.randomUUID().slice(0, 6).toUpperCase(), name: `${player.displayName}'s Room`, theme: 'water', private: player.demo.config.roomPrivate, guests: [], gameId: 'bird', furniture: [], savedAt: 0 }; dirty = true; }
  function add(kind: string) { if (!draft) return; const cell = Array.from({ length: 48 }, (_, index) => index).find((index) => !draft!.furniture.some((item) => item.x === index % 8 && item.y === Math.floor(index / 8)) && index !== 36 && index !== 37); if (cell === undefined) { onToast('พื้นที่เต็มแล้ว'); return; } const id = crypto.randomUUID(); draft.furniture = [...draft.furniture, { id, kind, x: cell % 8, y: Math.floor(cell / 8) }]; selected = id; dirty = true; }
  function place(index: number) { if (!draft) return; const item = draft.furniture.find((item) => item.x === index % 8 && item.y === Math.floor(index / 8)); if (item) selected = item.id; else if (selected && index !== 36 && index !== 37) { draft.furniture = draft.furniture.map((item) => item.id === selected ? { ...item, x: index % 8, y: Math.floor(index / 8) } : item); dirty = true; } }
  function save(): boolean { if (!draft || !draft.name.trim()) { onToast('กรุณาตั้งชื่อห้อง'); return false; } onSave({ ...structuredClone($state.snapshot(draft)), savedAt: demoNow(player) }); dirty = false; return true; }
  async function copy() { if (!draft) return; try { await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#room?code=${draft.code}`); onToast('คัดลอกคำเชิญจำลองแล้ว'); } catch { onToast(`รหัสห้อง: ${draft.code}`); } }
  function join() { if (!/^[A-Z0-9]{6}$/i.test(joinCode.trim())) { onToast('กรุณาใส่รหัส 6 ตัว'); return; } draft = { code: joinCode.trim().toUpperCase(), name: 'Friends Hangout · MOCK', theme: 'lantern', private: true, guests: player.demo.config.roomLimit > 1 ? ['Luna · MOCK'] : [], gameId: 'bird', furniture: [{ id: crypto.randomUUID(), kind: 'sofa', x: 2, y: 2 }], savedAt: 0 }; dirty = true; onToast('เข้าห้องจำลองแล้ว · ไม่ใช่การเชื่อมต่อข้ามเครื่อง'); }
</script>

<div class="page-stack">
  <PageTitle eyebrow="YOUR LITTLE CORNER" title="My Room" subtitle="แต่งห้องและชวนเพื่อนจำลอง">{#snippet icon()}<Home size={26} />{/snippet}</PageTitle>
  {#if !draft}<section class="grid justify-items-center gap-4 border-y border-white py-8"><div class="h-40 w-28"><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" /></div><h2 class="text-xl font-bold">พื้นที่ในแบบของคุณ</h2><GameButton disabled={!mayCreate} onclick={create}><Plus size={17} />{mayCreate ? 'สร้างห้องของฉัน' : 'สร้างห้องสำหรับ VIP'}</GameButton></section>
  {:else}
    <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold">{dirty ? 'ยังไม่ได้บันทึก' : 'บันทึกแล้ว'} · DEMO</span><button class="flex min-h-10 items-center gap-1 text-xs" onclick={copy}><Copy size={14} />{draft.code}</button></div>
    <label class="grid gap-1 text-xs">ชื่อห้อง<input class="min-h-11 min-w-0 rounded-lg border border-white bg-white/60 px-3 text-sm" maxlength="40" bind:value={draft.name} oninput={() => dirty = true} /></label>
    <div class="grid grid-cols-2 gap-2"><label class="grid gap-1 text-xs">บรรยากาศ<select class="min-h-11 min-w-0 rounded-lg bg-white/60 px-3" bind:value={draft.theme} onchange={() => dirty = true}><option value="water">Water Lounge</option><option value="lantern">Lantern Lounge</option></select></label><label class="flex items-center gap-2 text-xs"><input type="checkbox" bind:checked={draft.private} onchange={() => dirty = true} />ห้องส่วนตัว</label></div>
    <section class="relative isolate grid aspect-[4/3] grid-cols-8 grid-rows-6 overflow-hidden rounded-lg border-2 border-white shadow-sm" class:bg-sky-100={draft.theme === 'water'} class:bg-rose-100={draft.theme === 'lantern'} aria-label="กริดแต่งห้อง">
      {#each Array.from({ length: 48 }, (_, index) => index) as index (index)}
        {@const item = draft.furniture.find((item) => item.x === index % 8 && item.y === Math.floor(index / 8))}
        {@const art = decor.find((entry) => entry.kind === item?.kind)}
        <button class="grid min-h-0 min-w-0 place-items-center border border-white/45 text-sky-800 hover:bg-white/50" class:bg-white={!!item && selected === item.id} aria-label={`${item ? art?.label : 'วางของ'} ${index % 8 + 1},${Math.floor(index / 8) + 1}`} onclick={() => place(index)}>{#if art}<art.icon size={28} strokeWidth={1.6} />{/if}</button>
      {/each}
      <span class="pointer-events-none absolute bottom-[16%] left-[43%] h-[42%] w-[18%]" data-frame={player.demo.frameId}><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" /></span>
      {#if pet}<span class="pointer-events-none absolute right-[24%] bottom-[16%] h-[22%] w-[13%]"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" /></span>{/if}
    </section>
    <div class="flex items-center gap-2" aria-label="เฟอร์นิเจอร์">{#each decor as item (item.kind)}{@const owned = player.demo.ownedDecor.includes(item.kind)}<button class="grid min-h-16 min-w-0 flex-1 justify-items-center gap-1 rounded-md border border-white bg-white/50 py-2 text-[10px]" title={owned ? `เพิ่ม ${item.label}` : `ซื้อ ${item.label}`} onclick={() => owned ? add(item.kind) : onBuyDecor(item.kind)}><item.icon size={20} />{item.label}{#if !owned}<small>{player.demo.config.decorPrice} MP</small>{/if}</button>{/each}<button class="grid size-12 shrink-0 place-items-center rounded-md text-rose-600 disabled:opacity-30" title="ลบของที่เลือก" aria-label="ลบของที่เลือก" disabled={!selected} onclick={() => { if (draft) draft.furniture = draft.furniture.filter((item) => item.id !== selected); selected = null; dirty = true; }}><Trash2 size={19} /></button></div>
    <GameButton block onclick={save}><Save size={17} />บันทึกห้อง</GameButton>
    <div class="space-y-3 border-y border-white py-4"><div class="flex items-center justify-between"><h2 class="text-sm font-bold">Party · {draft.guests.length + 1}/{player.demo.config.roomLimit}</h2><button class="flex min-h-10 items-center gap-1 text-xs disabled:opacity-40" disabled={draft.guests.length + 1 >= player.demo.config.roomLimit} onclick={() => { if (draft) draft.guests = [...draft.guests, `Guest ${draft.guests.length + 1} · MOCK`]; dirty = true; }}><UserPlus size={16} />เพิ่ม Guest จำลอง</button></div><div class="flex flex-wrap gap-2 text-xs"><span class="rounded-md bg-white/70 px-2 py-1">{player.displayName} · YOU</span>{#each draft.guests as guest (guest)}<span class="rounded-md bg-white/50 px-2 py-1">{guest}</span>{/each}</div></div>
    <label class="grid gap-1 text-xs">เลือกเกม<select class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" bind:value={draft.gameId} onchange={() => dirty = true}>{#each player.demo.config.games as game (game.id)}<option value={game.id}>{game.name}</option>{/each}</select></label><GameButton block variant="gold" onclick={() => { if (draft && save()) onStart(draft); }}><Check size={17} />บันทึกและไปเล่นเกม</GameButton>
  {/if}
  <section class="space-y-3 border-t border-white pt-4"><label class="grid gap-1 text-xs">คำเชิญจำลอง<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3 uppercase" maxlength="6" placeholder="รหัส 6 ตัว" bind:value={joinCode} /></label><GameButton block size="sm" variant="ghost" onclick={join}>เข้าห้องด้วยรหัส</GameButton><p class="text-xs text-[var(--g-muted)]">DEMO · Guest และคำเชิญไม่ใช่ Multiplayer จริง</p></section>
</div>