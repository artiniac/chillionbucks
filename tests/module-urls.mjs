import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

// A module imported as ./x.js?v=a and ./x.js?v=b runs twice on one page, with
// two texture and material caches. Every importer must use one spelling.
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const files=readdirSync(root).filter(f=>/\.(m?js|html)$/.test(f));
const patterns=[
 /\bfrom\s*['"](\.\/[^'"]+)['"]/g,
 /\bimport\s*\(\s*['"](\.\/[^'"]+)['"]\s*\)/g,
 /^\s*import\s*['"](\.\/[^'"]+)['"]/gm,
 /<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/g
];
const seen=new Map();
for(const file of files){
 const text=readFileSync(join(root,file),'utf8');
 for(const pattern of patterns)for(const match of text.matchAll(pattern)){
  const url=match[1].replace(/^\.\//,''),base=url.split('?')[0];
  if(!base.endsWith('.js'))continue;
  if(!seen.has(base))seen.set(base,new Map());
  const urls=seen.get(base);if(!urls.has(url))urls.set(url,new Set());urls.get(url).add(file);
 }
}
const split=[...seen].filter(([,urls])=>urls.size>1).map(([base,urls])=>base+': '+[...urls].map(([u,f])=>u+' <- '+[...f].join(', ')).join(' | '));
assert.deepEqual(split,[],'Each module needs one import URL:\n'+split.join('\n'));
const missing=[...seen.keys()].filter(base=>!existsSync(join(root,base)));
assert.deepEqual(missing,[],'Imported modules must exist');
assert.ok(seen.size>40,'The scan should find the 3D game modules');
console.log(`PASS: ${seen.size} modules, each imported under exactly one URL, and every import resolves to a file.`);
