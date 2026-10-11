'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = "'Noto Sans', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif";
  const WEB_ICON = n => `https://wow.zamimg.com/images/wow/icons/large/${n}.jpg`;
  const ui = (n, c = '') => `<img class="uiicon ${c}" src="assets/ui/${n}.png" alt="">`;

  // ---------- Estado y ajustes ----------
  const DEFAULTS = { lang: 'es', theme: 'dark', colors: null, topN: 10, unit: 'dps', showValues: true, showIcons: true, showPct: false, animations: true, compact: false, persist: true, confirmClear: true, minGain: 0, showCaution: true, cautionGap: 15, chartMode: 'boss', diff: 'auto', srcCat: 'all', persMode: 'all', vaultNew: true, checkGear: true, staleDays: 7, coins: 5, font: 'noto', fontScale: 100, density: 'normal', tooltips: true, chartTall: false };
  const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const state = {
    settings: { ...DEFAULTS, ...load('ninjaloot.settings', {}) },
    sims: [], loading: new Set(), names: { es: {}, en: {}, fr: {}, de: {} }, expanded: new Set(), animateNext: true, info: { version: '' },
    view: 'home', personal: null, personalList: [], gear: load('ninjaloot.gear', {}), personalUrl: load('ninjaloot.personalUrl', ''), shown: new Set(), bossSel: null, bosses: BOSSES_SNAPSHOT, rot: load('ninjaloot.rotations', {}),
  };
  if (state.settings.persist) state.sims = load('ninjaloot.sims', []).filter(s => s && s.id && Array.isArray(s.items));
  // Simulación personal: una o varias simulaciones de la misma persona (raid, míticas...) y su versión combinada para compararlas
  state.personalList = (() => { const l = load('ninjaloot.personalList', null); if (Array.isArray(l)) return l.filter(r => r && r.id && Array.isArray(r.items)); const one = load('ninjaloot.personal', null); return one && Array.isArray(one.items) ? [one] : []; })();
  state.personal = mergePersonal(state.personalList);
  const S = () => state.settings;
  const T = () => I18N[S().lang] || I18N.es;
  const persistSims = () => save('ninjaloot.sims', S().persist ? state.sims : []);
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
    const src = loc ? `assets/items/${loc[1]}.png` : WEB_ICON(icon);
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
  const nf = () => new Intl.NumberFormat({ es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' }[S().lang] || 'en-US');

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
  const activeSims = () => { const e = effectiveDiff(); return state.sims.filter(s => !e || !s.difficulty || s.difficulty === e); };
  const diffBadge = d => d ? `<span class="dbadge d-${d}" title="${esc(T().diffNames[d])}">${DIFF_TAG[d]}</span>` : '';
  const xmark = '<svg class="xmark" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
  // Simulaciones guardadas con el parser antiguo: el encuentro quedó en "difficulty" (formato actual de Raidbots)
  const fixSrc = s => s.encounter == null && Math.abs(s.difficulty) > 20 ? { ...s, encounter: s.difficulty, difficulty: null } : s;
  const srcOf = it => (it.source && fixSrc(it.source)) || (ITEMS[it.id]?.[6]?.[0] ? { instance: ITEMS[it.id][6][0][0], encounter: ITEMS[it.id][6][0][1] } : null);
  const catOfType = ty => /raid/.test(ty) ? 'raid' : /mplus|dungeon/.test(ty) ? 'dungeon' : /delve/.test(ty) ? 'delve' : /prey/.test(ty) ? 'prey' : /catalyst/.test(ty) ? 'catalyst' : /pvp/.test(ty) ? 'pvp' : /profession/.test(ty) ? 'craft' : /bonus/.test(ty) ? 'bonus' : 'other';
  const catOfSrc = s => s ? catOfType(((state.bosses.inst || {})[s.instance] || {}).t || '') : 'other';
  const bossLabel = enc => (state.bosses.names || {})[enc] || '';
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
  const owned = (sim, it) => { const g = gearOf(sim); return !!g && Object.values(g).some(x => x.id === it.id && x.ilvl >= (it.ilvl || 0)); };
  function staleInfo(sim) {
    const t = T(), out = [], days = sim.simDate ? (Date.now() - sim.simDate) / 864e5 : null;
    if (days != null && days > (Number(S().staleDays) || 7)) out.push(t.staleOld(Math.floor(days)));
    const g = gearOf(sim);
    if (g) {
      const changed = gearChanges(sim).length;
      if (changed) out.push(t.staleGear(changed));
      const own = sim.items.filter(it => owned(sim, it)).length;
      if (own) out.push(t.staleOwned(own));
    }
    return out;
  }
  // Piezas que han cambiado desde la sim: ranura, lo que llevaba (objeto y nivel) y lo que lleva ahora
  const SLOT_ORDER = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands', 'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2', 'main_hand', 'off_hand'];
  function gearChanges(sim) {
    const g = gearOf(sim), eq = sim.equippedAtSim || {};
    if (!g) return [];
    return SLOT_ORDER.filter(s => eq[s] && g[s] && (g[s].id !== eq[s].id || g[s].ilvl !== eq[s].ilvl)).map(s => ({ slot: s, from: eq[s], to: g[s] }));
  }
  // Ayuda «?»: explica exactamente por qué se avisa (sim antigua, equipo cambiado, mejoras que ya lleva)
  function staleWhy(sim) {
    const t = T(), parts = [], max = Number(S().staleDays) || 7, days = sim.simDate ? (Date.now() - sim.simDate) / 864e5 : null;
    if (days != null && days > max) parts.push(`<p>${esc(t.staleWhyOld(Math.floor(days), max, new Date(sim.simDate).toLocaleDateString(S().lang, { day: 'numeric', month: 'long' })))}</p>`);
    const ch = gearChanges(sim);
    if (ch.length) parts.push(`<p>${esc(t.staleWhyGear)}</p><ul>${ch.map(({ slot, from, to }) => `<li><b>${esc(capFirst(t.slots[slot] || slot))}:</b> ${esc(itemInfo({ id: from.id }).name)} (${from.ilvl}) → ${esc(itemInfo({ id: to.id }).name)} (${to.ilvl})</li>`).join('')}</ul>`);
    const own = sim.items.filter(it => owned(sim, it));
    if (own.length) parts.push(`<p>${esc(t.staleWhyOwned)}</p><ul>${own.map(it => `<li>${esc(itemInfo(it).name)} (${it.ilvl}) <span class="meta">+${nf().format(it.gain)}</span></li>`).join('')}</ul>`);
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
          return `<li><span class="sc-slot">${esc(t.slots[slot] || slot)}</span>${from.id === to.id ? t.gearUpgraded(a.html, from.ilvl, to.ilvl) : t.gearSwapped(a.html, from.ilvl, b.html, to.ilvl)}</li>`; }).join('')}</ul>` : '')(gearChanges(s))).join('') + '</section>';
  }
  function toolbarHtml() {
    const t = T(), p = presentDiffs(), eff = effectiveDiff(), mode = S().chartMode;
    let h = `<div class="charts-bar"><div class="seg"><button data-mode="boss" class="${mode === 'boss' ? 'on' : ''}">${esc(t.modeBoss)}</button><button data-mode="player" class="${mode === 'player' ? 'on' : ''}">${esc(t.modePlayer)}</button></div>`;
    if (p.length) h += `<div class="diffbar"><span class="meta">${esc(t.diffLabel)}:</span>` + (p.length > 1 ? `<div class="seg">${p.map(d => `<button data-diff="${d}" class="${d === eff ? 'on' : ''}" title="${esc(t.diffNames[d])}">${DIFF_TAG[d]}</button>`).join('')}</div>` : diffBadge(p[0])) + '</div>';
    if (mode === 'boss') {
      const cats = {};
      for (const s of act0()) for (const it of s.items) { const c = catOfSrc(srcOf(it)); cats[c] = (cats[c] || 0) + 1; }
      const keys = ['raid', 'dungeon', 'delve', 'prey', 'catalyst', 'craft', 'pvp', 'bonus', 'other'].filter(k => cats[k]);
      if (keys.length > 1) h += `<div class="diffbar"><span class="meta">${esc(t.srcLabel)}:</span><div class="seg"><button data-cat="all" class="${effCat() === 'all' ? 'on' : ''}">${esc(t.catAll)}</button>${keys.map(k => `<button data-cat="${k}" class="${effCat() === k ? 'on' : ''}">${esc(t['cat' + k[0].toUpperCase() + k.slice(1)] || k)}</button>`).join('')}</div></div>`;
      // Raid (todas o una) y jefe (todos o uno) de la temporada
      if (['all', 'raid'].includes(effCat()) && state.bosses.groups.length) {
        const raid = effRaid(), list = raidBossList();
        if (state.bosses.groups.length > 1) h += `<div class="diffbar"><span class="meta">${esc(t.raidLabel)}:</span><div class="seg"><button data-raid="all" class="${raid === 'all' ? 'on' : ''}">${esc(t.raidAll)}</button>${state.bosses.groups.map(g => `<button data-raid="${g.id}" class="${raid === g.id ? 'on' : ''}">${esc(g.name)}</button>`).join('')}</div></div>`;
        h += `<div class="diffbar"><span class="meta">${esc(t.bossPickLabel)}:</span><select id="bossPick" class="txt small"><option value="all">${esc(t.bossAll)}</option>${list.map(b => `<option value="${b.id}"${effBossPick() === b.id ? ' selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div>`;
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
      html += `<section class="panel card" id="boss-${enc}"><div class="card-head"><div><h2>${esc(name)}</h2><div class="meta">${esc([groupOf.get(enc), `${rows.length} ${t.items}`].filter(Boolean).join(' · '))}</div></div><span class="spacer"></span><div class="card-tools">`
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
    const draw = (list, big) => detailed() ? Chart.build(list, { ...chartOpts, ...big }) : Chart.mini(list, { colors: chartOpts.colors, compact: chartOpts.compact, tickFmt: chartOpts.tickFmt, animate: chartOpts.animate });
    let html = `<section class="panel card" id="overview"><div class="card-head"><h2>${esc(t.overviewTitle)}</h2><span class="spacer"></span>`
      + `<div class="card-tools"><button class="btn small" data-export="overview">${ui('export')}${esc(t.exportPng)}</button></div></div>`
      + `<div class="hint">${esc(t.overviewHint)}</div><div class="chart-wrap${detailed() ? '' : ' simple'}" data-chart="overview">${draw(entries, { slot: 112, height: 300 })}</div></section>`;
    for (const sim of sims) {
      const col = clsColor(sim), list = visibleItems(sim), total = sim.items.filter(i => i.gain >= (Number(S().minGain) || 0)).length;
      const items = list.map(it => {
        const info = itemInfo(it);
        state.shown.add(it.id);
        return { id: it.id, value: valueOf(it, sim), label: info.name + (info.tag ? ' ' + info.tag : ''), itemId: it.id, ilvl: it.ilvl, gain: gainLine(it), color: col, labelColor: readable(QUALITY_COLORS[info.quality]), icon: null, bottomIcon: info.icon, valueText: valueText(it, sim),
          tipIcon: 'bottom', tip: exactTip(sim.character.name, it.gain, it.pct) + (owned(sim, it) ? ` (${t.ownedTag})` : ''), owned: owned(sim, it) };
      });
      const canToggle = S().topN !== 0 && total > S().topN;
      html += `<section class="panel card" id="sim-${esc(sim.id)}"><div class="card-head">`
        + (specIcon(sim) ? `<img class="cls-icon" src="${specIcon(sim)}" alt="" style="border-color:${col}">` : '')
        + `<div><h2 style="color:${readable(col)}">${esc(sim.character.name)} ${diffBadge(sim.difficulty)}</h2>`
        + `<div class="meta">${esc([specName(sim), clsName(sim), sim.character.realm].filter(Boolean).join(' · '))} — ${esc(t.baseDps)}: ${nf().format(sim.baseDps)} — ${total} ${esc(t.items)}</div></div>`
        + `<span class="spacer"></span><div class="card-tools">`
        + (canToggle ? `<button class="btn small" data-toggle="${esc(sim.id)}">${esc(state.expanded.has(sim.id) ? t.showLess : t.showAll)}</button>` : '')
        + `<button class="btn small" data-open="${esc(sim.url)}">${ui('open')}${esc(t.openRaidbots)}</button>`
        + `<button class="btn small" data-refresh="${esc(sim.id)}" title="${esc(t.refresh)}">${ui('refresh')}</button>`
        + `<button class="btn small" data-export="${esc(sim.id)}">${ui('export')}${esc(t.exportPng)}</button>`
        + `<button class="btn small danger" data-remove="${esc(sim.id)}" title="${esc(t.remove)}">${xmark}</button></div></div>`
        + `<div class="chart-wrap${detailed() ? '' : ' simple'}" data-chart="${esc(sim.id)}">${draw(items, { slot: 104, height: 240, bottom: 128, labelSize: 12.5, maxLines: 3 })}</div></section>`;
    }
    return html;
  }

  // ---------- Inicio ----------
  function homeView() {
    const t = T();
    const feats = [['charts', 'f1'], ['personal', 'f2'], ['coin', 'f3'], ['rotations', 'f4'], ['remove', 'f5'], ['lang', 'f6']];
    return `<section class="panel home-hero"><img src="assets/logo.png" alt="" width="128" height="128"><div><h2>${esc(t.homeWelcome)}</h2><p>${esc(t.homeIntro)}</p>`
      + `<div class="home-actions"><button class="btn primary" data-view="charts">${esc(t.homeStart)}</button><button class="btn" data-open="https://www.raidbots.com/simbot/droptimizer">${ui('open')}${esc(t.homeRaidbots)}</button></div></div></section>`
      + `<div class="feats">${feats.map(([ic, k]) => `<div class="feat"><img src="assets/ui/${ic}.png" alt=""><div><b>${esc(t[k + 't'])}</b><p>${esc(t[k + 'd'])}</p></div></div>`).join('')}</div>`
      + `<section class="panel card"><div class="card-head"><h2>${esc(t.homeHow)}</h2></div><ol class="steps">${t.homeSteps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>`
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
    const raidRows = raid.map(b => `${esc(t.gvDiff[b.diff])} · ${esc(b.name)}${ilvlTag(b.r)}`);
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
    if (!p) return html + `<div class="empty"><img src="assets/logo.png" alt=""><h2>${esc(t.persEmptyTitle)}</h2><p>${esc(t.persEmptyText)}</p></div>`;
    const col = clsColor(p), max = p.items[0]?.gain || 1, min = Number(S().minGain) || 0;
    // Fuentes presentes (raid, mazmorras...) y filtro elegido
    const cats = {}; for (const it of p.items) { const c = catOfSrc(srcOf(it)); cats[c] = (cats[c] || 0) + 1; }
    const catKeys = ['raid', 'dungeon', 'delve', 'prey', 'catalyst', 'craft', 'pvp', 'bonus', 'other'].filter(k => cats[k]);
    const pcat = catKeys.includes(S().persCat) ? S().persCat : 'all';
    const shownItems = pcat === 'all' ? p.items : p.items.filter(it => catOfSrc(srcOf(it)) === pcat);
    const rows = shownItems.filter(i => i.gain >= min).map((it, i) => {
      state.shown.add(it.id);
      const info = itemInfo(it), st = srcText(it), boss = st && st.name, group = st && st.sub;
      return `<tr class="${owned(p, it) ? 'owned-row' : ''}" data-item="${it.id}" data-ilvl="${it.ilvl}" data-gain="${esc(gainLine(it))}"><td class="rk">${i + 1}</td>`
        + `<td class="it"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span>${info.tag ? ` <span class="meta">${esc(info.tag)}</span>` : ''}${owned(p, it) ? `<span class="owned-tag">${esc(t.ownedTag)}</span>` : ''}</td>`
        + `<td>${esc(capFirst(t.slots[it.slot] || it.slot || ''))}</td><td>${it.ilvl || ''}</td>`
        + (multi ? `<td class="sc"><span class="sim-dot" style="background:${SIM_COLORS[(it.sim || 0) % SIM_COLORS.length]}"></span>${esc(simLabel(simOf(it)))}</td>` : '')
        + `<td class="bs">${boss ? `<b>${esc(boss)}</b>${group ? `<div class="meta">${esc(group)}</div>` : ''}` : `<span class="meta">${esc(t.persNoBoss)}</span>`}</td>`
        + `<td class="gn"><div class="gbar"><span style="width:${Math.max(2, it.gain / max * 100)}%;background:${col}"></span></div><b>+${nf().format(it.gain)}</b> <span class="meta">(${it.pct.toFixed(2)}%)</span></td></tr>`;
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
    html += `<section class="panel card"><div class="card-head">${specIcon(p) ? `<img class="cls-icon" src="${specIcon(p)}" alt="" style="border-color:${col}">` : ''}`
      + `<div><h2 style="color:${readable(col)}">${esc(p.character.name)} ${multi ? '' : diffBadge(p.difficulty)}</h2><div class="meta">${esc([specName(p), clsName(p), p.character.realm].filter(Boolean).join(' · '))}${multi ? ` — ${esc(t.persSimsCount(list.length))}` : ` — ${esc(t.baseDps)}: ${nf().format(p.baseDps)}`}</div></div>`
      + `<span class="spacer"></span><div class="card-tools">${list.map(r => `<button class="btn small" data-open="${esc(r.url)}">${ui('open')}${esc(t.openRaidbots)}${multi ? ' · ' + esc(simLabel(r)) : ''}</button>`).join('')}</div></div>`
      + `<div class="ptable-wrap"><table class="ptable"><thead><tr><th>#</th><th>${esc(t.colItem)}</th><th>${esc(t.colSlot)}</th><th>${esc(t.colIlvl)}</th>${multi ? `<th>${esc(t.colSim)}</th>` : ''}<th>${esc(t.colBoss)}</th><th>${esc(t.colGain)}</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
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
    const cands = p.items.map(it => ({ it, s: srcOf(it) })).filter(r => r.s && COIN_CATS.includes(catOfSrc(r.s)) && (catOfSrc(r.s) !== 'raid' || r.s.encounter > 0) && srcText(r.it) && !owned(p, r.it)).sort((x, y) => y.it.gain - x.it.gain);
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
    let body = rows.length ? '' : `<div class="hint">${esc(t.coinNone)}</div>`;
    rows.forEach(({ it }, i) => {
      const info = itemInfo(it), st = srcText(it); state.shown.add(it.id);
      body += `<div class="coin-row"><div class="coin-rank">${i + 1}</div><div class="coin-boss"><span class="coin-cat cat-${catOfSrc(srcOf(it))}">${esc(catName(catOfSrc(srcOf(it))))}</span><b>${esc(st.name)}</b>${st.sub && st.sub !== catName(catOfSrc(srcOf(it))) ? `<div class="meta">${esc(st.sub)}</div>` : ""}</div><div class="coin-items">`
        + `<div class="coin-item" data-item="${it.id}" data-ilvl="${it.ilvl}" data-gain="${esc(gainLine(it))}"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><div><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span> <span class="meta">${esc(info.tag)}</span><div class="coin-gain">+${nf().format(it.gain)} <span class="meta">(${it.pct.toFixed(2)}%)</span></div></div></div></div></div>`;
    });
    return `<section class="panel card"><div class="card-head"><h2>${esc(t.coinTitle)}</h2><span class="spacer"></span>${pick}</div><div class="hint">${esc(t.coinHint(coins))}</div>${body}</section>`;
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
  const simAge = r => { const d = r.simDate ? Math.floor((Date.now() - r.simDate) / 864e5) : null; return d == null ? '' : d < 1 ? T().simToday : T().simDays(d); };

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
    if (tipEl) { tipEl.hidden = true; tipEl.dataset.cur = ''; tipKey = null; } // el contenido se redibuja: fuera tooltips colgados
    document.documentElement.lang = S().lang;
    $('#appSub').textContent = t.appSub;
    $('#urlInput').placeholder = t.urlPlaceholder;
    $('#btnAdd').textContent = t.add; $('#btnPaste').textContent = t.paste; $('#btnClear').textContent = t.clearAll;
    $('#btnExportData').textContent = t.exportData; $('#btnExportData').disabled = !state.sims.length;
    $('#btnClear').disabled = !state.sims.length;
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
    if (state.view === 'tiers') { content.innerHTML = tiersView(); ensureNames(); return; }
    if (state.view === 'roster') { content.innerHTML = rosterView(); return; }
    if (state.view === 'personal') {
      content.innerHTML = personalView();
      ensureNames();
      return;
    }
    if (!state.sims.length) {
      content.innerHTML = `<div class="empty"><img src="assets/logo.png" alt=""><h2>${esc(t.emptyTitle)}</h2><p>${esc(t.emptyText)}</p></div>`;
      return;
    }
    const colors = themeColors(), animate = state.animateNext && S().animations;
    state.animateNext = false;
    const act = activeSims(), pct = S().unit === 'pct';
    const chartOpts = { hScale: S().chartTall ? 1.3 : 1, colors, animate, showValues: S().showValues, showIcons: S().showIcons, compact: S().compact, yTitle: pct ? t.yAxisPct : t.yAxisDps, tickFmt: pct ? v => `${v.toFixed(v % 1 ? 1 : 0)}%` : null };
    let html = toolbarHtml() + stalePanel(act);
    html += `<div class="charts-bar sub"><div class="seg" role="group" aria-label="${esc(t.unitLabel)}"><button data-unit="dps" class="${pct ? '' : 'on'}">${esc(t.unitDps)}</button><button data-unit="pct" class="${pct ? 'on' : ''}">${esc(t.unitPct)}</button></div>`
      + `<div class="seg"><button data-barstyle="simple" class="${detailed() ? '' : 'on'}">${esc(t.barSimple)}</button><button data-barstyle="detailed" class="${detailed() ? 'on' : ''}">${esc(t.barDetailed)}</button></div></div>`;
    html += S().chartMode === 'player' ? playerCharts(act, chartOpts) : bossCharts(act, chartOpts);
    if (S().showCaution) html += cautionSection();
    const scroll = document.scrollingElement.scrollTop;
    content.innerHTML = html;
    document.scrollingElement.scrollTop = scroll;
    ensureNames();
  }

  function renderChips() {
    const chips = $('#chips'), eff = effectiveDiff();
    let h = '';
    for (const id of state.loading) h += `<span class="chip loading"><span class="spinner"></span>${esc(id)} — ${esc(T().loading)}</span>`;
    for (const sim of state.sims) {
      const col = clsColor(sim), dim = eff && sim.difficulty && sim.difficulty !== eff;
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
    if (!refresh && state.sims.some(s => s.id === id)) { toast(`${T().duplicate} (${state.sims.find(s => s.id === id).character.name})`); return 'dup'; }
    if (state.loading.has(id)) return 'busy';
    state.loading.add(id); renderChips();
    const r = await window.api.fetchReport(id);
    state.loading.delete(id);
    if (!r.ok) { renderChips(); toast(`${id}: ${errText(r)}`, true); return 'err'; }
    const when = x => x.simDate || x.fetchedAt || 0;
    if (opts.minDate && r.report.simDate && r.report.simDate < opts.minDate) { renderChips(); return 'old'; }
    if (opts.newestOnly) {
      const same = state.sims.find(x => sameChar(x, r.report) && x.difficulty === r.report.difficulty);
      if (same && when(same) >= when(r.report)) { renderChips(); return 'older'; }
      if (same) state.sims = state.sims.filter(x => x !== same);
    }
    const i = state.sims.findIndex(s => s.id === id);
    if (i >= 0) state.sims[i] = r.report; else state.sims.push(r.report);
    persistSims(); state.animateNext = true; render(); refreshGear();
    if (!quiet) toast(`${refresh ? T().updated : T().added}: ${r.report.character.name}`);
    return 'ok';
  }

  function removeSim(id) {
    state.sims = state.sims.filter(s => s.id !== id);
    state.expanded.delete(id);
    persistSims(); state.animateNext = true; render(); toast(T().removed);
  }

  function clearAll() {
    const doIt = () => { state.sims = []; state.expanded.clear(); persistSims(); render(); toast(T().cleared); };
    if (!S().confirmClear) return doIt();
    modal({ title: T().confirmClearTitle, body: `<p>${esc(T().confirmClearText)}</p>`, actions: [{ label: T().cancel }, { label: T().confirm, cls: 'danger', onclick: doIt }] });
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
      for (const img of clone.querySelectorAll('image')) {
        const href = img.getAttribute('href');
        const data = await window.api.iconData(href);
        if (data) img.setAttribute('href', data); else img.remove();
      }
      clone.setAttribute('font-family', FONT);
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', themeColors().bg);
      clone.insertBefore(bg, clone.firstChild);
      const w = Number(svg.getAttribute('width')), h = Number(svg.getAttribute('height'));
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
      const img = new Image(); img.src = url; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext('2d'); ctx.scale(2, 2); ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
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
      + `<div class="card-tools" style="margin:12px 0"><button class="btn" data-dc-save>${esc(t.dcSave)}</button></div>`
      + `<div class="status" id="dcStatus">${dcStatusText(c.status)}</div>`
      + `<h3>${esc(t.dcHelpTitle)}</h3><ol class="steps">${t.dcSteps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
  }
  async function saveDiscord(box) {
    const ch = box.querySelector('#dcChannel').value.trim(), en = box.querySelector('#dcEnabled').checked;
    const r = await window.api.discordSet({ channelId: ch, enabled: en });
    if (ch && !r.channelId) toast(T().dcBadChannel, true);
    drawDiscord(box);
  }
  async function inviteDiscord() {
    const url = await window.api.discordInvite();
    if (url) window.api.openExternal(url); else toast(T().dcNoInvite, true);
  }
  window.api.onDiscordStatus?.(st => { const el = document.getElementById('dcStatus'); if (el) el.innerHTML = dcStatusText(st); });
  // Enlaces nuevos en el canal: se añaden solos a Gráficas (los repetidos se ignoran sin avisar)
  window.api.onDiscordSims?.(async list => {
    const info = await window.api.discordGet();
    for (const x of list) {
      const it = typeof x === 'string' ? { id: x } : x;
      if (it.author) state.dcAuthors[it.author.id] = it.author.name;
      if (!state.sims.some(s => s.id === it.id) && await addSim(it.id, false, true, { minDate: info.reset, newestOnly: true }) === 'ok') toast(`${T().dcAdded}: ${state.sims.find(s => s.id === it.id)?.character.name || it.id}`);
      const sim = state.sims.find(s => s.id === it.id);
      if (sim && it.author) state.dcLinks[charKey(sim.character.name, sim.character.realm)] = it.author;
    }
    save('ninjaloot.dcAuthors', state.dcAuthors); save('ninjaloot.dcLinks', state.dcLinks);
    if (state.view === 'roster') render();
  });

  // ---------- Roster: quién ha subido su sim esta semana y recordatorio por mensaje privado ----------
  state.roster = load('ninjaloot.roster', []);       // [{ name, realm, cls }]
  state.dcLinks = load('ninjaloot.dcLinks', {});     // personaje -> { id, name } del usuario de Discord que pegó su sim
  state.dcAuthors = load('ninjaloot.dcAuthors', {}); // usuarios de Discord vistos en el canal: id -> nombre
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
  const linkOf = m => state.dcLinks[rosterKey(m)] || state.dcLinks[charKey(m.name, '')] || null;
  function saveRoster() { save('ninjaloot.roster', state.roster); }

  function rosterView() {
    const t = T(), region = S().rosterRegion || 'eu', reset = lastReset(region);
    const rows = state.roster.map(m => { const sim = rosterSim(m), when = sim ? (sim.simDate || sim.fetchedAt || 0) : 0; return { m, sim, ok: when >= reset, when, link: linkOf(m) }; })
      .sort((a, b) => a.ok - b.ok || a.m.name.localeCompare(b.m.name));
    const missing = rows.filter(r => !r.ok), withDc = missing.filter(r => r.link);
    const authors = Object.entries(state.dcAuthors).sort((a, b) => a[1].localeCompare(b[1]));
    const dateTxt = new Date(reset).toLocaleString(S().lang, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    let html = `<section class="panel card"><div class="card-head"><h2>${esc(t.roTitle)}</h2></div><div class="hint">${esc(t.roHint(dateTxt))}</div>`
      + `<div class="ro-forms"><div class="ro-form"><b>${esc(t.roAddTitle)}</b><div class="ro-row"><input class="txt" id="roName" placeholder="${esc(t.roName)}" spellcheck="false"><input class="txt" id="roRealm" placeholder="${esc(t.roRealm)}" spellcheck="false"><button class="btn" data-ro="add">${esc(t.roAdd)}</button></div></div>`
      + `<div class="ro-form"><b>${esc(t.roImportTitle)}</b><div class="ro-row"><input class="txt" id="roGuild" placeholder="${esc(t.roGuild)}" spellcheck="false" value="${esc(S().rosterGuild || '')}"><input class="txt" id="roGRealm" placeholder="${esc(t.roRealm)}" spellcheck="false" value="${esc(S().rosterRealm || '')}">`
      + `<select id="roRegion">${['eu', 'us'].map(r => `<option value="${r}"${r === region ? ' selected' : ''}>${r.toUpperCase()}</option>`).join('')}</select>`
      + `<select id="roRank"><option value="99">${esc(t.roAllRanks)}</option>${Array.from({ length: 10 }, (_, i) => `<option value="${i}"${Number(S().rosterRank ?? 99) === i ? ' selected' : ''}>${esc(t.roRankUpTo(i))}</option>`).join('')}</select>`
      + `<button class="btn" data-ro="import">${esc(t.roImport)}</button></div></div></div></section>`;
    if (!state.roster.length) return html + `<div class="empty"><img src="assets/logo.png" alt=""><h2>${esc(t.roEmptyTitle)}</h2><p>${esc(t.roEmptyText)}</p></div>`;
    html += `<section class="panel card"><div class="card-head"><h2>${esc(t.roStatus(rows.length - missing.length, rows.length))}</h2><span class="spacer"></span><div class="card-tools">`
      + `<select id="roRl" title="${esc(t.roRl)}"><option value="">${esc(t.roRlNone)}</option>${authors.map(([id, n]) => `<option value="${esc(id)}"${S().rlDiscord === id ? ' selected' : ''}>@${esc(n)}</option>`).join('')}</select>`
      + `<button class="btn primary" data-ro="dm"${S().rlDiscord ? '' : ' disabled'}>${esc(t.roDm(missing.length))}</button><button class="btn danger" data-ro="clear">${esc(t.roClear)}</button></div></div>`
      + `<div class="hint">${esc(authors.length ? t.roRlHint : t.roRlNoAuthors)}</div>`
      + `<div class="ptable-wrap"><table class="ptable ro-table"><thead><tr><th>${esc(t.roColChar)}</th><th>${esc(t.roColSim)}</th><th>${esc(t.roColDiscord)}</th><th></th></tr></thead><tbody>`
      + rows.map(({ m, sim, ok, when, link }) => {
        const col = m.cls ? (CLASS_COLORS[m.cls] || CLASS_COLORS[String(m.cls).toLowerCase().replace(/ /g, '')] || '') : (sim ? clsColor(sim) : '');
        const k = rosterKey(m);
        return `<tr class="${ok ? 'ro-ok' : 'ro-miss'}"><td><b style="${col ? `color:${readable(col)}` : ''}">${esc(m.name)}</b> <span class="meta">${esc(m.realm || '')}</span></td>`
          + `<td>${ok ? `<span class="ro-badge ok">✓ ${esc(t.roHasSim)}</span> <span class="meta">${esc(new Date(when).toLocaleDateString(S().lang))}</span>` : `<span class="ro-badge bad">✗ ${esc(t.roMissing)}</span>${sim ? ` <span class="meta">${esc(t.roOld(new Date(when).toLocaleDateString(S().lang)))}</span>` : ''}`}</td>`
          + `<td><select class="ro-link" data-ro-link="${esc(k)}"><option value="">${esc(link ? '' : t.roLinkNone)}</option>${authors.map(([id, n]) => `<option value="${esc(id)}"${link && link.id === id ? ' selected' : ''}>@${esc(n)}</option>`).join('')}${link && !state.dcAuthors[link.id] ? `<option value="${esc(link.id)}" selected>@${esc(link.name)}</option>` : ''}</select></td>`
          + `<td><button class="btn small danger" data-ro="del" data-k="${esc(k)}" title="${esc(t.roRemove)}">${xmark}</button></td></tr>`;
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
      const guild = $('#roGuild').value.trim(), realm = $('#roGRealm').value.trim(), region = $('#roRegion').value, maxRank = Number($('#roRank').value);
      if (!guild || !realm) return toast(t.roNeedGuild, true);
      Object.assign(S(), { rosterGuild: guild, rosterRealm: realm, rosterRegion: region, rosterRank: maxRank }); persistSettings();
      window.api.discordSet?.({ region });
      el.disabled = true;
      const slug = realm.toLowerCase().replace(/['’]/g, '').replace(/\s+/g, '-');
      const r = await window.api.rosterGuild(region, slug, guild);
      el.disabled = false;
      if (!r.ok) return toast(r.error === 'NOT_FOUND' ? t.roGuildNotFound : `${t.roImportError}: ${r.error}`, true);
      let added = 0;
      for (const m of r.members.filter(x => x.rank <= maxRank)) {
        if (state.roster.some(x => rosterKey(x) === charKey(m.name, m.realm))) continue;
        state.roster.push({ name: m.name, realm: m.realm, cls: String(m.cls || '').toLowerCase().replace(/ /g, '') }); added++;
      }
      saveRoster(); render(); toast(t.roImported(added, r.guild));
    } else if (a === 'del') {
      state.roster = state.roster.filter(m => rosterKey(m) !== el.dataset.k); saveRoster(); render();
    } else if (a === 'clear') {
      const doIt = () => { state.roster = []; saveRoster(); render(); };
      S().confirmClear ? modal({ title: t.roClear, body: `<p>${esc(t.roClearConfirm)}</p>`, actions: [{ label: t.cancel }, { label: t.confirm, cls: 'danger', onclick: doIt }] }) : doIt();
    } else if (a === 'dm') {
      if (!S().rlDiscord) return toast(t.roRlNone, true);
      const reset = lastReset(S().rosterRegion || 'eu');
      const missing = state.roster.filter(m => { const sim = rosterSim(m); return !(sim && (sim.simDate || sim.fetchedAt || 0) >= reset); }).map(m => m.name).sort((x, y) => x.localeCompare(y));
      el.disabled = true;
      const r = await window.api.discordDm({ rl: S().rlDiscord, missing, total: state.roster.length });
      el.disabled = false;
      if (r.error) return toast(r.error === 'DM_COOLDOWN' ? t.roDmCooldown(Math.ceil((r.retry || 0) / 60000)) : r.error === 'NO_CHANNEL' ? t.roDmNoChannel : r.error === 'RL_NOT_IN_CHANNEL' ? t.roRlNotInChannel : r.error === 'DM_CLOSED' ? t.roDmClosed : `${t.roDmError}: ${r.error}`, true);
      toast(t.roDmSent);
    }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'roRl') { S().rlDiscord = e.target.value; persistSettings(); render(); return; }
    const sel = e.target.closest?.('[data-ro-link]');
    if (!sel) return;
    if (sel.value) state.dcLinks[sel.dataset.roLink] = { id: sel.value, name: state.dcAuthors[sel.value] || sel.value };
    else delete state.dcLinks[sel.dataset.roLink];
    save('ninjaloot.dcLinks', state.dcLinks);
  });

  function openSettings(tab = 'general') {
    const back = document.createElement('div');
    back.className = 'modal-back';
    $('#modalRoot').appendChild(back);
    const close = () => back.remove();
    const draw = view => {
      const t = T(), s = S();
      const tabs = [['general', t.tabGeneral], ['appearance', t.tabAppearance], ['discord', t.tabDiscord], ['update', t.tabUpdate], ['about', t.tabAbout]];
      const check = (key, label) => `<div class="row"><label for="s-${key}">${esc(label)}</label><input type="checkbox" id="s-${key}" data-key="${key}" ${s[key] ? 'checked' : ''}></div>`;
      const cur = k => hex((s.colors || {})[k]) || hex(getComputedStyle(document.documentElement).getPropertyValue(`--${k}`).trim()) || '#000000';
      const views = {
        general: () => `<div class="row"><label>${esc(t.language)}</label><select data-key="lang">${LANGS.map(([c, n]) => `<option value="${c}" ${s.lang === c ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`
          + `<div class="row"><label>${esc(t.topN)}</label><select data-key="topN">${[5, 10, 15, 20, 30, 0].map(n => `<option value="${n}" ${s.topN === n ? 'selected' : ''}>${n === 0 ? esc(t.all) : n}</option>`).join('')}</select></div>`
          + `<div class="row"><label>${esc(t.minGain)}</label><input type="number" min="0" step="50" style="width:110px" data-key="minGain" value="${Number(s.minGain) || 0}"></div>`
          + check('checkGear', t.checkGear) + `<div class="row"><label>${esc(t.staleDays)}</label><input type="number" min="1" max="60" style="width:90px" data-key="staleDays" value="${Number(s.staleDays) || 7}"></div>` + check('showValues', t.showValues) + check('showCaution', t.showCaution) + check('tooltips', t.tooltips) + check('chartTall', t.chartTall) + `<div class="row"><label>${esc(t.cautionGap)}</label><input type="number" min="1" max="100" style="width:90px" data-key="cautionGap" value="${Number(s.cautionGap) || 15}"></div>` + check('showIcons', t.showIcons) + check('showPct', t.showPct) + check('compact', t.compact)
          + check('animations', t.animations) + check('persist', t.persist) + check('confirmClear', t.confirmClear)
          + `<div class="small-note">${esc(t.shortcuts)}</div>`,
        appearance: () => `<div class="row"><label>${esc(t.theme)}</label><div class="seg">${[['dark', t.themeDark], ['light', t.themeLight], ['auto', t.themeAuto]].map(([k, l]) => `<button data-set-theme="${k}" class="${s.theme === k ? 'on' : ''}">${esc(l)}</button>`).join('')}</div></div>`
          + `<div class="row"><label>${esc(t.font)}</label><select data-key="font">${Object.entries(FONTS).map(([k, v]) => `<option value="${k}" ${s.font === k ? 'selected' : ''}>${v[0]}${k === 'noto' ? ` (${esc(t.fontDefault)})` : ''}</option>`).join('')}</select></div>`
          + (s.font === 'expressway' && !fontInstalled('Expressway') ? `<div class="small-note warn">${esc(t.fontMissing)}</div>` : '')
          + `<div class="row"><label>${esc(t.fontScale)}</label><select data-key="fontScale">${[90, 100, 110, 120, 130].map(n => `<option value="${n}" ${Number(s.fontScale) === n ? 'selected' : ''}>${n}%</option>`).join('')}</select></div>`
          + `<div class="row"><label>${esc(t.density)}</label><select data-key="density"><option value="normal" ${s.density !== 'compact' ? 'selected' : ''}>${esc(t.densityNormal)}</option><option value="compact" ${s.density === 'compact' ? 'selected' : ''}>${esc(t.densityCompact)}</option></select></div>`
          + `<h3>${esc(t.customColors)}</h3><div class="colors">`
          + [['bg', t.colorBg], ['panel', t.colorPanel], ['accent', t.colorAccent], ['text', t.colorText]].map(([k, l]) => `<label>${esc(l)}<input type="color" data-color="${k}" value="${cur(k)}"></label>`).join('')
          + `</div><button class="btn small" data-reset-colors>${esc(t.resetColors)}</button>`,
        discord: () => `<div id="dcBox"><div class="spinner"></div></div>`,
        update: () => `<div id="updBox"></div>`,
        about: () => `<div class="about big"><img src="assets/logo.png" alt="" width="120" height="120"><div>`
          + `<h2>NinjaLoot <span class="v">v${esc(state.info.version)}</span></h2>`
          + `<p class="about-desc">${esc(t.aboutDesc)} <span class="about-es">${esc(t.spain)} <svg viewBox="0 0 3 2" width="30" height="20" aria-label="ES" style="border-radius:3px"><rect width="3" height="2" fill="#c60b1e"/><rect y=".5" width="3" height="1" fill="#ffc400"/></svg></span></p>`
          + `<p>${esc(t.madeBy)} <b>Drakko</b> <span class="heart">♥</span></p>`
          + `<p class="about-dc first"><svg viewBox="0 0 127.14 96.36" width="26" height="20" aria-hidden="true"><path fill="#5865F2" d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg> <b>sr.kitkat</b> <span class="muted">${esc(t.questions)}</span></p>`
          + `<p class="about-dc"><img src="assets/battlenet.png" width="26" height="26" alt="" style="border-radius:6px"> <b>KitKat#21202</b> <span class="muted">${esc(t.questions)}</span></p>`
          + `</div></div>`,
      };
      back.innerHTML = `<div class="panel modal settings" role="dialog" aria-modal="true"><aside class="side"><h2>${esc(t.settingsTitle)}</h2>`
        + `<nav>${tabs.map(([k, l]) => `<button class="side-tab${k === view ? ' on' : ''}" data-tab="${k}">${esc(l)}</button>`).join('')}</nav>`
        + `<button class="btn side-close" data-close>${esc(t.close)}</button></aside><section class="pane">${views[view]()}</section></div>`;
      back.dataset.view = view;
      if (view === 'update') runUpdateCheck(back.querySelector('#updBox'));
      if (view === 'discord') drawDiscord(back.querySelector('#dcBox'));
    };
    back.addEventListener('mousedown', e => { if (e.target === back) close(); });
    back.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return close();
      const tb = e.target.closest('[data-tab]'); if (tb) return draw(tb.dataset.tab);
      const th = e.target.closest('[data-set-theme]'); if (th) { S().theme = th.dataset.setTheme; persistSettings(); applyTheme(); draw('appearance'); state.animateNext = false; render(); return; }
      if (e.target.closest('[data-dc-save]')) return saveDiscord(back.querySelector('#dcBox'));
      if (e.target.closest('[data-dc-invite]')) return inviteDiscord();
      if (e.target.closest('[data-reset-colors]')) { S().colors = null; persistSettings(); applyTheme(); draw('appearance'); state.animateNext = false; render(); }
    });
    back.addEventListener('input', e => {
      const c = e.target.closest('[data-color]');
      if (c) { S().colors = { ...(S().colors || {}), [c.dataset.color]: c.value }; persistSettings(); applyTheme(); state.animateNext = false; render(); }
    });
    back.addEventListener('change', e => {
      const el = e.target.closest('[data-key]'); if (!el) return;
      const key = el.dataset.key, s = S();
      s[key] = el.type === 'checkbox' ? el.checked : el.tagName === 'SELECT' && !['lang', 'font', 'density'].includes(key) ? Number(el.value) : el.type === 'number' ? Math.max(0, Number(el.value) || 0) : el.value;
      persistSettings();
      if (key === 'persist') persistSims();
      if (key === 'checkGear') refreshGear();
      if (['animations', 'font', 'fontScale', 'density'].includes(key)) applyTheme();
      state.animateNext = false;
      if (key === 'lang' || key === 'font') draw(back.dataset.view);
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
  function cleanTip(html) { // quita scripts, eventos y enlaces del HTML externo
    const doc = new DOMParser().parseFromString(html, 'text/html');
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
  function placeTip(x, y) {
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight, m = 16;
    let left = x + m, top = y + m;
    if (left + w > innerWidth - 8) left = Math.max(8, x - w - m);
    if (top + h > innerHeight - 8) top = Math.max(8, innerHeight - h - 8);
    tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  }
  async function showTip(g, x, y) {
    const id = Number(g.dataset.item), ilvl = Number(g.dataset.ilvl) || 0, lang = S().lang, key = `${lang}:${id}:${ilvl}`;
    tipKey = key;
    const foot = g.dataset.gain ? `<div class="tip-gain">${esc(g.dataset.gain)}</div>` : '';
    const fallback = () => { const info = itemInfo({ id }); return `<div class="tip-fallback"><b style="color:${QUALITY_COLORS[info.quality]}">${esc(info.name)}</b><br>${esc(T().ilvl)} ${ilvl}</div>`; };
    if (!tipCache.has(key)) {
      tipEl.innerHTML = `<div class="tip-load">${esc(T().loading)}</div>`; tipEl.hidden = false; placeTip(x, y);
      window.api.itemTooltip(id, ilvl, lang).then(r => { tipCache.set(key, r && r.ok ? cleanTip(r.html) : fallback()); if (tipKey === key) { tipEl.innerHTML = tipCache.get(key) + foot; placeTip(x, y); } });
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
  const allBosses = () => state.bosses.groups.flatMap(g => g.bosses.map(b => ({ ...b, group: g.name })));
  // Jefes de la tabla de rotaciones: los de la temporada y, si se marca, una columna para el jefe de la raid nueva de la semana que viene
  const rotGroups = () => [...state.bosses.groups, ...(S().vaultNew ? [{ id: -1, name: T().newRaidGroup, bosses: [{ id: -1, name: T().newRaidBoss }] }] : [])];
  const rotBosses = () => rotGroups().flatMap(g => g.bosses.map(b => ({ ...b, group: g.name })));
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
      head1 += `<th class="grp" colspan="${g.bosses.length}">${esc(g.name)}</th>`;
      for (const b of g.bosses) {
        const cov = coverage(b.id), bad = cov.filter(c => c.status === 'bad').length, warn = cov.filter(c => c.status === 'warn').length;
        const cls = bad ? 'bad' : warn ? 'warn' : 'ok';
        head2 += `<th class="bcol${b.id === state.bossSel ? ' sel' : ''}"><button data-boss="${b.id}" title="${esc(t.rotSeeBuffs)}"><span class="bn">${esc(b.name)}</span><span class="pill ${cls}">${bad ? `−${bad}` : warn ? `!${warn}` : t.complete}</span></button></th>`;
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
          + `<div class="bi"><b>${esc(buffName(b))}</b> <span class="kind">${esc(kindLabel[b.kind])}</span><div class="be">${esc(buffEffect(b))}</div></div>`
          + `<div class="bs">${status === 'bad' ? `<span class="tag bad">${esc(t.rotMissingTag)}</span><div class="bw">${esc(t.rotProvidedBy)}: ${b.from.map(c => esc(t.classes[c])).join(', ')}</div>`
            : `<span class="tag ${status}">${esc(status === 'ok' ? t.rotCovered : t.rotOnlyRotating)}</span><div class="bw">${who.map(w => esc(w.s.character.name)).join(', ')}</div>`}</div></div>`).join('')}</div></div>`;
    }
    content.innerHTML = `<div class="rot-warning" role="note"><span class="rw-icon">⚠</span><div><b>${esc(t.rotWarnTitle)}</b><p>${esc(t.rotWarnText)}</p></div></div>`
      + `<div class="panel card rot-card"><div class="card-head"><div><h2>${esc(t.rotTitle)}</h2><div class="meta">${esc(state.bosses.season)}</div></div><span class="spacer"></span>`
      + `<div class="legend"><span class="lg st-n">✓ ${esc(t.stN)}</span><span class="lg st-r">✗ ${esc(t.stR)}</span><span class="lg st-p">? ${esc(t.stP)}</span></div>`
      + (state.sims.length ? `<button class="btn small" data-rot-reset>${esc(t.rotResetAll)}</button>` : '') + `</div>`
      + `<div class="hint">${esc(t.rotHint)}</div>${table}</div>${vaultSection(bosses)}${buffs}`;
  }

  // Cofre semanal de raid: solo cuentan los jefes marcados como "no rota" (todos empiezan en 0/6); 2, 4 y 6 jefes desbloquean cada hueco
  function vaultSection(bosses) {
    const t = T(), extra = S().vaultNew ? 1 : 0, max = bosses.length;
    if (!state.sims.length) return '';
    const cards = state.sims.map(sim => {
      const count = s => bosses.filter(b => cellState(b.id, sim.id) === s).length, kills = count('n'), col = clsColor(sim);
      return `<div class="vault" style="--cc:${col}"><div class="v-head">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="" style="border-color:${col}">` : ''}<b style="color:${readable(col)}">${esc(sim.character.name)}</b></div>`
        + `<div class="v-count${kills >= 6 ? ' full' : ''}">${kills}/6</div><div class="v-slots">${[2, 4, 6].map(n => `<span class="v-slot${kills >= n ? ' on' : ''}">${Math.min(kills, n)}/${n}</span>`).join('')}</div>`
        + `<div class="meta">${esc(t.vaultCounts(kills, count('r'), count('p')))}</div></div>`;
    }).join('');
    return `<div class="panel card"><div class="card-head"><div><h2>${esc(t.vaultTitle)}</h2><div class="meta">${esc(t.vaultMax(max))}</div></div><span class="spacer"></span>`
      + `<label class="v-new"><input type="checkbox" id="vaultNew" ${extra ? 'checked' : ''}> ${esc(t.vaultNew)}</label></div>`
      + `<div class="hint">${esc(t.vaultHint)}</div><div class="vaults">${cards}</div></div>`;
  }

  // ---------- Tiers: bonus de 2/4 piezas por especialización y piezas de tier de cada clase (ficha de raid) ----------
  const specLabel = (cls, key) => { const d = SPECS[cls][key], l = S().lang; return l === 'es' ? d[1] : (SPEC_L10N[l]?.[cls]?.[key] || d[0]); };
  function tiersView() {
    const t = T(), l = S().lang, sel = state.tierCls;
    const classes = Object.keys(TIERS.classes).sort((a, b) => t.classes[a].localeCompare(t.classes[b], l));
    let html = `<section class="panel card"><div class="card-head"><div><h2>${esc(t.tiersTitle)}</h2><div class="meta">${esc(state.bosses.season || TIERS.season)}</div></div></div><div class="hint">${esc(t.tiersHint)}</div>`
      + `<div class="tier-classes">${classes.map(c => `<button class="tier-cls${c === sel ? ' on' : ''}" data-tier-cls="${c}" style="--cc:${CLASS_COLORS[c]}"><img src="assets/classes/${c}.png" alt=""><span style="color:${readable(CLASS_COLORS[c])}">${esc(t.classes[c])}</span></button>`).join('')}</div></section>`;
    const d = TIERS.classes[sel];
    if (!d) return html;
    const col = CLASS_COLORS[sel];
    html += `<section class="panel card tier-detail" style="--cc:${col}"><div class="card-head"><img class="cls-icon" src="assets/classes/${sel}.png" alt="" style="border-color:${col}"><div><h2 style="color:${readable(col)}">${esc(t.classes[sel])}</h2><div class="meta">${esc(d.name[l] || d.name.en)}</div></div></div>`
      + `<h3>${esc(t.tierBonus)}</h3><div class="tier-specs">`
      + Object.keys(SPECS[sel]).filter(k => d.bonus[k]).map(k => { const b = d.bonus[k][l] || d.bonus[k].en;
        return `<div class="tier-spec"><div class="ts-head"><img src="assets/specs/${sel}-${k}.png" alt="" style="border-color:${col}"><b>${esc(specLabel(sel, k))}</b></div>`
          + `<div class="ts-bonus"><span class="ts-pc">${esc(t.tier2)}</span><p>${esc(b[0] || '')}</p></div><div class="ts-bonus"><span class="ts-pc">${esc(t.tier4)}</span><p>${esc(b[1] || '')}</p></div></div>`; }).join('')
      + `</div><h3>${esc(t.tierPieces)}</h3><div class="ptable-wrap"><table class="ptable"><thead><tr><th>${esc(t.colItem)}</th><th>${esc(t.colSlot)}</th><th>${esc(t.statsLabel)}</th><th>${esc(t.colBoss)}</th></tr></thead><tbody>`
      + d.items.map(it => { state.shown.add(it.id); const info = itemInfo({ id: it.id });
        return `<tr data-item="${it.id}" data-ilvl=""><td class="it"><img src="${info.icon}" alt="" style="border-color:${QUALITY_COLORS[info.quality]}"><span style="color:${readable(QUALITY_COLORS[info.quality])}">${esc(info.name)}</span></td>`
          + `<td>${esc(capFirst(t.slots[it.slot] || it.slot))}</td><td class="ts-stats">${it.stats.map(s => `<span class="stat">${esc(t.statNames[s] || s)}</span>`).join(' + ')}</td><td><b>${esc(bossLabel(it.boss) || '')}</b></td></tr>`; }).join('')
      + `</tbody></table></div><div class="hint">${esc(t.tierAny(bossLabel(TIERS.anyBoss) || "Ula'tek"))}</div></section>`;
    return html;
  }

  // ---------- Actualizaciones ----------
  const semver = v => String(v || '').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  function capFirst(s) { s = String(s || ''); return s.charAt(0).toLocaleUpperCase() + s.slice(1); }
  const isNewer = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  // Pestaña Versión: tu versión y su estado, un solo botón que busca, descarga, instala y reabre, y el historial de versiones
  async function runUpdateCheck(box) {
    const t = T(), cur = state.info.version;
    const log = (CHANGELOG[S().lang] || CHANGELOG.en || CHANGELOG.es);
    box.innerHTML = `<div class="ver-card"><div><div class="meta">${esc(t.updYours)}</div><b class="ver-big">v${esc(cur)}</b></div><span class="ver-status na" id="verStatus">${esc(t.checking)}</span></div>`
      + `<button class="btn grad" data-upd-go>${esc(t.updGo)}</button><div class="small-note" id="updNote"></div>`
      + `<label class="switch-row"><input type="checkbox" class="switch" id="autoUpd" ${S().autoUpdateCheck !== false ? 'checked' : ''}><span>${esc(t.updAuto)}</span></label>`
      + `<h3 class="chlog-title">${esc(t.updHistory)}</h3><div class="chlog">${log.map(([v, txt]) => `<div class="chlog-row"><b>v${esc(v)}</b><p>${esc(txt)}</p></div>`).join('')}</div>`;
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
    box.querySelector('[data-upd-go]').addEventListener('click', async e => {
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
    else if ((el = q('data-view'))) { state.view = el.dataset.view; state.animateNext = true; render(); window.scrollTo(0, 0); }
    else if ((el = q('data-mode'))) { S().chartMode = el.dataset.mode; if (el.dataset.mode === 'boss') S().srcCat = 'all'; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-diff'))) { S().diff = el.dataset.diff; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-cat'))) { S().srcCat = el.dataset.cat; persistSettings(); state.animateNext = true; render(); }
    else if ((el = q('data-pmode'))) { S().persMode = el.dataset.pmode; persistSettings(); render(); }
    else if (q('data-personal-load')) { loadPersonal($('#personalUrl').value); }
    else if ((el = q('data-slot-load'))) { const i = document.querySelector(`.slot-input[data-slot="${el.dataset.slotLoad}"]`); if (i) loadPersonal(i.value, el.dataset.slotLoad); }
    else if ((el = q('data-tier-cls'))) { state.tierCls = state.tierCls === el.dataset.tierCls ? null : el.dataset.tierCls; render(); }
    else if ((el = q('data-boss'))){ state.bossSel = Number(el.dataset.boss); render(); }
    else if ((el = q('data-cell-set'))) { const [sid, bid] = el.closest('[data-cell]').dataset.cell.split(':'); setCell(Number(bid), sid, el.dataset.cellSet); persistRot(); render(); }
    else if ((el = q('data-row-set'))) { const sid = el.closest('[data-row]').dataset.row; for (const b of rotBosses()) setCell(b.id, sid, el.dataset.rowSet); persistRot(); render(); }
    else if (q('data-rot-reset')) { const doIt = () => { state.rot = {}; persistRot(); render(); }; S().confirmClear ? modal({ title: T().rotResetAll, body: `<p>${esc(T().rotResetConfirm)}</p>`, actions: [{ label: T().cancel }, { label: T().confirm, cls: 'danger', onclick: doIt }] }) : doIt(); }
    else if ((el = q('data-col-set'))) { for (const s of state.sims) setCell(state.bossSel, s.id, el.dataset.colSet); persistRot(); render(); }
    else if (q('data-roster-copy')) { const src = state.rot[state.bossSel]; for (const b of rotBosses()) state.rot[b.id] = { ...(src && !Array.isArray(src) ? src : {}) }; persistRot(); render(); toast(T().rotCopied); }
    else if ((el = q('data-refresh'))) addSim(el.dataset.refresh, true);
    else if ((el = q('data-open'))) window.api.openExternal(el.dataset.open);
    else if ((el = q('data-export'))) exportChart(el.dataset.export);
    else if ((el = q('data-toggle'))) { const id = el.dataset.toggle; state.expanded.has(id) ? state.expanded.delete(id) : state.expanded.add(id); state.animateNext = false; render(); }
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
    if (e.target.id === 'coinCount') { S().coins = Math.max(1, Math.min(20, Number(e.target.value) || 5)); persistSettings(); render(); return; }
    if (e.target.id === 'bossPick') { S().bossPick = e.target.value === 'all' ? 'all' : Number(e.target.value); persistSettings(); state.animateNext = true; render(); return; }
    if (e.target.id === 'vaultNew') { S().vaultNew = e.target.checked; persistSettings(); render(); return; }
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
  refreshGear();
  // Reinicio semanal con la app abierta: se vuelve a pintar (fechas del roster y del cofre, que se pide otra vez)
  let seenReset = lastReset('eu') + ':' + lastReset('us');
  setInterval(() => { const r = lastReset('eu') + ':' + lastReset('us'); if (r !== seenReset) { seenReset = r; state.animateNext = false; render(); } }, 60000);
  window.api.appInfo().then(i => { state.info = i; setBadge(null); trackVersion(true); });
  window.api.getBosses().then(r => { if (r && r.ok) { state.bosses = r.data; if (state.view === 'rotations') render(); } });
})();
