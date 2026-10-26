<script lang="ts">
  import { ArrowRight, Check, Clock3, Coins, Crown, Gift, Sparkles, TriangleAlert, X, Zap } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import GameButton from './GameButton.svelte';
  import RarityChip from './RarityChip.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { rarityOf } from '../data/rarity';
  import type { ModalState, PlayerState } from '../types';

  let {
    modal, player, exchangeAmount, checkinReward,
    onClose, onPickRefill, onConfirmRefill, onConfirmVip, onConfirmExchange,
    onOpenRefill, onOpenVip, onOpenExchange, onWait, onConfirmItem, onConfirmAction = () => {},
  }: {
    modal: ModalState;
    player: PlayerState;
    exchangeAmount: number;
    checkinReward: number;
    onClose: () => void;
    onPickRefill: (id: string) => void;
    onConfirmRefill: () => void;
    onConfirmVip: () => void;
    onConfirmExchange: () => void;
    onOpenRefill: () => void;
    onOpenVip: () => void;
    onOpenExchange: () => void;
    onWait: () => void;
    onConfirmItem: () => void;
    onConfirmAction?: () => void;
  } = $props();

  let SHOP_ITEMS = $derived(player.demo.config.shop);
  let ENERGY_CONFIG = $derived({ max: player.demo.config.energyMax, refillPacks: player.demo.config.energyPacks });
  let EXCHANGE_RATE = $derived(player.demo.config.exchangeRate);
  let VIP_PACKAGES = $derived(player.demo.config.vipPlans);
  let vip = $derived(modal?.kind === 'vip-confirm' ? VIP_PACKAGES.find((pack) => pack.id === modal.packageId) ?? null : null);
  let refill = $derived(modal?.kind === 'refill-confirm' ? ENERGY_CONFIG.refillPacks.find((pack) => pack.id === modal.refillId) ?? null : null);
  let pet = $derived(modal?.kind === 'gacha-result' ? PETS.find((item) => item.id === modal.petId) ?? null : null);
  let petStyle = $derived(pet ? rarityOf(pet.rarity) : rarityOf('Common'));
  let vipShort = $derived(vip ? Math.max(0, vip.cost - player.masquePoints) : 0);
  let refillShort = $derived(refill ? Math.max(0, refill.cost - player.masquePoints) : 0);
  let refillAfter = $derived(refill ? player.energy + refill.energy : player.energy);
  let celebrate = $derived(modal?.kind === 'gacha-result' || modal?.kind === 'checkin-success' || (modal?.kind === 'notice' && modal.tone === 'success'));
  let shopItem = $derived(modal?.kind === 'item-confirm' ? SHOP_ITEMS.find((item) => item.id === modal.itemId) : undefined);
  let shopArt = $derived(shopItem ? (shopItem.kind === 'avatar' ? AVATARS : PETS).find((item) => item.id === shopItem.itemId) : undefined);
  let wing = $derived(shopItem?.kind === 'wing' ? WINGS.find((wing) => wing.id === shopItem.itemId) : undefined);

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
    <div class="card" use:focusDialog class:spot={modal.kind === 'gacha-result'} role="dialog" tabindex="-1" aria-label="รายการ Game Center" aria-modal="true" onclick={(event) => event.stopPropagation()} onkeydown={(event) => event.stopPropagation()}>
      <button class="close" aria-label="ปิดหน้าต่าง" onclick={onClose}><X size={18} strokeWidth={3} /></button>
      {#if celebrate}<div class="confetti" aria-hidden="true">{#each Array.from({ length: 14 }) as _, i (i)}<i style={`--n:${i}`}></i>{/each}</div>{/if}

      {#if shopItem?.kind === 'wing' && wing}
        <img class="mx-auto h-40 w-48 object-contain" src={wing.imagePath} alt={wing.name} /><h2>{wing.name}</h2><RarityChip rarity={wing.rarity} />
        <div class="receipt"><div><span>ราคา</span><b>{shopItem.cost} MP</b></div><div><span>ยอดปัจจุบัน</span><b>{player.masquePoints} MP</b></div></div>
        <div class="actions"><GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton><GameButton disabled={player.masquePoints < shopItem.cost} onclick={onConfirmItem}>ยืนยันซื้อ</GameButton></div>
      {:else if shopItem?.kind === 'frame'}
        <div class="medal blue"><Sparkles size={32} /></div><h2>{shopItem.itemId === 'sunrise' ? 'Sunrise Frame' : 'Ocean Frame'}</h2>
        <div class="receipt"><div><span>ราคา</span><b>{shopItem.cost} MP</b></div><div><span>ยอดปัจจุบัน</span><b>{player.masquePoints} MP</b></div></div>
        <div class="actions"><GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton><GameButton disabled={player.masquePoints < shopItem.cost} onclick={onConfirmItem}>ยืนยันซื้อ</GameButton></div>
      {:else if shopItem && shopArt}
        <div style="width:120px;height:150px;margin:0 auto 12px"><AssetPortrait src={shopArt.imagePath} alt={shopArt.name} placeholder={shopArt.placeholder} kind={shopItem.kind === 'avatar' ? 'avatar' : 'pet'} loading="eager" /></div>
        <h2>{shopArt.name}</h2>
        <RarityChip rarity={shopArt.rarity} size="md" />
        <div class="receipt"><div><span>ราคา</span><b>{shopItem.cost} MP</b></div><div><span>ยอดปัจจุบัน</span><b>{player.masquePoints} MP</b></div></div>
        <p class="summary">ซื้อเข้าคอลเลกชัน · ราคาตัวอย่าง</p>
        {#if player.masquePoints < shopItem.cost}<div class="short">แต้มไม่พอ ขาดอีก {shopItem.cost - player.masquePoints} MP</div>{/if}
        <div class="actions"><GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>{#if player.masquePoints < shopItem.cost}<GameButton variant="mint" onclick={onOpenExchange}>แลกแต้ม</GameButton>{:else}<GameButton variant="purple" onclick={onConfirmItem}>ยืนยันซื้อ</GameButton>{/if}</div>
      {:else if vip}
        <div class="medal gold"><Crown size={34} fill="currentColor" /></div>
        <p class="eyebrow">VIP PASS · ราคาตัวอย่าง</p>
        <h2>{vip.label}</h2>
        <ul class="perks"><li><Zap size={13} fill="currentColor" />{player.demo.config.vipUnlimited ? 'Energy ไม่จำกัด' : 'VIP Profile Badge'}</li><li><Check size={13} strokeWidth={3.5} />{vip.reward}</li></ul>
        <div class="receipt">
          <div><span>ระยะเวลา</span><b>{vip.durationDays} วัน</b></div>
          <div><span>ของแถม</span><b>{vip.reward}</b></div>
          <div><span>ราคา</span><b class="cost"><Coins size={14} />{vip.cost} MP</b></div>
          <div class="after"><span>คงเหลือหลังซื้อ</span><b>{Math.max(0, player.masquePoints - vip.cost).toLocaleString('en-US')} MP</b></div>
        </div>
        {#if vipShort > 0}<div class="short"><TriangleAlert size={16} />แต้มไม่พอ ขาดอีก <b>{vipShort.toLocaleString('en-US')}</b> MP</div>{/if}
        <div class="actions">
          <GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton>
          {#if vipShort > 0}<GameButton variant="mint" size="md" onclick={onOpenExchange}><Coins size={16} />แลกแต้ม</GameButton>
          {:else}<GameButton variant="gold" size="md" onclick={onConfirmVip}>ยืนยันซื้อ<ArrowRight size={16} /></GameButton>{/if}
        </div>

      {:else if refill && modal.kind === 'refill-confirm'}
        <div class="medal blue"><Zap size={34} fill="currentColor" /></div>
        <p class="eyebrow">ENERGY REFILL</p>
        <h2>เติมพลังงาน</h2>
        <div class="now"><span>ตอนนี้</span><b>{player.energy}/{ENERGY_CONFIG.max}</b></div>
        <div class="packs" role="radiogroup" aria-label="เลือกแพ็ก Energy">
          {#each ENERGY_CONFIG.refillPacks as pack (pack.id)}
            <button class="pack" class:picked={refill.id === pack.id} role="radio" aria-checked={refill.id === pack.id} onclick={() => onPickRefill(pack.id)}>
              <Zap size={22} fill="currentColor" /><b>+{pack.energy}</b><small><Coins size={12} />{pack.cost} MP</small>
            </button>
          {/each}
        </div>
        <div class="receipt">
          <div><span>จะได้รับ</span><b>+{refill.energy} Energy</b></div>
          <div><span>ใช้แต้ม</span><b class="cost"><Coins size={14} />{refill.cost} MP</b></div>
          <div class="after"><span>Energy หลังเติม</span><b>{refillAfter}/{ENERGY_CONFIG.max}</b></div>
        </div>
        {#if refillShort > 0}<div class="short"><TriangleAlert size={16} />แต้มไม่พอ ขาดอีก <b>{refillShort.toLocaleString('en-US')}</b> MP</div>{/if}
        <div class="actions">
          <GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton>
          {#if refillShort > 0}<GameButton variant="mint" size="md" onclick={onOpenExchange}><Coins size={16} />แลกแต้ม</GameButton>
          {:else}<GameButton variant="purple" size="md" onclick={onConfirmRefill}>ยืนยันเติม<Zap size={16} fill="currentColor" /></GameButton>{/if}
        </div>

      {:else if modal.kind === 'exchange-confirm'}
        <div class="medal green"><Coins size={34} /></div>
        <p class="eyebrow">DEMO · AIS POINTS EXCHANGE</p>
        <h2>ยืนยันการแลกแต้ม</h2>
        <div class="swap"><div><small>ใช้</small><b>{exchangeAmount}</b><span>AIS</span></div><ArrowRight size={22} /><div class="gain"><small>ได้รับ</small><b>{exchangeAmount * EXCHANGE_RATE}</b><span>MP</span></div></div>
        <div class="receipt">
          <div><span>อัตราแลก</span><b>1 AIS = {EXCHANGE_RATE} MP</b></div>
          <div><span>AIS คงเหลือ</span><b>{player.aisPoints - exchangeAmount}</b></div>
          <div class="after"><span>MP หลังแลก</span><b>{(player.masquePoints + exchangeAmount * EXCHANGE_RATE).toLocaleString('en-US')}</b></div>
        </div>
        <div class="actions"><GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton><GameButton variant="mint" size="md" onclick={onConfirmExchange}>ยืนยันแลก<ArrowRight size={16} /></GameButton></div>

      {:else if pet && modal.kind === 'gacha-result'}
        <div class="spotlight" style={`--glow:${petStyle.glow};--top:${petStyle.top};--bottom:${petStyle.bottom}`}>
          <span class="rays" aria-hidden="true"></span>
          <AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" loading="eager" className="reveal-pet" />
        </div>
        <div class="newtag" class:dup={modal.duplicate}>{modal.duplicate ? `ซ้ำ! คืน ${player.demo.config.duplicatePoints} MP` : 'NEW!'}</div>
        <h2>{pet.name}</h2>
        <RarityChip rarity={pet.rarity} size="md" />
        <p class="summary">{modal.duplicate ? 'ได้ Pet ตัวนี้อยู่แล้ว คืนแต้มตามกติกาเดโม' : 'เพิ่มเข้า Pet Collection แล้ว เลือกใช้งานได้ที่ Avatar & Pets'}</p>
        <div class="actions one"><GameButton variant="gold" size="lg" onclick={onClose}><Sparkles size={18} />เยี่ยมเลย</GameButton></div>

      {:else if modal.kind === 'checkin-success'}
        <div class="medal green"><Gift size={34} /></div>
        <p class="eyebrow">DAILY CHECK-IN</p>
        <h2>รับรางวัลแล้ว!</h2>
        <div class="bigreward"><Coins size={30} /><b>+{checkinReward}</b><span>Masque Points</span></div>
        <p class="summary">กลับมาเช็กอินพรุ่งนี้เพื่อรับรางวัลต่อนะ</p>
        <div class="actions one"><GameButton variant="mint" size="lg" onclick={onClose}><Check size={18} strokeWidth={3.5} />ตกลง</GameButton></div>

      {:else if modal.kind === 'energy-empty'}
        <div class="medal blue empty"><Zap size={34} /></div>
        <p class="eyebrow">ENERGY EMPTY</p>
        <h2>Energy หมดแล้ว</h2>
        <p class="summary">Energy ฟื้นทีละ 1 ทุก {player.demo.config.regenMinutes} นาที หรือเติมด้วย Masque Points</p>
        <div class="stack">
          <GameButton variant="purple" size="md" onclick={onOpenRefill}><Zap size={16} fill="currentColor" />เติม Energy</GameButton>
          <GameButton variant="gold" size="md" onclick={onOpenVip}><Crown size={16} fill="currentColor" />ซื้อ VIP · Energy ∞</GameButton>
          <GameButton variant="ghost" size="md" onclick={onWait}><Clock3 size={16} />รอ Energy ฟื้น</GameButton>
        </div>

      {:else if modal.kind === 'action-confirm'}
        <div class="medal blue"><Sparkles size={32} /></div>
        <h2>{modal.title}</h2><p class="summary">{modal.message}</p>
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
  .card { position: relative; width: min(100%, 360px); margin: auto; padding: 46px 16px 16px; border: 3px solid #fff; border-radius: 26px; background: linear-gradient(180deg, #fff, #f3edff); box-shadow: 0 10px 0 -3px #8a72dc, 0 22px 50px rgb(30 15 80 / 45%); text-align: center; animation: pop 0.32s cubic-bezier(0.2, 1.2, 0.4, 1) both; }
  .close { position: absolute; z-index: 3; top: 9px; right: 9px; display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 13px; color: #7d74b4; background: #efeaff; }
  .eyebrow { margin: 0; color: #8a7fc4; font-size: 11px; font-weight: 900; letter-spacing: 0.9px; }
  h2 { margin: 2px 0 8px; color: var(--g-ink); font-size: 23px; font-weight: 900; line-height: 1.2; }
  .summary { margin: 4px 4px 12px; color: var(--g-muted); font-size: 14px; font-weight: 700; line-height: 1.5; }

  .medal { position: absolute; top: -34px; left: 50%; display: grid; place-items: center; width: 74px; height: 74px; transform: translateX(-50%); border: 4px solid #fff; border-radius: 50%; color: #fff; box-shadow: 0 6px 0 rgb(40 20 110 / 35%), 0 12px 20px rgb(40 20 110 / 30%); animation: bounce 0.5s 0.15s cubic-bezier(0.3, 1.6, 0.5, 1) both; }
  .gold { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); }
  .blue { background: linear-gradient(160deg, #5fd0ff, #2b8ff0); }
  .green { background: linear-gradient(160deg, #7ee8b4, #22b57d); }
  .orange { background: linear-gradient(160deg, #ffc27a, #ff7a3d); }
  .empty { filter: grayscale(0.3); }

  .perks { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 0 0 10px; padding: 0; list-style: none; }
  .perks li { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 99px; color: #8a5a06; background: #fff0c2; font-size: 12px; font-weight: 800; }

  .receipt { display: grid; gap: 7px; margin: 0 0 10px; padding: 11px 12px; border-radius: 16px; background: #f1ecff; text-align: left; }
  .receipt > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--g-muted); font-size: 13px; font-weight: 700; }
  .receipt b { color: var(--g-ink); font-size: 14px; font-weight: 900; text-align: right; }
  .cost { display: inline-flex; align-items: center; gap: 3px; color: #b87208 !important; }
  .after { padding-top: 7px; border-top: 2px dashed #d3c8f5; }
  .after b { color: #5a3fc0; font-size: 16px; }

  .short { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 0 10px; padding: 9px 11px; border: 2px solid #ffd4b8; border-radius: 14px; color: #b3430b; background: #fff1e6; font-size: 13px; font-weight: 800; }
  .short b { font-weight: 900; }
  .short.info { border-color: #bfe6d2; color: #1a7a54; background: #e9f9f0; }

  .now { display: inline-flex; align-items: baseline; gap: 6px; margin: -2px 0 10px; padding: 4px 14px; border-radius: 99px; color: var(--g-muted); background: #efeaff; font-size: 13px; font-weight: 800; }
  .now b { color: #2b6fd0; font-size: 18px; font-weight: 900; }
  .packs { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 0 0 12px; }
  .pack { display: grid; justify-items: center; gap: 1px; min-height: 92px; padding: 10px 6px; border: 3px solid #e3dbf8; border-radius: 18px; color: #2b6fd0; background: #fff; box-shadow: 0 4px 0 #d3c8f5; transition: transform 0.1s ease; }
  .pack b { color: var(--g-ink); font-size: 24px; font-weight: 900; line-height: 1.1; }
  .pack small { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 99px; color: #8a5a06; background: #fff0c2; font-size: 12px; font-weight: 900; }
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

  .spotlight { position: relative; display: grid; place-items: center; width: 190px; height: 190px; margin: -8px auto 2px; }
  .rays { position: absolute; inset: -30px; border-radius: 50%; background: repeating-conic-gradient(from 0deg, var(--glow) 0 10deg, transparent 10deg 24deg); mask-image: radial-gradient(circle, #000 28%, transparent 70%); animation: spin 14s linear infinite; }
  .spotlight::before { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: radial-gradient(circle, #fff 18%, var(--top) 55%, var(--bottom) 100%); box-shadow: 0 0 40px var(--glow), inset 0 0 0 4px #fff; }
  .spotlight :global(.reveal-pet) { position: relative; width: 150px; height: 170px; background: transparent; filter: drop-shadow(0 6px 8px rgb(40 20 100 / 35%)); animation: reveal 0.7s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
  .newtag { display: inline-block; margin: 0 0 4px; padding: 3px 14px; transform: rotate(-3deg); border: 2px solid #fff; border-radius: 12px; color: #fff; background: linear-gradient(135deg, #ffb347, #ff5f3d); box-shadow: 0 3px 0 #c43d1d; font-size: 15px; font-weight: 900; }
  .newtag.dup { background: linear-gradient(135deg, #8ab4f8, #5a7de0); box-shadow: 0 3px 0 #3a54b0; font-size: 13px; }

  .confetti { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; border-radius: inherit; }
  .confetti i { position: absolute; top: 20%; left: 50%; width: 9px; height: 14px; border-radius: 2px; background: hsl(calc(var(--n) * 27) 90% 62%); opacity: 0; animation: burst 1.3s calc(var(--n) * 25ms + 150ms) ease-out both; --dx: calc((var(--n) - 7) * 22px); }

  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pop { from { opacity: 0; transform: translateY(18px) scale(0.92); } to { opacity: 1; transform: none; } }
  @keyframes bounce { from { transform: translateX(-50%) scale(0.3); } to { transform: translateX(-50%) scale(1); } }
  @keyframes reveal { from { opacity: 0; transform: scale(0.4) rotate(-12deg); } to { opacity: 1; transform: none; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes burst { 0% { opacity: 1; transform: translate(0, 0) rotate(0); } 100% { opacity: 0; transform: translate(var(--dx), 220px) rotate(520deg); } }
  @media (prefers-reduced-motion: reduce) { .backdrop, .card, .medal, .rays, .spotlight :global(.reveal-pet), .confetti i { animation: none; } .confetti { display: none; } }
</style>
