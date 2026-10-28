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

<section class="space-y-4 border-t border-white py-5" aria-label="ตู้สุ่ม Avatar และ Pet">
  <div class="flex items-end justify-between gap-3">
    <div><p class="text-[9px] font-bold tracking-[0.12em] text-sky-700">MASQUE CAPSULE GACHA</p><h2 class="flex items-center gap-2 text-lg font-extrabold text-[#315a73]"><PawPrint size={19} />ตู้สุ่ม {kind === 'pet' ? 'สัตว์เลี้ยง' : 'Avatar'}</h2></div>
    <span class="shrink-0 rounded-full border border-white bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#55798a]">สะสม {ownedCount}/{items.length}</span>
  </div>

  <div class="grid grid-cols-2 gap-1 rounded-lg border-2 border-white bg-[#e7f2fc]/90 p-1" role="tablist" aria-label="ประเภทตู้สุ่ม">
    <button class={['flex min-h-11 items-center justify-center gap-2 rounded-md text-xs font-bold', kind === 'pet' ? 'bg-[#63a9ca] text-white shadow-[0_3px_0_#3d82a6]' : 'text-[#6b8795]']} role="tab" aria-selected={kind === 'pet'} onclick={() => { kind = 'pet'; focusId = 'frostwing'; }}><PawPrint size={16} />Pet</button>
    <button class={['flex min-h-11 items-center justify-center gap-2 rounded-md text-xs font-bold', kind === 'avatar' ? 'bg-[#63a9ca] text-white shadow-[0_3px_0_#3d82a6]' : 'text-[#6b8795]']} role="tab" aria-selected={kind === 'avatar'} onclick={() => { kind = 'avatar'; focusId = 'luna'; }}><Sparkles size={16} />Avatar</button>
  </div>

  <div class="gacha-stage relative isolate mx-auto flex h-60 w-full max-w-[330px] items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-[linear-gradient(145deg,#e1f5fb_0%,#f8fbff_48%,#fff0d9_100%)] shadow-[0_5px_0_#b7d9e3]" aria-label={`ตัวอย่าง ${kind === 'pet' ? 'Pet' : 'Avatar'} ${focus.name}`}>
    <span class="absolute inset-x-8 bottom-3 h-3 rounded-full bg-[#8dbdcc]/30" aria-hidden="true"></span>
    {#if GACHA_ARTWORK.machine && !machineFailed}
      <img class="absolute inset-0 h-full w-full object-contain" src={GACHA_ARTWORK.machine} alt="" onerror={() => { machineFailed = true; }} />
    {:else}
      <div class="gacha-machine absolute top-3 left-1/2 h-[210px] w-[174px] -translate-x-1/2 rounded-[30px_30px_20px_20px] border-[5px] border-white bg-gradient-to-b from-[#72c4df] via-[#bde9f4] to-[#f5d6a5] shadow-[0_6px_0_#498da7]" aria-hidden="true">
        <span class="absolute inset-x-3 top-2 grid h-6 place-items-center rounded-md border border-white/80 bg-[#fff8e8] text-[8px] font-black tracking-[0.12em] text-[#417c95]">MASQUE · {kind === 'pet' ? 'PET' : 'AVATAR'}</span>
        <span class="absolute top-9 left-1/2 h-[112px] w-[132px] -translate-x-1/2 rounded-[48%] border-[5px] border-white/90 bg-[linear-gradient(150deg,#ffffffc9,#8ed8eb88)] shadow-[inset_0_3px_8px_#397b9422,0_3px_0_#6aaac0]">
          <i class="absolute top-3 left-4 h-5 w-3 rotate-[-24deg] rounded-full border border-white bg-[#f7b9b3]"></i><i class="absolute right-4 bottom-3 h-5 w-3 rotate-[24deg] rounded-full border border-white bg-[#f5d584]"></i>
        </span>
        <span class="absolute right-3 bottom-5 left-3 h-10 rounded-lg border-2 border-white/90 bg-[#edf8fa] shadow-[inset_0_2px_4px_#568ba522]"></span>
        <span class="absolute right-6 bottom-7 h-2 w-8 rounded-full bg-[#5c9db1]"></span>
        <span class="absolute top-1/2 -right-3 h-8 w-2 rounded-full bg-[#e6ad48] shadow-[2px_2px_0_#fff]" aria-hidden="true"></span>
      </div>
    {/if}
    <div class="absolute top-[18%] left-1/2 z-10 grid h-[48%] w-[52%] -translate-x-1/2 place-items-center">
      <div class="pet-preview h-full w-full"><AssetPortrait src={focus.imagePath} alt={focus.name} placeholder={focus.placeholder} kind={kind} /></div>
    </div>
    {#if busy}
      <div class="gacha-spin absolute top-[27%] left-1/2 z-20 grid size-12 place-items-center" aria-hidden="true">
        {#if GACHA_ARTWORK.capsule && !capsuleFailed}<img class="h-full w-full object-contain" src={GACHA_ARTWORK.capsule} alt="" onerror={() => { capsuleFailed = true; }} />{:else}<span class="spin-capsule"><i></i></span>{/if}
      </div>
    {/if}
    <span class="absolute top-2 left-2 flex items-center gap-1 rounded-md border border-white bg-white/90 px-2 py-1 text-[9px] font-bold text-[#55798a]" aria-live="polite"><Sparkles size={11} class={busy ? 'animate-spin' : ''} />{busy ? 'กำลังหมุนตู้...' : `ตัวอย่าง ${kind === 'pet' ? 'Pet' : 'Avatar'}`}</span>
  </div>

  <div class="flex items-center justify-between gap-3 px-1">
    <div><small class="block text-[9px] font-semibold text-[#78909a]">ตัวอย่างที่เลือก</small><strong class="text-sm text-[#315a73]">{focus.name}</strong></div>
    <div class="flex items-center gap-2"><RarityChip rarity={focus.rarity} />{#if (kind === 'pet' ? player.ownedPetIds : player.ownedAvatarIds).includes(focus.id)}<span class="flex items-center gap-1 text-[9px] font-semibold text-sky-700"><Check size={12} />มีแล้ว</span>{/if}</div>
  </div>

  {#if featured}<div class="flex items-center justify-between gap-3 rounded-md border border-[#f1d389] bg-[#fff5d8] px-3 py-2"><span class="text-[9px] font-bold text-[#9b6b16]">RATE UP · {featured.title}</span><strong class="text-[10px] tabular-nums text-[#9b6b16]">{featured.rate.toFixed(2)}%</strong></div>{/if}

  <div class="grid grid-cols-2 gap-2">
    <div class="flex items-center justify-between gap-2 rounded-md border border-white bg-white/70 px-3 py-2"><span class="flex items-center gap-1.5 text-[10px] font-semibold text-[#6b8795]"><CurrencyIcon kind="petGachaTicket" size={17} />คูปองสุ่ม</span><strong class="text-xs tabular-nums text-[#3e7e98]">{player.gachaTickets}</strong></div>
    <div class="flex items-center justify-between gap-2 rounded-md border border-white bg-white/70 px-3 py-2"><span class="flex items-center gap-1.5 text-[10px] font-semibold text-[#6b8795]"><CurrencyIcon kind="points" size={17} />Masque Points</span><strong class="text-xs tabular-nums text-[#9a6a18]">{player.masquePoints.toLocaleString()}</strong></div>
  </div>

  <div class="flex items-center justify-between gap-3 rounded-md border border-[#f2dfb6] bg-[#fff8e8] px-3 py-2.5">
    <span class="text-[10px] font-semibold text-[#7b7780]">ใช้คูปองร่วม Avatar / Pet</span>
    <strong class="flex items-center gap-1.5 text-xs text-[#8e651d]"><CurrencyIcon kind="petGachaTicket" size={18} />{player.demo.config.gachaCost} MP / คูปอง</strong>
  </div>
  <p class="-mt-2 text-[10px] text-[#718a96]">คูปอง 1 ใบ = 1 ครั้ง · ซื้อ 10 ใบเปิด 11 ครั้ง · ของซ้ำคืน {player.demo.config.duplicatePoints} MP · Energy มีโอกาสออก {energyOdds.toFixed(1)}%</p>

  <div class="grid grid-cols-2 gap-2">
    <GameButton variant="gold" size="md" block disabled={busy || odds.length === 0} onclick={() => drawOrBuy(1)}>
      {#if busy}<LoaderCircle class="animate-spin" size={16} />{:else}<Sparkles size={16} />{/if}{player.gachaTickets >= 1 ? 'เปิด 1 ครั้ง' : 'ซื้อคูปอง 1 ใบ'}
    </GameButton>
    <GameButton variant="purple" size="md" block disabled={busy || odds.length === 0} onclick={() => drawOrBuy(10)}>
      {#if busy}<LoaderCircle class="animate-spin" size={16} />{:else}<Sparkles size={16} />{/if}{player.gachaTickets >= 10 ? 'เปิด 10 + 1' : 'ซื้อ 10 · โบนัส +1'}
    </GameButton>
  </div>

  <details class="rounded-md border border-white bg-white/60 px-3 text-xs"><summary class="min-h-11 cursor-pointer py-3 font-semibold text-[#456d80]">อัตราสุ่ม {kind === 'pet' ? 'Pet' : 'Avatar'} และ Energy</summary><div class="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-sky-100 py-3">{#each odds as item (`${item.kind}-${item.itemId ?? item.title}`)}<span class={item.featured ? 'font-bold text-amber-700' : ''}>{item.title}{item.featured ? ' · RATE UP' : ''}</span><span class="text-right tabular-nums">{item.rate.toFixed(2)}%</span>{/each}</div></details>

  <div class="grid grid-cols-4 gap-2" role="group" aria-label={`ตัวอย่าง ${kind === 'pet' ? 'Pet' : 'Avatar'} ในตู้`}>
    {#each items as item (item.id)}{@const owned = (kind === 'pet' ? player.ownedPetIds : player.ownedAvatarIds).includes(item.id)}<button class={['relative grid min-w-0 justify-items-center gap-1 rounded-md border bg-white/60 p-2 text-[10px] transition-[transform,border-color] active:translate-y-0.5 motion-reduce:transition-none', focus.id === item.id ? 'border-sky-500 shadow-[0_2px_0_#b9dce6]' : 'border-white']} aria-label={`ดูตัวอย่าง ${item.name}`} aria-pressed={focus.id === item.id} onclick={() => { focusId = item.id; }}><span class="h-16 w-full"><AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind={kind} /></span><span class="break-words text-center font-semibold">{item.name}</span>{#if owned}<Check class="absolute top-1 right-1 text-sky-700" size={11} />{/if}</button>{/each}
  </div>
</section>

<style>
  .pet-preview :global(img) { transition: transform 280ms ease; }
  .gacha-stage:has(.gacha-spin) .pet-preview :global(img) { filter: brightness(0.78); }
  .gacha-spin { animation: gacha-wobble 480ms ease-in-out infinite alternate; }
  .spin-capsule { position: relative; display: block; width: 30px; height: 42px; overflow: hidden; border: 3px solid white; border-radius: 999px; background: linear-gradient(180deg, #f7a7b3 0 48%, #fff 49% 53%, #84cee0 54%); box-shadow: 0 3px 0 #548ba1, 0 5px 12px #457e9544; }
  .spin-capsule i { position: absolute; top: 48%; left: 0; width: 100%; height: 3px; background: #fff; }
  @keyframes gacha-wobble { from { transform: translateX(-50%) rotate(-12deg) scale(0.9); } to { transform: translateX(-50%) rotate(12deg) scale(1.08); } }
  @media (prefers-reduced-motion: reduce) { .pet-preview :global(img) { transition: none; } .gacha-spin { animation: none; } }
</style>