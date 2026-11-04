# MiniGame2 — Acceptance Checklist, Discrepancies & Open Decisions

**Use when reviewing Copilot's functional frontend before handing off to Gemini/Argon.** Checkbox pass criteria are verifiable locally; nothing in this document implies production APIs are connected.

## A. Full demo acceptance (must pass)

### Environment & regression
- [ ] Existing Svelte 5 / Vite / TS / Tailwind 4 app starts and navigates at original base path.
- [ ] All 7 existing games remain available with unchanged URLs; iframe load/failure/retry/back and Simulate Finish behavior work.
- [ ] Mock entry `?name=...`, `?aispoint=...` and existing reset pathways still work.
- [ ] Existing user saves do not break; schema changes migrate old local data without arbitrarily destroying inventories/history.
- [ ] Vease World, Private Room, Battle Arena, old MP exchange/extra offer CTAs are **hidden** from standard MiniGame2 navigation, but code is not unnecessarily deleted.

### M1 / player foundation
- [ ] Home, Game Hub and compact game cards show properly at 320, 375 and 430px portrait.
- [ ] Category filters work; no Hot category tab; New/Hot/Hit card tags can appear without clutter.
- [ ] Home ordering and metrics use configurable/mock values; mock online/plays are visibly for demo, not live counts.
- [ ] Game detail/pre-game displays game-specific ranking and entry conditions; actions lead to game iframe or explicit mock result.
- [ ] Daily Check-in can be claimed once for demo date, displays streak and grants appropriate mock reward.
- [ ] Profile shows identity, Energy, mock AIS Point and selectable appearance/badge/frames/pet where applicable.
- [ ] Energy natural cap **15**, +1 per **30 minutes**; purchase/reward overflow accepted, no regen at/above cap; no extra refill during overflow.
- [ ] Normal game entry costs 1 Energy (unless VIP); no double charge after refresh of an already-started session.
- [ ] Normal game high-score ranking is **all-time**, per game, not cumulative and not tied to Battle Pass season.
- [ ] Equal scores sorted by **earlier achieved timestamp**.

### M2 / benefits
- [ ] VIP purchase immediately grants status and time remaining, repeated purchase extends remaining time.
- [ ] VIP exempts only **normal** game entry; does not exempt continue/revive, campaign tickets or Premium reward ownership.
- [ ] VIP-only missions visible to everyone, locked to non-VIP, functional for VIP.
- [ ] Avatar character selection and equipped cosmetic states reflect across Profile and Rankings where relevant.
- [ ] Shop, Inventory and reward grants cannot double-award on repeated clicks; mock purchases appear in History.

### M3 / season & mission
- [ ] Battle Pass uses **calendar-month** season IDs/start/end and resets XP/progress for a new season.
- [ ] Free/Premium tracks share XP and level; Premium purchase later unlocks *eligibility* for already reached Premium levels without awarding XP.
- [ ] VIP without Premium still sees Premium claim buttons locked; VIP missions may still contribute XP.
- [ ] Free/VIP/Premium missions have Daily, Weekly, Season categories and clear progress/locked states.
- [ ] Finishing a game triggers animated mission progress and once-only automatic mission XP (+XP toast/overlay).
- [ ] Pass track rewards require manual claim during an active season; duplicate claims are rejected.
- [ ] On season close, **eligible** unclaimed rewards auto-grant once; next-open popup and History record appear, ineligible Premium rewards remain locked.
- [ ] At configured MAX season level, XP cannot create unauthorized uncapped rewards/old MP bonus levels.
- [ ] Gacha can draw from a mock pool, show an outcome, record a grant and update Inventory (no real charge).

### Campaigns / rankings / rewards / History
- [ ] Campaign can show details and eligible games; configured/free mock or ticket mock entry is discoverable.
- [ ] Campaign score key is `campaignId + gameId`; separate game leaderboards and no leakage from normal rankings.
- [ ] Rank screen has gift button showing per-rank prize tiers (mock quantities configurable).
- [ ] Demo end/finalize credits each eligible prize **once**, even after refresh/reopen.
- [ ] Next open shows winning place / campaign / items, with popup acknowledgment not performing the transfer twice.
- [ ] History has **Games / Purchases / Rewards** filters and shows activity count, timestamps and relevant context.
- [ ] Notification badge/letter leads to History or popup, not a dead mailbox route.
- [ ] Energy prizes can exceed 15 and cosmetics can be equipped from actual mock ownership.

### Final checks / handoff
- [ ] `npm run check` succeeds.
- [ ] `npm test` succeeds, with added behavior tests.
- [ ] `npm run build` succeeds.
- [ ] No visible CTA is inert; iframe fallback/retry and no-asset states are usable.
- [ ] `doc/minigame2/COPILOT_HANDOFF.md` created with route list, implemented rules, changes, tests, visual placeholders and remaining issues.
- [ ] No backend, real database, real AIS Point payment, real SSO or fake anti-cheat was introduced.

## B. Verified current-code mismatches (inspect local tree again before editing)

