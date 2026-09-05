# Picture pack for Chilltopia (realistic look)

Chilltopia draws its default pieces as vector art (SVG): flat, cartoon, and animated, because that is what can be drawn by hand in code. A realistic look has to come from rendered pictures. An image generator (ChatGPT, Midjourney, Ideogram) makes those as **PNG or WebP** files (pixels, transparent background), and the game places them, drags them, resizes them, saves them in the world picture, and moves them whole (cars drive, jets fly, boats and tube riders float along a painted river, people walk) with the ▶ Go tool. Parts inside a picture do not move (a Ferris wheel picture will not spin), so for rides ask for the still version and let the game move riders and floats instead.

## Delivered so far (2026-09-05)

Five vehicles are in the game as pictures and REPLACED their drawn versions: Sky Racer coupe, Rocket coupe, Boxy classic, Monster truck, Big rig. They set the camera for everything that follows: **straight side view, camera at the height of the middle of the object, soft daylight from the upper left, soft contact shadow under the wheels only, transparent background.** Every new piece must match that, or it will not sit in the same scene.

## World backdrops (the backgrounds behind everything)

The drawn backgrounds are the weakest part of the look now that the vehicles are pictures. Backdrops are pictures too, saved in `assets/backdrops/` and listed in `sprites.js` under `CHILLION_BACKDROPS`. A backdrop with a drawn scene's id replaces that scene; a new id becomes a new place in the Pick a place sheet.

The stage is 3:2 on a computer and a square on a phone (the phone shows the middle of the picture, anchored to the bottom). Things stand anywhere on the stage, so the bottom of every backdrop must be an empty, level ground.

Paste this to the image tool once, then ask for the places one at a time:

> I am making backgrounds for a kids' building game with a realistic, rendered look. Each background is an EMPTY place where the child will put things later. For each place I name, make ONE image: landscape, 1536 by 1024 pixels (3 by 2). Camera: straight side view at eye level, the same camera as a side-profile picture of a car; no bird's-eye view, no tilt. Composition: the horizon about 55 percent down from the top; the bottom 40 percent is a flat, open, level ground the child can stand things on (grass, sand, concrete, tile, floor), and that whole bottom band stays empty; scenery (buildings, trees, hills, walls, windows, furniture) stays in the back; keep the middle third of the picture the simplest, because phones show only the middle square. Soft daylight from the upper left, soft shadows, realistic materials, sharp focus, calm colors that do not fight with objects placed on top. No people, no animals, no vehicles, no text, no signs with words, no logos, no watermark, no frame. Every place is my own generic design.

Then, one message per place. The first ten REPLACE the drawn scenes (keep these ids as the file names):

| id | Ask for |
|---|---|
| `bedroom` | A kid's bedroom wall with a window, a bed against the back wall, a shelf, wood floor in front |
| `living` | A living room: back wall with a couch, a rug edge, a big window, wood floor in front |
| `backyard` | A backyard: lawn in front, a wooden fence and a house wall behind, a tree at one side, blue sky |
| `beach` | A beach: sand in front, calm sea and a horizon behind, a few clouds |
| `ocean` | Under the sea: sandy sea floor in front, blue water behind, light rays from above, a few rocks at the back |
| `forest` | A forest clearing: mossy ground in front, tall pine trunks and soft light behind |
| `town` | A quiet town street: a wide sidewalk and road in front, small shops and trees behind |
| `citylot` | An empty city lot: flat concrete in front, tall glass buildings behind, daytime |
| `parkland` | Open park land: mown grass in front, a path, low hills and trees far behind |
| `space` | A space station deck: a flat metal floor in front, a huge window showing stars and a planet behind |

New places (new ids, new buttons):

| id | Ask for |
|---|---|
| `waterpark` | Water park grounds: pale concrete deck in front, a shallow pool edge and palm trees behind |
| `themepark` | A theme park midway: a wide brick path in front, colorful ride silhouettes far behind |
| `zoo` | Zoo grounds: dirt and grass in front, a low stone wall and tropical trees behind |
| `castle` | Castle grounds: cobblestones in front, a stone castle wall with a gate behind |
| `jungle` | A jungle floor: dirt path in front, dense green plants and vines behind |
| `school` | A schoolyard: blacktop in front, a brick school building with big windows behind |
| `racetrack` | A race track: asphalt with a white line in front, grandstands far behind |
| `farm` | A farm: dirt and grass in front, a red barn and fields behind |
| `snow` | A snowy mountain: packed snow in front, pine trees and white peaks behind |
| `harbor` | A harbor: a wooden dock in front, calm water and a far shore behind |

