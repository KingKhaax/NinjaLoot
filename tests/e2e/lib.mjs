// Utilidades de las pruebas de navegador: sirve la web compilada (web-dist) y abre páginas SIN red externa,
// así las pruebas no dependen de Warcraft Logs ni de ningún servidor y no fallan por culpa de terceros.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

export function serve(dirUrlOrPath) {
  const dir = path.resolve(dirUrlOrPath instanceof URL ? fileURLToPath(dirUrlOrPath) : dirUrlOrPath);
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(dir, p);
      if (!path.resolve(f).startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

export const launch = () => chromium.launch({ executablePath: process.env.E2E_BROWSER || undefined, headless: true });

// Página sin red externa: todo lo que no sea el servidor local se corta (las llamadas a la red fallan como si no hubiera conexión)
export const contexts = [];
export async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'], ...opts });
  contexts.push(ctx);
  const page = await ctx.newPage();
  page.errors = [];
  await page.addInitScript(() => { window.__noScheme = true; }); // las pruebas no lanzan discord:// ni battlenet://
  page.on('pageerror', (e) => page.errors.push(e.message));
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, (r) => r.abort().catch(() => {})); // si la página se cierra con peticiones en vuelo, no es un error
  return page;
}

// Mini ejecutor: las pruebas se hacen una tras otra y al final se sale con process.exit (0 = todo bien, 1 = alguna falló).
// (node:test daba un error suelto de «página cerrada» al terminar, aunque todas pasaran.)
const queue = [];
export const test = Object.assign((name, fn) => queue.push([name, fn]), { afterEach: (fn) => { test._ae = fn; }, after: (fn) => { test._after = fn; } });
export async function runAll() {
  let bad = 0;
  for (const [name, fn] of queue) {
    const t0 = Date.now();
    try { await fn(); console.log('✔ ' + name + ' (' + (Date.now() - t0) + ' ms)'); }
    catch (e) { bad++; console.log('✖ ' + name + '\n   ' + String((e && e.stack) || e).split('\n').slice(0, 6).join('\n   ')); }
    try { await test._ae?.(); } catch { /* nada */ }
  }
  try { await test._after?.(); } catch { /* nada */ }
  console.log(bad ? '\n' + bad + ' prueba(s) fallaron de ' + queue.length : '\nTodas las pruebas pasan (' + queue.length + ')');
  process.exit(bad ? 1 : 0);
}
