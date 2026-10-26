# Masque Game Center — Full Demo Roadmap (Phase 1–6)

> **Purpose:** Implementation brief for an AI coding agent to extend the EXISTING `masque-team/Masque-center` frontend into a complete, navigable demonstration of all six phases.
>
> **Status:** Proposed demo scope. This document does not mean the features are already implemented or approved as final commercial rules.
>
> **References:** [Original phase board](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=10892-11499), [Feature × Phase Matrix](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=10942-12524), [Detailed Marketing & Development Roadmap](https://www.figma.com/board/S22W1gQx79krqDPIqaUgV8/Strategic-Systems-Design?node-id=10939-12524).

## 1. Mission for the coding AI

**Build the entire six-phase experience in the existing demo app**, so stakeholders can click through a believable end-to-end Game Center experience. Do not create a disconnected redesign or rebuild any existing minigame. Preserve and reuse the repository's game catalog/URLs and existing iframe game player.

- Tech baseline: **Svelte 5, TypeScript, Vite, Tailwind CSS 4**, mobile-first portrait WebView embedded in myAIS. Respect existing architecture, route structure, asset paths, and deploy base path.
- Keep the project **frontend-only**, with a single cohesive mock state using localStorage, resettable fixtures and simulated services. No real backend, real AIS Points exchange, real score validation, or real multiplayer are required for this demo.
- Make every visible control work within the simulation (purchase, equip, claim, switch season, save room, etc.). Do not create dead buttons, orphan pages, or mock purchases that don't affect shared state.
- The seven existing games stay permanently available: seasons/competitions change ranking periods, Battle Pass/theme, NOT whether a game itself is available.
- **Phase 1 is the production launch order**, followed by successive feature phases; the **demo** can show the complete end-state of phases 1–6 immediately.
- Marketing/Admin configuration is simulated locally and should visibly update player-facing screens.
- Distinguish agreed product requirements from suggested demo-only implementation choices.

## 2. Feature-by-phase matrix

| Phase | Points / Shop | Profile, Avatar & Pet | Energy / VIP | Game & SDK | Ranking / Reward | Missions / Pass | Social / Admin |
|---|---|---|---|---|---|---|---|
| **1. Core** | Exchange AIS→Masque Points; energy shop | Profile, EXP and level (display progress only) | Shared Energy, free regen, purchases | Existing 7 minigames via iframe; game registry | Per-game score; persistent and season scores; Masque Points prizes only | Daily check-in, simple missions | Game catalog, reward and energy configurations |
| **2. VIP** | VIP packages, cosmetics store | VIP profile frames, cosmetic looks | VIP entitlement and energy benefits | Keep same games; cosmetics previews | Fair rankings for VIP/free | Optional VIP missions | Admin VIP products, benefits, pricing |
| **3. Battle Pass** | Premium track purchase, collectibles | 2D outfit presets/layered dress-up where assets exist, pets, inventory, gacha | Reuse balances/entitlements | Cosmetics can be displayed in Game Center; avoid altering hosted games | Ranking season configurable independently | Free/Premium track, missions, XP, claim and season themes | Admin configure seasons, rewards, gacha pool |
| **4. Battle Mode** | Tickets/entry cost (mock) | Prize items | Reuse shared economy | Mock competitive match flow | Mock verified outcome and prize | Optional battle mission | Admin match rules and rewards |
| **5. Metaverse** | Cosmetic showcase | Show equipped 2D avatar and pet | — | Lightweight 2D walkable world | Show profile/title/ranking badges | — | Mock peers, emotes, chat bubbles, world theme |
| **6. Community** | Room decor items | Show character and pet in private room | Optional VIP room benefits | Party/join UI, game selection | Optional room score display | — | Private rooms, invite codes, room editor and saving; mock users |

**Priority:** Product direction phases 1–3 are committed; phase 4 is flexible; phases 5–6 are future extensions. The demo should include a representation of every phase. Exact economy, items and pricing are adjustable mock examples, not finalized business rules.

## 3. Detailed feature requirements and acceptance criteria

### Phase 1 — Core Game Center (usable product foundation)

**Marketing goal:** Drive repeat engagement in myAIS and allow customers to burn AIS Points to access more play.

**Player-facing UI**
- Home: player avatar, name/level/EXP bar, shared Energy, Masque Points, game cards, personal high scores and featured actions.
- List all registered games, with familiar thumbnails and descriptions; play opens the **existing hosted game URLs** in iframe.
- Shared Energy for all games: default maximum **12** free-regenerated Energy; **+1 every 30 minutes**, **1 consumed to start each game** (demo config). Purchases can exceed normal regen cap; free regen should not continue while at/above cap. Avoid deducting twice on iframe re-render.
- Exchange demo: **1 AIS Point = 10 Masque Points**, clearly labeled as simulated.
- Buy Energy using Masque Points, balance/history update immediately.
- Daily check-in and missions with visible rewards/claim state.
- Profile gains EXP from mock-completed play; **level and EXP never improve gameplay stats**.
- Rankings per game: lifetime best and independently resettable season ranking. Rewards only **Masque Points**, never AIS Points.

**Dev / platform responsibilities:** local PlayerStore; EnergyService, WalletService/transaction ledger, GameCatalog/GamePlayer facade, GameResult mock adapter, MissionService, RankingService; control replay/duplicate claims. Future real SDK and backend validation remain integration seams only.

**Marketing/Admin mock:** manage game URL/order/published status, Energy parameters, prices, point exchange rate, check-in reward, missions and ranking seasons.

**Done when:** Complete loop Home → check-in → choose game → spend shared Energy → return → simulate score/EXP → ranking → exchange/buy → continue, with all balances consistent.

### Phase 2 — VIP & Cosmetic Shop

**Marketing goal:** Increase perceived convenience, personalization and repeat Points usage.

- VIP packages from existing config (currently demo has 5-day and 7-day options): selection, benefit preview, mock purchase, expiry countdown, VIP badge/profile frame.
- VIP Energy benefit shown and honored consistently (existing prototype models unlimited play); free players can still play and compete fairly.
- Shop tabs for avatar cosmetics, effects, frames, pets/collections as appropriate; purchasing grants ownership, not automatic equipment.
- Purchase history, insufficient balance, already-owned, and expired benefits states.
- Admin mock: add/edit VIP plans, durations, benefits and cosmetics catalog.

**Done when:** Buy VIP → benefit immediately changes player state/UI → buy cosmetic → ownership/inventory persists → expiry switches benefit off (mock clock/test controls can assist).

### Phase 3 — Battle Pass, Customizable Avatar & Pets

**Marketing goal:** Give players collectibles and fresh seasonal reasons to return.

- Battle Pass with **Free** and **Premium** reward lanes; tiers, progress, missions, claim state, locked/unlocked states and Premium purchase flow.
- Distinguish **player EXP** (profile display) from **Battle Pass XP** (season progress) and **season ranking score**.
- Season example themes: Songkran and Loy Krathong. Admin switches dates/theme/reward table in mock state; Battle Pass season and ranking season are allowed to have different schedules.
- Wardrobe: choose avatar look, outfit preset and cosmetic slots (head/hair/top/accessory/frame). Preview updates in Profile and Home; show same look in the mock world.
- Pet inventory, pet selection/equip, 2D companion stage and gacha animation/result with mock cost and probabilities. Duplicate policy should be explicit in demo.
- Reward claims grant owned items/points/Energy and cannot be claimed again after refresh.
- Admin: manage Battle Pass reward track, dates, missions, collectible catalog, gacha pools and theme visuals.

**Avatar direction (IMPORTANT):** **Use 2D first**, not 3D or skinning. The current repo already has full-character WebP images and pet WebP assets. Whole-character images can be swapped for appearance presets. Only implement individual clothing layers when suitably transparent/aligned artwork exists; do **not** pretend a single flattened portrait can be dressed in separate clothes. If no artwork exists, provide clearly labeled demo-only look presets / sample slot mock and plan a future layer asset pipeline. A subtle CSS idle bob, blink or short sprite loop is enough to convey life; optional side-to-side movement in social mode.

**Done when:** Switch season → browse pass → complete mock mission → unlock & claim reward → outfit/pet becomes owned → equip → same appearance visible across Home/Profile/World.

### Phase 4 — Competitive / Battle Mode

**Marketing goal:** Add optional challenge and Point-burn opportunities, without blocking core game play.

- Battle Mode entry page, game/mode selection, ticket or Points entry cost (mock), confirmation and opponent/match presentation.
- Run **simulated** battle/result, award Masque Points or items, and show match history.
- Validate entry cost locally, prevent duplicate reward claim, maintain separate match/competition state.
- Admin config: entry pricing, mock prize pools, active modes, rules and mock standings.

**Done when:** Buy/consume entry → start a battle demo → result → prize claim → balances and inventory visibly update; mark outcomes **SIMULATED**.

### Phase 5 — Social / 2D Metaverse Demo

**Marketing goal:** Let players express identity and showcase earned cosmetics, avatars and pets.

- Render a lightweight **2D social square** with local player, equipped avatar and pet. Move via touch joystick/arrows or tap-to-move; simple idle/walk animation.
- Render several **mock** player avatars (not live users), emotes, chat bubbles, profile inspection, simple ambient world theme and optional season decorations.
- Keep mobile WebView performance: no forced heavy 3D engine, physics or realtime infrastructure.
- Admin mock: change area/theme/announcements, enable/disable social preview and moderation illustration.

**Done when:** Walk with custom avatar/pet, interact with a mock character, emote/chat and return to Game Center; all users other than self clearly simulated.

### Phase 6 — Community / Private Room

**Marketing goal:** Extend engagement through identity, co-play and personal spaces.

- Create room, name and theme it, generate mock invite code, simulate join and guest list; choose game to play with a mock party.
- Simple room editor: choose background/furniture, place/move/remove items on a 2D grid, save/load in localStorage.
- Display equipped avatar/pet in the room. Optional privacy/permissions/VIP room perks (configurable mock settings).
- Room state persists across navigation and page reload. Invite joining is a **simulation**, not actual cross-device multiplayer.
- Admin mock: room limits, allowable decor/assets, privacy defaults and moderation rule examples.

**Done when:** Create room → decorate → save → leave → reopen with same arrangement → copy mock invite → show simulated guest joining → choose game.

## 4. Required screens / routes for the complete demo

1. **Home / Lobby** — progression, points, energy, featured season, 7 hosted games and primary navigation.
2. **Game Catalog & Game Detail** — discovery, categories, scores, game entry and Energy explanation.
3. **Game Player** — existing iframe URL, proper loading/fallback/back and an optional **Simulate Finish** action for demos where iframe cannot report score.
4. **Profile & Avatar Wardrobe** — level, appearance presets/2D layered clothing if assets permit, pet, collection and frame.
5. **Shop / Masque Wallet** — mock AIS→Masque exchange, Energy, cosmetics, transactions.
6. **VIP** — packages, privileges, current/expired status.
7. **Battle Pass / Season** — Free/Premium tracks, XP missions and reward claims.
8. **Ranking** — game-specific lifetime and season rankings, reset/season controls in Admin.
9. **Battle Mode** — ticket purchase, battle preview, simulated match and rewards.
10. **2D Social World** — walk/emote/meet mock users; show avatar/pet.
11. **Private Room & Room Editor** — build/decorate/save and mock invite/party.
12. **Marketing/Admin Demo** — configurable game catalog, products, Energy, missions, seasons, passes, prizes, themes and room policies.

Design should feel like **one polished game product**, not a stack of unrelated admin forms. Use mobile portrait 320–430px and preserve safe-area/back navigation. The Admin can use its own desktop-friendly layout, but remain integrated with the same mock state.

## 5. Existing game policy — DO NOT replace links

Reuse the registry from the existing source, retaining the URLs and display titles. The README currently lists these 7 hosts:

| Game | URL |
|---|---|
| สัตว์บินถลาลม | `https://masque-lab.adldigitalservice.com/myroom/bird/` |
| ตีไอต้าวตุ่นเด้ง | `https://masque-lab.adldigitalservice.com/myroom/mole-v3/` |
| สัตว์วิ่งตะลุยเมือง | `https://masque-lab.adldigitalservice.com/myroom/game/run/` |
| ฟันผลไม้เปรี้ยง | `https://masque-lab.adldigitalservice.com/myroom/fruitninja/` |
| สัตว์ชนพุ่งปังปัง | `https://masque-lab.adldigitalservice.com/myroom/game/timberdear/` |
| ล่าฝูงเป็ดป่วน | `https://masque-lab.adldigitalservice.com/myroom/shooting-duck/` |
| สัตว์จับคู่สู้สุดใจ | `https://masque-lab.adldigitalservice.com/mygame/memonrycard/` |

The demo must never claim its iframe scores are trusted. The current game binaries may not integrate with the new SDK. Use a clearly marked mock-completion fallback; avoid altering external games.

## 6. Architecture guidance (demo-only; avoid overengineering)

- Keep existing components/services; audit before refactoring. Prefer small Svelte 5 components, simple typed state and pure feature functions.
- One persistent store, e.g. versioned mock schema/migration using existing `masquegame_center_v2` or an intentional migration. Keep `?name=`, `?aispoint=`, `?resetMock=1` controls working.
- Types: `Player`, `Energy`, `WalletTransaction`, `Game`, `GameSession`, `GameScore`, `RankingSeason`, `BattlePassSeason`, `Mission`, `Reward`, `VipEntitlement`, `Item`, `OwnedItem`, `EquippedLook`, `Pet`, `Battle`, `Room`, `RoomFurniture`, `DemoAdminConfig`.
- Service/adapters: wallet/energy/EXP, catalog/game session, rankings, rewards/pass, inventory/avatar, battle, 2D world and room, Admin configs. These are **logical modules**, not necessarily separate deployable services.
- Use deterministic fixture users for rank/world displays. Mock administrative settings must affect related screens.
- Handle refresh, offline/iframe failure, insufficient funds, duplicate claims and empty inventory. Never introduce cash-like balances or real point liabilities into UI wording.
- No authentication/authorization security implied by local Admin route; it is only a demonstration.

## 7. Demo walkthrough / acceptance test

An operator can complete all steps without editing browser storage manually:

1. Open myAIS-style Game Center → see profile, seven games and global Energy.
2. Claim daily check-in → balance/reward changes.
3. Open a hosted minigame → Energy decreases once; finish via actual integration if supported, otherwise explicit demo simulation → EXP and score update.
4. Open ranking → see own score and season/lifetime tabs.
5. Exchange mock AIS Points → Masque Points; purchase Energy → balances reflect transactions.
6. Buy mock VIP → badge and benefit update.
7. Purchase/equip a 2D look, accessory/pet → see changes on Home and Profile.
8. Complete Battle Pass mission → progress → claim reward → new owned item appears.
9. In Admin, change a season/theme and reset its ranking → lifetime records remain; Battle Pass cycle can be managed independently.
10. Enter Battle Mode → pay ticket, show mock result, claim prize.
11. Walk in the 2D world and trigger emote/chat bubble next to mock users.
12. Create/decorate/save private room, leave and return, use mock invite and launch a selected game.
13. Click **Reset Demo** and confirm clean sample defaults return.

## 8. Visual design and delivery expectation

- Final UI should be consistent with an accessible, polished, fun mobile gaming hub: coherent typography, one design token palette, clear navigation/labels, useful loading/success/empty states and motion kept performant.
- Use existing images first. Never silently substitute missing cosmetics as if they are equipped. Simple 2D avatar/pet animation is sufficient for the demo.
- Add visible `DEMO`/`SIMULATED` treatment to fake AIS transactions, matchmaking, world peers and invitations.
- Keep the repo buildable: run `npm install`, `npm run check`, `npm run build`, address TypeScript errors, and summarize implemented vs deliberately mocked features.
- Include a tiny Admin/demo walkthrough and mention limitations in README when implementation lands.

## 9. Decisions vs open parameters

**Already agreed:** one shared Energy wallet across games; regen/purchased overflow; games persist indefinitely; Profile EXP only demonstrates progress; Ranking prizes are Masque Points (not AIS Points); ranking has permanent and seasonal views; seasons are Admin-controlled; Battle Pass has Free and Premium; eventual external developer uploads + SDK are desirable, but current team builds games internally; initial host is myAIS; other brands could adopt later.

**Demo assumptions, not approved production rules:** VIP prices/durations and benefits, exact battle entry cost, Premium Pass price, seasonal duration, gacha probabilities, animation/art layer pipeline, room guest limit and multiplayer operating rules. Make these mock-configurable rather than hardcoded into product behavior.

## 10. Instructions to AI implementer

1. Inspect the repo and report existing features vs missing features **before writing code**.
2. Do not delete working game catalog URLs, iframe functionality, state, or existing assets.
3. Implement all missing screens/features incrementally in the demo, prioritizing a fully navigable user journey and consistent shared state over production architecture.
4. Use clearly marked simulation for everything requiring unimplemented services.
5. Keep Svelte components and services simple; avoid introducing a 3D engine, real multiplayer backend, external SaaS or unnecessary libraries.
6. After each increment, run checks/build and note remaining missing acceptance criteria from Section 7.
7. When done, report changed files, demo instructions, and which actions are real UI/local mock vs placeholders.
