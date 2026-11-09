# MiniGame2 Frontend Handoff

**Post-Gemini UX regression:** See [FINAL_UX_REGRESSION.md](./FINAL_UX_REGRESSION.md) for the audit of `4627cf4`, confirmed interaction fixes, actual routes, 95-test validation and mobile browser evidence. The commit/status notes below are historical.

**Status:** Final functional regression completed over Gemini/Argon Round 2 (`3a12476`). Frontend PASS; production integrations and official AIS branding remain pending. See [FINAL_REVIEW.md](./FINAL_REVIEW.md).
**Implementation commit:** `c484447` (pushed to `main`).
**Final rules/UI follow-up commit:** `45c9288` (pushed to `main`). AIS Point is purchase-only; game activities do not mint AIS Point. Shop Gacha Boxes, VIP Energy MAX 30 while active, and floating Simulate Finish.
**Functional audit commit:** `560698c` (committed locally; not pushed per request).
**Achievement/design regression commit:** `115b800` (committed locally; not pushed per request).
**AIS Point policy follow-up:** Activity rewards use Energy/items only; fresh/reset accounts, URL parameters and customer Shop cannot generate AIS Point. Demo Studio can import an explicit development-only myAIS balance snapshot for purchase QA, not as a game reward. Production route/API guards reject that fixture. Local-only; do not push.
**Scope:** Svelte 5 + Vite + TypeScript + Tailwind CSS 4. Frontend only; local mock state and the existing `masquegame_center_v2` localStorage save. No backend, database, AIS integration, billing, SSO, multiplayer service, or score verification was added.

## Screens And Routes

- **Default entry**: an empty hash opens `#hub`; explicit customer deep links are preserved.
- **Home** `#home`: Round 2 Campaign Dashboard with four carousel entries, shared Check-in, actual VIP/Pass state and latest Achievements. The fourth New Year artwork is explicitly a season-mission preview, not a configured Campaign or promise of a Celestial reward; its countdown uses the actual Pass boundary. External placeholders advertise no unconfigured reward.
- **Shop** `#shop`: Round 2 Cosmetics/Frames, Energy and VIP tabs. Five collectible frames and Pet/Avatar Gacha Boxes debit AIS Points. Boxes open on the same page. Customer top-ups, old coupon cabinet and Ranked ticket sales are hidden.
- **Game Hub** `#hub`: all seven configured games, genre filters, editorial markers, mock online/play counts, and personal bests.
- **Game Detail / Entry** `#detail/:gameId`: game summary, entry cost, high score/ranking and a pre-game Avatar/Pet/Wing loadout preview. Purchases/equips update local state and History; no cosmetic effect is sent to the hosted iframe.
- **Game Player / Result** `#game/:gameId?session=...`: unchanged configured iframe URL, loading/fallback/reload/back, and a compact floating Simulate Finish control that does not reserve a full-width footer. Campaign rounds return to their source campaign.
- **Ranking** `#ranking`: normal all-time high score per game; equal scores sort by earliest recorded time.
- **Campaign list/detail** `#campaigns`, `#campaign/:campaignId`: start/end-gated internal campaigns, separate AIS-purchased Campaign Ticket packs, per-game leaderboards, reward-tier preview, automatic one-time expiry settlement and next-open notification. Force settlement exists only in Developer Studio. External campaign placeholder is disabled until a real URL is configured; it charges no Energy/Ticket.
- **VIP** `#vip`: configurable demo durations/prices, immediate activation and duration extension. VIP covers normal game entry only.
- **Battle Pass** `#rewards`: calendar-month season, shared Free/Premium XP, manually claimable tracks, separate Premium purchase, retroactive eligibility and MAX at level 50.
- **Achievement Center** `#achievements`: fifth bottom tab; shared Home Check-in status/streak, permanent event-driven milestones, locked/unlocked Badge Gallery, detail/reward preview and Profile shortcut. Long-term progress is not tied to Pass seasons.
- **Battle Pass Missions** `#missions`: nested Pass subpage linked from Pass and the Home season preview; Round 2 Daily/Weekly/Season filters and Free/VIP/Premium tier cards use actual mission/entitlement state. XP is automatic and independent from Achievements.
- **Inventory** `#inventory`: owned avatars, pets and wings with equip actions; Profile remains the editor for frames, badges and backgrounds.
- **Gacha Boxes**: Pet/Avatar boxes are purchased and opened in Shop. Legacy `#gacha` redirects to Shop; old coupon cabinet source remains unmounted.
- **Profile** `#profile`: retained Three.js room/fallback, backgrounds, pinned badges and five collectible frames (`meadow`, `ocean`, `sunrise`, `celestial`, `krathong`). Locked previews cannot equip; catalog and ownership are validated when purchasing/saving. Header and normal/Campaign Rankings use the saved player frame.
- **History** `#history`: Games, Purchases and Rewards; Games includes per-game play counts and sessions. Header envelope links here and shows a red dot for unread notifications.
- **Demo Studio** `#admin`: development-only scenarios, clock/config/reset and an explicit myAIS snapshot input. Snapshot replaces, not increments, the fixture balance; rejects invalid values and production use. Production `#admin` redirects to `#hub`; URL balances remain ignored.

