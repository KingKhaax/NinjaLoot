'use strict';
// Calcula los jefes de la temporada activa a partir de los datos estáticos de Raidbots (instances.json + seasons.json).
// Se usa desde el proceso principal y desde tools/build-bosses.mjs (copia incluida en src/data/bosses.js).
function computeBosses(instances, seasons) {
  const season = seasons.find(s => s.active) || seasons[0];
  if (!season) return null;
  const n = (String(season.name).match(/(\d+)\s*$/) || [])[1];
  const agg = instances.find(i => i.type === 'raid' && new RegExp(`^Season ${n} Raids$`, 'i').test(i.name));
  if (!agg) return null;
  const order = agg.encounters.filter(e => e.id > 0).map(e => e.id);
  const byEnc = new Map();
  for (const inst of instances) {
    if (inst.type !== 'raid' || !(inst.id > 0)) continue;
    for (const e of inst.encounters || []) if (order.includes(e.id)) byEnc.set(e.id, { inst, e });
  }
  const groups = [];
  for (const id of order) {
    const m = byEnc.get(id);
    if (!m) continue;
    let g = groups.find(x => x.id === m.inst.id);
    if (!g) groups.push(g = { id: m.inst.id, name: m.inst.name, bosses: [] });
    g.bosses.push({ id, name: m.e.name, order: m.e.order });
  }
  for (const g of groups) g.bosses.sort((a, b) => a.order - b.order);
  const names = {};
  for (const inst of instances) for (const e of inst.encounters || []) if (names[e.id] == null) names[e.id] = e.name;
  const inst = {};
  for (const i of instances) if (i.id != null) inst[i.id] = { n: i.name, t: i.type };
  return { season: season.name, groups, names, inst };
}
module.exports = { computeBosses };
