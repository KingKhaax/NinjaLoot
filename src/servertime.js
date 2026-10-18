'use strict';

// Reloj del servidor (arriba a la izquierda): hora de la región elegida en horas, minutos y segundos.
// Al pasar el ratón por encima muestra cuánto queda para el reinicio semanal de esa región.
// Reinicios semanales (UTC): América, Latinoamérica y Oceanía martes 15:00; Europa miércoles 04:00; Corea y Taiwán jueves 02:00.
const ServerClock = (() => {
  const REGIONS = {
    eu: { code: 'EU', es: 'Europa', en: 'Europe', tz: 'Europe/Paris', dow: 3, h: 4 },
    us: { code: 'US', es: 'América · hora del Pacífico', en: 'Americas · Pacific time', tz: 'America/Los_Angeles', dow: 2, h: 15 },
    use: { code: 'US', es: 'América · hora del Este', en: 'Americas · Eastern time', tz: 'America/New_York', dow: 2, h: 15 },
    latam: { code: 'LATAM', es: 'Latinoamérica · hora de Brasilia', en: 'Latin America · Brasília time', tz: 'America/Sao_Paulo', dow: 2, h: 15 },
    oce: { code: 'OCE', es: 'Oceanía · hora de Sídney', en: 'Oceania · Sydney time', tz: 'Australia/Sydney', dow: 2, h: 15 },
    kr: { code: 'KR', es: 'Corea', en: 'Korea', tz: 'Asia/Seoul', dow: 4, h: 2 },
    tw: { code: 'TW', es: 'Taiwán', en: 'Taiwan', tz: 'Asia/Taipei', dow: 4, h: 2 },
  };
  const DAYS = { es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  const WEEK = 7 * 86400000;

  let cfg = { lang: () => 'es', region: () => 'eu', setRegion: () => {} };
  let root = null;
  let tip = null;
  let fmt = null;
  let fmtTz = '';
  let last = '';

  const reg = () => REGIONS[cfg.region()] || REGIONS.eu;
  const es = () => cfg.lang() === 'es';
  const pad = (n) => String(n).padStart(2, '0');

  // Próximo reinicio: el próximo `dow` a las `h` UTC (si ya pasó esta semana, la siguiente)
  function nextReset(now, r) {
    const d = new Date(now);
    let t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), r.h, 0, 0);
    t += ((r.dow - d.getUTCDay() + 7) % 7) * 86400000;
    if (t <= now) t += WEEK;
    return t;
  }

  function parts(now, r) {
    if (!fmt || fmtTz !== r.tz) {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone: r.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
      fmtTz = r.tz;
    }
    const o = {};
    for (const p of fmt.formatToParts(now)) o[p.type] = p.value;
    return [o.hour, o.minute, o.second];
  }

  function left(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return { d, h, m, s: s % 60 };
  }

  function resetLabel(r) {
    // «miércoles 06:00» en la hora del servidor de la región
    const when = new Date(nextReset(Date.now(), r));
    const hm = new Intl.DateTimeFormat(es() ? 'es-ES' : 'en-GB', { timeZone: r.tz, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(when);
    return hm;
  }

  function tipHTML(r, now) {
    const t = nextReset(now, r);
    const L = left(t - now);
    const prog = Math.min(1, Math.max(0, 1 - (t - now) / WEEK));
    const u = es() ? ['días', 'horas', 'minutos', 'segundos'] : ['days', 'hours', 'minutes', 'seconds'];
    const cell = (v, label) => `<div><b>${v}</b><small>${label}</small></div>`;
    const big = `${L.d ? cell(L.d, u[0]) : ''}${cell(pad(L.h), u[1])}${cell(pad(L.m), u[2])}${cell(pad(L.s), u[3])}`;
    return `<div class="sc-tip-h">${es() ? 'Reinicio semanal' : 'Weekly reset'}<span>${esc(es() ? r.es : r.en)}</span></div>
      <div class="sc-tip-big">${big}</div>
      <div class="sc-bar"><i style="width:${(prog * 100).toFixed(2)}%"></i></div>
      <div class="sc-tip-f">${es() ? 'Próximo reinicio' : 'Next reset'}: ${esc(resetLabel(r))} <small>(${es() ? 'hora del servidor' : 'server time'})</small></div>`;
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function tick() {
    if (!root || !root.isConnected) return;
    const now = Date.now();
    const r = reg();
    const [h, m, s] = parts(now, r);
    const key = `${h}${m}${s}${r.code}`;
    if (key === last) return;
    last = key;
    const q = (sel) => root.querySelector(sel);
    q('.sc-h').textContent = h;
    q('.sc-m').textContent = m;
    const sec = q('.sc-s');
    sec.textContent = s;
    sec.classList.remove('tick');
    void sec.offsetWidth; // reinicia la animación del segundo
    sec.classList.add('tick');
    q('.sc-reg').textContent = r.code;
    // el círculo da una vuelta cada 24 horas (15° por hora, avanzando con los minutos y segundos), no cada minuto
    root.style.setProperty('--sc-hr', String((Number(h) + Number(m) / 60 + Number(s) / 3600) * 15));
    root.setAttribute('aria-label', `${es() ? 'Hora del servidor' : 'Server time'} ${r.code}: ${h}:${m}:${s}`);
    if (tip && !tip.hidden) tip.innerHTML = tipHTML(r, now);
  }

  function showTip() {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'sc-tip';
      document.body.appendChild(tip);
    }
    const b = root.getBoundingClientRect();
    tip.innerHTML = tipHTML(reg(), Date.now());
    tip.hidden = false;
    tip.style.left = `${Math.max(8, Math.min(b.left, window.innerWidth - 350))}px`;
    tip.style.top = `${b.bottom + 8}px`;
  }
  const hideTip = () => { if (tip) tip.hidden = true; };

  const CSS = `
.sc { --sc-hr: 0; position: relative; display: inline-flex; align-items: center; gap: 9px; padding: 5px 12px 5px 6px; margin: 0 10px 0 0; border-radius: 12px; cursor: default; user-select: none; -webkit-user-select: none;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent, #4da3ff) 14%, var(--panel, #15181e)), var(--panel, #15181e));
  border: 1px solid color-mix(in srgb, var(--accent, #4da3ff) 38%, var(--line, #2a2f3a)); box-shadow: 0 0 0 0 transparent, inset 0 1px 0 rgba(255, 255, 255, .06);
  transition: transform .2s cubic-bezier(.2, .8, .2, 1), box-shadow .25s ease, border-color .25s ease; overflow: hidden; flex: none; }
.sc::before { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(105deg, transparent, color-mix(in srgb, var(--accent, #4da3ff) 28%, transparent), transparent); transform: skewX(-18deg) translateX(-120%); animation: scSweep 7s ease-in-out infinite; pointer-events: none; }
.sc:hover { transform: translateY(-1px); border-color: var(--accent, #4da3ff); box-shadow: 0 6px 22px color-mix(in srgb, var(--accent, #4da3ff) 38%, transparent), inset 0 1px 0 rgba(255, 255, 255, .1); }
.sc:hover::before { animation-duration: 1.6s; }
.sc-dial { position: relative; width: 28px; height: 28px; border-radius: 50%; flex: none;
  background: conic-gradient(var(--accent, #4da3ff) calc(var(--sc-hr) * 1deg), color-mix(in srgb, var(--accent, #4da3ff) 14%, transparent) 0);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent, #4da3ff) 40%, transparent); }
.sc-dial::before { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--panel, #15181e); }
.sc-dial::after { content: ''; position: absolute; left: 50%; top: 50%; width: 2px; height: 9px; margin: -9px 0 0 -1px; border-radius: 2px; background: var(--accent, #4da3ff); transform-origin: 50% 100%; transform: rotate(calc(var(--sc-hr) * 1deg)); transition: transform .6s ease; }
.sc-time { display: inline-flex; align-items: baseline; gap: 1px; font-variant-numeric: tabular-nums; font-weight: 800; font-size: 17px; letter-spacing: .5px; color: var(--strong, var(--text, #fff)); text-shadow: 0 0 14px color-mix(in srgb, var(--accent, #4da3ff) 45%, transparent); }
.sc-time b { display: inline-block; min-width: 1.15em; text-align: center; font-weight: 800; }
.sc-time em { font-style: normal; color: var(--accent, #4da3ff); animation: scBlink 1s steps(2, jump-none) infinite; }
.sc-s.tick { animation: scTick .35s cubic-bezier(.2, 1.4, .4, 1); }
.sc-reg { font-size: 10px; font-weight: 800; letter-spacing: 1px; padding: 2px 6px; border-radius: 999px; color: var(--on-accent, #fff); background: var(--accent-grad, var(--accent, #4da3ff)); }
.sc-tip { position: fixed; z-index: 2147483000; width: 340px; padding: 12px 14px; border-radius: 14px; pointer-events: none; color: var(--text, #fff);
  background: color-mix(in srgb, var(--panel, #15181e) 94%, #000); border: 1px solid color-mix(in srgb, var(--accent, #4da3ff) 55%, var(--line, #333)); box-shadow: 0 16px 44px rgba(0, 0, 0, .55), 0 0 24px color-mix(in srgb, var(--accent, #4da3ff) 25%, transparent); animation: scPop .18s ease-out; }
.sc-tip[hidden] { display: none; }
.sc-tip-h { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: var(--accent, #4da3ff); }
.sc-tip-h span { color: var(--muted, #98a2b3); letter-spacing: 0; text-transform: none; font-weight: 600; }
.sc-tip-big { display: flex; gap: 16px; margin: 10px 0 12px; font-variant-numeric: tabular-nums; }
.sc-tip-big div { display: grid; justify-items: start; }
.sc-tip-big b { font-size: 34px; font-weight: 800; line-height: 1; }
.sc-tip-big small { margin-top: 4px; font-size: 11.5px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: var(--accent, #4da3ff); }
.sc-bar { height: 6px; border-radius: 999px; background: color-mix(in srgb, var(--accent, #4da3ff) 16%, transparent); overflow: hidden; }
.sc-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent, #4da3ff), color-mix(in srgb, var(--accent, #4da3ff) 40%, #fff)); transition: width .6s ease; }
.sc-tip-f { margin-top: 8px; font-size: 12px; color: var(--muted, #98a2b3); text-transform: capitalize; }
.sc-tip-f small { text-transform: none; opacity: .8; }
@keyframes scSweep { 0%, 70% { transform: skewX(-18deg) translateX(-120%); } 100% { transform: skewX(-18deg) translateX(520%); } }
@keyframes scBlink { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
@keyframes scTick { 0% { transform: translateY(-5px) scale(1.18); color: var(--accent, #4da3ff); } 100% { transform: none; } }
@keyframes scPop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
/* Estilo consola: panel oscuro con cifras que brillan en el color de acento de la web (sirve igual en el tema claro) */
.sc { gap: 8px; padding: 6px 12px; margin-left: 10px; border-radius: 8px; background: #05080c; border: 1px solid color-mix(in srgb, var(--accent) 30%, #05080c); box-shadow: none; }
.sc::before { display: none; }
.sc:hover { transform: translateY(-1px); border-color: var(--accent); box-shadow: 0 6px 22px color-mix(in srgb, var(--accent) 30%, transparent); }
.sc-time { gap: 0; font-family: ui-monospace, 'Cascadia Mono', 'Noto Sans Mono', Consolas, monospace; font-size: 19px; font-weight: 700; letter-spacing: 1px; color: color-mix(in srgb, var(--accent) 62%, #fff); text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 60%, transparent); }
.sc-time b { min-width: 2ch; font-weight: 700; }
.sc-time em { color: color-mix(in srgb, var(--accent) 62%, #fff); }
.sc-s.sc-tick, .sc-s.tick { animation: none; }
.sc-reg { padding: 0; background: none; font-family: ui-monospace, 'Cascadia Mono', 'Noto Sans Mono', Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: .5px; color: color-mix(in srgb, var(--accent) 75%, #05080c); }
@media (prefers-reduced-motion: reduce) { .sc::before, .sc-time em, .sc-s.tick, .sc-tip { animation: none !important; } }
`;

  function mount(el) {
    if (!document.getElementById('scStyle')) {
      const st = document.createElement('style');
      st.id = 'scStyle';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    root = document.createElement('div');
    root.className = 'sc';
    root.setAttribute('role', 'timer');
    root.innerHTML = '<span class="sc-time"><b class="sc-h">--</b><em>:</em><b class="sc-m">--</b><em>:</em><b class="sc-s">--</b></span><span class="sc-reg">EU</span>';
    if (cfg.placeBefore) el.before(root); else el.after(root);
    root.addEventListener('mouseenter', showTip);
    root.addEventListener('mouseleave', hideTip);
    tick();
    setInterval(tick, 250);
  }

  // Selector de región para los ajustes de cada app
  function selectHTML() {
    return `<select data-clock-region>${Object.entries(REGIONS).map(([k, r]) => `<option value="${k}" ${k === cfg.region() ? 'selected' : ''}>${esc(es() ? r.es : r.en)}</option>`).join('')}</select>`;
  }

  document.addEventListener('change', (ev) => {
    const sel = ev.target.closest?.('[data-clock-region]');
    if (!sel) return;
    cfg.setRegion(sel.value);
    last = '';
    tick();
  });

  function init(options) {
    cfg = { ...cfg, ...options };
    if (options.after || options.before) { cfg.placeBefore = !options.after; mount(options.after || options.before); }
  }

  return { init, selectHTML, REGIONS };
})();
