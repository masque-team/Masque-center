<script lang="ts">
  import { Check, ClipboardList, Coins, Crown, Gift, Lock, Sparkles, UsersRound, Zap } from '@lucide/svelte';
  import AssetPortrait from '../components/AssetPortrait.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import Panel from '../components/Panel.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import { AVATARS, BATTLE_PASS, PETS, VIP_PACKAGES } from '../data/config';
  import type { PlayerState } from '../types';

  type Reward = (typeof BATTLE_PASS.freeRewards)[number] | (typeof BATTLE_PASS.vipRewards)[number];
  type RewardType = 'energy' | 'points' | 'ticket' | 'avatar' | 'pet';

  let { player, vipActive, vipUntil = '', level, xp, completed, dailyPlayed, dailyClaimed, onClaim, onClaimAll, onClaimMission, onPlay, onVip, onRoom }: {
    player: PlayerState;
    vipActive: boolean;
    vipUntil?: string;
    level: number;
    xp: number;
    completed: boolean;
    dailyPlayed: boolean;
    dailyClaimed: boolean;
    onClaim: (index: number, track: 'free' | 'vip') => void;
    onClaimAll: () => void;
    onClaimMission: () => void;
    onPlay: () => void;
    onVip: (packageId: string) => void;
    onRoom: () => void;
  } = $props();

  let tab = $state<'rewards' | 'quests' | 'vip'>('rewards');

  let rows = $derived(
    BATTLE_PASS.freeRewards.map((free, index) => ({
      index,
      level: index + 1,
      free,
      vip: BATTLE_PASS.vipRewards[index],
      freeState: stateOf('free', index),
      vipState: stateOf('vip', index),
    })),
  );
  let claimable = $derived(rows.filter((row) => row.freeState === 'ready').length + rows.filter((row) => row.vipState === 'ready').length);
  let nextLevelXp = $derived(completed ? 100 : xp);
  let vipMascot = $derived(AVATARS.find((item) => item.id === 'mali-vip') ?? AVATARS[0]);
  let vipPet = $derived(PETS.find((item) => item.id === 'pudding') ?? PETS[0]);
  let freeHero = $derived(AVATARS.find((item) => item.id === 'nami') ?? AVATARS[1]);

  function stateOf(track: 'free' | 'vip', index: number): 'claimed' | 'ready' | 'locked' | 'vip-locked' {
    if (player.claimedRewards.includes(`${track}-${index + 1}`)) return 'claimed';
    if (track === 'vip' && !vipActive) return 'vip-locked';
    return level >= index + 1 ? 'ready' : 'locked';
  }

  function rewardLabel(reward: Reward): string {
    return reward.title.replace(/^(Avatar|Pet): /, '');
  }
</script>

