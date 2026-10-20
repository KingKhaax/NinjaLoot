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

// Estadísticas de la simulación (atributos y valoraciones) a partir de los datos de SimulationCraft; cada campo es opcional
const firstNum = (o, keys) => { for (const k of keys) { const v = o && o[k]; if (typeof v === 'number' && isFinite(v)) return v; } return null; };
function extractStats(player) {
  const bs = (player.collected_data && player.collected_data.buffed_stats) || {};
  const attr = bs.attribute || {}, st = bs.stats || {};
  const out = {
    strength: firstNum(attr, ['strength']), agility: firstNum(attr, ['agility']), intellect: firstNum(attr, ['intellect']), stamina: firstNum(attr, ['stamina']),
    crit: firstNum(st, ['crit_rating', 'spell_crit_rating', 'attack_crit_rating']), haste: firstNum(st, ['haste_rating', 'spell_haste_rating', 'attack_haste_rating']),
    mastery: firstNum(st, ['mastery_rating']), versatility: firstNum(st, ['versatility_rating', 'vers_rating']), armor: firstNum(st, ['armor']),
    critPct: firstNum(st, ['spell_crit', 'attack_crit', 'crit']), hastePct: firstNum(st, ['spell_haste', 'attack_haste', 'haste']), masteryPct: firstNum(st, ['mastery_value', 'mastery']),
  };
  for (const k of Object.keys(out)) if (out[k] == null) delete out[k];
  return Object.keys(out).length ? out : null;
}

// Cabecera estilo Raidbots: título de la sim, raza y nivel, reino, equipo (con iconos) y texto SimC para exportar
const HEAD_SLOT_KEYS = { head: 'head', neck: 'neck', shoulder: 'shoulder', shoulders: 'shoulder', back: 'back', chest: 'chest', wrist: 'wrist', wrists: 'wrist', hands: 'hands', waist: 'waist', legs: 'legs', feet: 'feet', finger1: 'finger1', finger2: 'finger2', trinket1: 'trinket1', trinket2: 'trinket2', mainhand: 'mainHand', main_hand: 'mainHand', offhand: 'offHand', off_hand: 'offHand' };
function headerOf(json, player, raw) {
  try {
    const simbot = json.simbot || {}, meta = simbot.meta || {};
    const ident = (raw && raw.profile && raw.profile.identity) || {};
    const text = String((raw && raw.text) || '');
    const rm = (text.split('\n')[0] || '').match(/-\s*(EU|US|KR|TW|CN)\/(.+?)\s*$/i);
    const equipped = {};
    const eq = raw && raw.droptimizer && raw.droptimizer.equipped;
    if (eq && typeof eq === 'object') {
      for (const [k, v] of Object.entries(eq)) {
        const key = HEAD_SLOT_KEYS[String(k).toLowerCase()];
        if (key && v && v.id) equipped[key] = { id: v.id, name: v.name || '', icon: v.icon || '', quality: v.quality == null ? 4 : v.quality, ilvl: v.itemLevel || ilvlOf(v) || 0, track: (v.upgrade && v.upgrade.name) || '' };
      }
    }
    if (!Object.keys(equipped).length && player && player.gear && typeof player.gear === 'object') {
      for (const [k, v] of Object.entries(player.gear)) {
        const key = HEAD_SLOT_KEYS[String(k).toLowerCase()];
        const id = v && v.encoded_item && Number((String(v.encoded_item).match(/id=(\d+)/) || [])[1]);
        if (key && id) equipped[key] = { id, name: '', icon: '', quality: 4, ilvl: ilvlOf(v) };
      }
    }
    let sum = 0;
    for (const [k, v] of Object.entries(equipped)) sum += v.ilvl || 0;
    if (equipped.mainHand && !equipped.offHand) sum += equipped.mainHand.ilvl || 0; // arma a dos manos: cuenta dos veces
    const avgIlvl = Object.keys(equipped).length >= 8 ? Math.round(sum / 16) : null;
    return {
      subtitle: simbot.publicTitle || simbot.title || '',
      race: String((player && player.race) || meta.race || ''),
      level: Number((player && player.level) || ident.level) || null,
      realmName: rm ? rm[2].trim() : '',
      region: String(ident.region || (rm && rm[1]) || '').toUpperCase(),
      equipped, avgIlvl,
      simc: text.length <= 40000 ? text : '',
    };
  } catch { return null; }
}

