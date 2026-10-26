export function worldAura(rarity: string, level = 0, vip = false): { color: string; strength: number } {
  if (vip || rarity === 'VIP' || rarity === 'Legendary' || level >= 50) return { color: '#ffc963', strength: 0.55 };
  if (rarity === 'Epic' || level >= 35) return { color: '#f19ccd', strength: 0.4 };
  if (rarity === 'Rare' || level >= 20) return { color: '#80d9ff', strength: 0.25 };
  return { color: '#ffffff', strength: 0 };
}