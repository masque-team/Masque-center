<script lang="ts">
  import { ArrowRight, Backpack, Check, Clock3, Crown, Gift, History, Lock, ShoppingBag, Sparkles, Trophy, Zap } from '@lucide/svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { CAMPAIGNS } from '../data/campaigns';
  import { getMissions } from '../services/demoService';
  import { campaignById, getCampaignRanking } from '../services/campaignService';
  import { currentPass, currentSeason } from '../services/demoService';
  import type { GameId, Page, PlayerState } from '../types';

  let { page, player, now, campaignId = '', onNavigate, onPlay, onFinalize, onVip, onPremium, onAisTopUp, onRefill, onBuyItem, onAvatar, onPet, onWing }: {
    page: Page;
    player: PlayerState;
    now: number;
    campaignId?: string;
    onNavigate: (route: string) => void;
    onPlay: (gameId: GameId, campaignId?: string) => void;
    onFinalize: (id: string) => void;
    onVip: (id: string) => void;
    onPremium: () => void;
    onAisTopUp: (amount: number) => void;
    onRefill: (id: string) => void;
    onBuyItem: (id: string) => void;
    onAvatar: (id: string) => void;
    onPet: (id: string | null) => void;
    onWing: (id: string | null) => void;
  } = $props();

  let period = $state<'daily' | 'weekly' | 'season'>('daily');
  let entitlement = $state<'free' | 'vip' | 'premium'>('free');
  let historyTab = $state<'game' | 'purchase' | 'reward'>('game');
  let rewardPreview = $state(false);
  let rankingGame = $state<GameId>('bird');
  let campaign = $derived(campaignById(campaignId));
  let season = $derived(currentSeason(player, now));
  let pass = $derived(currentPass(player, now));
  let vipActive = $derived(player.vipExpiresAt !== null && player.vipExpiresAt > now);
  let missions = $derived(getMissions(player, now).filter((mission) => mission.period === period && mission.entitlement === entitlement));
  let ranking = $derived(campaign ? getCampaignRanking(campaign.id, rankingGame, player) : []);
  let history = $derived((player.demo.history ?? []).filter((item) => item.kind === historyTab));
  let ownedAvatars = $derived(AVATARS.filter((item) => player.ownedAvatarIds.includes(item.id)));
  let ownedPets = $derived(PETS.filter((item) => player.ownedPetIds.includes(item.id)));
  let ownedWings = $derived(WINGS.filter((item) => player.demo.wings.includes(item.id)));
  let achievementMissions = $derived([
    { id: 'first-finish', title: 'First Finish', count: player.demo.sessions.filter((session) => session.finished).length, target: 1 },
    { id: 'explorer', title: 'เล่นครบ 5 เกม', count: Object.keys(player.demo.playCounts ?? {}).length, target: 5 },
    { id: 'frequent-player', title: 'นักเล่นเกมตัวยง', count: Object.values(player.demo.playCounts ?? {}).reduce<number>((total, count) => total + (count ?? 0), 0), target: 10 },
  ].map((item) => ({ ...item, earned: player.demo.achievements.some((badge) => badge.id === item.id) })));

  function durationLabel(days: number): string {
    return days < 1 ? `${Math.round(days * 24)} ชั่วโมง` : days === 1 ? '1 วัน' : `${days} วัน`;
  }
</script>

