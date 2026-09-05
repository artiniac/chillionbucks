# Picture pack for the Chillion Builder

The Builder draws everything itself as vector art (SVG). An image generator such as ChatGPT makes **raster** pictures (PNG files), which is a different thing: a PNG is a grid of pixels, an SVG is a list of shapes. The Builder can use both. Hand-drawn SVG stays for the things that snap, recolor, and animate (blocks, tiles, walls, river channels, spinning rides). Pictures work best for "hero" things a kid just places: cars, planes, boats, big rides, animals.

## How to ask (paste this once at the top of the chat)

> I am making picture stickers for a kids' building game. For each item I describe, make one image: a PNG with a fully transparent background, the object alone, centered, filling most of the frame, side view facing right unless I say otherwise, no ground, no shadow on the ground, no text, no logos, no badges, no watermark. Style: clean, colorful, kid-friendly, realistic proportions with soft shading and a thin dark outline, like a modern animated movie. Size 1024 by 512 for vehicles and 1024 by 1024 for everything else. Do not add any brand names or emblems. Each item is my own original design described by shape and color only.

Then paste one item prompt at a time. Every prompt below describes shapes and colors only, never a brand, so there is nothing for it to object to. If it still adds a logo, reply "remove all badges and emblems, keep everything else."

## Vehicles (1024 by 512, side view facing right)

1. **Sky Racer coupe**: a 1990s Japanese two-door sports coupe, boxy muscular body, wide fenders, big rear wing on two posts, four round red taillights in a row, low front bumper with a wide grille, five-spoke wheels, deep metallic blue paint.
2. **Rocket coupe**: a low mid-engine Italian-style supercar from the 2000s, wedge nose, big oval side air intakes behind the doors, small round taillights, glass engine cover, bright red paint, silver wheels.
3. **Boxy classic**: a 1980s German-style compact sport coupe, sharp boxy lines, small trunk lip spoiler, four round headlights, thin chrome trim, alpine white paint, cross-spoke wheels.
4. **Monster truck**: a huge lifted truck on giant knobby tires taller than the cab, exposed suspension, flame paint on a green body, a name plate on the side that is blank, exhaust pipes behind the cab.
5. **Pickup truck**: a modern full-size pickup, red, chrome front bumper, open bed.
6. **Big rig**: a long-nose semi truck with a chrome grille and a plain white trailer.
7. **Box truck**: a delivery truck with a plain white cargo box and a yellow cab.
8. **Forklift**: a yellow warehouse forklift with the forks lowered and a wooden pallet on them.
9. **Big tractor**: a green farm tractor with huge rear wheels and a glass cab.
10. **Yacht**: a white luxury motor yacht with a navy hull, two decks, tinted windows.
11. **Passenger jet**: a white twin-engine airliner with a blue belly stripe and blue tail, in flight, seen from the left side.
12. **Fighter jet**: a dark grey twin-tail fighter jet in flight, afterburner glow, side view.
13. **Stealth jet**: a futuristic angular stealth jet, blue-black, glowing cyan edges, side view.
14. **Rescue helicopter**: a green military-style transport helicopter with a rear tail rotor, side doors open, side view.

## Water park (1024 by 1024)

15. **Wave pool**: a big rectangular pool with rolling blue waves and a wide light-grey deck, three-quarter view from slightly above.
16. **Tube slide**: a tall yellow tower with a green enclosed spiral water slide ending in a small splash pool.
17. **Waterfall cave**: a grey rock grotto with a waterfall curtain falling in front of a dark cave mouth, green plants, splash pool at the bottom.
18. **Swim-up snack hut**: a thatched-roof tiki bar with stools half in the water, tropical drinks on the counter.
19. **Lazy river raft**: an orange four-person inflatable raft floating on blue water, seen from slightly above.

## Characters (1024 by 1024, front three-quarter view)

Keep these as shape-and-color descriptions, and give each a new name.

20. **Dash**: a cartoon blue hedgehog hero, tan belly, big green eyes, red sneakers with a white stripe, white gloves, spiky quills swept back, confident grin.
21. **Big Green Ogre**: a tall friendly green ogre with trumpet-shaped ears, brown vest over a cream shirt, big smile.
22. **Zappy**: a small yellow mouse-like creature with red cheeks, black ear tips, and a lightning-bolt shaped tail.
23. **Spongy**: a yellow square sea sponge character with big blue eyes, buck teeth, brown square pants, red tie.
24. **Frost Dragon**: a white dragon with silver-blue wings, blue eyes, long neck, standing on four legs.
25. **Blue Pup**: a blue cartoon puppy standing upright like a person, tan muzzle and belly, floppy ears.

## Animals (1024 by 1024, side view facing right)

26. German shepherd standing. 27. Siberian husky standing. 28. Rottweiler standing. 29. Pomeranian standing. 30. Golden retriever standing. 31. Orange tabby cat sitting. 32. Male lion standing.

## Putting them in the game

1. Save each PNG into `assets/sprites/` in this repo (small names, no spaces: `skyracer.png`, `monster.png`, `wavepool.png`).
2. Open `sprites.js` and add one line per picture:

```js
{ id: 'skyracer', kit: 'vehicles', name: 'Sky Racer (picture)', price: 6, w: .22, src: 'assets/sprites/skyracer.png' },
```

`kit` is the shelf (blocks, tiles, pieces, waterpark, themepark, zoo, city, castle, space, beach, nature, home, vehicles, people, characters). `w` is how wide it is on the stage as a fraction: a car is about .2, a jet .34, a person .1. `price` is whole bucks, 0 for free.
3. Commit and push. The picture shows up on that shelf, drags, resizes, flips, saves in the world picture, and counts toward jobs like everything else.

Keep each PNG under about 400 KB (ask for "optimized PNG" or run it through any image squeezer). The site stays free; GitHub Pages serves the files.
