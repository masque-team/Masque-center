# MiniGame2 — Full Product Requirements (M1–M3)

**Purpose:** Describe intended product behavior, not how the current frontend is implemented. Source labels: **[CONFIRMED]**, **[BACKLOG]**, **[DEMO DEFAULT]**, **[PROPOSED]**, **[OPEN]**. Read [00_READ_FIRST](./00_READ_FIRST.md) first.

## 1. Scope, delivery, identity

- **[CONFIRMED]** The newer **MiniGame2 Backlog** is the primary scope, overriding extra features in the older MasqueGame prototype. Do not redefine scope from the old 6-phase `ROADMAP.md`.
- **[BACKLOG]** M1: Home, Profile, Banner, Game Hub, Nav, Energy, Energy items and Shop, Game entry/result/high score, Daily Check-in, Campaign, initial games, anti-cheat and ranking integration. M2: VIP, profile frames/badges/pets, more items and effects, revive mechanics, player count and further games. M3: Battle Pass, Free/VIP/Premium missions, rewards, EXP/levels, Gacha, achievement badges, play counts and additional items. Future: character level.
- **[CONFIRMED]** Full Product Requirements include admin, durable storage, external integrations and business rules, **even though the current assignment is only a frontend demo**.
- **[BACKLOG]** Game Zone provides player identity (UserID, name, profile picture) and enables display of AIS Point where the integration allows it. Specific WebView handoff, API, token and transaction contracts are **[OPEN]**.
- **[CONFIRMED]** The pre-existing extras (Vease/World, Private Room, Battle Arena and other out-of-scope experiments) must not appear in the MiniGame2 customer journey for now. Keep code and assets, if possible.
- **[OPEN]** How many games launch in production and how M1–M3 will be exposed in the demo. The backlog lists four M1 games and additional M2 games; the existing demo already has seven. Showing seven is a **demo default**, not a decision to ship seven at M1.
- **[OPEN production]** Whether Masque Points (MP) will continue in the eventual production product. **[CONFIRMED frontend demo]** AIS Point is the only customer-facing currency; legacy MP values remain in existing saves only and are not displayed, spent, awarded or converted in MiniGame2 demo flows.

## 2. Home / Discover / Banner / Navigation

- **[BACKLOG]** Home exposes Profile, Game Hub, Daily Check-in, campaigns/promotions, then VIP and Battle Pass when their milestones are active. Main catalog and promoted ordering are configurable.
- **[CONFIRMED]** Home ordering can be set by an administrator. Automatic ordering for popular games may also be provided, with admin override/boost.
- **[CONFIRMED]** In Game Hub, category filters remain (All / Arcade / other genres). **No separate 'Hot' category tab**; New/Hot/Hit are compact markers on game cards.
- **[CONFIRMED]** Cards may show: editorial badge/ribbon (upper left), current online count (upper right) and cumulative play count (lower right), provided the UI does not become cluttered. Numbers may be mocked in the demo. Displaying all three metrics is an information/design idea, not a locked layout.
- **[BACKLOG]** Admin configures Banner image and URL. **[PROPOSED]** Additional system-generated promotional banners (all-time most-played, trending) and automatic card badge rules, overrideable by admin.
- **[BACKLOG]** Navigation supports Home, Shop, Game Hub, and by M3 Battle Pass/Mission. Placement and number of bottom tabs are a UX design decision, not a requirement to expose every page as a bottom tab.
- **[CONFIRMED latest UX clarification]** The fifth customer bottom tab is **Achievement**, not Mission. The historical Backlog term “Mission” refers to Battle Pass EXP missions, which remain inside Battle Pass or its nested mission subpage; they are not the Achievement tab.
- **[BACKLOG]** Selecting a game opens its pre-game/entry experience and then the existing playable game URL; back/return preserves session state.
- **[BACKLOG]** The seven source game concepts are whac-a-mole, duck shooting, memory card, fruit slicing, timber/chopping, flying bird and animal runner. Each has its own catalog ID and scores.

## 3. Profile / Avatar / Cosmetic / Pet / Achievement

