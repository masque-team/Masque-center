<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { SvelteDate } from 'svelte/reactivity';
  import { Crown, Gamepad2, Settings2, ArrowUpRight, Trophy, Sparkles, Clock3, Flag, ChevronLeft, ChevronRight, Award, Flame } from '@lucide/svelte';
  import AppHeader from './lib/components/AppHeader.svelte';
  import ScenicHeader from './lib/components/ScenicHeader.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import CurrencyIcon from './lib/components/CurrencyIcon.svelte';
  import DailyCheckinCard from './lib/components/DailyCheckinCard.svelte';
  import GameDetailPage from './lib/pages/GameDetailPage.svelte';
  import GameOverPage from './lib/pages/GameOverPage.svelte';
  import GameCard from './lib/components/GameCard.svelte';
  import GameScreen from './lib/components/GameScreen.svelte';
  import EntryPage from './lib/pages/EntryPage.svelte';
  import ModalHost from './lib/components/ModalHost.svelte';
  import MissionProgressHud from './lib/components/MissionProgressHud.svelte';
  import { achievementHud, checkinHud, type HudNotificationItem } from './lib/services/missionHud';
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
  import HomeDashboard from './lib/pages/HomeDashboard.svelte';
  import VeaseFrame from './lib/components/VeaseFrame.svelte';
  import RewardIcon from './lib/components/RewardIcon.svelte';
  import type { SceneState } from '@masque/vease-protocol';
  import { BADGE_ARTWORK, POINT_PACKS, PROFILE_FRAMES } from './lib/data/config';
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import { MOCK_RANKINGS } from './lib/data/mockRankings';
  import { equipOutfit, selectAvatar } from './lib/services/avatarService';
  import { energyCapacity, isVip, nextRefillIn, refreshEnergy, refillEnergy } from './lib/services/energyService';
  import { purchaseVip, vipOffer } from './lib/services/passService';
  import { beginCampaignGame, buyCampaignTicketPack, finalizeCampaign, markNotificationViewed, settleExpiredCampaigns } from './lib/services/campaignService';
  import { equipPet } from './lib/services/petService';
  import { claimDailyCheckin, getAchievementProgress } from './lib/services/achievementService';
  import { buyGachaBox, buyGachaCoupons, drawGachaBatch, drawGachaBox } from './lib/services/gachaService';
  import { applyMyAisFixture, customizeProfile, loadPlayer, savePlayer } from './lib/services/playerService';
  import { dashboardCampaigns as getDashboardCampaigns, entryHash, formatRemainingTime } from './lib/services/homeService';
  import { buyPointPack, pointPackReward, equipWings, exchangeAisPoints, purchaseShopItem } from './lib/services/walletService';
  import { beginGame, buyPremium, claimAvailablePass, claimPass, currentPass, currentSeason, demoNow, finishGame, ledger, processAchievementEvent, progressMissions, recordPlayTime, seedDemoScenario, settleExpiredPasses, validateConfig, claimRankingReward } from './lib/services/demoService';
  import { passProgress } from './lib/services/battlePassService';
  import type { DemoConfig, DemoScenario, GameId, GameMode, GachaKind, ModalState, Page, PlayerState, RankingPeriod, ShopTab, VipPackage } from './lib/types';
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
  let carouselPaused = $state(false);
  let carouselInteracted = $state(false);
  let swipeStart: { x: number; y: number } | null = null;
  let pointsReturnRoute = $state<Page | null>(null);
  let sceneState = $derived(veaseState(player));
  let wardrobeHeight = $state(1000);
  let motionReduced = $state(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const initialGameId = GAMES.find((game) => game.published !== false)!.id;
  let gameId = $state<GameId>(initialGameId);
  let lastGameResult = $state<{ gameId: GameId; score: number } | null>(null);
  let rankingGameId = $state<GameId>(initialGameId);
  let rankingPeriod = $state<RankingPeriod>('allTime');
  let modal = $state<ModalState>(null);
  let confirmAction = $state<(() => void) | null>(null);
  let hudQueue = $state<HudNotificationItem[]>([]);
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
  let shopTab = $state<ShopTab>('energy');
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
  let festivalCampaigns = $derived(dashboardCampaigns.filter((c) => c.category === 'festival'));
  let competitiveCampaigns = $derived(dashboardCampaigns.filter((c) => c.category === 'competitive'));

  function enqueueHudNotifications(items: HudNotificationItem[]): void {
    if (!items.length) return;
    hudQueue = [...hudQueue, ...items];
  }

  function shiftHudNotification(id: string): void {
    hudQueue = hudQueue.filter((item) => item.id !== id);
  }

  function persist(next = player, label = 'อัปเดตข้อมูล'): void {
    const updates = achievementHud(player, next, demoNow(next));
    enqueueHudNotifications(updates);
    for (const update of updates) {
      if (update.badgeId && !player.demo.achievements.some((badge) => badge.id === update.badgeId)) {
        next = markNotificationViewed(next, `achievement:${update.badgeId}`);
      }
    }
    player = ledger(player, next, label);
    savePlayer(player);
  }

  function enterSession(name: string, avatarId: string): void {
    const displayName = name.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!displayName) return;
    const selected = selectAvatar(player, avatarId);
    if (!selected) return;
    sessionName = displayName;
    player = { ...selected, displayName };
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
    persist(recordLoadoutHistory(next, id ? 'ใส่ Wing' : 'ถอด Wing', 'เปลี่ยนของตกแต่งใน Profile'));
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
    showToast('บันทึกการตั้งค่าแล้ว');
  }

  function resetDemo(): void {
    requestAction('รีเซ็ตข้อมูลเริ่มต้น?', 'ล้างข้อมูลในเครื่อง แล้วคืนค่าเริ่มต้น', 'ยืนยันรีเซ็ต', () => {
      if (gachaTimer) window.clearTimeout(gachaTimer);
      gachaBusy = false;
      player = { ...loadPlayer(queryName, true), displayName: sessionName };
      now = demoNow(player);
      activeSessionId = '';
      navigate('hub');
      showToast('รีเซ็ตข้อมูลแล้ว');
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
    const next = finishGame(player, activeSessionId, score);
    if (!next) return;
    const profileXpGain = next.demo.profileXp - player.demo.profileXp;
    persist(next, 'จบเกม');
    lastGameResult = { gameId, score };
    navigate(session?.mode === 'campaign' && session.campaignId ? `campaign/${session.campaignId}` : `detail/${gameId}`);

    const events = next.demo.recentMissionEvents ?? [];
    const newHudItems: HudNotificationItem[] = [];

    if (events.length) {
      for (const ev of events) {
        newHudItems.push({
          id: crypto.randomUUID(),
          kind: 'mission',
          title: ev.title,
          subtitle: `${ currentGame?.name ?? 'เกม' } · ${score.toLocaleString()} คะแนน`,
          before: ev.before,
          after: ev.after,
          target: ev.target,
          xp: ev.xp,
        });
      }
    } else {
      newHudItems.push({
        id: crypto.randomUUID(),
        kind: 'mission',
        title: `เล่นจบ ${currentGame?.name ?? 'เกม'}`,
        subtitle: `ทำได้ ${score.toLocaleString()} คะแนน`,
        before: 0,
        after: 1,
        target: 1,
        xp: 0,
        rewardText: profileXpGain > 0 ? `+${profileXpGain} Profile XP` : undefined,
      });
    }

    enqueueHudNotifications(newHudItems);
  }

  function leaveGame(): void {
    const session = player.demo.sessions.find((entry) => entry.id === activeSessionId);
    navigate(session?.mode === 'campaign' && session.campaignId ? `campaign/${session.campaignId}` : `detail/${gameId}`);
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
    if (gachaBusy) showToast('เก็บกล่องไว้ในคลังแล้ว');
    if (gachaTimer) window.clearTimeout(gachaTimer);
    gachaTimer = undefined;
    gachaBusy = false;
    modal = null;
    confirmAction = null;
    if (pendingNotificationId) {
      player = markNotificationViewed(player, pendingNotificationId);
      savePlayer(player);
      pendingNotificationId = null;
    }
    const [routePath, hashQuery = ''] = window.location.hash.replace(/^#/, '').split('?');
    const [route, requestedGame] = routePath.split('/');
    if (lastGameResult && (route !== 'detail' || requestedGame !== lastGameResult.gameId)) lastGameResult = null;
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
    if (route === 'vip') {
      shopTab = 'vip';
      page = 'shop';
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
    if (route === 'campaign' && requestedGame && player.demo.config.campaigns.some((campaign) => campaign.id === requestedGame)) {
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
        if (sessionId) {
          navigate(`detail/${requestedGame}`);
          showToast('ไม่พบรอบเล่นนี้ กรุณาเริ่มรอบใหม่');
          return;
        }
        const params = new URLSearchParams(hashQuery);
        const mode = params.get('mode');
        if (mode === 'campaign') {
          const selectedCampaign = params.get('campaign');
          window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#campaign/${selectedCampaign ?? ''}`);
          if (selectedCampaign && player.demo.config.campaigns.some((campaign) => campaign.id === selectedCampaign)) {
            campaignId = selectedCampaign;
            page = 'campaign';
            requestCampaignPlay(requestedGame as GameId, selectedCampaign);
          } else {
            navigate('campaigns');
            showToast('ไม่พบกิจกรรมนี้');
          }
          return;
        }
        enterGame(requestedGame as GameId, mode === 'ranked' ? 'ranked' : 'casual');
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
    const supported = routes.includes(route as Page) && route !== 'campaign' && !requestedGame;
    page = supported ? route as Page : 'hub';
    if (!supported) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#hub`);
      showToast('ไม่พบหน้านี้ กลับไปเลือกเกม');
    }
    window.scrollTo({ top: 0 });
  }

  function enterGame(id: GameId, mode: GameMode = 'casual', selectedCampaignId?: string): void {
    if (player.demo.config.games.find((game) => game.id === id)?.published === false) { showToast('เกมนี้ปิดปรับปรุงชั่วคราว'); return; }
    if (mode === 'ranked' && !player.demo.config.battleEnabled) { showToast('Arena ปิดชั่วคราว'); return; }
    const next = mode === 'campaign' && selectedCampaignId ? beginCampaignGame(player, selectedCampaignId, id) : beginGame(player, id, mode);
    if (!next) {
      modal = mode === 'ranked' ? { kind: 'notice', tone: 'warn', title: 'บัตรเข้า Ranked ไม่พอ', message: 'ตรวจสอบจำนวนบัตรของคุณ' } : mode === 'campaign' ? { kind: 'notice', tone: 'warn', title: 'เข้าแข่งขันไม่ได้', message: 'ตรวจสอบจำนวน Ticket หรือสถานะกิจกรรม' } : { kind: 'energy-empty' };
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

  function openRefill(refillId = 'energy-4'): void {
    modal = { kind: 'refill-confirm', refillId };
  }

  function openVipConfirm(packageId: string): void {
    const offer = vipOffer(player, packageId, now);
    if (!offer?.eligible) {
      showToast(offer?.active ? 'เลือกต่ออายุแพ็กเกจได้' : 'แพ็กเกจนี้ไม่เข้าเงื่อนไข');
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
    confirmAction = null;
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
    navigate(packageId ? 'vip' : returnRoute ?? 'hub');
    if (packageId) openVipConfirm(packageId);
  }

  function purchasePoints(id: string): void {
    const pack = POINT_PACKS.find((item) => item.id === id);
    if (!pack) return;
    requestAction('แลก Masque Points', `ใช้ ${pack.cost} AIS Point เพื่อรับ ${pointPackReward(player, id).toLocaleString()} MP`, 'ยืนยันแลก', () => {
      const next = buyPointPack(player, id);
      applyAction(next, 'แลก Masque Points แล้ว');
      if (next && (vipTopUpIntent || pointsReturnRoute)) returnFromPoints();
    });
  }

  function claimCheckin(): void {
    const before = player;
    const at = demoNow(player);
    const checkedIn = claimDailyCheckin(player, at);
    if (!checkedIn) return;
    const withAchievement = processAchievementEvent(checkedIn, { type: 'daily_checkin' }, at);
    const finalState = progressMissions(withAchievement, 'checkin', at);
    persist(finalState, 'Daily check-in');

    const newHudItems: HudNotificationItem[] = [
      checkinHud(before, finalState, at),
    ];

    for (const ev of finalState.demo.recentMissionEvents ?? []) {
      newHudItems.push({
        id: crypto.randomUUID(),
        kind: 'mission',
        title: ev.title,
        subtitle: 'ภารกิจเช็กอินรายวัน',
        before: ev.before,
        after: ev.after,
        target: ev.target,
        xp: ev.xp,
      });
    }

    enqueueHudNotifications(newHudItems);
  }

  function purchaseBox(kind: GachaKind): void {
    confirmAction = () => {
      const next = buyGachaBox(player, kind);
      if (!next) { showToast('คะแนนไม่พอสำหรับแลกกล่อง'); return; }
      persist(next, `แลก ${kind === 'pet' ? 'Pet' : 'Avatar'} Box`);
      openGachaBox(kind);
    };
    modal = { kind: 'gacha-box-detail', gachaKind: kind };
  }

  function openGachaBox(kind: GachaKind): void {
    if (gachaBusy) return;
    if ((player.demo.gachaBoxes?.[kind] ?? 0) < 1) { showToast('แลกกล่องจาก Shop ก่อนเปิดสุ่ม'); return; }
    gachaBusy = true;
    showToast('กำลังเปิดกล่อง...');
    gachaTimer = window.setTimeout(() => {
      gachaTimer = undefined;
      const draw = drawGachaBox(player, kind, Math.random, demoNow(player));
      gachaBusy = false;
      if (!draw) { showToast('เปิดกล่องไม่สำเร็จ'); return; }
      persist(draw.player, `เปิด ${kind === 'pet' ? 'Pet' : 'Avatar'} Box`);
      modal = { kind: 'gacha-result', gachaKind: kind, results: [draw.result], paidCoupons: 0, bonusDraws: 0, source: 'box' };
    }, 850);
  }

  function purchasePremiumPass(): void {
    confirmAction = () => {
      const next = buyPremium(player);
      if (!next) { showToast('ปลดล็อก Premium Pass ไม่สำเร็จ'); return; }
      applyAction(next, 'ปลดล็อก Premium Battle Pass แล้ว');
    };
    modal = { kind: 'premium-pass-confirm' };
  }

  function closeCampaign(id: string): void {
    const next = finalizeCampaign(player, id, true);
    if (!next) { showToast('Campaign นี้ปิดหรือจ่ายรางวัลแล้ว'); return; }
    applyAction(next, 'สรุปผลรางวัล Campaign แล้ว');
  }

  function requestCampaignPlay(id: GameId, selectedCampaignId?: string): void {
    if (!selectedCampaignId) { navigate(`detail/${id}`); return; }
    const campaign = player.demo.config.campaigns.find((item) => item.id === selectedCampaignId);
    if (!campaign || campaign.launchMode === 'external') return;
    if (campaign.entry === 'ticket') {
      confirmAction = () => enterGame(id, 'campaign', selectedCampaignId);
      modal = { kind: 'campaign-entry-confirm', campaignId: selectedCampaignId, gameId: id };
      return;
    }
    enterGame(id, 'campaign', selectedCampaignId);
  }

  function openCampaignTicketShop(): void {
    confirmAction = null;
    modal = null;
    shopTab = 'items';
    navigate('shop');
  }

  function confirmVip(): void {
    if (modal?.kind !== 'vip-confirm') return;
    const packageId = modal.packageId;
    const offer = vipOffer(player, packageId, now);
    if (!offer?.eligible) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลก VIP ไม่สำเร็จ', message: 'ตรวจสอบคะแนนและเงื่อนไขแพ็กเกจที่เลือก' };
      return;
    }
    const selected = player.demo.config.vipPlans.find((plan) => plan.id === packageId);
    const next = purchaseVip(player, packageId, now);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลก VIP ไม่สำเร็จ', message: 'ตรวจสอบคะแนนและเงื่อนไขแพ็กเกจที่เลือก' };
      return;
    }
    persist(next, `แลก ${selected?.label ?? 'VIP Pass'}`);
    modal = { kind: 'notice', tone: 'success', title: offer.active ? 'ต่ออายุ VIP สำเร็จ' : 'เปิดใช้งาน VIP สำเร็จ', message: `${selected?.label ?? 'VIP'} · ใช้สิทธิ์ได้ถึง ${new Date(next.vipExpiresAt!).toLocaleString('th-TH')}` };
  }

  function confirmRefill(): void {
    if (modal?.kind !== 'refill-confirm') return;
    const refillId = modal.refillId;
    const pack = player.demo.config.energyPacks.find((item) => item.id === refillId);
    if (!pack) return;
    const next = refillEnergy(player, pack.energy, pack.cost, demoNow(player));
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'เติมพลังงานไม่สำเร็จ', message: 'ตรวจสอบคะแนนคงเหลือของคุณ' };
      return;
    }
    persist(next, 'เติม Energy');
    modal = { kind: 'notice', tone: 'success', title: 'เติมพลังงานสำเร็จ!', message: `ได้รับ +${pack.energy} Energy` };
  }

  function confirmItem(): void {
    if (modal?.kind !== 'item-confirm') return;
    const next = purchaseShopItem(player, modal.itemId);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลกไม่สำเร็จ', message: 'คะแนนไม่พอ หรือมีไอเทมนี้ในคลังแล้ว' };
      return;
    }
    persist(next, 'แลกไอเทมเข้าคอลเลกชัน');
    modal = { kind: 'notice', tone: 'success', title: 'เพิ่มเข้าคอลเลกชันแล้ว', message: 'สามารถสวมใส่ได้ทันทีที่หน้าโปรไฟล์' };
  }

  function confirmGachaCoupons(): void {
    if (modal?.kind !== 'gacha-coupon-confirm') return;
    const quantity = modal.quantity;
    const next = buyGachaCoupons(player, quantity);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลกคูปองไม่สำเร็จ', message: 'คะแนนไม่พอ กรุณาตรวจสอบยอดคงเหลือ' };
      return;
    }
    persist(next, `แลกคูปองสุ่ม ${quantity} ใบ`);
    pointsReturnRoute = null;
    modal = { kind: 'notice', tone: 'success', title: 'แลกคูปองสำเร็จ', message: `ได้รับ ${quantity} คูปอง · ใช้ได้ทั้งตู้ Avatar และ Pet` };
  }

  function confirmExchange(): void {
    const amount = exchangeAmount;
    const next = exchangeAisPoints(player, amount);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลกไม่สำเร็จ', message: 'ตรวจสอบจำนวนคะแนนของคุณ' };
      return;
    }
    persist(next, 'แลกคะแนน');
    modal = { kind: 'notice', tone: 'success', title: 'แลกสำเร็จ!', message: `ได้รับ ${amount * player.demo.config.exchangeRate} Masque Points` };
  }

  function chooseAvatar(avatarId: string): void {
    if (player.avatarId === avatarId) return;
    const next = selectAvatar(player, avatarId);
    if (!next) return;
    persist(recordLoadoutHistory(next, 'เปลี่ยน Avatar', 'เลือกใช้ในหน้าโปรไฟล์'));
    showToast('เปลี่ยนตัวละครแล้ว');
  }

  function chooseEquipPet(petId: string | null): void {
    if (player.petId === petId) return;
    const next = equipPet(player, petId);
    if (!next) return;
    persist(recordLoadoutHistory(next, petId ? 'ใส่ Pet' : 'ถอด Pet', 'เปลี่ยนคู่หูในหน้าโปรไฟล์'));
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

    const slideTimer = window.setInterval(() => {
      if (page === 'home' && !carouselPaused && !carouselInteracted && !motionReduced && dashboardCampaigns.length > 1) {
        carouselIndex = (carouselIndex + 1) % dashboardCampaigns.length;
      }
    }, 6000);

    window.addEventListener('hashchange', routeChanged);
    document.addEventListener('visibilitychange', flushPlayTime);
    window.addEventListener('pagehide', flushPlayTime);
    if (window.location.hash && window.location.hash !== '#') handleRoute();
    else window.location.hash = entryHash(window.location.hash);
    showPendingNotification();
    persist(refreshEnergy(player, now));
    return () => {
      window.clearInterval(timer);
      window.clearInterval(slideTimer);
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
  <EntryPage ownedAvatarIds={player.ownedAvatarIds} selectedAvatarId={player.avatarId} onEnter={enterSession} />
{:else}
<div class="app-frame" data-page={page} class:world-frame={page === 'world'}>
  {#if page === 'world' || page === 'avatar'}
    <div class={['w-full overflow-hidden', page === 'avatar' ? 'relative z-10 pt-[74px]' : 'fixed top-0 left-1/2 z-0 max-w-[460px] -translate-x-1/2', page !== 'world' && page !== 'avatar' ? 'pointer-events-none' : '']} style:height={page === 'world' ? 'calc(100dvh - 74px - env(safe-area-inset-bottom, 0px))' : page === 'avatar' ? `${wardrobeHeight + 74}px` : '100dvh'}>
      <VeaseFrame {sceneState} route={page} mode={page === 'world' ? 'town' : page === 'avatar' ? 'wardrobe' : 'backdrop'} onSize={(height) => { wardrobeHeight = height; }} onNavigate={navigate} onOutfit={(outfit) => { const next = equipOutfit(player, outfit); if (!next) return null; persist(next, 'เปลี่ยนชุดจาก MV'); return veaseState(player); }} />
    </div>
  {/if}
  {#if page === 'avatar'}
    <div class="fixed top-0 left-1/2 z-30 w-full max-w-[460px] -translate-x-1/2 border-b border-white/80 bg-white/85 px-3 pt-2 pb-1.5 backdrop-blur-md">
      <AppHeader {player} {vipActive} hasUnread={hasUnreadNotifications} countdown={formatCountdown(refillCountdown)} onRefill={() => openRefill()} onShop={() => navigate('shop')} onProfile={() => navigate('profile')} onHistory={() => navigate('history')} />
    </div>
  {:else if page !== 'world'}
    <ScenicHeader {page} {player} {vipActive} compact={page === 'game'} profileExpanded={page === 'profile'} onBack={page === 'game' ? leaveGame : undefined} hasUnread={hasUnreadNotifications} countdown={formatCountdown(refillCountdown)} onRefill={() => openRefill()} onShop={() => navigate('shop')} onProfile={() => navigate('profile')} onHistory={() => navigate('history')} />
  {/if}

  <!-- Animated Sequential Mission Progress HUD -->
  <MissionProgressHud items={hudQueue} {motionReduced} hidden={page === 'game' || !!modal || (page === 'detail' && lastGameResult?.gameId === gameId)} onDismiss={shiftHudNotification} />

  {#if page === 'avatar'}<div class="h-24" aria-hidden="true"></div>{/if}
  {#if page === 'game'}
    <GameScreen
      game={currentGame}
      {player}
      sessionId={activeSessionId}
      loading={gameLoading}
      fallback={gameFallback}
      version={iframeVersion}
      onLoad={onIframeLoad}
      onError={() => (gameFallback = true)}
      onReload={reloadGame}
      onFinish={simulateFinish}
      finished={player.demo.sessions.find((session) => session.id === activeSessionId)?.finished ?? false}
    />
  {:else if page !== 'world' && page !== 'avatar'}
    <main class="app-main relative z-20">
      {#key page}
      <div class="page-transition page-sheet story-sheet-open relative" in:fly={{ y: motionReduced ? 0 : 14, duration: motionReduced ? 0 : 260 }}>
      <div class="story-sheet-glow" aria-hidden="true"></div>
      <div class="page-shell">
        {#if page === 'home'}
          <HomeDashboard
            {player} {vipActive}
            passLevel={activePassLevel}
            passXp={activePassProg.withinLevel}
            passComplete={activePassProg.complete}
            checkedIn={checkedInToday}
            checkinReward={CHECKIN_REWARD}
            checkinDays={checkinDays}
            games={catalogGames}
            festivals={festivalCampaigns}
            competitions={competitiveCampaigns}
            scores={player.demo.scores}
            playCounts={player.demo.playCounts}
            onNavigate={navigate}
            onCheckin={claimCheckin}
          />
        {:else if page === 'hub'}
          <div class="home">
            <SectionHeading eyebrow="ALL PLAYABLE TITLES" title="Game Hub" chip={`${catalogGames.length} เกม`}>{#snippet icon()}<Gamepad2 size={20} />{/snippet}</SectionHeading>
            <div class="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="กรองประเภทเกม">{#each gameFilters as filter (filter.id)}<button class={['min-h-9 shrink-0 rounded-full border-2 px-3.5 text-xs font-black transition-transform active:translate-y-0.5', homeGenre === filter.id ? 'border-white bg-gradient-to-b from-[#4fd1ff] to-[#0284c7] text-white shadow-[0_3px_0_#0369a1]' : 'border-white bg-[#fffdf7] text-[#4f6899] shadow-[0_3px_0_#b9dcf4]']} aria-pressed={homeGenre === filter.id} onclick={() => homeGenre = filter.id}>{filter.label}</button>{/each}</div>
            {#if hubGames.length}
              <div class="game-list">
                {#each hubGames as game, index (game.id)}
                  <div class="min-w-0">
                    <GameCard
                      {game}
                      {index}
                      vipActive={vipActive && player.demo.config.vipFreeEntry}
                      energyCost={player.demo.config.energyCost}
                      bestScore={player.demo.scores[game.id] ?? 0}
                      playCount={player.demo.playCounts[game.id] ?? 0}
                      onclick={() => navigate(`detail/${game.id}`)}
                    />
                  </div>
                {/each}
              </div>
            {:else}
              <p class="card-25d py-8 text-center text-xs font-bold text-[#526c9c]">ไม่มีเกมในหมวดนี้</p>
            {/if}
          </div>
        {:else if page === 'detail' && lastGameResult?.gameId === gameId}
          <GameOverPage game={currentGame} {player} score={lastGameResult.score} bestScore={mockScores[gameId] ?? 0} onReplay={() => enterGame(gameId)} onHome={() => navigate('home')} />
        {:else if page === 'detail'}
          {#key gameId}<GameDetailPage game={currentGame} {player} {vipActive} score={mockScores[gameId] ?? 0} onPlay={() => enterGame(gameId)} onAvatar={chooseAvatar} onPet={chooseEquipPet} onWing={chooseWings} onBuyItem={(itemId) => (modal = { kind: 'item-confirm', itemId })} />{/key}
        {:else if page === 'shop'}
          <ShopPage
            {player} {vipActive} countdown={formatCountdown(refillCountdown)} bind:tab={shopTab}
            onBuy={(itemId) => (modal = { kind: 'item-confirm', itemId })}
            onRefill={openRefill}
            onBuyGachaBox={purchaseBox}
            onOpenGachaBox={openGachaBox}
            onBuyCampaignTickets={(packId) => {
              const pack = player.demo.config.campaignTicketPacks.find((item) => item.id === packId);
              if (!pack) return;
              confirmAction = () => applyAction(buyCampaignTicketPack(player, packId), `แลกตั๋วแข่งขัน +${pack.quantity} ใบแล้ว`);
              modal = { kind: 'ticket-pack-confirm', packId };
            }}
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
              confirmAction = () => applyAction(buyCampaignTicketPack(player, packId), `แลกตั๋วแข่งขัน +${pack.quantity} ใบแล้ว`);
              modal = { kind: 'ticket-pack-confirm', packId };
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
  onOpenTicketShop={openCampaignTicketShop}
/>
{/if}

<style>
  .app-frame.world-frame { display: block; width: min(100%, 460px); height: 100dvh; min-height: 100dvh; overflow: hidden; box-shadow: none; }
  @media (orientation: landscape) and (max-height: 500px) and (min-width: 600px) { .app-frame.world-frame { display: none; } }
  .home { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; padding-top: 4px; }
  .game-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media (max-width: 350px) {
    .game-list { gap: 9px; }
    .home { gap: 11px; }
  }
</style>
