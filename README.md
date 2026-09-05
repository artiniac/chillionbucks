# Chillion Bucks 😎💚

**chillionbucks.com** is Leo's money site for kids. A *chillion bucks* is when you can chill all day and still have a lot of money (Leo, age 4¾, invented the word; Dad wrote the definition).

The site teaches money basics through four little games, hand-picked YouTube videos, and flip-card "chill words." Green theme, big buttons, lots of motion.

## What's here

| File | What it does |
|---|---|
| `index.html` | The main page: hero, dictionary, four games, videos, chill words, parents. |
| `build.html` + `builder.js` + `builder.css` | **Chillion Builder**: pick a scene or a photo of your room, then BUILD. Snap Blocks (studded blocks in ten colors that click onto a grid), building parts (walls, roofs, floors, water tiles, fences, roads, coaster track, castle walls, lazy-river channels), 300+ things across 13 kits (water park, theme park, zoo, city and school, castle, space, beach, nature, home, vehicles, people), a Make-a-Pal character maker, drawing on top, and the Job Board that PAYS kids for finishing builds. |
| `builder-art.js` | Every scene (including two RollerCoaster-Tycoon style bird's-eye lots), sticker, building piece, Snap Block, Magnet Tile, character, vehicle, and the pal renderer, as SVG factory functions. |
| `builder-catalog.js` | The kits, every placeable thing with its price, and the build orders. Merges picture sprites from `sprites.js`. |
| `jobs.js` | The six WORK mini-games (Pool Cleaner, Car Wash, Paint the Fence, Delivery Driver, Feed the Animals, Lemonade Stand). |
| `goals.js` | The real things a kid saves for in Piggy Bank Power: name, price, picture, store link. **Edit this to put in the exact items you would buy.** |
| `sprites.js` + `SPRITE_PACK.md` | Drop-in picture stickers (PNG) and the brand-free prompts to generate them with an image tool. |
| `styles.css` | Green theme, comic-book borders, animations. |
| `app.js` | Games (drag-the-coin piggy, 100-card Need or Want, Coin Counter, Chill-o-Meter), coin rain, confetti, video player, flip cards. |
| `sfx.js` | Synthesized sound effects shared by both pages (no audio files). |
| `wallet.js` | The Chillion wallet: bucks saved in the piggy, spent in the Builder, plus a little daily "baby money" (interest). Stored only in the browser. |
| `videos.js` | The video list. **Edit this to add or swap videos.** |
| `verify-videos.mjs` | `node verify-videos.mjs` checks every video is still live on YouTube. |
| `assets/favicon.svg` | The tab icon. |
| `CNAME` | Tells GitHub Pages the custom domain. |

No build step. No framework. No dependencies. Open `index.html` in a browser and it runs.

## How the money works (the three-step loop: work, save, spend)

1. **Work.** In the Builder, 💼 Jobs has a WORK tab with six quick mini-games: tap every leaf out of the pool, rub the mud off a car, swipe-paint a fence, drag packages to the matching house, drag the right food to each animal, count the lemons for each lemonade customer. Each takes a kid 20 to 60 seconds and pays a bill: a $5 bill for most jobs, a $20 bill every fifth job, a $100 bill every twentieth, a fat stack ($5,000) on the 100th job and a pot of gold ($10,000) on the 250th. A finished job rests 45 seconds before it can be done again. Build orders (the second tab) pay a $5 or $20 bill once per world when the order is complete, and 🏆 Finish pays a $50 bill once per world.
2. **Save.** A bill is not spendable until it is dragged into the piggy. The Builder opens the deposit sheet right after a job (and the 💵 button in the header opens it any time); the piggy game on the home page shows the same paychecks under the coins. Dragging a $1 coin is always free and unlimited. That is the point Artin asked for: you do not click one button and get what you want.
3. **Spend.** Snap Blocks, Magnet Tiles, and build parts are free, so a kid can always build. Pools, rides, characters, vehicles, and the rest cost bucks. Selling gives the full price back. The savings goals in the piggy game (from `goals.js`) are real things with real prices; when the wallet reaches one, the card gets a check and a "grown-up: open the store" button appears.

Once a day, savings of $5 or more earn a little "baby money" (5%, capped at $5). Everything lives in this browser's localStorage (`cb:wallet`, `cb:world`, `cb:worlds`, `cb:work`, `cb:goalPicked`); nothing is sent anywhere.

## Cost

$0. Hosting is GitHub Pages (free for public repos). Videos are embedded from YouTube with the privacy-enhanced player, so YouTube pays for the bandwidth. Fonts are Google Fonts (free). Nothing else loads from anywhere. A room photo used in the Builder is resized in the browser and kept in localStorage on that device only; there is no server to upload it to.

## Editing videos

Open `videos.js`. Each line is one video:

```js
{ topic: "Saving", id: "jKfcp_NV1x4", title: "What is Saving?", by: "Smile and Learn" },
```

The `id` is the 11 characters after `watch?v=` in a YouTube URL. Topics become the tabs, in the order they first appear. After editing, run:

```
node verify-videos.mjs
```

It prints `ok` for each live video and `BAD` for any that were removed or made private.

## Deploying to chillionbucks.com (GitHub Pages)

1. Push this folder to its own GitHub repo (`artiniac/chillionbucks`).
2. `.github/workflows/pages.yml` runs on the first push, enables GitHub Pages, and deploys the site (about a minute; watch the repo's **Actions** tab). It is live at `https://artiniac.github.io/chillionbucks/` right away.
3. Once, by hand: **Settings → Pages → Custom domain**, type `chillionbucks.com`, Save. When the certificate appears (5 to 30 minutes), tick **Enforce HTTPS** on the same page. GitHub does not allow a workflow to set either of these.
4. At the registrar where you bought chillionbucks.com, add these DNS records (remove any existing A or parking record on `@` first):

   | Type | Host | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `artiniac.github.io` |

Every push to `main` redeploys in about a minute.

## Snap Blocks, Magnet Tiles, and the grid

The stage is a 24-cell grid. A Snap Block, a Magnet Tile, or a building part snaps its edges to that grid when it lands, so blocks stack and coaster, slide, or river pieces line up end to end. Blocks are drawn with a front face, a top face, and a side face (a 3D look) with studs standing on the top; the front face is what sits on the grid. Magnet Tiles are translucent squares, triangles, and rectangles with little magnets along each edge, and they mix right into block buildings. Turn rotates 90 degrees, Copy adds another of the same thing next to it, and 🎨 Color cycles the ten colors. Everything has its own look and its own name; nothing is borrowed from any toy brand.

The 🌊 river brush in Draw mode paints a lazy river with a finger (concrete edge, water, a moving current); the water park shelf also has river channel pieces, five slides, a wave pool, a waterfall cave, a swim-up snack hut, a geyser, jacuzzi jets, water cannons, and floats.

## Ideas for later (all still free)

- A "Chillion of the week" story Leo records and we embed.
- More games: coin sorting by drag, "Lemonade Stand" earn-and-spend, a savings streak calendar.
- Print-at-home savings goal charts (PDF generated from the goal picker).
- Spanish and Armenian toggles.