- **[BACKLOG]** Profile displays Game Zone identity, supports profile picture or character choice, Energy and AIS Point display, VIP state, equipped frame, badge and pet.
- **[CONFIRMED]** Product vision uses a real **3D avatar** in the Profile environment, but frontend demo may put a 2D character image/texture on a simple 3D plane. This is explicitly **not** a 3D-model conversion.
- **[CONFIRMED]** Profile scene may be an attractive room/personal backdrop suggesting a 3D space. Do not build the full Vease World/metaverse now. Final visual composition belongs to the design agent.
- **[BACKLOG]** Frame, Badge and Pet become selectable as milestone features; character level is explicitly a **future** feature.
- **[CONFIRMED]** Ranking banner is a cosmetic displayed behind/beside player name in Profile or ranking presentation; not the same thing as a home promotional banner.
- **[BACKLOG]** Achievement/Badge from missions is displayed on Profile. Exact achievement catalog and rules remain configurable.
- **[CONFIRMED latest UX clarification]** Achievement is a separate, persistent player system for Daily Check-in/streaks and long-term gameplay/activity goals. Its progress does not reset with the monthly Battle Pass unless an explicitly seasonal Achievement is defined. Earned badges use the same Profile badge collection and pin-selection state; do not create a duplicate badge inventory.
- **[CONFIRMED]** Profile or a notification icon should lead to a central player History (see section 12).

## 4. Energy and normal gameplay

- **[CONFIRMED]** Normal game admission costs **1 Energy per new play**, unless an active VIP covers the admission. VIP covers **normal games only**; do not apply it to campaign ticket admission.
- **[CONFIRMED]** Base natural-regeneration cap **15 Energy**, recharge **+1 every 30 minutes**, no natural regen while balance is at/above 15.
- **[CONFIRMED]** Shop purchases and rewards **may exceed the natural cap**: e.g. 20/15 or 30/15. Do not clamp to 15. Regen resumes once balance is below cap. Distinguish the regen cap from inventory balance.
- **[CONFIRMED latest]** Normal Energy MAX is 15; active VIP Energy MAX is 30. Both regenerate +1 every 30 minutes below their active cap. Purchases/rewards may exceed either cap; no regen occurs while at/above the active cap.
- **[BACKLOG]** Energy is purchasable, awarded through systems and usable for game entry and additional in-game actions. Provide an intuitive refill shortcut when balance is insufficient.
- **[CONFIRMED]** A retry/continue after losing may cost another **1 Energy**, **even if VIP**, and game-specific pre-game power-ups may consume Energy. The exact real external-game resume API is **[OPEN]**.
- **[BACKLOG]** Product system must prevent double charges and persist balances/transactions.
- **[CONFIRMED latest]** Active VIP waives normal-game entry and raises Energy MAX from 15 to 30. Continue/revive still costs 1 Energy and Campaign Ticket entry is not waived. Energy cooldown reduction is not approved.

## 5. VIP / time-based package

- **[CONFIRMED]** VIP is a separate time-based benefit from the Battle Pass. Its core agreed value is free **normal-game entry**, not free continue/revive, not campaign admission and not automatic Premium Battle Pass rewards.
- **[CONFIRMED]** Purchase activates VIP immediately: no hidden 'use item from wallet' step. Show active status and time remaining.
- **[CONFIRMED]** If purchasing while VIP is already active, **add purchased duration to the existing expiry**. E.g., 2 days remaining + a 3-day package = 5 days remaining.
- **[DEMO DEFAULT]** Demo Studio exposes 6-hour, 1-day and 3-day VIP packages with editable demo durations/prices. Production SKU names and AIS Point prices remain **[OPEN]**.
- **[BACKLOG]** VIP may have a dedicated set of missions (Daily/Weekly/Season). These missions contribute XP, but **VIP itself does not grant Premium Battle Pass rewards**.
- **[CONFIRMED latest]** Energy capacity expansion to 30 is included during VIP. Cooldown reduction remains unapproved and is not exposed.

## 6. Shop / currency / inventory / gacha

- **[BACKLOG]** New MiniGame2 Shop offers AIS Point purchasing, Energy (M1), VIP and cosmetics/pet/battle pass (M2–M3 by original milestone), with contextual links to items/benefits.
- **[OPEN production]** Role of MP as a currency. **[CONFIRMED frontend demo]** Customer purchases use mock AIS Point only; MP exchange and MP-priced items are hidden. Existing MP save fields are preserved for compatibility.
- **[BACKLOG]** Item types: Energy, VIP entitlement, effects, Battle Pass entitlement, character/skin, pet, revives, frames and badges. Distinguish consumable stacks from persistent ownership and time-based entitlements.
- **[CONFIRMED]** Buying VIP activates immediately and buying Premium Battle Pass unlocks that season's rewards immediately; do not force a confusing claim-from-wallet activation.
- **[BACKLOG]** Gacha (M3) requires admin-configurable prize pool, odds and draw action. **[DEMO DEFAULT]** Pet/Avatar Gacha Boxes are purchased with mock AIS Points and opened in Shop. Legacy coupon mechanics are hidden; demo prices/odds are not production-approved.
- **[PROPOSED]** Awarding consumables and cosmetics should create entries in History and ownership/selection states. No double grant for one claim.

