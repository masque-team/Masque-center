import PathFinding from 'pathfinding';

export type TownPalette = 'coral' | 'sky' | 'lemon' | 'lilac';
export interface TownPoint { x: number; z: number }
export interface TownBuilding extends TownPoint {
  id: string;
  name: string;
  sign: string;
  width: number;
  depth: number;
  height: number;
  palette: TownPalette;
  route?: string;
}

export const TOWN_MENUS: Record<string, string> = {
  arcade: 'เลือกเกม', cafe: 'ภารกิจ', market: 'ร้านค้า', atelier: 'แต่งตัว',
  club: 'แต่งโปรไฟล์', pass: 'Battle Pass', bakery: 'ร้านค้า', home: 'แต่งโปรไฟล์', studio: 'Battle Arena',
};

export function townDestination(route: string): TownBuilding | undefined {
  const stops: Record<string, string> = {
    home: 'arcade', detail: 'arcade', ranking: 'arcade', shop: 'market', wallet: 'market',
    avatar: 'atelier', profile: 'atelier', room: 'club', rewards: 'pass', battle: 'studio', admin: 'studio', points: 'market', gacha: 'atelier',
  };
  return TOWN_BUILDINGS.find((building) => building.id === stops[route]);
}

export const TOWN_BUILDINGS: TownBuilding[] = [
  { id: 'arcade', name: 'Masque Arcade', sign: 'MASQUE ARCADE', x: -10, z: -7, width: 6, depth: 5, height: 4.4, palette: 'coral', route: 'home' },
  { id: 'cafe', name: 'Cloud Cafe', sign: 'CLOUD CAFE', x: -2, z: -15, width: 5.6, depth: 4.8, height: 3.7, palette: 'sky', route: 'rewards' },
  { id: 'market', name: 'Point Market', sign: 'POINT MARKET', x: -21, z: 2, width: 5.4, depth: 5, height: 4, palette: 'lemon', route: 'shop' },
  { id: 'atelier', name: 'Avatar Atelier', sign: 'AVATAR ATELIER', x: -11, z: 12, width: 6, depth: 5, height: 4, palette: 'lilac', route: 'avatar' },
  { id: 'club', name: 'Clubhouse', sign: 'THE CLUBHOUSE', x: 1, z: 16, width: 6.5, depth: 5.4, height: 4.7, palette: 'sky', route: 'room' },
  { id: 'pass', name: 'Season Pavilion', sign: 'SEASON PAVILION', x: 22, z: -8, width: 6, depth: 5, height: 4.5, palette: 'coral', route: 'rewards' },
  { id: 'bakery', name: 'Moonlight Bakery', sign: 'MOONLIGHT', x: 23, z: 10, width: 5.2, depth: 4.6, height: 3.7, palette: 'lemon', route: 'shop' },
  { id: 'home', name: 'Canal Cottage', sign: 'CANAL COTTAGE', x: 22, z: 19, width: 5, depth: 4.4, height: 3.4, palette: 'lilac', route: 'room' },
  { id: 'studio', name: 'Little Studio', sign: 'LITTLE STUDIO', x: -21, z: -17, width: 5.2, depth: 4.4, height: 3.5, palette: 'sky', route: 'battle' },
];

export const MOCK_CITIZENS = [
  { id: 'luna', name: 'Luna', avatarId: 'luna', level: 24, title: 'Season Explorer', points: [{ x: -4, z: 0 }, { x: -5, z: 6 }, { x: 4, z: 7 }, { x: 5, z: 0 }] },
  { id: 'nami', name: 'Nami', avatarId: 'nami', level: 16, title: 'Canal Wanderer', points: [{ x: 5, z: 2 }, { x: 8, z: 4 }, { x: 17, z: 4 }, { x: 6, z: 4 }] },
  { id: 'mimi', name: 'Mimi', avatarId: 'mimi', level: 21, title: 'Cafe Regular', points: [{ x: -4, z: -9 }, { x: 3, z: -8 }, { x: 3, z: 2 }, { x: -4, z: 1 }] },
  { id: 'aqua', name: 'Aqua', avatarId: 'aqua', level: 19, title: 'Market Collector', points: [{ x: -16, z: 5 }, { x: -8, z: 6 }, { x: -8, z: 1 }, { x: -16, z: 0 }] },
  { id: 'ember', name: 'Ember', avatarId: 'ember', level: 28, title: 'Arcade Champion', points: [{ x: -10, z: -3 }, { x: -4, z: -3 }, { x: -4, z: 4 }, { x: -10, z: 4 }] },
  { id: 'nyx', name: 'Nyx', avatarId: 'nyx', level: 32, title: 'Night Stroller', points: [{ x: 4, z: 9 }, { x: -3, z: 9 }, { x: -4, z: 13 }, { x: 5, z: 11 }] },
] as const;

