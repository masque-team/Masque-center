<script lang="ts">
  import { Check, LoaderCircle, PawPrint, Sparkles } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import GameButton from './GameButton.svelte';
  import RarityChip from './RarityChip.svelte';
  import { AVATARS, GACHA_ARTWORK, PETS } from '../data/config';
  import { getGachaOdds } from '../services/gachaService';
  import type { GachaKind, PlayerState } from '../types';

  let { player, busy, onDraw, onBuyCoupons }: { player: PlayerState; busy: boolean; onDraw: (kind: GachaKind, count: 1 | 10) => void; onBuyCoupons: (count: 1 | 10) => void } = $props();
  let kind = $state<GachaKind>('pet');
  let focusId = $state('frostwing');
  let items = $derived(kind === 'pet' ? PETS : AVATARS);
  let focus = $derived(items.find((item) => item.id === focusId) ?? items[0]);
  let ownedCount = $derived(kind === 'pet' ? player.ownedPetIds.length : player.ownedAvatarIds.length);
  let odds = $derived(getGachaOdds(player, kind));
  let featured = $derived(odds.find((item) => item.featured));
  let energyOdds = $derived(odds.find((item) => item.kind === 'energy')?.rate ?? 0);
  let machineFailed = $state(false);
  let capsuleFailed = $state(false);

  function drawOrBuy(count: 1 | 10) {
    if (player.gachaTickets < count) onBuyCoupons(count);
    else onDraw(kind, count);
  }
</script>

