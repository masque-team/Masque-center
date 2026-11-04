<script lang="ts">
  import { ChevronRight, Crown, ShoppingBag, Sparkles } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import AvatarFrame from '../components/AvatarFrame.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PassArtwork from '../components/PassArtwork.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, GACHA_ARTWORK, NAV_ARTWORK, PETS, PROFILE_FRAMES, WINGS } from '../data/config';
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
  } = $props();

  let category = $state<'all' | 'avatar' | 'pet' | 'wing' | 'frame'>('all');
  let maxEnergy = $derived(energyCapacity(player, vipActive));
  let gachaCost = $derived(player.demo.config.gachaCost);

  const tabs = [
    { id: 'items', label: 'ไอเทม & สุ่ม', kind: 'points' as const },
    { id: 'energy', label: 'พลังงาน', kind: 'energyPotion' as const },
    { id: 'vip', label: 'สมาชิก VIP', kind: 'vipCrest' as const },
  ] as const;

  let products = $derived(
    player.demo.config.shop
      .filter((item) => category === 'all' || item.kind === category)
      .map((item) => {
        const frameMeta = item.kind === 'frame' ? PROFILE_FRAMES.find((entry) => entry.id === item.itemId) : undefined;
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
        return { ...item, art, frameMeta, owned };
      }),
  );

  function durationText(days: number): string {
    return days < 1 ? `${Math.round(days * 24)} ชั่วโมง` : days === 1 ? '1 วัน' : `${days} วัน`;
  }
</script>