// Datos comunes de cualquier informe de SimulationCraft: personaje, DPS (media y desviación), sanación, daño recibido y tipo de pelea
function commonOf(json, id, player, raw, sim) {
  const cd = player.collected_data || {}, num = (o, k) => (o && typeof o[k] === 'number' ? o[k] : null);
  const cls = detectClass(player, raw), character = (raw && raw.character) || {};
  const ident = (raw && raw.profile && raw.profile.identity) || {}, armory = (raw && raw.armory) || {};
  return {
    id, url: `https://www.raidbots.com/simbot/report/${id}`,
    title: (json.simbot && (json.simbot.publicTitle || json.simbot.title)) || '', fetchedAt: Date.now(),
    character: { name: player.name || character.name || id, realm: character.realm || ident.realm || armory.realm || '', region: ident.region || armory.region || '', cls, spec: detectSpec(player, cls) },
    simDate: (json.simbot && (json.simbot.date || json.simbot.jobEnqueued)) || null,
    baseDps: Math.round(num(cd.dps, 'mean') || 0), dpsStd: Math.round(num(cd.dps, 'mean_std_dev') || 0), hps: Math.round(num(cd.hps, 'mean') || 0), dtps: Math.round(num(cd.dtps, 'mean') || 0),
    fight: {
      style: String((sim.options && sim.options.fight_style) || (raw && raw.fightStyle) || ''),
      targets: Number((sim.options && sim.options.desired_targets) || (raw && raw.enemyCount)) || null,
      secs: Number((sim.options && sim.options.max_time) || (raw && raw.fightLength)) || null,
    },
    stats: extractStats(player), items: [],
    head: headerOf(json, player, raw),
  };
}

function parseReport(json, id) {
  const sim = json && json.sim;
  const players = sim && sim.players;
  if (!players || !players.length) throw new Error('NO_SIM');
  const player = players[0];
  const raw = json.simbot && json.simbot.meta && json.simbot.meta.rawFormData;
  const base = player.collected_data && player.collected_data.dps && player.collected_data.dps.mean;
  const results = sim.profilesets && sim.profilesets.results;
  if (!base) throw new Error('NO_SIM');
  // Sin comparaciones: Quick Sim (una sola simulación, con sus estadísticas)
  if (!Array.isArray(results) || !results.length) return { ...commonOf(json, id, player, raw, sim), kind: 'quick' };
  // Con comparaciones que no son objetos de Droptimizer: Top Gear (combinaciones de equipo)
  if (!results.some(r => { const p = parseProfilesetName(r.name); return p && p.id > 1000; })) {
    const combos = results.filter(r => typeof r.mean === 'number').map(r => ({ name: String(r.name).replace(/\s+/g, ' ').trim(), dps: Math.round(r.mean), gain: Math.round(r.mean - base), pct: (r.mean - base) / base * 100 }))
      .sort((a, b) => b.dps - a.dps).slice(0, 40);
    return { ...commonOf(json, id, player, raw, sim), kind: 'topgear', combos };
  }

  const cls = detectClass(player, raw);
  // Piezas de tier: "fromToken" = sale de la ficha del jefe (clic derecho); "catalyst" = se convierte en el catalizador
  const tierOf = new Map(), armor = new Map();
  const meta = (json.simbot && json.simbot.meta) || {}, lib = meta.itemLibrary;
  // Datos de las piezas de origen de los catalizadores (nombre, estadísticas secundarias y dónde caen)
  const infoById = new Map();
  for (const e of [...(Array.isArray(lib) ? lib : []), ...(Array.isArray(meta.encounterItems) ? meta.encounterItems : [])]) if (e && e.id && !infoById.has(e.id)) infoById.set(e.id, e);
  const SEC = new Set([32, 36, 40, 49]);
  const catInfo = (fromId, encounter) => {
    const e = infoById.get(fromId);
    if (!e) return { from: fromId };
    const stats = [...new Set((e.stats || []).map(x => x.id).filter(id => SEC.has(id)))];
    return { from: fromId, name: e.name || '', stats, same: (e.sources || []).some(x => x.encounterId === encounter) };
  };
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
    if (!prev || gain > prev.gain) best.set(key, { id: p.id, ilvl: p.ilvl, slot: normSlot(p.slot) || p.slot, name: p.name, gain: Math.round(gain), pct: gain / base * 100, source: p.source, tier, armor: armor.get(p.id) || null, catFrom: p.catalystFrom ? catInfo(p.catalystFrom, p.source && p.source.encounter) : null });
  }
  if (!best.size) {
    const any = results.some(r => parseProfilesetName(r.name));
    throw new Error(any ? 'NO_UPGRADES' : 'NOT_DROPTIMIZER');
  }
  const items = [...best.values()].sort((a, b) => b.gain - a.gain);
  const character = raw && raw.character || {};
  // Para comprobar el equipo actual (Raider.IO): región, reino y lo que llevaba puesto al simular
  const ident = (raw && raw.profile && raw.profile.identity) || {}, armory = (raw && raw.armory) || {};
  const equippedAtSim = {};
  for (const [k, v] of Object.entries((raw && raw.droptimizer && raw.droptimizer.equipped) || {})) {
    const s = normSlot(k);
    if (s && v && v.id) equippedAtSim[s] = { id: v.id, ilvl: ilvlOf(v) || v.itemLevel || 0 };
  }
  return {
    kind: 'drop',
    id,
    url: `https://www.raidbots.com/simbot/report/${id}`,
    title: (json.simbot && (json.simbot.publicTitle || json.simbot.title)) || '',
    fetchedAt: Date.now(),
    character: { name: player.name || character.name || id, realm: character.realm || ident.realm || armory.realm || '', region: ident.region || armory.region || '', cls, spec: detectSpec(player, cls) },
    simDate: (json.simbot && (json.simbot.date || json.simbot.jobEnqueued)) || null,
    equippedAtSim,
    baseDps: Math.round(base),
    difficulty: detectDifficulty(items, raw),
    // Tipo de pelea simulada (p. ej. Patchwerk, 1 objetivo, 300 s) para comparar sims 1T/5T, 1 min/5 min...
    fight: {
      style: String((sim.options && sim.options.fight_style) || (raw && raw.fightStyle) || ''),
      targets: Number((sim.options && sim.options.desired_targets) || (raw && raw.enemyCount)) || null,
      secs: Number((sim.options && sim.options.max_time) || (raw && raw.fightLength)) || null,
    },
    gear: extractGear(raw && raw.character) || extractGear(player) || null,
    head: headerOf(json, player, raw),
    items,
  };
}

