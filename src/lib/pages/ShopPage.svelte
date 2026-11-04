<script lang="ts">
  import { ShoppingBag, Sparkles, Zap } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, GACHA_ARTWORK, NAV_ARTWORK, PETS, WINGS } from '../data/config';
  import { energyCapacity } from '../services/energyService';
  import type { PlayerState, ShopTab } from '../types';

  let {
    player,
    vipActive,
    countdown,
    tab = $bindable(),
    onBuy,
    onRefill,
    onBuyGachaBox,
    onOpenGachaBox,
    onVip,
    onMockAisTopUp,
  }: {
    player: PlayerState;
    vipActive: boolean;
    tab: ShopTab;
    onBuy: (id: string) => void;
    onRefill: (id: string) => void;
    countdown: string;
    onBuyGachaBox: (kind: 'avatar' | 'pet') => void;
    onOpenGachaBox: (kind: 'avatar' | 'pet') => void;
    onVip: (id: string) => void;
    onMockAisTopUp: (amount: number) => void;
  } = $props();

  let category = $state<'all' | 'avatar' | 'pet' | 'wing' | 'frame'>('all');
  let maxEnergy = $derived(energyCapacity(player, vipActive));
  let gachaCost = $derived(player.demo.config.gachaCost);

  const tabs = [
    { id: 'items', label: 'ของขาย', kind: 'points' as const },
    { id: 'energy', label: 'Energy', kind: 'energyPotion' as const },
    { id: 'vip', label: 'VIP', kind: 'aisPoints' as const },
    { id: 'exchange', label: 'AIS Point', kind: 'aisPoints' as const },
  ] as const;

  let products = $derived(
    player.demo.config.shop
      .filter((item) => category === 'all' || item.kind === category)
      .map((item) => {
        const art =
          item.kind === 'avatar'
            ? AVATARS.find((entry) => entry.id === item.itemId)
            : item.kind === 'pet'
              ? PETS.find((entry) => entry.id === item.itemId)
              : item.kind === 'wing'
                ? WINGS.find((entry) => entry.id === item.itemId)
                : AVATARS.find((entry) => entry.id === player.avatarId);
        const owned = (
          item.kind === 'avatar'
            ? player.ownedAvatarIds
            : item.kind === 'pet'
              ? player.ownedPetIds
              : item.kind === 'wing'
                ? player.demo.wings
                : player.demo.frames
        ).includes(item.itemId);
        return { ...item, art, owned };
      }),
  );
</script>

