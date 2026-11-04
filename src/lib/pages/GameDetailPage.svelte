<script lang="ts">
  import { ArrowLeft, Play, Trophy, Info, Sparkles, Check, ShoppingBag, Zap, Crown } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import EnergyBadge from '../components/EnergyBadge.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { Game, PlayerState, RankingPeriod } from '../types';

  let { game, player, vipActive, score, countdown, onPlay, onBack, onRefill, onAvatar, onPet, onWing, onBuyItem }: {
    game: Game; player: PlayerState; vipActive: boolean; score: number; countdown: string;
    onPlay: () => void; onBack: () => void; onRefill: () => void; onAvatar: (id: string) => void;
    onPet: (id: string | null) => void; onWing: (id: string | null) => void; onBuyItem: (id: string) => void;
  } = $props();
  let tab = $state<'info' | 'ranking'>('info');
  let loadoutFilter = $state<'all' | 'avatar' | 'pet' | 'wing'>('all');
  let freeEntry = $derived(vipActive && player.demo.config.vipFreeEntry);
  let period = $state<RankingPeriod>('allTime');
  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let wing = $derived(WINGS.find((item) => item.id === player.demo.wingId));
  let loadoutItems = $derived(
    player.demo.config.shop
      .filter((item) => item.kind === 'avatar' || item.kind === 'pet' || item.kind === 'wing')
      .filter((item) => loadoutFilter === 'all' || item.kind === loadoutFilter)
  );
  let rankingGame = $derived(game.id);
</script>