// Historial de loot de RCLootCouncil (Exportar → CSV/TSV): columnas player, date, time, id, item, itemID, itemString, response, votes, class, instance, boss, gear1, gear2...
function splitCsvLine(line, d) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === d) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function parseLootHistory(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const d = ['\t', ';', ','].map(c => [c, (lines[0].match(new RegExp(c === '\t' ? '\t' : c, 'g')) || []).length]).sort((a, b) => b[1] - a[1])[0][0];
  const head = splitCsvLine(lines[0], d).map(h => h.trim().toLowerCase());
  const col = (...names) => { for (const n of names) { const i = head.indexOf(n); if (i >= 0) return i; } return -1; };
  const cP = col('player', 'winner', 'name'), cDate = col('date'), cTime = col('time'), cItemId = col('itemid'), cItem = col('item', 'itemname'), cStr = col('itemstring', 'itemlink', 'id'), cResp = col('response'), cBoss = col('boss'), cInst = col('instance'), cClass = col('class');
  if (cP < 0 || (cItemId < 0 && cStr < 0)) return [];
  const rows = [];
  for (const line of lines.slice(1)) {
    const f = splitCsvLine(line, d);
    let itemId = cItemId >= 0 ? Number(f[cItemId]) : NaN;
    if (!(itemId > 0)) { const m = /item:(\d+)/.exec(f[cStr] || '') || /^(\d{4,})/.exec(f[cStr] || ''); itemId = m ? Number(m[1]) : NaN; }
    const player = String(f[cP] || '').trim();
    if (!player || !(itemId > 0)) continue;
    // fecha dd/mm/yy o yy/mm/dd o aaaa-mm-dd, con hora opcional
    let at = null;
    const ds = String(f[cDate] || '').trim();
    let m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(ds);
    if (m) at = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    else if ((m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/.exec(ds))) at = Date.UTC(+m[3] < 100 ? 2000 + +m[3] : +m[3], +m[2] - 1, +m[1]);
    const tm = /^(\d{1,2}):(\d{2})/.exec(String(f[cTime] || ''));
    if (at != null && tm) at += (+tm[1] * 60 + +tm[2]) * 60000;
    rows.push({ player: player.split('-')[0], itemId, item: cItem >= 0 ? String(f[cItem] || '').trim() : '', response: cResp >= 0 ? String(f[cResp] || '').trim() : '', boss: cBoss >= 0 ? String(f[cBoss] || '').trim() : '', instance: cInst >= 0 ? String(f[cInst] || '').trim() : '', cls: cClass >= 0 ? String(f[cClass] || '').trim() : '', at });
  }
  return rows;
}

module.exports = { extractReportId, extractReportIds, parseReport, extractStats, parseLootHistory, parseProfilesetName, armorOf };
