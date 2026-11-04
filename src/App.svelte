<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { SvelteDate } from 'svelte/reactivity';
  import { Crown, Gamepad2, Settings2, ArrowUpRight } from '@lucide/svelte';
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
  import MiniGamePages from './lib/pages/MiniGamePages.svelte';
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
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import { MOCK_RANKINGS } from './lib/data/mockRankings';
  import { equipOutfit, selectAvatar } from './lib/services/avatarService';
  import { isVip, nextRefillIn, refreshEnergy, refillEnergy } from './lib/services/energyService';
  import { purchaseVip, vipOffer } from './lib/services/passService';
  import { beginCampaignGame, finalizeCampaign, markNotificationViewed } from './lib/services/campaignService';
  import { equipPet } from './lib/services/petService';
  import { buyGachaBox, buyGachaCoupons, drawGachaBatch, drawGachaBox } from './lib/services/gachaService';
  import { customizeProfile, loadPlayer, parseAisPointSeed, savePlayer } from './lib/services/playerService';
  import { buyArenaTickets, buyPointPack, pointPackReward, equipWings, exchangeAisPoints, purchaseShopItem } from './lib/services/walletService';
  import { beginGame, buyPremium, claimAvailablePass, claimPass, claimPassBonus, claimMission as completeMission, claimWeeklyMission, currentSeason, demoNow, finishGame, ledger, progressMissions, recordPlayTime, seedDemoScenario, settleExpiredPasses, validateConfig, claimRankingReward } from './lib/services/demoService';
  import type { DemoConfig, DemoScenario, GameId, GameMode, GachaKind, ModalState, Page, PlayerState, RankingPeriod, ShopTab, VipPackage } from './lib/types';
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
  let campaignId = $state('');
  let homeGenre = $state('all');
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
  let homeAvatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let featuredGame = $derived(player.demo.config.games.find((game) => game.featured && game.published !== false) ?? player.demo.config.games.find((game) => game.published !== false) ?? GAMES[0]);
  let catalogGames = $derived(player.demo.config.games.filter((game) => game.published !== false).sort((left, right) => (left.displayOrder ?? 99) - (right.displayOrder ?? 99)));
  let filteredGames = $derived(homeGenre === 'all' ? catalogGames.filter((game) => game.id !== featuredGame.id) : catalogGames.filter((game) => game.genre === homeGenre));
  let hubGames = $derived(homeGenre === 'all' ? catalogGames : catalogGames.filter((game) => game.genre === homeGenre));
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
    showPendingNotification();
  }

  function showPendingNotification(): void {
    const notification = player.demo.notifications?.find((item) => !item.viewed);
    if (!notification || modal) return;
    pendingNotificationId = notification.id;
    modal = { kind: 'notice', tone: 'success', title: notification.title, message: `${notification.detail} · ของรางวัลเข้ากระเป๋าแล้ว ตรวจดูได้ใน History` };
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
    const missionSummary = next.demo.recentMissionEvents?.map((event) => `${event.title} ${event.before}/${event.target} → ${event.after}/${event.target}${event.xp ? ` (+${event.xp} XP)` : ''}`).join(' · ');
    modal = { kind: 'notice', tone: 'success', title: 'SIMULATED · เล่นจบแล้ว', message: `${score} คะแนน · +${reward.xp} EXP${reward.points ? ` · +${reward.points} AIS Point` : ''} · ${missionSummary || 'อัปเดต Mission progress แล้ว'}` };
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
    if (route === 'points' || route === 'wallet' || route === 'gacha') {
      shopTab = route === 'points' || route === 'wallet' ? 'exchange' : 'items';
      page = 'shop';
      window.scrollTo({ top: 0 });
      return;
    }
    const routes: Page[] = ['home', 'hub', 'world', 'shop', 'rewards', 'ranking', 'avatar', 'profile', 'room', 'battle', 'admin', 'wallet', 'points', 'gacha', 'campaigns', 'campaign', 'missions', 'inventory', 'history', 'vip'];
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
    page = routes.includes(route as Page) ? route as Page : 'home';
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
    const checkedIn = { ...player, checkinDates: [...player.checkinDates, todayKey()], aisPoints: player.aisPoints + CHECKIN_REWARD };
    persist(progressMissions(checkedIn, 'checkin'), 'Daily check-in');
    modal = { kind: 'checkin-success' };
  }

  function mockAisTopUp(amount: number): void {
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    applyAction({ ...player, aisPoints: player.aisPoints + amount }, `DEMO · เติม AIS Point +${amount}`);
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
    const next = finalizeCampaign(player, id);
    if (!next) { showToast('Campaign นี้ปิดหรือจ่ายรางวัลแล้ว'); return; }
    applyAction(next, 'ปิด Campaign · จำลอง settlement');
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
      const settled = settleExpiredPasses(player, now);
      const refreshed = refreshEnergy(settled, now);
      if (refreshed !== player) { player = refreshed; savePlayer(player); }
    }, 1000);
    window.addEventListener('hashchange', routeChanged);
    document.addEventListener('visibilitychange', flushPlayTime);
    window.addEventListener('pagehide', flushPlayTime);
    if (window.location.hash) handleRoute();
    else window.location.hash = '#home';
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
  <EntryPage {aisPointSeed} onEnter={enterSession} />
{:else}
<div class="app-frame" class:world-frame={page === 'world'}>
  {#if page === 'world' || page === 'avatar'}
    <div class={['w-full overflow-hidden', page === 'avatar' ? 'relative z-10 pt-[74px]' : 'fixed top-0 left-1/2 z-0 max-w-[460px] -translate-x-1/2', page !== 'world' && page !== 'avatar' ? 'pointer-events-none' : '']} style:height={page === 'world' ? 'calc(100dvh - 74px - env(safe-area-inset-bottom, 0px))' : page === 'avatar' ? `${wardrobeHeight + 74}px` : '100dvh'}>
      <VeaseFrame {sceneState} route={page} mode={page === 'world' ? 'town' : page === 'avatar' ? 'wardrobe' : 'backdrop'} onSize={(height) => { wardrobeHeight = height; }} onNavigate={navigate} onOutfit={(outfit) => { const next = equipOutfit(player, outfit); if (!next) return null; persist(next, 'เปลี่ยนชุดจาก MV'); return veaseState(player); }} />
    </div>
  {/if}
  {#if page !== 'world' && page !== 'game'}<div class="fixed top-0 left-1/2 z-30 w-full max-w-[460px] -translate-x-1/2 border-b border-white/80 bg-white/80 px-3.5 pt-2 pb-1 backdrop-blur-md"><AppHeader {player} {vipActive} countdown={formatCountdown(refillCountdown)} onRefill={() => openRefill()} onShop={() => navigate('shop')} onProfile={() => navigate('profile')} /></div>{/if}
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
          <div class="home">
            <AvatarGreeting avatarId={homeAvatar.id} petId={player.petId} displayName={player.displayName} onAvatarClick={() => navigate('profile')} />
            <DailyCheckinCard compact reward={CHECKIN_REWARD} days={checkinDays} claimed={checkedInToday} onClaim={claimCheckin} />
            <div class="flex items-center justify-between gap-3 pt-2"><div class="flex min-w-0 items-center gap-2.5"><img class="size-12 shrink-0 object-contain" src="assets/brand/masque-game-center-symbol.png" alt="" /><div><p class="text-[10px] font-extrabold text-sky-700">MASQUE <span class="ml-1 rounded border border-sky-300 bg-white/80 px-1.5 text-[9px]">DEMO</span></p><h1 class="text-xl font-black leading-tight text-[#2b2468]">Game Center</h1></div></div>{#if import.meta.env.DEV}<button class="grid size-10 shrink-0 place-items-center rounded-md border border-white bg-white/80 text-sky-700" onclick={() => navigate('admin')} aria-label="เปิด Demo Studio" title="Demo Studio"><Settings2 size={18} /></button>{/if}</div>
            {#if homeGenre === 'all'}<section class="block">
              <FeaturedGameCard game={featuredGame} vipActive={vipActive && player.demo.config.vipFreeEntry} energyCost={player.demo.config.energyCost} onclick={() => navigate(`detail/${featuredGame.id}`)} />
              <p class="mt-3 flex items-center justify-between px-1 text-xs text-[var(--g-muted)]"><span>Personal Best · SIMULATED</span><strong>{(player.demo.scores[featuredGame.id] ?? 0).toLocaleString()}</strong></p>
            </section>{/if}
            <button class="flex min-h-14 w-full items-center gap-3 border-y border-amber-200/80 bg-[#fff7df]/75 px-3 text-left" onclick={() => navigate('vip')}><Crown size={20} class="shrink-0 text-amber-700" fill="currentColor" /><span class="min-w-0 flex-1"><strong class="block text-sm text-[#59400d]">VIP · {vipActive ? 'ใช้งานอยู่' : 'เข้าเกมปกติฟรี · Energy MAX 30'}</strong><small class="block text-[11px] text-[#816d43]">{vipActive ? `Energy MAX 30 · หมดอายุ ${new Date(player.vipExpiresAt!).toLocaleDateString('th-TH')}` : 'Energy MAX 15 → 30 ระหว่าง VIP · ราคา AIS Point เดโม'}</small></span><ArrowUpRight size={17} class="shrink-0 text-amber-800" /></button>
            <div class="space-y-2 border-y border-white/80 py-3"><div class="flex justify-between text-xs"><span>LV.{player.level} · Profile EXP</span><strong>{player.demo.profileXp % 100} / 100</strong></div><progress class="h-1.5 w-full accent-sky-600" value={player.demo.profileXp % 100} max="100" aria-label="Profile EXP"></progress></div>
            <nav class="grid grid-cols-2 gap-2 py-2" aria-label="กิจกรรม">
              {#each [{ route: 'hub', label: 'Game Hub' }, { route: 'campaigns', label: 'Campaign' }, { route: 'ranking', label: 'Ranking' }, { route: 'missions', label: 'Missions' }, { route: 'rewards', label: 'Battle Pass' }, { route: 'vip', label: 'VIP' }, { route: 'shop', label: 'Shop' }, { route: 'inventory', label: 'Inventory' }, { route: 'history', label: 'History' }] as item (item.route)}<button class="flex min-h-12 items-center justify-between gap-2 border-b border-white/80 bg-white/45 px-3 text-left text-sm font-bold text-[#2b4160]" onclick={() => navigate(item.route)}>{item.label}<ArrowUpRight size={17} class="shrink-0" />{#if item.route === 'history' && player.demo.notifications?.some((notification) => !notification.viewed)}<span class="size-2 rounded-full bg-rose-500" aria-label="มีการแจ้งเตือนใหม่"></span>{/if}</button>{/each}
            </nav>
            <button class="flex w-full items-center justify-between gap-3 border-y border-white bg-white/35 px-2 py-3 text-left" onclick={() => navigate('rewards')}><span><small class="text-sky-700">CURRENT SEASON</small><strong class="block">{activePassSeason.name}</strong></span><ArrowUpRight size={22} /></button>
          </div>
        {:else if page === 'hub'}
          <div class="home">
            <SectionHeading eyebrow="ALL PLAYABLE TITLES" title="Game Hub" chip={`${catalogGames.length} เกม`}>{#snippet icon()}<Gamepad2 size={20} />{/snippet}</SectionHeading>
            <div class="flex gap-1 overflow-x-auto pb-2" role="group" aria-label="กรองประเภทเกม">{#each gameFilters as filter (filter.id)}<button class={['min-h-9 shrink-0 rounded-md border px-3 text-[10px] font-semibold', homeGenre === filter.id ? 'border-sky-500 bg-sky-600 text-white' : 'border-white bg-white/70 text-[#71839a]']} aria-pressed={homeGenre === filter.id} onclick={() => homeGenre = filter.id}>{filter.label}</button>{/each}</div>
            {#if hubGames.length}<div class="game-list">{#each hubGames as game, index (game.id)}<div class="min-w-0"><GameCard {game} {index} vipActive={vipActive && player.demo.config.vipFreeEntry} energyCost={player.demo.config.energyCost} onclick={() => navigate(`detail/${game.id}`)} /><p class="mt-2 grid gap-1 px-1 text-[10px] text-[var(--g-muted)]"><span>Personal Best · {(player.demo.scores[game.id] ?? 0).toLocaleString()}</span><span>{12 + index * 7} online · {(2400 + index * 731).toLocaleString()} plays · MOCK</span></p></div>{/each}</div>{:else}<p class="py-8 text-center text-xs text-[var(--g-muted)]">ไม่มีเกมในหมวดนี้</p>{/if}
          </div>
        {:else if page === 'detail'}
          {#key gameId}<GameDetailPage game={currentGame} {player} {vipActive} score={mockScores[gameId] ?? 0} countdown={formatCountdown(refillCountdown)} onPlay={() => enterGame(gameId)} onBack={() => navigate('home')} onRefill={() => openRefill()} onAvatar={() => navigate('avatar')} />{/key}
        {:else if page === 'shop'}
          <ShopPage
            {player} {vipActive} countdown={formatCountdown(refillCountdown)} bind:tab={shopTab}
            onBuy={(itemId) => (modal = { kind: 'item-confirm', itemId })}
            onRefill={openRefill}
            onBuyTickets={(quantity) => requestAction('ซื้อ Demo Ranked Ticket', `${quantity} ใบ · ${quantity * player.demo.config.arenaTicketPrice} AIS Point`, 'ยืนยันซื้อ', () => applyAction(buyArenaTickets(player, quantity), 'ซื้อ Demo Ranked Ticket แล้ว'))}
            onBuyGachaCoupons={(quantity) => openGachaCouponPurchase(quantity, 'shop')}
            onBuyGachaBox={purchaseBox}
            onOpenGachaBox={openGachaBox}
            onVip={openVipConfirm}
            onMockAisTopUp={mockAisTopUp}
          />
        {:else if page === 'campaigns' || page === 'campaign' || page === 'missions' || page === 'inventory' || page === 'history' || page === 'vip'}
          <MiniGamePages
            {page} {player} {now} {campaignId}
            onNavigate={navigate}
            onPlay={(id, selectedCampaignId) => selectedCampaignId ? enterGame(id, 'campaign', selectedCampaignId) : navigate(`detail/${id}`)}
            onFinalize={closeCampaign}
            onVip={openVipConfirm}
            onPremium={purchasePremiumPass}
            onAisTopUp={mockAisTopUp}
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
            onBonus={() => applyAction(claimPassBonus(player), 'รับโบนัส Pass แล้ว')}
            onVip={openVipConfirm}
            onMission={(id) => applyAction(completeMission(player, id), 'รับรางวัลภารกิจแล้ว')}
            onWeekly={() => applyAction(claimWeeklyMission(player), 'รับ XP ประจำสัปดาห์แล้ว')}
            onPlay={(id) => navigate(id ? `detail/${id}` : 'home')}
            onPremium={purchasePremiumPass}
            onMissions={() => navigate('missions')}
          />
        {:else if page === 'battle'}
          <BattlePage {player} onShop={() => { shopTab = 'items'; navigate('shop'); }} onEnter={(id) => requestAction('เข้า Ranked', 'ใช้บัตรเข้า Ranked 1 ใบ · ไม่ใช้ Energy', 'เข้าเล่น Ranked', () => enterGame(id, 'ranked'))} />
        {:else if page === 'wallet'}
          <WalletPage {player} onShop={openExchange} />
        {:else if page === 'admin'}
          <AdminPage {player} onSave={saveConfig} onReset={resetDemo} onRankingReset={resetRanking}
            onClock={(hours) => { const next = { ...player, demo: { ...player.demo, clockOffset: player.demo.clockOffset + hours * 3_600_000 } }; now = demoNow(next); persist(refreshEnergy(next, now), 'เวลาจำลอง · ฟื้น Energy'); showToast('ปรับเวลาจำลองแล้ว'); }}
            onSeed={() => applyAction({ ...player, aisPoints: player.aisPoints + 500 }, 'DEMO · เติม AIS Point')}
            onSeedScenario={loadScenario} />
        {:else if page === 'points'}
          <PointShop {player} onBuy={purchasePoints} onBack={returnFromPoints} />
        {:else if page === 'gacha'}
          <PetGacha {player} busy={gachaBusy} onDraw={startGacha} onBuyCoupons={(quantity) => openGachaCouponPurchase(quantity)} />
        {:else if page === 'profile' || page === 'room'}
          {#key page}<ProfilePage {player} editable={true} onAvatar={chooseAvatar} onPet={chooseEquipPet} onWing={chooseWings} onSave={(style, frameId) => applyAction(customizeProfile(player, style, frameId), 'บันทึกโปรไฟล์แล้ว')} />{/key}
        {:else if page === 'ranking'}
          <RankingPage {player} bind:gameId={rankingGameId} bind:period={rankingPeriod} scores={mockScores} onClaim={(id) => applyAction(claimRankingReward(player, id), 'รับรางวัล Ranking แล้ว')} />
        {/if}
      </div>
      </div>
      {/key}
    </main>
  {/if}
  {#if page !== 'game'}<BottomNav {page} />{/if}
  {#if false}<button class="fixed z-30 flex min-h-13 items-center gap-2.5 rounded-full border-2.5 border-white bg-gradient-to-r from-[#fff8db] via-[#ffe89e] to-[#ffd26a] pr-4 pl-2 text-[#5c3600] shadow-[0_5px_0_#c98c24,0_8px_18px_rgba(90,50,150,0.26)] transition-transform hover:scale-105 active:translate-y-0.5 active:scale-95 motion-reduce:transition-none" style:bottom={page === 'world' ? '220px' : 'calc(88px + env(safe-area-inset-bottom))'} style:right="max(14px, calc((100vw - 460px) / 2 + 14px))" title="ไปตู้สุ่ม Avatar / Pet" aria-label="ไปตู้สุ่ม Avatar / Pet" onclick={() => navigate('gacha')}><span class="relative grid size-10 place-items-center rounded-full border-2 border-white bg-gradient-to-b from-white to-[#dff3ff] shadow-inner"><img class="size-8 object-contain drop-shadow-[0_2px_3px_rgba(60,40,120,0.28)]" src="assets/gacha/gacha-capsule.png" alt="" />{#if player.gachaTickets > 0}<span class="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-white bg-rose-500 text-[9px] font-black text-white shadow-xs">{player.gachaTickets}</span>{/if}</span><span class="grid text-left leading-tight"><strong class="text-xs font-black text-[#3b2166]">ตู้สุ่ม Avatar / Pet</strong><small class="text-[9px] font-extrabold text-[#8a5209]">✨ สุ่ม 1 หรือ 10+1 ครั้ง</small></span></button>{/if}
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
