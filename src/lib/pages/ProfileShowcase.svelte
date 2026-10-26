<script lang="ts">
  import { onMount } from 'svelte';
  import { Backpack, ChartNoAxesColumnIncreasing, Check, Clock3, Image, Medal, Pencil, Save, Ticket, Trophy, UserRound } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { AVATARS, PETS, PROFILE_BACKGROUNDS, WINGS } from '../data/config';
  import type { PlayerState, ProfileStyle } from '../types';

  let { player, editable = false, onSave, onAvatar, onPet, onWing }: {
    player: PlayerState;
    editable?: boolean;
    onSave: (style: ProfileStyle, frameId: string | null) => void;
    onAvatar: (id: string) => void;
    onPet: (id: string | null) => void;
    onWing: (id: string | null) => void;
  } = $props();
  let tab = $state<'stats' | 'bag' | 'badges'>('stats');
  let draft = $state<ProfileStyle>({ backgroundId: 'canal-day', bio: '', badgeIds: [] });
  let frameId = $state<string | null>(null);
  onMount(() => { draft = structuredClone($state.snapshot(player.demo.profile)); frameId = player.demo.frameId; });
  let style = $derived(editable ? draft : player.demo.profile);
  let avatar = $derived(AVATARS.find((avatar) => avatar.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((pet) => pet.id === player.petId));
  let wing = $derived(WINGS.find((wing) => wing.id === player.demo.wingId));
  let background = $derived(PROFILE_BACKGROUNDS.find((background) => background.id === style.backgroundId) ?? PROFILE_BACKGROUNDS[0]);
  let pinned = $derived(player.demo.achievements.filter((badge) => style.badgeIds.includes(badge.id)));
  let statistics = $derived(player.demo.config.games.map((game) => ({ ...game, milliseconds: player.demo.playTimeMs[game.id] ?? 0, plays: player.demo.playCounts[game.id] ?? 0 })).filter((game) => game.milliseconds > 0 || game.plays > 0).sort((left, right) => right.milliseconds - left.milliseconds || right.plays - left.plays));
  let totalTime = $derived(statistics.reduce((sum, game) => sum + game.milliseconds, 0));
  let totalPlays = $derived(statistics.reduce((sum, game) => sum + game.plays, 0));
  function toggleBadge(id: string) {
    if (draft.badgeIds.includes(id)) draft.badgeIds = draft.badgeIds.filter((entry) => entry !== id);
    else if (draft.badgeIds.length < 3) draft.badgeIds = [...draft.badgeIds, id];
  }
</script>

<div class="page-stack text-[#254b61]">
  <PageTitle eyebrow="PLAYER SPACE" title={editable ? 'แต่งโปรไฟล์' : 'My Profile'} subtitle="">
    {#snippet icon()}<UserRound size={26} />{/snippet}
  </PageTitle>
  <section class="relative isolate min-h-[330px] overflow-hidden border-y border-white" aria-label="ฉากโปรไฟล์">
    <img class="absolute inset-0 -z-20 h-full w-full object-cover" src={background.imagePath} alt={background.name} />
    <div class="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#14394b]/90 to-transparent"></div>
    <div class="relative mx-auto mt-4 h-56 w-48">
      {#if wing}<img class="absolute inset-0 h-full w-full scale-150 object-contain" src={wing.imagePath} alt={wing.name} />{/if}
      <span class="relative block h-full w-full" data-frame={editable ? frameId : player.demo.frameId}><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" loading="eager" /></span>
      {#if pet}<span class="absolute -right-5 bottom-0 h-24 w-20"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" /></span>{/if}
    </div>
    <div class="relative flex min-h-24 items-end justify-between gap-3 px-4 pb-4 text-white"><div class="min-w-0"><h2 class="break-words text-xl font-semibold">{player.displayName}</h2><p class="mt-1 text-xs">LV.{player.level} · {avatar.name}</p>{#if style.bio}<p class="mt-1 break-words text-xs">{style.bio}</p>{/if}</div>{#if !editable}<a class="grid size-10 shrink-0 place-items-center rounded-md border border-white/60 bg-white/20" href="#room" aria-label="แต่งโปรไฟล์" title="แต่งโปรไฟล์"><Pencil size={18} /></a>{/if}</div>
    {#if pinned.length}<div class="absolute top-2 left-2 flex max-w-[calc(100%_-_16px)] flex-wrap gap-1" aria-label="ป้ายที่ปักไว้">{#each pinned as badge (badge.id)}<span class="flex items-center gap-1 rounded-md border border-white bg-white/90 px-2 py-1 text-[10px] font-semibold"><Medal size={14} class="text-amber-700" />{badge.title}{#if badge.seasonId}<small>{badge.seasonId}</small>{/if}</span>{/each}</div>{/if}
  </section>

  {#if editable}
    <section class="space-y-3 border-b border-white pb-4" aria-label="ปรับแต่งโปรไฟล์">
      <h2 class="flex items-center gap-2 text-sm font-semibold"><Image size={17} />พื้นหลัง</h2>
      <div class="grid grid-cols-3 gap-2">{#each PROFILE_BACKGROUNDS as item (item.id)}<button class="min-w-0 overflow-hidden rounded-md border-2 border-white text-left" class:ring-2={draft.backgroundId === item.id} aria-pressed={draft.backgroundId === item.id} aria-label={`ใช้พื้นหลัง ${item.name}`} onclick={() => draft.backgroundId = item.id}><img class="aspect-[4/3] w-full object-cover" src={item.imagePath} alt="" /><span class="block bg-white/70 p-1 text-[10px]">{item.name}</span></button>{/each}</div>
      <label class="grid gap-1 text-xs">เกี่ยวกับฉัน<textarea class="min-h-20 w-full rounded-md border border-sky-200 bg-white/70 p-2 text-sm" maxlength="140" bind:value={draft.bio}></textarea></label>
      <label class="grid gap-1 text-xs">กรอบรูปโปรไฟล์<select class="min-h-11 rounded-md bg-white/70 px-2 text-sm" bind:value={frameId}><option value={null}>ไม่ใส่กรอบ</option>{#each player.demo.frames as frame (frame)}<option value={frame}>{frame === 'sunrise' ? 'Sunrise' : 'Ocean'}</option>{/each}</select></label>
      <div class="flex items-center justify-between text-xs"><strong>ป้ายที่ปัก {draft.badgeIds.length}/3</strong><button class="min-h-10 text-sky-700 underline" onclick={() => tab = 'badges'}>เลือกป้ายผลงาน</button></div>
      <GameButton block size="sm" onclick={() => onSave($state.snapshot(draft), frameId)}><Save size={16} />บันทึกโปรไฟล์</GameButton>
    </section>
  {/if}

  <div class="grid grid-cols-3 gap-2 border-y border-white py-3 text-center"><div><Clock3 size={16} class="mx-auto" /><strong class="mt-1 block text-lg">{(totalTime / 3_600_000).toFixed(1)}</strong><span class="text-[10px]">ชั่วโมง</span></div><div><ChartNoAxesColumnIncreasing size={16} class="mx-auto" /><strong class="mt-1 block text-lg">{totalPlays}</strong><span class="text-[10px]">เกมที่จบ</span></div><div><Medal size={16} class="mx-auto" /><strong class="mt-1 block text-lg">{player.demo.achievements.length}</strong><span class="text-[10px]">ผลงาน</span></div></div>
  <div class="grid grid-cols-3 border-b border-white" role="tablist" aria-label="ข้อมูลโปรไฟล์">{#each [{ id: 'stats', label: 'สถิติ', icon: ChartNoAxesColumnIncreasing }, { id: 'bag', label: 'กระเป๋า', icon: Backpack }, { id: 'badges', label: 'ผลงาน', icon: Trophy }] as item (item.id)}<button class="flex min-h-11 items-center justify-center gap-1 text-xs font-semibold" role="tab" aria-selected={tab === item.id} class:bg-white={tab === item.id} onclick={() => tab = item.id as typeof tab}><item.icon size={16} />{item.label}</button>{/each}</div>

  {#if tab === 'stats'}
    <section class="space-y-3" aria-label="สถิติการเล่น">
      <h2 class="text-sm font-semibold">เกมที่เล่นบ่อย</h2>
      {#if !statistics.length}<p class="py-6 text-center text-xs text-[#668798]">ยังไม่มีประวัติการเล่น</p>{/if}
      {#each statistics as game (game.id)}<a class="flex items-center gap-3 border-b border-white py-3" href={`#detail/${game.id}`}>{#if game.cover}<img class="h-12 w-16 rounded-md bg-white object-contain" src={`images/${game.cover}`} alt="" />{/if}<span class="min-w-0 flex-1"><strong class="block text-sm">{game.name}</strong><small class="text-xs text-[#668798]">จบ {game.plays} ครั้ง</small></span><strong class="shrink-0 text-xs">{(game.milliseconds / 3_600_000).toFixed(1)} ชม.</strong></a>{/each}
      <h2 class="pt-3 text-sm font-semibold">Season Honors</h2>
      {#each player.demo.achievements.filter((badge) => badge.seasonId) as badge (badge.id)}<div class="flex items-center gap-2 border-b border-white py-3"><Trophy size={21} class="shrink-0 text-amber-600" /><div><strong class="text-sm">{badge.title} · {badge.seasonId}</strong><p class="text-xs text-[#668798]">{player.demo.config.games.find((game) => game.id === badge.gameId)?.name}</p></div></div>{:else}<p class="text-xs text-[#668798]">ยังไม่มีรางวัล Top Season</p>{/each}
    </section>
  {:else if tab === 'bag'}
    <section class="space-y-4" aria-label="กระเป๋าของฉัน">
      <div class="grid grid-cols-2 gap-2"><a href="#battle" class="flex items-center gap-2 rounded-lg border border-white bg-white/60 p-3"><Ticket size={24} class="shrink-0 text-rose-600" /><span class="text-xs">บัตรเข้า Ranked<strong class="block text-lg">{player.demo.arenaTickets}</strong></span></a><a href="#avatar" class="flex items-center gap-2 rounded-lg border border-white bg-white/60 p-3"><Ticket size={24} class="shrink-0 text-sky-600" /><span class="text-xs">ตั๋วกาชา Pet<strong class="block text-lg">{player.gachaTickets}</strong></span></a></div>
      <h2 class="text-sm font-semibold">Avatar · {player.ownedAvatarIds.length}</h2>
      <div class="grid grid-cols-3 gap-2">{#each AVATARS.filter((item) => player.ownedAvatarIds.includes(item.id)) as item (item.id)}<button class="grid min-w-0 justify-items-center gap-1 rounded-lg border border-white bg-white/50 p-2 text-[10px]" aria-label={`ใช้ตัวละคร ${item.name}`} aria-pressed={player.avatarId === item.id} onclick={() => onAvatar(item.id)}><span class="h-24 w-full"><AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="avatar" /></span>{item.name}{#if player.avatarId === item.id}<Check size={14} />{/if}</button>{/each}</div>
      <h2 class="text-sm font-semibold">Pets · {player.ownedPetIds.length}</h2>
      <div class="grid grid-cols-3 gap-2">{#each PETS.filter((item) => player.ownedPetIds.includes(item.id)) as item (item.id)}<button class="grid min-w-0 justify-items-center gap-1 rounded-lg border border-white bg-white/50 p-2 text-[10px]" aria-label={`ใช้สัตว์เลี้ยง ${item.name}`} aria-pressed={player.petId === item.id} onclick={() => onPet(player.petId === item.id ? null : item.id)}><span class="h-20 w-full"><AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="pet" /></span>{item.name}{#if player.petId === item.id}<Check size={14} />{/if}</button>{/each}</div>
      <h2 class="text-sm font-semibold">Wings · {player.demo.wings.length}</h2>
      <div class="grid grid-cols-2 gap-2">{#each WINGS.filter((item) => player.demo.wings.includes(item.id)) as item (item.id)}<button class="grid justify-items-center gap-1 rounded-lg border border-white bg-white/50 p-2 text-xs" aria-label={`ใส่ปีก ${item.name}`} aria-pressed={player.demo.wingId === item.id} onclick={() => onWing(player.demo.wingId === item.id ? null : item.id)}><img class="h-24 w-full object-contain" src={item.imagePath} alt="" />{item.name}{#if player.demo.wingId === item.id}<Check size={14} />{/if}</button>{:else}<a class="min-h-10 text-xs text-sky-700 underline" href="#shop">เลือกปีกใน Shop</a>{/each}</div>
      <h2 class="text-sm font-semibold">กรอบรูปโปรไฟล์ · {player.demo.frames.length}</h2><div class="flex flex-wrap gap-2">{#each player.demo.frames as frame (frame)}<a class="min-h-10 rounded-md border border-white bg-white/50 px-3 py-2 text-xs capitalize" href="#room">{frame}</a>{:else}<a class="text-xs text-sky-700 underline" href="#shop">เลือกกรอบรูปใน Shop</a>{/each}</div>
    </section>
  {:else}
    <section class="space-y-2" aria-label="ป้ายผลงาน">
      {#each player.demo.achievements as badge (badge.id)}<div class="flex items-center gap-3 border-b border-white py-3"><Medal size={25} class="shrink-0 text-amber-600" /><div class="min-w-0 flex-1"><strong class="block text-sm">{badge.title}</strong><small class="block text-xs text-[#668798]">{badge.seasonId ?? player.demo.config.games.find((game) => game.id === badge.gameId)?.name ?? 'Achievement'} · {new Date(badge.earnedAt).toLocaleDateString('th-TH')}</small></div>{#if editable}<input type="checkbox" class="size-5 shrink-0 accent-sky-600" aria-label={`ปัก ${badge.title}`} checked={draft.badgeIds.includes(badge.id)} disabled={!draft.badgeIds.includes(badge.id) && draft.badgeIds.length >= 3} onchange={() => toggleBadge(badge.id)} />{/if}</div>{:else}<p class="py-6 text-center text-xs text-[#668798]">เล่นจบครั้งแรกเพื่อรับป้าย First Finish</p>{/each}
      {#if !editable}<a class="inline-flex min-h-10 items-center gap-1 text-xs text-sky-700 underline" href="#room"><Pencil size={14} />เลือกป้ายที่ปักบนโปรไฟล์</a>{/if}
    </section>
  {/if}
</div>