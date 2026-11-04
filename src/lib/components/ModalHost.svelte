<script lang="ts">
  import { ArrowRight, Check, Clock3, Crown, Gift, Sparkles, Target, Ticket, TriangleAlert, X, Zap } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import AvatarFrame from './AvatarFrame.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import GameButton from './GameButton.svelte';
  import PassArtwork from './PassArtwork.svelte';
  import RarityChip from './RarityChip.svelte';
  import RewardIcon from './RewardIcon.svelte';
  import VipPassOffer from './VipPassOffer.svelte';
  import { AVATARS, PETS, PROFILE_FRAMES, WINGS } from '../data/config';
  import { passProgress } from '../services/battlePassService';
  import { currentSeason } from '../services/demoService';
  import { energyCapacity } from '../services/energyService';
  import type { ModalState, PlayerState } from '../types';

  let {
    modal, player, vipActive = false, now = Date.now(), exchangeAmount, checkinReward,
    onClose, onPickRefill, onConfirmRefill, onConfirmVip, onConfirmExchange, onConfirmGachaCoupons,
    onOpenRefill, onOpenVip, onOpenExchange, onWait, onConfirmItem, onConfirmAction = () => {}, onPickVip = () => {},
  }: {
    modal: ModalState;
    player: PlayerState;
    vipActive?: boolean;
    now?: number;
    exchangeAmount: number;
    checkinReward: number;
    onClose: () => void;
    onPickRefill: (id: string) => void;
    onConfirmRefill: () => void;
    onConfirmVip: () => void;
    onConfirmExchange: () => void;
    onConfirmGachaCoupons: () => void;
    onOpenRefill: () => void;
    onOpenVip: () => void;
    onOpenExchange: () => void;
    onWait: () => void;
    onConfirmItem: () => void;
    onConfirmAction?: () => void;
    onPickVip?: (id: string) => void;
  } = $props();

  let SHOP_ITEMS = $derived(player.demo.config.shop);
  let ENERGY_CONFIG = $derived({ max: energyCapacity(player, vipActive), refillPacks: player.demo.config.energyPacks });
  let EXCHANGE_RATE = $derived(player.demo.config.exchangeRate);
  let VIP_PACKAGES = $derived(player.demo.config.vipPlans);
  let vip = $derived(modal?.kind === 'vip-confirm' ? VIP_PACKAGES.find((pack) => pack.id === modal.packageId) ?? null : null);
  let refill = $derived(modal?.kind === 'refill-confirm' ? ENERGY_CONFIG.refillPacks.find((pack) => pack.id === modal.refillId) ?? null : null);
  let couponCost = $derived(modal?.kind === 'gacha-coupon-confirm' ? player.demo.config.gachaCost * modal.quantity : 0);
  let couponShort = $derived(Math.max(0, couponCost - player.aisPoints));
  let refillShort = $derived(refill ? Math.max(0, refill.cost - player.aisPoints) : 0);
  let celebrate = $derived(modal?.kind === 'gacha-result' || modal?.kind === 'checkin-success' || (modal?.kind === 'notice' && modal.tone === 'success'));
  let shopItem = $derived(modal?.kind === 'item-confirm' ? SHOP_ITEMS.find((item) => item.id === modal.itemId) : undefined);
  let shopArt = $derived(shopItem ? (shopItem.kind === 'avatar' ? AVATARS : PETS).find((item) => item.id === shopItem.itemId) : undefined);
  let wing = $derived(shopItem?.kind === 'wing' ? WINGS.find((w) => w.id === shopItem.itemId) : undefined);
  let frameMeta = $derived(shopItem?.kind === 'frame' ? PROFILE_FRAMES.find((f) => f.id === shopItem.itemId) : undefined);
  let shopItemOwned = $derived(
    shopItem
      ? shopItem.kind === 'wing'
        ? player.demo.wings.includes(shopItem.itemId)
        : shopItem.kind === 'frame'
          ? (player.demo.frames ?? []).includes(shopItem.itemId)
          : shopItem.kind === 'avatar'
            ? player.ownedAvatarIds.includes(shopItem.itemId)
            : player.ownedPetIds.includes(shopItem.itemId)
      : false
  );
  let ticketPack = $derived(
    modal?.kind === 'ticket-pack-confirm'
      ? player.demo.config.campaignTicketPacks.find((p) => p.id === modal.packId) ?? null
      : null
  );
  let campaignEntry = $derived(
    modal?.kind === 'campaign-entry-confirm'
      ? {
          campaign: player.demo.config.campaigns.find((c) => c.id === modal.campaignId) ?? null,
          game: player.demo.config.games.find((g) => g.id === modal.gameId) ?? null,
        }
      : null
  );
  let season = $derived(currentSeason(player, now));

  function focusDialog(node: HTMLElement) {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const elements = () => Array.from(node.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, a[href]'));
    queueMicrotask(() => elements()[0]?.focus());
    function trap(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const focusable = elements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    node.addEventListener('keydown', trap);
    return { destroy() { node.removeEventListener('keydown', trap); document.body.style.overflow = overflow; previous?.focus(); } };
  }
</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape' && modal) onClose(); }} />

{#if modal}
  <div class="backdrop" role="presentation" onclick={onClose}>
    <div class="card" use:focusDialog class:spot={modal.kind === 'gacha-result'} role="dialog" tabindex="-1" aria-label="รายละเอียดรายการ" aria-modal="true" onclick={(event) => event.stopPropagation()} onkeydown={(event) => event.stopPropagation()}>
      <button class="close" aria-label="ปิดหน้าต่าง" onclick={onClose}><X size={18} strokeWidth={3} /></button>
      {#if celebrate}<div class="confetti" aria-hidden="true">{#each Array.from({ length: 14 }) as _, i (i)}<i style={`--n:${i}`}></i>{/each}</div>{/if}

      {#if shopItem?.kind === 'wing' && wing}
        <div class="mx-auto mb-2 grid h-36 w-44 place-items-center rounded-2xl border-2 border-white bg-gradient-to-b from-[#f8fbff] to-[#e4f2fe] p-3 shadow-inner">
          <img class="h-full w-full object-contain" src={wing.imagePath} alt={wing.name} />
        </div>
        <p class="eyebrow">COSMETIC WINGS</p>
        <h2>{wing.name}</h2>
        <RarityChip rarity={wing.rarity} />
        <p class="summary">ปีกประดับตัวละครในหน้าโปรไฟล์และฉากตัวละคร</p>
        <div class="receipt mt-2">
          <div><span>สถานะ</span><b>{shopItemOwned ? 'มีในคลังแล้ว' : 'พร้อมแลก'}</b></div>
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{shopItem.cost.toLocaleString()} AIS Point</b></div>
        </div>
        {#if !shopItemOwned && player.aisPoints < shopItem.cost}
          <div class="short"><TriangleAlert size={15} />คะแนนไม่พอ ขาดอีก {(shopItem.cost - player.aisPoints).toLocaleString()} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ปิด</GameButton>
          {#if shopItemOwned}
            <GameButton disabled>มีในคลังแล้ว</GameButton>
          {:else}
            <GameButton variant="gold" disabled={player.aisPoints < shopItem.cost} onclick={onConfirmItem}>แลกไอเทม</GameButton>
          {/if}
        </div>

      {:else if shopItem?.kind === 'frame'}
        <div class="mx-auto mb-2.5 flex justify-center rounded-2xl border-2 border-white bg-gradient-to-b from-[#f8fbff] to-[#e4f2fe] py-4 shadow-inner">
          <AvatarFrame avatarId={player.avatarId} frameId={shopItem.itemId} size="xl" />
        </div>
        <p class="eyebrow">COLLECTIBLE PROFILE FRAME</p>
        <h2>{frameMeta?.name ?? `${shopItem.itemId} Frame`}</h2>
        <RarityChip rarity={frameMeta?.rarity ?? 'Rare'} />
        <p class="summary">{frameMeta?.theme ?? 'กรอบรูปโปรไฟล์'} · แสดงผลในหน้าโปรไฟล์ แถบด้านบน และตารางอันดับ</p>
        <div class="receipt">
          <div><span>สถานะ</span><b>{shopItemOwned ? 'มีในคลังแล้ว' : 'พร้อมแลก'}</b></div>
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{shopItem.cost.toLocaleString()} AIS Point</b></div>
        </div>
        {#if !shopItemOwned && player.aisPoints < shopItem.cost}
          <div class="short"><TriangleAlert size={15} />คะแนนไม่พอ ขาดอีก {(shopItem.cost - player.aisPoints).toLocaleString()} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ปิด</GameButton>
          {#if shopItemOwned}
            <GameButton disabled>มีในคลังแล้ว</GameButton>
          {:else}
            <GameButton variant="gold" disabled={player.aisPoints < shopItem.cost} onclick={onConfirmItem}>แลกกรอบรูป</GameButton>
          {/if}
        </div>

      {:else if shopItem && shopArt}
        <div class="mx-auto mb-2.5 h-36 w-32 rounded-2xl border-2 border-white bg-gradient-to-b from-[#f8fbff] to-[#e4f2fe] p-2 shadow-inner">
          <AssetPortrait src={shopArt.imagePath} alt={shopArt.name} placeholder={shopArt.placeholder} kind={shopItem.kind === 'avatar' ? 'avatar' : 'pet'} loading="eager" />
        </div>
        <p class="eyebrow">{shopItem.kind === 'avatar' ? 'CHARACTER AVATAR' : 'COMPANION PET'}</p>
        <h2>{shopArt.name}</h2>
        <RarityChip rarity={shopArt.rarity} size="md" />
        <p class="summary">
          {shopItem.kind === 'avatar' ? 'ตัวละครฮีโร่สะสมสำหรับใช้งานในโปรไฟล์และหน้าเริ่มเกม' : 'สัตว์เลี้ยงคู่หูประจำตัวในฉากโปรไฟล์และหน้าเริ่มเกม'}
        </p>
        <div class="receipt">
          <div><span>สถานะ</span><b>{shopItemOwned ? 'มีในคลังแล้ว' : 'พร้อมแลก'}</b></div>
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{shopItem.cost.toLocaleString()} AIS Point</b></div>
        </div>
        {#if !shopItemOwned && player.aisPoints < shopItem.cost}
          <div class="short"><TriangleAlert size={15} />คะแนนไม่พอ ขาดอีก {(shopItem.cost - player.aisPoints).toLocaleString()} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ปิด</GameButton>
          {#if shopItemOwned}
            <GameButton disabled>มีในคลังแล้ว</GameButton>
          {:else}
            <GameButton variant="gold" disabled={player.aisPoints < shopItem.cost} onclick={onConfirmItem}>แลกเข้าคอลเลกชัน</GameButton>
          {/if}
        </div>

      {:else if modal.kind === 'gacha-box-detail'}
        {@const isPet = modal.gachaKind === 'pet'}
        {@const boxCost = player.demo.config.gachaCost}
        {@const ownedBoxes = isPet ? (player.demo.gachaBoxes?.pet ?? 0) : (player.demo.gachaBoxes?.avatar ?? 0)}
        {@const shortPoints = Math.max(0, boxCost - player.aisPoints)}
        <div class="mx-auto mb-2.5 overflow-hidden rounded-2xl border-2 border-white shadow-sm">
          <img
            class="h-32 w-full object-cover"
            src={isPet ? 'images/gacha_banner_pet.png' : 'images/gacha_banner_avatar.png'}
            alt={isPet ? 'Pet Gacha Box' : 'Avatar Gacha Box'}
          />
        </div>
        <p class="eyebrow">{isPet ? 'MYSTERY PET BOX' : 'HERO AVATAR BOX'}</p>
        <h2>{isPet ? 'Pet Gacha Box' : 'Avatar Gacha Box'}</h2>
        <p class="summary">
          {isPet
            ? 'สุ่มรับสัตว์เลี้ยงคู่หู 1 ตัว หากได้ตัวซ้ำจะแปลงเป็น Energy +5 ทันที'
            : 'สุ่มรับตัวละครฮีโร่ 1 ตัว หากได้ตัวซ้ำจะแปลงเป็น Energy +5 ทันที'}
        </p>

        <!-- Preview sample pool -->
        <div class="mb-3 grid grid-cols-4 gap-1.5 rounded-2xl border border-white bg-[#f5fbff] p-2">
          {#each (isPet ? PETS.slice(0, 4) : AVATARS.slice(0, 4)) as sample (sample.id)}
            <div class="grid justify-items-center gap-0.5 text-center">
              <RewardIcon type={isPet ? 'pet' : 'avatar'} itemId={sample.id} size={34} />
              <span class="w-full truncate text-[9px] font-black text-[#1f305e]">{sample.name}</span>
            </div>
          {/each}
        </div>

        <div class="receipt">
          <div><span>กล่องในคลัง</span><b>{ownedBoxes} กล่อง</b></div>
          <div><span>ราคาต่อกล่อง</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{boxCost.toLocaleString()} AIS Point</b></div>
        </div>
        {#if shortPoints > 0}
          <div class="short"><TriangleAlert size={15} />คะแนนไม่พอ ขาดอีก {shortPoints.toLocaleString()} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ปิด</GameButton>
          <GameButton variant="gold" disabled={shortPoints > 0} onclick={onConfirmAction}>
            แลกและเปิดกล่อง
          </GameButton>
        </div>

      {:else if modal.kind === 'ticket-pack-confirm' && ticketPack}
        {@const shortTicketPoints = Math.max(0, ticketPack.cost - player.aisPoints)}
        <div class="medal gold"><CurrencyIcon kind="campaignTicket" size={38} /></div>
        <p class="eyebrow">CAMPAIGN TICKET</p>
        <h2>{ticketPack.label}</h2>
        <p class="summary">ตั๋วสำหรับเข้าร่วมการแข่งขันในโหมด Campaign เพื่อชิงอันดับรางวัล</p>
        <div class="receipt">
          <div><span>ตั๋วที่มีอยู่</span><b>{player.demo.campaignTickets} ใบ</b></div>
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{ticketPack.cost.toLocaleString()} AIS Point</b></div>
        </div>
        {#if shortTicketPoints > 0}
          <div class="short"><TriangleAlert size={15} />คะแนนไม่พอ ขาดอีก {shortTicketPoints.toLocaleString()} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="gold" disabled={shortTicketPoints > 0} onclick={onConfirmAction}>
            แลกตั๋วแข่งขัน
          </GameButton>
        </div>

      {:else if modal.kind === 'campaign-entry-confirm' && campaignEntry}
        <div class="medal gold"><CurrencyIcon kind="campaignTicket" size={38} /></div>
        <p class="eyebrow">CAMPAIGN TOURNAMENT</p>
        <h2>{campaignEntry.game?.name ?? 'เข้าแข่งขัน'}</h2>
        {#if campaignEntry.campaign}
          <p class="summary">{campaignEntry.campaign.title}</p>
        {/if}

        <div class="my-3 flex items-center justify-around rounded-2xl border-2 border-white bg-[#f4f9ff] px-4 py-3.5 shadow-inner">
          <div class="text-center">
            <span class="block text-[11px] font-bold text-[#526c9c]">ค่าเข้าร่วม</span>
            <strong class="mt-0.5 inline-flex items-center gap-1.5 text-lg font-black text-[#1f305e]">
              <CurrencyIcon kind="campaignTicket" size={20} /> ใช้ 1 Ticket
            </strong>
          </div>
          <div class="h-8 w-[1.5px] bg-sky-200"></div>
          <div class="text-center">
            <span class="block text-[11px] font-bold text-[#526c9c]">ตั๋วของคุณ</span>
            <strong class="mt-0.5 block text-lg font-black text-[#0284c7]">
              คงเหลือ {player.demo.campaignTickets}
            </strong>
          </div>
        </div>

        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="gold" onclick={onConfirmAction}>
            <Ticket size={16} /> เข้าร่วมการแข่งขัน
          </GameButton>
        </div>

      {:else if modal.kind === 'premium-pass-confirm'}
        {@const passCost = player.demo.config.premiumPrice}
        {@const shortPassPoints = Math.max(0, passCost - player.aisPoints)}
        {@const currentPassLv = passProgress(player.demo.passes[season.id]?.xp ?? 0).level}
        <div class="mx-auto mb-2 grid size-24 place-items-center rounded-3xl border-2 border-white bg-gradient-to-b from-[#fff9db] to-[#ffe28a] p-2 shadow-sm">
          <PassArtwork kind="crest" />
        </div>
        <p class="eyebrow">SEASON BATTLE PASS</p>
        <h2>ปลดล็อก Premium Pass</h2>
        <p class="summary">รับรางวัลสาย Premium ประจำ {season.name} ครบทั้ง 30 เลเวล พร้อมปลดล็อกภารกิจโบนัสหมวด Premium</p>
        <div class="receipt">
          <div><span>เลเวลปัจจุบัน</span><b>LV.{currentPassLv} / 30</b></div>
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{passCost.toLocaleString()} AIS Point</b></div>
        </div>
        {#if shortPassPoints > 0}
          <div class="short"><TriangleAlert size={15} />คะแนนไม่พอ ขาดอีก {shortPassPoints.toLocaleString()} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="gold" disabled={shortPassPoints > 0} onclick={onConfirmAction}>
            ปลดล็อก Premium Pass
          </GameButton>
        </div>

      {:else if modal.kind === 'gacha-coupon-confirm'}
        <div class="medal gold"><CurrencyIcon kind="petGachaTicket" size={38} /></div>
        <p class="eyebrow">AVATAR · PET GACHA</p>
        <h2>แลกคูปองสุ่ม</h2>
        <p class="summary">{modal.quantity} คูปอง · {modal.quantity === 10 ? 'เปิด 10 ครั้ง รับโบนัสเพิ่ม 1 ครั้ง' : 'เปิดได้ 1 ครั้ง'}</p>
        <div class="receipt">
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{couponCost.toLocaleString()} AIS Point</b></div>
          <div><span>คะแนนคงเหลือ</span><b>{player.aisPoints.toLocaleString()} AIS Point</b></div>
        </div>
        {#if couponShort > 0}<div class="short"><TriangleAlert size={16} />คะแนนไม่พอ ขาดอีก <b>{couponShort.toLocaleString()}</b> AIS Point</div>{/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="gold" disabled={couponShort > 0} onclick={onConfirmGachaCoupons}><CurrencyIcon kind="petGachaTicket" size={20} />แลกคูปอง</GameButton>
        </div>

      {:else if vip}
        <VipPassOffer {player} packageId={vip.id} {now} onSelect={onPickVip} onConfirm={onConfirmVip} onTopUp={onOpenExchange} {onClose} />

      {:else if refill && modal.kind === 'refill-confirm'}
        <div class="medal blue"><CurrencyIcon kind="energyPotion" size={40} /></div>
        <p class="eyebrow">ENERGY PACK</p>
        <h2>เติมพลังงาน</h2>
        <div class="now"><span>พลังงานปัจจุบัน</span><b>{player.energy}/{ENERGY_CONFIG.max}</b></div>
        <div class="packs" role="radiogroup" aria-label="เลือกแพ็ก Energy">
          {#each ENERGY_CONFIG.refillPacks as pack (pack.id)}
            <button class="pack" class:picked={refill.id === pack.id} role="radio" aria-checked={refill.id === pack.id} onclick={() => onPickRefill(pack.id)}>
              <CurrencyIcon kind="energyPotion" size={24} /><b>+{pack.energy}</b><small><CurrencyIcon kind="aisPoints" size={14} />{pack.cost}</small>
            </button>
          {/each}
        </div>
        <div class="receipt">
          <div><span>จะได้รับ</span><b>+{refill.energy} Energy</b></div>
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{refill.cost} AIS Point</b></div>
        </div>
        {#if refillShort > 0}<div class="short"><TriangleAlert size={16} />คะแนนไม่พอ ขาดอีก <b>{refillShort.toLocaleString('en-US')}</b> AIS Point</div>{/if}
        <div class="actions">
          <GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="purple" size="md" disabled={refillShort > 0} onclick={onConfirmRefill}>เติมพลังงาน<Zap size={16} fill="currentColor" /></GameButton>
        </div>

      {:else if modal.kind === 'exchange-confirm'}
        <div class="medal green"><CurrencyIcon kind="aisPoints" size={40} /></div>
        <p class="eyebrow">POINTS EXCHANGE</p>
        <h2>ยืนยันการแลกแต้ม</h2>
        <div class="swap"><div><small>ใช้</small><b>{exchangeAmount}</b><span>AIS</span></div><ArrowRight size={22} /><div class="gain"><small>ได้รับ</small><b>{exchangeAmount * EXCHANGE_RATE}</b><span>MP</span></div></div>
        <div class="receipt">
          <div><span>อัตราแลก</span><b>1 AIS = {EXCHANGE_RATE} MP</b></div>
        </div>
        <div class="actions"><GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton><GameButton variant="mint" size="md" onclick={onConfirmExchange}>ยืนยันแลก<ArrowRight size={16} /></GameButton></div>

      {:else if modal.kind === 'gacha-result'}
        <p class="eyebrow">{modal.gachaKind === 'pet' ? 'PET GACHA' : 'AVATAR GACHA'}</p>
        <h2>ผลสุ่ม {modal.results.length} ครั้ง</h2>
        <p class="summary">{modal.source === 'box' ? 'เปิดจาก Gacha Box 1 กล่อง' : `ใช้ ${modal.paidCoupons} คูปอง${modal.bonusDraws ? ` · โบนัสฟรี ${modal.bonusDraws} ครั้ง` : ''}`}</p>
        <div class="grid grid-cols-4 gap-2 text-center">
          {#each modal.results as result, index (`${index}-${result.kind}-${'itemId' in result ? result.itemId : 'energy'}`)}
            {@const itemId = 'itemId' in result ? result.itemId : undefined}
            {@const item = result.kind === 'pet' ? PETS.find((entry) => entry.id === itemId) : result.kind === 'avatar' ? AVATARS.find((entry) => entry.id === itemId) : undefined}
            <div class="grid min-w-0 justify-items-center gap-1 rounded-md border border-white bg-[#f7fbff] p-1.5">
              <RewardIcon type={result.kind} {itemId} size={38} />
              <small class="line-clamp-2 text-[8px] font-semibold">{result.kind === 'energy' ? `Energy +${result.amount}` : item?.name ?? itemId}</small>
              {#if result.kind !== 'energy'}<span class={['text-[8px] font-bold', result.duplicate ? 'text-amber-700' : 'text-sky-700']}>{result.duplicate ? `ซ้ำ · Energy +${result.duplicateEnergy ?? player.demo.config.duplicateEnergy}` : 'NEW'}</span>{/if}
            </div>
          {/each}
        </div>
        <div class="actions one"><GameButton variant="gold" size="lg" onclick={onClose}><Sparkles size={18} />ตกลง</GameButton></div>

      {:else if modal.kind === 'mission-progress'}
        <div class="medal green"><Target size={34} /></div>
        <p class="eyebrow">GAME RESULT</p>
        <h2>เล่นจบแล้ว · {modal.score.toLocaleString()} คะแนน</h2>
        <p class="summary">+{modal.rewardXp} EXP</p>
        {#if modal.events.length}
          <section class="mission-events" aria-label="Mission progress after game">
            {#each modal.events as event, index (`${event.title}-${index}`)}
              {@const percent = Math.min(100, Math.round(event.after / Math.max(1, event.target) * 100))}
              <article class="mission-event">
                <div class="event-heading"><strong>{event.title}</strong><span class="tabular-nums">{event.after}/{event.target}</span></div>
                <div class="event-track" role="progressbar" aria-label={`${event.title} progress`} aria-valuemin="0" aria-valuemax={event.target} aria-valuenow={event.after}><span class="event-fill" style:width={`${percent}%`}></span></div>
                {#if event.xp > 0}<span class="event-xp">+{event.xp} XP</span>{/if}
              </article>
            {/each}
          </section>
        {/if}
        <div class="actions one"><GameButton variant="mint" size="lg" onclick={onClose}><Check size={18} strokeWidth={3.5} />ตกลง</GameButton></div>

      {:else if modal.kind === 'checkin-success'}
        <div class="medal green"><Gift size={34} /></div>
        <p class="eyebrow">DAILY CHECK-IN</p>
        <h2>รับรางวัลเช็กอินแล้ว!</h2>
        <div class="bigreward"><CurrencyIcon kind="energyPotion" size={34} /><b>+{checkinReward}</b><span>Energy</span></div>
        <p class="summary">สะสมต่อเนื่องครบ 7 วันเพื่อปลดล็อกเหรียญตราและโบนัสพิเศษ!</p>
        <div class="actions one"><GameButton variant="mint" size="lg" onclick={onClose}><Check size={18} strokeWidth={3.5} />ตกลง</GameButton></div>

      {:else if modal.kind === 'energy-empty'}
        <div class="medal blue empty"><Zap size={34} /></div>
        <p class="eyebrow">ENERGY EMPTY</p>
        <h2>พลังงานหมดแล้ว</h2>
        <p class="summary">ฟื้นฟูอัตโนมัติทีละ 1 หน่วยทุก {player.demo.config.regenMinutes} นาที หรือเลือกเติมได้ทันที</p>
        <div class="stack">
          <GameButton variant="purple" size="md" onclick={onOpenRefill}><Zap size={16} fill="currentColor" />เติม Energy</GameButton>
          <GameButton variant="gold" size="md" onclick={onOpenVip}><Crown size={16} fill="currentColor" />สมัคร VIP เล่นฟรีไม่ใช้ Energy</GameButton>
          <GameButton variant="ghost" size="md" onclick={onWait}><Clock3 size={16} />รอฟื้นฟูตามเวลา</GameButton>
        </div>

      {:else if modal.kind === 'action-confirm'}
        <div class="medal blue"><Sparkles size={32} /></div>
        <h2>{modal.title}</h2>
        <p class="summary">{modal.message}</p>
        <div class="actions"><GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton><GameButton onclick={onConfirmAction}>{modal.label}</GameButton></div>
      {:else if modal.kind === 'notice'}
        <div class={`medal ${modal.tone === 'success' ? 'green' : modal.tone === 'warn' ? 'orange' : 'blue'}`}>
          {#if modal.tone === 'success'}<Check size={36} strokeWidth={3.5} />{:else if modal.tone === 'warn'}<TriangleAlert size={32} />{:else}<Sparkles size={32} />{/if}
        </div>
        <h2>{modal.title}</h2>
        <p class="summary">{modal.message}</p>
        <div class="actions one"><GameButton variant={modal.tone === 'warn' ? 'purple' : 'mint'} size="lg" onclick={onClose}><Check size={18} strokeWidth={3.5} />ตกลง</GameButton></div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop { position: fixed; inset: 0; z-index: 70; display: flex; overflow-y: auto; padding: 50px 14px 18px; background: rgb(36 22 90 / 62%); backdrop-filter: blur(5px); animation: fade 0.18s both; overscroll-behavior: contain; }
  .card { position: relative; width: min(100%, 368px); margin: auto; padding: 42px 16px 16px; border: 3px solid #fff; border-radius: 26px; background: linear-gradient(180deg, #fff, #f3edff); box-shadow: 0 10px 0 -3px #8a72dc, 0 22px 50px rgb(30 15 80 / 45%); text-align: center; animation: pop 0.32s cubic-bezier(0.2, 1.2, 0.4, 1) both; }
  .close { position: absolute; z-index: 3; top: 9px; right: 9px; display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: 13px; color: #7d74b4; background: #efeaff; }
  .eyebrow { margin: 0; color: #8a7fc4; font-size: 11px; font-weight: 900; letter-spacing: 0.9px; }
  h2 { margin: 2px 0 8px; color: var(--g-ink); font-size: 21px; font-weight: 900; line-height: 1.2; }
  .summary { margin: 4px 4px 12px; color: var(--g-muted); font-size: 12.5px; font-weight: 700; line-height: 1.45; }

  .medal { position: absolute; top: -34px; left: 50%; display: grid; place-items: center; width: 72px; height: 72px; transform: translateX(-50%); border: 4px solid #fff; border-radius: 50%; color: #fff; box-shadow: 0 6px 0 rgb(40 20 110 / 35%), 0 12px 20px rgb(40 20 110 / 30%); animation: bounce 0.5s 0.15s cubic-bezier(0.3, 1.6, 0.5, 1) both; }
  .gold { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); }
  .blue { background: linear-gradient(160deg, #5fd0ff, #2b8ff0); }
  .green { background: linear-gradient(160deg, #7ee8b4, #22b57d); }
  .orange { background: linear-gradient(160deg, #ffc27a, #ff7a3d); }
  .empty { filter: grayscale(0.3); }

  .receipt { display: grid; gap: 7px; margin: 0 0 10px; padding: 11px 12px; border-radius: 16px; background: #f1ecff; text-align: left; }
  .receipt > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--g-muted); font-size: 12.5px; font-weight: 700; }
  .receipt b { color: var(--g-ink); font-size: 13.5px; font-weight: 900; text-align: right; }
  .cost { display: inline-flex; align-items: center; gap: 4px; color: #245900 !important; }

  .short { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 0 10px; padding: 9px 11px; border: 2px solid #ffd4b8; border-radius: 14px; color: #b3430b; background: #fff1e6; font-size: 11.5px; font-weight: 800; }
  .short b { font-weight: 900; }

  .now { display: inline-flex; align-items: baseline; gap: 6px; margin: -2px 0 10px; padding: 4px 14px; border-radius: 99px; color: var(--g-muted); background: #efeaff; font-size: 12.5px; font-weight: 800; }
  .now b { color: #2b6fd0; font-size: 17px; font-weight: 900; }
  .packs { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 0 0 12px; }
  .pack { display: grid; justify-items: center; gap: 1px; min-height: 90px; padding: 10px 6px; border: 3px solid #e3dbf8; border-radius: 18px; color: #2b6fd0; background: #fff; box-shadow: 0 4px 0 #d3c8f5; transition: transform 0.1s ease; }
  .pack b { color: var(--g-ink); font-size: 22px; font-weight: 900; line-height: 1.1; }
  .pack small { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 99px; color: #245900; background: #e8f8d1; font-size: 11.5px; font-weight: 900; }
  .pack.picked { border-color: #7a5ce0; background: linear-gradient(180deg, #f4efff, #e4daff); box-shadow: 0 4px 0 #6a4fd6, 0 0 0 3px rgb(122 92 224 / 22%); }
  .pack:active { transform: translateY(3px); }

  .swap { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0 0 12px; color: #9a90c8; }
  .swap > div { display: grid; min-width: 96px; padding: 9px 12px; border-radius: 16px; background: #efeaff; color: var(--g-ink); }
  .swap small { color: var(--g-muted); font-size: 11px; font-weight: 800; }
  .swap b { font-size: 28px; font-weight: 900; line-height: 1.1; }
  .swap span { color: var(--g-muted); font-size: 12px; font-weight: 800; }
  .gain { background: linear-gradient(180deg, #fff6cf, #ffe39a) !important; }
  .gain b { color: #b87208; }

  .bigreward { display: grid; justify-items: center; gap: 0; margin: 4px 0 6px; color: #d68a14; }
  .bigreward b { color: #b87208; font-size: 42px; font-weight: 900; line-height: 1.1; text-shadow: 0 2px 0 #fff; }
  .bigreward span { color: var(--g-muted); font-size: 13px; font-weight: 800; }

  .actions { position: sticky; bottom: 6px; display: flex; gap: 9px; padding: 6px 0 2px; }
  .actions > :global(.gbtn) { flex: 1; }
  .actions.one { justify-content: center; }
  .stack { display: grid; gap: 9px; }
  .mission-events { display: grid; gap: 10px; max-height: 36vh; overflow-y: auto; margin: 0 0 8px; text-align: left; }
  .mission-event { display: grid; gap: 6px; padding: 10px; border: 1px solid #d6e8f4; border-radius: 12px; background: #f5fbff; }
  .event-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; color: #2b4160; font-size: 11px; }
  .event-track { height: 9px; overflow: hidden; border-radius: 99px; background: #dce9f2; }
  .event-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #39a7d6, #54c6b1); transition: width 650ms cubic-bezier(0.2, 0.75, 0.25, 1); }
  .event-xp { color: #147253; font-size: 11px; font-weight: 900; }

  .confetti { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; border-radius: inherit; }
  .confetti i { position: absolute; top: 20%; left: 50%; width: 9px; height: 14px; border-radius: 2px; background: hsl(calc(var(--n) * 27) 90% 62%); opacity: 0; animation: burst 1.3s calc(var(--n) * 25ms + 150ms) ease-out both; --dx: calc((var(--n) - 7) * 22px); }

  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pop { from { opacity: 0; transform: translateY(18px) scale(0.92); } to { opacity: 1; transform: none; } }
  @keyframes bounce { from { transform: translateX(-50%) scale(0.3); } to { transform: translateX(-50%) scale(1); } }
  @keyframes burst { 0% { opacity: 1; transform: translate(0, 0) rotate(0); } 100% { opacity: 0; transform: translate(var(--dx), 220px) rotate(520deg); } }
  @media (prefers-reduced-motion: reduce) { .backdrop, .card, .medal, .confetti i { animation: none; } .confetti { display: none; } }
</style>
