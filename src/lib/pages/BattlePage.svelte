<script lang="ts">
  import { History, ShoppingBag, Swords, Ticket, Trophy } from '@lucide/svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import GameButton from '../components/GameButton.svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import { AVATARS } from '../data/config';
  import type { GameId, PlayerState } from '../types';
  let { player, onEnter, onShop }: { player: PlayerState; onEnter: (game: GameId) => void; onShop: () => void } = $props();
  let gameId = $state<GameId>('bird');
  let games = $derived(player.demo.config.games.filter((game) => game.published !== false));
  let game = $derived(games.find((game) => game.id === gameId) ?? games[0]);
  let matches = $derived(player.demo.sessions.filter((session) => session.mode === 'ranked').reverse());
  let avatar = $derived(AVATARS.find((avatar) => avatar.id === player.avatarId) ?? AVATARS[0]);
</script>
<div class="page-stack">
  <PageTitle eyebrow="RANKED PLAY" title="Battle Arena" subtitle="เล่นจัดอันดับ · รางวัลพิเศษ">{#snippet icon()}<Swords size={26} />{/snippet}</PageTitle>
  <div class="flex items-center justify-between gap-3 border-y border-white py-3"><span class="flex items-center gap-2 text-sm"><Ticket size={20} />บัตรเข้า Ranked <strong>{player.demo.arenaTickets}</strong></span><button class="flex min-h-10 items-center gap-1 text-xs font-semibold text-sky-700" onclick={onShop}><ShoppingBag size={16} />ซื้อบัตร</button></div>
  {#if game}
    <label class="grid gap-2 text-sm font-semibold">เลือกเกม<select class="min-h-12 min-w-0 rounded-md border border-white bg-white/70 px-3" bind:value={gameId}>{#each games as item (item.id)}<option value={item.id}>{item.name}</option>{/each}</select></label>
    <div class="relative flex min-h-44 items-center gap-4 border-y border-white bg-white/30 px-4 py-3"><div class="h-36 w-24 shrink-0"><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" /></div><div class="min-w-0"><span class="text-[10px] font-semibold text-rose-700">RANKED</span><h2 class="mt-1 text-lg font-bold">{game.name}</h2><p class="mt-2 break-words text-xs text-[var(--g-muted)]">{player.displayName} · LV.{player.level}</p></div></div>
    <dl class="grid grid-cols-2 gap-3 border-b border-white pb-4 text-sm"><div><dt>ค่าเข้า</dt><dd class="mt-1 flex items-center gap-1 text-xl font-bold"><Ticket size={20} />1 ใบ</dd><small class="text-xs text-sky-700">ไม่ใช้ Energy</small></div><div><dt>รางวัลเมื่อจบ</dt><dd class="mt-1 text-xl font-bold text-amber-700">{player.demo.config.battlePrize} MP</dd><small class="text-xs">+80 EXP</small></div></dl>
    <GameButton block disabled={!player.demo.config.battleEnabled || player.demo.arenaTickets < 1} onclick={() => onEnter(game.id)}><Swords size={18} />{!player.demo.config.battleEnabled ? 'Arena ปิดชั่วคราว' : player.demo.arenaTickets < 1 ? 'ยังไม่มีบัตรเข้า Ranked' : 'เล่น Ranked · 1 บัตร'}</GameButton>
    <p class="text-center text-xs text-[var(--g-muted)]">DEMO · คะแนนและรางวัลยังไม่ผ่านการยืนยันจากเซิร์ฟเวอร์</p>
  {/if}
  <h2 class="flex items-center gap-2 border-t border-white pt-4 font-bold"><History size={18} />Match History</h2>
  {#if !matches.length}<p class="py-6 text-center text-sm text-[var(--g-muted)]">ยังไม่มีประวัติ Ranked</p>{/if}
  {#each matches as match (match.id)}<div class="flex items-center gap-3 border-b border-white py-3"><Trophy size={20} class="shrink-0 text-amber-600" /><div class="min-w-0 flex-1"><strong class="block text-sm">{player.demo.config.games.find((game) => game.id === match.gameId)?.name}</strong><small class="text-xs text-[var(--g-muted)]">{new Date(match.startedAt).toLocaleDateString('th-TH')} · {match.finished ? `${match.score?.toLocaleString()} คะแนน` : 'ยังไม่จบ'}</small></div>{#if match.finished}<strong class="text-xs text-amber-700">+{match.reward?.points ?? 0} MP</strong>{/if}</div>{/each}
</div>