<div class="page-stack">
  <PageTitle eyebrow="SEASON 01 · DREAM ISLAND" title="Battle Pass" subtitle="สะสม XP ปลดล็อกของรางวัลและตัวละครพิเศษ">
    {#snippet icon()}<Crown size={26} fill="currentColor" />{/snippet}
  </PageTitle>

  <section class="season-hero" class:vip={vipActive} aria-label="สถานะ Battle Pass">
    <span class="rays" aria-hidden="true"></span>
    <div class="hero-main">
      <div class="lv-col">
        <span class="orb"><b>{level}</b><small>LV</small></span>
        <div class="lv-copy">
          <div class="lv-top">
            <strong>เลเวล {level}</strong>
            <span class="state" class:on={vipActive}>
              {#if vipActive}<Crown size={12} fill="currentColor" />VIP ACTIVE{:else}FREE PASS{/if}
            </span>
          </div>
          <div class="xp" role="progressbar" aria-label="Battle Pass XP" aria-valuemin="0" aria-valuemax="100" aria-valuenow={nextLevelXp}>
            <span class="fill" style={`width:${nextLevelXp}%`}></span>
            <em>{completed ? 'จบซีซันแล้ว' : `${xp}/100 XP`}</em>
          </div>
          <small>{completed ? 'ครบทุกเลเวลแล้ว!' : `อีก ${100 - xp} XP ถึงเลเวล ${Math.min(BATTLE_PASS.totalLevels, level + 1)}`}</small>
        </div>
      </div>

      <div class="showcase" aria-label="รางวัลไฮไลต์ซีซันนี้">
        <div class="show-copy">
          <span class="show-badge"><Sparkles size={11} />ไฮไลต์ซีซัน 01</span>
          <strong>{vipMascot.name} & {vipPet.name}</strong>
          <small>ปลดล็อกที่ LV.2 · LV.4 พร้อมตัวละคร {freeHero.name}</small>
          <div class="perk-chips">
            <span><Zap size={11} fill="currentColor" />Energy ∞</span>
            <span><Crown size={11} fill="currentColor" />รางวัล VIP x5</span>
          </div>
        </div>
        <div class="show-figures" aria-hidden="true">
          <span class="aura"></span>
          <span class="fig avatar-fig">
            <AssetPortrait src={vipMascot.imagePath} alt="" placeholder={vipMascot.placeholder} kind="avatar" loading="eager" className="show-art" />
          </span>
          <span class="fig pet-fig">
            <AssetPortrait src={vipPet.imagePath} alt="" placeholder={vipPet.placeholder} kind="pet" loading="eager" className="show-art" />
          </span>
        </div>
      </div>
    </div>
  </section>

  <div class="tabs" role="tablist" aria-label="หมวด Battle Pass">
    <button role="tab" aria-selected={tab === 'rewards'} class:on={tab === 'rewards'} onclick={() => (tab = 'rewards')}><Gift size={17} />รางวัล{#if claimable}<i class="dot">{claimable}</i>{/if}</button>
    <button role="tab" aria-selected={tab === 'quests'} class:on={tab === 'quests'} onclick={() => (tab = 'quests')}><ClipboardList size={17} />ภารกิจ{#if dailyPlayed && !dailyClaimed}<i class="dot">1</i>{/if}</button>
    <button role="tab" aria-selected={tab === 'vip'} class:on={tab === 'vip'} onclick={() => (tab = 'vip')}><Crown size={17} fill="currentColor" />VIP Pass</button>
  </div>

  {#if tab === 'rewards'}
    <div class="track-wrap">
      <div class="thead">
        <span class="col-lv">LV</span>
        <span class="col-free"><Gift size={13} />FREE TRACK</span>
        <span class="col-vip"><Crown size={13} fill="currentColor" />VIP TRACK</span>
      </div>
      <div class="track-rows">
        {#each rows as row, idx (row.level)}
          {@const reached = level >= row.level}
          <div class="row" class:current={row.level === level && !completed} class:reached>
            <div class="lvl">
              {#if idx > 0}<span class="rail" class:lit={reached}></span>{/if}
              <span class="node" class:done={reached} class:now={row.level === level && !completed}>
                {#if reached}{row.level}{:else}<Lock size={11} /><b>{row.level}</b>{/if}
              </span>
            </div>
            {#each [{ track: 'free' as const, reward: row.free, state: row.freeState }, { track: 'vip' as const, reward: row.vip, state: row.vipState }] as cell (cell.track)}
              {@const special = cell.reward.type === 'avatar' || cell.reward.type === 'pet'}
              <div class={`cell ${cell.track} ${cell.state}`} class:special>
                {#if special}<span class="grand">{cell.reward.type === 'avatar' ? 'AVATAR' : 'PET'}</span>{/if}
                <RewardIcon type={cell.reward.type as RewardType} itemId={'itemId' in cell.reward ? cell.reward.itemId : undefined} size={special ? 50 : 44} />
                <span class="rt">{rewardLabel(cell.reward)}</span>
                {#if cell.state === 'ready'}<GameButton variant={cell.track === 'vip' ? 'gold' : 'mint'} size="sm" onclick={() => onClaim(row.index, cell.track)}>รับเลย</GameButton>
                {:else if cell.state === 'claimed'}<span class="tag ok"><Check size={12} strokeWidth={3.5} />รับแล้ว</span>
                {:else if cell.state === 'vip-locked'}<span class="tag vl"><Crown size={11} fill="currentColor" />VIP</span>
                {:else}<span class="tag lk"><Lock size={11} />LV.{row.level}</span>{/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
    <GameButton variant="purple" size="lg" block disabled={claimable === 0} onclick={onClaimAll}><Gift size={19} />{claimable ? `รับรางวัลทั้งหมด (${claimable})` : 'รับรางวัลครบตามเลเวลแล้ว'}</GameButton>
    {#if !vipActive}<GameButton variant="gold" size="md" block onclick={() => (tab = 'vip')}><Crown size={17} fill="currentColor" />ปลดล็อก VIP Pass · รับรางวัลคูณสอง</GameButton>{/if}
  {:else if tab === 'quests'}
    <Panel tone="white">
      <div class="qhead"><ClipboardList size={18} /><h2>ภารกิจประจำวัน</h2></div>
      <div class="quest">
        <span class="qi"><Sparkles size={22} /></span>
        <div class="qc"><strong>เข้าเล่นเกม 1 ครั้ง</strong><div class="qbar"><span style={`width:${dailyPlayed ? 100 : 0}%`}></span></div><small>{dailyPlayed ? '1/1' : '0/1'} · รางวัล 50 XP</small></div>
        {#if dailyClaimed}<span class="tag ok"><Check size={13} strokeWidth={3.5} />รับแล้ว</span>
        {:else if dailyPlayed}<GameButton variant="mint" size="sm" onclick={onClaimMission}>รับ XP</GameButton>
        {:else}<GameButton variant="ghost" size="sm" onclick={onPlay}>ไปเล่น</GameButton>{/if}
      </div>
    </Panel>
    <Panel tone={vipActive ? 'gold' : 'white'}>
      <div class="qhead"><Crown size={18} fill="currentColor" /><h2>ภารกิจ VIP</h2>{#if !vipActive}<span class="tag vl"><Lock size={12} />VIP</span>{/if}</div>
      <div class="quest locked">
        <span class="qi gold"><Crown size={22} fill="currentColor" /></span>
        <div class="qc"><strong>ทำคะแนนสูงสุดให้ได้</strong><div class="qbar"><span style="width:0%"></span></div><small>รอเชื่อมคะแนนจากเกม · รางวัล 100 XP</small></div>
        <span class="tag lk"><Lock size={12} />เร็วๆ นี้</span>
      </div>
    </Panel>
  {:else}
    {#if vipActive}
      <Panel tone="gold">
        <div class="vip-active">
          <span class="qi gold"><Crown size={22} fill="currentColor" /></span>
          <div class="qc">
            <strong>VIP กำลังใช้งาน</strong>
            <small>{vipUntil ? `สิทธิ์ถึง ${vipUntil}` : 'เปิดใช้งานอยู่'} · Energy ∞ + รางวัล VIP</small>
          </div>
          <GameButton variant="ghost" size="sm" onclick={onRoom}><UsersRound size={14} />ห้องเพื่อน</GameButton>
        </div>
      </Panel>
    {/if}
    <div class="vips">
      {#each VIP_PACKAGES as pack (pack.id)}
        <article class="vip-card" class:best={pack.durationDays === 7}>
          {#if pack.durationDays === 7}<span class="best-tag">คุ้มสุด</span>{/if}
          <div class="vip-top">
            <span class="qi gold"><Crown size={22} fill="currentColor" /></span>
            <div>
              <h3>{pack.label}</h3>
              <small>ปลดล็อก Battle Pass VIP + Energy ∞ ({pack.durationDays} วัน)</small>
            </div>
          </div>
          <ul class="vip-perks">
            <li><Zap size={13} fill="currentColor" />Energy ไม่จำกัด</li>
            <li><Check size={13} strokeWidth={3.5} />รางวัล + ภารกิจ VIP</li>
            <li><UsersRound size={13} />สร้างห้องเพื่อน</li>
            <li><Gift size={13} />{pack.reward}</li>
          </ul>
          <div class="vip-buy">
            <span class="price"><Coins size={15} />{pack.cost}<small>MP</small></span>
            <GameButton variant="gold" size="md" onclick={() => onVip(pack.id)}>{vipActive ? 'ต่ออายุ' : 'เปิด VIP'}</GameButton>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .season-hero { position: relative; overflow: hidden; padding: 12px; border: 2.5px solid #fff; border-radius: 24px; background: linear-gradient(145deg, #d8c8ff 0%, #c4d8ff 50%, #f1d8ff 100%); box-shadow: 0 8px 0 -3px #9c88e0, 0 14px 22px rgb(75 50 165 / 22%); isolation: isolate; }
  .season-hero.vip { background: linear-gradient(145deg, #fff1b8 0%, #ffd982 48%, #e4ccff 100%); box-shadow: 0 8px 0 -3px #d9a238, 0 14px 24px rgb(200 135 25 / 26%); }
  .rays { position: absolute; z-index: -1; top: -60px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: repeating-conic-gradient(from 0deg, rgb(255 255 255 / 35%) 0 12deg, transparent 12deg 26deg); mask-image: radial-gradient(circle, #000 30%, transparent 72%); animation: spin-slow 24s linear infinite; pointer-events: none; }
  .hero-main { display: grid; gap: 10px; }
  .lv-col { display: flex; align-items: center; gap: 11px; }
  .orb { display: grid; place-items: center; align-content: center; width: 58px; height: 58px; flex: 0 0 auto; border: 3px solid #fff; border-radius: 20px; color: #fff; background: linear-gradient(160deg, #b79cff, #6a4fd6); box-shadow: 0 4px 0 #4a30a8, 0 0 14px rgb(130 95 250 / 50%); line-height: 1; }
  .season-hero.vip .orb { color: #6b3f00; background: linear-gradient(160deg, #fff3a6, #ffb42b); box-shadow: 0 4px 0 #c4770d, 0 0 16px rgb(255 200 70 / 70%); }
  .orb b { font-size: 25px; font-weight: 900; }
  .orb small { font-size: 9px; font-weight: 900; letter-spacing: 0.5px; opacity: 0.85; }
  .lv-copy { min-width: 0; flex: 1; display: grid; gap: 4px; }
  .lv-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .lv-top strong { color: var(--g-ink); font-size: 17px; font-weight: 900; }
  .state { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border: 1.5px solid #fff; border-radius: 99px; color: #5a46b8; background: rgb(255 255 255 / 78%); font-size: 11px; font-weight: 900; white-space: nowrap; }
  .state.on { color: #6b3f00; background: linear-gradient(180deg, #fff09a, #ffc23d); box-shadow: 0 2px 6px rgb(220 150 20 / 35%); }
  .xp { position: relative; height: 20px; overflow: hidden; border-radius: 99px; background: rgb(255 255 255 / 78%); box-shadow: inset 0 2px 4px rgb(80 55 170 / 22%); }
  .fill { position: absolute; inset: 0 auto 0 0; border-radius: inherit; background: linear-gradient(90deg, #a98bff, #6f9bff, #5fd0ff); box-shadow: inset 0 2px 0 rgb(255 255 255 / 45%); transition: width 0.7s cubic-bezier(0.2, 0.9, 0.3, 1); }
  .season-hero.vip .fill { background: linear-gradient(90deg, #ffc83d, #ff9330, #b58cff); }
  .xp em { position: absolute; inset: 0; display: grid; place-items: center; color: var(--g-ink); font-size: 11.5px; font-style: normal; font-weight: 900; text-shadow: 0 0 4px #fff, 0 0 4px #fff; }
  .lv-copy small { color: #5a4ba5; font-size: 11.5px; font-weight: 800; }

  .showcase { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 116px; align-items: center; gap: 8px; padding: 9px 10px; border: 2px solid rgb(255 255 255 / 88%); border-radius: 18px; background: linear-gradient(135deg, rgb(255 255 255 / 78%), rgb(255 246 215 / 85%)); }
  .show-copy { min-width: 0; display: grid; gap: 3px; }
  .show-badge { display: inline-flex; align-items: center; gap: 3px; width: fit-content; padding: 2px 7px; border-radius: 99px; color: #7a4a00; background: #ffe494; font-size: 10px; font-weight: 900; }
  .show-copy strong { color: var(--g-ink); font-size: 14.5px; font-weight: 900; line-height: 1.2; }
  .show-copy small { color: #6b5cb5; font-size: 11px; font-weight: 700; line-height: 1.25; }
  .perk-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
  .perk-chips span { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 99px; color: #4b32a8; background: #ece4ff; font-size: 10.5px; font-weight: 900; }
  .perk-chips span :global(svg) { color: #e59400; }
  .show-figures { position: relative; height: 86px; display: flex; align-items: flex-end; justify-content: center; }
  .aura { position: absolute; inset: 4px 10px; border-radius: 50%; background: radial-gradient(circle, rgb(255 210 90 / 75%), transparent 70%); filter: blur(2px); animation: pulse-aura 2.6s ease-in-out infinite; }
  .fig { position: relative; display: block; }
  .avatar-fig { width: 68px; height: 86px; filter: drop-shadow(0 4px 6px rgb(80 45 140 / 30%)); }
  .pet-fig { width: 46px; height: 56px; margin-left: -14px; filter: drop-shadow(0 4px 5px rgb(80 45 140 / 30%)); animation: hop-sm 2.4s ease-in-out infinite; }
  .fig :global(.show-art) { background: transparent; }

  .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; padding: 5px; border: 2.5px solid #fff; border-radius: 20px; background: #e4dcf8; box-shadow: inset 0 2px 4px rgb(80 55 170 / 15%); }
  .tabs button { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 46px; padding: 0 4px; border: 0; border-radius: 15px; color: #8a7fc4; background: transparent; font-size: 13.5px; font-weight: 900; white-space: nowrap; }
  .tabs button.on { color: #fff; background: linear-gradient(180deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .dot { display: grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border: 1.5px solid #fff; border-radius: 99px; color: #fff; background: #ff5f5f; font-size: 11px; font-style: normal; font-weight: 900; }

  .track-wrap { overflow: hidden; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(180deg, #fff, #f6f2ff); box-shadow: var(--g-card-shadow); }
  .thead, .row { display: grid; grid-template-columns: 44px minmax(0, 1fr) minmax(0, 1fr); gap: 7px; align-items: stretch; }
  .thead { padding: 9px 9px; border-bottom: 2px solid #e6defc; background: linear-gradient(90deg, #ece6ff 0%, #ece6ff 52%, #fff3cc 100%); font-size: 11.5px; font-weight: 900; letter-spacing: 0.4px; }
  .thead span { display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
  .col-lv { color: #7a6bc4; }
  .col-free { color: #2b7a5c; }
  .col-vip { color: #9a5f00; }
  .track-rows { display: grid; }
  .row { position: relative; padding: 9px; border-top: 1.5px solid #f0eafc; }
  .row:first-child { border-top: 0; }
  .row.current { background: linear-gradient(90deg, #f3edff, #fff9e6); box-shadow: inset 4px 0 0 #7a5ce0; }

  .lvl { position: relative; display: grid; place-items: center; }
  .rail { position: absolute; top: -22px; left: 50%; width: 4px; height: 28px; transform: translateX(-50%); border-radius: 99px; background: #dfd7f7; }
  .rail.lit { background: linear-gradient(180deg, #62e3a6, #22b57d); }
  .node { position: relative; z-index: 1; display: grid; place-items: center; width: 34px; height: 34px; border: 2.5px solid #fff; border-radius: 50%; color: #8a7fc4; background: #e4dcf8; font-size: 13px; font-weight: 900; line-height: 1; }
  .node b { font-size: 10px; }
  .node.done { color: #fff; background: linear-gradient(160deg, #62e3a6, #22b57d); box-shadow: 0 3px 0 #168a5f; font-size: 15px; }
  .node.now { box-shadow: 0 3px 0 #168a5f, 0 0 0 3px rgb(122 92 224 / 32%); }

  .cell { position: relative; display: grid; justify-items: center; align-content: space-between; gap: 5px; min-width: 0; padding: 10px 6px 8px; border: 2px solid #ece5ff; border-radius: 17px; background: #faf8ff; text-align: center; }
  .cell.vip { border-color: #f6df9e; background: linear-gradient(180deg, #fffdf4, #fff4d1); }
  .cell.special { border-color: #d3b8ff; background: radial-gradient(circle at 50% 28%, rgb(255 230 150 / 45%), transparent 65%), linear-gradient(180deg, #fff, #f3e8ff); }
  .cell.vip.special { border-color: #f4c150; background: radial-gradient(circle at 50% 28%, rgb(255 215 90 / 60%), transparent 68%), linear-gradient(180deg, #fffdf2, #ffebb3); }
  .cell.ready.free { border-color: #6fdba8; background: linear-gradient(180deg, #f2fff8, #dcf8ea); box-shadow: 0 4px 10px rgb(40 180 120 / 18%); }
  .cell.ready.vip { border-color: #f5b82e; background: linear-gradient(180deg, #fffdf0, #ffe89e); box-shadow: 0 4px 12px rgb(230 160 20 / 26%); }
  .cell.claimed { opacity: 0.74; }
  .cell.locked, .cell.vip-locked { filter: saturate(0.65); }
  .grand { position: absolute; top: 5px; right: 5px; padding: 1px 6px; border: 1.5px solid #fff; border-radius: 99px; color: #6b3f00; background: linear-gradient(180deg, #fff09a, #ffb42b); font-size: 9px; font-weight: 900; letter-spacing: 0.3px; }
  .rt { display: block; width: 100%; min-height: 30px; overflow: hidden; color: #3d3578; font-size: 12px; font-weight: 900; line-height: 1.25; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; }
  .tag { display: inline-flex; align-items: center; justify-content: center; gap: 3px; min-height: 28px; padding: 0 9px; border-radius: 99px; font-size: 11.5px; font-weight: 900; white-space: nowrap; }
  .tag.ok { color: #1a7a54; background: #d4f5e4; }
  .tag.lk { color: #8a7fc4; background: #ece6ff; }
  .tag.vl { color: #8a5a06; background: #ffe8a3; }

  .qhead { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #6a4fd6; }
  .qhead h2 { flex: 1; margin: 0; color: var(--g-ink); font-size: 17px; font-weight: 900; }
  .quest { display: flex; align-items: center; gap: 10px; }
  .quest.locked { opacity: 0.8; }
  .qi { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 auto; border: 2px solid #fff; border-radius: 15px; color: #fff; background: linear-gradient(160deg, #a78bfa, #6a4fd6); box-shadow: 0 3px 0 #4b32a8; }
  .qi.gold { color: #7a4a00; background: linear-gradient(160deg, #fff09a, #ffb42b); box-shadow: 0 3px 0 #c4770d; }
  .qc { min-width: 0; flex: 1; display: grid; gap: 4px; }
  .qc strong { color: var(--g-ink); font-size: 14px; font-weight: 900; }
  .qbar { height: 11px; overflow: hidden; border-radius: 99px; background: #e4dcf8; }
  .qbar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #a98bff, #5fd0ff); transition: width 0.5s ease; }
  .qc small { color: var(--g-muted); font-size: 12px; font-weight: 700; }

  .vip-active { display: flex; align-items: center; gap: 10px; }
  .vips { display: grid; gap: 12px; }
  .vip-card { position: relative; display: grid; gap: 9px; padding: 13px; border: 2.5px solid #fff; border-radius: 22px; background: linear-gradient(150deg, #fff, #fff6d8); box-shadow: 0 7px 0 -3px #e2b24f, 0 12px 18px rgb(200 140 30 / 18%); }
  .vip-card.best { background: linear-gradient(150deg, #fff9e0, #ffe39a); }
  .best-tag { position: absolute; top: 11px; right: 11px; padding: 3px 10px; transform: rotate(3deg); border: 2px solid #fff; border-radius: 10px; color: #fff; background: linear-gradient(135deg, #ffb347, #ff5f3d); box-shadow: 0 3px 0 #c43d1d; font-size: 11px; font-weight: 900; }
  .vip-top { display: flex; align-items: center; gap: 10px; padding-right: 48px; }
  .vip-top h3 { margin: 0; color: #5b3a00; font-size: 17px; font-weight: 900; }
  .vip-top small { color: #7a5200; font-size: 12px; font-weight: 700; }
  .vip-perks { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 8px; margin: 0; padding: 8px 10px; border-radius: 14px; background: rgb(255 255 255 / 66%); list-style: none; }
  .vip-perks li { display: inline-flex; align-items: center; gap: 5px; color: #6b4500; font-size: 12px; font-weight: 800; }
  .vip-perks li :global(svg) { color: #22a06b; flex: 0 0 auto; }
  .vip-buy { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .price { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 99px; color: #8a5a06; background: #fff0c2; font-size: 18px; font-weight: 900; }
  .price small { font-size: 12px; }

  @keyframes spin-slow { to { transform: rotate(360deg); } }
  @keyframes pulse-aura { 0%, 100% { transform: scale(0.95); opacity: 0.75; } 50% { transform: scale(1.08); opacity: 1; } }
  @keyframes hop-sm { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @media (prefers-reduced-motion: reduce) { .rays, .aura, .pet-fig { animation: none; } }
  @media (max-width: 340px) { .showcase { grid-template-columns: minmax(0, 1fr) 98px; } .avatar-fig { width: 58px; height: 74px; } .pet-fig { width: 40px; height: 48px; } }
</style>
