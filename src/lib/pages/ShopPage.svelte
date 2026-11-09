<script lang="ts">
  import { ChevronRight, Crown, ShoppingBag, Sparkles, Ticket } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import AvatarFrame from '../components/AvatarFrame.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
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
    onBuyCampaignTickets,
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
    onBuyCampaignTickets: (packId: string) => void;
    onOpenGachaBox: (kind: 'avatar' | 'pet') => void;
    onVip: (id: string) => void;
  } = $props();

  let category = $state<'all' | 'avatar' | 'pet' | 'wing' | 'frame'>('all');
  let maxEnergy = $derived(energyCapacity(player, vipActive));
  let gachaCost = $derived(player.demo.config.gachaCost);
  const energyPackArtwork = [
    'assets/ui-redesign/shop/energy-pack-pedestal.jpg',
    'assets/ui-redesign/shop/energy-pack-pedestal.jpg',
    'assets/ui-redesign/shop/energy-pack-pouch.jpg',
    'assets/points/chest.png',
    'assets/points/treasure.png',
    'assets/points/royal.png',
  ];

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
  <!-- Shop Header -->
  <div class="flex min-h-16 items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-r from-white/95 via-[#f4edff]/95 to-[#fff3d4]/95 px-3.5 py-2.5 shadow-[0_4px_0_#d6c3ef]">
    <div class="flex items-center gap-2.5">
      <img class="size-11 shrink-0 object-contain drop-shadow-[0_3px_4px_rgba(60,40,120,0.22)]" src={NAV_ARTWORK.shop} alt="" />
      <div>
        <p class="text-[9.5px] font-black tracking-wider text-[#7b22cf]">REWARD & ITEM SHOP</p>
        <h1 class="text-lg font-black leading-tight text-[#35145f]">ร้านค้า</h1>
        <small class="block text-[10.5px] font-bold text-[#71628c]">พลังงาน · ตัวละคร · VIP Pass</small>
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
          {#each player.demo.config.vipPlans as plan (plan.id)}
            <button
              type="button"
              class="vip-product-card group flex w-full items-center gap-3.5 rounded-3xl border-2.5 border-white bg-gradient-to-r from-[#fffef7] via-[#fff6d6] to-[#ffebb3] p-3.5 text-left shadow-[0_5px_0_#dfb75a,0_10px_20px_rgba(160,110,15,0.14)] transition-transform active:translate-y-0.5"
              aria-label={`ดูรายละเอียด ${plan.label} · ระยะเวลา ${durationText(plan.durationDays)} · ราคา ${plan.cost} AIS Point`}
              onclick={() => onVip(plan.id)}
            >
              <!-- VIP Emblem Artwork -->
              <div class="relative grid size-20 shrink-0 place-items-center rounded-2xl border-2 border-white bg-gradient-to-b from-white to-[#fff1bf] p-1.5 shadow-xs">
                <CurrencyIcon kind="vipCrest" size={56} />
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
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#a8e85c] bg-[#f4fce8] px-2.5 py-0.5 text-xs font-black text-[#245900]">
                    <CurrencyIcon kind="aisPoints" size={16} />
                    {plan.cost.toLocaleString()} AIS Point
                  </span>
                  <span class="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-black text-[#8f5400] group-hover:translate-x-0.5 transition-transform">
                    ดูรายละเอียด <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>

    {:else if tab === 'energy'}
      <div class="space-y-3.5">
        <section class="energy-summary" aria-label="สถานะ Energy">
          <div class="summary-line">
            <h2><CurrencyIcon kind="energyPotion" size={25} /> พลังงาน</h2>
            <strong><CurrencyIcon kind="energyPotion" size={18} /> {player.energy}/{maxEnergy}</strong>
          </div>
          <div class="energy-meter" role="progressbar" aria-label="พลังงานปัจจุบัน" aria-valuemin={0} aria-valuemax={maxEnergy} aria-valuenow={player.energy}>
            <span style={`width:${Math.min(100, (player.energy / maxEnergy) * 100)}%`}></span>
          </div>
          <div class="summary-foot">
            <small>{player.energy < maxEnergy ? `+1 ทุก ${player.demo.config.regenMinutes} นาที · ถัดไป ${countdown}` : 'พลังงานเต็มแล้ว · แลกแพ็กเพื่อสะสมเพิ่มได้'}</small>
            <span><CurrencyIcon kind="aisPoints" size={17} /> {player.aisPoints.toLocaleString()} Point</span>
          </div>
        </section>

        <div class="energy-note"><Sparkles size={15} /> พลังงานที่ซื้อสะสมต่อได้ แม้พลังงานเต็มแล้ว</div>
        <h2 class="flex items-center gap-1.5 text-sm font-black text-[#35145f]"><Sparkles size={16} class="text-amber-500" /> แพ็กพลังงาน</h2>
        <div class="grid grid-cols-2 gap-2.5">
          {#each player.demo.config.energyPacks as pack, idx (pack.id)}
            <button type="button" class="energy-pack" onclick={() => onRefill(pack.id)} aria-label={`ซื้อพลังงาน ${pack.energy} หน่วย ราคา ${pack.cost} AIS Point`}>
              <span class="pack-image"><img src={energyPackArtwork[idx] ?? energyPackArtwork.at(-1)} alt="" loading="lazy" /></span>
              <strong>พลังงาน {pack.energy} หน่วย</strong>
              <span class="pack-price"><CurrencyIcon kind="aisPoints" size={17} /> {pack.cost.toLocaleString()} AIS Point</span>
              <span class="pack-buy">ซื้อ</span>
            </button>
          {/each}
        </div>
      </div>

    {:else}
      <div class="space-y-4">
        <section class="space-y-2.5" aria-label="บัตรเข้าอีเวนต์">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <CurrencyIcon kind="campaignTicket" size={24} />
              <div>
                <h2 class="text-sm font-black text-[#2b2468]">บัตรเข้าอีเวนต์</h2>
                <p class="text-[10px] font-bold text-[#647b96]">ใช้เข้า Campaign ที่กำหนด · ไม่หัก Energy</p>
              </div>
            </div>
            <span class="shrink-0 rounded-full bg-[#fff3c4] px-2.5 py-1 text-[11px] font-black text-[#8a5200]">
              มี {player.demo.campaignTickets ?? 0} ใบ
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            {#each player.demo.config.campaignTicketPacks as pack (pack.id)}
              <button
                type="button"
                class="group grid min-h-25 content-center justify-items-center gap-1.5 rounded-2xl border-2 border-white bg-white/92 p-3 text-center shadow-[0_6px_16px_rgb(35_75_130/10%),0_2px_4px_rgb(35_75_130/6%)] transition-transform active:translate-y-0.5"
                aria-label={`ซื้อ ${pack.quantity} Campaign Tickets · ${pack.cost} AIS Point`}
                onclick={() => onBuyCampaignTickets(pack.id)}
              >
                <span class="flex items-center gap-1 text-xs font-black text-[#244b71]">
                  <CurrencyIcon kind="campaignTicket" size={18} /> {pack.quantity} ใบ
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-[#f4fce8] px-2.5 py-1 text-[11px] font-black text-[#245900]">
                  <CurrencyIcon kind="aisPoints" size={15} /> {pack.cost.toLocaleString()} AIS Point
                </span>
                <span class="text-[10px] font-bold text-sky-700 group-hover:text-sky-900">ดูรายละเอียด · แลก</span>
              </button>
            {/each}
          </div>
        </section>

        <section class="space-y-2" aria-label="กล่องสุ่ม Gacha">
          <h2 class="text-sm font-black text-[#2b2468]">Gacha Boxes · กล่องสุ่มคู่หูและตัวละคร</h2>
          <div class="grid grid-cols-2 gap-3">
            {#each [{ kind: 'pet' as const, label: 'Pet Gacha Box', sub: 'สุ่มสัตว์เลี้ยงคู่หู', art: GACHA_ARTWORK.petBox }, { kind: 'avatar' as const, label: 'Avatar Gacha Box', sub: 'สุ่มตัวละครฮีโร่', art: GACHA_ARTWORK.avatarBox }] as box (box.kind)}
              {@const ownedBoxes = player.demo.gachaBoxes?.[box.kind] ?? 0}
              <article class="grid min-w-0 justify-items-center gap-2 p-1 text-center">
                <button
                  type="button"
                  class="grid w-full justify-items-center gap-2 rounded-2xl border-2 border-white bg-white/92 p-3 text-center shadow-[0_6px_16px_rgb(35_75_130/10%),0_2px_4px_rgb(35_75_130/6%)] transition-transform active:translate-y-0.5"
                  onclick={() => onBuyGachaBox(box.kind)}
                >
                  <div class="grid h-22 w-full place-items-center">
                    <img class="h-19 w-19 object-contain drop-shadow-[0_6px_10px_rgba(60,40,120,0.2)]" src={box.art ?? GACHA_ARTWORK.capsule ?? 'assets/gacha/gacha-capsule.png'} alt={box.label} />
                  </div>
                  <div class="space-y-0.5">
                    <strong class="block text-sm font-black text-[#29436b]">{box.label}</strong>
                    <span class="block text-[10.5px] font-bold text-[#526c9c]">{box.sub}</span>
                  </div>
                  <span class="inline-flex items-center gap-1 rounded-full border border-[#a8e85c] bg-[#f4fce8] px-2.5 py-0.5 text-xs font-black text-[#245900]">
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

        <div class="grid grid-cols-2 gap-3.5">
          {#each products as item (item.id)}
            {#if item.art}
              <article data-product-id={item.id} class="grid min-w-0 content-start gap-2">
                <button
                  type="button"
                  class="grid w-full content-start gap-2 rounded-2xl border-2 border-white bg-white/92 p-2.5 text-left shadow-[0_6px_16px_rgb(35_75_130/10%),0_2px_4px_rgb(35_75_130/6%)] transition-transform active:translate-y-0.5"
                  onclick={() => onBuy(item.id)}
                >
                  <div
                    class="relative grid h-30 w-full place-items-center overflow-hidden rounded-xl p-1"
                  >
                    {#if item.kind === 'wing'}
                      <img class="h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(60,40,120,0.22)]" src={item.art.imagePath} alt={item.art.name} />
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

<style>
  .energy-summary { display: grid; gap: 8px; padding: 12px; border: 2px solid #fff; border-radius: 17px; background: linear-gradient(110deg, #fff 0%, #f8f2ff 58%, #fff8e4 100%); box-shadow: 0 4px 0 #dccded; }
  .summary-line, .summary-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .summary-line h2, .summary-line strong { display: inline-flex; align-items: center; gap: 6px; margin: 0; color: #38165e; font-size: 15px; font-weight: 1000; }
  .summary-line strong { padding: 4px 10px; border: 1px solid #dac5f2; border-radius: 99px; background: #fff; font-size: 14px; font-variant-numeric: tabular-nums; }
  .energy-meter { height: 9px; overflow: hidden; border-radius: 99px; background: #e8def2; }
  .energy-meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ffbb27, #a326ec); transition: width 250ms ease; }
  .summary-foot { flex-wrap: wrap; color: #74658a; font-size: 9.5px; font-weight: 800; }
  .summary-foot small { font-size: inherit; }
  .summary-foot > span { display: inline-flex; align-items: center; gap: 3px; color: #3b2458; white-space: nowrap; }
  .energy-note { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border: 1px solid #f1d997; border-radius: 99px; color: #573d17; background: #fff8df; font-size: 10px; font-weight: 900; }
  .energy-pack { display: grid; min-width: 0; justify-items: center; gap: 5px; padding: 7px; border: 2px solid #fff; border-radius: 16px; background: linear-gradient(155deg, #fff 0%, #fbf7ff 72%, #f4edff 100%); box-shadow: 0 4px 0 #d9c8ee, 0 7px 12px rgb(65 40 95 / 8%); text-align: center; transition: transform 120ms ease; }
  .energy-pack:active { transform: translateY(2px); }
  .pack-image { display: block; width: 100%; aspect-ratio: 1.35; overflow: hidden; border-radius: 12px; background: #fff; }
  .pack-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .energy-pack > strong { color: #35145f; font-size: 12px; font-weight: 1000; }
  .pack-price { display: inline-flex; align-items: center; gap: 3px; max-width: 100%; color: #195814; font-size: 9px; font-weight: 900; white-space: nowrap; }
  .pack-buy { display: grid; place-items: center; width: 100%; min-height: 28px; border: 1px solid #fff; border-radius: 99px; color: #fff; background: linear-gradient(180deg, #a940ff, #7100d4); box-shadow: 0 2px 0 #4e0a9a; font-size: 11px; font-weight: 1000; }
  @media (prefers-reduced-motion: reduce) { .energy-meter span, .energy-pack { transition: none; } }
</style>
