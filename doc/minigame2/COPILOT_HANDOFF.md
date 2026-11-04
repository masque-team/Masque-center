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
- **Achievement Center** `#achievements`: fifth bottom tab; shared Home Check-in status/streak, permanent event-driven milestones, locked/unlocked Badge Gallery, detail/reward preview and Profile shortcut. Long-term progress is not tied to Pass seasons.
- **Battle Pass Missions** `#missions`: nested subpage linked only from `#rewards`; Free/VIP/Premium and Daily/Weekly/Season Pass XP missions remain separate from Achievements. XP is automatic; post-game overlay shows matching Pass progress and +XP.
- **Inventory** `#inventory`: owned avatars, pets and wings with equip actions; Profile remains the editor for frames, badges and backgrounds.
- **Gacha Boxes**: Pet/Avatar boxes are purchased and opened in Shop. Legacy `#gacha` redirects to Shop; old coupon cabinet source remains unmounted.
- **Profile** `#profile`: editable avatar/profile presentation, backgrounds, frame and pinned earned badges; linked from the header avatar.
- **History** `#history`: Games, Purchases and Rewards; Games includes per-game play counts and sessions. Header envelope links here and shows a red dot for unread notifications.
- **Demo Studio** `#admin`: developer-only entry button in development builds; acceptance scenario selector, clock controls, local config and reset.

Bottom navigation order is **HOME / SHOP / GAME / Battle Pass / Achievement**. Home Check-in is a shortcut to the same `checkinDates` claim ledger used by Achievement. Campaign, Ranking, Inventory, Gacha and History remain discoverable from Home or their owning screens. `#missions` is only a Battle Pass subpage. Legacy `#world`, `#room`, `#battle`, `#wallet`, `#points` and `#avatar` source routes remain hidden/redirected. The Vease iframe is only mounted on its legacy World/Avatar routes.

## Source Map

- `src/App.svelte`: hash routing, app-level state, game entry/result, modals, check-in, navigation and save flow.
- `src/lib/components/BottomNav.svelte`: five primary tabs.
- `src/lib/pages/MiniGamePages.svelte`: Campaign, Mission, VIP, Inventory and History screens.
- `src/lib/pages/AchievementPage.svelte`, `src/lib/services/achievementService.ts`: lifetime progress, event-triggered once-only Achievement rewards, Check-in streak and Badge Gallery; `demo.achievements` is the canonical earned Badge collection.
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
- Achievement events (`game_completed`, `game_score_updated`, `daily_checkin`, `campaign_joined`, `campaign_completed`) update permanent metrics and Badge/reward notifications independently of `missionClaims` and Pass XP. The same game/check-in event may advance both systems, but never uses an Achievement reward to award Pass XP.
- Normal ranking uses personal best, per-game all-time scope and earliest-achievement tie-break. Campaign scores use separate campaign+game keys.
- Campaign prizes auto-credit once at configured expiry; acknowledging the popup does not grant a second time. History keeps the reward record. Developer Studio can force this only for tests.
- AIS Point is the only customer-facing currency for demo prices/rewards; old MP save fields are preserved but are not spent, granted or shown in the MiniGame2 customer journey. Gacha Box purchases debit AIS Points; opening a box updates local ownership/energy and Rewards History.
- Campaign Ticket packs debit mock AIS Points, update the separate Campaign Ticket wallet and Purchases History. Confirmed ticket entry consumes the configured quantity once; VIP does not waive it. Campaign results auto-settle at `endAt`; Developer Studio force-settlement is test-only.
- External campaigns without a real configured URL are non-launchable placeholders and consume no Energy or ticket. Never use a fabricated URL.
- Legacy Pass Gacha/Ranked ticket rewards deterministically migrate to Pet Gacha Boxes without resetting claims or player inventory. No bonus levels exist after MAX.
- Daily Check-in from Home and Achievement uses the same once-per-day state and AIS reward. Long-term achievement progress is derived from persistent play counts, scores, check-in dates and Campaign counters, not the monthly Pass season.
- Cosmetic purchases and equips update Shop, Inventory and Profile. Earned Achievement badges are stored once in `demo.achievements` and can be pinned from Profile.

## Acceptance Fixtures