{#if page === 'campaigns'}
  <div class="page-stack">
    <PageTitle eyebrow="LIVE EVENTS · DEMO" title="Campaign" subtitle="กระดานคะแนนแยกตามแคมเปญและเกม">{#snippet icon()}<Trophy size={25} />{/snippet}</PageTitle>
    <p class="text-xs font-semibold text-slate-600">คะแนนและรางวัลเป็นข้อมูลจำลอง · campaign ticket เป็นตัวอย่างชั่วคราว</p>
    {#each CAMPAIGNS as item (item.id)}
      <button class="grid w-full gap-3 border-y border-white/80 bg-white/60 py-4 text-left" onclick={() => onNavigate(`campaign/${item.id}`)}>
        <span class="flex items-start justify-between gap-3"><strong class="text-lg font-black text-[#332973]">{item.title}</strong><ArrowRight size={20} /></span>
        <span class="text-sm text-slate-600">{item.description}</span>
        <span class="flex flex-wrap gap-2 text-xs font-bold"><span class="rounded bg-sky-100 px-2 py-1">{item.gameIds.length} เกม</span><span class="rounded bg-amber-100 px-2 py-1">{item.entry === 'free' ? 'เข้าฟรี' : `${item.ticketCost} Demo Ticket / รอบ`}</span></span>
      </button>
    {/each}
  </div>
{:else if page === 'campaign'}
  {#if campaign}
    {@const activeRankingGame = campaign.gameIds.includes(rankingGame) ? rankingGame : campaign.gameIds[0]}
    <div class="page-stack">
      <PageTitle eyebrow="CAMPAIGN DETAILS" title={campaign.title} subtitle={campaign.description}>{#snippet icon()}<Trophy size={25} />{/snippet}</PageTitle>
      <div class="flex flex-wrap gap-2" role="group" aria-label="เลือกเกมใน Campaign">
        {#each campaign.gameIds as gameId (gameId)}
          <button class="min-h-10 rounded-md border border-white bg-white/80 px-3 text-xs font-bold text-[#3b337a]" aria-pressed={activeRankingGame === gameId} onclick={() => rankingGame = gameId}>{player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId}</button>
        {/each}
      </div>
      <section class="space-y-3 border-y border-white/80 py-3" aria-label="Campaign ranking">
        <div class="flex items-center justify-between gap-3"><h2 class="font-black text-[#332973]">{activeRankingGame} · High Score</h2><button class="grid size-10 place-items-center rounded-md border border-white bg-white/80 text-amber-700" aria-label="ดูของรางวัลตามอันดับ" title="ของรางวัลตามอันดับ" aria-expanded={rewardPreview} onclick={() => rewardPreview = !rewardPreview}><Gift size={19} /></button></div>
        {#if rewardPreview}<div class="space-y-2 bg-amber-50/80 p-3 text-xs">{#each campaign.rewards as tier (tier.label)}<p><strong>{tier.label}:</strong> {tier.rewards.map((reward) => reward.title).join(' · ')}</p>{/each}<small class="text-slate-500">ตัวอย่าง reward tiers แก้ไขได้ภายหลัง</small></div>{/if}
        <ol class="space-y-2">{#each ranking as entry, index (entry.playerId)}<li class="flex min-h-12 items-center gap-3 border-b border-white/70 px-2"><b class="w-7 text-center">{index + 1}</b><span class="min-w-0 flex-1 truncate font-semibold">{entry.displayName}{entry.isCurrentPlayer ? ' · คุณ' : ''}</span><strong>{entry.score.toLocaleString()}</strong></li>{/each}</ol>
        <p class="text-[11px] text-slate-500">คะแนนสูงสุดต่อเกม · คะแนนเท่ากันใช้เวลาที่ทำได้ก่อน · ไม่รวมคะแนน All-time</p>
      </section>
      <div class="grid gap-2">{#each campaign.gameIds as gameId (gameId)}<button class="flex min-h-12 items-center justify-between rounded-md bg-[#e6f4fb] px-3 text-sm font-bold text-[#255275]" onclick={() => onPlay(gameId, campaign.id)}>เล่น {player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId}<ArrowRight size={17} /></button>{/each}</div>
      {#if player.demo.closedCampaigns?.includes(campaign.id)}<p class="rounded-md bg-slate-100 p-3 text-sm font-bold">ปิด Campaign แล้ว · รางวัลที่ได้บันทึกใน History</p>{:else}<button class="min-h-11 rounded-md border border-amber-300 bg-amber-50 px-3 text-sm font-bold text-amber-900" onclick={() => onFinalize(campaign.id)}>จำลองปิด Campaign และ settlement</button>{/if}
    </div>
  {:else}<div class="page-stack"><PageTitle eyebrow="CAMPAIGN" title="ไม่พบ Campaign" /><button class="text-left text-sm font-bold" onclick={() => onNavigate('campaigns')}>กลับไปหน้า Campaign</button></div>{/if}
{:else if page === 'missions'}
  <div class="page-stack">
    <PageTitle eyebrow="SHARED SEASON XP" title="Missions" subtitle="XP ภารกิจรับอัตโนมัติ · Pass rewards กดรับแยก">{#snippet icon()}<Sparkles size={25} />{/snippet}</PageTitle>
    <div class="grid grid-cols-3 gap-1 border-y border-white py-2" role="tablist" aria-label="ช่วงเวลาภารกิจ">
      {#each [{ id: 'daily', label: 'Daily' }, { id: 'weekly', label: 'Weekly' }, { id: 'season', label: 'Season' }] as item (item.id)}<button role="tab" aria-selected={period === item.id} class="min-h-10 rounded-md text-xs font-bold" class:bg-white={period === item.id} onclick={() => period = item.id as typeof period}>{item.label}</button>{/each}
    </div>
    <div class="grid grid-cols-3 gap-1" role="tablist" aria-label="กลุ่มสิทธิ์ภารกิจ">
      {#each [{ id: 'free', label: 'Free' }, { id: 'vip', label: 'VIP' }, { id: 'premium', label: 'Premium' }] as item (item.id)}<button role="tab" aria-selected={entitlement === item.id} class="min-h-10 rounded-md text-xs font-bold" class:bg-sky-100={entitlement === item.id} onclick={() => entitlement = item.id as typeof entitlement}>{item.label}</button>{/each}
    </div>
    {#each missions as mission (mission.key)}
      <article class="space-y-2 border-b border-white/80 py-3">
        <div class="flex items-start justify-between gap-2"><div><h2 class="font-black text-[#332973]">{mission.title}</h2><p class="text-xs text-slate-600">{mission.description}</p></div><span class="shrink-0 rounded bg-amber-50 px-2 py-1 text-xs font-black text-amber-800">+{mission.xp} XP</span></div>
        <div class="flex items-center gap-2"><progress class="h-2 min-w-0 flex-1 accent-sky-600" value={mission.count} max={mission.target}></progress><small class="tabular-nums">{mission.count}/{mission.target}</small></div>
        {#if mission.locked}<div class="flex items-center justify-between gap-2 rounded-md bg-slate-100 p-2 text-xs"><span class="flex items-center gap-1"><Lock size={14} />ล็อก · {mission.entitlement === 'vip' ? 'VIP' : 'Premium Pass'} แยกสิทธิ์จากกัน</span><button class="font-black text-sky-800" onclick={() => onNavigate(mission.entitlement === 'vip' ? 'vip' : 'rewards')}>ดูสิทธิ์</button></div>{:else if mission.complete}<p class="flex items-center gap-1 text-xs font-bold text-sky-800"><Check size={14} />XP รับอัตโนมัติแล้ว</p>{:else}<p class="text-xs text-slate-500">Progress จะอัปเดตหลัง {mission.trigger === 'game' ? 'จบเกม' : 'เช็กอิน'}</p>{/if}
      </article>
    {/each}
    <section class="space-y-2 border-t border-white/80 pt-4" aria-label="Achievement badges">
      <h2 class="font-black text-[#332973]">Achievements · Profile badges</h2>
      <p class="text-xs text-slate-600">ทำเป้าหมายให้สำเร็จเพื่อปลดล็อกป้ายผลงานบน Profile</p>
      {#each achievementMissions as achievement (achievement.id)}
        <article class="flex items-center gap-3 border-b border-white/80 py-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"><Trophy size={18} /></span>
          <span class="min-w-0 flex-1"><strong class="block text-sm">{achievement.title}</strong><small class="text-xs text-slate-500">เล่นจบ {Math.min(achievement.count, achievement.target)}/{achievement.target} รอบ · รางวัล Profile badge</small></span>
          {#if achievement.earned}<span class="flex items-center gap-1 text-[10px] font-black text-sky-800"><Check size={14} />ได้รับ</span>{:else}<span class="text-[10px] font-bold text-slate-500">กำลังทำ</span>{/if}
        </article>
      {/each}
    </section>
    <p class="text-[11px] text-slate-500">เป้าหมายและ XP เป็น Demo Configuration ชั่วคราว</p>
  </div>
{:else if page === 'history'}
  <div class="page-stack">
    <PageTitle eyebrow="PLAYER ACTIVITY" title="History" subtitle="รายการจำลองที่บันทึกในเครื่องนี้">{#snippet icon()}<History size={25} />{/snippet}</PageTitle>
    <div class="grid grid-cols-3 gap-1 border-y border-white py-2" role="tablist" aria-label="ประเภทประวัติ">
      {#each [{ id: 'game', label: 'Games' }, { id: 'purchase', label: 'Purchases' }, { id: 'reward', label: 'Rewards' }] as item (item.id)}<button role="tab" aria-selected={historyTab === item.id} class="min-h-10 rounded-md text-xs font-bold" class:bg-white={historyTab === item.id} onclick={() => historyTab = item.id as typeof historyTab}>{item.label}</button>{/each}
    </div>
    {#if history.length}<ol class="divide-y divide-white/80">{#each history as item (item.id)}<li class="flex min-h-16 items-center justify-between gap-3 py-3"><div class="min-w-0"><strong class="block truncate text-sm">{item.title}</strong><small class="block text-xs text-slate-500">{item.detail}</small></div><time class="shrink-0 text-[10px] text-slate-500">{new Date(item.at).toLocaleDateString('th-TH')}</time></li>{/each}</ol>
    {:else if historyTab === 'game' && player.demo.sessions.length}<ol class="divide-y divide-white/80">{#each [...player.demo.sessions].reverse() as session (session.id)}<li class="flex min-h-16 items-center justify-between gap-3 py-3"><span class="min-w-0"><strong class="block truncate text-sm">{player.demo.config.games.find((game) => game.id === session.gameId)?.name ?? session.gameId}</strong><small class="text-xs text-slate-500">{session.mode === 'campaign' ? 'Campaign' : 'Normal'} · {session.finished ? `${session.score ?? 0} คะแนน` : 'ยังไม่จบ'}</small></span><time class="shrink-0 text-[10px] text-slate-500">{new Date(session.startedAt).toLocaleDateString('th-TH')}</time></li>{/each}</ol>
    {:else}<p class="py-8 text-center text-sm text-slate-500">ยังไม่มีรายการในหมวดนี้</p>{/if}
  </div>
{:else if page === 'inventory'}
  <div class="page-stack">
    <PageTitle eyebrow="OWNED ITEMS" title="Inventory" subtitle="เลือกใช้อุปกรณ์ที่เป็นเจ้าของ">{#snippet icon()}<Backpack size={25} />{/snippet}</PageTitle>
    <section class="space-y-2"><h2 class="font-black">Avatar</h2>{#each ownedAvatars as item (item.id)}<div class="flex min-h-12 items-center justify-between gap-3 border-b border-white/80 py-2"><span>{item.name}{player.avatarId === item.id ? ' · Equipped' : ''}</span><button class="min-h-10 px-3 text-xs font-bold text-sky-800" onclick={() => onAvatar(item.id)}>{player.avatarId === item.id ? 'ใช้อยู่' : 'สวมใส่'}</button></div>{/each}</section>
    <section class="space-y-2"><h2 class="font-black">Pet</h2>{#each ownedPets as item (item.id)}<div class="flex min-h-12 items-center justify-between gap-3 border-b border-white/80 py-2"><span>{item.name}{player.petId === item.id ? ' · Equipped' : ''}</span><button class="min-h-10 px-3 text-xs font-bold text-sky-800" onclick={() => onPet(item.id)}>{player.petId === item.id ? 'ใช้อยู่' : 'สวมใส่'}</button></div>{/each}<button class="min-h-10 text-left text-xs font-bold text-slate-600" onclick={() => onPet(null)}>ถอด Pet</button></section>
    <section class="space-y-2"><h2 class="font-black">Frames & Wings</h2><p class="text-xs text-slate-600">Frame ที่ครอบครอง: {(player.demo.frames ?? []).join(', ') || 'ยังไม่มี'} · กรอบที่ใช้: {player.demo.frameId ?? 'ไม่มี'}</p>{#each ownedWings as item (item.id)}<div class="flex min-h-12 items-center justify-between gap-3 border-b border-white/80 py-2"><span>{item.name}{player.demo.wingId === item.id ? ' · Equipped' : ''}</span><button class="min-h-10 px-3 text-xs font-bold text-sky-800" onclick={() => onWing(item.id)}>{player.demo.wingId === item.id ? 'ใช้อยู่' : 'สวมใส่'}</button></div>{/each}<button class="min-h-10 text-left text-xs font-bold text-slate-600" onclick={() => onWing(null)}>ถอดปีก</button></section>
    <button class="min-h-11 rounded-md bg-sky-100 px-3 text-sm font-bold text-sky-900" onclick={() => onNavigate('gacha')}>เปิด Gacha <Sparkles size={16} class="inline" /></button>
  </div>
{:else if page === 'vip'}
  <div class="page-stack">
    <PageTitle eyebrow="TIME ENTITLEMENT · DEMO PRICES" title="VIP" subtitle="VIP ยกเว้นเฉพาะค่าเข้าเกมปกติ ไม่รวม Continue, Campaign Ticket หรือ Premium Pass">{#snippet icon()}<Crown size={25} />{/snippet}</PageTitle>
    <div class="flex items-center gap-2 border-y border-white py-3 text-sm">{#if vipActive}<Check size={18} class="text-sky-700" />ใช้งานถึง {new Date(player.vipExpiresAt!).toLocaleString('th-TH')}{:else}<Clock3 size={18} />ยังไม่ได้เปิดใช้งาน VIP{/if}</div>
    {#each player.demo.config.vipPlans as plan (plan.id)}<article class="flex items-center justify-between gap-3 border-b border-white/80 py-3"><div class="min-w-0"><strong class="block">{plan.label}</strong><small class="text-xs text-slate-600">{durationLabel(plan.durationDays)} · เข้าเกมปกติฟรี · ราคาเดโม</small></div><button class="min-h-10 shrink-0 rounded-md bg-amber-100 px-3 text-xs font-black text-amber-900" aria-label={`${vipActive ? 'ต่ออายุ' : 'ซื้อ'} ${plan.label} · ${plan.cost} MP`} onclick={() => onVip(plan.id)}>{plan.cost} MP</button></article>{/each}
    <p class="text-[11px] text-slate-500">ราคาและระยะเวลาไม่ใช่ SKU/ข้อเสนอที่อนุมัติสำหรับ production · ต่ออายุโดยบวกเวลาที่เหลือ</p>
  </div>
{:else if page === 'shop'}
  <div class="page-stack">
    <PageTitle eyebrow="MOCK STORE · NO BILLING" title="Shop" subtitle="ยอดจำลองในเครื่องนี้เท่านั้น · ไม่มีการตัดเงินจริง">{#snippet icon()}<ShoppingBag size={25} />{/snippet}</PageTitle>
    <section class="space-y-3 border-y border-white/80 py-3"><h2 class="font-black">AIS Point · Demo top-up</h2><p class="text-xs text-slate-600">ยอดปัจจุบัน {player.aisPoints.toLocaleString()} · การเติมด้านล่างเป็น mock เท่านั้น</p><div class="grid grid-cols-2 gap-2">{#each [100, 500] as amount (amount)}<button class="min-h-12 rounded-md bg-sky-100 px-2 text-sm font-black text-sky-900" onclick={() => onAisTopUp(amount)}>จำลอง +{amount} AIS Point</button>{/each}</div></section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Energy</h2><p class="text-xs text-slate-600">{player.energy}/{player.demo.config.energyMax} · ฟื้น +1 ทุก {player.demo.config.regenMinutes} นาที · รับเกิน cap ได้</p>{#each player.demo.config.energyPacks as pack (pack.id)}<button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onRefill(pack.id)}><span>+{pack.energy} Energy</span><strong>{pack.cost} MP</strong></button>{/each}</section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Cosmetics & Pets</h2><div class="grid grid-cols-2 gap-2">{#each player.demo.config.shop as item (item.id)}{@const owned = (item.kind === 'avatar' ? player.ownedAvatarIds : item.kind === 'pet' ? player.ownedPetIds : item.kind === 'wing' ? player.demo.wings : player.demo.frames).includes(item.itemId)}{@const label = item.kind === 'avatar' ? AVATARS.find((entry) => entry.id === item.itemId)?.name : item.kind === 'pet' ? PETS.find((entry) => entry.id === item.itemId)?.name : item.kind === 'wing' ? WINGS.find((entry) => entry.id === item.itemId)?.name : `Profile frame · ${item.itemId}`}<button class="grid min-h-20 content-center gap-1 border-b border-white/80 bg-white/40 p-2 text-left" disabled={owned} onclick={() => onBuyItem(item.id)}><strong class="text-xs">{label ?? item.itemId}</strong><span class="text-[10px] text-slate-500">{item.kind} · {owned ? 'เป็นเจ้าของแล้ว' : `${item.cost} MP · ราคาเดโม`}</span></button>{/each}</div></section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Entitlements & items</h2><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('vip')}><span>VIP packages</span><Crown size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={onPremium}><span>{pass.premium ? 'Premium Pass active' : `Premium Pass · ${player.demo.config.premiumPrice} MP`}</span><Sparkles size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('gacha')}><span>Gacha</span><Gift size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('inventory')}><span>Inventory</span><Backpack size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('rewards')}><span>{season.name} · Battle Pass</span><Zap size={17} /></button></section>
    <p class="text-[11px] text-slate-500">MP และราคา item เป็นข้อมูล legacy/demo; นโยบายสกุลเงินยังเปิดอยู่</p>
  </div>
{/if}
