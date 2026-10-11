// Parser de informes de Raidbots (Droptimizer). Se usa desde el proceso principal (CommonJS).
'use strict';

const CLASS_KEYS = ['deathknight', 'demonhunter', 'druid', 'evoker', 'hunter', 'mage', 'monk', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];
const norm = s => String(s || '').toLowerCase().replace(/[^a-z]/g, '');

function extractReportId(text) {
  const t = String(text || '').trim();
  const m = t.match(/raidbots\.com\/simbot\/report\/([A-Za-z0-9]+)/i) || t.match(/^([A-Za-z0-9]{16,32})$/);
  return m ? m[1] : null;
}

function extractReportIds(text) {
  const ids = [];
  const re = /raidbots\.com\/simbot\/report\/([A-Za-z0-9]+)/gi;
  let m;
  while ((m = re.exec(String(text || '')))) ids.push(m[1]);
  if (!ids.length) for (const tok of String(text || '').split(/[\s,;]+/)) { const id = extractReportId(tok); if (id) ids.push(id); }
  return [...new Set(ids)];
}

const SLOT_ALIASES = { shoulders: 'shoulder', wrists: 'wrist', bracers: 'wrist', finger: 'finger1', ring1: 'finger1', ring2: 'finger2', trinket: 'trinket1', mainhand: 'main_hand', offhand: 'off_hand', cloak: 'back', belt: 'waist', boots: 'feet', gloves: 'hands', helm: 'head' };
const SLOT_RE = /^(head|neck|shoulder|back|chest|wrist|hands|waist|legs|feet|finger[12]|trinket[12]|main_hand|off_hand)$/;
const normSlot = s => { const k = String(s || '').toLowerCase().replace(/[^a-z0-9_]/g, ''); const v = SLOT_ALIASES[k] || k; return SLOT_RE.test(v) ? v : null; };
const ilvlOf = v => { if (typeof v === 'number') return v; if (!v || typeof v !== 'object') return 0; for (const k of ['ilevel', 'item_level', 'ilvl', 'itemLevel']) if (typeof v[k] === 'number' && v[k] > 0) return v[k]; return 0; };
// Busca (con tope de profundidad) un objeto "ranura -> objeto con nivel" dentro de los datos del informe
function extractGear(root, depth = 0) {
  if (!root || typeof root !== 'object' || depth > 4 || (Array.isArray(root) && root.length > 50)) return null;
  const slots = {};
  let n = 0;
  for (const [k, v] of Object.entries(root)) { const s = normSlot(k); if (s) { const il = ilvlOf(v); if (il >= 1) { slots[s] = il; n++; } } }
  if (n >= 6) return slots;
  for (const v of Object.values(root)) if (v && typeof v === 'object') { const r = extractGear(v, depth + 1); if (r) return r; }
  return null;
}

function detectClass(player, raw) {
  const cands = [player && player.class, player && player.specialization, raw && raw.character && raw.character.class, raw && raw.class];
  for (const c of cands) {
    const n = norm(c);
    if (!n) continue;
    for (const k of CLASS_KEYS) if (n.includes(k)) return k;
  }
  return null;
}

function detectSpec(player, cls) {
  const s = String((player && player.specialization) || '').trim();
  if (!s) return '';
  const words = s.split(/\s+/);
  // "Frost Mage" -> "Frost"; "Beast Mastery Hunter" -> "Beast Mastery"
  const last = norm(words[words.length - 1]);
  if (cls && (last === cls || norm(words.slice(-2).join('')) === cls)) return words.slice(0, words.length - (norm(words.slice(-2).join('')) === cls && words.length > 1 ? 2 : 1)).join(' ');
  return s;
}

// Dificultad escrita en el nombre del profileset (formato actual) -> id numérico de dificultad
const DIFF_ID_BY_NAME = { mythic: 16, heroic: 15, normal: 14, lfr: 17, finder: 17 };

// Nombres de profileset de Droptimizer:
//  - actual:  instancia/encuentro/raid-dificultad/objeto/ilvl/bonus/ranura/...  (p. ej. 1320/2894/raid-mythic/270164/334/0/trinket2////)
//  - antiguo: instancia/dificultad/encuentro/objeto/ilvl/ranura/nombre
function parseProfilesetName(name) {
  const parts = String(name).split('/');
  const nums = parts.map(p => /^-?\d+$/.test(p.trim()) ? Number(p) : NaN);
  if (parts.length >= 7 && Number.isFinite(nums[0]) && Number.isFinite(nums[1]) && /^[a-z]/i.test(parts[2]) && nums[3] > 1000) {
    const diff = /^raid/i.test(parts[2]) && (String(parts[2]).toLowerCase().match(/mythic|heroic|normal|lfr|finder/) || [])[0];
    // Un id al final indica la pieza de origen que se convierte en tier en el catalizador
    const from = nums.slice(7).find(n => n > 1000);
    return { id: nums[3], ilvl: nums[4] > 0 ? nums[4] : 0, slot: /^\d*$/.test(parts[6]) ? '' : parts[6], name: '', source: { instance: nums[0], difficulty: DIFF_ID_BY_NAME[diff] || null, encounter: nums[1] }, catalystFrom: from || null };
  }
  let idx = -1;
  if (parts.length >= 6 && Number.isFinite(nums[3]) && nums[3] > 1000) idx = 3;
  else for (let i = 0; i < nums.length; i++) if (Number.isFinite(nums[i]) && nums[i] > 1000 && nums[i] < 10000000) { idx = i; break; }
  if (idx < 0) return null;
  const ilvl = Number.isFinite(nums[idx + 1]) ? nums[idx + 1] : 0;
  const slot = parts[idx + 2] && !/^\d+$/.test(parts[idx + 2]) ? parts[idx + 2] : '';
  const itemName = parts.slice(idx + 3).join('/').trim();
  return { id: nums[idx], ilvl, slot, name: itemName, source: parts.length >= 6 && idx === 3 ? { instance: nums[0], difficulty: nums[1], encounter: nums[2] } : null };
}

