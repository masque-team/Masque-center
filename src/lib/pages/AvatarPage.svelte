<script lang="ts">
  import { Check, Coins, Crown, Lock, PawPrint, Shirt, Sparkles, Ticket } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import Panel from '../components/Panel.svelte';
  import RarityChip from '../components/RarityChip.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { rarityOf } from '../data/rarity';
  import type { PlayerState } from '../types';

  let { player, vipActive = false, gachaBusy, onSelectAvatar, onEquipPet, onGacha, onWing }: {
    player: PlayerState;
    vipActive?: boolean;
    gachaBusy: boolean;
    onSelectAvatar: (id: string) => void;
    onEquipPet: (id: string | null) => void;
    onGacha: () => void;
    onWing: (id: string | null) => void;
  } = $props();

  let tab = $state<'avatar' | 'pet' | 'gacha'>('avatar');
  let pickedAvatar = $state<string | null>(null);
  let pickedPet = $state<string | null | undefined>(undefined);
  let gachaFocusId = $state<string>('frostwing');

  let avatarId = $derived(pickedAvatar ?? player.avatarId);
  let petId = $derived(pickedPet === undefined ? player.petId : pickedPet);
  let avatar = $derived(AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0]);
  let pet = $derived(PETS.find((item) => item.id === petId) ?? null);
  let wing = $derived(WINGS.find((wing) => wing.id === player.demo.wingId));
  let avatarOwned = $derived(player.ownedAvatarIds.includes(avatar.id));
  let petOwned = $derived(pet ? player.ownedPetIds.includes(pet.id) : true);
  let hasTicket = $derived(player.gachaTickets > 0);
  let PET_GACHA_COST = $derived(player.demo.config.gachaCost);
  let totalWeight = $derived(player.demo.config.gachaPool.reduce((sum, item) => sum + item.weight, 0));
  let canGacha = $derived(!gachaBusy && totalWeight > 0 && (hasTicket || player.masquePoints >= PET_GACHA_COST));
  let focus = $derived(tab === 'pet' && pet ? pet : avatar);
  let focusStyle = $derived(rarityOf(focus.rarity));
  let isVipLook = $derived(vipActive || avatar.rarity === 'VIP');
  let gachaPet = $derived(PETS.find((item) => item.id === gachaFocusId) ?? PETS[PETS.length - 1]);
  let gachaLeft = $derived(PETS.find((item) => item.id === 'mooncat') ?? PETS[0]);
  let gachaRight = $derived(PETS.find((item) => item.id === 'mochi') ?? PETS[1]);

  function applyAvatar() {
    onSelectAvatar(avatar.id);
    pickedAvatar = null;
  }

  function applyPet() {
    onEquipPet(pet && player.petId !== pet.id ? pet.id : null);
    pickedPet = undefined;
  }
</script>

