// Monta la versión web de NinjaLoot en _site/ (GitHub Pages) a partir de la misma interfaz que el programa.
// Uso: node tools/build-web.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const out = path.join(root, '_site');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// esbuild se instala aparte en CI (carpeta .esb) para no descargar todo el árbol de dependencias de la app
function loadEsbuild() {
  for (const base of [root, path.join(root, '.esb')]) {
    try { return createRequire(path.join(base, 'noop.js'))('esbuild'); } catch { /* siguiente sitio */ }
  }
  return null;
}

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'src'), out, { recursive: true });

// parser.js y bosses.js son módulos de Node (module.exports): se envuelven para el navegador
const wrap = (file, name) => `(function () {\n  var module = { exports: {} }, exports = module.exports;\n${fs.readFileSync(path.join(root, 'src', file), 'utf8')}\n  window.${name} = module.exports;\n})();\n`;
fs.writeFileSync(path.join(out, 'web-libs.js'), `window.NINJALOOT_WEB_VERSION = ${JSON.stringify(pkg.version)};\n` + wrap('parser.js', 'NLParser') + wrap('bosses.js', 'NLBosses'));
for (const f of ['web-api.js', 'privacy.html', 'terms.html']) fs.copyFileSync(path.join(root, 'web', f), path.join(out, f));

// index.html: política de seguridad para el navegador (pide los datos directamente) y la capa web antes que la app
let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
const csp = "default-src 'self'; img-src 'self' data: https://wow.zamimg.com https://assets.rpglogs.com; style-src 'self' 'unsafe-inline'; script-src 'self'; "
  + "connect-src 'self' https://www.raidbots.com https://nether.wowhead.com https://wow.zamimg.com https://raider.io https://ninjaloot-relay.vercel.app https://wipetime-proxy.vercel.app";
html = html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/, `<meta http-equiv="Content-Security-Policy" content="${csp}">`);
if (!html.includes('web-api.js')) html = html.replace('<script src="i18n.js"></script>', '<script src="web-libs.js"></script>\n<script src="web-api.js"></script>\n<script src="i18n.js"></script>');
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
fs.writeFileSync(path.join(out, 'sw.js'), fs.readFileSync(path.join(root, 'web', 'sw.js'), 'utf8').replaceAll('__VERSION__', pkg.version));

// ---- Optimización de la carga: un solo paquete de scripts minificado, un solo CSS minificado, datos grandes como JSON y conexiones tempranas.
// Sin esbuild instalado la web se publica igual, solo que sin minificar (npm i --no-save esbuild).
const esbuild = loadEsbuild();
if (!esbuild) console.log('esbuild no está instalado: la web se publica sin minificar');
if (esbuild) {
  const v = pkg.version;
  html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  if (!files.length) throw new Error('No hay scripts que empaquetar');
  // Los datos grandes (const X = {...}) se leen mucho más rápido con JSON.parse que como código JavaScript
  const asJson = (src) => {
    const m = /^([\s\S]*?)const ([A-Z_]+) = (\{[\s\S]*\});?\s*$/.exec(src);
    if (!m || src.length < 20000) return src;
    try {
      const obj = new Function('return (' + m[3] + ')')();
      const json = JSON.stringify(obj);
      if (JSON.stringify(JSON.parse(json)) !== json) return src;
      return m[1] + 'const ' + m[2] + ' = JSON.parse(' + JSON.stringify(json) + ');\n';
    } catch { return src; }
  };
  // parser.js/bosses.js ya vienen envueltos en web-libs.js; el resto comparte el ámbito global igual que antes
  const sources = files.map((f) => asJson(fs.readFileSync(path.join(out, f), 'utf8')).replace(/^\s*(['"])use strict\1;?/, ''));
  const bundle = esbuild.transformSync("'use strict';\n" + sources.join(';\n'), { minify: true, target: 'es2020', legalComments: 'none' }).code;
  fs.writeFileSync(path.join(out, 'app.bundle.js'), bundle);
  const cssFiles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
  const css = cssFiles.map((f) => fs.readFileSync(path.join(out, f), 'utf8')).join('\n');
  fs.writeFileSync(path.join(out, 'app.css'), esbuild.transformSync(css, { loader: 'css', minify: true, legalComments: 'none' }).code);
  for (const f of files) html = html.replace(new RegExp('\\s*<script src="' + f.replace(/[.\/]/g, '\\$&') + '"></script>'), '');
  cssFiles.forEach((f, i) => { html = html.replace('<link rel="stylesheet" href="' + f + '">', i === 0 ? '<link rel="stylesheet" href="app.css?v=' + v + '">' : ''); });
  const hints = ['<link rel="preconnect" href="https://www.raidbots.com" crossorigin>', '<link rel="preconnect" href="https://wow.zamimg.com" crossorigin>',
    ...['400', '600', '700'].map((w) => '<link rel="preload" href="fonts/noto-sans-latin-' + w + '-normal.woff2" as="font" type="font/woff2" crossorigin>')].join('\n');
  html = html.replace('</head>', hints + '\n<script defer src="app.bundle.js?v=' + v + '"></script>\n</head>');
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`optimizada: ${files.length} scripts → app.bundle.js (${(bundle.length / 1024).toFixed(0)} KB), ${cssFiles.length} CSS → app.css`);
}
console.log(`_site listo (v${pkg.version})`);
