'use strict';
const { app, BrowserWindow, ipcMain, shell, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { parseReport } = require('./src/parser');
const { computeBosses } = require('./src/bosses');

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
const WH_LOCALE = { en: 0, fr: 2, de: 3, es: 6 };
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

// --- Tooltip de objeto (Wowhead) con el nivel de objeto simulado ---
const tipCache = new Map();
ipcMain.handle('items:tooltip', async (_e, id, ilvl, lang) => {
  id = Number(id); ilvl = Number(ilvl) || 0;
  if (!Number.isInteger(id) || id <= 0) return { ok: false };
  const key = `${lang}:${id}:${ilvl}`;
  if (tipCache.has(key)) return tipCache.get(key);
  try {
    const res = await net.fetch(`https://nether.wowhead.com/tooltip/item/${id}?dataEnv=1&locale=${WH_LOCALE[lang] ?? 0}${ilvl ? `&ilvl=${ilvl}` : ''}`, { headers: UA });
    if (!res.ok) return { ok: false };
    const j = await res.json();
    if (!j.tooltip) return { ok: false };
    const r = { ok: true, html: j.tooltip };
    tipCache.set(key, r);
    return r;
  } catch { return { ok: false }; }
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

// --- Jefes de la temporada activa (Raidbots), con caché por si no hay conexión ---
// --- Equipo actual del personaje (Raider.IO), para detectar mejoras que ya lleva y sims caducadas ---
const RIO_SLOT = { mainhand: 'main_hand', offhand: 'off_hand', shoulders: 'shoulder', wrists: 'wrist' };
ipcMain.handle('gear:fetch', async (_e, region, realm, name) => {
  if (![region, realm, name].every(v => typeof v === 'string' && v && v.length < 64)) return { ok: false, error: 'BAD_CHAR' };
  try {
    const q = new URLSearchParams({ region, realm, name, fields: 'gear' });
    const res = await net.fetch(`https://raider.io/api/v1/characters/profile?${q}`, { headers: UA });
    if (res.status === 400 || res.status === 404) return { ok: false, error: 'NOT_FOUND' };
    if (!res.ok) return { ok: false, error: 'HTTP', detail: res.status };
    const j = await res.json(), items = {};
    for (const [k, v] of Object.entries((j.gear && j.gear.items) || {})) if (v && v.item_id) items[RIO_SLOT[k] || k] = { id: v.item_id, ilvl: v.item_level || 0 };
    return { ok: true, items, crawled: j.last_crawled_at ? Date.parse(j.last_crawled_at) : null, fetched: Date.now() };
  } catch (e) { return { ok: false, error: 'NETWORK', detail: String(e.message || e) }; }
});

ipcMain.handle('bosses:get', async () => {
  const cacheFile = path.join(userData(), 'bosses-cache.json');
  try {
    const base = 'https://www.raidbots.com/static/data/live/';
    const [ins, seas] = await Promise.all(['instances', 'seasons'].map(async n => {
      const r = await net.fetch(base + n + '.json', { headers: UA });
      if (!r.ok) throw new Error(n);
      return r.json();
    }));
    const data = computeBosses(ins, seas);
    if (!data) throw new Error('season');
    try { fs.writeFileSync(cacheFile, JSON.stringify(data)); } catch {}
    return { ok: true, data };
  } catch {
    const c = readJSON(cacheFile, null);
    return c ? { ok: true, data: c, cached: true } : { ok: false };
  }
});

// --- Actualizaciones desde GitHub ---
const REPO = 'KingKhaax/NinjaLoot';
const ghJson = async url => {
  const res = await net.fetch(url, { headers: { ...UA, Accept: 'application/vnd.github+json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
// Última versión: primero latest.yml de la release (descarga normal de github.com, sin el límite de 60 consultas/hora
// de la API de GitHub) y, si no existe, la API. El resultado se guarda 5 minutos para no repetir consultas.
async function latestFromYml() {
  const res = await net.fetch(`https://github.com/${REPO}/releases/latest/download/latest.yml`, { headers: UA });
  if (!res.ok) return null;
  const yml = await res.text(), v = (yml.match(/^version:\s*['"]?([\d.]+)/m) || [])[1], file = (yml.match(/^path:\s*['"]?([^'"\r\n]+)/m) || [])[1];
  if (!v) return null;
  return { version: v, url: `https://github.com/${REPO}/releases/tag/v${v}`, asset: file ? `https://github.com/${REPO}/releases/download/v${v}/${encodeURIComponent(file)}` : null };
}
async function latestFromApi() {
  const rel = await ghJson(`https://api.github.com/repos/${REPO}/releases/latest`);
  if (!rel) return null;
  const asset = (rel.assets || []).find(a => /Setup\.exe$/i.test(a.name));
  return { version: String(rel.tag_name || '').replace(/^v/i, ''), url: rel.html_url, asset: asset ? asset.browser_download_url : null };
}
let updCache = null;
ipcMain.handle('update:check', async () => {
  if (updCache && Date.now() - updCache.at < 5 * 60 * 1000) return updCache.r;
  try {
    const [release, pkg] = await Promise.all([
      latestFromYml().catch(() => null).then(r => r || latestFromApi()),
      ghJson(`https://raw.githubusercontent.com/${REPO}/main/package.json`).catch(() => null),
    ]);
    const r = { ok: true, current: APP_VERSION, main: (pkg && pkg.version) || null, release };
    updCache = { at: Date.now(), r };
    return r;
  } catch (e) { return { ok: false, error: String(e.message || e) }; }
});
// Instalado con el Setup: electron-updater descarga solo las partes que han cambiado (latest.yml + .blockmap de la release),
// instala en silencio y vuelve a abrir el programa. Devuelve false si no se puede (portable, release sin latest.yml...).
async function quickUpdate(sender) {
  if (!app.isPackaged || process.env.PORTABLE_EXECUTABLE_FILE) return false;
  const { autoUpdater } = require('electron-updater');
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  const onProgress = p => { if (!sender.isDestroyed()) sender.send('update:progress', p.percent / 100); };
  autoUpdater.on('download-progress', onProgress);
  try {
    const r = await autoUpdater.checkForUpdates();
    if (!r || !r.isUpdateAvailable) return false;
    await autoUpdater.downloadUpdate();
    setImmediate(() => autoUpdater.quitAndInstall(true, true));
    return true;
  } catch (e) {
    console.warn('electron-updater', e);
    return false;
  } finally {
    autoUpdater.removeListener('download-progress', onProgress);
  }
}

ipcMain.handle('update:install', async (e, url) => {
  try {
    if (await quickUpdate(e.sender)) return { ok: true };
    if (!String(url).startsWith(`https://github.com/${REPO}/releases/download/`)) return { ok: false };
    const res = await net.fetch(url, { headers: UA });
    if (!res.ok) return { ok: false };
    const file = path.join(require('os').tmpdir(), 'NinjaLoot-Setup.exe');
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    if (process.env.PORTABLE_EXECUTABLE_FILE) {
      await shell.openPath(file); // portable: instalador normal, que elija dónde
      setTimeout(() => app.quit(), 800);
    } else {
      // Instalación silenciosa y reapertura automática (los mismos argumentos que usa electron-updater)
      require('child_process').spawn(file, ['/S', '--updated', '--force-run'], { detached: true, stdio: 'ignore' }).unref();
      setTimeout(() => app.quit(), 400);
    }
    return { ok: true };
  } catch { return { ok: false }; }
});

ipcMain.handle('app:info', () => ({ version: APP_VERSION, electron: process.versions.electron }));
ipcMain.handle('app:open', (_e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); });

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
