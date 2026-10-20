<script lang="ts">
  import { ArrowRight, Check, Coins, Crown, Gift, Minus, Plus, ShoppingBag, UsersRound, Zap } from '@lucide/svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import Panel from '../components/Panel.svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, PETS, SHOP_ITEMS, ENERGY_CONFIG, EXCHANGE_RATE, VIP_PACKAGES } from '../data/config';
  import type { PlayerState, ShopTab } from '../types';

  let { player, vipActive, now, tab = $bindable(), amount = $bindable(), onExchange, onRefill, onVip, onRoom, onBuy }: {
    player: PlayerState;
    vipActive: boolean;
    now: number;
    tab: ShopTab;
    amount: number;
    onExchange: () => void;
    onRefill: (packId: string) => void;
    onVip: (packageId: string) => void;
    onRoom: () => void;
    onBuy: (id: string) => void;
  } = $props();

  const TABS: { id: ShopTab; label: string }[] = [
    { id: 'items', label: 'ของขาย' },
    { id: 'exchange', label: 'แลกแต้ม' },
    { id: 'energy', label: 'Energy' },
    { id: 'vip', label: 'VIP' },
  ];

  let validAmount = $derived(Number.isInteger(amount) && amount >= 1 && amount <= player.aisPoints);
  let gain = $derived(validAmount ? amount * EXCHANGE_RATE : 0);
  let quick = $derived([1, 5, 10].filter((value) => value <= player.aisPoints));
  let vipDays = $derived(player.vipExpiresAt ? Math.max(0, Math.ceil((player.vipExpiresAt - now) / 86_400_000)) : 0);
  let energyPercent = $derived(Math.min(100, (player.energy / ENERGY_CONFIG.max) * 100));
  let category = $state<'all' | 'avatar' | 'pet'>('all');
  let previewAvatarId = $state<string | null>(null);
  let previewPetId = $state<string | null>(null);
  let previewAvatar = $derived(AVATARS.find((item) => item.id === (previewAvatarId ?? player.avatarId)) ?? AVATARS[0]);
  let previewPet = $derived(PETS.find((item) => item.id === (previewPetId ?? player.petId)));
  let products = $derived(SHOP_ITEMS.filter((item) => category === 'all' || item.kind === category).map((item) => ({
    ...item,
    art: (item.kind === 'avatar' ? AVATARS : PETS).find((art) => art.id === item.itemId)!,
    owned: (item.kind === 'avatar' ? player.ownedAvatarIds : player.ownedPetIds).includes(item.itemId),
  })));

  function setAmount(value: number): void {
    amount = Math.max(1, Math.min(Math.max(1, player.aisPoints), Math.floor(value) || 1));
  }
</script>

