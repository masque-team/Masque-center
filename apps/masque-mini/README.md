# Masque Play

New standalone frontend prototype. The original center and Masque Vease applications are unchanged.

## Run

Requires Node.js 22.12+ and npm. From this directory:

```sh
npm ci
npm run dev
```

On Windows PowerShell use `npm.cmd` instead of `npm`.
Default URL: http://localhost:5175/ (Vite selects another port if occupied).

```sh
npm run test
npm run check
npm run build
npm run preview
```

Production URL: https://masque-lab.adldigitalservice.com/masque-gamecenter/masque-mini1/

Run the build, then upload the contents of `apps/masque-mini/dist/` to the server directory served at `/masque-gamecenter/masque-mini1/`. Do not create an extra `dist` directory on the server. Production JS/CSS use this base path; character images and other static assets are included in the output. The server should redirect the URL without its trailing slash to the URL above. Development remains at `http://localhost:5175/`.

Local runtime raster images use WebP. Original PNG/JPG files are preserved in `art-source/mini-runtime-originals/`, outside the deployed assets. Regenerate the optimized entry, cover, and icon images from the repository root with `node scripts/optimize-mini-entry.mjs`. Game Zone banners preload while the preceding menu/name step is open.

## Scope

- Entry: myAIS-style home, More sheet, required player-name confirmation, then Game Zone. Unrelated service buttons are disabled. The Game Zone name can be edited directly, AIS Point opens the local balance, and Start is the only entry into Masque Play.
- Every entry from Game Zone opens the two-character selection screen before Home, with the saved character preselected. Confirmation preserves the player's name, points, energy, portrait, and history. Only the blue-haired boy and blonde girl are selectable; older red/green choices migrate to the blue-haired boy without resetting the player.
- Only two main navigation items: Home and Shop. The content sheet collapses before the next sheet appears, with the character stage behind it. Reduced-motion preferences are respected.
- Home: seven-day energy rewards claimed by tapping today's highlighted tile, numeric energy balance, 12 energy indicators, refill countdown, and four game entries labelled "เล่นแล้วทั้งหมด". Previous and future reward tiles are disabled; there is no separate claim button.
- Shop: 5 / 12 / 30 energy for 5 / 10 / 20 AIS Point. Confirmation is required; purchased energy can exceed the regeneration cap.
- Profile: full-body character, copyable demo ID, character and portrait tabs, and local image upload. All inventory tiles use the same responsive dimensions. Changes are drafts until confirmed; the player name is edited only from myAIS and remains shared throughout the app.
- Game entry: instructions, rules, history, personal ranking, and start. Rules open after Start; energy is spent only after confirming the rules.
- The four original hosted games open in a full-height iframe, not local replacements. A compact 64px header (plus extra device safe-area padding when needed) keeps back, player portrait/name, and energy controls without a separate character image. The game back button opens a result overlay over the game with the selected character and player name; replay costs one energy, and Home returns to Masque Play. Profile and energy controls require exit confirmation. The Home back button returns to Game Zone. The myAIS player name is sent as a URL `name` parameter; each hosted game must support it to display that name internally.
- The mole game sends an `endgame` message containing its score. The wrapper validates the iframe source, origin, and score and saves one local result per round. Opening the result screen before a score arrives records a 1,200-point simulated round instead, labelled in the result screen and history. Simulated rounds also count toward local best scores, personal rankings, and play counts. A later message cannot create a second record for the same round.
- The pre-game title keeps the game background artwork without a second logo overlay.

## Demo Boundaries

- No backend, account login, payments, AIS integration, shared leaderboard, or anti-cheat. The initial 1,250 AIS Point is a local demo balance, not a real wallet. The displayed ID is a fixed demo ID.
- The myAIS entry screens are a navigation prototype only. Account details and promotions are static; promotional artwork reuses available assets rather than reproducing the supplied myAIS banners exactly. Refreshing returns to the myAIS entry; the saved game profile is preserved.
- The Game Zone free-games section uses the supplied `image 55708.png`, preserved in `art-source/` and served as the optimized `public/assets/myais/free-games-banner.webp`, without a second collage or text overlay.
- Save key: `masque_mini_v1`. Existing applications' saves are never read or overwritten. Clearing site data resets the demo. Uploads are resized to 256x256 before local storage.
- Regeneration: 1 energy per 30 minutes up to 12, including elapsed offline time. Overflow purchases are preserved. Exiting a started round does not refund its energy; opening the result screen records a simulated score if no game score has arrived. Exiting directly to profile or shop does not generate a score.
- Daily check-in: 1 / 1 / 2 / 2 / 3 / 3 / 5 energy, claimable once per calendar day in Asia/Bangkok. Seven consecutive claims loop to day one; missing a day restarts the sequence. Claims persist across reloads, allow energy above 12, and leave the player's wallet, name, and history unchanged. These are device-local demo rules, not server-verified rewards.
- While regenerating, only the next empty energy slot pulses. Full and overflow balances do not pulse. Reduced-motion preferences use a static highlight instead.
- Rankings offer the current calendar month and two previous months with actual month-end dates. The selected period filters this device's scores (including simulated rounds) and changes the per-game sample competitors. A display-only personal score appears when no round is recorded for that period. The personal-rank bar stays centered at the viewport bottom while the list scrolls, with space reserved beneath the final row. Play counts combine per-game sample totals and local rounds; neither is a live shared leaderboard.
- Original hosted URLs are configured in `src/catalog.ts`. The mole score bridge is a local demo integration, not server-verified; other games currently use simulated results in local history and rankings. Existing locally saved prototype scores are not automatically deleted.
- Characters use background-removed PNGs from archive 65, stored in `art-source/mini-characters/`. Runtime transparent WebP characters, portraits, and themed stage backgrounds are in `public/assets/characters/`. The red/green source assets are retained for later use but are not selectable. Regenerate from the repository root with `node scripts/generate-mini-characters.mjs` and `node scripts/generate-mini-stage.mjs`.
- Kanit is loaded from Google Fonts; the interface falls back to sans-serif offline. Hosted games and their logo images require internet access.

## Verification

Unit tests cover energy spending, offline refill timing, regeneration caps, purchased overflow, invalid purchases, and malformed saves. `svelte-check` and Vite production build are required gates.

`npm run build` also runs `verify:assets` before and after Vite: it parses runtime Svelte/TypeScript image references, checks the active character paths, then hash-compares every public image against `dist/`. Missing or changed files fail the build.

The interface was previously checked in-browser for navigation, purchases, profile edits, rule-before-charge ordering, and responsive layouts. Production integrations and exact screenshot artwork are outside this prototype's verification.