# Play update, September 8, 2026

This release improves the existing static games without changing wallet data, saved-world formats, prices, paid work limits, or hosting.

- Six illustrated home-page cards lead directly to the aquarium, water park, driving, blocks, town, and catching game. Each 3D game has an All games link. Explicit aquarium and town URLs override the last-opened world.
- Chill Drive has five visible star gates, a lap progress bar, and checkpoint markers on its map. Stars are play feedback only and never create money. Checkpoints use traveled distance, with exact-boundary and finish-line tests. Track bounds and map samples are cached. The play area sizes against the actual header height on phones.
- Snap Blocks has nearby piece and guided-build shortcuts, one-stud preview arrows, and arrow-key/Enter placement when the mat is focused. Choosing a shelf piece returns to the mat. Reloading or undoing a guided creation restores the correct next-piece preview.
- Aquarium close-ups cycle through the animals instead of repeatedly following the first fish. Offscreen aquarium rendering is skipped while browsing the shop.
- Seafood Scoop has a physical basket that fills with the species caught, a pause/resume control, and quieter decoration for reduced-motion users. Replaying clears the basket and resumes the game. The existing paycheck flow is preserved.
- The water park has an immediate slide-ride button in the scene. Walking shortcuts in town and the park no longer intercept typing in editable controls.

## Verification

All application JavaScript passed Node syntax checks. World rules, driving geometry and drift rules, the new checkpoint tests, and seafood wallet tests passed. All 28 existing YouTube links passed the project verifier.

Browser checks covered desktop and a 390 by 844 viewport: illustrated navigation; real driving checkpoint collection; responsive controls; guided bridge completion, undo, and reload; one-stud nudging; a complete five-catch paycheck flow; pause; aquarium cycling; direct town entry; and the water-park ride shortcut. No application errors were reported in the checked flows. A phone-sized desktop browser is not a physical iPhone Safari performance test.

A separate checkout was used. Uncommitted edits in the September 7 local workspace were not modified or included.
