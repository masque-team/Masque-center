# MiniGame2 Frontend Handoff

**Status:** Functional frontend demo through M1-M3; ready for Gemini/Argon visual exploration.  
**Implementation commit:** `c484447` (local; not pushed).  
**Scope:** Svelte 5 + Vite + TypeScript + Tailwind CSS 4. Frontend only; local mock state and the existing `masquegame_center_v2` localStorage save. No backend, database, AIS integration, billing, SSO, multiplayer service, or score verification was added.

## Screens And Routes

- **Home** `#home`: avatar greeting, daily check-in, featured game, VIP status/promotion, season shortcut, and links to secondary screens. Profile opens from the top-left avatar.
- **Shop** `#shop`: existing shop layout with Cosmetics, Energy, VIP, and mock AIS Point tabs. Gacha coupons remain available. Ranked ticket sales and AIS-to-MP exchange are not exposed in the standard Shop.
- **Game Hub** `#hub`: all seven configured games, genre filters, editorial markers, mock online/play counts, and personal bests.
- **Game Detail / Entry** `#detail/:gameId`: game summary, entry cost, high score and ranking.
- **Game Player / Result** `#game/:gameId?session=...`: unchanged configured iframe URL, loading/fallback/reload/back, and Simulate Finish. Campaign rounds return to their source campaign.
- **Ranking** `#ranking`: normal all-time high score per game; equal scores sort by earliest recorded time.
- **Campaign list/detail** `#campaigns`, `#campaign/:campaignId`: free and ticket-demo scenarios, per-game leaderboards, reward-tier gift preview, mock finalize/once-only settlement, and next-open notification.
- **VIP** `#vip`: configurable demo durations/prices, immediate activation and duration extension. VIP covers normal game entry only.
- **Battle Pass** `#rewards`: calendar-month season, shared Free/Premium XP, manually claimable tracks, separate Premium purchase, retroactive eligibility and MAX at level 50.
- **Mission Center** `#missions`: Daily/Weekly/Season and Free/VIP/Premium filters, visible locked entitlements, check-in progress, post-game progress/XP events, and Profile badge achievement goals.
- **Inventory** `#inventory`: owned avatars, pets and wings with equip actions; Profile remains the editor for frames, badges and backgrounds.
- **Gacha** `#gacha`: mock Avatar/Pet cabinet, ticket draw/result, local inventory updates and Rewards History entry.
- **Profile** `#profile`: editable avatar/profile presentation, backgrounds, frame and pinned earned badges; linked from the header avatar.
- **History** `#history`: Games, Purchases and Rewards records, including campaign/pass notifications and Gacha draws.
- **Demo Studio** `#admin`: developer-only entry button in development builds; acceptance scenario selector, clock controls, local config and reset.

Bottom navigation order is **HOME / SHOP / GAME / Battle Pass / Mission**. Campaign, Ranking, Inventory, Gacha and History are linked from Home or their owning screens. Legacy `#world`, `#room`, `#battle`, `#wallet`, `#points` and `#avatar` source routes remain but are not in the MiniGame2 customer navigation. The Vease iframe is only mounted on its legacy World/Avatar routes.

## Source Map

- `src/App.svelte`: hash routing, app-level state, game entry/result, modals, check-in, navigation and save flow.
- `src/lib/components/BottomNav.svelte`: five primary tabs.
- `src/lib/pages/MiniGamePages.svelte`: Campaign, Mission, VIP, Inventory and History screens.
- `src/lib/pages/ShopPage.svelte`: established Shop presentation with MiniGame2 mock tabs.
- `src/lib/pages/SeasonPage.svelte`, `src/lib/components/PassRewardTrack.svelte`: Battle Pass and reward claims.
- `src/lib/pages/GameDetailPage.svelte`, `src/lib/components/GameScreen.svelte`: detail, iframe launcher and result controls.
- `src/lib/pages/RankingPage.svelte`, `src/lib/components/Leaderboard.svelte`: normal all-time ranking.
- `src/lib/pages/ProfileShowcase.svelte`: editable Profile, owned cosmetics and achievements.
- `src/lib/pages/AdminPage.svelte`: local Demo Studio and scenario selector.
- `src/lib/data/games.ts`, `src/lib/data/campaigns.ts`, `src/lib/data/config.ts`: game URLs, campaign fixtures, demo prices/rewards.
- `src/lib/services/demoService.ts`: Energy-independent demo flows, XP, missions, rewards, history and Pass settlement.
- `src/lib/services/energyService.ts`: Energy cap, regeneration, admission and overflow.
- `src/lib/services/passService.ts`, `src/lib/services/battlePassService.ts`: VIP time offers and calendar season rules.
- `src/lib/services/campaignService.ts`, `src/lib/services/rankingService.ts`: isolated campaign ranking/settlement and all-time high-score ordering.
- `src/lib/services/gachaService.ts`, `src/lib/services/playerService.ts`: mock draws, local migration and save persistence.