export function isTownWalkable(point: TownPoint): boolean {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.z) || Math.abs(point.x) > 29 || Math.abs(point.z) > 25) return false;
  if (point.x > 9.6 && point.x < 14.4 && ![4, -14].some((bridge) => Math.abs(point.z - bridge) < 1.5)) return false;
  if (point.x * point.x + (point.z + 1.5) ** 2 < 2.45 ** 2) return false;
  return !TOWN_BUILDINGS.some((building) => Math.abs(point.x - building.x) < building.width / 2 + 0.45 && Math.abs(point.z - building.z) < building.depth / 2 + 0.7);
}

export function moveInTown(position: TownPoint, horizontal: number, vertical: number, seconds: number, speed = 5): TownPoint {
  if (![horizontal, vertical, seconds, speed].every(Number.isFinite) || seconds <= 0) return { ...position };
  const length = Math.max(1, Math.hypot(horizontal, vertical));
  const distance = Math.max(0, Math.min(1, seconds)) * speed;
  const steps = Math.max(1, Math.ceil(distance / 0.18));
  const dx = horizontal / length * distance / steps;
  const dz = vertical / length * distance / steps;
  let next = { ...position };
  for (let index = 0; index < steps; index += 1) {
    const nextX = { x: next.x + dx, z: next.z };
    if (isTownWalkable(nextX)) next = nextX;
    const nextZ = { x: next.x, z: next.z + dz };
    if (isTownWalkable(nextZ)) next = nextZ;
  }
  return next;
}

export function townArrival(building: TownBuilding): TownPoint {
  return { x: building.x, z: building.z + building.depth / 2 + 2.4 };
}

export function findTownPath(start: TownPoint, target: TownPoint): TownPoint[] {
  if (!isTownWalkable(start) || !isTownWalkable(target)) return [];
  const spacing = 0.5;
  const columns = 117;
  const rows = 101;
  const pointAt = (column: number, row: number): TownPoint => ({ x: column * spacing - 29, z: row * spacing - 25 });
  const matrix = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => isTownWalkable(pointAt(column, row)) ? 0 : 1));
  function clearSegment(from: TownPoint, to: TownPoint): boolean {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / 0.1));
    return Array.from({ length: steps + 1 }, (_, index) => isTownWalkable({ x: from.x + (to.x - from.x) * index / steps, z: from.z + (to.z - from.z) * index / steps })).every(Boolean);
  }
  function nearestCell(point: TownPoint): { column: number; row: number } | undefined {
    const column = Math.round((point.x + 29) / spacing);
    const row = Math.round((point.z + 25) / spacing);
    return Array.from({ length: 25 }, (_, index) => ({ column: column + index % 5 - 2, row: row + Math.floor(index / 5) - 2 }))
      .filter((cell) => cell.column >= 0 && cell.column < columns && cell.row >= 0 && cell.row < rows && !matrix[cell.row][cell.column])
      .sort((left, right) => Math.hypot(pointAt(left.column, left.row).x - point.x, pointAt(left.column, left.row).z - point.z) - Math.hypot(pointAt(right.column, right.row).x - point.x, pointAt(right.column, right.row).z - point.z))
      .find((cell) => clearSegment(point, pointAt(cell.column, cell.row)));
  }
  const from = nearestCell(start);
  const to = nearestCell(target);
  if (!from || !to) return [];
  const finder = new PathFinding.AStarFinder({ diagonalMovement: PathFinding.DiagonalMovement.OnlyWhenNoObstacles });
  const path = finder.findPath(from.column, from.row, to.column, to.row, new PathFinding.Grid(matrix));
  if (!path.length) return [];
  const points = path.map(([column, row]) => pointAt(column, row));
  if (points.some((point, index) => index > 0 && !clearSegment(points[index - 1], point))) return [];
  return [...points, { ...target }].filter((point) => Math.hypot(point.x - start.x, point.z - start.z) > 0.03);
}