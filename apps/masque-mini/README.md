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

## Scope

- Entry: myAIS-style home, More sheet, required player-name confirmation, then Game Zone. Unrelated service buttons are disabled. The Game Zone name can be edited directly, AIS Point opens the local balance, and Start is the only entry into Masque Play.
- First game visit: select one of four characters after pressing Start in Game Zone. Confirm before entering Home. Returning players keep their saved character and profile.
- Only two main navigation items: Home and Shop. The content sheet collapses before the next sheet appears, with the character stage behind it. Reduced-motion preferences are respected.
- Home: numeric energy balance, 12 energy indicators, refill countdown, and four game entries.
- Shop: 5 / 12 / 30 energy for 5 / 10 / 20 AIS Point. Confirmation is required; purchased energy can exceed the regeneration cap.
- Profile: full-body character, copyable demo ID, character and portrait tabs, local image upload, editable name. Changes are drafts until confirmed.
- Game entry: instructions, rules, history, personal ranking, and start. Rules open after Start; energy is spent only after confirming the rules.
- The four original hosted games open in an iframe, not local replacements. A black header keeps Back, profile, and energy controls visible. Leaving for another screen requires confirmation.
- One popup host for rules, purchases, no-energy state, history, exit, and the final score layout. Hosted games currently do not return scores to this app, so no results are generated or recorded by the wrapper.
- The pre-game title keeps the game background artwork without a second logo overlay.

## Demo Boundaries

- No backend, account login, payments, AIS integration, shared leaderboard, or anti-cheat. The initial 1,250 AIS Point is a local demo balance, not a real wallet. The displayed ID is a fixed demo ID.
- The myAIS entry screens are a navigation prototype only. Account details and promotions are static; promotional artwork reuses available assets rather than reproducing the supplied myAIS banners exactly. Refreshing returns to the myAIS entry; the saved game profile is preserved.
- Save key: `masque_mini_v1`. Existing applications' saves are never read or overwritten. Clearing site data resets the demo. Uploads are resized to 256x256 before local storage.
- Regeneration: 1 energy per 30 minutes up to 12, including elapsed offline time. Overflow purchases are preserved. Exiting a started round does not refund its energy and does not record a result.
- Rankings combine per-game sample competitors with this device's recorded scores. Play counts use this device's recorded rounds only; neither is a live shared leaderboard.
- Original hosted URLs are configured in `src/catalog.ts`. A verified score-return bridge is required before automatic results, local history, and personal rankings can update from those games. Existing locally saved prototype scores are not automatically deleted.
- Characters use the four background-removed PNGs from archive 65, stored in `art-source/mini-characters/`. Runtime transparent WebP characters, portraits, and four separately themed stage backgrounds are in `public/assets/characters/`. Regenerate from the repository root with `node scripts/generate-mini-characters.mjs` and `node scripts/generate-mini-stage.mjs`. The selected character and portrait survive reloads without resetting player data.
- Kanit is loaded from Google Fonts; the interface falls back to sans-serif offline. Hosted games and their logo images require internet access.

## Verification

Unit tests cover energy spending, offline refill timing, regeneration caps, purchased overflow, invalid purchases, and malformed saves. `svelte-check` and Vite production build are required gates.

The interface was previously checked in-browser for navigation, purchases, profile edits, rule-before-charge ordering, and responsive layouts. Hosted game completion and score return are not yet integrated. Production integrations and exact screenshot artwork are outside this prototype's verification.