<script lang="ts">
  import { ArrowRight, Check, ChevronRight, Gamepad2, Sparkles, Trophy } from '@lucide/svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import type { Game, PlayerState } from '../types';

  type CheckinDay = { label: string; done: boolean; today: boolean };
  type CampaignCard = {
    id: string;
    title: string;
    artwork: string;
    entryLabel: string;
    countdownLabel: string;
    route: string;
  };

  let {
    player,
    vipActive,
    passLevel,
    passXp,
    passComplete,
    checkedIn,
    checkinReward,
    checkinDays,
    games,
    festivals,
    competitions,
    scores,
    playCounts,
    onNavigate,
    onCheckin,
  }: {
    player: PlayerState;
    vipActive: boolean;
    passLevel: number;
    passXp: number;
    passComplete: boolean;
    checkedIn: boolean;
    checkinReward: number;
    checkinDays: CheckinDay[];
    games: Game[];
    festivals: CampaignCard[];
    competitions: CampaignCard[];
    scores: Partial<Record<string, number>>;
    playCounts: Partial<Record<string, number>>;
    onNavigate: (route: string) => void;
    onCheckin: () => void;
  } = $props();

  const redesignCovers: Record<string, string> = {
    mole: 'assets/ui-redesign/games/game-mole-cover.jpg',
    bird: 'assets/ui-redesign/games/game-bird-cover.jpg',
    fruit: 'assets/ui-redesign/games/game-fruit-cover.jpg',
    duck: 'assets/ui-redesign/games/game-duck-cover.jpg',
  };

  function coverFor(game: Game): string {
    return redesignCovers[game.id] ?? (game.cover ? `images/${game.cover}` : '');
  }

  function labelFor(game: Game): string {
    if (game.id === 'mole') return 'NEW';
    if (game.id === 'bird') return 'HOT';
    return game.editorialTag === 'new' ? 'NEW' : game.editorialTag === 'hot' ? 'HOT' : '';
  }
</script>

