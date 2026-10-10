'use strict';
// Prueba visual sin red: electron tools/demo.js <carpeta-capturas>
// Simula las respuestas de Raidbots con datos sintéticos y hace capturas de la interfaz.
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');

const outDir = process.argv[2] || process.cwd();
const items = Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/items.js'), 'utf8').replace(/^[\s\S]*?const ITEMS = /, '').replace(/;\s*$/, '')))
  .filter(([, v]) => v[3] >= 250 && v[2] === 4).map(([id, v]) => ({ id: Number(id), name: v[0], role: v[5] }));
const roleItems = [items.find(i => i.role === 't'), items.find(i => i.role === 'h')].filter(Boolean);

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
    for (const slot of i % 4 === 0 ? ['trinket1', 'trinket2'] : ['head']) results.push({ name: `1273/${n < 5 ? 16 : 15}/${[2888, 2874, 2894, 2882, 2871, 2887, 2883, 2895, 2849][i % 9]}/${it.id}/${289 - i % 3 * 3}/${slot}/${it.name}`, mean: base + gain - (slot === 'trinket2' ? 80 : 0) });
  }
  if (n < 3) for (const r of roleItems) results.push({ name: `1273/16/2888/${r.id}/289/trinket1/${r.name}`, mean: base + 3300 });
  results.push({ name: `1273/15/2600/${items[0].id}/250/back/Peor`, mean: base - 500 });
  fixtures[`demo${String(n).padStart(2, '0')}abcdefghijklmnopqr`] = { simbot: { title: 'Droptimizer', meta: { rawFormData: { character: { name, realm: 'Ragnaros', class: cls } } } }, sim: { players: [{ name, specialization: spec, gear: Object.fromEntries(['head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands', 'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2', 'main_hand'].map(s => [s, { ilevel: (n === 0 && s === 'trinket1') || (n === 1 && s === 'head') ? 246 : 289 }])), collected_data: { dps: { mean: base } } }], profilesets: { results } } };
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
  win.webContents.on('console-message', (_e, level, msg) => { if (level >= 2) errors.push(msg); console.log('RENDERER', msg); });

  await shot('1-empty.png');
  await js(`document.querySelector('[data-view=charts]').click()`);
  const urls = Object.keys(fixtures).map(id => `https://www.raidbots.com/simbot/report/${id}`).join('\n');
  await js(`document.querySelector('#urlInput').value = ${JSON.stringify(urls + '\nhttps://www.raidbots.com/simbot/report/nope')}; document.querySelector('#btnAdd').click();`);
  await shot('2-sims.png');
  await js(`document.scrollingElement.scrollTop = 520`);
  await shot('3-detail.png');
  await js(`document.querySelector('#btnLang').click(); document.querySelector('[data-lang=en]').click(); document.scrollingElement.scrollTop = 0`);
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
  await js(`document.querySelectorAll('.bcol button')[2].click();`);
  await shot('9-rot2.png');
  await js(`document.querySelector('#btnSettings').click(); document.querySelector('[data-tab=about]').click()`);
  await shot('10-about.png');
  await js(`document.querySelectorAll('.cell')[0].click(); document.querySelectorAll('.cell')[0].click(); document.querySelectorAll('.cell')[10].click(); document.querySelectorAll('.cell')[11].click(); document.querySelectorAll('.cell')[11].click(); document.querySelector('#btnSettings') && document.querySelector('.modal-back')?.remove();`);
  await shot('11-table.png');
  await js(`document.querySelector('[data-view=charts]').click(); window.scrollTo(0, 0);`);
  await new Promise(r => setTimeout(r, 800));
  await js(`(() => { const b = document.querySelector('.chart-wrap .bar[data-item]'); const r = b.getBoundingClientRect(); b.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: r.x + 30, clientY: r.y + 100 })); })()`);
  await new Promise(r => setTimeout(r, 2500));
  fs.writeFileSync(path.join(outDir, 'tip.json'), JSON.stringify(await js(`(() => { const t = document.getElementById('tip'); return { hidden: t.hidden, len: t.innerHTML.length, text: t.textContent.slice(0, 300), cur: t.dataset.cur, style: t.style.cssText }; })()`), null, 1));
  win.webContents.invalidate(); await new Promise(r => setTimeout(r, 300)); await win.webContents.capturePage(); fs.writeFileSync(path.join(outDir, '12-tooltip.png'), (await win.webContents.capturePage()).toPNG());
  await js(`document.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })); window.scrollTo(0, document.body.scrollHeight);`);
  await shot('13-caution.png');
  await js(`document.querySelector('[data-view=personal]').click()`);
  await js(`(() => { const s = document.querySelector('#personalPick'); s.value = s.options[1].value; s.dispatchEvent(new Event('change', { bubbles: true })); window.scrollTo(0, 0); })()`);
  await shot('14-personal.png');
  await js(`document.querySelector('[data-view=charts]').click(); document.querySelector('[data-mode=player]').click(); window.scrollTo(0, 0);`);
  await shot('15-player.png');
  await js(`document.querySelector('[data-view=rotations]').click(); document.querySelector('#btnLang').click(); document.querySelector('[data-lang=fr]').click(); document.querySelector('#btnLang').click(); window.scrollTo(0, 0);`);
  await shot('16-fr-menu.png');
  await js(`document.querySelector('[data-lang=de]').click(); document.querySelector('[data-view=charts]').click(); window.scrollTo(0, 0);`);
  await shot('17-de.png');
  await js(`document.querySelector('[data-lang=es]')?.click(); document.querySelector('#btnLang').click(); document.querySelector('[data-lang=es]').click(); document.querySelector('[data-view=personal]').click(); document.querySelector('[data-pmode=coin]').click(); window.scrollTo(0, 0);`);
  await shot('18-coin.png');
  await js(`document.querySelector('[data-view=charts]').click(); document.querySelector('#boss-2888')?.scrollIntoView();`);
  await shot('19-boss.png');
  await js(`document.querySelector('#btnSettings').click(); document.querySelector('[data-tab=appearance]').click(); const s = document.querySelector('[data-key=font]'); s.value = 'expressway'; s.dispatchEvent(new Event('change', { bubbles: true }));`);
  await shot('20-font.png');
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ chipsAfterRemove: n, themeAttr, errors }, null, 2));
  app.exit(0);
});
