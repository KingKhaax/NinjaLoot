'use strict';
// Prueba visual sin red: electron tools/demo.js <carpeta-capturas>
// Simula las respuestas de Raidbots con datos sintéticos y hace capturas de la interfaz.
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');

const outDir = process.argv[2] || process.cwd();
const items = Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/items.js'), 'utf8').replace(/^[\s\S]*?const ITEMS = /, '').replace(/;\s*$/, '')))
  .filter(([, v]) => v[3] >= 250 && v[2] === 4).map(([id, v]) => ({ id: Number(id), name: v[0] }));

const players = [
  ['Thor', 'Frost Mage', 'mage', 1.0], ['Los pitufos', 'Beast Mastery Hunter', 'hunter', 0.72], ['Tanque', 'Brewmaster Monk', 'monk', 0.55], ['Sanador', 'Mistweaver Monk', 'monk', 0.5], ['Dps', 'Windwalker Monk', 'monk', 0.9],
  ['Crepusculo', 'Retribution Paladin', 'paladin', 0.35], ['Sombra', 'Outlaw Rogue', 'rogue', 0.8], ['Vorlag', 'Fury Warrior', 'warrior', 0.45], ['Lumen', 'Shadow Priest', 'priest', 0.62],
];
const fixtures = {};
players.forEach(([name, spec, cls, k], n) => {
  const base = 120000 + n * 7000;
  const results = [];
  for (let i = 0; i < 14; i++) {
    const it = items[(n * 37 + i * 11) % items.length];
    const gain = Math.round((4200 - i * 260 + (i % 3) * 90) * k + 60);
    for (const slot of i % 4 === 0 ? ['trinket1', 'trinket2'] : ['head']) results.push({ name: `1273/15/${2600 + i}/${it.id}/${289 - i % 3 * 3}/${slot}/${it.name}`, mean: base + gain - (slot === 'trinket2' ? 80 : 0) });
  }
  results.push({ name: `1273/15/2600/${items[0].id}/250/back/Peor`, mean: base - 500 });
  fixtures[`demo${String(n).padStart(2, '0')}abcdefghijklmnopqr`] = { simbot: { title: 'Droptimizer', meta: { rawFormData: { character: { name, realm: 'Ragnaros', class: cls } } } }, sim: { players: [{ name, specialization: spec, collected_data: { dps: { mean: base } } }], profilesets: { results } } };
});

app.setPath('userData', path.join(require('os').tmpdir(), 'ninjaloot-demo-' + Date.now()));
app.whenReady().then(async () => {
  const { net } = require('electron');
  const realFetch = net.fetch.bind(net);
  net.fetch = (url, opts) => {
    const m = String(url).match(/simbot\/report\/(\w+)\/data\.json/);
    if (m) return Promise.resolve(fixtures[m[1]] ? new Response(JSON.stringify(fixtures[m[1]]), { status: 200 }) : new Response('', { status: 404 }));
    return realFetch(url, opts);
  };
    require('../main.js');
  await new Promise(r => setTimeout(r, 1500));
  const win = BrowserWindow.getAllWindows()[0];
  win.show(); win.focus(); win.webContents.setBackgroundThrottling(false);
  win.setSize(1400, 900);
  const js = code => win.webContents.executeJavaScript(code);
  const shot = async name => { await new Promise(r => setTimeout(r, 1500)); win.webContents.invalidate(); await new Promise(r => setTimeout(r, 500)); await win.webContents.capturePage(); await new Promise(r => setTimeout(r, 500)); fs.writeFileSync(path.join(outDir, name), (await win.webContents.capturePage()).toPNG()); };
  const errors = [];
  win.webContents.on('console-message', (_e, level, msg) => { if (level >= 2) errors.push(msg); });

  await shot('1-empty.png');
  const urls = Object.keys(fixtures).map(id => `https://www.raidbots.com/simbot/report/${id}`).join('\n');
  await js(`document.querySelector('#urlInput').value = ${JSON.stringify(urls + '\nhttps://www.raidbots.com/simbot/report/nope')}; document.querySelector('#btnAdd').click();`);
  await shot('2-sims.png');
  await js(`document.scrollingElement.scrollTop = 520`);
  await shot('3-detail.png');
  await js(`document.querySelector('#btnLang').click(); document.scrollingElement.scrollTop = 0`);
  await shot('4-english.png');
  await js(`document.querySelector('#btnSettings').click(); document.querySelector('[data-tab=update]').click()`);
  await shot('5-settings.png');
  await js(`document.querySelector('[data-tab=appearance]').click(); document.querySelector('[data-set-theme=light]').click()`);
  await shot('6-light.png');
  await js(`document.querySelector('.modal-back [data-close]').click(); document.querySelector('[data-remove]').click()`);
  const themeAttr = await js(`document.documentElement.dataset.theme + ' ' + getComputedStyle(document.body).backgroundColor`);
  const n = await js(`document.querySelectorAll('#chips .chip').length`);
  await js(`document.querySelector('#btnClear').click()`);
  await shot('7-confirm.png');
  await js(`document.querySelector('.modal-back').remove(); document.querySelector('[data-set-theme]')`).catch(() => {});
  await js(`localStorage.setItem('ninjaloot.settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('ninjaloot.settings') || '{}'), theme: 'dark' })); document.documentElement.dataset.theme = 'dark'; document.querySelector('[data-view=rotations]').click()`);
  await shot('8-rot.png');
  await js(`document.querySelectorAll('.boss')[2].click(); document.querySelectorAll('.rchip')[1].click(); document.querySelectorAll('.rchip')[2].click(); document.querySelectorAll('.rchip')[3].click();`);
  await shot('9-rot2.png');
  await js(`document.querySelector('#btnSettings').click(); document.querySelector('[data-tab=about]').click()`);
  await shot('10-about.png');
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ chipsAfterRemove: n, themeAttr, errors }, null, 2));
  app.exit(0);
});
