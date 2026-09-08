# Woodland Hills estates and construction

The town now imports the detailed town catalog, including thirteen mansion styles, two address-inspired homes, and a five-tower Warner Center landmark. Original placed items remain in their save. A one-time neighborhood expansion adds starter properties only to unoccupied positions and respects the existing item cap.

`property-builder.js` presents the next actual mesh assembly as a thumbnail and a glowing placement target. Dragging to the target, tapping the target, and the accessible Snap button all advance one step. Progress is stored as `constructionStep` on the existing item. Closing or reloading preserves progress. Rebuilding a finished property is an explicit action. Nothing charges the wallet.

`townBlueprint` partitions the actual building geometry into ordered lot, building, roof, window, trim, and garden assemblies. Finished construction matches the complete model. This is a guided assembly game, not a structural construction simulator.

Allentown follows the broad L-shaped massing visible in a public floor plan and aerial. Chatsboro follows the garage wing, brick entrance, cream walls, gables, and turret in a public exterior photograph. These are approximate game models, not measured replicas. Neighborhood street positions and Warner tower heights are fictionalized for playability. Research photography is not distributed as game assets.

The visual pass adds leafy tree meshes, estate materials, improved shadows, resort furniture, pool detailing, and adjusted lighting across the 3D games. It remains a stylized procedural renderer, not photographic reconstruction. Higgsfield account and model metadata were reachable, but no working 3D generation endpoint was exposed in this session. No Higgsfield asset is included.

Validation: `node tests/town-construction.mjs`, the existing world, driving, adventure, and wallet test scripts, syntax checks, and video verification. Browser QA covered desktop and phone drag placement, invalid drops, saved resume, a complete Chatsboro build, Blocks completion, river riding, driving, the aquarium, and underwater targeting.
