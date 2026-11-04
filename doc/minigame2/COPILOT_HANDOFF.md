# MiniGame2 Frontend Handoff

**Status:** Functional frontend demo through M1-M3; ready for Gemini/Argon visual exploration.  
**Implementation commit:** `c484447` (pushed to `main`).
**Final rules/UI follow-up commit:** `45c9288` (pushed to `main`). AIS Point only in customer flows, Shop Gacha Boxes, VIP Energy MAX 30 while active, and floating Simulate Finish.
**Functional audit commit:** `560698c` (committed locally; not pushed per request).
**Scope:** Svelte 5 + Vite + TypeScript + Tailwind CSS 4. Frontend only; local mock state and the existing `masquegame_center_v2` localStorage save. No backend, database, AIS integration, billing, SSO, multiplayer service, or score verification was added.

## Screens And Routes

- **Home** `#home`: avatar greeting, daily check-in, featured game, VIP status/promotion, season shortcut, and links to secondary screens. Profile opens from the top-left avatar.
- **Shop** `#shop`: existing shop layout with Cosmetics, Energy, VIP and mock AIS Point tabs. Pet/Avatar Gacha Boxes are purchased with AIS Points and opened from the same Shop page. The old coupon cabinet and Ranked ticket sale are hidden.
- **Game Hub** `#hub`: all seven configured games, genre filters, editorial markers, mock online/play counts, and personal bests.
- **Game Detail / Entry** `#detail/:gameId`: game summary, entry cost, high score/ranking and a pre-game Avatar/Pet/Wing loadout preview. Purchases/equips update local state and History; no cosmetic effect is sent to the hosted iframe.
- **Game Player / Result** `#game/:gameId?session=...`: unchanged configured iframe URL, loading/fallback/reload/back, and a compact floating Simulate Finish control that does not reserve a full-width footer. Campaign rounds return to their source campaign.
- **Ranking** `#ranking`: normal all-time high score per game; equal scores sort by earliest recorded time.
- **Campaign list/detail** `#campaigns`, `#campaign/:campaignId`: start/end-gated internal campaigns, separate AIS-purchased Campaign Ticket packs, per-game leaderboards, reward-tier preview, automatic one-time expiry settlement and next-open notification. Force settlement exists only in Developer Studio. External campaign placeholder is disabled until a real URL is configured; it charges no Energy/Ticket.
- **VIP** `#vip`: configurable demo durations/prices, immediate activation and duration extension. VIP covers normal game entry only.
- **Battle Pass** `#rewards`: calendar-month season, shared Free/Premium XP, manually claimable tracks, separate Premium purchase, retroactive eligibility and MAX at level 50.
- **Mission Center** `#missions`: Daily/Weekly/Season and Free/VIP/Premium filters, visible locked entitlements, check-in progress and Profile badge goals. Mission XP is automatic; post-game overlay shows matching mission before/after progress bars and +XP. Visual polish remains with Gemini/Argon.
- **Inventory** `#inventory`: owned avatars, pets and wings with equip actions; Profile remains the editor for frames, badges and backgrounds.
- **Gacha Boxes**: Pet/Avatar boxes are purchased and opened in Shop. Legacy `#gacha` redirects to Shop; old coupon cabinet source remains unmounted.
- **Profile** `#profile`: editable avatar/profile presentation, backgrounds, frame and pinned earned badges; linked from the header avatar.
- **History** `#history`: Games, Purchases and Rewards; Games includes per-game play counts and sessions. Header envelope links here and shows a red dot for unread notifications.
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
- `src/lib/services/demoService.ts`: session/energy economy, automatic Mission XP, Pass claims/settlement, reward migration, History and demo scenarios.
- `src/lib/services/energyService.ts`: Energy cap, regeneration, admission and overflow.
- `src/lib/services/passService.ts`, `src/lib/services/battlePassService.ts`: VIP time offers and calendar season rules.
- `src/lib/services/campaignService.ts`, `src/lib/services/rankingService.ts`: Campaign timing/ticket purchase/automatic settlement, isolated campaign ranking and all-time high-score ordering.
- `src/lib/services/gachaService.ts`, `src/lib/services/playerService.ts`: mock draws, local migration and save persistence.

## Interactions To Preserve

- Normal entry spends 1 Energy; active VIP waives only normal entry. Continue/revive still costs Energy. Campaign ticket admission does not use Energy or VIP.
- Natural Energy cap is 15 with +1 every 30 minutes below cap. Active VIP raises the cap to 30. Grants and purchases may overflow the applicable cap; the timer pauses at/above it.
- VIP activates immediately and renewals add duration to the current expiration. Confirmed demo values (15/30 caps, 30-minute regen, 1 Energy entry/continue) are read-only in Demo Studio. VIP does not grant Premium Pass rewards.
- Battle Pass uses UTC calendar-month windows. Free/Premium share XP; Premium purchase changes entitlement only. Eligible levels remain manually claimable, and end-of-season eligible unclaimed rewards settle once.
- Mission XP is automatic once per completion; locked VIP/Premium missions remain visible. Game completion provides an overlay summary of progress deltas.
- Normal ranking uses personal best, per-game all-time scope and earliest-achievement tie-break. Campaign scores use separate campaign+game keys.
- Campaign prizes auto-credit once at configured expiry; acknowledging the popup does not grant a second time. History keeps the reward record. Developer Studio can force this only for tests.
- AIS Point is the only customer-facing currency for demo prices/rewards; old MP save fields are preserved but are not spent, granted or shown in the MiniGame2 customer journey. Gacha Box purchases debit AIS Points; opening a box updates local ownership/energy and Rewards History.
- Campaign Ticket packs debit mock AIS Points, update the separate Campaign Ticket wallet and Purchases History. Confirmed ticket entry consumes the configured quantity once; VIP does not waive it. Campaign results auto-settle at `endAt`; Developer Studio force-settlement is test-only.
- External campaigns without a real configured URL are non-launchable placeholders and consume no Energy or ticket. Never use a fabricated URL.
- Legacy Pass Gacha/Ranked ticket rewards deterministically migrate to Pet Gacha Boxes without resetting claims or player inventory. No bonus levels exist after MAX.
- Cosmetic purchases and equips update Shop, Inventory and Profile.

