<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ArrowLeft, ArrowRight, Check, CircleAlert, Clock3, Crown, ExternalLink,
    Gamepad2, LoaderCircle, RotateCcw, Sparkles, Star, Ticket, Trophy, X,
  } from '@lucide/svelte';
  import AppHeader from './lib/components/AppHeader.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import GameCard from './lib/components/GameCard.svelte';
  import Leaderboard from './lib/components/Leaderboard.svelte';
  import PassStatus from './lib/components/PassStatus.svelte';
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import {
    DAILY_FREE_SECONDS, extendPass, formatDuration, formatPassRemaining, freeSecondsRemaining,
    isPassActive, PASS_PACKAGES,
  } from './lib/services/passService';
  import { currentDayKey, loadPlayer, savePlayer } from './lib/services/playerService';
  import type { GameId, PassPackage, PlayerState, RankingPeriod } from './lib/types';
  import './app.css';

  type Page = 'home' | 'pass' | 'ranking' | 'game';
  type ModalState = { kind: 'purchase'; packageId: PassPackage['id'] } | { kind: 'success' } | null;

  const MOCK_PLAYER_SCORES: Record<GameId, number> = {
    bird: 47, mole: 1250, run: 640, fruit: 780, timber: 320, duck: 520, memory: 8,
  };

  let player = $state<PlayerState>(loadPlayer(new URLSearchParams(window.location.search).get('name')));
  let page = $state<Page>('home');
  let gameId = $state<GameId>('bird');
  let rankingGameId = $state<GameId>('bird');
  let rankingPeriod = $state<RankingPeriod>('weekly');
  let modal = $state<ModalState>(null);
  let now = $state(Date.now());
  let gameLoading = $state(true);
  let gameFallback = $state(false);
  let iframeVersion = $state(0);
  let pendingPackage = $derived.by(() => {
    const activeModal = modal;
    if (!activeModal || activeModal.kind !== 'purchase') return null;
    return PASS_PACKAGES.find((item) => item.id === activeModal.packageId) ?? null;
  });
  let passActive = $derived(isPassActive(player.passExpiredAt, now));
  let freeLeft = $derived(freeSecondsRemaining(player, new Date(now)));
  let passRemaining = $derived(player.passExpiredAt ? formatPassRemaining(player.passExpiredAt, now) : '');
  let currentGame = $derived(GAME_BY_ID[gameId]);
  let iframeTimeout: ReturnType<typeof setTimeout> | undefined;

  function persist(): void {
    savePlayer(player);
  }

  function clearIframeTimeout(): void {
    if (iframeTimeout) clearTimeout(iframeTimeout);
    iframeTimeout = undefined;
  }

  function handleRoute(): void {
    persist();
    clearIframeTimeout();
    const [route, requestedGame] = window.location.hash.replace(/^#/, '').split('/');
    if (route === 'pass' || route === 'ranking') {
      page = route;
      return;
    }
    if (route === 'game' && requestedGame in GAME_BY_ID) {
      page = 'game';
      gameId = requestedGame as GameId;
      gameLoading = true;
      gameFallback = false;
      iframeVersion += 1;
      if (passActive || freeLeft > 0) {
        iframeTimeout = setTimeout(() => {
          if (gameLoading) gameFallback = true;
        }, 15_000);
      }
      return;
    }
    page = 'home';
  }

  function navigate(route: string): void {
    const destination = `#${route}`;
    if (window.location.hash === destination) handleRoute();
    else window.location.hash = destination;
  }

  function openPurchase(packageInfo: PassPackage): void {
    modal = { kind: 'purchase', packageId: packageInfo.id };
  }

  function confirmPurchase(): void {
    const activeModal = modal;
    if (!activeModal || activeModal.kind !== 'purchase') return;
    const packageInfo = PASS_PACKAGES.find((item) => item.id === activeModal.packageId);
    if (!packageInfo || player.aisPoints < packageInfo.cost) return;
    player = extendPass(player, packageInfo, now);
    persist();
    modal = { kind: 'success' };
    if (page !== 'home') navigate('home');
  }

  function onIframeLoad(): void {
    gameLoading = false;
    gameFallback = false;
    clearIframeTimeout();
  }

  function reloadGame(): void {
    gameLoading = true;
    gameFallback = false;
    iframeVersion += 1;
    clearIframeTimeout();
    iframeTimeout = setTimeout(() => {
      if (gameLoading) gameFallback = true;
    }, 15_000);
  }

  onMount(() => {
    player = loadPlayer(new URLSearchParams(window.location.search).get('name'));
    const syncRoute = (): void => handleRoute();
    const persistOnHide = (): void => { if (document.hidden) persist(); };
    const dismissOnEscape = (event: KeyboardEvent): void => { if (event.key === 'Escape') modal = null; };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('beforeunload', persist);
    document.addEventListener('visibilitychange', persistOnHide);
    document.addEventListener('keydown', dismissOnEscape);
    if (window.location.hash) handleRoute();
    else window.location.hash = '#home';

    const timer = window.setInterval(() => {
      now = Date.now();
      if (page !== 'game' || document.hidden || passActive || freeLeft <= 0) return;
      if (player.freeDate !== currentDayKey(new Date(now))) {
        player.freeDate = currentDayKey(new Date(now));
        player.freeUsedSeconds = 0;
      }
      player.freeUsedSeconds = Math.min(DAILY_FREE_SECONDS, player.freeUsedSeconds + 1);
      if (player.freeUsedSeconds % 5 === 0 || player.freeUsedSeconds >= DAILY_FREE_SECONDS) persist();
    }, 1000);

    return () => {
      window.clearInterval(timer);
      clearIframeTimeout();
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('beforeunload', persist);
      document.removeEventListener('visibilitychange', persistOnHide);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  });
</script>

<div class="app-frame">
  {#if page === 'game'}
    <main class="game-screen">
      <header class="game-topbar">
        <button class="back-button" onclick={() => navigate('home')} aria-label="กลับหน้าเกม"><ArrowLeft size={18} /><span>กลับ</span></button>
        <div class="game-top-copy"><strong>{currentGame.name}</strong><small>{player.id} · LV.{player.level}</small></div>
        <div class="game-best"><small>BEST SCORE</small><b>{MOCK_PLAYER_SCORES[gameId].toLocaleString('en-US')}</b></div>
      </header>
      <div class="game-info-bar">
        <span class:pass-indicator={passActive} class="eligibility"><span class="eligibility-dot"></span>{passActive ? 'PASS ACTIVE · RANK ELIGIBLE' : 'FREE PLAY · UNRANKED'}</span>
        <strong class="free-clock">{passActive ? `Pass เหลือ ${passRemaining}` : `${formatDuration(freeLeft)} เหลือ`}</strong>
        <a class="external-game" href={currentGame.url} target="_blank" rel="noopener noreferrer" aria-label="เปิดเกมในแท็บใหม่"><ExternalLink size={17} /></a>
      </div>
      <section class="game-stage" aria-label={`เกม ${currentGame.name}`}>
        {#if !passActive && freeLeft <= 0}
          <div class="quota-screen"><div class="quota-icon"><Clock3 size={32} /></div><p class="eyebrow">FREE PLAY COMPLETE</p><h1>วันนี้เล่นครบแล้ว</h1><p>อัปเกรดเป็น Masque Pass เพื่อเล่นต่อได้ไม่จำกัดและมีสิทธิ์เข้าร่วม Ranking</p><button class="button gold-button" onclick={() => navigate('pass')}>ดูแพ็กเกจ Pass <ArrowRight size={17} /></button></div>
        {:else}
          {#key iframeVersion}
            <iframe src={currentGame.url} title={currentGame.name} allow="autoplay; fullscreen; gamepad" loading="eager" referrerpolicy="strict-origin-when-cross-origin" onload={onIframeLoad} onerror={() => (gameFallback = true)}></iframe>
          {/key}
          {#if gameLoading && !gameFallback}<div class="game-loading"><LoaderCircle size={30} /><strong>กำลังเปิดเกม</strong><span>{currentGame.name}</span></div>{/if}
          {#if gameFallback}<div class="game-fallback"><CircleAlert size={25} /><strong>เกมอาจไม่รองรับการเปิดในหน้าต่างนี้</strong><p>ลองเปิดเกมแยก หรือโหลดใหม่อีกครั้ง</p><div><a class="button primary-button" href={currentGame.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />เปิดเกมแยก</a><button class="button light-button" onclick={reloadGame}><RotateCcw size={16} />โหลดใหม่</button></div></div>{/if}
        {/if}
      </section>
      <p class="game-footnote">คะแนนและอันดับในต้นแบบเป็นข้อมูลจำลอง ยังไม่มีการรับคะแนนจากเกม</p>
    </main>
  {:else}
    <main class="app-main">
      <div class="page-shell">
        <AppHeader {player} />
        {#if page === 'home'}
          <section class="home-hero">
            <div class="hero-stars"><Sparkles size={19} /><Star size={12} /><Sparkles size={13} /></div>
            <div class="hero-copy"><p class="eyebrow">WELCOME TO MASQUEGAME</p><h1>{passActive ? 'พร้อมลุยแรงก์แล้ว!' : 'เลือกเกมที่ชอบ'}</h1><p>{passActive ? 'สิทธิ์พรีเมียมพร้อมแล้ว เล่นได้ทุกเกมไม่จำกัด' : `${GAMES.length} เกมสนุก พร้อมท้าคะแนนและปลดล็อกอันดับ`}</p><span class="hero-player"><span class="hero-level">LV.{player.level}</span>{player.displayName}<span class="hero-id">{player.id}</span></span></div>
            <div class="hero-art"><Trophy size={74} strokeWidth={1.6} /></div><span class="hero-orbit orbit-one"></span><span class="hero-orbit orbit-two"></span>
          </section>
          <PassStatus {player} active={passActive} remaining={passRemaining} freeMinutes={Math.ceil(freeLeft / 60)} onUpgrade={() => navigate('pass')} />
          <section class="content-section games-section"><div class="section-heading"><div><p class="eyebrow">PICK YOUR GAME</p><h2><Gamepad2 size={20} />เกมทั้งหมด</h2></div><span class="count-chip">{String(GAMES.length).padStart(2, '0')} GAMES</span></div><div class="game-grid">{#each GAMES as game, index (game.id)}<GameCard {game} {index} passActive={passActive} onclick={() => navigate(`game/${game.id}`)} />{/each}</div></section>
          <section class="content-section home-ranking-section"><div class="section-heading"><div><p class="eyebrow">GAME BY GAME</p><h2><Trophy size={20} />Leaderboard</h2></div><a class="text-link" href="#ranking">ดูทั้งหมด <ArrowRight size={15} /></a></div><div class="home-ranking-grid"><Leaderboard bind:gameId={rankingGameId} bind:period={rankingPeriod} {player} currentScore={MOCK_PLAYER_SCORES[rankingGameId]} compact /><aside class="ranking-promo"><div class="promo-crown"><Crown size={23} fill="currentColor" /></div><strong>{passActive ? 'พร้อมไต่แรงก์!' : 'ปลดล็อก Ranked Play'}</strong><p>{passActive ? 'Pass ของคุณเปิดสิทธิ์เข้าร่วม Ranking แล้ว' : 'มี Masque Pass เพื่อร่วม Ranking และเล่นได้ไม่จำกัด'}</p><a class="button promo-button" href={passActive ? '#ranking' : '#pass'}>{passActive ? 'ดูอันดับ' : 'ดู Masque Pass'}<ArrowRight size={15} /></a></aside></div></section>
          <p class="prototype-note">คะแนน, AIS Points และสิทธิ์ Pass เป็นข้อมูลจำลองในอุปกรณ์นี้</p>
        {:else if page === 'pass'}
          <section class="pass-page-intro"><div class="pass-crown"><Crown size={34} fill="currentColor" /></div><p class="eyebrow">MASQUE PASS</p><h1>เล่นเต็มที่<br />ลุยได้ทุกอันดับ</h1><p>เลือกแพ็กเกจด้วย AIS Points จำลอง เล่นได้ทุกเกมแบบไม่จำกัดเวลา</p>{#if passActive}<span class="active-until"><Check size={14} />Pass ใช้งานได้ถึง {new Date(player.passExpiredAt ?? now).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>{/if}</section>
          <section class="package-list" aria-label="แพ็กเกจ Masque Pass">{#each PASS_PACKAGES as packageInfo (packageInfo.id)}<article class:weekly-package={packageInfo.bestValue} class="package-card">{#if packageInfo.bestValue}<span class="best-value"><Sparkles size={12} />BEST VALUE</span>{/if}<p class="package-eyebrow">{packageInfo.id === 'daily' ? 'PLAY TODAY' : 'PLAY ALL WEEK'}</p><h2>{packageInfo.label}</h2><div class="package-price"><strong>{packageInfo.cost}</strong><span>AIS {packageInfo.cost === 1 ? 'Point' : 'Points'}</span></div><p class="package-duration">ใช้งานได้ {packageInfo.durationDays} วัน</p><ul><li><Check size={15} />เล่นทุกเกมไม่จำกัดเวลา</li><li><Check size={15} />มีสิทธิ์เข้าร่วม Ranking</li><li><Check size={15} />ต่ออายุจาก Pass เดิมได้</li></ul><button class:gold-button={packageInfo.bestValue} class="button package-button" onclick={() => openPurchase(packageInfo)}>เลือก {packageInfo.label}<ArrowRight size={16} /></button></article>{/each}</section>
          <section class="free-plan-note"><div><strong>ยังไม่พร้อมอัปเกรด?</strong><p>เล่นฟรีรวมทุกเกมได้วันละ 60 นาที แต่ไม่มีสิทธิ์เข้าร่วม Ranking</p></div><a href="#home" class="button light-button">กลับไปเล่น <ArrowRight size={15} /></a></section><p class="prototype-note">การใช้ AIS Points และการเปิดสิทธิ์ Pass เป็นการจำลอง ไม่ได้เชื่อมต่อระบบ AIS</p>
        {:else}
          <section class="ranking-page-intro"><div class="ranking-intro-icon"><Trophy size={25} /></div><div><p class="eyebrow">SCORE BY GAME</p><h1>Leaderboard</h1><p>อันดับแยกตามเกม · Mock Data</p></div></section>
          <Leaderboard bind:gameId={rankingGameId} bind:period={rankingPeriod} {player} currentScore={MOCK_PLAYER_SCORES[rankingGameId]} />
          <aside class="rank-eligibility-note"><span class:eligible={passActive}>{#if passActive}<Check size={17} />{:else}<Crown size={17} />{/if}</span><div><strong>{passActive ? 'คุณมีสิทธิ์เข้าร่วม Ranking' : 'Ranking สำหรับสมาชิก Masque Pass'}</strong><p>{passActive ? 'คะแนนด้านบนเป็นตัวอย่าง เมื่อเชื่อมต่อระบบจริงจะอัปเดตตามคะแนนเกม' : 'คะแนนของ Free Play จะไม่ถูกส่งเข้า Ranking ซื้อ Pass เพื่อเปิดสิทธิ์จัดอันดับ'}</p></div>{#if !passActive}<a href="#pass" aria-label="ดูแพ็กเกจ Pass"><ArrowRight size={18} /></a>{/if}</aside>
        {/if}
      </div>
      <BottomNav {page} />
    </main>
  {/if}
</div>

<div class="landscape-notice" role="status" aria-live="polite"><div class="rotate-device">↻</div><strong>กรุณาหมุนมือถือเป็นแนวตั้ง</strong><p>MasqueGame ออกแบบสำหรับใช้งานในแนวตั้ง</p></div>

{#if modal}
  <div class="modal-backdrop" role="presentation" onclick={() => (modal = null)}>
    <div class="dialog-card" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="dialog-title" onclick={(event) => event.stopPropagation()} onkeydown={(event) => event.stopPropagation()}>
      <button class="dialog-close" aria-label="ปิดหน้าต่าง" onclick={() => (modal = null)}><X size={18} /></button>
      {#if pendingPackage}
        <div class="dialog-emblem"><Ticket size={30} /></div><p class="eyebrow">CONFIRM YOUR PASS</p><h2 id="dialog-title">ยืนยัน {pendingPackage.label}</h2><p class="dialog-summary">เล่นได้ทุกเกมไม่จำกัดเวลา พร้อมสิทธิ์เข้าร่วม Ranking</p>
        <div class="purchase-receipt"><div><span>ระยะเวลา</span><b>{pendingPackage.durationDays} วัน</b></div><div><span>AIS Points ของคุณ</span><b>{player.aisPoints.toLocaleString('en-US')} Points</b></div><div class="receipt-total"><span>ใช้ Points</span><b>{pendingPackage.cost} Points</b></div></div>
        {#if player.aisPoints < pendingPackage.cost}<div class="insufficient-notice"><CircleAlert size={16} />AIS Points ไม่เพียงพอสำหรับแพ็กเกจนี้</div>{:else}<p class="mock-notice">การแลก Pass นี้เป็นการจำลอง ไม่มีการตัด AIS Points จริง</p>{/if}
        <div class="dialog-actions"><button class="button light-button" onclick={() => (modal = null)}>ยกเลิก</button><button class="button gold-button" disabled={player.aisPoints < pendingPackage.cost} onclick={confirmPurchase}>ยืนยันการแลก <ArrowRight size={16} /></button></div>
      {:else}
        <div class="success-confetti" aria-hidden="true">{#each Array.from({ length: 10 }) as _, index}<i style={`--confetti-index:${index}`}></i>{/each}</div><div class="dialog-emblem success-emblem"><Crown size={31} fill="currentColor" /></div><p class="eyebrow">WELCOME TO THE CLUB</p><h2 id="dialog-title">Masque Pass Active!</h2><p class="dialog-summary">สิทธิ์พรีเมียมพร้อมแล้ว เล่นได้ทุกเกมไม่จำกัดและมีสิทธิ์เข้าร่วม Ranking</p><button class="button gold-button success-button" onclick={() => (modal = null)}>ไปเล่นเกม <ArrowRight size={16} /></button>
      {/if}
    </div>
  </div>
{/if}