// Tipo de armadura: tela/cuero/malla/placas solo en armaduras que no sean capa (inventoryType 16); el resto vale para cualquiera
const ARMOR_BY_SUBCLASS = { 1: 'c', 2: 'l', 3: 'm', 4: 'p' };
const armorOf = it => (it && it.itemClass === 4 && it.inventoryType !== 16 && ARMOR_BY_SUBCLASS[it.itemSubClass]) || 'any';

const DIFF_BY_ID = { 14: 'nm', 15: 'hc', 16: 'mm', 17: 'lfr' };
// Dificultad de la simulación: la más frecuente entre los objetos (2º dato del nombre del profileset); si no, el formulario de Raidbots
function detectDifficulty(items, raw) {
  const count = {};
  for (const it of items) { const d = it.source && DIFF_BY_ID[it.source.difficulty]; if (d) count[d] = (count[d] || 0) + 1; }
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  if (top) return top[0];
  const txt = JSON.stringify((raw && raw.droptimizer) || '').toLowerCase();
  return /mythic/.test(txt) ? 'mm' : /heroic/.test(txt) ? 'hc' : /normal/.test(txt) ? 'nm' : /lfr|finder/.test(txt) ? 'lfr' : null;
}

function parseReport(json, id) {
  const sim = json && json.sim;
  const players = sim && sim.players;
  if (!players || !players.length) throw new Error('NO_SIM');
  const player = players[0];
  const raw = json.simbot && json.simbot.meta && json.simbot.meta.rawFormData;
  const base = player.collected_data && player.collected_data.dps && player.collected_data.dps.mean;
  const results = sim.profilesets && sim.profilesets.results;
  if (!base || !Array.isArray(results) || !results.length) throw new Error('NOT_DROPTIMIZER');

  const cls = detectClass(player, raw);
  // Piezas de tier: "fromToken" = sale de la ficha del jefe (clic derecho); "catalyst" = se convierte en el catalizador
  const tierOf = new Map(), armor = new Map();
  const meta = (json.simbot && json.simbot.meta) || {}, lib = meta.itemLibrary;
  for (const e of [...(Array.isArray(lib) ? lib : []), ...(Array.isArray(meta.encounterItems) ? meta.encounterItems : [])]) if (e && e.itemClass != null) armor.set(e.id, armorOf(e));
  for (const e of Array.isArray(lib) ? lib : []) {
    const k = `${e.id}:${e.encounterId}`;
    if (e.fromToken) tierOf.set(k, 'token');
    else if (Array.isArray(e.tags) && e.tags.includes('catalyst') && !tierOf.has(k)) tierOf.set(k, 'catalyst');
  }
  const best = new Map(); // un objeto/ilvl cuenta una sola vez (anillos y trinkets se prueban en dos ranuras)
  for (const r of results) {
    const p = parseProfilesetName(r.name);
    if (!p || typeof r.mean !== 'number') continue;
    const gain = r.mean - base;
    if (gain <= 0) continue;
    const key = `${p.id}:${p.ilvl}`;
    const prev = best.get(key);
    const tier = (p.catalystFrom && 'catalyst') || (p.source && tierOf.get(`${p.id}:${p.source.encounter}`)) || null;
    if (!prev || gain > prev.gain) best.set(key, { id: p.id, ilvl: p.ilvl, slot: normSlot(p.slot) || p.slot, name: p.name, gain: Math.round(gain), pct: gain / base * 100, source: p.source, tier, armor: armor.get(p.id) || null });
  }
  if (!best.size) {
    const any = results.some(r => parseProfilesetName(r.name));
    throw new Error(any ? 'NO_UPGRADES' : 'NOT_DROPTIMIZER');
  }
  const items = [...best.values()].sort((a, b) => b.gain - a.gain);
  const character = raw && raw.character || {};
  return {
    id,
    url: `https://www.raidbots.com/simbot/report/${id}`,
    title: (json.simbot && (json.simbot.publicTitle || json.simbot.title)) || '',
    fetchedAt: Date.now(),
    character: { name: player.name || character.name || id, realm: character.realm || '', cls, spec: detectSpec(player, cls) },
    baseDps: Math.round(base),
    difficulty: detectDifficulty(items, raw),
    gear: extractGear(raw && raw.character) || extractGear(player) || null,
    items,
  };
}

module.exports = { extractReportId, extractReportIds, parseReport, parseProfilesetName, armorOf };
