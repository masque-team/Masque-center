<script lang="ts">
  import { ArrowLeft, Sparkles } from '@lucide/svelte';
  import AppHeader from './AppHeader.svelte';
  import { NAV_ARTWORK } from '../data/config';
  import type { Page, PlayerState } from '../types';

  let { page = 'home', player, vipActive, hasUnread, countdown, compact = false, profileExpanded = false, onBack, onRefill, onShop, onProfile, onHistory }: {
    page?: Page;
    player: PlayerState;
    vipActive: boolean;
    hasUnread: boolean;
    countdown: string;
    compact?: boolean;
    profileExpanded?: boolean;
    onBack?: () => void;
    onRefill: () => void;
    onShop: () => void;
    onProfile: () => void;
    onHistory: () => void;
  } = $props();

  type StageStation = {
    actorX: string;
    bgX: string;
    placeLabel: string;
    storyLine: string;
    propIcon: string;
  };

  const STATIONS: Record<string, StageStation> = {
    home: {
      actorX: '43%',
      bgX: '38%',
      placeLabel: 'หน้าบ้าน',
      storyLine: 'แวะมาหน้าบ้านแล้ว เปิดเมนูเลย!',
      propIcon: NAV_ARTWORK.home,
    },
    shop: {
      actorX: '58%',
      bgX: '64%',
      placeLabel: 'ร้านค้า',
      storyLine: 'พามาถึงร้านค้าแล้ว โยนเปิดร้านเลย!',
      propIcon: NAV_ARTWORK.shop,
    },
    vip: {
      actorX: '58%',
      bgX: '64%',
      placeLabel: 'โซน VIP',
      storyLine: 'พามาดูสิทธิ์ VIP สุดคุ้มแล้วนะ!',
      propIcon: NAV_ARTWORK.shop,
    },
    hub: {
      actorX: '50%',
      bgX: '50%',
      placeLabel: 'ลานเกม',
      storyLine: 'มาถึงลานเกมแล้ว เลือกเกมกัน!',
      propIcon: NAV_ARTWORK.home,
    },
    detail: {
      actorX: '54%',
      bgX: '54%',
      placeLabel: 'จุดเข้าเกม',
      storyLine: 'โยนการ์ดเกมเปิดสนามให้แล้ว!',
      propIcon: NAV_ARTWORK.home,
    },
    rewards: {
      actorX: '56%',
      bgX: '60%',
      placeLabel: 'Battle Pass',
      storyLine: 'โยนม้วนภารกิจ Battle Pass ลงมาแล้ว!',
      propIcon: NAV_ARTWORK.rewards,
    },
    missions: {
      actorX: '55%',
      bgX: '58%',
      placeLabel: 'ภารกิจ',
      storyLine: 'เปิดกระดานภารกิจสะสม XP เลย!',
      propIcon: NAV_ARTWORK.rewards,
    },
    achievements: {
      actorX: '45%',
      bgX: '42%',
      placeLabel: 'หอเกียรติยศ',
      storyLine: 'เปิดสมุดเช็กอิน & เหรียญตราแล้ว!',
      propIcon: 'assets/badges/first-finish.png',
    },
    campaigns: {
      actorX: '47%',
      bgX: '46%',
      placeLabel: 'ลานเทศกาล',
      storyLine: 'พามาดูแคมเปญและอีเวนต์พิเศษ!',
      propIcon: NAV_ARTWORK.rewards,
    },
    campaign: {
      actorX: '48%',
      bgX: '48%',
      placeLabel: 'สนามอีเวนต์',
      storyLine: 'พร้อมชิงอันดับในกิจกรรมนี้เลย!',
      propIcon: NAV_ARTWORK.rewards,
    },
    ranking: {
      actorX: '54%',
      bgX: '56%',
      placeLabel: 'อันดับ',
      storyLine: 'โยนป้ายอันดับคะแนนลงมาให้ดูแล้ว!',
      propIcon: 'assets/badges/high-score-10000.png',
    },
    profile: {
      actorX: '52%',
      bgX: '50%',
      placeLabel: 'โปรไฟล์',
      storyLine: 'ซูมมาแต่งตัวและดูโปรไฟล์กัน!',
      propIcon: NAV_ARTWORK.avatar,
    },
    game: {
      actorX: '52%',
      bgX: '50%',
      placeLabel: 'สนามแข่ง',
      storyLine: 'เชียร์อยู่นะ เก็บคะแนนให้ได้เยอะๆ!',
      propIcon: NAV_ARTWORK.home,
    },
  };

  let station = $derived(STATIONS[page] ?? STATIONS.home);

  function hideUnavailableActor(event: Event): void {
    const image = event.currentTarget;
    if (image instanceof HTMLImageElement) image.hidden = true;
  }
</script>

<header
  class="scenic-header"
  class:compact
  class:profile-expanded={profileExpanded}
  style:--actor-x={station.actorX}
  style:--bg-x={station.bgX}
  aria-label="โลกของผู้เล่น"
