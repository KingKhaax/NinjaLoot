'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = "'Noto Sans', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif";
  const WEB_ICON = n => `https://wow.zamimg.com/images/wow/icons/large/${n}.jpg`;
  const DISCORD_INVITE = 'https://discord.com/oauth2/authorize?client_id=1558852544527081596&scope=bot&permissions=66560';
  const IS_VERCEL = /(^|\.)vercel\.app$/i.test(location.hostname);
  const ui = (n, c = '') => `<img class="uiicon ${c}" src="assets/ui/${n}.png" alt="">`;
  const EMPTY_ART = {
    charts: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 82h72"/><rect x="18" y="52" width="14" height="30" rx="3" fill="currentColor" fill-opacity=".18"/><rect x="41" y="30" width="14" height="52" rx="3" fill="currentColor" fill-opacity=".3"/><rect x="64" y="42" width="14" height="40" rx="3" fill="currentColor" fill-opacity=".18"/><path d="m22 36 20-14 16 8 18-16"/></svg>',
    personal: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="48" cy="34" r="15" fill="currentColor" fill-opacity=".18"/><path d="M18 82c2-16 14-25 30-25s28 9 30 25"/><path d="m74 18 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor" fill-opacity=".35"/></svg>',
    roster: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="36" cy="36" r="12" fill="currentColor" fill-opacity=".18"/><path d="M12 78c1.5-13 10-20 24-20s22.5 7 24 20"/><circle cx="66" cy="32" r="9" fill="currentColor" fill-opacity=".3"/><path d="M62 54c12 0 19 6 22 18"/></svg>'
  };
  const emptyArt = k => `<div class="empty-art">${EMPTY_ART[k]}</div>`;

  // ---------- Estado y ajustes ----------
  const DEFAULTS = { lang: 'es', theme: 'dark', colors: null, topN: 10, unit: 'dps', showValues: true, showIcons: true, showPct: false, animations: true, compact: false, persist: true, confirmClear: true, minGain: 0, showCaution: true, cautionGap: 15, chartMode: 'boss', diff: 'auto', srcCat: 'all', persMode: 'all', coinSrc: 'all', checkGear: true, staleDays: 7, coins: 5, font: 'noto', fontScale: 100, density: 'normal', tooltips: true, chartTall: false };
  const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const state = {
    settings: (() => { const st = { ...DEFAULTS, ...load('ninjaloot.settings', {}) }; if (!['es', 'en'].includes(st.lang)) st.lang = 'es'; return st; })(),
    sims: [], loading: new Set(), names: { es: {}, en: {} }, expanded: new Set(), animateNext: true, info: { version: '' },
    view: 'home', page: {}, personal: null, personalList: [], gear: load('ninjaloot.gear', {}), personalUrl: load('ninjaloot.personalUrl', ''), shown: new Set(), bossSel: null, bosses: BOSSES_SNAPSHOT, rot: load('ninjaloot.rotations', {}),
  };
  if (state.settings.persist) state.sims = load('ninjaloot.sims', []).filter(s => s && s.id && Array.isArray(s.items));
  // Simulación personal: una o varias simulaciones de la misma persona (raid, míticas...) y su versión combinada para compararlas
  state.personalList = (() => { const l = load('ninjaloot.personalList', null); if (Array.isArray(l)) return l.filter(r => r && r.id && Array.isArray(r.items)); const one = load('ninjaloot.personal', null); return one && Array.isArray(one.items) ? [one] : []; })();
  state.personal = mergePersonal(state.personalList);
  // Quick Sim y Top Gear (simulaciones que no son Droptimizer) y entregas de loot importadas de RCLootCouncil
  state.extra = S0().persist ? load('ninjaloot.extra', []).filter(s => s && s.id && s.kind && s.kind !== 'drop') : [];
  state.loot = load('ninjaloot.loot', []).filter(l => l && l.player && l.itemId);
  const S = () => state.settings;
  function S0() { return state.settings; }
  const T = () => I18N[S().lang] || I18N.es;
  const persistSims = () => save('ninjaloot.sims', S().persist ? state.sims : []);
  const persistExtra = () => save('ninjaloot.extra', S().persist ? state.extra : []);
  const persistLoot = () => save('ninjaloot.loot', state.loot);
  const persistSettings = () => save('ninjaloot.settings', S());

  // ---------- Fuentes ----------
  // Expressway no se incluye (su licencia no permite incrustarla en aplicaciones): se usa si está instalada en Windows
  const FONTS = {
    noto: ['Noto Sans', "'Noto Sans','Segoe UI Variable Text','Segoe UI',system-ui,sans-serif"],
    segoe: ['Segoe UI', "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif"],
    arial: ['Arial', 'Arial,Helvetica,sans-serif'],
    verdana: ['Verdana', 'Verdana,Geneva,sans-serif'],
    georgia: ['Georgia', "Georgia,'Times New Roman',serif"],
    consolas: ['Consolas', "Consolas,'Cascadia Mono',monospace"],
    expressway: ['Expressway', "Expressway,'Noto Sans','Segoe UI',sans-serif"],
  };
  function fontInstalled(name) {
    const c = document.createElement('canvas').getContext('2d');
    const w = f => { c.font = `72px ${f}`; return c.measureText('mmmmmmmmmmlli').width; };
    return ['monospace', 'serif', 'sans-serif'].some(b => w(`'${name}',${b}`) !== w(b));
  }

  // ---------- Tema y colores ----------
  const hex = v => /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
  }
  function resolvedTheme() {
    const t = S().theme;
    return t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  }
  function applyTheme() {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme();
    for (const k of ['bg', 'panel', 'accent', 'text']) root.style.removeProperty(`--${k}`);
    const c = S().colors;
    if (c) for (const k of ['bg', 'panel', 'accent', 'text']) if (hex(c[k])) root.style.setProperty(`--${k}`, c[k]);
    document.body.classList.toggle('no-anim', !S().animations);
    root.style.setProperty('--font', (FONTS[S().font] || FONTS.noto)[1]);
    document.body.classList.toggle('compact', S().density === 'compact');
    window.api.setZoom((Number(S().fontScale) || 100) / 100);
  }
  function themeColors() {
    const cs = getComputedStyle(document.documentElement);
    const g = (k, def) => hex(cs.getPropertyValue(k).trim()) || def;
    const panel = g('--panel', '#221c15'), text = g('--text', '#ece3cf');
    return { bg: panel, text, muted: mix(text, panel, 0.4), grid: mix(text, panel, 0.86), axis: mix(text, panel, 0.55) };
  }
  const lum = h => { const n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  // Colores de texto legibles: sobre paneles claros se oscurecen los colores muy claros (Sacerdote, Pícaro…)
  const readable = col => (lum(themeColors().bg) > 0.55 && lum(col) > 0.55) ? mix(col, '#000000', 0.55) : col;
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S().theme === 'auto') { applyTheme(); render(); } });

  // ---------- Objetos: nombres, iconos y calidad ----------
  function itemInfo(it) {
    const loc = ITEMS[it.id], lang = S().lang, cached = state.names[lang][it.id] || state.names.en[it.id];
    const name = (lang !== 'en' && state.names[lang][it.id]?.[0]) || loc?.[0] || cached?.[0] || it.name || `#${it.id}`;
    const icon = loc?.[1] || cached?.[1] || 'inv_misc_questionmark';
    const quality = loc?.[2] ?? cached?.[2] ?? 4;
    const tag = { t: '(tank)', h: '(healer)', th: '(tank/healer)' }[loc?.[5]] || '';
    const src = loc ? `assets/items/${loc[1]}.png` : icon === 'inv_misc_questionmark' ? 'assets/ui/questionmark.jpg' : WEB_ICON(icon);
    return { name, icon: src, quality, tag };
  }
  const pending = new Set();
  async function ensureNames() {
    const lang = S().lang, ids = [];
    for (const id of state.shown || []) {
      const needLoc = lang !== 'en' && !state.names[lang][id];
      const needMeta = !ITEMS[id] && !state.names[lang][id] && !state.names.en[id];
      if ((needLoc || needMeta) && !pending.has(`${lang}:${id}`)) { pending.add(`${lang}:${id}`); ids.push(id); }
    }
    if (!ids.length) return;
    const res = await window.api.lookupItems(ids, lang);
    Object.assign(state.names[lang], res);
    ids.forEach(id => pending.delete(`${lang}:${id}`));
    if (Object.keys(res).length && S().lang === lang) { state.animateNext = false; render(); }
  }

  // ---------- Datos derivados ----------
  function visibleItems(sim, forNames = false) {
    const min = Number(S().minGain) || 0;
    let list = sim.items.filter(i => i.gain >= min);
    const n = S().topN;
    if (!forNames || n !== 0) {
      const lim = state.expanded.has(sim.id) || n === 0 ? list.length : n;
      list = list.slice(0, Math.max(lim, 1));
    }
    return list;
  }
  // Mejor mejora: la primera que supere el mínimo y que no lleve ya puesta (Raider.IO)
  const bestOf = sim => sim.items.find(i => i.gain >= (Number(S().minGain) || 0) && !owned(sim, i)) || sim.items[0];
  const clsName = sim => sim.character.cls ? T().classes[sim.character.cls] : '';
  // Especialización: nombre localizado e icono propio (cada spec tiene el suyo; si no se reconoce, icono de clase)
  const specKey = sim => String(sim.character.spec || '').toLowerCase().replace(/[^a-z]/g, '');
  const specData = sim => (SPECS[sim.character.cls] || {})[specKey(sim)] || null;
  const specName = sim => { const d = specData(sim), l = S().lang; return d ? (l === 'es' ? d[1] : (SPEC_L10N[l]?.[sim.character.cls]?.[specKey(sim)] || d[0])) : (sim.character.spec || ''); };
  const buffName = b => BUFF_L10N[S().lang]?.[b.id]?.[0] || b.name[S().lang === 'es' ? 0 : 1];
  const buffEffect = b => BUFF_L10N[S().lang]?.[b.id]?.[1] || b.effect[S().lang === 'es' ? 0 : 1];
  const specIcon = sim => { const d = specData(sim); return d ? `assets/specs/${sim.character.cls}-${specKey(sim)}.png` : (sim.character.cls ? `assets/classes/${sim.character.cls}.png` : null); };
  const clsColor = sim => CLASS_COLORS[sim.character.cls] || '#c8a45a';
  const nf = () => new Intl.NumberFormat({ es: 'es-ES', en: 'en-US' }[S().lang] || 'en-US', { useGrouping: 'always' }); // el español no agrupa los de 4 cifras (2537): se fuerza el separador de miles

  function valueOf(it, sim) { return S().unit === 'pct' ? it.pct : it.gain; }
  function valueText(it, sim) {
    const f = nf();
    if (S().unit === 'pct') return `+${it.pct.toFixed(2)}%`;
    const base = `+${S().compact ? Chart.fmtNum(it.gain, true) : f.format(it.gain)}`;
    return S().showPct ? `${base} (${it.pct.toFixed(1)}%)` : base;
  }

  // "Cuidado": mejoras grandes que se deben a que la pieza equipada es de nivel muy bajo frente al resto del equipo
  function cautionsFor(sim) {
    if (!sim.gear) return null;
    const vals = Object.values(sim.gear).filter(n => n > 0).sort((x, y) => x - y);
    if (vals.length < 6) return null;
    const median = vals[vals.length >> 1], gap = Number(S().cautionGap) || 15;
    return sim.items.slice(0, 12).filter(it => sim.gear[it.slot] && median - sim.gear[it.slot] >= gap && it.ilvl > sim.gear[it.slot])
      .map(it => ({ it, eq: sim.gear[it.slot], median })).slice(0, 5);
  }
  function cautionSection() {
    const t = T();
    let body = '';
    for (const sim of activeSims()) {
      const list = cautionsFor(sim);
      if (list === null) { body += `<div class="caution-sim"><div class="cs-head">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}<b style="color:${readable(clsColor(sim))}">${esc(sim.character.name)}</b></div><div class="hint">${esc(t.cautionNoGear)}</div></div>`; continue; }
      if (!list.length) continue;
      body += `<div class="caution-sim"><div class="cs-head">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}<b style="color:${readable(clsColor(sim))}">${esc(sim.character.name)}</b></div>`
        + list.map(({ it, eq, median }) => { const info = itemInfo(it); const slot = t.slots[it.slot] || it.slot;
          return `<div class="caution-line bar" data-item="${it.id}" data-ilvl="${it.ilvl}" data-gain="${esc(gainLine(it))}"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span>${esc(t.cautionLine(info.name, nf().format(it.gain), slot, eq, median, it.ilvl))}</span></div>`; }).join('') + '</div>';
    }
    return `<section class="panel card caution"><div class="card-head"><h2>${esc(t.cautionTitle)}</h2></div><div class="hint">${esc(t.cautionIntro)}</div>${body || `<div class="caution-ok">${esc(t.cautionNone)}</div>`}</section>`;
  }

  const gainLine = it => `${T().tipGain}: +${nf().format(it.gain)} DPS (${it.pct.toFixed(2)}%)`;

  // ---------- Dificultad (Normal / Heroico / Mítico): no se mezclan simulaciones de distinta dificultad ----------
  const DIFF_RANK = { lfr: 0, nm: 1, hc: 2, mm: 3 };
  const DIFF_TAG = { lfr: 'LFR', nm: 'NM', hc: 'HC', mm: 'MM' };
  const presentDiffs = () => [...new Set(state.sims.map(s => s.difficulty).filter(Boolean))].sort((a, b) => DIFF_RANK[a] - DIFF_RANK[b]);
  function effectiveDiff() { const p = presentDiffs(); if (p.length < 2) return null; return p.includes(S().diff) ? S().diff : p[p.length - 1]; }
  const TANK_SPECS = new Set(['blood', 'vengeance', 'guardian', 'brewmaster', 'protection']), HEAL_SPECS = new Set(['restoration', 'preservation', 'mistweaver', 'holy', 'discipline']);
  const roleOf = s => { const k = String(s.character.spec || '').toLowerCase().replace(/[^a-z]/g, ''); return TANK_SPECS.has(k) ? 'tank' : HEAL_SPECS.has(k) ? 'healer' : 'dps'; };
  const diffSims = () => { const e = effectiveDiff(); return state.sims.filter(s => !e || !s.difficulty || s.difficulty === e); };
  const presentRoles = () => ['tank', 'healer', 'dps'].filter(r => diffSims().some(s => roleOf(s) === r));
  const presentClasses = () => [...new Set(diffSims().map(s => s.character.cls).filter(Boolean))];
  const effRole = () => S().roleFilter && S().roleFilter !== 'all' && presentRoles().includes(S().roleFilter) ? S().roleFilter : 'all';
  const effClass = () => S().classFilter && S().classFilter !== 'all' && presentClasses().includes(S().classFilter) ? S().classFilter : 'all';
  const passesRC = s => (effRole() === 'all' || roleOf(s) === effRole()) && (effClass() === 'all' || s.character.cls === effClass());
  const activeSims = () => diffSims().filter(passesRC);
  const diffBadge = d => d ? `<span class="dbadge d-${d}" title="${esc(T().diffNames[d])}">${DIFF_TAG[d]}</span>` : '';
  const xmark = '<svg class="xmark" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
  // Simulaciones guardadas con el parser antiguo: el encuentro quedó en "difficulty" (formato actual de Raidbots)
  const fixSrc = s => s.encounter == null && Math.abs(s.difficulty) > 20 ? { ...s, encounter: s.difficulty, difficulty: null } : s;
  const srcOf = it => (it.source && fixSrc(it.source)) || (ITEMS[it.id]?.[6]?.[0] ? { instance: ITEMS[it.id][6][0][0], encounter: ITEMS[it.id][6][0][1] } : null);
  const catOfType = ty => /raid/.test(ty) ? 'raid' : /mplus|dungeon/.test(ty) ? 'dungeon' : /delve/.test(ty) ? 'delve' : /prey/.test(ty) ? 'prey' : /catalyst/.test(ty) ? 'catalyst' : /pvp/.test(ty) ? 'pvp' : /profession/.test(ty) ? 'craft' : /bonus/.test(ty) ? 'bonus' : 'other';
  const catOfSrc = s => s ? catOfType(((state.bosses.inst || {})[s.instance] || {}).t || '') : 'other';
  // Nombres en español de las bandas y jefes de la temporada actual (con la web en español); lo que no esté aquí se deja como llega de Raidbots
  const ES_NAMES = {
    'The Venomous Abyss': 'Abismo Venenoso', 'The Tidebound Grotto': 'La Gruta Mareal', "The Unbinding of Kith'ix": "La liberación de Kith'ix",
    "Nek'zali the Soulcoiler": "Nek'zali la Volutadora de Almas", 'Entombed Sentinels': 'Centinelas Sepultados', 'The Lost Explorers': 'Los exploradores perdidos',
    'Vashnik the Malignant': 'Vashnik el Maligno', 'Sszorak': 'Sszorak', 'The Twin Fangs': 'Los colmillos gemelos', 'The Coiled Altar': 'El Altar en Espiral',
    "Ula'tek": "Ula'tek", 'Nymrissa Wavecaller': 'Nymrissa Clamaolas', "Kith'ix": "Kith'ix"
  };
  const trName = n => (S().lang === 'es' && ES_NAMES[n]) || n;
  const bossLabel = enc => trName((state.bosses.names || {})[enc] || '');
  // Icono del jefe (Warcraft Logs) a partir de su nombre en inglés; si no se conoce o no carga, no se muestra nada
  // Iconos de jefes y mazmorras: van dentro de la app (assets/bosses, ver tools/build-icons.mjs); solo si faltara alguno se pide al CDN de Warcraft Logs y, si tampoco, se quita
  const bossIcSrc = id => (typeof LOCAL_BOSS !== 'undefined' && LOCAL_BOSS[id] ? `assets/bosses/${id}.${LOCAL_BOSS[id]}` : `https://assets.rpglogs.com/img/warcraft/bosses/${id}-icon.jpg`);
  const bossImgTag = (id, sz) => `<img class="boss-ic" data-bid="${id}" src="${bossIcSrc(id)}" width="${sz}" height="${sz}" alt="">`;
  // «Trash Drop» (botín de bichos de la banda) no es un jefe: lleva una calavera propia, guardada en local
  const bossSrcOf = enc => { const id = typeof BOSS_ICONS !== 'undefined' && BOSS_ICONS[(state.bosses.names || {})[enc] || '']; return id ? bossIcSrc(id) : ''; };
  const bossImg = (enc, sz = 28) => { if (Number(enc) === -97) return `<img class="boss-ic" src="assets/ui/trash.jpg" width="${sz}" height="${sz}" alt="">`; const id = typeof BOSS_ICONS !== 'undefined' && BOSS_ICONS[(state.bosses.names || {})[enc] || '']; return id ? bossImgTag(id, sz) : ''; };
  const nameImg = (name, sz = 28) => { const id = typeof BOSS_ICONS !== 'undefined' && BOSS_ICONS[name]; return id ? bossImgTag(id, sz) : ''; };
  // Tipo de armadura del objeto (del informe o de data/armor.js); cuellos, anillos, abalorios, capas y armas valen para cualquiera
  const armorLabel = it => T().armorNames[it.armor || ARMOR[it.id] || 'any'];
  const instName = id =>((state.bosses.inst || {})[id] || {}).n || '';
  // Fuente de un objeto: en mazmorras el nombre de la mítica; en raid el jefe, con (Tier) si sale de su ficha o (Catalizador) si se convierte
  function srcText(it) {
    const t = T(), s = srcOf(it), enc = s && s.encounter != null ? s.encounter : 0;
    if (!s) return null;
    if (catOfSrc(s) === 'dungeon') { const name = s.instance > 0 ? instName(s.instance) : instName(enc) || bossLabel(enc); return name ? { name, sub: t.catDungeon } : null; }
    // Bajadas y presas: el botín sale en cualquiera de ellas, así que se nombra el tipo de contenido
    if (['delve', 'prey', 'bonus'].includes(catOfSrc(s))) return { name: bossLabel(enc) || catName(catOfSrc(s)), sub: t.coinAnyOf(catName(catOfSrc(s))) };
    const boss = bossLabel(enc);
    if (!boss) return null;
    const tag = it.tier === 'token' ? ' (Tier)' : it.tier === 'catalyst' ? ` (${t.catCatalyst})` : '';
    return { name: boss + tag, sub: (allBosses().find(b => b.id === enc) || {}).group || '' };
  }

  const act0 = () => activeSims();
  // Filtro de fuente efectivo: si el guardado no corresponde a ninguna fuente de las simulaciones actuales, se usa "Todo"
  function srcCats() { const cats = new Set(); for (const s of act0()) for (const it of s.items) cats.add(catOfSrc(srcOf(it))); return cats; }
  const effCat = () => S().srcCat !== 'all' && srcCats().has(S().srcCat) ? S().srcCat : 'all';
  // Filtros de raid y jefe en "Por jefe" (si lo guardado ya no existe en la temporada, se usa "todas"/"todos")
  const effRaid = () => state.bosses.groups.some(g => g.id === S().raidPick) ? S().raidPick : 'all';
  const raidBossList = () => state.bosses.groups.filter(g => effRaid() === 'all' || g.id === effRaid()).flatMap(g => g.bosses);
  const effBossPick = () => raidBossList().some(b => b.id === S().bossPick) ? S().bossPick : 'all';
  const encAllowed = enc => effBossPick() !== 'all' ? enc === effBossPick() : effRaid() === 'all' || raidBossList().some(b => b.id === enc);
  // Estilo de barras por vista: en "por jefe" simples por defecto y en "por jugador" detalladas
  const barKey = () => S().chartMode === 'player' ? 'barStylePlayer' : 'barStyleBoss';
  const detailed = () => (S()[barKey()] || (S().chartMode === 'player' ? 'detailed' : 'simple')) === 'detailed';
  const exactTip = (name, gain, pct) => `${name}: +${nf().format(gain)} DPS (${pct.toFixed(2)}%)`;

  // ---------- Sims caducadas: equipo actual de cada personaje (Raider.IO) ----------
  const GEAR_TTL = 30 * 60 * 1000, gearPending = new Set();
  const gearSims = () => [...state.sims, ...(state.personal && !state.sims.some(s => s.id === state.personal.id) ? [state.personal] : [])];
  function refreshGear(force = false) {
    if (S().checkGear === false) return;
    for (const sim of gearSims()) {
      const c = sim.character, g = state.gear[sim.id];
      if (!c.region || !c.realm || gearPending.has(sim.id) || (!force && g && Date.now() - g.fetched < GEAR_TTL)) continue;
      gearPending.add(sim.id);
      window.api.fetchGear(c.region, c.realm, c.name).then(r => {
        gearPending.delete(sim.id);
        state.gear[sim.id] = r && r.ok ? r : { ok: false, fetched: Date.now() };
        save('ninjaloot.gear', state.gear); state.animateNext = false; render();
      });
    }
  }
  const gearOf = sim => { const g = S().checkGear !== false && state.gear[sim.gearId || sim.id]; return g && g.ok ? g.items : null; };
  // Ya lo lleva: el mismo objeto equipado ahora a su nivel o más (si lo lleva a menos nivel, la mejora sigue valiendo)
  // Ranura en la que lleva ahora ese objeto (mismo id y mismo nivel o más), según Raider.IO
  const wornSlot = (sim, it) => { const g = gearOf(sim); if (!g) return null; return Object.keys(g).find(s => g[s] && g[s].id === it.id && g[s].ilvl >= (it.ilvl || 0)) || null; };
  // ¿Ya lo llevaba puesto al lanzar la simulación? (entonces la sim ya contaba con él: no es un objeto «conseguido después»)
  const wornAtSim = (sim, it) => Object.values(sim.equippedAtSim || {}).some(x => x && x.id === it.id && (x.ilvl || 0) >= (it.ilvl || 0));
  const ownedGear = (sim, it) => !!wornSlot(sim, it) && !wornAtSim(sim, it);
  const lootGiven = (sim, it) => { if (!state.loot.length) return false; const since = lastReset(sim.character.region || 'eu'), nm = String(sim.character.name || '').toLowerCase(); return state.loot.some(l => l.itemId === it.id && String(l.player).toLowerCase() === nm && (l.at == null || l.at >= since)); };
  const owned = (sim, it) => ownedGear(sim, it) || lootGiven(sim, it);
  function staleInfo(sim) {
    const t = T(), out = [], days = sim.simDate ? (Date.now() - sim.simDate) / 864e5 : null;
    if (days != null && days > (Number(S().staleDays) || 7)) out.push(t.staleOld(Math.floor(days)));
    const g = gearOf(sim);
    if (g) {
      const changed = gearChanges(sim).length;
      if (changed) out.push(t.staleGear(changed));
      const own = sim.items.filter(it => ownedGear(sim, it)).length;
      if (own) out.push(t.staleOwned(own));
    }
    const given = sim.items.filter(it => lootGiven(sim, it)).length;
    if (given) out.push(t.staleGiven(given));
    return out;
  }
  // Piezas que han cambiado desde la sim: ranura, lo que llevaba (objeto y nivel) y lo que lleva ahora
  const SLOT_ORDER = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands', 'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2', 'main_hand', 'off_hand'];
  // Clave de un cambio avisado: sim, ranura y objeto/nivel actual; «Es correcto» la guarda para no volver a avisar
  const changeKey = (sim, slot, to) => `${sim.gearId || sim.id}:${slot}:${to.id}:${to.ilvl}`;
  // Fecha de los datos de Raider.IO: si es ANTERIOR a la sim no pueden decir qué ha cambiado después, así que no se avisa de cambios
  const gearCrawled = sim => { const g = state.gear[sim.gearId || sim.id]; return g && g.ok ? g.crawled || null : null; };
  const gearStaleVsSim = sim => { const c = gearCrawled(sim); return !!(c && sim.simDate && c < sim.simDate); };
  function gearChanges(sim) {
    const g = gearOf(sim), eq = sim.equippedAtSim || {};
    if (!g || gearStaleVsSim(sim)) return [];
    const ok = new Set(S().gearOk || []);
    return SLOT_ORDER.filter(s => eq[s] && g[s] && (g[s].id !== eq[s].id || g[s].ilvl !== eq[s].ilvl) && !ok.has(changeKey(sim, s, g[s]))).map(s => ({ slot: s, from: eq[s], to: g[s] }));
  }
  const crawlTxt = sim => { const c = gearCrawled(sim); return c ? new Date(c).toLocaleString(S().lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''; };
  // Ayuda «?»: explica exactamente por qué se avisa (sim antigua, equipo cambiado, mejoras que ya lleva)
  function staleWhy(sim) {
    const t = T(), parts = [], max = Number(S().staleDays) || 7, days = sim.simDate ? (Date.now() - sim.simDate) / 864e5 : null;
    if (days != null && days > max) parts.push(`<p>${esc(t.staleWhyOld(Math.floor(days), max, new Date(sim.simDate).toLocaleDateString(S().lang, { day: 'numeric', month: 'long' })))}</p>`);
    const ch = gearChanges(sim);
    if (ch.length) parts.push(`<p>${esc(t.staleWhyGear)}</p><ul>${ch.map(({ slot, from, to }) => `<li><b>${esc(capFirst(t.slots[slot] || slot))}:</b> ${esc(itemInfo({ id: from.id }).name)} (${from.ilvl}) → ${esc(itemInfo({ id: to.id }).name)} (${to.ilvl})</li>`).join('')}</ul>`);
    const rowOf = (it, slot) => {
      state.shown.add(it.id);
      const info = itemInfo(it), col = QUALITY_COLORS[info.quality], src = srcText(it);
      const had = slot && (sim.equippedAtSim || {})[slot];
      if (had) state.shown.add(had.id);
      const hadTxt = had ? `${esc(itemInfo({ id: had.id }).name)} (${had.ilvl})` : esc(t.ownNothing);
      return `<li class="own-row"><span class="own-ic" data-item="${it.id}" data-ilvl="${it.ilvl || 0}" data-tip-always><img src="${info.icon}" alt="" style="border-color:${col}"></span><span class="own-tx"><b style="color:${readable(col)}">${esc(info.name)}</b> <span class="meta">(${it.ilvl || '?'})</span>`
        + `<span class="meta">${slot ? `${esc(t.ownSlotWord)}: ${esc(capFirst(t.slots[slot] || slot))} · ` : ''}${src ? `${esc(src.name)} · ` : ''}${esc(t.ownGainSim)}: +${nf().format(it.gain)} (${it.pct.toFixed(2)}%)</span>`
        + (slot ? `<span class="meta">${esc(t.ownSimHad)}: ${hadTxt}</span>` : '') + '</span></li>';
    };
    const own = sim.items.filter(it => ownedGear(sim, it));
    if (own.length) parts.push(`<p>${esc(t.staleWhyOwned2)}</p><ul class="own-list">${own.map(it => rowOf(it, wornSlot(sim, it))).join('')}</ul>`);
    const gv = sim.items.filter(it => lootGiven(sim, it));
    if (gv.length) parts.push(`<p>${esc(t.staleWhyGiven)}</p><ul class="own-list">${gv.map(it => rowOf(it, null)).join('')}</ul>`);
    if (!parts.length) return '';
    return `<span class="why" tabindex="0">?<span class="why-pop" role="tooltip">${parts.join('')}<p class="meta">${esc(t.staleWhyFix)}</p></span></span>`;
  }
  function stalePanel(sims) {
    const t = T(), rows = sims.map(s => [s, staleInfo(s)]).filter(([, r]) => r.length);
    if (!rows.length) return '';
    const piece = x => { state.shown.add(x.id); const info = itemInfo({ id: x.id }); return { info, html: `<span class="sc-item" data-item="${x.id}" data-ilvl="${x.ilvl}" data-tip-always><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><b style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</b></span>` }; };
    return `<section class="panel card stale-panel"><div class="card-head"><h2>${esc(t.staleTitle)}</h2></div><div class="hint">${esc(t.staleHint)}</div>`
      + rows.map(([s, r]) => `<div class="stale-row">${specIcon(s) ? `<img src="${specIcon(s)}" alt="">` : ''}<b style="color:${readable(clsColor(s))}">${esc(s.character.name)}</b><span class="reasons">${esc(r.join(' · '))}</span>${staleWhy(s)}`
        + `<button class="btn small" data-open="https://www.raidbots.com/simbot/droptimizer">${ui('open')}${esc(t.resim)}</button></div>`
        + (c => c.length ? `<ul class="stale-changes">${c.map(({ slot, from, to }) => { const a = piece(from), b = piece(to);
          return `<li><span class="sc-slot">${esc(t.slots[slot] || slot)}</span>${from.id === to.id ? t.gearUpgraded(a.html, from.ilvl, to.ilvl) : t.gearSwapped(a.html, from.ilvl, b.html, to.ilvl)}<button class="btn small sc-ok" data-gear-ok="${esc(changeKey(s, slot, to))}" title="${esc(t.gearOkTip)}">${esc(t.gearOk)}</button></li>`; }).join('')}</ul><div class="small-note" style="margin:-4px 0 10px 36px">${esc(t.gearSrc(crawlTxt(s)))}</div>` : '')(gearChanges(s))).join('') + '</section>';
  }
  function statTiles(act) {
    if (!act.length) return '';
    const t = T(), min = Number(S().minGain) || 0, ids = new Set(), chars = new Set();
    let best = null, bestSim = null;
    for (const sim of act) {
      chars.add(sim.character.name);
      for (const it of sim.items) { if (it.gain < min) continue; ids.add(it.id); if (!best || it.gain > best.gain) { best = it; bestSim = sim; } }
    }
    const tile = (k, v, sub, extra = '') => `<div class="stat-tile${extra}"><small>${esc(k)}</small><b>${v}</b>${sub ? `<span class="meta">${sub}</span>` : ''}</div>`;
    const info = best ? itemInfo(best) : null;
    return '<div class="stat-tiles">' + tile(t.statSims, act.length) + tile(t.statChars, chars.size) + tile(t.statItems, ids.size)
      + (best ? tile(t.statBest, esc(valueText(best, bestSim)), `<span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span> · ${esc(bestSim.character.name)}`, ' best') : '') + '</div>';
  }
  function toolbarHtml() {
    const t = T(), p = presentDiffs(), eff = effectiveDiff(), mode = S().chartMode;
    let h = `<div class="charts-bar"><div class="seg"><button data-mode="boss" class="${mode === 'boss' ? 'on' : ''}">${esc(t.modeBoss)}</button><button data-mode="player" class="${mode === 'player' ? 'on' : ''}">${esc(t.modePlayer)}</button></div>`;
    if (p.length) h += `<div class="diffbar"><span class="meta">${esc(t.diffLabel)}:</span>` + (p.length > 1 ? `<div class="seg">${p.map(d => `<button data-diff="${d}" class="${d === eff ? 'on' : ''}" title="${esc(t.diffNames[d])}">${DIFF_TAG[d]}</button>`).join('')}</div>` : diffBadge(p[0])) + '</div>';
    const ROLE_SVG = { tank: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/></svg>', healer: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>', dps: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><g transform="rotate(45 12 12)"><path d="M12 0 14.8 3V14H9.2V3z"/><rect x="5.5" y="14" width="13" height="2.4" rx="1.2"/><rect x="10.9" y="16.2" width="2.2" height="4"/><circle cx="12" cy="21.7" r="1.6"/></g></svg>' };
    const roles = presentRoles();
    if (roles.length > 1) h += `<div class="diffbar"><span class="meta">${esc(t.roleLabel)}:</span><div class="seg"><button data-role="all" class="${effRole() === 'all' ? 'on' : ''}">${esc(t.roleAll)}</button>${roles.map(r => `<button data-role="${r}" class="role-${r}${effRole() === r ? ' on' : ''}">${ROLE_SVG[r]}${esc(t['role' + capFirst(r === 'dps' ? 'Dps' : r)])}</button>`).join('')}</div></div>`;
    const clss = presentClasses();
    if (clss.length > 1) h += `<div class="diffbar"><span class="meta">${esc(t.clsLabel)}:</span><div class="seg cls-seg"><button data-clsf="all" class="${effClass() === 'all' ? 'on' : ''}">${esc(t.clsAll)}</button>${clss.map(c => `<button data-clsf="${c}" class="${effClass() === c ? 'on' : ''}" title="${esc(t.classes[c])}" style="--cc:${CLASS_COLORS[c]}"><img src="assets/classes/${c}.png" alt="" width="22" height="22"></button>`).join('')}</div></div>`;
    if (mode === 'boss') {
      const cats = {};
      for (const s of act0()) for (const it of s.items) { const c = catOfSrc(srcOf(it)); cats[c] = (cats[c] || 0) + 1; }
      const keys = ['raid', 'dungeon', 'delve', 'prey', 'catalyst', 'craft', 'pvp', 'bonus', 'other'].filter(k => cats[k]);
      if (keys.length > 1) h += `<div class="diffbar"><span class="meta">${esc(t.srcLabel)}:</span><div class="seg"><button data-cat="all" class="${effCat() === 'all' ? 'on' : ''}">${esc(t.catAll)}</button>${keys.map(k => `<button data-cat="${k}" class="${effCat() === k ? 'on' : ''}">${esc(t['cat' + k[0].toUpperCase() + k.slice(1)] || k)}</button>`).join('')}</div></div>`;
      // Raid (todas o una) y jefe (todos o uno) de la temporada
      if (['all', 'raid'].includes(effCat()) && state.bosses.groups.length) {
        const raid = effRaid(), list = raidBossList();
        if (state.bosses.groups.length > 1) h += `<div class="diffbar"><span class="meta">${esc(t.raidLabel)}:</span><div class="seg"><button data-raid="all" class="${raid === 'all' ? 'on' : ''}">${esc(t.raidAll)}</button>${state.bosses.groups.map(g => `<button data-raid="${g.id}" class="${raid === g.id ? 'on' : ''}">${esc(trName(g.name))}</button>`).join('')}</div></div>`;
        h += `<div class="diffbar"><span class="meta">${esc(t.bossPickLabel)}:</span><select id="bossPick" class="txt small"><option value="all">${esc(t.bossAll)}</option>${list.map(b => `<option value="${b.id}"${effBossPick() === b.id ? ' selected' : ''}>${esc(trName(b.name))}</option>`).join('')}</select></div>`;
      }
    }
    const hidden = eff ? state.sims.filter(s => s.difficulty && s.difficulty !== eff).length : 0;
    if (hidden) h += `<span class="meta warnnote">${esc(t.diffHidden(hidden, t.diffNames[eff]))}</span>`;
    return h + '</div>';
  }

  // ---------- Gráficas por jefe: todas las piezas que dan DPS, ordenadas, comparadas entre jugadores ----------
  function bossCharts(act, chartOpts) {
    const t = T(), min = Number(S().minGain) || 0, pct = S().unit === 'pct';
    const byEnc = new Map(), cat = effCat();
    for (const sim of act) for (const it of sim.items) {
      if (it.gain < min) continue;
      const src = srcOf(it), enc = src && src.encounter != null ? src.encounter : 0;
      if (cat !== 'all' && catOfSrc(src) !== cat) continue;
      if ((effRaid() !== 'all' || effBossPick() !== 'all') && !encAllowed(enc)) continue;
      let m = byEnc.get(enc); if (!m) byEnc.set(enc, m = new Map());
      let g = m.get(it.id); if (!g) m.set(it.id, g = { id: it.id, name: it.name, it, gains: [] });
      g.gains.push({ sim, gain: it.gain, pct: it.pct, ilvl: it.ilvl });
    }
    const rowsOf = enc => [...byEnc.get(enc).values()].map(g => { g.gains.sort((x, y) => y.gain - x.gain); return { ...g, best: g.gains[0] }; }).sort((x, y) => y.best.gain - x.best.gain);
    const bosses = allBosses(), order = bosses.map(b => b.id), groupOf = new Map(bosses.map(b => [b.id, b.group]));
    const top = new Map([...byEnc.keys()].map(e => [e, rowsOf(e)[0]?.best.gain || 0]));
    const encs = [...byEnc.keys()].sort((a, b) => { const ia = order.indexOf(a), ib = order.indexOf(b); return (ia >= 0 || ib >= 0) ? (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) : top.get(b) - top.get(a); });
    let html = `<div class="hint boss-hint">${esc(t.bossChartsHint)}</div>`;
    if (!encs.length) html += `<div class="panel card"><div class="hint">${esc(t.bossNone)}</div></div>`;
    for (const enc of encs) {
      const rows = rowsOf(enc), key = `boss${enc}`, n = S().topN, lim = state.expanded.has(key) || n === 0 ? rows.length : n;
      // Una tarjeta por objeto: icono, nombre, de dónde sale y tipo de armadura, y una barra por jugador de más a menos
      const cards = rows.slice(0, lim).map(r => {
        state.shown.add(r.id);
        const info = itemInfo(r), st = srcText(r.it), col = QUALITY_COLORS[info.quality];
        const entries = r.gains.map(x => ({ value: pct ? x.pct : x.gain, label: x.sim.character.name, color: clsColor(x.sim), labelColor: readable(clsColor(x.sim)), valueText: valueText({ gain: x.gain, pct: x.pct }, x.sim),
          tip: exactTip(x.sim.character.name, x.gain, x.pct) + (owned(x.sim, { id: r.id, ilvl: x.ilvl }) ? ` (${t.ownedTag})` : ''), owned: owned(x.sim, { id: r.id, ilvl: x.ilvl }), bottomIcon: specIcon(x.sim), sub: x.sim.difficulty ? DIFF_TAG[x.sim.difficulty] : '' }));
        const chart = detailed() ? Chart.build(entries, { ...chartOpts, slot: 92, height: 190, bottom: 104, labelSize: 12.5, yTitle: '' }) : Chart.mini(entries, { colors: chartOpts.colors, compact: chartOpts.compact, tickFmt: chartOpts.tickFmt, animate: chartOpts.animate });
        return `<div class="item-card${detailed() ? ' detailed' : ''}"><div class="ic-head"><img class="ic-icon" src="${info.icon}" alt="" style="border-color:${col}" data-item="${r.id}" data-ilvl="${r.best.ilvl || 0}" data-tip-always>`
          + `<div><b style="color:${readable(col)}">${esc(info.name)}</b>${info.tag ? ` <span class="meta">${esc(info.tag)}</span>` : ''}<div class="meta">${esc([st && st.name, armorLabel(r.it)].filter(Boolean).join(' · '))}</div></div></div>`
          + `<div class="ic-chart">${chart}</div></div>`;
      }).join('');
      const first = rows[0] && srcText(rows[0].it), isDungeon = rows[0] && catOfSrc(srcOf(rows[0].it)) === 'dungeon';
      const name = (isDungeon && first && first.name) || bossLabel(enc) || (enc ? `#${enc}` : t.bossOtherSources);
      // Tabla bajo la gráfica: cada objeto con todos los jugadores a los que les sube, de más a menos
      const table = `<div class="ptable-wrap"><table class="ptable boss-table"><thead><tr><th>#</th><th>${esc(t.colItem)}</th><th>${esc(t.colIlvl)}</th><th>${esc(t.colPlayers)}</th></tr></thead><tbody>`
        + rows.slice(0, lim).map((r, i) => { const info = itemInfo(r);
          return `<tr data-item="${r.id}" data-ilvl="${r.best.ilvl}" data-gain="${esc(r.gains.slice(0, 6).map(x => `${x.sim.character.name}: +${nf().format(x.gain)} DPS (${x.pct.toFixed(2)}%)`).join('\n'))}"><td class="rk">${i + 1}</td>`
            + `<td class="it"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span>${info.tag ? ` <span class="meta">${esc(info.tag)}</span>` : ''}</td><td>${r.best.ilvl || ''}</td>`
            + `<td class="bt-players">${r.gains.map(x => `<span class="bt-p${owned(x.sim, { id: r.id, ilvl: x.ilvl }) ? ' owned' : ''}" style="border-color:${clsColor(x.sim)}">${specIcon(x.sim) ? `<img src="${specIcon(x.sim)}" alt="">` : ''}<b style="color:${readable(clsColor(x.sim))}">${esc(x.sim.character.name)}</b> ${esc(valueText({ gain: x.gain, pct: x.pct }, x.sim))}</span>`).join('')}</td></tr>`; }).join('')
        + '</tbody></table></div>';
      html += `<section class="panel card" id="boss-${enc}"><div class="card-head">${bossImg(enc, 40)}<div><h2>${esc(name)}</h2><div class="meta">${esc([groupOf.get(enc), `${rows.length} ${t.items}`].filter(Boolean).join(' · '))}</div></div><span class="spacer"></span><div class="card-tools">`
        + (n !== 0 && rows.length > n ? `<button class="btn small" data-toggle="${key}">${esc(state.expanded.has(key) ? t.showLess : t.showAll)}</button>` : '')
        + `</div></div><div class="item-cards">${cards}</div><details class="boss-details"><summary>${esc(t.bossTable)}</summary>${table}</details></section>`;
    }
    return html;
  }

  // ---------- Gráficas por jugador ----------
  function playerCharts(act, chartOpts) {
    const t = T(), pct = S().unit === 'pct';
    const sims = [...act].sort((a, b) => (bestOf(b)?.gain || 0) - (bestOf(a)?.gain || 0));
    const entries = sims.map(sim => {
      const best = bestOf(sim), info = itemInfo(best), col = clsColor(sim);
      state.shown.add(best.id);
      return {
        id: sim.id, value: valueOf(best, sim), label: sim.character.name, sub: sim.difficulty ? DIFF_TAG[sim.difficulty] : '',
        color: col, labelColor: readable(col), icon: info.icon, iconBorder: QUALITY_COLORS[info.quality], valueText: valueText(best, sim),
        bottomIcon: specIcon(sim), itemId: best.id, ilvl: best.ilvl, gain: gainLine(best), onclick: true,
        tipIcon: 'top', tip: exactTip(sim.character.name, best.gain, best.pct),
      };
    }).sort((a, b) => b.value - a.value);
    const draw = (list, big) => detailed() ? Chart.build(list, { ...chartOpts, ...big }) : Chart.mini(list, { colors: chartOpts.colors, compact: chartOpts.compact, tickFmt: chartOpts.tickFmt, animate: chartOpts.animate, maxValue: big && big.maxValue });
    let html = `<section class="panel card" id="overview"><div class="card-head"><h2>${esc(t.overviewTitle)}</h2><span class="spacer"></span>`
      + `<div class="card-tools"><button class="btn small" data-export="overview">${ui('export')}${esc(t.exportPng)}</button></div></div>`
      + `<div class="hint">${esc(t.overviewHint)}</div><div class="chart-wrap${detailed() ? '' : ' simple'}" data-chart="overview">${draw(entries, { slot: 112, height: 300 })}</div></section>`;
    for (const sim of sims) {
      const col = clsColor(sim), all = sim.items.filter(i => i.gain >= (Number(S().minGain) || 0)), total = all.length, per = S().topN;
      const paged = per !== 0 && total > per && !state.expanded.has(sim.id), pages = paged ? Math.ceil(total / per) : 1, pg = paged ? Math.min(Math.max(state.page[sim.id] || 0, 0), pages - 1) : 0;
      const list = paged ? all.slice(pg * per, pg * per + per) : visibleItems(sim), topValue = all.length ? valueOf(all[0], sim) : 0;
      const items = list.map(it => {
        const info = itemInfo(it);
        state.shown.add(it.id);
        return { id: it.id, value: valueOf(it, sim), label: info.name + (info.tag ? ' ' + info.tag : ''), itemId: it.id, ilvl: it.ilvl, gain: gainLine(it), color: col, labelColor: readable(QUALITY_COLORS[info.quality]), icon: null, bottomIcon: info.icon, valueText: valueText(it, sim),
          tipIcon: 'bottom', tip: exactTip(sim.character.name, it.gain, it.pct) + (owned(sim, it) ? ` (${t.ownedTag})` : ''), owned: owned(sim, it) };
      });
      const canToggle = S().topN !== 0 && total > S().topN;
      const arrow = (dir, on, label) => `<button type="button" class="pg-arrow ${dir < 0 ? 'prev' : 'next'}" data-page="${esc(sim.id)}" data-dir="${dir}" aria-label="${esc(label)}" title="${esc(label)}"${on ? '' : ' disabled'}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir < 0 ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'}"/></svg></button>`;
      html += `<section class="panel card" id="sim-${esc(sim.id)}"><div class="card-head">`
        + (specIcon(sim) ? `<img class="cls-icon" src="${specIcon(sim)}" alt="" style="border-color:${col}">` : '')
        + `<div><h2 style="color:${readable(col)}">${esc(sim.character.name)} ${diffBadge(sim.difficulty)}</h2>`
        + `<div class="meta">${esc([specName(sim), clsName(sim), sim.character.realm].filter(Boolean).join(' · '))} — ${esc(t.baseDps)}: ${nf().format(sim.baseDps)} — ${total} ${esc(t.items)}</div></div>`
        + (best => { const bi = itemInfo(best); state.shown.add(best.id); return `<div class="star-item" style="--q:${QUALITY_COLORS[bi.quality]}" data-item="${best.id}" data-ilvl="${best.ilvl || 0}" data-tip-always title="${esc(t.starItem)}"><img src="${bi.icon}" alt=""><span><small>★ ${esc(t.starItem)}</small><b>${esc(bi.name)}</b><em>${esc(valueText(best, sim))}</em></span></div>`; })(bestOf(sim))
        + `<span class="spacer"></span><div class="card-tools">`
        + (paged ? `<span class="pg-info">${pg * per + 1}–${Math.min(total, pg * per + per)} ${esc(t.pageOf)} ${total}</span>` : '')
        + (canToggle ? `<button class="btn small" data-toggle="${esc(sim.id)}">${esc(state.expanded.has(sim.id) ? t.showLess : t.showAll)}</button>` : '')
        + `<button class="btn small" data-open="${esc(sim.url)}">${ui('open')}${esc(t.openRaidbots)}</button>`
        + `<button class="btn small" data-refresh="${esc(sim.id)}" title="${esc(t.refresh)}">${ui('refresh')}</button>`
        + `<button class="btn small" data-export="${esc(sim.id)}">${ui('export')}${esc(t.exportPng)}</button>`
        + `<button class="btn small danger" data-remove="${esc(sim.id)}" title="${esc(t.remove)}">${xmark}</button></div></div>`
        + `<div class="chart-pager${paged ? ' paged' : ''}">${paged ? arrow(-1, pg > 0, t.pagePrev) + arrow(1, pg < pages - 1, t.pageNext) : ''}<div class="chart-wrap${detailed() ? '' : ' simple'}" data-chart="${esc(sim.id)}">${draw(items, { slot: 104, height: 240, bottom: 128, labelSize: 12.5, maxLines: 3, maxValue: paged ? topValue : 0 })}</div></div></section>`;
    }
    return html;
  }

  // ---------- Inicio ----------
  function homeView() {
    const t = T();
    const feats = [['charts', 'f1'], ['personal', 'f2'], ['coin', 'f3'], ['rotations', 'f4'], ['remove', 'f5'], ['lang', 'f6']];
    return `<section class="panel home-hero"><img src="assets/logo.png" alt="" width="128" height="128"><div><h2>${esc(t.homeWelcome)}</h2><p>${esc(t.homeIntro)}</p>`
      + `<div class="home-actions"><a class="btn primary" href="#/charts" data-view="charts">${esc(t.homeStart)}</a><button class="btn" data-open="https://www.raidbots.com/simbot/droptimizer">${ui('open')}${esc(t.homeRaidbots)}</button></div></div></section>`
      + `<div class="feats">${feats.map(([ic, k]) => `<div class="feat"><img src="assets/ui/${ic}.png" alt=""><div><b>${esc(t[k + 't'])}</b><p>${esc(t[k + 'd'])}</p></div></div>`).join('')}</div>`
      + `<section class="panel card"><div class="card-head"><h2>${esc(t.homeHow)}</h2></div><ol class="steps home-steps">${t.homeSteps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>`
      + `<footer class="made-by">${esc(t.madeBy)} <b>Drakko</b><svg class="heart" viewBox="0 0 24 24" width="16" height="16" aria-label="love"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 2.8 4.5 6.3 4.5c2 0 3.6 1.1 4.4 2.6l1.3 2.2 1.3-2.2c.8-1.5 2.4-2.6 4.4-2.6 3.5 0 5.4 3.7 3.9 7.2C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg></footer>`;
  }

  // ---------- Cofre semanal del personaje de la simulación (banda: 2/4/6 jefes, míticas+: 1/4/8 llaves) ----------
  const VAULT_TTL = 10 * 60 * 1000, vaultPending = new Set();
  state.vault = {};
  const vaultKey = c => `${c.region}:${c.realm}:${c.name}`.toLowerCase();
  function refreshVault(c, force = false) {
    const k = vaultKey(c), v = state.vault[k];
    if (!c.region || !c.realm || vaultPending.has(k) || (!force && v && Date.now() - v.fetched < VAULT_TTL && (!v.reset || v.reset === lastReset(c.region)))) return;
    vaultPending.add(k);
    window.api.fetchVault(c.region, c.realm, c.name).then(r => {
      vaultPending.delete(k);
      state.vault[k] = r && r.ok ? r : { ok: false, fetched: Date.now() };
      if (state.view === 'personal') { state.animateNext = false; render(); }
    });
  }
  // Recompensas de la temporada 2 de Midnight (parche 12.1): nivel de objeto de cada rango de cada calidad
  const GV_TRACKS = { adv: [266, 269, 272, 276, 279, 282], vet: [279, 282, 285, 289, 292, 295], champ: [292, 295, 298, 302, 305, 308], hero: [305, 308, 311, 315, 318, 321], myth: [318, 321, 324, 328, 331, 334] };
  const gvReward = (track, rank) => ({ track, rank, ilvl: GV_TRACKS[track][rank - 1] });
  const GV_LAST_MYTHIC = new Set([2883, 2895]); // El Altar en Espiral y Ula'tek: en mítico dan el equivalente a Mito 9 (344)
  // Banda: el cofre da un paso más que la dificultad (Buscador → Campeón, Normal → Héroe, Heroico → Mito 1/6, Mítico → Mito 6/6)
  function gvRaidReward(b) {
    if (b.diff === 4 && GV_LAST_MYTHIC.has(b.id)) return { track: 'myth', rank: 9, ilvl: 344 };
    return [null, gvReward('champ', 1), gvReward('hero', 1), gvReward('myth', 1), gvReward('myth', 6)][b.diff] || null;
  }
  // Míticas+: el nivel de la llave decide la recompensa; de +10 en adelante siempre Mito 1/6
  const gvKeyReward = lvl => lvl >= 10 ? gvReward('myth', 1) : lvl >= 7 ? gvReward('hero', 4) : lvl >= 6 ? gvReward('hero', 3) : lvl >= 4 ? gvReward('hero', 2) : lvl >= 2 ? gvReward('hero', 1) : null;
  // Mundo (bajadas y presas): como sale en el cofre del juego (Nivel 7 → 298, Nivel 8 → 305)
  const GV_WORLD = { 1: ['vet', 1], 2: ['vet', 2], 3: ['vet', 3], 4: ['vet', 4], 5: ['champ', 1], 6: ['champ', 2], 7: ['champ', 3], 8: ['hero', 1], 9: ['hero', 1], 10: ['hero', 1], 11: ['hero', 1], pn: ['vet', 1], ph: ['champ', 1], px: ['hero', 1] };
  const gvWorldReward = k => GV_WORLD[k] ? gvReward(...GV_WORLD[k]) : null;
  // Lo que pongas a mano del contenido del mundo se guarda por personaje y se borra solo en el reinicio semanal
  const gvWorldAll = load('ninjaloot.vaultWorld', {});
  function gvWorld(c) {
    const k = vaultKey(c), reset = lastReset(c.region || 'eu'), w = gvWorldAll[k];
    return w && w.reset === reset ? w : { reset, count: 0, tiers: ['', '', ''] };
  }
  function gvWorldSet(c, patch) { gvWorldAll[vaultKey(c)] = { ...gvWorld(c), ...patch }; save('ninjaloot.vaultWorld', gvWorldAll); }

  function vaultPanel(p) {
    const t = T(), c = p.character, v = state.vault[vaultKey(c)];
    refreshVault(c);
    const head = `<div class="card-head"><h2>${ui('vault')}${esc(t.gvTitle)}</h2><span class="meta">${esc(c.name)} · ${esc(t.gvSince(new Date(lastReset(c.region || 'eu')).toLocaleDateString(S().lang, { weekday: 'long', day: 'numeric', month: 'long' })))}</span><span class="spacer"></span>`
      + `<button class="btn small" data-vault-refresh${vaultPending.has(vaultKey(c)) ? ' disabled' : ''}>${esc(t.gvRefresh)}</button></div>`;
    if (!v) return `<section class="panel card vault">${head}<div class="meta vault-load">${esc(t.gvLoading)}</div></section>`;
    if (!v.ok) return `<section class="panel card vault">${head}<div class="meta vault-load">${esc(t.gvError)}</div></section>`;
    const reward = r => r ? `<span class="gv-ilvl">${r.ilvl}</span><span class="gv-trk trk-${r.track}"><i></i>${esc(t.gvTrack[r.track])} ${r.rank}/6</span>` : '';
    // Una casilla: ✓ y lo que te dará si está desbloqueada; si no, cuánto falta
    const slot = (i, n, have, src, r, extra = '', pop = '') => {
      const done = have >= n;
      return `<div class="vault-slot${done ? ' on' : ''}${done && r ? ' trkb-' + r.track : ''}" style="--i:${i}"><span class="vs-n">${done ? `✓ ${esc(t.gvNeed(n))}` : `${Math.min(have, n)}/${n} · ${esc(t.gvNeed(n))}`}</span>`
        + (done ? `${reward(r)}<span class="meta">${esc(src)}</span>` : `<b>${esc(t.gvLocked)}</b>`) + extra + (pop ? `<div class="gv-pop" role="tooltip">${pop}</div>` : '') + `</div>`;
    };
    const rowHead = (title, sub, cls = '') => `<div class="vault-row-t${cls}"><b>${esc(title)}</b><span class="meta">${esc(sub)}</span></div>`;
    const raid = (v.raid || []).map(b => ({ ...b, r: gvRaidReward(b) })).sort((a, b) => (b.r?.ilvl || 0) - (a.r?.ilvl || 0));
    const runs = v.runs || [];
    const pop = (title, rows, n) => rows.length ? `<b>${esc(title)}</b><ol>${rows.map((x, j) => `<li class="${j < n ? 'cnt' : ''}">${x}</li>`).join('')}</ol><span class="meta">${esc(t.gvPopNote(n))}</span>` : `<span class="meta">${esc(t.gvPopNone)}</span>`;
    const ilvlTag = r => r ? ` <span class="gv-trk trk-${r.track}">${r.ilvl} · ${esc(t.gvTrack[r.track])} ${r.rank}/6</span>` : '';
    const raidRows = raid.map(b => `${esc(t.gvDiff[b.diff])} · ${esc(trName(b.name))}${ilvlTag(b.r)}`);
    const runRows = runs.map(k => `+${k.level} · ${esc(k.dungeon)}${ilvlTag(gvKeyReward(k.level))}`);
    let html = `<section class="panel card vault">${head}<div class="vault-grid">`;
    html += `<div class="vault-row">${rowHead(t.gvRaid, v.raid ? t.gvBosses(raid.length) : t.gvNA)}`
      + (v.raid ? [2, 4, 6].map((n, i) => { const b = raid[n - 1]; return slot(i, n, raid.length, b ? `${t.gvDiff[b.diff]} · ${b.name}` : '', b && b.r, '', pop(t.gvPopRaid(raid.length), raidRows, n)); }).join('')
        : [0, 1, 2].map(() => `<div class="vault-slot na"><span class="meta">${esc(t.gvNA)}</span></div>`).join('')) + `</div>`;
    html += `<div class="vault-row">${rowHead(t.gvMplus, v.runs ? t.gvRuns(runs.length) : t.gvNA)}`
      + (v.runs ? [1, 4, 8].map((n, i) => { const k = runs[n - 1]; return slot(i, n, runs.length, k ? `+${k.level} · ${k.dungeon}` : '', k && gvKeyReward(k.level), '', pop(t.gvPopRuns(runs.length), runRows, n)); }).join('')
        : [0, 1, 2].map(() => `<div class="vault-slot na"><span class="meta">${esc(t.gvNA)}</span></div>`).join('')) + `</div>`;
    // Contenido del mundo: Blizzard no lo publica, así que se apunta a mano (lo que ves en tu cofre del juego)
    const w = gvWorld(c), opts = cur => `<option value="">${esc(t.gvPickTier)}</option>`
      + Array.from({ length: 11 }, (_, i) => i + 1).map(n => `<option value="${n}"${String(cur) === String(n) ? ' selected' : ''}>${esc(t.gvDelve(n))}</option>`).join('')
      + [['pn', t.gvPrey[0]], ['ph', t.gvPrey[1]], ['px', t.gvPrey[2]]].map(([k, l]) => `<option value="${k}"${cur === k ? ' selected' : ''}>${esc(l)}</option>`).join('');
    const countSel = `<select class="gv-count" data-gv-count>${Array.from({ length: 9 }, (_, i) => `<option value="${i}"${w.count === i ? ' selected' : ''}>${i === 8 ? '8+' : i}</option>`).join('')}</select>`;
    html += `<div class="vault-row">${rowHead(t.gvWorld, t.gvWorldSub)}`
      + [2, 4, 8].map((n, i) => slot(i, n, w.count, w.tiers[i] ? (/^p/.test(w.tiers[i]) ? t.gvPrey[{ pn: 0, ph: 1, px: 2 }[w.tiers[i]]] : t.gvDelve(w.tiers[i])) : t.gvPickHint, gvWorldReward(w.tiers[i]),
        w.count >= n ? `<select class="gv-tier" data-gv-tier="${i}">${opts(w.tiers[i])}</select>` : '', pop(t.gvPopWorld(w.count), w.tiers.slice(0, w.count >= 8 ? 3 : w.count >= 4 ? 2 : w.count >= 2 ? 1 : 0).filter(Boolean).map(k => `${esc(/^p/.test(k) ? t.gvPrey[{ pn: 0, ph: 1, px: 2 }[k]] : t.gvDelve(k))}${ilvlTag(gvWorldReward(k))}`), i + 1))).join('') + `</div>`;
    html += `<div class="gv-world-ctl"><label>${esc(t.gvWorldCount)} ${countSel}</label><span class="meta">${esc(t.gvWorldHint)}</span></div>`;
    return html + `</div><div class="hint">${esc(t.gvHint)}</div></section>`;
  }

  // ---------- Simulación personal: cada pieza exacta, su DPS y de qué jefe sale ----------
  function persCard(p) {
    const t = T(), col = clsColor(p), min = Number(S().minGain) || 0, items = p.items.filter(i => i.gain >= min);
    const best = items.reduce((a, i) => (!a || i.gain > a.gain ? i : a), null), srcs = new Set(items.map(i => catOfSrc(srcOf(i)))), spec = specIcon(p);
    const stat = (k, v) => `<div class="pc-stat"><small>${esc(k)}</small><b>${v}</b></div>`;
    return `<section class="panel pers-char" style="--cc:${col}">${spec ? `<img class="pch-ic" src="${spec}" alt="">` : ''}`
      + `<div class="pch-id"><h2 style="color:${readable(col)}">${esc(p.character.name)}</h2><div class="meta">${esc([specName(p), clsName(p), p.character.realm].filter(Boolean).join(' · '))}</div></div>`
      + `<div class="pch-stats">${p.head && p.head.avgIlvl ? stat(t.shAvgIlvl, p.head.avgIlvl) : ''}${stat(t.baseDps, nf().format(p.baseDps))}${stat(t.persSumItems, items.length)}${stat(t.persSumSources, srcs.size)}${best ? stat(t.persSumTop, `<span class="pc-g">+${nf().format(best.gain)}</span>`) : ''}</div></section>`;
  }
  function personalView() {
    const t = T(), p = state.personal, list = state.personalList, multi = list.length > 1;
    const simOf = it => list[it.sim || 0] || list[0];
    let html = `<section class="panel card"><div class="card-head"><h2>${esc(t.persTitle)}</h2></div><div class="hint">${esc(t.persHint)}</div>`
      + `<div class="pers-form"><input id="personalUrl" class="txt" spellcheck="false" placeholder="${esc(t.persUrl)}" value="${esc(state.personalUrl || (list.length === 1 ? list[0].url : ''))}"><button class="btn primary" data-personal-load>${esc(t.persLoad)}</button>`
      + (state.sims.length ? (() => {
        // Desplegable con el ICONO de la especialización de cada personaje (un <select> nativo no puede mostrar imágenes)
        const cur = !multi && p ? state.sims.find(s => s.id === p.id) : null, specImg = s => specIcon(s) ? `<img class="sp-ic" src="${specIcon(s)}" alt="">` : '';
        return `<div class="spec-pick" id="personalPick"><button type="button" class="txt spec-pick-btn" data-pick-toggle>${cur ? `${specImg(cur)}<span style="color:${readable(clsColor(cur))}">${esc(cur.character.name)}</span>` : `<span class="meta">${esc(t.persUse)}</span>`}<span class="caret">▾</span></button>`
          + `<div class="spec-pick-menu" hidden>${state.sims.map(s => `<button type="button" class="sp-item${cur && cur.id === s.id ? ' on' : ''}" data-pick="${esc(s.id)}" title="${esc(specName(s))}">${specImg(s)}<span style="color:${readable(clsColor(s))}">${esc(s.character.name)}</span></button>`).join('')}</div></div>`;
      })() : '')
      + `</div>`
      + slotsHTML(list)
      + `</section>`;
    if (!p) return html + `<div class="empty">${emptyArt('personal')}<h2>${esc(t.persEmptyTitle)}</h2><p>${esc(t.persEmptyText)}</p></div>`;
    const col = clsColor(p), max = p.items[0]?.gain || 1, min = Number(S().minGain) || 0;
    html += persCard(p);
    // Fuentes presentes (raid, mazmorras...) y filtro elegido
    const cats = {}; for (const it of p.items) { const c = catOfSrc(srcOf(it)); cats[c] = (cats[c] || 0) + 1; }
    const catKeys = ['raid', 'dungeon', 'delve', 'prey', 'catalyst', 'craft', 'pvp', 'bonus', 'other'].filter(k => cats[k]);
    const pcat = catKeys.includes(S().persCat) ? S().persCat : 'all';
    const shownItems = pcat === 'all' ? p.items : p.items.filter(it => catOfSrc(srcOf(it)) === pcat);
    // Botín por jefe: las piezas se agrupan por su fuente (jefe, mazmorra...) y los grupos van de más a menos DPS en total
    const groups = new Map();
    shownItems.filter(i => i.gain >= min).forEach(it => {
      state.shown.add(it.id);
      const st = srcText(it), key = (st && st.name) || '';
      if (!groups.has(key)) groups.set(key, { st, src: srcOf(it), items: [], total: 0 });
      const g = groups.get(key);
      g.items.push(it); g.total += it.gain;
    });
    // Orden de las tarjetas (solo con las piezas de raid): prioridad, orden de jefes de la raid, valor esperado o mejor pieza
    const lootSort = ['priority', 'boss', 'ev', 'best'].includes(S().lootSort) ? S().lootSort : 'priority';
    const bossPos = new Map(state.bosses.groups.flatMap(g => g.bosses).map((b, i) => [b.id, i]));
    const posOf = g => (g.src && bossPos.has(g.src.encounter) ? bossPos.get(g.src.encounter) : 999);
    // Como Raidbots: Expected Value = DPS medio de TODAS las piezas de la tabla del jefe (las que no mejoran cuentan 0);
    // Best = la mejor pieza; Priority = jefes con valor esperado parecido (a menos de 0,2 %) agrupados y, dentro, primero el que más probabilidad tiene de dar una mejora
    const counts = (p.lootCounts) || ((list[0] && list[0].lootCounts) || {});
    const sizeOf = g => Math.max(g.items.length, (g.src && counts[g.src.encounter + (g.items[0] && g.items[0].tier === 'catalyst' ? ':c' : '')]) || 0, 1);
    const avg = g => g.total / sizeOf(g), top = g => Math.max(...g.items.map(i => i.gain));
    const chance = g => g.items.length / sizeOf(g);
    const byGain = (x, y) => y.total - x.total;
    const byEv = (x, y) => avg(y) - avg(x) || byGain(x, y);
    const byPriority = (arr) => {
      const sorted = arr.slice().sort(byEv), out = [], base = (p.baseDps || 1) / 100;
      let bucket = [];
      for (const g of sorted) {
        if (bucket.length && (avg(bucket[0]) - avg(g)) / base > 0.2) { out.push(...bucket.sort((x, y) => chance(y) - chance(x) || byEv(x, y))); bucket = []; }
        bucket.push(g);
      }
      return out.concat(bucket.sort((x, y) => chance(y) - chance(x) || byEv(x, y)));
    };
    const cmp = { priority: null, boss: (x, y) => posOf(x) - posOf(y) || byGain(x, y), ev: byEv, best: (x, y) => top(y) - top(x) || byGain(x, y) }[lootSort];
    const sortBar = `<div class="loot-sortbar"><label class="meta" for="lootSort" title="${esc(t.lootSortHint)}">${esc(t.lootSortLabel)}:</label><select id="lootSort" title="${esc(t.lootSortHint)}">${[['priority', t.lootSortPriority], ['boss', t.lootSortBoss], ['ev', t.lootSortEv], ['best', t.lootSortBest]].map(([k, l]) => `<option value="${k}"${k === lootSort ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
    const groupsHTML = (cmp ? [...groups.values()].sort(cmp) : byPriority([...groups.values()])).map(g => {
      const cat = g.src ? catOfSrc(g.src) : '', st = g.st;
      const ic = cat === 'dungeon' && st ? nameImg(st.name, 36) : cat === 'raid' && g.src ? bossImg(g.src.encounter, 36) : '';
      const rowsHTML = g.items.map(it => {
        const info = itemInfo(it);
        return `<div class="lg-row${owned(p, it) ? ' owned-row' : ''}" data-item="${it.id}" data-ilvl="${it.ilvl}" data-gain="${esc(gainLine(it))}"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}">`
          + `<div class="lg-n"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span>${info.tag ? ` <span class="meta">${esc(info.tag)}</span>` : ''}`
          + `<small>${multi ? `<span class="sim-dot" style="background:${SIM_COLORS[(it.sim || 0) % SIM_COLORS.length]}"></span>` : ''}${esc(capFirst(t.slots[it.slot] || it.slot || ''))}</small>${catNote(it)}</div>`
          + `<div class="lg-g"><b>+${nf().format(it.gain)}</b> <span class="meta">(${it.pct.toFixed(2)}%)</span></div></div>`;
      }).join('');
      return `<section class="lg-boss"><header class="lg-head">${ic || '<span class="lg-ph"></span>'}<div class="lg-t"><b>${esc(st ? st.name : t.persNoBoss)}</b>${st && st.sub ? `<span class="meta">${esc(st.sub)}</span>` : ''}</div>`
        + `<div class="lg-tot"><b>+${nf().format(g.total)}</b><span class="meta">${g.items.length} ${esc(t.items)}</span></div></header>${rowsHTML}</section>`;
    }).join('');
    html += stalePanel(list.map(r => ({ ...r, gearId: list[0].id, character: { ...r.character, name: multi ? `${r.character.name} · ${simLabel(r)}` : r.character.name } })));
    html += vaultPanel(list[0]);
    const pm = S().persMode === 'cmp' && !multi ? 'all' : (S().persMode || 'all');
    html += `<div class="charts-bar"><div class="seg"><button data-pmode="all" class="${pm === 'all' ? 'on' : ''}">${esc(t.pAll)}</button>${multi ? `<button data-pmode="cmp" class="${pm === 'cmp' ? 'on' : ''}">${esc(t.pCompare)}</button>` : ''}<button data-pmode="coin" class="${pm === 'coin' ? 'on' : ''}">${esc(t.pCoin)}</button></div>`
      + (pm === 'all' && catKeys.length > 1 ? `<div class="diffbar"><span class="meta">${esc(t.srcLabel)}:</span><div class="seg"><button data-pcat="all" class="${pcat === 'all' ? 'on' : ''}">${esc(t.catAll)}</button>${catKeys.map(k => `<button data-pcat="${k}" class="${pcat === k ? 'on' : ''}">${esc(catName(k))}</button>`).join('')}</div></div>` : '') + `</div>`;
    if (pm === 'coin') return html + coinSection(p);
    if (pm === 'cmp') return html + compareSection(list);
    // Comparativa: la mejor pieza de cada fuente (raid, mazmorras...) para ver de un vistazo dónde está el mayor salto
    if (catKeys.length > 1) {
      const bestOf = k => p.items.find(it => catOfSrc(srcOf(it)) === k && !owned(p, it)) || p.items.find(it => catOfSrc(srcOf(it)) === k);
      const bests = catKeys.map(k => [k, bestOf(k)]), topGain = Math.max(...bests.map(([, it]) => it.gain));
      html += `<div class="pers-compare">${bests.map(([k, it]) => { const info = itemInfo(it), st = srcText(it); state.shown.add(it.id);
        return `<button class="pc-card${pcat === k ? ' on' : ''}${it.gain === topGain ? ' top' : ''}" data-pcat="${k}" data-item="${it.id}" data-ilvl="${it.ilvl}" data-gain="${esc(gainLine(it))}">`
          + `<span class="pc-cat">${it.gain === topGain ? '★ ' : ''}${esc(catName(k))} <span class="meta">${cats[k]} ${esc(t.items)}</span></span>`
          + `<span class="pc-item"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span></span>`
          + `<span class="pc-gain"><b>+${nf().format(it.gain)}</b> <span class="meta">(${it.pct.toFixed(2)}%)</span></span>${st ? `<span class="meta pc-src">${esc(st.name)}</span>` : ''}</button>`; }).join('')}</div>`;
    }
    html += `<section class="panel card">${multi ? '' : simHeader(p)}<div class="card-head">${multi && specIcon(p) ? `<img class="cls-icon" src="${specIcon(p)}" alt="" style="border-color:${col}">` : ''}`
      + `<div>${multi ? `<h2 style="color:${readable(col)}">${esc(p.character.name)}</h2>` : `<h2>${diffBadge(p.difficulty)}</h2>`}<div class="meta">${esc([specName(p), clsName(p), p.character.realm].filter(Boolean).join(' · '))}${multi ? ` — ${esc(t.persSimsCount(list.length))}` : ` — ${esc(t.baseDps)}: ${nf().format(p.baseDps)}`}</div></div>`
      + `<span class="spacer"></span><div class="card-tools">${list.map(r => `<button class="btn small" data-open="${esc(r.url)}">${ui('open')}${esc(t.openRaidbots)}${multi ? ' · ' + esc(simLabel(r)) : ''}</button>`).join('')}</div></div>`
      + (groupsHTML ? `${sortBar}<div class="loot-grid">${groupsHTML}</div>` : `<div class="hint">${esc(t.persNoBoss)}</div>`) + `</section>`;
    return html;
  }

  // Comparar sims del mismo personaje (1T 5m, 5T 1m, raid, míticas...): una fila por objeto y una columna por sim
  function compareSection(list) {
    const t = T(), min = Number(S().minGain) || 0, rows = new Map();
    list.forEach((r, si) => r.items.forEach(it => {
      const k = `${it.id}:${it.ilvl}`;
      if (!rows.has(k)) rows.set(k, { it, gains: [] });
      const row = rows.get(k);
      if (!(row.gains[si] && row.gains[si].gain >= it.gain)) row.gains[si] = it;
    }));
    const sorted = [...rows.values()].map(r => ({ ...r, top: Math.max(...r.gains.filter(Boolean).map(g => g.gain)) })).filter(r => r.top >= min).sort((a, b) => b.top - a.top);
    const head = list.map((r, i) => `<th class="cmp-col"><span class="sim-dot" style="background:${SIM_COLORS[i % SIM_COLORS.length]}"></span>${esc(simLabel(r))}</th>`).join('');
    const body = sorted.map(({ it, gains, top }) => {
      state.shown.add(it.id);
      const info = itemInfo(it), st = srcText(it);
      return `<tr data-item="${it.id}" data-ilvl="${it.ilvl}"><td class="it"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span></td>`
        + `<td>${esc(capFirst(t.slots[it.slot] || it.slot || ''))}</td><td>${it.ilvl || ''}</td><td class="bs">${st ? esc(st.name) : `<span class="meta">${esc(t.persNoBoss)}</span>`}</td>`
        + list.map((_, i) => { const g = gains[i]; return g ? `<td class="cmp-cell${g.gain === top && gains.filter(Boolean).length > 1 ? ' cmp-best' : ''}">+${nf().format(g.gain)} <span class="meta">(${g.pct.toFixed(2)}%)</span></td>` : `<td class="cmp-cell meta">—</td>`; }).join('')
        + `</tr>`;
    }).join('');
    return `<section class="panel card"><div class="card-head"><h2>${esc(t.cmpTitle)}</h2></div><div class="hint">${esc(t.cmpHint)}</div>`
      + `<div class="ptable-wrap"><table class="ptable cmp-table"><thead><tr><th>${esc(t.colItem)}</th><th>${esc(t.colSlot)}</th><th>${esc(t.colIlvl)}</th><th>${esc(t.colBoss)}</th>${head}</tr></thead><tbody>${body}</tbody></table></div></section>`;
  }

  // Dónde tirar moneda: plan para varias semanas, una moneda por ranura (anillos y abalorios, hasta 2), de más a menos DPS
  // Contenido donde se puede tirar moneda (bonus roll): banda, cofre de míticas+, bajadas y presas
  const COIN_CATS = ['raid', 'dungeon', 'delve', 'prey', 'bonus'];
  function coinSection(p) {
    const t = T(), coins = Math.max(1, Math.min(20, Number(S().coins) || 5));
    const src = ['all', 'raid', 'dungeon'].includes(S().coinSrc) ? S().coinSrc : 'all';
    const cands = p.items.map(it => ({ it, s: srcOf(it) })).filter(r => r.s && (src === 'all' ? COIN_CATS : [src]).includes(catOfSrc(r.s)) && (catOfSrc(r.s) !== 'raid' || r.s.encounter > 0) && srcText(r.it) && !owned(p, r.it)).sort((x, y) => y.it.gain - x.it.gain);
    // Si ya te llevas un casco con la moneda 1, otro casco no aporta: se salta a la mejor pieza de otra ranura
    const group = sl => /^finger/.test(sl) ? 'finger' : /^trinket/.test(sl) ? 'trinket' : sl || '?', cap = g => g === 'finger' || g === 'trinket' ? 2 : 1;
    const used = {}, ids = new Set(), rows = [];
    for (const r of cands) {
      if (rows.length >= coins) break;
      const g = group(r.it.slot);
      if ((used[g] || 0) >= cap(g) || ids.has(r.it.id)) continue;
      used[g] = (used[g] || 0) + 1; ids.add(r.it.id); rows.push(r);
    }
    const pick = `<label class="coin-count">${esc(t.coinAsk)} <select id="coinCount">${Array.from({ length: 20 }, (_, i) => i + 1).map(n => `<option value="${n}"${n === coins ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`;
    const srcSeg = `<div class="seg">${[['all', t.coinSrcAll], ['raid', t.coinSrcRaid], ['dungeon', t.coinSrcDungeon]].map(([k, l]) => `<button data-coin-src="${k}" class="${src === k ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>`;
    let body = rows.length ? '' : `<div class="hint">${esc(t.coinNone)}</div>`;
    const pct = S().unit === 'pct';
    // Resumen del plan, podio con las tres mejores monedas y el resto en lista
    const totalGain = rows.reduce((x, r) => x + r.it.gain, 0), totalPct = rows.reduce((x, r) => x + r.it.pct, 0);
    const sources = new Set(rows.map(r => srcText(r.it).name)).size;
    const gainTxt = it => (pct ? `+${it.pct.toFixed(2)}%` : `+${nf().format(it.gain)}`);
    const pctTxt = it => (pct ? '' : ` <span class="meta">(${it.pct.toFixed(2)}%)</span>`);
    const itemChip = (it, cls = '') => {
      const info = itemInfo(it); state.shown.add(it.id);
      return `<div class="coin-item cp-item ${cls}" style="--ic:${QUALITY_COLORS[info.quality]}" data-item="${it.id}" data-ilvl="${it.ilvl}" data-gain="${esc(gainLine(it))}"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><div><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span> <span class="meta">${esc(info.tag)}</span><small class="cp-sl">${esc(capFirst(T().slots[it.slot] || it.slot || ''))}</small></div></div>`;
    };
    const bossBlock = it => {
      const st = srcText(it), c = catOfSrc(srcOf(it));
      const ic = c === 'dungeon' ? nameImg(st.name, 36) : c === 'raid' ? bossImg(srcOf(it).encounter, 36) : '';
      const sub = st.sub && st.sub !== catName(c) ? `<div class="meta">${esc(st.sub)}</div>` : '';
      return `<div class="coin-boss${ic ? ' has-ic' : ''}">${ic}<div class="cb-tx"><span class="coin-cat cat-${c}">${esc(catName(c))}</span><b>${esc(st.name)}</b>${sub}</div></div>`;
    };
    if (rows.length) {
      body += `<div class="coin-sum"><div><small>${esc(t.coinSumCoins)}</small><b>${rows.length}</b></div><div><small>${esc(t.coinSumGain)}</small><b class="g">+${nf().format(totalGain)}</b></div><div><small>${esc(t.coinSumPct)}</small><b class="g">+${totalPct.toFixed(2)}%</b></div><div><small>${esc(t.coinSumBosses)}</small><b>${sources}</b></div></div>`;
      body += '<div class="coin-pod">' + rows.slice(0, 3).map(({ it }, i) => `<article class="coin-card${i === 0 ? ' first' : ''}"><span class="cp-rk">${esc(t.coinNum(i + 1))}</span>${itemChip(it)}<div class="cp-big">${gainTxt(it)}${pctTxt(it)}</div>${bossBlock(it)}${catNote(it)}</article>`).join('') + '</div>';
      if (rows.length > 3) {
        body += '<div class="coin-list">' + rows.slice(3).map(({ it }, i) => `<div class="coin-line"><span class="coin-rank">${i + 4}</span>${itemChip(it, 'cl-item')}<div class="cl-boss">${bossBlock(it)}${catNote(it)}</div><div class="cl-gain"><span class="coin-gain">${gainTxt(it)}</span>${pctTxt(it)}</div></div>`).join('') + '</div>';
      }
    }
    return `<section class="panel card"><div class="card-head"><h2>${esc(t.coinTitle)}</h2><span class="spacer"></span>${srcSeg}${pick}</div><div class="hint">${esc(t.coinHint(coins))}</div>${body}</section>`;
  }

  // Combina las simulaciones de una misma persona en una sola lista de objetos, de más a menos DPS (cada uno recuerda de qué sim viene)
  function mergePersonal(list) {
    if (!list.length) return null;
    const best = new Map();
    list.forEach((r, si) => r.items.forEach(it => {
      const s = it.source || {}, key = `${it.id}:${it.ilvl}:${s.instance ?? ''}:${s.encounter ?? ''}`, prev = best.get(key);
      if (!prev || it.gain > prev.gain) best.set(key, { ...it, sim: si });
    }));
    return { ...list[0], items: [...best.values()].sort((a, b) => b.gain - a.gain), sims: list };
  }
  const normName = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const sameChar = (a, b) => normName(a.character.name) === normName(b.character.name) && (!a.character.realm || !b.character.realm || normName(a.character.realm) === normName(b.character.realm));
  function setPersonalList(list) {
    state.personalList = list; state.personal = mergePersonal(list);
    save('ninjaloot.personalList', list); refreshGear();
  }
  // Fuente principal de una simulación (Raid, Mazmorras...) y su etiqueta, p. ej. «Raid MM»
  function simCategory(r) {
    if (r.slot) return r.slot; // cargada en un hueco concreto (Raid, Míticas+, Delves): se respeta
    const count = {}; for (const it of r.items) { const c = catOfSrc(srcOf(it)); count[c] = (count[c] || 0) + 1; }
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]), tot = r.items.length || 1;
    return top.length > 1 && top[0][1] / tot < 0.75 ? 'mixed' : (top[0] || ['other'])[0];
  }
  const catName = k => k === 'mixed' ? T().persMixed : (T()['cat' + k[0].toUpperCase() + k.slice(1)] || k);
  // Tipo de pelea: «1T 5m», «5T 1m»... (y el estilo si no es el normal, p. ej. DungeonSlice)
  const fightLabel = r => r.fight && r.fight.targets ? `${r.fight.targets}T ${Math.round((r.fight.secs || 300) / 60)}m${r.fight.style && !/patchwerk/i.test(r.fight.style) ? ' ' + r.fight.style : ''}` : '';
  const simLabel = r => [catName(simCategory(r)), r.difficulty ? DIFF_TAG[r.difficulty] : '', fightLabel(r)].filter(Boolean).join(' ');
  const SIM_COLORS = ['#b04df5', '#3fcf6a', '#f0a030', '#3fc7eb', '#ee5a45', '#e8d44d'];
  const simAge = r => { const d = r.simDate ? Math.floor((Date.now() - r.simDate) / 864e5) : null; if (d == null) return ''; const tm = new Date(r.simDate).toLocaleTimeString({ es: 'es-ES', en: 'en-GB' }[S().lang] || 'es-ES', { hour: '2-digit', minute: '2-digit' }); return `${d < 1 ? T().simToday : T().simDays(d)}, ${tm}`; };

  // Huecos fijos para cargar una simulación de cada tipo (raid, míticas+, delves); las sims de otro tipo o mixtas salen como hueco extra
  const SLOT_KEYS = ['raid', 'dungeon', 'other']; // «Otro contenido»: cualquier sim que no sea de raid ni de míticas (delves, profesiones, PvP...)
  function slotsHTML(list) {
    const t = T(), used = new Set();
    const card = (k, r, i) => `<div class="pslot${r ? ' full' : ''}"${r ? ` style="--sc:${SIM_COLORS[i % SIM_COLORS.length]}"` : ''}><div class="pslot-head">${esc(t.slotNames[k] || catName(k))}</div>`
      + (r ? `<div class="pslot-sim"><div><b>${esc(simLabel(r))}</b><div class="meta">${nf().format(r.baseDps)} DPS${simAge(r) ? ' · ' + esc(simAge(r)) : ''}</div></div><button class="btn small" data-open="${esc(r.url)}">${ui('open')}Raidbots</button><button class="btn small danger" data-pers-remove="${esc(r.id)}" title="${esc(t.remove)}">${xmark}</button></div>`
        : `<div class="pslot-form"><input class="txt slot-input" data-slot="${k}" spellcheck="false" placeholder="${esc(t.slotPlaceholder(k === 'other' ? (t.slotNames[k] || '').toLowerCase() : t.slotNames[k] || catName(k)))}"><button class="btn small" data-slot-load="${k}">${esc(t.persLoad)}</button></div>`)
      + `</div>`;
    let html = '';
    for (const k of SLOT_KEYS) {
      const i = list.findIndex((r, j) => !used.has(j) && (k === 'other' ? !['raid', 'dungeon'].includes(simCategory(r)) : simCategory(r) === k));
      if (i >= 0) used.add(i);
      html += card(k, i >= 0 ? list[i] : null, i);
    }
    list.forEach((r, i) => { if (!used.has(i)) html += card(simCategory(r), r, i); });
    return `<div class="pslots">${html}</div>`;
  }

  // Carga una o varias simulaciones: si son de la misma persona se añaden a las que ya hay; si es otra persona, se empieza una lista nueva
  async function loadPersonal(text, slot) {
    const t = T(), ids = extractIds(text);
    if (!ids.length) { toast(t.noUrls, true); return; }
    const results = await Promise.all(ids.map(id => window.api.fetchReport(id).then(r => ({ id, r }))));
    const ok = [];
    for (const { id, r } of results) { if (r.ok) ok.push(slot ? { ...r.report, slot } : r.report); else toast(`${id}: ${errText(r)}`, true); }
    if (!ok.length) return;
    let list = state.personalList.slice(), added = 0;
    if (list.length && !sameChar(list[0], ok[0])) { list = []; toast(t.persNewChar(ok[0].character.name)); }
    for (const rep of ok) {
      if (list.length && !sameChar(list[0], rep)) { toast(t.persOtherChar(rep.character.name), true); continue; }
      const i = list.findIndex(x => x.id === rep.id);
      if (i >= 0) list[i] = rep; else list.push(rep);
      added++;
    }
    setPersonalList(list);
    if (added) toast(t.persAdded(added, list.length));
    state.animateNext = true; render();
  }

  // ---------- Render ----------
  function render() {
    const t = T();
    syncRoute();
    if (tipEl) { tipEl.hidden = true; tipEl.dataset.cur = ''; tipKey = null; } // el contenido se redibuja: fuera tooltips colgados
    document.documentElement.lang = S().lang;
    $('#urlInput').placeholder = t.urlPlaceholder;
    $('#btnAdd').textContent = t.add; $('#btnPaste').textContent = t.paste; $('#btnClear').textContent = t.clearAll;
    $('#btnExportData').textContent = t.exportData; $('#btnExportData').disabled = !state.sims.length;
    $('#btnSessions').textContent = t.sessions; $('#btnShare').textContent = t.share; $('#btnShare').disabled = !state.sims.length && !state.extra.length;
    $('#btnClear').disabled = !state.sims.length && !state.extra.length;
    $('#btnLoot').textContent = t.lootBtn;
    $('#langLabel').textContent = t.language; renderLangMenu();
    $('#navHome').textContent = t.navHome; $('#navCharts').textContent = t.navCharts; $('#navRot').textContent = t.navRotations; $('#navTiers').textContent = t.navTiers; $('#navRoster').textContent = t.navRoster;$('#navPers').textContent = t.navPersonal;
    document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('on', b.dataset.view === state.view));
    $('#chartsTools').hidden = state.view !== 'charts';
    $('#btnLang').title = t.language; $('#btnSettings').title = `${t.settings} (Ctrl+,)`;
    renderChips();
    const content = $('#content');
    if (state.view === 'rotations') {
      const sy = document.scrollingElement.scrollTop, sx = $('.rtable-wrap')?.scrollLeft || 0;
      renderRotations();
      document.scrollingElement.scrollTop = sy;
      const w = $('.rtable-wrap'); if (w) w.scrollLeft = sx;
      return;
    }
    state.shown = new Set();
    if (state.view === 'home') { content.innerHTML = homeView(); return; }
    if (state.view === 'tiers') { content.innerHTML = tiersView(); ensureNames(); fillTierStats(); return; }
    if (state.view === 'roster') { content.innerHTML = rosterView(); return; }
    if (state.view === 'personal') {
      content.innerHTML = personalView();
      ensureNames();
      return;
    }
    if (!state.sims.length && state.loading.size) { content.innerHTML = skeletonHtml(Math.max(2, state.loading.size)); return; }
    if (!state.sims.length && state.extra.length) { content.innerHTML = extraSection(); if (S().animations) enterAnim(content); ensureNames(); return; }
    if (!state.sims.length) {
      content.innerHTML = `<div class="empty">${emptyArt('charts')}<h2>${esc(t.emptyTitle)}</h2><p>${esc(t.emptyText)}</p></div>`;
      return;
    }
    const colors = themeColors(), animate = state.animateNext && S().animations;
    state.animateNext = false;
    const act = activeSims(), pct = S().unit === 'pct';
    const chartOpts = { hScale: S().chartTall ? 1.3 : 1, colors, animate, showValues: S().showValues, showIcons: S().showIcons, compact: S().compact, yTitle: pct ? t.yAxisPct : t.yAxisDps, tickFmt: pct ? v => `${v.toFixed(v % 1 ? 1 : 0)}%` : null };
    let html = extraSection() + statTiles(act) + toolbarHtml() + (act.length ? '' : `<div class="panel card"><div class="hint">${esc(t.filterNone)}</div></div>`) + stalePanel(act);
    html += `<div class="charts-bar sub"><div class="seg" role="group" aria-label="${esc(t.unitLabel)}"><button data-unit="dps" class="${pct ? '' : 'on'}">${esc(t.unitDps)}</button><button data-unit="pct" class="${pct ? 'on' : ''}">${esc(t.unitPct)}</button></div>`
      + `<button class="btn" data-capture>${ui('export')}${esc(t.captureMode)}</button>`
      + `<div class="seg"><button data-barstyle="simple" class="${detailed() ? '' : 'on'}">${esc(t.barSimple)}</button><button data-barstyle="detailed" class="${detailed() ? 'on' : ''}">${esc(t.barDetailed)}</button></div></div>`;
    html += S().chartMode === 'player' ? playerCharts(act, chartOpts) : bossCharts(act, chartOpts);
    if (S().showCaution) html += cautionSection();
    const scroll = document.scrollingElement.scrollTop;
    content.innerHTML = html + (state.loading.size ? skeletonHtml(state.loading.size) : '');
    document.scrollingElement.scrollTop = scroll;
    if (animate) enterAnim(content);
    ensureNames();
  }

  // ---------- Quick Sim y Top Gear ----------
  // Cabecera de una simulación al estilo de Raidbots: tipo de sim, DPS, opciones, personaje, equipo y exportación de SimC
  // Piezas de Ula'tek pasadas a catalizador: si la pieza de origen tiene una sola estadística y una pasiva, la de tier conserva las dos cosas
  const BIBELOT = { id: 270909, icon: 'rogue_paralytic_poison' };
  const ULATEK_ENC = 2895, KITHIX_ENC = 2896;
  function catNote(it) {
    const t = T(), cf = it.catFrom, enc = it.source && it.source.encounter;
    if (!it.tier || (enc !== ULATEK_ENC && enc !== KITHIX_ENC)) return '';
    if (enc === KITHIX_ENC) {
      if (!(cf && cf.stats && cf.stats.length && cf.same)) return '';
      state.shown.add(cf.from);
      const nm = itemInfo({ id: cf.from, name: cf.name }).name;
      return `<div class="cat-note">${esc(t.catKeepAll(cf.stats.map(x => t.statNames[x] || x).join(' + '), nm))}</div>`;
    }
    if (cf && cf.stats && cf.stats.length === 1 && cf.same) {
      state.shown.add(cf.from);
      const nm = itemInfo({ id: cf.from, name: cf.name }).name;
      return `<div class="cat-note">${esc(t.catKeep(t.statNames[cf.stats[0]] || cf.stats[0], nm))}</div>`;
    }
    state.shown.add(BIBELOT.id);
    const bn = t.bibelotName;
    return `<div class="cat-note bib"><img src="${WEB_ICON(BIBELOT.icon)}" alt="" data-item="${BIBELOT.id}"> <b>${esc(bn)}</b> <span>${esc(t.bibelotNote)}</span></div>`;
  }
  // Iconos que no cargan: primero el CDN de iconos de Blizzard, luego el icono que da Wowhead para esa pieza y, si nada sirve, el signo de interrogación.
  // Los iconos de jefe que fallan se quitan. (Un controlador onerror en línea no vale con la política de seguridad de la web.)
  document.addEventListener('error', e => {
    const im = e.target;
    if (!im || im.tagName !== 'IMG') return;
    if (im.classList.contains('boss-ic')) { if (!im.dataset.cdn && im.dataset.bid) { im.dataset.cdn = '1'; im.src = `https://assets.rpglogs.com/img/warcraft/bosses/${im.dataset.bid}-icon.jpg`; } else im.remove(); return; }
    if (!im.classList.contains('sh-img')) return;
    const step = Number(im.dataset.fb || 0);
    im.dataset.fb = step + 1;
    const id = Number(im.parentElement && im.parentElement.dataset.item), ic = im.dataset.ic;
    if (step === 0 && ic) im.src = `https://render.worldofwarcraft.com/eu/icons/56/${ic}.jpg`;
    else if (step <= 1 && id) { const alt = itemInfo({ id }).icon; im.src = alt && alt !== im.src ? alt : 'assets/ui/questionmark.jpg'; }
    else im.src = 'assets/ui/questionmark.jpg';
  }, true);
  // Retrato 3D del personaje: se pide una vez a Blizzard y se recuerda
  const portraits = load('ninjaloot.portraits', {}), portraitReq = new Set();
  const trackColor = tr => (/myth/i.test(tr) ? '#ff8000' : /hero/i.test(tr) ? '#a335ee' : /champion/i.test(tr) ? '#0070ff' : /veteran/i.test(tr) ? '#1eff00' : tr ? '#9d9d9d' : '');
  // Sin dato de mejora (sims antiguas o piezas crafteadas): el color sale del nivel de objeto, por tramos de esta temporada
  const ilvlColor = il => (il >= 322 ? '#ff8000' : il >= 305 ? '#a335ee' : il >= 292 ? '#0070ff' : il >= 279 ? '#1eff00' : il > 0 ? '#9d9d9d' : '');
  function portraitOf(sim) {
    const c = sim.character || {}, region = String(c.region || (sim.head && sim.head.region) || '').toLowerCase(), key = [region, c.realm, c.name].join(':').toLowerCase();
    if (!region || !c.realm || !c.name) return '';
    if (portraits[key]) return portraits[key];
    if (!portraitReq.has(key) && window.api && window.api.fetchPortrait) {
      portraitReq.add(key);
      window.api.fetchPortrait(region, c.realm, c.name).then(r => { if (r && r.ok && r.url) { portraits[key] = r.url; save('ninjaloot.portraits', portraits); state.animateNext = false; render(); } }).catch(() => {});
    }
    return '';
  }
  const HEAD_ORDER = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands', 'waist', 'legs', 'feet', '|', 'finger1', 'finger2', '|', 'trinket1', 'trinket2', '|', 'mainHand', 'offHand'];
  function simHeader(sim, compact = false) {
    const t = T(), h = sim.head || {}, col = clsColor(sim), f = nf();
    const kind = sim.kind;
    const title = kind === 'topgear' ? t.shTop : kind === 'quick' ? t.shQuick : t.shDrop;
    const best = kind === 'drop' ? sim.baseDps + ((sim.items && sim.items[0] && sim.items[0].gain) || 0) : kind === 'topgear' ? ((sim.combos && sim.combos[0] && sim.combos[0].dps) || sim.baseDps) : sim.baseDps;
    const dpsLbl = kind === 'drop' ? t.shBestItem : kind === 'topgear' ? t.shBestCombo : t.shDps;
    const rk = String(h.race || '').toLowerCase().replace(/[^a-z]/g, '');
    const race = (t.shRaces && t.shRaces[rk]) || (h.race ? capFirst(String(h.race).replace(/_/g, ' ')) : '');
    const realm = h.realmName || (sim.character && sim.character.realm) || '';
    const realmTxt = realm ? `${realm}${h.region ? ` (${h.region})` : ''}` : '';
    const fight = sim.fight ? [sim.fight.style, sim.fight.targets ? `${sim.fight.targets}T` : '', sim.fight.secs ? `${sim.fight.secs} s` : ''].filter(Boolean).join(' · ') : '';
    const slots = HEAD_ORDER.map(k => {
      if (k === '|') return '<i class="sh-gap"></i>';
      const it = h.equipped && h.equipped[k];
      if (!it) return '';
      const info = itemInfo({ id: it.id, name: it.name }); state.shown.add(it.id);
      const src = it.icon ? WEB_ICON(it.icon) : info.icon, q = QUALITY_COLORS[it.quality == null ? info.quality : it.quality] || QUALITY_COLORS[4];
      const tc = trackColor(it.track) || ilvlColor(it.ilvl);
      return `<span class="sh-slot" data-item="${it.id}" data-ilvl="${it.ilvl || ''}" title="${esc(it.name || info.name)}${it.track ? ' · ' + esc(it.track) : ''}"><b class="sh-il"${tc ? ` style="color:${tc}"` : ''}>${it.ilvl || ''}</b><img class="sh-img" data-ic="${esc(it.icon || '')}" src="${src}" alt="" style="border-color:${q}"></span>`;
    }).join('');
    const spec = specIcon(sim), portrait = portraitOf(sim);
    return `<div class="sim-hdr" style="--cc:${col}${compact ? '' : ''}"><div class="sh-top"><div class="sh-tt"><h2 class="sh-title">${esc(title)}</h2>${h.subtitle || sim.title ? `<div class="sh-sub">${esc(h.subtitle || sim.title)}</div>` : ''}</div>`
      + `<div class="sh-dps"><b>${f.format(Math.round(best))} <span>DPS</span></b><small>${esc(dpsLbl)}</small></div></div>`
      + `<div class="sh-mid"><div class="sh-port${portrait ? ' has-3d' : ''}"${portrait ? ` style="background-image:url('${esc(portrait)}')"` : ''}>${portrait ? '' : (spec ? `<img src="${spec}" alt="">` : '')}</div><div class="sh-char"><h3 style="color:${readable(col)}">${esc(sim.character.name)}</h3><div class="sh-chips">${spec ? `<img src="${spec}" alt="" title="${esc(specName(sim))}">` : ''}${fight ? `<span class="sh-chip">${esc(fight)}</span>` : ''}${kind === 'drop' ? diffBadge(sim.difficulty) : ''}</div></div>`
      + `<div class="sh-meta"><div>${h.level ? h.level + ' ' : ''}${race ? esc(race) + ' ' : ''}<b style="color:${readable(col)}">${esc((S().lang === 'es' ? [clsName(sim), specName(sim)] : [specName(sim), clsName(sim)]).filter(Boolean).join(' '))}</b></div>${realmTxt ? `<div class="sh-realm">${esc(realmTxt)}</div>` : ''}${h.simc ? `<button type="button" class="sh-exp" data-simc="${esc(sim.id)}">${esc(t.shExport)}</button>` : ''}</div></div>`
      + (slots.replace(/<i class="sh-gap"><\/i>/g, '') ? `<div class="sh-gear">${slots}${h.avgIlvl ? `<span class="sh-ilvl" title="${esc(t.shAvgIlvl)}">${h.avgIlvl}</span>` : ''}</div>` : '') + `</div>`;
  }

  function extraSection() {
    if (!state.extra.length) return '';
    const t = T(), f = nf();
    const stat = (label, v, pct, col) => v == null ? '' : `<div class="xs-stat" style="--sc:${col}"><span>${esc(label)}</span><b>${f.format(Math.round(v))}</b>${pct != null ? `<em>${pct.toFixed(2)}%</em>` : ''}</div>`;
    const card = sim => {
      const col = clsColor(sim), st = sim.stats || {}, top = sim.kind === 'topgear';
      const prim = [['stStr', st.strength], ['stAgi', st.agility], ['stInt', st.intellect]].sort((a, b) => (b[1] || 0) - (a[1] || 0))[0];
      const stats = [prim && prim[1] != null ? stat(t[prim[0]], prim[1], null, col) : '', stat(t.stSta, st.stamina, null, '#9aa3b2'), stat(t.stCrit, st.crit, st.critPct, '#e0554f'), stat(t.stHaste, st.haste, st.hastePct, '#f0c24f'), stat(t.stMast, st.mastery, st.masteryPct, '#5fa8ff'), stat(t.stVers, st.versatility, null, '#5fe08a'), stat(t.stArmor, st.armor, null, '#9aa3b2')].join('');
      const fight = [sim.fight && sim.fight.style, sim.fight && sim.fight.targets ? `${sim.fight.targets}T` : '', sim.fight && sim.fight.secs ? `${sim.fight.secs} s` : ''].filter(Boolean).join(' · ');
      let combos = '';
      if (top) {
        const max = Math.max(1, ...sim.combos.map(c => Math.abs(c.gain)));
        combos = sim.combos.length ? `<div class="xs-combos"><div class="xs-chead"><span>#</span><span>${esc(t.xsCombo)}</span><span>DPS</span><span>${esc(t.xsGain)}</span></div>` + sim.combos.slice(0, 12).map((c, i) => `<div class="xs-crow${i === 0 ? ' best' : ''}"><span class="rk">${i + 1}</span><span class="nm" title="${esc(c.name)}">${esc(c.name)}</span><span>${f.format(c.dps)}</span><span class="gn ${c.gain >= 0 ? 'up' : 'down'}"><i style="width:${Math.abs(c.gain) / max * 100}%"></i><b>${c.gain >= 0 ? '+' : ''}${f.format(c.gain)} (${c.pct.toFixed(2)}%)</b></span></div>`).join('') + '</div>' : `<div class="hint">${esc(t.xsNoCombos)}</div>`;
      }
      return `<div class="xsim" style="--cc:${col}">${simHeader(sim, true)}<div class="xs-head">${specIcon(sim) ? `<img class="cls-icon" src="${specIcon(sim)}" alt="" style="border-color:${col}">` : ''}<div><h3 style="color:${readable(col)}">${esc(sim.character.name)} <span class="dbadge d-xs">${top ? 'TG' : 'QS'}</span></h3><div class="meta">${esc([specName(sim), clsName(sim), sim.character.realm].filter(Boolean).join(' · '))}${fight ? ` — ${esc(t.xsFight)}: ${esc(fight)}` : ''}</div></div><span class="spacer"></span>`
        + `<div class="card-tools"><button class="btn small" data-open="${esc(sim.url)}">${ui('open')}${esc(t.openRaidbots)}</button><button class="btn small" data-refresh="${esc(sim.id)}" title="${esc(t.refresh)}">${ui('refresh')}</button><button class="btn small danger" data-remove="${esc(sim.id)}" title="${esc(t.remove)}">${xmark}</button></div></div>`
        + `<div class="xs-dps"><div><small>${esc(t.xsDps)}</small><b>${f.format(sim.baseDps)}</b>${sim.dpsStd ? `<em>± ${f.format(sim.dpsStd)} ${esc(t.xsStd)}</em>` : ''}</div>${sim.hps ? `<div><small>${esc(t.xsHps)}</small><b>${f.format(sim.hps)}</b></div>` : ''}${sim.dtps ? `<div><small>${esc(t.xsDtps)}</small><b>${f.format(sim.dtps)}</b></div>` : ''}</div>`
        + (stats.trim() ? `<div class="xs-stats">${stats}</div>` : '') + combos + '</div>';
    };
    return `<details class="panel card extra-sims" open><summary><h2>${esc(t.xsTitle)}</h2><span class="meta">${state.extra.length}</span></summary><div class="hint">${esc(t.xsHint)}</div><div class="xs-grid">${state.extra.map(card).join('')}</div></details>`;
  }

  // Tarjetas fantasma con brillo mientras Raidbots responde (en vez de que el contenido salte de golpe)
  function skeletonHtml(n) {
    return Array.from({ length: Math.min(n, 3) }, () => '<section class="panel card skel-card" aria-hidden="true"><div class="skel skel-title"></div><div class="skel skel-sub"></div><div class="skel-bars">' + [60, 90, 45, 75, 35, 55].map(h => `<i class="skel" style="height:${h}%"></i>`).join('') + '</div></section>').join('');
  }
  // Las tarjetas entran con un fundido escalonado al cambiar de vista o de filtros
  function enterAnim(root) {
    if (!S().animations) return;
    [...root.children].slice(0, 14).forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('enter'); });
    setTimeout(() => root.querySelectorAll('.enter').forEach(el => el.classList.remove('enter')), 1100);
  }

  function renderChips() {
    const chips = $('#chips'), eff = effectiveDiff();
    let h = '';
    for (const id of state.loading) h += `<span class="chip loading"><span class="spinner"></span>${esc(id)} — ${esc(T().loading)}</span>`;
    for (const sim of state.extra) h += `<span class="chip" style="border-left-color:${clsColor(sim)}">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}<span style="color:${readable(clsColor(sim))};font-weight:700">${esc(sim.character.name)}</span><span class="dbadge d-xs">${sim.kind === 'topgear' ? 'TG' : 'QS'}</span><button class="x" data-remove="${esc(sim.id)}" title="${esc(T().remove)}">${xmark}</button></span>`;
    for (const sim of state.sims) {
      const col = clsColor(sim), dim = (eff && sim.difficulty && sim.difficulty !== eff) || !passesRC(sim);
      h += `<span class="chip${dim ? ' dim' : ''}" style="border-left-color:${col}">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}`
        + `<span style="color:${readable(col)};font-weight:700">${esc(sim.character.name)}</span>${diffBadge(sim.difficulty)}${(r => r.length ? `<span class="stale-mark" title="${esc(r.join(' · '))}">⚠</span>` : '')(staleInfo(sim))}`
        + `<button class="x" data-remove="${esc(sim.id)}" title="${esc(T().remove)}">${xmark}</button></span>`;
    }
    chips.innerHTML = h;
  }

  // ---------- Acciones ----------
  function toast(msg, err = false) {
    const el = document.createElement('div');
    el.className = 'toast' + (err ? ' err' : '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), err ? 6000 : 2800);
  }
  const errText = r => `${T()['err' + r.error] || r.error}${r.detail ? ` (${r.detail})` : ''}`;

  function extractIds(text) {
    const hs = /#sims=([A-Za-z0-9,]+)/.exec(String(text || ''));
    if (hs) return [...new Set(hs[1].split(',').filter(x => /^[A-Za-z0-9]{16,32}$/.test(x)))];
    // Enlaces pegados sin espacio («…abcdhttps://…»): se separan antes de leerlos
    text = String(text || '').replace(/(?!^)(https?:\/\/)/gi, ' $1');
    const ids = [], re = /raidbots\.com\/simbot\/report\/([A-Za-z0-9]+)/gi;
    let m;
    while ((m = re.exec(text))) ids.push(m[1]);
    if (!ids.length) for (const tok of text.split(/[\s,;]+/)) if (/^[A-Za-z0-9]{16,32}$/.test(tok)) ids.push(tok);
    return [...new Set(ids)];
  }

  async function addFromText(text) {
    const ids = extractIds(text);
    if (!ids.length) { toast(T().noUrls, true); return; }
    const res = await Promise.all(ids.map(id => addSim(id, false, true)));
    const ok = res.filter(r => r === 'ok');
    if (ok.length > 1) toast(`${T().added}: ${ok.length}`);
    else if (ok.length === 1) toast(`${T().added}: ${state.sims.find(s => s.id === ids[res.indexOf('ok')])?.character.name || ''}`);
  }

  // opts.minDate: ignora sims anteriores (p. ej. de antes del reinicio semanal) · opts.newestOnly: de cada jugador y dificultad, solo la más nueva
  async function addSim(id, refresh = false, quiet = false, opts = {}) {
    if (!refresh && state.extra.some(s => s.id === id)) { toast(`${T().duplicate} (${state.extra.find(s => s.id === id).character.name})`); return 'dup'; }
    if (!refresh && state.sims.some(s => s.id === id)) { toast(`${T().duplicate} (${state.sims.find(s => s.id === id).character.name})`); return 'dup'; }
    if (state.loading.has(id)) return 'busy';
    state.loading.add(id); renderChips();
    if (state.view === 'charts') { state.animateNext = false; render(); }
    const r = await window.api.fetchReport(id);
    state.loading.delete(id);
    if (!r.ok) { renderChips(); if (state.view === 'charts') { state.animateNext = false; render(); } if (!opts.silentErr) toast(`${id}: ${errText(r)}`, true); return 'err'; }
    const when = x => x.simDate || x.fetchedAt || 0;
    const simAt = r.report.simDate || opts.postedAt || 0;
    if (opts.minDate && simAt && simAt < opts.minDate) { renderChips(); return 'old'; }
    if (opts.newestOnly) {
      const same = state.sims.find(x => sameChar(x, r.report) && x.difficulty === r.report.difficulty);
      if (same && when(same) >= when(r.report)) { renderChips(); return 'older'; }
      if (same) state.sims = state.sims.filter(x => x !== same);
    }
    if (r.report.kind && r.report.kind !== 'drop') {
      const j = state.extra.findIndex(s => s.id === id);
      if (j >= 0) state.extra[j] = r.report; else state.extra.push(r.report);
      persistExtra(); state.animateNext = true; render();
      if (!quiet) toast(`${refresh ? T().updated : T().added}: ${r.report.character.name} (${r.report.kind === 'topgear' ? T().xsTop : T().xsQuick})`);
      return 'ok';
    }
    const i = state.sims.findIndex(s => s.id === id);
    if (i >= 0) state.sims[i] = r.report; else state.sims.push(r.report);
    persistSims(); state.animateNext = true; render(); refreshGear();
    if (!quiet) toast(`${refresh ? T().updated : T().added}: ${r.report.character.name}`);
    return 'ok';
  }

  // Simulaciones guardadas antes de la cabecera nueva (sin raza, reino, iconos del equipo ni SimC): se vuelven a pedir una vez, en silencio
  const upgradeTried = new Set();
  async function upgradeOldSims() {
    if (!window.api || !window.api.fetchReport) return;
    const old = [...state.sims, ...state.extra].filter(s => s && s.id && (!s.head || (s.kind === 'drop' && !s.lootCounts)) && !upgradeTried.has(s.id));
    let ok = 0;
    // la simulación personal se guarda aparte: se vuelve a pedir y se sustituye conservando su ranura
    const pold = state.personalList.filter(r => r && r.id && (!r.head || !r.lootCounts) && !upgradeTried.has('p:' + r.id));
    if (pold.length) {
      const list = state.personalList.slice();
      let n = 0;
      for (const r of pold) {
        upgradeTried.add('p:' + r.id);
        try {
          const res = await window.api.fetchReport(r.id);
          const i = list.findIndex(x => x.id === r.id);
          if (res && res.ok && res.report && i >= 0) { list[i] = r.slot ? { ...res.report, slot: r.slot } : res.report; n++; }
        } catch { /* sin conexión o informe caducado: se queda como estaba */ }
      }
      if (n) { setPersonalList(list); state.animateNext = false; render(); ok += n; }
    }
    for (const s of old) {
      upgradeTried.add(s.id);
      if (await addSim(s.id, true, true, { silentErr: true }) === 'ok') ok++;
    }
    if (ok) toast(`${T().updated}: ${ok}`);
  }

  function removeSim(id) {
    state.sims = state.sims.filter(s => s.id !== id);
    state.extra = state.extra.filter(s => s.id !== id);
    state.expanded.delete(id);
    persistSims(); persistExtra(); state.animateNext = true; render(); toast(T().removed);
  }

  function clearAll() {
    const doIt = () => { state.sims = []; state.extra = []; state.expanded.clear(); persistSims(); persistExtra(); render(); toast(T().cleared); };
    if (!S().confirmClear) return doIt();
    modal({ title: T().confirmClearTitle, body: `<p>${esc(T().confirmClearText)}</p>`, actions: [{ label: T().cancel }, { label: T().confirm, cls: 'danger', onclick: doIt }] });
  }

  // ---------- Loot de RCLootCouncil ----------
  function lootModal() {
    const t = T(), since = Math.min(...[...state.sims, ...state.extra].map(s => lastReset(s.character.region || 'eu')), lastReset('eu'));
    const week = state.loot.filter(l => l.at == null || l.at >= since).sort((a, b) => (b.at || 0) - (a.at || 0));
    const date = ms => ms ? new Date(ms).toLocaleDateString(S().lang, { day: 'numeric', month: 'short' }) : '';
    const list = week.length ? `<div class="loot-wrap"><table class="ptable loot-table"><thead><tr>${t.lootCols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${week.slice(0, 80).map(l => { state.shown.add(l.itemId); const info = itemInfo({ id: l.itemId, name: l.item });
      return `<tr data-item="${l.itemId}" data-tip-always><td><b>${esc(l.player)}</b></td><td class="it"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span></td><td>${esc(l.response)}</td><td>${esc(l.boss)}</td><td>${esc(date(l.at))}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="hint">${esc(t.lootEmpty)}</div>`;
    const m = modal({ title: t.lootTitle, body: `<p class="hint">${esc(t.lootHint)}</p><textarea id="lootText" class="txt" rows="5" spellcheck="false" placeholder="${esc(t.lootPaste)}"></textarea><div class="loot-actions"><label class="btn small">${esc(t.lootFile)}<input id="lootFile" type="file" accept=".csv,.tsv,.txt,text/plain,text/csv" hidden></label><button class="btn primary small" data-loot-import>${esc(t.lootImport)}</button><span class="spacer"></span><span class="meta">${esc(t.lootTotal(state.loot.length))}</span>${state.loot.length ? `<button class="btn small danger" data-loot-clear>${esc(t.lootClear)}</button>` : ''}</div><h3 class="sec">${esc(t.lootRecent)}</h3>${list}` });
    ensureNames();
    const text = $('#lootText', m.el);
    $('#lootFile', m.el).onchange = async e => { const f = e.target.files[0]; if (f) text.value = await f.text(); };
    m.el.addEventListener('click', async e => {
      if (e.target.closest('[data-loot-clear]')) { state.loot = []; persistLoot(); toast(t.lootCleared); m.close(); render(); return; }
      if (!e.target.closest('[data-loot-import]')) return;
      const r = await window.api.parseLoot(text.value);
      if (!r.ok || !r.rows.length) return toast(t.lootNone, true);
      // se fusionan con lo ya guardado sin duplicar (jugador + objeto + fecha)
      const key = l => `${String(l.player).toLowerCase()}|${l.itemId}|${l.at}`, seen = new Set(state.loot.map(key));
      for (const l of r.rows) if (!seen.has(key(l))) { state.loot.push(l); seen.add(key(l)); }
      state.loot.sort((a, b) => (b.at || 0) - (a.at || 0)); state.loot = state.loot.slice(0, 3000);
      persistLoot(); toast(t.lootSaved(r.rows.length)); m.close(); state.animateNext = false; render(); lootModal();
    });
  }
  $('#btnLoot').onclick = lootModal;

  // ---------- Sesiones guardadas ----------
  // Se guardan los enlaces (ids) de cada simulación con un nombre y una fecha; al abrir una sesión se piden de nuevo a Raidbots.
  const sessions = () => load('ninjaloot.sessions', []).filter(x => x && Array.isArray(x.ids));
  const saveSessions = l => save('ninjaloot.sessions', l);
  const WEB_BASE = 'https://kingkhaax.github.io/NinjaLoot/';
  const sessDate = ms => new Date(ms).toLocaleDateString(S().lang, { day: 'numeric', month: 'long', year: 'numeric' });
  async function openIds(ids, replace) {
    if (replace) { state.sims = []; state.extra = []; state.expanded.clear(); persistSims(); persistExtra(); render(); }
    toast(T().sessOpening(ids.length));
    await Promise.all(ids.map(id => addSim(id, false, true)));
    state.view = 'charts'; state.animateNext = true; render();
  }
  function sessionsModal() {
    const t = T(), list = sessions().sort((a, b) => b.at - a.at);
    const row = s => `<div class="sess-row"><div class="sess-info"><b>${esc(s.name)}</b><span class="meta">${esc(sessDate(s.at))} · ${esc(t.sessPlayers(s.ids.length))}</span>${s.players ? `<span class="sess-chars">${s.players.slice(0, 12).map(p => `<i style="color:${CLASS_COLORS[p.cls] || '#c8a45a'}">${esc(p.name)}</i>`).join('')}</span>` : ''}</div>`
      + `<div class="sess-actions"><button class="btn small primary" data-sess-open="${esc(s.key)}">${esc(t.sessOpen)}</button><button class="btn small" data-sess-add="${esc(s.key)}">${esc(t.sessAdd)}</button><button class="btn small danger" data-sess-del="${esc(s.key)}" title="${esc(t.sessDelete)}">${xmark}</button></div></div>`;
    const m = modal({ title: t.sessTitle, body: `<p class="hint">${esc(t.sessHint)}</p>`
      + `<div class="sess-save"><input id="sessName" class="txt" type="text" maxlength="60" placeholder="${esc(t.sessNamePh)}" value="${esc(t.sessDefaultName(new Date().toLocaleDateString(S().lang, { day: 'numeric', month: 'long' })))}"><button class="btn primary" data-sess-save>${esc(t.sessSave)}</button></div>`
      + `<div class="sess-list">${list.length ? list.map(row).join('') : `<div class="hint">${esc(t.sessEmpty)}</div>`}</div>` });
    m.el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const key = b.dataset.sessOpen || b.dataset.sessAdd || b.dataset.sessDel;
      if (b.hasAttribute('data-sess-save')) {
        if (!state.sims.length && !state.extra.length) return toast(t.sessNeedSims, true);
        const name = ($('#sessName', m.el).value || '').trim() || t.sessDefaultName(sessDate(Date.now()));
        const l = sessions(); l.push({ key: 's' + Date.now().toString(36), name, at: Date.now(), ids: [...state.sims, ...state.extra].map(s => s.id), players: [...state.sims, ...state.extra].map(s => ({ name: s.character.name, cls: s.character.cls })) });
        saveSessions(l); toast(t.sessSaved); m.close(); sessionsModal();
      } else if (b.dataset.sessOpen || b.dataset.sessAdd) {
        const s = sessions().find(x => x.key === key); if (!s) return;
        m.close(); openIds(s.ids.filter(id => b.dataset.sessOpen || ![...state.sims, ...state.extra].some(x => x.id === id)), !!b.dataset.sessOpen);
      } else if (b.dataset.sessDel) { saveSessions(sessions().filter(x => x.key !== key)); toast(t.sessDeleted); m.close(); sessionsModal(); }
    });
  }
  // Enlace para compartir: abre NinjaLoot web con los mismos informes de Raidbots (nada se guarda en ningún servidor)
  const shareLink = () => `${WEB_BASE}#sims=${[...state.sims, ...state.extra].map(s => s.id).join(',')}`;
  function shareModal() {
    const t = T();
    if (!state.sims.length && !state.extra.length) return toast(t.shareNone, true);
    const link = shareLink();
    const m = modal({ title: t.shareTitle, body: `<p class="hint">${esc(t.shareText)}</p><textarea class="txt share-link" rows="3" readonly>${esc(link)}</textarea>`, actions: [{ label: t.shareClose }, { label: t.shareCopy, cls: 'primary', onclick: () => { navigator.clipboard.writeText(link).then(() => showCopiedPop(link)).catch(() => {}); } }] });
    const ta = $('.share-link', m.el); ta.focus(); ta.select();
  }
  $('#btnSessions').onclick = sessionsModal;
  $('#btnShare').onclick = shareModal;
  // ---------- Rutas: cada pantalla tiene su propia URL (#/charts, #/rotations/ID...) ----------
  // Así "Atrás" y "Adelante" del navegador funcionan, se puede copiar el enlace de una pantalla y los enlaces de la barra
  // se abren en otra ventana con Mayús + clic (o en otra pestaña con Ctrl + clic / clic central), como en cualquier web.
  const VIEWS = ['home', 'tiers', 'personal', 'charts', 'rotations', 'roster'];
  // La portada es la dirección limpia, sin «#/» (igual que en WipeTime); «#/», «#/home» y los enlaces antiguos siguen valiendo
  const routeHash = () => state.view === 'home' ? '' : `#/${state.view}${state.view === 'rotations' && state.bossSel != null ? `/${state.bossSel}` : ''}`;
  function parseRoute(h) {
    if (!h || /^#\/?$/.test(h)) return { view: 'home', boss: null };
    const m = /^#\/([a-z]+)(?:\/(\d+))?\/?$/.exec(h || '');
    return m && VIEWS.includes(m[1]) ? { view: m[1], boss: m[2] != null ? Number(m[2]) : null } : null;
  }
  let routed = false;
  // Lleva la URL a donde está la pantalla: la primera vez la sustituye (no deja entrada extra) y después añade una entrada al historial
  function syncRoute() {
    const want = routeHash();
    const t = T();
    const label = { home: t.navHome, tiers: t.navTiers, personal: t.navPersonal, charts: t.navCharts, rotations: t.navRotations, roster: t.navRoster }[state.view];
    document.title = label && state.view !== 'home' ? `NinjaLoot · ${label}` : 'NinjaLoot'; // la portada se llama solo «NinjaLoot», como «WipeTime» en la otra web
    if (location.hash === want) { routed = true; return; } // la portada es la dirección limpia (sin «#/»), como en WipeTime; un enlace antiguo con «#/» se limpia solo
    try { history[routed ? 'pushState' : 'replaceState'](null, '', location.pathname + location.search + want); } catch { /* sin historial */ }
    routed = true;
  }
  // Pone la pantalla que indica la URL. Devuelve true si ha cambiado algo.
  function applyRoute() {
    const r = parseRoute(location.hash);
    if (!r) return false;
    const changed = r.view !== state.view || (r.boss != null && r.boss !== state.bossSel);
    state.view = r.view;
    if (r.boss != null) state.bossSel = r.boss;
    return changed;
  }
  window.addEventListener('popstate', () => { if (applyRoute()) { state.animateNext = true; render(); window.scrollTo(0, 0); } });
  // Pulsar un objeto (su cuadrado, su icono o su nombre) abre su página de Wowhead en el idioma de la app
  const ITEM_CLICK = '.coin-item, .star-item, .ic-icon, td.it, .own-ic, .sc-item, .lbl-item, .caution-line';
  document.addEventListener('click', e => {
    const hit = e.target.closest?.(ITEM_CLICK);
    if (!hit || e.target.closest('button, a, select, input, label, [data-open], [data-pcat]')) return;
    const id = Number((hit.closest('[data-item]') || {}).dataset?.item);
    if (!id) return;
    e.preventDefault();
    try { window.api.openExternal(`https://www.wowhead.com/${S().lang === 'es' ? 'es/' : ''}item=${id}`); } catch { /* sin navegador */ }
  });
  // «Es correcto»: ese cambio de equipo no vuelve a avisarse (Raider.IO puede ir por detrás del juego)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-gear-ok]'); if (!b) return;
    const list = new Set(S().gearOk || []); list.add(b.dataset.gearOk); S().gearOk = [...list].slice(-200);
    persistSettings(); state.animateNext = false; render();
  });
  // clic normal = se navega aquí; Mayús / Ctrl / Cmd / Alt / botón central = se deja al navegador abrir el enlace aparte
  // Aviso en medio de la pantalla: confirma que el texto se ha copiado (desaparece solo)
  function showCopiedPop(text, ok = true) {
    document.getElementById('copyPop')?.remove();
    const el = document.createElement('div');
    el.id = 'copyPop'; el.className = 'copy-pop' + (ok ? '' : ' err'); el.setAttribute('role', 'status');
    const ic = document.createElement('span'); ic.className = 'cp-ic'; ic.textContent = ok ? '✓' : '!';
    const tx = document.createElement('div'); tx.className = 'cp-tx';
    const b = document.createElement('b'); b.textContent = ok ? T().copiedOk : T().copiedBad;
    const sm = document.createElement('small'); sm.textContent = text;
    tx.append(b, sm); el.append(ic, tx);
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 1700);
  }
  // Pulsar el nombre de Discord o de Battle.net: se copia al portapapeles y sale un aviso en medio de la pantalla
  document.addEventListener('click', async e => {
    const a = e.target.closest('[data-friend]');
    if (!a) return;
    e.preventDefault();
    const name = a.dataset.name;
    let copied = false;
    try { await navigator.clipboard.writeText(name); copied = true; } catch {
      try { const x = document.createElement('textarea'); x.value = name; x.style.position = 'fixed'; x.style.opacity = '0'; document.body.appendChild(x); x.select(); copied = document.execCommand('copy'); x.remove(); } catch { /* sin portapapeles */ }
    }
    showCopiedPop(name, copied);
  });
  const plainClick = e => !/^https?:$/.test(location.protocol) || (e.button === 0 && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey); // en la app de escritorio no hay ventanas aparte: siempre se navega dentro
  applyRoute();

  // Al abrir la web con un enlace de NinjaLoot (#sims=id1,id2…) se cargan sus simulaciones
  (function loadFromHash() {
    const m = /[#&]sims=([A-Za-z0-9,]+)/.exec(location.hash || '');
    if (!m) return;
    const ids = [...new Set(m[1].split(',').filter(x => /^[A-Za-z0-9]{16,32}$/.test(x)))];
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* sin historial */ }
    if (!ids.length) return;
    state.view = 'charts';
    setTimeout(async () => { await Promise.all(ids.map(id => addSim(id, false, true))); toast(T().shareLoaded(state.sims.length)); }, 300);
  })();

  // ---------- Modo captura: imagen limpia y compacta de la gráfica general (para Discord) ----------
  function overviewEntries(act) {
    const pct = S().unit === 'pct';
    return [...act].sort((a, b) => (bestOf(b)?.gain || 0) - (bestOf(a)?.gain || 0)).map(sim => {
      const best = bestOf(sim), info = itemInfo(best), col = clsColor(sim);
      state.shown.add(best.id);
      return { id: sim.id, value: valueOf(best, sim), label: sim.character.name, sub: sim.difficulty ? DIFF_TAG[sim.difficulty] : '', color: col, labelColor: readable(col), icon: info.icon, iconBorder: QUALITY_COLORS[info.quality], valueText: valueText(best, sim), bottomIcon: specIcon(sim), tipIcon: 'top' };
    }).sort((a, b) => b.value - a.value);
  }
  function captureSvg(n) {
    const t = T(), colors = themeColors(), pct = S().unit === 'pct';
    const entries = overviewEntries(activeSims()).slice(0, n);
    if (!entries.length) return null;
    const chart = Chart.build(entries, { colors, animate: false, showValues: true, showIcons: true, compact: S().compact, yTitle: '', slot: 96, height: 250, hScale: 1, tickFmt: pct ? v => `${v.toFixed(v % 1 ? 1 : 0)}%` : undefined });
    const cw = Number(/ width="(\d+)"/.exec(chart)[1]), ch = Number(/ height="(\d+)"/.exec(chart)[1]);
    const W = Math.max(cw + 24, 620), headH = 74, footH = 14, up = 44, H = headH + ch + footH - up; // la gráfica trae margen superior propio: se sube para que quede pegada a la cabecera
    const eff = effectiveDiff(), sub = [eff ? t.diffNames[eff] : '', pct ? t.unitPct : t.unitDps, new Date().toLocaleDateString(S().lang, { day: 'numeric', month: 'long', year: 'numeric' })].filter(Boolean).join('  ·  ');
    const nested = chart.replace('<svg ', `<svg x="${Math.round((W - cw) / 2)}" y="${headH - up}" `);
    return { W, H, svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="capture-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}">`
      + `<defs><linearGradient id="capbg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${colors.bg}"/><stop offset="1" stop-color="${colors.bg}"/></linearGradient></defs>`
      + `<rect width="100%" height="100%" fill="url(#capbg)"/><rect width="100%" height="4" fill="#8b5cf6"/>`
      + `<text x="24" y="36" font-size="21" font-weight="800" fill="${colors.text}">${esc(t.overviewTitle)}</text>`
      + `<text x="24" y="58" font-size="13" fill="${colors.muted}">${esc(sub)}</text>`
      + nested
      + `</svg>` };
  }
  function captureModal() {
    const t = T(), total = activeSims().length;
    if (!total) return toast(t.captureEmpty, true);
    let n = Math.min(10, total);
    const counts = [...new Set([5, 8, 10, 15, total].filter(x => x <= total))].sort((a, b) => a - b);
    const m = modal({ title: t.captureTitle, body: `<p class="hint">${esc(t.captureHint)}</p><div class="cap-opts"><span class="meta">${esc(t.captureCount)}:</span><div class="seg">${counts.map(c => `<button data-cap-n="${c}" class="${c === n ? 'on' : ''}">${c}</button>`).join('')}</div></div><div class="capture-stage"></div>`,
      actions: [{ label: t.close }, { label: t.captureSave, onclick: () => captureExport('save', n) }, { label: t.captureCopy, cls: 'primary', onclick: () => captureExport('copy', n) }] });
    m.el.querySelector('.modal').classList.add('wide');
    const draw = () => { const c = captureSvg(n); m.el.querySelector('.capture-stage').innerHTML = c ? c.svg : `<div class="hint">${esc(t.captureEmpty)}</div>`; };
    m.el.addEventListener('click', e => { const b = e.target.closest('[data-cap-n]'); if (!b) return; n = Number(b.dataset.capN); m.el.querySelectorAll('[data-cap-n]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    draw();
  }
  async function captureExport(mode, n) {
    const c = captureSvg(n); if (!c) return;
    const holder = document.createElement('div'); holder.innerHTML = c.svg;
    const blob = await svgToBlob(holder.firstChild, c.W, c.H);
    if (!blob) return toast(T().exportFailed, true);
    if (mode === 'save') {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ninjaloot-captura.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000); return toast(T().exported);
    }
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); showCopiedPop(T().captureCopied); } catch { showCopiedPop(T().captureCopyFail, false); }
  }
  // SVG (con iconos incrustados) -> PNG a doble resolución
  async function svgToBlob(svg, w, h) {
    try {
      const clone = svg.cloneNode(true);
      for (const img of clone.querySelectorAll('image')) {
        const data = await window.api.iconData(img.getAttribute('href'));
        if (data) img.setAttribute('href', data); else img.remove();
      }
      clone.setAttribute('font-family', FONT);
      const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone)); await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext('2d'); ctx.scale(2, 2); ctx.drawImage(img, 0, 0, w, h);
      return await new Promise(r => canvas.toBlob(r, 'image/png'));
    } catch (e) { console.error(e); return null; }
  }

  // ---------- Exportar a PNG ----------
  // Exportar todas las mejoras de todas las sims a CSV (Excel / Google Sheets) o JSON
  function exportRows() {
    const rows = [];
    for (const sim of state.sims) for (const it of sim.items) {
      const info = itemInfo(it), src = srcText(it), s = srcOf(it);
      rows.push({
        player: sim.character.name, realm: sim.character.realm || '', class: clsName(sim), spec: specName(sim),
        difficulty: sim.difficulty ? DIFF_TAG[sim.difficulty] : '', baseDps: Math.round(sim.baseDps || 0),
        itemId: it.id, item: info.name, slot: T().slots[it.slot] || it.slot || '', ilvl: it.ilvl || '',
        source: s ? catName(catOfSrc(s)) : '', boss: src ? src.name : '', instance: src ? src.sub : '',
        dpsGain: Math.round(it.gain), pctGain: Number((it.pct || 0).toFixed(2)), owned: owned(sim, it) ? 1 : 0, simUrl: sim.url,
      });
    }
    return rows.sort((a, b) => a.player.localeCompare(b.player) || b.dpsGain - a.dpsGain);
  }
  // Ámbito: todo, un jefe, un jugador o una pieza concreta
  function exportData(fmt, scope = 'all', which = '') {
    const rows = exportRows().filter(r => scope === 'boss' ? r.boss === which : scope === 'player' ? r.player === which : scope === 'item' ? String(r.itemId) === which : true);
    if (!rows.length) return toast(T().noSimsToExport, true);
    let data, type;
    if (fmt === 'json') { data = JSON.stringify({ app: 'NinjaLoot', version: state.info.version, exported: new Date().toISOString(), rows }, null, 2); type = 'application/json'; }
    else {
      const cols = Object.keys(rows[0]), cell = v => { v = String(v ?? ''); return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
      // «;» y BOM: Excel en español lo abre bien con doble clic
      data = '﻿' + [cols.join(';'), ...rows.map(r => cols.map(c => cell(r[c])).join(';'))].join('\r\n'); type = 'text/csv';
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type }));
    const tag = scope === 'all' ? '' : '-' + String(scope === 'item' ? (rows[0]?.item || which) : which).normalize('NFD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    a.download = `ninjaloot${tag}-${new Date().toISOString().slice(0, 10)}.${fmt}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(T().exported(rows.length));
  }

  async function exportChart(key) {
    try {
      const svg = document.querySelector(`[data-chart="${CSS.escape(key)}"] svg`);
      if (!svg) return;
      const clone = svg.cloneNode(true);
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', themeColors().bg);
      clone.insertBefore(bg, clone.firstChild);
      const blob = await svgToBlob(clone, Number(svg.getAttribute('width')), Number(svg.getAttribute('height')));
      if (!blob) throw new Error('PNG');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ninjaloot-${key === 'overview' ? 'resumen' : (state.sims.find(s => s.id === key)?.character.name || key)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast(T().exported);
    } catch (e) { console.error(e); toast(T().exportFailed, true); }
  }

  // ---------- Modales ----------
  function modal({ title, body, actions = [], tabs }) {
    const root = $('#modalRoot');
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="panel modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button class="btn ghost small" data-close aria-label="${esc(T().close)}">${xmark}</button></div>`
      + `<div class="modal-inner">${tabs || ''}<div class="modal-body">${body}</div></div>${actions.length ? '<div class="modal-foot"></div>' : ''}</div>`;
    const close = () => back.remove();
    back.addEventListener('mousedown', e => { if (e.target === back) close(); });
    back.querySelector('[data-close]').onclick = close;
    const foot = back.querySelector('.modal-foot');
    actions.forEach(a => {
      const b = document.createElement('button');
      b.className = `btn ${a.cls || ''}`; b.textContent = a.label;
      b.onclick = () => { close(); a.onclick?.(); };
      foot.appendChild(b);
    });
    root.appendChild(back);
    return { el: back, close };
  }
  const closeTopModal = () => { const m = [...document.querySelectorAll('.modal-back')].pop(); if (m) { m.remove(); return true; } return false; };

  // ---------- Discord: sims automáticas desde un canal ----------
  const dcStatusText = st => {
    const t = T();
    if (!st || st.state === 'off') return `<span class="na">${esc(t.dcOff)}</span>`;
    if (st.state === 'error') return `<span class="bad">${esc(t.dcErr[st.error] || st.error)}</span>`;
    return `<span class="ok">${esc(t.dcOn(st.channel || ''))}</span>` + (st.warn === 'INTENT' ? `<div class="small-note warn">${esc(t.dcIntent)}</div>` : '');
  };
  async function drawDiscord(box) {
    if (!box) return;
    const t = T(), c = await window.api.discordGet();
    box.innerHTML = `<h3>${esc(t.dcTitle)}</h3><p class="hint">${esc(t.dcIntro)}</p>`
      + `<div class="card-tools" style="margin:6px 0 14px"><button class="btn primary" data-dc-invite>${esc(t.dcInvite)}</button></div>`
      + `<label class="switch-row" style="flex-direction:row;align-items:center"><input type="checkbox" class="switch" id="dcEnabled" ${c.enabled ? 'checked' : ''}> ${esc(t.dcEnable)}</label>`
      + `<div class="row"><label for="dcChannel">${esc(t.dcChannel)}</label><input id="dcChannel" class="txt" spellcheck="false" value="${esc(c.channelId)}" placeholder="${esc(t.dcChannelPh)}" style="max-width:340px"></div>`
      + `<div class="row"><label for="dcDays">${esc(t.dcWindow)}<small class="meta" style="display:block">${esc(t.dcWindowHint)}</small></label><select id="dcDays">${[0, 1, 2, 3, 4, 5, 6].map(d => `<option value="${d}"${(c.windowDays || 0) === d ? ' selected' : ''}>${esc(d ? t.dcWindowDays(d) : t.dcWindowWeek)}</option>`).join('')}</select></div>`
      + `<div class="card-tools" style="margin:12px 0"><button class="btn" data-dc-save>${esc(t.dcSave)}</button>${c.channelId ? ` <button class="btn danger" data-dc-clear>${esc(t.dcDisconnect)}</button>` : ''}</div>`
      + `<div class="status" id="dcStatus">${dcStatusText(c.status)}</div>`
      + `<h3>${esc(t.dcHelpTitle)}</h3><ol class="steps">${t.dcSteps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    // el interruptor se guarda solo al cambiarlo (antes había que pulsar también «Guardar y conectar»)
    box.querySelector('#dcEnabled').addEventListener('change', () => saveDiscord(box, true));
    box.querySelector('#dcDays').addEventListener('change', () => saveDiscord(box, true));
  }
  async function saveDiscord(box, quiet = false) {
    const btn = box.querySelector('[data-dc-save]');
    if (btn) btn.disabled = true;
    const ch = box.querySelector('#dcChannel').value.trim(), en = box.querySelector('#dcEnabled').checked;
    const r = await window.api.discordSet({ channelId: ch, enabled: en, windowDays: Number(box.querySelector('#dcDays').value) || 0 });
    if (ch && !r.channelId) toast(T().dcBadChannel, true);
    else if (!quiet) toast(T().dcSaved);
    drawDiscord(box);
  }
  async function disconnectDiscord(box) {
    await window.api.discordSet({ channelId: '', enabled: false });
    toast(T().dcDisconnected);
    drawDiscord(box);
  }
  async function inviteDiscord() {
    window.api.openExternal(DISCORD_INVITE);
  }
  window.api.onDiscordStatus?.(st => { const el = document.getElementById('dcStatus'); if (el) el.innerHTML = dcStatusText(st); });
  // Enlaces nuevos en el canal: se añaden solos a Gráficas (los repetidos se ignoran sin avisar)
  window.api.onDiscordSims?.(async list => {
    const info = await window.api.discordGet();
    for (const x of list) {
      const it = typeof x === 'string' ? { id: x } : x;
      if (it.at && it.at < info.reset) continue;
      if (!state.sims.some(s => s.id === it.id) && await addSim(it.id, false, true, { minDate: info.reset, postedAt: it.at || 0, newestOnly: true }) === 'ok') { state.dcSims[it.id] = { by: (it.author && it.author.name) || '', at: it.at || Date.now() }; save('ninjaloot.dcSims', state.dcSims); toast(`${T().dcAdded}: ${state.sims.find(s => s.id === it.id)?.character.name || it.id}`); }
    }
    if (state.view === 'roster') render();
  });

  // ---------- Roster: quién ha subido su sim esta semana y recordatorio por mensaje privado ----------
  state.dcSims = load('ninjaloot.dcSims', {});
  state.roster = load('ninjaloot.roster', []);       // [{ name, realm, cls }]
  const charKey = (name, realm) => `${normName(name)}-${normName(realm || '')}`;
  const rosterKey = m => charKey(m.name, m.realm);
  function lastReset(region) {
    const now = new Date(), [day, hour] = region === 'us' ? [2, 15] : [3, 4];
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour));
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - day + 7) % 7));
    if (d > now) d.setUTCDate(d.getUTCDate() - 7);
    return d.getTime();
  }
  // Sim más nueva de un miembro del roster entre las cargadas
  function rosterSim(m) {
    const k = normName(m.name), r = normName(m.realm);
    return state.sims.filter(x => normName(x.character.name) === k && (!r || !x.character.realm || normName(x.character.realm) === r))
      .sort((a, b) => (b.simDate || b.fetchedAt || 0) - (a.simDate || a.fetchedAt || 0))[0] || null;
  }
  // Marca a mano de cada personaje (tiene la sim / le falta): solo vale para la semana actual, en el siguiente reinicio vuelve a ser automática
  state.roManual = load('ninjaloot.roManual', {});
  const manualOf = (m, reset) => { const x = state.roManual[rosterKey(m)]; return x && x.w === reset ? x.v : null; };
  function saveRoster() { save('ninjaloot.roster', state.roster); }

  // «Rotaciones desde el 14 de Octubre hasta el 21 de Octubre»: la semana actual, de reinicio a reinicio (se calcula cada vez que se pinta, así cambia sola)
  function rotWeekText() {
    const t = T(), start = lastReset(S().rosterRegion || 'eu'), end = start + 7 * 864e5;
    const fmt = ms => { const d = new Date(ms).toLocaleDateString(S().lang, { day: 'numeric', month: 'long' }); return d.replace(/(\d+(?: de)? )(\p{L})/u, (m, a, b) => a + b.toLocaleUpperCase(S().lang)); };
    return t.rotWeek(fmt(start), fmt(end));
  }

  // Rangos de la guild: Blizzard solo da el número (0 = maestro de hermandad), no su nombre; por eso cada uno les pone el suyo
  // («Raiders», «Alters», «Oficiales»…) y elige qué rangos importar, sin que tengan que ser seguidos (por ejemplo 0, 1 y 3, y no los alters del 5)
  const rankName = i => ((S().rankNames || [])[i] || '').trim() || (T().rankDefaults[i] || T().rankN(i));
  const rankSel = () => { const a = S().rankSel; return new Set(Array.isArray(a) ? a : Array.from({ length: 10 }, (_, i) => i)); };
  function rankSummary() {
    const sel = [...rankSel()].sort((a, b) => a - b), t = T();
    if (sel.length === 10) return t.roAllRanks;
    if (!sel.length) return t.roRanksNone;
    return sel.length <= 3 ? sel.map(rankName).join(', ') : `${sel.slice(0, 2).map(rankName).join(', ')} +${sel.length - 2}`;
  }
  function ranksModal() {
    const t = T(), sel = rankSel();
    const rows = Array.from({ length: 10 }, (_, i) => `<label class="rk-row"><input type="checkbox" data-rk="${i}"${sel.has(i) ? ' checked' : ''}><span class="rk-n">${i}</span><input class="txt rk-name" data-rkname="${i}" value="${esc(((S().rankNames || [])[i] || '').trim())}" placeholder="${esc(t.rankDefaults[i] || t.rankN(i))}" maxlength="24" spellcheck="false"></label>`).join('');
    const presets = [['all', t.roAllRanks], ['gm', t.rankPresetGm], ['top2', t.rankPresetTop2], ['none', t.roRanksNone]].map(([k, l]) => `<button type="button" class="chip" data-rk-preset="${k}">${esc(l)}</button>`).join('');
    const m = modal({ title: t.roRanksTitle, body: `<p class="hint">${esc(t.roRanksHint)}</p><div class="rk-presets">${presets}</div><div class="rk-list">${rows}</div>`,
      actions: [{ label: t.cancel }, { label: t.roRanksSave, cls: 'primary', onclick: () => {
        const checks = [...m.el.querySelectorAll('[data-rk]')];
        S().rankSel = checks.filter(c => c.checked).map(c => Number(c.dataset.rk));
        S().rankNames = [...m.el.querySelectorAll('[data-rkname]')].map(i => i.value.trim());
        persistSettings(); render();
      } }] });
    m.el.addEventListener('click', e => {
      const p = e.target.closest('[data-rk-preset]'); if (!p) return;
      const want = { all: () => true, none: () => false, gm: i => i === 0, top2: i => i <= 1 }[p.dataset.rkPreset];
      m.el.querySelectorAll('[data-rk]').forEach(c => { c.checked = want(Number(c.dataset.rk)); });
    });
  }

  function rosterView() {
    const t = T(), region = S().rosterRegion || 'eu', reset = lastReset(region);
    const rows = state.roster.map(m => { const sim = rosterSim(m), when = sim ? (sim.simDate || sim.fetchedAt || 0) : 0; const auto = when >= reset, man = manualOf(m, reset); return { m, sim, ok: man === null ? auto : man, auto, manual: man !== null, when }; })
      .sort((a, b) => a.ok - b.ok || a.m.name.localeCompare(b.m.name));
    const missing = rows.filter(r => !r.ok);
    const rf = ['all', 'missing', 'done'].includes(state.roFilter) ? state.roFilter : 'all';
    const shownRows = rf === 'missing' ? missing : rf === 'done' ? rows.filter(r => r.ok) : rows;
    const dateTxt = new Date(reset).toLocaleString(S().lang, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    let html = `<section class="panel card"><div class="card-head"><h2>${esc(t.roTitle)}</h2></div><div class="hint">${esc(t.roHint(dateTxt))}</div>`
      + `<div class="ro-forms"><div class="ro-form"><b>${esc(t.roAddTitle)}</b><div class="ro-row"><input class="txt" id="roName" placeholder="${esc(t.roName)}" spellcheck="false"><input class="txt" id="roRealm" placeholder="${esc(t.roRealm)}" spellcheck="false"><button class="btn" data-ro="add">${esc(t.roAdd)}</button></div></div>`
      + `<div class="ro-form"><b>${esc(t.roImportTitle)}</b><div class="ro-row"><input class="txt" id="roGuild" placeholder="${esc(t.roGuild)}" spellcheck="false" value="${esc(S().rosterGuild || '')}"><input class="txt" id="roGRealm" placeholder="${esc(t.roRealm)}" spellcheck="false" value="${esc(S().rosterRealm || '')}">`
      + `<select id="roRegion">${['eu', 'us'].map(r => `<option value="${r}"${r === region ? ' selected' : ''}>${r.toUpperCase()}</option>`).join('')}</select>`
      + `<button type="button" class="btn" data-ro="ranks" id="roRanksBtn" title="${esc(t.roRanksTitle)}">${esc(t.roRanksLabel)}: <b>${esc(rankSummary())}</b> ▾</button>`
      + `<button class="btn" data-ro="import">${esc(t.roImport)}</button></div></div></div></section>`;
    if (!state.roster.length) return html + `<div class="empty">${emptyArt('roster')}<h2>${esc(t.roEmptyTitle)}</h2><p>${esc(t.roEmptyText)}</p></div>`;
    html += `<section class="panel card"><div class="card-head"><h2>${esc(t.roStatus(rows.length - missing.length, rows.length))}</h2><span class="spacer"></span><div class="card-tools"><div class="seg">${[['all', t.roFilterAll, rows.length], ['missing', t.roFilterMissing, missing.length], ['done', t.roFilterDone, rows.length - missing.length]].map(([k, l, n]) => `<button data-ro="filter" data-f="${k}" class="${rf === k ? 'on' : ''}">${esc(l)} <span class="meta">${n}</span></button>`).join('')}</div>`
      + `<button class="btn danger" data-ro="clear">${esc(t.roClear)}</button></div></div>`
      + `<div class="hint">${esc(t.roHintManual)}</div>`
      + `<div class="ptable-wrap ro-wrap"><table class="ptable ro-table"><thead><tr><th>${esc(t.roColChar)}</th><th>${esc(t.roColSim)}</th><th></th></tr></thead><tbody>`
      + shownRows.map(({ m, sim, ok, manual, when }) => {
        const col = m.cls ? (CLASS_COLORS[m.cls] || CLASS_COLORS[String(m.cls).toLowerCase().replace(/ /g, '')] || '') : (sim ? clsColor(sim) : '');
        const k = rosterKey(m);
        const via = sim && state.dcSims[sim.id], src = sim ? (via ? `<span class="ro-src bot" title="${esc(via.by ? t.roViaBotBy(via.by) : t.roViaBot)}">${esc(t.roViaBot)}${via.by ? ` · ${esc(via.by)}` : ''}</span>` : `<span class="ro-src hand">${esc(t.roViaHand)}</span>`) : '';
        const note = manual ? `<span class="ro-man" title="${esc(t.roManualTip)}">${esc(t.roManual)}</span>` : ok ? (src + (when ? ` <span class="meta">${esc(new Date(when).toLocaleDateString(S().lang))}</span>` : '')) : (sim ? `<span class="meta">${esc(t.roOld(new Date(when).toLocaleDateString(S().lang)))}</span>` : '');
        const ck = m.cls || (sim && sim.character.cls) || '', av = CLASS_COLORS[ck] ? `<img class="ro-av" src="assets/classes/${ck}.png" alt="" style="--cc:${CLASS_COLORS[ck]}">` : '<span class="ro-av ph"></span>';
        return `<tr class="${ok ? 'ro-ok' : 'ro-miss'}"><td><span class="ro-who">${av}<span><b style="${col ? `color:${readable(col)}` : ''}">${esc(m.name)}</b> <span class="meta">${esc(m.realm || '')}</span></span></span></td>`
          + `<td><button type="button" class="ro-pill ${ok ? 'ok' : 'bad'}" data-ro="toggle" data-k="${esc(k)}" title="${esc(t.roToggleTip)}"><i>${ok ? '✓' : '✗'}</i><span>${esc(ok ? t.roHasSim : t.roMissing)}</span></button> ${note}</td>`
          + `<td class="ro-act"><button class="btn small danger" data-ro="del" data-k="${esc(k)}" title="${esc(t.roRemove)}">${xmark}</button></td></tr>`;
      }).join('') + `</tbody></table></div></section>`;
    return html;
  }

  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-ro]');
    if (!el) return;
    const t = T(), a = el.dataset.ro;
    if (a === 'add') {
      const name = $('#roName').value.trim(), realm = $('#roRealm').value.trim();
      if (!name) return toast(t.roNeedName, true);
      if (!state.roster.some(m => rosterKey(m) === charKey(name, realm))) state.roster.push({ name, realm });
      saveRoster(); render();
    } else if (a === 'import') {
      const guild = $('#roGuild').value.trim(), realm = $('#roGRealm').value.trim(), region = $('#roRegion').value, ranks = rankSel();
      if (!guild || !realm) return toast(t.roNeedGuild, true);
      Object.assign(S(), { rosterGuild: guild, rosterRealm: realm, rosterRegion: region }); persistSettings();
      window.api.discordSet?.({ region });
      el.disabled = true;
      const slug = realm.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, '-');
      const r = await window.api.rosterGuild(region, slug, guild);
      el.disabled = false;
      if (!r.ok) return toast(r.error === 'NOT_FOUND' ? t.roGuildNotFound : `${t.roImportError}: ${r.error}`, true);
      let added = 0;
      if (!ranks.size) return toast(t.roRanksNone, true);
      for (const m of r.members.filter(x => ranks.has(x.rank))) {
        if (state.roster.some(x => rosterKey(x) === charKey(m.name, m.realm))) continue;
        state.roster.push({ name: m.name, realm: m.realm, cls: String(m.cls || '').toLowerCase().replace(/ /g, '') }); added++;
      }
      saveRoster(); render(); toast(t.roImported(added, r.guild));
    } else if (a === 'filter') {
      state.roFilter = el.dataset.f; render();
    } else if (a === 'ranks') {
      ranksModal();
    } else if (a === 'del') {
      state.roster = state.roster.filter(m => rosterKey(m) !== el.dataset.k); saveRoster(); render();
    } else if (a === 'clear') {
      const doIt = () => { state.roster = []; saveRoster(); render(); };
      S().confirmClear ? modal({ title: t.roClear, body: `<p>${esc(t.roClearConfirm)}</p>`, actions: [{ label: t.cancel }, { label: t.confirm, cls: 'danger', onclick: doIt }] }) : doIt();
    } else if (a === 'toggle') {
      const m = state.roster.find(x => rosterKey(x) === el.dataset.k); if (!m) return;
      const reset = lastReset(S().rosterRegion || 'eu'), sim = rosterSim(m), auto = !!(sim && (sim.simDate || sim.fetchedAt || 0) >= reset), now = manualOf(m, reset) === null ? auto : manualOf(m, reset);
      // al volver al valor que dice la sim se quita la marca manual
      if (!now === auto) delete state.roManual[el.dataset.k]; else state.roManual[el.dataset.k] = { v: !now, w: reset };
      save('ninjaloot.roManual', state.roManual); render();
    }
  });

  function openSettings(tab = 'general') {
    const back = document.createElement('div');
    back.className = 'modal-back';
    $('#modalRoot').appendChild(back);
    const close = () => back.remove();
    const draw = view => {
      if (view === 'about') view = 'update'; // «Acerca de» está dentro de la pestaña Versión
      const t = T(), s = S();
      const tabs = [['general', t.tabGeneral], ['lists', t.tabLists], ['appearance', t.tabAppearance], ['discord', t.tabDiscord], ['update', t.tabUpdate]];
      const check = (key, label) => `<div class="row"><label for="s-${key}">${esc(label)}</label><input type="checkbox" id="s-${key}" data-key="${key}" ${s[key] ? 'checked' : ''}></div>`;
      const cur = k => hex((s.colors || {})[k]) || hex(getComputedStyle(document.documentElement).getPropertyValue(`--${k}`).trim()) || '#000000';
      const aboutHTML = () => `<div class="about big"><img src="assets/logo.png" alt="" width="120" height="120"><div>`
          + `<h2>NinjaLoot <span class="v">v${esc(state.info.version)}</span></h2>`
          + `<p class="about-desc">${esc(t.aboutDesc)} <span class="about-es"><svg viewBox="0 0 3 2" width="30" height="20" role="img" aria-label="${esc(t.spain)}" style="border-radius:3px"><title>${esc(t.spain)}</title><rect width="3" height="2" fill="#c60b1e"/><rect y=".5" width="3" height="1" fill="#ffc400"/></svg></span></p>`
          + `<p>${esc(t.madeBy)} <b>Drakko</b> <span class="heart">♥</span></p>`
          + `<p class="about-dc first"><svg viewBox="0 0 127.14 96.36" width="26" height="20" aria-hidden="true"><path fill="#5865F2" d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg> <a href="#" class="about-friend" data-friend="discord" data-name="sr.kitkat" title="${esc(t.friendTipDc)}"><b>sr.kitkat</b></a> <span class="muted">${esc(t.questions)}</span></p>`
          + `<p class="about-dc"><img src="assets/battlenet.png" width="26" height="26" alt="" style="border-radius:6px"> <a href="#" class="about-friend" data-friend="battlenet" data-name="KitKat#21202" title="${esc(t.friendTipBn)}"><b>KitKat#21202</b></a> <span class="muted">${esc(t.questions)}</span></p>`
          + `</div></div>`;
      const views = {
        general: () => `<div class="row"><label>${S().lang === 'en' ? 'Server time' : 'Hora del servidor'}</label>${ServerClock.selectHTML()}</div>`
          + `<div class="row"><label>${esc(t.language)}</label><select data-key="lang">${LANGS.map(([c, n]) => `<option value="${c}" ${s.lang === c ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`
          + check('persist', t.persist) + check('confirmClear', t.confirmClear)
          + `<div class="row reset-row"><div><b>${esc(t.resetAll)}</b><div class="small-note">${esc(t.resetHint)}</div></div><button class="btn danger" data-reset-all>${esc(t.resetAll)}</button></div>`,
        lists: () => `<div class="row"><label>${esc(t.topN)}</label><select data-key="topN">${[5, 10, 15, 20, 30, 0].map(n => `<option value="${n}" ${s.topN === n ? 'selected' : ''}>${n === 0 ? esc(t.all) : n}</option>`).join('')}</select></div>`
          + `<div class="row"><label>${esc(t.minGain)}</label><input type="number" min="0" step="50" style="width:110px" data-key="minGain" value="${Number(s.minGain) || 0}"></div>`
          + check('checkGear', t.checkGear) + `<div class="row"><label>${esc(t.staleDays)}</label><input type="number" min="1" max="60" style="width:90px" data-key="staleDays" value="${Number(s.staleDays) || 7}"></div>`
          + check('showCaution', t.showCaution) + `<div class="row"><label>${esc(t.cautionGap)}</label><input type="number" min="1" max="100" style="width:90px" data-key="cautionGap" value="${Number(s.cautionGap) || 15}"></div>`,
        appearance: () => `<div class="row"><label>${esc(t.theme)}</label><div class="seg">${[['dark', t.themeDark], ['light', t.themeLight], ['auto', t.themeAuto]].map(([k, l]) => `<button data-set-theme="${k}" class="${s.theme === k ? 'on' : ''}">${esc(l)}</button>`).join('')}</div></div>`
          + `<div class="row"><label>${esc(t.font)}</label><select data-key="font">${Object.entries(FONTS).map(([k, v]) => `<option value="${k}" ${s.font === k ? 'selected' : ''}>${v[0]}${k === 'noto' ? ` (${esc(t.fontDefault)})` : ''}</option>`).join('')}</select></div>`
          + (s.font === 'expressway' && !fontInstalled('Expressway') ? `<div class="small-note warn">${esc(t.fontMissing)}</div>` : '')
          + `<div class="row"><label>${esc(t.fontScale)}</label><span class="range-row"><input type="range" min="90" max="130" step="5" data-key="fontScale" value="${Number(s.fontScale) || 100}"><output>${Number(s.fontScale) || 100} %</output></span></div>`
          + `<div class="row"><label>${esc(t.density)}</label><select data-key="density"><option value="normal" ${s.density !== 'compact' ? 'selected' : ''}>${esc(t.densityNormal)}</option><option value="compact" ${s.density === 'compact' ? 'selected' : ''}>${esc(t.densityCompact)}</option></select></div>`
          + `<h3>${esc(t.groupDisplay)}</h3>` + check('showValues', t.showValues) + check('showIcons', t.showIcons) + check('showPct', t.showPct) + check('compact', t.compact) + check('chartTall', t.chartTall) + check('tooltips', t.tooltips) + check('animations', t.animations)
          + `<h3>${esc(t.customColors)}</h3><div class="colors">`
          + [['bg', t.colorBg], ['panel', t.colorPanel], ['accent', t.colorAccent], ['text', t.colorText]].map(([k, l]) => `<label>${esc(l)}<input type="color" data-color="${k}" value="${cur(k)}"></label>`).join('')
          + `</div><button class="btn small" data-reset-colors>${esc(t.resetColors)}</button>`,
        discord: () => `<div id="dcBox"><div class="spinner"></div></div>`,
        update: () => `<div id="updBox"></div>${aboutHTML()}<div id="chlogBox"></div>`,
      };
      back.innerHTML = `<div class="panel modal settings" role="dialog" aria-modal="true"><aside class="side"><h2>${esc(t.settingsTitle)}</h2>`
        + `<nav>${tabs.map(([k, l]) => `<button class="side-tab${k === view ? ' on' : ''}" data-tab="${k}">${esc(l)}</button>`).join('')}</nav>`
        + `<button class="btn side-close" data-close>${esc(t.close)}</button></aside><section class="pane">${views[view]()}</section></div>`;
      back.dataset.pane = view;
      if (view === 'update') runUpdateCheck(back.querySelector('#updBox'), back.querySelector('#chlogBox'));
      if (view === 'discord') drawDiscord(back.querySelector('#dcBox'));
    };
    back.addEventListener('mousedown', e => { if (e.target === back) close(); });
    back.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return close();
      const tb = e.target.closest('[data-tab]'); if (tb) return draw(tb.dataset.tab);
      const th = e.target.closest('[data-set-theme]'); if (th) { S().theme = th.dataset.setTheme; persistSettings(); applyTheme(); draw('appearance'); state.animateNext = false; render(); return; }
      if (e.target.closest('[data-dc-save]')) return saveDiscord(back.querySelector('#dcBox'));
      if (e.target.closest('[data-dc-invite]')) return inviteDiscord();
      if (e.target.closest('[data-dc-clear]')) return disconnectDiscord(back.querySelector('#dcBox'));
      const rs = e.target.closest('[data-reset-all]');
      if (rs) { // dos pasos: el primer clic pide confirmar y se anula solo a los 5 s
        if (!rs.dataset.sure) { rs.dataset.sure = '1'; rs.textContent = T().resetSure; setTimeout(() => { if (rs.isConnected) { delete rs.dataset.sure; rs.textContent = T().resetAll; } }, 5000); return; }
        const cur = S(); Object.keys(cur).forEach(k => delete cur[k]); Object.assign(cur, JSON.parse(JSON.stringify(DEFAULTS)));
        persistSettings(); applyTheme(); toast(T().resetDone); draw('general'); state.animateNext = false; render(); return;
      }
      if (e.target.closest('[data-reset-colors]')) { S().colors = null; persistSettings(); applyTheme(); draw('appearance'); state.animateNext = false; render(); }
    });
    back.addEventListener('input', e => {
      if (e.target.type === 'range' && e.target.nextElementSibling) e.target.nextElementSibling.textContent = `${e.target.value} %`;
      const c = e.target.closest('[data-color]');
      if (c) { S().colors = { ...(S().colors || {}), [c.dataset.color]: c.value }; persistSettings(); applyTheme(); state.animateNext = false; render(); }
    });
    back.addEventListener('change', e => {
      const el = e.target.closest('[data-key]'); if (!el) return;
      const key = el.dataset.key, s = S();
      s[key] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.tagName === 'SELECT' && !['lang', 'font', 'density'].includes(key) ? Number(el.value) : el.type === 'number' ? Math.max(0, Number(el.value) || 0) : el.value;
      persistSettings();
      if (key === 'persist') persistSims();
      if (key === 'checkGear') refreshGear();
      if (['animations', 'font', 'fontScale', 'density'].includes(key)) applyTheme();
      state.animateNext = false;
      if (key === 'lang' || key === 'font') draw(back.dataset.pane);
      render();
    });
    draw(tab);
  }

  // ---------- Tooltip de objetos (datos de Wowhead con el nivel de objeto simulado) ----------
  const tipEl = document.createElement('div');
  tipEl.id = 'tip'; tipEl.hidden = true;
  document.body.appendChild(tipEl);
  const tipCache = new Map();
  let tipKey = null;
  function cleanTip(html, trimSet) { // quita scripts, eventos y enlaces del HTML externo (y, si se pide, el bloque del conjunto)
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (trimSet) {
      const link = doc.querySelector('a[href*="item-set="]'), box = link && link.closest('span.q');
      if (box) {
        let n = box.nextSibling;
        while (n) { const nx = n.nextSibling; n.remove(); n = nx; }
        let p = box.previousSibling;
        while (p && p.nodeName === 'BR') { const pv = p.previousSibling; p.remove(); p = pv; }
        box.remove();
      }
    }
    doc.querySelectorAll('script,style,iframe,object,embed,link,meta,form,input,button').forEach(n => n.remove());
    doc.querySelectorAll('[class*=sellprice],[class*=money]').forEach(n => n.remove());
    doc.querySelectorAll('div,span').forEach(n => { if (/^\s*(Sell Price|Precio de venta)/i.test(n.textContent) && n.textContent.length < 60) n.remove(); });
    doc.querySelectorAll('*').forEach(n => {
      for (const at of [...n.attributes]) {
        const nm = at.name.toLowerCase();
        if (nm.startsWith('on') || nm === 'href' || nm === 'style' && !/^\s*color:\s*#[0-9a-f]{3,8};?\s*$/i.test(at.value)) n.removeAttribute(at.name);
        else if (nm === 'src' && !/^https:\/\/wow\.zamimg\.com\//.test(at.value)) n.remove();
      }
    });
    return doc.body.innerHTML;
  }
  // Piezas de tier: la cantidad exacta de cada estadística (la que da Wowhead para la pieza al máximo) entre paréntesis
  async function fillTierStats() {
    const rows = [...document.querySelectorAll('tr[data-tip-trim]')];
    if (!rows.length || !window.api || !window.api.itemTooltip) return;
    const lang = S().lang;
    await Promise.all(rows.map(async tr => {
      try {
        const r = await window.api.itemTooltip(Number(tr.dataset.item), 0, lang);
        if (!r || !r.ok) return;
        const vals = {};
        for (const m of String(r.html).matchAll(/<!--rtg(\d+)-->\s*([\d.,]+)/g)) vals[m[1]] = m[2];
        tr.querySelectorAll('.stat[data-stat]').forEach(el => { const v = vals[el.dataset.stat]; if (v && !el.dataset.done) { el.dataset.done = '1'; el.insertAdjacentHTML('beforeend', ` <span class="stat-n">(${esc(v)})</span>`); } });
        const il = String(r.html).match(/<!--ilvl-->\s*(\d+)/);
        if (il) lvl = il[1];
      } catch { /* sin datos: se queda solo el nombre de la estadística */ }
    }));
  }
  function placeTip(x, y) {
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight, m = 16;
    let left = x + m, top = y + m;
    if (left + w > innerWidth - 8) left = Math.max(8, x - w - m);
    if (top + h > innerHeight - 8) top = Math.max(8, innerHeight - h - 8);
    tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  }
  async function showTip(g, x, y) {
    const id = Number(g.dataset.item), ilvl = Number(g.dataset.ilvl) || 0, lang = S().lang, trim = g.dataset.tipTrim === 'set', key = `${lang}:${id}:${ilvl}${trim ? ':t' : ''}`;
    tipKey = key;
    const foot = g.dataset.gain ? `<div class="tip-gain">${esc(g.dataset.gain)}</div>` : '';
    const fallback = () => { const info = itemInfo({ id }); return `<div class="tip-fallback"><b style="color:${QUALITY_COLORS[info.quality]}">${esc(info.name)}</b><br>${esc(T().ilvl)} ${ilvl}</div>`; };
    if (!tipCache.has(key)) {
      tipEl.innerHTML = `<div class="tip-load">${esc(T().loading)}</div>`; tipEl.hidden = false; placeTip(x, y);
      window.api.itemTooltip(id, ilvl, lang).then(r => { tipCache.set(key, r && r.ok ? cleanTip(r.html, trim) : fallback()); if (tipKey === key) { tipEl.innerHTML = tipCache.get(key) + foot; placeTip(x, y); } });
      return;
    }
    tipEl.innerHTML = tipCache.get(key) + foot; tipEl.hidden = false; placeTip(x, y);
  }
  document.addEventListener('mouseover', e => {
    // Barras: mejora exacta de esa persona con ese objeto
    const bt = !e.target.closest?.('[data-item]') && e.target.closest?.('[data-bartip]');
    if (bt) { tipKey = 'bar'; tipEl.dataset.cur = ''; tipEl.innerHTML = `<div class="tip-bar">${esc(bt.dataset.bartip)}</div>`; tipEl.hidden = false; placeTip(e.clientX, e.clientY); return; }
    if (S().tooltips === false && !e.target.closest?.('[data-tip-always]')) return;
    const g = e.target.closest?.('[data-item]');
    if (!g) { if (tipKey) { tipKey = null; tipEl.hidden = true; } return; }
    if (g.dataset.item + ':' + g.dataset.ilvl + S().lang !== (tipEl.dataset.cur || '')) { tipEl.dataset.cur = g.dataset.item + ':' + g.dataset.ilvl + S().lang; showTip(g, e.clientX, e.clientY); }
  });
  document.addEventListener('mousemove', e => { if (!tipEl.hidden) placeTip(e.clientX, e.clientY); });
  document.addEventListener('mouseout', e => { if (!e.relatedTarget || !e.relatedTarget.closest?.('[data-item],[data-bartip]')) { tipKey = null; tipEl.hidden = true; tipEl.dataset.cur = ''; } });
  window.addEventListener('scroll', () => { tipEl.hidden = true; tipEl.dataset.cur = ''; tipKey = null; }, true);

  // ---------- Rotaciones: tabla jugador x jefe ----------
  // Estados de cada casilla: 'n' = NO rota (verde) · 'r' = SÍ rota (rojo) · 'p' = en duda / pendiente (naranja, por defecto)
  const cellState = (bossId, simId) => { const b = state.rot[bossId]; return (b && !Array.isArray(b) && b[simId]) || 'p'; };
  const setCell = (bossId, simId, st) => { const b = state.rot[bossId]; state.rot[bossId] = { ...(b && !Array.isArray(b) ? b : {}), [simId]: st }; };
  // Cobertura de buffs de un jefe: ok = lo aporta alguien que no rota · warn = solo quien rota · bad = nadie
  function coverage(bossId) {
    return RAID_BUFFS.map(b => {
      const who = state.sims.filter(s => b.from.includes(s.character.cls)).map(s => ({ s, st: cellState(bossId, s.id) }));
      const fixed = who.filter(w => w.st !== 'r');
      return { b, who, status: fixed.length ? 'ok' : who.length ? 'warn' : 'bad' };
    });
  }
  const allBosses = () => state.bosses.groups.flatMap(g => g.bosses.map(b => ({ ...b, name: trName(b.name), group: trName(g.name) })));
  // Jefes de la tabla de rotaciones: los de la temporada y, si se marca, una columna para el jefe de la raid nueva de la semana que viene
  const rotGroups = () => state.bosses.groups;
  const rotBosses = () => rotGroups().flatMap(g => g.bosses.map(b => ({ ...b, name: trName(b.name), group: trName(g.name) })));
  const ST_SYM = { n: '✓', r: '✗', p: '?' };
  const persistRot = () => save('ninjaloot.rotations', state.rot);
  const buffIcon = b => `assets/ui/buff-${b.id}.png`;

  function renderRotations() {
    const t = T(), L = S().lang === 'es' ? 0 : 1, content = $('#content');
    const bosses = rotBosses();
    if (!bosses.find(b => b.id === state.bossSel)) state.bossSel = bosses[0]?.id;
    const sel = bosses.find(b => b.id === state.bossSel);
    const kindLabel = { buff: t.kindBuff, debuff: t.kindDebuff, util: t.kindUtil };
    const stLabel = { n: t.stN, r: t.stR, p: t.stP };

    // Tabla: filas = personajes, columnas = jefes
    let head1 = '<th class="corner" rowspan="2">' + esc(t.rotPlayer) + '</th>', head2 = '';
    for (const g of rotGroups()) {
      head1 += `<th class="grp" colspan="${g.bosses.length}">${esc(trName(g.name))}</th>`;
      for (const b of g.bosses) {
        const cov = coverage(b.id), bad = cov.filter(c => c.status === 'bad').length, warn = cov.filter(c => c.status === 'warn').length;
        const cls = bad ? 'bad' : warn ? 'warn' : 'ok';
        head2 += `<th class="bcol${b.id === state.bossSel ? ' sel' : ''}"><a href="#/rotations/${b.id}" data-boss="${b.id}" title="${esc(t.rotSeeBuffs)}">${bossImg(b.id, 30)}<span class="bn">${esc(trName(b.name))}</span><span class="pill ${cls}">${bad ? `−${bad}` : warn ? `!${warn}` : t.complete}</span></a></th>`;
      }
    }
    let rows = '';
    for (const sim of state.sims) {
      const col = clsColor(sim);
      // Cada casilla con sus tres estados a un clic (✓ no rota · ✗ rota · ? pendiente) y, junto al nombre, los mismos botones para toda la fila
      const seg = (attr, st, title) => `<div class="cellseg">${['n', 'r', 'p'].map(s => `<button class="cs st-${s}${st === s ? ' on' : ''}" ${attr}="${s}" title="${esc(title(s))}">${ST_SYM[s]}</button>`).join('')}</div>`;
      rows += `<tr><th class="who"><span class="wl">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}<span class="wn" style="color:${readable(col)}">${esc(sim.character.name)}</span></span>`
        + `<div class="rowset" data-row="${esc(sim.id)}">${['n', 'r', 'p'].map(s => `<button class="cs st-${s}" data-row-set="${s}" title="${esc(t.rotRowSet(stLabel[s]))}">${ST_SYM[s]}</button>`).join('')}</div></th>`;
      for (const b of bosses) {
        const st = cellState(b.id, sim.id);
        rows += `<td class="${b.id === state.bossSel ? 'sel' : ''}" data-cell="${esc(sim.id)}:${b.id}">${seg('data-cell-set', st, s => `${sim.character.name} — ${b.name}: ${stLabel[s]}`)}</td>`;
      }
      rows += '</tr>';
    }
    const table = state.sims.length
      ? `<div class="rtable-wrap"><table class="rtable"><thead><tr>${head1}</tr><tr>${head2}</tr></thead><tbody>${rows}</tbody></table></div>`
      : `<div class="hint">${esc(t.rotNoSims)}</div><div class="rtable-wrap"><table class="rtable"><thead><tr>${head1}</tr><tr>${head2}</tr></thead></table></div>`;

    let buffs = '';
    if (sel) {
      const cov = coverage(sel.id), bad = cov.filter(c => c.status === 'bad'), warn = cov.filter(c => c.status === 'warn');
      const cls = bad.length ? 'bad' : warn.length ? 'warn' : 'ok';
      const msg = bad.length ? `${t.rotMissing}: ${bad.map(m => buffName(m.b)).join(', ')}` : warn.length ? `${t.rotWarn}: ${warn.map(m => buffName(m.b)).join(', ')}` : t.rotAllCovered;
      buffs = `<div class="panel card"><div class="card-head"><div><h2>${esc(sel.name)}</h2><div class="meta">${esc(sel.group)} · ${esc(state.bosses.season)}</div></div><span class="spacer"></span>`
        + `<div class="card-tools"><span class="meta">${esc(t.rotColumn)}:</span><button class="btn small" data-col-set="n">${esc(t.stN)}</button><button class="btn small" data-col-set="r">${esc(t.stR)}</button><button class="btn small" data-col-set="p">${esc(t.stP)}</button><button class="btn small" data-roster-copy>${esc(t.rotCopy)}</button></div></div>`
        + `<div class="status ${cls}">${esc(msg)}</div><div class="buffs">${cov.map(({ b, who, status }) => `<div class="buff ${status}"><img src="${buffIcon(b)}" alt="" width="36" height="36">`
          + `<div class="bi"><b>${esc(buffName(b))}</b> <span class="kind k-${b.kind}">${esc(kindLabel[b.kind])}</span><div class="be">${esc(buffEffect(b))}</div></div>`
          + `<div class="bs">${status === 'bad' ? `<span class="tag bad">${esc(t.rotMissingTag)}</span><div class="bw">${esc(t.rotProvidedBy)}: ${b.from.map(c => esc(t.classes[c])).join(', ')}</div>`
            : `<span class="tag ${status}">${esc(status === 'ok' ? t.rotCovered : t.rotOnlyRotating)}</span><div class="bw">${who.map(w => esc(w.s.character.name)).join(', ')}</div>`}</div></div>`).join('')}</div></div>`;
    }
    content.innerHTML = `<div class="rot-warning" role="note"><span class="rw-icon">⚠</span><div><b>${esc(t.rotWarnTitle)}</b><p>${esc(t.rotWarnText)}</p></div></div>`
      + `<div class="panel card rot-card"><div class="card-head"><div><h2>${esc(t.rotTitle)}</h2><div class="meta">${esc(rotWeekText())}</div></div><span class="spacer"></span>`
      + `<div class="legend"><span class="lg st-n">✓ ${esc(t.stN)}</span><span class="lg st-r">✗ ${esc(t.stR)}</span><span class="lg st-p">? ${esc(t.stP)}</span></div>`
      + (state.sims.length ? `<button class="btn small" data-rot-reset>${esc(t.rotResetAll)}</button>` : '') + `</div>`
      + `<div class="hint">${esc(t.rotHint)}</div>${table}</div>${vaultSection(bosses)}${buffs}`;
  }

  // Cofre semanal de raid: solo cuentan los jefes marcados como "no rota" (todos empiezan en 0/6); 2, 4 y 6 jefes desbloquean cada hueco
  function vaultSection(bosses) {
    const t = T(), max = bosses.length;
    if (!state.sims.length) return '';
    const cards = state.sims.map(sim => {
      const count = s => bosses.filter(b => cellState(b.id, sim.id) === s).length, kills = count('n'), col = clsColor(sim);
      return `<div class="vault" style="--cc:${col}"><div class="v-head">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="" style="border-color:${col}">` : ''}<b style="color:${readable(col)}">${esc(sim.character.name)}</b></div>`
        + `<div class="v-count${kills >= 6 ? ' full' : ''}">${kills}/6</div><div class="v-slots">${[2, 4, 6].map(n => `<span class="v-slot${kills >= n ? ' on' : ''}">${Math.min(kills, n)}/${n}</span>`).join('')}</div>`
        + `<div class="meta">${esc(t.vaultCounts(kills, count('r'), count('p')))}</div></div>`;
    }).join('');
    return `<div class="panel card"><div class="card-head"><div><h2>${esc(t.vaultTitle)}</h2><div class="meta">${esc(t.vaultMax(max))}</div></div><span class="spacer"></span></div>`
      + `<div class="hint">${esc(t.vaultHint)}</div><div class="vaults">${cards}</div></div>`;
  }

  // ---------- Tiers: bonus de 2/4 piezas por especialización y piezas de tier de cada clase (ficha de raid) ----------
  const specLabel = (cls, key) => { const d = SPECS[cls][key], l = S().lang; return l === 'es' ? d[1] : (SPEC_L10N[l]?.[cls]?.[key] || d[0]); };
  function tiersView() {
    const t = T(), l = S().lang, sel = state.tierCls;
    if (!state.tierOpen) state.tierOpen = new Set();
    const classes = Object.keys(TIERS.classes).sort((a, b) => t.classes[a].localeCompare(t.classes[b], l));
    let html = `<section class="panel card"><div class="card-head"><div><h2>${esc(t.tiersTitle)}</h2><div class="meta">${esc(state.bosses.season || TIERS.season)}</div></div></div><div class="hint">${esc(t.tiersHint)}</div>`
      + `<div class="tier-classes">${classes.map(c => `<button class="tier-cls${c === sel ? ' on' : ''}" data-tier-cls="${c}" style="--cc:${CLASS_COLORS[c]}"><img src="assets/classes/${c}.png" alt=""><span style="color:${readable(CLASS_COLORS[c])}">${esc(t.classes[c])}</span></button>`).join('')}</div></section>`;
    const d = TIERS.classes[sel];
    if (!d) return html;
    const col = CLASS_COLORS[sel];
    const bn = d.items.map(i => bossSrcOf(i.boss)).find(Boolean);
    html += `<section class="panel card tier-detail" style="--cc:${col}${bn ? `;--bn:url('${bn}')` : ''}"><div class="card-head tier-banner"><img class="cls-icon" src="assets/classes/${sel}.png" alt="" style="border-color:${col}"><div><h2 style="color:${readable(col)}">${esc(t.classes[sel])}</h2><div class="meta">${esc(d.name[l] || d.name.en)}</div></div></div>`
      + `<h3>${esc(t.tierBonus)}</h3><div class="tier-specs">`
      + Object.keys(SPECS[sel]).filter(k => d.bonus[k]).map(k => { const b = d.bonus[k][l] || d.bonus[k].en;
        // cada especialización es un desplegable cerrado: el texto de 2 y 4 piezas solo sale al pulsarla
        const key = `${sel}:${k}`, open = state.tierOpen.has(key);
        return `<div class="tier-spec${open ? ' open' : ''}"><button type="button" class="ts-head" data-ts-toggle="${key}" aria-expanded="${open}"><img src="assets/specs/${sel}-${k}.png" alt="" style="border-color:${col}"><b>${esc(specLabel(sel, k))}</b><small class="ts-sub">${esc(t.tier2)} · ${esc(t.tier4)}</small><span class="ts-chev" aria-hidden="true"></span></button>`
          + `<div class="ts-body"${open ? '' : ' hidden'}><div class="ts-bonus"><span class="ts-pc">${esc(t.tier2)}</span><p>${esc(b[0] || '')}</p></div><div class="ts-bonus"><span class="ts-pc">${esc(t.tier4)}</span><p>${esc(b[1] || '')}</p></div></div></div>`; }).join('')
      + `</div><h3>${esc(t.tierPieces)}</h3><div class="ptable-wrap"><table class="ptable"><thead><tr><th>${esc(t.colItem)}</th><th>${esc(t.colSlot)}</th><th>${esc(t.statsLabel)}</th><th>${esc(t.colBoss)}</th></tr></thead><tbody>`
      + d.items.map(it => { state.shown.add(it.id); const info = itemInfo({ id: it.id });
        return `<tr class="qrow" style="--q:${QUALITY_COLORS[info.quality]}" data-item="${it.id}" data-ilvl="" data-tip-trim="set"><td class="it"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span></td>`
          + `<td>${esc(capFirst(t.slots[it.slot] || it.slot))}</td><td class="ts-stats">${it.stats.map(s => `<span class="stat" data-stat="${s}">${esc(t.statNames[s] || s)}</span>`).join(' + ')}</td><td class="tb"><span class="tb-in">${bossImg(it.boss, 24)}<b>${esc(bossLabel(it.boss) || '')}</b></span></td></tr>`; }).join('')
      + `</tbody></table></div><div class="hint">${esc(t.tierAny(bossLabel(TIERS.anyBoss) || "Ula'tek"))}</div><div class="cat-note bib"><img src="${WEB_ICON(BIBELOT.icon)}" alt="" data-item="${BIBELOT.id}"> <b>${esc(t.bibelotName)}</b> <span>${esc(t.bibelotNote)}</span></div></section>`;
    return html;
  }

  // ---------- Actualizaciones ----------
  const semver = v => String(v || '').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  function capFirst(s) { s = String(s || ''); return s.charAt(0).toLocaleUpperCase() + s.slice(1); }
  const isNewer = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  // Pestaña Versión: tu versión y su estado, un solo botón que busca, descarga, instala y reabre, y el historial de versiones
  async function runUpdateCheck(box, histBox) {
    const t = T(), cur = state.info.version;
    const log = (CHANGELOG[S().lang] || CHANGELOG.en || CHANGELOG.es);
    box.innerHTML = `<div class="ver-card"><div><div class="meta">${esc(t.updYours)}</div><b class="ver-big">v${esc(cur)}</b></div><span class="ver-status na" id="verStatus">${esc(t.checking)}</span></div>`
      + (IS_VERCEL ? '' : `<button class="btn grad" data-upd-go>${esc(t.updGo)}</button><div class="small-note" id="updNote"></div>`)
      + `<label class="switch-row"><input type="checkbox" class="switch" id="autoUpd" ${S().autoUpdateCheck !== false ? 'checked' : ''}><span>${esc(t.updAuto)}</span></label>`
      ;
    if (histBox) histBox.innerHTML = `<h3 class="chlog-title">${esc(t.updHistory)}</h3><div class="chlog" id="chlog"></div>${log.length > 10 ? `<button class="btn small" id="chlogMore" data-chlog-more></button>` : ''}`;
    let all = false;
    const paintLog = () => {
      if (!histBox) return;
      histBox.querySelector('#chlog').innerHTML = changelogCards(all ? log : log.slice(0, 10), S().lang, t.latestVersion);
      const m = histBox.querySelector('#chlogMore'); if (m) m.textContent = all ? t.showLess : t.showMore(log.length - 10);
    };
    paintLog();
    histBox?.querySelector('#chlogMore')?.addEventListener('click', () => { all = !all; paintLog(); });
    const status = (cls, msg) => { const el = box.querySelector('#verStatus'); if (el) { el.className = `ver-status ${cls}`; el.textContent = msg; } };
    const note = msg => { const n = box.querySelector('#updNote'); if (n) n.textContent = msg; };
    box.querySelector('#autoUpd').addEventListener('change', e => { S().autoUpdateCheck = e.target.checked; persistSettings(); });
    const check = async () => {
      const r = await window.api.checkUpdate();
      if (!r.ok) { status('bad', t.updError); return null; }
      setBadge(r);
      const latest = r.release?.version || r.main || null, outdated = latest && isNewer(latest, r.current);
      status(!latest ? 'na' : outdated ? 'bad' : 'ok', !latest ? t.updNone : outdated ? `${t.updOutdated}: v${latest}` : t.updCurrent);
      return { r, outdated };
    };
    check();
    box.querySelector('[data-upd-go]')?.addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.disabled = true; note(t.checking);
      const c = await check();
      if (!c || !c.outdated || !c.r.release?.asset) { note(c ? t.updCurrent : t.updError); btn.disabled = false; return; }
      note(t.updDownloading);
      window.api.onUpdateProgress?.(f => note(`${t.updDownloading} ${Math.round(f * 100)}%`));
      const res = await window.api.installUpdate(c.r.release.asset);
      if (!res.ok) { note(t.updError); btn.disabled = false; }
    });
  }

  // Versión junto a los ajustes: verde si es la más actual, rojo si no. Se comprueba en vivo (cada 2 min y al volver a la ventana).
  function setBadge(r) {
    const b = $('#verBadge'), cur = (r && r.current) || state.info.version;
    if (!cur) return;
    const latest = r && r.ok ? (r.release?.version || r.main || null) : (state.latest || null);
    if (r && r.ok) state.latest = latest;
    b.hidden = false; b.textContent = `v${cur}`;
    const outdated = latest && isNewer(latest, cur);
    b.className = `verbadge ${!latest ? 'na' : outdated ? 'bad' : 'ok'}`;
    b.title = latest ? `${T().updRelease}: v${latest}` : '';
    if (outdated && state.notified !== latest) { state.notified = latest; toast(`${T().updOutdated}: v${latest}`, true); }
  }
  let lastCheck = 0;
  async function trackVersion(force = false) {
    if (S().autoUpdateCheck === false) return; // "Buscar actualizaciones al abrir" desactivado
    if (!force && Date.now() - lastCheck < 30000) return;
    lastCheck = Date.now();
    try { setBadge(await window.api.checkUpdate()); } catch {}
  }
  setInterval(() => trackVersion(true), 120000);
  window.addEventListener('focus', () => trackVersion());

  // ---------- Eventos ----------
  // Exportar: formato (CSV/JSON) y qué exportar (todo, un jefe, un jugador o una pieza)
  $('#btnExportData').onclick = () => {
    const t = T(), rows = exportRows(), uniq = (f, lbl) => [...new Map(rows.map(r => [String(f(r)), lbl(r)])).entries()].filter(([k]) => k).sort((a, b) => a[1].localeCompare(b[1]));
    const lists = { boss: uniq(r => r.boss, r => r.instance ? `${r.boss} · ${r.instance}` : r.boss), player: uniq(r => r.player, r => r.player), item: uniq(r => r.itemId, r => `${r.item} (${r.ilvl})`) };
    modal({ title: t.exportData, body: `<p class="hint">${esc(t.exportHint)}</p>`
      + `<div class="row"><label>${esc(t.exportFormat)}</label><div class="seg" id="xFmt"><button data-xf="csv" class="on">CSV (Excel)</button><button data-xf="json">JSON</button></div></div>`
      + `<div class="row"><label for="xScope">${esc(t.exportScope)}</label><select id="xScope">${[['all', t.exportAll], ['boss', t.exportBoss], ['player', t.exportPlayer], ['item', t.exportItem]].map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></div>`
      + `<div class="row" id="xWhichRow" hidden><label for="xWhich" id="xWhichLbl"></label><select id="xWhich" style="max-width:340px"></select></div>`
      + `<div class="card-tools" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" data-xgo>${esc(t.exportData)}</button></div>` });
    const box = $('#modalRoot').lastElementChild;
    const fill = () => {
      const sc = box.querySelector('#xScope').value, row = box.querySelector('#xWhichRow');
      row.hidden = sc === 'all';
      if (sc !== 'all') { box.querySelector('#xWhichLbl').textContent = { boss: t.exportBoss, player: t.exportPlayer, item: t.exportItem }[sc]; box.querySelector('#xWhich').innerHTML = lists[sc].map(([k, l]) => `<option value="${esc(k)}">${esc(l)}</option>`).join(''); }
    };
    box.querySelector('#xScope').onchange = fill;
    box.querySelector('#xFmt').onclick = e => { const b = e.target.closest('[data-xf]'); if (b) box.querySelectorAll('[data-xf]').forEach(x => x.classList.toggle('on', x === b)); };
    box.querySelector('[data-xgo]').onclick = () => {
      const fmt = box.querySelector('[data-xf].on').dataset.xf, sc = box.querySelector('#xScope').value, which = sc === 'all' ? '' : box.querySelector('#xWhich').value;
      box.remove(); exportData(fmt, sc, which);
    };
  };
  $('#btnAdd').onclick = () => { const v = $('#urlInput').value; if (v.trim()) { $('#urlInput').value = ''; addFromText(v); } };
  $('#btnPaste').onclick = async () => { try { const v = await navigator.clipboard.readText(); if (v) addFromText(v); } catch { $('#urlInput').focus(); } };
  $('#btnClear').onclick = clearAll;
  $('#btnSettings').onclick = () => openSettings();
  ServerClock.init({ after: document.querySelector('.topbar .brand > div'), lang: () => S().lang, region: () => S().serverRegion || 'eu', setRegion: v => { S().serverRegion = v; persistSettings(); } });
  $('#verBadge').onclick = () => openSettings('update');
  // Menú de idiomas: el idioma activo aparece iluminado
  const langMenu = () => $('#langMenu');
  function renderLangMenu() {
    langMenu().innerHTML = LANGS.map(([c, n]) => `<button data-lang="${c}" class="${S().lang === c ? 'on' : ''}"><span>${esc(n)}</span><span class="code">${c.toUpperCase()}</span></button>`).join('');
  }
  $('#btnLang').onclick = e => { e.stopPropagation(); langMenu().hidden = !langMenu().hidden; };
  document.addEventListener('click', e => { if (!e.target.closest('.langwrap')) langMenu().hidden = true; });
  $('#urlInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#btnAdd').click(); } });
  $('#urlInput').addEventListener('paste', e => { const txt = e.clipboardData.getData('text'); if (extractIds(txt).length) { e.preventDefault(); addFromText(txt); } });

  document.addEventListener('click', e => {
    const q = a => e.target.closest(`[${a}]`);
    let el;
    if (!e.target.closest('.spec-pick')) document.querySelectorAll('.spec-pick-menu').forEach(m => { m.hidden = true; });
    if ((el = q('data-remove'))) removeSim(el.dataset.remove);
    else if (q('data-pick-toggle')) { const m = e.target.closest('.spec-pick').querySelector('.spec-pick-menu'); m.hidden = !m.hidden; }
    else if ((el = q('data-pick'))) { const s = state.sims.find(x => x.id === el.dataset.pick); if (s) { setPersonalList([s]); state.personalUrl = s.url; save('ninjaloot.personalUrl', s.url); state.animateNext = true; render(); } }
    else if (q('data-vault-refresh')) { const c = state.personalList[0]?.character; if (c) { refreshVault(c, true); render(); } }
    else if ((el = q('data-pers-remove'))) { setPersonalList(state.personalList.filter(r => r.id !== el.dataset.persRemove)); state.animateNext = false; render(); }
    else if ((el = q('data-pcat'))) { S().persCat = el.dataset.pcat; persistSettings(); render(); }
    else if ((el = q('data-lang'))) { S().lang = el.dataset.lang; persistSettings(); langMenu().hidden = true; state.animateNext = false; render(); }
    else if ((el = q('data-view'))) { if (!plainClick(e)) return; e.preventDefault(); state.view = el.dataset.view; state.animateNext = true; render(); window.scrollTo(0, 0); }
    else if ((el = q('data-mode'))) { S().chartMode = el.dataset.mode; if (el.dataset.mode === 'boss') S().srcCat = 'all'; persistSettings(); state.animateNext = true; render(); }
    else if (q('data-capture')) captureModal();
    else if ((el = q('data-role'))) { S().roleFilter = el.dataset.role; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-clsf'))) { S().classFilter = el.dataset.clsf; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-diff'))) { S().diff = el.dataset.diff; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-cat'))) { S().srcCat = el.dataset.cat; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-pmode'))) { S().persMode = el.dataset.pmode; persistSettings(); render(); }
    else if (q('data-personal-load')) { loadPersonal($('#personalUrl').value); }
    else if ((el = q('data-slot-load'))) { const i = document.querySelector(`.slot-input[data-slot="${el.dataset.slotLoad}"]`); if (i) loadPersonal(i.value, el.dataset.slotLoad); }
    else if ((el = q('data-ts-toggle'))) {
      const card = el.closest('.tier-spec'), open = !card.classList.contains('open');
      card.classList.toggle('open', open);
      el.setAttribute('aria-expanded', String(open));
      card.querySelector('.ts-body').hidden = !open;
      if (!state.tierOpen) state.tierOpen = new Set();
      if (open) state.tierOpen.add(el.dataset.tsToggle); else state.tierOpen.delete(el.dataset.tsToggle);
    }
    else if ((el = q('data-tier-cls'))) { state.tierCls = state.tierCls === el.dataset.tierCls ? null : el.dataset.tierCls; render(); }
    else if ((el = q('data-boss'))){ if (!plainClick(e)) return; e.preventDefault(); state.bossSel = Number(el.dataset.boss); render(); }
    else if ((el = q('data-cell-set'))) { const [sid, bid] = el.closest('[data-cell]').dataset.cell.split(':'); setCell(Number(bid), sid, el.dataset.cellSet); persistRot(); render(); }
    else if ((el = q('data-row-set'))) { const sid = el.closest('[data-row]').dataset.row; for (const b of rotBosses()) setCell(b.id, sid, el.dataset.rowSet); persistRot(); render(); }
    else if (q('data-rot-reset')) { const doIt = () => { state.rot = {}; persistRot(); render(); }; S().confirmClear ? modal({ title: T().rotResetAll, body: `<p>${esc(T().rotResetConfirm)}</p>`, actions: [{ label: T().cancel }, { label: T().confirm, cls: 'danger', onclick: doIt }] }) : doIt(); }
    else if ((el = q('data-col-set'))) { for (const s of state.sims) setCell(state.bossSel, s.id, el.dataset.colSet); persistRot(); render(); }
    else if (q('data-roster-copy')) { const src = state.rot[state.bossSel]; for (const b of rotBosses()) state.rot[b.id] = { ...(src && !Array.isArray(src) ? src : {}) }; persistRot(); render(); toast(T().rotCopied); }
    else if ((el = q('data-refresh'))) addSim(el.dataset.refresh, true);
    else if ((el = q('data-simc'))) { const sm = [...state.personalList, ...state.sims, ...state.extra].find(x => x && x.id === el.dataset.simc); const txt = sm && sm.head && sm.head.simc; if (txt) { try { navigator.clipboard.writeText(txt).then(() => toast(T().shCopied), () => toast(T().noClip || 'No se pudo copiar', true)); } catch { toast('No se pudo copiar', true); } } }
    else if ((el = q('data-coin-src'))) { S().coinSrc = el.dataset.coinSrc; persistSettings(); state.animateNext = false; render(); }
    else if ((el = q('data-open'))) window.api.openExternal(el.dataset.open);
    else if ((el = q('data-export'))) exportChart(el.dataset.export);
    else if ((el = q('data-toggle'))) { const id = el.dataset.toggle; state.expanded.has(id) ? state.expanded.delete(id) : state.expanded.add(id); delete state.page[id]; state.animateNext = false; render(); }
    else if ((el = q('data-page'))) { const id = el.dataset.page; if (el.disabled) return; state.page[id] = Math.max(0, (state.page[id] || 0) + Number(el.dataset.dir)); state.animateNext = false; const sy = document.scrollingElement.scrollTop; render(); document.scrollingElement.scrollTop = sy; }
    else if ((el = q('data-barstyle'))) { S()[barKey()] = el.dataset.barstyle; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-raid'))) { S().raidPick = el.dataset.raid === 'all' ? 'all' : Number(el.dataset.raid); S().bossPick = 'all'; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-unit'))) { S().unit = el.dataset.unit; persistSettings(); state.animateNext = true; render(); }
    else if ((el = e.target.closest('#overview .bar[role="button"]'))) document.getElementById(`sim-${el.dataset.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { langMenu().hidden = true; closeTopModal(); }
    else if (e.key === 'Enter' && (e.target.id === 'personalUrl' || e.target.classList?.contains('slot-input'))) { e.preventDefault(); loadPersonal(e.target.value, e.target.dataset.slot); }
    else if (e.ctrlKey && e.key === ',') { e.preventDefault(); if (!$('.modal-back')) openSettings(); }
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.bar[role="button"]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    else if (e.ctrlKey && e.key.toLowerCase() === 'v' && state.view === 'charts' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) $('#btnPaste').click();
  });
  // La URL de la simulación personal se conserva al cambiar de pestaña y entre sesiones
  document.addEventListener('input', e => { if (e.target.id === 'personalUrl') { state.personalUrl = e.target.value; save('ninjaloot.personalUrl', state.personalUrl); } });
  document.addEventListener('change', e => {
    const gvc = state.personalList[0]?.character;
    if (gvc && e.target.matches('[data-gv-count]')) { gvWorldSet(gvc, { count: Number(e.target.value) || 0 }); state.animateNext = false; render(); return; }
    if (gvc && e.target.matches('[data-gv-tier]')) { const tiers = gvWorld(gvc).tiers.slice(); tiers[Number(e.target.dataset.gvTier)] = e.target.value; gvWorldSet(gvc, { tiers }); state.animateNext = false; render(); return; }
    if (e.target.id === 'lootSort') { S().lootSort = e.target.value; persistSettings(); state.animateNext = false; render(); return; }
    if (e.target.id === 'coinCount') { S().coins = Math.max(1, Math.min(20, Number(e.target.value) || 5)); persistSettings(); render(); return; }
    if (e.target.id === 'bossPick') { S().bossPick = e.target.value === 'all' ? 'all' : Number(e.target.value); persistSettings(); state.animateNext = true; render(); return; }
  });
  // Arrastrar enlaces o texto sobre la ventana
  let dragDepth = 0;
  window.addEventListener('dragenter', e => { e.preventDefault(); dragDepth++; document.body.classList.add('dragging'); });
  window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => {
    e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging');
    const txt = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (txt) addFromText(txt);
  });

  // ---------- Inicio ----------
  applyTheme();
  render();
  setTimeout(upgradeOldSims, 1500);
  refreshGear();
  // Reinicio semanal con la app abierta: se vuelve a pintar (fechas del roster y del cofre, que se pide otra vez)
  let seenReset = lastReset('eu') + ':' + lastReset('us');
  setInterval(() => { const r = lastReset('eu') + ':' + lastReset('us'); if (r !== seenReset) { seenReset = r; state.animateNext = false; render(); } }, 60000);
  window.api.appInfo().then(i => { state.info = i; setBadge(null); trackVersion(true); });
  window.api.getBosses().then(r => { if (r && r.ok) { state.bosses = r.data; if (state.view === 'rotations') render(); } });
})();
