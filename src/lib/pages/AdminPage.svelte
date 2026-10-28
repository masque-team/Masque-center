<script lang="ts">
  import { onMount } from 'svelte';
  import { Clock3, Coins, FlaskConical, RotateCcw, Save, Settings2, Trophy } from '@lucide/svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { createDemo } from '../services/demoService';
  import { AVATARS, PETS, PROFILE_BACKGROUNDS, WINGS } from '../data/config';
  import type { DemoConfig, DemoReward, PlayerState } from '../types';
  let { player, onSave, onReset, onClock, onRankingReset, onSeed }: {
    player: PlayerState; onSave: (config: DemoConfig) => void; onReset: () => void;
    onClock: (hours: number) => void; onRankingReset: () => void; onSeed: () => void;
  } = $props();
  let draft = $state<DemoConfig>(createDemo().config);
  let section = $state('economy');
  let passIndex = $state(0);
  let newCatalogItem = $state('avatar:nami');
  let newCatalogPrice = $state(100);
  let catalogMessage = $state('');
  onMount(() => { draft = structuredClone($state.snapshot(player.demo.config)); });
  const numericFields = [
    ['energyMax', 'เพดาน Energy', 1], ['regenMinutes', 'ฟื้น 1 Energy ทุก (นาที)', 1], ['energyCost', 'Energy ต่อเกม', 1],
    ['exchangeRate', 'MP ต่อ 1 AIS Point', 1], ['checkinReward', 'Check-in reward (MP)', 0], ['missionTarget', 'ภารกิจเล่นจบ (ครั้ง)', 1],
    ['missionXp', 'ภารกิจให้ Pass XP', 1], ['gachaCost', 'Gacha (MP)', 0],
    ['duplicatePoints', 'Pet ซ้ำคืน (MP)', 0], ['rankingPrize', 'Ranking prize (MP)', 0], ['arenaTicketPrice', 'บัตรเข้า Ranked (MP/ใบ)', 1], ['battlePrize', 'รางวัลจบ Ranked (MP)', 0],
  ] as const;
  function rewardItems(type: DemoReward['type']) {
    if (type === 'avatar') return AVATARS;
    if (type === 'pet') return PETS;
    if (type === 'wing') return WINGS;
    if (type === 'background') return PROFILE_BACKGROUNDS;
    if (type === 'badge') return [{ id: 'season-explorer', name: 'Season Explorer' }];
    return [{ id: 'ocean', name: 'Ocean' }, { id: 'sunrise', name: 'Sunrise' }];
  }

  function addProduct() {
    const [kind, itemId] = newCatalogItem.split(':');
    if ((kind !== 'avatar' && kind !== 'pet') || !Number.isSafeInteger(newCatalogPrice) || newCatalogPrice < 0) { catalogMessage = 'กรุณาตรวจสอบราคา'; return; }
    if (draft.shop.some((item) => item.kind === kind && item.itemId === itemId)) { catalogMessage = 'สินค้านี้อยู่ใน Catalog แล้ว'; return; }
    draft.shop = [...draft.shop, { id: `${kind}-${itemId}`, kind, itemId, cost: newCatalogPrice }];
    catalogMessage = 'เพิ่มสินค้าแล้ว กดบันทึกเพื่อนำไปใช้';
  }
</script>

