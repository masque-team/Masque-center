<script lang="ts">
  import { Coins, Crown, ShoppingBag, Ticket, Zap } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PointShop from '../components/PointShop.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState, ShopTab } from '../types';
  let { player, vipActive, tab = $bindable(), onBuy, onRefill, onBuyTickets, onBuyPointPack, onPass }: {
    player: PlayerState; vipActive: boolean; tab: ShopTab; onBuy: (id: string) => void; onRefill: (id: string) => void;
    onBuyTickets: (quantity: number) => void; onBuyPointPack: (id: string) => void; onPass: () => void;
  } = $props();
  let category = $state<'all' | 'avatar' | 'pet' | 'wing' | 'frame'>('all');
  let quantity = $state(1);
  const tabs = [{ id: 'items', label: 'ของขาย', icon: ShoppingBag }, { id: 'exchange', label: 'เติมแต้ม', icon: Coins }, { id: 'energy', label: 'Energy', icon: Zap }] as const;
  let products = $derived(player.demo.config.shop.filter((item) => category === 'all' || item.kind === category).map((item) => {
    const art = item.kind === 'avatar' ? AVATARS.find((art) => art.id === item.itemId) : item.kind === 'pet' ? PETS.find((art) => art.id === item.itemId) : item.kind === 'wing' ? WINGS.find((art) => art.id === item.itemId) : AVATARS.find((art) => art.id === player.avatarId);
    const owned = (item.kind === 'avatar' ? player.ownedAvatarIds : item.kind === 'pet' ? player.ownedPetIds : item.kind === 'wing' ? player.demo.wings : player.demo.frames).includes(item.itemId);
    return { ...item, art, owned };
  }));
</script>

<div class="space-y-4 pb-8 [overflow-anchor:none]">
  <div class="flex h-14 items-center justify-between"><div><p class="text-[10px] font-semibold text-sky-700">POINT MARKET</p><h1 class="text-xl font-bold">Shop</h1></div><ShoppingBag size={25} class="text-sky-700" /></div>
  <div class="sticky top-[76px] z-20 grid grid-cols-3 gap-1 rounded-lg border border-white bg-[#edf4ff]/95 p-1 shadow-sm backdrop-blur-md" role="tablist" aria-label="หมวดร้านค้า">{#each tabs as item (item.id)}<button class={['flex min-h-11 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors', tab === item.id ? 'bg-white text-indigo-800 shadow-sm' : 'text-[#7a83a4]']} role="tab" aria-selected={tab === item.id} onclick={() => { tab = item.id; }}><item.icon size={16} />{item.label}</button>{/each}</div>
  <section class="min-h-[calc(100dvh_-_180px)]" aria-label={tab === 'exchange' ? 'แพ็กเติมแต้ม' : tab === 'energy' ? 'เติม Energy' : 'สินค้า'}>
    {#if tab === 'exchange'}
      <PointShop {player} embedded onBuy={onBuyPointPack} />
    {:else if tab === 'energy'}
      <div class="space-y-4"><div class="flex items-center justify-between border-y border-white py-4"><h2 class="flex items-center gap-2 font-semibold"><Zap size={22} />Energy</h2><strong>{player.energy}/{energyCapacity(player, vipActive)}</strong></div>
        {#if vipActive}<p class="rounded-lg border border-amber-200 bg-white/80 p-4 text-sm text-amber-800">VIP · เพดานฟื้นพลัง {energyCapacity(player, true)}{player.demo.config.vipFreeEntry ? ' · เข้าเกมไม่เสีย Energy' : ''}</p>{/if}
        <div class="grid grid-cols-2 gap-3">{#each player.demo.config.energyPacks as pack (pack.id)}<article class="grid justify-items-center gap-3 rounded-lg border border-white bg-white/85 p-4"><Zap size={30} class="text-sky-500" /><strong class="text-2xl">+{pack.energy}</strong><span class="text-xs">{pack.cost} MP</span><GameButton size="sm" disabled={player.masquePoints < pack.cost} onclick={() => onRefill(pack.id)}>เติม Energy</GameButton></article>{/each}</div>
        <button class="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50/90 text-sm font-semibold text-amber-800" onclick={onPass}><Crown size={18} />ไปหน้า VIP Pass</button>
      </div>
    {:else}
      <div class="space-y-4">
        <section class="grid grid-cols-[1fr_auto] items-center gap-3 border-y border-white py-4" aria-label="ซื้อบัตรเข้า Ranked"><div><h2 class="flex items-center gap-1.5 text-sm font-semibold"><Ticket size={18} class="text-rose-500" />บัตร Ranked</h2><p class="mt-1 text-[10px] text-[var(--g-muted)]">มี {player.demo.arenaTickets} ใบ · {player.demo.config.arenaTicketPrice} MP/ใบ</p></div><div class="flex items-center gap-2"><input class="min-h-10 w-14 rounded-md border border-sky-200 bg-white/90 px-2 text-sm" type="number" min="1" max="99" aria-label="จำนวนบัตร Ranked" bind:value={quantity} /><GameButton size="sm" disabled={!Number.isInteger(quantity) || quantity < 1 || quantity > 99 || player.masquePoints < quantity * player.demo.config.arenaTicketPrice} onclick={() => onBuyTickets(quantity)}>ซื้อ</GameButton></div></section>
        <div class="flex gap-1 overflow-x-auto pb-1" role="group" aria-label="ประเภทสินค้า">{#each [{ id: 'all', label: 'ทั้งหมด' }, { id: 'avatar', label: 'Avatar' }, { id: 'pet', label: 'Pet' }, { id: 'wing', label: 'ปีก' }, { id: 'frame', label: 'กรอบ' }] as item (item.id)}<button class={['min-h-10 shrink-0 rounded-md border px-3 text-xs font-semibold', category === item.id ? 'border-sky-400 bg-sky-600 text-white' : 'border-white bg-white/70 text-[#71839a]']} aria-pressed={category === item.id} onclick={() => { category = item.id as typeof category; }}>{item.label}</button>{/each}</div>
        <div class="grid grid-cols-2 gap-3">{#each products as item (item.id)}{#if item.art}<article class="grid min-w-0 content-start gap-2 rounded-lg border border-white bg-white/85 p-3"><div class="h-28 w-full" data-frame={item.kind === 'frame' ? item.itemId : undefined}>{#if item.kind === 'wing'}<img class="h-full w-full object-contain" src={item.art.imagePath} alt={item.art.name} />{:else}<AssetPortrait src={item.art.imagePath} alt={item.art.name} placeholder="*" kind={item.kind === 'pet' ? 'pet' : 'avatar'} />{/if}</div><h3 class="text-sm font-bold">{item.kind === 'frame' ? `กรอบ ${item.itemId}` : item.art.name}</h3><RarityChip rarity={item.kind === 'frame' ? 'Rare' : item.art.rarity} /><span class="flex items-center gap-1 text-xs"><Coins size={13} class="text-amber-500" />{item.cost} MP</span><GameButton block size="sm" variant={item.owned ? 'ghost' : 'purple'} disabled={item.owned || player.masquePoints < item.cost} onclick={() => onBuy(item.id)}>{item.owned ? 'มีแล้ว' : 'ซื้อ'}</GameButton></article>{/if}{/each}</div>
      </div>
    {/if}
  </section>
</div>