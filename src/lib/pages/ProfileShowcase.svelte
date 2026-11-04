<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Award,
    Backpack,
    ChartNoAxesColumnIncreasing,
    Check,
    Clock3,
    Frame,
    Heart,
    Image,
    Lock,
    Mail,
    Medal,
    Pencil,
    Save,
    Sparkles,
    Trophy,
    UserRound,
    X,
  } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import AvatarFrame from '../components/AvatarFrame.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import ProfileRoom3D from '../components/ProfileRoom3D.svelte';
  import { AVATARS, PETS, PROFILE_BACKGROUNDS, PROFILE_FRAMES, WINGS } from '../data/config';
  import type { PlayerState, ProfileStyle } from '../types';

  let { player, editable = false, vipActive = false, onSave, onAvatar, onPet, onWing }: {
    player: PlayerState;
    editable?: boolean;
    vipActive?: boolean;
    onSave: (style: ProfileStyle, frameId: string | null) => void;
    onAvatar: (id: string) => void;
    onPet: (id: string | null) => void;
    onWing: (id: string | null) => void;
  } = $props();

  type CustomizerSheet = 'avatar' | 'pet' | 'frame' | 'badge' | null;

  let tab = $state<'stats' | 'bag' | 'badges'>('stats');
  let activeSheet = $state<CustomizerSheet>(null);
  let draft = $state<ProfileStyle>({ backgroundId: 'canal-day', bio: '', badgeIds: [] });
  let frameId = $state<string | null>(null);
  let previewFrameId = $state<string | null>(null);
  let previewAvatarId = $state<string | null>(null);
  let previewPetId = $state<string | null | undefined>(undefined);

  onMount(() => {
    draft = structuredClone($state.snapshot(player.demo.profile));
    frameId = player.demo.frameId;
    previewFrameId = player.demo.frameId;
  });

  let style = $derived(editable ? draft : player.demo.profile);
  let activeFrameId = $derived(previewFrameId ?? frameId ?? player.demo.frameId);
  let activeFrameMeta = $derived(activeFrameId ? PROFILE_FRAMES.find((item) => item.id === activeFrameId) ?? null : null);
  let activeAvatarId = $derived(previewAvatarId ?? player.avatarId);
  let avatar = $derived(AVATARS.find((item) => item.id === activeAvatarId) ?? AVATARS[0]);
  let activePetId = $derived(previewPetId !== undefined ? previewPetId : player.petId);
  let pet = $derived(PETS.find((item) => item.id === activePetId));
  let wing = $derived(WINGS.find((item) => item.id === player.demo.wingId));
  let background = $derived(PROFILE_BACKGROUNDS.find((item) => item.id === style.backgroundId) ?? PROFILE_BACKGROUNDS[0]);
  let pinned = $derived(player.demo.achievements.filter((badge) => style.badgeIds.includes(badge.id)));
  let statistics = $derived(
    player.demo.config.games
      .map((game) => ({ ...game, milliseconds: player.demo.playTimeMs[game.id] ?? 0, plays: player.demo.playCounts[game.id] ?? 0 }))
      .filter((game) => game.milliseconds > 0 || game.plays > 0)
      .sort((left, right) => right.milliseconds - left.milliseconds || right.plays - left.plays)
  );
  let totalTime = $derived(statistics.reduce((sum, game) => sum + game.milliseconds, 0));
  let totalPlays = $derived(statistics.reduce((sum, game) => sum + game.plays, 0));

  function openSheet(kind: Exclude<CustomizerSheet, null>) {
    if (activeSheet === kind) {
      closeSheet();
      return;
    }
    previewAvatarId = null;
    previewPetId = undefined;
    previewFrameId = frameId;
    activeSheet = kind;
  }

  function closeSheet() {
    previewAvatarId = null;
    previewPetId = undefined;
    previewFrameId = frameId;
    activeSheet = null;
  }

  function toggleBadge(id: string) {
    if (draft.badgeIds.includes(id)) draft.badgeIds = draft.badgeIds.filter((entry) => entry !== id);
    else if (draft.badgeIds.length < 3) draft.badgeIds = [...draft.badgeIds, id];
    onSave($state.snapshot(draft), frameId);
  }

  function selectFrameOption(id: string | null, owned: boolean) {
    previewFrameId = id;
    if (id === null || owned) {
      frameId = id;
      onSave($state.snapshot(draft), frameId);
    }
  }

  function selectBackgroundOption(id: string, owned: boolean) {
    if (!owned) return;
    draft.backgroundId = id;
    onSave($state.snapshot(draft), frameId);
  }

  function handleAvatarPick(id: string, owned: boolean) {
    previewAvatarId = id;
    if (owned) {
      onAvatar(id);
    }
  }

  function handlePetPick(id: string | null, owned: boolean) {
    previewPetId = id;
    if (owned) {
      onPet(id);
    }
  }

  const floatingTools: Array<{
    id: Exclude<CustomizerSheet, null>;
    label: string;
    ariaLabel: string;
    icon: typeof UserRound;
  }> = [
    { id: 'avatar', label: 'ตัวละคร', ariaLabel: 'ปรับแต่งตัวละคร Avatar', icon: UserRound },
    { id: 'pet', label: 'คู่หู', ariaLabel: 'ปรับแต่งสัตว์เลี้ยงคู่หู Pet', icon: Heart },
    { id: 'frame', label: 'กรอบรูป', ariaLabel: 'ปรับแต่งกรอบรูปโปรไฟล์', icon: Frame },
    { id: 'badge', label: 'ตรา/ฉาก', ariaLabel: 'ปรับแต่งเหรียญตราและของตกแต่งห้อง', icon: Award },
  ];
