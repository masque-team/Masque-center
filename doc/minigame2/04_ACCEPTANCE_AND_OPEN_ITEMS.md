# MiniGame2 — Acceptance Checklist, Discrepancies & Open Decisions

**Use when reviewing Copilot's functional frontend before handing off to Gemini/Argon.** Checkbox pass criteria are verifiable locally; nothing in this document implies production APIs are connected.

## A. Full demo acceptance (must pass)

### Environment & regression
- [x] Existing Svelte 5 / Vite / TS / Tailwind 4 app starts and navigates at original base path.
- [ ] All 7 existing games remain available with unchanged URLs; iframe load/failure/retry/back and Simulate Finish behavior work. URLs/back flow were exercised; remote host gameplay and error/retry integration remain Not Verified.
- [x] Mock entry `?name=...`, `?aispoint=...` and existing reset pathways still work.
- [x] Existing user saves migrate without resetting inventory/claims; added migration test covers old VIP values and legacy Pass ticket rewards.
- [x] Vease World, Private Room, Battle Arena, old MP exchange/extra offer CTAs are hidden from standard MiniGame2 navigation; direct legacy routes redirect to Home/Shop while legacy code remains.
- [x] AIS Point display and debit agree in active MiniGame2 purchase flows; MP remains only as hidden legacy save/service compatibility.

### M1 / player foundation
- [x] Home, Game Hub and compact game cards show properly at 320, 375 and 430px portrait with no horizontal overflow.
- [x] Category filters work; no Hot category tab; New/Hot/Hit card tags can appear without clutter.
- [x] Home ordering and metrics use configurable/mock values; mock online/plays are visibly for demo, not live counts.
- [x] Game detail/pre-game displays game-specific ranking and entry conditions; owned/purchasable cosmetics update local loadout and History without claiming iframe integration.
- [x] Daily Check-in can be claimed once for demo date, displays streak and grants AIS Point; reload preserves the claimed state.
- [x] Profile shows identity, Energy, mock AIS Point and selectable appearance/cosmetics.
- [x] Normal Energy MAX **15**, active VIP MAX **30**, +1 per **30 minutes below active cap**; purchase/reward overflow accepted, no regen at/above cap; no extra refill during overflow.
- [x] Normal game entry costs 1 Energy (unless VIP); refresh/back preserves the spent balance without a second charge.
- [x] Normal game high-score ranking is **all-time**, per game, not cumulative and not tied to Battle Pass season.
- [x] Equal scores sorted by **earlier achieved timestamp**.

### M2 / benefits
- [x] VIP purchase immediately grants status and time remaining, repeated purchase extends remaining time.
- [x] VIP raises Energy MAX to **30**, exempts only **normal** game entry; does not exempt continue/revive, Campaign Tickets or Premium reward ownership.
- [x] VIP 6-hour/1-day/3-day demo offers use AIS Point and immediately activate/extend expiry; confirmed rule values are read-only in Demo Studio.
- [x] VIP-only missions visible to everyone, locked to non-VIP, functional for VIP.
- [x] Avatar and cosmetic selection updates Profile and pre-game preview state.
- [x] Shop, Inventory and reward grants reject repeated owned-item purchases; mock purchases appear in History.

### M3 / season & mission
- [x] Battle Pass uses **calendar-month** season IDs/start/end and resets XP/progress for a new season.
- [x] Free/Premium tracks share XP and level; Premium purchase later unlocks *eligibility* for already reached Premium levels without awarding XP.
- [x] VIP without Premium still sees Premium claim buttons locked; VIP missions may still contribute XP.
- [x] Free/VIP/Premium missions have Daily, Weekly, Season categories and clear progress/locked states.
- [x] Finishing a game triggers animated multi-mission before/after progress and once-only automatic mission XP (+XP overlay).
- [x] Pass track rewards require manual claim during an active season; duplicate claims are rejected.
- [x] On season close, **eligible** unclaimed rewards auto-grant once; next-open popup and History record appear, ineligible Premium rewards remain locked.
- [x] At configured MAX season level, XP cannot create unauthorized uncapped rewards or bonus levels.
- [x] Gacha Boxes purchase/draw from a mock pool, show an outcome, record a grant and update Inventory without a real charge.
- [x] Pass tables contain no usable-path Ranked/Arena Tickets or legacy Gacha Coupons; old reward rows migrate deterministically to Pet Boxes without resetting claims/inventory.

