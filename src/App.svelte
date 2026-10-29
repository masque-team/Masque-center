<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { SvelteDate } from 'svelte/reactivity';
  import { Gamepad2, Settings2, ArrowUpRight } from '@lucide/svelte';
  import AppHeader from './lib/components/AppHeader.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import DailyCheckinCard from './lib/components/DailyCheckinCard.svelte';
  import AvatarGreeting from './lib/components/AvatarGreeting.svelte';
  import GameDetailPage from './lib/pages/GameDetailPage.svelte';
  import FeaturedGameCard from './lib/components/FeaturedGameCard.svelte';
  import GameCard from './lib/components/GameCard.svelte';
  import GameScreen from './lib/components/GameScreen.svelte';
  import EntryPage from './lib/pages/EntryPage.svelte';
  import ModalHost from './lib/components/ModalHost.svelte';
  import SectionHeading from './lib/components/SectionHeading.svelte';
  import Toast from './lib/components/Toast.svelte';
  import PetGacha from './lib/components/PetGacha.svelte';
  import PointShop from './lib/components/PointShop.svelte';
  import PassPage from './lib/pages/SeasonPage.svelte';
  import BattlePage from './lib/pages/BattlePage.svelte';
  import WalletPage from './lib/pages/WalletPage.svelte';
  import ProfilePage from './lib/pages/ProfileShowcase.svelte';
  import RankingPage from './lib/pages/RankingPage.svelte';
  import AdminPage from './lib/pages/AdminPage.svelte';
  import ShopPage from './lib/pages/ShopPage.svelte';
  import VeaseFrame from './lib/components/VeaseFrame.svelte';
  import type { SceneState } from '@masque/vease-protocol';
  import { AVATARS, POINT_PACKS } from './lib/data/config';
  import AssetPortrait from './lib/components/AssetPortrait.svelte';
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import { MOCK_RANKINGS } from './lib/data/mockRankings';
  import { equipOutfit, selectAvatar } from './lib/services/avatarService';
  import { isVip, nextRefillIn, refreshEnergy, refillEnergy } from './lib/services/energyService';
  import { purchaseVip, vipOffer } from './lib/services/passService';
  import { equipPet } from './lib/services/petService';
  import { buyGachaCoupons, drawGachaBatch } from './lib/services/gachaService';
  import { customizeProfile, loadPlayer, parseAisPointSeed, savePlayer } from './lib/services/playerService';
  import { buyArenaTickets, buyPointPack, pointPackReward, equipWings, exchangeAisPoints, purchaseShopItem } from './lib/services/walletService';
  import { beginGame, claimAvailablePass, claimPass, claimPassBonus, claimMission as completeMission, claimWeeklyMission, currentSeason, demoNow, finishGame, ledger, recordPlayTime, validateConfig, claimRankingReward } from './lib/services/demoService';
  import type { DemoConfig, GameId, GameMode, GachaKind, ModalState, Page, PlayerState, RankingPeriod, ShopTab, VipPackage } from './lib/types';
  import './app.css';

  const WEEKDAY_LABELS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  const initialQuery = new URLSearchParams(window.location.search);
  const resetMockRequested = initialQuery.get('resetMock') === '1';
  const queryName = initialQuery.get('name')?.trim().replace(/\s+/g, ' ').slice(0, 40) || null;
  const aisPointSeed = parseAisPointSeed(initialQuery.get('aispoint'));
  let player = $state<PlayerState>(loadPlayer(
    queryName,
    aisPointSeed,
    resetMockRequested,
  ));
  let sessionName = $state(queryName ?? '');
  let hasEntered = $state(!!queryName);
  let mockScores = $derived(player.demo.scores);
  let CHECKIN_REWARD = $derived(player.demo.config.checkinReward);
  let page = $state<Page>('home');
  let homeGenre = $state('all');
  let pointsReturnRoute = $state<Page | null>(null);
  let sceneState = $derived(veaseState(player));
  let wardrobeHeight = $state(1000);
  let motionReduced = $state(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const initialGameId = GAMES.find((game) => game.published !== false)!.id;
  let gameId = $state<GameId>(initialGameId);
  let rankingGameId = $state<GameId>(initialGameId);
  let rankingPeriod = $state<RankingPeriod>('weekly');
  let modal = $state<ModalState>(null);
  let confirmAction = $state<(() => void) | null>(null);
  let activeSessionId = $state('');
  let now = $state(Date.now());
  let gameLoading = $state(true);
  let gameFallback = $state(false);
  let iframeVersion = $state(0);
  let iframeTimeout: number | undefined;
  let toastTimer: number | undefined;
  let gachaTimer: number | undefined;
  let lastPlaySample = performance.now();
  let playClockVisible = !document.hidden;
  let shopTab = $state<ShopTab>('items');
  let exchangeAmount = $state(1);
  let joinCode = $state('');
  let gachaBusy = $state(false);
  let toast = $state('');
  let vipTopUpIntent = $state<string | null>(null);
  let currentGame = $derived(player.demo.config.games.find((game) => game.id === gameId) ?? GAME_BY_ID[gameId]);
  let homeAvatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let featuredGame = $derived(player.demo.config.games.find((game) => game.featured && game.published !== false) ?? player.demo.config.games.find((game) => game.published !== false) ?? GAMES[0]);
  let catalogGames = $derived(player.demo.config.games.filter((game) => game.published !== false).sort((left, right) => (left.displayOrder ?? 99) - (right.displayOrder ?? 99)));
  let filteredGames = $derived(homeGenre === 'all' ? catalogGames.filter((game) => game.id !== featuredGame.id) : catalogGames.filter((game) => game.genre === homeGenre));
  let gameFilters = $derived([{ id: 'all', label: 'ทั้งหมด' }, ...[...new Set(catalogGames.map((game) => game.genre))].map((genre) => ({ id: genre, label: genre }))]);
  let vipActive = $derived(isVip(player, now));
  let activePassSeason = $derived(currentSeason(player, now));
  let refillCountdown = $derived(nextRefillIn(player, now));
  let checkedInToday = $derived(player.checkinDates.includes(todayKey(new Date(now))));
  let checkinDays = $derived(WEEKDAY_LABELS.map((label, index) => ({
    label,
    done: player.checkinDates.includes(checkinKeyForDay(index)),
    today: index === (new Date(now).getDay() + 6) % 7,
  })));

  function persist(next = player, label = 'รายการเดโม'): void {
    player = ledger(player, next, label);
    savePlayer(player);
  }

  function enterSession(name: string): void {
    const displayName = name.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!displayName) return;
    sessionName = displayName;
    player = { ...player, displayName };
    savePlayer(player);
    hasEntered = true;
    handleRoute();
  }

  function veaseState(subject: PlayerState): SceneState {
    return {
      appearance: { name: subject.displayName, level: subject.level, avatarId: subject.avatarId, petId: subject.petId, frameId: subject.demo.frameId, wingId: subject.demo.wingId, vip: isVip(subject, now) },
      owned: { avatarIds: subject.ownedAvatarIds, petIds: subject.ownedPetIds, wingIds: subject.demo.wings },
      theme: subject.demo.config.worldTheme, enabled: subject.demo.config.worldEnabled,
      announcement: subject.demo.config.announcement.slice(0, 160),
      games: subject.demo.config.games.map(({ id, name, cover, published }) => ({ id, name, cover, published })),
    };
  }

  function chooseWings(id: string | null) { applyAction(equipWings(player, id), id ? 'ใส่ปีกแล้ว' : 'ถอดปีกแล้ว'); }

  function requestAction(title: string, message: string, label: string, action: () => void): void {
    confirmAction = action;
    modal = { kind: 'action-confirm', title, message, label };
  }

  function applyAction(next: PlayerState | null, label: string): void {
    if (!next) { showToast('ทำรายการไม่ได้ กรุณาตรวจสอบยอดหรือสถานะ'); return; }
    persist(next, label);
    showToast(label);
  }

  function saveConfig(config: DemoConfig): void {
    const error = validateConfig(config);
    if (error) { showToast(error); return; }
    config.vipPlans = config.vipPlans.map((plan) => ({ ...plan, reward: `${plan.bonusPoints ?? 0} MP + ${plan.bonusTickets ?? 0} Gacha Tickets` }));
    persist({ ...player, demo: { ...player.demo, config } });
    showToast('บันทึกแล้ว · หน้าผู้เล่นอัปเดตตามการตั้งค่า');
  }

  function resetDemo(): void {
    requestAction('Reset Demo?', 'ล้างข้อมูลเดโมทั้งหมดในเครื่อง แล้วคืนค่าตัวอย่างเริ่มต้น', 'ยืนยัน Reset', () => {
      if (gachaTimer) window.clearTimeout(gachaTimer);
      gachaBusy = false;
      player = { ...loadPlayer(queryName, aisPointSeed, true), displayName: sessionName };
      now = demoNow(player);
      activeSessionId = '';
      navigate('home');
      showToast('รีเซ็ตเดโมแล้ว');
    });
  }

  function resetRanking(): void {
    requestAction('รีเซ็ต Season Ranking?', `${player.demo.config.rankingSeasonId} · Lifetime จะไม่เปลี่ยน`, 'รีเซ็ต Season', () => {
      const id = player.demo.config.rankingSeasonId;
      persist({ ...player, demo: { ...player.demo, rankingResets: [...new Set([...player.demo.rankingResets, id])], seasonScores: { ...player.demo.seasonScores, [id]: {} } } });
      showToast('รีเซ็ตคะแนน Season แล้ว');
    });
  }

  function simulateFinish(): void {
    flushPlayTime();
    const score = Math.round((MOCK_RANKINGS[gameId]?.[0]?.score ?? 1000) * (0.7 + Math.random() * 0.6));
    const reward = player.demo.sessions.find((session) => session.id === activeSessionId)?.reward ?? { points: 0, xp: 40 };
    const next = finishGame(player, activeSessionId, score);
    if (!next) return;
    persist(next, 'จบเกมจำลอง');
    navigate(`detail/${gameId}`);
    modal = { kind: 'notice', tone: 'success', title: 'SIMULATED · เล่นจบแล้ว', message: `${score} คะแนน · +${reward.xp} EXP${reward.points ? ` · +${reward.points} MP` : ''} · อัปเดตผลงานแล้ว` };
  }

  function todayKey(date = new Date(now)): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function checkinKeyForDay(index: number): string {
    const date = new SvelteDate(now);
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
    if (!hasEntered) return;
    flushPlayTime();
    clearIframeTimeout();
    const [routePath, hashQuery = ''] = window.location.hash.replace(/^#/, '').split('?');
    const [route, requestedGame] = routePath.split('/');
    if (route !== 'points') { vipTopUpIntent = null; pointsReturnRoute = null; }
    const routes: Page[] = ['home', 'world', 'shop', 'rewards', 'ranking', 'avatar', 'profile', 'room', 'battle', 'wallet', 'admin', 'points', 'gacha'];
    if (route === 'detail' && requestedGame && player.demo.config.games.some((game) => game.id === requestedGame && game.published !== false)) {
      gameId = requestedGame as GameId;
      page = 'detail';
      window.scrollTo({ top: 0 });
      return;
    }
    if (route === 'game' && requestedGame && player.demo.config.games.some((game) => game.id === requestedGame && game.published !== false)) {
      const sessionId = new URLSearchParams(hashQuery).get('session');
      const session = player.demo.sessions.find((entry) => entry.id === sessionId && entry.gameId === requestedGame);
      if (!session) { enterGame(requestedGame as GameId, new URLSearchParams(hashQuery).get('mode') === 'ranked' ? 'ranked' : 'casual'); return; }
      activeSessionId = session.id;
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
    const inviteCode = new URLSearchParams(hashQuery).get('code');
    if (route === 'room' && inviteCode) joinCode = inviteCode.toUpperCase();
    page = routes.includes(route as Page) ? route as Page : 'home';
    window.scrollTo({ top: 0 });
  }

  function enterGame(id: GameId, mode: GameMode = 'casual'): void {
    if (player.demo.config.games.find((game) => game.id === id)?.published === false) { showToast('เกมนี้ปิดชั่วคราวโดย Demo Admin'); return; }
    if (mode === 'ranked' && !player.demo.config.battleEnabled) { showToast('Arena ปิดชั่วคราว'); return; }
    const next = beginGame(player, id, mode);
    if (!next) {
      modal = mode === 'ranked' ? { kind: 'notice', tone: 'warn', title: 'บัตรเข้า Ranked ไม่พอ', message: 'ซื้อบัตรเข้า Ranked ได้ที่ Shop' } : { kind: 'energy-empty' };
      return;
    }
    const sessionId = next.demo.sessions.at(-1)!.id;
    persist(next, mode === 'ranked' ? 'ใช้บัตรเข้า Ranked' : 'เข้าเล่นเกม');
    navigate(`game/${id}?session=${sessionId}&mode=${mode}`);
  }

  function flushPlayTime(): void {
    const sample = performance.now();
    const elapsed = sample - lastPlaySample;
    lastPlaySample = sample;
    if (playClockVisible && hasEntered && page === 'game' && !gameLoading && !gameFallback) {
      const next = recordPlayTime(player, activeSessionId, elapsed);
      if (next !== player) { player = next; savePlayer(player); }
    }
    playClockVisible = !document.hidden;
  }

  function openRefill(refillId = 'small'): void {
    modal = { kind: 'refill-confirm', refillId };
  }

  function openVipConfirm(packageId: string): void {
    const offer = vipOffer(player, packageId, now);
    if (!offer?.eligible) {
      showToast(offer?.active ? 'เลือกอัปเกรดเป็น Pass เลเวลที่สูงกว่าได้' : 'แพ็ก VIP นี้ไม่เข้าเงื่อนไข');
      return;
    }
    vipTopUpIntent = null;
    modal = { kind: 'vip-confirm', packageId: packageId as VipPackage['id'] };
  }

  function openVipShop(): void {
    navigate('rewards');
  }

  function openExchange(): void {
    if (modal?.kind === 'vip-confirm') vipTopUpIntent = modal.packageId;
    modal = null;
    navigate('points');
  }

  function openGachaCouponPurchase(quantity: 1 | 10, returnRoute: 'gacha' | 'shop' = 'gacha'): void {
    pointsReturnRoute = returnRoute;
    modal = { kind: 'gacha-coupon-confirm', quantity };
  }

  function closeModal(): void {
    if (modal?.kind === 'gacha-coupon-confirm') pointsReturnRoute = null;
    modal = null;
  }

  function returnFromPoints(): void {
    const packageId = vipTopUpIntent;
    const returnRoute = pointsReturnRoute;
    vipTopUpIntent = null;
    pointsReturnRoute = null;
    navigate(packageId ? 'rewards' : returnRoute ?? 'home');
    if (packageId) openVipConfirm(packageId);
  }

  function purchasePoints(id: string): void {
    const pack = POINT_PACKS.find((item) => item.id === id);
    if (!pack) return;
    requestAction('เติม Masque Points', `${pack.cost} AIS Points → ${pointPackReward(player, id).toLocaleString()} MP · DEMO`, 'ยืนยันซื้อแพ็ก', () => {
      const next = buyPointPack(player, id);
      applyAction(next, 'เติม Masque Points แล้ว');
      if (next && (vipTopUpIntent || pointsReturnRoute)) returnFromPoints();
    });
  }

  function claimCheckin(): void {
    if (player.checkinDates.includes(todayKey())) return;
    persist({ ...player, checkinDates: [...player.checkinDates, todayKey()], masquePoints: player.masquePoints + CHECKIN_REWARD }, 'Daily check-in');
    modal = { kind: 'checkin-success' };
  }

  function confirmVip(): void {
    if (modal?.kind !== 'vip-confirm') return;
    const packageId = modal.packageId;
    const offer = vipOffer(player, packageId, now);
    if (!offer?.eligible) {
      modal = { kind: 'notice', tone: 'warn', title: 'อัปเกรด VIP ไม่สำเร็จ', message: 'เลือก Pass เลเวลที่สูงกว่าและตรวจสอบยอด Masque Points' };
      return;
    }
    const selected = player.demo.config.vipPlans.find((plan) => plan.id === packageId);
    const next = purchaseVip(player, packageId, now);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อ VIP ไม่สำเร็จ', message: 'ตรวจสอบยอดแต้มและเงื่อนไขแพ็กที่เลือก' };
      return;
    }
    persist(next, `ซื้อ ${selected?.label ?? 'VIP Pass'}`);
    modal = { kind: 'notice', tone: 'success', title: offer.active ? 'อัปเกรด VIP Pass แล้ว!' : 'VIP Pass เปิดใช้งานแล้ว!', message: `${offer.active ? `อัปเกรดเป็น LV.${selected?.startLevel} · วัน VIP คงเดิม` : `ใช้ได้ถึง ${new Date(next.vipExpiresAt!).toLocaleDateString('th-TH')}`} · ${(selected?.startLevel ?? 1) > 1 ? `Pass LV.${selected!.startLevel} พร้อมกดรับรางวัล` : 'รับรางวัลจาก VIP Track ตาม XP'}` };
  }

  function confirmRefill(): void {
    if (modal?.kind !== 'refill-confirm') return;
    const refillId = modal.refillId;
    const pack = player.demo.config.energyPacks.find((item) => item.id === refillId);
    if (!pack) return;
    const next = refillEnergy(player, pack.energy, pack.cost, demoNow(player));
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'เติม Energy ไม่สำเร็จ', message: 'ตรวจสอบยอด Masque Points หรือ Energy ปัจจุบันของคุณ' };
      return;
    }
    persist(next, 'ซื้อ Energy');
    modal = { kind: 'notice', tone: 'success', title: 'เติม Energy สำเร็จ!', message: `ได้รับ Energy +${pack.energy}` };
  }

  function confirmItem(): void {
    if (modal?.kind !== 'item-confirm') return;
    const next = purchaseShopItem(player, modal.itemId);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อไม่สำเร็จ', message: 'แต้มไม่พอ หรือมีสินค้านี้แล้ว' };
      return;
    }
    persist(next, 'ซื้อของเข้าคอลเลกชัน');
    modal = { kind: 'notice', tone: 'success', title: 'เพิ่มเข้าคอลเลกชันแล้ว', message: 'เลือกใช้งานได้ที่ Avatar & Pets' };
  }

  function confirmGachaCoupons(): void {
    if (modal?.kind !== 'gacha-coupon-confirm') return;
    const quantity = modal.quantity;
    const next = buyGachaCoupons(player, quantity);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อคูปองไม่สำเร็จ', message: 'Masque Points ไม่พอ กรุณาเติมแต้มก่อน' };
      return;
    }
    persist(next, `ซื้อคูปองสุ่ม ${quantity} ใบ`);
    pointsReturnRoute = null;
    modal = { kind: 'notice', tone: 'success', title: 'ซื้อคูปองสำเร็จ', message: `ได้รับ ${quantity} คูปอง · ใช้ได้ทั้งตู้ Avatar และ Pet` };
  }

  function confirmExchange(): void {
    const amount = exchangeAmount;
    const next = exchangeAisPoints(player, amount);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลกไม่สำเร็จ', message: 'ตรวจสอบจำนวน AIS Points ของคุณ' };
      return;
    }
    persist(next, 'DEMO · แลก AIS Points');
    modal = { kind: 'notice', tone: 'success', title: 'แลกสำเร็จ!', message: `ได้รับ ${amount * player.demo.config.exchangeRate} Masque Points (จำลอง)` };
  }

  function chooseAvatar(avatarId: string): void {
    const next = selectAvatar(player, avatarId);
    if (!next) return;
    persist(next);
    showToast('เปลี่ยนตัวละครแล้ว');
  }

  function chooseEquipPet(petId: string | null): void {
    const next = equipPet(player, petId);
    if (!next) return;
    persist(next);
    showToast(petId ? 'ใช้สัตว์เลี้ยงแล้ว' : 'ถอดสัตว์เลี้ยงแล้ว');
  }

  function startGacha(kind: GachaKind, count: 1 | 10): void {
    if (gachaBusy) return;
    if (player.gachaTickets < count) {
      openGachaCouponPurchase(count);
      return;
    }
    gachaBusy = true;
    gachaTimer = window.setTimeout(() => {
      const batch = drawGachaBatch(player, kind, count);
      gachaBusy = false;
      if (!batch) return;
      persist(batch.player, `${kind === 'pet' ? 'Pet' : 'Avatar'} Gacha · ${count}${batch.bonusDraws ? '+1' : ''}`);
      modal = { kind: 'gacha-result', gachaKind: kind, results: batch.results, paidCoupons: batch.paidCoupons, bonusDraws: batch.bonusDraws };
    }, count === 10 ? 1500 : 900);
  }

  function showToast(message: string): void {
    toast = message;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast = ''), 1800);
  }

  function formatCountdown(milliseconds: number): string {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function onIframeLoad(): void {
    lastPlaySample = performance.now();
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
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionChanged = () => { motionReduced = motionQuery.matches; };
    motionQuery.addEventListener('change', motionChanged);
    now = demoNow(player);
    if (resetMockRequested) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('resetMock');
      window.history.replaceState(window.history.state, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    }
    const routeChanged = (): void => handleRoute();
    const timer = window.setInterval(() => {
      flushPlayTime();
      now = demoNow(player);
      const refreshed = refreshEnergy(player, now);
      if (refreshed !== player) persist(refreshed, 'ฟื้น Energy');
    }, 1000);
    window.addEventListener('hashchange', routeChanged);
    document.addEventListener('visibilitychange', flushPlayTime);
    window.addEventListener('pagehide', flushPlayTime);
    if (window.location.hash) handleRoute();
    else window.location.hash = '#home';
    persist(refreshEnergy(player, now));
    return () => {
      window.clearInterval(timer);
      clearIframeTimeout();
      if (toastTimer) window.clearTimeout(toastTimer);
      if (gachaTimer) window.clearTimeout(gachaTimer);
      window.removeEventListener('hashchange', routeChanged);
      document.removeEventListener('visibilitychange', flushPlayTime);
      window.removeEventListener('pagehide', flushPlayTime);
      motionQuery.removeEventListener('change', motionChanged);
    };
  });
