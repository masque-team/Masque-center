# Masque Vease

Independent Svelte / Three.js frontend in the SAME Git repository as Game Center.
Install from repository root with `npm install` using Node 22.12+ or 24.
There is no nested Git repository or independent lockfile.

## Commands From Repository Root

```sh
npm run dev:mv
npm run check:mv
npm run test:mv
npm run build:mv
```

Development: http://localhost:5174/ . Start MGC separately with `npm run dev`.
Standalone MV supports `?mode=portrait`, `?mode=wardrobe`, or town by default.
Standalone appearance is session-only and never writes Game Center localStorage.

## Ownership

- `portrait`: close Avatar/Pet/wings scene; no town, NPCs or pathfinding initialized.
- `wardrobe`: same viewer, preview before explicit Save, ownership checked by MGC.
- `town`: lazy-loaded town, A* walking, buildings, camera and mock citizens.

MV owns rendering and temporary preview/movement only. MGC owns currency,
admission tickets, inventory, purchases, gacha, profile and persistent saves.
The complete outfit must pass MGC ownership checks before any selection is saved.

## Iframe Contract

Shared package: `packages/vease-protocol` at repository root. No MGC app imports.

- Handshake: `READY -> INIT -> ACK`; READY repeats until initialized.
- Host: `STATE`, `MODE`, `ACTIVE`, `WALK_TO`, `EQUIP_RESULT`.
- Scene: `NAVIGATE`, `EQUIP_REQUEST`, `ARRIVED`, bounded `SIZE`, `ERROR`.
- Every packet includes channel, version, unique request ID and validated payload.
- Exact source window AND origin checks; never wildcard target origins.
- Latest walk cancels the previous request; replies preserve the command ID.
- The host keeps its iframe while modes change and removes it during hosted games.
- Hidden/offscreen host sends ACTIVE=false; reduced-motion preferences are respected.
- Tailwind controls layout and press feedback. Scene motion stays in Three.js.

## Production

Output: `apps/masque-vease/dist/`, separate from MGC's root `dist/`.
Default production base: `/masque-gamecenter/masque-vease/`.
Deploy the output contents there, next to `/masque-gamecenter/masque-center/`.
Both apps resolve their sibling via a relative URL, without a backend or .env file.

Public build configuration (see `.env.example`):

- `VITE_PUBLIC_BASE`: override asset base, such as `/` for a dedicated domain.
- `VITE_ALLOWED_PARENT_ORIGINS`: comma-separated host origins without paths.
  Same-origin and localhost/127.0.0.1:5173 development hosts work by default.
- `VITE_GAME_CENTER_URL`: standalone navigation back to MGC.

For a different origin, also set `VITE_VEASE_URL` in MGC. These settings are public,
not authentication. Trusted currency/Ranked results still require a future backend.

Assets belong to this app's `public/`. Art generators currently live at repository
root: copy changed output into this app before building, never generate into `dist/`.