### Achievement and Check-in
- [x] Fifth bottom tab is labeled **Achievement** and opens the Achievement Center; no navbar/Home item exposes Battle Pass EXP missions as a separate main destination.
- [x] Historical `#missions` route remains a Battle Pass mission subpage reachable from Battle Pass and has a return path; Free/VIP/Premium and Daily/Weekly/Season remain available there.
- [x] Home and Achievement Check-in show the same claimed state, streak and AIS reward; claiming from either surface cannot award twice that day.
- [x] Lifetime Achievements cover game count, unique genres, normal High Score, check-in streak and Campaign activity; progress survives monthly Pass rollover.
- [x] Matching event updates both Achievement and Pass mission progress independently; Achievements never add Pass XP, and Pass XP remains once-only.
- [x] Achievement unlock adds one Badge/reward to the canonical `demo.achievements` collection, History and notification queue; repeating the event does not grant again.
- [x] Badge Gallery previews locked/unlocked criteria and rewards; earned badges appear in Profile and can be pinned using the existing Profile selection state.

### Campaigns / rankings / rewards / History
- [x] Campaign can show details and eligible games; configured/free mock or ticket mock entry is discoverable.
- [x] Campaign Ticket packs can be purchased with AIS Points, update the separate ticket wallet and Purchases History; confirmed entry consumes once and VIP does not waive it.
- [x] Campaign start/end times gate entry; expiry automatically closes and settles once; force settlement is Developer Studio only.
- [x] External campaign without a configured real URL shows a clear placeholder and charges neither Energy nor ticket.
- [x] Campaign score key is `campaignId + gameId`; separate game leaderboards and no leakage from normal rankings.
- [x] A Campaign without Bird selects its first valid game for ranking and uses that same game ID for scores.
- [x] Rank screen has gift button showing per-rank prize tiers (mock quantities configurable).
- [x] Campaign expiry automatically credits each eligible prize **once**, even after refresh/reopen; early force-settlement is Developer Studio only.
- [x] Next open shows winning place / campaign / items, with popup acknowledgment not performing the transfer twice.
- [x] History has **Games / Purchases / Rewards** filters and shows activity count, timestamps and relevant context.
- [x] Games History shows per-game play counts and sessions even when event records are present.
- [x] Notification badge/letter leads to History and unread reward popup, not a dead mailbox route.
- [x] Energy prizes can exceed 15 and cosmetics can be equipped from actual mock ownership.

### Final checks / handoff
- [x] `npm run check` succeeds.
- [x] `npm test` succeeds, with added behavior tests.
- [x] `npm run build` succeeds.
- [ ] No visible CTA is inert; iframe fallback/retry and no-asset states are usable.
- [x] `doc/minigame2/COPILOT_HANDOFF.md` contains route list, implemented rules, tests, visual placeholders and remaining issues.
- [x] No backend, real database, real AIS Point payment, real SSO or fake anti-cheat was introduced.

## B. Verified current-code mismatches (inspect local tree again before editing)

| Area | Existing GitHub default at inspection (2026-11-04) | Correct direction |
|---|---|---|
| Stack | `package.json`: Svelte 5 + **Vite**, Tailwind 4 | **Keep current stack**; do not assume SvelteKit migration |
| Energy | `src/lib/data/config.ts` and `demoService.ts`: `max/energyMax: 12` | Natural cap **15**, overflow supported |
| VIP capacity | `vipEnergyBonus: 6`, active VIP capacity 18 | **CONFIRMED latest:** normal 15, active VIP 30; free normal entry only; retain legacy source but enforce demo rules |
| VIP & premium access | `hasPassAccess() = isVip() || premium` | Premium requires **premiumOwned** independently |
| VIP plans | 30-day packs keyed by pass level, priced in MP | Independent time offers, immediately active, add remaining duration; exact SKU/price **OPEN** |
| Currency | `PlayerState.masquePoints`, AIS→MP point pack/exchange flows | Demo: AIS Point only in customer flows; legacy MP values/services remain for compatibility but are hidden and inactive. Production MP policy remains **OPEN** |
| Pass window | `PASS_RULES.days:30` fixed-epoch cycles | Calendar-month season boundaries |
| Pass cap/rewards | Bonus levels after 50 grant MP/tickets; hidden Ranked/Gacha ticket items | End at configured MAX; migrate legacy ticket reward rows to usable Gacha Boxes without resetting claims/inventory |
| Rankings | `RankingPeriod = weekly | allTime`, legacy ranking season/prize MP | Normal all-time; campaign-specific rank/game context, tie earlier first |
| History | `demo.transactions/sessions` arrays with legacy UI | Unified games/purchases/rewards tabs, rank/season auto-delivery record |
| Routes | `Page` includes world, room, battle, admin, wallet, points | Keep code; hide from customer-facing MiniGame2 |
| User experience | Old UI doc and `README.md` describe MP, VIP Pass, ranked, World | These are **not** authoritative product requirements |

