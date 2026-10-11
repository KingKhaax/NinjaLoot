// Genera src/data/armor.js: tipo de armadura de cada objeto (c = tela, l = cuero, m = malla, p = placas).
// Los objetos que no aparecen (capas, cuellos, anillos, abalorios, armas) valen para cualquier armadura.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { armorOf } = createRequire(import.meta.url)('../src/parser.js');

const MIN_EXPANSION = 10; // The War Within en adelante
const items = await (await fetch('https://www.raidbots.com/static/data/live/equippable-items.json', { headers: { 'User-Agent': 'NinjaLoot-tools' } })).json();
const data = {};
for (const it of items) { if (it.expansion >= MIN_EXPANSION) { const a = armorOf(it); if (a !== 'any') data[it.id] = a; } }
fs.writeFileSync(path.resolve(import.meta.dirname, '../src/data/armor.js'), `'use strict';\n// id -> c (tela) / l (cuero) / m (malla) / p (placas) (generado por tools/build-armor.mjs)\nconst ARMOR = ${JSON.stringify(data)};\n`);
console.log(`${Object.keys(data).length} objetos de armadura`);
