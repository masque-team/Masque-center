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
  <section class="space-y-4 rounded-2xl border-2 border-white bg-gradient-to-br from-white/90 via-[#fff9e8]/90 to-[#eef6ff]/90 p-4 shadow-[0_5px_0_#c8d8ec]">
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-xl border border-amber-200 bg-white/90 p-3">
        <div class="flex items-center gap-1.5 text-xs font-extrabold text-[#7d5814]"><CurrencyIcon kind="points" size={22} />Masque Points</div>
        <strong class="mt-1 block text-2xl font-black tabular-nums text-[#2b2468]">{player.masquePoints.toLocaleString()}</strong>
      </div>
      <div class="rounded-xl border border-emerald-200 bg-white/90 p-3">
        <div class="flex items-center gap-1.5 text-xs font-extrabold text-[#2a6b53]"><CurrencyIcon kind="aisPoints" size={22} />AIS Points</div>
        <strong class="mt-1 block text-2xl font-black tabular-nums text-[#1e4e3d]">{player.aisPoints.toLocaleString()}</strong>
      </div>
    </div>
    <GameButton variant="gold" block onclick={onShop}><CurrencyIcon kind="points" size={18} />แลกแต้ม / เปิด Point Shop</GameButton>
  </section>
  <h2 class="font-bold">รายการล่าสุด</h2>
  {#if !player.demo.transactions.length}<div class="grid justify-items-center gap-3 py-10 text-[var(--g-muted)]"><ReceiptText size={32} /><p class="text-sm">ยังไม่มีรายการ</p></div>{/if}
  {#each player.demo.transactions as entry (entry.id)}<div class="flex items-start gap-3 border-b border-white py-3"><span class="rounded-lg bg-white/70 p-2">{#if entry.mp >= 0}<ArrowDownLeft size={18} class="text-sky-600" />{:else}<ArrowUpRight size={18} class="text-rose-600" />{/if}</span><div class="min-w-0 flex-1"><strong class="block text-sm">{entry.label}</strong><small class="text-[var(--g-muted)]">{new Date(entry.at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</small></div><div class="text-right text-xs font-bold">{#if entry.mp}<div class="inline-flex items-center gap-1"><CurrencyIcon kind="points" size={13} />{entry.mp > 0 ? '+' : ''}{entry.mp} MP</div>{/if}{#if entry.ais}<div class="inline-flex items-center gap-1"><CurrencyIcon kind="aisPoints" size={13} />{entry.ais} AIS</div>{/if}{#if entry.energy}<div class="text-sky-700">{entry.energy > 0 ? '+' : ''}{entry.energy} Energy</div>{/if}</div></div>{/each}
</div>
