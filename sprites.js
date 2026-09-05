/* Picture sprites for the Chillion Builder. Drop PNG or WebP files (transparent background) into assets/sprites/ and list
   them here. A sprite whose id matches a drawn thing REPLACES that drawing everywhere (shelf, saved worlds, build orders);
   a new id becomes a new thing on the shelf named by `kit`. See SPRITE_PACK.md for the prompts that make them.
   w  = how wide the thing is as a fraction of the stage (0.22 = a car, 0.46 = a big rig, 0.1 = a person).
   ar = the picture's height divided by its width, so it lays out at the right shape before the file has loaded.
   go = how it moves when the kid taps Go: drive | fly | float | walk | swim | spin (leave it out for things that sit still).
   Pictures face RIGHT; the game flips them when they turn around. */
window.CHILLION_SPRITES = [
  /* Vehicles, rendered pictures (2026-09-05). Same ids as the drawn versions they replace. Homages with our own names, no badges. */
  { id: 'skyRacer', kit: 'vehicles', name: 'Sky Racer coupe', price: 6, w: .22, ar: .346, src: 'assets/sprites/skyRacer.webp', go: 'drive' },
  { id: 'redRocket', kit: 'vehicles', name: 'Rocket coupe', price: 6, w: .22, ar: .314, src: 'assets/sprites/redRocket.webp', go: 'drive' },
  { id: 'boxyClassic', kit: 'vehicles', name: 'Boxy classic', price: 5, w: .21, ar: .37, src: 'assets/sprites/boxyClassic.webp', go: 'drive' },
  { id: 'monsterTruck', kit: 'vehicles', name: 'Monster truck', price: 7, w: .28, ar: .53, src: 'assets/sprites/monsterTruck.webp', go: 'drive' },
  { id: 'semiTruck', kit: 'vehicles', name: 'Big rig', price: 7, w: .46, ar: .367, src: 'assets/sprites/semiTruck.webp', go: 'drive' },
];

/* Picture backdrops (world backgrounds). Landscape 3:2, bottom 40% an empty level ground, straight side view, saved in
   assets/backdrops/. A backdrop with a drawn scene's id (bedroom, living, backyard, beach, ocean, forest, town, citylot,
   parkland, space) REPLACES that scene; a new id becomes a new place. See SPRITE_PACK.md for the world list and prompt. */
window.CHILLION_BACKDROPS = [
  // { id: 'beach', name: 'Beach', e: '🏖️', src: 'assets/backdrops/beach.webp' },
];
