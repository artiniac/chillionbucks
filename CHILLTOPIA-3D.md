# Chilltopia 3D

## Routes and architecture

- `build.html`: primary game UI, aquarium and town.
- `chilltopia.js`: scene, camera, input, catalog, save data, jobs, and the piggy deposit UI.
- `chilltopia-models.js`: actual mesh factories and item catalog. The world and shop thumbnails share the same mesh definitions.
- `chilltopia.css`: responsive game layout.
- `vendor/three.module.js`: Three.js 0.170.0, served locally. MIT license in `vendor/THREE-LICENSE.txt`.
- `wallet.js`: existing shared wallet, refreshed before reads/mutations to prevent stale-tab balance/bill overwrites.
- `classic.html`: preserved previous builder, still using `builder.js`, its catalog, and its art. Classic saves are not migrated or erased.

No build or package installation is needed. Serve this directory over HTTP. ES modules require a server rather than opening the HTML with a file URL. GitHub Pages serves the modules directly.

## Play

Aquarium: orbit by dragging, zoom with wheel/pinch/buttons, select a catalog piece and tap the sand to place, select placed pieces to move, turn, scale, or raise/lower. Fish swim in three dimensions, seek shelter points, avoid solid decorations approximately, and gather for food. Free starter habitat and fish are included. The reef is a creative sandbox, not a real species-compatibility or care simulation.

Town: move with WASD, arrow keys, or the touch pad; toggle driving when a roadster is owned. Free cottages, trees, flowers, and benches can be placed. The delivery job also has an assisted drive button for younger players. Manual steering interrupts assisted travel.

The shop uses six fish types and habitat, hideout, water-feature, garden, building, and play catalogs. Paid items set a savings goal when unaffordable. Charges occur on placement, not selection. Returns refund the item's stored purchase price; starter pieces return nothing. Each world has a 65-item cap and the aquarium has an 18-fish cap.

## Work and savings

Reef cleanup requires collecting ten objects; delivery requires four separate stops. Jobs have a minimum completion duration and a shared 45-second cooldown stored on-device. Every fifth job earns a larger bill, and every twentieth earns the next denomination. Jobs call `Wallet.earnBill`, never add spendable savings directly. A bill must be dragged into the piggy; an explicit select-and-deposit alternative supports keyboard use. Starting or leaving a job does not pay. Feed actions and decorative movement do not pay.

## Data and privacy

`cb:chilltopia3d:v1` stores both worlds, current world, a catalog saving goal, completed job count, cooldown, and the last feeding time. No names, photos, or remote data are collected by the 3D game. Existing `cb:wallet`, `cb:world`, and `cb:worlds` are retained. Browser data is local, not a cross-device account. No backend, tracking, or paid service is introduced. Google Fonts remains the existing type of external font dependency.

## Validation and release

Check all application JavaScript with `node --check`, run `node verify-videos.mjs`, and test the new game on desktop and phone layouts. Check placement, transforms, saving/reload, exact-once paycheck deposits, affordable/unaffordable purchases, returns, feeding, camera controls, both jobs, and Classic navigation. Do not seed a production user's savings or reset their saves for testing.

The pre-3D build is recoverable from Git history and remains playable at `classic.html`. Deploy through the existing GitHub Pages workflow on `main`. No hosting migration is required.

## Current scope

This is the first playable 3D release. It does not yet simulate a business, investment returns, multiplayer, realistic fish husbandry, or an unrestricted construction-physics system. Classic retains the broader 2D construction catalog and room-photo features. Fish avoidance is a lightweight steering behavior, not a full physics engine.

## Release checks, September 7, 2026

Verified in the local browser at desktop size and a 390 by 844 phone viewport: free placement; turn, scale, and elevation edits; persistence after reload; ten-object cleanup; the four-stop assisted delivery route; paycheck creation; both drag and keyboard-alternative deposit; fish purchase; exact purchase-price refund; feeding; camera follow; and navigation between aquarium and town. Browser error/warning logs were empty for the checked new-game flows. A separate Node wallet test covered two-tab synchronization, exact-once bill deposits, spending, refunds, and invalid numeric mutations. All application JavaScript passed syntax checks. All 28 existing video links passed the project verifier.
