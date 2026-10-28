import { describe, expect, it } from 'vitest';
import { isHostMessage, isSceneMessage, packet, trustedSender, type SceneState } from './protocol';

const state: SceneState = {
  appearance: { name: 'Mali', level: 18, avatarId: 'mali', petId: 'pudding', wingId: null, frameId: null, vip: false },
  owned: { avatarIds: ['mali'], petIds: ['pudding'], wingIds: [] }, theme: 'water', enabled: true, announcement: 'Hello', games: [],
};
describe('versioned iframe protocol', () => {
  it('accepts initialization without any economy or persistent player data', () => {
    expect(isHostMessage(packet('INIT', { state, mode: 'portrait' }))).toBe(true);
    expect(isHostMessage(packet('MODE', { mode: 'wardrobe' }))).toBe(true);
    expect(isHostMessage(packet('MODE', { mode: 'backdrop' }))).toBe(true);
    expect(isHostMessage(packet('FOCUS', { route: 'shop' }))).toBe(true);
    expect(isHostMessage(packet('FOCUS', { route: 'https://evil.test' }))).toBe(false);
  });
  it('rejects unknown versions, modes, destinations and malformed snapshots', () => {
    expect(isHostMessage({ ...packet('STATE', { state }), version: 2 })).toBe(false);
    expect(isHostMessage({ ...packet('MODE', { mode: 'town' }), payload: { mode: 'unknown' } })).toBe(false);
    expect(isHostMessage({ ...packet('WALK_TO', { destination: 'market' }), payload: { destination: 'https://evil.test' } })).toBe(false);
    expect(isHostMessage({ ...packet('STATE', { state }), payload: { state: { ...state, owned: null } } })).toBe(false);
  });
  it('only permits known in-app routes and outfit requests', () => {
    expect(isSceneMessage(packet('NAVIGATE', { route: 'detail/memory' }))).toBe(true);
    expect(isSceneMessage(packet('NAVIGATE', { route: 'https://evil.test' }))).toBe(false);
    expect(isSceneMessage(packet('NAVIGATE', { route: 'admin' }))).toBe(false);
    expect(isSceneMessage(packet('EQUIP_REQUEST', { avatarId: 'nami', petId: null, wingId: null }))).toBe(true);
    expect(isSceneMessage({ ...packet('READY', {}), type: 'BUY_POINTS' })).toBe(false);
    expect(isSceneMessage(packet('SIZE', { height: 850 }))).toBe(true);
    expect(isSceneMessage(packet('SIZE', { height: Infinity }))).toBe(false);
    expect(isSceneMessage(packet('SIZE', { height: 100000 }))).toBe(false);
  });
  it('requires both matching origin and exact window source', () => {
    const source = {} as MessageEventSource;
    expect(trustedSender({ origin: 'https://mv.test', source }, 'https://mv.test', source)).toBe(true);
    expect(trustedSender({ origin: 'https://evil.test', source }, 'https://mv.test', source)).toBe(false);
    expect(trustedSender({ origin: 'https://mv.test', source: {} as MessageEventSource }, 'https://mv.test', source)).toBe(false);
    expect(trustedSender({ origin: 'https://mv.test', source: null }, 'https://mv.test', null)).toBe(false);
  });
});