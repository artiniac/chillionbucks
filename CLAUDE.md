# Claude Code rules for Chillion Bucks

Read before touching anything in this repo.

## What this is
Leo's (age almost 5) money site for kids, chillionbucks.com. "A chillion bucks is when you can chill all day and still have a lot of money." Owner: Artin Nazaryan (Leo's dad). Goal: make kids curious about money through games and good videos, and look genuinely cool while doing it.

## Hard rules
1. **Zero cost, forever.** Static files only (HTML, CSS, vanilla JS). No frameworks, no build step, no npm dependencies, no backend, no databases, no paid APIs, no analytics services. Hosting is GitHub Pages. If a feature needs a server, it does not ship here.
2. **Video comes from YouTube only**, via `videos.js` and the privacy-enhanced embed (`youtube-nocookie.com`). Never host video files. Every id added must pass `node verify-videos.mjs` (it hits YouTube's oEmbed endpoint) before it is committed. Never invent an id from memory.
3. **Kid-safe.** Audience is roughly ages 4 to 9. No accounts, no forms that collect anything, no tracking, no ads, no external links that leave the site except the YouTube creators' own videos. `localStorage` may hold harmless preferences only (sound on/off).
4. **Green is the theme.** Palette tokens live in `styles.css` `:root`. Gold is for coins and highlights. Do not introduce a new primary color.
5. **Motion is a feature, not a bug.** Animations, confetti, sound blips, and bouncy buttons are wanted. Always respect `prefers-reduced-motion` (already wired) and keep everything usable with animations off.
6. **Money math must be honest.** The Chill-o-Meter uses 7%/year growth labeled as a game assumption; keep any rate clearly labeled. Never present a game number as a promise.
7. **Copy style:** playful, short sentences, no em-dashes or en-dashes (use commas, ellipses, or a new sentence). Spell dollar figures like $50.

## Where things live
- One page: `index.html`. Sections: hero, dictionary, Play (4 games), Watch, Chill Words, Parents.
- `app.js` is one IIFE with a block per feature. Add a new game as a new block plus a new `<article class="game">` card.
- `videos.js` is the only content file a non-coder edits.

## Testing
No test framework. Before pushing: `node --check app.js`, `node verify-videos.mjs`, then open `index.html` in a browser at desktop and phone widths and click through every game once.