| Area | Existing GitHub default at inspection (2026-11-04) | Correct direction |
|---|---|---|
| Stack | `package.json`: Svelte 5 + **Vite**, Tailwind 4 | **Keep current stack**; do not assume SvelteKit migration |
| Energy | `src/lib/data/config.ts` and `demoService.ts`: `max/energyMax: 12` | Natural cap **15**, overflow supported |
| VIP capacity | `vipEnergyBonus: 6`, active VIP capacity 18 | **OPEN/REVIEW**; do not advertise old benefit; retain legacy code where possible |
| VIP & premium access | `hasPassAccess() = isVip() || premium` | Premium requires **premiumOwned** independently |
| VIP plans | 30-day packs keyed by pass level, priced in MP | Independent time offers, immediately active, add remaining duration; exact SKU/price **OPEN** |
| Currency | `PlayerState.masquePoints`, AIS→MP point pack/exchange flows | New Backlog says AIS Point purchasing, but MP continuation **OPEN**; use reversible demo mock |
| Pass window | `PASS_RULES.days:30` fixed-epoch cycles | Calendar-month season boundaries |
| Pass cap | Bonus levels after 50 grant MP/tickets | End at configured MAX, no unapproved bonus economy |
| Rankings | `RankingPeriod = weekly | allTime`, legacy ranking season/prize MP | Normal all-time; campaign-specific rank/game context, tie earlier first |
| History | `demo.transactions/sessions` arrays with legacy UI | Unified games/purchases/rewards tabs, rank/season auto-delivery record |
| Routes | `Page` includes world, room, battle, admin, wallet, points | Keep code; hide from customer-facing MiniGame2 |
| User experience | Old UI doc and `README.md` describe MP, VIP Pass, ranked, World | These are **not** authoritative product requirements |

**Note:** Existing `README.md`, `ROADMAP.md` and `doc/MASQUEGAME_ARCADE_UI_UX_SPEC.md` are historical docs about the previous prototype. Do not delete; this folder has precedence **for MiniGame2**.

## C. Questions that remain OPEN — do not silently hard-code as full product commitments

1. **MP:** Continue as secondary currency, replace with direct AIS Point, or keep both? New Backlog's AIS Point Shop is clear but overall currency policy is not settled.
2. **Game rollout:** Four games at M1 vs all seven in demo, and when to activate M2 games in the eventual production UI.
3. **M1-only vs full demo presentation:** We are building an all-M3 **frontend demo by user request**; this does not settle how production milestones should be phased for stakeholders.
4. **VIP other perks:** Original Backlog mentions extra Max Energy and reduced cooldown, whereas later clarification stresses admission only. Which benefits survive?
5. **VIP SKUs:** Durations/prices, campaign promotions, extension policy for different tiers. *Extension of time is confirmed; specific price tiers are not.*
6. **Battle Pass:** Exact levels, per-level XP, season start/end timezone and reward table; auto-grant on expiry is confirmed, but retention/archive policy is open.
7. **Mission values:** Exact Daily/Weekly/Season quest list, counts, entitlement mapping and XP amounts; separate Free/VIP/Premium is confirmed.
8. **Campaign entry:** Is a shared campaign ticket a finalized product requirement? Scope across campaigns, refund-on-failure and pricing remain open. FigJam includes an example but primary Backlog does not specify ticket mechanics.
9. **Ranking rewards:** Exact paid places (top 5/10/20), artwork, amounts and distribution; only admin-configurable tiers and gift preview are established.
10. **Reward/point integration:** How AIS Point is charged and refunded, ownership/ledger, SSO, API receipts, anti-cheat validation.
11. **History retention:** Full per-round logs versus aggregated counts + latest records, storage/retention and audit policy.
12. **Profile 3D:** Real 3D avatar pipeline and 3D room asset/graphics are deferred; 2D image on a plane is confirmed for demo.

## D. Confirmed decisions not to reopen accidentally

- Normal **all-time** High Score, never cumulative and never reset with Battle Pass season.
- Ranking score tie resolved by **earlier score timestamp**.
- Energy natural cap **15**, +1 per 30 min; purchases/rewards **can exceed cap**.
- VIP normal-entry exemption only; continue/revive can still cost Energy.
- VIP and Premium Battle Pass **separate entitlements**; VIP purchase adds duration to existing expiry.
- Battle Pass **monthly season**, retroactive reward access after Premium purchase within same season, manual track claims.
- Mission XP **automatic**, post-game progress overlay; three entitlement groups Free/VIP/Premium and periods Daily/Weekly/Season.
- Campaign rank prizes **auto credited after close**, show popup next open; rank has gift icon to preview prizes.
- Dedicated **History** categories: Games / Purchases / Rewards; no extra mailbox required.
- 2D avatar **textured on 3D plane**, **not** generated as actual 3D mesh; no World.
- All code changes stay **frontend-only** until explicitly requested.

## E. Handoff criteria between agents

**Copilot → Gemini/Argon:** All M1–M3 screens and key mock flows work with no backend; Copilot hands off routes, current screenshots *if available but not required*, assets needing improvement, and tests in `COPILOT_HANDOFF.md`.

**Gemini/Argon → Copilot:** Visual agent can edit artwork, colors, Tailwind, effects, and lightweight 3D profile scene in the same working tree; it must not change service behavior, entitlements, score policy, point transactions, campaign settlement or game URLs.

**Final Copilot pass:** Re-run all automated checks and acceptance scenarios, inspect diffs, fix regressions. User reviews UI and any still-open product choices separately.