<div class="page-stack">
  <div class="heading">
    <button title="กลับ" aria-label="กลับหน้าเกม" onclick={onBack}><ArrowLeft size={21} /></button>
    <div class="min-w-0 flex-1">
      <small>{game.genre} · SKY ARCADE</small>
      <h1>{game.name}</h1>
    </div>
    <EnergyBadge energy={player.energy} {vipActive} max={energyCapacity(player, vipActive)} {countdown} {onRefill} />
  </div>

  {#if game.cover}
    <div class="hero-card">
      <img class="cover" class:logo={game.id === 'memory'} src={`images/${game.cover}`} alt={game.name} />
      <div class="hero-pills">
        <span class="pill-gold"><Trophy size={12} /> Best: {score.toLocaleString('en-US')}</span>
        <span class="pill-sky"><Zap size={12} fill="currentColor" /> {freeEntry ? 'VIP เข้าฟรี' : `${player.demo.config.energyCost} Energy`}</span>
      </div>
    </div>
  {:else}
    <div class="memory-cover"><span>?</span><span>♥</span><span>♥</span><span>?</span></div>
  {/if}

  <div class="sticky top-2 z-10 rounded-2xl border-2 border-white bg-[#fffdf7]/95 p-1.5 shadow-[0_5px_0_#9bcdf0,0_10px_20px_rgba(20,76,145,0.14)] backdrop-blur-md">
    <GameButton variant="gold" size="lg" block onclick={onPlay}>
      <Play size={20} fill="currentColor" />เริ่มเล่น {game.name}{freeEntry ? ' · VIP ฟรี' : ` · ${player.demo.config.energyCost} Energy`}
    </GameButton>
  </div>

  <div class="tabs" role="tablist" aria-label="ข้อมูลเกม">
    <button role="tab" aria-selected={tab === 'info'} class:on={tab === 'info'} onclick={() => tab = 'info'}><Info size={16} />ข้อมูล & Loadout</button>
    <button role="tab" aria-selected={tab === 'ranking'} class:on={tab === 'ranking'} onclick={() => tab = 'ranking'}><Trophy size={16} />อันดับคะแนน</button>
  </div>

  {#if tab === 'info'}
    <p class="description card-25d px-3.5 py-3">{game.description}</p>

    <div class="stats">
      <div class="card-gold-25d p-3">
        <span class="flex items-center gap-1.5 text-[11px] font-black text-[#8a5200]"><Trophy size={15} /> คะแนนสูงสุดของคุณ</span>
        <b class="mt-1 block text-2xl font-black text-[#1f305e]">{score.toLocaleString('en-US')}</b>
        <small class="text-[10px] font-bold text-[#7c5819]">Personal High Score · อัปเดตเมื่อได้สถิติใหม่</small>
      </div>
      <div class="card-sky-25d p-3">
        <span class="flex items-center gap-1.5 text-[11px] font-black text-[#0369a1]"><Zap size={15} /> ค่าเข้าเล่นปกติ</span>
        <b class="mt-1 block text-2xl font-black text-[#1f305e]">{freeEntry ? '0' : player.demo.config.energyCost} Energy</b>
        <small class="text-[10px] font-bold text-[#4f6899]">{freeEntry ? 'สิทธิ์ VIP · เข้าเล่นปกติฟรี' : `ฟื้น +1 ทุก ${player.demo.config.regenMinutes} นาที`}</small>
      </div>
    </div>

    <section class="card-25d space-y-3 p-3.5" aria-label="Pre-game loadout">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="grid size-8 place-items-center rounded-xl border border-white bg-[#ffe999] text-[#8a5200] shadow-xs"><Sparkles size={16} /></span>
          <div>
            <h2 class="text-sm font-black text-[#1f305e]">Pre-game Loadout Stage</h2>
            <p class="text-[10px] font-bold text-[#526c9c]">แต่งตัวก่อนเข้าเกม · Preview เฉพาะในแพลตฟอร์ม</p>
          </div>
        </div>
        {#if vipActive}
          <span class="inline-flex items-center gap-1 rounded-full border border-[#fde68a] bg-[#fffbeb] px-2.5 py-0.5 text-[10px] font-black text-[#92400e]"><Crown size={11} /> VIP</span>
        {/if}
      </div>

      <div class="loadout-stage" class:vip={vipActive}>
        <div class="stage-visual">
          <span class="stage-disc" aria-hidden="true"></span>
          {#if wing}
            <img class="stage-wing" src={wing.imagePath} alt={wing.name} />
          {/if}
          <div class="stage-avatar">
            <AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" />
          </div>
          {#if pet}
            <span class="stage-pet">
              <AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" />
            </span>
          {/if}
        </div>
        <div class="min-w-0 flex-1 space-y-1.5">
          <strong class="block truncate text-sm font-black text-[#1f305e]">{player.displayName}</strong>
          <div class="flex flex-wrap gap-1 text-[10px] font-extrabold">
            <span class="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-800">Avatar: {avatar.name}</span>
            <span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-900">Pet: {pet?.name ?? 'ไม่ได้ใส่'}</span>
            <span class="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-800">Wing: {wing?.name ?? 'ไม่ได้ใส่'}</span>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            {#if player.petId}
              <button class="rounded-lg border border-sky-200 bg-white px-2 py-1 text-[10px] font-extrabold text-[#0369a1]" onclick={() => onPet(null)}><Check size={11} class="inline" /> ถอด Pet</button>
            {/if}
            {#if player.demo.wingId}
              <button class="rounded-lg border border-sky-200 bg-white px-2 py-1 text-[10px] font-extrabold text-[#0369a1]" onclick={() => onWing(null)}><Check size={11} class="inline" /> ถอด Wing</button>
            {/if}
          </div>
        </div>
      </div>

      <div class="flex gap-1.5 overflow-x-auto pb-1">
        {#each [['all', 'ทั้งหมด'], ['avatar', 'Avatar'], ['pet', 'Pet'], ['wing', 'Wing']] as [id, label] (id)}
          <button
            class={['min-h-8 shrink-0 rounded-full border px-3 text-[11px] font-black', loadoutFilter === id ? 'border-[#0284c7] bg-[#0284c7] text-white' : 'border-sky-100 bg-[#f0f9ff] text-[#4f6899]']}
            onclick={() => (loadoutFilter = id as typeof loadoutFilter)}
          >
            {label}
          </button>
        {/each}
      </div>

      <div class="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-0.5" aria-label="Cosmetic loadout items">
        {#each loadoutItems as item (item.id)}
          {@const owned = item.kind === 'avatar' ? player.ownedAvatarIds.includes(item.itemId) : item.kind === 'pet' ? player.ownedPetIds.includes(item.itemId) : player.demo.wings.includes(item.itemId)}
          {@const equipped = item.kind === 'avatar' ? player.avatarId === item.itemId : item.kind === 'pet' ? player.petId === item.itemId : player.demo.wingId === item.itemId}
          {@const avatarMeta = item.kind === 'avatar' ? AVATARS.find((entry) => entry.id === item.itemId) : undefined}
          {@const petMeta = item.kind === 'pet' ? PETS.find((entry) => entry.id === item.itemId) : undefined}
          {@const wingMeta = item.kind === 'wing' ? WINGS.find((entry) => entry.id === item.itemId) : undefined}
          {@const name = avatarMeta?.name ?? petMeta?.name ?? wingMeta?.name ?? item.itemId}
          <div class={['flex flex-col justify-between gap-2 rounded-2xl border-2 p-2.5', equipped ? 'border-[#f5a623] bg-[#fffbeb] shadow-[0_3px_0_#e6b44c]' : 'border-white bg-[#f8fcff] shadow-[0_3px_0_#c6e3f7]']}>
            <div class="flex items-center gap-2">
              <div class="size-11 shrink-0 overflow-hidden rounded-xl border border-white bg-white p-0.5 shadow-2xs">
                {#if avatarMeta}
                  <AssetPortrait src={avatarMeta.imagePath} alt={name} placeholder={avatarMeta.placeholder} kind="avatar" />
                {:else if petMeta}
                  <AssetPortrait src={petMeta.imagePath} alt={name} placeholder={petMeta.placeholder} kind="pet" />
                {:else if wingMeta}
                  <img class="size-full object-contain" src={wingMeta.imagePath} alt={name} />
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <strong class="block truncate text-xs font-black text-[#1f305e]">{name}</strong>
                <small class="block text-[10px] font-bold text-[#526c9c] uppercase">{item.kind}{owned ? ' · มีแล้ว' : ''}</small>
              </div>
            </div>
            {#if owned}
              <button
                class={['min-h-8 w-full rounded-xl border text-[11px] font-black', equipped ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-sky-200 bg-[#e0f2fe] text-[#0369a1]']}
                disabled={equipped}
                aria-pressed={equipped}
                onclick={() => item.kind === 'avatar' ? onAvatar(item.itemId) : item.kind === 'pet' ? onPet(item.itemId) : onWing(item.itemId)}
              >
                {equipped ? '✓ สวมใส่อยู่' : 'เลือกสวมใส่'}
              </button>
            {:else}
              <button
                class="flex min-h-8 w-full items-center justify-center gap-1 rounded-xl border border-[#f5b841] bg-gradient-to-b from-[#fff2a6] to-[#ffca4b] text-[11px] font-black text-[#6e3b00] shadow-[0_2px_0_#c9820a]"
                aria-label={`ซื้อ ${name} · ${item.cost} AIS Point`}
                onclick={() => onBuyItem(item.id)}
              >
                <ShoppingBag size={12} /> <CurrencyIcon kind="aisPoints" size={12} /> {item.cost}
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {:else}
    <Leaderboard gameId={rankingGame} bind:period {player} currentScore={score} fixedGame />
  {/if}
</div>

<style>
  .heading { display: flex; align-items: center; gap: 10px; }
  .heading > button { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border: 2.5px solid #fff; border-radius: 15px; color: #0284c7; background: linear-gradient(180deg, #ffffff, #e0f2fe); box-shadow: 0 4px 0 #9bcdf0; }
  h1 { margin: 0; font-size: 21px; font-weight: 900; color: #1f305e; line-height: 1.2; }
  small { font-size: 11px; font-weight: 800; color: #0284c7; }
  .hero-card { position: relative; overflow: hidden; border-radius: 24px; border: 3px solid #fff; box-shadow: 0 6px 0 #9bcdf0, 0 14px 26px rgba(20, 76, 145, 0.18); }
  .cover { width: 100%; aspect-ratio: 1.62; display: block; object-fit: cover; object-position: center 38%; }
  .cover.logo { object-fit: contain; object-position: center; background: #fffdf7; }
  .hero-pills { position: absolute; right: 10px; bottom: 10px; left: 10px; display: flex; justify-content: space-between; gap: 6px; }
  .pill-gold, .pill-sky { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 99px; border: 1.5px solid #fff; font-size: 11px; font-weight: 900; box-shadow: 0 2px 6px rgba(15, 35, 75, 0.25); }
  .pill-gold { background: linear-gradient(180deg, #fff2a6, #ffc947); color: #6e3b00; }
  .pill-sky { background: rgba(12, 48, 98, 0.78); color: #e0f2fe; backdrop-filter: blur(6px); }
  .memory-cover { display: flex; justify-content: center; align-items: center; gap: 8px; min-height: 170px; background: linear-gradient(145deg, #bae6fd, #7dd3fc); border: 3px solid #fff; border-radius: 24px; box-shadow: 0 6px 0 #9bcdf0; }
  .memory-cover span { padding: 14px; background: #fffdf7; border-radius: 12px; color: #0284c7; font-size: 28px; font-weight: 900; }
  .tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border: 2px solid #fff; border-radius: 18px; background: #dff1ff; box-shadow: 0 4px 0 #a9d5f4; gap: 4px; }
  .tabs button { display: flex; justify-content: center; align-items: center; gap: 6px; min-height: 42px; border: 0; border-radius: 13px; color: #4f6899; background: transparent; font-size: 13px; font-weight: 900; }
  .tabs .on { color: #fff; background: linear-gradient(180deg, #4fd1ff, #0284c7); box-shadow: 0 3px 0 #0369a1; }
  .description { margin: 0; color: #4f6899; font-size: 13px; font-weight: 700; line-height: 1.5; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .loadout-stage { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 2px solid #fff; border-radius: 20px; background: radial-gradient(circle at 22% 50%, #fff9db 0%, #e0f2fe 58%, #f0f9ff 100%); box-shadow: inset 0 2px 6px rgba(14, 116, 184, 0.1); }
  .stage-visual { position: relative; width: 92px; height: 104px; flex: 0 0 auto; }
  .stage-disc { position: absolute; right: 6px; bottom: 2px; left: 6px; height: 16px; border-radius: 50%; border: 2px solid #fff; background: linear-gradient(90deg, #ffe58a, #7dd3fc, #ffe58a); box-shadow: 0 3px 0 #7ab8e6; }
  .stage-wing { position: absolute; top: 8px; left: -6px; width: 104px; height: 74px; object-fit: contain; pointer-events: none; filter: drop-shadow(0 3px 6px rgba(14, 116, 184, 0.25)); }
  .stage-avatar { position: relative; z-index: 1; width: 78px; height: 96px; margin: 0 auto; }
  .stage-pet { position: absolute; z-index: 2; right: -6px; bottom: 4px; width: 42px; height: 46px; }
</style>