## 7. Game entrance, end-game and ranking

- **[BACKLOG]** Game Detail / Entry exposes Leaderboard, optional effects/power-ups, game rules or assets, start action and valid cost.
- **[BACKLOG]** Game End records high score and, by M2–M3, progress toward VIP and Pass missions. Production must integrate with score validation/anti-cheat and ranking platform.
- **[CONFIRMED]** **All ranking uses HIGH SCORE (personal best), never cumulative-score ranking.** A new score only replaces a user's previous best for that leaderboard when higher.
- **[CONFIRMED]** **Tie-break:** the player who achieved that score **earlier** ranks higher.
- **[CONFIRMED]** Each normal game has its own **all-time** leaderboard persisting indefinitely. It does not reset with Battle Pass seasons.
- **[CONFIRMED]** Campaign leaderboards are separately scoped **by campaign and by game**; these reset for new campaign contexts, and scores must not leak into normal all-time ranking automatically.
- **[BACKLOG]** Production score submission and anti-cheat are real product concerns, but a frontend mock cannot validate independent game results. Never present simulated integrity as real anti-cheat.

## 8. Campaigns, entry, leaderboard prizes

- **[BACKLOG]** Campaign has a name/image/details, selection of games and configured prizes. Marketing/Admin owns configuration in the actual system.
- **[OPEN production]** Campaign entry scope, ticket SKU/price and external game contracts are not settled by the primary sheet. **[CONFIRMED frontend demo]** A separate Campaign Ticket wallet can be topped up in configurable AIS Point packs; eligible ticket campaigns debit their configured quantity once per confirmed new session. VIP does not replace a ticket. These are mock values, not production pricing/contracts.
- **[CONFIRMED]** Campaign rank rewards are configured by placement, potentially rank 1–5, 1–10, or top 20. The number of rewarded places is not yet fixed.
- **[CONFIRMED]** Examples of prizes: Energy (e.g. 5), ranking banner, profile frame, skin, badge or other existing inventory items. Actual tier tables and quantities are **[OPEN]**, not approved.
- **[CONFIRMED]** Ranking screen includes an obvious **gift icon** to preview rank-by-rank reward tiers.
- **[CONFIRMED]** When a campaign ends, ranked prizes are **credited automatically**. A user must not need to revisit a closed campaign to claim. On next login, show a visually clear congratulations/reward summary popup. The popup dismisses a notification; the actual credit has already occurred.
- **[CONFIRMED]** A letter/envelope icon with a red dot may lead to History / reward notifications, not a separate new mailbox/claim subsystem.

## 9. Battle Pass — calendar season and entitlements

- **[CONFIRMED]** Battle Pass is **monthly/calendar-season-based**, not an individual 30-day purchase that straddles two seasons. Level/XP/reward table resets for a new season.
- **[CONFIRMED]** Player can complete **Free** quests first and buy **Premium** late in the same season; buying grants **retroactive eligibility to the Premium track up to their current level** (not free XP or automatic reward-claim).
- **[CONFIRMED]** Free and Premium share one season **XP/Level progress**, with separately claimable reward tracks. Premium purchase ends when that season ends.
- **[CONFIRMED]** The Premium entitlement **does not equal VIP**; VIP holders still need Premium purchase for Premium rewards.
- **[BACKLOG]** Shop may offer a separate shortcut to purchase EXP/levels, subject to pricing/limits (**[OPEN]**).
- **[CONFIRMED]** Once a user reaches the season's configured level cap, stop at MAX (no automatically invented uncapped bonus economy). Exact max level/XP table is **[OPEN]**.
- **[CONFIRMED]** Unclaimed, **eligible** Pass rewards at the end of a season should be automatically credited and reported via popup on next open. Never grant locked Premium rewards to non-owners.

## 10. Battle Pass Missions, Achievement and UX

