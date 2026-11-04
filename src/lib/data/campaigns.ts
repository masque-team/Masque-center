import type { Campaign } from '../types';

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'lantern-festival',
    title: 'Lantern Festival',
    description: 'ทำคะแนนสูงสุดในเกมที่ร่วมรายการ แล้วรับของรางวัลตามอันดับ',
    gameIds: ['bird', 'memory'],
    startAt: Date.UTC(2026, 9, 1),
    endAt: Date.UTC(2026, 11, 1),
    entry: 'free',
    ticketCost: 0,
    rewards: [
      { label: 'อันดับ 1', fromRank: 1, toRank: 1, rewards: [{ title: 'Energy +5', type: 'energy', amount: 5 }, { title: 'Festival Frame', type: 'frame', itemId: 'ocean' }] },
      { label: 'อันดับ 2-3', fromRank: 2, toRank: 3, rewards: [{ title: 'Energy +3', type: 'energy', amount: 3 }] },
      { label: 'อันดับ 4-5', fromRank: 4, toRank: 5, rewards: [{ title: 'Energy +1', type: 'energy', amount: 1 }] },
    ],
  },
  {
    id: 'starlight-sprint',
    title: 'Starlight Sprint',
    description: 'ตัวอย่างแคมเปญใช้ Ticket หนึ่งใบต่อหนึ่งรอบ ไม่ใช่เงื่อนไขการเงินจริง',
    gameIds: ['run', 'mole'],
    startAt: Date.UTC(2026, 9, 1),
    endAt: Date.UTC(2026, 11, 1),
    entry: 'ticket',
    ticketCost: 1,
    rewards: [
      { label: 'อันดับ 1', fromRank: 1, toRank: 1, rewards: [{ title: 'Energy +5', type: 'energy', amount: 5 }, { title: 'Starlight Frame', type: 'frame', itemId: 'sunrise' }] },
      { label: 'อันดับ 2-3', fromRank: 2, toRank: 3, rewards: [{ title: 'Energy +3', type: 'energy', amount: 3 }] },
      { label: 'อันดับ 4-5', fromRank: 4, toRank: 5, rewards: [{ title: 'Energy +1', type: 'energy', amount: 1 }] },
    ],
  },
  {
    id: 'loy-krathong-external',
    title: 'Loy Krathong · external activity (mock)',
    description: 'ตัวอย่างกิจกรรมภายนอก ยังไม่มี URL จริง จึงไม่สามารถเปิดกิจกรรมได้',
    gameIds: [],
    startAt: Date.UTC(2026, 9, 1),
    endAt: Date.UTC(2026, 11, 1),
    launchMode: 'external',
    externalUrl: null,
    entry: 'external',
    ticketCost: 0,
    rewards: [],
  },
];
