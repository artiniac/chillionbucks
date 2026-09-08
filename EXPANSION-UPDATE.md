# Water and world expansion

## Water park

Buildable coordinates now extend to +/-42 instead of +/-20, 4.41 times the area, with up to 180 saved pieces. Existing river routes and objects remain in place. New parks start with a longer river. Existing parks receive east and west splash gardens, and a grotto or tunnel only where spacing allows. The shop offers both tunnel types for free. Tunnel geometry follows the current river curve and remains open for rides.

The river and lagoon now use planar reflections, a refracted procedural tile floor, depth-dependent absorption, animated caustics, and bounded floater ripples. The submerged floor is an analytic visual approximation, not a fluid simulation. Reflective targets are disposed when pieces or river geometry are rebuilt.

## Town

Buildable bounds grew from 42 by 32 to 112 by 88 scene units, about 7.33 times the area, with up to 180 objects. Roads connect the estate neighborhood to civic and shopping districts. A school, mall, library, and supermarket were added to the free catalog and construction book. Existing shops and restaurants remain available. One-time additions avoid occupied lots and preserve saved homes and building progress.

## Ambience

Three generated, quiet environmental clips rotate in a shuffled order without immediate repeats, with randomized gaps. Audio starts after a gesture, follows the shared mute setting, and pauses while hidden. Clip peaks are compressed and edges faded.

## Validation

Tests cover saved-map preservation, expanded river bounds, all 27 construction blueprints, tunnel geometry, water-plane alignment, bounded ripples, audio rotation and muting, and world rules. Browser checks cover low-angle water, lagoon placement, edited river rebuilding, a ride through the grotto, expanded town overview, mall visits, and audio playback/mute. No mobile performance benchmark was conducted.
