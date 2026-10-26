<script lang="ts">
  import { Check, Coins, Sparkles, Ticket } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import GameButton from './GameButton.svelte';
  import RarityChip from './RarityChip.svelte';
  import { PETS } from '../data/config';
  import type { PlayerState } from '../types';
  let { player, busy, onDraw }: { player: PlayerState; busy: boolean; onDraw: () => void } = $props();
  let focusId = $state('frostwing');
  let focus = $derived(PETS.find((pet) => pet.id === focusId) ?? PETS[0]);
  let total = $derived(player.demo.config.gachaPool.reduce((sum, item) => sum + item.weight, 0));
  let canDraw = $derived(!busy && total > 0 && (player.gachaTickets > 0 || player.masquePoints >= player.demo.config.gachaCost));
</script>

<section class="space-y-4 border-t border-white py-5" aria-label="Pet Gacha">
  <div class="flex items-center justify-between"><h2 class="flex items-center gap-2 text-lg font-semibold"><Sparkles size={19} />Pet Gacha</h2><span class="text-xs text-[var(--g-muted)]">{player.ownedPetIds.length}/{PETS.length}</span></div>
  <div class="mx-auto h-44 w-44" class:animate-pulse={busy}><AssetPortrait src={focus.imagePath} alt={focus.name} placeholder={focus.placeholder} kind="pet" /></div>
  <div class="flex items-center justify-center gap-2"><strong>{focus.name}</strong><RarityChip rarity={focus.rarity} />{#if player.ownedPetIds.includes(focus.id)}<Check size={14} />{/if}</div>
  <p class="text-center text-xs text-[var(--g-muted)]">ใช้ตั๋วก่อน ถ้าไม่มีใช้ {player.demo.config.gachaCost} MP · ซ้ำคืน {player.demo.config.duplicatePoints} MP · ไม่สวมให้อัตโนมัติ</p>
  <div class="flex justify-center gap-5 text-sm"><span class="flex items-center gap-1"><Ticket size={16} />{player.gachaTickets}</span><span class="flex items-center gap-1"><Coins size={16} />{player.masquePoints.toLocaleString()} MP</span></div>
  <GameButton variant="gold" size="lg" block disabled={!canDraw} onclick={onDraw}>{#if busy}กำลังสุ่ม...{:else if player.gachaTickets > 0}<Ticket size={17} />ใช้ตั๋วสุ่ม 1 ครั้ง{:else}<Coins size={17} />สุ่ม {player.demo.config.gachaCost} MP{/if}</GameButton>
  <details class="text-xs"><summary class="min-h-11 cursor-pointer py-3 font-semibold">โอกาสได้รับ Pet</summary><div class="grid grid-cols-2 gap-2">{#each player.demo.config.gachaPool as item (item.petId)}<span>{PETS.find((pet) => pet.id === item.petId)?.name ?? item.petId}</span><span class="text-right">{total ? (item.weight / total * 100).toFixed(1) : '0'}%</span>{/each}</div></details>
  <div class="grid grid-cols-4 gap-2">{#each PETS as pet (pet.id)}<button class={['relative grid min-w-0 justify-items-center gap-1 rounded-md border bg-white/50 p-2 text-[10px]', focus.id === pet.id ? 'border-sky-500' : 'border-white']} aria-label={`ดู ${pet.name}`} aria-pressed={focus.id === pet.id} onclick={() => { focusId = pet.id; }}><span class="h-16 w-full"><AssetPortrait src={pet.imagePath} alt="" placeholder={pet.placeholder} kind="pet" /></span><span class="break-words text-center">{pet.name}</span>{#if player.ownedPetIds.includes(pet.id)}<Check class="absolute top-1 right-1 text-sky-700" size={11} />{/if}</button>{/each}</div>
</section>