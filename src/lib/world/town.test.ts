import { describe, expect, it } from 'vitest';
import { findTownPath, isTownWalkable, moveInTown, TOWN_BUILDINGS, TOWN_MENUS, townArrival, townDestination } from './town';
import { worldAura } from '../data/rarity';

describe('Masque Vease town movement', () => {
  it('maps menu routes to reachable buildings with visible menu labels', () => {
    for (const route of ['home', 'shop', 'rewards', 'avatar', 'room', 'battle', 'ranking', 'wallet', 'profile', 'admin', 'detail']) {
      const building = townDestination(route)!;
      expect(TOWN_MENUS[building.id]).toBeTruthy();
      expect(isTownWalkable(townArrival(building))).toBe(true);
    }
    expect(townDestination('world')).toBeUndefined();
  });
  it('uses cosmetic aura tiers without giving gameplay bonuses', () => {
    expect(worldAura('Common', 19).strength).toBe(0);
    expect(worldAura('Common', 20).strength).toBe(0.25);
    expect(worldAura('Epic').strength).toBe(0.4);
    expect(worldAura('Common', 35).strength).toBe(0.4);
    expect(worldAura('Legendary').strength).toBe(0.55);
    expect(worldAura('Common', 50).strength).toBe(0.55);
    expect(worldAura('Common', 1, true).strength).toBe(0.55);
  });
  it('keeps the spawn and all building arrivals walkable', () => {
    expect(isTownWalkable({ x: 0, z: 6 })).toBe(true);
    for (const building of TOWN_BUILDINGS) expect(isTownWalkable(townArrival(building))).toBe(true);
  });
  it('blocks buildings, the fountain, water and the edge of town', () => {
    expect(isTownWalkable({ x: -10, z: -7 })).toBe(false);
    expect(isTownWalkable({ x: 0, z: -1.5 })).toBe(false);
    expect(isTownWalkable({ x: 12, z: 0 })).toBe(false);
    expect(isTownWalkable({ x: 30, z: 0 })).toBe(false);
  });
  it('lets players cross both bridges', () => {
    expect(isTownWalkable({ x: 12, z: 4 })).toBe(true);
    expect(isTownWalkable({ x: 12, z: -14 })).toBe(true);
    expect(moveInTown({ x: 8, z: 4 }, 1, 0, 1).x).toBeGreaterThan(12);
  });
  it('prevents tunneling into a building during slow frames', () => {
    const next = moveInTown({ x: -10, z: 0 }, 0, -1, 1, 20);
    expect(next.z).toBeGreaterThan(-3.9);
    expect(isTownWalkable(next)).toBe(true);
  });
  it('normalizes diagonal movement and rejects invalid input', () => {
    const next = moveInTown({ x: 0, z: 6 }, 1, 1, 0.1);
    expect(Math.hypot(next.x, next.z - 6)).toBeCloseTo(0.5);
    expect(moveInTown({ x: 0, z: 6 }, NaN, 0, 1)).toEqual({ x: 0, z: 6 });
  });
  it('routes ground taps around the fountain without crossing blocked tiles', () => {
    const path = findTownPath({ x: 0, z: 6 }, { x: 0, z: -8 });
    expect(path.length).toBeGreaterThan(0);
    expect(path.at(-1)).toEqual({ x: 0, z: -8 });
    expect(path.every(isTownWalkable)).toBe(true);
    expect(path.some((point) => Math.abs(point.x) >= 2.5)).toBe(true);
  });
  it('uses a bridge when a ground tap is across the canal', () => {
    const path = findTownPath({ x: 0, z: 6 }, { x: 18, z: 0 });
    expect(path.length).toBeGreaterThan(0);
    expect(path.some((point) => point.x > 10 && point.x < 14)).toBe(true);
    expect(path.every(isTownWalkable)).toBe(true);
  });
  it('can walk to every building entrance from the plaza', () => {
    for (const building of TOWN_BUILDINGS) {
      const target = townArrival(building);
      const path = findTownPath({ x: 0, z: 6 }, target);
      expect(path.at(-1), building.name).toEqual(target);
    }
  });
  it('rejects destinations inside buildings or outside the map', () => {
    expect(findTownPath({ x: 0, z: 6 }, { x: -10, z: -7 })).toEqual([]);
    expect(findTownPath({ x: 0, z: 6 }, { x: NaN, z: 0 })).toEqual([]);
    expect(findTownPath({ x: 0, z: 6 }, { x: 40, z: 0 })).toEqual([]);
  });
});