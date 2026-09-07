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

## Aquarium and connected water park expansion

The aquarium floor is 1.65 times wider and 1.55 times deeper, about 2.56 times its previous area. Old placements and payments remain valid. Eight procedural bottom-walking animals join the catalog: reef lobster, blue/red/white/orange crayfish, hermit crab, fiddler crab, and red reef crab. Animal capacity is 28.

`waterpark.html`, `waterpark.js`, `waterpark.css`, and `park-geometry.js` provide a third world. A closed centripetal Catmull-Rom river drives the banks, animated water, arc-distance floaters, slide outlets, and bridges. Edit 4 to 18 control points, add/remove bends, and save or cancel a preview. Validation rejects crossings, tight bends, crowded channel segments, and out-of-park points. Slides and bridges store normalized river positions and regenerate against the edited route. Straight, wavy, and spiral-style slides have trough meshes, platforms, supports, ladders, and riders that transfer into the river. Bridges have railings, bank ramps, and clearance over the water. This is a simplified geometric simulation, not computational fluid dynamics.

Trees, flowers, and benches can be placed and moved on land. Construction is free. Camera orbit, pinch zoom, large touch buttons, numbered bend selectors, direction buttons, and explicit placement inputs support desktop and mobile use. Park save key: `cb:waterpark:v1`; preserves aquarium and Classic saves. No new backend or external dependency.

`wallet.js` now owns the shared work ledger and serialized claim method. See `ECONOMY-DESIGN.md` for the research, exact payouts, migration behavior, and limitations. Classic undo adjusts only the value of restored pieces instead of resetting the entire wallet to a historical balance.

Expansion validation: syntax checks passed for all game scripts; route tests covered closure, invalid crossings, longer loops, and all three slide outlets before/after edits; wallet tests covered fresh instances, duplicate claims, deposits, and the shared 45-buck ceiling. Browser checks covered desktop and 390-by-844 layouts, crayfish purchase, three feeding portions, litter cleanup, six park filters, bill deposits, saved route reload, bend insertion, connection spacing rejection, bridge/slide placement, riding, home-page practice coins, and a Classic world finish. The homepage regression found during testing was fixed and retested. All 28 video links passed. Actual physical iPhone Safari performance remains unverified.

Water-park catalog follow-up: real 3D preview cards animate slide riders and rotate decorations; offscreen cards skip rendering, and reduced-motion/pause keeps static previews. Placement previews do not save or add an object until confirmed. The aquarium and park now have visible sound buttons, with saved mute preference, gesture-unlocked synthesized effects, and gentle water ambience. Earn Bucks uses bright green and a briefcase icon. Browser checks confirmed preview cancellation leaves collection count unchanged, confirmation adds exactly one piece, mute updates the button, and the work button fits the phone layout.

## Resort, aquarium shop, and Snap Blocks studio update

Current rules supersede the first-release descriptions above: aquarium capacity is 28 animals, work uses Wallet.completeWork, and the shared daily earning cap is 45 pretend bucks. See ECONOMY-DESIGN.md for the complete economy. Feeding can earn 5, cleanup 10, and delivery 10 per allowed completion; earned bills still require deposit.

The expanded water park has six river-connected slide designs, animated tipping bucket, splash arches, rain mushroom, lagoon, food stands, picnic spots, palms, walking visitors, ride camera, and walking controls. Bridges support walking across the river. A food-service shift and park cleanup share the same park allowance. Construction remains free. Version-one park layouts are backed up before the expansion migration.

The aquarium catalog is now a wall of animated display tanks. Inspecting an item opens a larger tank and an explicit Bring home button. Purchasing still occurs only on world placement. Six fish use distinct original mesh anatomy and species markings; research is in WORLD-RESEARCH.md. This remains stylized rendered artwork, not photography.

Snap Blocks has its own route, blocks.html. The pure grid rules live in blocks-engine.js, merged mesh factories in blocks-models.js, and the UI in blocks.js. The new cb:blocks3d:v1 key holds up to eight creations of 180 pieces each. Existing Classic creations remain untouched. Exposed studs, overlapping cells, rotation, hollow frames, gravity settling, undo/redo, and guided projects are supported. This is a creative snapping system, not a structural engineering simulation. All pieces are free.

Run node tests/world-rules.mjs for grid, guided-build, and six-slide endpoint checks. Browser verification covers guided completion and reload, desktop and 390-pixel phone layouts, display-tank inspection, and capped food-stand payouts. Actual iPhone Safari performance remains a device check, not something a desktop viewport establishes.
