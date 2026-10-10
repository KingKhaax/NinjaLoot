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

// Nombres de profileset de Droptimizer: instancia/dificultad/encuentro/objeto/ilvl/ranura/nombre
function parseProfilesetName(name) {
  const parts = String(name).split('/');
  const nums = parts.map(p => /^\d+$/.test(p.trim()) ? Number(p) : NaN);
  let idx = -1;
  if (parts.length >= 6 && Number.isFinite(nums[3]) && nums[3] > 1000) idx = 3;
  else for (let i = 0; i < nums.length; i++) if (Number.isFinite(nums[i]) && nums[i] > 1000 && nums[i] < 10000000) { idx = i; break; }
  if (idx < 0) return null;
  const ilvl = Number.isFinite(nums[idx + 1]) ? nums[idx + 1] : 0;
  const slot = parts[idx + 2] && !/^\d+$/.test(parts[idx + 2]) ? parts[idx + 2] : '';
  const itemName = parts.slice(idx + 3).join('/').trim();
  return { id: nums[idx], ilvl, slot, name: itemName, source: parts.length >= 6 && idx === 3 ? { instance: nums[0], difficulty: nums[1], encounter: nums[2] } : null };
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
  const best = new Map(); // un objeto/ilvl cuenta una sola vez (anillos y trinkets se prueban en dos ranuras)
  for (const r of results) {
    const p = parseProfilesetName(r.name);
    if (!p || typeof r.mean !== 'number') continue;
    const gain = r.mean - base;
    if (gain <= 0) continue;
    const key = `${p.id}:${p.ilvl}`;
    const prev = best.get(key);
    if (!prev || gain > prev.gain) best.set(key, { id: p.id, ilvl: p.ilvl, slot: p.slot, name: p.name, gain: Math.round(gain), pct: gain / base * 100, source: p.source });
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
    items,
  };
}

module.exports = { extractReportId, extractReportIds, parseReport, parseProfilesetName };
