'use strict';
// Versión web de NinjaLoot: imita en el navegador lo que en el programa hace el proceso principal (main.js + preload.js).
// Raidbots, Wowhead, zamimg y Raider.IO permiten peticiones desde webs (CORS), así que todo se pide directamente.
(() => {
  const VERSION = window.NINJALOOT_WEB_VERSION || '';
  const WH_LOCALE = { en: 0, fr: 2, de: 3, es: 6 };
  const RIO_SLOT = { mainhand: 'main_hand', offhand: 'off_hand', shoulders: 'shoulder', wrists: 'wrist' };
  const RELAY = 'https://ninjaloot-relay.vercel.app/api/discord';
  const { parseReport, parseLootHistory } = window.NLParser;
  const { computeBosses } = window.NLBosses;
  const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const getJSON = async url => { const r = await fetch(url); if (!r.ok) throw Object.assign(new Error(`HTTP_${r.status}`), { status: r.status }); return r.json(); };

  // --- Informes de Raidbots ---
  async function fetchReport(id) {
    if (!/^[A-Za-z0-9]+$/.test(id)) return { ok: false, error: 'BAD_URL' };
    try {
      return { ok: true, report: parseReport(await getJSON(`https://www.raidbots.com/reports/${id}/data.json`), id) };
    } catch (e) {
      if (e.status === 404) return { ok: false, error: 'NOT_FOUND' };
      if (e.status) return { ok: false, error: 'HTTP', detail: e.status };
      if (['NO_SIM', 'NOT_DROPTIMIZER', 'NO_UPGRADES'].includes(e.message)) return { ok: false, error: e.message };
      return { ok: false, error: 'NETWORK', detail: String(e.message || e) };
    }
  }

  // --- Nombres de objetos (Wowhead) con caché en el navegador ---
  const itemCache = load('ninjaloot.web.items', {});
  async function lookupItem(id, lang) {
    const key = `${lang}:${id}`;
    if (itemCache[key]) return itemCache[key];
    try {
      const j = await getJSON(`https://nether.wowhead.com/tooltip/item/${id}?dataEnv=1&locale=${WH_LOCALE[lang] ?? 0}`);
      if (!j.name) return null;
      return (itemCache[key] = [j.name, String(j.icon || '').toLowerCase(), j.quality || 0]);
    } catch { return null; }
  }
  async function lookupItems(ids, lang) {
    const out = {}, queue = [...new Set(ids)].filter(n => Number.isInteger(n));
    await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) { const id = queue.shift(); const r = await lookupItem(id, lang); if (r) out[id] = r; } }));
    save('ninjaloot.web.items', itemCache);
    return out;
  }
  const tipCache = new Map();
  async function itemTooltip(id, ilvl, lang) {
    id = Number(id); ilvl = Number(ilvl) || 0;
    if (!Number.isInteger(id) || id <= 0) return { ok: false };
    const key = `${lang}:${id}:${ilvl}`;
    if (tipCache.has(key)) return tipCache.get(key);
    try {
      const j = await getJSON(`https://nether.wowhead.com/tooltip/item/${id}?dataEnv=1&locale=${WH_LOCALE[lang] ?? 0}${ilvl ? `&ilvl=${ilvl}` : ''}`);
      if (!j.tooltip) return { ok: false };
      const r = { ok: true, html: j.tooltip };
      tipCache.set(key, r);
      return r;
    } catch { return { ok: false }; }
  }

  // --- Iconos como data URL (para exportar gráficas a PNG) ---
  async function iconData(href) {
    try {
      if (!/^(?:\.\/)?assets\/(items|classes)\/[\w.\-]+\.png$/.test(href) && !/^https:\/\/wow\.zamimg\.com\/images\/wow\/icons\/\w+\/[\w.\-]+\.jpg$/.test(href)) return null;
      const r = await fetch(href);
      if (!r.ok) return null;
      const blob = await r.blob();
      return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(blob); });
    } catch { return null; }
  }

  // --- Equipo actual (Raider.IO) ---
  async function fetchGear(region, realm, name) {
    if (![region, realm, name].every(v => typeof v === 'string' && v && v.length < 64)) return { ok: false, error: 'BAD_CHAR' };
    try {
      const j = await getJSON(`https://raider.io/api/v1/characters/profile?${new URLSearchParams({ region, realm, name, fields: 'gear' })}`);
      const items = {};
      for (const [k, v] of Object.entries((j.gear && j.gear.items) || {})) if (v && v.item_id) items[RIO_SLOT[k] || k] = { id: v.item_id, ilvl: v.item_level || 0 };
      return { ok: true, items, crawled: j.last_crawled_at ? Date.parse(j.last_crawled_at) : null, fetched: Date.now() };
    } catch (e) {
      if (e.status === 400 || e.status === 404) return { ok: false, error: 'NOT_FOUND' };
      return e.status ? { ok: false, error: 'HTTP', detail: e.status } : { ok: false, error: 'NETWORK', detail: String(e.message || e) };
    }
  }

  // --- Jefes de la temporada activa (Raidbots) ---
  async function getBosses() {
    try {
      const base = 'https://www.raidbots.com/static/data/live/';
      const [ins, seas] = await Promise.all(['instances', 'seasons'].map(n => getJSON(base + n + '.json')));
      const data = computeBosses(ins, seas);
      if (!data) throw new Error('season');
      save('ninjaloot.web.bosses', data);
      return { ok: true, data };
    } catch {
      const c = load('ninjaloot.web.bosses', null);
      return c ? { ok: true, data: c, cached: true } : { ok: false };
    }
  }

  // --- Retrato 3D del personaje (Blizzard vía el servidor de WipeHub) ---
  async function fetchPortrait(region, realm, name) {
    if (![region, realm, name].every(v => typeof v === 'string' && v && v.length < 64)) return { ok: false };
    const slug = String(realm).toLowerCase().replace(/['’]/g, '').replace(/\s+/g, '-');
    const path = `/profile/wow/character/${slug}/${encodeURIComponent(name.toLowerCase())}/character-media?namespace=profile-${region}&locale=en_US`;
    try {
      const j = await getJSON(`https://wipehub-proxy.vercel.app/bnet?region=${region}&path=${encodeURIComponent(path)}`);
      const a = Object.fromEntries((j.assets || []).map(x => [x.key, x.value])), url = a.inset || a['main-raw'] || a.main || a.avatar;
      return url && /^https:\/\/render\.worldofwarcraft\.com\//.test(url) ? { ok: true, url } : { ok: false };
    } catch { return { ok: false }; }
  }

  // --- Cofre semanal: míticas+ de la semana (Raider.IO) y jefes de banda desde el reinicio (Blizzard vía el servidor de WipeHub) ---
  async function fetchVault(region, realm, name) {
    if (![region, realm, name].every(v => typeof v === 'string' && v && v.length < 64)) return { ok: false, error: 'BAD_CHAR' };
    const reset = weeklyReset(region), out = { ok: true, reset, runs: null, raid: null, fetched: Date.now() }, RANK = { LFR: 1, NORMAL: 2, HEROIC: 3, MYTHIC: 4 };
    const rio = getJSON(`https://raider.io/api/v1/characters/profile?${new URLSearchParams({ region, realm, name, fields: 'mythic_plus_weekly_highest_level_runs' })}`).then(j => {
      out.runs = (j.mythic_plus_weekly_highest_level_runs || []).filter(r => Date.parse(r.completed_at) >= reset).map(r => ({ level: r.mythic_level, dungeon: r.dungeon })).sort((a, b) => b.level - a.level);
    }).catch(() => {});
    const slug = String(realm).toLowerCase().replace(/['’]/g, '').replace(/\s+/g, '-');
    const path = `/profile/wow/character/${slug}/${encodeURIComponent(name.toLowerCase())}/encounters/raids?namespace=profile-${region}&locale=en_US`;
    const bnet = getJSON(`https://wipehub-proxy.vercel.app/bnet?region=${region}&path=${encodeURIComponent(path)}`).then(j => {
      const best = new Map(), ex = (j.expansions || []).find(e => /current season/i.test(e.expansion?.name || '')) || (j.expansions || []).at(-1);
      for (const inst of ex?.instances || []) for (const m of inst.modes || []) for (const e of m.progress?.encounters || []) {
        const d = RANK[m.difficulty?.type] || 0;
        if (e.last_kill_timestamp >= reset && d > (best.get(e.encounter.id)?.diff || 0)) best.set(e.encounter.id, { id: e.encounter.id, name: e.encounter.name, diff: d });
      }
      out.raid = [...best.values()].sort((a, b) => b.diff - a.diff);
    }).catch(() => {});
    await Promise.all([rio, bnet]);
    return out.runs || out.raid ? out : { ok: false, error: 'NOT_FOUND' };
  }

  // --- Discord (NinjaBot, mismo servidor intermedio que el programa) ---
  const dcListeners = { sims: [], status: [] };
  let dc = load('ninjaloot.web.discord', { enabled: false, channelId: '', channelName: '', lastId: '', region: 'eu', windowDays: 0 }), dcTimer = null, dcStatus = { state: 'off' };
  const dcSince = () => (dc.windowDays ? Date.now() - dc.windowDays * 864e5 : weeklyReset(dc.region));
  // Último reinicio semanal de WoW: miércoles 04:00 UTC en Europa, martes 15:00 UTC en América
  function weeklyReset(region) {
    const now = new Date(), [day, hour] = region === 'us' ? [2, 15] : [3, 4];
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour));
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - day + 7) % 7));
    if (d > now) d.setUTCDate(d.getUTCDate() - 7);
    return d.getTime();
  }
  const dcEmit = st => { dcStatus = st; dcListeners.status.forEach(f => f(st)); };
  async function relay(query, init) {
    const r = await fetch(`${RELAY}?${query}`, init), j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'NETWORK'), { code: j.error || 'NETWORK', retry: j.retry });
    return j;
  }
  async function dcTick() {
    dcTimer = null;
    if (!dc.enabled || !dc.channelId) return dcEmit({ state: 'off' });
    let wait = 6000;
    try {
      if (!dc.lastId) { const r = await relay(`op=history&channel=${dc.channelId}&since=${dcSince()}`); dc.channelName = r.channel || dc.channelId; dc.lastId = r.lastId || '0'; save('ninjaloot.web.discord', dc); if (r.sims && r.sims.length) dcListeners.sims.forEach(f => f(r.sims)); dcEmit({ state: 'ok', channel: dc.channelName }); }
      else {
        const r = await relay(`channel=${dc.channelId}&after=${dc.lastId}`);
        if (r.lastId && r.lastId !== dc.lastId) { dc.lastId = r.lastId; save('ninjaloot.web.discord', dc); }
        const list = r.sims || r.ids || [];
        if (list.length) dcListeners.sims.forEach(f => f(list));
        dcEmit({ state: 'ok', channel: dc.channelName, warn: r.empty ? 'INTENT' : '' });
      }
    } catch (e) { if (e.code === 'RATE') wait = e.retry || 15000; else { dcEmit({ state: 'error', error: e.code }); wait = 20000; } }
    dcTimer = setTimeout(dcTick, wait);
  }
  const dcRestart = () => { if (dcTimer) clearTimeout(dcTimer); dcTimer = null; dcTick(); };
  setTimeout(dcTick, 3000);

  // Versión nueva de la web: version.json (se publica con cada versión) frente a la que está cargada.
  // Si es más nueva sale un aviso con «Recargar», que borra la caché de la web y la vuelve a cargar entera.
  const semver = (v) => String(v || '').replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const isNewer = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  async function fetchLatest() {
    try { const r = await fetch('version.json?_=' + Date.now(), { cache: 'no-store' }); return r.ok ? String((await r.json()).version || '') : ''; } catch { return ''; }
  }
  async function hardReload() {
    try { if (window.caches) for (const k of await caches.keys()) if (k.startsWith('nl-')) await caches.delete(k); } catch { /* sin caché */ }
    try { if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch { /* sin service worker */ }
    location.reload();
  }
  function showNewVersion(latest) {
    if (document.getElementById('newVer')) return;
    const es = (document.documentElement.lang || navigator.language || 'es').slice(0, 2) !== 'en';
    const bar = document.createElement('div');
    bar.id = 'newVer'; bar.className = 'newver'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<span></span><button type="button" class="btn primary small" data-nv="go"></button><button type="button" class="btn ghost small" data-nv="x" aria-label="×">×</button>';
    bar.firstChild.textContent = es ? 'Hay una versión nueva de NinjaLoot (v' + latest + ').' : 'There is a new version of NinjaLoot (v' + latest + ').';
    bar.querySelector('[data-nv="go"]').textContent = es ? 'Recargar' : 'Reload';
    bar.addEventListener('click', (ev) => { const b = ev.target.closest('[data-nv]'); if (!b) return; if (b.dataset.nv === 'go') hardReload(); else bar.remove(); });
    document.body.appendChild(bar);
  }
  async function checkNewVersion() {
    const latest = await fetchLatest();
    if (latest && VERSION && isNewer(latest, VERSION)) showNewVersion(latest);
  }
  setTimeout(checkNewVersion, 4000);
  setInterval(checkNewVersion, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkNewVersion(); });

  // Service worker: caché de lo estático para que las visitas siguientes carguen al instante (solo con https)
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { /* sin service worker: la web funciona igual */ });

  window.api = {
    fetchReport, fetchPortrait, parseLoot: async text => { try { return { ok: true, rows: parseLootHistory(String(text || '').slice(0, 5e6)) }; } catch (e) { return { ok: false, error: String(e.message || e) }; } }, lookupItems, iconData, itemTooltip, getBosses, fetchGear, fetchVault,
    // En la web siempre se usa la última versión publicada: no hay nada que actualizar
    checkUpdate: async () => ({ ok: true, current: VERSION, main: VERSION, release: { version: VERSION, url: 'https://github.com/KingKhaax/NinjaLoot/releases/latest', asset: null }, web: true }),
    installUpdate: async () => ({ ok: false }),
    onUpdateProgress: () => {},
    discordGet: async () => ({ enabled: dc.enabled, channelId: dc.channelId, channelName: dc.channelName, region: dc.region || 'eu', windowDays: dc.windowDays || 0, reset: dcSince(), status: dcStatus }),
    rosterGuild: async (region, realm, name) => {
      if (![region, realm, name].every(v => typeof v === 'string' && v && v.length < 64)) return { ok: false, error: 'BAD_CHAR' };
      try {
        const j = await getJSON(`https://raider.io/api/v1/guilds/profile?${new URLSearchParams({ region, realm, name, fields: 'members' })}`);
        return { ok: true, guild: j.name, realm: j.realm, members: (j.members || []).map(m => ({ rank: m.rank, name: m.character && m.character.name, realm: m.character && m.character.realm, cls: m.character && m.character.class, spec: m.character && m.character.active_spec_name })).filter(m => m.name) };
      } catch (e) { return e.status === 400 || e.status === 404 ? { ok: false, error: 'NOT_FOUND' } : { ok: false, error: 'NETWORK', detail: String(e.message || e) }; }
    },
    discordSet: async (o = {}) => {
      if (o.channelId !== undefined) { const id = (String(o.channelId).trim().match(/(\d{15,25})\/?$/) || [])[1] || ''; if (id !== dc.channelId) { dc.lastId = ''; dc.channelName = ''; } dc.channelId = id; }
      if (o.enabled !== undefined) { if (o.enabled && !dc.enabled) dc.lastId = ''; dc.enabled = !!o.enabled; }
      if (o.region !== undefined) dc.region = o.region === 'us' ? 'us' : 'eu';
      if (o.windowDays !== undefined) { const d = Math.min(6, Math.max(0, Math.floor(Number(o.windowDays) || 0))); if (d !== (dc.windowDays || 0)) dc.lastId = ''; dc.windowDays = d; }
      save('ninjaloot.web.discord', dc); dcRestart();
      return { ok: true, channelId: dc.channelId };
    },
    discordInvite: async () => { try { const r = await relay('op=info'); return r.clientId ? `https://discord.com/oauth2/authorize?client_id=${r.clientId}&scope=bot&permissions=66560` : null; } catch { return null; } },
    onDiscordSims: cb => dcListeners.sims.push(cb),
    onDiscordStatus: cb => dcListeners.status.push(cb),
    setZoom: f => { document.documentElement.style.zoom = String(Math.min(1.6, Math.max(0.7, Number(f) || 1))); },
    appInfo: async () => ({ version: VERSION, electron: null, web: true }),
    // Un enlace real con target=_blank dentro del clic: lo abren todos los navegadores (window.open con noopener lo bloquean algunos)
    openExternal: url => { if (!/^https:\/\//.test(url)) return; const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove(); },
  };
})();
