<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Coins, Copy, Crown,
    CircleAlert, ExternalLink, Gamepad2, Gift, Heart, LoaderCircle, Lock, Medal, Play,
    RotateCcw, ShoppingBag, Sparkles, Star, Ticket, Trophy, UsersRound, X, Zap,
  } from '@lucide/svelte';
  import AppHeader from './lib/components/AppHeader.svelte';
  import AssetPortrait from './lib/components/AssetPortrait.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import GameCard from './lib/components/GameCard.svelte';
  import Leaderboard from './lib/components/Leaderboard.svelte';
  import { AVATARS, BATTLE_PASS, ENERGY_CONFIG, PETS, PET_GACHA_COST, VIP_PACKAGES } from './lib/data/config';
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import { battlePassLevel } from './lib/services/battlePassService';
  import { selectAvatar } from './lib/services/avatarService';
  import { isVip, nextRefillIn, refreshEnergy, refillEnergy, spendGameEnergy } from './lib/services/energyService';
  import { purchaseVip } from './lib/services/passService';
  import { drawPet, equipPet } from './lib/services/petService';
  import { loadPlayer, parseAisPointSeed, savePlayer } from './lib/services/playerService';
  import { addMockMissionXp, claimBattlePassReward } from './lib/services/rewardService';
  import { createRoomCode } from './lib/services/roomService';
  import { exchangeAisPoints } from './lib/services/walletService';
  import type { GameId, Page, PlayerState, RankingPeriod, VipPackage } from './lib/types';
  import './app.css';

  type ModalState =
    | { kind: 'notice'; title: string; message: string }
    | { kind: 'vip-confirm'; packageId: VipPackage['id'] }
    | { kind: 'refill-confirm'; refillId: string }
    | { kind: 'exchange-confirm' }
    | { kind: 'gacha-result'; petId: string; duplicate: boolean }
    | { kind: 'checkin-success' }
    | null;

  const mockScores: Record<GameId, number> = { bird: 47, mole: 1250, run: 640, fruit: 780, timber: 320, duck: 520, memory: 18 };
  const initialQuery = new URLSearchParams(window.location.search);
  const resetMockRequested = initialQuery.get('resetMock') === '1';
  let player = $state<PlayerState>(loadPlayer(
    initialQuery.get('name'),
    parseAisPointSeed(initialQuery.get('aispoint')),
    resetMockRequested,
  ));
  let page = $state<Page>('home');
  let gameId = $state<GameId>('bird');
  let rankingGameId = $state<GameId>('bird');
  let rankingPeriod = $state<RankingPeriod>('weekly');
  let modal = $state<ModalState>(null);
  let now = $state(Date.now());
  let gameLoading = $state(true);
  let gameFallback = $state(false);
  let iframeVersion = $state(0);
  let iframeTimeout: ReturnType<typeof setTimeout> | undefined;
  let shopTab = $state<'exchange' | 'vip'>('exchange');
  let exchangeAmount = $state(1);
  let selectedAvatar = $state('mali');
  let selectedRefill = $state('small');
  let roomCode = $state('');
  let joinCode = $state('');
  let roomCreated = $state(false);
  let gachaBusy = $state(false);
  let pendingEnergyEntry = $state(false);
  let toast = $state('');
  let currentGame = $derived(GAME_BY_ID[gameId]);
  let vipActive = $derived(isVip(player, now));
  let passLevel = $derived(battlePassLevel(player));
  let passCompleted = $derived(player.battlePassXp >= BATTLE_PASS.totalLevels * BATTLE_PASS.xpPerLevel);
  let passXp = $derived(passCompleted ? BATTLE_PASS.xpPerLevel : player.battlePassXp % BATTLE_PASS.xpPerLevel);
  let refillCountdown = $derived(nextRefillIn(player, now));
  let pendingVip = $derived.by(() => {
    const currentModal = modal;
    if (currentModal?.kind !== 'vip-confirm') return null;
    return VIP_PACKAGES.find((pack) => pack.id === currentModal.packageId) ?? null;
  });
  let pendingRefill = $derived.by(() => {
    const currentModal = modal;
    if (currentModal?.kind !== 'refill-confirm') return null;
    return ENERGY_CONFIG.refillPacks.find((pack) => pack.id === currentModal.refillId) ?? null;
  });
  let gachaPet = $derived.by(() => {
    const currentModal = modal;
    if (currentModal?.kind !== 'gacha-result') return null;
    return PETS.find((pet) => pet.id === currentModal.petId) ?? null;
  });
  let previewAvatar = $derived(AVATARS.find((avatar) => avatar.id === selectedAvatar) ?? AVATARS[0]);

  function persist(next = player): void {
    player = next;
    savePlayer(player);
  }

  function todayKey(date = new Date()): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function checkinKeyForDay(index: number): string {
    const date = new Date(now);
    const mondayOffset = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - mondayOffset + index);
    return todayKey(date);
  }

  function navigate(route: string): void {
    const destination = `#${route}`;
    if (window.location.hash === destination) handleRoute();
    else window.location.hash = destination;
  }

  function handleRoute(): void {
    clearIframeTimeout();
    const [routePath, hashQuery = ''] = window.location.hash.replace(/^#/, '').split('?');
    const [route, requestedGame] = routePath.split('/');
    const routes: Page[] = ['home', 'shop', 'rewards', 'avatar', 'ranking', 'room'];
    if (route === 'game' && requestedGame && requestedGame in GAME_BY_ID) {
      if (!pendingEnergyEntry) {
        const next = spendGameEnergy(player, now);
        if (!next) {
          page = 'home';
          modal = { kind: 'notice', title: 'Energy หมดแล้ว', message: 'รอให้ Energy ฟื้น เติมด้วย Masque Points หรือปลดล็อก VIP เพื่อเล่นต่อได้เลย' };
          return;
        }
        persist(next);
      }
      pendingEnergyEntry = false;
      page = 'game';
      gameId = requestedGame as GameId;
      gameLoading = true;
      gameFallback = false;
      iframeVersion += 1;
      iframeTimeout = window.setTimeout(() => {
        if (gameLoading) gameFallback = true;
      }, 15_000);
      return;
    }
    pendingEnergyEntry = false;
    const inviteCode = new URLSearchParams(hashQuery).get('code');
    if (route === 'room' && inviteCode) joinCode = inviteCode.toUpperCase();
    page = routes.includes(route as Page) ? route as Page : 'home';
  }

  function enterGame(id: GameId): void {
    const next = spendGameEnergy(player, now);
    if (!next) {
      modal = { kind: 'notice', title: 'Energy หมดแล้ว', message: 'รอให้ Energy ฟื้น เติมด้วย Masque Points หรือปลดล็อก VIP เพื่อเล่นต่อได้เลย' };
      return;
    }
    persist(next);
    pendingEnergyEntry = true;
    navigate(`game/${id}`);
  }

  function claimCheckin(): void {
    if (player.checkinDates.includes(todayKey())) return;
    persist({ ...player, checkinDates: [...player.checkinDates, todayKey()], masquePoints: player.masquePoints + 35 });
    modal = { kind: 'checkin-success' };
  }

  function confirmVip(): void {
    if (modal?.kind !== 'vip-confirm') return;
    const next = purchaseVip(player, modal.packageId, now);
    if (!next) return;
    persist(next);
    modal = { kind: 'notice', title: 'VIP เปิดใช้งานแล้ว!', message: 'Energy ไม่จำกัด พร้อมปลดล็อกรางวัลและภารกิจ VIP' };
  }

  function confirmRefill(): void {
    if (!pendingRefill) return;
    const next = refillEnergy(player, pendingRefill.energy, pendingRefill.cost);
    if (!next) {
      modal = { kind: 'notice', title: 'เติม Energy ไม่สำเร็จ', message: 'ตรวจสอบยอด Masque Points หรือ Energy ปัจจุบันของคุณ' };
      return;
    }
    persist(next);
    modal = { kind: 'notice', title: 'เติม Energy สำเร็จ!', message: `ได้รับ Energy +${pendingRefill.energy}` };
  }

  function confirmExchange(): void {
    const next = exchangeAisPoints(player, exchangeAmount);
    if (!next) return;
    persist(next);
    modal = { kind: 'notice', title: 'แลกสำเร็จ!', message: `ได้รับ ${exchangeAmount * 10} Masque Points` };
  }

  function claimReward(index: number, track: 'free' | 'vip'): void {
    if (track === 'vip' && !vipActive) return;
    const next = claimBattlePassReward(player, track, index);
    if (!next) return;
    persist(next);
    showToast(`${track === 'vip' ? BATTLE_PASS.vipRewards[index].title : BATTLE_PASS.freeRewards[index].title} รับแล้ว`);
  }

  function claimMission(kind: 'daily' | 'vip'): void {
    const missionId = `${kind}-${todayKey()}`;
    if (player.claimedMissions.includes(missionId)) return;
    persist({ ...addMockMissionXp(player, kind === 'vip' ? 100 : 50), claimedMissions: [...player.claimedMissions, missionId] });
    showToast(`รับ ${kind === 'vip' ? 100 : 50} XP แล้ว`);
  }

  function startGacha(): void {
    if (gachaBusy) return;
    if (player.gachaTickets <= 0 && player.masquePoints < PET_GACHA_COST) {
      modal = { kind: 'notice', title: 'Masque Points ไม่พอ', message: 'แลก AIS Points ใน Shop เพื่อสุ่ม Pet ได้เลย' };
      return;
    }
    gachaBusy = true;
    window.setTimeout(() => {
      const result = drawPet(player);
      gachaBusy = false;
      if (!result) return;
      persist(result.player);
      modal = { kind: 'gacha-result', petId: result.petId, duplicate: result.duplicate };
    }, 900);
  }

  function showToast(message: string): void {
    toast = message;
    window.setTimeout(() => (toast = ''), 1800);
  }

  function makeRoom(): void {
    if (!vipActive) {
      modal = { kind: 'notice', title: 'สร้างห้องสำหรับ VIP', message: 'VIP Pass ปลดล็อกการสร้างห้องเล่นกับเพื่อน' };
      return;
    }
    roomCode = createRoomCode();
    roomCreated = true;
  }

  function formatCountdown(milliseconds: number): string {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function onIframeLoad(): void {
    gameLoading = false;
    gameFallback = false;
    clearIframeTimeout();
  }

  function clearIframeTimeout(): void {
    if (iframeTimeout) window.clearTimeout(iframeTimeout);
    iframeTimeout = undefined;
  }

  function reloadGame(): void {
    gameLoading = true;
    gameFallback = false;
    iframeVersion += 1;
    clearIframeTimeout();
    iframeTimeout = window.setTimeout(() => {
      if (gameLoading) gameFallback = true;
    }, 15_000);
  }

  onMount(() => {
    selectedAvatar = player.avatarId;
    if (resetMockRequested) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('resetMock');
      window.history.replaceState(window.history.state, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    }
    const routeChanged = (): void => handleRoute();
    const timer = window.setInterval(() => {
      now = Date.now();
      const refreshed = refreshEnergy(player, now);
      if (refreshed !== player) persist(refreshed);
    }, 1000);
    window.addEventListener('hashchange', routeChanged);
    if (window.location.hash) handleRoute();
    else window.location.hash = '#home';
    persist(refreshEnergy(player, now));
    return () => {
      window.clearInterval(timer);
      clearIframeTimeout();
      window.removeEventListener('hashchange', routeChanged);
    };
  });
</script>

<div class="app-frame">
  {#if page === 'game'}
    <main class="game-screen">
      <header class="game-topbar">
        <button class="back-button" onclick={() => navigate('home')} aria-label="กลับหน้าเกม"><ArrowLeft size={19} /></button>
        <div class="game-top-copy"><strong>{currentGame.name}</strong><small>{player.id} · LV.{player.level}</small></div>
        <div class="game-energy-chip">{vipActive ? '∞ VIP' : `${player.energy}/${ENERGY_CONFIG.max} ⚡`}</div>
      </header>
      <div class="game-info-bar"><span>{vipActive ? 'VIP ENERGY UNLIMITED' : 'ใช้ 1 Energy ต่อการเข้าเล่น'}</span><a href={currentGame.url} target="_blank" rel="noopener noreferrer" aria-label="เปิดเกมในแท็บใหม่"><ExternalLink size={17} /></a></div>
      <section class="game-stage" aria-label={`เกม ${currentGame.name}`}>
        {#key iframeVersion}<iframe src={currentGame.url} title={currentGame.name} allow="autoplay; fullscreen; gamepad" loading="eager" referrerpolicy="strict-origin-when-cross-origin" onload={onIframeLoad} onerror={() => (gameFallback = true)}></iframe>{/key}
        {#if gameLoading && !gameFallback}<div class="game-loading"><LoaderCircle size={30} /><strong>กำลังเปิดเกม</strong><span>{currentGame.name}</span></div>{/if}
        {#if gameFallback}<div class="game-fallback"><CircleAlert size={25} /><strong>เกมอาจไม่รองรับการเปิดในหน้าต่างนี้</strong><p>ลองเปิดเกมแยก หรือโหลดใหม่อีกครั้ง</p><div><a class="button primary-button" href={currentGame.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />เปิดเกมแยก</a><button class="button light-button" onclick={reloadGame}><RotateCcw size={16} />โหลดใหม่</button></div></div>{/if}
      </section>
    </main>
  {:else}
    <main class="app-main">
      <div class="page-shell">
        <AppHeader {player} onShop={() => navigate('shop')} />
        {#if page === 'home'}
          <section class="welcome-panel">
            <div class="welcome-copy"><p class="eyebrow">MASQUE GAME CENTER</p><h1>วันนี้อยากเล่นอะไร?</h1><p>สะสมพลัง รับรางวัล แล้วออกไปสนุกกัน</p></div>
            <div class="welcome-sticker" aria-hidden="true">🎮</div>
            <span class="welcome-sparkle sparkle-a">✦</span><span class="welcome-sparkle sparkle-b">✧</span>
          </section>

          <section class:vip-energy={vipActive} class="energy-panel">
            <div class="energy-top"><div><p class="eyebrow">YOUR ENERGY</p><h2>{vipActive ? 'พลังงานไม่จำกัด' : 'Energy'}</h2></div>{#if vipActive}<span class="vip-badge"><Crown size={13} fill="currentColor" />VIP</span>{:else}<span class="energy-number">{player.energy}<small>/{ENERGY_CONFIG.max}</small></span>{/if}</div>
            {#if vipActive}
              <div class="unlimited-state"><span>∞</span><div><strong>เล่นได้ไม่จำกัด</strong><small>VIP ถึง {new Date(player.vipExpiresAt ?? now).toLocaleDateString('th-TH')}</small></div></div>
            {:else}
              <div class="energy-track" role="progressbar" aria-valuenow={player.energy} aria-valuemin="0" aria-valuemax={ENERGY_CONFIG.max}><span style={`width:${player.energy / ENERGY_CONFIG.max * 100}%`}></span></div>
              <div class="energy-bottom"><span><Clock3 size={13} />ฟื้น 1 หน่วยใน {player.energy >= ENERGY_CONFIG.max ? 'พลังเต็มแล้ว' : formatCountdown(refillCountdown)}</span><button class="text-button" onclick={() => { selectedRefill = 'small'; modal = { kind: 'refill-confirm', refillId: selectedRefill }; }}><Zap size={14} />เติม Energy</button></div>
            {/if}
          </section>

          <section class="content-section games-section"><div class="section-heading"><div><p class="eyebrow">PLAY & COLLECT</p><h2><Gamepad2 size={19} />เกมทั้งหมด</h2></div><span class="count-chip">{GAMES.length} เกม</span></div><div class="game-grid">{#each GAMES as game, index (game.id)}<GameCard {game} {index} vipActive={vipActive} energy={player.energy} onclick={() => enterGame(game.id)} />{/each}</div></section>
          <section class="checkin-row" aria-label="Daily check-in">
            <div class="checkin-icon"><Gift size={20} /></div><div class="checkin-copy"><strong>เช็กอินประจำวัน</strong><small>รับ 35 Masque Points</small></div>
            <div class="checkin-days" aria-label="ประวัติเช็กอินสัปดาห์นี้">{#each ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as day, i}<span class:checked={player.checkinDates.includes(checkinKeyForDay(i))}>{#if player.checkinDates.includes(checkinKeyForDay(i))}<Check size={10} />{:else}{day}{/if}</span>{/each}</div>
            <button class="mini-claim" disabled={player.checkinDates.includes(todayKey())} onclick={claimCheckin}>{player.checkinDates.includes(todayKey()) ? 'รับแล้ว' : 'รับ'}</button>
          </section>

          <section class="battle-preview">
            <div class="battle-top"><div><p class="eyebrow">SEASON 01 · DREAM ISLAND</p><h2><Ticket size={18} />Battle Pass</h2></div><span class="track-tag">{vipActive ? 'VIP TRACK OPEN' : 'FREE TRACK'}</span></div>
            <div class="battle-progress"><div class="level-orb">{passLevel}</div><div class="progress-copy"><div><strong>Level {passLevel}</strong><span>{passCompleted ? 'Completed' : `${passXp}/100 XP`}</span></div><div class="xp-track"><span style={`width:${passXp}%`}></span></div></div></div>
            <div class="battle-actions"><button class="button light-button" onclick={() => navigate('rewards')}><Gift size={15} />ภารกิจ / รางวัล</button>{#if !vipActive}<button class="button gold-button" onclick={() => navigate('shop')}><Crown size={15} />ซื้อ VIP Pass</button>{:else}<span class="vip-open"><CheckCircle2 size={15} />VIP Rewards เปิดแล้ว</span>{/if}</div>
          </section>
          <section class="quick-links"><button onclick={() => navigate('ranking')}><Trophy size={17} />อันดับเกม<ArrowRight size={15} /></button><button onclick={() => navigate('avatar')}><Heart size={17} />Avatar & Pets<ArrowRight size={15} /></button></section>
        {:else if page === 'shop'}
          <section class="page-heading"><p class="eyebrow">GAME ECONOMY</p><h1><ShoppingBag size={23} />Shop</h1><p>แลกสกุลเงินหรือเปิด VIP Benefits</p></section>
          <div class="wallet-strip"><span><b>AIS Points</b><strong>{player.aisPoints}</strong></span><ArrowRight size={17} /><span><b>Masque Points</b><strong>{player.masquePoints.toLocaleString()}</strong></span></div>
          <div class="segmented"><button class:active={shopTab === 'exchange'} onclick={() => (shopTab = 'exchange')}>แลก Points</button><button class:active={shopTab === 'vip'} onclick={() => (shopTab = 'vip')}>VIP Pass</button></div>
          {#if shopTab === 'exchange'}
            <section class="shop-panel"><div class="shop-panel-title"><div class="round-icon green"><Coins size={20} /></div><div><h2>AIS Points Exchange</h2><p>1 AIS Point = 10 Masque Points</p></div></div><label class="field-label" for="ais-amount">จำนวน AIS Points</label><div class="amount-field"><button aria-label="ลดจำนวน" onclick={() => (exchangeAmount = Math.max(1, exchangeAmount - 1))}>−</button><input id="ais-amount" type="number" min="1" max={player.aisPoints} bind:value={exchangeAmount} /><button aria-label="เพิ่มจำนวน" onclick={() => (exchangeAmount = Math.min(player.aisPoints, exchangeAmount + 1))}>+</button></div><div class="exchange-preview"><span>คุณจะได้รับ</span><strong>{Math.max(0, Number(exchangeAmount) || 0) * 10} <small>Masque Points</small></strong></div><button class="button primary-button full-button" disabled={Number(exchangeAmount) < 1 || Number(exchangeAmount) > player.aisPoints} onclick={() => (modal = { kind: 'exchange-confirm' })}>ยืนยันการแลก <ArrowRight size={16} /></button><p class="mock-caption">Mock transaction · ไม่มีการเชื่อมต่อ AIS Points จริง</p></section>
          {:else}
            <section class="benefit-banner"><Crown size={24} fill="currentColor" /><div><strong>VIP คือสิทธิพิเศษ</strong><p>ทุกคนเข้าเล่นเกมได้ด้วย Energy ไม่มีการเพิ่มคะแนน Ranking</p></div></section>
            {#if vipActive}<section class="vip-active-card"><span class="vip-badge"><Crown size={13} fill="currentColor" />ACTIVE</span><h2>VIP พร้อมใช้งาน</h2><p>เหลือเวลา {Math.max(0, Math.ceil(((player.vipExpiresAt ?? now) - now) / 86_400_000))} วัน</p><div>Energy ∞ · VIP Rewards · VIP Missions · Friends Room</div></section>{/if}
            <div class="vip-packages">{#each VIP_PACKAGES as pack (pack.id)}<article class="vip-package"><div class="vip-package-head"><div><p class="eyebrow">{pack.durationDays} DAYS OF PERKS</p><h2>{pack.label}</h2></div><span class="package-crown"><Crown size={20} fill="currentColor" /></span></div><ul><li><Check size={14} />Energy ไม่จำกัด</li><li><Check size={14} />VIP Battle Pass + Missions</li><li><Check size={14} />สร้างห้องเล่นกับเพื่อน</li><li><Gift size={14} />{pack.reward}</li></ul><div class="package-footer"><strong>{pack.cost} <small>Masque Points</small></strong><button class="button gold-button" disabled={player.masquePoints < pack.cost} onclick={() => (modal = { kind: 'vip-confirm', packageId: pack.id })}>ซื้อแพ็กเกจ <ArrowRight size={15} /></button></div><p class="mock-caption">ราคา Mock สำหรับทดสอบ ไม่ใช่ราคาจริง</p></article>{/each}</div>
          {/if}
        {:else if page === 'rewards'}
          <section class="page-heading"><p class="eyebrow">SEASON 01 · DREAM ISLAND</p><h1><Gift size={23} />Battle Pass</h1><p>สะสม XP และรับรางวัลในทุก Season</p></section>
          <section class:pass-completed={passCompleted} class="pass-level-card"><div class="level-orb large">{passLevel}</div><div><span class="eyebrow">CURRENT LEVEL</span><h2>Level {passLevel} <small>· {vipActive ? 'VIP TRACK' : 'FREE TRACK'}</small></h2><div class="xp-track"><span style={`width:${passXp}%`}></span></div><small>{passCompleted ? 'Season Completed' : `${passXp}/100 XP สู่เลเวลถัดไป`}</small></div><Sparkles size={24} /></section>
          <div class="mission-strip"><div><Zap size={17} /><span><strong>ภารกิจประจำวัน</strong><small>เล่นเกม 1 ครั้ง · +50 XP</small></span><button disabled={player.claimedMissions.includes(`daily-${todayKey()}`)} onclick={() => claimMission('daily')}>{player.claimedMissions.includes(`daily-${todayKey()}`) ? 'รับแล้ว' : 'รับ XP'}</button></div>{#if vipActive}<div><Crown size={17} /><span><strong>VIP Mission</strong><small>ทำคะแนน Best Score · +100 XP</small></span><button disabled={player.claimedMissions.includes(`vip-${todayKey()}`)} onclick={() => claimMission('vip')}>{player.claimedMissions.includes(`vip-${todayKey()}`) ? 'รับแล้ว' : 'รับ XP'}</button></div>{/if}</div>
          <div class="reward-track-title"><h2>Free Track</h2><span>เปิดสำหรับทุกคน</span></div>
          <div class="reward-track">{#each BATTLE_PASS.freeRewards as reward, index (reward.title)}{@const rewardId = `free-${index + 1}`}<article class:claimed={player.claimedRewards.includes(rewardId)} class:available={passLevel >= index + 1 && !player.claimedRewards.includes(rewardId)} class="reward-tile"><span class="reward-step">LV.{index + 1}</span><span class="reward-art">{reward.type === 'energy' ? '⚡' : reward.type === 'avatar' ? '🧑' : reward.type === 'pet' ? '🐾' : '🪙'}</span><strong>{reward.title}</strong>{#if player.claimedRewards.includes(rewardId)}<span class="reward-state"><Check size={12} />รับแล้ว</span>{:else if passLevel >= index + 1}<button onclick={() => claimReward(index, 'free')}>รับรางวัล</button>{:else}<span class="reward-state locked"><Lock size={12} />ล็อก</span>{/if}</article>{/each}</div>
          <div class="reward-track-title vip-track-title"><h2><Crown size={17} />VIP Track</h2><span>{vipActive ? 'ปลดล็อกแล้ว' : 'ต้องมี VIP Pass'}</span></div>
          <div class="reward-track">{#each BATTLE_PASS.vipRewards as reward, index (reward.title)}{@const rewardId = `vip-${index + 1}`}<article class:claimed={player.claimedRewards.includes(rewardId)} class:available={vipActive && passLevel >= index + 1 && !player.claimedRewards.includes(rewardId)} class="reward-tile vip-reward"><span class="reward-step">LV.{index + 1}</span><span class="reward-art">{reward.type === 'energy' ? '⚡' : reward.type === 'avatar' ? '🧑' : reward.type === 'pet' ? '🐾' : '🪙'}</span><strong>{reward.title}</strong>{#if player.claimedRewards.includes(rewardId)}<span class="reward-state"><Check size={12} />รับแล้ว</span>{:else if !vipActive}<span class="reward-state locked"><Lock size={12} />VIP</span>{:else if passLevel >= index + 1}<button onclick={() => claimReward(index, 'vip')}>รับรางวัล</button>{:else}<span class="reward-state locked"><Lock size={12} />ล็อก</span>{/if}</article>{/each}</div>
          {#if !vipActive}<button class="button gold-button full-button" onclick={() => { shopTab = 'vip'; navigate('shop'); }}>ปลดล็อก VIP Track <Crown size={15} /></button>{/if}
        {:else if page === 'avatar'}
          <section class="page-heading"><p class="eyebrow">YOUR COLLECTION</p><h1><Heart size={23} />Avatar & Pets</h1><p>เลือกตัวละครและคู่หูของคุณ</p></section>
          <section class="character-stage"><span class="stage-sparkle stage-left">✦</span><div class="character-aura"></div><div class="character-figure" style={`--avatar-color:${previewAvatar.color}`}><AssetPortrait src={previewAvatar.imagePath} alt={previewAvatar.name} placeholder={previewAvatar.placeholder} kind="avatar" className="stage-portrait" /></div>{#if player.petId}{@const stagePet = PETS.find((pet) => pet.id === player.petId)}{#if stagePet}<AssetPortrait src={stagePet.imagePath} alt={stagePet.name} placeholder={stagePet.placeholder} kind="pet" className="stage-pet" style={`--pet-color:${stagePet.color}`} />{/if}{/if}<div class="stage-name"><strong>{previewAvatar.name}{player.avatarId === selectedAvatar ? '' : ' · Preview'}</strong><span>LV.{player.level} · {player.displayName}</span></div></section>
          <div class="collection-heading"><h2>ตัวละคร</h2><span>เลือกได้ทั้งตัว</span></div><div class="avatar-grid">{#each AVATARS as avatar (avatar.id)}{@const owned = player.ownedAvatarIds.includes(avatar.id)}<button class:equipped={player.avatarId === avatar.id} class:previewed={selectedAvatar === avatar.id} class="avatar-tile" onclick={() => (selectedAvatar = avatar.id)}><AssetPortrait src={avatar.imagePath} alt={avatar.name} placeholder={avatar.placeholder} kind="avatar" className="avatar-mini" style={`--avatar-color:${avatar.color}`} /><strong>{avatar.name}</strong><small>{avatar.rarity}{owned ? '' : ' · Locked'}</small>{#if !owned}<Lock size={13} class="tile-lock" />{:else if player.avatarId === avatar.id}<CheckCircle2 size={15} class="equipped-check" />{/if}</button>{/each}</div>{#if player.ownedAvatarIds.includes(selectedAvatar) && player.avatarId !== selectedAvatar}<button class="button primary-button full-button avatar-equip-button" onclick={() => { const next = selectAvatar(player, selectedAvatar); if (next) persist(next); }}>ใช้ตัวละครนี้ <Check size={14} /></button>{/if}
          <div class="collection-heading pet-heading"><h2>Pet Collection</h2><button class="button light-button gacha-button" disabled={gachaBusy || (player.gachaTickets <= 0 && player.masquePoints < PET_GACHA_COST)} onclick={startGacha}>{gachaBusy ? 'กำลังสุ่ม…' : player.gachaTickets ? `สุ่มฟรี · Ticket ${player.gachaTickets}` : `สุ่ม Pet · ${PET_GACHA_COST} MP`}<Sparkles size={14} /></button></div><div class="pet-grid">{#each PETS as pet (pet.id)}{@const owned = player.ownedPetIds.includes(pet.id)}<button class:equipped={player.petId === pet.id} class="pet-tile" disabled={!owned} onclick={() => { const next = equipPet(player, player.petId === pet.id ? null : pet.id); if (next) persist(next); }}><AssetPortrait src={pet.imagePath} alt={pet.name} placeholder={pet.placeholder} kind="pet" className="pet-art" style={`--pet-color:${pet.color}`} /><strong>{pet.name}</strong><small>{pet.rarity}</small><span class:owned={owned} class="ownership">{!owned ? 'Locked' : player.petId === pet.id ? 'Equipped' : 'Owned'}</span></button>{/each}</div><p class="mock-caption">Pet ซ้ำจะได้รับ Masque Points คืน 15 แต้ม</p>
        {:else if page === 'ranking'}
          <section class="page-heading"><p class="eyebrow">HIGH SCORE CHALLENGE</p><h1><Trophy size={23} />Game Ranking</h1><p>อันดับแยกตามเกม · Free และ VIP มีสิทธิ์เท่ากัน</p></section>
          <div class="best-score-strip"><span>BEST SCORE · {GAME_BY_ID[rankingGameId].name}</span><strong>{mockScores[rankingGameId].toLocaleString('en-US')}</strong></div>
          <Leaderboard bind:gameId={rankingGameId} bind:period={rankingPeriod} {player} currentScore={mockScores[rankingGameId]} />
        {:else if page === 'room'}
          <section class="page-heading"><p class="eyebrow">PLAY TOGETHER</p><h1><UsersRound size={23} />Friends Room</h1><p>สร้างห้องหรือเข้าร่วมด้วยรหัส · Mock UI</p></section>
          <section class="room-create-panel"><div class="room-icon"><UsersRound size={25} /></div><h2>เล่นด้วยกันสนุกกว่า</h2><p>{vipActive ? 'VIP พร้อมสร้างห้องเล่นกับเพื่อน' : 'การสร้างห้องเป็นสิทธิพิเศษของ VIP'}</p><button class="button primary-button" onclick={makeRoom}><UsersRound size={16} />สร้างห้องใหม่</button>{#if roomCreated}<div class="room-code"><span>ROOM CODE</span><strong>{roomCode}</strong><button aria-label="คัดลอกรหัสห้อง" onclick={() => { void navigator.clipboard?.writeText(roomCode); showToast('คัดลอกรหัสห้องแล้ว'); }}><Copy size={16} /></button></div><div class="room-members"><strong>สมาชิกในห้อง <span>1/4</span></strong><div><span class="member-avatar">🧑🏻‍🚀</span><span>{player.displayName} <small>Host</small></span><button class="button light-button" onclick={() => enterGame('bird')}><Play size={14} />เริ่มเกม</button></div></div><button class="button light-button invite-button" onclick={() => { void navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#room?code=${roomCode}`); showToast('ลิงก์เชิญถูกคัดลอกแล้ว'); }}><UsersRound size={14} />เชิญเพื่อน</button>{/if}</section>
          <section class="join-room-panel"><h2>มีรหัสห้องแล้ว?</h2><div class="join-room-row"><input aria-label="รหัสห้อง" maxlength="6" placeholder="ใส่รหัส 6 ตัว" bind:value={joinCode} /><button class="button light-button" disabled={joinCode.trim().length < 4} onclick={() => showToast(`จำลองการเข้าห้อง ${joinCode.toUpperCase()}`)}>เข้าร่วมห้อง <ArrowRight size={15} /></button></div><p>การเข้าร่วมและสมาชิกเป็นข้อมูลจำลอง ยังไม่มี Multiplayer</p></section>
        {/if}
      </div>
      <BottomNav {page} />
    </main>
  {/if}
</div>

{#if page !== 'game'}<div class="landscape-notice" role="status"><strong>กรุณาหมุนมือถือเป็นแนวตั้ง</strong></div>{/if}
{#if toast}<div class="toast-message" role="status"><CheckCircle2 size={16} />{toast}</div>{/if}

{#if modal}
  <div class="modal-backdrop" role="presentation" onclick={() => (modal = null)}>
    <div class="dialog-card" role="dialog" tabindex="-1" aria-modal="true" onclick={(event) => event.stopPropagation()} onkeydown={(event) => event.stopPropagation()}>
      <button class="dialog-close" aria-label="ปิดหน้าต่าง" onclick={() => (modal = null)}><X size={18} /></button>
      {#if modal.kind === 'vip-confirm' && pendingVip}
        <div class="dialog-emblem gold-emblem"><Crown size={27} fill="currentColor" /></div><p class="eyebrow">VIP PASS · MOCK PURCHASE</p><h2>ยืนยัน {pendingVip.label}</h2><p class="dialog-summary">ปลดล็อก Energy ไม่จำกัด, VIP Rewards, VIP Missions และ Friends Room</p><div class="purchase-receipt"><div><span>ระยะเวลา</span><b>{pendingVip.durationDays} วัน</b></div><div><span>สิทธิพิเศษ</span><b>{pendingVip.reward}</b></div><div class="receipt-total"><span>ใช้ Masque Points</span><b>{pendingVip.cost} MP</b></div></div><p class="mock-caption">ราคา Mock เท่านั้น ไม่มีการชำระเงินจริง</p><div class="dialog-actions"><button class="button light-button" onclick={() => (modal = null)}>ยกเลิก</button><button class="button gold-button" onclick={confirmVip}>ยืนยันซื้อ <ArrowRight size={15} /></button></div>
      {:else if modal.kind === 'refill-confirm' && pendingRefill}
        <div class="dialog-emblem"><Zap size={27} fill="currentColor" /></div><p class="eyebrow">ENERGY REFILL</p><h2>เลือกแพ็กเติม Energy</h2><p class="dialog-summary">ยอดปัจจุบัน {player.energy}/{ENERGY_CONFIG.max} Energy</p><div class="refill-options">{#each ENERGY_CONFIG.refillPacks as pack (pack.id)}<button class:selected={modal.refillId === pack.id} onclick={() => (modal = { kind: 'refill-confirm', refillId: pack.id })}><strong>+{pack.energy} ⚡</strong><small>{pack.cost} MP</small></button>{/each}</div><div class="purchase-receipt"><div><span>ค่าใช้จ่าย</span><b>{pendingRefill.cost} Masque Points</b></div><div><span>คงเหลือหลังเติม</span><b>{Math.min(ENERGY_CONFIG.max, player.energy + pendingRefill.energy)}/{ENERGY_CONFIG.max}</b></div></div><div class="dialog-actions"><button class="button light-button" onclick={() => (modal = null)}>ยกเลิก</button><button class="button primary-button" disabled={player.masquePoints < pendingRefill.cost} onclick={confirmRefill}>ยืนยันเติม <Zap size={15} /></button></div>
      {:else if modal.kind === 'exchange-confirm'}
        <div class="dialog-emblem green-emblem"><Coins size={27} /></div><p class="eyebrow">AIS POINTS EXCHANGE</p><h2>ยืนยันการแลก</h2><p class="dialog-summary">{exchangeAmount} AIS Points จะแลกเป็น {exchangeAmount * 10} Masque Points</p><div class="dialog-actions"><button class="button light-button" onclick={() => (modal = null)}>ยกเลิก</button><button class="button primary-button" onclick={confirmExchange}>ยืนยันแลก <ArrowRight size={15} /></button></div>
      {:else if modal.kind === 'gacha-result'}
        <div class="gacha-reveal"><AssetPortrait src={gachaPet?.imagePath ?? ''} alt={gachaPet?.name ?? 'Mystery Pet'} placeholder={gachaPet?.placeholder ?? '🐾'} kind="pet" className="gacha-pet-image" style={`--pet-color:${gachaPet?.color ?? '#f6ca72'}`} /></div><p class="eyebrow">PET GACHA RESULT</p><h2>{gachaPet?.name ?? 'Mystery Pet'}!</h2><p class="dialog-summary">{modal.duplicate ? 'Pet ซ้ำ! ได้รับ Masque Points คืน 15 แต้ม' : 'เพิ่มเข้า Pet Collection และสวมใส่ให้อัตโนมัติ'}</p><button class="button gold-button full-button" onclick={() => (modal = null)}>เยี่ยมเลย <Sparkles size={15} /></button>
      {:else if modal.kind === 'checkin-success'}
        <div class="dialog-emblem green-emblem"><Gift size={27} /></div><p class="eyebrow">DAILY CHECK-IN</p><h2>รับรางวัลแล้ว!</h2><p class="dialog-summary">+35 Masque Points · กลับมาเช็กอินพรุ่งนี้นะ</p><button class="button primary-button full-button" onclick={() => (modal = null)}>รับทราบ <Check size={15} /></button>
      {:else if modal.kind === 'notice'}
        <div class="dialog-emblem"><Sparkles size={27} /></div><p class="eyebrow">MASQUE GAME</p><h2>{modal.title}</h2><p class="dialog-summary">{modal.message}</p>{#if modal.title === 'Energy หมดแล้ว'}<div class="energy-options"><button class="button light-button" onclick={() => { modal = null; navigate('home'); }}>รอ Energy ฟื้น <Clock3 size={14} /></button><button class="button primary-button" onclick={() => { modal = { kind: 'refill-confirm', refillId: 'small' }; }}>เติม Energy <Zap size={14} /></button><button class="button gold-button" onclick={() => { shopTab = 'vip'; modal = null; navigate('shop'); }}>ซื้อ VIP <Crown size={14} /></button></div>{:else}<button class="button primary-button full-button" onclick={() => (modal = null)}>ตกลง <Check size={15} /></button>{/if}
      {/if}
    </div>
  </div>
{/if}