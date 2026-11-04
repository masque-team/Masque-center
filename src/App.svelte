<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { SvelteDate } from 'svelte/reactivity';
  import { Crown, Gamepad2, Settings2, ArrowUpRight, Trophy, Sparkles, ShoppingBag, Clock3, Flag, Target, Star, ChevronLeft, ChevronRight, Award, Flame } from '@lucide/svelte';
  import AppHeader from './lib/components/AppHeader.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import DailyCheckinCard from './lib/components/DailyCheckinCard.svelte';
  import GameDetailPage from './lib/pages/GameDetailPage.svelte';
  import GameCard from './lib/components/GameCard.svelte';
  import GameScreen from './lib/components/GameScreen.svelte';
  import EntryPage from './lib/pages/EntryPage.svelte';
  import ModalHost from './lib/components/ModalHost.svelte';
  import SectionHeading from './lib/components/SectionHeading.svelte';
  import Toast from './lib/components/Toast.svelte';
  import PetGacha from './lib/components/PetGacha.svelte';
  import PointShop from './lib/components/PointShop.svelte';
  import MiniGamePages from './lib/pages/MiniGamePages.svelte';
  import AchievementPage from './lib/pages/AchievementPage.svelte';
  import PassPage from './lib/pages/SeasonPage.svelte';
  import BattlePage from './lib/pages/BattlePage.svelte';
  import WalletPage from './lib/pages/WalletPage.svelte';
  import ProfilePage from './lib/pages/ProfileShowcase.svelte';
  import RankingPage from './lib/pages/RankingPage.svelte';
  import AdminPage from './lib/pages/AdminPage.svelte';
  import ShopPage from './lib/pages/ShopPage.svelte';
  import VeaseFrame from './lib/components/VeaseFrame.svelte';
  import RewardIcon from './lib/components/RewardIcon.svelte';
  import type { SceneState } from '@masque/vease-protocol';
  import { BADGE_ARTWORK, CAMPAIGN_ARTWORK, POINT_PACKS, PROFILE_FRAMES } from './lib/data/config';
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import { MOCK_RANKINGS } from './lib/data/mockRankings';
  import { equipOutfit, selectAvatar } from './lib/services/avatarService';
  import { isVip, nextRefillIn, refreshEnergy, refillEnergy } from './lib/services/energyService';
  import { purchaseVip, vipOffer } from './lib/services/passService';
  import { beginCampaignGame, buyCampaignTicketPack, getCampaignStatus, finalizeCampaign, markNotificationViewed, settleExpiredCampaigns } from './lib/services/campaignService';
  import { equipPet } from './lib/services/petService';
  import { claimDailyCheckin, getAchievementProgress } from './lib/services/achievementService';
  import { buyGachaBox, buyGachaCoupons, drawGachaBatch, drawGachaBox } from './lib/services/gachaService';
  import { applyMyAisFixture, customizeProfile, loadPlayer, savePlayer } from './lib/services/playerService';
  import { dashboardCampaigns as getDashboardCampaigns, entryHash, formatRemainingTime } from './lib/services/homeService';
  import { buyPointPack, pointPackReward, equipWings, exchangeAisPoints, purchaseShopItem } from './lib/services/walletService';
  import { beginGame, buyPremium, claimAvailablePass, claimPass, currentPass, currentSeason, demoNow, finishGame, ledger, processAchievementEvent, progressMissions, recordPlayTime, seedDemoScenario, settleExpiredPasses, validateConfig, claimRankingReward } from './lib/services/demoService';
  import { passProgress } from './lib/services/battlePassService';
  import type { DemoConfig, DemoReward, DemoScenario, GameId, GameMode, GachaKind, ModalState, Page, PlayerState, RankingPeriod, ShopTab, VipPackage } from './lib/types';
  import './app.css';

  const WEEKDAY_LABELS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  const initialQuery = new URLSearchParams(window.location.search);
  const resetMockRequested = initialQuery.get('resetMock') === '1';
  const queryName = initialQuery.get('name')?.trim().replace(/\s+/g, ' ').slice(0, 40) || null;
  let player = $state<PlayerState>(loadPlayer(
    queryName,
    resetMockRequested,
  ));
  let sessionName = $state(queryName ?? '');
  let hasEntered = $state(!!queryName);
  let mockScores = $derived(player.demo.scores);
  let CHECKIN_REWARD = $derived(player.demo.config.checkinEnergyReward);
  let page = $state<Page>('hub');
  let campaignId = $state('');
  let homeGenre = $state('all');
  let carouselIndex = $state(0);
  let pointsReturnRoute = $state<Page | null>(null);
  let sceneState = $derived(veaseState(player));
  let wardrobeHeight = $state(1000);
  let motionReduced = $state(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const initialGameId = GAMES.find((game) => game.published !== false)!.id;
  let gameId = $state<GameId>(initialGameId);
  let rankingGameId = $state<GameId>(initialGameId);
  let rankingPeriod = $state<RankingPeriod>('allTime');
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
  let pendingNotificationId = $state<string | null>(null);
  let currentGame = $derived(player.demo.config.games.find((game) => game.id === gameId) ?? GAME_BY_ID[gameId]);
  let catalogGames = $derived(player.demo.config.games.filter((game) => game.published !== false).sort((left, right) => (left.displayOrder ?? 99) - (right.displayOrder ?? 99)));
  let hubGames = $derived(homeGenre === 'all' ? catalogGames : catalogGames.filter((game) => game.genre === homeGenre));
  let gameFilters = $derived([{ id: 'all', label: 'ทั้งหมด' }, ...[...new Set(catalogGames.map((game) => game.genre))].map((genre) => ({ id: genre, label: genre }))]);
  let vipActive = $derived(isVip(player, now));
  let activePassSeason = $derived(currentSeason(player, now));
  let activePassState = $derived(currentPass(player, now));
  let activePassProg = $derived(passProgress(activePassState.xp ?? 0));
  let activePassLevel = $derived(activePassProg.level);
  let refillCountdown = $derived(nextRefillIn(player, now));
  let checkedInToday = $derived(player.checkinDates.includes(todayKey(new Date(now))));
  let hasUnreadNotifications = $derived(player.demo.notifications?.some((notification) => !notification.viewed) ?? false);
  let checkinDays = $derived(WEEKDAY_LABELS.map((label, index) => ({
    label,
    done: player.checkinDates.includes(checkinKeyForDay(index)),
    today: index === (new Date(now).getDay() + 6) % 7,
  })));

  let achievements = $derived(getAchievementProgress(player, now));
  let unlockedAchievements = $derived(achievements.filter((item) => item.unlocked));
  let nextAchievement = $derived(achievements.find((item) => !item.unlocked) ?? achievements[0]);
  let latestBadges = $derived((player.demo.achievements ?? []).slice(-3).reverse());

  let vipRemainingLabel = $derived(
    vipActive && player.vipExpiresAt
      ? formatRemainingTime(player.vipExpiresAt, now)
      : 'ยังไม่ได้เปิดใช้งาน'
  );

  let dashboardCampaigns = $derived(getDashboardCampaigns(player, now));

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
    if (window.location.hash && window.location.hash !== '#') handleRoute();
    else navigate(entryHash('').slice(1));
    showPendingNotification();
  }

  function showPendingNotification(): void {
    const notification = player.demo.notifications?.find((item) => !item.viewed);
    if (!notification || modal) return;
    pendingNotificationId = notification.id;
    modal = { kind: 'notice', tone: 'success', title: notification.title, message: `${notification.detail} · ตรวจดูรายละเอียดใน History` };
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

  function recordLoadoutHistory(next: PlayerState, title: string, detail: string): PlayerState {
    const at = demoNow(player);
    return { ...next, demo: { ...next.demo, history: [{ id: crypto.randomUUID(), kind: 'reward' as const, title, detail, at }, ...(next.demo.history ?? [])].slice(0, 250) } };
  }

  function chooseWings(id: string | null) {
    if (player.demo.wingId === id) return;
    const next = equipWings(player, id);
    if (!next) return;
    persist(recordLoadoutHistory(next, id ? 'ใส่ Wing' : 'ถอด Wing', 'เปลี่ยน loadout ใน Profile / pre-game preview'));
    showToast(id ? 'ใส่ปีกแล้ว' : 'ถอดปีกแล้ว');
  }

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
    const confirmedRules: DemoConfig = { ...config, energyMax: 15, regenMinutes: 30, energyCost: 1, continueEnergyCost: 1, vipFreeEntry: true, vipEnergyBonus: 15 };
    const error = validateConfig(confirmedRules);
    if (error) { showToast(error); return; }
    persist({ ...player, demo: { ...player.demo, config: confirmedRules } });
    showToast('บันทึกแล้ว · หน้าผู้เล่นอัปเดตตามการตั้งค่า');
  }

  function resetDemo(): void {
    requestAction('Reset Demo?', 'ล้างข้อมูลเดโมทั้งหมดในเครื่อง แล้วคืนค่าตัวอย่างเริ่มต้น', 'ยืนยัน Reset', () => {
      if (gachaTimer) window.clearTimeout(gachaTimer);
      gachaBusy = false;
      player = { ...loadPlayer(queryName, true), displayName: sessionName };
      now = demoNow(player);
      activeSessionId = '';
      navigate('hub');
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

  function loadScenario(scenario: DemoScenario): void {
    player = seedDemoScenario(player, scenario);
    now = demoNow(player);
    savePlayer(player);
    showToast(`โหลด scenario: ${scenario}`);
    showPendingNotification();
  }

  function simulateFinish(): void {
    flushPlayTime();
    const score = Math.round((MOCK_RANKINGS[gameId]?.[0]?.score ?? 1000) * (0.7 + Math.random() * 0.6));
    const session = player.demo.sessions.find((entry) => entry.id === activeSessionId);
    const reward = session?.reward ?? { points: 0, xp: 40 };
    const next = finishGame(player, activeSessionId, score);
    if (!next) return;
    persist(next, 'จบเกมจำลอง');
    navigate(session?.mode === 'campaign' && session.campaignId ? `campaign/${session.campaignId}` : `detail/${gameId}`);
    modal = { kind: 'mission-progress', score, rewardXp: reward.xp, events: next.demo.recentMissionEvents ?? [] };
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
    if (!route) {
      page = 'hub';
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#hub`);
      window.scrollTo({ top: 0 });
      return;
    }
    if (['battle', 'room', 'world', 'avatar'].includes(route) || (route === 'admin' && !import.meta.env.DEV)) {
      page = 'hub';
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#hub`);
      window.scrollTo({ top: 0 });
      return;
    }
    if (route === 'points' || route === 'wallet' || route === 'gacha') {
      shopTab = 'items';
      page = 'shop';
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#shop`);
      window.scrollTo({ top: 0 });
      return;
    }
    const routes: Page[] = ['home', 'hub', 'shop', 'rewards', 'ranking', 'profile', 'admin', 'campaigns', 'campaign', 'achievements', 'missions', 'inventory', 'history', 'vip'];
    if (route === 'campaign' && requestedGame) {
      campaignId = requestedGame;
      page = 'campaign';
      window.scrollTo({ top: 0 });
      return;
    }
    if (route === 'detail' && requestedGame && player.demo.config.games.some((game) => game.id === requestedGame && game.published !== false)) {
      gameId = requestedGame as GameId;
      page = 'detail';
      window.scrollTo({ top: 0 });
      return;
    }
    if (route === 'game' && requestedGame && player.demo.config.games.some((game) => game.id === requestedGame && game.published !== false)) {
      const sessionId = new URLSearchParams(hashQuery).get('session');
      const session = player.demo.sessions.find((entry) => entry.id === sessionId && entry.gameId === requestedGame);
      if (!session) {
        const params = new URLSearchParams(hashQuery);
        const mode = params.get('mode');
        enterGame(requestedGame as GameId, mode === 'campaign' ? 'campaign' : mode === 'ranked' ? 'ranked' : 'casual', params.get('campaign') ?? undefined);
        return;
      }
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
    page = routes.includes(route as Page) ? route as Page : 'hub';
    window.scrollTo({ top: 0 });
  }

  function enterGame(id: GameId, mode: GameMode = 'casual', selectedCampaignId?: string): void {
    if (player.demo.config.games.find((game) => game.id === id)?.published === false) { showToast('เกมนี้ปิดชั่วคราวโดย Demo Admin'); return; }
    if (mode === 'ranked' && !player.demo.config.battleEnabled) { showToast('Arena ปิดชั่วคราว'); return; }
    const next = mode === 'campaign' && selectedCampaignId ? beginCampaignGame(player, selectedCampaignId, id) : beginGame(player, id, mode);
    if (!next) {
      modal = mode === 'ranked' ? { kind: 'notice', tone: 'warn', title: 'บัตรเข้า Ranked ไม่พอ', message: 'โหมดนี้เป็น legacy demo' } : mode === 'campaign' ? { kind: 'notice', tone: 'warn', title: 'เข้า Campaign ไม่ได้', message: 'ตรวจสอบ Demo Ticket หรือสถานะ Campaign' } : { kind: 'energy-empty' };
      return;
    }
    const sessionId = next.demo.sessions.at(-1)!.id;
    persist(next, mode === 'ranked' ? 'ใช้บัตรเข้า Ranked' : mode === 'campaign' ? 'เข้าเล่น Campaign' : 'เข้าเล่นเกม');
    navigate(`game/${id}?session=${sessionId}&mode=${mode}${mode === 'campaign' ? `&campaign=${selectedCampaignId}` : ''}`);
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
    navigate('vip');
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
    if (pendingNotificationId) {
      player = markNotificationViewed(player, pendingNotificationId);
      savePlayer(player);
      pendingNotificationId = null;
    }
    modal = null;
    showPendingNotification();
  }

  function returnFromPoints(): void {
    const packageId = vipTopUpIntent;
    const returnRoute = pointsReturnRoute;
    vipTopUpIntent = null;
    pointsReturnRoute = null;
    navigate(packageId ? 'rewards' : returnRoute ?? 'hub');
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
    const at = demoNow(player);
    const checkedIn = claimDailyCheckin(player, at);
    if (!checkedIn) return;
    const withAchievement = processAchievementEvent(checkedIn, { type: 'daily_checkin' }, at);
    persist(progressMissions(withAchievement, 'checkin', at), 'Daily check-in');
    modal = { kind: 'checkin-success' };
  }

  function purchaseBox(kind: GachaKind): void {
    requestAction(`ซื้อ ${kind === 'pet' ? 'Pet' : 'Avatar'} Box`, `${player.demo.config.gachaCost} AIS Point · กล่องเปิดได้ 1 ครั้ง · DEMO`, 'ซื้อกล่อง', () => {
      const next = buyGachaBox(player, kind);
      if (!next) { showToast('AIS Point ไม่พอสำหรับซื้อกล่อง'); return; }
      applyAction(next, `ซื้อ ${kind === 'pet' ? 'Pet' : 'Avatar'} Box`);
    });
  }

  function openGachaBox(kind: GachaKind): void {
    if (gachaBusy) return;
    if ((player.demo.gachaBoxes?.[kind] ?? 0) < 1) { showToast('ซื้อกล่องจาก Shop ก่อนเปิดสุ่ม'); return; }
    gachaBusy = true;
    gachaTimer = window.setTimeout(() => {
      const draw = drawGachaBox(player, kind, Math.random, demoNow(player));
      gachaBusy = false;
      if (!draw) { showToast('เปิดกล่องไม่สำเร็จ'); return; }
      persist(draw.player, `เปิด ${kind === 'pet' ? 'Pet' : 'Avatar'} Box`);
      modal = { kind: 'gacha-result', gachaKind: kind, results: [draw.result], paidCoupons: 0, bonusDraws: 0, source: 'box' };
    }, 850);
  }

  function purchasePremiumPass(): void {
    requestAction('ซื้อ Premium Battle Pass', `${player.demo.config.premiumPrice} AIS Point · ปลดล็อกรางวัล Premium ที่ถึงเลเวลแล้ว · ไม่ได้รับ XP เพิ่ม`, 'ยืนยันซื้อ', () => {
      const next = buyPremium(player);
      if (!next) { showToast('ซื้อ Premium Pass ไม่สำเร็จ'); return; }
      applyAction(next, 'ซื้อ Premium Battle Pass');
    });
  }

  function closeCampaign(id: string): void {
    const next = finalizeCampaign(player, id, true);
    if (!next) { showToast('Campaign นี้ปิดหรือจ่ายรางวัลแล้ว'); return; }
    applyAction(next, 'Demo Studio · จำลอง Campaign settlement');
  }

  function requestCampaignPlay(id: GameId, selectedCampaignId?: string): void {
    if (!selectedCampaignId) { navigate(`detail/${id}`); return; }
    const campaign = player.demo.config.campaigns.find((item) => item.id === selectedCampaignId);
    if (!campaign || campaign.launchMode === 'external') return;
    if (campaign.entry === 'ticket') {
      const ticketBalance = player.demo.campaignTickets ?? 0;
      requestAction('ยืนยันเข้า Campaign', `ใช้ Campaign Ticket ${campaign.ticketCost} ใบ · คงเหลือ ${ticketBalance} → ${ticketBalance - campaign.ticketCost} ใบ · ไม่ใช้ Energy · ราคา Ticket เป็น Demo`, 'ยืนยันเข้าเล่น', () => enterGame(id, 'campaign', selectedCampaignId));
      return;
    }
    enterGame(id, 'campaign', selectedCampaignId);
  }

  function confirmVip(): void {
    if (modal?.kind !== 'vip-confirm') return;
    const packageId = modal.packageId;
    const offer = vipOffer(player, packageId, now);
    if (!offer?.eligible) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อ VIP ไม่สำเร็จ', message: 'ตรวจสอบ AIS Point และเงื่อนไขแพ็กที่เลือก' };
      return;
    }
    const selected = player.demo.config.vipPlans.find((plan) => plan.id === packageId);
    const next = purchaseVip(player, packageId, now);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อ VIP ไม่สำเร็จ', message: 'ตรวจสอบ AIS Point และเงื่อนไขแพ็กที่เลือก' };
      return;
    }
    persist(next, `ซื้อ ${selected?.label ?? 'VIP Pass'}`);
    modal = { kind: 'notice', tone: 'success', title: offer.active ? 'ต่ออายุ VIP แล้ว' : 'VIP เปิดใช้งานแล้ว', message: `${selected?.label ?? 'VIP'} · ใช้ได้ถึง ${new Date(next.vipExpiresAt!).toLocaleString('th-TH')} · Battle Pass Premium แยกซื้อ` };
  }

  function confirmRefill(): void {
    if (modal?.kind !== 'refill-confirm') return;
    const refillId = modal.refillId;
    const pack = player.demo.config.energyPacks.find((item) => item.id === refillId);
    if (!pack) return;
    const next = refillEnergy(player, pack.energy, pack.cost, demoNow(player));
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'เติม Energy ไม่สำเร็จ', message: 'ตรวจสอบ AIS Point หรือ Energy ปัจจุบันของคุณ' };
      return;
    }
    persist(next, 'ซื้อ Energy');
    modal = { kind: 'notice', tone: 'success', title: 'เติม Energy สำเร็จ!', message: `ได้รับ Energy +${pack.energy}` };
  }

  function confirmItem(): void {
    if (modal?.kind !== 'item-confirm') return;
    const next = purchaseShopItem(player, modal.itemId);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อไม่สำเร็จ', message: 'AIS Point ไม่พอ หรือมีสินค้านี้แล้ว' };
      return;
    }
    persist(next, 'ซื้อของเข้าคอลเลกชัน');
    modal = { kind: 'notice', tone: 'success', title: 'เพิ่มเข้าคอลเลกชันแล้ว', message: 'เลือกใช้งานได้ที่ Profile & Cosmetics' };
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
    if (player.avatarId === avatarId) return;
    const next = selectAvatar(player, avatarId);
    if (!next) return;
    persist(recordLoadoutHistory(next, 'เปลี่ยน Avatar', 'เลือกใช้ใน Profile / pre-game preview'));
    showToast('เปลี่ยนตัวละครแล้ว');
  }

  function chooseEquipPet(petId: string | null): void {
    if (player.petId === petId) return;
    const next = equipPet(player, petId);
    if (!next) return;
    persist(recordLoadoutHistory(next, petId ? 'ใส่ Pet' : 'ถอด Pet', 'เปลี่ยน loadout ใน Profile / pre-game preview'));
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
      const settled = settleExpiredCampaigns(settleExpiredPasses(player, now), now);
      const refreshed = refreshEnergy(settled, now);
      if (refreshed !== player) { player = refreshed; savePlayer(player); showPendingNotification(); }
    }, 1000);
    window.addEventListener('hashchange', routeChanged);
    document.addEventListener('visibilitychange', flushPlayTime);
    window.addEventListener('pagehide', flushPlayTime);
    if (window.location.hash && window.location.hash !== '#') handleRoute();
    else window.location.hash = entryHash(window.location.hash);
    showPendingNotification();
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
  <EntryPage onEnter={enterSession} />
{:else}
<div class="app-frame" class:world-frame={page === 'world'}>
  {#if page === 'world' || page === 'avatar'}
    <div class={['w-full overflow-hidden', page === 'avatar' ? 'relative z-10 pt-[74px]' : 'fixed top-0 left-1/2 z-0 max-w-[460px] -translate-x-1/2', page !== 'world' && page !== 'avatar' ? 'pointer-events-none' : '']} style:height={page === 'world' ? 'calc(100dvh - 74px - env(safe-area-inset-bottom, 0px))' : page === 'avatar' ? `${wardrobeHeight + 74}px` : '100dvh'}>
      <VeaseFrame {sceneState} route={page} mode={page === 'world' ? 'town' : page === 'avatar' ? 'wardrobe' : 'backdrop'} onSize={(height) => { wardrobeHeight = height; }} onNavigate={navigate} onOutfit={(outfit) => { const next = equipOutfit(player, outfit); if (!next) return null; persist(next, 'เปลี่ยนชุดจาก MV'); return veaseState(player); }} />
    </div>
  {/if}
  {#if page !== 'world' && page !== 'game'}<div class="fixed top-0 left-1/2 z-30 w-full max-w-[460px] -translate-x-1/2 border-b border-white/80 bg-white/80 px-3.5 pt-2 pb-1 backdrop-blur-md"><AppHeader {player} {vipActive} hasUnread={hasUnreadNotifications} countdown={formatCountdown(refillCountdown)} onRefill={() => openRefill()} onShop={() => navigate('shop')} onProfile={() => navigate('profile')} onHistory={() => navigate('history')} /></div>{/if}
  {#if page === 'avatar'}<div class="h-24" aria-hidden="true"></div>{/if}
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
      onBack={() => {
        const session = player.demo.sessions.find((entry) => entry.id === activeSessionId);
        navigate(session?.mode === 'campaign' && session.campaignId ? `campaign/${session.campaignId}` : `detail/${gameId}`);
      }}
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
          {@const activeSlide = dashboardCampaigns[carouselIndex % dashboardCampaigns.length] ?? dashboardCampaigns[0]}
          <div class="home-dashboard">
            <!-- Dashboard Header + Dev Studio Trigger -->
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-[10px] font-black tracking-wider text-[#0284c7] uppercase">LIVE EVENTS & PLAYER STATUS</p>
                <h1 class="text-xl font-black leading-tight text-[#1f305e]">Campaign Dashboard</h1>
              </div>
              <div class="flex items-center gap-1.5">
                <button class="inline-flex min-h-9 items-center gap-1 rounded-full border-2 border-white bg-[#fff6d6] px-3 text-xs font-black text-[#7c4a03] shadow-[0_3px_0_#dfc16b]" onclick={() => navigate('campaigns')}>
                  <Flag size={13} /> ทั้งหมด ({player.demo.config.campaigns.length})
                </button>
                {#if import.meta.env.DEV}
                  <button class="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-white bg-[#e0f2fe] text-[#0284c7] shadow-[0_3px_0_#9bcdf0]" onclick={() => navigate('admin')} aria-label="เปิด Demo Studio" title="Demo Studio">
                    <Settings2 size={17} />
                  </button>
                {/if}
              </div>
            </div>

            <!-- 1. Featured Campaign Carousel (2-4 Themed Events) -->
            {#if activeSlide}
              <section class="campaign-carousel-card" aria-label="Featured Campaigns">
                <div class="campaign-visual-wrap">
                  <img class="campaign-visual-img" src={activeSlide.artwork} alt={activeSlide.title} />
                  <div class="campaign-visual-scrim"></div>

                  <div class="campaign-top-badges">
                    <span class="campaign-status-pill tone-{activeSlide.statusTone}">
                      <Flame size={12} fill="currentColor" /> {activeSlide.statusLabel}
                    </span>
                    <span class="campaign-countdown-pill">
                      <Clock3 size={12} /> {activeSlide.countdownLabel}
                    </span>
                  </div>

                  <div class="campaign-hero-copy">
                    <small class="campaign-theme-eyebrow">{activeSlide.themeTag}</small>
                    <h2 class="campaign-hero-title">{activeSlide.title}</h2>
                    <p class="campaign-hero-sub">{activeSlide.subtitle}</p>
                  </div>
                </div>

                <div class="campaign-carousel-footer">
                  <div class="campaign-reward-strip">
                    <RewardIcon type={activeSlide.rewardPreview.type} itemId={activeSlide.rewardPreview.itemId} boxKind={activeSlide.rewardPreview.boxKind} size={40} />
                    <div class="min-w-0 flex-1">
                      <small class="block text-[10px] font-black tracking-wide text-[#7c5800] uppercase">REWARD PREVIEW · {activeSlide.entryLabel}</small>
                      <strong class="block truncate text-xs font-black text-[#1f305e]">{activeSlide.rewardTitle}</strong>
                    </div>
                  </div>

                  <div class="flex items-center justify-between gap-2 pt-1">
                    <div class="flex items-center gap-1.5" role="tablist" aria-label="เลือกกิจกรรมไฮไลต์">
                      <button
                        class="carousel-step-btn"
                        onclick={() => (carouselIndex = (carouselIndex - 1 + dashboardCampaigns.length) % dashboardCampaigns.length)}
                        aria-label="กิจกรรมก่อนหน้า"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      {#each dashboardCampaigns as slide, idx (slide.id)}
                        <button
                          class="carousel-dot"
                          class:active={idx === carouselIndex % dashboardCampaigns.length}
                          onclick={() => (carouselIndex = idx)}
                          aria-label={`กิจกรรมที่ ${idx + 1}: ${slide.title}`}
                          aria-selected={idx === carouselIndex % dashboardCampaigns.length}
                          role="tab"
                        ></button>
                      {/each}
                      <button
                        class="carousel-step-btn"
                        onclick={() => (carouselIndex = (carouselIndex + 1) % dashboardCampaigns.length)}
                        aria-label="กิจกรรมถัดไป"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>

                    <button class="btn-gold-3d min-h-10 px-4 text-xs" onclick={() => navigate(activeSlide.route)}>
                      {activeSlide.ctaLabel} <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>

                <!-- Mini Thumbnail Strip for Instant Switching -->
                <div class="campaign-thumb-row">
                  {#each dashboardCampaigns as slide, idx (slide.id)}
                    <button
                      class="campaign-mini-pill"
                      class:selected={idx === carouselIndex % dashboardCampaigns.length}
                      onclick={() => (carouselIndex = idx)}
                    >
                      <img src={slide.artwork} alt="" />
                      <span class="truncate">{slide.title}</span>
                    </button>
                  {/each}
                </div>
              </section>
            {/if}

            <!-- 2. Compact Daily Check-in -->
            <DailyCheckinCard compact reward={CHECKIN_REWARD} days={checkinDays} claimed={checkedInToday} onClaim={claimCheckin} />

            <!-- 3. Player Status Grid: VIP Status + Battle Pass Level/XP Progress -->
            <section class="grid grid-cols-2 gap-2.5" aria-label="สถานะผู้เล่น">
              <!-- VIP Status Card -->
              <button
                class="status-card vip-status-card text-left transition-transform active:translate-y-0.5"
                onclick={() => navigate('vip')}
              >
                <div class="flex items-center justify-between gap-1">
                  <span class="inline-flex items-center gap-1 rounded-full bg-[#ffe899] px-2 py-0.5 text-[10px] font-black text-[#784300]">
                    <Crown size={11} fill="currentColor" /> VIP STATUS
                  </span>
                  <span class="status-dot" class:on={vipActive}></span>
                </div>
                <strong class="mt-1.5 block text-sm font-black text-[#593100]">
                  {vipActive ? 'VIP Royal Active' : 'Standard Player'}
                </strong>
                <small class="mt-0.5 block text-[11px] font-extrabold text-[#8a5200]">
                  {vipActive ? `⏱ ${vipRemainingLabel}` : 'MAX 15 → อัปเกรดเป็น 30'}
                </small>
                <div class="mt-2 flex items-center justify-between border-t border-amber-300/60 pt-1.5 text-[10px] font-black text-[#704000]">
                  <span>{vipActive ? 'เข้าเกมปกติฟรี (0 Energy)' : 'เข้าเกมปกติฟรีด้วย VIP'}</span>
                  <ArrowUpRight size={13} />
                </div>
              </button>

              <!-- Battle Pass Level / XP Progress Card -->
              <button
                class="status-card pass-status-card text-left transition-transform active:translate-y-0.5"
                onclick={() => navigate('rewards')}
              >
                <div class="flex items-center justify-between gap-1">
                  <span class="inline-flex items-center gap-1 rounded-full bg-[#dff3ff] px-2 py-0.5 text-[10px] font-black text-[#0369a1]">
                    <Sparkles size={11} /> BATTLE PASS
                  </span>
                  <span class="rounded-full bg-[#1f305e] px-2 py-0.5 text-[10px] font-black text-[#ffd86e]">
                    LV.{activePassLevel}
                  </span>
                </div>
                <strong class="mt-1.5 block truncate text-sm font-black text-[#1f305e]">
                  {activePassSeason.name}
                </strong>
                <div class="mt-1 space-y-1">
                  <div class="flex items-center justify-between text-[10px] font-extrabold text-[#476596]">
                    <span>{activePassState.premium ? 'Premium Unlocked' : 'Free Track'}</span>
                    <span>{activePassProg.complete ? 'MAX' : `${activePassProg.withinLevel}/100 XP`}</span>
                  </div>
                  <progress class="h-2 w-full" value={activePassProg.complete ? 100 : activePassProg.withinLevel} max={100}></progress>
                </div>
                <div class="mt-1.5 flex items-center justify-between border-t border-sky-200/80 pt-1 text-[10px] font-black text-[#0284c7]">
                  <span>รับรางวัล & ทำภารกิจ</span>
                  <ArrowUpRight size={13} />
                </div>
              </button>
            </section>

            <!-- 4. Achievement Updates (Recently Unlocked Badges & Next Milestone) -->
            <section class="card-25d space-y-2.5 p-3.5" aria-label="อัปเดตเหรียญตราและความสำเร็จ">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="grid size-9 place-items-center rounded-xl border-2 border-white bg-gradient-to-b from-[#ffe999] to-[#f59e0b] text-[#5c3400] shadow-[0_2px_0_#b86e00]">
                    <Award size={18} />
                  </span>
                  <div>
                    <p class="text-[10px] font-black tracking-wide text-[#0284c7] uppercase">ACHIEVEMENT UPDATES</p>
                    <h3 class="text-sm font-black text-[#1f305e]">ปลดล็อกแล้ว {unlockedAchievements.length}/{achievements.length} เหรียญตรา</h3>
                  </div>
                </div>
                <button class="inline-flex min-h-8 items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 text-[11px] font-black text-[#0284c7]" onclick={() => navigate('achievements')}>
                  ดูทั้งหมด <ArrowUpRight size={13} />
                </button>
              </div>

              {#if latestBadges.length}
                <div class="flex items-center gap-2 overflow-x-auto pb-0.5">
                  {#each latestBadges as badge (badge.id)}
                    <button
                      class="flex min-w-0 shrink-0 items-center gap-2 rounded-2xl border-2 border-white bg-gradient-to-r from-[#fffdf5] to-[#fff3cc] px-2.5 py-1.5 text-left shadow-xs"
                      onclick={() => navigate('profile')}
                    >
                      <img class="size-8 shrink-0 object-contain drop-shadow-xs" src={BADGE_ARTWORK[badge.id] ?? BADGE_ARTWORK['explorer']} alt={badge.title} />
                      <div class="min-w-0">
                        <small class="block text-[9px] font-black text-[#9a5b00]">NEW UNLOCK</small>
                        <strong class="block truncate text-xs font-black text-[#3b2300]">{badge.title}</strong>
                      </div>
                    </button>
                  {/each}
                </div>
              {:else if nextAchievement}
                <div class="flex items-center gap-2.5 rounded-2xl border border-sky-100 bg-white/90 p-2.5">
                  <img class="size-10 shrink-0 object-contain opacity-90" src={BADGE_ARTWORK[nextAchievement.definition.id] ?? BADGE_ARTWORK['first-finish']} alt={nextAchievement.definition.title} />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between text-xs">
                      <strong class="truncate font-black text-[#1f305e]">{nextAchievement.definition.title}</strong>
                      <span class="font-black text-[#0284c7]">{nextAchievement.progress}/{nextAchievement.definition.target}</span>
                    </div>
                    <p class="truncate text-[11px] font-bold text-[#526c9c]">{nextAchievement.definition.description} · รางวัล {nextAchievement.definition.reward?.title ?? 'เหรียญตราเกียรติยศ'}</p>
                    <progress class="mt-1 h-2 w-full" value={nextAchievement.progress} max={nextAchievement.definition.target}></progress>
                  </div>
                </div>
              {/if}
            </section>

            <!-- 5. Event / Promotion Banner (Collectible Profile Frames & Ranking Showcase) -->
            <div class="promo-showcase-banner">
              <div class="flex items-center gap-3">
                <div class="relative flex -space-x-2 shrink-0">
                  {#each PROFILE_FRAMES.slice(2, 5) as frame (frame.id)}
                    <img class="size-11 object-contain drop-shadow-[0_3px_5px_rgba(20,10,45,0.35)]" src={frame.imagePath} alt={frame.name} />
                  {/each}
                </div>
                <div class="min-w-0 flex-1">
                  <span class="inline-block rounded-full bg-[#ffe58f] px-2 py-0.5 text-[9px] font-black text-[#6e3b00]">NEW COLLECTIBLE COSMETICS</span>
                  <strong class="mt-0.5 block text-sm font-black text-white">กรอบรูปสะสม 5 ระดับ & อวดโฉมบน Ranking</strong>
                  <small class="block text-[11px] font-bold text-sky-100">สะสมกรอบ Common ถึง Legendary ตกแต่งห้อง 3D และ Leaderboard</small>
                </div>
              </div>
              <div class="mt-2.5 grid grid-cols-3 gap-1.5">
                <button class="rounded-xl border border-white/80 bg-white/95 py-1.5 text-center text-[11px] font-black text-[#1f305e] shadow-xs" onclick={() => navigate('profile')}>
                  ตกแต่ง Profile
                </button>
                <button class="rounded-xl border border-white/80 bg-white/95 py-1.5 text-center text-[11px] font-black text-[#1f305e] shadow-xs" onclick={() => navigate('ranking')}>
                  ดูอันดับ Ranking
                </button>
                <button class="rounded-xl border border-white/80 bg-[#ffd45c] py-1.5 text-center text-[11px] font-black text-[#5c3400] shadow-xs" onclick={() => navigate('missions')}>
                  ภารกิจซีซัน
                </button>
              </div>
            </div>
          </div>
        {:else if page === 'hub'}
          <div class="home">
            <SectionHeading eyebrow="ALL PLAYABLE TITLES" title="Game Hub" chip={`${catalogGames.length} เกม`}>{#snippet icon()}<Gamepad2 size={20} />{/snippet}</SectionHeading>
            <div class="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="กรองประเภทเกม">{#each gameFilters as filter (filter.id)}<button class={['min-h-9 shrink-0 rounded-full border-2 px-3.5 text-xs font-black transition-transform active:translate-y-0.5', homeGenre === filter.id ? 'border-white bg-gradient-to-b from-[#4fd1ff] to-[#0284c7] text-white shadow-[0_3px_0_#0369a1]' : 'border-white bg-[#fffdf7] text-[#4f6899] shadow-[0_3px_0_#b9dcf4]']} aria-pressed={homeGenre === filter.id} onclick={() => homeGenre = filter.id}>{filter.label}</button>{/each}</div>
            {#if hubGames.length}<div class="game-list">{#each hubGames as game, index (game.id)}<div class="min-w-0"><GameCard {game} {index} vipActive={vipActive && player.demo.config.vipFreeEntry} energyCost={player.demo.config.energyCost} onclick={() => navigate(`detail/${game.id}`)} /><div class="mt-1.5 flex items-center justify-between rounded-xl border border-white bg-white/85 px-2.5 py-1 text-[10px] font-extrabold text-[#4f6899] shadow-2xs"><span>🏆 {(player.demo.scores[game.id] ?? 0).toLocaleString()}</span><span>{(2400 + index * 731 + (player.demo.playCounts[game.id] ?? 0)).toLocaleString()} plays</span></div></div>{/each}</div>{:else}<p class="card-25d py-8 text-center text-xs font-bold text-[#526c9c]">ไม่มีเกมในหมวดนี้</p>{/if}
          </div>
        {:else if page === 'detail'}
          {#key gameId}<GameDetailPage game={currentGame} {player} {vipActive} score={mockScores[gameId] ?? 0} countdown={formatCountdown(refillCountdown)} onPlay={() => enterGame(gameId)} onBack={() => navigate('hub')} onRefill={() => openRefill()} onAvatar={chooseAvatar} onPet={chooseEquipPet} onWing={chooseWings} onBuyItem={(itemId) => (modal = { kind: 'item-confirm', itemId })} />{/key}
        {:else if page === 'shop'}
          <ShopPage
            {player} {vipActive} countdown={formatCountdown(refillCountdown)} bind:tab={shopTab}
            onBuy={(itemId) => (modal = { kind: 'item-confirm', itemId })}
            onRefill={openRefill}
            onBuyGachaBox={purchaseBox}
            onOpenGachaBox={openGachaBox}
            onVip={openVipConfirm}
          />
        {:else if page === 'achievements'}
          <AchievementPage {player} {now} checkinReward={CHECKIN_REWARD} checkinDays={checkinDays} checkedIn={checkedInToday} onCheckin={claimCheckin} onNavigate={navigate} />
        {:else if page === 'campaigns' || page === 'campaign' || page === 'missions' || page === 'inventory' || page === 'history' || page === 'vip'}
          <MiniGamePages
            {page} {player} {now} {campaignId}
            onNavigate={navigate}
            onPlay={requestCampaignPlay}
            onBuyCampaignTickets={(packId) => {
              const pack = player.demo.config.campaignTicketPacks.find((item) => item.id === packId);
              if (!pack) return;
              requestAction('ซื้อ Campaign Tickets', `${pack.quantity} ใบ · ${pack.cost} AIS Point · ยอดปัจจุบัน ${player.aisPoints} AIS Point · หลังซื้อ ${(player.demo.campaignTickets ?? 0) + pack.quantity} ใบ · Demo`, 'ยืนยันซื้อ', () => applyAction(buyCampaignTicketPack(player, packId), `ซื้อ Campaign Ticket x${pack.quantity}`));
            }}
            onVip={openVipConfirm}
            onPremium={purchasePremiumPass}
            onRefill={openRefill}
            onBuyItem={(itemId) => (modal = { kind: 'item-confirm', itemId })}
            onAvatar={chooseAvatar}
            onPet={chooseEquipPet}
            onWing={chooseWings}
          />
        {:else if page === 'rewards'}
          <PassPage
            {player}
            {now}
            {vipActive}
            onClaim={(index, track) => applyAction(claimPass(player, track, index), 'รับรางวัล Battle Pass แล้ว')}
            onClaimAll={() => applyAction(claimAvailablePass(player), 'รับรางวัลที่ปลดล็อกแล้ว')}
            onVip={openVipConfirm}
            onPremium={purchasePremiumPass}
            onMissions={() => navigate('missions')}
          />
        {:else if page === 'battle'}
          <BattlePage {player} onShop={() => { shopTab = 'items'; navigate('shop'); }} onEnter={(id) => requestAction('เข้า Ranked', 'ใช้บัตรเข้า Ranked 1 ใบ · ไม่ใช้ Energy', 'เข้าเล่น Ranked', () => enterGame(id, 'ranked'))} />
        {:else if page === 'wallet'}
          <WalletPage {player} onShop={openExchange} />
        {:else if page === 'admin'}
          <AdminPage {player} onSave={saveConfig} onReset={resetDemo} onRankingReset={resetRanking} onFinalizeCampaign={closeCampaign}
            onMyAisSnapshot={(balance) => { if (!import.meta.env.DEV) return; const next = applyMyAisFixture(player, balance, import.meta.env.DEV); if (!next) return; player = next; savePlayer(next); showToast('DEV · imported myAIS balance snapshot'); }}
            onClock={(hours) => { const next = { ...player, demo: { ...player.demo, clockOffset: player.demo.clockOffset + hours * 3_600_000 } }; now = demoNow(next); persist(refreshEnergy(next, now), 'เวลาจำลอง · ฟื้น Energy'); showToast('ปรับเวลาจำลองแล้ว'); }}
            onSeedScenario={loadScenario} />
        {:else if page === 'points'}
          <PointShop {player} onBuy={purchasePoints} onBack={returnFromPoints} />
        {:else if page === 'gacha'}
          <PetGacha {player} busy={gachaBusy} onDraw={startGacha} onBuyCoupons={(quantity) => openGachaCouponPurchase(quantity)} />
        {:else if page === 'profile' || page === 'room'}
          {#key page}<ProfilePage {player} {vipActive} editable={true} onAvatar={chooseAvatar} onPet={chooseEquipPet} onWing={chooseWings} onSave={(style, frameId) => applyAction(customizeProfile(player, style, frameId), 'บันทึกโปรไฟล์แล้ว')} />{/key}
        {:else if page === 'ranking'}
          <RankingPage {player} bind:gameId={rankingGameId} bind:period={rankingPeriod} scores={mockScores} onClaim={(id) => applyAction(claimRankingReward(player, id), 'รับรางวัล Ranking แล้ว')} />
        {/if}
      </div>
      </div>
      {/key}
    </main>
  {/if}
  {#if page !== 'game'}<BottomNav {page} />{/if}
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
  onWait={() => { modal = null; navigate('hub'); }}
/>
{/if}

<style>
  .app-frame.world-frame { display: block; width: min(100%, 460px); height: 100dvh; min-height: 100dvh; overflow: hidden; box-shadow: none; }
  @media (orientation: landscape) and (max-height: 500px) and (min-width: 600px) { .app-frame.world-frame { display: none; } }
  .home { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; padding-top: 4px; }
  .home-dashboard { display: grid; grid-template-columns: minmax(0, 1fr); gap: 13px; padding-top: 2px; }
  .game-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }

  .campaign-carousel-card {
    overflow: hidden;
    border-radius: 24px;
    border: 2.5px solid #fff;
    background: linear-gradient(180deg, #ffffff 0%, #f3faff 100%);
    box-shadow: 0 6px 0 #9ccbf0, 0 12px 24px rgba(24, 64, 122, 0.16);
  }
  .campaign-visual-wrap {
    position: relative;
    aspect-ratio: 16 / 9.2;
    width: 100%;
    overflow: hidden;
    background: #142242;
  }
  .campaign-visual-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }
  .campaign-visual-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(12, 22, 48, 0.38) 0%, rgba(12, 22, 48, 0.12) 38%, rgba(12, 22, 48, 0.88) 100%);
  }
  .campaign-top-badges {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .campaign-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.03em;
    border: 1.5px solid #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }
  .campaign-status-pill.tone-live { background: linear-gradient(135deg, #22c55e, #15803d); color: #fff; }
  .campaign-status-pill.tone-tournament { background: linear-gradient(135deg, #f59e0b, #b45309); color: #fff; }
  .campaign-status-pill.tone-external { background: linear-gradient(135deg, #ec4899, #be185d); color: #fff; }
  .campaign-status-pill.tone-limited { background: linear-gradient(135deg, #6366f1, #4338ca); color: #fff; }

  .campaign-countdown-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.55);
    color: #fff8db;
    font-size: 10px;
    font-weight: 800;
    backdrop-filter: blur(4px);
  }
  .campaign-hero-copy {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 10px;
    color: #fff;
  }
  .campaign-theme-eyebrow {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #fde047;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  }
  .campaign-hero-title {
    font-size: 1.15rem;
    font-weight: 900;
    line-height: 1.15;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.55);
  }
  .campaign-hero-sub {
    margin-top: 2px;
    font-size: 11px;
    font-weight: 700;
    color: #e0f2fe;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .campaign-carousel-footer {
    padding: 10px 12px 8px;
    display: grid;
    gap: 6px;
  }
  .campaign-reward-strip {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 9px;
    border-radius: 16px;
    background: linear-gradient(90deg, #fffbeb 0%, #fff3c7 100%);
    border: 1.5px solid #fde68a;
  }
  .carousel-step-btn {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 1.5px solid #bae6fd;
    background: #fff;
    color: #0284c7;
  }
  .carousel-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #cbd5e1;
    transition: all 0.2s ease;
  }
  .carousel-dot.active {
    width: 22px;
    background: #0284c7;
  }
  .campaign-thumb-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 5px;
    padding: 0 10px 10px;
  }
  .campaign-mini-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 6px 3px 3px;
    border-radius: 11px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    font-size: 9.5px;
    font-weight: 800;
    color: #475569;
    min-width: 0;
  }
  .campaign-mini-pill.selected {
    border-color: #0284c7;
    background: #e0f2fe;
    color: #0c4a6e;
    font-weight: 900;
  }
  .campaign-mini-pill img {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .status-card {
    border-radius: 20px;
    border: 2px solid #fff;
    padding: 10px 11px;
  }
  .vip-status-card {
    background: linear-gradient(180deg, #fffdf4 0%, #ffefb8 100%);
    box-shadow: 0 4px 0 #dfb858, 0 8px 16px rgba(180, 125, 20, 0.12);
  }
  .pass-status-card {
    background: linear-gradient(180deg, #ffffff 0%, #e6f5ff 100%);
    box-shadow: 0 4px 0 #9ccbf0, 0 8px 16px rgba(25, 85, 150, 0.12);
  }
  .status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #cbd5e1;
    border: 1.5px solid #fff;
  }
  .status-dot.on {
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
  }

  .promo-showcase-banner {
    border-radius: 22px;
    border: 2px solid #fff;
    padding: 12px;
    background: linear-gradient(125deg, #271745 0%, #1d4ed8 58%, #0284c7 100%);
    box-shadow: 0 5px 0 #8ec5ed, 0 10px 20px rgba(25, 50, 110, 0.2);
  }

  @media (max-width: 350px) {
    .game-list { gap: 9px; }
    .home, .home-dashboard { gap: 11px; }
    .campaign-thumb-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
