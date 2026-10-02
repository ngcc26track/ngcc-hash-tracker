/* 性能图：对数刻度横向条形图与单值标尺。颜色取自 CSS 变量，深浅色模式共用。 */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = v => v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  /* 基线按名称取颜色与线型（颜色在 CSS 中定义，深浅色各一套；线型作为不依赖颜色的第二编码） */
  const blc = n => 'bl-' + String(n).toLowerCase().replace(/[^a-z0-9]/g, '');
  function domain(vals) {
    const lo = Math.min(...vals) * 0.85, hi = Math.max(...vals) * 1.05;
    const nice = (v, up) => { const e = Math.floor(Math.log10(v)); const ms = up ? [1, 2, 5, 10] : [10, 5, 2, 1];
      for (const m of ms) { const c = m * Math.pow(10, e); if (up ? c >= v : c <= v) return c; } return Math.pow(10, e + (up ? 1 : 0)); };
    return [nice(lo, false), nice(hi, true)];
  }
  function ticks([a, b]) {
    const t = [];
    for (let e = Math.round(Math.log10(a)); e <= Math.round(Math.log10(b)); e++)
      [1, 2, 5].forEach(m => { const v = m * Math.pow(10, e); if (v >= a * 0.999 && v <= b * 1.001) t.push(v); });
    return t;
  }

  /* rows: [{id,name,value,sub}] 已排序；baselines: [{name,value}] */
  function bars(rows, opts = {}) {
    const W = Math.max(640, Math.round(opts.width || 900)), L = 112, R = 90, rowH = 22, barH = 12;
    const base = (opts.baselines || []).filter(b => b.value != null);
    const vals = rows.map(r => r.value).concat(base.map(b => b.value));
    const dom = domain(vals);
    const x = v => L + (Math.log10(v) - Math.log10(dom[0])) / (Math.log10(dom[1]) - Math.log10(dom[0])) * (W - L - R);
    // 基线标签贪心分行，避免重叠
    const placed = [], rowsEnd = [];
    base.slice().sort((p, q) => p.value - q.value).forEach(b => {
      const text = `${b.name} ${fmt(b.value)}`, w = text.length * 6.8 + 22, bx = x(b.value);
      let r = 0; while (rowsEnd[r] != null && rowsEnd[r] > bx - w / 2 - 6) r++;
      rowsEnd[r] = bx + w / 2; placed.push({ text, bx, r, w, cls: blc(b.name) });
    });
    const top = base.length ? 28 + rowsEnd.length * 18 : 24;
    const H = top + rows.length * rowH + 34;
    const hl = opts.highlight || null;
    let s = `<svg class="bar-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || '')}">`;
    // 网格与刻度
    ticks(dom).forEach(t => {
      s += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${H - 28}"/>`;
      s += `<text class="tick" x="${x(t)}" y="${H - 12}" text-anchor="middle">${t >= 1 ? t : t.toString()}</text>`;
    });
    // 基线：标签分两行错开
    placed.forEach(({ text, bx, r, w, cls }) => {
      const ly = 16 + r * 18, lx = bx - w / 2;
      s += `<g class="bl ${cls}"><line class="baseline" x1="${bx}" x2="${bx}" y1="${ly + 5}" y2="${H - 28}"/>`;
      s += `<line class="bl-key" x1="${lx}" x2="${lx + 14}" y1="${ly - 4}" y2="${ly - 4}"/>`;
      s += `<text class="base-label" x="${lx + 19}" y="${ly}">${esc(text)}</text></g>`;
    });
    rows.forEach((r, i) => {
      const y = top + i * rowH, w = Math.max(2, x(r.value) - L);
      const on = !hl || hl === r.id;
      s += `<g class="bar-row${on ? '' : ' dim'}${hl === r.id ? ' hl' : ''}${r.fk ? ' fk-' + esc(r.fk) : ''}" data-id="${esc(r.id)}" data-tip="${esc(r.tip || '')}" tabindex="0">`;
      s += `<rect class="hit" x="0" y="${y}" width="${W}" height="${rowH}"/>`;
      s += `<text class="bar-name" x="${L - 8}" y="${y + rowH / 2 + 4}" text-anchor="end">${esc(r.name)}</text>`;
      s += `<path class="bar" d="M${L} ${y + (rowH - barH) / 2} h${w - 4} a4 4 0 0 1 4 4 v${barH - 8} a4 4 0 0 1 -4 4 h-${w - 4} z"/>`;
      const vt = fmt(r.value) + (r.flag ? (/^（/.test(r.flag) ? '' : ' ') + r.flag : '');
      s += `<rect class="val-bg" x="${L + w + 3}" y="${y + 4}" width="${[...vt].reduce((n, c) => n + (c.charCodeAt(0) > 0x2e80 ? 11.5 : 6.6), 6)}" height="${rowH - 8}" rx="3"/>`;
      s += `<text class="bar-val" x="${L + w + 6}" y="${y + rowH / 2 + 4}">${fmt(r.value)}${r.flag ? (/^（/.test(r.flag) ? '' : ' ') + esc(r.flag) : ''}</text>`;
      s += '</g>';
    });
    s += `<text class="axis-title" x="${L}" y="${H - 1}">${esc(opts.axis || '')}</text></svg>`;
    return s;
  }

  /* 单值标尺：候选与基线在同一对数轴上的位置 */
  function ruler(value, baselines, label) {
    const W = 520, H = 76, L = 14, R = 14, AY = 46;
    const base = baselines.filter(b => b.value != null);
    const dom = domain(base.map(b => b.value).concat([value]));
    const x = v => L + (Math.log10(v) - Math.log10(dom[0])) / (Math.log10(dom[1]) - Math.log10(dom[0])) * (W - L - R);
    let s = `<svg class="ruler" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label || '')}"><line class="axis" x1="${L}" x2="${W - R}" y1="${AY}" y2="${AY}"/>`;
    const rowsY = [30, 16, 70], ends = [];
    base.slice().sort((p, q) => p.value - q.value).forEach(b => {
      const bx = x(b.value), w = b.name.length * 6.2 + 8;
      let r = 0; while (r < 2 && ends[r] != null && ends[r] > bx - w / 2) r++;
      ends[r] = bx + w / 2;
      const y = rowsY[r];
      s += `<g class="bl ${blc(b.name)}"><line class="baseline" x1="${bx}" x2="${bx}" y1="${y < AY ? y + 3 : AY}" y2="${y < AY ? AY + 6 : y - 10}"/><text class="base-label" x="${bx}" y="${y}" text-anchor="middle">${esc(b.name)}</text></g>`;
    });
    s += `<circle class="mark" cx="${x(value)}" cy="${AY}" r="6"/></svg>`;
    return s;
  }

  /* 悬停提示：一个浮层，内容取自 data-tip */
  function bindTips(root) {
    let tip = document.getElementById('chart-tip');
    if (!tip) { tip = document.createElement('div'); tip.id = 'chart-tip'; tip.className = 'chart-tip'; tip.hidden = true; document.body.appendChild(tip); }
    const show = (g, ev) => {
      tip.textContent = '';
      String(g.dataset.tip || '').split('\n').forEach((line, i) => { const p = document.createElement(i ? 'span' : 'strong'); p.textContent = line; tip.appendChild(p); });
      tip.hidden = false;
      const rc = g.getBoundingClientRect();
      const px = ev && ev.clientX ? ev.clientX : rc.left + rc.width / 2;
      tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 12, px + 14) + 'px';
      tip.style.top = (rc.top + window.scrollY - tip.offsetHeight - 6) + 'px';
    };
    root.querySelectorAll('.bar-row').forEach(g => {
      g.addEventListener('pointermove', ev => show(g, ev));
      g.addEventListener('focus', () => show(g));
      g.addEventListener('pointerleave', () => { tip.hidden = true; });
      g.addEventListener('blur', () => { tip.hidden = true; });
    });
  }
  window.PerfChart = { bars, ruler, bindTips, fmt };
})();