<div class="home-dashboard">
  <button class="ais-promo" type="button" onclick={() => onNavigate('points')} aria-label="แลกพลังงานด้วย AIS Point">
    <img src="assets/ui-redesign/home/promo-ais-corgi.jpg" alt="คอร์กี้ถือสายฟ้า" />
    <span class="promo-copy">
      <small>AIS POINT</small>
      <strong>แลกพลังงาน<br />สุดคุ้ม</strong>
      <span class="promo-cta">แลกเลย <ArrowRight size={14} /></span>
    </span>
  </button>

  <button class="feature-row pass-row" type="button" onclick={() => onNavigate('rewards')}>
    <img src="assets/ui-redesign/home/icon-battle-pass.jpg" alt="" />
    <span class="feature-copy">
      <strong>Battle Pass</strong>
      <small>{vipActive ? 'VIP Pass' : `LV.${passLevel} · ${passComplete ? 'ครบซีซัน' : `${passXp}/100 XP`}`}</small>
      <span class="progress-track"><i style={`width:${passComplete ? 100 : passXp}%`}></i></span>
    </span>
    <span class="feature-action">ดู Pass <ChevronRight size={14} /></span>
  </button>

  <section class="feature-row checkin-row" aria-label="เช็กอินรายวัน">
    <img src="assets/ui-redesign/home/icon-daily-checkin.jpg" alt="" />
    <div class="feature-copy">
      <strong>เช็กอินรายวัน</strong>
      <small>วันที่ {Math.max(1, checkinDays.filter((day) => day.done).length + (checkedIn ? 0 : 1))} จาก 7 วัน · +{checkinReward} Energy</small>
      <span class="checkin-days" aria-label={`${checkinDays.filter((day) => day.done).length} จาก 7 วัน`}>
        {#each checkinDays as day (day.label)}
          <i class:done={day.done} class:today={day.today && !day.done}>{#if day.done}<Check size={10} strokeWidth={3} />{/if}</i>
        {/each}
      </span>
    </div>
    <button class="feature-action" type="button" disabled={checkedIn} onclick={onCheckin}>
      {checkedIn ? 'รับแล้ว' : 'รับเลย'} <ChevronRight size={14} />
    </button>
  </section>

  <section class="games-section" aria-label="เกม">
    <div class="section-title">
      <h2><Gamepad2 size={20} /> เลือกเกมที่อยากเล่น</h2>
      <button type="button" onclick={() => onNavigate('hub')} aria-label="ดูเกมทั้งหมด"><ArrowRight size={17} /></button>
    </div>
    <div class="games-grid">
      {#each games as game, index (game.id)}
        <button class="game-tile" type="button" onclick={() => onNavigate(`detail/${game.id}`)} aria-label={`เล่น ${game.name}`}>
          <span class="game-cover">
            <img src={coverFor(game)} alt="" loading={index < 4 ? 'eager' : 'lazy'} />
            {#if labelFor(game)}<span class:hot={labelFor(game) === 'HOT'}>{labelFor(game)}</span>{/if}
          </span>
          <span class="game-caption">
            <strong>{game.name}</strong>
            <span class="game-play"><CurrencyIcon kind="energyPotion" size={13} /><span>{vipActive ? 'ฟรี' : 'เล่น'}</span><i><ChevronRight size={12} /></i></span>
          </span>
          <small class="game-stats">{(playCounts[game.id] ?? 0).toLocaleString()} รอบ · สูงสุด {(scores[game.id] ?? 0).toLocaleString()}</small>
        </button>
      {/each}
    </div>
  </section>

  {#if festivals.length}
    <section class="campaign-section" aria-label="เทศกาล">
      <div class="section-title"><h2><Sparkles size={18} /> เทศกาล</h2><button type="button" onclick={() => onNavigate('campaigns')} aria-label="ดูกิจกรรมทั้งหมด"><ArrowRight size={16} /></button></div>
      <div class="campaign-grid">
        {#each festivals.slice(0, 2) as item (item.id)}
          <button class="campaign-tile festival" type="button" onclick={() => onNavigate(item.route)}>
            <img src={item.artwork} alt="" loading="lazy" />
            <strong>{item.title}</strong><small>{item.entryLabel} · {item.countdownLabel}</small>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if competitions.length}
    <section class="campaign-section" aria-label="การแข่งขัน">
      <div class="section-title"><h2><Trophy size={18} /> การแข่งขัน</h2><button type="button" onclick={() => onNavigate('campaigns')} aria-label="ดูการแข่งขันทั้งหมด"><ArrowRight size={16} /></button></div>
      <div class="campaign-grid">
        {#each competitions.slice(0, 2) as item (item.id)}
          <button class="campaign-tile competition" type="button" onclick={() => onNavigate(item.route)}>
            <img src={item.artwork} alt="" loading="lazy" />
            <strong>{item.title}</strong><small>{item.entryLabel} · {item.countdownLabel}</small>
          </button>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .home-dashboard { display: grid; gap: 10px; padding: 10px 12px 24px; }
  button { font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .ais-promo { position: relative; display: block; width: 100%; height: 104px; overflow: hidden; border: 2px solid #fff; border-radius: 18px; background: #dcf5a2; box-shadow: 0 4px 0 #a9d55b; text-align: left; }
  .ais-promo > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 38% 53%; }
  .ais-promo::after { position: absolute; inset: 0 0 0 40%; background: linear-gradient(90deg, transparent, rgb(244 255 220 / 70%) 26%, #efffcf 72%); content: ''; }
  .promo-copy { position: absolute; z-index: 1; top: 10px; right: 12px; display: grid; justify-items: start; gap: 1px; color: #15521b; text-align: left; }
  .promo-copy small { font-size: 9px; font-weight: 1000; }
  .promo-copy strong { font-size: 20px; font-weight: 1000; line-height: 1.02; }
  .promo-cta { display: inline-flex; align-items: center; gap: 3px; margin-top: 2px; padding: 3px 10px; border-radius: 99px; color: #fff; background: linear-gradient(#a642ff, #6e05cf); font-size: 10px; font-weight: 900; }
  .feature-row { display: flex; align-items: center; gap: 9px; min-width: 0; min-height: 68px; padding: 6px 9px; border: 1.5px solid #fff; border-radius: 18px; background: linear-gradient(105deg, #fff 0%, #fbf8ff 65%, #f0ebff 100%); box-shadow: 0 3px 0 #ddd6f4, 0 7px 14px rgb(60 45 100 / 8%); text-align: left; }
  .feature-row > img { width: 48px; height: 48px; flex: 0 0 auto; border-radius: 12px; object-fit: cover; }
  .feature-copy { display: grid; min-width: 0; flex: 1; gap: 2px; }
  .feature-copy strong { overflow: hidden; color: #2b175a; font-size: 14px; font-weight: 1000; text-overflow: ellipsis; white-space: nowrap; }
  .feature-copy small { overflow: hidden; color: #71658f; font-size: 10px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
  .progress-track { height: 7px; overflow: hidden; border: 1px solid #d5c6eb; border-radius: 99px; background: #e7e2ee; }
  .progress-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #a846ff, #ffbe38); }
  .feature-action { display: inline-flex; align-items: center; justify-content: center; gap: 2px; min-width: 76px; min-height: 31px; padding: 0 9px; border: 0; border-radius: 99px; color: #fff; background: linear-gradient(180deg, #a341ff, #7400d7); box-shadow: 0 2px 0 #4e0a9a; font-size: 10px; font-weight: 900; white-space: nowrap; }
  .feature-action:disabled { color: #645a74; background: #ebe7f0; box-shadow: none; }
  .checkin-row .feature-copy { gap: 2px; }
  .checkin-days { display: flex; gap: 4px; }
  .checkin-days i { display: grid; place-items: center; width: 13px; height: 13px; border: 1px solid #c8c3d0; border-radius: 50%; color: #fff; background: #d7d4da; }
  .checkin-days i.done { border-color: #75c948; background: #69c947; }
  .checkin-days i.today { border-color: #8c35e6; background: #e7d2ff; }
  .games-section, .campaign-section { display: grid; gap: 8px; }
  .section-title { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 1px 2px; }
  .section-title h2 { display: inline-flex; align-items: center; gap: 6px; min-width: 0; margin: 0; color: #7015c7; font-size: 15px; font-weight: 1000; }
  .section-title h2 :global(svg) { flex: 0 0 auto; }
  .section-title > button { display: grid; place-items: center; width: 29px; height: 29px; flex: 0 0 auto; border: 1px solid #e5d7f6; border-radius: 50%; color: #7d18d8; background: #fff; }
  .games-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .game-tile { display: grid; min-width: 0; overflow: hidden; border: 1px solid #e3dfe7; border-radius: 17px; background: #fff; box-shadow: 0 2px 0 #e8e4ed; text-align: left; }
  .game-cover { position: relative; display: block; width: 100%; aspect-ratio: 1.38; overflow: hidden; background: #e8f4ff; }
  .game-cover img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .game-cover > span { position: absolute; bottom: 5px; left: 5px; padding: 2px 8px; border: 1px solid #fff; border-radius: 99px; color: #fff; background: linear-gradient(#25b7fa, #0879cf); box-shadow: 0 2px 0 #07569c; font-size: 10px; font-weight: 1000; }
  .game-cover > span.hot { background: linear-gradient(#ff6a42, #d83216); box-shadow: 0 2px 0 #9e2612; }
  .game-caption { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 5px 7px 1px; }
  .game-caption strong { min-width: 0; flex: 1; overflow: hidden; color: #311a4f; font-size: 12px; font-weight: 1000; text-overflow: ellipsis; white-space: nowrap; }
  .game-play { display: inline-flex; align-items: center; gap: 2px; color: #6711b4; font-size: 9px; font-weight: 900; white-space: nowrap; }
  .game-play i { display: grid; place-items: center; width: 19px; height: 19px; border-radius: 50%; color: #fff; background: linear-gradient(#a940ff, #7000d4); font-style: normal; }
  .game-stats { padding: 0 7px 6px; overflow: hidden; color: #857c91; font-size: 9px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
  .campaign-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .campaign-tile { display: grid; min-width: 0; gap: 3px; overflow: hidden; padding-bottom: 7px; border: 1px solid #e5deeb; border-radius: 16px; background: #fff; box-shadow: 0 2px 0 #e5deeb; text-align: left; }
  .campaign-tile img { width: 100%; aspect-ratio: 1.65; object-fit: cover; }
  .campaign-tile strong, .campaign-tile small { margin: 0 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .campaign-tile strong { color: #34204d; font-size: 11px; font-weight: 900; }
  .campaign-tile small { color: #786b88; font-size: 9px; font-weight: 700; }
  .campaign-tile.competition { background: #fffaf0; }
  @media (max-width: 350px) {
    .home-dashboard { padding-right: 9px; padding-left: 9px; }
    .promo-copy strong { font-size: 18px; }
    .feature-row { gap: 6px; padding-right: 6px; padding-left: 6px; }
    .feature-row > img { width: 42px; height: 42px; }
    .feature-action { min-width: 66px; padding: 0 6px; }
    .game-caption strong { font-size: 10.5px; }
    .game-play > span { display: none; }
  }
</style>