## Interactions To Preserve

- Normal entry spends 1 Energy; active VIP waives only normal entry. Continue/revive still costs Energy. Campaign ticket admission does not use Energy or VIP.
- Natural Energy cap is 15 with +1 every 30 minutes below cap. Grants and purchases may overflow the cap; the timer pauses above it.
- VIP activates immediately and renewals add duration to the current expiration. VIP does not grant Premium Pass rewards.
- Battle Pass uses UTC calendar-month windows. Free/Premium share XP; Premium purchase changes entitlement only. Eligible levels remain manually claimable, and end-of-season eligible unclaimed rewards settle once.
- Mission XP is automatic once per completion; locked VIP/Premium missions remain visible. Game completion provides an overlay summary of progress deltas.
- Normal ranking uses personal best, per-game all-time scope and earliest-achievement tie-break. Campaign scores use separate campaign+game keys.
- Campaign prizes are credited once on demo finalize; acknowledging the notification does not grant a second time. History keeps the reward record.
- Gacha outcomes update local state and Rewards History. Cosmetic purchases and equips update Shop, Inventory and Profile.

## Acceptance Fixtures

Use Demo Studio (`#admin`) to seed: Energy overflow 34/15; VIP with two days remaining; level-10 Free-only Pass with enough mock MP to buy Premium; VIP without Premium; Alice-earlier all-time tie; separate Bird/Memory campaign scores; campaign results ready to settle; next-calendar-season rollover with auto-delivery notification; and Gacha with 10 tickets. Reset Demo recreates the new-player query scenario (`?name=Mint&aispoint=100`). Normal play and check-in provide the remaining progress states.

## Visual Handoff

This is a functional pass, not a graphic redesign. Existing game covers, cosmetic art, Pass artwork, campaign presentation and profile imagery are placeholders/reused assets. Mock online/play counts and campaign rankings are not live data. The Profile scene is currently 2D artwork/background; no Three.js scene or 3D avatar rig is implemented.

Suggested asset work: seven game covers and promotional banner art; campaign key art and reward-tier icons; VIP package and Premium Pass illustrations; check-in and mission-completion effects; frequent-player/achievement badge or profile-banner artwork; profile room backdrop and 2D avatar texture; consistent Energy/AIS/cosmetic item icons. The design agent can inspect the running app and source directly; no screenshot or asset mapping is required.

Visual direction: portrait-first myAIS WebView, recognizable casual-game styling, clearer hierarchy and tap targets, preserve a compact Home and a game-first Hub. Keep the 2D avatar inspectable. A later optional Three.js enhancement may add a lightweight, lazy-loaded room and textured `PlaneGeometry` behind the Profile character in `ProfileShowcase.svelte`; do not convert the art to a 3D model or start the Vease World. Keep render cost off non-Profile routes.

## Design-Agent Guardrails

Do not change the localStorage key/schema contract or discard existing saves. Preserve the hash routes, all seven game IDs and URLs, campaign-to-game return behavior, mock receipts, and the `PlayerState`/`DemoState` ownership and claim fields. Do not change Energy cost/cap/regen, VIP scope/extension, Premium ownership, monthly Pass boundaries/MAX, mission entitlement/XP grant timing, score policy/tie-break, campaign settlement or Gacha inventory/history behavior. Keep Vease/World, Ranked/Room and old MP exchange out of standard MiniGame2 navigation. Do not add a backend, payment call or production-service claim.

## Demo Defaults And Open Decisions

AIS Point balance top-ups are local mock increments only. Existing MP balances and demo prices remain for legacy item/reward mechanics; this does not approve an AIS-to-MP conversion or production currency policy. VIP durations/prices, mission targets/XP, campaign ticket quantity/scope, ranking reward tiers, exact season reward tables and asset catalog are demo configuration, not production decisions. Current campaign fixtures start with two demo tickets. Real Game Zone identity/WebView handoff, external result validation, AIS Point transaction contracts, campaign end scheduling and anti-cheat remain unimplemented. The user-facing browser smoke test did not access a live myAIS WebView or validate gameplay on the remote game hosts.

## Verification

- `npm run check`: passed, 0 errors and 0 warnings.
- `npm test`: passed, 60 tests.
- `npm run build`: passed; Vite transformed 4,246 modules.
- Browser smoke: five-tab navigation; Home/Shop/Game/Battle Pass/Mission; Shop VIP/AIS Point/cosmetic flow; 7 detail-to-iframe-launch/back routes and original iframe URLs; campaign score isolation, result return, settlement notification and History; level-10 Premium purchase with unchanged XP and 20 eligible track claims; Gacha result/inventory/History; viewport widths 320, 375 and 430 with no horizontal overflow.
- Browser base tested at `http://localhost:5173/maque-center/`. Remote iframe requests were cancelled when navigating between route smoke cases; external-host gameplay and production myAIS WebView remain unverified.
