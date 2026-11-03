// Genera src/data/realms.js: slug de reino -> nombre oficial (con apóstrofos, espacios y tildes), de la API de Blizzard (índice de reinos de cada región).
// Solo se guardan los reinos cuyo nombre no sale de poner mayúscula a cada palabra del slug (Zul'jin, Pozo de la Eternidad…).
// Uso: node tools/build-realms.mjs   (usa el servidor intermedio de NinjaLoot para llegar a la API de Blizzard)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const REGIONS = ['eu', 'us', 'kr', 'tw'];
const title = (slug) => slug.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
const out = {};
for (const region of REGIONS) {
  const p = `/data/wow/realm/index?namespace=dynamic-${region}&locale=en_US`;
  try {
    const r = await fetch(`https://ninjaloot-bnet.vercel.app/bnet?region=${region}&path=${encodeURIComponent(p)}`);
    if (!r.ok) { console.log(region, 'HTTP', r.status); continue; }
    const j = await r.json();
    let n = 0;
    for (const x of j.realms || []) {
      const name = typeof x.name === 'string' ? x.name : x.name && (x.name.en_US || Object.values(x.name)[0]);
      if (!x.slug || !name || name === title(x.slug)) continue;
      if (!out[x.slug]) { out[x.slug] = name; n++; }
    }
    console.log(region, (j.realms || []).length, 'reinos,', n, 'con nombre especial');
  } catch (e) { console.log(region, 'error', e.message); }
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(path.join(root, 'src/data/realms.js'), `'use strict';\n// Generado por tools/build-realms.mjs — slug de reino -> nombre oficial\nconst REALM_NAMES = ${JSON.stringify(sorted, null, 1)};\n`);
console.log('guardados', Object.keys(sorted).length);
