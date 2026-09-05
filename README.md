# Chillion Bucks 😎💚

**chillionbucks.com** is Leo's money site for kids. A *chillion bucks* is when you can chill all day and still have a lot of money (Leo, age 4¾, invented the word; Dad wrote the definition).

The site teaches money basics through four little games, hand-picked YouTube videos, and flip-card "chill words." Green theme, big buttons, lots of motion.

## What's here

| File | What it does |
|---|---|
| `index.html` | The main page: hero, dictionary, four games, videos, chill words, parents. |
| `build.html` + `builder.js` + `builder.css` | **Chillion Builder**: pick a scene or a photo of your room, spend saved bucks on 150+ stickers (animated pools, aquariums, waterfalls, boats, dinosaurs, rockets…), drag them anywhere, draw on top, save a picture. |
| `styles.css` | Green theme, comic-book borders, animations. |
| `app.js` | Games (drag-the-coin piggy, 100-card Need or Want, Coin Counter, Chill-o-Meter), coin rain, confetti, video player, flip cards. |
| `sfx.js` | Synthesized sound effects shared by both pages (no audio files). |
| `wallet.js` | The Chillion wallet: bucks saved in the piggy, spent in the Builder, plus a little daily "baby money" (interest). Stored only in the browser. |
| `videos.js` | The video list. **Edit this to add or swap videos.** |
| `verify-videos.mjs` | `node verify-videos.mjs` checks every video is still live on YouTube. |
| `assets/favicon.svg` | The tab icon. |
| `CNAME` | Tells GitHub Pages the custom domain. |

No build step. No framework. No dependencies. Open `index.html` in a browser and it runs.

## How the money works

Dragging a coin into the piggy adds $1 to the wallet (the tray refills after a beat). The wallet is shared with the Builder, where every sticker has a price; selling a sticker gives the full price back, so the budget teaches without frustrating. Once a day, savings of $5 or more earn a little "baby money" (5%, capped at $5). All of it lives in this browser's localStorage; nothing is sent anywhere.

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

## Ideas for later (all still free)

- A "Chillion of the week" story Leo records and we embed.
- More games: coin sorting by drag, "Lemonade Stand" earn-and-spend, a savings streak calendar.
- Print-at-home savings goal charts (PDF generated from the goal picker).
- Spanish and Armenian toggles.
