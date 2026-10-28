<script lang="ts">
  import { ArrowDownLeft, ArrowUpRight, ReceiptText } from '@lucide/svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import type { PlayerState } from '../types';
  let { player, onShop }: { player: PlayerState; onShop: () => void } = $props();
</script>
<div class="page-stack">
  <PageTitle eyebrow="DEMO WALLET" title="Wallet" subtitle="ยอดและประวัติรายการจำลอง">{#snippet icon()}<ReceiptText size={26} />{/snippet}</PageTitle>
  <section class="space-y-4 border-y border-white bg-white/30 py-5"><div class="flex items-center gap-2 text-sm"><CurrencyIcon kind="points" size={24} />Masque Points</div><strong class="block text-4xl font-bold">{player.masquePoints.toLocaleString()}</strong><div class="flex items-center justify-between text-sm"><span>AIS Points จำลอง</span><strong>{player.aisPoints.toLocaleString()}</strong></div><GameButton block onclick={onShop}>แลกแต้ม / เปิด Shop</GameButton></section>
  <h2 class="font-bold">รายการล่าสุด</h2>
  {#if !player.demo.transactions.length}<div class="grid justify-items-center gap-3 py-10 text-[var(--g-muted)]"><ReceiptText size={32} /><p class="text-sm">ยังไม่มีรายการ</p></div>{/if}
  {#each player.demo.transactions as entry (entry.id)}<div class="flex items-start gap-3 border-b border-white py-3"><span class="rounded-lg bg-white/70 p-2">{#if entry.mp >= 0}<ArrowDownLeft size={18} class="text-sky-600" />{:else}<ArrowUpRight size={18} class="text-rose-600" />{/if}</span><div class="min-w-0 flex-1"><strong class="block text-sm">{entry.label}</strong><small class="text-[var(--g-muted)]">{new Date(entry.at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</small></div><div class="text-right text-xs font-bold">{#if entry.mp}<div>{entry.mp > 0 ? '+' : ''}{entry.mp} MP</div>{/if}{#if entry.ais}<div>{entry.ais} AIS</div>{/if}{#if entry.energy}<div class="text-sky-700">{entry.energy > 0 ? '+' : ''}{entry.energy} Energy</div>{/if}</div></div>{/each}
</div>