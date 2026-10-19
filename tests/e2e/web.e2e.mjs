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
  assert.equal(await hash(p), '#/home');
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

test('pulsar el nombre de Discord o Battle.net copia el nombre', async () => {
  for (const [k, name] of [['discord', 'sr.kitkat'], ['battlenet', 'KitKat#21202']]) {
    const p = await open();
    await p.click('#verBadge'); await p.waitForSelector('.about-friend');
    await p.click(`.about-friend[data-friend="${k}"]`); await p.waitForTimeout(300);
    assert.equal(await p.evaluate(() => navigator.clipboard.readText()), name);
  }
});

test('las casillas del cofre semanal no usan el cursor de interrogación', async () => {
  const p = await open();
  const cur = await p.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div class="vault-slot on trkb-myth" id="vs-test"><span class="vs-n">✓</span></div>');
    return getComputedStyle(document.getElementById('vs-test')).cursor;
  });
  assert.equal(cur, 'default');
});

await runAll();