## Acceptance Fixtures

Use Demo Studio (`#admin`) to seed: Energy overflow; VIP with two days remaining; level-10 Free-only Pass with enough mock AIS Points to buy Premium; VIP without Premium; Alice-earlier all-time tie; separate Bird/Memory campaign scores; an expired Campaign ready for automatic settlement; next-calendar-season rollover with auto-delivery notification; and Pet/Avatar Gacha Boxes. The studio also edits Campaign dates/ticket packs and can force-settle for tests. Reset Demo recreates `?name=Mint&aispoint=100`. Normal play and check-in provide the remaining progress states.

## Visual Handoff

This is a functional pass, not a graphic redesign. Existing game covers, cosmetic art, Pass artwork, campaign presentation and profile imagery are placeholders/reused assets. Mock online/play counts and campaign rankings are not live data. The Profile scene is currently 2D artwork/background; no Three.js scene or 3D avatar rig is implemented. Mission progress overlay behavior is implemented, but its final visual hierarchy/animation polish is for Gemini/Argon.

Suggested asset work: seven game covers and promotional banner art; campaign key art and reward-tier icons; VIP package and Premium Pass illustrations; check-in and mission-completion effects; frequent-player/achievement badge or profile-banner artwork; profile room backdrop and 2D avatar texture; consistent Energy/AIS/cosmetic item icons. The design agent can inspect the running app and source directly; no screenshot or asset mapping is required.

Visual direction: portrait-first myAIS WebView, recognizable casual-game styling, clearer hierarchy and tap targets, preserve a compact Home and a game-first Hub. Keep the 2D avatar inspectable. A later optional Three.js enhancement may add a lightweight, lazy-loaded room and textured `PlaneGeometry` behind the Profile character in `ProfileShowcase.svelte`; do not convert the art to a 3D model or start the Vease World. Keep render cost off non-Profile routes.

## Design-Agent Guardrails

Design may change Tailwind/CSS, typography, art, layout and animation in `App.svelte`, `MiniGamePages.svelte`, `SeasonPage.svelte`, `GameDetailPage.svelte`, `GameScreen.svelte`, `ProfileShowcase.svelte`, `ShopPage.svelte` and related components. Preserve the services/data contracts in `demoService.ts`, `energyService.ts`, `campaignService.ts`, `battlePassService.ts`, `passService.ts`, `gachaService.ts`, `walletService.ts`, the localStorage key/schema, all seven game IDs/URLs, campaign-to-game return, claims and inventory. Do not alter Energy (15/30, +1/30min, overflow), VIP admission/expiry, AIS-only customer currency, Pass/MAX/reward migration, automatic Mission XP, campaign ticket debit/expiry settlement, ranking tie-break or box ownership/draw/history. Keep Vease/World, Ranked/Room, MP exchange and coupon cabinet out of standard MiniGame2 navigation. No backend, payment call or production-service claim.

## Demo Defaults And Open Decisions

AIS Point top-ups, Campaign Ticket packs and Gacha Box prices are local mock values only; there are no billing calls. MP remains as an unused compatibility field in old local saves. Production AIS Point transactions, campaign ticket scope/refunds, external campaign URLs, real identity/WebView handoff, external result validation and anti-cheat remain unimplemented. Campaign dates, reward tiers/odds, VIP package demo prices and mission targets/XP are configurable examples, not production approvals. External-host gameplay and live myAIS WebView are Not Verified.

## Verification

- `npm run check`: passed, 0 errors and 0 warnings.
- `npm test`: passed, 66 tests.
- `npm run build`: passed; Vite transformed 4,246 modules.
- Browser smoke: five-tab navigation; AIS Shop/Gacha Box purchase-draw-History; configurable Campaign Ticket purchase/debit/history and confirmed session consumption without Energy; expired Campaign auto-settlement/popup/History; Memory-free `Starlight Sprint` ranking defaults to `run`; external placeholder has no URL or admission charge; game result overlay shows 0/3→1/3 and 2/3→3/3 with +80 XP once; pre-game cosmetic purchase/equip and History; check-in +35 AIS once across reload; VIP purchase shows header Energy 15/30 while Premium remains locked; direct legacy routes redirect to Home/Shop; Game History shows per-game counts. Portrait widths 320, 375 and 430 have no horizontal overflow; no browser page errors in exercised flows.
- Browser base tested at `http://localhost:5173/maque-center/`. Existing game URLs/back behavior were exercised in the earlier smoke pass, but remote-host gameplay, iframe error/retry behavior against live hosts, production AIS transactions and myAIS WebView remain **Not Verified**.