**Note:** Existing `README.md`, `ROADMAP.md` and `doc/MASQUEGAME_ARCADE_UI_UX_SPEC.md` are historical docs about the previous prototype. Do not delete; this folder has precedence **for MiniGame2**.

## C. Questions that remain OPEN — do not silently hard-code as full product commitments

1. **Production currency policy:** Whether MP exists as a secondary production currency and how AIS Point transactions work remains open. The MiniGame2 frontend demo is confirmed AIS Point only; no MP conversion is exposed.
2. **Game rollout:** Four games at M1 vs all seven in demo, and when to activate M2 games in the eventual production UI.
3. **M1-only vs full demo presentation:** We are building an all-M3 **frontend demo by user request**; this does not settle how production milestones should be phased for stakeholders.
4. **VIP other perks:** VIP Energy MAX 30 and free normal entry are confirmed for the current demo. Reduced cooldown remains unapproved; any additional production perks need sign-off.
5. **VIP SKUs:** Demo uses configurable 6-hour/1-day/3-day packages; production durations, prices and SKU names remain open. *Extension of time is confirmed.*
6. **Battle Pass:** Exact levels, per-level XP, season start/end timezone and reward table; auto-grant on expiry is confirmed, but retention/archive policy is open.
7. **Mission values:** Exact Daily/Weekly/Season quest list, counts, entitlement mapping and XP amounts; separate Free/VIP/Premium is confirmed.
8. **Achievement configuration:** Demo includes lifetime examples and once-only rewards; final production catalog, thresholds, reward amounts and any explicitly seasonal Achievements remain open. Achievement is distinct from Battle Pass Missions.
9. **Campaign entry:** Demo supports configurable Campaign Ticket packs bought with AIS Points and configured per-round consumption. Production ticket scope, refund-on-failure and pricing remain open; tickets are distinct from Ranked/Arena tickets.
10. **Ranking rewards:** Exact paid places (top 5/10/20), artwork, amounts and distribution; only admin-configurable tiers and gift preview are established.
11. **Reward/point integration:** How AIS Point is charged and refunded, ownership/ledger, SSO, API receipts, anti-cheat validation.
12. **History retention:** Full per-round logs versus aggregated counts + latest records, storage/retention and audit policy.
13. **Profile 3D:** Real 3D avatar pipeline and 3D room asset/graphics are deferred; 2D image on a plane is confirmed for demo.

## D. Confirmed decisions not to reopen accidentally

- Normal **all-time** High Score, never cumulative and never reset with Battle Pass season.
- Ranking score tie resolved by **earlier score timestamp**.
- Energy natural cap **15**, +1 per 30 min; purchases/rewards **can exceed cap**.
- Active VIP Energy MAX **30**; VIP normal-entry exemption only; continue/revive and Campaign Tickets still cost their own admission resource.
- AIS Point is the only customer-facing currency in the frontend demo; MP conversion, MP prices and MP rewards are hidden. Old MP values remain in saves only.
- Campaign Ticket purchase packs and countdown/expiry settlement are frontend mock behavior, not a production ticket or payment contract.
- VIP and Premium Battle Pass **separate entitlements**; VIP purchase adds duration to existing expiry.
- Battle Pass **monthly season**, retroactive reward access after Premium purchase within same season, manual track claims.
- Mission XP **automatic**, post-game progress overlay; three entitlement groups Free/VIP/Premium and periods Daily/Weekly/Season.
- Navbar **Achievement** is lifetime/check-in/badge progression. Battle Pass EXP Missions remain nested inside Battle Pass; both can share events but never reward through the other system's ledger.
- Campaign rank prizes **auto credited after close**, show popup next open; rank has gift icon to preview prizes.
- Dedicated **History** categories: Games / Purchases / Rewards; no extra mailbox required.
- 2D avatar **textured on 3D plane**, **not** generated as actual 3D mesh; no World.
- All code changes stay **frontend-only** until explicitly requested.

## E. Handoff criteria between agents

**Copilot → Gemini/Argon:** All M1–M3 screens and key mock flows work with no backend; Copilot hands off routes, current screenshots *if available but not required*, assets needing improvement, and tests in `COPILOT_HANDOFF.md`.

**Gemini/Argon → Copilot:** Visual agent can edit artwork, colors, Tailwind, effects, and lightweight 3D profile scene in the same working tree; it must not change service behavior, entitlements, score policy, point transactions, campaign settlement or game URLs.

**Final Copilot pass:** Re-run all automated checks and acceptance scenarios, inspect diffs, fix regressions. User reviews UI and any still-open product choices separately.
