'use strict';
// Gráfica de barras en SVG (colores explícitos para poder exportarla a PNG).
const Chart = (() => {
  let FONT = "'Noto Sans', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function shade(hex, amt) { // amt -1..1
    const n = parseInt(hex.slice(1), 16);
    const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }

  function niceScale(max, ticks = 6) {
    if (!(max > 0)) return { step: 1, top: 1 };
    const raw = max / ticks, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || 10 * mag;
    return { step, top: Math.ceil(max / step) * step };
  }

  function fmtNum(v, compact, decimals = 0) {
    if (compact && Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
    return decimals ? v.toFixed(decimals) : String(Math.round(v));
  }

  function wrap(text, maxChars, maxLines) {
    const words = String(text).split(/\s+/), lines = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length <= maxChars) cur = (cur + ' ' + w).trim();
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…'); }
    return lines.map(l => l.length > maxChars + 1 ? l.slice(0, maxChars) + '…' : l);
  }

  /**
   * entries: [{ id, value, label, sub, color, labelColor, icon, iconBorder, valueText, title, bottomIcon }]
   * opts: { height, slot, colors:{text,muted,grid,axis,bg}, yTitle, showValues, showIcons, animate, compact, tickFmt }
   */
  function build(entries, opts) {
    FONT = (getComputedStyle(document.documentElement).getPropertyValue('--font') || '').trim() || FONT;
    const { colors, showValues = true, showIcons = true, animate = false, compact = false, yTitle = '' } = opts;
    const maxSlot = opts.slot || 96, plotH = Math.round((opts.height || 280) * (opts.hScale || 1));
    const left = 74, right = 24, top = 70, bottom = (opts.bottom || 104) + (showValues ? 22 : 0), ls = opts.labelSize || 14, maxLines = opts.maxLines || 2;
    // Ancho de columna: lo justo para que quepan valor, icono y nombre sin tocarse; las barras quedan más juntas
    const wrapped = entries.map(e => wrap(e.label, Math.floor((maxSlot - 6) / (ls * 0.56)), maxLines));
    const need = Math.max(56, ...entries.map((e, i) => Math.max(showValues && e.valueText ? e.valueText.length * 14 * 0.6 : 0, ...wrapped[i].map(l => l.length * ls * 0.58), e.sub ? e.sub.length * 11.5 * 0.55 : 0)));
    const slot = Math.round(Math.min(maxSlot, need + 16));
    const W = left + right + Math.max(entries.length, 3) * slot, H = top + plotH + bottom;
    const max = Math.max(...entries.map(e => e.value), 0);
    const { step, top: yMax } = niceScale(max);
    const yOf = v => top + plotH - (v / yMax) * plotH;
    const barW = Math.min(64, slot - 24);
    const uid = 'g' + Math.random().toString(36).slice(2, 8);
    let defs = '', grid = '', bars = '', labels = '';

    for (let v = 0; v <= yMax + step / 2; v += step) {
      const y = yOf(v);
      grid += `<line x1="${left}" x2="${W - right}" y1="${y}" y2="${y}" stroke="${v === 0 ? colors.axis : colors.grid}" stroke-width="${v === 0 ? 1.5 : 1}"/>`;
      grid += `<text x="${left - 10}" y="${y + 4}" text-anchor="end" font-size="13" fill="${colors.muted}" font-family="${FONT}">${esc(opts.tickFmt ? opts.tickFmt(v) : fmtNum(v, compact))}</text>`;
    }
    grid += `<line x1="${left}" x2="${left}" y1="${top}" y2="${top + plotH}" stroke="${colors.axis}" stroke-width="1.5"/>`;
    if (yTitle) grid += `<text transform="translate(16 ${top + plotH / 2}) rotate(-90)" text-anchor="middle" font-size="12" fill="${colors.muted}" font-family="${FONT}">${esc(yTitle)}</text>`;

    entries.forEach((e, i) => {
      const cx = left + slot * i + slot / 2, x = cx - barW / 2;
      const h = Math.max(2, plotH - (yOf(e.value) - top)), y = top + plotH - h;
      const base = e.color || '#b04df5', gid = `${uid}${i}`;
      defs += `<linearGradient id="${gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${shade(base, 0.08)}"/><stop offset="1" stop-color="${shade(base, -0.12)}"/></linearGradient>`;
      defs += `<linearGradient id="${gid}v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.10"/></linearGradient>`;
      const delay = animate ? ` style="animation-delay:${Math.min(i, 20) * 45}ms"` : '';
      // Con tipIcon ('top'/'bottom') el tooltip del objeto va en ese icono y la barra muestra solo su mejora exacta (e.tip)
      const itemAttrs = e.itemId ? ` data-item="${e.itemId}" data-ilvl="${e.ilvl || 0}" data-gain="${esc(e.gain || '')}" data-tip-always` : '';
      const onBar = e.itemId && !e.tipIcon;
      bars += `<g class="bar${animate ? ' grow' : ''}${e.owned ? ' owned' : ''}" data-id="${esc(e.id ?? i)}"${onBar ? itemAttrs : e.tip ? ` data-bartip="${esc(e.tip)}"` : ''}${delay}${e.onclick ? ' tabindex="0" role="button"' : ''}>`
        + (onBar || e.tip ? '' : `<title>${esc(e.title || e.label)}</title>`)
        + `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="url(#${gid})"/>`
        + `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="url(#${gid}v)"/>`
        + `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="none" stroke="${shade(base, -0.55)}" stroke-opacity="0.7"/>`;
      const ty = y - 8;
      bars += '</g>';
      if (showIcons && e.icon) {
        const s = 34, ix = cx - s / 2, iy = ty - s + 6;
        bars += `<g class="ic"${e.tipIcon === 'top' ? itemAttrs : ''}><image href="${esc(e.icon)}" x="${ix}" y="${iy}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid slice"/>`
          + `<rect x="${ix - 0.5}" y="${iy - 0.5}" width="${s + 1}" height="${s + 1}" rx="3" fill="none" stroke="${e.iconBorder || '#a335ee'}" stroke-width="2"/></g>`;
      }

      // Etiquetas inferiores: icono (clase u objeto), nombre y subtítulo
      let ly = top + plotH + 12;
      if (showValues && e.valueText) {
        labels += `<text x="${cx}" y="${ly + 12}" text-anchor="middle" font-size="14" font-weight="700" fill="${colors.text}" font-family="${FONT}">${esc(e.valueText)}</text>`;
        ly += 22;
      }
      if (e.bottomIcon) {
        labels += `<g class="ic"${e.tipIcon === 'bottom' ? itemAttrs : ''}><image href="${esc(e.bottomIcon)}" x="${cx - 16}" y="${ly}" width="32" height="32"/>`
          + `<rect x="${cx - 16.5}" y="${ly - 0.5}" width="33" height="33" rx="3" fill="none" stroke="${e.color || colors.axis}" stroke-width="1.5"/></g>`;
        ly += 46;
      } else ly += 12;
      const lines = wrapped[i];
      lines.forEach((ln, k) => {
        labels += `<text x="${cx}" y="${ly + k * (ls + 2)}" text-anchor="middle" font-size="${ls}" font-weight="700" fill="${e.labelColor || colors.text}"${e.owned ? ' text-decoration="line-through" opacity="0.55"' : ''} stroke="${colors.bg}" stroke-width="3" paint-order="stroke" stroke-linejoin="round" font-family="${FONT}">${esc(ln)}</text>`;
      });
      if (e.sub) labels += `<text x="${cx}" y="${ly + lines.length * (ls + 2)}" text-anchor="middle" font-size="12" font-weight="600" fill="${e.subColor || colors.muted}" font-family="${FONT}">${esc(e.sub)}</text>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}">`
      + `<defs>${defs}</defs>${grid}${bars}${labels}</svg>`;
  }

  /**
   * Gráfica compacta de un objeto: una barra por jugador (color de clase) con su nombre inclinado debajo.
   * entries: [{ value, label, color, labelColor, tip, itemId, ilvl, gain, icon, iconBorder, bottomIcon, tipIcon }] (ya ordenadas) · opts: { colors, compact, tickFmt, animate }
   * tip: texto exacto al pasar el ratón por la barra; itemId: el nombre de debajo muestra el tooltip del objeto
   * tipIcon 'top': icono del objeto encima de la barra · tipIcon 'bottom': icono del objeto debajo en vez del nombre (ambos con su tooltip)
   */
  function mini(entries, opts) {
    FONT = (getComputedStyle(document.documentElement).getPropertyValue('--font') || '').trim() || FONT;
    const { colors, compact = false, animate = false } = opts;
    const topIcons = entries.some(e => e.icon && e.tipIcon === 'top');
    const iconLabels = entries.length > 0 && entries.every(e => e.bottomIcon && e.tipIcon === 'bottom');
    const left = 48, right = 10, top = topIcons ? 40 : 12, plotH = 150;
    const short = s => { s = String(s); return s.length > 26 ? s.slice(0, 25) + '…' : s; };
    const longest = Math.max(4, ...entries.map(e => short(e.label).length));
    const bottom = iconLabels ? 44 : Math.min(170, 26 + longest * 5.6);
    const slot = Math.max(iconLabels || topIcons ? 36 : 30, Math.min(56, 380 / Math.max(entries.length, 1)));
    const is = Math.min(28, slot - 6);
    const W = Math.max(300, left + right + entries.length * slot), H = top + plotH + bottom;
    const { step, top: yMax } = niceScale(Math.max(...entries.map(e => e.value), 0), 5);
    const yOf = v => top + plotH - (v / yMax) * plotH;
    const barW = Math.min(30, slot * 0.72);
    let grid = '', bars = '', defs = '';
    const uid = 'm' + Math.random().toString(36).slice(2, 7);
    for (let v = 0; v <= yMax + step / 2; v += step) {
      const y = yOf(v);
      grid += `<line x1="${left}" x2="${W - right}" y1="${y}" y2="${y}" stroke="${v === 0 ? colors.axis : colors.grid}" stroke-width="1"/>`
        + `<text x="${left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${colors.muted}" font-family="${FONT}">${esc(opts.tickFmt ? opts.tickFmt(v) : fmtNum(v, compact))}</text>`;
    }
    entries.forEach((e, i) => {
      const cx = left + slot * i + slot / 2, y = yOf(e.value), h = Math.max(2, top + plotH - y);
      const delay = animate ? ` style="animation-delay:${Math.min(i, 20) * 35}ms"` : '';
      const itemAttrs = e.itemId ? ` data-item="${e.itemId}" data-ilvl="${e.ilvl || 0}" data-gain="${esc(e.gain || '')}" data-tip-always` : '';
      const icon = (href, ix, iy, border) => `<g class="ic"${itemAttrs}${e.owned ? ' opacity="0.45"' : ''}><image href="${esc(href)}" x="${ix}" y="${iy}" width="${is}" height="${is}" preserveAspectRatio="xMidYMid slice"/>`
        + `<rect x="${ix - 0.5}" y="${iy - 0.5}" width="${is + 1}" height="${is + 1}" rx="3" fill="none" stroke="${border || '#a335ee'}" stroke-width="1.5"/></g>`;
      bars += `<g class="bar${animate ? ' grow' : ''}${e.owned ? ' owned' : ''}"${delay}${e.tip ? ` data-bartip="${esc(e.tip)}"` : ''}>${e.tip ? '' : `<title>${esc(`${e.label}: ${e.valueText || e.value}`)}</title>`}`
        + (() => {
          const base = e.color || '#b04df5', gid = `${uid}${i}`, bx = cx - barW / 2, by = top + plotH - h;
          defs += `<linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${shade(base, 0.2)}"/><stop offset="1" stop-color="${shade(base, -0.2)}"/></linearGradient>`
            + `<linearGradient id="${gid}s" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></linearGradient>`;
          return `<rect x="${bx}" y="${by}" width="${barW}" height="${h}" rx="4" fill="url(#${gid})" style="filter:drop-shadow(0 0 5px ${base}55)"/>`
            + `<rect x="${bx}" y="${by}" width="${barW}" height="${h}" rx="4" fill="url(#${gid}s)"/>`
            + `<rect x="${bx}" y="${by}" width="${barW}" height="${h}" rx="4" fill="none" stroke="${shade(base, -0.55)}" stroke-opacity="0.7"/></g>`;
        })();
      if (e.icon && e.tipIcon === 'top') bars += icon(e.icon, cx - is / 2, top + plotH - h - is - 5, e.iconBorder);
      if (iconLabels) bars += icon(e.bottomIcon, cx - is / 2, top + plotH + 8, e.labelColor);
      else bars += `<text transform="translate(${cx + 4} ${top + plotH + 10}) rotate(-45)" text-anchor="end" font-size="13.5" font-weight="700" fill="${e.labelColor || colors.text}"${e.owned ? ' text-decoration="line-through" opacity="0.55"' : ''} font-family="${FONT}"`
        + `${e.itemId && !e.tipIcon ? ` class="lbl-item"${itemAttrs}` : ''}>${esc(short(e.label))}</text>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" class="chart-svg mini" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMinYMin meet" font-family="${FONT}"><defs>${defs}</defs>${grid}${bars}</svg>`;
  }

  return { build, mini, fmtNum };
})();
