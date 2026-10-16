const { parseReport, extractReportIds } = require('../src/parser');
const assert = require('assert');
const json = {
  simbot: { title: 'Droptimizer', meta: { rawFormData: { character: { name: 'Thor', realm: 'Ragnaros', class: 'mage' } } } },
  sim: {
    players: [{ name: 'Thor', specialization: 'Frost Mage', gear: { head: { ilevel: 289 }, neck: { ilevel: 289 }, shoulder: { ilevel: 289 }, back: { ilevel: 289 }, chest: { ilevel: 289 }, wrist: { ilevel: 289 }, hands: { ilevel: 289 }, trinket1: { ilevel: 250 } }, collected_data: { dps: { mean: 100000 } } }],
    profilesets: { results: [
      { name: '1273/15/2608/249346/289/trinket1/Vaelgor\'s Final Gaze', mean: 103500 },
      { name: '1273/15/2608/249346/289/trinket2/Vaelgor\'s Final Gaze', mean: 103200 },
      { name: '1273/15/2609/249000/285/head/Casco', mean: 101000 },
      { name: '1273/15/2609/249001/285/back/Capa', mean: 99000 },
    ] },
  },
};
const r = parseReport(json, 'abc');
assert.equal(r.items.length, 2);
assert.equal(r.items[0].id, 249346); assert.equal(r.items[0].gain, 3500);
assert.equal(r.character.cls, 'mage'); assert.equal(r.character.spec, 'Frost');
assert.deepEqual(extractReportIds('https://www.raidbots.com/simbot/report/AbC123xyz y https://raidbots.com/simbot/report/Q9'), ['AbC123xyz', 'Q9']);
// Quick Sim (sin comparaciones), Top Gear (comparaciones que no son objetos de Droptimizer) e informes sin simulación
assert.equal(parseReport({ sim: { players: [{ collected_data: { dps: { mean: 1 } } }] } }, 'x').kind, 'quick');
assert.throws(() => parseReport({ sim: { players: [{}] } }, 'x'), /NO_SIM/);
const tg = parseReport({ sim: { players: [{ collected_data: { dps: { mean: 100 } } }], profilesets: { results: [{ name: 'Combo 1', mean: 110 }, { name: 'Combo 2', mean: 90 }] } } }, 'x');
assert.equal(tg.kind, 'topgear'); assert.equal(tg.combos[0].name, 'Combo 1'); assert.equal(tg.combos[0].gain, 10);
const { parseLootHistory } = require('../src/parser.js');
const loot = parseLootHistory(['player,date,time,itemID,item,response,boss,instance,class', 'Okita-Zuljin,16/10/26,20:15:00,240890,Anillo,Mitico,Kithix,Abismo,MONK'].join('\n'));
assert.equal(loot.length, 1); assert.equal(loot[0].player, 'Okita'); assert.equal(loot[0].itemId, 240890);
assert.equal(r.gear.trinket1, 250); assert.equal(r.items[0].slot, 'trinket1');
assert.equal(r.difficulty, 'hc');
console.log('parser OK', JSON.stringify(r.items[0]));
