export const CHANNEL = 'masque-vease';
export const VERSION = 1;
export type SceneMode = 'portrait' | 'town' | 'wardrobe' | 'backdrop';
export interface Outfit { avatarId: string; petId: string | null; wingId: string | null }
export interface Appearance extends Outfit { name: string; level: number; frameId: string | null; vip: boolean }
export interface SceneState {
  appearance: Appearance;
  owned: { avatarIds: string[]; petIds: string[]; wingIds: string[] };
  theme: 'water' | 'lantern';
  enabled: boolean;
  announcement: string;
  games: { id: string; name: string; cover?: string; published?: boolean }[];
}
type Envelope<T extends string, P> = { channel: typeof CHANNEL; version: typeof VERSION; id: string; type: T; payload: P };
export type HostMessage =
  | Envelope<'INIT', { state: SceneState; mode: SceneMode }>
  | Envelope<'STATE', { state: SceneState }>
  | Envelope<'MODE', { mode: SceneMode }>
  | Envelope<'FOCUS', { route: string }>
  | Envelope<'ACTIVE', { active: boolean }>
  | Envelope<'WALK_TO', { destination: string }>
  | Envelope<'EQUIP_RESULT', { ok: boolean; state: SceneState; message: string }>;
export type SceneMessage =
  | Envelope<'READY', Record<string, never>>
  | Envelope<'ACK', Record<string, never>>
  | Envelope<'ARRIVED', { destination: string; cancelled: boolean }>
  | Envelope<'NAVIGATE', { route: string }>
  | Envelope<'EQUIP_REQUEST', Outfit>
  | Envelope<'SIZE', { height: number }>
  | Envelope<'ERROR', { message: string }>;
export const DESTINATIONS = ['arcade', 'cafe', 'market', 'atelier', 'club', 'pass', 'bakery', 'home', 'studio'];
const ROUTES = ['home', 'shop', 'avatar', 'profile', 'room', 'rewards', 'battle', 'wallet', 'ranking', 'world', 'points', 'gacha', 'detail', 'admin'];
const GAME_IDS = ['bird', 'mole', 'run', 'fruit', 'timber', 'duck', 'memory'];
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, maximum = 160): value is string => typeof value === 'string' && value.length <= maximum;
const itemId = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9-]{1,64}$/.test(value);
const optionalId = (value: unknown): value is string | null => value === null || itemId(value);
const ids = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 200 && value.every(itemId);
const mode = (value: unknown): value is SceneMode => ['portrait', 'town', 'wardrobe', 'backdrop'].includes(value as string);
export function isOutfit(value: unknown): value is Outfit {
  return record(value) && itemId(value.avatarId) && optionalId(value.petId) && optionalId(value.wingId);
}
export function isSceneState(value: unknown): value is SceneState {
  if (!record(value) || !isOutfit(value.appearance) || !record(value.appearance) || !record(value.owned)) return false;
  const look = value.appearance;
  return text(look.name, 40) && Number.isSafeInteger(look.level) && Number(look.level) >= 0 && optionalId(look.frameId) && typeof look.vip === 'boolean'
    && ids(value.owned.avatarIds) && ids(value.owned.petIds) && ids(value.owned.wingIds)
    && ['water', 'lantern'].includes(value.theme as string) && typeof value.enabled === 'boolean' && text(value.announcement)
    && Array.isArray(value.games) && value.games.length <= 32 && value.games.every((game) => record(game) && GAME_IDS.includes(game.id as string) && text(game.name, 100)
      && (game.cover === undefined || typeof game.cover === 'string' && /^[a-zA-Z0-9_.-]+$/.test(game.cover)) && (game.published === undefined || typeof game.published === 'boolean'));
}
function envelope(value: unknown): value is { type: string; payload: Record<string, unknown> } {
  return record(value) && value.channel === CHANNEL && value.version === VERSION && text(value.id, 100) && !!value.id && text(value.type, 40) && record(value.payload);
}
export function isHostMessage(value: unknown): value is HostMessage {
  if (!envelope(value)) return false;
  const payload = value.payload;
  switch (value.type) {
    case 'INIT': return isSceneState(payload.state) && mode(payload.mode);
    case 'STATE': return isSceneState(payload.state);
    case 'MODE': return mode(payload.mode);
    case 'FOCUS': return ROUTES.includes(payload.route as string);
    case 'ACTIVE': return typeof payload.active === 'boolean';
    case 'WALK_TO': return DESTINATIONS.includes(payload.destination as string);
    case 'EQUIP_RESULT': return typeof payload.ok === 'boolean' && isSceneState(payload.state) && text(payload.message);
    default: return false;
  }
}
export function isSceneMessage(value: unknown): value is SceneMessage {
  if (!envelope(value)) return false;
  const payload = value.payload;
  switch (value.type) {
    case 'READY': case 'ACK': return true;
    case 'ARRIVED': return DESTINATIONS.includes(payload.destination as string) && typeof payload.cancelled === 'boolean';
    case 'NAVIGATE': return typeof payload.route === 'string' && (ROUTES.includes(payload.route) && !['admin', 'detail'].includes(payload.route) || /^detail\/(bird|mole|run|fruit|timber|duck|memory)$/.test(payload.route));
    case 'EQUIP_REQUEST': return isOutfit(payload);
    case 'SIZE': return Number.isSafeInteger(payload.height) && Number(payload.height) >= 350 && Number(payload.height) <= 4000;
    case 'ERROR': return text(payload.message);
    default: return false;
  }
}
export function packet<T extends (HostMessage | SceneMessage)['type']>(type: T, payload: Extract<HostMessage | SceneMessage, { type: T }>['payload'], id: string = crypto.randomUUID()) {
  return { channel: CHANNEL, version: VERSION, type, payload, id } as Extract<HostMessage | SceneMessage, { type: T }>;
}
export function trustedSender(event: Pick<MessageEvent, 'origin' | 'source'>, expectedOrigin: string, expectedSource: MessageEventSource | null): boolean {
  return !!expectedSource && event.origin === expectedOrigin && event.source === expectedSource;
}
export function toTownPlayer(state: SceneState) {
  return {
    displayName: state.appearance.name, level: state.appearance.level, avatarId: state.appearance.avatarId,
    petId: state.appearance.petId, ownedPetIds: state.owned.petIds,
    demo: { frameId: state.appearance.frameId, wingId: state.appearance.wingId, config: {
      worldEnabled: state.enabled, worldTheme: state.theme, announcement: state.announcement, games: state.games,
    } },
  };
}
export type TownPlayer = ReturnType<typeof toTownPlayer>;