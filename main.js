'use strict';
const { app, BrowserWindow, ipcMain, shell, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { parseReport } = require('./src/parser');

const APP_VERSION = require('./package.json').version;
const userData = () => app.getPath('userData');
const readJSON = (f, def) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return def; } };
const UA = { 'User-Agent': `NinjaLoot/${APP_VERSION}` };

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 820, minHeight: 560,
    title: 'NinjaLoot', backgroundColor: '#130c1f', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build/icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'src/index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', e => e.preventDefault());
}

// --- Informes de Raidbots ---
ipcMain.handle('report:fetch', async (_e, id) => {
  if (!/^[A-Za-z0-9]+$/.test(id)) return { ok: false, error: 'BAD_URL' };
  try {
    const res = await net.fetch(`https://www.raidbots.com/simbot/report/${id}/data.json`, { headers: UA });
    if (res.status === 404) return { ok: false, error: 'NOT_FOUND' };
    if (!res.ok) return { ok: false, error: 'HTTP', detail: res.status };
    return { ok: true, report: parseReport(await res.json(), id) };
  } catch (e) {
    if (['NO_SIM', 'NOT_DROPTIMIZER', 'NO_UPGRADES'].includes(e.message)) return { ok: false, error: e.message };
    return { ok: false, error: 'NETWORK', detail: String(e.message || e) };
  }
});

// --- Nombres de objetos localizados (Wowhead) con caché en disco ---
const WH_LOCALE = { en: 0, es: 6 };
let itemCache = null;
let itemCacheDirty = false;
const itemCacheFile = () => path.join(userData(), 'item-cache.json');
async function lookupItem(id, lang) {
  itemCache ??= readJSON(itemCacheFile(), {});
  const key = `${lang}:${id}`;
  if (itemCache[key]) return itemCache[key];
  try {
    const res = await net.fetch(`https://nether.wowhead.com/tooltip/item/${id}?dataEnv=1&locale=${WH_LOCALE[lang] ?? 0}`, { headers: UA });
    if (!res.ok) return null;
    const j = await res.json();
    if (!j.name) return null;
    itemCache[key] = [j.name, String(j.icon || '').toLowerCase(), j.quality || 0];
    itemCacheDirty = true;
    return itemCache[key];
  } catch { return null; }
}
ipcMain.handle('items:lookup', async (_e, ids, lang) => {
  const out = {};
  const queue = [...new Set(ids)].filter(n => Number.isInteger(n));
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) { const id = queue.shift(); const r = await lookupItem(id, lang); if (r) out[id] = r; }
  }));
  if (itemCacheDirty) { itemCacheDirty = false; try { fs.writeFileSync(itemCacheFile(), JSON.stringify(itemCache)); } catch {} }
  return out;
});

// --- Iconos como data URL (para exportar el gráfico a PNG sin "tainted canvas") ---
ipcMain.handle('icon:data', async (_e, href) => {
  try {
    const m = String(href).match(/^(?:\.\/)?assets\/(items|classes)\/([\w.\-]+)\.png$/);
    if (m) return `data:image/png;base64,${fs.readFileSync(path.join(__dirname, 'src/assets', m[1], `${m[2]}.png`)).toString('base64')}`;
    const r = String(href).match(/^https:\/\/wow\.zamimg\.com\/images\/wow\/icons\/\w+\/([\w.\-]+)\.jpg$/);
    if (!r) return null;
    const res = await net.fetch(href, { headers: UA });
    if (!res.ok) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch { return null; }
});

// --- Actualizaciones desde GitHub ---
const REPO = 'KingKhaax/NinjaLoot';
const ghJson = async url => {
  const res = await net.fetch(url, { headers: { ...UA, Accept: 'application/vnd.github+json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
ipcMain.handle('update:check', async () => {
  try {
    const [rel, pkg] = await Promise.all([
      ghJson(`https://api.github.com/repos/${REPO}/releases/latest`),
      ghJson(`https://raw.githubusercontent.com/${REPO}/main/package.json`),
    ]);
    const asset = rel && (rel.assets || []).find(a => /Setup\.exe$/i.test(a.name));
    return {
      ok: true, current: APP_VERSION, main: (pkg && pkg.version) || null,
      release: rel ? { version: String(rel.tag_name || '').replace(/^v/i, ''), url: rel.html_url, asset: asset ? asset.browser_download_url : null } : null,
    };
  } catch (e) { return { ok: false, error: String(e.message || e) }; }
});
ipcMain.handle('update:install', async (_e, url) => {
  try {
    if (!String(url).startsWith(`https://github.com/${REPO}/releases/download/`)) return { ok: false };
    const res = await net.fetch(url, { headers: UA });
    if (!res.ok) return { ok: false };
    const file = path.join(require('os').tmpdir(), 'NinjaLoot-Setup.exe');
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    await shell.openPath(file);
    setTimeout(() => app.quit(), 800);
    return { ok: true };
  } catch { return { ok: false }; }
});

ipcMain.handle('app:info', () => ({ version: APP_VERSION, electron: process.versions.electron }));
ipcMain.handle('app:open', (_e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