- **[CONFIRMED]** Mission entitlements: **Free, VIP, Premium Battle Pass**. These are three distinct mission groups; XP from all eligible completed missions feeds the same Battle Pass season level.
- **[CONFIRMED]** Time scopes: **Daily, Weekly, Season**. Mission targets and XP may vary by entitlement group. VIP and Premium missions may yield higher XP, amounts configurable.
- **[CONFIRMED]** Locked VIP and Premium missions remain **visible but locked**, with clear purchase prompts; do not hide benefits completely.
- **[CONFIRMED]** After game completion, visually animate the relevant mission progress (e.g., 2/5 → 3/5) in a post-game overlay. Display +XP on completion.
- **[CONFIRMED]** Completed mission **XP is granted automatically**. Battle Pass **level rewards are claimed manually** from their track while season is active (except the end-of-season fallback stated above).
- **[CONFIRMED latest UX clarification]** Free/VIP/Premium Daily/Weekly/Season EXP missions belong inside Battle Pass or its nested mission subpage. A game event may update both an Achievement and a Pass Mission, but each has separate progress and reward ledgers; Achievement rewards never grant Pass XP unless explicitly configured as a Pass mission reward.
- **[CONFIRMED latest UX clarification]** The Achievement Center owns Daily Check-in, streak, permanent game/activity milestones, progress, reward previews and locked/unlocked Badge Gallery. Home may keep a Check-in shortcut, but both surfaces use the same date ledger and award once per day.
- **[DEMO DEFAULT]** Lifetime examples include 10/50/100 completed games, 7-day check-in streak, all game genres, personal-best threshold and Campaign participation/completion. Keep thresholds/rewards configurable and never reset lifetime progress on monthly Pass rollover.
- **[BACKLOG]** Daily Check-in (M1) shows streak, immediate check-in prize and participation in Battle Pass missions. Production reward amounts/streak policy are **[OPEN]**.

## 11. Administration / integration — full product, NOT current demo

- **[BACKLOG/PROPOSED]** Admin should be able to manage Home order, game publishing, genres/tags, banners/links, promotion packages, Shop offers, VIP durations, mission definitions, Battle Pass season/reward tables, gacha odds, campaign configuration and reward tiers.
- **[BACKLOG]** System must integrate identity, AIS Point display/payment methods, result verification, leaderboard, anti-cheat, persistent inventory, entitlement ledger, history and campaign settlement.
- **[CONFIRMED]** None of those production services are to be built as part of the current frontend-only demo unless separately instructed.
- **[OPEN]** API contracts, SSO method, event receipts, exact data retention, real billing and server rules need separate technical specification.

## 12. History / notifications

- **[CONFIRMED]** Add a central **History** view. It should be reachable via Profile and/or a letter/notification icon whose placement UX can decide.
- **[CONFIRMED]** Filterable tabs or sections: **Game play history**, **Purchases/point transactions**, **Rewards and granted items** (a combined All tab is optional).
- **[CONFIRMED]** Game history includes which games and how often played, with suitable per-game statistics. Purchases and rewards identify source, date/time and item/amount where relevant.
- **[CONFIRMED]** Reward notification popup accompanies automatic prize grant; opening History provides a durable reference even after campaigns close.
- **[OPEN]** Exact per-round retention policy, backend log schema, and whether admins can query/audit transactions.

## 13. Design intent vs product contract

- Mobile-first portrait inside myAIS WebView; compact, cheerful polished casual-game UI, not cluttered.
- **Profile:** 2D character image textured on plane in tasteful 3D room for demo; real 3D model later. Do not confuse this with a functioning World.
- A visual/graphic agent can improve covers, badges, banners, rewards, mission-progress effects, profile backgrounds and card styling. **No visual change may silently alter rules, ownership, prices or scoring.**
- Actual placements, illustrations and animations are **design tasks**, not frozen behavior of this document.

## 14. Important differences from existing prototype

| Existing repo implementation (not current policy) | MiniGame2 product requirement / disposition |
| --- | --- |
| Natural Energy 12, VIP +6 capacity | Normal cap **15**, VIP cap **30**, +1/30 min, overflow allowed; VIP waives normal entry only |
| VIP 30-day LV1/LV20/LV30 boosts tied to Pass | VIP is **time entitlement for normal entry**; paid Premium Pass **separate** |
| `hasPassAccess` allows `isVip` | Must **not** grant Premium track based only on VIP |
| Current Pass 30-day fixed-epoch window | **Calendar-month season**; premium is season-limited |
| Current Pass bonus XP beyond Level 50 / bonus MP | **Stop at configured MAX**; no bonus levels. Legacy ticket rewards migrate to usable Pet Gacha Boxes without resetting claims/inventory |
| MP exchange & MP pricing across Shop | Demo uses AIS Point only; legacy MP is save compatibility only. Production MP policy remains **OPEN** |
| Lifetime + weekly/season rankings and MP prizes | Normal all-time high-score + separate campaign high-score; tie earlier wins |
| Ranked Battle Arena / World / rooms visible | **HIDDEN LEGACY** until explicitly requested |
| History primarily existing transactions/metadata | **Dedicated player History** tabs Game/Purchase/Reward |

**Do not change product rules because old UI has convenient code.** The [demo spec](./02_FRONTEND_DEMO_SPEC.md) describes a safe frontend simulation without touching real integrations.