</script>

<div class="page-stack pb-8 text-[#1f305e]">
  <PageTitle
    eyebrow="PLAYER PROFILE"
    title={editable ? 'โปรไฟล์ของฉัน' : 'คลังไอเทม & โปรไฟล์'}
    subtitle="แต่งตัวละคร กรอบรูปสะสม และเหรียญตราเกียรติยศ"
  >
    {#snippet icon()}<UserRound size={26} />{/snippet}
  </PageTitle>

  <!-- 1. 3D Room Showcase + Floating Customization Toolbar + Framed Avatar Identity Card -->
  <section
    class="relative isolate min-h-[405px] overflow-hidden rounded-[26px] border-2.5 border-white shadow-[0_7px_0_#99c9ed,0_14px_26px_rgba(20,60,120,0.18)]"
    aria-label="ฉากโปรไฟล์"
  >
    <div class="absolute inset-0 h-full w-full">
      <ProfileRoom3D {avatar} {pet} {wing} {background} frameId={activeFrameId} {vipActive} />
    </div>
    <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-[#0f2942]/95 via-[#0f2942]/55 to-transparent"></div>

    <!-- Pinned Badges Top-Left -->
    {#if pinned.length}
      <div class="absolute top-3 left-3 right-3 z-20 flex flex-wrap gap-1.5" aria-label="ป้ายที่ปักไว้">
        {#each pinned as badge (badge.id)}
          <span class="flex items-center gap-1 rounded-full border border-white bg-white/92 px-2.5 py-1 text-[10px] font-black text-[#1f305e] shadow-sm">
            <RewardIcon type="badge" itemId={badge.id} size={18} />
            <span class="truncate max-w-[130px]">{badge.title}</span>
          </span>
        {/each}
      </div>
    {/if}

    <!-- Floating Customization Toolbar (Left Vertical Dock inside 3D Room) -->
    <nav
      class="room-toolbar absolute left-2.5 top-1/2 z-20 -translate-y-1/2 flex flex-col gap-1.5"
      aria-label="แถบเครื่องมือแต่งโปรไฟล์"
    >
      {#each floatingTools as tool (tool.id)}
        {@const isSelected = activeSheet === tool.id}
        <button
          type="button"
          class="toolbar-btn"
          class:active={isSelected}
          aria-label={tool.ariaLabel}
          aria-pressed={isSelected}
          onclick={() => openSheet(tool.id)}
        >
          <span class="toolbar-icon-ring">
            <tool.icon size={16} />
          </span>
          <span class="toolbar-label">{tool.label}</span>
        </button>
      {/each}
    </nav>

    <!-- Player Identity Overlay with Framed Avatar -->
    <div class=" absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2.5 px-3.5 pb-3.5 text-white">
      <div class="flex min-w-0 items-center gap-2.5">
        <AvatarFrame avatarId={avatar.id} frameId={activeFrameId} size="lg" level={player.level} />
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <h2 class="truncate text-lg font-black drop-shadow-sm">{player.displayName}</h2>
            {#if activeFrameMeta}
              <span class="rounded-full border border-white/70 bg-white/20 px-2 py-0.5 text-[9.5px] font-black text-[#ffe68a] backdrop-blur-xs">
                {activeFrameMeta.name} · {activeFrameMeta.rarity}
              </span>
            {/if}
          </div>
          <p class="mt-0.5 text-xs font-bold text-sky-100">
            LV.{player.level} · {avatar.name}{pet ? ` & ${pet.name}` : ''}
          </p>
          {#if style.bio}
            <p class="mt-1 line-clamp-2 break-words text-[11px] font-semibold text-white/90">“{style.bio}”</p>
          {/if}
        </div>
      </div>
      {#if !editable}
        <a
          class="grid size-10 shrink-0 place-items-center rounded-xl border border-white/70 bg-white/20 text-white backdrop-blur-xs"
          href="#profile"
          aria-label="แต่งโปรไฟล์"
          title="แต่งโปรไฟล์"
        >
          <Pencil size={18} />
        </a>
      {/if}
    </div>
  </section>

  <!-- 2. Mobile-Friendly Customization Sheet (Opens when tapping Floating Toolbar) -->
  {#if activeSheet}
    <div
      class="fixed inset-0 z-50 flex items-end justify-center bg-[#09152b]/55 p-2.5 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="หน้าต่างปรับแต่งโปรไฟล์"
      tabindex="-1"
      onclick={(event) => event.currentTarget === event.target && closeSheet()}
      onkeydown={(event) => event.key === 'Escape' && closeSheet()}
    >
      <section class="sheet-card max-h-[82vh] w-full max-w-[420px] overflow-y-auto rounded-[28px] border-3 border-white bg-gradient-to-b from-[#ffffff] to-[#e9f5ff] p-4 text-[#1f305e] shadow-[0_14px_34px_rgba(9,21,43,0.45)]">
        <!-- Sheet Header & Category Switcher -->
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-sky-100">
          <div class="flex items-center gap-1.5 overflow-x-auto">
            {#each floatingTools as tool (tool.id)}
              <button
                type="button"
                class={['flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-black transition-all', activeSheet === tool.id ? 'bg-[#0284c7] text-white shadow-xs' : 'bg-white text-[#365a8a] border border-sky-100']}
                onclick={() => (activeSheet = tool.id)}
              >
                <tool.icon size={13} />
                <span>{tool.label}</span>
              </button>
            {/each}
          </div>
          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-full border border-sky-200 bg-white text-[#1f305e]"
            aria-label="ปิดหน้าต่างปรับแต่ง"
            onclick={closeSheet}
          >
            <X size={16} />
          </button>
        </div>

        <!-- Mini Live Preview Strip inside Sheet -->
        <div class="mt-3 flex items-center justify-between gap-2.5 rounded-2xl border border-white bg-[#dff1ff]/80 px-3 py-2">
          <div class="flex min-w-0 items-center gap-2.5">
            <AvatarFrame avatarId={avatar.id} frameId={activeFrameId} size="md" level={player.level} />
            <div class="min-w-0">
              <strong class="block truncate text-xs font-black text-[#1f305e]">{avatar.name}{pet ? ` · ${pet.name}` : ''}</strong>
              <span class="block truncate text-[10.5px] font-bold text-[#526c9c]">
                กรอบ: {activeFrameMeta ? `${activeFrameMeta.name} (${activeFrameMeta.rarity})` : 'กรอบมาตรฐาน'}
              </span>
            </div>
          </div>
          <a href="#shop" onclick={closeSheet} class="shrink-0 rounded-full bg-[#fff3c4] px-2.5 py-1 text-[10px] font-black text-[#8a5200]">
            ไปที่ Shop
          </a>
        </div>

        <!-- TAB 1: AVATAR SELECTION -->
        {#if activeSheet === 'avatar'}
          <div class="mt-3 space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-black text-[#1f305e]">เลือกตัวละคร ({player.ownedAvatarIds.length}/{AVATARS.length})</h3>
              <span class="text-[10.5px] font-bold text-[#526c9c]">แตะเพื่อสวมใส่หรือพรีวิว</span>
            </div>

            <div class="grid grid-cols-3 gap-2">
              {#each AVATARS as item (item.id)}
                {@const owned = player.ownedAvatarIds.includes(item.id)}
                {@const isEquipped = player.avatarId === item.id}
                {@const isPreviewing = activeAvatarId === item.id}
                <button
                  type="button"
                  class="frame-card"
                  class:equipped={isEquipped}
                  class:previewing={isPreviewing}
                  onclick={() => handleAvatarPick(item.id, owned)}
                  aria-label={`ตัวละคร ${item.name}`}
                >
                  <span class="h-18 w-full">
                    <AssetPortrait src={item.imagePath} alt={item.name} placeholder={item.placeholder} kind="avatar" />
                  </span>
                  <strong class="mt-1 block w-full truncate text-[11px] font-black text-[#1f305e]">{item.name}</strong>
                  <small class="block w-full truncate text-[9px] font-bold text-[#526c9c]">{item.rarity}</small>
                  {#if owned}
                    <span class="frame-state-pill owned">{isEquipped ? '✓ ใช้อยู่' : 'สวมใส่'}</span>
                  {:else}
                    <span class="frame-state-pill locked"><Lock size={10} /> ล็อกอยู่</span>
                  {/if}
                </button>
              {/each}
            </div>

            {#if previewAvatarId && !player.ownedAvatarIds.includes(previewAvatarId)}
              {@const lockedAvatar = AVATARS.find((a) => a.id === previewAvatarId)}
              {#if lockedAvatar}
                <div class="flex items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-[#fffbeb] px-3 py-2 text-xs">
                  <div>
                    <strong class="font-black text-[#783f00]">พรีวิว: {lockedAvatar.name} ({lockedAvatar.rarity})</strong>
                    <p class="text-[10.5px] font-bold text-[#92400e]">แลกได้ใน Shop หรือสุ่มจาก Avatar Box</p>
                  </div>
                  <a href="#shop" onclick={closeSheet} class="btn-gold-3d shrink-0 px-3 py-1.5 text-[11px]">ไปที่ Shop</a>
                </div>
              {/if}
            {/if}
          </div>

        <!-- TAB 2: PET SELECTION -->
        {:else if activeSheet === 'pet'}
          <div class="mt-3 space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-black text-[#1f305e]">สัตว์เลี้ยงคู่หู ({player.ownedPetIds.length}/{PETS.length})</h3>
              {#if player.petId}
                <button
                  type="button"
                  class="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-black text-[#0284c7]"
                  onclick={() => handlePetPick(null, true)}
                >
                  ถอดคู่หู
                </button>
              {/if}
            </div>

            <div class="grid grid-cols-3 gap-2">
              {#each PETS as item (item.id)}
                {@const owned = player.ownedPetIds.includes(item.id)}
                {@const isEquipped = player.petId === item.id}
                {@const isPreviewing = activePetId === item.id}
                <button
                  type="button"
                  class="frame-card"
                  class:equipped={isEquipped}
                  class:previewing={isPreviewing}
                  onclick={() => handlePetPick(isEquipped ? null : item.id, owned)}
                  aria-label={`สัตว์เลี้ยง ${item.name}`}
                >
                  <span class="h-18 w-full">
                    <AssetPortrait src={item.imagePath} alt={item.name} placeholder={item.placeholder} kind="pet" />
                  </span>
                  <strong class="mt-1 block w-full truncate text-[11px] font-black text-[#1f305e]">{item.name}</strong>
                  <small class="block w-full truncate text-[9px] font-bold text-[#526c9c]">{item.rarity}</small>
                  {#if owned}
                    <span class="frame-state-pill owned">{isEquipped ? '✓ ใช้อยู่' : 'เลือกใช้'}</span>
                  {:else}
                    <span class="frame-state-pill locked"><Lock size={10} /> ล็อกอยู่</span>
                  {/if}
                </button>
              {/each}
            </div>

            {#if previewPetId && !player.ownedPetIds.includes(previewPetId)}
              {@const lockedPet = PETS.find((p) => p.id === previewPetId)}
              {#if lockedPet}
                <div class="flex items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-[#fffbeb] px-3 py-2 text-xs">
                  <div>
                    <strong class="font-black text-[#783f00]">พรีวิว: {lockedPet.name} ({lockedPet.rarity})</strong>
                    <p class="text-[10.5px] font-bold text-[#92400e]">แลกได้ใน Shop หรือสุ่มจาก Pet Box</p>
                  </div>
                  <a href="#shop" onclick={closeSheet} class="btn-gold-3d shrink-0 px-3 py-1.5 text-[11px]">ไปที่ Shop</a>
                </div>
              {/if}
            {/if}
          </div>

        <!-- TAB 3: PROFILE FRAME SELECTION -->
        {:else if activeSheet === 'frame'}
          <div class="mt-3 space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-black text-[#1f305e]">กรอบรูปสะสม (Collectible Frames)</h3>
                <p class="text-[10.5px] font-bold text-[#526c9c]">แสดงผลทั้งใน Profile, Header และกระดาน Ranking</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                class="frame-card"
                class:equipped={frameId === null}
                class:previewing={previewFrameId === null}
                onclick={() => selectFrameOption(null, true)}
              >
                <AvatarFrame avatarId={avatar.id} frameId={null} size="md" />
                <strong class="mt-1 block text-[11px] font-black text-[#1f305e]">ไม่ใส่กรอบ</strong>
                <small class="text-[9px] font-extrabold text-[#64748b]">มาตรฐาน</small>
                <span class="frame-state-pill owned">{frameId === null ? '✓ ใช้อยู่' : 'เลือกใช้'}</span>
              </button>

              {#each PROFILE_FRAMES as item (item.id)}
                {@const owned = (player.demo.frames ?? []).includes(item.id)}
                {@const isEquipped = frameId === item.id}
                {@const isPreviewing = previewFrameId === item.id}
                <button
                  type="button"
                  class="frame-card rarity-{item.rarity.toLowerCase()}"
                  class:equipped={isEquipped}
                  class:previewing={isPreviewing}
                  onclick={() => selectFrameOption(item.id, owned)}
                  aria-label={`กรอบรูป ${item.name} ระดับ ${item.rarity}`}
                >
                  <span class="rarity-chip" style="--r-color: {item.color}">{item.rarity}</span>
                  <AvatarFrame avatarId={avatar.id} frameId={item.id} size="md" />
                  <strong class="mt-1 block truncate w-full text-[11px] font-black text-[#1f305e]">{item.name}</strong>
                  <small class="block truncate w-full text-[9px] font-bold text-[#526c9c]">{item.theme}</small>
                  {#if owned}
                    <span class="frame-state-pill owned">{isEquipped ? '✓ ใช้อยู่' : 'สวมใส่ได้'}</span>
                  {:else}
                    <span class="frame-state-pill locked"><Lock size={10} /> {item.cost}</span>
                  {/if}
                </button>
              {/each}
            </div>

            {#if previewFrameId && !(player.demo.frames ?? []).includes(previewFrameId)}
              {@const previewMeta = PROFILE_FRAMES.find((f) => f.id === previewFrameId)}
              {#if previewMeta}
                <div class="flex items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-[#fffbeb] px-3 py-2 text-xs">
                  <div>
                    <strong class="font-black text-[#783f00]">กำลังพรีวิว: {previewMeta.name} ({previewMeta.rarity})</strong>
                    <p class="text-[10.5px] font-bold text-[#92400e]">แลกได้ใน {previewMeta.source} ({previewMeta.cost} AIS Point)</p>
                  </div>
                  <a href="#shop" onclick={closeSheet} class="btn-gold-3d shrink-0 px-3 py-1.5 text-[11px]">ไปที่ Shop</a>
                </div>
              {/if}
            {/if}
          </div>

        <!-- TAB 4: BADGES, WINGS, ROOM THEME & BIO -->
        {:else if activeSheet === 'badge'}
          <div class="mt-3 space-y-3.5">
            <!-- Pinned Badges -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-black text-[#1f305e]">ปักเหรียญตราบนโปรไฟล์ ({draft.badgeIds.length}/3)</h3>
                <a href="#achievements" onclick={closeSheet} class="text-[11px] font-black text-[#0284c7] underline">ดูทั้งหมด</a>
              </div>
              <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {#each player.demo.achievements as badge (badge.id)}
                  {@const isPinned = draft.badgeIds.includes(badge.id)}
                  <button
                    type="button"
                    class={['flex w-full items-center gap-2.5 rounded-2xl border-2 px-3 py-2 text-left transition-all', isPinned ? 'border-emerald-500 bg-emerald-50/70' : 'border-white bg-white/90']}
                    disabled={!isPinned && draft.badgeIds.length >= 3}
                    onclick={() => toggleBadge(badge.id)}
                  >
                    <RewardIcon type="badge" itemId={badge.id} size={30} />
                    <div class="min-w-0 flex-1">
                      <strong class="block truncate text-xs font-black text-[#1f305e]">{badge.title}</strong>
                      <small class="block truncate text-[10px] font-bold text-[#526c9c]">
                        {badge.seasonId ?? player.demo.config.games.find((game) => game.id === badge.gameId)?.name ?? 'Achievement'}
                      </small>
                    </div>
                    <span class={['rounded-full px-2 py-0.5 text-[10px] font-black', isPinned ? 'bg-emerald-600 text-white' : 'bg-sky-100 text-[#1f305e]']}>
                      {isPinned ? '✓ ปักอยู่' : 'ปักตรา'}
                    </span>
                  </button>
                {:else}
                  <p class="py-3 text-center text-xs font-bold text-[#668798]">เล่นเกมจบเพื่อปลดล็อกเหรียญตราแรกของคุณ</p>
                {/each}
              </div>
            </div>

            <!-- Wings Decoration -->
            <div class="space-y-2 border-t border-sky-100 pt-2.5">
              <h3 class="text-xs font-black text-[#1f305e]">ปีกประดับตัวละคร (Wings)</h3>
              <div class="grid grid-cols-2 gap-2">
                {#each WINGS as item (item.id)}
                  {@const owned = player.demo.wings.includes(item.id)}
                  {@const isEquipped = player.demo.wingId === item.id}
                  <button
                    type="button"
                    class="frame-card"
                    class:equipped={isEquipped}
                    disabled={!owned}
                    onclick={() => owned && onWing(isEquipped ? null : item.id)}
                  >
                    <img class="h-14 w-full object-contain" src={item.imagePath} alt={item.name} />
                    <strong class="mt-1 block truncate text-[11px] font-black text-[#1f305e]">{item.name}</strong>
                    {#if owned}
                      <span class="frame-state-pill owned">{isEquipped ? '✓ ใส่อยู่' : 'สวมใส่'}</span>
                    {:else}
                      <span class="frame-state-pill locked"><Lock size={10} /> {item.cost}</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>

            <!-- 3D Room Background Theme -->
            <div class="space-y-2 border-t border-sky-100 pt-2.5">
              <h3 class="flex items-center gap-1.5 text-xs font-black text-[#1f305e]">
                <Image size={14} class="text-[#0284c7]" /> ฉากห้อง (Room Theme)
              </h3>
              <div class="grid grid-cols-3 gap-2">
                {#each PROFILE_BACKGROUNDS as item (item.id)}
                  {@const owned = (player.demo.backgrounds ?? PROFILE_BACKGROUNDS.map((bg) => bg.id)).includes(item.id)}
                  <button
                    type="button"
                    class="overflow-hidden rounded-2xl border-2 bg-white text-left transition-transform active:translate-y-0.5 disabled:opacity-40"
                    class:border-sky-500={draft.backgroundId === item.id}
                    class:border-white={draft.backgroundId !== item.id}
                    disabled={!owned}
                    aria-pressed={draft.backgroundId === item.id}
                    aria-label={`ใช้พื้นหลัง ${item.name}`}
                    onclick={() => selectBackgroundOption(item.id, owned)}
                  >
                    <img class="aspect-[4/3] w-full object-cover" src={item.imagePath} alt="" />
                    <span class="block p-1.5 text-center text-[10px] font-black text-[#1f305e]">{item.name}</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Bio -->
            <label class="grid gap-1 border-t border-sky-100 pt-2.5 text-xs font-black text-[#1f305e]">
              ข้อความแนะนำตัว (Bio)
              <textarea
                class="min-h-16 w-full rounded-2xl border-2 border-sky-100 bg-white/90 p-2.5 text-xs font-bold text-[#1f305e]"
                placeholder="เขียนข้อความทักทายเพื่อน ๆ บนโปรไฟล์..."
                maxlength="140"
                bind:value={draft.bio}
              ></textarea>
            </label>
          </div>
        {/if}

        <div class="mt-4">
          <GameButton
            block
            size="sm"
            variant="gold"
            onclick={() => {
              onSave($state.snapshot(draft), frameId);
              closeSheet();
            }}
          >
            <Save size={15} /> บันทึกและปิดหน้าต่าง
          </GameButton>
        </div>
      </section>
    </div>
  {/if}

  <!-- 3. Quick Stats Summary -->
  <div class="grid grid-cols-3 gap-2.5 text-center">
    <div class="card-25d p-3">
      <Clock3 size={16} class="mx-auto text-[#0284c7]" />
      <strong class="mt-1 block text-lg font-black text-[#1f305e]">{(totalTime / 3_600_000).toFixed(1)}</strong>
      <span class="text-[10px] font-bold text-[#526c9c]">ชั่วโมงที่เล่น</span>
    </div>
    <div class="card-25d p-3">
      <ChartNoAxesColumnIncreasing size={16} class="mx-auto text-[#0284c7]" />
      <strong class="mt-1 block text-lg font-black text-[#1f305e]">{totalPlays}</strong>
      <span class="text-[10px] font-bold text-[#526c9c]">เกมที่เล่นจบ</span>
    </div>
    <div class="card-25d p-3">
      <Medal size={16} class="mx-auto text-amber-500" />
      <strong class="mt-1 block text-lg font-black text-[#1f305e]">{player.demo.achievements.length}</strong>
      <span class="text-[10px] font-bold text-[#526c9c]">เหรียญตรา</span>
    </div>
  </div>

  <!-- 4. Profile Bottom Tabs: Stats / Bag / Badges -->
  <div class="grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-white bg-[#dff1ff] p-1 shadow-2xs" role="tablist" aria-label="ข้อมูลโปรไฟล์">
    {#each [
      { id: 'stats', label: 'สถิติการเล่น', icon: ChartNoAxesColumnIncreasing },
      { id: 'bag', label: 'คลังไอเทม', icon: Backpack },
      { id: 'badges', label: 'เหรียญตรา', icon: Trophy },
    ] as item (item.id)}
      <button
        class={['flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black transition-all', tab === item.id ? 'bg-[#0284c7] text-white shadow-xs' : 'text-[#365a8a]']}
        role="tab"
        aria-selected={tab === item.id}
        onclick={() => (tab = item.id as typeof tab)}
      >
        <item.icon size={15} /> {item.label}
      </button>
    {/each}
  </div>

  {#if tab === 'stats'}
    <section class="card-25d space-y-3 p-3.5" aria-label="สถิติการเล่น">
      <h2 class="text-sm font-black text-[#1f305e]">เกมที่เล่นบ่อย</h2>
      {#if !statistics.length}
        <p class="py-6 text-center text-xs font-bold text-[#668798]">ยังไม่มีประวัติการเล่น</p>
      {/if}
      {#each statistics as game (game.id)}
        <a class="flex items-center gap-3 border-b border-sky-100 py-2.5" href={`#detail/${game.id}`}>
          {#if game.cover}
            <img class="h-12 w-16 rounded-xl border border-white bg-white object-cover shadow-2xs" src={`images/${game.cover}`} alt="" />
          {/if}
          <span class="min-w-0 flex-1">
            <strong class="block text-sm font-black text-[#1f305e]">{game.name}</strong>
            <small class="text-xs font-bold text-[#526c9c]">เล่นจบ {game.plays} รอบ</small>
          </span>
          <strong class="shrink-0 text-xs font-black text-[#0284c7]">{(game.milliseconds / 3_600_000).toFixed(1)} ชม.</strong>
        </a>
      {/each}

      <h2 class="pt-2 text-sm font-black text-[#1f305e]">Season Honors</h2>
      {#each player.demo.achievements.filter((badge) => badge.seasonId) as badge (badge.id)}
        <div class="flex items-center gap-2.5 border-b border-sky-100 py-2.5">
          <RewardIcon type="badge" itemId={badge.id} size={32} />
          <div>
            <strong class="text-xs font-black text-[#1f305e]">{badge.title} · {badge.seasonId}</strong>
            <p class="text-[11px] font-bold text-[#526c9c]">{player.demo.config.games.find((game) => game.id === badge.gameId)?.name ?? 'Season Achievement'}</p>
          </div>
        </div>
      {:else}
        <p class="text-xs font-bold text-[#668798]">ยังไม่มีรางวัล Top Season</p>
      {/each}
    </section>

  {:else if tab === 'bag'}
    <section class="space-y-3.5" aria-label="กระเป๋าของฉัน">
      <div class="grid grid-cols-2 gap-2">
        <div class="card-25d flex items-center gap-2.5 p-3">
          <CurrencyIcon kind="aisPoints" size={28} />
          <span class="text-xs font-bold text-[#526c9c]">
            AIS Points
            <strong class="block text-base font-black text-[#1f4d00]">{player.aisPoints.toLocaleString()}</strong>
          </span>
        </div>
        <div class="card-25d flex items-center gap-2.5 p-3">
          <CurrencyIcon kind="campaignTicket" size={26} />
          <span class="text-xs font-bold text-[#526c9c]">
            Campaign Tickets
            <strong class="block text-base font-black text-[#1f305e]">{player.demo.campaignTickets ?? 0}</strong>
          </span>
        </div>
        <div class="card-25d flex items-center gap-2.5 p-3">
          <span class="text-xs font-bold text-[#526c9c]">
            Pet / Avatar Boxes
            <strong class="block text-base font-black text-[#1f305e]">{player.demo.gachaBoxes?.pet ?? 0} / {player.demo.gachaBoxes?.avatar ?? 0}</strong>
          </span>
        </div>
        <a href="#history" class="card-25d flex items-center gap-2 p-3 text-xs font-black text-[#0284c7]">
          <Mail size={18} /> ประวัติ & แจ้งเตือน
          {#if player.demo.notifications?.some((notification) => !notification.viewed)}
            <span class="size-2.5 rounded-full bg-rose-500" aria-label="รายการใหม่"></span>
          {/if}
        </a>
      </div>

      <div class="card-25d space-y-2.5 p-3.5">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-black text-[#1f305e]">Avatar · {player.ownedAvatarIds.length}</h2>
          <button type="button" class="text-xs font-black text-[#0284c7] underline" onclick={() => openSheet('avatar')}>
            ดูทั้งหมด
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {#each AVATARS.filter((item) => player.ownedAvatarIds.includes(item.id)) as item (item.id)}
            <button
              class="grid min-w-0 justify-items-center gap-1 rounded-2xl border-2 border-white bg-white/80 p-2 text-[10.5px] font-black shadow-2xs"
              class:ring-2={player.avatarId === item.id}
              aria-label={`ใช้ตัวละคร ${item.name}`}
              aria-pressed={player.avatarId === item.id}
              onclick={() => onAvatar(item.id)}
            >
              <span class="h-20 w-full"><AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="avatar" /></span>
              <span class="truncate">{item.name}</span>
              {#if player.avatarId === item.id}<Check size={13} class="text-emerald-600" />{/if}
            </button>
          {/each}
        </div>
      </div>

      <div class="card-25d space-y-2.5 p-3.5">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-black text-[#1f305e]">Pets · {player.ownedPetIds.length}</h2>
          <button type="button" class="text-xs font-black text-[#0284c7] underline" onclick={() => openSheet('pet')}>
            ดูทั้งหมด
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {#each PETS.filter((item) => player.ownedPetIds.includes(item.id)) as item (item.id)}
            <button
              class="grid min-w-0 justify-items-center gap-1 rounded-2xl border-2 border-white bg-white/80 p-2 text-[10.5px] font-black shadow-2xs"
              class:ring-2={player.petId === item.id}
              aria-label={`ใช้สัตว์เลี้ยง ${item.name}`}
              aria-pressed={player.petId === item.id}
              onclick={() => onPet(player.petId === item.id ? null : item.id)}
            >
              <span class="h-18 w-full"><AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="pet" /></span>
              <span class="truncate">{item.name}</span>
              {#if player.petId === item.id}<Check size={13} class="text-emerald-600" />{/if}
            </button>
          {/each}
        </div>
      </div>

      <div class="card-25d space-y-2.5 p-3.5">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-black text-[#1f305e]">กรอบรูปสะสม · {(player.demo.frames ?? []).length}</h2>
          <button type="button" class="text-xs font-black text-[#0284c7] underline" onclick={() => openSheet('frame')}>
            เปลี่ยนกรอบรูป
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          {#each PROFILE_FRAMES.filter((item) => (player.demo.frames ?? []).includes(item.id)) as item (item.id)}
            <button
              type="button"
              class="frame-card"
              class:equipped={frameId === item.id}
              onclick={() => selectFrameOption(item.id, true)}
            >
              <AvatarFrame avatarId={avatar.id} frameId={item.id} size="md" />
              <strong class="mt-1 block truncate w-full text-[11px] font-black text-[#1f305e]">{item.name}</strong>
              <span class="frame-state-pill owned">{frameId === item.id ? '✓ ใช้อยู่' : 'เลือกใช้'}</span>
            </button>
          {/each}
        </div>
      </div>
    </section>

  {:else}
    <section class="card-25d space-y-2.5 p-3.5" aria-label="ป้ายผลงาน">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-black text-[#1f305e]">เหรียญตราบนโปรไฟล์ ({draft.badgeIds.length}/3)</h2>
        <a href="#achievements" class="text-xs font-black text-[#0284c7] underline">ดูความสำเร็จทั้งหมด</a>
      </div>
      {#each player.demo.achievements as badge (badge.id)}
        <div class="flex items-center gap-3 border-b border-sky-100 py-2.5">
          <RewardIcon type="badge" itemId={badge.id} size={36} />
          <div class="min-w-0 flex-1">
            <strong class="block text-xs font-black text-[#1f305e]">{badge.title}</strong>
            <small class="block text-[10.5px] font-bold text-[#526c9c]">
              {badge.seasonId ?? player.demo.config.games.find((game) => game.id === badge.gameId)?.name ?? 'Achievement'} · {new Date(badge.earnedAt).toLocaleDateString('th-TH')}
            </small>
          </div>
          <input
            type="checkbox"
            class="size-5 shrink-0 accent-sky-600"
            aria-label={`ปัก ${badge.title}`}
            checked={draft.badgeIds.includes(badge.id)}
            disabled={!draft.badgeIds.includes(badge.id) && draft.badgeIds.length >= 3}
            onchange={() => toggleBadge(badge.id)}
          />
        </div>
      {:else}
        <p class="py-6 text-center text-xs font-bold text-[#668798]">เล่นเกมจบครั้งแรกเพื่อปลดล็อกเหรียญ First Finish</p>
      {/each}
    </section>
  {/if}
</div>

<style>
  .toolbar-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 50px;
    min-height: 50px;
    padding: 4px 3px;
    border-radius: 16px;
    border: 2px solid rgba(255, 255, 255, 0.92);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 242, 254, 0.92) 100%);
    box-shadow:
      0 3px 0 rgba(125, 182, 232, 0.95),
      0 6px 14px rgba(15, 41, 66, 0.24);
    color: #1f305e;
    backdrop-filter: blur(6px);
    transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
  }

  .toolbar-btn:active {
    transform: translateY(2px);
  }

  .toolbar-btn.active {
    border-color: #fff6c2;
    background: linear-gradient(180deg, #ffe97d 0%, #ffb928 100%);
    color: #5c3100;
    box-shadow:
      0 3px 0 #c97b00,
      0 6px 14px rgba(180, 100, 0, 0.35);
  }

  .toolbar-icon-ring {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    color: #0284c7;
  }

  .toolbar-btn.active .toolbar-icon-ring {
    background: rgba(255, 255, 255, 0.85);
    color: #92400e;
  }

  .toolbar-label {
    font-size: 9.5px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.01em;
  }

  .frame-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 6px 8px;
    border-radius: 18px;
    border: 2px solid #fff;
    background: linear-gradient(180deg, #ffffff 0%, #f1f8ff 100%);
    box-shadow: 0 3px 0 #b8daf2;
    text-align: center;
    transition: transform 0.15s ease;
  }
  .frame-card:active { transform: translateY(2px); }
  .frame-card.rarity-legendary {
    background: linear-gradient(180deg, #fffdf2 0%, #ffedb0 100%);
    box-shadow: 0 3px 0 #dfb54c;
  }
  .frame-card.rarity-epic {
    background: linear-gradient(180deg, #fffaf0 0%, #ffe4b5 100%);
    box-shadow: 0 3px 0 #e0a858;
  }
  .frame-card.rarity-seasonal {
    background: linear-gradient(180deg, #fff5f7 0%, #ffe0e9 100%);
    box-shadow: 0 3px 0 #e598b0;
  }
  .frame-card.previewing {
    outline: 2.5px solid #0284c7;
  }
  .frame-card.equipped {
    outline: 2.5px solid #16a34a;
  }
  .rarity-chip {
    margin-bottom: 4px;
    padding: 1px 6px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--r-color, #94a3b8);
    font-size: 8px;
    font-weight: 900;
    text-transform: uppercase;
    color: #1f305e;
  }
  .frame-state-pill {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 7px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 900;
  }
  .frame-state-pill.owned {
    background: #dcfce7;
    color: #166534;
  }
  .frame-state-pill.locked {
    background: #fef3c7;
    color: #92400e;
  }
</style>
