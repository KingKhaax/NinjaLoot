// Genera src/data/tiers.js: piezas de tier de la temporada activa de cada clase (stats y jefe de la ficha) y bonus de 2/4 piezas por especialización
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const base = 'https://www.raidbots.com/static/data/live/';
const get = async url => { const r = await fetch(url, { headers: { 'User-Agent': 'NinjaLoot-tools' } }); if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); return r.json(); };
const [items, instances, seasons] = await Promise.all(['equippable-items', 'instances', 'seasons'].map(n => get(`${base}${n}.json`)));

// SPECS de src/data/classes.js (para relacionar los nombres de especialización de Wowhead con sus claves)
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.resolve(import.meta.dirname, '../src/data/classes.js'), 'utf8') + ';this.SPECS = SPECS;', ctx);
const SPECS = ctx.SPECS;

const CLASS_BY_ID = { 1: 'warrior', 2: 'paladin', 3: 'hunter', 4: 'rogue', 5: 'priest', 6: 'deathknight', 7: 'shaman', 8: 'mage', 9: 'warlock', 10: 'monk', 11: 'druid', 12: 'demonhunter', 13: 'evoker' };
const SLOT_BY_INV = { 1: 'head', 3: 'shoulder', 5: 'chest', 20: 'chest', 7: 'legs', 10: 'hands' };
// Jefe que suelta la ficha de cada ranura (todas las clases comparten ranura por jefe); Ula'tek suelta una ficha válida para cualquier ranura
const TOKEN_BOSS = { head: 2887, shoulder: 2894, chest: 2882, hands: 2874, legs: 2871 };
const ANY_BOSS = 2895;
const LOCALES = { en: 0, es: 6 };

// El catalizador de la temporada activa: los sets de tier son los objetos con esa fuente
const season = seasons.find(s => s.active) || seasons[0];
const n = (String(season.name).match(/(\d+)\s*$/) || [])[1];
const catalyst = instances.find(i => i.type === 'catalyst' && new RegExp(`Season ${n}$`, 'i').test(i.name));
if (!catalyst) throw new Error('No se encontró el catalizador de la temporada');

const sets = new Map();
for (const it of items) {
  if (!it.itemSetId || !(it.sources || []).some(s => s.instanceId === catalyst.id)) continue;
  const cls = CLASS_BY_ID[(it.allowableClasses || [])[0]], slot = SLOT_BY_INV[it.inventoryType];
  if (!cls || !slot || (it.allowableClasses || []).length !== 1) continue;
  if (!sets.has(cls)) sets.set(cls, { set: it.itemSetId, items: [] });
  sets.get(cls).items.push({ slot, id: it.id, icon: it.icon, stats: (it.stats || []).map(s => s.id).filter(id => [32, 36, 40, 49].includes(id)), boss: TOKEN_BOSS[slot] });
}

const norm = s => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
// Wowhead deja sin traducir "([50% of Attack Power])" y marca entre corchetes algunos nombres de hechizo
const POWER = { es: ['del poder de ataque', 'del poder con hechizos'], en: ['of Attack Power', 'of Spell Power'] };
const clean = (html, lang) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\(?\[?([\d.]+)% of (Attack|Spell) Power\]?\)?/g, (_m, n, kind) => `(${Math.round(Number(n) * 10) / 10}% ${POWER[lang][kind === 'Attack' ? 0 : 1]})`)
  .replace(/\[([^\]]+)\]/g, '$1').replace(/\s+/g, ' ').trim();
// "2 pieces (Windwalker): texto" -> [[2, 'Windwalker', 'texto'], ...] en el orden del tooltip (el mismo en todos los idiomas)
const bonusesOf = (tooltip, lang) => [...tooltip.replace(/<picture>.*?<\/picture>/g, '').matchAll(/<span class="q13">\s*(\d)[^(<]*\(([^)]+)\)\s*:\s*<\/span>(.*?)(?=<br><span class="q13">|<\/span><\/td>)/g)].map(m => [Number(m[1]), m[2], clean(m[3], lang)]);

const SLOT_ORDER = ['head', 'shoulder', 'chest', 'hands', 'legs'];
const classes = {};
for (const [cls, data] of [...sets].sort()) {
  const tips = {};
  for (const [lang, loc] of Object.entries(LOCALES)) tips[lang] = await get(`https://nether.wowhead.com/tooltip/item-set/${data.set}?dataEnv=1&locale=${loc}`);
  const en = bonusesOf(tips.en.tooltip, 'en'), bonus = {};
  en.forEach(([pc, spec], i) => {
    const key = Object.keys(SPECS[cls] || {}).find(k => norm(SPECS[cls][k][0]) === norm(spec));
    if (!key) { console.warn(`  ${cls}: especialización desconocida "${spec}"`); return; }
    bonus[key] ??= {};
    for (const lang of Object.keys(LOCALES)) { const b = bonusesOf(tips[lang].tooltip, lang)[i]; (bonus[key][lang] ??= [])[pc === 2 ? 0 : 1] = b ? b[2] : ''; }
  });
  data.items.sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  classes[cls] = { set: data.set, name: Object.fromEntries(Object.keys(LOCALES).map(l => [l, tips[l].name])), items: data.items, bonus };
  console.log(`${cls}: ${tips.es.name} — ${data.items.length} piezas, bonus de ${Object.keys(bonus).join(', ')}`);
}

const out = { season: season.name, anyBoss: ANY_BOSS, classes };
fs.writeFileSync(path.resolve(import.meta.dirname, '../src/data/tiers.js'), `'use strict';\n// Generado por tools/build-tiers.mjs (datos de Raidbots y Wowhead)\nconst TIERS = ${JSON.stringify(out, null, 1)};\n`);