<div class="page-stack">
  <PageTitle eyebrow="DRESS UP" title="Avatar & Pets" subtitle="เลือกตัวละครและสัตว์เลี้ยงคู่ใจ">
    {#snippet icon()}<Shirt size={26} />{/snippet}
  </PageTitle>

  <section class="stage" class:vip={isVipLook} style={`--glow:${focusStyle.glow};--tint:${avatar.color}`} aria-label="ตัวอย่างตัวละคร">
    {#if isVipLook}
      <span class="vip-rays" aria-hidden="true"></span>
      <span class="vip-halo" aria-hidden="true"></span>
      <span class="vip-sparks" aria-hidden="true"><i>✦</i><i>✧</i><i>★</i><i>✦</i></span>
      <span class="vip-badge"><Crown size={12} fill="currentColor" />VIP RADIANCE</span>
    {/if}
    <span class="floor"></span>
    <div class="pair">
      {#if wing}<img class="pointer-events-none absolute inset-0 h-full w-full scale-150 object-contain" src={wing.imagePath} alt={wing.name} />{/if}
      <span class="hero" data-frame={player.demo.frameId}><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" loading="eager" className="stage-art" /></span>
      {#if pet}<span class="buddy"><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" loading="eager" className="stage-art" /></span>{/if}
    </div>
    <div class="info">
      <div><strong>{avatar.name}</strong><RarityChip rarity={avatar.rarity} size="md" /></div>
      <small>{#if pet}คู่หู: {pet.name}{:else}ยังไม่มีสัตว์เลี้ยง{/if}{#if isVipLook} · ✦ แสงออร่า VIP{/if}</small>
    </div>
  </section>

  <section class="flex flex-wrap items-center gap-2 border-y border-white py-2" aria-label="ปีกที่มี">
    <h2 class="text-xs font-semibold">Wings</h2>
    <button class="min-h-10 rounded-md px-2 text-xs" aria-pressed={!player.demo.wingId} onclick={() => onWing(null)}>ไม่ใส่</button>
    {#each WINGS.filter((wing) => player.demo.wings.includes(wing.id)) as item (item.id)}<button class="flex min-h-10 items-center gap-2 rounded-md border border-white bg-white/50 px-2 text-xs" aria-pressed={player.demo.wingId === item.id} class:ring-2={player.demo.wingId === item.id} onclick={() => onWing(item.id)}><img class="h-10 w-12 object-contain" src={item.imagePath} alt="" />{item.name}</button>{/each}
    {#if !player.demo.wings.length}<a class="text-xs text-sky-700 underline" href="#shop">เลือกปีกใน Shop</a>{/if}
  </section>

  <div class="tabs" role="tablist" aria-label="หมวดหมู่">
    <button role="tab" aria-selected={tab === 'avatar'} class:on={tab === 'avatar'} onclick={() => (tab = 'avatar')}><Shirt size={17} />ตัวละคร</button>
    <button role="tab" aria-selected={tab === 'pet'} class:on={tab === 'pet'} onclick={() => (tab = 'pet')}><PawPrint size={17} />สัตว์เลี้ยง</button>
    <button role="tab" aria-selected={tab === 'gacha'} class:on={tab === 'gacha'} onclick={() => (tab = 'gacha')}><Sparkles size={17} />กาชา</button>
  </div>

  {#if tab === 'avatar'}
    <div class="grid">
      {#each AVATARS as item (item.id)}
        {@const owned = player.ownedAvatarIds.includes(item.id)}
        {@const style = rarityOf(item.rarity)}
        {@const itemVip = item.rarity === 'VIP' || (vipActive && player.avatarId === item.id)}
        <button class="card" class:picked={avatarId === item.id} class:locked={!owned} class:vip-card={itemVip} style={`--glow:${style.glow};--tint:${item.color}`} aria-pressed={avatarId === item.id} onclick={() => (pickedAvatar = item.id)}>
          <span class="art">
            {#if itemVip}<span class="card-aura" aria-hidden="true"></span>{/if}
            <AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="avatar" className="card-art" />
          </span>
          <strong>{item.name}</strong>
          <RarityChip rarity={item.rarity} />
          {#if player.avatarId === item.id}<span class="state on"><Check size={12} strokeWidth={4} />ใช้อยู่</span>
          {:else if !owned}<span class="state lk"><Lock size={12} />ล็อก</span>{/if}
        </button>
      {/each}
    </div>
    <div class="dock">
      <GameButton variant="gold" size="lg" block disabled={!avatarOwned || player.avatarId === avatar.id} onclick={applyAvatar}>
        {#if player.avatarId === avatar.id}<Check size={18} strokeWidth={3.5} />ใช้ตัวละครนี้อยู่
        {:else if !avatarOwned}<Lock size={17} />ยังไม่ปลดล็อก
        {:else}ใช้ตัวละครนี้{/if}
      </GameButton>
    </div>
  {:else if tab === 'pet'}
    <div class="grid">
      {#each PETS as item (item.id)}
        {@const owned = player.ownedPetIds.includes(item.id)}
        {@const style = rarityOf(item.rarity)}
        <button class="card" class:picked={petId === item.id} class:locked={!owned} style={`--glow:${style.glow};--tint:${item.color}`} aria-pressed={petId === item.id} onclick={() => (pickedPet = item.id)}>
          <span class="art pet"><AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="pet" className="card-art" /></span>
          <strong>{item.name}</strong>
          <RarityChip rarity={item.rarity} />
          {#if player.petId === item.id}<span class="state on"><Check size={12} strokeWidth={4} />ใช้อยู่</span>
          {:else if !owned}<span class="state lk"><Lock size={12} />ล็อก</span>{/if}
        </button>
      {/each}
    </div>
    <div class="dock">
      {#if player.petId && (!pet || player.petId === pet.id)}
        <GameButton variant="ghost" size="lg" block onclick={() => { onEquipPet(null); pickedPet = undefined; }}>ถอดสัตว์เลี้ยง</GameButton>
      {:else}
        <GameButton variant="gold" size="lg" block disabled={!pet || !petOwned} onclick={applyPet}>
          {#if !pet}เลือกสัตว์เลี้ยง{:else if !petOwned}<Lock size={17} />ยังไม่ปลดล็อก{:else}ใช้สัตว์เลี้ยงนี้{/if}
        </GameButton>
      {/if}
    </div>
  {:else}
    <Panel tone="lilac">
      <div class="gacha">
        <div class="gacha-stage" class:busy={gachaBusy}>
          <span class="gacha-rays" aria-hidden="true"></span>
          <span class="side-pet left" aria-hidden="true">
            <AssetPortrait src={gachaLeft.imagePath} alt="" placeholder={gachaLeft.placeholder} kind="pet" className="gacha-art" />
          </span>
          <span class="center-pet">
            <AssetPortrait src={gachaPet.imagePath} alt={gachaPet.name} placeholder={gachaPet.placeholder} kind="pet" loading="eager" className="gacha-art main-pet" />
          </span>
          <span class="side-pet right" aria-hidden="true">
            <AssetPortrait src={gachaRight.imagePath} alt="" placeholder={gachaRight.placeholder} kind="pet" className="gacha-art" />
          </span>
          <div class="egg" class:busy={gachaBusy} aria-hidden="true">
            <span class="shell"><Sparkles size={20} /></span>
          </div>
        </div>

        <div class="gacha-focus">
          <strong>{gachaPet.name}</strong>
          <RarityChip rarity={gachaPet.rarity} size="md" />
          {#if player.ownedPetIds.includes(gachaPet.id)}
            <span class="own-pill ok"><Check size={11} strokeWidth={3.5} />มีแล้ว</span>
          {:else}
            <span class="own-pill">ยังไม่มี</span>
          {/if}
        </div>

        <h2>Pet Gacha</h2>
        <p>ใช้ตั๋วก่อน ถ้าไม่มีใช้ {PET_GACHA_COST} MP · ซ้ำคืน {player.demo.config.duplicatePoints} MP · ไม่สวมให้อัตโนมัติ</p>

        <div class="wallet">
          <span class:dim={!hasTicket}><Ticket size={16} />ตั๋ว <b>{player.gachaTickets}</b></span>
          <span><Coins size={16} />MP <b>{player.masquePoints.toLocaleString('en-US')}</b></span>
        </div>

        <GameButton variant="gold" size="lg" block disabled={!canGacha} onclick={onGacha}>
          {#if gachaBusy}กำลังสุ่ม...{:else if hasTicket}<Ticket size={18} />ใช้ตั๋วสุ่ม 1 ครั้ง{:else}<Coins size={18} />สุ่ม {PET_GACHA_COST} MP{/if}
        </GameButton>
        {#if !canGacha && !gachaBusy}<small class="hint">MP ไม่พอ · แลกแต้มที่ Shop หรือรับตั๋วจาก Pass</small>{/if}
        <details class="w-full text-left text-xs"><summary class="min-h-10 cursor-pointer py-3 font-semibold">โอกาสได้รับ Pet</summary><div class="grid grid-cols-2 gap-2">{#each player.demo.config.gachaPool as item (item.petId)}<span>{item.petId}</span><span class="text-right">{totalWeight ? (item.weight / totalWeight * 100).toFixed(1) : '0'}%</span>{/each}</div></details>

        <div class="pool">
          <div class="pool-head">
            <span>สัตว์เลี้ยงในตู้ ({player.ownedPetIds.length}/{PETS.length})</span>
            <small>แตะเพื่อดูตัวอย่างบนเวที</small>
          </div>
          <div class="pool-grid">
            {#each PETS as item (item.id)}
              {@const owned = player.ownedPetIds.includes(item.id)}
              {@const style = rarityOf(item.rarity)}
              <button
                class="pool-item"
                class:active={gachaPet.id === item.id}
                class:owned
                style={`--glow:${style.glow};--tint:${item.color}`}
                onclick={() => (gachaFocusId = item.id)}
              >
                <span class="pool-art">
                  <AssetPortrait src={item.imagePath} alt="" placeholder={item.placeholder} kind="pet" className="pool-img" />
                </span>
                <b>{item.name}</b>
                <RarityChip rarity={item.rarity} />
                {#if owned}<i class="got"><Check size={10} strokeWidth={4} /></i>{/if}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </Panel>
  {/if}
</div>

<style>
  .stage { position: relative; display: grid; justify-items: center; padding: 14px 12px 12px; overflow: hidden; border: 2.5px solid #fff; border-radius: 26px; background: radial-gradient(ellipse at 50% 38%, var(--glow), transparent 62%), linear-gradient(180deg, #9ec3ff 0%, #cdb8ff 70%, #f1d9ff 100%); box-shadow: var(--g-card-shadow); isolation: isolate; }
  .stage.vip { border-color: #fff3b0; background: radial-gradient(ellipse at 50% 42%, rgb(255 230 120 / 85%), transparent 64%), linear-gradient(180deg, #ffe27a 0%, #f6c465 38%, #d7b8ff 78%, #f4dcff 100%); box-shadow: 0 9px 0 -3px #d99f2b, 0 0 28px rgb(255 200 60 / 50%); }
  .vip-rays { position: absolute; z-index: -1; top: -40px; width: 320px; height: 320px; border-radius: 50%; background: repeating-conic-gradient(from 0deg, rgb(255 255 255 / 55%) 0 10deg, transparent 10deg 22deg); mask-image: radial-gradient(circle, #000 22%, transparent 68%); animation: spin-rays 20s linear infinite; pointer-events: none; }
  .vip-halo { position: absolute; top: 34px; width: 196px; height: 196px; border: 2.5px dashed rgb(255 250 210 / 90%); border-radius: 50%; box-shadow: 0 0 36px rgb(255 210 70 / 85%), inset 0 0 28px rgb(255 240 160 / 70%); animation: spin-rays 16s linear infinite reverse; pointer-events: none; }
  .vip-sparks { position: absolute; inset: 0; pointer-events: none; }
  .vip-sparks i { position: absolute; color: #fffbe0; font-style: normal; font-size: 16px; text-shadow: 0 0 10px #ffb800, 0 0 4px #fff; animation: twinkle-vip 2s ease-in-out infinite; }
  .vip-sparks i:nth-child(1) { top: 18%; left: 14%; }
  .vip-sparks i:nth-child(2) { top: 28%; right: 14%; animation-delay: 0.5s; font-size: 13px; }
  .vip-sparks i:nth-child(3) { bottom: 30%; left: 18%; animation-delay: 1s; font-size: 12px; }
  .vip-sparks i:nth-child(4) { bottom: 34%; right: 18%; animation-delay: 1.4s; }
  .vip-badge { position: absolute; top: 10px; right: 10px; z-index: 2; display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border: 1.5px solid #fff; border-radius: 99px; color: #6b3f00; background: linear-gradient(180deg, #fff4a8, #ffbe30); box-shadow: 0 3px 8px rgb(180 110 0 / 35%); font-size: 10px; font-weight: 900; letter-spacing: 0.4px; }

  .floor { position: absolute; right: -10%; bottom: 52px; left: -10%; height: 70px; border-radius: 50%; background: radial-gradient(ellipse, rgb(255 255 255 / 70%), transparent 70%); }
  .stage.vip .floor { background: radial-gradient(ellipse, rgb(255 248 190 / 92%), rgb(255 200 60 / 45%) 48%, transparent 72%); }
  .pair { position: relative; display: flex; align-items: flex-end; justify-content: center; gap: 4px; width: 100%; height: 252px; }
  .hero { display: block; width: 190px; height: 252px; filter: drop-shadow(0 10px 10px rgb(40 20 100 / 35%)); }
  .stage.vip .hero { filter: drop-shadow(0 0 14px rgb(255 240 150 / 95%)) drop-shadow(0 0 28px rgb(255 185 35 / 70%)) drop-shadow(0 10px 10px rgb(90 50 0 / 35%)); }
  .buddy { display: block; width: 88px; height: 112px; margin-left: -18px; filter: drop-shadow(0 6px 6px rgb(40 20 100 / 35%)); animation: hop 2.6s ease-in-out infinite; }
  .stage.vip .buddy { filter: drop-shadow(0 0 10px rgb(255 235 140 / 90%)) drop-shadow(0 6px 6px rgb(90 50 0 / 35%)); }
  .pair :global(.stage-art) { background: transparent; }
  .info { position: relative; display: grid; justify-items: center; gap: 2px; margin-top: 8px; }
  .info > div { display: flex; align-items: center; gap: 8px; }
  .info strong { color: #fff; font-size: 22px; font-weight: 900; text-shadow: 0 2px 0 rgb(40 20 110 / 55%); }
  .info small { color: #fff; font-size: 13px; font-weight: 800; text-shadow: 0 1px 0 rgb(40 20 110 / 45%); }

  .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 5px; border: 2.5px solid #fff; border-radius: 20px; background: #e4dcf8; }
  .tabs button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 46px; padding: 0 4px; border: 0; border-radius: 15px; color: #8a7fc4; background: transparent; font-size: 14px; font-weight: 900; }
  .tabs button.on { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }

  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .card { position: relative; display: grid; justify-items: center; gap: 5px; min-width: 0; padding: 8px 6px 10px; border: 2.5px solid #fff; border-radius: 20px; background: linear-gradient(160deg, #fff, #f3eeff); box-shadow: 0 6px 0 -2px #d3c8f5; text-align: center; }
  .card.vip-card { border-color: #ffe27a; background: linear-gradient(160deg, #fffdf2, #ffefc2); box-shadow: 0 6px 0 -2px #e0ab38, 0 0 16px rgb(255 200 60 / 45%); }
  .card.picked { background: linear-gradient(160deg, #fff, #e9defd); box-shadow: 0 6px 0 -2px #8a72dc, 0 0 0 3px #7a5ce0, 0 0 18px var(--glow); }
  .card.locked .art { filter: grayscale(0.85) brightness(0.9); }
  .art { position: relative; display: block; width: 100%; height: 132px; overflow: hidden; border-radius: 15px; background: radial-gradient(circle at 50% 70%, rgb(255 255 255 / 70%), transparent 70%), var(--tint); }
  .card-aura { position: absolute; inset: -16px; background: repeating-conic-gradient(from 0deg, rgb(255 245 170 / 60%) 0 14deg, transparent 14deg 28deg); animation: spin-rays 14s linear infinite; pointer-events: none; }
  .vip-card .art :global(.card-art) { filter: drop-shadow(0 0 8px rgb(255 230 110 / 95%)); }
  .art.pet { padding: 8px 14px 0; }
  .art :global(.card-art) { position: relative; background: transparent; }
  .card strong { max-width: 100%; overflow: hidden; color: var(--g-ink); font-size: 14px; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
  .state { position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border: 1.5px solid #fff; border-radius: 99px; font-size: 11px; font-weight: 900; }
  .state.on { color: #fff; background: linear-gradient(180deg, #4fd6a0, #22b57d); }
  .state.lk { color: #fff; background: rgb(60 45 130 / 80%); }

  .dock { position: sticky; bottom: calc(86px + env(safe-area-inset-bottom)); z-index: 5; padding-top: 2px; }

  .gacha { display: grid; justify-items: center; gap: 8px; text-align: center; }
  .gacha-stage { position: relative; display: flex; align-items: flex-end; justify-content: center; width: 100%; height: 176px; padding: 10px 8px 12px; overflow: hidden; border: 2.5px solid #fff; border-radius: 22px; background: radial-gradient(circle at 50% 45%, rgb(255 240 175 / 85%), transparent 62%), linear-gradient(180deg, #7fb2ff 0%, #b89eff 62%, #f3d4ff 100%); box-shadow: inset 0 -10px 20px rgb(255 255 255 / 45%); isolation: isolate; }
  .gacha-rays { position: absolute; z-index: -1; inset: -40px; background: repeating-conic-gradient(from 0deg, rgb(255 255 255 / 40%) 0 12deg, transparent 12deg 24deg); mask-image: radial-gradient(circle, #000 25%, transparent 70%); animation: spin-rays 18s linear infinite; }
  .center-pet { position: relative; z-index: 2; display: block; width: 118px; height: 142px; filter: drop-shadow(0 0 14px rgb(255 240 150 / 95%)) drop-shadow(0 8px 10px rgb(50 20 110 / 38%)); animation: bob 2.6s ease-in-out infinite; }
  .side-pet { position: relative; z-index: 1; display: block; width: 72px; height: 88px; opacity: 0.9; filter: drop-shadow(0 5px 8px rgb(50 20 110 / 32%)); animation: hop 3s ease-in-out infinite; }
  .side-pet.left { margin-right: -12px; transform: rotate(-6deg); }
  .side-pet.right { margin-left: -12px; transform: rotate(6deg); animation-delay: 0.8s; }
  .gacha-stage :global(.gacha-art) { background: transparent; }
  .egg { position: absolute; right: 10px; bottom: 8px; z-index: 3; display: grid; place-items: center; width: 48px; height: 56px; }
  .shell { display: grid; place-items: center; width: 42px; height: 50px; border: 2.5px solid #fff; border-radius: 50% 50% 46% 46% / 62% 62% 38% 38%; color: #7a4a00; background: radial-gradient(circle at 35% 30%, #fff 0 10%, transparent 11%), linear-gradient(160deg, #fff09a, #ffb42b); box-shadow: 0 4px 0 #b86f09, 0 0 14px rgb(255 200 60 / 70%); }
  .gacha-stage.busy .center-pet, .egg.busy .shell { animation: shake 0.42s ease-in-out infinite; }

  .gacha-focus { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; margin-top: 2px; }
  .gacha-focus strong { color: var(--g-ink); font-size: 17px; font-weight: 900; }
  .own-pill { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 99px; color: #6b5cb5; background: rgb(255 255 255 / 75%); font-size: 11px; font-weight: 900; }
  .own-pill.ok { color: #197a56; background: #d4f5e4; }

  .gacha h2 { margin: 0; color: var(--g-ink); font-size: 20px; font-weight: 900; }
  .gacha p { margin: 0; color: var(--g-muted); font-size: 12.5px; font-weight: 700; line-height: 1.45; }
  .wallet { display: flex; gap: 8px; }
  .wallet span { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border: 2px solid #fff; border-radius: 99px; color: #6a4fd6; background: rgb(255 255 255 / 78%); font-size: 13px; font-weight: 800; }
  .wallet span.dim { opacity: 0.6; }
  .wallet b { color: var(--g-ink); font-size: 15px; font-weight: 900; }
  .hint { color: #b3430b; font-size: 12px; font-weight: 800; }

  .pool { width: 100%; display: grid; gap: 7px; margin-top: 4px; padding-top: 10px; border-top: 1.5px dashed rgb(255 255 255 / 80%); text-align: left; }
  .pool-head { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
  .pool-head span { color: var(--g-ink); font-size: 13px; font-weight: 900; }
  .pool-head small { color: #6b5cb5; font-size: 11px; font-weight: 700; }
  .pool-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
  .pool-item { position: relative; display: grid; justify-items: center; gap: 3px; min-width: 0; padding: 5px 3px 6px; border: 2px solid #fff; border-radius: 14px; background: rgb(255 255 255 / 82%); box-shadow: 0 3px 0 #cbbef0; text-align: center; cursor: pointer; }
  .pool-item.active { border-color: #7a5ce0; background: #fff; box-shadow: 0 3px 0 #7a5ce0, 0 0 12px var(--glow); transform: translateY(-2px); }
  .pool-item:not(.owned) .pool-art { filter: saturate(0.75); }
  .pool-art { display: block; width: 100%; height: 46px; border-radius: 10px; background: radial-gradient(circle at 50% 65%, rgb(255 255 255 / 75%), transparent 70%), var(--tint); }
  .pool-art :global(.pool-img) { background: transparent; }
  .pool-item b { max-width: 100%; overflow: hidden; color: var(--g-ink); font-size: 10px; font-weight: 900; text-overflow: ellipsis; white-space: nowrap; }
  .pool-item :global(.chip) { transform: scale(0.85); transform-origin: center; }
  .got { position: absolute; top: 3px; right: 3px; display: grid; place-items: center; width: 16px; height: 16px; border: 1.5px solid #fff; border-radius: 50%; color: #fff; background: #22b57d; }

  @keyframes hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-9deg) translateY(-2px); } 75% { transform: rotate(9deg) translateY(-2px); } }
  @keyframes spin-rays { to { transform: rotate(360deg); } }
  @keyframes twinkle-vip { 0%, 100% { opacity: 0.35; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.25); } }
  @media (max-width: 350px) { .pool-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  @media (min-width: 400px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (prefers-reduced-motion: reduce) { .buddy, .shell, .egg.busy .shell, .center-pet, .side-pet, .vip-rays, .vip-halo, .vip-sparks i, .card-aura, .gacha-rays { animation: none; } }
</style>
