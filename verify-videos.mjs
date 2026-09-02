// Checks that every video id in videos.js is still live on YouTube (via the free oEmbed endpoint).
// Usage: node verify-videos.mjs      (exits 1 if any video is gone or private)
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('./videos.js', import.meta.url), 'utf8');
const ids = [...src.matchAll(/id:\s*"([\w-]{11})"/g)].map(m => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) console.log(`duplicate ids: ${[...new Set(dupes)].join(', ')}`);
let bad = 0;
for (const id of ids) {
  const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
  if (r.ok) { const j = await r.json(); console.log(`ok   ${id}  ${j.title}  (${j.author_name})`); }
  else { bad++; console.log(`BAD  ${id}  HTTP ${r.status}  <- remove or replace this one`); }
}
console.log(bad ? `\n${bad} video(s) need attention.` : `\nAll ${ids.length} videos are live.`);
process.exit(bad || dupes.length ? 1 : 0);
