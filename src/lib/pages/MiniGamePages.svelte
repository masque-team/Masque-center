<script lang="ts">
  import { ArrowRight, Backpack, Check, Clock3, Crown, Gift, History, Lock, ShoppingBag, Sparkles, Trophy, Zap } from '@lucide/svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import { AVATARS, PETS, WINGS } from '../data/config';
  import { getMissions } from '../services/demoService';
  import { campaignById, campaignRankingGame, getCampaignRanking, getCampaignStatus } from '../services/campaignService';
  import { currentPass, currentSeason } from '../services/demoService';
  import type { GameId, Page, PlayerState } from '../types';

  let { page, player, now, campaignId = '', onNavigate, onPlay, onBuyCampaignTickets, onVip, onPremium, onAisTopUp, onRefill, onBuyItem, onAvatar, onPet, onWing }: {
    page: Page;
    player: PlayerState;
    now: number;
    campaignId?: string;
    onNavigate: (route: string) => void;
    onPlay: (gameId: GameId, campaignId?: string) => void;
    onBuyCampaignTickets: (packId: string) => void;
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
  let rankingGame = $state<GameId | null>(null);
  let campaigns = $derived(player.demo.config.campaigns);
  let campaign = $derived(campaignById(campaignId, campaigns));
  let activeRankingGame = $derived(campaign ? campaignRankingGame(campaign, rankingGame) ?? 'bird' : 'bird');
  let season = $derived(currentSeason(player, now));
  let pass = $derived(currentPass(player, now));
  let vipActive = $derived(player.vipExpiresAt !== null && player.vipExpiresAt > now);
  let missions = $derived(getMissions(player, now).filter((mission) => mission.period === period && mission.entitlement === entitlement));
  let ranking = $derived(campaign ? getCampaignRanking(campaign.id, activeRankingGame, player) : []);
  let history = $derived((player.demo.history ?? []).filter((item) => item.kind === historyTab));
  let gamePlayStats = $derived(player.demo.config.games.map((game) => ({ ...game, plays: player.demo.playCounts[game.id] ?? 0 })).filter((game) => game.plays > 0).sort((left, right) => right.plays - left.plays));
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
    <p class="text-xs font-semibold text-slate-600">Campaign Ticket แยกจาก Ranked Ticket · ซื้อเป็นแพ็กด้วย AIS Point · ราคาเดโม</p>
    <section class="space-y-2 border-y border-white/80 py-3" aria-label="Campaign Tickets">
      <div class="flex items-center justify-between gap-3"><h2 class="font-black">Campaign Tickets</h2><strong>{player.demo.campaignTickets ?? 0} ใบ</strong></div>
      <div class="grid grid-cols-2 gap-2">{#each player.demo.config.campaignTicketPacks as pack (pack.id)}<button class="min-h-12 border-b border-white bg-white/50 px-2 text-left text-xs font-bold disabled:opacity-50" disabled={player.aisPoints < pack.cost} aria-label={`ซื้อ ${pack.quantity} Campaign Tickets · ${pack.cost} AIS Point`} onclick={() => onBuyCampaignTickets(pack.id)}><span class="block">{pack.label}</span><span class="text-sky-800">{pack.cost} AIS Point</span></button>{/each}</div>
      <p class="text-[10px] text-slate-500">ยอด AIS Point {player.aisPoints.toLocaleString()} · Campaign Ticket ใช้เฉพาะ Campaign ที่กำหนด</p>
    </section>
    {#each campaigns as item (item.id)}
      {@const status = getCampaignStatus(item, now)}
      <button class="grid w-full gap-3 border-y border-white/80 bg-white/60 py-4 text-left" onclick={() => onNavigate(`campaign/${item.id}`)}>
        <span class="flex items-start justify-between gap-3"><strong class="text-lg font-black text-[#332973]">{item.title}</strong><ArrowRight size={20} /></span>
        <span class="text-sm text-slate-600">{item.description}</span>
        <span class="flex flex-wrap gap-2 text-xs font-bold"><span class="rounded bg-sky-100 px-2 py-1">{item.gameIds.length ? `${item.gameIds.length} เกม` : 'กิจกรรมภายนอก'}</span><span class="rounded bg-amber-100 px-2 py-1">{status === 'upcoming' ? 'ยังไม่เริ่ม' : status === 'ended' ? 'สิ้นสุดแล้ว' : 'กำลังดำเนินการ'}</span><span class="rounded bg-white px-2 py-1">{item.entry === 'free' ? 'เข้าฟรี' : item.entry === 'ticket' ? `${item.ticketCost} Campaign Ticket / รอบ` : 'ไม่ใช้ Energy/Ticket'}</span></span>
      </button>
    {/each}
  </div>
{:else if page === 'campaign'}
  {#if campaign}
    {@const status = getCampaignStatus(campaign, now)}
    <div class="page-stack">
      <PageTitle eyebrow="CAMPAIGN DETAILS" title={campaign.title} subtitle={campaign.description}>{#snippet icon()}<Trophy size={25} />{/snippet}</PageTitle>
      {#if campaign.launchMode === 'external' || campaign.entry === 'external'}
        <section class="space-y-2 border-y border-amber-200 bg-amber-50/70 py-4" aria-label="กิจกรรมภายนอกที่ยังไม่เชื่อมต่อ"><strong>External activity · MOCK</strong><p class="text-sm">{campaign.externalUrl ? 'ลิงก์กิจกรรมภายนอกพร้อมใช้งานใน Demo' : 'ยังไม่มี URL จริง · แสดงเป็น Placeholder เท่านั้น'}</p><p class="text-xs text-slate-600">กิจกรรมนี้ไม่หัก Energy หรือ Campaign Ticket</p>{#if campaign.externalUrl}<a class="font-bold text-sky-800 underline" href={campaign.externalUrl} target="_blank" rel="noopener noreferrer">เปิดกิจกรรม <ArrowRight size={15} class="inline" /></a>{:else}<button class="min-h-10 rounded-md bg-slate-200 px-3 text-xs font-bold" disabled>ยังเปิดไม่ได้ · URL pending</button>{/if}</section>
      {:else if status === 'upcoming'}
        <p class="border-y border-sky-200 bg-sky-50/70 py-3 text-sm font-bold">Campaign ยังไม่เริ่ม · {new Date(campaign.startAt).toLocaleString('th-TH')}</p>
      {:else if status === 'ended' || player.demo.closedCampaigns?.includes(campaign.id) || player.demo.settledCampaigns?.includes(campaign.id)}
        <p class="border-y border-slate-200 bg-slate-100 py-3 text-sm font-bold">Campaign สิ้นสุดแล้ว · ตรวจรางวัลได้ใน History</p>
      {/if}
      {#if campaign.entry === 'ticket'}<section class="space-y-2 border-y border-white/80 py-3"><div class="flex items-center justify-between gap-3"><strong>Campaign Ticket ที่เหลือ</strong><strong>{player.demo.campaignTickets ?? 0}</strong></div>{#if (player.demo.campaignTickets ?? 0) < campaign.ticketCost}<p class="text-xs text-amber-800">Ticket ไม่พอ · ซื้อแพ็กด้วย AIS Point</p>{/if}<div class="grid grid-cols-2 gap-2">{#each player.demo.config.campaignTicketPacks as pack (pack.id)}<button class="min-h-11 border-b border-white bg-white/50 px-2 text-xs font-bold disabled:opacity-50" disabled={player.aisPoints < pack.cost} onclick={() => onBuyCampaignTickets(pack.id)}>{pack.label} · {pack.cost} AIS Point</button>{/each}</div></section>{/if}
      {#if campaign.gameIds.length}<div class="flex flex-wrap gap-2" role="group" aria-label="เลือกเกมใน Campaign">
        {#each campaign.gameIds as gameId (gameId)}
          <button class="min-h-10 rounded-md border border-white bg-white/80 px-3 text-xs font-bold text-[#3b337a]" aria-pressed={activeRankingGame === gameId} onclick={() => rankingGame = gameId}>{player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId}</button>
        {/each}
      </div>{/if}
      {#if campaign.gameIds.length}
      <section class="space-y-3 border-y border-white/80 py-3" aria-label="Campaign ranking">
        <div class="flex items-center justify-between gap-3"><h2 class="font-black text-[#332973]">{activeRankingGame} · High Score</h2><button class="grid size-10 place-items-center rounded-md border border-white bg-white/80 text-amber-700" aria-label="ดูของรางวัลตามอันดับ" title="ของรางวัลตามอันดับ" aria-expanded={rewardPreview} onclick={() => rewardPreview = !rewardPreview}><Gift size={19} /></button></div>
        {#if rewardPreview}<div class="space-y-2 bg-amber-50/80 p-3 text-xs">{#each campaign.rewards as tier (tier.label)}<p><strong>{tier.label}:</strong> {tier.rewards.map((reward) => reward.title).join(' · ')}</p>{/each}<small class="text-slate-500">ตัวอย่าง reward tiers แก้ไขได้ภายหลัง</small></div>{/if}
        <ol class="space-y-2">{#each ranking as entry, index (entry.playerId)}<li class="flex min-h-12 items-center gap-3 border-b border-white/70 px-2"><b class="w-7 text-center">{index + 1}</b><span class="min-w-0 flex-1 truncate font-semibold">{entry.displayName}{entry.isCurrentPlayer ? ' · คุณ' : ''}</span><strong>{entry.score.toLocaleString()}</strong></li>{/each}</ol>
        <p class="text-[11px] text-slate-500">คะแนนสูงสุดต่อเกม · คะแนนเท่ากันใช้เวลาที่ทำได้ก่อน · ไม่รวมคะแนน All-time</p>
      </section>
      {/if}
      {#if status === 'live' && !player.demo.closedCampaigns?.includes(campaign.id) && !player.demo.settledCampaigns?.includes(campaign.id) && campaign.launchMode !== 'external'}<div class="grid gap-2">{#each campaign.gameIds as gameId (gameId)}{@const lacksTicket = campaign.entry === 'ticket' && (player.demo.campaignTickets ?? 0) < campaign.ticketCost}<button class="flex min-h-12 items-center justify-between rounded-md bg-[#e6f4fb] px-3 text-sm font-bold text-[#255275] disabled:opacity-50" disabled={lacksTicket} aria-label={lacksTicket ? 'Campaign Ticket ไม่พอ · ซื้อแพ็กด้านบน' : `เล่น ${player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId}`} onclick={() => onPlay(gameId, campaign.id)}>{lacksTicket ? 'Campaign Ticket ไม่พอ · ซื้อแพ็กด้านบน' : `เล่น ${player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId} ${campaign.entry === 'ticket' ? `· ใช้ ${campaign.ticketCost} Ticket` : ''}`}<ArrowRight size={17} /></button>{/each}</div>{/if}
      <p class="text-[11px] text-slate-500">{new Date(campaign.startAt).toLocaleString('th-TH')} – {new Date(campaign.endAt).toLocaleString('th-TH')} · คะแนน/อันดับเป็นข้อมูลจำลอง</p>
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
    {#if historyTab === 'game'}
      <section class="space-y-2 border-b border-white/80 py-3" aria-label="Game play counts"><h2 class="font-black">Game play counts</h2>{#each gamePlayStats as game (game.id)}<div class="flex items-center justify-between gap-3 border-b border-white/70 py-2 text-sm"><span>{game.name}</span><strong>{game.plays} รอบ</strong></div>{:else}<p class="py-3 text-center text-xs text-slate-500">ยังไม่มีเกมที่เล่นจบ</p>{/each}</section>
      {#if player.demo.sessions.length}<ol class="divide-y divide-white/80">{#each [...player.demo.sessions].reverse() as session (session.id)}<li class="flex min-h-16 items-center justify-between gap-3 py-3"><span class="min-w-0"><strong class="block truncate text-sm">{player.demo.config.games.find((game) => game.id === session.gameId)?.name ?? session.gameId}</strong><small class="text-xs text-slate-500">{session.mode === 'campaign' ? 'Campaign' : 'Normal'} · {session.finished ? `${session.score ?? 0} คะแนน` : 'ยังไม่จบ'}</small></span><time class="shrink-0 text-[10px] text-slate-500">{new Date(session.startedAt).toLocaleDateString('th-TH')}</time></li>{/each}</ol>{:else}<p class="py-8 text-center text-sm text-slate-500">ยังไม่มีรายการเล่น</p>{/if}
      {#if history.length}<ol class="divide-y divide-white/80">{#each history as item (item.id)}<li class="flex min-h-16 items-center justify-between gap-3 py-3"><div class="min-w-0"><strong class="block truncate text-sm">{item.title}</strong><small class="block text-xs text-slate-500">{item.detail}</small></div><time class="shrink-0 text-[10px] text-slate-500">{new Date(item.at).toLocaleDateString('th-TH')}</time></li>{/each}</ol>{/if}
    {:else if history.length}<ol class="divide-y divide-white/80">{#each history as item (item.id)}<li class="flex min-h-16 items-center justify-between gap-3 py-3"><div class="min-w-0"><strong class="block truncate text-sm">{item.title}</strong><small class="block text-xs text-slate-500">{item.detail}</small></div><time class="shrink-0 text-[10px] text-slate-500">{new Date(item.at).toLocaleDateString('th-TH')}</time></li>{/each}</ol>
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
    <p class="text-xs">Energy MAX {player.demo.config.energyMax} → {player.demo.config.energyMax + player.demo.config.vipEnergyBonus} ระหว่าง VIP · เข้าเกมปกติฟรี · Continue/Campaign ไม่ฟรี · VIP ไม่ปลดล็อก Premium</p>
    {#each player.demo.config.vipPlans as plan (plan.id)}<article class="flex items-center justify-between gap-3 border-b border-white/80 py-3"><div class="min-w-0"><strong class="block">{plan.label}</strong><small class="text-xs text-slate-600">{durationLabel(plan.durationDays)} · เข้าเกมปกติฟรี · ราคาเดโม</small></div><button class="min-h-10 shrink-0 rounded-md bg-amber-100 px-3 text-xs font-black text-amber-900 disabled:opacity-50" disabled={player.aisPoints < plan.cost} aria-label={`${vipActive ? 'ต่ออายุ' : 'ซื้อ'} ${plan.label} · ${plan.cost} AIS Point`} onclick={() => onVip(plan.id)}>{plan.cost} AIS Point</button></article>{/each}
    <p class="text-[11px] text-slate-500">ราคาและระยะเวลาไม่ใช่ SKU/ข้อเสนอที่อนุมัติสำหรับ production · ต่ออายุโดยบวกเวลาที่เหลือ</p>
  </div>
{:else if page === 'shop'}
  <div class="page-stack">
    <PageTitle eyebrow="MOCK STORE · NO BILLING" title="Shop" subtitle="ยอดจำลองในเครื่องนี้เท่านั้น · ไม่มีการตัดเงินจริง">{#snippet icon()}<ShoppingBag size={25} />{/snippet}</PageTitle>
    <section class="space-y-3 border-y border-white/80 py-3"><h2 class="font-black">AIS Point · Demo top-up</h2><p class="text-xs text-slate-600">ยอดปัจจุบัน {player.aisPoints.toLocaleString()} · การเติมด้านล่างเป็น mock เท่านั้น</p><div class="grid grid-cols-2 gap-2">{#each [100, 500] as amount (amount)}<button class="min-h-12 rounded-md bg-sky-100 px-2 text-sm font-black text-sky-900" onclick={() => onAisTopUp(amount)}>จำลอง +{amount} AIS Point</button>{/each}</div></section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Energy</h2><p class="text-xs text-slate-600">{player.energy}/{player.demo.config.energyMax + (vipActive ? player.demo.config.vipEnergyBonus : 0)} · ฟื้น +1 ทุก {player.demo.config.regenMinutes} นาที · รับเกิน cap ได้</p>{#each player.demo.config.energyPacks as pack (pack.id)}<button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm disabled:opacity-50" disabled={player.aisPoints < pack.cost} onclick={() => onRefill(pack.id)}><span>+{pack.energy} Energy</span><strong>{pack.cost} AIS Point</strong></button>{/each}</section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Cosmetics & Pets</h2><div class="grid grid-cols-2 gap-2">{#each player.demo.config.shop as item (item.id)}{@const owned = (item.kind === 'avatar' ? player.ownedAvatarIds : item.kind === 'pet' ? player.ownedPetIds : item.kind === 'wing' ? player.demo.wings : player.demo.frames).includes(item.itemId)}{@const label = item.kind === 'avatar' ? AVATARS.find((entry) => entry.id === item.itemId)?.name : item.kind === 'pet' ? PETS.find((entry) => entry.id === item.itemId)?.name : item.kind === 'wing' ? WINGS.find((entry) => entry.id === item.itemId)?.name : `Profile frame · ${item.itemId}`}<button class="grid min-h-20 content-center gap-1 border-b border-white/80 bg-white/40 p-2 text-left disabled:opacity-50" disabled={owned || player.aisPoints < item.cost} onclick={() => onBuyItem(item.id)}><strong class="text-xs">{label ?? item.itemId}</strong><span class="text-[10px] text-slate-500">{item.kind} · {owned ? 'เป็นเจ้าของแล้ว' : `${item.cost} AIS Point · ราคาเดโม`}</span></button>{/each}</div></section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Entitlements & items</h2><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('vip')}><span>VIP packages</span><Crown size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={onPremium}><span>{pass.premium ? 'Premium Pass active' : `Premium Pass · ${player.demo.config.premiumPrice} AIS Point`}</span><Sparkles size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('gacha')}><span>Gacha</span><Gift size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('inventory')}><span>Inventory</span><Backpack size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('rewards')}><span>{season.name} · Battle Pass</span><Zap size={17} /></button></section>
    <p class="text-[11px] text-slate-500">ราคา AIS Point เป็นข้อมูลจำลองในเครื่อง · ไม่มีการตัดเงินจริง</p>
  </div>
{/if}
