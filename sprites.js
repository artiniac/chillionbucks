/* Picture sprites for the Chillion Builder. Drop PNG files (transparent background) into assets/sprites/ and list them
   here; each one becomes a placeable thing on the shelf named by `kit`. See SPRITE_PACK.md for the prompts to make them.
   w = how wide the thing is as a fraction of the stage (0.2 = a car, 0.34 = a jet, 0.1 = a person).
   go = how it moves when the kid taps ▶ Go: drive | fly | float | walk | swim | spin (leave it out for things that sit still).
   Vehicles, aircraft, boats, people, characters, and animals get a default from their kit; a car drives, a jet flies. */
window.CHILLION_SPRITES = [
  // { id: 'gtr', kit: 'vehicles', name: 'Sky Racer (picture)', price: 6, w: .22, src: 'assets/sprites/gtr.png', go: 'drive' },
];
