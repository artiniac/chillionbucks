# Claude Code rules for Chillion Bucks

Read before touching anything in this repo.

## What this is
Leo's (age almost 5) money site for kids, chillionbucks.com. "A chillion bucks is when you can chill all day and still have a lot of money." Owner: Artin Nazaryan (Leo's dad). Goal: make kids curious about money through games and good videos, and look genuinely cool while doing it.

## Hard rules
1. **Zero cost, forever.** Static files only (HTML, CSS, vanilla JS). No frameworks, no build step, no npm dependencies, no backend, no databases, no paid APIs, no analytics services. Hosting is GitHub Pages. If a feature needs a server, it does not ship here.
2. **Video comes from YouTube only**, via `videos.js` and the privacy-enhanced embed (`youtube-nocookie.com`). Never host video files. Every id added must pass `node verify-videos.mjs` (it hits YouTube's oEmbed endpoint) before it is committed. Never invent an id from memory.
3. **Kid-safe.** Audience is roughly ages 4 to 9. No accounts, no forms that collect anything, no tracking, no ads, no external links that leave the site except the YouTube creators' own videos. `localStorage` holds only on-device game state: sound on/off (`cb:sound`), the wallet (`cb:wallet`), the Builder world (`cb:world`, which may include a downscaled room photo as a data URL), the gallery of finished worlds (`cb:worlds`, capped at 12, each with a small JPEG thumbnail), and the last badge letter a kid typed into the pal maker (`cb:palLetter`, one character). Nothing is ever uploaded; keep it that way. Any new stored key must be harmless if it leaks to nobody but the same browser.
4. **Green is the theme.** Palette tokens live in `styles.css` `:root`. Gold is for coins and highlights. Do not introduce a new primary color.
5. **Motion is a feature, not a bug.** Animations, confetti, sound blips, and bouncy buttons are wanted. Always respect `prefers-reduced-motion` (already wired) and keep everything usable with animations off.
6. **Money math must be honest.** The Chill-o-Meter uses 7%/year growth labeled as a game assumption; keep any rate clearly labeled. Never present a game number as a promise.
7. **Copy style:** playful, short sentences, no em-dashes or en-dashes (use commas, ellipses, or a new sentence). Spell dollar figures like $50.

## Where things live
- `index.html`: hero, dictionary, Play (4 games), Build teaser, Watch, Chill Words, Parents. `app.js` is one IIFE with a block per feature. Add a new game as a new block plus a new `<article class="game">` card.
- `build.html` + `builder.css` + three scripts, loaded in this order: `builder-art.js` (window.CB_ART: `SCENES`, sticker factories `S`, grid pieces `P`, kit heroes `H`, `blockSVG`, `palSVG`; every factory is `(uniqueId, item)` and reads `item.color` / `item.label` / `item.pal`), `builder-catalog.js` (window.CB_CATALOG: `KITS`, `ITEMS` via `V` sticker / `E` emoji / `G` grid piece / `B` Snap Block, `DEF`, `JOBS`), then `builder.js` (the engine). Prices are small whole dollars; free items exist so a world is never empty. Selling refunds the full price, except things reopened from the gallery (`free: true`), which were refunded once already.
- **Earning is the point (Artin, 2026-09-05: "if they want to make money, they have to build things and work").** The Job Board pays once per world per job (`world.jobsDone`); 🏆 Finish pays once per world (`world.finished`) and writes the world into `cb:worlds`. Never add a way to earn that can be farmed by buying and selling the same thing (per-piece pay, repeatable jobs, refunding gallery items).
- **Snap Blocks are ours.** Studded blocks in ten colors that snap to a 24-cell grid. Do not use any toy brand's name, logo, minifigure shape, or exact brick proportions anywhere in code, copy, or art. The pal (character) is a rounded cartoon figure on purpose, not a minifigure.
- Item state: `{uid, kind, x, y, s, flip, rot, z, color, label, pal, free}`; x/y are fractions of the items layer (`#items`, which sits inside the stage border; all geometry uses its rect). `snapItem` aligns left/top edges to the grid, with the stud row of a block poking above the line.
- `sfx.js` (sounds) and `wallet.js` (shared bucks) load on both pages before the page script.
- `videos.js` is the only content file a non-coder edits.
- The piggy game is drag-and-drop by design (Artin, 2026-09-05: "the kid has to drag the money or coin into the piggy bank"). Keyboard users can press Enter on a coin. Do not turn it back into tap-to-add.

## Testing
No test framework. Before pushing: `node --check app.js builder.js builder-art.js builder-catalog.js sfx.js wallet.js`, `node verify-videos.mjs`, then open `index.html` and `build.html` in a browser at desktop and phone widths and click through every game once (drag a coin into the piggy, answer a Need or Want card and tap the button twice fast, buy a block and drag it so it snaps, copy and turn it, buy a wall and a roof, open 💼 Jobs and collect one, tap 🏆 Finish, reopen the world from 📚 My worlds, make a pal, draw, save a picture). Watch the console: an SVG attribute error means a factory string is malformed.