Bottom navigation order is **HOME / SHOP / GAME / Battle Pass / Achievement**. Home Check-in uses the same `checkinDates` ledger as Achievement. Campaign, Ranking, Inventory, Gacha and History remain discoverable from their owning screens. `#missions` is a Battle Pass subpage. Legacy `#world`, `#room`, `#battle`, `#wallet`, `#points` and `#avatar` remain hidden/redirected. The 320px navbar label overflow was corrected without changing layout.

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
- `src/lib/services/homeService.ts`: testable default-entry hash, actual Campaign CTA/status and season-preview countdown/reward presentation.
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
- AIS Point is a purchase currency only; gameplay never mints or grants it. Check-in, Achievement, High Score, Pass, Campaign, Ranked and Gacha duplicate rewards use Energy, cosmetics or boxes. Old MP save fields are preserved but are not spent, granted or shown in the MiniGame2 customer journey. Gacha Box purchases debit AIS Points; opening a box updates local ownership/Energy and Rewards History.
- Campaign Ticket packs debit mock AIS Points, update the separate Campaign Ticket wallet and Purchases History. Confirmed ticket entry consumes the configured quantity once; VIP does not waive it. Campaign results auto-settle at `endAt`; Developer Studio force-settlement is test-only.
- External campaigns without a real configured URL are non-launchable placeholders and consume no Energy or ticket. Never use a fabricated URL.
- Legacy Pass Gacha/Ranked ticket rewards deterministically migrate to Pet Gacha Boxes without resetting claims or player inventory. No bonus levels exist after MAX.
- Daily Check-in from Home and Achievement uses the same once-per-day state and Energy reward. Long-term achievement progress is derived from persistent play counts, scores, check-in dates and Campaign counters, not the monthly Pass season.
- A newly unlocked 7-day streak awards one Pet Gacha Box plus the canonical Badge, not Energy +5. Box ownership, opening, History and reload idempotence are tested. Already-earned historical Badge claims are preserved, not replayed; any retrospective compensation policy requires approval.
- Frame sources describe actual configured channels, not invented Ranking/Achievement rewards. No-award Campaigns keep settlement History but do not queue misleading reward-credit popups. Pass progress shows MAX/100% at the cap.
- Cosmetic purchases and equips update Shop, Inventory and Profile. Earned Achievement badges are stored once in `demo.achievements` and can be pinned from Profile.

## Acceptance Fixtures

Use Demo Studio (`#admin`) for Energy overflow, VIP renewal, level-10 Free-only Pass, VIP without Premium, ranking ties, separate Campaign scores, expired Campaigns, calendar rollover and Pet/Avatar Boxes. Import a development myAIS snapshot to exercise purchases. Reset recreates `?name=Mint` with zero generated AIS. Read the Round 2 [DESIGN_HANDOFF.md](./DESIGN_HANDOFF.md); it was present and inspected for this review.

## Visual Handoff

This is a functional/regression pass over Gemini's visual work, not a new redesign. Existing game covers, cosmetic art, Pass artwork and campaign presentation remain placeholders/reused assets. Mock online/play counts and campaign rankings are not live data. Profile uses a Three.js room with 2D avatar/pet/wing texture planes, pointer parallax and an accessible 2.5D fallback; there is no 3D avatar rig. Mission and Achievement unlock visual polish remains with Gemini/Argon.

Suggested asset work: seven game covers and promotional banner art; campaign key art and reward-tier icons; VIP package and Premium Pass illustrations; check-in and mission-completion effects; frequent-player/achievement badge or profile-banner artwork; profile room backdrop and 2D avatar texture; consistent Energy/AIS/cosmetic item icons. The design agent can inspect the running app and source directly; no screenshot or asset mapping is required.