Use Demo Studio (`#admin`) to seed: Energy overflow; VIP with two days remaining; level-10 Free-only Pass with enough mock AIS Points to buy Premium; VIP without Premium; Alice-earlier all-time tie; separate Bird/Memory campaign scores; an expired Campaign ready for automatic settlement; next-calendar-season rollover with auto-delivery notification; and Pet/Avatar Gacha Boxes. The studio also edits Campaign dates/ticket packs and can force-settle for tests. Reset Demo recreates `?name=Mint&aispoint=100`. Normal play and Check-in exercise lifetime Achievements. The requested `DESIGN_HANDOFF.md` was not present in the workspace; current Gemini design work was audited directly from the dirty source/assets.

## Visual Handoff

This is a functional/regression pass over Gemini's visual work, not a new redesign. Existing game covers, cosmetic art, Pass artwork and campaign presentation remain placeholders/reused assets. Mock online/play counts and campaign rankings are not live data. Profile uses a Three.js room with 2D avatar/pet/wing texture planes, pointer parallax and an accessible 2.5D fallback; there is no 3D avatar rig. Mission and Achievement unlock visual polish remains with Gemini/Argon.

Suggested asset work: seven game covers and promotional banner art; campaign key art and reward-tier icons; VIP package and Premium Pass illustrations; check-in and mission-completion effects; frequent-player/achievement badge or profile-banner artwork; profile room backdrop and 2D avatar texture; consistent Energy/AIS/cosmetic item icons. The design agent can inspect the running app and source directly; no screenshot or asset mapping is required.

Visual direction: retain the latest Gemini portrait-first sky-kingdom styling, compact Home, game-first Hub and inspectable Profile art. The Profile room is already lazy-loaded through `ProfileRoom3D.svelte`; polish its animation and assets without converting 2D art to a 3D model or starting Vease World. Keep render cost off non-Profile routes.

## Design-Agent Guardrails

Design may change Tailwind/CSS, typography, art, layout and animation in `App.svelte`, `AchievementPage.svelte`, `MiniGamePages.svelte`, `SeasonPage.svelte`, `GameDetailPage.svelte`, `GameScreen.svelte`, `ProfileShowcase.svelte`, `ProfileRoom3D.svelte`, `ShopPage.svelte` and related components. Preserve the services/data contracts in `achievementService.ts`, `demoService.ts`, `energyService.ts`, `campaignService.ts`, `battlePassService.ts`, `passService.ts`, `gachaService.ts`, `walletService.ts`, the localStorage key/schema, all seven game IDs/URLs, campaign-to-game return, claims and inventory. Do not merge Achievement progress/rewards with Pass Missions/XP. Preserve Check-in idempotence, lifetime progress, shared Profile badge IDs, automatic Pass XP, and all prior confirmed game/currency/Campaign rules. Keep Vease/World, Ranked/Room, MP exchange and coupon cabinet out of standard MiniGame2 navigation. No backend, payment call or production-service claim.

## Demo Defaults And Open Decisions

AIS Point top-ups, Campaign Ticket packs and Gacha Box prices are local mock values only; there are no billing calls. MP remains as an unused compatibility field in old local saves. Production AIS Point transactions, campaign ticket scope/refunds, external campaign URLs, real identity/WebView handoff, external result validation and anti-cheat remain unimplemented. Campaign dates, reward tiers/odds, VIP package demo prices and mission targets/XP are configurable examples, not production approvals. External-host gameplay and live myAIS WebView are Not Verified.

## Verification

- `npm run check`: passed, 0 errors and 0 warnings.
- `npm test`: passed, 71 tests.
- `npm run build`: passed; Vite transformed 4,253 modules. Three.js is split to a 733 kB chunk; Rollup emitted its standard chunk-size advisory.
- Browser smoke: five-tab navigation is HOME / SHOP / GAME / Battle Pass / Achievement; Home/Achievement Check-in shares one claim; `#missions` opens the nested Pass Mission page; 10 completed games unlock the permanent 10-game Achievement once; earned First Finish badge previews and pins in Profile; Pass XP and Achievement ledgers advance independently; Campaign ticket purchase/debit/consume, expiry settlement/popup and external placeholder; Gacha Box purchase/draw/History; VIP cap 15/30 with Premium locked; all seven configured game detail→iframe URL→back paths; ProfileRoom3D and accessible fallback. Widths 320/375/430 show no horizontal overflow; 25/25 sampled WebGL pixels were nontransparent in each Profile canvas; no browser page errors in exercised flows.
- Browser base tested at `http://localhost:5173/maque-center/`. Remote-host gameplay, iframe error/retry behavior against live hosts, production AIS transactions and myAIS WebView remain **Not Verified**. `DESIGN_HANDOFF.md` was absent from the workspace; the current Gemini handoff was inspected from the modified source and assets.