<div class="page-stack">
  <PageTitle eyebrow="LOCAL DEMO CONFIGURATION" title="Demo Studio" subtitle="Marketing & Admin · ไม่มีระบบสิทธิ์จริง">{#snippet icon()}<Settings2 size={26} />{/snippet}</PageTitle>
  <div class="flex items-center gap-2 border-y border-sky-200 bg-sky-50/60 px-2 py-3 text-xs text-sky-800"><FlaskConical size={18} /><span>DEMO ONLY · การเปลี่ยนค่ามีผลกับเครื่องนี้</span></div>
  <div class="grid grid-cols-2 gap-2">
    <GameButton variant="ghost" size="sm" onclick={() => onClock(1)}><Clock3 size={15} />เวลา +1 ชม.</GameButton>
    <GameButton variant="ghost" size="sm" onclick={() => onClock(24 * 8)}><Clock3 size={15} />เวลา +8 วัน</GameButton>
    <GameButton variant="ghost" size="sm" onclick={onSeed}><Coins size={15} />เติมทุนจำลอง</GameButton>
    <GameButton variant="ghost" size="sm" onclick={onReset}><RotateCcw size={15} />Reset Demo</GameButton>
  </div>
  <div class="grid grid-cols-4 gap-1 border-b border-white pb-2" aria-label="หมวดตั้งค่า">{#each [{ id: 'economy', label: 'Economy' }, { id: 'season', label: 'Seasons' }, { id: 'catalog', label: 'Catalog' }, { id: 'social', label: 'Social' }] as item (item.id)}<button class="min-h-11 min-w-0 rounded-md px-1 text-xs font-bold" class:bg-white={section === item.id} aria-pressed={section === item.id} onclick={() => section = item.id}>{item.label}</button>{/each}</div>
  <form class="space-y-5" onsubmit={(event) => { event.preventDefault(); onSave(structuredClone($state.snapshot(draft))); }}>
    {#if section === 'economy'}
      <section class="grid grid-cols-2 gap-3">{#each numericFields as [key, label, min] (key)}<label class="grid content-start gap-1 text-xs font-semibold">{label}<input class="min-h-11 min-w-0 rounded-md border border-white bg-white/70 px-3 text-sm" type="number" {min} max="100000" required bind:value={draft[key]} /></label>{/each}</section>
      <label class="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" bind:checked={draft.vipUnlimited} />VIP เล่นแบบ Energy ไม่จำกัด</label>
      <h2 class="font-bold">Energy Packs</h2>
      {#each draft.energyPacks as pack (pack)}<div class="grid grid-cols-2 gap-3"><label class="grid gap-1 text-xs">{pack.id} · Energy<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" type="number" min="1" required bind:value={pack.energy} /></label><label class="grid gap-1 text-xs">ราคา MP<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" type="number" min="0" required bind:value={pack.cost} /></label></div>{/each}
      <h2 class="font-bold">VIP Plans</h2>
      {#each draft.vipPlans as plan (plan.id)}
        <fieldset class="space-y-2 border-t border-white pt-3"><legend class="text-sm font-bold">{plan.label}</legend>
          <label class="grid gap-1 text-xs">ชื่อแพ็กเกจ<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" required bind:value={plan.label} /></label>
          <div class="grid grid-cols-2 gap-3"><label class="grid gap-1 text-xs">ระยะเวลา (วัน)<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" type="number" min="30" max="30" readonly required bind:value={plan.durationDays} /></label><label class="grid gap-1 text-xs">ราคา MP<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" type="number" min="0" required bind:value={plan.cost} /></label><label class="grid gap-1 text-xs">โบนัส MP<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" type="number" min="0" required bind:value={plan.bonusPoints} /></label><label class="grid gap-1 text-xs">โบนัส Gacha Tickets<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" type="number" min="0" required bind:value={plan.bonusTickets} /></label></div>
        </fieldset>
      {/each}
    {:else if section === 'season'}
      <label class="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={draft.passAutomatic !== false} onchange={(event) => { draft.passAutomatic = event.currentTarget.checked; }} />รอบซีซันจริง 30 วัน (ปิดเพื่อ Preview)</label>
      <label class="grid gap-2 text-sm font-semibold">Battle Pass Season<select class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" bind:value={draft.passSeasonId}>{#each draft.seasons as season (season)}<option value={season.id}>{season.name}</option>{/each}</select></label>
      <label class="grid gap-2 text-sm font-semibold">Ranking Season ID<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" maxlength="40" required bind:value={draft.rankingSeasonId} /></label>
      <GameButton variant="ghost" size="sm" onclick={onRankingReset}><Trophy size={15} />รีเซ็ตคะแนน Season ปัจจุบัน</GameButton>
      <label class="grid gap-2 text-sm font-semibold">แก้ไข Reward Table<select class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" bind:value={passIndex}>{#each draft.seasons as season, index (index)}<option value={index}>{season.name}</option>{/each}</select></label>
      <label class="grid gap-1 text-xs">ชื่อซีซัน<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" required bind:value={draft.seasons[passIndex].name} /></label>
      <div class="grid grid-cols-2 gap-3"><label class="grid gap-1 text-xs">เริ่ม Preview<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-2 disabled:opacity-40" type="date" disabled={draft.passAutomatic !== false} required bind:value={draft.seasons[passIndex].starts} /></label><label class="grid gap-1 text-xs">สิ้นสุด Preview<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-2 disabled:opacity-40" type="date" disabled={draft.passAutomatic !== false} required bind:value={draft.seasons[passIndex].ends} /></label></div>
      <label class="grid gap-1 text-xs">Season Theme<select class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" bind:value={draft.seasons[passIndex].theme}><option value="water">Songkran / Water</option><option value="lantern">Loy Krathong / Lantern</option></select></label>
      {#each ['free', 'premium'] as lane (lane)}
        {@const track = lane as 'free' | 'premium'}
        <h2 class="border-t border-white pt-3 text-sm font-bold uppercase">{track} rewards</h2>
        {#each draft.seasons[passIndex][track] as reward, index (index)}<fieldset class="grid grid-cols-2 gap-2 rounded-lg border border-white bg-white/30 p-3"><legend class="px-1 text-xs">Tier {index + 1}</legend><label class="col-span-2 grid gap-1 text-xs">ชื่อรางวัล<input class="min-h-10 min-w-0 rounded-md bg-white/80 px-2" required bind:value={reward.title} /></label><label class="grid gap-1 text-xs">ประเภท<select class="min-h-10 min-w-0 rounded-md bg-white/80 px-2" bind:value={reward.type}><option value="points">MP</option><option value="energy">Energy</option><option value="ticket">Gacha Ticket</option><option value="arena-ticket">Ranked Ticket</option><option value="avatar">Avatar</option><option value="pet">Pet</option><option value="wing">Wings</option><option value="frame">Frame</option><option value="background">Background</option><option value="badge">Badge</option></select></label>{#if ['avatar', 'pet', 'wing', 'frame', 'background', 'badge'].includes(reward.type)}<label class="grid gap-1 text-xs">Item<select class="min-h-10 min-w-0 rounded-md bg-white/80 px-2" required bind:value={reward.itemId}><option value="">เลือก Item</option>{#each rewardItems(reward.type) as item (item.id)}<option value={item.id}>{item.name}</option>{/each}</select></label>{:else}<label class="grid gap-1 text-xs">จำนวน<input class="min-h-10 min-w-0 rounded-md bg-white/80 px-2" type="number" min="1" required bind:value={reward.amount} /></label>{/if}</fieldset>{/each}
      {/each}
    {:else if section === 'catalog'}
      <h2 class="font-bold">Game Registry</h2>
      {#each draft.games as game (game.id)}<fieldset class="space-y-2 border-t border-white pt-3"><legend class="text-sm font-bold">{game.name}</legend><label class="grid gap-1 text-xs">Hosted URL<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-2" type="url" required bind:value={game.url} /></label><label class="grid gap-1 text-xs">ลำดับแสดง<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-2" type="number" min="0" required bind:value={game.displayOrder} /></label><label class="flex min-h-10 items-center gap-2 text-xs"><input type="checkbox" bind:checked={game.published} />เผยแพร่ใน Catalog</label></fieldset>{/each}
      <h2 class="border-t border-white pt-3 font-bold">Shop Prices</h2>
      {#each draft.shop as item (item)}<label class="flex items-center justify-between gap-3 text-xs"><span>{item.id}</span><input class="min-h-10 w-24 rounded-md bg-white/70 px-2" type="number" min="0" required aria-label={`ราคา ${item.id}`} bind:value={item.cost} /></label>{/each}
      <h2 class="border-t border-white pt-3 font-bold">Gacha Weights</h2>
      <div class="grid grid-cols-2 gap-2"><label class="grid gap-1 text-xs">เพิ่มสินค้า<select class="min-h-11 min-w-0 rounded-md bg-white/70 px-2" bind:value={newCatalogItem}>{#each AVATARS as item (item.id)}<option value={`avatar:${item.id}`}>Avatar · {item.name}</option>{/each}{#each PETS as item (item.id)}<option value={`pet:${item.id}`}>Pet · {item.name}</option>{/each}</select></label><label class="grid gap-1 text-xs">ราคา MP<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-2" type="number" min="0" bind:value={newCatalogPrice} /></label></div>
      <GameButton size="sm" variant="ghost" onclick={addProduct}>เพิ่มใน Shop Catalog</GameButton>
      {#if catalogMessage}<p class="text-xs text-sky-700" role="status">{catalogMessage}</p>{/if}
      {#each draft.gachaPool as item (item)}<label class="flex items-center justify-between gap-3 text-xs"><span>{item.petId}</span><input class="min-h-10 w-24 rounded-md bg-white/70 px-2" type="number" min="0" required aria-label={`น้ำหนัก ${item.petId}`} bind:value={item.weight} /></label>{/each}
    {:else}
      <label class="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" bind:checked={draft.battleEnabled} />เปิด Battle Mode</label>
      <label class="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" bind:checked={draft.worldEnabled} />เปิด Social World</label>
      <label class="grid gap-2 text-sm">World Theme<select class="min-h-11 rounded-md bg-white/70 px-3" bind:value={draft.worldTheme}><option value="water">Water Festival</option><option value="lantern">Lantern Festival</option></select></label>
      <label class="grid gap-2 text-sm">ประกาศ World<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" maxlength="100" bind:value={draft.announcement} /></label>
      <label class="grid gap-2 text-sm">กติกาชุมชน<input class="min-h-11 min-w-0 rounded-md bg-white/70 px-3" maxlength="100" required bind:value={draft.moderationRule} /></label>
    {/if}
    <div class="sticky bottom-24 z-10 border-t border-white bg-white/90 p-2 backdrop-blur"><GameButton block type="submit"><Save size={17} />บันทึกการตั้งค่า</GameButton></div>
  </form>
</div>