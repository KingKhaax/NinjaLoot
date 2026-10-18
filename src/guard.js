'use strict';
// Guarda de contraste: revisa el texto que aparece en pantalla y, si se lee mal sobre su fondo (por ejemplo un verde fosforito sobre blanco en el
// tema claro, o un gris apagado sobre gris en el oscuro), le ajusta solo el brillo hasta que cumpla el contraste mínimo (4,5:1; 3:1 en texto grande).
// No toca el tono: un verde sigue siendo verde, solo más oscuro o más claro. Los textos blancos o negros sobre botones de color se respetan
// mientras tengan un contraste razonable. Al cambiar de tema se recalcula todo.
(() => {
  const MARK = 'data-cg';
  const orig = new WeakMap(); // valores en línea originales (color y fondo) para poder restaurarlos al cambiar de tema
  const parse = (c) => {
    if (!c) return null;
    let m = c.match(/^rgba?\(([^)]+)\)$/);
    if (m) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; }
    m = c.match(/^color\(srgb ([^)]+)\)$/);
    if (m) { const p = m[1].split(/[ \/]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] === undefined ? 1 : p[3] }; }
    return null;
  };
  const over = (f, b) => {
    const a = f.a + b.a * (1 - f.a);
    if (!a) return { r: 0, g: 0, b: 0, a: 0 };
    return { r: (f.r * f.a + b.r * b.a * (1 - f.a)) / a, g: (f.g * f.a + b.g * b.a * (1 - f.a)) / a, b: (f.b * f.a + b.b * b.a * (1 - f.a)) / a, a };
  };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const mix = (c, to, t) => ({ r: c.r + (to - c.r) * t, g: c.g + (to - c.g) * t, b: c.b + (to - c.b) * t, a: 1 });
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

  function setProp(el, prop, value) {
    let o = orig.get(el);
    if (!o) orig.set(el, (o = {}));
    if (!(prop in o)) o[prop] = [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)];
    el.style.setProperty(prop, value, 'important');
  }

  // elemento más cercano que pinta el fondo (el propio texto o un ancestro)
  function bgOwner(el) {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // degradados e imágenes no se tocan
      const b = parse(cs.backgroundColor);
      if (b && b.a >= 0.99) return { e, b };
      if (b && b.a > 0) return { e, b: { ...over(b, e.parentElement ? effectiveBg(e.parentElement, new Map()) : { r: 255, g: 255, b: 255, a: 1 }), a: 1 } };
    }
    return null;
  }

  function effectiveBg(el, cache) {
    const layers = [];
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      if (cache.has(e)) { layers.push(cache.get(e)); break; }
      const bg = parse(getComputedStyle(e).backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); if (bg.a >= 1) break; }
    }
    const base = parse(getComputedStyle(document.body).backgroundColor);
    let out = base && base.a ? { ...base, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) out = over(layers[i], out);
    cache.set(el, { ...out, a: 1 });
    return out;
  }

  function fix(el, cache) {
    if (el.hasAttribute(MARK)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    // si el color o el fondo están en plena transición (cambio de tema, hover) se vuelve a mirar cuando termine
    if (retries < 8 && el.getAnimations && el.getAnimations().some((a) => a.playState === 'running' && isFinite(a.effect.getComputedTiming().iterations))) { retry = true; return; }
    let fg = parse(cs.color);
    if (!fg || fg.a === 0) return;
    const fill = cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color ? parse(cs.webkitTextFillColor) : null;
    if (fill && fill.a === 0) return; // texto con degradado: no se toca
    if (fill) fg = fill;
    const bg = effectiveBg(el, cache);
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.6 && bold) ? 3 : 4.5;
    const eff = over(fg, bg);
    const rt = ratio(eff, bg);
    if (rt >= need) return;
    // texto blanco o negro «de diseño» sobre un botón o etiqueta de color: se respeta si el contraste es razonable
    const extreme = (fg.r > 235 && fg.g > 235 && fg.b > 235) || (fg.r < 20 && fg.g < 20 && fg.b < 20);
    if (extreme) {
      // texto blanco/negro de diseño sobre un botón o etiqueta de color: se ajusta el fondo (no el texto) hasta que se lea bien
      const own = bgOwner(el);
      if (own && own.e !== document.body && !own.e.hasAttribute(MARK + 'b')) {
        const white = fg.r > 128;
        for (let t = 0.04; t <= 0.7; t += 0.04) {
          const c = mix(own.b, white ? 0 : 255, t);
          if (ratio(fg, c) >= need) { setProp(own.e, 'background-color', hex(c)); own.e.setAttribute(MARK + 'b', '1'); el.setAttribute(MARK, '1'); return; }
        }
      }
      if (rt >= 2.6) return;
    }
    const toWhite = ratio({ r: 255, g: 255, b: 255 }, bg) > ratio({ r: 0, g: 0, b: 0 }, bg);
    const to = toWhite ? 255 : 0;
    let out = null;
    for (let t = 0.05; t <= 1.0001; t += 0.05) {
      const c = mix(eff, to, t);
      if (ratio(c, bg) >= need) { out = c; break; }
    }
    if (!out) out = mix(eff, to, 1);
    setProp(el, 'color', hex(out));
    if (fill) setProp(el, '-webkit-text-fill-color', hex(out));
    el.setAttribute(MARK, '1');
  }

  let retry = false, retries = 0;
  // espera a que terminen las transiciones y animaciones finitas de la página (p. ej. el cambio de tema) antes de medir colores
  function settled(cb) {
    let pend = [];
    try { pend = document.getAnimations().filter((a) => a.playState === 'running' && isFinite(a.effect.getComputedTiming().iterations)); } catch { /* sin API */ }
    if (!pend.length) return cb();
    let done = false;
    const go = () => { if (!done) { done = true; setTimeout(cb, 60); } };
    Promise.allSettled(pend.map((a) => a.finished)).then(go);
    setTimeout(go, 1500);
  }
  function scan(root) { settled(() => doScan(root)); }
  function doScan(root) {
    const cache = new Map();
    const seen = new Set();
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    const list = [];
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const el = n.parentElement;
      if (!el || seen.has(el) || ['SCRIPT', 'STYLE', 'OPTION', 'TEXTAREA'].includes(el.tagName)) continue;
      seen.add(el);
      list.push(el);
    }
    let i = 0;
    const step = () => {
      const end = Math.min(list.length, i + 500);
      for (; i < end; i++) { try { fix(list[i], cache); } catch { /* elemento ya retirado */ } }
      if (i < list.length) requestAnimationFrame(step);
      else if (retry) { retry = false; retries++; setTimeout(() => scan(document.body), 450); }
    };
    step();
  }

  function clearAll() {
    document.querySelectorAll('[' + MARK + '],[' + MARK + 'b]').forEach((e) => {
      const o = orig.get(e);
      if (o) for (const [prop, [val, pri]] of Object.entries(o)) { if (val) e.style.setProperty(prop, val, pri); else e.style.removeProperty(prop); }
      orig.delete(e);
      e.removeAttribute(MARK);
      e.removeAttribute(MARK + 'b');
    });
  }

  let queue = new Set(), pending = false;
  const flush = () => {
    pending = false;
    const nodes = [...queue];
    queue = new Set();
    for (const node of nodes) { if (node.isConnected) scan(node); }
  };
  const schedule = (node) => {
    queue.add(node);
    if (!pending) { pending = true; setTimeout(() => requestAnimationFrame(flush), 60); }
  };
  let full = 0;
  new MutationObserver((muts) => {
    let real = false;
    for (const m of muts) {
      if (m.target.nodeType === 1 && m.target.closest && m.target.closest('.sc, [role="timer"]')) continue;
      for (const a of m.addedNodes) { if (a.nodeType === 1) { schedule(a); real = true; } else if (a.nodeType === 3 && a.parentElement) { schedule(a.parentElement); real = true; } }
    }
    if (real) { retries = 0; clearTimeout(full); full = setTimeout(() => scan(document.body), 700); }
  }).observe(document.body, { childList: true, subtree: true });
  new MutationObserver(() => { retries = 0; clearAll(); setTimeout(() => scan(document.body), 600); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  let again = 0;
  const later = () => { clearTimeout(again); again = setTimeout(() => scan(document.body), 220); };
  document.addEventListener('toggle', later, true);
  document.addEventListener('click', later, true);
  document.addEventListener('animationend', later, true);
  window.addEventListener('load', () => scan(document.body));
  scan(document.body);
})();
