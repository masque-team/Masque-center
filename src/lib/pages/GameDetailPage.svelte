<script lang="ts">
  import { ArrowLeft, Play, Trophy, Info } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import EnergyBadge from '../components/EnergyBadge.svelte';
  import { AVATARS, PETS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { Game, GameId, PlayerState, RankingPeriod } from '../types';

  let { game, player, vipActive, score, countdown, onPlay, onBack, onRefill, onAvatar }: {
    game: Game; player: PlayerState; vipActive: boolean; score: number; countdown: string;
    onPlay: () => void; onBack: () => void; onRefill: () => void; onAvatar: () => void;
  } = $props();
  let tab = $state<'info' | 'ranking'>('info');
  let freeEntry = $derived(vipActive && player.demo.config.vipFreeEntry);
  let period = $state<RankingPeriod>('weekly');
  let avatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === player.petId));
  let rankingGame = $state<GameId>('bird');
  $effect(() => { rankingGame = game.id; });
</script>

<div class="page-stack">
  <div class="heading"><button title="กลับ" aria-label="กลับหน้าเกม" onclick={onBack}><ArrowLeft size={22} /></button><div><small>{game.genre}</small><h1>{game.name}</h1></div></div>
  {#if game.cover}<img class="cover" class:logo={game.id === 'memory'} src={`images/${game.cover}`} alt={game.name} />{:else}<div class="memory-cover"><span>?</span><span>♥</span><span>♥</span><span>?</span></div>{/if}
  <div class="sticky top-2 z-10 rounded-lg bg-[#f5f8fc]/95 py-1 backdrop-blur-sm"><GameButton variant="purple" size="lg" block onclick={onPlay}><Play size={20} fill="currentColor" />เริ่มเล่น{freeEntry ? '' : ` · ${player.demo.config.energyCost} Energy`}</GameButton></div>
  <div class="tabs" role="tablist" aria-label="ข้อมูลเกม">
    <button role="tab" aria-selected={tab === 'info'} class:on={tab === 'info'} onclick={() => tab = 'info'}><Info size={17} />ข้อมูลเกม</button>
    <button role="tab" aria-selected={tab === 'ranking'} class:on={tab === 'ranking'} onclick={() => tab = 'ranking'}><Trophy size={17} />อันดับ</button>
  </div>
  {#if tab === 'info'}
    <p class="description">{game.description}</p>
    <div class="party" class:vip={vipActive}>
      <div class="portraits"><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" />{#if pet}<span class="buddy"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" /></span>{/if}</div>
      <div class="identity"><strong>{player.displayName}</strong><small>{avatar.name}{pet ? ` · ${pet.name}` : ''}</small></div>
      <EnergyBadge energy={player.energy} {vipActive} max={energyCapacity(player, vipActive)} {countdown} {onRefill} />
    </div>
    <div class="stats"><span><Trophy size={19} />คะแนนสูงสุด <b>{score.toLocaleString('en-US')}</b><small>SIMULATED SCORE</small></span><span><Info size={19} />ค่าเข้าเล่น<b>{freeEntry ? '0' : player.demo.config.energyCost} Energy</b><small>{freeEntry ? 'สิทธิ์ VIP · เฉพาะค่าเข้าเกม' : `ฟื้น 1 ทุก ${player.demo.config.regenMinutes} นาที`}</small></span></div>
  {:else}
    <Leaderboard gameId={rankingGame} bind:period {player} currentScore={score} fixedGame />
  {/if}
</div>

<style>
  .heading { display: flex; align-items: center; gap: 10px; }
  .heading > button { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; border: 2px solid #fff; border-radius: 50%; color: #6b4cc6; background: #e9e0fc; }
  h1 { margin: 0; font-size: 22px; color: var(--g-ink); line-height: 1.3; }
  small { font-size: 12px; color: var(--g-muted); }
  .cover { width: 100%; aspect-ratio: 1.6; object-fit: cover; object-position: center 38%; border-radius: 20px; border: 3px solid #fff; }
  .cover.logo { object-fit: contain; object-position: center; background: #fff; }
  .memory-cover { display: flex; justify-content: center; align-items: center; gap: 8px; min-height: 170px; background: #c6e9eb; border-radius: 20px; }
  .memory-cover span { padding: 14px; background: #fff; border-radius: 8px; color: #9862cd; font-size: 28px; }
  .tabs { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 16px; background: #e6dff5; gap: 4px; }
  .tabs button { display: flex; justify-content: center; align-items: center; gap: 6px; min-height: 44px; border: 0; border-radius: 12px; color: #7c6aa8; background: transparent; font-weight: 800; }
  .tabs .on { color: #fff; background: #8460dc; }
  .description { margin: 0; color: var(--g-muted); font-size: 14px; }
  .party { display: flex; align-items: center; gap: 12px; padding: 0 4px; border-bottom: 1px solid #ddd4ef; }
  .portraits { position: relative; width: 82px; height: 102px; flex: 0 0 auto; }
  .vip .portraits { filter: drop-shadow(0 0 9px #ffc659); }
  .buddy { position: absolute; right: -14px; bottom: 0; width: 40px; height: 46px; }
  .identity { display: grid; gap: 4px; flex: 1; min-width: 0; }
  .identity strong { color: var(--g-ink); overflow-wrap: anywhere; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stats > span { display: grid; gap: 3px; padding: 12px; border-radius: 8px; background: #fff; color: #9382b0; font-size: 12px; }
  .stats b { color: var(--g-ink); font-size: 22px; }
</style>