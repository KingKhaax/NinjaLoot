// Descarga una sola vez los iconos de jefes y mazmorras y los guarda dentro de la app (src/assets/bosses/), para que no dependan de ningún servidor.
// Fuentes, en este orden: icono del jefe de Warcraft Logs, botón de la mazmorra del Diario de Mazmorras (Wowhead) e icono del logro de la mazmorra.
// Genera src/data/localicons.js con id -> extensión. Uso: node tools/build-icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const { BOSS_ICONS } = require(path.join(root, 'src/data/bossicons.js'));
const out = path.join(root, 'src/assets/bosses');
fs.mkdirSync(out, { recursive: true });
// iconos de logro para las mazmorras que no tienen botón en el Diario
const ACH = {
  'Ruby Life Pools': 'achievement_dungeon_lifepools', "Algeth'ar Academy": 'achievement_dungeon_dragonacademy', 'Operation: Floodgate': 'inv_achievement_dungeon_waterworks',
  'Priory of the Sacred Flame': 'inv_achievement_dungeon_prioryofthesacredflame', "Tazavesh: So'leah's Gambit": 'achievement_dungeon_brokerdungeon', 'Tazavesh: Streets of Wonder': 'achievement_dungeon_brokerdungeon',
  'Operation: Mechagon - Workshop': 'achievement_boss_mechagon',
};
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, '');
const get = async (url) => { try { const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } }); if (!r.ok) return null; const b = Buffer.from(await r.arrayBuffer()); return b.length > 300 ? b : null; } catch { return null; } };
const map = {};
for (const [name, id] of Object.entries(BOSS_ICONS)) {
  if (map[id]) continue;
  let buf = await get(`https://assets.rpglogs.com/img/warcraft/bosses/${id}-icon.jpg`), ext = 'jpg';
  if (!buf) {
    for (const s of [slug(name), slug(name.replace(/^The /, '')), slug(name.split(':')[0]), slug(name.split(',')[0])]) { buf = await get(`https://wow.zamimg.com/images/wow/journal/ui-ej-dungeonbutton-${s}.png`); if (buf) { ext = 'png'; break; } }
  }
  if (!buf && ACH[name]) { buf = await get(`https://wow.zamimg.com/images/wow/icons/large/${ACH[name]}.jpg`); ext = 'jpg'; }
  if (!buf) { console.log('sin icono:', name, id); continue; }
  fs.writeFileSync(path.join(out, `${id}.${ext}`), buf);
  map[id] = ext;
}
fs.writeFileSync(path.join(root, 'src/data/localicons.js'), `'use strict';\n// Generado por tools/build-icons.mjs — id de jefe o mazmorra -> extensión del icono guardado en assets/bosses/\nconst LOCAL_BOSS = ${JSON.stringify(map)};\n`);
console.log('iconos guardados:', Object.keys(map).length, 'de', new Set(Object.values(BOSS_ICONS)).size);
