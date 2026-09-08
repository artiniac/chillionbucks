# Grotto Springs and house detail update

Grotto Springs is integrated into the existing water-park scene at its north end. An open gateway and continuous path connect it to the original park. It uses the same renderer, camera, audio, and animation loop. The old grotto.html URL redirects to waterpark.html?visit=grotto. Existing routes, placed pieces, and save data are preserved. It contains a recessed pool, submerged steps, open rock vault, slide ride, float camera, and quiet randomized park ambience. The water samples a clipped underwater scene render with depth-based absorption, animated normals, and environment specular lighting. Above-water objects are excluded from that refraction render. Reflections currently use environment lighting, not a complete dynamic planar reflection of the park.

Chatsboro and Allentown receive reference-based facade corrections, roof orientation fixes, separate window jambs, trim, downpipes, entry details, and landscaping. Shared masonry and roofing use CC0 Poly Haven surfaces. Listing photos were inspected as references and are not shipped as textures. Google imagery was not extracted or incorporated.

These are more detailed game interpretations, not measured replicas or photorealistic reconstructions. Unseen elevations and interiors remain unverified. The driving game is not changed in this update.

Published property assembly IDs and order are preserved in town-blueprint-layout.js so existing numeric construction steps remain compatible. Added details join existing assemblies.

Validation: all 27 construction models assemble to their complete geometry with unchanged published assembly order; existing park expansion, audio, water alignment, and world rule tests pass. Local browser checks covered both home visits, integrated grotto overhead and water-level views, float and slide controls, and rendering errors. Geometry tests verify the excavation, continuous approach path, walkable deck, and pool boundaries. Refraction rendering restores the main renderer state and hides other water surfaces during its underwater pass. Browser views were inspected at available desktop app panel sizes. Actual phone GPU performance is not yet benchmarked.

Further exterior work adds recessed entrance geometry to both named homes, a brick entrance gable at Chatsboro, irregular clipped hedge geometry, and a tighter shadow volume during close town views. The aquarium resets its light target and bias when switching worlds. The park perimeter now encloses the grotto extension.
