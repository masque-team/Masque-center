<script lang="ts">
  import { ArrowLeft, ArrowRight, Backpack, CalendarCheck, Check, Clock3, Crown, Flame, Gamepad2, Gift, History, Lock, ShieldCheck, ShoppingBag, Sparkles, Trophy, Zap } from '@lucide/svelte';
  import AvatarFrame from '../components/AvatarFrame.svelte';
  import CurrencyIcon from '../components/CurrencyIcon.svelte';
  import GameButton from '../components/GameButton.svelte';
  import PageTitle from '../components/PageTitle.svelte';
  import RewardIcon from '../components/RewardIcon.svelte';
  import { AVATARS, CAMPAIGN_ARTWORK, PASS_ARTWORK, PETS, PROFILE_FRAMES, WINGS } from '../data/config';
  import { passProgress } from '../services/battlePassService';
  import { campaignById, campaignRankingGame, getCampaignRanking, getCampaignStatus } from '../services/campaignService';
  import { currentPass, currentSeason, filterPassMissions, getMissions } from '../services/demoService';
  import type { GameId, Page, PlayerState } from '../types';

  let { page, player, now, campaignId = '', onNavigate, onPlay, onBuyCampaignTickets, onVip, onPremium, onRefill, onBuyItem, onAvatar, onPet, onWing }: {
    page: Page;
    player: PlayerState;
    now: number;
    campaignId?: string;
    onNavigate: (route: string) => void;
    onPlay: (gameId: GameId, campaignId?: string) => void;
    onBuyCampaignTickets: (packId: string) => void;
    onVip: (id: string) => void;
    onPremium: () => void;
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
  let passProg = $derived(passProgress(pass.xp));
  let vipActive = $derived(player.vipExpiresAt !== null && player.vipExpiresAt > now);

  let allMissions = $derived(getMissions(player, now));
  let periodMissions = $derived(allMissions.filter((m) => m.period === period));
  let missions = $derived(filterPassMissions(player, period, entitlement, now));

  let ranking = $derived(campaign ? getCampaignRanking(campaign.id, activeRankingGame, player) : []);
  let history = $derived((player.demo.history ?? []).filter((item) => item.kind === historyTab));
  let gamePlayStats = $derived(player.demo.config.games.map((game) => ({ ...game, plays: player.demo.playCounts[game.id] ?? 0 })).filter((game) => game.plays > 0).sort((left, right) => right.plays - left.plays));
  let ownedAvatars = $derived(AVATARS.filter((item) => player.ownedAvatarIds.includes(item.id)));
  let ownedPets = $derived(PETS.filter((item) => player.ownedPetIds.includes(item.id)));
  let ownedWings = $derived(WINGS.filter((item) => player.demo.wings.includes(item.id)));
  let ownedFrames = $derived(PROFILE_FRAMES.filter((item) => (player.demo.frames ?? []).includes(item.id)));

  function durationLabel(days: number): string {
    return days < 1 ? `${Math.round(days * 24)} ชั่วโมง` : days === 1 ? '1 วัน' : `${days} วัน`;
  }

  function botFrameForRank(rank: number, isCurrentPlayer?: boolean): string | null {
    if (isCurrentPlayer) return player.demo.frameId;
    if (rank === 1) return 'celestial';
    if (rank === 2) return 'sunrise';
    if (rank === 3) return 'krathong';
    return rank % 2 === 0 ? 'ocean' : 'meadow';
  }

  function periodStats(targetPeriod: 'daily' | 'weekly' | 'season') {
    const list = allMissions.filter((m) => m.period === targetPeriod);
    const done = list.filter((m) => m.complete).length;
    return { done, total: list.length };
  }

  function entitlementStats(targetEntitlement: 'free' | 'vip' | 'premium') {
    const list = periodMissions.filter((m) => m.entitlement === targetEntitlement);
    const totalXp = list.reduce((sum, item) => sum + item.xp, 0);
    const done = list.filter((m) => m.complete).length;
    const locked = targetEntitlement === 'vip' ? !vipActive : targetEntitlement === 'premium' ? !pass.premium : false;
    return { totalXp, done, total: list.length, locked };
  }
</script>

{#if page === 'campaigns'}
  <div class="page-stack pb-8">
    <PageTitle eyebrow="LIVE EVENTS" title="Campaigns" subtitle="แข่งขันสะสมคะแนนแยกตามแคมเปญ ลุ้นรับรางวัลพิเศษเมื่อจบกิจกรรม">
      {#snippet icon()}<Trophy size={25} />{/snippet}
    </PageTitle>

    <!-- Campaign Tickets Wallet Card -->
    <section class="card-25d space-y-2.5 p-3.5" aria-label="Campaign Tickets">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <CurrencyIcon kind="campaignTicket" size={28} />
          <div>
            <h2 class="text-sm font-black text-[#1f305e]">Campaign Tickets</h2>
            <p class="text-[10.5px] font-bold text-[#526c9c]">ใช้สำหรับเข้าแคมเปญทัวร์นาเมนต์ (ไม่หัก Energy)</p>
          </div>
        </div>
        <strong class="rounded-full bg-[#fff4c2] px-3 py-1 text-xs font-black text-[#8a5200]">
          {player.demo.campaignTickets ?? 0} ใบ
        </strong>
      </div>

      <div class="grid grid-cols-2 gap-2">
        {#each player.demo.config.campaignTicketPacks as pack (pack.id)}
          <button
            class="flex items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-white to-[#f0f9ff] px-3 py-2.5 text-left shadow-[0_3px_0_#b9dcf4] disabled:opacity-50"
            disabled={player.aisPoints < pack.cost}
            aria-label={`ซื้อ ${pack.quantity} Campaign Tickets · ${pack.cost} AIS Point`}
            onclick={() => onBuyCampaignTickets(pack.id)}
          >
            <div>
              <strong class="block text-xs font-black text-[#1f305e]">{pack.label}</strong>
              <span class="inline-flex items-center gap-1 text-[11px] font-black text-[#2e6f00]">
                <CurrencyIcon kind="aisPoints" size={14} /> {pack.cost} AIS Point
              </span>
            </div>
            <ArrowRight size={15} class="text-[#0284c7]" />
          </button>
        {/each}
      </div>
    </section>

    <div class="space-y-3">
      {#each campaigns as item (item.id)}
        {@const status = getCampaignStatus(item, now)}
        {@const art = CAMPAIGN_ARTWORK[item.id] ?? 'assets/campaigns/lantern-festival.webp'}
        <button
          class="campaign-list-card w-full text-left transition-transform active:translate-y-0.5"
          onclick={() => onNavigate(`campaign/${item.id}`)}
        >
          <div class="campaign-list-banner">
            <img src={art} alt={item.title} />
            <span class="campaign-list-status">
              {status === 'upcoming' ? 'ยังไม่เริ่ม' : status === 'ended' ? 'สิ้นสุดแล้ว' : 'LIVE EVENT'}
            </span>
          </div>
          <div class="space-y-2 p-3.5">
            <div class="flex items-start justify-between gap-2">
              <strong class="text-base font-black text-[#1f305e]">{item.title}</strong>
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-[#e0f2fe] text-[#0284c7]">
                <ArrowRight size={16} />
              </span>
            </div>
            <p class="text-xs font-bold text-[#526c9c]">{item.description}</p>
            <div class="flex flex-wrap gap-1.5 text-[10.5px] font-black">
              <span class="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[#0369a1]">
                {item.gameIds.length ? `${item.gameIds.length} เกมที่ร่วมรายการ` : 'กิจกรรมพาร์ตเนอร์'}
              </span>
              <span class="rounded-full bg-[#fff3c4] px-2.5 py-0.5 text-[#8a5200]">
                {item.entry === 'free' ? 'เข้าฟรี (0 Energy)' : item.entry === 'ticket' ? `ใช้ ${item.ticketCost} Ticket / รอบ` : 'ไม่ใช้ Energy/Ticket'}
              </span>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>

{:else if page === 'campaign'}
  {#if campaign}
    {@const status = getCampaignStatus(campaign, now)}
    {@const art = CAMPAIGN_ARTWORK[campaign.id] ?? 'assets/campaigns/lantern-festival.webp'}
    <div class="page-stack pb-8">
      <div class="flex items-center justify-between">
        <button class="inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-white bg-white/90 px-3 text-xs font-black text-[#0284c7] shadow-2xs" onclick={() => onNavigate('campaigns')}>
          <ArrowLeft size={14} /> รวมแคมเปญ
        </button>
        <span class="rounded-full border border-white bg-[#fff3c4] px-2.5 py-1 text-[10.5px] font-black text-[#8a5200]">
          {status === 'upcoming' ? 'UPCOMING' : status === 'ended' ? 'ENDED' : 'LIVE NOW'}
        </span>
      </div>

      <div class="campaign-list-card overflow-hidden">
        <div class="campaign-list-banner">
          <img src={art} alt={campaign.title} />
        </div>
        <div class="space-y-1.5 p-3.5">
          <h1 class="text-lg font-black text-[#1f305e]">{campaign.title}</h1>
          <p class="text-xs font-bold text-[#526c9c]">{campaign.description}</p>
          <p class="text-[10.5px] font-bold text-[#64748b]">
            ⏱ {new Date(campaign.startAt).toLocaleDateString('th-TH')} – {new Date(campaign.endAt).toLocaleDateString('th-TH')}
          </p>
        </div>
      </div>

      {#if campaign.launchMode === 'external' || campaign.entry === 'external'}
        <section class="card-25d space-y-2 p-3.5" aria-label="กิจกรรมภายนอกที่ยังไม่เชื่อมต่อ">
          <strong class="text-sm font-black text-[#7c4a03]">External Partner Activity · MOCK</strong>
          <p class="text-xs font-bold text-[#526c9c]">{campaign.externalUrl ? 'ลิงก์กิจกรรมพาร์ตเนอร์พร้อมใช้งานใน Demo' : 'ยังไม่มี URL จริง · แสดงเป็น Placeholder สำหรับกิจกรรมพาร์ตเนอร์'}</p>
          <p class="text-[11px] font-bold text-[#64748b]">กิจกรรมนี้ไม่หัก Energy หรือ Campaign Ticket</p>
          {#if campaign.externalUrl}
            <a class="btn-gold-3d inline-flex min-h-10 items-center gap-1.5 px-4 text-xs" href={campaign.externalUrl} target="_blank" rel="noopener noreferrer">
              เปิดหน้ากิจกรรม <ArrowRight size={15} />
            </a>
          {:else}
            <button class="min-h-10 rounded-xl bg-slate-200 px-3.5 text-xs font-black text-slate-600" disabled>ยังเปิดไม่ได้ · URL pending</button>
          {/if}
        </section>
      {:else if status === 'upcoming'}
        <p class="card-25d p-3.5 text-xs font-black text-[#0369a1]">Campaign ยังไม่เริ่ม · เปิดให้เล่น {new Date(campaign.startAt).toLocaleString('th-TH')}</p>
      {:else if status === 'ended' || player.demo.closedCampaigns?.includes(campaign.id) || player.demo.settledCampaigns?.includes(campaign.id)}
        <p class="card-25d p-3.5 text-xs font-black text-[#475569]">Campaign สิ้นสุดแล้ว · รางวัลจัดส่งเข้ากระเป๋าอัตโนมัติ ตรวจดูได้ใน History</p>
      {/if}

      {#if campaign.entry === 'ticket'}
        <section class="card-25d space-y-2 p-3.5">
          <div class="flex items-center justify-between gap-3 text-xs">
            <strong class="font-black text-[#1f305e]">Campaign Ticket คงเหลือ</strong>
            <strong class="rounded-full bg-[#fff3c4] px-2.5 py-0.5 font-black text-[#8a5200]">{player.demo.campaignTickets ?? 0} ใบ</strong>
          </div>
          {#if (player.demo.campaignTickets ?? 0) < campaign.ticketCost}
            <p class="text-[11px] font-bold text-amber-800">Ticket ไม่พอ · ซื้อแพ็กเพิ่มด้วย AIS Point</p>
          {/if}
          <div class="grid grid-cols-2 gap-2">
            {#each player.demo.config.campaignTicketPacks as pack (pack.id)}
              <button
                class="flex min-h-10 items-center justify-between rounded-xl border border-sky-200 bg-white px-2.5 text-xs font-black text-[#1f305e] disabled:opacity-50"
                disabled={player.aisPoints < pack.cost}
                onclick={() => onBuyCampaignTickets(pack.id)}
              >
                <span>{pack.label}</span>
                <span class="inline-flex items-center gap-1 text-[#2e6f00]">
                  <CurrencyIcon kind="aisPoints" size={13} /> {pack.cost}
                </span>
              </button>
            {/each}
          </div>
        </section>
      {/if}

      {#if campaign.gameIds.length}
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="เลือกเกมใน Campaign">
          {#each campaign.gameIds as gameId (gameId)}
            <button
              class={['min-h-9 rounded-full border-2 px-3.5 text-xs font-black transition-all', activeRankingGame === gameId ? 'border-white bg-[#0284c7] text-white shadow-[0_3px_0_#0369a1]' : 'border-white bg-white/90 text-[#476596]']}
              aria-pressed={activeRankingGame === gameId}
              onclick={() => (rankingGame = gameId)}
            >
              {player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId}
            </button>
          {/each}
        </div>

        <section class="card-25d space-y-3 p-3.5" aria-label="Campaign ranking">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] font-black text-[#0284c7] uppercase">CAMPAIGN LEADERBOARD</p>
              <h2 class="text-sm font-black text-[#1f305e]">{player.demo.config.games.find((g) => g.id === activeRankingGame)?.name ?? activeRankingGame} · High Score</h2>
            </div>
            <button
              class="inline-flex min-h-9 items-center gap-1 rounded-xl border border-amber-300 bg-[#fff8dc] px-2.5 text-xs font-black text-[#8a5200]"
              aria-label="ดูของรางวัลตามอันดับ"
              aria-expanded={rewardPreview}
              onclick={() => (rewardPreview = !rewardPreview)}
            >
              <Gift size={15} /> รางวัลอันดับ
            </button>
          </div>

          {#if rewardPreview}
            <div class="space-y-1.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs">
              {#each campaign.rewards as tier (tier.label)}
                <div class="flex items-center justify-between gap-2">
                  <strong class="font-black text-[#783f00]">{tier.label}</strong>
                  <span class="font-bold text-[#1f305e]">{tier.rewards.map((reward) => reward.title).join(' + ')}</span>
                </div>
              {/each}
            </div>
          {/if}

          <ol class="space-y-2">
            {#each ranking as entry, index (entry.playerId)}
              {@const rank = index + 1}
              <li
                class={[
                  'flex min-h-14 items-center gap-2.5 rounded-2xl border px-2.5 py-1.5',
                  entry.isCurrentPlayer ? 'border-sky-300 bg-sky-50/90' : rank <= 3 ? 'border-amber-200 bg-[#fffdf5]' : 'border-slate-100 bg-white/80',
                ]}
              >
                <b class="w-6 text-center text-xs font-black text-[#476596]">#{rank}</b>
                <AvatarFrame
                  avatarId={entry.isCurrentPlayer ? player.avatarId : (['mimi', 'luna', 'aqua', 'nyx'][(rank - 1) % 4] as any)}
                  frameId={botFrameForRank(rank, entry.isCurrentPlayer)}
                  size="sm"
                  rank={rank <= 3 ? rank : undefined}
                />
                <div class="min-w-0 flex-1">
                  <strong class="block truncate text-xs font-black text-[#1f305e]">
                    {entry.displayName}{entry.isCurrentPlayer ? ' · คุณ' : ''}
                  </strong>
                  <small class="text-[10px] font-bold text-[#64748b]">
                    {rank === 1 ? 'Legendary Frame' : rank <= 3 ? 'Epic / Seasonal Frame' : 'Campaign Challenger'}
                  </small>
                </div>
                <strong class="text-xs font-black tabular-nums text-[#8a5200]">{entry.score.toLocaleString()}</strong>
              </li>
            {/each}
          </ol>
          <p class="text-[10.5px] font-bold text-[#64748b]">คิดคะแนนสูงสุดต่อเกม · คะแนนเท่ากันตัดสินที่เวลาที่ทำได้ก่อน</p>
        </section>
      {/if}

      {#if status === 'live' && !player.demo.closedCampaigns?.includes(campaign.id) && !player.demo.settledCampaigns?.includes(campaign.id) && campaign.launchMode !== 'external'}
        <div class="grid gap-2">
          {#each campaign.gameIds as gameId (gameId)}
            {@const lacksTicket = campaign.entry === 'ticket' && (player.demo.campaignTickets ?? 0) < campaign.ticketCost}
            <button
              class="btn-gold-3d flex min-h-12 w-full items-center justify-between px-4 text-xs disabled:opacity-50"
              disabled={lacksTicket}
              onclick={() => onPlay(gameId, campaign.id)}
            >
              <span>
                {lacksTicket
                  ? 'Campaign Ticket ไม่พอ · ซื้อแพ็กด้านบน'
                  : `เข้าเล่น ${player.demo.config.games.find((game) => game.id === gameId)?.name ?? gameId} ${campaign.entry === 'ticket' ? `(ใช้ ${campaign.ticketCost} Ticket)` : '(เล่นฟรี 0 Energy)'}`}
              </span>
              <ArrowRight size={16} />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="page-stack">
      <PageTitle eyebrow="CAMPAIGN" title="ไม่พบ Campaign" />
      <GameButton variant="ghost" onclick={() => onNavigate('campaigns')}>กลับไปหน้ารวม Campaign</GameButton>
    </div>
  {/if}

{:else if page === 'missions'}
  <!-- 3. Battle Pass — Mission Filter Redesign -->
  {@const currentEntitlementInfo = entitlementStats(entitlement)}
  <div class="page-stack pb-8 text-[#1f305e]">
    <div class="flex items-center justify-between gap-2">
      <button
        class="inline-flex min-h-9 items-center gap-1.5 rounded-full border-2 border-white bg-white/90 px-3 text-xs font-black text-[#0284c7] shadow-2xs"
        onclick={() => onNavigate('rewards')}
      >
        <ArrowLeft size={14} /> กลับหน้า Battle Pass
      </button>
      <span class="inline-flex items-center gap-1 rounded-full bg-[#1f305e] px-3 py-1 text-[11px] font-black text-[#ffd86e]">
        <Sparkles size={12} /> LV.{passProg.level} · {passProg.complete ? 'MAX' : `${passProg.withinLevel}/100 XP`}
      </span>
    </div>

    <PageTitle eyebrow="BATTLE PASS PROGRESSION" title="Pass Missions" subtitle="ทำภารกิจสะสม XP ปลดล็อกเลเวลซีซันอัตโนมัติเมื่อครบเป้าหมาย">
      {#snippet icon()}<Sparkles size={25} />{/snippet}
    </PageTitle>

    <!-- Primary Filter: Segmented Control for Daily / Weekly / Season -->
    <div class="mission-segmented-control" role="tablist" aria-label="ช่วงเวลาภารกิจ">
      {#each [
        { id: 'daily', label: 'Daily', sub: 'รายวัน', Icon: CalendarCheck },
        { id: 'weekly', label: 'Weekly', sub: 'รายสัปดาห์', Icon: Flame },
        { id: 'season', label: 'Season', sub: 'ตลอดซีซัน', Icon: Trophy },
      ] as item (item.id)}
        {@const stat = periodStats(item.id as typeof period)}
        {@const active = period === item.id}
        <button
          role="tab"
          aria-selected={active}
          class="segment-pill"
          class:active
          onclick={() => (period = item.id as typeof period)}
        >
          <item.Icon size={15} />
          <div class="text-left leading-tight">
            <strong class="block text-xs font-black">{item.label}</strong>
            <small class="block text-[9.5px] font-bold opacity-80">{stat.done}/{stat.total} สำเร็จ</small>
          </div>
        </button>
      {/each}
    </div>

    <!-- Secondary Filter: Entitlement Tier Cards for Free / VIP / Premium -->
    <div class="entitlement-tier-grid" role="tablist" aria-label="กลุ่มสิทธิ์ภารกิจ">
      {#each [
        { id: 'free', label: 'Free Missions', badge: 'เปิดให้ทุกคน', tone: 'free', Icon: ShieldCheck },
        { id: 'vip', label: 'VIP Bonus', badge: vipActive ? 'VIP Active' : 'ต้องมี VIP', tone: 'vip', Icon: Crown },
        { id: 'premium', label: 'Premium Track', badge: pass.premium ? 'Unlocked' : 'Premium Pass', tone: 'premium', Icon: Sparkles },
      ] as tier (tier.id)}
        {@const info = entitlementStats(tier.id as typeof entitlement)}
        {@const selected = entitlement === tier.id}
        <button
          role="tab"
          aria-selected={selected}
          class="entitlement-card tone-{tier.tone}"
          class:selected
          class:locked={info.locked}
          onclick={() => (entitlement = tier.id as typeof entitlement)}
        >
          <div class="flex items-center justify-between gap-1">
            <span class="entitlement-icon-badge">
              {#if info.locked}
                <Lock size={12} />
              {:else}
                <tier.Icon size={13} />
              {/if}
            </span>
            <span class="entitlement-xp-tag">+{info.totalXp} XP</span>
          </div>
          <strong class="mt-1 block truncate text-xs font-black">{tier.label}</strong>
          <small class="block truncate text-[9.5px] font-extrabold opacity-85">
            {info.locked ? `🔒 ${tier.badge}` : `✓ ${info.done}/${info.total} สำเร็จ`}
          </small>
        </button>
      {/each}
    </div>

    <!-- Contextual Entitlement Banner (shows clearly if current tier is locked or active) -->
    {#if currentEntitlementInfo.locked}
      <div class="locked-entitlement-banner">
        <div class="flex items-center gap-2.5">
          <span class="grid size-10 shrink-0 place-items-center rounded-2xl border-2 border-white bg-[#fff0c2] text-[#8a5200]">
            <Lock size={18} />
          </span>
          <div class="min-w-0 flex-1">
            <strong class="block text-xs font-black text-[#5c3400]">
              ภารกิจกลุ่ม {entitlement === 'vip' ? 'VIP Royal Pass' : 'Premium Battle Pass'} ล็อกอยู่
            </strong>
            <p class="text-[10.5px] font-bold text-[#7c4a03]">
              {entitlement === 'vip'
                ? 'เปิดใช้งาน VIP เพื่อปลดล็อกภารกิจโบนัส VIP + เล่นเกมปกติฟรี (0 Energy)'
                : 'ปลดล็อก Premium Pass เพื่อทำภารกิจ XP พิเศษและรับรางวัลแถว Premium'}
              · แยกสิทธิ์จากกันชัดเจน
            </p>
          </div>
        </div>
        <GameButton
          size="sm"
          variant="gold"
          onclick={() => (entitlement === 'vip' ? onNavigate('vip') : onPremium())}
        >
          {entitlement === 'vip' ? 'ดูแพ็กเกจ VIP' : 'ปลดล็อก Premium'}
        </GameButton>
      </div>
    {/if}

    <!-- Mission Cards List -->
    <div class="space-y-2.5">
      {#each missions as mission (mission.key)}
        {@const pct = Math.min(100, Math.round((mission.count / Math.max(1, mission.target)) * 100))}
        <article
          class="mission-card-25d"
          class:is-complete={mission.complete}
          class:is-locked={mission.locked}
        >
          <div class="mission-art-box">
            {#if mission.trigger === 'checkin'}
              <img class="size-9 object-contain" src="assets/badges/checkin-streak-7.png" alt="" />
            {:else}
              <img class="size-9 object-contain" src={PASS_ARTWORK.crest ?? 'assets/pass/season-crest.png'} alt="" />
            {/if}
          </div>

          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-1.5">
                  <h2 class="truncate text-sm font-black text-[#1f305e]">{mission.title}</h2>
                  <span class="mission-tier-chip tier-{mission.entitlement}">
                    {mission.entitlement.toUpperCase()}
                  </span>
                </div>
                <p class="text-xs font-bold text-[#526c9c]">{mission.description}</p>
              </div>
              <span class="mission-xp-pill">
                <Sparkles size={12} /> +{mission.xp} XP
              </span>
            </div>

            <div class="flex items-center gap-2">
              <progress class="h-2.5 min-w-0 flex-1" value={mission.count} max={mission.target}></progress>
              <small class="shrink-0 text-xs font-black tabular-nums text-[#0369a1]">
                {mission.count}/{mission.target} ({pct}%)
              </small>
            </div>

            <div class="flex items-center justify-between gap-2 pt-0.5">
              {#if mission.locked}
                <span class="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#92400e]">
                  <Lock size={12} /> ต้องมีสิทธิ์ {mission.entitlement === 'vip' ? 'VIP' : 'Premium Pass'} ก่อนเริ่มสะสม
                </span>
                <button
                  class="text-[11px] font-black text-[#0284c7] underline"
                  onclick={() => onNavigate(mission.entitlement === 'vip' ? 'vip' : 'rewards')}
                >
                  ดูสิทธิ์
                </button>
              {:else if mission.complete}
                <span class="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10.5px] font-black text-[#166534]">
                  <Check size={13} strokeWidth={3} /> Completed · รับ +{mission.xp} XP อัตโนมัติแล้ว
                </span>
              {:else}
                <span class="text-[11px] font-bold text-[#64748b]">
                  อัปเดตอัตโนมัติเมื่อ{mission.trigger === 'game' ? 'เล่นเกมจบ' : 'เช็กอินรายวัน'}
                </span>
                <button
                  class="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[10.5px] font-black text-[#0284c7]"
                  onclick={() => onNavigate(mission.trigger === 'game' ? 'hub' : 'achievements')}
                >
                  <Gamepad2 size={12} /> ไปทำภารกิจ
                </button>
              {/if}
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>

{:else if page === 'history'}
  <div class="page-stack pb-8">
    <PageTitle eyebrow="PLAYER ACTIVITY" title="History" subtitle="ประวัติการเล่นเกม การใช้ AIS Point และรางวัลที่ได้รับ">{#snippet icon()}<History size={25} />{/snippet}</PageTitle>
    <div class="mission-segmented-control" role="tablist" aria-label="ประเภทประวัติ">
      {#each [{ id: 'game', label: 'Games' }, { id: 'purchase', label: 'Purchases' }, { id: 'reward', label: 'Rewards' }] as item (item.id)}
        <button role="tab" aria-selected={historyTab === item.id} class="segment-pill justify-center py-2" class:active={historyTab === item.id} onclick={() => (historyTab = item.id as typeof historyTab)}>
          <strong class="text-xs font-black">{item.label}</strong>
        </button>
      {/each}
    </div>
    {#if historyTab === 'game'}
      <section class="card-25d space-y-2 p-3.5" aria-label="Game play counts">
        <h2 class="text-sm font-black text-[#1f305e]">สถิติจำนวนรอบที่เล่นจบ</h2>
        {#each gamePlayStats as game (game.id)}
          <div class="flex items-center justify-between gap-3 border-b border-sky-100 py-1.5 text-xs font-bold">
            <span>{game.name}</span>
            <strong class="font-black text-[#0284c7]">{game.plays} รอบ</strong>
          </div>
        {:else}
          <p class="py-3 text-center text-xs font-bold text-slate-500">ยังไม่มีเกมที่เล่นจบ</p>
        {/each}
      </section>
      {#if player.demo.sessions.length}
        <ol class="card-25d divide-y divide-sky-100 px-3.5">
          {#each [...player.demo.sessions].reverse() as session (session.id)}
            <li class="flex min-h-14 items-center justify-between gap-3 py-2.5">
              <span class="min-w-0">
                <strong class="block truncate text-xs font-black text-[#1f305e]">{player.demo.config.games.find((game) => game.id === session.gameId)?.name ?? session.gameId}</strong>
                <small class="text-[11px] font-bold text-slate-500">{session.mode === 'campaign' ? 'Campaign' : 'Normal'} · {session.finished ? `${(session.score ?? 0).toLocaleString()} คะแนน` : 'ยังไม่จบ'}</small>
              </span>
              <time class="shrink-0 text-[10px] font-bold text-slate-500">{new Date(session.startedAt).toLocaleDateString('th-TH')}</time>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="card-25d py-8 text-center text-xs font-bold text-slate-500">ยังไม่มีรายการเล่น</p>
      {/if}
    {:else if history.length}
      <ol class="card-25d divide-y divide-sky-100 px-3.5">
        {#each history as item (item.id)}
          <li class="flex min-h-14 items-center justify-between gap-3 py-2.5">
            <div class="min-w-0">
              <strong class="block truncate text-xs font-black text-[#1f305e]">{item.title}</strong>
              <small class="block text-[11px] font-bold text-slate-500">{item.detail}</small>
            </div>
            <time class="shrink-0 text-[10px] font-bold text-slate-500">{new Date(item.at).toLocaleDateString('th-TH')}</time>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="card-25d py-8 text-center text-xs font-bold text-slate-500">ยังไม่มีรายการในหมวดนี้</p>
    {/if}
  </div>

{:else if page === 'inventory'}
  <div class="page-stack pb-8">
    <PageTitle eyebrow="OWNED COSMETICS" title="Inventory" subtitle="คลังของสะสม Avatar, Pet, Collectible Frame และ Wings">{#snippet icon()}<Backpack size={25} />{/snippet}</PageTitle>

    <section class="card-25d space-y-2 p-3.5">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-black text-[#1f305e]">Collectible Profile Frames ({ownedFrames.length}/{PROFILE_FRAMES.length})</h2>
        <button class="text-xs font-black text-[#0284c7] underline" onclick={() => onNavigate('profile')}>ตั้งค่าใน Profile</button>
      </div>
      {#if ownedFrames.length}
        <div class="grid grid-cols-2 gap-2">
          {#each ownedFrames as frame (frame.id)}
            <div class="flex items-center gap-2 rounded-xl border border-sky-100 bg-white p-2">
              <img class="size-10 object-contain" src={frame.imagePath} alt={frame.name} />
              <div class="min-w-0">
                <strong class="block truncate text-xs font-black text-[#1f305e]">{frame.name}</strong>
                <small class="text-[10px] font-bold text-[#8a5200]">{frame.rarity}{player.demo.frameId === frame.id ? ' · ใช้อยู่' : ''}</small>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-xs font-bold text-slate-500">ยังไม่มีกรอบรูปสะสม · ปลดล็อกจาก Battle Pass, Campaign หรือแลกใน Shop</p>
      {/if}
    </section>

    <section class="card-25d space-y-2 p-3.5">
      <h2 class="text-sm font-black text-[#1f305e]">Avatars ({ownedAvatars.length})</h2>
      {#each ownedAvatars as item (item.id)}
        <div class="flex min-h-11 items-center justify-between gap-3 border-b border-sky-100 py-1.5 text-xs">
          <span class="font-bold">{item.name} ({item.rarity}){player.avatarId === item.id ? ' · ใช้อยู่' : ''}</span>
          <button class="rounded-full bg-[#e0f2fe] px-3 py-1 font-black text-[#0284c7]" onclick={() => onAvatar(item.id)}>{player.avatarId === item.id ? 'Equipped' : 'สวมใส่'}</button>
        </div>
      {/each}
    </section>

    <section class="card-25d space-y-2 p-3.5">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-black text-[#1f305e]">Pets ({ownedPets.length})</h2>
        <button class="text-xs font-bold text-slate-500 underline" onclick={() => onPet(null)}>ถอด Pet</button>
      </div>
      {#each ownedPets as item (item.id)}
        <div class="flex min-h-11 items-center justify-between gap-3 border-b border-sky-100 py-1.5 text-xs">
          <span class="font-bold">{item.name} ({item.rarity}){player.petId === item.id ? ' · ใช้อยู่' : ''}</span>
          <button class="rounded-full bg-[#e0f2fe] px-3 py-1 font-black text-[#0284c7]" onclick={() => onPet(item.id)}>{player.petId === item.id ? 'Equipped' : 'สวมใส่'}</button>
        </div>
      {/each}
    </section>

    <section class="card-25d space-y-2 p-3.5">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-black text-[#1f305e]">Wings ({ownedWings.length})</h2>
        <button class="text-xs font-bold text-slate-500 underline" onclick={() => onWing(null)}>ถอดปีก</button>
      </div>
      {#each ownedWings as item (item.id)}
        <div class="flex min-h-11 items-center justify-between gap-3 border-b border-sky-100 py-1.5 text-xs">
          <span class="font-bold">{item.name}{player.demo.wingId === item.id ? ' · ใช้อยู่' : ''}</span>
          <button class="rounded-full bg-[#e0f2fe] px-3 py-1 font-black text-[#0284c7]" onclick={() => onWing(item.id)}>{player.demo.wingId === item.id ? 'Equipped' : 'สวมใส่'}</button>
        </div>
      {/each}
    </section>
  </div>

{:else if page === 'vip'}
  <div class="page-stack pb-8">
    <PageTitle eyebrow="VIP MEMBERSHIP" title="VIP Royal Pass" subtitle="เล่นเกมปกติฟรี (0 Energy) และเพิ่มเพดาน Energy สูงสุดเป็น 30">{#snippet icon()}<Crown size={25} />{/snippet}</PageTitle>

    <div class="card-gold-25d space-y-2 p-4">
      <div class="flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-[#783f00]">
          {#if vipActive}
            <Check size={14} class="text-emerald-600" /> VIP ใช้งานอยู่
          {:else}
            <Clock3 size={14} /> ยังไม่ได้เปิดใช้งาน VIP
          {/if}
        </span>
        <CurrencyIcon kind="vipCrest" size={20} />
      </div>
      {#if vipActive}
        <p class="text-xs font-black text-[#593100]">ใช้สิทธิ์ได้ถึง {new Date(player.vipExpiresAt!).toLocaleString('th-TH')}</p>
      {/if}
      <p class="text-xs font-bold text-[#784300]">
        • เพิ่มความจุ Energy MAX {player.demo.config.energyMax} → {player.demo.config.energyMax + player.demo.config.vipEnergyBonus}<br />
        • ยกเว้นค่าเข้าเล่นเกมปกติ (Normal Play ฟรี)<br />
        • ไม่รวมค่า Continue, Campaign Ticket หรือ Battle Pass Premium
      </p>
    </div>

    <div class="space-y-2.5">
      {#each player.demo.config.vipPlans as plan (plan.id)}
        <article class="card-25d flex items-center justify-between gap-3 p-3.5">
          <div class="min-w-0">
            <strong class="block text-sm font-black text-[#1f305e]">{plan.label}</strong>
            <small class="text-xs font-bold text-[#526c9c]">{durationLabel(plan.durationDays)} · เข้าเกมปกติฟรี · ต่อเวลาเพิ่มจากที่เหลือ</small>
          </div>
          <button
            class="btn-gold-3d inline-flex min-h-10 shrink-0 items-center gap-1.5 px-3.5 text-xs disabled:opacity-50"
            disabled={player.aisPoints < plan.cost}
            aria-label={`${vipActive ? 'ต่ออายุ' : 'ซื้อ'} ${plan.label} · ${plan.cost} AIS Point`}
            onclick={() => onVip(plan.id)}
          >
            <CurrencyIcon kind="aisPoints" size={16} />
            {plan.cost} AIS Point
          </button>
        </article>
      {/each}
    </div>
  </div>

{:else if page === 'shop'}
  <div class="page-stack">
    <PageTitle eyebrow="MOCK STORE · NO BILLING" title="Shop" subtitle="ยอดจำลองในเครื่องนี้เท่านั้น · ไม่มีการตัดเงินจริง">{#snippet icon()}<ShoppingBag size={25} />{/snippet}</PageTitle>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Energy</h2><p class="text-xs text-slate-600">{player.energy}/{player.demo.config.energyMax + (vipActive ? player.demo.config.vipEnergyBonus : 0)} · ฟื้น +1 ทุก {player.demo.config.regenMinutes} นาที · รับเกิน cap ได้</p>{#each player.demo.config.energyPacks as pack (pack.id)}<button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm disabled:opacity-50" disabled={player.aisPoints < pack.cost} onclick={() => onRefill(pack.id)}><span>+{pack.energy} Energy</span><strong>{pack.cost} AIS Point</strong></button>{/each}</section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Cosmetics & Pets</h2><div class="grid grid-cols-2 gap-2">{#each player.demo.config.shop as item (item.id)}{@const owned = (item.kind === 'avatar' ? player.ownedAvatarIds : item.kind === 'pet' ? player.ownedPetIds : item.kind === 'wing' ? player.demo.wings : player.demo.frames).includes(item.itemId)}{@const label = item.kind === 'avatar' ? AVATARS.find((entry) => entry.id === item.itemId)?.name : item.kind === 'pet' ? PETS.find((entry) => entry.id === item.itemId)?.name : item.kind === 'wing' ? WINGS.find((entry) => entry.id === item.itemId)?.name : `Profile frame · ${item.itemId}`}<button class="grid min-h-20 content-center gap-1 border-b border-white/80 bg-white/40 p-2 text-left disabled:opacity-50" disabled={owned || player.aisPoints < item.cost} onclick={() => onBuyItem(item.id)}><strong class="text-xs">{label ?? item.itemId}</strong><span class="text-[10px] text-slate-500">{item.kind} · {owned ? 'เป็นเจ้าของแล้ว' : `${item.cost} AIS Point · ราคาเดโม`}</span></button>{/each}</div></section>
    <section class="space-y-2 border-b border-white/80 py-3"><h2 class="font-black">Entitlements & items</h2><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('vip')}><span>VIP packages</span><Crown size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={onPremium}><span>{pass.premium ? 'Premium Pass active' : `Premium Pass · ${player.demo.config.premiumPrice} AIS Point`}</span><Sparkles size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('gacha')}><span>Gacha</span><Gift size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('inventory')}><span>Inventory</span><Backpack size={17} /></button><button class="flex min-h-11 w-full items-center justify-between border-t border-white/70 px-2 text-sm" onclick={() => onNavigate('rewards')}><span>{season.name} · Battle Pass</span><Zap size={17} /></button></section>
    <p class="text-[11px] text-slate-500">ราคา AIS Point เป็นข้อมูลจำลองในเครื่อง · ไม่มีการตัดเงินจริง</p>
  </div>
{/if}

<style>
  .campaign-list-card {
    overflow: hidden;
    border-radius: 22px;
    border: 2.5px solid #fff;
    background: linear-gradient(180deg, #ffffff 0%, #f2f9ff 100%);
    box-shadow: 0 5px 0 #a9d4f5, 0 10px 20px rgba(25, 70, 130, 0.12);
  }
  .campaign-list-banner {
    position: relative;
    aspect-ratio: 16 / 8.2;
    width: 100%;
    overflow: hidden;
    background: #172554;
  }
  .campaign-list-banner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .campaign-list-status {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.8);
    color: #fde047;
    border: 1px solid rgba(255, 255, 255, 0.65);
    font-size: 10px;
    font-weight: 900;
  }

  /* Segmented Control for Daily / Weekly / Season */
  .mission-segmented-control {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    padding: 5px;
    border-radius: 20px;
    border: 2px solid #fff;
    background: linear-gradient(180deg, #dff1ff 0%, #cde8fe 100%);
    box-shadow: inset 0 2px 4px rgba(15, 65, 120, 0.12), 0 3px 0 #a9d3f2;
  }
  .segment-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 6px 8px;
    border-radius: 15px;
    color: #365a8a;
    transition: all 0.18s ease;
  }
  .segment-pill.active {
    background: linear-gradient(180deg, #29b6f6 0%, #0284c7 100%);
    color: #fff;
    border: 1.5px solid #fff;
    box-shadow: 0 3px 0 #0369a1, 0 5px 10px rgba(2, 132, 199, 0.25);
  }

  /* Secondary Entitlement Cards for Free / VIP / Premium */
  .entitlement-tier-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }
  .entitlement-card {
    position: relative;
    padding: 9px 9px 8px;
    border-radius: 18px;
    border: 2px solid #fff;
    text-align: left;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .entitlement-card:active { transform: translateY(2px); }
  .entitlement-card.tone-free {
    background: linear-gradient(180deg, #ffffff 0%, #e8f5ff 100%);
    color: #1e3a6d;
    box-shadow: 0 3px 0 #b3d7f2;
  }
  .entitlement-card.tone-vip {
    background: linear-gradient(180deg, #fffef6 0%, #fff0bd 100%);
    color: #6b3d00;
    box-shadow: 0 3px 0 #dfc068;
  }
  .entitlement-card.tone-premium {
    background: linear-gradient(180deg, #faf5ff 0%, #ede0ff 100%);
    color: #4c1d95;
    box-shadow: 0 3px 0 #c4b5fd;
  }
  .entitlement-card.selected {
    outline: 2.5px solid #0284c7;
    transform: translateY(-2px);
  }
  .entitlement-card.tone-vip.selected { outline-color: #d97706; }
  .entitlement-card.tone-premium.selected { outline-color: #7c3aed; }

  .entitlement-icon-badge {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  .entitlement-xp-tag {
    font-size: 9.5px;
    font-weight: 900;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
  }

  .locked-entitlement-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 12px;
    border-radius: 20px;
    border: 2px solid #fde68a;
    background: linear-gradient(135deg, #fffdf4 0%, #ffefc2 100%);
    box-shadow: 0 4px 0 #e2be62;
  }

  .mission-card-25d {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 12px;
    border-radius: 20px;
    border: 2px solid #fff;
    background: linear-gradient(180deg, #ffffff 0%, #f3faff 100%);
    box-shadow: 0 4px 0 #b8daf2, 0 6px 14px rgba(30, 75, 130, 0.08);
  }
  .mission-card-25d.is-complete {
    background: linear-gradient(180deg, #f7fee7 0%, #dcfce7 100%);
    box-shadow: 0 4px 0 #86efac;
  }
  .mission-card-25d.is-locked {
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    box-shadow: 0 4px 0 #cbd5e1;
    opacity: 0.92;
  }
  .mission-art-box {
    display: grid;
    place-items: center;
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    border-radius: 16px;
    border: 2px solid #fff;
    background: linear-gradient(160deg, #fff7d6, #ffe082);
    box-shadow: 0 3px 0 #d6a539;
  }
  .mission-xp-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    background: linear-gradient(135deg, #fff3b8, #ffd24c);
    border: 1.5px solid #fff;
    color: #6b3d00;
    font-size: 11px;
    font-weight: 900;
    box-shadow: 0 2px 0 #cfa032;
  }
  .mission-tier-chip {
    padding: 1px 6px;
    border-radius: 999px;
    font-size: 8.5px;
    font-weight: 900;
  }
  .mission-tier-chip.tier-free { background: #e0f2fe; color: #0369a1; }
  .mission-tier-chip.tier-vip { background: #fef3c7; color: #92400e; }
  .mission-tier-chip.tier-premium { background: #ede9fe; color: #5b21b6; }
</style>
