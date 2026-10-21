'use strict';
// Pulido visual: las cifras grandes (DPS de Quick Sim, ganancias, cofre) cuentan hasta su valor al aparecer.
// Respeta «reducir movimiento» y el modo sin animaciones, y no toca nada si la cifra no se puede leer con seguridad.
(() => {
  const SEL = '.xs-dps b, .v-count, .coin-gain, .ptable .gn b, .stat-tile.best b, .pc-g';
  const done = new WeakSet();
  const loc = () => (document.documentElement.lang === 'en' ? 'en-US' : 'es-ES');
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('no-anim');

  function countUp(el) {
    if (done.has(el)) return;
    done.add(el);
    if (el.children.length || reduce()) return;
    const txt = el.textContent.trim();
    const m = txt.match(/^([+~]?)(\d[\d.,]*)(.*)$/);
    if (!m) return;
    const parts = new Intl.NumberFormat(loc()).formatToParts(1234.5);
    const group = parts.find((p) => p.type === 'group')?.value || ',';
    const dec = parts.find((p) => p.type === 'decimal')?.value || '.';
    const tok = m[2];
    const decimals = tok.includes(dec) ? tok.length - tok.lastIndexOf(dec) - 1 : 0;
    const val = parseFloat(tok.split(group).join('').replace(dec, '.'));
    if (!isFinite(val) || val <= 0) return;
    const fmt = new Intl.NumberFormat(loc(), { useGrouping: 'always', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const t0 = performance.now(), dur = 650;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = m[1] + (k < 1 ? fmt.format(val * e) : tok) + m[3];
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const main = document.querySelector('main');
  if (!main) return;
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; main.querySelectorAll(SEL).forEach(countUp); });
  }).observe(main, { childList: true, subtree: true });
})();

(() => {
  const nav = document.querySelector('.nav'), ind = nav && nav.querySelector('.nav-ind'), content = document.getElementById('content');
  if (!nav || !ind) return;
  let ready = false;
  const place = () => {
    const on = nav.querySelector('.navbtn.on');
    if (!on || !on.offsetWidth) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '1';
    ind.style.width = on.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + on.offsetLeft + 'px)';
    if (!ready) requestAnimationFrame(() => { ready = true; ind.classList.add('ready'); });
  };
  new MutationObserver(place).observe(nav, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true, characterData: true });
  addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  place();

  if (!content) return;
  let last = '';
  new MutationObserver(() => {
    const on = nav.querySelector('.navbtn.on'), v = on ? on.dataset.view : '';
    if (v === last) return;
    last = v;
    if (v === 'charts' || document.body.classList.contains('no-anim')) return;
    [...content.children].slice(0, 12).forEach((el, i) => { el.style.setProperty('--i', i); el.classList.add('enter'); });
    setTimeout(() => content.querySelectorAll('.enter').forEach((el) => el.classList.remove('enter')), 1100);
  }).observe(content, { childList: true });
})();
