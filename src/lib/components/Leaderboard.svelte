<script lang="ts">
  import { Info, Trophy } from '@lucide/svelte';
  import AssetPortrait from './AssetPortrait.svelte';
  import { AVATARS } from '../data/config';
  import { getGameRanking } from '../services/rankingService';
  import type { GameId, PlayerState, RankingEntry, RankingPeriod } from '../types';

  let { gameId = $bindable(), period = $bindable(), player, currentScore, fixedGame = false }: {
    gameId: GameId;
    period: RankingPeriod;
    player: PlayerState;
    currentScore: number;
    fixedGame?: boolean;
  } = $props();

  let view = $state<'top' | 'near'>('top');
  let rows = $derived(getGameRanking(gameId, period, player, currentScore));
  let me = $derived(rows.findIndex((entry) => entry.isCurrentPlayer));
  let podium = $derived(rows.slice(0, 3));
  let list = $derived(view === 'top' ? rows.slice(3, 10).map((entry, index) => ({ entry, rank: index + 4 })) : rows.slice(Math.max(0, me - 2), me + 3).map((entry, index) => ({ entry, rank: Math.max(0, me - 2) + index + 1 })));
  let games = $derived(player.demo.config.games.filter((game) => game.published !== false));
  let activeGame = $derived(games.find((game) => game.id === gameId) ?? games[0]);

  function avatarFor(entry: RankingEntry) {
    if (entry.isCurrentPlayer) return AVATARS.find((item) => item.id === player.avatarId) ?? AVATARS[0];
    const seed = [...entry.playerId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return AVATARS[seed % AVATARS.length];
  }
</script>

<div class="rank">
  {#if !fixedGame}
  <div class="games" role="tablist" aria-label="เลือกเกม">
    {#each games as game (game.id)}
      <button role="tab" aria-selected={gameId === game.id} class:on={gameId === game.id} onclick={() => (gameId = game.id)}>
        {#if game.cover}<img src={`images/${game.cover}`} alt="" loading="lazy" />{:else}<span class="ph">?♥</span>{/if}
        <span>{game.name}</span>
      </button>
    {/each}
  </div>
  {/if}

  <div class="bar">
    <div class="period" role="group" aria-label="ช่วงเวลา">
      <button class:on={period === 'weekly'} aria-pressed={period === 'weekly'} onclick={() => (period = 'weekly')}>ซีซัน</button>
      <button class:on={period === 'allTime'} aria-pressed={period === 'allTime'} onclick={() => (period = 'allTime')}>ตลอดกาล</button>
    </div>
    <span class="myrank"><Trophy size={14} />อันดับของฉัน <b>#{me + 1}</b></span>
  </div>

  <div class="stage" aria-label={`Top 3 · ${activeGame.name}`}>
    <span class="stars" aria-hidden="true">✦ ✧ ✦</span>
    <div class="podium">
      {#each podium as entry, index (entry.playerId)}
        {@const rank = index + 1}
        {@const avatar = avatarFor(entry)}
        <article class={`place p${rank}`} class:mine={entry.isCurrentPlayer}>
          <span class="medal"><img src={`assets/badges/season-top-${rank}.png`} alt="" /></span>
          <span class="portrait" style={`--avatar-color:${avatar.color}`}>
            <AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" className="rank-avatar" />
          </span>
          <strong>{entry.displayName}{#if entry.isCurrentPlayer}<small>คุณ</small>{/if}</strong>
          <span class="score">{entry.score.toLocaleString('en-US')}</span>
          <span class="block"><b>{rank}</b></span>
        </article>
      {/each}
    </div>
  </div>

  <div class="tabs" role="tablist" aria-label="มุมมองอันดับ">
    <button role="tab" aria-selected={view === 'top'} class:on={view === 'top'} onclick={() => (view = 'top')}>Top Players</button>
    <button role="tab" aria-selected={view === 'near'} class:on={view === 'near'} onclick={() => (view = 'near')}>ใกล้ฉัน</button>
  </div>

  <ol class="list">
    {#each list as item (item.entry.playerId)}
      {@const avatar = avatarFor(item.entry)}
      <li class:mine={item.entry.isCurrentPlayer}>
        <span class="no">{item.rank}</span>
        <span class="mini" style={`--avatar-color:${avatar.color}`}><AssetPortrait src={avatar.imagePath} alt="" placeholder={avatar.placeholder} kind="avatar" className="rank-mini" /></span>
        <span class="name">{item.entry.displayName}{#if item.entry.isCurrentPlayer}<small>คุณ</small>{/if}</span>
        <b>{item.entry.score.toLocaleString('en-US')}</b>
      </li>
    {/each}
  </ol>

  <p class="disclaimer"><Info size={14} />คะแนนเป็นข้อมูลตัวอย่างแยกตามเกม ยังไม่เชื่อมต่อคะแนนจริงจากเกม · Free และ VIP จัดอันดับได้เท่ากัน</p>
</div>

<style>
  .rank { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .games { display: flex; gap: 8px; padding: 2px 2px 8px; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; scroll-snap-type: x proximity; }
  .games::-webkit-scrollbar { display: none; }
  .games button { display: grid; justify-items: center; gap: 4px; flex: 0 0 74px; padding: 5px 4px 6px; border: 2.5px solid #fff; border-radius: 18px; color: #6b5cb5; background: linear-gradient(160deg, #fff, #efe8ff); box-shadow: 0 4px 0 #cfc3f2; font-size: 11px; font-weight: 800; scroll-snap-align: start; }
  .games button.on { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 4px 0 #4b32a8, 0 0 0 3px rgb(122 92 224 / 25%); }
  .games img, .ph { width: 52px; height: 44px; border-radius: 12px; object-fit: cover; object-position: 50% 40%; }
  .ph { display: grid; place-items: center; color: #fff; background: linear-gradient(150deg, #7fd3f3, #8c7fe6); font-size: 15px; font-weight: 900; }
  .games span:last-child { max-width: 100%; overflow: hidden; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; }

  .bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
  .period { display: flex; padding: 4px; border: 2.5px solid #fff; border-radius: 16px; background: #e4dcf8; }
  .period button { min-height: 40px; padding: 0 13px; border: 0; border-radius: 12px; color: #8a7fc4; background: transparent; font-size: 13px; font-weight: 900; }
  .period button.on { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .myrank { display: inline-flex; align-items: center; gap: 5px; padding: 8px 12px; border: 2px solid #fff; border-radius: 99px; color: #8a5a06; background: linear-gradient(180deg, #fff6cf, #ffe39a); font-size: 13px; font-weight: 800; white-space: nowrap; }
  .myrank b { font-size: 17px; font-weight: 900; }

  .stage { position: relative; padding: 14px 10px 0; overflow: hidden; border: 2.5px solid #fff; border-radius: 24px; background: linear-gradient(180deg, #8fb8ff 0%, #c9b6ff 62%, #f0d7ff 100%); box-shadow: var(--g-card-shadow); }
  .stars { position: absolute; top: 8px; right: 0; left: 0; color: #fff; text-align: center; font-size: 14px; letter-spacing: 34px; text-shadow: 0 0 8px #fff; opacity: 0.8; }
  .podium { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: end; gap: 7px; }
  .place { position: relative; display: grid; justify-items: center; gap: 3px; min-width: 0; padding-top: 8px; }
  .place.p1 { order: 2; } .place.p2 { order: 1; } .place.p3 { order: 3; }
  .medal { display: grid; place-items: center; width: 30px; height: 30px; border: 2px solid #fff; border-radius: 50%; color: #6b3d00; box-shadow: 0 3px 0 rgb(40 20 100 / 30%); }
  .p1 .medal { background: linear-gradient(160deg, #fff09a, #ffb42b); }
  .p2 .medal { background: linear-gradient(160deg, #f4f7fb, #b9c4d8); }
  .p3 .medal { background: linear-gradient(160deg, #ffd9b8, #d98f5a); }
  .portrait { display: block; width: 66px; height: 74px; overflow: hidden; border: 3px solid #fff; border-radius: 22px 22px 14px 14px; background: var(--avatar-color); box-shadow: 0 4px 10px rgb(40 20 100 / 30%); }
  .p1 .portrait { width: 80px; height: 90px; box-shadow: 0 0 0 3px #ffc23d, 0 0 20px rgb(255 200 70 / 70%); }
  .portrait :global(.rank-avatar) { width: 100%; height: 100%; background: transparent; }
  .portrait :global(.rank-avatar img) { object-fit: cover; object-position: 50% 8%; }
  .place strong { max-width: 100%; overflow: hidden; color: #fff; font-size: 13px; font-weight: 900; text-overflow: ellipsis; text-shadow: 0 2px 0 rgb(40 20 110 / 50%); white-space: nowrap; }
  .place strong small { margin-left: 3px; color: #ffe68a; font-size: 10px; }
  .score { padding: 2px 9px; border-radius: 99px; color: #4b32a8; background: rgb(255 255 255 / 88%); font-size: 12px; font-weight: 900; font-variant-numeric: tabular-nums; }
  .block { display: grid; place-items: start center; width: 100%; padding-top: 6px; border: 2.5px solid #fff; border-bottom: 0; border-radius: 14px 14px 0 0; color: #fff; }
  .block b { font-size: 26px; font-weight: 900; line-height: 1; text-shadow: 0 2px 0 rgb(0 0 0 / 25%); }
  .p1 .block { height: 78px; background: linear-gradient(180deg, #ffd34d, #e7a31a); }
  .p2 .block { height: 56px; background: linear-gradient(180deg, #c3cde0, #8c9ab5); }
  .p3 .block { height: 42px; background: linear-gradient(180deg, #e6a877, #b8703c); }
  .place.mine .portrait { box-shadow: 0 0 0 3px #7a5ce0, 0 4px 10px rgb(40 20 100 / 30%); }

  .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 5px; border: 2.5px solid #fff; border-radius: 18px; background: #e4dcf8; }
  .tabs button { min-height: 44px; border: 0; border-radius: 13px; color: #8a7fc4; background: transparent; font-size: 14px; font-weight: 900; }
  .tabs button.on { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }

  .list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
  .list li { display: flex; align-items: center; gap: 10px; min-height: 58px; padding: 7px 12px 7px 8px; border: 2.5px solid #fff; border-radius: 18px; background: linear-gradient(160deg, #fff, #f6f2ff); box-shadow: 0 5px 0 -2px #d3c8f5; }
  .list li.mine { background: linear-gradient(150deg, #efe8ff, #d9ccff); box-shadow: 0 5px 0 -2px #8a72dc, 0 0 0 2px #7a5ce0; }
  .no { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 12px; color: #6b5cb5; background: #ece6ff; font-size: 16px; font-weight: 900; }
  .mini { display: block; width: 40px; height: 40px; flex: 0 0 auto; overflow: hidden; border: 2px solid #fff; border-radius: 50%; background: var(--avatar-color); }
  .mini :global(.rank-mini) { width: 100%; height: 100%; background: transparent; }
  .mini :global(.rank-mini img) { object-fit: cover; object-position: 50% 8%; }
  .name { min-width: 0; flex: 1; overflow: hidden; color: var(--g-ink); font-size: 15px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
  .name small { margin-left: 5px; padding: 1px 7px; border-radius: 99px; color: #fff; background: #7a5ce0; font-size: 11px; }
  .list b { color: #4b32a8; font-size: 16px; font-weight: 900; font-variant-numeric: tabular-nums; }
  .disclaimer { display: flex; align-items: flex-start; gap: 6px; margin: 0; padding: 0 4px; color: #8a7fc4; font-size: 12px; font-weight: 700; line-height: 1.45; }
  .disclaimer :global(svg) { flex: 0 0 auto; margin-top: 2px; }
</style>
