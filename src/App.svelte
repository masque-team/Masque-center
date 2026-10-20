<script lang="ts">
  import { onMount } from 'svelte';
  import { Flame, Gamepad2 } from '@lucide/svelte';
  import AppHeader from './lib/components/AppHeader.svelte';
  import BattlePassPromo from './lib/components/BattlePassPromo.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import DailyCheckinCard from './lib/components/DailyCheckinCard.svelte';
  import GameDetailPage from './lib/pages/GameDetailPage.svelte';
  import FeaturedGameCard from './lib/components/FeaturedGameCard.svelte';
  import GameCard from './lib/components/GameCard.svelte';
  import GameScreen from './lib/components/GameScreen.svelte';
  import ModalHost from './lib/components/ModalHost.svelte';
  import SectionHeading from './lib/components/SectionHeading.svelte';
  import Toast from './lib/components/Toast.svelte';
  import AvatarPage from './lib/pages/AvatarPage.svelte';
  import PassPage from './lib/pages/PassPage.svelte';
  import ProfilePage from './lib/pages/ProfilePage.svelte';
  import RankingPage from './lib/pages/RankingPage.svelte';
  import RoomPage from './lib/pages/RoomPage.svelte';
  import ShopPage from './lib/pages/ShopPage.svelte';
  import WorldPage from './lib/pages/WorldPage.svelte';
  import { AVATARS, PETS, BATTLE_PASS, ENERGY_CONFIG, PET_GACHA_COST } from './lib/data/config';
  import AssetPortrait from './lib/components/AssetPortrait.svelte';
  import { GAMES, GAME_BY_ID } from './lib/data/games';
  import { battlePassLevel } from './lib/services/battlePassService';
  import { selectAvatar } from './lib/services/avatarService';
  import { isVip, nextRefillIn, refreshEnergy, refillEnergy, spendGameEnergy } from './lib/services/energyService';
  import { purchaseVip } from './lib/services/passService';
  import { drawPet, equipPet } from './lib/services/petService';
  import { loadPlayer, parseAisPointSeed, savePlayer } from './lib/services/playerService';
  import { addMockMissionXp, claimBattlePassReward } from './lib/services/rewardService';
  import { createRoomCode } from './lib/services/roomService';
  import { exchangeAisPoints, purchaseShopItem } from './lib/services/walletService';
  import type { GameId, ModalState, Page, PlayerState, RankingPeriod, ShopTab, VipPackage } from './lib/types';
  import './app.css';

  const mockScores: Record<GameId, number> = { bird: 47, mole: 1250, run: 640, fruit: 780, timber: 320, duck: 520, memory: 18 };
  const CHECKIN_REWARD = 35;
  const WEEKDAY_LABELS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
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
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let shopTab = $state<ShopTab>('items');
  let exchangeAmount = $state(1);
  let roomCode = $state('');
  let joinCode = $state('');
  let roomCreated = $state(false);
  let gachaBusy = $state(false);
  let pendingEnergyEntry = $state(false);
  let toast = $state('');
  let currentGame = $derived(GAME_BY_ID[gameId]);
  let homeAvatar = $derived(AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0]);
  let homePet = $derived(PETS.find((item) => item.id === player.petId));
  let featuredGame = $derived(GAMES.find((game) => game.featured) ?? GAMES[0]);
  let catalogGames = $derived(GAMES.filter((game) => game.id !== featuredGame.id).sort((left, right) => (left.displayOrder ?? 99) - (right.displayOrder ?? 99)));
  let vipActive = $derived(isVip(player, now));
  let passLevel = $derived(battlePassLevel(player));
  let passCompleted = $derived(player.battlePassXp >= BATTLE_PASS.totalLevels * BATTLE_PASS.xpPerLevel);
  let passXp = $derived(passCompleted ? BATTLE_PASS.xpPerLevel : player.battlePassXp % BATTLE_PASS.xpPerLevel);
  let refillCountdown = $derived(nextRefillIn(player, now));
  let checkedInToday = $derived(player.checkinDates.includes(todayKey(new Date(now))));
  let dailyPlayed = $derived(player.claimedMissions.includes(`daily-played-${todayKey(new Date(now))}`));
  let dailyClaimed = $derived(player.claimedMissions.includes(`daily-${todayKey(new Date(now))}`));
  let checkinDays = $derived(WEEKDAY_LABELS.map((label, index) => ({
    label,
    done: player.checkinDates.includes(checkinKeyForDay(index)),
    today: index === (new Date(now).getDay() + 6) % 7,
  })));
  let vipUntil = $derived(player.vipExpiresAt ? new Date(player.vipExpiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '');

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
    const routes: Page[] = ['home', 'world', 'shop', 'rewards', 'ranking', 'avatar', 'profile', 'room'];
    if (route === 'detail' && requestedGame && Object.hasOwn(GAME_BY_ID, requestedGame)) {
      gameId = requestedGame as GameId;
      page = 'detail';
      pendingEnergyEntry = false;
      window.scrollTo({ top: 0 });
      return;
    }
    if (route === 'game' && requestedGame && requestedGame in GAME_BY_ID) {
      if (!pendingEnergyEntry) {
        const next = spendGameEnergy(player, now);
        if (!next) {
          page = 'home';
          modal = { kind: 'energy-empty' };
          return;
        }
        persist(next);
      }
      pendingEnergyEntry = false;
      page = 'game';
      gameId = requestedGame as GameId;
      recordDailyGameEntry();
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
    window.scrollTo({ top: 0 });
  }

  function enterGame(id: GameId): void {
    const next = spendGameEnergy(player, now);
    if (!next) {
      modal = { kind: 'energy-empty' };
      return;
    }
    persist(next);
    pendingEnergyEntry = true;
    navigate(`game/${id}`);
  }

  function recordDailyGameEntry(): void {
    const missionId = `daily-played-${todayKey()}`;
    if (!player.claimedMissions.includes(missionId)) {
      persist({ ...player, claimedMissions: [...player.claimedMissions, missionId] });
    }
  }

  function openRefill(refillId = 'small'): void {
    modal = { kind: 'refill-confirm', refillId };
  }

  function openVipConfirm(packageId: string): void {
    modal = { kind: 'vip-confirm', packageId: packageId as VipPackage['id'] };
  }

  function openVipShop(): void {
    shopTab = 'vip';
    navigate('shop');
  }

  function openExchange(): void {
    modal = null;
    shopTab = 'exchange';
    navigate('shop');
  }

  function claimCheckin(): void {
    if (player.checkinDates.includes(todayKey())) return;
    persist({ ...player, checkinDates: [...player.checkinDates, todayKey()], masquePoints: player.masquePoints + CHECKIN_REWARD });
    modal = { kind: 'checkin-success' };
  }

  function confirmVip(): void {
    if (modal?.kind !== 'vip-confirm') return;
    const next = purchaseVip(player, modal.packageId, now);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อ VIP ไม่สำเร็จ', message: 'Masque Points ไม่เพียงพอ' };
      return;
    }
    persist(next);
    modal = { kind: 'notice', tone: 'success', title: 'VIP เปิดใช้งานแล้ว!', message: 'Energy ไม่จำกัด พร้อมปลดล็อกรางวัลและภารกิจ VIP' };
  }

  function confirmRefill(): void {
    if (modal?.kind !== 'refill-confirm') return;
    const refillId = modal.refillId;
    const pack = ENERGY_CONFIG.refillPacks.find((item) => item.id === refillId);
    if (!pack) return;
    const next = refillEnergy(player, pack.energy, pack.cost);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'เติม Energy ไม่สำเร็จ', message: 'ตรวจสอบยอด Masque Points หรือ Energy ปัจจุบันของคุณ' };
      return;
    }
    persist(next);
    modal = { kind: 'notice', tone: 'success', title: 'เติม Energy สำเร็จ!', message: `ได้รับ Energy +${pack.energy}` };
  }

  function confirmItem(): void {
    if (modal?.kind !== 'item-confirm') return;
    const next = purchaseShopItem(player, modal.itemId);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'ซื้อไม่สำเร็จ', message: 'แต้มไม่พอ หรือมีสินค้านี้แล้ว' };
      return;
    }
    persist(next);
    modal = { kind: 'notice', tone: 'success', title: 'เพิ่มเข้าคอลเลกชันแล้ว', message: 'เลือกใช้งานได้ที่ Avatar & Pets' };
  }

  function confirmExchange(): void {
    const amount = exchangeAmount;
    const next = exchangeAisPoints(player, amount);
    if (!next) {
      modal = { kind: 'notice', tone: 'warn', title: 'แลกไม่สำเร็จ', message: 'ตรวจสอบจำนวน AIS Points ของคุณ' };
      return;
    }
    persist(next);
    modal = { kind: 'notice', tone: 'success', title: 'แลกสำเร็จ!', message: `ได้รับ ${amount * 10} Masque Points` };
  }

  function claimReward(index: number, track: 'free' | 'vip'): void {
    if (track === 'vip' && !vipActive) return;
    const next = claimBattlePassReward(player, track, index);
    if (!next) return;
    persist(next);
    const reward = track === 'vip' ? BATTLE_PASS.vipRewards[index] : BATTLE_PASS.freeRewards[index];
    showToast(`${reward.title} รับแล้ว`);
  }

  function claimAllRewards(): void {
    let next = player;
    let count = 0;
    BATTLE_PASS.freeRewards.forEach((_, index) => {
      const claimed = claimBattlePassReward(next, 'free', index);
      if (claimed) { next = claimed; count += 1; }
    });
    if (vipActive) {
      BATTLE_PASS.vipRewards.forEach((_, index) => {
        const claimed = claimBattlePassReward(next, 'vip', index);
        if (claimed) { next = claimed; count += 1; }
      });
    }
    if (!count) return;
    persist(next);
    showToast(`รับรางวัล ${count} รายการแล้ว`);
  }

  function claimMission(): void {
    const missionId = `daily-${todayKey()}`;
    if (!player.claimedMissions.includes(`daily-played-${todayKey()}`)) return;
    if (player.claimedMissions.includes(missionId)) return;
    persist({ ...addMockMissionXp(player, 50), claimedMissions: [...player.claimedMissions, missionId] });
    showToast('รับ 50 XP แล้ว');
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

  function startGacha(): void {
    if (gachaBusy) return;
    if (player.gachaTickets <= 0 && player.masquePoints < PET_GACHA_COST) {
      modal = { kind: 'notice', tone: 'warn', title: 'Masque Points ไม่พอ', message: 'แลก AIS Points ใน Shop เพื่อสุ่ม Pet ได้เลย' };
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
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast = ''), 1800);
  }

  function makeRoom(): void {
    if (!vipActive) {
      modal = { kind: 'notice', tone: 'info', title: 'สร้างห้องสำหรับ VIP', message: 'VIP Pass ปลดล็อกการสร้างห้องเล่นกับเพื่อน' };
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
      if (toastTimer) window.clearTimeout(toastTimer);
      window.removeEventListener('hashchange', routeChanged);
    };
  });