>
  <img class="scenic-background" src="assets/ui-redesign/header/header-banner.jpg" alt="" fetchpriority="high" />

  {#if !compact && !profileExpanded}
    {#key page}
      <div class="station-sign" aria-hidden="true">
        <img src={station.propIcon} alt="" />
        <span>{station.placeLabel}</span>
      </div>
    {/key}
  {/if}

  <div class="scenic-actors" aria-hidden="true">
    {#key page}
      <div class="scenic-walk-rig">
        <span class="walk-dust d1"></span>
        <span class="walk-dust d2"></span>
        <img class="scenic-avatar" src={`assets/world/actors/avatars-${player.avatarId}.webp`} alt="" onerror={hideUnavailableActor} />
        {#if player.petId}
          <img class="scenic-pet" src={`assets/world/actors/pets-${player.petId}.webp`} alt="" onerror={hideUnavailableActor} />
        {/if}
      </div>
      {#if !compact}
        <div class="story-speech">
          <Sparkles size={11} />
          <span>{station.storyLine}</span>
        </div>
      {/if}
    {/key}
  </div>

  {#if !compact}
    {#key page}
      <div class="story-toss-orb" aria-hidden="true">
        <span class="orb-core">
          <img src={station.propIcon} alt="" />
        </span>
      </div>
      <div class="story-impact-wave" aria-hidden="true"></div>
    {/key}
  {/if}

  <AppHeader scenic {player} {vipActive} {hasUnread} {countdown} {onRefill} {onShop} {onProfile} {onHistory} />
  {#if compact && onBack}
    <button class="scene-back" type="button" aria-label="กลับหน้าเกม" onclick={onBack}><ArrowLeft size={21} strokeWidth={2.8} /></button>
  {/if}
</header>

<style>
  .scenic-header {
    position: relative;
    z-index: 15;
    width: 100%;
    height: calc(154px + env(safe-area-inset-top, 0px));
    transition: height 520ms cubic-bezier(0.22, 1, 0.36, 1);
    overflow: hidden;
    isolation: isolate;
    background: #75c9e8;
  }
  .scenic-background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: var(--bg-x, 50%) bottom;
    transition: object-position 560ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .station-sign {
    position: absolute;
    z-index: 2;
    bottom: 22px;
    left: 14px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px 3px 5px;
    border: 1.5px solid rgb(255 255 255 / 92%);
    border-radius: 999px;
    background: linear-gradient(180deg, rgb(255 252 235 / 94%), rgb(255 236 179 / 94%));
    box-shadow: 0 3px 0 rgb(120 78 18 / 32%), 0 6px 12px rgb(20 45 20 / 18%);
    color: #5b3400;
    font-size: 9.5px;
    font-weight: 900;
    pointer-events: none;
    animation: sign-pop 460ms cubic-bezier(0.22, 1.4, 0.36, 1) both;
  }
  .station-sign img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
  .scenic-actors {
    position: absolute;
    z-index: 3;
    bottom: 20px;
    left: var(--actor-x, 52%);
    display: flex;
    align-items: flex-end;
    height: 92px;
    transform: translateX(-50%);
    transition:
      left 520ms cubic-bezier(0.22, 1, 0.36, 1),
      bottom 520ms cubic-bezier(0.22, 1, 0.36, 1),
      height 520ms cubic-bezier(0.22, 1, 0.36, 1);
    animation: stroll 7s ease-in-out infinite;
    pointer-events: none;
  }
  .scenic-walk-rig {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 100%;
    animation: walk-arrive-toss 560ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .walk-dust {
    position: absolute;
    bottom: 2px;
    left: 12px;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: radial-gradient(circle, rgb(255 255 255 / 90%) 0%, rgb(238 248 220 / 55%) 65%, transparent 100%);
    opacity: 0;
    animation: dust-puff 460ms ease-out;
  }
  .walk-dust.d2 {
    left: 28px;
    width: 9px;
    height: 9px;
    animation-delay: 90ms;
  }
  .scenic-avatar {
    width: auto;
    height: 88px;
    max-width: 84px;
    object-fit: contain;
    filter: drop-shadow(0 3px 4px rgb(22 53 24 / 42%));
    transition: height 520ms cubic-bezier(0.22, 1, 0.36, 1), max-width 520ms cubic-bezier(0.22, 1, 0.36, 1);
    animation: step 720ms ease-in-out infinite alternate;
  }
  .scenic-pet {
    width: auto;
    height: 54px;
    max-width: 58px;
    object-fit: contain;
    filter: drop-shadow(0 3px 4px rgb(22 53 24 / 38%));
    transition: height 520ms cubic-bezier(0.22, 1, 0.36, 1), max-width 520ms cubic-bezier(0.22, 1, 0.36, 1);
    animation: step 610ms ease-in-out infinite alternate-reverse;
  }
  .story-speech {
    position: absolute;
    bottom: 22px;
    right: -8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 196px;
    padding: 3px 8px;
    border: 1.5px solid #ffffff;
    border-radius: 999px;
    background: rgb(255 255 255 / 95%);
    box-shadow: 0 3px 0 rgb(76 45 128 / 22%), 0 6px 14px rgb(24 32 70 / 16%);
    color: #3b1d6e;
    font-size: 9px;
    font-weight: 900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transform: translateY(-64px);
    animation: speech-story 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .story-speech :global(svg) {
    flex: 0 0 auto;
    color: #f59e0b;
  }
  .story-toss-orb {
    position: absolute;
    z-index: 6;
    bottom: 54px;
    left: var(--actor-x, 52%);
    width: 34px;
    height: 34px;
    transform: translate(-50%, 0);
    pointer-events: none;
    animation: toss-to-sheet 520ms cubic-bezier(0.24, 0.88, 0.34, 1) forwards;
  }
  .orb-core {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde047 52%, #a855f7 100%);
    box-shadow: 0 0 0 4px rgb(250 204 21 / 32%), 0 6px 14px rgb(88 28 135 / 42%);
  }
  .orb-core img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
  .story-impact-wave {
    position: absolute;
    z-index: 5;
    bottom: 8px;
    left: 50%;
    width: 120px;
    height: 22px;
    border: 2.5px solid rgb(253 224 71 / 90%);
    border-radius: 999px;
    background: radial-gradient(ellipse, rgb(254 240 138 / 75%) 0%, rgb(168 85 247 / 25%) 60%, transparent 100%);
    transform: translateX(-50%) scale(0.2);
    opacity: 0;
    pointer-events: none;
    animation: impact-burst 560ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .scene-back { position: absolute; z-index: 4; bottom: 20px; left: 11px; display: grid; place-items: center; width: 38px; height: 38px; border: 2px solid #fff; border-radius: 13px; color: #522582; background: rgb(255 255 255 / 90%); box-shadow: 0 3px 0 rgb(60 38 90 / 30%); backdrop-filter: blur(6px); }
  .scene-back:active { transform: translateY(2px); box-shadow: 0 1px 0 rgb(60 38 90 / 30%); }
  .scenic-header.compact { height: calc(118px + env(safe-area-inset-top, 0px)); }
  .scenic-header.compact .scenic-actors { bottom: 16px; height: 68px; }
  .scenic-header.compact .scenic-avatar { height: 64px; max-width: 60px; }
  .scenic-header.compact .scenic-pet { height: 40px; max-width: 46px; }
  .scenic-header.profile-expanded { z-index: 5; height: calc(clamp(300px, 42dvh, 390px) + env(safe-area-inset-top, 0px)); }
  .scenic-header.profile-expanded .scenic-actors { left: 52%; bottom: 24px; height: 242px; gap: 3px; }
  .scenic-header.profile-expanded .scenic-avatar { height: 238px; max-width: 174px; }
  .scenic-header.profile-expanded .scenic-pet { height: 112px; max-width: 106px; }
  .scenic-header.profile-expanded .story-speech { bottom: calc(100% - 14px); }
  @keyframes stroll {
    0%, 100% { translate: -4px 0; }
    50% { translate: 6px 0; }
  }
  @keyframes step {
    from { transform: translateY(0); }
    to { transform: translateY(-2px); }
  }
  @keyframes walk-arrive-toss {
    0% { transform: translateY(0); }
    22% { transform: translateY(-8px) rotate(-3deg); }
    45% { transform: translateY(-1px) rotate(2deg); }
    70% { transform: translateY(-10px) rotate(-2deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
  @keyframes dust-puff {
    0% { opacity: 0.9; transform: translate(0, 0) scale(0.5); }
    100% { opacity: 0; transform: translate(-18px, -10px) scale(1.65); }
  }
  @keyframes sign-pop {
    0% { opacity: 0; transform: translateY(10px) scale(0.82); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes speech-story {
    0% { opacity: 0; transform: translateY(-54px) scale(0.86); }
    14%, 78% { opacity: 1; transform: translateY(-66px) scale(1); }
    100% { opacity: 0; transform: translateY(-70px) scale(0.95); }
  }
  @keyframes toss-to-sheet {
    0% {
      opacity: 0;
      transform: translate(-50%, 6px) scale(0.45) rotate(-25deg);
    }
    28% {
      opacity: 1;
      transform: translate(-50%, -26px) scale(1.06) rotate(12deg);
    }
    78% {
      opacity: 1;
      left: 50%;
      bottom: 8px;
      transform: translate(-50%, 0) scale(0.92) rotate(160deg);
    }
    100% {
      opacity: 0;
      left: 50%;
      bottom: -8px;
      transform: translate(-50%, 10px) scale(0.25) rotate(220deg);
    }
  }
  @keyframes impact-burst {
    0%, 55% {
      opacity: 0;
      transform: translateX(-50%) scale(0.2);
    }
    74% {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) scale(1.55);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .scenic-header, .scenic-background, .scenic-actors, .scenic-avatar, .scenic-pet { transition: none; }
    .scenic-actors, .scenic-walk-rig, .walk-dust, .station-sign, .scenic-avatar, .scenic-pet, .story-speech, .story-toss-orb, .story-impact-wave { animation: none; }
    .story-toss-orb, .story-impact-wave { display: none; }
  }
</style>