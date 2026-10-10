'use strict';
// Gráfica de barras en SVG (colores explícitos para poder exportarla a PNG).
const Chart = (() => {
  const FONT = "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Roboto, Arial, sans-serif";
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
    const { colors, showValues = true, showIcons = true, animate = false, compact = false, yTitle = '' } = opts;
    const slot = opts.slot || 96, plotH = opts.height || 280;
    const left = 74, right = 24, top = 70, bottom = (opts.bottom || 104) + (showValues ? 22 : 0), ls = opts.labelSize || 14, maxLines = opts.maxLines || 2;
    const W = left + right + Math.max(entries.length, 3) * slot, H = top + plotH + bottom;
    const max = Math.max(...entries.map(e => e.value), 0);
    const { step, top: yMax } = niceScale(max);
    const yOf = v => top + plotH - (v / yMax) * plotH;
    const barW = Math.min(64, slot * 0.64);
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
      defs += `<linearGradient id="${gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${shade(base, 0.35)}"/><stop offset="0.45" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.35)}"/></linearGradient>`;
      defs += `<linearGradient id="${gid}v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.28"/><stop offset="0.55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>`;
      const delay = animate ? ` style="animation-delay:${Math.min(i, 20) * 45}ms"` : '';
      bars += `<g class="bar${animate ? ' grow' : ''}" data-id="${esc(e.id ?? i)}"${delay}${e.onclick ? ' tabindex="0" role="button"' : ''}>`
        + `<title>${esc(e.title || e.label)}</title>`
        + `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="url(#${gid})"/>`
        + `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="url(#${gid}v)"/>`
        + `<rect x="${x + 4}" y="${y + 2}" width="${Math.max(3, barW * 0.14)}" height="${Math.max(0, h - 4)}" rx="2" fill="#fff" opacity="0.22"/>`
        + `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="none" stroke="${shade(base, -0.55)}" stroke-opacity="0.7"/>`;
      const ty = y - 8;
      if (showIcons && e.icon) {
        const s = 34, ix = cx - s / 2, iy = ty - s + 6;
        bars += `<image href="${esc(e.icon)}" x="${ix}" y="${iy}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid slice"/>`
          + `<rect x="${ix - 0.5}" y="${iy - 0.5}" width="${s + 1}" height="${s + 1}" rx="3" fill="none" stroke="${e.iconBorder || '#a335ee'}" stroke-width="2"/>`;
      }
      bars += '</g>';

      // Etiquetas inferiores: icono (clase u objeto), nombre y subtítulo
      let ly = top + plotH + 12;
      if (showValues && e.valueText) {
        labels += `<text x="${cx}" y="${ly + 12}" text-anchor="middle" font-size="14" font-weight="700" fill="${colors.text}" font-family="${FONT}">${esc(e.valueText)}</text>`;
        ly += 22;
      }
      if (e.bottomIcon) {
        labels += `<image href="${esc(e.bottomIcon)}" x="${cx - 16}" y="${ly}" width="32" height="32"/>`
          + `<rect x="${cx - 16.5}" y="${ly - 0.5}" width="33" height="33" rx="3" fill="none" stroke="${e.color || colors.axis}" stroke-width="1.5"/>`;
        ly += 46;
      } else ly += 12;
      const lines = wrap(e.label, Math.floor((slot - 6) / (ls * 0.56)), maxLines);
      lines.forEach((ln, k) => {
        labels += `<text x="${cx}" y="${ly + k * (ls + 2)}" text-anchor="middle" font-size="${ls}" font-weight="700" fill="${e.labelColor || colors.text}" stroke="${colors.bg}" stroke-width="3" paint-order="stroke" stroke-linejoin="round" font-family="${FONT}">${esc(ln)}</text>`;
      });
      if (e.sub) labels += `<text x="${cx}" y="${ly + lines.length * (ls + 2)}" text-anchor="middle" font-size="11.5" fill="${colors.muted}" font-family="${FONT}">${esc(e.sub)}</text>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}">`
      + `<defs>${defs}</defs>${grid}${bars}${labels}</svg>`;
  }

  return { build, fmtNum };
})();