</script>

<div class="app-frame">
  {#if page === 'game'}
    <GameScreen
      game={currentGame}
      {player}
      {vipActive}
      loading={gameLoading}
      fallback={gameFallback}
      version={iframeVersion}
      onBack={() => navigate(`detail/${gameId}`)}
      onLoad={onIframeLoad}
      onError={() => (gameFallback = true)}
      onReload={reloadGame}
      onRefill={() => vipActive ? openVipShop() : openRefill()}
    />
  {:else}
    <main class="app-main">
      <div class="page-shell">
        <AppHeader {player} {vipActive} countdown={formatCountdown(refillCountdown)} onRefill={() => vipActive ? openVipShop() : openRefill()} onShop={() => navigate('shop')} onProfile={() => navigate('profile')} />
        {#if page === 'home'}
          <div class="home">
            <div class="welcome" class:vip={vipActive}>
              <div><small>MASQUE GAME</small><h1>วันนี้เล่นอะไรดี?</h1><span>{vipActive ? 'VIP พร้อมลุยทุกเกม' : 'เลือกเกมที่ชอบ แล้วไปลุยกัน'}</span></div>
              <button class="home-party" aria-label="เปลี่ยน Avatar และสัตว์เลี้ยง" onclick={() => navigate('avatar')}><AssetPortrait src={homeAvatar.imagePath} alt={homeAvatar.name} placeholder={homeAvatar.placeholder} kind="avatar" loading="eager" />{#if homePet}<span><AssetPortrait src={homePet.imagePath} alt={homePet.name} placeholder={homePet.placeholder} kind="pet" /></span>{/if}</button>
            </div>
            <section class="block hub-row">
              <DailyCheckinCard reward={CHECKIN_REWARD} days={checkinDays} claimed={checkedInToday} onClaim={claimCheckin} />
              <BattlePassPromo
                {player}
                level={passLevel}
                xp={passXp}
                completed={passCompleted}
                {vipActive}
                {vipUntil}
                onOpen={() => navigate('rewards')}
                onShop={openVipShop}
                onRoom={() => navigate('room')}
              />
            </section>

            <section class="block">
              <SectionHeading eyebrow="TODAY'S PICK" title="เกมแนะนำ" chip="HOT GAME">{#snippet icon()}<Flame size={20} fill="currentColor" />{/snippet}</SectionHeading>
              <FeaturedGameCard game={featuredGame} {vipActive} onclick={() => navigate(`detail/${featuredGame.id}`)} />
            </section>

            <section class="block">
              <SectionHeading eyebrow="PICK YOUR NEXT PLAY" title="เกมทั้งหมด" chip={`${GAMES.length} เกม`}>{#snippet icon()}<Gamepad2 size={20} />{/snippet}</SectionHeading>
              <div class="game-list">{#each catalogGames as game, index (game.id)}<GameCard {game} {index} {vipActive} onclick={() => navigate(`detail/${game.id}`)} />{/each}</div>
            </section>
          </div>
        {:else if page === 'detail'}
          {#key gameId}<GameDetailPage game={currentGame} {player} {vipActive} score={mockScores[gameId]} countdown={formatCountdown(refillCountdown)} onPlay={() => enterGame(gameId)} onBack={() => navigate('home')} onRefill={() => vipActive ? openVipShop() : openRefill()} onAvatar={() => navigate('avatar')} />{/key}
        {:else if page === 'world'}
          <WorldPage {player} {vipActive} onNavigate={navigate} onToast={showToast} />
        {:else if page === 'shop'}
          <ShopPage
            {player}
            {vipActive}
            {now}
            bind:tab={shopTab}
            bind:amount={exchangeAmount}
            onExchange={() => (modal = { kind: 'exchange-confirm' })}
            onBuy={(itemId) => (modal = { kind: 'item-confirm', itemId })}
            onRefill={openRefill}
            onVip={openVipConfirm}
            onRoom={() => navigate('room')}
          />
        {:else if page === 'rewards'}
          <PassPage
            {player}
            {vipActive}
            {vipUntil}
            level={passLevel}
            xp={passXp}
            completed={passCompleted}
            {dailyPlayed}
            {dailyClaimed}
            onClaim={claimReward}
            onClaimAll={claimAllRewards}
            onClaimMission={claimMission}
            onPlay={() => navigate('home')}
            onVip={openVipConfirm}
            onRoom={() => navigate('room')}
          />
        {:else if page === 'avatar'}
          <AvatarPage {player} {vipActive} {gachaBusy} onSelectAvatar={chooseAvatar} onEquipPet={chooseEquipPet} onGacha={startGacha} />
        {:else if page === 'profile'}
          <ProfilePage {player} {vipActive} {passLevel} onNavigate={navigate} onRefill={() => openRefill()} />
        {:else if page === 'ranking'}
          <RankingPage {player} bind:gameId={rankingGameId} bind:period={rankingPeriod} scores={mockScores} />
        {:else if page === 'room'}
          <RoomPage {player} {vipActive} {roomCode} {roomCreated} bind:joinCode onCreate={makeRoom} onStart={() => navigate('detail/bird')} onVip={openVipShop} onToast={showToast} />
        {/if}
      </div>
      <BottomNav {page} />
    </main>
  {/if}
</div>

{#if page !== 'game'}<div class="landscape-notice" role="status"><strong>กรุณาหมุนมือถือเป็นแนวตั้ง</strong></div>{/if}
<Toast message={toast} />
<ModalHost
  {modal}
  {player}
  exchangeAmount={exchangeAmount}
  checkinReward={CHECKIN_REWARD}
  onClose={() => (modal = null)}
  onPickRefill={(id) => (modal = { kind: 'refill-confirm', refillId: id })}
  onConfirmRefill={confirmRefill}
  onConfirmVip={confirmVip}
  onConfirmExchange={confirmExchange}
  onConfirmItem={confirmItem}
  onOpenRefill={() => openRefill()}
  onOpenVip={() => { modal = null; openVipShop(); }}
  onOpenExchange={openExchange}
  onWait={() => { modal = null; navigate('home'); }}
/>

<style>
  .welcome { display: flex; align-items: center; justify-content: space-between; min-height: 102px; padding: 0 10px; }
  .welcome small { color: #9a83bc; font-size: 10px; font-weight: 900; }
  .welcome h1 { margin: 5px 0; color: var(--g-ink); font-size: 23px; }
  .welcome > div > span { color: var(--g-muted); font-size: 12px; }
  .home-party { position: relative; width: 100px; height: 112px; flex: 0 0 auto; padding: 0; border: 0; background: transparent; }
  .home-party > span { position: absolute; right: -5px; bottom: 0; width: 45px; height: 53px; }
  .welcome.vip .home-party { filter: drop-shadow(0 0 10px #ffd472); }
  .home { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; padding-top: 4px; }
  .block { min-width: 0; }
  .hub-row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 11px; }
  .game-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  @media (max-width: 340px) { .game-list { gap: 9px; } .home { gap: 14px; } }
</style>