Visual direction: retain the latest Gemini portrait-first sky-kingdom styling, compact Home, game-first Hub and inspectable Profile art. The Profile room is already lazy-loaded through `ProfileRoom3D.svelte`; polish its animation and assets without converting 2D art to a 3D model or starting Vease World. Keep render cost off non-Profile routes.

## Design-Agent Guardrails

Design may change Tailwind/CSS, typography, art, layout and animation in `App.svelte`, `AchievementPage.svelte`, `MiniGamePages.svelte`, `SeasonPage.svelte`, `GameDetailPage.svelte`, `GameScreen.svelte`, `ProfileShowcase.svelte`, `ProfileRoom3D.svelte`, `ShopPage.svelte` and related components. Preserve the services/data contracts in `achievementService.ts`, `demoService.ts`, `energyService.ts`, `campaignService.ts`, `battlePassService.ts`, `passService.ts`, `gachaService.ts`, `walletService.ts`, the localStorage key/schema, all seven game IDs/URLs, campaign-to-game return, claims and inventory. Do not merge Achievement progress/rewards with Pass Missions/XP. Preserve Check-in idempotence, lifetime progress, shared Profile badge IDs, automatic Pass XP, and all prior confirmed game/currency/Campaign rules. Keep Vease/World, Ranked/Room, MP exchange and coupon cabinet out of standard MiniGame2 navigation. No backend, payment call or production-service claim.

## Demo Defaults And Open Decisions

Campaign Ticket packs and Gacha Box prices are local demo values; there are no billing calls or customer AIS Point top-up/reward actions. The developer snapshot is QA-only. MP remains an unused compatibility field. Production transactions/refunds, identity/WebView handoff, external URLs, verified scores and anti-cheat remain unimplemented. Reward tables/prices are demo examples, not production approvals.

**Brand Verification Pending:** `ais-point.png` is generated by `scripts/generate-round2-assets.mjs` from a hand-authored SVG. Brand colors and a myAIS label do not establish official provenance. Preserve the current visual placeholder for review; obtain an approved asset and usage guidance from the AIS brand team before release. Do not describe this file as an official AIS/myAIS asset.

## Verification

- `npm run check`: passed, 0 errors and 0 warnings.
- `npm test`: passed, **85 tests** (baseline 71).
- `npm run build`: passed; Vite transformed 4,256 modules. Three.js remains a lazy 733 kB chunk with the standard size advisory.
- AIS policy smoke: fresh/reset state stayed at 0 AIS Point despite `?aispoint=1000`; Check-in changed Energy 15 to 18 and kept AIS at 0; Shop has no mock AIS top-up tab/actions. Unit tests cover no-mint reward paths, legacy reward conversion, saved-balance preservation and AIS purchase debits.
- Browser smoke: five-tab navigation is HOME / SHOP / GAME / Battle Pass / Achievement; Home/Achievement Check-in shares one claim; `#missions` opens the nested Pass Mission page; 10 completed games unlock the permanent 10-game Achievement once; earned First Finish badge previews and pins in Profile; Pass XP and Achievement ledgers advance independently; Campaign ticket purchase/debit/consume, expiry settlement/popup and external placeholder; Gacha Box purchase/draw/History; VIP cap 15/30 with Premium locked; all seven configured game detail→iframe URL→back paths; ProfileRoom3D and accessible fallback. Widths 320/375/430 show no horizontal overflow; 25/25 sampled WebGL pixels were nontransparent in each Profile canvas; no browser page errors in exercised flows.
- Final Round 2 browser matrix: **87 route/width views** at 320/375/430px, no horizontal overflow or uncaught application errors. Core modified CTAs, all five frame purchases/equip/locked-preview/reload, Day-7 Box/open/History, all nine mission filters, VIP/Premium, tickets, settlement and rollover exercised. MAX bars report 100. Navbar labels fit every tab.
- Profile canvas: 25/25 sampled points nontransparent at each width; screenshot and pointer interaction inspected; forced WebGL failure rendered the 2.5D fallback (expected Three.js console error only during that simulation). Production build loads Three.js only after Profile.
- Browser base: `http://localhost:5173/maque-center/`; production preview also verified at `/masque-gamecenter/masque-center/`. Production `#admin` redirects to Hub and `?aispoint=999999` leaves balance zero. Seven iframe URLs/back/reload paths passed; stalled-host fallback/retry passed without extra Energy. **Actual remote gameplay/result integration, real AIS transactions/WebView and official branding remain NOT VERIFIED.**
