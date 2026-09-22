# Town engine workshop

Open **Build an engine** in the town, or use `build.html?world=town&workshop=engine`. The workshop is a full-screen view within the town page and returns to the same town. It does not occupy a house lot or charge money.

The 41-step inline-six lesson covers the block, main bearings, crankshaft, caps, six piston/rod assemblies with rings and pins, rod bearings, oil pump, pickup, sump, rear seal, flywheel, gasket, head, 12 intake valves, 12 exhaust valves, springs, tappets, two cams, cam caps, timing, spark plugs, coils, cam covers, intake, port injection, exhaust manifolds, twin turbos, intercooler, filters, cooling system, alternator, starter, oil filter, dipstick, ECU, wiring, and accessory drive. Hardware is grouped into manageable assemblies. A separate transmission, battery, fuel tank/pump, air conditioning, and the complete vehicle exhaust are outside this engine lesson.

Children drag the automatically presented part to its projected outline. A hand demonstrates the movement twice on each new step. A failed drop does not advance the lesson. Keyboard users select the part and press Enter on the target. Assembly is saved before the placement animation; repeat input cannot advance during that animation. Read aloud is optional and uses the device's speech synthesis.

The live cutaway clips half of the block, head, and sump while removing obstructing covers and heat exchangers. Six slider-crank linkages move with paired piston motion and the illustrative 1-5-3-6-2-4 sequence. Camshafts and cam gears turn at half crankshaft speed. Valve lift, springs, and tappets follow simplified four-stroke timing. The label and stroke display refer to cylinder 1. The speed slider controls a slow demonstration, not an indicated engine RPM. Turbo rotation is illustrative, not a boost simulation.

This is a Skyline-inspired teaching model, not an exact RB26 reconstruction, dimensional drawing, repair procedure, or torque guide. Cylinder shapes, valve angles, ports, accessory routing, and grouped assembly order are simplified for visibility and play. Images are Higgsfield concept illustrations; see assets/engine/README.md. The playable model is original Three.js geometry, approximately 126,340 triangles and 373 meshes before visibility filtering, with static hardware batched by material. No model-generation call runs in the browser.

Progress is stored as `{v:1,step}` under `cb:engine-workshop:v1:<encoded town project ID>`. Towns remain independent. Wallet, houses, cars, and all earlier saves are untouched. Corrupt saves are surfaced instead of replaced. Write failures remain visible. Rebuilding a completed engine requires an explicit in-game choice and affects only that engine's progress.

The workshop lazily loads when opened, suspends town rendering while open, caps pixel ratio, stops its animation loop when closed, releases its geometry/materials/environment resources, and pauses rendering in hidden tabs. Phone layouts have a compact bottom parts tray, bounded in-game zoom, fixed screen, and no selection gestures. Reduced-motion settings remove the drag demonstration and shorten snap animation; the user may still explicitly run the engine.

Technical references used for the lesson:

- [Nissan Heritage, Skyline GT-R specification](https://www.nissan-global.com/EN/HERITAGE_COLLECTION/249_skyline_gt-r.html), inline-six DOHC RB26DETT layout.
- [Bosch, gasoline port fuel injection](https://www.bosch-mobility.com/en/solutions/powertrain/gasoline/gasoline-port-fuel-injection/), injection before the inlet valve, fuel rail, injectors, coils, sensors, and ECU roles.
- [Garrett, how a turbo works](https://www.garrettmotion.com/knowledge-center-category/oem/basic/), exhaust-driven turbine, common shaft, compressor, and charge-air cooling.

Validation: `node tests/engine-workshop.mjs` checks stage completeness, per-town persistence, corrupt/quota failures, piston/valve counts, timing ratios, four-stroke phase behavior, slider-crank geometry, cutaway visibility, and geometry budget. Browser verification covered every assembly step, actual desktop and phone drag-and-drop, keyboard alternative, reload/resume, completion, running/pausing, picture guides, and returning to town. Phone checks use a 390 by 844 viewport; physical iPhone hardware has not been tested.