<div class="space-y-4 pb-8 [overflow-anchor:none]">
  <!-- Clean Shop Header -->
  <div class="flex min-h-16 items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-r from-white/95 via-[#f7fff0]/95 to-[#e8f4ff]/95 px-3.5 py-2.5 shadow-[0_4px_0_#c8d8ec]">
    <div class="flex items-center gap-2.5">
      <img class="size-11 shrink-0 object-contain drop-shadow-[0_3px_4px_rgba(60,40,120,0.22)]" src={NAV_ARTWORK.shop} alt="" />
      <div>
        <p class="text-[9.5px] font-black tracking-wider text-[#0284c7]">REWARD & ITEM SHOP</p>
        <h1 class="text-lg font-black leading-tight text-[#1f305e]">ร้านค้าแลกรางวัล</h1>
        <small class="block text-[10.5px] font-bold text-[#526c9c]">แตะที่สินค้าเพื่อดูรายละเอียดและแลกรางวัล</small>
      </div>
    </div>
    <div class="flex items-center gap-1.5 rounded-full border-2 border-[#a8e85c] bg-[#f4fce8] px-3 py-1.5 text-xs font-black text-[#1f4d00] shadow-2xs">
      <CurrencyIcon kind="aisPoints" size={20} />
      <span class="tabular-nums">{player.aisPoints.toLocaleString()}</span>
    </div>
  </div>

  <!-- Category Tabs -->
  <div
    class="sticky top-[74px] z-20 grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-white bg-[#e8f1ff]/95 p-1.5 shadow-[0_4px_0_#c5d5eb] backdrop-blur-md"
    role="tablist"
    aria-label="หมวดร้านค้า"
  >
    {#each tabs as item (item.id)}
      <button
        type="button"
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

  <section class="min-h-[calc(100dvh_-_180px)]" aria-label={tab === 'energy' ? 'เติมพลังงาน' : tab === 'vip' ? 'แพ็กเกจสมาชิก VIP' : 'สินค้า'}>
    {#if tab === 'vip'}
      <div class="space-y-3.5">
        <!-- VIP Membership Banner -->
        <div class="card-gold-25d relative overflow-hidden p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <span class="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-black text-[#8a5200]">
                <CurrencyIcon kind="vipCrest" size={14} /> สิทธิพิเศษเฉพาะสมาชิก VIP
              </span>
              <h2 class="text-base font-black text-[#593100]">
                เล่นโหมดเกมปกติฟรี 0 Energy · เพดานสูงสุด 30
              </h2>
              <p class="text-xs font-bold text-[#784300]">
                พร้อมปลดล็อกภารกิจโบนัส VIP ใน Battle Pass เพื่อรับ XP เพิ่มทุกวัน
              </p>
            </div>
            <CurrencyIcon kind="vipCrest" size={40} />
          </div>
          {#if vipActive && player.vipExpiresAt}
            <p class="mt-2.5 rounded-xl bg-white/85 px-3 py-1.5 text-xs font-black text-[#166534]">
              ✓ สถานะ VIP ทำงานอยู่ · ใช้ได้ถึง {new Date(player.vipExpiresAt).toLocaleString('th-TH')}
            </p>
          {/if}
        </div>

        <!-- Tappable VIP Product Cards -->
        <div class="grid gap-3">
          {#each player.demo.config.vipPlans as plan, index (plan.id)}
            <button
              type="button"
              class="vip-product-card group flex w-full items-center gap-3.5 rounded-3xl border-2.5 border-white bg-gradient-to-r from-[#fffef7] via-[#fff6d6] to-[#ffebb3] p-3.5 text-left shadow-[0_5px_0_#dfb75a,0_10px_20px_rgba(160,110,15,0.14)] transition-transform active:translate-y-0.5"
              aria-label={`ดูรายละเอียด ${plan.label} · ระยะเวลา ${durationText(plan.durationDays)} · ราคา ${plan.cost} AIS Point`}
              onclick={() => onVip(plan.id)}
            >
              <!-- VIP Emblem Artwork -->
              <div class="relative grid size-20 shrink-0 place-items-center rounded-2xl border-2 border-white bg-gradient-to-b from-white to-[#fff1bf] p-1.5 shadow-xs">
                <PassArtwork kind={index === 2 ? 'crest' : index === 1 ? 'boost' : 'standard'} />
                <span class="absolute -bottom-1.5 rounded-full border border-amber-300 bg-[#593100] px-2 py-0.5 text-[9px] font-black text-[#ffe68a]">
                  {durationText(plan.durationDays)}
                </span>
              </div>

              <!-- Package Info -->
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-1.5">
                  <CurrencyIcon kind="vipCrest" size={16} />
                  <strong class="truncate text-base font-black text-[#352b73]">{plan.label}</strong>
                </div>
                <p class="text-xs font-bold text-[#6b4c1b]">
                  เข้าเล่นเกมปกติฟรี · Energy สูงสุด 30 · ภารกิจ VIP
                </p>
                <div class="flex items-center justify-between pt-1">
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-[#a8e85c] bg-[#f4fce8] px-2.5 py-0.5 text-xs font-black text-[#245900]">
                    <CurrencyIcon kind="aisPoints" size={16} />
                    {plan.cost.toLocaleString()} AIS Point
                  </span>
                  <span class="inline-flex items-center gap-0.5 text-xs font-black text-[#8f5400] group-hover:translate-x-0.5 transition-transform">
                    ดูรายละเอียด <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

    {:else if tab === 'energy'}
      <div class="space-y-4">
        <section class="space-y-3 rounded-2xl border-2 border-white bg-gradient-to-br from-white via-[#f2faff] to-[#e1f3ff] p-4 shadow-[0_5px_0_#bfd8ea]" aria-label="สถานะ Energy">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-base font-black text-[#255275]">
              <CurrencyIcon kind="energyPotion" size={28} />
              พลังงานของคุณ
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
              พลังงานเต็มหลอดแล้ว · สามารถแลกแพ็กเพิ่มเพื่อสะสมเกินเพดานได้
            </p>
          {/if}
        </section>

        <h2 class="flex items-center gap-1.5 text-sm font-black text-[#2b2468]">
          <Sparkles size={16} class="text-amber-500" /> แพ็กเกจขวดเติมพลังงาน
        </h2>
        <div class="grid grid-cols-2 gap-3">
          {#each player.demo.config.energyPacks as pack, idx (pack.id)}
            <button
              type="button"
              class="relative grid min-w-0 justify-items-center gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-white via-[#f5fbff] to-[#e4f4ff] p-3.5 pt-5 text-center shadow-[0_5px_0_#bdd6e6] transition-transform active:translate-y-0.5"
              onclick={() => onRefill(pack.id)}
            >
              <span class="absolute -top-2.5 rounded-full border border-white bg-gradient-to-r from-sky-500 to-indigo-500 px-2.5 py-0.5 text-[9px] font-extrabold text-white">
                {idx === 0 ? '⚡ แพ็กพกพา' : '🌟 แพ็กสุดคุ้ม'}
              </span>
              <div class="my-1 grid size-20 place-items-center rounded-2xl border border-white bg-radial from-white to-sky-50">
                <CurrencyIcon kind="energyPotion" size={idx === 0 ? 58 : 70} />
              </div>
              <strong class="text-xl font-black text-[#1e4b6e]">+{pack.energy} Energy</strong>
              <span class="inline-flex items-center gap-1 rounded-full border border-[#a8e85c] bg-[#f4fce8] px-3 py-1 text-xs font-black text-[#245900]">
                <CurrencyIcon kind="aisPoints" size={16} />
                {pack.cost} AIS Point
              </span>
            </button>
          {/each}
        </div>
      </div>

    {:else}
      <div class="space-y-4">
        <section class="space-y-2" aria-label="กล่องสุ่ม Gacha">
          <h2 class="text-sm font-black text-[#2b2468]">Gacha Boxes · กล่องสุ่มคู่หูและตัวละคร</h2>
          <div class="grid grid-cols-2 gap-3">
            {#each [{ kind: 'pet' as const, label: 'Pet Gacha Box', sub: 'สุ่มสัตว์เลี้ยงคู่หู', art: GACHA_ARTWORK.petBox }, { kind: 'avatar' as const, label: 'Avatar Gacha Box', sub: 'สุ่มตัวละครฮีโร่', art: GACHA_ARTWORK.avatarBox }] as box (box.kind)}
              {@const ownedBoxes = player.demo.gachaBoxes?.[box.kind] ?? 0}
              <article class="grid min-w-0 justify-items-center gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-white to-[#eef7ff] p-3 text-center shadow-[0_5px_0_#c4d9eb]">
                <button
                  type="button"
                  class="grid w-full justify-items-center gap-1 text-center"
                  onclick={() => onBuyGachaBox(box.kind)}
                >
                  <img class="h-16 w-16 object-contain drop-shadow-xs" src={box.art ?? GACHA_ARTWORK.capsule ?? 'assets/gacha/gacha-capsule.png'} alt={box.label} />
                  <strong class="text-sm font-black text-[#29436b]">{box.label}</strong>
                  <span class="text-[10.5px] font-bold text-[#526c9c]">{box.sub}</span>
                  <span class="mt-0.5 inline-flex items-center gap-1 rounded-full border border-[#a8e85c] bg-[#f4fce8] px-2.5 py-0.5 text-xs font-black text-[#245900]">
                    <CurrencyIcon kind="aisPoints" size={15} /> {gachaCost} AIS Point
                  </span>
                </button>
                <GameButton block size="sm" variant="gold" onclick={() => onBuyGachaBox(box.kind)}>
                  ดูรายละเอียด / แลกกล่อง
                </GameButton>
                {#if ownedBoxes > 0}
                  <GameButton block size="sm" variant="purple" onclick={() => onOpenGachaBox(box.kind)}>
                    เปิดกล่องที่มี ({ownedBoxes})
                  </GameButton>
                {/if}
              </article>
            {/each}
          </div>
        </section>

        <!-- Category Filter Pills -->
        <div class="flex items-center justify-between pt-1">
          <h2 class="flex items-center gap-1.5 text-sm font-black text-[#2b2468]">
            <ShoppingBag size={16} class="text-sky-600" /> คอลเลกชันแฟชั่น, กรอบรูป & สัตว์เลี้ยง
          </h2>
          <span class="text-[10px] font-bold text-[#71839a]">{products.length} รายการ</span>
        </div>

        <div class="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="ประเภทสินค้า">
          {#each [{ id: 'all', label: 'ทั้งหมด' }, { id: 'frame', label: 'กรอบรูปสะสม' }, { id: 'avatar', label: 'Avatar' }, { id: 'pet', label: 'Pet' }, { id: 'wing', label: 'ปีก' }] as item (item.id)}
            <button
              type="button"
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
                <button
                  type="button"
                  class="grid w-full content-start gap-2 text-left"
                  onclick={() => onBuy(item.id)}
                >
                  <div
                    class="relative grid h-30 w-full place-items-center overflow-hidden rounded-xl border border-white bg-gradient-to-b from-[#e8f5ff] via-[#f7f4ff] to-[#fff5e4] p-1.5"
                  >
                    {#if item.kind === 'wing'}
                      <img class="h-full w-full object-contain drop-shadow-[0_4px_6px_rgba(60,40,120,0.2)]" src={item.art.imagePath} alt={item.art.name} />
                    {:else if item.kind === 'frame'}
                      <AvatarFrame avatarId={player.avatarId} frameId={item.itemId} size="lg" />
                    {:else}
                      <AssetPortrait src={item.art.imagePath} alt={item.art.name} placeholder="*" kind={item.kind === 'pet' ? 'pet' : 'avatar'} />
                    {/if}
                  </div>
                  <div class="flex items-start justify-between gap-1">
                    <h3 class="truncate text-sm font-black text-[#2b2468]">
                      {item.kind === 'frame' ? (item.frameMeta?.name ?? `กรอบ ${item.itemId}`) : item.art.name}
                    </h3>
                    <RarityChip rarity={item.kind === 'frame' ? (item.frameMeta?.rarity ?? 'Rare') : item.art.rarity} />
                  </div>
                  <span class="inline-flex items-center gap-1.5 text-xs font-black text-[#245900]">
                    <CurrencyIcon kind="aisPoints" size={17} />
                    {item.cost.toLocaleString()} AIS Point
                  </span>
                </button>
                <GameButton
                  block
                  size="sm"
                  variant={item.owned ? 'ghost' : 'purple'}
                  onclick={() => onBuy(item.id)}
                >
                  {item.owned ? '✓ มีในคลังแล้ว' : 'ดูรายละเอียด / แลก'}
                </GameButton>
              </article>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </section>
</div>
