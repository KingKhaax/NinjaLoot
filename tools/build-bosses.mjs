// Genera src/data/bosses.js (copia de los jefes de la temporada activa, usada sin conexión)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { computeBosses } = createRequire(import.meta.url)('../src/bosses.js');
const base = 'https://www.raidbots.com/static/data/live/';
const [instances, seasons] = await Promise.all(['instances', 'seasons'].map(async n => (await fetch(`${base}${n}.json`)).json()));
const data = computeBosses(instances, seasons);
if (!data) throw new Error('No se pudo calcular la temporada');
fs.writeFileSync(path.resolve(import.meta.dirname, '../src/data/bosses.js'), `'use strict';\n// Generado por tools/build-bosses.mjs (se actualiza en vivo desde Raidbots cuando hay conexión)\nconst BOSSES_SNAPSHOT = ${JSON.stringify(data, null, 1)};\n`);
console.log(data.season, data.groups.map(g => `${g.name}: ${g.bosses.length}`).join(' | '));
