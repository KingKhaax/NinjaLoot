// Pruebas de navegador de la web de NinjaLoot (se lanzan en el CI antes de publicar). Uso: node tests/e2e/web.e2e.mjs
// Requisitos: haber ejecutado «node tools/build-web.mjs» (carpeta _site) y tener Chromium para Playwright (o E2E_BROWSER).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { serve, launch, newPage, contexts, test, runAll } from './lib.mjs';

const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const DIST = new URL('../../_site/', import.meta.url);
const { srv, url } = await serve(DIST);
const browser = await launch();
test.afterEach(async () => { for (const c of contexts.splice(0)) await c.close().catch(() => {}); });
test.after(async () => { await browser.close(); srv.close(); });

const open = async (hash = '') => { const p = await newPage(browser); await p.goto(url + hash, { waitUntil: 'load' }); await p.waitForTimeout(1200); return p; };
const noErrors = (p) => assert.deepEqual(p.errors, [], 'errores de página: ' + p.errors.join(' | '));
const hash = (p) => p.evaluate(() => location.hash);

test('la web compilada está completa', () => {
  const html = fs.readFileSync(new URL('index.html', DIST), 'utf8');
  let n = 0;
  for (const m of html.matchAll(/(?:src|href)="([^"#?]+\.(?:js|css|png|webp|woff2|json|svg))(?:\?[^"]*)?"/g)) {
    if (/^(https?:)?\/\//.test(m[1])) continue;
    assert.ok(fs.existsSync(new URL(m[1], DIST)), 'falta ' + m[1]);
    n++;
  }
  assert.ok(n > 3, 'el index.html debe enlazar sus archivos');
  assert.ok(pkg.version);
});

test('la portada carga sin errores y la barra son enlaces', async () => {
  const p = await open();
  assert.match(await p.title(), /NinjaLoot|Inicio|Home/);
  const tags = await p.$$eval('.navbtn', (e) => e.map((x) => x.tagName));
  assert.ok(tags.length >= 5 && tags.every((t) => t === 'A'), 'barra: ' + tags.join(','));
  noErrors(p);
});

test('cada pantalla tiene su dirección y Atrás funciona', async () => {
  const p = await open();
  assert.ok(['', '#/'].includes(await hash(p)), 'la portada es #/ como en WipeTime');
  await p.click('.navbtn[data-view="tiers"]'); await p.waitForTimeout(400);
  assert.equal(await hash(p), '#/tiers');
  await p.click('.navbtn[data-view="roster"]'); await p.waitForTimeout(400);
  assert.equal(await hash(p), '#/roster');
  await p.goBack(); await p.waitForTimeout(500);
  assert.equal(await hash(p), '#/tiers');
  noErrors(p);
});

test('Ajustes: pestañas, tamaño con deslizador, restablecer con confirmación y «Versión y acerca de»', async () => {
  const p = await open();
  await p.click('#btnSettings'); await p.waitForTimeout(300);
  const tabs = await p.$$eval('.side-tab', (e) => e.map((x) => x.dataset.tab));
  assert.deepEqual(tabs, ['general', 'lists', 'appearance', 'discord', 'update']);
  await p.click('[data-tab="appearance"]'); await p.waitForTimeout(200);
  await p.$eval('input[type=range][data-key="fontScale"]', (e) => { e.value = '120'; e.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(200);
  const size = () => p.evaluate(() => JSON.parse(localStorage.getItem('ninjaloot.settings')).fontScale);
  assert.equal(await size(), 120);
  await p.click('[data-tab="general"]'); await p.waitForTimeout(200);
  await p.click('[data-reset-all]'); await p.waitForTimeout(200);
  assert.equal(await size(), 120, 'el primer clic no restablece');
  await p.click('[data-reset-all]'); await p.waitForTimeout(400);
  assert.equal(await size(), 100, 'el segundo clic restablece');
  // versión + acerca de, historial recortado
  await p.click('[data-tab="update"]'); await p.waitForSelector('.chlog-row');
  assert.equal(await p.$$eval('.chlog-row', (e) => e.length), 10);
  await p.click('#chlogMore'); await p.waitForTimeout(150);
  assert.ok((await p.$$eval('.chlog-row', (e) => e.length)) > 10);
  assert.ok(await p.$('.about-friend'), 'acerca de dentro de la pestaña');
  assert.ok(!/España/.test(await p.$eval('.about-es', (e) => e.innerText)), 'bandera sin texto');
  noErrors(p);
});

test('pestaña Discord: guarda, avisa, valida y desconecta', async () => {
  const p = await newPage(browser);
  await p.route('**/ninjaloot-relay**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ clientId: '123', channel: 'sims', lastId: '1', messages: [] }) }).catch(() => {}));
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.click('#btnSettings'); await p.click('[data-tab="discord"]'); await p.waitForSelector('#dcChannel');
  await p.fill('#dcChannel', '123456789012345678'); await p.click('[data-dc-save]'); await p.waitForTimeout(700);
  assert.ok((await p.$$eval('.toast', (e) => e.map((x) => x.textContent))).some((x) => /Guardado/.test(x)), 'avisa «Guardado»');
  await p.click('[data-dc-clear]'); await p.waitForTimeout(500);
  assert.equal(await p.$eval('#dcChannel', (e) => e.value), '');
  await p.fill('#dcChannel', 'abc'); await p.click('[data-dc-save]'); await p.waitForTimeout(400);
  assert.ok((await p.$$eval('.toast', (e) => e.map((x) => x.textContent))).some((x) => /ID|enlace/.test(x)), 'canal no válido avisa');
  noErrors(p);
});

test('pulsar el nombre de Discord o Battle.net lo copia y avisa en medio de la pantalla', async () => {
  const p = await open();
  await p.click('#verBadge'); await p.waitForSelector('.about-friend');
  for (const [k, name] of [['discord', 'sr.kitkat'], ['battlenet', 'KitKat#21202']]) {
    await p.click(`.about-friend[data-friend="${k}"]`); await p.waitForSelector('#copyPop');
    assert.equal(await p.evaluate(() => navigator.clipboard.readText()), name);
    assert.match(await p.$eval('#copyPop', (e) => e.innerText), /copiado al portapapeles/i);
    const box = await p.$eval('#copyPop', (e) => { const r = e.getBoundingClientRect(); return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, w: innerWidth, h: innerHeight }; });
    assert.ok(Math.abs(box.cx - box.w / 2) < 40 && Math.abs(box.cy - box.h / 2) < 40, 'el aviso está en el centro');
    await p.waitForSelector('#copyPop', { state: 'detached', timeout: 5000 });
  }
  noErrors(p);
});

test('las casillas del cofre semanal no usan el cursor de interrogación', async () => {
  const p = await open();
  const cur = await p.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div class="vault-slot on trkb-myth" id="vs-test"><span class="vs-n">✓</span></div>');
    return getComputedStyle(document.getElementById('vs-test')).cursor;
  });
  assert.equal(cur, 'default');
});


test('pulsar un objeto abre su página de Wowhead en el idioma de la app', async () => {
  const p = await open();
  await p.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<div class="coin-item" id="ci-test" style="position:fixed;top:10px;left:10px;z-index:99999;padding:12px;background:#222" data-item="271520" data-ilvl="321">Objeto</div>'));
  await p.evaluate(() => { window.__links = []; HTMLAnchorElement.prototype.click = function () { window.__links.push(this.href); }; }); // se captura el enlace en vez de abrir una pestaña
  await p.click('#ci-test'); await p.waitForTimeout(200);
  const links = await p.evaluate(() => window.__links);
  assert.equal(links.length, 1);
  assert.match(links[0], /^https:\/\/www\.wowhead\.com\/(es\/)?item=271520/);
  noErrors(p);
});


test('las piezas de tier llevan a Wowhead en el idioma de la web', async () => {
  for (const [lang, re] of [['es', /wowhead\.com\/es\/item=/], ['en', /wowhead\.com\/item=/]]) {
    const p = await open();
    await p.evaluate((l) => { const s = JSON.parse(localStorage.getItem('ninjaloot.settings') || '{}'); s.lang = l; localStorage.setItem('ninjaloot.settings', JSON.stringify(s)); }, lang);
    await p.goto(url + '#/tiers', { waitUntil: 'load' }); await p.reload(); await p.waitForTimeout(1200);
    await p.click('.tier-cls'); await p.waitForSelector('tr[data-item] td.it');
    await p.evaluate(() => { window.__links = []; HTMLAnchorElement.prototype.click = function () { window.__links.push(this.href); }; });
    await p.click('tr[data-item] td.it'); await p.waitForTimeout(200);
    const links = await p.evaluate(() => window.__links);
    assert.equal(links.length, 1);
    assert.match(links[0], re);
  }
});


test('Roster: estado a mano (verde / rojo) sin Discord y rangos de guild con nombres', async () => {
  const p = await open('#/roster');
  await p.waitForSelector('#roName');
  assert.ok(!(await p.$('#roRl')) && !(await p.$('[data-ro="dm"]')), 'ya no hay vinculación con Discord ni envío por DM');
  await p.fill('#roName', 'Okita'); await p.fill('#roRealm', 'Zul-jin'); await p.click('[data-ro="add"]'); await p.waitForSelector('.ro-pill');
  assert.ok(await p.$('.ro-pill.bad'), 'sin sim: sale en rojo (Falta)');
  await p.click('.ro-pill'); await p.waitForSelector('.ro-pill.ok');
  assert.ok(await p.$('.ro-man'), 'marcado a mano');
  await p.click('.ro-pill'); await p.waitForSelector('.ro-pill.bad');
  assert.ok(!(await p.$('.ro-man')), 'al volver a lo automático se quita la marca');
  // rangos con nombre
  await p.click('#roRanksBtn'); await p.waitForSelector('.rk-row');
  assert.equal(await p.$$eval('.rk-row', (e) => e.length), 10);
  await p.click('[data-rk-preset="none"]'); await p.fill('[data-rkname="1"]', 'Raiders'); await p.check('[data-rk="1"]'); await p.check('[data-rk="3"]');
  await p.click('.modal-foot .primary'); await p.waitForTimeout(300);
  const label = await p.$eval('#roRanksBtn', (e) => e.innerText);
  assert.match(label, /Raiders/);
  noErrors(p);
});

await runAll();