<div class="page-stack">
  <PageTitle eyebrow="FANTASY POINT SHOP" title="Shop" subtitle="แลกแต้ม เติมพลัง และเปิด VIP">
    {#snippet icon()}<ShoppingBag size={26} />{/snippet}
  </PageTitle>

  {#if tab === 'exchange'}
  <Panel tone="sky">
    <div class="wallet">
      <div class="coin ais"><span class="mark">AIS</span><small>AIS Points</small><b>{player.aisPoints.toLocaleString('en-US')}</b></div>
      <div class="rate"><ArrowRight size={18} strokeWidth={3} /><small>1 : {EXCHANGE_RATE}</small></div>
      <div class="coin mp"><span class="mark"><Coins size={18} /></span><small>Masque Points</small><b>{player.masquePoints.toLocaleString('en-US')}</b></div>
    </div>
  </Panel>
  {/if}

  <div class="tabs" role="tablist" aria-label="หมวดร้านค้า">
    {#each TABS as item (item.id)}
      <button role="tab" aria-selected={tab === item.id} class:on={tab === item.id} onclick={() => (tab = item.id)}>{item.label}</button>
    {/each}
  </div>

  {#if tab === 'items'}
    <div class="fitting" class:vip-look={vipActive} aria-label="ลองตัวละครและสัตว์เลี้ยง">
      <div class="fitting-title"><small>COLLECTION SHOP</small><h2>คู่หูในแบบของคุณ</h2><span>ราคาตัวอย่าง · ใช้ MP</span></div>
      <div class="fitting-art"><AssetPortrait src={previewAvatar.imagePath} alt={previewAvatar.name} placeholder={previewAvatar.placeholder} kind="avatar" loading="eager" />{#if previewPet}<span class="fitting-pet"><AssetPortrait src={previewPet.imagePath} alt={previewPet.name} placeholder={previewPet.placeholder} kind="pet" /></span>{/if}</div>
      {#if previewAvatarId || previewPetId}<button class="reset-preview" onclick={() => { previewAvatarId = null; previewPetId = null; }}>คืนชุดปัจจุบัน</button>{/if}
    </div>
    <div class="filters" role="group" aria-label="ประเภทสินค้า">
      <button class:on={category === 'all'} aria-pressed={category === 'all'} onclick={() => category = 'all'}>ทั้งหมด</button>
      <button class:on={category === 'avatar'} aria-pressed={category === 'avatar'} onclick={() => category = 'avatar'}>ตัวละคร</button>
      <button class:on={category === 'pet'} aria-pressed={category === 'pet'} onclick={() => category = 'pet'}>สัตว์เลี้ยง</button>
    </div>
    <div class="products">
      {#each products as item (item.id)}
        <article class="product">
          <button class="product-art" aria-label={`ลอง ${item.art.name}`} onclick={() => { if (item.kind === 'avatar') previewAvatarId = item.itemId; else previewPetId = item.itemId; }} style={`--tint:${item.art.color}`}><AssetPortrait src={item.art.imagePath} alt={item.art.name} placeholder={item.art.placeholder} kind={item.kind} /></button>
          <div class="product-info"><h3>{item.art.name}</h3><RarityChip rarity={item.art.rarity} /><span class="product-price"><Coins size={13} />{item.cost} MP</span></div>
          <GameButton block variant={item.owned ? 'ghost' : 'purple'} size="sm" disabled={item.owned} onclick={() => onBuy(item.id)}>{item.owned ? 'มีแล้ว' : 'ซื้อ'}</GameButton>
        </article>
      {/each}
    </div>
  {:else if tab === 'exchange'}
    <Panel tone="white">
      <div class="head"><span class="ico mint"><Coins size={22} /></span><div><h2>แลก AIS Points</h2><p>1 AIS Point = {EXCHANGE_RATE} Masque Points</p></div></div>
      <label class="label" for="ais-amount">จำนวน AIS Points ที่ต้องการแลก</label>
      <div class="stepper">
        <button aria-label="ลดจำนวน" onclick={() => setAmount((amount || 1) - 1)} disabled={player.aisPoints < 1}><Minus size={20} strokeWidth={3} /></button>
        <input id="ais-amount" type="number" inputmode="numeric" min="1" max={player.aisPoints} bind:value={amount} />
        <button aria-label="เพิ่มจำนวน" onclick={() => setAmount((amount || 0) + 1)} disabled={player.aisPoints < 1}><Plus size={20} strokeWidth={3} /></button>
      </div>
      {#if quick.length}
        <div class="quick">
          {#each quick as value}<button class:on={amount === value} onclick={() => setAmount(value)}>{value}</button>{/each}
          {#if player.aisPoints > 1}<button class:on={amount === player.aisPoints} onclick={() => setAmount(player.aisPoints)}>สูงสุด {player.aisPoints}</button>{/if}
        </div>
      {/if}
      <div class="preview"><span>จะได้รับ</span><b><Coins size={20} />{gain.toLocaleString('en-US')}<small>MP</small></b></div>
      {#if player.aisPoints < 1}<p class="warn">ยังไม่มี AIS Points ให้แลก ลองเพิ่ม <code>?aispoint=100</code> ที่ URL เพื่อทดสอบ</p>
      {:else if !validAmount}<p class="warn">ใส่จำนวนเต็มระหว่าง 1 ถึง {player.aisPoints}</p>{/if}
      <GameButton variant="mint" size="lg" block disabled={!validAmount} onclick={onExchange}>แลกเลย<ArrowRight size={18} /></GameButton>
      <p class="note">ข้อมูลทดสอบ · ไม่ได้เชื่อมต่อ AIS Points จริง</p>
    </Panel>
  {:else if tab === 'energy'}
    <Panel tone="white">
      <div class="head"><span class="ico blue"><Zap size={22} fill="currentColor" /></span><div><h2>เติมพลังงาน</h2><p>ตอนนี้ {vipActive ? '∞ (VIP)' : `${player.energy}/${ENERGY_CONFIG.max}`} · ฟื้น 1 ทุก 30 นาที</p></div></div>
      <div class="meter"><span style={`width:${vipActive ? 100 : energyPercent}%`}></span></div>
    </Panel>
    {#if vipActive}
      <Panel tone="gold"><p class="vipnote"><Crown size={18} fill="currentColor" />VIP มี Energy ไม่จำกัด ไม่ต้องเติม</p></Panel>
    {:else}
      <div class="packs">
        {#each ENERGY_CONFIG.refillPacks as pack (pack.id)}
          <article class="pack">
            <span class="bolt"><Zap size={30} fill="currentColor" /></span>
            <b>+{pack.energy}</b><small>Energy</small>
            <span class="price"><Coins size={14} />{pack.cost} MP</span>
            <GameButton variant="purple" size="sm" disabled={player.energy >= ENERGY_CONFIG.max} onclick={() => onRefill(pack.id)}>{player.energy >= ENERGY_CONFIG.max ? 'เต็มแล้ว' : 'เติม'}</GameButton>
          </article>
        {/each}
      </div>
    {/if}
  {:else}
    {#if vipActive}
      <Panel tone="gold">
        <div class="active"><span class="crown"><Crown size={30} fill="currentColor" /></span><div><h2>VIP กำลังใช้งาน</h2><p>เหลืออีก {vipDays} วัน · Energy ไม่จำกัด</p></div></div>
        <GameButton variant="ghost" size="sm" onclick={onRoom}><UsersRound size={15} />สร้างห้องเล่นกับเพื่อน</GameButton>
      </Panel>
    {/if}
    <div class="vips">
      {#each VIP_PACKAGES as pack (pack.id)}
        <article class="vip" class:best={pack.durationDays === 7}>
          {#if pack.durationDays === 7}<span class="best-tag">คุ้มสุด</span>{/if}
          <span class="crown"><Crown size={28} fill="currentColor" /></span>
          <h3>{pack.label}</h3>
          <ul>
            <li><Zap size={13} fill="currentColor" />Energy ไม่จำกัด</li>
            <li><Check size={13} strokeWidth={3.5} />รางวัล + ภารกิจ VIP</li>
            <li><Check size={13} strokeWidth={3.5} />สร้างห้องเล่นกับเพื่อน</li>
            <li><Gift size={13} />{pack.reward}</li>
          </ul>
          <div class="buy"><span class="price"><Coins size={15} />{pack.cost}<small>MP</small></span><GameButton variant="gold" size="md" onclick={() => onVip(pack.id)}>{vipActive ? 'ต่ออายุ' : 'ซื้อ'}</GameButton></div>
          <p class="sample">ราคาตัวอย่าง ไม่ใช่ราคาจริง</p>
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .fitting { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 180px; padding: 16px; overflow: hidden; border-radius: 20px; border: 2px solid #fff; background: linear-gradient(120deg, #e3f3fa, #eee1fc 70%, #ffe8ed); }
  .fitting-title { max-width: 48%; color: var(--g-ink); }
  .fitting-title small { font-size: 10px; font-weight: 900; }
  .fitting-title h2 { font-size: 21px; line-height: 1.2; margin: 7px 0; }
  .fitting-title > span { color: var(--g-muted); font-size: 11px; }
  .fitting-art { position: relative; width: 130px; height: 164px; flex: 0 0 auto; }
  .vip-look .fitting-art { filter: drop-shadow(0 0 10px #ffd057); }
  .fitting-pet { position: absolute; right: -9px; bottom: 0; width: 58px; height: 70px; }
  .reset-preview { position: absolute; bottom: 9px; left: 15px; padding: 4px 0; border: 0; background: none; color: #8054c5; font-size: 11px; }
  .filters { display: flex; gap: 6px; }
  .filters button { flex: 1; min-height: 40px; border: 1px solid #e3d7f7; border-radius: 8px; color: #8876ad; background: #fff; font-weight: 800; font-size: 12px; }
  .filters .on { color: #fff; background: #8962d8; }
  .products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .product { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 7px; padding: 9px; border: 1px solid #e7def4; border-radius: 8px; background: #fff; }
  .product-art { width: 100%; height: 132px; padding: 0; border: 0; border-radius: 8px; background: linear-gradient(160deg, #fff, var(--tint)); }
  .product-info { display: grid; justify-items: start; gap: 4px; }
  .product h3 { margin: 0; color: var(--g-ink); font-size: 14px; }
  .product-price { display: inline-flex; align-items: center; gap: 4px; color: #ae780a; font-weight: 900; font-size: 12px; }
  .wallet { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 6px; }
  .coin { display: grid; justify-items: center; gap: 1px; padding: 8px 4px; border: 2px solid #fff; border-radius: 17px; background: rgb(255 255 255 / 85%); }
  .mark { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 2px; border: 2px solid #fff; border-radius: 50%; color: #fff; font-size: 12px; font-weight: 900; }
  .ais .mark { background: linear-gradient(160deg, #7ee8b4, #22b57d); box-shadow: 0 3px 0 #168a5f; }
  .mp .mark { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); box-shadow: 0 3px 0 #c4770d; }
  .coin small { color: var(--g-muted); font-size: 12px; font-weight: 800; }
  .coin b { color: var(--g-ink); font-size: 24px; font-weight: 900; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .rate { display: grid; justify-items: center; gap: 2px; color: #6a8cc4; }
  .rate small { font-size: 11px; font-weight: 900; white-space: nowrap; }

  .tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; padding: 5px; border: 2.5px solid #fff; border-radius: 20px; background: #e4dcf8; box-shadow: inset 0 2px 4px rgb(80 55 170 / 15%); }
  .tabs button { min-height: 46px; padding: 0 3px; border: 0; border-radius: 15px; color: #8a7fc4; background: transparent; font-size: 13px; font-weight: 900; transition: transform 0.1s ease; }
  .tabs button.on { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .tabs button:active { transform: translateY(2px); }

  .head { display: flex; align-items: center; gap: 11px; margin-bottom: 12px; }
  .head h2 { margin: 0; color: var(--g-ink); font-size: 18px; font-weight: 900; }
  .head p { margin: 2px 0 0; color: var(--g-muted); font-size: 13px; font-weight: 700; }
  .ico { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 auto; border: 2px solid #fff; border-radius: 15px; color: #fff; }
  .ico.mint { background: linear-gradient(160deg, #7ee8b4, #22b57d); box-shadow: 0 3px 0 #168a5f; }
  .ico.blue { background: linear-gradient(160deg, #5fd0ff, #2b8ff0); box-shadow: 0 3px 0 #1c68be; }
  .label { display: block; margin-bottom: 6px; color: var(--g-muted); font-size: 13px; font-weight: 800; }
  .stepper { display: grid; grid-template-columns: 52px minmax(0, 1fr) 52px; gap: 8px; }
  .stepper button { display: grid; place-items: center; min-height: 56px; border: 0; border-radius: 16px; color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 4px 0 #4b32a8; }
  .stepper button:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 #4b32a8; }
  .stepper button:disabled { opacity: 0.45; }
  .stepper input { width: 100%; min-width: 0; min-height: 56px; border: 3px solid #d9ccff; border-radius: 16px; color: var(--g-ink); background: #fff; font-size: 28px; font-weight: 900; text-align: center; appearance: textfield; }
  .stepper input:focus { outline: 3px solid #7a5ce0; outline-offset: 2px; }
  .stepper input::-webkit-inner-spin-button, .stepper input::-webkit-outer-spin-button { margin: 0; appearance: none; }
  .quick { display: flex; flex-wrap: wrap; gap: 7px; margin: 10px 0 0; }
  .quick button { min-height: 44px; padding: 0 16px; border: 2px solid #d9ccff; border-radius: 99px; color: #6a4fd6; background: #fff; font-size: 14px; font-weight: 900; }
  .quick button.on { color: #fff; border-color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .preview { display: flex; align-items: center; justify-content: space-between; margin: 12px 0; padding: 11px 14px; border: 2px solid #fff; border-radius: 17px; color: var(--g-muted); background: linear-gradient(150deg, #fff6cf, #ffe39a); font-size: 14px; font-weight: 800; }
  .preview b { display: inline-flex; align-items: center; gap: 5px; color: #b87208; font-size: 30px; font-weight: 900; line-height: 1; }
  .preview small { font-size: 13px; }
  .warn { margin: 0 0 10px; padding: 9px 12px; border-radius: 13px; color: #b3430b; background: #fff1e6; font-size: 13px; font-weight: 800; line-height: 1.4; }
  .warn code { padding: 1px 6px; border-radius: 6px; background: #ffe2cc; font-size: 12px; }
  .note { margin: 10px 0 0; color: #9a90c8; font-size: 12px; font-weight: 700; text-align: center; }

  .meter { height: 14px; overflow: hidden; border-radius: 99px; background: #dcd4f5; box-shadow: inset 0 2px 3px rgb(70 50 140 / 22%); }
  .meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #4fb6ff, #7a8cff 60%, #b58cff); transition: width 0.6s ease; }
  .vipnote { display: flex; align-items: center; gap: 8px; margin: 0; color: #8a5a06; font-size: 14px; font-weight: 800; }
  .packs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .pack { display: grid; justify-items: center; gap: 2px; padding: 14px 8px 12px; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(160deg, #fff, #eaf4ff); box-shadow: 0 8px 0 -3px #9cc6f2, 0 13px 18px rgb(60 110 190 / 16%); }
  .bolt { display: grid; place-items: center; width: 56px; height: 56px; border: 3px solid #fff; border-radius: 19px; color: #fff; background: linear-gradient(160deg, #5fd0ff, #2b8ff0); box-shadow: 0 4px 0 #1c68be; }
  .pack b { color: var(--g-ink); font-size: 32px; font-weight: 900; line-height: 1.1; }
  .pack small { color: var(--g-muted); font-size: 12px; font-weight: 800; }
  .price { display: inline-flex; align-items: center; gap: 3px; margin: 4px 0 6px; padding: 3px 11px; border-radius: 99px; color: #8a5a06; background: #fff0c2; font-size: 14px; font-weight: 900; }
  .price small { color: inherit; font-size: 12px; }

  .active { display: flex; align-items: center; gap: 11px; margin-bottom: 10px; }
  .active h2 { margin: 0; color: #5b3a00; font-size: 18px; font-weight: 900; }
  .active p { margin: 2px 0 0; color: #7a5200; font-size: 13px; font-weight: 700; }
  .crown { display: grid; place-items: center; width: 54px; height: 54px; flex: 0 0 auto; border: 3px solid #fff; border-radius: 18px; color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); box-shadow: 0 4px 0 #c4770d; }
  .vips { display: grid; gap: 14px; }
  .vip { position: relative; display: grid; justify-items: start; gap: 6px; padding: 14px; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(150deg, #fff, #fff6d8); box-shadow: 0 8px 0 -3px #e2b24f, 0 13px 20px rgb(200 140 30 / 20%); }
  .vip.best { background: linear-gradient(150deg, #fff9e0, #ffe39a); }
  .best-tag { position: absolute; top: 12px; right: 12px; padding: 4px 11px; transform: rotate(3deg); border: 2px solid #fff; border-radius: 11px; color: #fff; background: linear-gradient(135deg, #ffb347, #ff5f3d); box-shadow: 0 3px 0 #c43d1d; font-size: 12px; font-weight: 900; }
  .vip h3 { margin: 0; color: #5b3a00; font-size: 20px; font-weight: 900; }
  .vip ul { display: grid; gap: 5px; width: 100%; margin: 0; padding: 0; list-style: none; }
  .vip li { display: flex; align-items: center; gap: 6px; color: #7a5200; font-size: 14px; font-weight: 700; }
  .vip li :global(svg) { color: #2fa574; }
  .buy { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; margin-top: 4px; }
  .buy .price { margin: 0; font-size: 20px; }
  .buy :global(.gbtn) { min-width: 112px; }
  .sample { margin: 0; color: #a88a4a; font-size: 12px; font-weight: 700; }
</style>