<div class="space-y-4 pb-8 [overflow-anchor:none]">
  <div class="flex h-15 items-center justify-between rounded-2xl border-2 border-white bg-gradient-to-r from-white/90 via-[#fff8eb]/90 to-[#e8f4ff]/90 px-3.5 shadow-[0_4px_0_#c8d8ec]">
    <div class="flex items-center gap-2.5">
      <img class="size-11 shrink-0 object-contain drop-shadow-[0_3px_4px_rgba(60,40,120,0.22)]" src={NAV_ARTWORK.shop} alt="" />
      <div>
        <p class="text-[10px] font-extrabold tracking-wider text-sky-700">AIS POINT · DEMO STORE</p>
        <h1 class="text-xl font-black leading-tight text-[#2b2468]">Shop ร้านค้าแฟนตาซี</h1>
      </div>
    </div>
    <div class="flex items-center gap-1.5 rounded-full border border-amber-200 bg-[#fff9e6] px-2.5 py-1 text-xs font-black text-[#6f4b0c] shadow-xs">
      <CurrencyIcon kind="aisPoints" size={20} />
      <span class="tabular-nums">{player.aisPoints.toLocaleString()}</span>
    </div>
  </div>

  <div
    class="sticky top-[74px] z-20 grid grid-cols-4 gap-1 rounded-2xl border-2 border-white bg-[#e8f1ff]/95 p-1.5 shadow-[0_4px_0_#c5d5eb] backdrop-blur-md"
    role="tablist"
    aria-label="หมวดร้านค้า"
  >
    {#each tabs as item (item.id)}
      <button
        class={[
          'flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold transition-all',
          tab === item.id
            ? 'border border-amber-200 bg-gradient-to-b from-white to-[#fff6df] text-[#352778] shadow-[0_3px_0_#d7c28a]'
            : 'text-[#6c7699] hover:text-[#3d317c]',
        ]}
        role="tab"
        aria-selected={tab === item.id}
        onclick={() => {
          tab = item.id;
        }}
      >
        <CurrencyIcon kind={item.kind} size={20} />
        {item.label}
      </button>
    {/each}
  </div>

  <section class="min-h-[calc(100dvh_-_180px)]" aria-label={tab === 'exchange' ? 'แพ็กเติมแต้ม' : tab === 'energy' ? 'เติม Energy' : 'สินค้า'}>
    {#if tab === 'exchange'}
      <div class="space-y-4">
        <section class="space-y-3 rounded-2xl border-2 border-white bg-white/80 p-4" aria-label="AIS Point top-up จำลอง">
          <h2 class="text-base font-black text-[#2b2468]">AIS Point · Demo top-up</h2>
          <p class="text-xs text-[#71839a]">ยอด {player.aisPoints.toLocaleString()} · ไม่เรียก Billing API และไม่มีการตัดเงินจริง</p>
          <div class="grid grid-cols-2 gap-2">{#each [100, 500] as amount (amount)}<GameButton block variant="mint" onclick={() => onMockAisTopUp(amount)}>จำลอง +{amount} AIS Point</GameButton>{/each}</div>
        </section>
      </div>
    {:else if tab === 'vip'}
      <div class="space-y-3">
        <h2 class="font-black text-[#2b2468]">VIP · เข้าเกมปกติฟรี · Energy MAX 15 → 30</h2>
        <p class="text-xs text-[#71839a]">Energy cap 30 ระหว่าง VIP · ไม่รวม Continue, Campaign Ticket หรือ Premium Pass · ราคาเป็น AIS Point เดโม</p>
        {#if vipActive && player.vipExpiresAt}<p class="border-y border-white py-2 text-xs font-bold">ใช้งานถึง {new Date(player.vipExpiresAt).toLocaleString('th-TH')}</p>{/if}
        {#each player.demo.config.vipPlans as plan (plan.id)}<button class="flex min-h-14 w-full items-center justify-between gap-3 border-b border-white/80 px-2 text-left" aria-label={`${vipActive ? 'ต่ออายุ' : 'ซื้อ'} ${plan.label} · ${plan.cost} AIS Point`} onclick={() => onVip(plan.id)}><span><strong class="block text-sm">{plan.label}</strong><small class="text-xs text-[#71839a]">{plan.durationDays < 1 ? `${Math.round(plan.durationDays * 24)} ชั่วโมง` : `${plan.durationDays} วัน`} · ราคาเดโม</small></span><b class="shrink-0 text-amber-800">{plan.cost} AIS Point</b></button>{/each}
      </div>
    {:else if tab === 'energy'}
      <div class="space-y-4">
        <section class="space-y-3 rounded-2xl border-2 border-white bg-gradient-to-br from-white via-[#f2faff] to-[#e1f3ff] p-4 shadow-[0_5px_0_#bfd8ea]" aria-label="สถานะ Energy">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-base font-black text-[#255275]">
              <CurrencyIcon kind="energyPotion" size={28} />
              พลังงานของคุณ (Energy)
            </h2>
            <strong class="rounded-full border border-sky-200 bg-white px-3 py-0.5 text-lg font-black tabular-nums text-sky-700">
              ⚡ {player.energy}/{maxEnergy}
            </strong>
          </div>
          <div class="h-3 overflow-hidden rounded-full border border-white bg-sky-100 p-0.5 shadow-inner">
            <span
              class="block h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#fbbf24] transition-all duration-300"
              style={`width:${Math.min(100, (player.energy / maxEnergy) * 100)}%`}
            ></span>
          </div>
          {#if player.energy < maxEnergy}
            <p class="text-xs font-semibold text-[#4d6f82]">
              ฟื้นฟูอัตโนมัติ +1 ทุก {player.demo.config.regenMinutes} นาที · ครั้งถัดไปใน <strong class="tabular-nums text-sky-700">{countdown}</strong>
            </p>
          {:else}
            <p class="text-xs font-semibold text-[#4d6f82]">
              Energy เต็มหลอดแล้ว · ซื้อแพ็กเพิ่มสะสมเกินเพดานได้!
            </p>
          {/if}
          {#if vipActive}
            <p class="rounded-xl border border-amber-200 bg-[#fff9e8] p-2.5 text-[11px] font-semibold leading-relaxed text-amber-800">
              VIP ทำงานอยู่: เกมปกติเข้าฟรี · Energy MAX {maxEnergy} · Continue ยังใช้ Energy
            </p>
          {/if}
        </section>

        <h2 class="flex items-center gap-1.5 text-sm font-black text-[#2b2468]">
          <Sparkles size={16} class="text-amber-500" />แพ็กเกจขวดเติม Energy
        </h2>
        <div class="grid grid-cols-2 gap-3">
          {#each player.demo.config.energyPacks as pack, idx (pack.id)}
            <article class="relative grid min-w-0 justify-items-center gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-white via-[#f5fbff] to-[#e4f4ff] p-3.5 pt-5 text-center shadow-[0_5px_0_#bdd6e6]">
              <span class="absolute -top-2.5 rounded-full border border-white bg-gradient-to-r from-sky-500 to-indigo-500 px-2.5 py-0.5 text-[9px] font-extrabold text-white">
                {idx === 0 ? '⚡ แพ็กพกพา' : '🌟 แพ็กสุดคุ้ม'}
              </span>
              <div class="my-1 grid size-20 place-items-center rounded-2xl border border-white bg- radial from-white to-sky-50">
                <CurrencyIcon kind="energyPotion" size={idx === 0 ? 58 : 70} />
              </div>
              <strong class="text-2xl font-black text-[#1e4b6e]">+{pack.energy} Energy</strong>
              <span class="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-[#5a798c]">
                หลังเติม {player.energy + pack.energy}/{maxEnergy}
              </span>
              <GameButton
                block
                size="sm"
                variant="gold"
                disabled={player.aisPoints < pack.cost}
                onclick={() => onRefill(pack.id)}
              >
                <CurrencyIcon kind="aisPoints" size={16} />
                ซื้อ · {pack.cost} AIS Point
              </GameButton>
            </article>
          {/each}
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        <section class="space-y-2" aria-label="กล่องสุ่ม Gacha">
          <h2 class="text-sm font-black text-[#2b2468]">Gacha Boxes · ซื้อแล้วสุ่มจากกล่อง</h2>
          <div class="grid grid-cols-2 gap-3">
            {#each [{ kind: 'pet' as const, label: 'Pet Box' }, { kind: 'avatar' as const, label: 'Avatar Box' }] as box (box.kind)}
              {@const ownedBoxes = player.demo.gachaBoxes?.[box.kind] ?? 0}
              <article class="grid min-w-0 justify-items-center gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-white to-[#eef7ff] p-3 text-center shadow-[0_5px_0_#c4d9eb]">
                <img class="h-16 w-16 object-contain" src={GACHA_ARTWORK.capsule ?? 'assets/gacha/gacha-capsule.png'} alt="" />
                <strong class="text-sm font-black text-[#29436b]">{box.label}</strong>
                <span class="text-[10px] text-slate-600">ในกระเป๋า {ownedBoxes} กล่อง · {gachaCost} AIS Point/กล่อง</span>
                <GameButton block size="sm" variant="gold" disabled={player.aisPoints < gachaCost} onclick={() => onBuyGachaBox(box.kind)}><CurrencyIcon kind="aisPoints" size={15} />ซื้อกล่อง</GameButton>
                <GameButton block size="sm" variant="purple" disabled={ownedBoxes < 1} onclick={() => onOpenGachaBox(box.kind)}>สุ่มจากกล่อง</GameButton>
              </article>
            {/each}
          </div>
        </section>

        <!-- Category Filter Pills -->
        <div class="flex items-center justify-between pt-1">
          <h2 class="flex items-center gap-1.5 text-sm font-black text-[#2b2468]">
            <ShoppingBag size={16} class="text-sky-600" />คอลเลกชันแฟชั่น & สัตว์เลี้ยง
          </h2>
          <span class="text-[10px] font-bold text-[#71839a]">{products.length} รายการ</span>
        </div>

        <div class="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="ประเภทสินค้า">
          {#each [{ id: 'all', label: 'ทั้งหมด' }, { id: 'avatar', label: 'Avatar' }, { id: 'pet', label: 'Pet' }, { id: 'wing', label: 'ปีก' }, { id: 'frame', label: 'กรอบ' }] as item (item.id)}
            <button
              class={[
                'min-h-9 shrink-0 rounded-full border-2 px-3.5 text-xs font-extrabold transition-all',
                category === item.id
                  ? 'border-white bg-gradient-to-b from-[#46a8dc] to-[#267db0] text-white shadow-[0_3px_0_#1c5d85]'
                  : 'border-white bg-white/80 text-[#687a94] shadow-[0_2px_0_#d5e2ef]',
              ]}
              aria-pressed={category === item.id}
              onclick={() => {
                category = item.id as typeof category;
              }}
            >
              {item.label}
            </button>
          {/each}
        </div>

        <div class="grid grid-cols-2 gap-3">
          {#each products as item (item.id)}
            {#if item.art}
              <article class="grid min-w-0 content-start gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-white via-[#fbfdff] to-[#eef5ff] p-3 shadow-[0_5px_0_#c9d9eb]">
                <div
                  class="relative grid h-30 w-full place-items-center overflow-hidden rounded-xl border border-white bg-gradient-to-b from-[#e8f5ff] via-[#f7f4ff] to-[#fff5e4] p-1.5"
                  data-frame={item.kind === 'frame' ? item.itemId : undefined}
                >
                  {#if item.kind === 'wing'}
                    <img class="h-full w-full object-contain drop-shadow-[0_4px_6px_rgba(60,40,120,0.2)]" src={item.art.imagePath} alt={item.art.name} />
                  {:else}
                    <AssetPortrait src={item.art.imagePath} alt={item.art.name} placeholder="*" kind={item.kind === 'pet' ? 'pet' : 'avatar'} />
                  {/if}
                </div>
                <div class="flex items-start justify-between gap-1">
                  <h3 class="truncate text-sm font-black text-[#2b2468]">
                    {item.kind === 'frame' ? `กรอบ ${item.itemId}` : item.art.name}
                  </h3>
                  <RarityChip rarity={item.kind === 'frame' ? 'Rare' : item.art.rarity} />
                </div>
                <span class="inline-flex items-center gap-1.5 text-xs font-black text-[#7c5310]">
                  <CurrencyIcon kind="aisPoints" size={17} />
                  {item.cost.toLocaleString()} AIS Point
                </span>
                <GameButton
                  block
                  size="sm"
                  variant={item.owned ? 'ghost' : 'purple'}
                  disabled={item.owned || player.aisPoints < item.cost}
                  onclick={() => onBuy(item.id)}
                >
                  {item.owned ? '✓ มีในคลังแล้ว' : 'ซื้อเข้าคอลเลกชัน'}
                </GameButton>
              </article>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </section>
</div>
