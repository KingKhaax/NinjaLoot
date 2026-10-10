'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const FONT = "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Roboto, Arial, sans-serif";
  const WEB_ICON = n => `https://wow.zamimg.com/images/wow/icons/large/${n}.jpg`;
  const ui = (n, c = '') => `<img class="uiicon ${c}" src="assets/ui/${n}.png" alt="">`;

  // ---------- Estado y ajustes ----------
  const DEFAULTS = { lang: 'es', theme: 'dark', colors: null, topN: 10, unit: 'dps', showValues: true, showIcons: true, showPct: false, animations: true, compact: false, persist: true, confirmClear: true, minGain: 0 };
  const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const state = {
    settings: { ...DEFAULTS, ...load('ninjaloot.settings', {}) },
    sims: [], loading: new Set(), names: { es: {}, en: {} }, expanded: new Set(), animateNext: true, info: { version: '' },
    view: 'charts', bossSel: null, bosses: BOSSES_SNAPSHOT, rot: load('ninjaloot.rotations', {}),
  };
  if (state.settings.persist) state.sims = load('ninjaloot.sims', []).filter(s => s && s.id && Array.isArray(s.items));
  const S = () => state.settings;
  const T = () => I18N[S().lang] || I18N.es;
  const persistSims = () => save('ninjaloot.sims', S().persist ? state.sims : []);
  const persistSettings = () => save('ninjaloot.settings', S());

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
    const src = loc ? `assets/items/${loc[1]}.png` : WEB_ICON(icon);
    return { name, icon: src, quality };
  }
  const pending = new Set();
  async function ensureNames() {
    const lang = S().lang, ids = [];
    for (const sim of state.sims) for (const it of visibleItems(sim, true)) {
      const needLoc = lang !== 'en' && !state.names[lang][it.id];
      const needMeta = !ITEMS[it.id] && !state.names[lang][it.id] && !state.names.en[it.id];
      if ((needLoc || needMeta) && !pending.has(`${lang}:${it.id}`)) { pending.add(`${lang}:${it.id}`); ids.push(it.id); }
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
  const bestOf = sim => sim.items.find(i => i.gain >= (Number(S().minGain) || 0)) || sim.items[0];
  const clsName = sim => sim.character.cls ? T().classes[sim.character.cls] : '';
  // Especialización: nombre localizado e icono propio (cada spec tiene el suyo; si no se reconoce, icono de clase)
  const specKey = sim => String(sim.character.spec || '').toLowerCase().replace(/[^a-z]/g, '');
  const specData = sim => (SPECS[sim.character.cls] || {})[specKey(sim)] || null;
  const specName = sim => { const d = specData(sim); return d ? d[S().lang === 'es' ? 1 : 0] : (sim.character.spec || ''); };
  const specIcon = sim => { const d = specData(sim); return d ? `assets/specs/${sim.character.cls}-${specKey(sim)}.png` : (sim.character.cls ? `assets/classes/${sim.character.cls}.png` : null); };
  const clsColor = sim => CLASS_COLORS[sim.character.cls] || '#c8a45a';
  const nf = () => new Intl.NumberFormat(S().lang === 'es' ? 'es-ES' : 'en-US');

  function valueOf(it, sim) { return S().unit === 'pct' ? it.pct : it.gain; }
  function valueText(it, sim) {
    const f = nf();
    if (S().unit === 'pct') return `+${it.pct.toFixed(2)}%`;
    const base = `+${S().compact ? Chart.fmtNum(it.gain, true) : f.format(it.gain)}`;
    return S().showPct ? `${base} (${it.pct.toFixed(1)}%)` : base;
  }

  // ---------- Render ----------
  function render() {
    const t = T();
    document.documentElement.lang = S().lang;
    $('#appSub').textContent = t.appSub;
    $('#urlInput').placeholder = t.urlPlaceholder;
    $('#btnAdd').textContent = t.add; $('#btnPaste').textContent = t.paste; $('#btnClear').textContent = t.clearAll;
    $('#btnClear').disabled = !state.sims.length;
    $('#langLabel').textContent = S().lang.toUpperCase();
    $('#navCharts').textContent = t.navCharts; $('#navRot').textContent = t.navRotations;
    document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('on', b.dataset.view === state.view));
    $('#chartsTools').hidden = state.view !== 'charts';
    $('#btnLang').title = t.language; $('#btnSettings').title = `${t.settings} (Ctrl+,)`;
    renderChips();
    const content = $('#content');
    if (state.view === 'rotations') { renderRotations(); return; }
    if (!state.sims.length) {
      content.innerHTML = `<div class="empty"><img src="assets/logo.png" alt=""><h2>${esc(t.emptyTitle)}</h2><p>${esc(t.emptyText)}</p></div>`;
      return;
    }
    const colors = themeColors(), animate = state.animateNext && S().animations;
    state.animateNext = false;
    const sims = [...state.sims].sort((a, b) => (bestOf(b)?.gain || 0) - (bestOf(a)?.gain || 0));
    const pct = S().unit === 'pct';

    // Gráfica general: mejor mejora por jugador
    const entries = sims.map(sim => {
      const best = bestOf(sim), info = itemInfo(best), col = clsColor(sim);
      return {
        id: sim.id, value: valueOf(best, sim), label: sim.character.name, sub: specName(sim) || clsName(sim),
        color: col, labelColor: readable(col), icon: info.icon, iconBorder: QUALITY_COLORS[info.quality], valueText: valueText(best, sim),
        bottomIcon: specIcon(sim),
        title: `${sim.character.name}\n${info.name} (${best.ilvl})\n${valueText(best, sim)} · ${best.pct.toFixed(2)}%`, onclick: true,
      };
    }).sort((a, b) => b.value - a.value);
    const chartOpts = { colors, animate, showValues: S().showValues, showIcons: S().showIcons, compact: S().compact, yTitle: pct ? t.yAxisPct : t.yAxisDps, tickFmt: pct ? v => `${v.toFixed(v % 1 ? 1 : 0)}%` : null };

    let html = `<section class="panel card" id="overview"><div class="card-head"><h2>${esc(t.overviewTitle)}</h2><span class="spacer"></span>`
      + `<div class="card-tools"><div class="seg" role="group" aria-label="${esc(t.unitLabel)}"><button data-unit="dps" class="${pct ? '' : 'on'}">${esc(t.unitDps)}</button><button data-unit="pct" class="${pct ? 'on' : ''}">${esc(t.unitPct)}</button></div>`
      + `<button class="btn small" data-export="overview">${ui('export')}${esc(t.exportPng)}</button></div></div>`
      + `<div class="hint">${esc(t.overviewHint)}</div><div class="chart-wrap" data-chart="overview">${Chart.build(entries, { ...chartOpts, slot: 112, height: 300 })}</div></section>`;

    // Una tarjeta por jugador con todos sus objetos
    for (const sim of sims) {
      const col = clsColor(sim), list = visibleItems(sim), total = sim.items.filter(i => i.gain >= (Number(S().minGain) || 0)).length;
      const items = list.map(it => {
        const info = itemInfo(it);
        return {
          id: it.id, value: valueOf(it, sim), label: info.name, sub: `${t.ilvl} ${it.ilvl}`, color: col, labelColor: readable(QUALITY_COLORS[info.quality]),
          icon: null, bottomIcon: info.icon, valueText: valueText(it, sim), title: `${info.name} (${it.ilvl})\n${valueText(it, sim)} · ${it.pct.toFixed(2)}%`,
        };
      });
      const canToggle = S().topN !== 0 && total > S().topN;
      html += `<section class="panel card" id="sim-${esc(sim.id)}"><div class="card-head">`
        + (specIcon(sim) ? `<img class="cls-icon" src="${specIcon(sim)}" alt="" style="border-color:${col}">` : '')
        + `<div><h2 style="color:${readable(col)}">${esc(sim.character.name)}</h2>`
        + `<div class="meta">${esc([specName(sim), clsName(sim), sim.character.realm].filter(Boolean).join(' · '))} — ${esc(t.baseDps)}: ${nf().format(sim.baseDps)} — ${total} ${esc(t.items)}</div></div>`
        + `<span class="spacer"></span><div class="card-tools">`
        + (canToggle ? `<button class="btn small" data-toggle="${esc(sim.id)}">${esc(state.expanded.has(sim.id) ? t.showLess : t.showAll)}</button>` : '')
        + `<button class="btn small" data-open="${esc(sim.url)}">${ui('open')}${esc(t.openRaidbots)}</button>`
        + `<button class="btn small" data-refresh="${esc(sim.id)}" title="${esc(t.refresh)}">${ui('refresh')}</button>`
        + `<button class="btn small" data-export="${esc(sim.id)}">${ui('export')}${esc(t.exportPng)}</button>`
        + `<button class="btn small danger" data-remove="${esc(sim.id)}" title="${esc(t.remove)}">${ui('remove')}</button></div></div>`
        + `<div class="chart-wrap" data-chart="${esc(sim.id)}">${Chart.build(items, { ...chartOpts, slot: 104, height: 240, bottom: 128, labelSize: 12.5, maxLines: 3 })}</div></section>`;
    }
    const scroll = document.scrollingElement.scrollTop;
    content.innerHTML = html;
    document.scrollingElement.scrollTop = scroll;
    ensureNames();
  }

  function renderChips() {
    const chips = $('#chips');
    let h = '';
    for (const id of state.loading) h += `<span class="chip loading"><span class="spinner"></span>${esc(id)} — ${esc(T().loading)}</span>`;
    for (const sim of state.sims) {
      const col = clsColor(sim);
      h += `<span class="chip" style="border-left-color:${col}">${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}`
        + `<span style="color:${readable(col)};font-weight:700">${esc(sim.character.name)}</span>`
        + `<span style="color:var(--muted)">${esc(specName(sim))}</span>`
        + `<button class="x" data-remove="${esc(sim.id)}" title="${esc(T().remove)}">${ui('remove')}</button></span>`;
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

  async function addSim(id, refresh = false, quiet = false) {
    if (!refresh && state.sims.some(s => s.id === id)) { toast(`${T().duplicate} (${state.sims.find(s => s.id === id).character.name})`); return 'dup'; }
    if (state.loading.has(id)) return 'busy';
    state.loading.add(id); renderChips();
    const r = await window.api.fetchReport(id);
    state.loading.delete(id);
    if (!r.ok) { renderChips(); toast(`${id}: ${errText(r)}`, true); return 'err'; }
    const i = state.sims.findIndex(s => s.id === id);
    if (i >= 0) state.sims[i] = r.report; else state.sims.push(r.report);
    persistSims(); state.animateNext = true; render();
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
    back.innerHTML = `<div class="panel modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button class="btn ghost small" data-close aria-label="${esc(T().close)}">${ui('remove')}</button></div>`
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

  function openSettings(tab = 'general') {
    const back = document.createElement('div');
    back.className = 'modal-back';
    $('#modalRoot').appendChild(back);
    const close = () => back.remove();
    const draw = view => {
      const t = T(), s = S();
      const tabs = [['general', t.tabGeneral], ['appearance', t.tabAppearance], ['update', t.tabUpdate], ['about', t.tabAbout]];
      const check = (key, label) => `<div class="row"><label for="s-${key}">${esc(label)}</label><input type="checkbox" id="s-${key}" data-key="${key}" ${s[key] ? 'checked' : ''}></div>`;
      const cur = k => hex((s.colors || {})[k]) || hex(getComputedStyle(document.documentElement).getPropertyValue(`--${k}`).trim()) || '#000000';
      const views = {
        general: () => `<div class="row"><label>${esc(t.language)}</label><select data-key="lang"><option value="es" ${s.lang === 'es' ? 'selected' : ''}>Español</option><option value="en" ${s.lang === 'en' ? 'selected' : ''}>English</option></select></div>`
          + `<div class="row"><label>${esc(t.topN)}</label><select data-key="topN">${[5, 10, 15, 20, 30, 0].map(n => `<option value="${n}" ${s.topN === n ? 'selected' : ''}>${n === 0 ? esc(t.all) : n}</option>`).join('')}</select></div>`
          + `<div class="row"><label>${esc(t.minGain)}</label><input type="number" min="0" step="50" style="width:110px" data-key="minGain" value="${Number(s.minGain) || 0}"></div>`
          + check('showValues', t.showValues) + check('showIcons', t.showIcons) + check('showPct', t.showPct) + check('compact', t.compact)
          + check('animations', t.animations) + check('persist', t.persist) + check('confirmClear', t.confirmClear)
          + `<div class="small-note">${esc(t.shortcuts)}</div>`,
        appearance: () => `<div class="row"><label>${esc(t.theme)}</label><div class="seg">${[['dark', t.themeDark], ['light', t.themeLight], ['auto', t.themeAuto]].map(([k, l]) => `<button data-set-theme="${k}" class="${s.theme === k ? 'on' : ''}">${esc(l)}</button>`).join('')}</div></div>`
          + `<h3>${esc(t.customColors)}</h3><div class="colors">`
          + [['bg', t.colorBg], ['panel', t.colorPanel], ['accent', t.colorAccent], ['text', t.colorText]].map(([k, l]) => `<label>${esc(l)}<input type="color" data-color="${k}" value="${cur(k)}"></label>`).join('')
          + `</div><button class="btn small" data-reset-colors>${esc(t.resetColors)}</button>`,
        update: () => `<div id="updBox"></div>`,
        about: () => `<div class="about big"><img src="assets/logo.png" alt="" width="120" height="120"><div>`
          + `<h2>NinjaLoot <span class="v">v${esc(state.info.version)}</span></h2>`
          + `<p class="about-desc">${esc(t.aboutDesc)} <span class="about-es">${esc(t.spain)} <svg viewBox="0 0 3 2" width="30" height="20" aria-label="ES" style="border-radius:3px"><rect width="3" height="2" fill="#c60b1e"/><rect y=".5" width="3" height="1" fill="#ffc400"/></svg></span></p>`
          + `<p>${esc(t.madeBy)} <b>Drakko</b> <span class="heart">♥</span></p>`
          + `<p class="about-dc first"><svg viewBox="0 0 127.14 96.36" width="26" height="20" aria-hidden="true"><path fill="#5865F2" d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg> <b>sr.kitkat</b> <span class="muted">${esc(t.questions)}</span></p>`
          + `<p class="about-dc"><img src="assets/battlenet.png" width="26" height="26" alt="" style="border-radius:6px"> <b>KitKat#21202</b> <span class="muted">${esc(t.questions)}</span></p>`
          + `<p class="small-note credits"><b>${esc(t.credits)}</b><br>${esc(t.creditsText)}</p></div></div>`,
      };
      back.innerHTML = `<div class="panel modal settings" role="dialog" aria-modal="true"><aside class="side"><h2>${esc(t.settingsTitle)}</h2>`
        + `<nav>${tabs.map(([k, l]) => `<button class="side-tab${k === view ? ' on' : ''}" data-tab="${k}">${esc(l)}</button>`).join('')}</nav>`
        + `<button class="btn side-close" data-close>${esc(t.close)}</button></aside><section class="pane">${views[view]()}</section></div>`;
      back.dataset.view = view;
      if (view === 'update') runUpdateCheck(back.querySelector('#updBox'));
    };
    back.addEventListener('mousedown', e => { if (e.target === back) close(); });
    back.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return close();
      const tb = e.target.closest('[data-tab]'); if (tb) return draw(tb.dataset.tab);
      const th = e.target.closest('[data-set-theme]'); if (th) { S().theme = th.dataset.setTheme; persistSettings(); applyTheme(); draw('appearance'); state.animateNext = false; render(); return; }
      if (e.target.closest('[data-reset-colors]')) { S().colors = null; persistSettings(); applyTheme(); draw('appearance'); state.animateNext = false; render(); }
    });
    back.addEventListener('input', e => {
      const c = e.target.closest('[data-color]');
      if (c) { S().colors = { ...(S().colors || {}), [c.dataset.color]: c.value }; persistSettings(); applyTheme(); state.animateNext = false; render(); }
    });
    back.addEventListener('change', e => {
      const el = e.target.closest('[data-key]'); if (!el) return;
      const key = el.dataset.key, s = S();
      s[key] = el.type === 'checkbox' ? el.checked : el.tagName === 'SELECT' && key !== 'lang' ? Number(el.value) : el.type === 'number' ? Math.max(0, Number(el.value) || 0) : el.value;
      persistSettings();
      if (key === 'persist') persistSims();
      if (key === 'animations') applyTheme();
      state.animateNext = false;
      if (key === 'lang') draw(back.dataset.view);
      render();
    });
    draw(tab);
  }

  // ---------- Rotaciones: jefes, buffs y plantillas de banda ----------
  const out = id => new Set(state.rot[id] || []);
  const rosterFor = id => { const o = out(id); return state.sims.filter(s => !o.has(s.id)); };
  const coverage = sims => RAID_BUFFS.map(b => ({ b, who: sims.filter(s => b.from.includes(s.character.cls)) }));
  const missingFor = id => coverage(rosterFor(id)).filter(c => !c.who.length);
  const allBosses = () => state.bosses.groups.flatMap(g => g.bosses.map(b => ({ ...b, group: g.name })));
  const persistRot = () => save('ninjaloot.rotations', state.rot);
  const buffIcon = b => `assets/ui/buff-${b.id}.png`;

  function renderRotations() {
    const t = T(), L = S().lang === 'es' ? 0 : 1, content = $('#content');
    const bosses = allBosses();
    if (!bosses.find(b => b.id === state.bossSel)) state.bossSel = bosses[0]?.id;
    const sel = bosses.find(b => b.id === state.bossSel);
    const kindLabel = { buff: t.kindBuff, debuff: t.kindDebuff, util: t.kindUtil };

    let list = '';
    for (const g of state.bosses.groups) {
      list += `<div class="boss-group">${esc(g.name)}</div>`;
      for (const b of g.bosses) {
        const miss = missingFor(b.id).length;
        list += `<button class="boss${b.id === state.bossSel ? ' on' : ''}" data-boss="${b.id}"><span>${esc(b.name)}</span><span class="pill ${miss ? 'bad' : 'ok'}">${miss ? `−${miss}` : t.complete}</span></button>`;
      }
    }

    let detail = '';
    if (sel) {
      const o = out(sel.id), cov = coverage(rosterFor(sel.id)), miss = cov.filter(c => !c.who.length);
      const roster = state.sims.length
        ? state.sims.map(sim => {
          const col = clsColor(sim), off = o.has(sim.id);
          return `<button class="rchip${off ? ' off' : ''}" data-roster="${esc(sim.id)}" style="border-color:${off ? 'var(--border)' : col}" title="${esc(clsName(sim))}">`
            + `${specIcon(sim) ? `<img src="${specIcon(sim)}" alt="">` : ''}<span class="rn" style="color:${readable(col)}">${esc(sim.character.name)}</span><span class="rs">${esc(specName(sim))}</span></button>`;
        }).join('')
        : `<div class="hint">${esc(t.rotNoSims)}</div>`;
      detail = `<div class="panel card rot-head"><div class="card-head"><div><h2>${esc(sel.name)}</h2><div class="meta">${esc(sel.group)} · ${esc(state.bosses.season)}</div></div>`
        + `<span class="spacer"></span><div class="card-tools"><button class="btn small" data-roster-all="in">${esc(t.rotAllIn)}</button><button class="btn small" data-roster-all="out">${esc(t.rotAllOut)}</button><button class="btn small" data-roster-copy>${esc(t.rotCopy)}</button></div></div>`
        + `<h3>${esc(t.rotRoster)}</h3><div class="hint">${esc(t.rotRosterHint)}</div><div class="roster">${roster}</div></div>`
        + `<div class="panel card"><div class="status ${miss.length ? 'bad' : 'ok'}">${miss.length ? `${esc(t.rotMissing)}: ${miss.map(m => esc(m.b.name[L])).join(', ')}` : esc(t.rotAllCovered)}</div>`
        + `<div class="buffs">${cov.map(({ b, who }) => `<div class="buff ${who.length ? 'ok' : 'bad'}"><img src="${buffIcon(b)}" alt="" width="36" height="36">`
          + `<div class="bi"><b>${esc(b.name[L])}</b> <span class="kind">${esc(kindLabel[b.kind])}</span><div class="be">${esc(b.effect[L])}</div></div>`
          + `<div class="bs">${who.length ? `<span class="tag ok">${esc(t.rotCovered)}</span><div class="bw">${who.map(s => esc(s.character.name)).join(', ')}</div>` : `<span class="tag bad">${esc(t.rotMissingTag)}</span><div class="bw">${esc(t.rotProvidedBy)}: ${b.from.map(c => esc(t.classes[c])).join(', ')}</div>`}</div></div>`).join('')}</div></div>`;
    }
    content.innerHTML = `<div class="rot"><aside class="panel boss-list"><div class="boss-season">${esc(state.bosses.season)}</div>${list}</aside><div class="rot-main">${detail}</div></div>`;
  }

  // ---------- Actualizaciones ----------
  const semver = v => String(v || '').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  const isNewer = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  async function runUpdateCheck(box) {
    const t = T();
    const draw = body => { if (box.isConnected) box.innerHTML = body; };
    draw(`<div class="spinner"></div> ${esc(t.checking)}`);
    const r = await window.api.checkUpdate();
    if (!r.ok) {
      draw(`<div class="status bad">${esc(t.updError)}</div><button class="btn small" data-upd-check>${esc(t.checkAgain)}</button>`);
      box.querySelector('[data-upd-check]')?.addEventListener('click', () => runUpdateCheck(box));
      return;
    }
    const latest = r.release?.version || r.main || null;
    const outdated = latest && isNewer(latest, r.current);
    const cls = !latest ? 'na' : outdated ? 'bad' : 'ok';
    const msg = !latest ? t.updNone : outdated ? t.updOutdated : t.updCurrent;
    draw(`<div class="ver"><span>${esc(t.updInstalled)}</span><b class="${cls}">v${esc(r.current)}</b>`
      + `<span>${esc(t.updRelease)}</span><b>${r.release ? 'v' + esc(r.release.version) : '—'}</b>`
      + `<span>${esc(t.updMain)}</span><b>${r.main ? 'v' + esc(r.main) : '—'}</b></div>`
      + `<div class="status ${cls}">${esc(msg)}</div>`
      + `<div style="display:flex;gap:8px;flex-wrap:wrap">`
      + (outdated && r.release?.asset ? `<button class="btn primary" data-upd-install>${esc(t.updInstall)}</button>` : '')
      + (r.release ? `<button class="btn" data-upd-open="${esc(r.release.url)}">${esc(t.updOpen)} ↗</button>` : '')
      + `<button class="btn" data-upd-check>${esc(t.checkAgain)}</button></div><div class="small-note" id="updNote"></div>`);
    box.querySelector('[data-upd-check]')?.addEventListener('click', () => runUpdateCheck(box));
    box.querySelector('[data-upd-open]')?.addEventListener('click', e => window.api.openExternal(e.currentTarget.dataset.updOpen));
    box.querySelector('[data-upd-install]')?.addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.disabled = true; box.querySelector('#updNote').textContent = t.updDownloading;
      const res = await window.api.installUpdate(r.release.asset);
      if (!res.ok) { box.querySelector('#updNote').textContent = t.updError; btn.disabled = false; }
    });
  }

  // ---------- Eventos ----------
  $('#btnAdd').onclick = () => { const v = $('#urlInput').value; if (v.trim()) { $('#urlInput').value = ''; addFromText(v); } };
  $('#btnPaste').onclick = async () => { try { const v = await navigator.clipboard.readText(); if (v) addFromText(v); } catch { $('#urlInput').focus(); } };
  $('#btnClear').onclick = clearAll;
  $('#btnSettings').onclick = () => openSettings();
  $('#btnLang').onclick = () => { S().lang = S().lang === 'es' ? 'en' : 'es'; persistSettings(); state.animateNext = false; render(); };
  $('#urlInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#btnAdd').click(); } });
  $('#urlInput').addEventListener('paste', e => { const txt = e.clipboardData.getData('text'); if (extractIds(txt).length) { e.preventDefault(); addFromText(txt); } });

  document.addEventListener('click', e => {
    const q = a => e.target.closest(`[${a}]`);
    let el;
    if ((el = q('data-remove'))) removeSim(el.dataset.remove);
    else if ((el = q('data-view'))) { state.view = el.dataset.view; state.animateNext = true; render(); window.scrollTo(0, 0); }
    else if ((el = q('data-boss'))) { state.bossSel = Number(el.dataset.boss); render(); }
    else if ((el = q('data-roster'))) { const o = out(state.bossSel); o.has(el.dataset.roster) ? o.delete(el.dataset.roster) : o.add(el.dataset.roster); state.rot[state.bossSel] = [...o]; persistRot(); render(); }
    else if ((el = q('data-roster-all'))) { state.rot[state.bossSel] = el.dataset.rosterAll === 'out' ? state.sims.map(s => s.id) : []; persistRot(); render(); }
    else if (q('data-roster-copy')) { const cur = state.rot[state.bossSel] || []; for (const b of allBosses()) state.rot[b.id] = [...cur]; persistRot(); render(); toast(T().rotCopied); }
    else if ((el = q('data-refresh'))) addSim(el.dataset.refresh, true);
    else if ((el = q('data-open'))) window.api.openExternal(el.dataset.open);
    else if ((el = q('data-export'))) exportChart(el.dataset.export);
    else if ((el = q('data-toggle'))) { const id = el.dataset.toggle; state.expanded.has(id) ? state.expanded.delete(id) : state.expanded.add(id); state.animateNext = false; render(); }
    else if ((el = q('data-unit'))) { S().unit = el.dataset.unit; persistSettings(); state.animateNext = true; render(); }
    else if ((el = e.target.closest('#overview .bar[role="button"]'))) document.getElementById(`sim-${el.dataset.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeTopModal();
    else if (e.ctrlKey && e.key === ',') { e.preventDefault(); if (!$('.modal-back')) openSettings(); }
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.bar[role="button"]')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    else if (e.ctrlKey && e.key.toLowerCase() === 'v' && state.view === 'charts' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) $('#btnPaste').click();
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
  window.api.appInfo().then(i => { state.info = i; });
  window.api.getBosses().then(r => { if (r && r.ok) { state.bosses = r.data; if (state.view === 'rotations') render(); } });
})();
