// Monta la versión web de NinjaLoot en _site/ (GitHub Pages) a partir de la misma interfaz que el programa.
// Uso: node tools/build-web.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const out = path.join(root, '_site');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'src'), out, { recursive: true });

// parser.js y bosses.js son módulos de Node (module.exports): se envuelven para el navegador
const wrap = (file, name) => `(function () {\n  var module = { exports: {} }, exports = module.exports;\n${fs.readFileSync(path.join(root, 'src', file), 'utf8')}\n  window.${name} = module.exports;\n})();\n`;
fs.writeFileSync(path.join(out, 'web-libs.js'), `window.NINJALOOT_WEB_VERSION = ${JSON.stringify(pkg.version)};\n` + wrap('parser.js', 'NLParser') + wrap('bosses.js', 'NLBosses'));
for (const f of ['web-api.js', 'privacy.html', 'terms.html']) fs.copyFileSync(path.join(root, 'web', f), path.join(out, f));

// index.html: política de seguridad para el navegador (pide los datos directamente) y la capa web antes que la app
let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const csp = "default-src 'self'; img-src 'self' data: https://wow.zamimg.com; style-src 'self' 'unsafe-inline'; script-src 'self'; "
  + "connect-src 'self' https://www.raidbots.com https://nether.wowhead.com https://wow.zamimg.com https://raider.io https://ninjaloot-relay.vercel.app https://wipetime-proxy.vercel.app";
html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/, `<meta http-equiv="Content-Security-Policy" content="${csp}">`);
if (!html.includes('web-api.js')) html = html.replace('<script src="i18n.js"></script>', '<script src="web-libs.js"></script>\n<script src="web-api.js"></script>\n<script src="i18n.js"></script>');
html = html.replace('<title>NinjaLoot</title>', '<title>NinjaLoot — Web</title>');
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log(`_site listo (v${pkg.version})`);
