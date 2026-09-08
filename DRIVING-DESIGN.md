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

## Checks

`node tests/driving-rules.mjs` checks preset closure/tangents, elevation clearance, finite mesh data, every first edit at each preset point, input rejection, nonmutation, and 100 successive edits. Existing world tests remain separate. Browser testing covers GO/laps, pause, cameras, workshop edits and undo, reloading saved custom courses, and phone-sized layouts. Physical iPhone Safari and authentic sound matching are not verified by desktop viewport testing.