Send me the finished pictures in the chat with the id of each. I crop, shrink (1536 wide, WebP, under about 350 KB), add them to `assets/backdrops/`, and list them in `sprites.js`.

## Do a 5-picture pilot first

Make these five with the style block below, drop them in, and judge the look before making a hundred: wave pool, tube slide tower, lazy river segment (straight), row of two lounge chairs with an umbrella, palm tree. If they sit together well, keep going down the list.

## The style block (paste this once at the top of the chat, then keep the same chat so the style stays consistent)

> I am making pieces for a kids' park-building game with a realistic, rendered look, like a modern theme-park simulation game. For each item I describe, make ONE image: PNG with a fully transparent background, the object alone, centered, filling most of the frame. Camera: straight side view with the camera at the height of the middle of the object (the same camera as a side-profile car picture), the same soft daylight from the upper left for every image, so all pieces sit together in one scene. Realistic materials (real water, real concrete, real plastic, real chrome), photographic lighting, soft contact shadow directly under the object only, no ground plane, no background, no people unless I say so, no text, no logos, no badges, no watermark. Square 1024 by 1024 unless I say otherwise. Every item is my own original design described by shape and color only.

If it adds a background, reply: "remove the background completely, keep the object exactly as it is." If it adds a badge or writing, reply: "remove all badges, emblems, and text, keep everything else."

## Water park (make these first)

1. **Wave pool**: a large rectangular pool with rolling blue waves, light-grey concrete deck around it, lane of white foam at the wave edge.
2. **Tube slide tower**: a tall steel tower with stairs and a bright green enclosed tube slide spiraling down into a small splash pool.
3. **Lazy river, straight segment**: a straight channel of slow blue water between low concrete edges, seen from the same three-quarter angle, ends cut flat so segments line up.
4. **Lazy river, curve**: the same channel making a quarter turn, ends cut flat.
5. **Lounge chairs with umbrella**: two white lounge chairs with blue cushions under a striped beach umbrella.
6. **Snack bar**: a small poolside snack stand with a striped awning and a counter.
7. **Waterfall grotto**: a grey rock cave with a waterfall curtain and a splash pool, tropical plants.
8. **Swim-up bar**: a thatched tiki bar with stools half in the water.
9. **Kids' splash pad**: a flat colorful pad with several water jets spraying up.
10. **Drop slide**: a very tall slide tower with a near-vertical red slide.
11. **Kid on an inner tube**: a child in a swimsuit sitting in a yellow inner tube on water (this one moves along rivers in the game).
12. **Four-person raft**: an orange round raft with four seats, empty, on water.
13. **Palm tree**: a single tall palm tree in a small concrete planter.
14. **Lifeguard chair**: a tall white lifeguard chair with a red umbrella and a rescue tube.

## Vehicles (1024 by 512, side view facing right, same lighting; these drive or fly in the game)

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

## Characters (1024 by 1024, front three-quarter view; these walk in the game)

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

1. Save each PNG or WebP into `assets/sprites/` in this repo (small names, no spaces: `wavepool.webp`, `tubeslide.webp`). To replace a drawn thing, use its id as the file name and the sprite id (the vehicle ids are `skyRacer`, `redRocket`, `boxyClassic`, `monsterTruck`, `semiTruck`).
2. Open `sprites.js` and add one line per picture:

```js
{ id: 'wavePool', kit: 'waterpark', name: 'Wave pool', price: 9, w: .4, ar: .45, src: 'assets/sprites/wavePool.webp' },
```

`kit` is the shelf (blocks, tiles, pieces, waterpark, themepark, zoo, city, castle, space, beach, nature, home, vehicles, people, characters). `w` is how wide it is on the stage as a fraction: a car is about .2, a jet .34, a person .1, a wave pool .45. `price` is whole bucks, 0 for free. `go` is how it moves: drive, fly, float, walk, swim, or spin; leave it out for things that sit still.
3. Commit and push. The picture shows up on that shelf, drags, resizes, flips, saves in the world picture, and counts toward jobs like everything else.

Keep each file under about 200 KB: crop to the object, shrink to 1200 pixels wide, and save as WebP with transparency (the five vehicles are 90 to 190 KB each). `ar` is the picture's height divided by its width. The site stays free; GitHub Pages serves the files.
