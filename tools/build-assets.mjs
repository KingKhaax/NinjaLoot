// Uso: node tools/build-assets.mjs <icons.zip>
// Convierte los iconos TGA de Clean Icons (Mechagnome Edition) a PNG 64x64 y genera src/data/items.js
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const zip = process.argv[2];
if (!zip) { console.error('Falta la ruta del zip de iconos'); process.exit(1); }
const root = path.resolve(import.meta.dirname, '..');
const MIN_EXPANSION = 9; // Dragonflight en adelante
const SIZE = 64;

const items = await (await fetch('https://www.raidbots.com/static/data/live/equippable-items.json')).json();
const wanted = items.filter(i => i.icon && i.quality >= 3 && i.expansion >= MIN_EXPANSION);

// Datos compactos: id -> [nombre, icono, calidad, ilvl, tipoInventario]
const data = {};
for (const i of wanted) data[i.id] = [i.name, i.icon.toLowerCase(), i.quality, i.itemLevel, i.inventoryType];
fs.writeFileSync(path.join(root, 'src/data/items.js'), `'use strict';
// id -> [nombre, icono, calidad, ilvl, tipoInventario] (generado por tools/build-assets.mjs)
const ITEMS = ${JSON.stringify(data)};
`);

const classes = ['DeathKnight', 'DemonHunter', 'Druid', 'Evoker', 'Hunter', 'Mage', 'Monk', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior'];
const listing = execFileSync('unzip', ['-Z1', zip], { maxBuffer: 1 << 28 }).toString().split('\n').filter(Boolean);
const byLower = new Map(listing.map(n => [n.toLowerCase(), n]));

const jobs = []; // { entry, dest }
for (const c of classes) {
  const e = byLower.get(`icons/classicon_${c.toLowerCase()}.tga`);
  if (e) jobs.push({ entry: e, dest: path.join(root, 'src/assets/classes', `${c.toLowerCase()}.png`) });
}
for (const ic of new Set(wanted.map(i => i.icon.toLowerCase()))) {
  const e = byLower.get(`icons/${ic}.tga`);
  if (e) jobs.push({ entry: e, dest: path.join(root, 'src/assets/items', `${ic}.png`) });
}

function decodeTGA(buf) {
  const idLen = buf[0], type = buf[2];
  const w = buf.readUInt16LE(12), h = buf.readUInt16LE(14), bpp = buf[16], desc = buf[17];
  const bytes = bpp >> 3;
  if (![2, 10].includes(type) || ![24, 32].includes(bpp)) throw new Error(`TGA no soportado (tipo ${type}, ${bpp}bpp)`);
  let p = 18 + idLen;
  const px = Buffer.alloc(w * h * 4);
  const put = (i, b, o) => { px[i * 4] = b[o + 2]; px[i * 4 + 1] = b[o + 1]; px[i * 4 + 2] = b[o]; px[i * 4 + 3] = bytes === 4 ? b[o + 3] : 255; };
  if (type === 2) { for (let i = 0; i < w * h; i++, p += bytes) put(i, buf, p); }
  else {
    let i = 0;
    while (i < w * h) {
      const hdr = buf[p++], n = (hdr & 0x7f) + 1;
      if (hdr & 0x80) { for (let k = 0; k < n; k++) put(i++, buf, p); p += bytes; }
      else for (let k = 0; k < n; k++, p += bytes) put(i++, buf, p);
    }
  }
  if (!(desc & 0x20)) { // origen abajo: voltear verticalmente
    const row = w * 4, tmp = Buffer.alloc(row);
    for (let y = 0; y < h >> 1; y++) {
      px.copy(tmp, 0, y * row, (y + 1) * row);
      px.copy(px, y * row, (h - 1 - y) * row, (h - y) * row);
      tmp.copy(px, (h - 1 - y) * row);
    }
  }
  return { w, h, px };
}

function resize({ w, h, px }, size) { // promedio por cajas (con alfa premultiplicado)
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const x0 = Math.floor(x * w / size), x1 = Math.max(x0 + 1, Math.floor((x + 1) * w / size));
    const y0 = Math.floor(y * h / size), y1 = Math.max(y0 + 1, Math.floor((y + 1) * h / size));
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
      const i = (yy * w + xx) * 4, al = px[i + 3];
      r += px[i] * al; g += px[i + 1] * al; b += px[i + 2] * al; a += al; n++;
    }
    const o = (y * size + x) * 4;
    if (a) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a; }
    out[o + 3] = a / n;
  }
  return out;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ninjaloot-icons-'));
let done = 0, failed = 0;
for (let i = 0; i < jobs.length; i += 250) {
  const batch = jobs.slice(i, i + 250);
  execFileSync('unzip', ['-q', '-o', zip, '-d', tmp, ...batch.map(j => j.entry.replace(/([\[\]*?])/g, '\$1'))], { stdio: 'ignore' });
  for (const j of batch) {
    try {
      const img = decodeTGA(fs.readFileSync(path.join(tmp, j.entry)));
      const png = new PNG({ width: SIZE, height: SIZE });
      resize(img, SIZE).copy(png.data);
      fs.writeFileSync(j.dest, PNG.sync.write(png, { colorType: 6 }));
      done++;
    } catch (e) { failed++; console.warn(j.entry, e.message); }
  }
  fs.rmSync(path.join(tmp, 'ICONS'), { recursive: true, force: true });
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Iconos convertidos: ${done}, fallidos: ${failed}, objetos: ${Object.keys(data).length}`);
