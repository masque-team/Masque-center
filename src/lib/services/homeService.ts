import { CAMPAIGN_ARTWORK } from '../data/config';
import type { DemoReward, PlayerState } from '../types';
import { getCampaignStatus } from './campaignService';
import { currentSeason } from './demoService';

export function entryHash(hash: string): string {
  return hash && hash !== '#' ? hash : '#hub';
}

export function formatRemainingTime(targetMs: number, currentMs: number): string {
  const diff = Math.max(0, targetMs - currentMs);
  if (diff <= 0) return 'สิ้นสุดแล้ว';
  const totalHours = Math.floor(diff / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `เหลือ ${days} วัน ${hours} ชม.`;
  if (hours > 0) return `เหลือ ${hours} ชม. ${mins} นาที`;
  return `เหลือ ${Math.max(1, mins)} นาที`;
}

export function dashboardCampaigns(player: PlayerState, now: number) {
  const configured = player.demo.config.campaigns.map((camp) => {
    const state = getCampaignStatus(camp, now);
    const topReward: DemoReward = camp.rewards[0]?.rewards[0] ?? { title: 'ยังไม่มีรางวัลที่ประกาศ', type: 'badge' };
    const isExternal = camp.launchMode === 'external';
    const isTicket = camp.entry === 'ticket';
    return {
      id: camp.id,
      title: camp.title,
      themeTag: camp.id === 'starlight-sprint' ? 'GAME CHAMPIONSHIP' : isExternal ? 'LOY KRATHONG FESTIVAL' : 'SEASONAL FESTIVAL',
      subtitle: camp.description,
      artwork: CAMPAIGN_ARTWORK[camp.id] ?? 'assets/campaigns/lantern-festival.webp',
      statusLabel: state === 'live' ? (isTicket ? 'LIVE TOURNAMENT' : isExternal ? 'PARTNER EVENT' : 'LIVE EVENT') : state === 'upcoming' ? 'UPCOMING' : 'ENDED',
      statusTone: isTicket ? 'tournament' : isExternal ? 'external' : 'live',
      countdownLabel: state === 'live' ? formatRemainingTime(camp.endAt, now) : state === 'upcoming' ? `เริ่มใน ${formatRemainingTime(camp.startAt, now)}` : 'สิ้นสุดแล้ว',
      entryLabel: isTicket ? `ใช้ Ticket ${camp.ticketCost} ใบ` : isExternal ? 'กิจกรรมพาร์ตเนอร์' : 'เข้าเล่นฟรี (0 Energy)',
      rewardTitle: camp.rewards[0]?.rewards.map((reward) => reward.title).join(' + ') ?? topReward.title,
      rewardPreview: topReward,
      ctaLabel: state !== 'live' ? 'ดูรายละเอียด' : isExternal ? 'ดูกิจกรรม' : isTicket ? 'ลงแข่งชิงแชมป์' : 'เข้าร่วมกิจกรรม',
      route: `campaign/${camp.id}`,
    };
  });
  const season = currentSeason(player, now);
  return [...configured, {
    id: 'new-year-festival',
    title: 'New Year Sky Festival',
    themeTag: 'SEASON MISSIONS PREVIEW',
    subtitle: 'ติดตามภารกิจและรางวัลของซีซันปัจจุบัน พร้อมเช็กอินสะสม Pet Gacha Box',
    artwork: CAMPAIGN_ARTWORK['new-year-festival'],
    statusLabel: 'SEASON PREVIEW',
    statusTone: 'limited',
    countdownLabel: formatRemainingTime(Date.parse(`${season.ends}T00:00:00Z`), now),
    entryLabel: 'สะสม XP & เช็กอิน 7 วัน',
    rewardTitle: 'รางวัลตาม Battle Pass และ Check-in',
    rewardPreview: { title: 'Pet Gacha Box', type: 'gacha-box', amount: 1, boxKind: 'pet' } as DemoReward,
    ctaLabel: 'ดูภารกิจซีซัน',
    route: 'missions',
  }].slice(0, 4);
}