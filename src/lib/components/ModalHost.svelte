<script lang="ts">
  import { ArrowRight, Check, Clock3, Crown, Gift, Sparkles, Target, TriangleAlert, X, Zap } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import AvatarFrame from './AvatarFrame.svelte';
  import CurrencyIcon from './CurrencyIcon.svelte';
  import GameButton from './GameButton.svelte';
  import RarityChip from './RarityChip.svelte';
  import RewardIcon from './RewardIcon.svelte';
  import VipPassOffer from './VipPassOffer.svelte';
  import { AVATARS, PETS, PROFILE_FRAMES, WINGS } from '../data/config';
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
  let refillAfter = $derived(refill ? player.energy + refill.energy : player.energy);
  let celebrate = $derived(modal?.kind === 'gacha-result' || modal?.kind === 'checkin-success' || (modal?.kind === 'notice' && modal.tone === 'success'));
  let shopItem = $derived(modal?.kind === 'item-confirm' ? SHOP_ITEMS.find((item) => item.id === modal.itemId) : undefined);
  let shopArt = $derived(shopItem ? (shopItem.kind === 'avatar' ? AVATARS : PETS).find((item) => item.id === shopItem.itemId) : undefined);
  let wing = $derived(shopItem?.kind === 'wing' ? WINGS.find((wing) => wing.id === shopItem.itemId) : undefined);
  let frameMeta = $derived(shopItem?.kind === 'frame' ? PROFILE_FRAMES.find((f) => f.id === shopItem.itemId) : undefined);

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
        <img class="mx-auto h-36 w-44 object-contain" src={wing.imagePath} alt={wing.name} />
        <h2>{wing.name}</h2>
        <RarityChip rarity={wing.rarity} />
        <div class="receipt mt-2">
          <div><span>ราคาแลกซื้อ</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{shopItem.cost} AIS Point</b></div>
          <div><span>ยอด myAIS ปัจจุบัน</span><b>{player.aisPoints} AIS Point</b></div>
        </div>
        {#if player.aisPoints < shopItem.cost}
          <div class="short">AIS Point สะสมจาก myAIS ไม่พอ (ขาดอีก {shopItem.cost - player.aisPoints} คะแนน)</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton disabled={player.aisPoints < shopItem.cost} onclick={onConfirmItem}>ยืนยันแลกซื้อ</GameButton>
        </div>

      {:else if shopItem?.kind === 'frame'}
        <div class="mx-auto mb-2 flex justify-center">
          <AvatarFrame avatarId={player.avatarId} frameId={shopItem.itemId} size="xl" />
        </div>
        <p class="eyebrow">COLLECTIBLE PROFILE FRAME</p>
        <h2>{frameMeta?.name ?? `${shopItem.itemId} Frame`}</h2>
        <RarityChip rarity={frameMeta?.rarity ?? 'Rare'} />
        <p class="summary">{frameMeta?.theme ?? 'Profile & Ranking Frame'} · ใช้ตกแต่งใน Profile และแสดงบน Leaderboard</p>
        <div class="receipt">
          <div><span>ราคาแลกซื้อ</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{shopItem.cost} AIS Point</b></div>
          <div><span>ยอด myAIS ปัจจุบัน</span><b>{player.aisPoints} AIS Point</b></div>
        </div>
        {#if player.aisPoints < shopItem.cost}
          <div class="short">AIS Point สะสมจาก myAIS ไม่พอ (ขาดอีก {shopItem.cost - player.aisPoints} คะแนน)</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton disabled={player.aisPoints < shopItem.cost} onclick={onConfirmItem}>ยืนยันแลกซื้อ</GameButton>
        </div>

      {:else if shopItem && shopArt}
        <div style="width:120px;height:150px;margin:0 auto 12px">
          <AssetPortrait src={shopArt.imagePath} alt={shopArt.name} placeholder={shopArt.placeholder} kind={shopItem.kind === 'avatar' ? 'avatar' : 'pet'} loading="eager" />
        </div>
        <h2>{shopArt.name}</h2>
        <RarityChip rarity={shopArt.rarity} size="md" />
        <div class="receipt">
          <div><span>ราคาแลกซื้อ</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{shopItem.cost} AIS Point</b></div>
          <div><span>ยอด myAIS ปัจจุบัน</span><b>{player.aisPoints} AIS Point</b></div>
        </div>
        <p class="summary">แลกเข้าคอลเลกชันด้วยคะแนน myAIS · ราคาตัวอย่างในเดโม</p>
        {#if player.aisPoints < shopItem.cost}
          <div class="short">AIS Point สะสมจาก myAIS ไม่พอ ขาดอีก {shopItem.cost - player.aisPoints} AIS Point</div>
        {/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="purple" disabled={player.aisPoints < shopItem.cost} onclick={onConfirmItem}>ยืนยันแลกซื้อ</GameButton>
        </div>

      {:else if modal.kind === 'gacha-coupon-confirm'}
        <div class="medal gold"><CurrencyIcon kind="petGachaTicket" size={38} /></div>
        <p class="eyebrow">AVATAR · PET GACHA</p>
        <h2>ซื้อคูปองสุ่ม</h2>
        <p class="summary">{modal.quantity} คูปอง · {modal.quantity === 10 ? 'เปิด 10 ครั้ง รับโบนัสเพิ่ม 1 ครั้ง' : 'เปิดได้ 1 ครั้ง'} · ใช้ได้ทั้งตู้ Avatar และ Pet</p>
        <div class="receipt">
          <div><span>ราคา</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{couponCost.toLocaleString()} AIS Point</b></div>
          <div><span>ยอด myAIS ปัจจุบัน</span><b>{player.aisPoints.toLocaleString()} AIS Point</b></div>
          <div class="after"><span>คูปองหลังซื้อ</span><b>{player.gachaTickets + modal.quantity} ใบ</b></div>
        </div>
        {#if couponShort > 0}<div class="short"><TriangleAlert size={16} />AIS Point จาก myAIS ไม่พอ ขาดอีก <b>{couponShort.toLocaleString()}</b></div>{/if}
        <div class="actions">
          <GameButton variant="ghost" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="gold" disabled={couponShort > 0} onclick={onConfirmGachaCoupons}><CurrencyIcon kind="petGachaTicket" size={20} />ซื้อคูปอง</GameButton>
        </div>

      {:else if vip}
        <VipPassOffer {player} packageId={vip.id} {now} onSelect={onPickVip} onConfirm={onConfirmVip} onTopUp={onOpenExchange} {onClose} />

      {:else if refill && modal.kind === 'refill-confirm'}
        <div class="medal blue"><CurrencyIcon kind="energyPotion" size={40} /></div>
        <p class="eyebrow">ENERGY REFILL</p>
        <h2>เติมพลังงาน</h2>
        <div class="now"><span>ตอนนี้</span><b>{player.energy}/{ENERGY_CONFIG.max}</b></div>
        <div class="packs" role="radiogroup" aria-label="เลือกแพ็ก Energy">
          {#each ENERGY_CONFIG.refillPacks as pack (pack.id)}
            <button class="pack" class:picked={refill.id === pack.id} role="radio" aria-checked={refill.id === pack.id} onclick={() => onPickRefill(pack.id)}>
              <CurrencyIcon kind="energyPotion" size={24} /><b>+{pack.energy}</b><small><CurrencyIcon kind="aisPoints" size={14} />{pack.cost} AIS Point</small>
            </button>
          {/each}
        </div>
        <div class="receipt">
          <div><span>จะได้รับ</span><b>+{refill.energy} Energy</b></div>
          <div><span>ใช้ AIS Point</span><b class="cost"><CurrencyIcon kind="aisPoints" size={16} />{refill.cost} AIS Point</b></div>
          <div class="after"><span>Energy หลังเติม</span><b>{refillAfter}/{ENERGY_CONFIG.max}</b></div>
        </div>
        {#if refillShort > 0}<div class="short"><TriangleAlert size={16} />AIS Point จาก myAIS ไม่พอ ขาดอีก <b>{refillShort.toLocaleString('en-US')}</b></div>{/if}
        <div class="actions">
          <GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton>
          <GameButton variant="purple" size="md" disabled={refillShort > 0} onclick={onConfirmRefill}>ยืนยันเติม<Zap size={16} fill="currentColor" /></GameButton>
        </div>

      {:else if modal.kind === 'exchange-confirm'}
        <div class="medal green"><CurrencyIcon kind="aisPoints" size={40} /></div>
        <p class="eyebrow">DEMO · AIS POINTS EXCHANGE</p>
        <h2>ยืนยันการแลกแต้ม</h2>
        <div class="swap"><div><small>ใช้</small><b>{exchangeAmount}</b><span>AIS</span></div><ArrowRight size={22} /><div class="gain"><small>ได้รับ</small><b>{exchangeAmount * EXCHANGE_RATE}</b><span>MP</span></div></div>
        <div class="receipt">
          <div><span>อัตราแลก</span><b>1 AIS = {EXCHANGE_RATE} MP</b></div>
          <div><span>AIS คงเหลือ</span><b>{player.aisPoints - exchangeAmount}</b></div>
          <div class="after"><span>MP หลังแลก</span><b>{(player.masquePoints + exchangeAmount * EXCHANGE_RATE).toLocaleString('en-US')}</b></div>
        </div>
        <div class="actions"><GameButton variant="ghost" size="md" onclick={onClose}>ยกเลิก</GameButton><GameButton variant="mint" size="md" onclick={onConfirmExchange}>ยืนยันแลก<ArrowRight size={16} /></GameButton></div>

      {:else if modal.kind === 'gacha-result'}
        <p class="eyebrow">{modal.gachaKind === 'pet' ? 'PET GACHA' : 'AVATAR GACHA'}</p>
        <h2>ผลสุ่ม {modal.results.length} ครั้ง</h2>
        <p class="summary">{modal.source === 'box' ? 'เปิดจาก Gacha Box · ใช้กล่อง 1 ใบ' : `ใช้ ${modal.paidCoupons} คูปอง${modal.bonusDraws ? ` · โบนัสฟรี ${modal.bonusDraws} ครั้ง` : ''}`}</p>
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
        <p class="eyebrow">SIMULATED · GAME RESULT</p>
        <h2>เล่นจบแล้ว · {modal.score.toLocaleString()} คะแนน</h2>
        <p class="summary">+{modal.rewardXp} EXP</p>
        {#if modal.events.length}
          <section class="mission-events" aria-label="Mission progress after game">
            {#each modal.events as event, index (`${event.title}-${index}`)}
              {@const percent = Math.min(100, Math.round(event.after / Math.max(1, event.target) * 100))}
              <article class="mission-event">
                <div class="event-heading"><strong>{event.title}</strong><span class="tabular-nums">{event.before}/{event.target} → {event.after}/{event.target}</span></div>
                <div class="event-track" role="progressbar" aria-label={`${event.title} progress`} aria-valuemin="0" aria-valuemax={event.target} aria-valuenow={event.after}><span class="event-fill" style:width={`${percent}%`}></span></div>
                {#if event.xp > 0}<span class="event-xp">+{event.xp} XP · รับอัตโนมัติแล้ว</span>{/if}
              </article>
            {/each}
          </section>
        {:else}<p class="summary">ไม่มี Mission ที่ตรงเงื่อนไขในรอบนี้</p>{/if}
        <div class="actions one"><GameButton variant="mint" size="lg" onclick={onClose}><Check size={18} strokeWidth={3.5} />ดูผลแล้ว</GameButton></div>

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
        <h2>Energy หมดแล้ว</h2>
        <p class="summary">Energy ฟื้นทีละ 1 ทุก {player.demo.config.regenMinutes} นาที หรือเติมด้วย AIS Point</p>
        <div class="stack">
          <GameButton variant="purple" size="md" onclick={onOpenRefill}><Zap size={16} fill="currentColor" />เติม Energy</GameButton>
          <GameButton variant="gold" size="md" onclick={onOpenVip}><Crown size={16} fill="currentColor" />VIP · ยกเว้นค่าเข้าเกม</GameButton>
          <GameButton variant="ghost" size="md" onclick={onWait}><Clock3 size={16} />รอ Energy ฟื้น</GameButton>
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
  .card { position: relative; width: min(100%, 360px); margin: auto; padding: 46px 16px 16px; border: 3px solid #fff; border-radius: 26px; background: linear-gradient(180deg, #fff, #f3edff); box-shadow: 0 10px 0 -3px #8a72dc, 0 22px 50px rgb(30 15 80 / 45%); text-align: center; animation: pop 0.32s cubic-bezier(0.2, 1.2, 0.4, 1) both; }
  .close { position: absolute; z-index: 3; top: 9px; right: 9px; display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 13px; color: #7d74b4; background: #efeaff; }
  .eyebrow { margin: 0; color: #8a7fc4; font-size: 11px; font-weight: 900; letter-spacing: 0.9px; }
  h2 { margin: 2px 0 8px; color: var(--g-ink); font-size: 22px; font-weight: 900; line-height: 1.2; }
  .summary { margin: 4px 4px 12px; color: var(--g-muted); font-size: 13px; font-weight: 700; line-height: 1.45; }

  .medal { position: absolute; top: -34px; left: 50%; display: grid; place-items: center; width: 74px; height: 74px; transform: translateX(-50%); border: 4px solid #fff; border-radius: 50%; color: #fff; box-shadow: 0 6px 0 rgb(40 20 110 / 35%), 0 12px 20px rgb(40 20 110 / 30%); animation: bounce 0.5s 0.15s cubic-bezier(0.3, 1.6, 0.5, 1) both; }
  .gold { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); }
  .blue { background: linear-gradient(160deg, #5fd0ff, #2b8ff0); }
  .green { background: linear-gradient(160deg, #7ee8b4, #22b57d); }
  .orange { background: linear-gradient(160deg, #ffc27a, #ff7a3d); }
  .empty { filter: grayscale(0.3); }

  .receipt { display: grid; gap: 7px; margin: 0 0 10px; padding: 11px 12px; border-radius: 16px; background: #f1ecff; text-align: left; }
  .receipt > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--g-muted); font-size: 13px; font-weight: 700; }
  .receipt b { color: var(--g-ink); font-size: 14px; font-weight: 900; text-align: right; }
  .cost { display: inline-flex; align-items: center; gap: 4px; color: #245900 !important; }
  .after { padding-top: 7px; border-top: 2px dashed #d3c8f5; }
  .after b { color: #5a3fc0; font-size: 16px; }

  .short { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 0 10px; padding: 9px 11px; border: 2px solid #ffd4b8; border-radius: 14px; color: #b3430b; background: #fff1e6; font-size: 12px; font-weight: 800; }
  .short b { font-weight: 900; }

  .now { display: inline-flex; align-items: baseline; gap: 6px; margin: -2px 0 10px; padding: 4px 14px; border-radius: 99px; color: var(--g-muted); background: #efeaff; font-size: 13px; font-weight: 800; }
  .now b { color: #2b6fd0; font-size: 18px; font-weight: 900; }
  .packs { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 0 0 12px; }
  .pack { display: grid; justify-items: center; gap: 1px; min-height: 92px; padding: 10px 6px; border: 3px solid #e3dbf8; border-radius: 18px; color: #2b6fd0; background: #fff; box-shadow: 0 4px 0 #d3c8f5; transition: transform 0.1s ease; }
  .pack b { color: var(--g-ink); font-size: 24px; font-weight: 900; line-height: 1.1; }
  .pack small { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 99px; color: #245900; background: #e8f8d1; font-size: 12px; font-weight: 900; }
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
