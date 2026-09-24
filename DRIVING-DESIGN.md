# Chill Drive

A free, assisted driving world for early readers. Shipped independently from existing aquarium, park, and block saves.

## Play

- Steering follows a closed 3D course, with corner speed reduction, no collisions, and no losing state.
- Hold Drift on a touch screen, or hold Space on the focused game canvas. Release recenters the car. Keyboard activation on the Drift button also supports Space and Enter.
- Optional arrow keys and on-screen arrows move the car gently within a bounded lane.
- Gentle, Cruise, and Zoom speeds; chase, driver, and aerial cameras. Reduced-motion preference starts in aerial view and omits tire smoke.
- Pauses on tab hiding or focus loss; no catch-up laps after returning.
- Lap and drift celebrations are session-only, do not pay money, and do not alter Wallet.

## Track construction

Three permanent templates: Sunshine Loop, Seaside Sweep, and Corkscrew Canyon. One custom route saves locally under `cb:drive:v1`, together with color, selected course, and pace. Entering the workshop resumes that custom route once one exists. The templates always remain available.

The editor changes connected control points of a smooth closed road. Straight and bend buttons insert between the selected point and its next neighbor. Longer/closer move the selected point away from/toward the course center. Hill controls change elevation, with support piers under raised roads. This is a connected-loop editor, not arbitrary free placement or a licensed circuit reproduction. Undo retains the previous 30 edits during the workshop session.

Finite coordinates, bounds, point counts, spacing, slope, and sampled nonadjacent road overlap are checked before accepting or loading a route. Curve height is clamped to ground clearance. Geometry and materials created during track rebuilds are disposed. Existing world data is not read or changed.

## Original art and sound

The coupe uses original procedural meshes: broad angular body, long hood, twin blue stripes, dark glazing, six-spoke wheels, four circular rear lamps, and a wing. Five paint choices. Existing local CC0 lighting is reused with its attribution in assets/realism/ATTRIBUTION.md. No movie imagery, audio, or Nissan logo is embedded.

Motor sound is synthesized using oscillator harmonics, filtered noise, a turbo whistle, and simulated shifts. It evokes a turbo straight-six but is not an authentic engine recording. It honors the existing sound preference and starts only after user interaction.

Reference research, September 7, 2026:

- Nissan Heritage Collection, Skyline GT-R V-spec II (BNR34): https://www.nissan-global.com/EN/HERITAGE_COLLECTION/280_skyline_gt-r_v-spec_ii.html
- Nissan's account of Skyline round tail lamps and the RB26DETT: https://www.nissan-global.com/EN/STORIES/RELEASES/a-legacy-of-passion-and-performance/
- Official Laguna Seca track information, downhill Corkscrew inspiration: https://weathertechraceway.com/pages/track-information

## Race your friends

The orange RACE button (and Race your friends in the garage) opens a racer sheet: Leo and Dad in the Skyline, or one of six original go-kart drivers (Mango, Pickle, Blueberry, Bubblegum, Sunny, Nova). Every racer has Speed, Grip, and Boost bars that add up to 10. The differences are small on purpose, and every racer can win. The chosen racer also drives in free play. Kart drivers use the chase, driver, aerial, and look-at-my-car cameras; the interior dashcam stays with the Skyline.

A race is one, two, or three laps against five computer racers, which are always kart drivers. A traffic-light countdown says 3, 2, 1, GO. Losing focus during the countdown holds it at Tap GO. Pause freezes everyone. Computer racers steer around cars ahead, make room when the player comes up behind or alongside, and ease off instead of driving through anyone. Cars side by side are kept apart like a gentle bump, so nobody crashes and nobody overlaps.

On the road: two rows of gift boxes, two or three orange boost arrows, and lines of race coins, all placed on the straightest parts of the track and clear of the start. The same placement works on every preset and on custom tracks. Gift boxes give one helper at a time: Turbo, Triple turbo, Coin magnet, or Rainbow ride. Racers further back roll the bigger helpers more often. A box a computer racer takes returns in 0.6 seconds, so the player always finds one. Holding DRIFT for a second in a race also gives a mini turbo.

Race coins raise top speed by 0.3 percent each, up to 10 coins, during that race only. They are play points: they never reach Wallet, and the results screen says so. Speed adjusts difficulty. Gentle is the friendliest, Cruise is a fair race, and Zoom is a challenge. A light catch-up keeps the pack close; leaders slow by at most 5 percent. Balance was set by simulating whole races in Node. At Cruise, a player who only taps GO averages about 3rd to 5th, and one who drifts, grabs helpers, and hits the arrows averages about 1st. The results screen shows every finisher, cheers every place, and offers Race again, Change racer, or Just drive.

Code: `driving-race.js` holds the pure rules (racers, stats, layout, items, lanes, laps, finish order) with no rendering. `driving-race-mode.js` connects those rules to the scene and HUD. `driving-kart.js` holds the original kart, driver, boost flames, arrows, gift boxes, and coin meshes; its geometry and materials are shared and marked shared. `cb:drive:v1` now also saves `racer` and `raceLaps`. Older saves load unchanged.

## Checks

`node tests/driving-rules.mjs` checks preset closure/tangents, elevation clearance, finite mesh data, every first edit at each preset point, input rejection, nonmutation, and 100 successive edits. `node tests/driving-race.mjs` checks fair stat totals, finish-line math at any frame rate, item odds, standings, lane manners, layouts on every preset and 12 random custom tracks, whole races on several tracks and racers (everyone finishes, the pack stays close, the player and the karts never overlap for more than 1 percent of frames, and effort improves your place), countdown holds, pauses, and item use. Existing world tests remain separate. Browser testing covers GO/laps, pause, cameras, workshop edits and undo, reloading saved custom courses, and phone-sized layouts. Physical iPhone Safari and authentic sound matching are not verified by desktop viewport testing.
