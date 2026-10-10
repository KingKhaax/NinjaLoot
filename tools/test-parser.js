const { parseReport, extractReportIds } = require('../src/parser');
const assert = require('assert');
const json = {
  simbot: { title: 'Droptimizer', meta: { rawFormData: { character: { name: 'Thor', realm: 'Ragnaros', class: 'mage' } } } },
  sim: {
    players: [{ name: 'Thor', specialization: 'Frost Mage', collected_data: { dps: { mean: 100000 } } }],
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
assert.throws(() => parseReport({ sim: { players: [{ collected_data: { dps: { mean: 1 } } }] } }, 'x'), /NOT_DROPTIMIZER/);
console.log('parser OK', JSON.stringify(r.items[0]));