</script>

{#if !hasEntered}
  <EntryPage {aisPointSeed} onEnter={enterSession} />
{:else}
<div class="app-frame" class:world-frame={page === 'world'}>
  {#if page !== 'game'}
    <div class={['w-full overflow-hidden', page === 'avatar' ? 'relative z-10 pt-[74px]' : 'fixed top-0 left-1/2 z-0 max-w-[460px] -translate-x-1/2', page !== 'world' && page !== 'avatar' ? 'pointer-events-none' : '']} style:height={page === 'world' ? 'calc(100dvh - 74px - env(safe-area-inset-bottom, 0px))' : page === 'avatar' ? `${wardrobeHeight + 74}px` : '100dvh'}>
      <VeaseFrame {sceneState} route={page} mode={page === 'world' ? 'town' : page === 'avatar' ? 'wardrobe' : 'backdrop'} onSize={(height) => { wardrobeHeight = height; }} onNavigate={navigate} onOutfit={(outfit) => { const next = equipOutfit(player, outfit); if (!next) return null; persist(next, 'เปลี่ยนชุดจาก MV'); return veaseState(player); }} />
      {#if page !== 'world' && page !== 'avatar'}<div class="pointer-events-none absolute inset-0 bg-[#edf4ff]/35"></div>{/if}
    </div>
    {#if page !== 'world'}<div class="fixed top-0 left-1/2 z-30 w-full max-w-[460px] -translate-x-1/2 border-b border-white/80 bg-white/80 px-3.5 pt-2 pb-1 backdrop-blur-md"><AppHeader {player} {vipActive} countdown={formatCountdown(refillCountdown)} onRefill={() => openRefill()} onShop={openExchange} onProfile={() => navigate('avatar')} /></div>{/if}
    {#if page === 'avatar'}<div class="h-24" aria-hidden="true"></div>{/if}
  {/if}
  {#if page === 'game'}
    <GameScreen
      game={currentGame}
      {player}
      countdown={formatCountdown(refillCountdown)}
      sessionId={activeSessionId}
      {vipActive}
      loading={gameLoading}
      fallback={gameFallback}
      version={iframeVersion}
      onBack={() => navigate(`detail/${gameId}`)}
      onLoad={onIframeLoad}
      onError={() => (gameFallback = true)}
      onReload={reloadGame}
      onRefill={() => openRefill()}
      onFinish={simulateFinish}
      finished={player.demo.sessions.find((session) => session.id === activeSessionId)?.finished ?? false}
    />
  {:else if page !== 'world' && page !== 'avatar'}
    <main class="app-main relative z-10 pt-[76px]">
      {#key page}
      <div class="page-transition relative border-t border-white/60 bg-white/35 backdrop-blur-[2px]" in:fly={{ y: motionReduced ? 0 : 8, duration: motionReduced ? 0 : 180 }}>
      <div class="page-shell">
        {#if page === 'home'}
          <div class="home">
            <AvatarGreeting avatarId={homeAvatar.id} petId={player.petId} displayName={player.displayName} onAvatarClick={() => navigate('avatar')} />
            <DailyCheckinCard compact reward={CHECKIN_REWARD} days={checkinDays} claimed={checkedInToday} onClaim={claimCheckin} />
            <div class="flex items-center justify-between gap-3 pt-2"><div class="flex min-w-0 items-center gap-2.5"><img class="size-12 shrink-0 object-contain drop-shadow-[0_3px_5px_rgba(60,40,120,0.24)]" src="assets/brand/masque-game-center-symbol.png" alt="" /><div><p class="text-[10px] font-extrabold text-sky-700">MASQUE <span class="ml-1 rounded border border-sky-300 bg-white/80 px-1.5 text-[9px]">DEMO</span></p><h1 class="text-xl font-black leading-tight text-[#2b2468]">Game Center</h1></div></div><button class="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-white bg-white/80 text-sky-700 shadow-[0_3px_0_#c6d8ec] transition-transform active:scale-95 motion-reduce:transition-none" onclick={() => navigate('admin')} aria-label="เปิด Demo Admin" title="Demo Studio"><Settings2 size={18} /></button></div>
            {#if homeGenre === 'all'}<section class="block">
              <FeaturedGameCard game={featuredGame} vipActive={vipActive && player.demo.config.vipFreeEntry} energyCost={player.demo.config.energyCost} onclick={() => navigate(`detail/${featuredGame.id}`)} />
              <p class="mt-3 flex items-center justify-between px-1 text-xs text-[var(--g-muted)]"><span>Personal Best · SIMULATED</span><strong>{(player.demo.scores[featuredGame.id] ?? 0).toLocaleString()}</strong></p>
            </section>{/if}
            <section class="block">
              <SectionHeading eyebrow="PICK YOUR NEXT PLAY" title={homeGenre === 'all' ? 'เกมทั้งหมด' : homeGenre} chip={`${homeGenre === 'all' ? catalogGames.length : filteredGames.length} เกม`}>{#snippet icon()}<Gamepad2 size={20} />{/snippet}</SectionHeading>
              <div class="flex gap-1 overflow-x-auto pb-2" role="group" aria-label="กรองประเภทเกม">{#each gameFilters as filter (filter.id)}<button class={['min-h-9 shrink-0 rounded-full border px-3 text-[10px] font-semibold', homeGenre === filter.id ? 'border-sky-500 bg-sky-600 text-white' : 'border-white bg-white/70 text-[#71839a]']} aria-pressed={homeGenre === filter.id} onclick={() => homeGenre = filter.id}>{filter.label}</button>{/each}</div>
              {#if filteredGames.length}<div class="game-list">{#each filteredGames as game, index (game.id)}<div class="min-w-0"><GameCard {game} {index} vipActive={vipActive && player.demo.config.vipFreeEntry} energyCost={player.demo.config.energyCost} onclick={() => navigate(`detail/${game.id}`)} /><p class="mt-2 flex justify-between px-1 text-[11px] text-[var(--g-muted)]"><span>Personal Best</span><strong>{(player.demo.scores[game.id] ?? 0).toLocaleString()}</strong></p></div>{/each}</div>{:else}<p class="py-8 text-center text-xs text-[var(--g-muted)]">ไม่มีเกมในหมวดนี้</p>{/if}
            </section>
            <button class="flex min-h-16 items-center gap-3 rounded-lg border border-white/80 bg-white/55 px-3 text-left shadow-sm transition-transform active:scale-[0.99]" onclick={() => navigate('world')}>
              <span class="h-12 w-10 shrink-0"><AssetPortrait src={homeAvatar.imagePath} alt="" placeholder={homeAvatar.placeholder} kind="avatar" /></span>
              <span class="min-w-0 flex-1"><strong class="block text-sm">{homeAvatar.name} พาเที่ยว Masque Vease</strong><small class="block text-xs text-[var(--g-muted)]">แวะร้าน เลือกเกม และเจอเพื่อนจำลอง</small></span>
              <ArrowUpRight size={19} class="shrink-0 text-sky-700" />
            </button>
            <div class="space-y-2 border-y border-white/80 py-3"><div class="flex justify-between text-xs"><span>LV.{player.level} · Profile EXP</span><strong>{player.demo.profileXp % 100} / 100</strong></div><progress class="h-1.5 w-full accent-sky-600" value={player.demo.profileXp % 100} max="100" aria-label="Profile EXP"></progress></div>
            <nav class="grid grid-cols-4 gap-2 py-3" aria-label="กิจกรรม">
              {#each [{ route: 'battle', label: 'Ranked', art: 'assets/currency/arena-ticket.png' }, { route: 'ranking', label: 'Ranking', art: 'assets/badges/season-top-1.png' }, { route: 'room', label: 'My Space', art: 'assets/nav/nav-avatar.png' }, { route: 'wallet', label: 'Wallet', art: 'assets/currency/masque-point.png' }] as item (item.route)}<button class="grid min-h-20 justify-items-center gap-1 rounded-2xl border-2 border-white bg-gradient-to-b from-white/90 to-[#eef4ff]/90 py-2.5 text-xs font-extrabold text-[#2b2468] shadow-[0_4px_0_#c8d8ec] transition-transform active:translate-y-0.5 active:scale-95" onclick={() => navigate(item.route)}><img class="size-9 object-contain drop-shadow-[0_2px_4px_rgba(60,40,120,0.24)]" src={item.art} alt="" />{item.label}</button>{/each}
            </nav>
            <button class="flex w-full items-center justify-between gap-3 border-y border-white bg-white/35 px-2 py-3 text-left" onclick={() => navigate('rewards')}><span><small class="text-sky-700">CURRENT SEASON</small><strong class="block">{activePassSeason.name}</strong></span><ArrowUpRight size={22} /></button>

          </div>
        {:else if page === 'detail'}
          {#key gameId}<GameDetailPage game={currentGame} {player} {vipActive} score={mockScores[gameId] ?? 0} countdown={formatCountdown(refillCountdown)} onPlay={() => enterGame(gameId)} onBack={() => navigate('home')} onRefill={() => openRefill()} onAvatar={() => navigate('avatar')} />{/key}
        {:else if page === 'shop'}
          <ShopPage
            {player}
            {vipActive}
            countdown={formatCountdown(refillCountdown)}
            bind:tab={shopTab}
            onBuy={(itemId) => (modal = { kind: 'item-confirm', itemId })}
            onRefill={openRefill}
            onBuyPointPack={purchasePoints}
            onBuyTickets={(quantity) => requestAction('ซื้อบัตรเข้า Ranked', `${quantity} ใบ · ${quantity * player.demo.config.arenaTicketPrice} MP`, 'ยืนยันซื้อบัตร', () => applyAction(buyArenaTickets(player, quantity), 'ซื้อบัตรเข้า Ranked แล้ว'))}
            onBuyGachaCoupons={(quantity) => openGachaCouponPurchase(quantity, 'shop')}
          />
        {:else if page === 'rewards'}
          <PassPage
            {player}
            {now}
            {vipActive}
            onClaim={(index, track) => applyAction(claimPass(player, track, index), 'รับรางวัล Battle Pass แล้ว')}
            onClaimAll={() => applyAction(claimAvailablePass(player), 'รับรางวัลที่ปลดล็อกแล้ว')}
            onBonus={() => applyAction(claimPassBonus(player), 'รับโบนัส Pass แล้ว')}
            onVip={openVipConfirm}
            onMission={(id) => applyAction(completeMission(player, id), 'รับรางวัลภารกิจแล้ว')}
            onWeekly={() => applyAction(claimWeeklyMission(player), 'รับ XP ประจำสัปดาห์แล้ว')}
            onPlay={(id) => navigate(id ? `detail/${id}` : 'home')}
          />
        {:else if page === 'battle'}
          <BattlePage {player} onShop={() => { shopTab = 'items'; navigate('shop'); }} onEnter={(id) => requestAction('เข้า Ranked', 'ใช้บัตรเข้า Ranked 1 ใบ · ไม่ใช้ Energy', 'เข้าเล่น Ranked', () => enterGame(id, 'ranked'))} />
        {:else if page === 'wallet'}
          <WalletPage {player} onShop={openExchange} />
        {:else if page === 'admin'}
          <AdminPage {player} onSave={saveConfig} onReset={resetDemo} onRankingReset={resetRanking}
            onClock={(hours) => { const next = { ...player, demo: { ...player.demo, clockOffset: player.demo.clockOffset + hours * 3_600_000 } }; now = demoNow(next); persist(refreshEnergy(next, now), 'เวลาจำลอง · ฟื้น Energy'); showToast('ปรับเวลาจำลองแล้ว'); }}
            onSeed={() => applyAction({ ...player, masquePoints: player.masquePoints + 500, aisPoints: player.aisPoints + 100 }, 'DEMO · เติมทุนจำลอง')} />
        {:else if page === 'points'}
          <PointShop {player} onBuy={purchasePoints} onBack={returnFromPoints} />
        {:else if page === 'gacha'}
          <PetGacha {player} busy={gachaBusy} onDraw={startGacha} onBuyCoupons={(quantity) => openGachaCouponPurchase(quantity)} />
        {:else if page === 'profile' || page === 'room'}
          {#key page}<ProfilePage {player} editable={page === 'room'} onAvatar={chooseAvatar} onPet={chooseEquipPet} onWing={chooseWings} onSave={(style, frameId) => applyAction(customizeProfile(player, style, frameId), 'บันทึกโปรไฟล์แล้ว')} />{/key}
        {:else if page === 'ranking'}
          <RankingPage {player} bind:gameId={rankingGameId} bind:period={rankingPeriod} scores={mockScores} onClaim={(id) => applyAction(claimRankingReward(player, id), 'รับรางวัล Ranking แล้ว')} />
        {/if}
      </div>
      </div>
      {/key}
    </main>
  {/if}
  {#if page !== 'game'}<BottomNav {page} />{/if}
  {#if !['game', 'avatar', 'gacha', 'points', 'rewards'].includes(page)}<button class="fixed z-30 flex min-h-13 items-center gap-2.5 rounded-full border-2.5 border-white bg-gradient-to-r from-[#fff8db] via-[#ffe89e] to-[#ffd26a] pr-4 pl-2 text-[#5c3600] shadow-[0_5px_0_#c98c24,0_8px_18px_rgba(90,50,150,0.26)] transition-transform hover:scale-105 active:translate-y-0.5 active:scale-95 motion-reduce:transition-none" style:bottom={page === 'world' ? '220px' : 'calc(88px + env(safe-area-inset-bottom))'} style:right="max(14px, calc((100vw - 460px) / 2 + 14px))" title="ไปตู้สุ่ม Avatar / Pet" aria-label="ไปตู้สุ่ม Avatar / Pet" onclick={() => navigate('gacha')}><span class="relative grid size-10 place-items-center rounded-full border-2 border-white bg-gradient-to-b from-white to-[#dff3ff] shadow-inner"><img class="size-8 object-contain drop-shadow-[0_2px_3px_rgba(60,40,120,0.28)]" src="assets/gacha/gacha-capsule.png" alt="" />{#if player.gachaTickets > 0}<span class="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-white bg-rose-500 text-[9px] font-black text-white shadow-xs">{player.gachaTickets}</span>{/if}</span><span class="grid text-left leading-tight"><strong class="text-xs font-black text-[#3b2166]">ตู้สุ่ม Avatar / Pet</strong><small class="text-[9px] font-extrabold text-[#8a5209]">✨ สุ่ม 1 หรือ 10+1 ครั้ง</small></span></button>{/if}
</div>

{#if page !== 'game'}<div class="landscape-notice" role="status"><strong>กรุณาหมุนมือถือเป็นแนวตั้ง</strong></div>{/if}
<Toast message={toast} />
<ModalHost
  {modal}
  {player}
  {vipActive}
  {now}
  exchangeAmount={exchangeAmount}
  checkinReward={CHECKIN_REWARD}
  onClose={closeModal}
  onPickRefill={(id) => (modal = { kind: 'refill-confirm', refillId: id })}
  onConfirmRefill={confirmRefill}
  onConfirmVip={confirmVip}
  onPickVip={openVipConfirm}
  onConfirmExchange={confirmExchange}
  onConfirmItem={confirmItem}
  onConfirmGachaCoupons={confirmGachaCoupons}
  onConfirmAction={() => { const action = confirmAction; confirmAction = null; modal = null; action?.(); }}
  onOpenRefill={() => openRefill()}
  onOpenVip={() => { modal = null; openVipShop(); }}
  onOpenExchange={openExchange}
  onWait={() => { modal = null; navigate('home'); }}
/>
{/if}

<style>
  .app-frame.world-frame { display: block; width: min(100%, 460px); height: 100dvh; min-height: 100dvh; overflow: hidden; box-shadow: none; }
  @media (orientation: landscape) and (max-height: 500px) and (min-width: 600px) { .app-frame.world-frame { display: none; } }
  .home { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; padding-top: 4px; }
  .block { min-width: 0; }
  .game-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media (max-width: 340px) { .game-list { gap: 9px; } .home { gap: 14px; } }
</style>
