# Coin Run

`coinrun.html` is a 3D running game in Sunny Hills: a grassy path over the water with hills, curves, gaps, springs, orange boost arrows, logs, star posts, one loop, and a giant piggy bank at the finish. It is an original game. No character, level, logo, or sound from any other game is used.

## Play

- The runner moves forward on their own. Children steer with the big arrow buttons (or the arrow keys, A and D) and jump with JUMP, a tap anywhere on the game, Space, or the up arrow.
- Runners: Leo and Dad use the family's photo-derived 3D heads from `assets/family/` on cartoon bodies. Buddy is an original character with a cap and loads instantly. The start screen faces the chosen runner.
- Speeds: Easy (10 m/s), Fast (14), and Super fast (18). A run takes about 87, 61, or 47 seconds.
- Jump helper (on by default) jumps gaps and logs automatically, and gives one rescue hop when an early jump would drop into a gap. The runner still steers for coins.
- No enemies and no lives. Falling in the water floats the runner back to the last star post in a bubble, and the next try at that gap is jumped for them. A log only slows the runner for a moment.
- Coins follow the jump arcs for the chosen speed, so every coin can be reached. Stars: finishing earns one, 60 percent of the coins earns two, 90 percent earns three. At the finish the coins stream into the piggy bank.

## Money honesty

Game coins are play points for that run only. They never reach Wallet, and nothing in Coin Run pays real bucks. The results screen says so and links to the jobs. Only the best coins and stars for each speed are saved, in this browser, under `cb:coinrun:v1` (runner, speed, helper setting, best). Nothing is uploaded.

## Code

- `coinrun-level.js`: the level, runner physics, features, coin placement, and save cleanup. No rendering; `tests/coinrun.mjs` plays whole runs in Node.
- `coinrun-models.js`: runners and their animation, coins, springs, arrows, logs, star posts, the loop, the finish arch, the piggy bank, and the islands. Islands, beaches, and clouds are merged into a few meshes.
- `coinrun.js`: the page: renderer, camera, fixed 1/120 s steps, input, countdown, sounds, the coin pour, and results.

The physics is a simple arcade model: constant gravity, a fixed jump speed, coyote time, and a jump buffer. It is not a physical simulation.

## Checks

`node tests/coinrun.mjs` checks the level layout (gaps, checkpoints on solid ground, every normal gap jumpable at Easy, the spring before the long gap, the loop on a flat straight), coin reach, and whole runs at every speed: with the helper nobody falls; without it each gap is missed at most once and then assisted; an early jump is rescued; chasing coins can earn three stars while a hands-off run cannot; half-step physics gives the same result; and saves are cleaned. Browser checks covered desktop and a 390 by 844 phone layout, all three runners, a full run with the loop, spring, finish, piggy pour, results, and saved best, pause, and returning to the start. Physical iPhone performance is not verified.
