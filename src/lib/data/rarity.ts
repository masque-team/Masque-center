export interface RarityStyle {
  label: string;
  ink: string;
  top: string;
  bottom: string;
  glow: string;
}

// One shared rarity palette for Avatar, Pet, Gacha and reward cards.
export const RARITY: Record<string, RarityStyle> = {
  Common: { label: 'COMMON', ink: '#4a6590', top: '#e4edf9', bottom: '#c3d3ee', glow: 'rgb(120 150 200 / 45%)' },
  Rare: { label: 'RARE', ink: '#1d62b8', top: '#cfe9ff', bottom: '#8cc6fa', glow: 'rgb(70 150 240 / 55%)' },
  Epic: { label: 'EPIC', ink: '#6b34c4', top: '#e6d6ff', bottom: '#b995f6', glow: 'rgb(150 100 240 / 60%)' },
  Legendary: { label: 'LEGENDARY', ink: '#8a5200', top: '#fff0a8', bottom: '#ffbe3a', glow: 'rgb(255 190 60 / 70%)' },
  VIP: { label: 'VIP', ink: '#8a5200', top: '#fff0a8', bottom: '#f7a93a', glow: 'rgb(255 170 60 / 65%)' },
};

export const rarityOf = (name: string): RarityStyle => RARITY[name] ?? RARITY.Common;