<section class="space-y-4 border-t border-white py-4" aria-label="ตู้สุ่ม Avatar และ Pet">
  <div class="flex items-center justify-between gap-3 rounded-2xl border-2 border-white bg-gradient-to-r from-white/95 via-[#fff8e8]/95 to-[#e6f5ff]/95 px-3.5 py-2.5 shadow-[0_4px_0_#c6d8ec]">
    <div class="flex items-center gap-2.5">
      {#if GACHA_ARTWORK.capsule}
        <img class="size-11 shrink-0 object-contain drop-shadow-[0_3px_4px_rgba(60,40,120,0.24)]" src={GACHA_ARTWORK.capsule} alt="" />
      {/if}
      <div>
        <p class="text-[9px] font-black tracking-[0.12em] text-sky-700">MASQUE CAPSULE GACHA</p>
        <h2 class="flex items-center gap-1.5 text-lg font-black text-[#2b2468]">
          ตู้สุ่ม {kind === 'pet' ? 'สัตว์เลี้ยงคู่ใจ' : 'ตัวละคร Avatar'}
        </h2>
      </div>
    </div>
    <span class="shrink-0 rounded-full border-2 border-white bg-sky-50 px-3 py-1 text-[10px] font-black text-sky-800 shadow-xs">
      สะสม {ownedCount}/{items.length}
    </span>
  </div>

  <div class="grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-white bg-[#e4f0fd]/95 p-1.5 shadow-[0_4px_0_#c4d6ec]" role="tablist" aria-label="ประเภทตู้สุ่ม">
    <button
      class={[
        'flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-black transition-all',
        kind === 'pet'
          ? 'border border-amber-200 bg-gradient-to-b from-[#55b4dc] to-[#2e85b0] text-white shadow-[0_3px_0_#1e6085]'
          : 'text-[#62798f]',
      ]}
      role="tab"
      aria-selected={kind === 'pet'}
      onclick={() => {
        kind = 'pet';
        focusId = 'frostwing';
      }}
    >
      <PawPrint size={16} />ตู้สุ่ม Pet
    </button>
    <button
      class={[
        'flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-black transition-all',
        kind === 'avatar'
          ? 'border border-amber-200 bg-gradient-to-b from-[#9c78f2] to-[#6946c6] text-white shadow-[0_3px_0_#482c96]'
          : 'text-[#62798f]',
      ]}
      role="tab"
      aria-selected={kind === 'avatar'}
      onclick={() => {
        kind = 'avatar';
        focusId = 'luna';
      }}
    >
      <Sparkles size={16} />ตู้สุ่ม Avatar
    </button>
  </div>

  <!-- Enhanced 2.5D Gacha Stage with Circular Crystal Globe Lens -->
  <div
    class="gacha-stage relative isolate mx-auto flex h-72 w-full max-w-[356px] items-center justify-center overflow-hidden rounded-3xl border-3 border-white bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#dff3ff_48%,#ffe8ef_85%,#ffefc8_100%)] shadow-[0_7px_0_#b9d4e6,0_12px_24px_rgba(65,45,140,0.18)]"
    aria-label={`ตัวอย่าง ${kind === 'pet' ? 'Pet' : 'Avatar'} ${focus.name}`}
  >
    <!-- Magical Spotlight Halo & Stage Floor -->
    <span class="pointer-events-none absolute top-4 left-1/2 size-52 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,232,145,0.65)_0%,rgba(145,215,255,0.22)_58%,transparent_75%)]" aria-hidden="true"></span>
    <span class="pointer-events-none absolute inset-x-10 bottom-3 h-5 rounded-full border border-white/80 bg-gradient-to-r from-[#9ed6f0]/50 via-[#ffe299]/65 to-[#9ed6f0]/50 shadow-inner" aria-hidden="true"></span>

    {#if GACHA_ARTWORK.machine && !machineFailed}
      <img
        class="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(45,75,130,0.22)]"
        src={GACHA_ARTWORK.machine}
        alt=""
        onerror={() => {
          machineFailed = true;
        }}
      />
    {/if}

    <!-- Circular Golden Crystal Globe Lens (cleanly frames the Pet/Avatar inside the machine's glass sphere) -->
    <div
      class="crystal-globe absolute top-[15%] left-1/2 z-10 grid size-[138px] -translate-x-1/2 place-items-center rounded-full border-[3px] border-[#fff8dc] bg-[radial-gradient(circle_at_35%_28%,#ffffff_0%,#e2f5ff_58%,#a8defa_90%,#7bc4ec_100%)] p-2 shadow-[0_0_0_3.5px_#eab345,0_6px_14px_rgba(40,85,145,0.28),inset_0_4px_12px_#ffffff]"
    >
      <span class="pointer-events-none absolute top-2 left-3.5 h-4 w-7 -rotate-24 rounded-full bg-white/85 blur-[0.5px]" aria-hidden="true"></span>
      <div class="pet-preview relative z-10 h-[116px] w-[116px] drop-shadow-[0_4px_6px_rgba(45,65,120,0.28)]">
        <AssetPortrait src={focus.imagePath} alt={focus.name} placeholder={focus.placeholder} kind={kind} />
      </div>
    </div>

    <!-- Decorative Floating Capsules on Stage Corners -->
    {#if GACHA_ARTWORK.capsule && !capsuleFailed}
      <img
        class="pointer-events-none absolute bottom-4 left-4 z-10 size-13 -rotate-12 object-contain drop-shadow-[0_4px_6px_rgba(60,40,120,0.25)]"
        src={GACHA_ARTWORK.capsule}
        alt=""
        onerror={() => {
          capsuleFailed = true;
        }}
      />
      <img
        class="pointer-events-none absolute right-4 bottom-4 z-10 size-11 rotate-12 object-contain drop-shadow-[0_4px_6px_rgba(60,40,120,0.25)]"
        src={GACHA_ARTWORK.capsule}
        alt=""
      />
    {/if}

    {#if busy}
      <div class="gacha-spin absolute top-[26%] left-1/2 z-20 grid size-16 -translate-x-1/2 place-items-center" aria-hidden="true">
        {#if GACHA_ARTWORK.capsule && !capsuleFailed}
          <img class="h-full w-full animate-bounce object-contain drop-shadow-[0_4px_10px_rgba(255,180,30,0.7)]" src={GACHA_ARTWORK.capsule} alt="" />
        {/if}
      </div>
    {/if}

    <span
      class="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 rounded-full border-2 border-white bg-white/95 px-2.5 py-1 text-[9px] font-black text-[#3e647a] shadow-xs"
      aria-live="polite"
    >
      <Sparkles size={11} class={busy ? 'animate-spin text-amber-500' : 'text-amber-500'} />
      {busy ? 'กำลังหมุนตู้กาชา...' : `ตัวอย่าง ${kind === 'pet' ? 'Pet' : 'Avatar'}`}
    </span>

    {#if featured}
      <span class="absolute top-2.5 right-2.5 z-20 rounded-full border-2 border-white bg-gradient-to-r from-amber-400 to-rose-400 px-2.5 py-1 text-[9px] font-black text-white shadow-xs">
        ★ RATE UP {featured.rate.toFixed(2)}%
      </span>
    {/if}
  </div>

  <!-- Selected Item Name & Rarity -->
  <div class="flex items-center justify-between gap-3 rounded-2xl border-2 border-white bg-white/85 px-3.5 py-2.5 shadow-[0_3px_0_#cde0ec]">
    <div>
      <small class="block text-[9px] font-bold text-[#6c8594]">ตัวอย่างที่เลือกบนแท่น</small>
      <strong class="text-base font-black text-[#2b2468]">{focus.name}</strong>
    </div>
    <div class="flex items-center gap-2">
      <RarityChip rarity={focus.rarity} />
      {#if (kind === 'pet' ? player.ownedPetIds : player.ownedAvatarIds).includes(focus.id)}
        <span class="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-extrabold text-sky-700">
          <Check size={12} />มีแล้ว
        </span>
      {/if}
    </div>
  </div>

  <!-- Ticket & Masque Points Balances -->
  <div class="grid grid-cols-2 gap-2.5">
    <div class="flex items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-r from-white to-[#eef8ff] px-3 py-2 shadow-[0_3px_0_#c6dcec]">
      <span class="flex items-center gap-1.5 text-[11px] font-extrabold text-[#3c6078]">
        <CurrencyIcon kind="petGachaTicket" size={24} />คูปองสุ่ม
      </span>
      <strong class="text-sm font-black tabular-nums text-[#1f5d82]">{player.gachaTickets}</strong>
    </div>
    <div class="flex items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-r from-white to-[#fff8e4] px-3 py-2 shadow-[0_3px_0_#e4cf97]">
      <span class="flex items-center gap-1.5 text-[11px] font-extrabold text-[#785616]">
        <CurrencyIcon kind="points" size={24} />Masque Points
      </span>
      <strong class="text-sm font-black tabular-nums text-[#78500d]">{player.masquePoints.toLocaleString()}</strong>
    </div>
  </div>

  <div class="flex items-center justify-between gap-3 rounded-xl border border-[#f0d8a8] bg-[#fff9ea] px-3 py-2">
    <span class="text-[10px] font-bold text-[#6f667a]">คูปองใช้ร่วมกันได้ทั้งตู้ Avatar / Pet</span>
    <strong class="flex items-center gap-1.5 text-xs font-black text-[#825812]">
      <CurrencyIcon kind="petGachaTicket" size={18} />
      {player.demo.config.gachaCost} MP / ใบ
    </strong>
  </div>
  <p class="-mt-2 px-1 text-[10px] font-semibold text-[#647d8c]">
    คูปอง 1 ใบ = หมุน 1 ครั้ง · ซื้อ 10 ใบเปิดจุใจ 11 ครั้ง · ซ้ำคืน {player.demo.config.duplicatePoints} MP · โอกาสออก Energy {energyOdds.toFixed(1)}%
  </p>

  <!-- 3D Game Pull Action Buttons -->
  <div class="grid grid-cols-2 gap-2.5 pt-1">
    <GameButton variant="gold" size="md" block disabled={busy || odds.length === 0} onclick={() => drawOrBuy(1)}>
      {#if busy}
        <LoaderCircle class="animate-spin" size={18} />
      {:else}
        <CurrencyIcon kind="petGachaTicket" size={22} />
      {/if}
      <span>{player.gachaTickets >= 1 ? 'สุ่ม 1 ครั้ง' : 'ซื้อคูปอง 1 ใบ'}</span>
    </GameButton>

    <GameButton variant="purple" size="md" block disabled={busy || odds.length === 0} onclick={() => drawOrBuy(10)}>
      {#if busy}
        <LoaderCircle class="animate-spin" size={18} />
      {:else}
        <CurrencyIcon kind="petGachaTicket" size={22} />
      {/if}
      <span>{player.gachaTickets >= 10 ? 'สุ่ม 10 + แถม 1!' : 'ซื้อ 10 · โบนัส +1'}</span>
    </GameButton>
  </div>

  <details class="rounded-2xl border-2 border-white bg-white/75 px-3.5 text-xs shadow-xs">
    <summary class="min-h-11 cursor-pointer py-3 font-extrabold text-[#3c6078]">
      ดูอัตราสุ่ม {kind === 'pet' ? 'Pet' : 'Avatar'} และ Energy ทั้งหมด
    </summary>
    <div class="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-sky-100 py-3">
      {#each odds as item (`${item.kind}-${item.itemId ?? item.title}`)}
        <span class={item.featured ? 'font-extrabold text-amber-700' : 'font-medium'}>{item.title}{item.featured ? ' · RATE UP' : ''}</span>
        <span class="text-right font-bold tabular-nums">{item.rate.toFixed(2)}%</span>
      {/each}
    </div>
  </details>

  <div class="grid grid-cols-4 gap-2" role="group" aria-label={`ตัวอย่าง ${kind === 'pet' ? 'Pet' : 'Avatar'} ในตู้`}>
    {#each items as item (item.id)}
      {@const owned = (kind === 'pet' ? player.ownedPetIds : player.ownedAvatarIds).includes(item.id)}
      <button
        class={[
          'relative grid min-w-0 justify-items-center gap-1 rounded-xl border-2 p-2 text-[10px] transition-all active:translate-y-0.5 motion-reduce:transition-none',
          focus.id === item.id
            ? 'border-amber-400 bg-[#fffdf2] shadow-[0_3px_0_#e2be68]'
            : 'border-white bg-white/75 shadow-[0_2px_0_#d5e3ed]',
        ]}
        aria-label={`ดูตัวอย่าง ${item.name}`}
        aria-pressed={focus.id === item.id}
        onclick={() => {
          focusId = item.id;
        }}
      >
        <span class="h-16 w-full">
          <AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind={kind} />
        </span>
        <span class="break-words text-center font-bold text-[#2b2468]">{item.name}</span>
        {#if owned}
          <Check class="absolute top-1 right-1 text-sky-700" size={12} />
        {/if}
      </button>
    {/each}
  </div>
</section>

<style>
  .pet-preview :global(img) {
    transition: transform 280ms ease;
  }
</style>
