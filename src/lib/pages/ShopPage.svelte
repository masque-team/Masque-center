<script lang="ts">
  import { Coins, ShoppingBag, Zap } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PointShop from '../components/PointShop.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState, ShopTab } from '../types';
  let { player, vipActive, countdown, tab = $bindable(), onBuy, onRefill, onBuyTickets, onBuyPointPack, onBuyGachaCoupons }: {
    player: PlayerState; vipActive: boolean; tab: ShopTab; onBuy: (id: string) => void; onRefill: (id: string) => void;
    countdown: string; onBuyTickets: (quantity: number) => void; onBuyPointPack: (id: string) => void; onBuyGachaCoupons: (quantity: 1 | 10) => void;
  } = $props();
  let category = $state<'all' | 'avatar' | 'pet' | 'wing' | 'frame'>('all');
  let quantity = $state(1);
  let maxEnergy = $derived(energyCapacity(player, vipActive));
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
      <div class="space-y-4"><section class="space-y-3 border-y border-white py-4" aria-label="สถานะ Energy"><div class="flex items-center justify-between"><h2 class="flex items-center gap-2 font-semibold"><Zap size={22} />Energy</h2><strong class="text-lg tabular-nums">{player.energy}/{maxEnergy}</strong></div><div class="h-2 overflow-hidden rounded-full bg-sky-100"><span class="block h-full rounded-full bg-sky-500" style={`width:${Math.min(100, player.energy / maxEnergy * 100)}%`}></span></div>{#if player.energy < maxEnergy}<p class="text-xs text-[#5f7c8b]">ฟื้น +1 ทุก {player.demo.config.regenMinutes} นาที · ครั้งถัดไปใน <strong class="tabular-nums">{countdown}</strong></p>{:else}<p class="text-xs text-[#5f7c8b]">Energy เต็มแล้ว · ฟื้น +1 ทุก {player.demo.config.regenMinutes} นาที</p>{/if}{#if vipActive}<p class="rounded-md border border-amber-200 bg-[#fff9e8] p-3 text-[11px] leading-relaxed text-amber-800">VIP Pass: เกมทั่วไปเข้าไม่หัก Energy · MAX +{player.demo.config.vipEnergyBonus} · ปลดล็อกรางวัล VIP ใน Pass · Ranked ยังใช้บัตรเข้า</p>{/if}</section>
        <h2 class="text-sm font-bold">แพ็ก Energy</h2>
        <div class="grid grid-cols-2 gap-3">{#each player.demo.config.energyPacks as pack (pack.id)}<article class="grid min-w-0 justify-items-center gap-2 rounded-lg border-2 border-white bg-white/85 p-3 shadow-[0_4px_0_#c7dce5]"><span class="grid size-10 place-items-center rounded-full border border-white bg-sky-50 text-sky-600"><Zap size={23} fill="currentColor" /></span><strong class="text-2xl">+{pack.energy}</strong><span class="text-[10px] font-semibold text-[#6b8795]">Energy</span><span class="text-[10px] text-[#6b8795]">หลังเติม {player.energy + pack.energy}/{maxEnergy}</span><GameButton block size="sm" disabled={player.masquePoints < pack.cost} onclick={() => onRefill(pack.id)}>ซื้อแพ็ก · {pack.cost} MP</GameButton></article>{/each}</div>
      </div>
    {:else}
      <div class="space-y-4">
        <section class="grid grid-cols-[1fr_auto] items-center gap-3 border-y border-white py-4" aria-label="ซื้อบัตรเข้า Ranked"><div><h2 class="flex items-center gap-1.5 text-sm font-semibold"><CurrencyIcon kind="arenaTicket" size={24} />บัตร Ranked</h2><p class="mt-1 text-[10px] text-[var(--g-muted)]">มี {player.demo.arenaTickets} ใบ · {player.demo.config.arenaTicketPrice} MP/ใบ</p></div><div class="flex items-center gap-2"><input class="min-h-10 w-14 rounded-md border border-sky-200 bg-white/90 px-2 text-sm" type="number" min="1" max="99" aria-label="จำนวนบัตร Ranked" bind:value={quantity} /><GameButton size="sm" disabled={!Number.isInteger(quantity) || quantity < 1 || quantity > 99 || player.masquePoints < quantity * player.demo.config.arenaTicketPrice} onclick={() => onBuyTickets(quantity)}>ซื้อ</GameButton></div></section>
        <section class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white py-3" aria-label="ซื้อคูปองสุ่ม"><div class="min-w-0"><h2 class="flex items-center gap-1.5 text-sm font-semibold"><CurrencyIcon kind="petGachaTicket" size={24} />คูปองสุ่ม</h2><p class="mt-1 text-[10px] text-[var(--g-muted)]">มี {player.gachaTickets} ใบ · {player.demo.config.gachaCost} MP/ใบ · ใช้ได้ทั้ง Avatar/Pet</p></div><div class="grid gap-1"><GameButton size="sm" variant="ghost" disabled={player.masquePoints < player.demo.config.gachaCost} onclick={() => onBuyGachaCoupons(1)}>ซื้อ 1</GameButton><GameButton size="sm" disabled={player.masquePoints < player.demo.config.gachaCost * 10} onclick={() => onBuyGachaCoupons(10)}>ซื้อ 10 · โบนัส +1</GameButton></div></section>
        <div class="flex gap-1 overflow-x-auto pb-1" role="group" aria-label="ประเภทสินค้า">{#each [{ id: 'all', label: 'ทั้งหมด' }, { id: 'avatar', label: 'Avatar' }, { id: 'pet', label: 'Pet' }, { id: 'wing', label: 'ปีก' }, { id: 'frame', label: 'กรอบ' }] as item (item.id)}<button class={['min-h-10 shrink-0 rounded-md border px-3 text-xs font-semibold', category === item.id ? 'border-sky-400 bg-sky-600 text-white' : 'border-white bg-white/70 text-[#71839a]']} aria-pressed={category === item.id} onclick={() => { category = item.id as typeof category; }}>{item.label}</button>{/each}</div>
        <div class="grid grid-cols-2 gap-3">{#each products as item (item.id)}{#if item.art}<article class="grid min-w-0 content-start gap-2 rounded-lg border border-white bg-white/85 p-3"><div class="h-28 w-full" data-frame={item.kind === 'frame' ? item.itemId : undefined}>{#if item.kind === 'wing'}<img class="h-full w-full object-contain" src={item.art.imagePath} alt={item.art.name} />{:else}<AssetPortrait src={item.art.imagePath} alt={item.art.name} placeholder="*" kind={item.kind === 'pet' ? 'pet' : 'avatar'} />{/if}</div><h3 class="text-sm font-bold">{item.kind === 'frame' ? `กรอบ ${item.itemId}` : item.art.name}</h3><RarityChip rarity={item.kind === 'frame' ? 'Rare' : item.art.rarity} /><span class="flex items-center gap-1 text-xs"><Coins size={13} class="text-amber-500" />{item.cost} MP</span><GameButton block size="sm" variant={item.owned ? 'ghost' : 'purple'} disabled={item.owned || player.masquePoints < item.cost} onclick={() => onBuy(item.id)}>{item.owned ? 'มีแล้ว' : 'ซื้อ'}</GameButton></article>{/if}{/each}</div>
      </div>
    {/if}
  </section>
</div>