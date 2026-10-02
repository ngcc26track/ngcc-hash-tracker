/* 声明式状态图引擎
 * 算法只声明「状态几何」与「每步的算子」，本文件负责把前后两个状态和数据流画出来。
 * 所有样式内联在 SVG 里，不依赖外部 CSS。
 */
(function (global) {
  "use strict";

  var W = 1040;

  /* 界面语言：'zh'（默认）或 'en'；只影响引擎内置的默认文字，算法数据自带语言 */
  var LANG = 'zh';
  function L(zh, en) { return LANG === 'en' ? en : zh; }
  // 英文复数：只处理末尾是普通英文单词的单位名（"lane" → "lanes"，"32-bit word" → "32-bit words"）
  function plural(n, word) {
    word = String(word);
    if (Number(n) === 1) return word;
    var m = /^(.*?)([A-Za-z]{2,})$/.exec(word);
    if (!m || (m[1] && !/[\s-]$/.test(m[1]))) return word;
    var w = m[2];
    if (/(s|x|sh|ch)$/i.test(w)) w += 'es';
    else if (/[^aeiou]y$/i.test(w)) w = w.slice(0, -1) + 'ies';
    else w += 's';
    return m[1] + w;
  }
  function SEP() { return L('　·　', ' · '); }
  function panelTitleW(t) { return textWidth(t) + String(t).length * 0.48; }
  function IN_TITLE() { return L('X · 本步输入', 'X · step input'); }
  function OUT_TITLE() { return L('Y · 本步输出', 'Y · step output'); }

  var STYLE = [
    '.d-bg{fill:#ffffff}',
    '.d-title{font:700 20px "Segoe UI",system-ui,sans-serif;fill:#0f172a}',
    '.d-sub{font:400 13px "Segoe UI",system-ui,sans-serif;fill:#64748b}',
    '.d-panel-label{font:600 12px "Segoe UI",system-ui,sans-serif;fill:#475569;letter-spacing:.04em}',
    '.d-axis{font:500 11px "Segoe UI",system-ui,sans-serif;fill:#64748b}',
    '.d-cap{font:500 12px "Segoe UI",system-ui,sans-serif;fill:#64748b}',
    '.d-cell{fill:#f1f5f9;stroke:#dbe3ec;stroke-width:1}',
    '.d-cell.dim{fill:#f8fafc;stroke:#e8edf3}',
    '.d-cell.touch{fill:#eaf2fb;stroke:#cbdcef}',
    '.d-cell.warmtouch{fill:#fdf1e2;stroke:#eccfa8}',
    '.d-cell.hot{fill:#cfe4fb;stroke:#3f85d6;stroke-width:2}',
    '.d-cell.hot2{fill:#fbdcb9;stroke:#d98324;stroke-width:2}',
    '.d-cell.hot3{fill:#ded3fb;stroke:#7c5cd6;stroke-width:2}',
    '.d-cell.hot4{fill:#c4ead9;stroke:#199c7c;stroke-width:2}',
    '.d-cell.hot5{fill:#f7d6e3;stroke:#c2497e;stroke-width:2}',
    '.d-ct{font:500 10.5px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#8494a6}',
    '.d-ct.on{fill:#0f172a;font-weight:700}',
    '.d-frame{fill:none;stroke:#e2e8f0;stroke-width:1;stroke-dasharray:4 4}',
    '.d-op{fill:#ffffff;stroke:#cbd5e1;stroke-width:1.4}',
    '.d-op-sym{font:700 22px "Segoe UI",system-ui,sans-serif;fill:#0f172a;text-anchor:middle}',
    '.d-op-cap{font:600 12px "Segoe UI",system-ui,sans-serif;fill:#334155;text-anchor:middle}',
    '.d-op-f{font:500 11px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#475569;text-anchor:middle}',
    '.d-l{text-anchor:start}',
    '.d-arrow{fill:none;stroke:#3f85d6;stroke-width:1.8;marker-end:url(#dArrow)}',
    '.d-arrow.warm{stroke:#d98324;marker-end:url(#dArrowW)}',
    '.d-arrow.violet{stroke:#7c5cd6;marker-end:url(#dArrowV)}',
    '.d-arrow.green{stroke:#199c7c;marker-end:url(#dArrowG)}',
    '.d-arrow.faint{stroke:#bcccdd;stroke-width:1.2;marker-end:url(#dArrowF)}',
    '.d-bracket{fill:none;stroke:#9db6d2;stroke-width:1.4}',
    '.d-chip{fill:#f8fafc;stroke:#cbd5e1;stroke-width:1.2}',
    '.d-chip.on{fill:#eaf3fd;stroke:#3f85d6}',
    '.d-chip.out{fill:#e2f6ef;stroke:#199c7c}',
    '.d-chip-t{font:600 11px ui-monospace,Menlo,monospace;fill:#334155;text-anchor:middle}',
    '.d-note{font:400 12px "Segoe UI",system-ui,sans-serif;fill:#64748b}',
    '.d-node{fill:#f8fafc;stroke:#cbd5e1;stroke-width:1.4}',
    '.d-node.on{fill:#e0edfb;stroke:#3f85d6;stroke-width:2}',
    '.d-node.res{fill:#c4ead9;stroke:#199c7c;stroke-width:2}',
    '.d-node.key{fill:#fdf0dc;stroke:#e0ad6a}',
    '.d-node-t{font:700 13px "Segoe UI",system-ui,sans-serif;fill:#0f172a;text-anchor:middle}',
    '.d-node-s{font:500 10px ui-monospace,Menlo,monospace;fill:#7c8b9d;text-anchor:middle}',
    '.d-cellname{font:700 13px ui-monospace,Menlo,monospace;fill:#0f172a}',
    '.d-cellop{font:500 10px ui-monospace,Menlo,monospace;fill:#475569}',
    '.d-edge{fill:none;stroke:#d5dee8;stroke-width:1.4;marker-end:url(#dArrowF)}',
    '.d-edge.on{stroke:#3f85d6;stroke-width:2;marker-end:url(#dArrow)}',
    '.d-zone{fill:#f8fafc;stroke:#e6ecf3;stroke-width:1}',
    '.d-rail{stroke:#c2d2e4;stroke-width:2.2;fill:none}',
    '.d-zone-t{font:600 12px "Segoe UI",system-ui,sans-serif;fill:#475569;letter-spacing:.03em}'
  ].join('');

  function marker(id, color) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="' + color + '"/></marker>';
  }
  function defs() {
    return '<defs>' + marker('dArrow', '#3f85d6') + marker('dArrowW', '#d98324') +
      marker('dArrowV', '#7c5cd6') + marker('dArrowG', '#199c7c') + marker('dArrowF', '#bcccdd') +
      '<style>' + STYLE + '</style></defs>';
  }
  // 英文公式用连续空格对齐；SVG 会合并空格，英文模式下换成不间断空格（中文输出不变）
  function keepSpaces(t) { return LANG === 'en' ? t.replace(/ {2,}/g, function (m) { return ' ' + new Array(m.length).join('\u00a0'); }) : t; }
  function esc(s) { return keepSpaces(String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')); }

  /* ---------- 网格 ---------- */

  function Grid(o) { for (var k in o) this[k] = o[k]; }
  Grid.prototype.cx = function (c) { return this.x + c * (this.cw + this.gap) + this.cw / 2; };
  Grid.prototype.cy = function (r) { return this.y + r * (this.ch + this.gap) + this.ch / 2; };
  Grid.prototype.left = function (c) { return this.x + c * (this.cw + this.gap); };
  Grid.prototype.top = function (r) { return this.y + r * (this.ch + this.gap); };
  Grid.prototype.right = function () { return this.x + this.w(); };
  Grid.prototype.w = function () { return this.cols * this.cw + (this.cols - 1) * this.gap; };
  Grid.prototype.h = function () { return this.rows * this.ch + (this.rows - 1) * this.gap; };

  function drawGrid(g, fn) {
    var out = '';
    for (var r = 0; r < g.rows; r++) for (var c = 0; c < g.cols; c++) {
      var i = fn(c, r) || {};
      out += '<rect class="d-cell ' + (i.cls || '') + '" x="' + g.left(c) + '" y="' + g.top(r) + '" width="' + g.cw + '" height="' + g.ch + '" rx="5"/>';
      if (i.text && g.cw >= 21 && g.ch >= 16) {
        var tw = textWidth(i.text) * 11 / 12, fit = g.cw - 5;
        var adj = tw > fit ? ' textLength="' + fit.toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
        out += '<text class="d-ct' + (i.textOn ? ' on' : '') + '" x="' + g.cx(c) + '" y="' + (g.cy(r) + 3.5) + '" text-anchor="middle"' + adj + '>' + esc(i.text) + '</text>';
      }
    }
    return out;
  }
  function axes(g, xs, ys, geo, side) {
    var o = '', i;
    var xt = geo && geo.xTicks, yt = geo && geo.yTicks;
    // 轴名超过 3 个字就只在轴末打一次，不逐格重复（否则渲染成一条乱码带）
    var xLong = !xt && String(xs).length > 3, yLong = !yt && String(ys).length > 3;
    var stepX = (!xt && g.cols > 12) ? Math.ceil(g.cols / 8) : 1;
    for (i = 0; i < g.cols; i += stepX) o += '<text class="d-axis" x="' + g.cx(i) + '" y="' + (g.y + g.h() + 16) + '" text-anchor="middle">' + esc(xt ? xt[i] : (xLong ? String(i) : xs + i)) + '</text>';
    if (xLong) o += '<text class="d-axis" x="' + (g.x + g.w() / 2) + '" y="' + (g.y + g.h() + 31) + '" text-anchor="middle">' + esc(xs) + '</text>';
    var right = side === 'right';
    var tx = right ? (g.x + g.w() + 9) : (g.x - 9), anc = right ? 'start' : 'end';
    var stepY = (!yt && g.rows > 12) ? Math.ceil(g.rows / 8) : 1;
    for (i = 0; i < g.rows; i += stepY) o += '<text class="d-axis" x="' + tx + '" y="' + (g.cy(i) + 3.5) + '" text-anchor="' + anc + '">' + esc(yt ? yt[i] : (yLong ? String(i) : ys + i)) + '</text>';
    if (yLong) o += '<text class="d-axis" x="' + tx + '" y="' + (g.y - 12) + '" text-anchor="' + anc + '">' + esc(ys) + '</text>';
    return o;
  }
  // 格内固定名称（如 A0 / B1），由 geo.cellNames 提供
  function nameOf(geo, c, r) {
    return geo.cellNames ? geo.cellNames[r * geo.cols + c] : null;
  }
  // 未参与的格子也显示名字（淡色），避免"这页有名字那页没有"
  function bgName(geo, c, r) { return nameOf(geo, c, r) || ''; }
  function panel(label, g) {
    return '<rect class="d-frame" x="' + (g.x - 30) + '" y="' + (g.y - 30) + '" width="' + (g.w() + 48) + '" height="' + (g.h() + 60) + '" rx="12"/>' +
      '<text class="d-panel-label" x="' + (g.x - 30) + '" y="' + (g.y - 40) + '">' + label + '</text>';
  }
  function textWidth(t) {
    var n = 0;
    for (var i = 0; i < String(t).length; i++) n += String(t).charCodeAt(i) > 0x2e80 ? 1 : 0.56;
    return n * 12;
  }
  function wrap(t, maxPx) {
    var out = [], cur = '';
    t = String(t || '');
    for (var i = 0; i < t.length; i++) {
      if (LANG === 'en' && cur === '' && out.length && t[i] === ' ') continue;   // 英文续行不以空格开头
      cur += t[i];
      if (textWidth(cur) > maxPx) {
        var cut = Math.max(1, cur.length - 1);
        for (var j = cur.length - 1; j > cur.length - 22 && j > 0; j--) {
          if (' ⊕⊞∧∨→←'.indexOf(cur[j]) >= 0) { cut = j; break; }
          if ('，。；：、,. )]）」'.indexOf(cur[j]) >= 0) { cut = j + 1; break; }
        }
        out.push(cur.slice(0, cut)); cur = cur.slice(cut);
        if (LANG === 'en') cur = cur.replace(/^ +/, '');
      }
    }
    if (cur) out.push(cur);
    return out;
  }
  function fitText(cls, x, y, maxW, t, extra) {
    var px = /d-op-sym/.test(cls) ? 22 : (/d-cellname|d-sub/.test(cls) ? 13 :
             (/d-op-cap|d-note|d-cap/.test(cls) ? 12 : (/d-op-f|d-chip-t|d-axis/.test(cls) ? 11 :
             (/d-cellop/.test(cls) ? 10 : 10.5))));
    var w = textWidth(t) * px / 12;
    var adj = (maxW && w > maxW) ? ' textLength="' + maxW.toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<text class="' + cls + '" x="' + x + '" y="' + y + '"' + (extra || '') + adj + '>' + esc(t) + '</text>';
  }

  function opBox(cx, cy, sym, cap, formula) {
    var MAXW = 260;
    var raw = (formula || '').split('\n').filter(function (l) { return l !== ''; });
    var capW = Math.min(MAXW, textWidth(cap || '') + 26);
    var want = capW;
    raw.forEach(function (l) { want = Math.max(want, Math.min(MAXW, textWidth(l) * 11 / 12 + 26)); });
    var bw = Math.max(176, want);
    var lines = [];
    raw.forEach(function (l) {
      var parts = wrap(l, (bw - 22) * 12 / 11);
      (parts.length ? parts : ['']).forEach(function (p) { lines.push(p); });
    });
    var capLines = wrap(cap || '', bw - 20);
    var h = 40 + capLines.length * 17 + lines.length * 15;
    var o = '<rect class="d-op" x="' + (cx - bw / 2) + '" y="' + (cy - h / 2) + '" width="' + bw + '" height="' + h + '" rx="14"/>';
    o += '<text class="d-op-sym" x="' + cx + '" y="' + (cy - h / 2 + 26) + '">' + esc(sym) + '</text>';
    capLines.forEach(function (l, i) {
      o += fitText('d-op-cap', cx, cy - h / 2 + 44 + i * 16, bw - 18, l);
    });
    lines.forEach(function (l, i) {
      o += fitText('d-op-f', cx, cy - h / 2 + 46 + capLines.length * 16 + i * 15, bw - 16, l);
    });
    return { svg: o, top: cy - h / 2, bottom: cy + h / 2, hw: bw / 2 };
  }

  function zone(x, y, w, h, title, lines) {
    var flat = [];
    (lines || []).forEach(function (l) { if (l) wrap(l, w - 40).forEach(function (p) { flat.push(p); }); });
    var need = 46 + flat.length * 21;
    if (need > h) h = need;
    var o = '<rect class="d-zone" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12"/>';
    o += '<text class="d-zone-t" x="' + (x + 18) + '" y="' + (y + 22) + '">' + esc(title) + '</text>';
    flat.forEach(function (l, i) { o += '<text class="d-note" x="' + (x + 18) + '" y="' + (y + 46 + i * 21) + '">' + esc(l) + '</text>'; });
    return { svg: o, h: h };
  }
  function zoneSvg() { return zone.apply(null, arguments).svg; }
  function bits(x, y, w, n, marks, label, showIndices) {
    var cw = w / n, o = '<text class="d-axis" x="' + x + '" y="' + (y - 7) + '">' + esc(label) + '</text>';
    for (var i = 0; i < n; i++) {
      o += '<rect x="' + (x + i * cw) + '" y="' + y + '" width="' + (cw - 0.6) + '" height="16" fill="' + (marks.indexOf(i) >= 0 ? '#3f85d6' : '#eef2f7') + '" stroke="#dbe3ec" stroke-width=".6"/>';
      if (showIndices && (i % 8 === 0 || i === n - 1)) o += '<text class="d-axis" x="' + (x + i * cw + cw / 2) + '" y="' + (y + 29) + '" text-anchor="middle">' + i + '</text>';
    }
    return o;
  }

  /* ---------- lattice ---------- */

  var HOT = ['hot', 'hot2', 'hot3', 'hot4'];
  var AC = ['', 'warm', 'violet', 'green'];

  function build(geo) {
    var cols = geo.cols, rows = geo.rows;
    var gap = cols > 12 || rows > 10 ? 3 : (cols <= 4 && rows <= 4 ? 10 : 5);
    var cw = Math.min(cols <= 4 ? 84 : 40, (cols > 12 ? 420 : 320) / cols);
    var ch = Math.min(rows <= 3 ? 74 : 36, (rows > 10 ? 330 : 250) / rows);
    // 两块面板之间必须留得下中间的算子框（最小 176 + 两侧各 20）
    var MIDGAP = 296, SIDE = 76, PANELPAD = 48;
    var avail = W - 2 * SIDE - 2 * (PANELPAD - 30) - MIDGAP;
    for (var guard = 0; guard < 60; guard++) {
      var wNow = cols * cw + (cols - 1) * gap;
      if (2 * wNow <= avail) break;
      if (cw > 12) cw -= 2;
      else if (gap > 1) gap -= 1;
      else if (cw > 6) cw -= 1;
      else break;
    }
    var gy = 134 + Math.max(0, wrap(geo.subtitle || '', W - 76).length - 1) * 17;
    var L = new Grid({ x: 76, y: gy, rows: rows, cols: cols, cw: cw, ch: ch, gap: gap });
    // 右面板的行标画在它右侧，先给刻度留出净空
    var gut = 0;
    (geo.yTicks || []).forEach(function (t) { gut = Math.max(gut, textWidth(t) * 11 / 12); });
    if (!geo.yTicks) gut = textWidth('y' + (rows - 1)) * 11 / 12;
    gut = Math.min(120, gut);
    var R = new Grid({ x: W - 30 - gut - (cols * cw + (cols - 1) * gap), y: gy, rows: rows, cols: cols, cw: cw, ch: ch, gap: gap });
    var bottom = gy + L.h();
    return { L: L, R: R, mid: (L.right() + R.x) / 2, cy: gy + L.h() / 2, bottom: bottom };
  }

  function shell(geo, S, zoneH, zoneLines, zoneTitle) {
    if (zoneLines) {
      var probe = zone(34, 0, W - 68, zoneH || 0, zoneTitle || '', zoneLines);
      zoneH = probe.h;
    }
    var H = S.bottom + 86 + (zoneH || 0) + 26;
    var subLines = wrap(geo.subtitle || '', W - 76);
    var subSvg = '';
    subLines.forEach(function (t, k) { subSvg += '<text class="d-sub" x="34" y="' + (58 + k * 17) + '">' + esc(t) + '</text>'; });
    return {
      H: H,
      head: '<rect class="d-bg" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
        '<text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>' + subSvg +
        panel(IN_TITLE(), S.L) + panel(OUT_TITLE(), S.R) +
        axes(S.L, geo.xLabel || 'x', geo.yLabel || 'y', geo) + axes(S.R, geo.xLabel || 'x', geo.yLabel || 'y', geo, 'right'),
      zoneY: S.bottom + 86
    };
  }
  function caps(S, l, r) {
    var o = '', lx = S.L.x - 30, rx = S.R.x - 30;
    // 英文通常更长：放不下两行时改成三行、行距略收，仍落在说明区之上（中文保持两行）
    function put(t, x, w) {
      var ls = wrap(t || '', w), three = LANG === 'en' && ls.length > 2;
      ls.slice(0, three ? 3 : 2).forEach(function (q, k) {
        o += '<text class="d-cap" x="' + x + '" y="' + (S.bottom + (three ? 46 + k * 14 : 48 + k * 16)) + '">' + esc(q) + '</text>';
      });
    }
    put(l, lx, Math.max(160, S.mid - lx - 110));
    put(r, rx, Math.max(160, W - rx - 34));
    return o;
  }


  function ringSvg(g, axis, idx) {
    var x, y, w, h;
    if (axis === 'column') { x = g.left(idx) - 3; y = g.y - 3; w = g.cw + 6; h = g.h() + 6; }
    else if (axis === 'row') { x = g.x - 3; y = g.top(idx) - 3; w = g.w() + 6; h = g.ch + 6; }
    else { x = g.x - 3; y = g.y - 3; w = g.w() + 6; h = g.h() + 6; }
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" fill="none" stroke="#7c5cd6" stroke-width="1.6" stroke-dasharray="4 3"/>';
  }
  function bandsSvg(geo, g) {
    if (!geo.bands) return '';
    var o = '';
    geo.bands.forEach(function (bd, bi) {
      var x1 = g.left(bd.from[0]), y1 = g.top(bd.from[1]);
      var x2 = g.left(bd.to[0]) + g.cw, y2 = g.top(bd.to[1]) + g.ch;
      var col = bd.color || '#c3d2e2';
      var fullW = bd.from[0] === 0 && bd.to[0] === geo.cols - 1;
      var fullH = bd.from[1] === 0 && bd.to[1] === geo.rows - 1;
      if (fullW && !fullH) {                       // 整行段：左侧一条竖量度线
        var mx = g.x - 4 - (bi % 2) * 7;
        o += '<path d="M' + (mx + 4) + ' ' + y1 + ' h -4 V ' + y2 + ' h 4" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
      } else if (fullH && !fullW) {                // 整列段：上方一条横量度线
        var my = g.y - 6 - (bi % 2) * 7;
        o += '<path d="M' + x1 + ' ' + (my + 4) + ' V ' + my + ' H ' + x2 + ' v 4" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
      } else {
        o += '<rect x="' + (x1 - 4) + '" y="' + (y1 - 4) + '" width="' + (x2 - x1 + 8) + '" height="' + (y2 - y1 + 8) + '" rx="6" fill="none" stroke="' + col + '" stroke-width="1.6"/>';
      }
    });
    // 分组名放进面板抬头的图例行，避免压住格子
    var x00 = g.x - 30 + (LANG === 'en' ? 122 : 96), lx = x00, ly = g.y - 40;
    var lim = Math.min(W - 40, g.x + g.w() + 30);
    geo.bands.forEach(function (bd) {
      var t = String(bd.label), tw;
      if (LANG === 'en') {
        // 英文图例较长：放不下时另起一行（上方各行不必让出面板标题，从面板左缘起排），仍放不下才按宽度截断
        var x0u = g.x - 30;
        tw = 22 + textWidth(t) * 11 / 12;
        if (lx + tw > lim && (lx > x0u || ly === g.y - 40) && !(lx === x0u && ly < g.y - 40)) { lx = x0u; ly -= 14; }
        while (t.length > 2 && lx + 22 + textWidth(t) * 11 / 12 > lim) t = t.slice(0, -2) + '…';
        tw = 22 + textWidth(t) * 11 / 12;
      } else {
      if (t.length > 24) t = t.slice(0, 23) + '…';
      tw = 22 + textWidth(t) * 11 / 12;
      if (lx > x00 && lx + tw > lim) { lx = x00; ly -= 14; }
      }
      o += '<rect x="' + lx + '" y="' + (ly - 7) + '" width="8" height="8" rx="2" fill="none" stroke="' + (bd.color || '#94a3b8') + '" stroke-width="1.2" stroke-dasharray="2 2"/>';
      o += '<text class="d-axis" x="' + (lx + 12) + '" y="' + ly + '" fill="' + (bd.color || '#94a3b8') + '">' + esc(t) + '</text>';
      lx += tw;
    });
    return o;
  }

  // 选择器：哪些格子参与本步
  function selector(geo, op) {
    var axis = op.axis || 'all', idx = op.index != null ? op.index : 0;
    var n = geo.rows;
    if (axis === 'row') return { test: function (c, r) { return r === idx; }, n: geo.cols, unit: L('行', 'row'), parallel: geo.rows };
    if (axis === 'column') return { test: function (c, r) { return c === idx; }, n: geo.rows, unit: L('列', 'column'), parallel: geo.cols };
    if (axis === 'diag') return { test: function (c, r) { return ((c - r) % n + n) % n === idx; }, n: Math.min(geo.rows, geo.cols), unit: L('对角线', 'diagonal'), parallel: n };
    if (axis === 'cells') return { test: function (c, r) { return (op.cells || []).some(function (p) { return p[0] === c && p[1] === r; }); }, n: (op.cells || []).length, unit: L('组', 'group'), parallel: 1 };
    return { test: function () { return true; }, n: geo.rows * geo.cols, unit: L('全状态', 'full state'), parallel: 1 };
  }

  function opConst(geo, S, op) {
    var at = op.at || (op.cells && op.cells.length === 1 ? op.cells[0] : null);
    var sel = at ? { test: function (c, r) { return c === at[0] && r === at[1]; }, n: 1 } : selector(geo, op);
    var single = sel.n === 1;
    var unit = geo.unitName || 'lane';
    var split = op.laneSplit;
    var sym = op.injSym || '⊕ RC';          // 注入的是什么（轮常数 / 消息字 / 轮密钥 / tweak）
    var symShort = op.injShort || (op.injSym ? op.injSym.replace(/\s+/g, '') : 'RC');
    var hasBits = Array.isArray(op.bits);   // 没有给出真实比特位置时不画比特带，避免凭空生成图案
    var bitIndexSpace = hasBits && op.bitIndexOrder ? 18 : 0;
    var nBits = op.unitBits || geo.unitBits || 64;
    var zl = wrap(op.note || '', W - 100);
    var sl = split ? wrap(split.note || '', W - 100) : [];
    var zh = split ? (92 + sl.length * 21) : ((hasBits ? 78 + bitIndexSpace : 30) + zl.length * 21);
    var sh = shell(geo, S, zh);
    var b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) {
      var on = sel.test(c, r), nm = nameOf(geo, c, r);
      return { cls: on ? 'hot' : 'dim', text: nm || '', textOn: on };
    });
    b += drawGrid(S.R, function (c, r) {
      var on = sel.test(c, r), nm = nameOf(geo, c, r);
      return { cls: on ? 'hot2' : 'dim', text: nm ? (on ? nm + ' ' + sym : nm) : (on && single ? sym : ''), textOn: on };
    });
    var ob = opBox(S.mid, S.cy, op.replace ? '←' : '⊕', op.cap || L('只改一' + (geo.unitName ? '个' + unit : '条 lane'), 'touches one ' + unit + ' only'), op.formula);
    b += ob.svg;
    var HW = ob.hw + 6;
    var aX = at ? at[0] : 0, aY = at ? at[1] : Math.floor(geo.rows / 2);
    b += '<path class="d-arrow" d="M' + (S.L.right() + 10) + ' ' + S.L.cy(aY) + ' C ' + (S.mid - 150) + ' ' + S.L.cy(aY) + ', ' + (S.mid - 140) + ' ' + S.cy + ', ' + (S.mid - HW) + ' ' + S.cy + '"/>';
    b += '<path class="d-arrow warm" d="M' + (S.mid + HW) + ' ' + S.cy + ' C ' + (S.mid + 140) + ' ' + S.cy + ', ' + (S.mid + 150) + ' ' + S.R.cy(aY) + ', ' + (S.R.x - 10) + ' ' + S.R.cy(aY) + '"/>';
    var who = single ? (nameOf(geo, aX, aY) ? L('只有 ' + nameOf(geo, aX, aY) + ' 参与', 'only ' + nameOf(geo, aX, aY) + ' is involved') : L('只有 (' + aX + ',' + aY + ') 这一条 lane 参与', 'only lane (' + aX + ',' + aY + ') is involved'))
                     : (op.selCap || L('参与的' + unit + '：' + sel.n + ' 个', sel.n + ' ' + plural(sel.n, unit) + ' involved'));
    var rest = geo.rows * geo.cols - sel.n;
    b += caps(S, who, op.passNote || (rest > 0 ? L('其余 ' + rest + ' 个 ' + unit + ' 原样通过', 'other ' + rest + ' ' + plural(rest, unit) + ' pass through unchanged') : L('全部 ' + sel.n + ' 个' + unit + '都被注入', 'all ' + sel.n + ' ' + plural(sel.n, unit) + ' receive the injection')));
    if (split) {
      b += '<rect class="d-zone" x="34" y="' + sh.zoneY + '" width="' + (W - 68) + '" height="' + zh + '" rx="12"/>';
      b += '<text class="d-zone-t" x="52" y="' + (sh.zoneY + 22) + '">' + esc(op.splitTitle || L((nameOf(geo, aX, aY) || '目标') + ' 内部的 ' + split.n + ' 条 lane', 'The ' + split.n + ' lanes inside ' + (nameOf(geo, aX, aY) || 'the target'))) + '</text>';
      sl.forEach(function (t, k) { b += '<text class="d-note" x="52" y="' + (sh.zoneY + 100 + k * 21) + '">' + esc(t) + '</text>'; });
      var bw3 = Math.min(190, (W - 140) / split.n), x3 = 56, y3 = sh.zoneY + 36;
      for (var k = 0; k < split.n; k++) {
        b += '<rect class="d-cell hot2" x="' + (x3 + k * (bw3 + 14)) + '" y="' + y3 + '" width="' + bw3 + '" height="40" rx="8"/>';
        b += '<text class="d-cellname" x="' + (x3 + k * (bw3 + 14) + bw3 / 2) + '" y="' + (y3 + 17) + '" text-anchor="middle">lane ' + k + '</text>';
        b += '<text class="d-cellop" x="' + (x3 + k * (bw3 + 14) + bw3 / 2) + '" y="' + (y3 + 32) + '" text-anchor="middle">⊕ ' + esc((split.labels && split.labels[k]) || split.label || 'RC') + '</text>';
      }
    } else {
      var title = op.injTitle || (hasBits ? L('注入值落在哪些比特上', 'Bits hit by the injected value') : L('这一步注入了什么', 'What this step injects'));
      b += '<rect class="d-zone" x="34" y="' + sh.zoneY + '" width="' + (W - 68) + '" height="' + zh + '" rx="12"/>';
      b += '<text class="d-zone-t" x="52" y="' + (sh.zoneY + 22) + '">' + esc(title) + '</text>';
      var ty = sh.zoneY + 44;
      if (hasBits) {
        b += bits(52, sh.zoneY + 48, Math.min(760, nBits * 11), nBits, op.bits,
          (single ? L((nameOf(geo, aX, aY) || ('lane (' + aX + ',' + aY + ')')) + ' 的 ' + nBits + ' 个比特', 'the ' + nBits + ' bits of ' + (nameOf(geo, aX, aY) || ('lane (' + aX + ',' + aY + ')'))) : L('一条参与' + unit + '的 ' + nBits + ' 个比特', 'the ' + nBits + ' bits of one involved ' + unit)) + (op.bitIndexOrder === 'lsb-first' ? L(' · 左端 bit 0 为最低位', ' · bit 0 (left end) is the LSB') : ''), !!op.bitIndexOrder);
        ty = sh.zoneY + 88 + bitIndexSpace;
      }
      zl.forEach(function (t, k) { b += '<text class="d-note" x="52" y="' + (ty + k * 21) + '">' + esc(t) + '</text>'; });
    }
    return { H: sh.H, body: b };
  }

  function opLaneRotate(geo, S, op) {
    var amt = op.amounts || null, lab = op.amountLabel || 'τ';
    var sc = op.sample ? op.sample[0] : 2, sr = op.sample ? op.sample[1] : 1;
    var wbits = op.unitBits || geo.unitBits || 64;
    var left = op.dir === 'left', k = amt ? ((amt(sc, sr) % wbits) + wbits) % wbits : null;
    var pos = [0, 1, wbits - 1];
    var lines = [amt ? L('整数位编号：bit 0 为最低位；循环' + (left ? '左' : '右') + '移 ' + k + ' 位，宽度 ' + wbits + ' 位。', 'Integer bit numbering, bit 0 is the LSB; rotate ' + (left ? 'left' : 'right') + ' by ' + k + ' ' + plural(k, 'bit') + ', width ' + wbits + ' bits.') : L('每个单元按参数 ' + lab + ' 旋转，实际宽度 ' + wbits + ' 位。', 'Each unit is rotated by ' + lab + '; actual width ' + wbits + ' bits.')];
    if (amt) lines.push(L('示例位去向：', 'Example bit mapping: ') + pos.map(function (v) { return 'bit ' + v + ' → bit ' + ((v + (left ? k : -k) + wbits) % wbits); }).join(SEP()));
    if (op.crossNote) lines.push(op.crossNote);
    lines.push(op.note || L('单元坐标不变；只有单元内部的比特位置改变。', 'Unit coordinates are unchanged; only bit positions inside each unit move.'));
    var sh = shell(geo, S, 118, lines), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) { var on = c === sc && r === sr; return { cls: on ? 'hot' : 'touch', text: amt ? String(amt(c, r)) : (on ? lab : bgName(geo, c, r)), textOn: on }; });
    b += drawGrid(S.R, function (c, r) { var on = c === sc && r === sr; return { cls: on ? 'hot2' : 'warmtouch', text: on ? (left ? '↶' : '↷') : bgName(geo, c, r), textOn: on }; });
    var ob = opBox(S.mid, S.cy, left ? '↶' : '↷', op.cap || L('单元内循环移位', 'in-unit rotation'), op.formula);
    b += ob.svg;
    b += '<path class="d-arrow faint" d="M' + (S.L.right() + 16) + ' ' + S.cy + ' H ' + (S.mid - ob.hw - 8) + '"/>';
    b += '<path class="d-arrow faint" d="M' + (S.mid + ob.hw + 8) + ' ' + S.cy + ' H ' + (S.R.x - 14) + '"/>';
    b += caps(S, op.inCap || (amt ? L('格内数字 = 该单元的旋转位数', 'number in cell = rotation amount of that unit') : L('高亮为示例单元', 'highlighted: sample unit')), op.depNote || L('单元位置保持不变，按实际字宽循环旋转', 'units stay in place, each rotated within its actual word width'));
    b += zoneSvg(34, sh.zoneY, W - 68, 118, L('示例：' + (nameOf(geo, sc, sr) || '(' + sc + ',' + sr + ')') + ' 的真实位编号映射', 'Example: actual bit-index mapping of ' + (nameOf(geo, sc, sr) || '(' + sc + ',' + sr + ')')), lines);
    return { H: sh.H, body: b };
  }

  function opLaneShift(geo, S, op) {
    var axis = op.axis || 'row', known = !!op.amount;
    var amount = op.amount || function () { return 0; };
    var right = op.dir === 'right';          // 默认按"左移 k 格"渲染
    var total = axis === 'row' ? geo.rows : geo.cols;
    var n = axis === 'row' ? geo.cols : geo.rows;
    var sample = op.sample != null ? op.sample : Math.min(2, total - 1);
    var direction = axis === 'column' ? (right ? L('下', 'down') : L('上', 'up')) : (right ? L('右', 'right') : L('左', 'left'));
    var list = [];
    for (var i = 0; known && i < total; i++) list.push(L((axis === 'row' ? '行' : '列') + i + ' ' + direction + '移 ' + amount(i) + ' 格' + (op.rot ? '，内部旋转 ' + op.rot(i) + ' 位' : ''), (axis === 'row' ? 'row ' : 'column ') + i + ': ' + direction + ' ' + amount(i) + (op.rot ? ', rotate ' + op.rot(i) + ' ' + plural(op.rot(i), 'bit') : '')));
    var zlines = known ? [list.slice(0, Math.ceil(total / 2)).join(SEP()), list.slice(Math.ceil(total / 2)).join(SEP()), op.note || ''] : [op.note || ''];
    var sh = shell(geo, S, op.rot ? 118 : 96, zlines), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) {
      var idx = axis === 'row' ? r : c, pos = axis === 'row' ? c : r;
      return idx === sample ? { cls: HOT[pos % 4], text: String(pos), textOn: true } : { cls: 'dim', text: bgName(geo, c, r) };
    });
    b += drawGrid(S.R, function (c, r) {
      var idx = axis === 'row' ? r : c, pos = axis === 'row' ? c : r;
      if (idx !== sample) return { cls: 'dim', text: bgName(geo, c, r) };
      if (!known) return { cls: 'warmtouch', text: '', textOn: false };
      var src = ((right ? pos - amount(idx) : pos + amount(idx)) % n + n) % n;
      return { cls: HOT[src % 4], text: String(src), textOn: true };
    });
    var ob = opBox(S.mid, S.cy, '⇄', op.cap || L('整' + (axis === 'row' ? '行' : '列') + '循环移动', 'cyclic ' + (axis === 'row' ? 'row' : 'column') + ' shift'), op.formula);
    b += ob.svg;
    var k = amount(sample), apex = ob.top - 26;
    for (var p = 0; known && p < Math.min(n, 4); p++) {
      var dst = ((right ? p + k : p - k) % n + n) % n;
      var x1 = axis === 'row' ? S.L.cx(p) : S.L.cx(sample), y1 = axis === 'row' ? S.L.cy(sample) : S.L.cy(p);
      var x2 = axis === 'row' ? S.R.cx(dst) : S.R.cx(sample), y2 = axis === 'row' ? S.R.cy(sample) : S.R.cy(dst);
      var cyy = apex - p * 13;
      b += '<path class="d-arrow ' + AC[p % 4] + '" d="M' + x1 + ' ' + (y1 - S.L.ch / 2 - 3) + ' C ' + (x1 + 40) + ' ' + cyy + ', ' + (x2 - 40) + ' ' + cyy + ', ' + x2 + ' ' + (y2 - S.R.ch / 2 - 5) + '" opacity=".9"/>';
    }
    var UN = op.unitName || (axis === 'row' ? L('行', 'row') : L('列', 'column'));
    b += caps(S, L('高亮第 ' + sample + ' ' + UN + '，数字是' + UN + '内位置', 'highlighted: ' + UN + ' ' + sample + '; numbers are positions within it'),
      known ? L('数字 = 这个位置的单元来自哪里', 'number = where the unit at this position comes from') : L('具体移位量见文档，此处只画出参与的' + UN, 'shift amounts are in the document; only the involved ' + UN + ' is drawn'));
    b += zoneSvg(34, sh.zoneY, W - 68, op.rot ? 118 : 96,
      known ? L('全部' + UN + '的移动量（' + direction + '移）', 'Shift amount of every ' + UN + ' (' + direction + ')') : L('移位量', 'Shift amounts'), zlines);
    return { H: sh.H, body: b };
  }

  function opPermute(geo, S, op) {
    var map = op.map, samples = op.samples || [[1, 0], [0, 2], [3, 1], [2, 4]];
    var dest = samples.map(function (s) { return map(s[0], s[1]); });
    var sourceAt = {};
    if (op.labelAllSources) for (var rr = 0; rr < geo.rows; rr++) for (var cc = 0; cc < geo.cols; cc++) { var dd = map(cc, rr); sourceAt[dd[0] + ',' + dd[1]] = [cc, rr]; }
    var sh = shell(geo, S, 96, [op.note || '']), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) {
      for (var i = 0; i < samples.length; i++) if ((op.wholeRows || samples[i][0] === c) && samples[i][1] === r) return { cls: HOT[i], text: nameOf(geo, c, r) || (c + ',' + r), textOn: true };
      return { cls: 'dim', text: bgName(geo, c, r) };
    });
    b += drawGrid(S.R, function (c, r) {
      for (var i = 0; i < dest.length; i++) if ((op.wholeRows || dest[i][0] === c) && dest[i][1] === r) return { cls: HOT[i], text: nameOf(geo, op.wholeRows ? c : samples[i][0], samples[i][1]) || (samples[i][0] + ',' + samples[i][1]), textOn: true };
      var src = sourceAt[c + ',' + r];
      return { cls: 'dim', text: src ? nameOf(geo, src[0], src[1]) : bgName(geo, c, r) };
    });
    var ob = opBox(S.mid, S.cy, '⇢', op.cap || L('lane 坐标重排', 'lane coordinate permutation'), op.formula);
    // 示例箭头画在算子盒之下，并从盒子上方越过，避免穿过盒内文字
    var gridTop = Math.min(S.L.top(0), S.R.top(0));
    samples.forEach(function (s, i) {
      var x1 = S.L.cx(s[0]), y1 = S.L.cy(s[1]), x2 = S.R.cx(dest[i][0]), y2 = S.R.cy(dest[i][1]);
      var cyy = Math.min(ob.top - 24, gridTop - 6) - i * 14;
      b += '<path class="d-arrow ' + AC[i % 4] + '" d="M' + x1 + ' ' + (y1 - S.L.ch / 2 - 3) + ' C ' + (x1 + 50) + ' ' + cyy + ', ' + (x2 - 50) + ' ' + cyy + ', ' + x2 + ' ' + (y2 - S.R.ch / 2 - 5) + '" opacity=".85"/>';
    });
    b += ob.svg;
    b += caps(S, op.inCap || L('四条示例的原坐标', 'original coordinates of four samples'), op.depNote || L('格内标注 = 这个位置原来的坐标', 'cell label = original coordinates of this position'));
    b += zoneSvg(34, sh.zoneY, W - 68, 96, op.wholeRows ? L('四条示例行的去向（列 j 保持不变）', 'Where four sample rows go (column j unchanged)') : L('四条示例 lane 的去向', 'Where four sample lanes go'), [
      samples.map(function (s, i) { return op.wholeRows ? (L('行 ', 'row ') + s[1] + L(' → 行 ', ' → row ') + dest[i][1]) : ('(' + s[0] + ',' + s[1] + ') → (' + dest[i][0] + ',' + dest[i][1] + ')'); }).join(SEP()),
      op.note || ''
    ]);
    return { H: sh.H, body: b };
  }

  function opSbox(geo, S, op) {
    var axis = op.axis || 'row', idx = op.index != null ? op.index : 1;
    var sel = selector(geo, op), n = op.width || sel.n, par = sel.parallel;
    var noteLines = wrap(op.note || '', W - 130);
    var parallelX = 52 + n * 68 + 82;
    var parallelLines = wrap(op.parallelNote || L('× 64 个 z 切片 × ' + par + ' ' + sel.unit + ' = ' + (64 * par) + ' 个 S 盒 / 轮', '× 64 z-slices × ' + par + ' ' + plural(par, sel.unit) + ' = ' + (64 * par) + ' S-boxes / round'), Math.max(180, W - parallelX - 40));
    var noteY = Math.max(94, 65 + parallelLines.length * 18);
    var zoneH = Math.max(104, noteY + noteLines.length * 20 + 14);
    var sh = shell(geo, S, zoneH), b = sh.head;
    var inSel = sel.test;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    var si = 0, so = 0;
    b += drawGrid(S.L, function (c, r) { return inSel(c, r) ? { cls: 'hot', text: 'a' + (si++), textOn: true } : { cls: 'dim', text: bgName(geo, c, r) }; });
    b += drawGrid(S.R, function (c, r) { return inSel(c, r) ? { cls: 'hot4', text: 'b' + (so++), textOn: true } : { cls: 'dim', text: bgName(geo, c, r) }; });
    var ob = opBox(S.mid, S.cy, 'S', op.cap || L(n + ' 位非线性映射', n + '-bit nonlinear map'), op.formula);
    b += ob.svg;
    var HW = ob.hw + 6;
    b += ringSvg(S.L, axis, idx) + ringSvg(S.R, axis, idx);
    if (axis === 'row' || axis === 'all') {
      var ly = axis === 'all' ? S.cy : S.L.cy(idx), ry = axis === 'all' ? S.cy : S.R.cy(idx);
      b += '<path class="d-arrow" d="M' + (S.L.right() + 18) + ' ' + ly + ' C ' + (S.mid - 130) + ' ' + ly + ', ' + (S.mid - 130) + ' ' + S.cy + ', ' + (S.mid - HW) + ' ' + S.cy + '"/>';
      b += '<path class="d-arrow green" d="M' + (S.mid + HW) + ' ' + S.cy + ' C ' + (S.mid + 130) + ' ' + S.cy + ', ' + (S.mid + 130) + ' ' + ry + ', ' + (S.R.x - 12) + ' ' + ry + '"/>';
    } else {
      b += '<path class="d-arrow" d="M' + (S.L.right() + 12) + ' ' + S.cy + ' H ' + (S.mid - HW) + '"/>';
      b += '<path class="d-arrow green" d="M' + (S.mid + HW) + ' ' + S.cy + ' H ' + (S.R.x - 12) + '"/>';
    }
    var UNS = geo.unitName || 'lane';
    b += caps(S, op.inCap || L('高亮的 ' + n + ' 个' + UNS + '一起进入一个 S 盒', 'the ' + n + ' highlighted ' + plural(n, UNS) + ' enter one S-box together'), op.depNote || L('输出写回同样 ' + n + ' 个' + UNS, 'outputs are written back to the same ' + n + ' ' + plural(n, UNS)));
    b += zoneSvg(34, sh.zoneY, W - 68, zoneH, op.sliceTitle || L('一个 z 切片：' + n + ' 个' + UNS + '的同一位下标凑成 ' + n + ' 个输入比特', 'One z-slice: the same bit index of ' + n + ' ' + plural(n, UNS) + ' gives ' + n + ' input bits'), []);
    var cw = 26, zx = 52, zy = sh.zoneY + 48, j;
    for (j = 0; j < n; j++) {
      b += '<rect class="d-chip on" x="' + (zx + j * (cw + 8)) + '" y="' + zy + '" width="' + cw + '" height="26" rx="5"/>';
      b += '<text class="d-chip-t" x="' + (zx + j * (cw + 8) + cw / 2) + '" y="' + (zy + 17) + '">a' + j + '</text>';
    }
    var ox = zx + n * (cw + 8) + 56;
    b += '<path class="d-arrow green" d="M' + (zx + n * (cw + 8) + 4) + ' ' + (zy + 13) + ' h 40"/>';
    for (j = 0; j < n; j++) {
      b += '<rect class="d-chip out" x="' + (ox + j * (cw + 8)) + '" y="' + zy + '" width="' + cw + '" height="26" rx="5"/>';
      b += '<text class="d-chip-t" x="' + (ox + j * (cw + 8) + cw / 2) + '" y="' + (zy + 17) + '">b' + j + '</text>';
    }
    var pnX = ox + n * (cw + 8) + 26;
    parallelLines.forEach(function (t, k) {
      b += '<text class="d-note" x="' + pnX + '" y="' + (zy + 17 + k * 18) + '">' + esc(t) + '</text>';
    });
    noteLines.forEach(function (t, k) {
      b += '<text class="d-note" x="52" y="' + (sh.zoneY + noteY + k * 20) + '">' + esc(t) + '</text>';
    });
    return { H: sh.H, body: b };
  }

  function opColumnMix(geo, S, op) {
    var axis = op.axis || 'column', idx = op.index != null ? op.index : 2;
    var sel = selector(geo, op), n = sel.n, par = sel.parallel;
    var sh = shell(geo, S, 104, [op.detail || '', op.note || '']), b = sh.head;
    var inSel = sel.test;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    var grp = op.groupBy;                        // "parity" / "half"：把选中的格子分成两组着色
    var gi = 0, gj = 0;
    function gcls(c, r, base, k) {
      if (!inSel(c, r)) return 'dim';
      if (!grp) return base;
      var pos = k++;
      return base;
    }
    var idxMap = {};
    if (grp) {
      var seq = [];
      for (var rr = 0; rr < geo.rows; rr++) for (var cc = 0; cc < geo.cols; cc++) if (inSel(cc, rr)) seq.push(cc + ',' + rr);
      seq.forEach(function (key, k) { idxMap[key] = grp === 'groups' ? op.groups.findIndex(function (g) { return g.indexOf(k) >= 0; }) : ((grp === 'half') ? (k < seq.length / 2 ? 0 : 1) : (k % 2)); });
    }
    b += drawGrid(S.L, function (c, r) {
      var on = inSel(c, r), g2 = idxMap[c + ',' + r];
      return { cls: on ? (grp ? HOT[g2 % HOT.length] : 'hot') : 'dim', text: bgName(geo, c, r), textOn: on };
    });
    b += drawGrid(S.R, function (c, r) {
      var on = inSel(c, r), g2 = idxMap[c + ',' + r];
      return { cls: on ? (grp ? HOT[g2 % HOT.length] : 'hot4') : 'dim', text: bgName(geo, c, r), textOn: on };
    });
    var ob = opBox(S.mid, S.cy, op.sym || 'L', op.cap || L('整' + (axis === 'column' ? '列' : '行') + '线性扩散', (axis === 'column' ? 'column' : 'row') + '-wise linear diffusion'), op.formula);
    b += ob.svg;
    var HW = ob.hw + 6;
    var lx = axis === 'column' ? S.L.cx(idx) : S.L.x + S.L.w() - S.L.cw / 2;
    var rx = axis === 'column' ? S.R.cx(idx) : S.R.x + S.R.cw / 2;
    var lTop = S.L.y, lBot = S.L.y + S.L.h();
    b += ringSvg(S.L, axis, idx) + ringSvg(S.R, axis, idx);
    b += '<path class="d-arrow" d="M' + (S.L.right() + 18) + ' ' + S.cy + ' H ' + (S.mid - HW) + '"/>';
    b += '<path class="d-arrow green" d="M' + (S.mid + HW) + ' ' + S.cy + ' H ' + (S.R.x - 16) + '"/>';
    var UNC = geo.unitName || 'lane';
    b += caps(S, op.inCap || L(n + ' 个' + UNC + '作为一组输入', n + ' ' + plural(n, UNC) + ' form one input group'), op.depNote || L('每个输出' + UNC + '都依赖这 ' + n + ' 个输入', 'each output ' + UNC + ' depends on all ' + n + ' inputs'));
    b += zoneSvg(34, sh.zoneY, W - 68, 104, op.detailTitle || (par > 1 ? L('同样的运算在其余 ' + (par - 1) + ' ' + sel.unit + '上并行执行', 'The same operation runs in parallel on the other ' + (par - 1) + ' ' + plural(par - 1, sel.unit)) : L('本步作用在整个状态上', 'This step acts on the whole state')), [op.detail || '', op.note || '']);
    return { H: sh.H, body: b };
  }

  function opParity(geo, S, op) {
    var idx = op.index != null ? op.index : 2;
    var sh = shell(geo, S, 104, [op.detail || '', op.note || '']), b = sh.head;
    var src = op.srcIndex != null ? op.srcIndex : null;   // 注入量来自哪一列
    b += drawGrid(S.L, function (c, r) {
      return { cls: c === idx ? 'hot' : (src != null && c === src ? 'hot3' : 'touch'), text: bgName(geo, c, r), textOn: c === idx || c === src };
    });
    b += drawGrid(S.R, function (c, r) { return { cls: c === idx ? 'hot2' : 'warmtouch', text: bgName(geo, c, r), textOn: c === idx }; });
    if (src != null) {
      b += '<path class="d-arrow warm" d="M' + S.L.cx(src) + ' ' + (S.L.y - 8) + ' C ' + S.L.cx(src) + ' ' + (S.L.y - 30) + ', ' + S.L.cx(idx) + ' ' + (S.L.y - 30) + ', ' + S.L.cx(idx) + ' ' + (S.L.y - 6) + '"/>';
      var srcT = op.srcLabel || L('注入量来自前一列', 'injected value comes from the previous column');
      var srcX = (S.L.cx(src) + S.L.cx(idx)) / 2, srcA = 'middle';
      if (LANG === 'en') {                       // 英文标签较长：不压住面板标题
        var minX = S.L.x - 30 + panelTitleW(IN_TITLE()) + 14, sw0 = textWidth(srcT) * 11 / 12;
        if (srcX - sw0 / 2 < minX) { srcX = minX; srcA = 'start'; }
      }
      b += '<text class="d-axis" x="' + srcX + '" y="' + (S.L.y - 34) + '" text-anchor="' + srcA + '">' + esc(srcT) + '</text>';
    }
    var ob = opBox(S.mid, S.cy - 34, '⊕', op.cap || L('列奇偶再注入', 'column-parity injection'), op.formula);
    b += ob.svg;
    var HW = ob.hw + 6;
    b += ringSvg(S.L, 'column', idx) + ringSvg(S.R, 'column', idx);
    b += '<path class="d-arrow" d="M' + (S.L.right() + 12) + ' ' + S.cy + ' C ' + (S.mid - 150) + ' ' + S.cy + ', ' + (S.mid - 140) + ' ' + (S.cy - 34) + ', ' + (S.mid - HW) + ' ' + (S.cy - 34) + '"/>';
    var cy2 = ob.bottom + 34, cx0 = S.mid - 150;
    b += '<path class="d-arrow" d="M' + S.mid + ' ' + ob.bottom + ' V ' + (cy2 - 15) + '"/>';
    var scope = op.injScope || L('注入全部 ' + (geo.rows * geo.cols) + ' 条 lane', 'injected into all ' + (geo.rows * geo.cols) + ' lanes');
    if (LANG === 'en') {
      // 英文芯片文字放不下一行时折成两行，说明行按右面板左缘折行
      var pl = wrap(op.p || 'P[x]', 128 * 12 / 11), ql = wrap(op.q || 'Q[x]', 128 * 12 / 11);
      var nl = Math.max(pl.length, ql.length), chh = 30 + (nl - 1) * 13;
      [[cx0, pl], [cx0 + 160, ql]].forEach(function (cp) {
        b += '<rect class="d-chip on" x="' + cp[0] + '" y="' + (cy2 - chh / 2) + '" width="140" height="' + chh + '" rx="7"/>';
        cp[1].forEach(function (t, k) { b += '<text class="d-chip-t" x="' + (cp[0] + 70) + '" y="' + (cy2 + 5 - (cp[1].length - 1) * 6.5 + k * 13) + '">' + esc(t) + '</text>'; });
      });
      b += '<path class="d-arrow warm" d="M' + (cx0 + 300) + ' ' + cy2 + ' C ' + (S.R.x - 70) + ' ' + cy2 + ', ' + (S.R.x - 40) + ' ' + S.cy + ', ' + (S.R.x - 14) + ' ' + S.cy + '"/>';
      wrap(scope, Math.max(200, S.R.x - 40 - cx0) * 12 / 11).forEach(function (t, k) {
        b += '<text class="d-axis" x="' + cx0 + '" y="' + (cy2 + 21 + chh / 2 + k * 14) + '">' + esc(t) + '</text>';
      });
    } else {
    b += '<rect class="d-chip on" x="' + cx0 + '" y="' + (cy2 - 15) + '" width="140" height="30" rx="7"/>';
    b += '<text class="d-chip-t" x="' + (cx0 + 70) + '" y="' + (cy2 + 5) + '">' + esc(op.p || 'P[x]') + '</text>';
    b += '<rect class="d-chip on" x="' + (cx0 + 160) + '" y="' + (cy2 - 15) + '" width="140" height="30" rx="7"/>';
    b += '<text class="d-chip-t" x="' + (cx0 + 230) + '" y="' + (cy2 + 5) + '">' + esc(op.q || 'Q[x]') + '</text>';
    b += '<path class="d-arrow warm" d="M' + (cx0 + 300) + ' ' + cy2 + ' C ' + (S.R.x - 70) + ' ' + cy2 + ', ' + (S.R.x - 40) + ' ' + S.cy + ', ' + (S.R.x - 14) + ' ' + S.cy + '"/>';
    b += '<text class="d-axis" x="' + cx0 + '" y="' + (cy2 + 36) + '">' + esc(scope) + '</text>';
    }
    b += caps(S, op.inCap || L('第 ' + idx + ' 列的 ' + geo.rows + ' 条 lane 先求列奇偶', 'parity of the ' + geo.rows + ' lanes in column ' + idx + ' is computed first'), op.depNote || L('整个状态都会改变，不止高亮那一列', 'the whole state changes, not just the highlighted column'));
    b += zoneSvg(34, sh.zoneY, W - 68, 104, op.detailTitle || L('本轮唯一的跨 lane 扩散', 'The only cross-lane diffusion in the round'), [
      op.detail || L('每条输出 lane = 原 lane ⊕ 相关列的奇偶量，因此一列的改动一步就能传到全状态。', 'Each output lane = input lane ⊕ parity of the related columns, so a change in one column reaches the whole state in one step.'),
      op.note || ''
    ]);
    return { H: sh.H, body: b };
  }

  /* ---------- 字级数据流 ---------- */

  function opFlow(alg, geo, step) {
    var g = geo.graph, H = geo.height || 660;
    var act = (geo.steps && geo.steps[step]) || { nodes: [], edges: [] };
    var b = '<rect class="d-bg" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      '<text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>' +
      wrap(geo.subtitle || '', W - 76).map(function (t, k) { return '<text class="d-sub" x="34" y="' + (58 + k * 17) + '">' + esc(t) + '</text>'; }).join('');
    (g.zones || []).forEach(function (z) {
      b += '<rect class="d-zone" x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="12"/>';
      b += '<text class="d-zone-t" x="' + (z.x + 14) + '" y="' + (z.y + 20) + '">' + esc(z.label) + '</text>';
    });
    g.edges.forEach(function (e) {
      b += '<path class="d-edge' + (act.edges.indexOf(e.id) >= 0 ? ' on' : '') + '" d="' + e.d + '"/>';
    });
    Object.keys(g.nodes).forEach(function (k) {
      var n = g.nodes[k], on = act.nodes.indexOf(k) >= 0;
      var cls = on ? (n.role === 'result' ? 'res' : 'on') : (n.role === 'key' ? 'key' : '');
      b += '<rect class="d-node ' + cls + '" x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="' + (n.shape === 'op' ? n.h / 2 : 10) + '"/>';
      b += '<text class="d-node-t" x="' + (n.x + n.w / 2) + '" y="' + (n.y + (n.sub ? n.h / 2 - 1 : n.h / 2 + 5)) + '">' + esc(n.label) + '</text>';
      if (n.sub) b += '<text class="d-node-s" x="' + (n.x + n.w / 2) + '" y="' + (n.y + n.h / 2 + 14) + '">' + esc(n.sub) + '</text>';
    });
    var r = alg.rounds[step], by = H - 92;
    var caps = wrap(r[0] + ' · ' + r[1], W - 116);
    var formulas = String(act.formula || r[3] || '').split('\n').reduce(function(a,l){return a.concat(wrap(l,W-116));},[]);
    var notes = wrap(act.note || '', W - 116);
    var fh = 22 + caps.length*20 + formulas.length*17 + notes.length*17;
    H = Math.max(H, by + fh + 20);
    b = b.replace('height="' + (geo.height || 660) + '"', 'height="' + H + '"');
    b += '<rect class="d-op" x="34" y="' + by + '" width="' + (W-68) + '" height="' + fh + '" rx="12"/>';
    var yy=by+24;
    caps.forEach(function(l){b+='<text class="d-op-cap d-l" x="54" y="'+yy+'">'+esc(l)+'</text>';yy+=20;});
    formulas.forEach(function(l){b+='<text class="d-op-f d-l" x="54" y="'+yy+'">'+esc(l)+'</text>';yy+=17;});
    notes.forEach(function(l){b+='<text class="d-note" x="54" y="'+yy+'">'+esc(l)+'</text>';yy+=17;});
    return { H: H, body: b };
  }


  /* 每条 lane 独立经过同一个函数（lane 内部有结构） */
  /* 阶段条：按内容定宽、两行折行、放不下就换行排 */
  function stagesStrip(x0, y0, w, stages) {
    var CHIPMAX = 230, GAP = 30, out = '', rows = [], cur = [], curW = 0;
    var items = (stages || []).map(function (t) {
      var ls = wrap(String(t), CHIPMAX - 16);
      if (ls.length > 2) ls = [ls[0], ls.slice(1).join('')];
      var wd = 0;
      ls.forEach(function (l) { wd = Math.max(wd, textWidth(l) * 11 / 12); });
      return { lines: ls, w: Math.max(58, Math.min(CHIPMAX, wd + 18)) };
    });
    items.forEach(function (it) {
      if (cur.length && curW + GAP + it.w > w) { rows.push({ items: cur, w: curW }); cur = []; curW = 0; }
      curW += (cur.length ? GAP : 0) + it.w; cur.push(it);
    });
    if (cur.length) rows.push({ items: cur, w: curW });
    var y = y0, rowH = 0;
    rows.forEach(function (row) {
      var hh = 20 + Math.max.apply(null, row.items.map(function (i) { return i.lines.length; })) * 14;
      var x = x0;
      row.items.forEach(function (it, k) {
        out += '<rect class="d-chip on" x="' + x + '" y="' + y + '" width="' + it.w + '" height="' + hh + '" rx="7"/>';
        it.lines.forEach(function (l, j) {
          out += fitText('d-chip-t', x + it.w / 2, y + hh / 2 + 4 - (it.lines.length - 1) * 7 + j * 14, it.w - 10, l, ' text-anchor="middle"');
        });
        if (k < row.items.length - 1) out += '<path class="d-arrow faint" d="M' + (x + it.w + 4) + ' ' + (y + hh / 2) + ' h ' + (GAP - 10) + '"/>';
        x += it.w + GAP;
      });
      y += hh + 12; rowH = hh;
    });
    return { svg: out, h: y - y0 };
  }

  /* Feistel 梯：L / R 两条轨道 + 每轮一个 F 盒与一次 ⊕，再交叉 */
  function feistelLadder(x0, y0, w, cfg) {
    var rounds = cfg.rounds || [], n = Math.max(1, rounds.length);
    var yL = y0 + 40, yR = y0 + 104;
    var lead = 74, tail = 74;
    var sw = (w - lead - tail) / n;
    var sx0 = x0 + lead, out = '';
    var LN = cfg.left || 'L', R = cfg.right || 'R';
    out += '<path class="d-rail" d="M' + x0 + ' ' + yL + ' H ' + (x0 + w) + '"/>';
    out += '<path class="d-rail" d="M' + x0 + ' ' + yR + ' H ' + (x0 + w) + '"/>';
    out += '<text class="d-axis" x="' + (x0 - 2) + '" y="' + (yL - 12) + '">' + esc(LN + '₀') + '</text>';
    out += '<text class="d-axis" x="' + (x0 - 2) + '" y="' + (yR + 20) + '">' + esc(R + '₀') + '</text>';
    var SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈'];
    for (var i = 0; i < n; i++) {
      var sx = sx0 + i * sw;
      var tapX = sx + sw * 0.10, fx = sx + sw * 0.34, xorX = sx + sw * 0.62, crossA = sx + sw * 0.74, crossB = sx + sw * 0.96;
      var fy = (yL + yR) / 2, fw = Math.min(76, sw * 0.30), fh = 30;
      // R 抽出 → 从下方进 F 盒
      out += '<circle cx="' + tapX + '" cy="' + yR + '" r="3.4" fill="#3f85d6"/>';
      out += '<path class="d-arrow" d="M' + tapX + ' ' + yR + ' V ' + (fy + fh / 2 + 18) + ' H ' + fx + ' V ' + (fy + fh / 2 + 3) + '"/>';
      out += '<rect class="d-op" x="' + (fx - fw / 2) + '" y="' + (fy - fh / 2) + '" width="' + fw + '" height="' + fh + '" rx="8"/>';
      out += fitText('d-op-cap', fx, fy + 4, fw - 8, rounds[i].f || 'F', ' text-anchor="middle"');
      // F → ⊕（落在 L 轨道上）
      out += '<path class="d-arrow warm" d="M' + (fx + fw / 2) + ' ' + fy + ' H ' + xorX + ' V ' + (yL + 11) + '"/>';
      out += '<circle cx="' + xorX + '" cy="' + yL + '" r="10" fill="#ffffff" stroke="#d98324" stroke-width="1.6"/>';
      out += '<text class="d-chip-t" x="' + xorX + '" y="' + (yL + 4) + '">⊕</text>';
      // 交叉：L ↔ R
      out += '<path class="d-arrow" d="M' + crossA + ' ' + yL + ' C ' + ((crossA + crossB) / 2) + ' ' + yL + ', ' + ((crossA + crossB) / 2) + ' ' + yR + ', ' + crossB + ' ' + yR + '" opacity=".75"/>';
      out += '<path class="d-arrow" d="M' + crossA + ' ' + yR + ' C ' + ((crossA + crossB) / 2) + ' ' + yR + ', ' + ((crossA + crossB) / 2) + ' ' + yL + ', ' + crossB + ' ' + yL + '" opacity=".75"/>';
      out += '<text class="d-axis" x="' + ((crossA + crossB) / 2) + '" y="' + (fy + 4) + '" text-anchor="middle">' + L('交换', 'swap') + '</text>';
      out += '<text class="d-axis" x="' + (crossB + 4) + '" y="' + (yL - 12) + '">' + esc(LN + (SUB[i + 1] || '')) + '</text>';
      out += '<text class="d-axis" x="' + (crossB + 4) + '" y="' + (yR + 20) + '">' + esc(R + (SUB[i + 1] || '')) + '</text>';
      if (rounds[i].note) out += fitText('d-axis', (sx + sx + sw) / 2, yR + 42, sw - 8, rounds[i].note, ' text-anchor="middle"');
    }
    if (cfg.inLabel) out += fitText('d-note', x0, y0 + 14, w / 2 - 10, cfg.inLabel);
    if (cfg.outLabel) out += fitText('d-note', x0 + w, y0 + 14, w / 2 - 10, cfg.outLabel, ' text-anchor="end"');
    return { svg: out, h: 152 };
  }

  function opLaneFunc(geo, S, op) {
    var sc = op.sample ? op.sample[0] : 0, sr = op.sample ? op.sample[1] : 0;
    var selected = op.pairCells || [[sc, sr]];
    function isSelected(c, r) { return selected.some(function (p) { return p[0] === c && p[1] === r; }); }
    var noteLines = wrap(op.note || '', W - 130);
    var inner;
    if (op.ladder) inner = feistelLadder(56, 0, W - 112, op.ladder);
    else inner = stagesStrip(56, 0, W - 112, op.stages || []);
    var zh = 44 + inner.h + noteLines.length * 20 + 8;
    var sh = shell(geo, S, zh), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) { return { cls: isSelected(c, r) ? 'hot' : 'touch', text: bgName(geo, c, r), textOn: isSelected(c, r) }; });
    b += drawGrid(S.R, function (c, r) { return { cls: isSelected(c, r) ? 'hot4' : 'warmtouch', text: bgName(geo, c, r), textOn: isSelected(c, r) }; });
    var ob = opBox(S.mid, S.cy, op.sym || 'F', op.cap || L('每个' + (geo.unitName || 'lane') + '独立变换', 'each ' + (geo.unitName || 'lane') + ' transformed independently'), op.formula);
    b += ob.svg;
    b += '<path class="d-arrow faint" d="M' + (S.L.right() + 16) + ' ' + S.cy + ' H ' + (S.mid - ob.hw - 8) + '"/>';
    b += '<path class="d-arrow faint" d="M' + (S.mid + ob.hw + 8) + ' ' + S.cy + ' H ' + (S.R.x - 14) + '"/>';
    var UNF = geo.unitName || 'lane';
    b += caps(S, op.inCap || L('全部 ' + (geo.rows * geo.cols) + ' 个 ' + UNF + ' 各自独立', 'all ' + (geo.rows * geo.cols) + ' ' + plural(geo.rows * geo.cols, UNF) + ' are independent'), op.depNote || L('没有任何跨 ' + UNF + ' 的信息流动', 'no information flows between ' + plural(2, UNF)));
    b += '<rect class="d-zone" x="34" y="' + sh.zoneY + '" width="' + (W - 68) + '" height="' + zh + '" rx="12"/>';
    b += '<text class="d-zone-t" x="52" y="' + (sh.zoneY + 22) + '">' + esc(op.innerTitle || L(UNF + '内部的结构', 'Structure inside each ' + UNF)) + '</text>';
    var body = (op.ladder ? feistelLadder(56, sh.zoneY + 34, W - 112, op.ladder) : stagesStrip(56, sh.zoneY + 36, W - 112, op.stages || []));
    b += body.svg;
    noteLines.forEach(function (t, k) {
      b += '<text class="d-note" x="56" y="' + (sh.zoneY + 44 + inner.h + 16 + k * 20) + '">' + esc(t) + '</text>';
    });
    return { H: sh.H, body: b };
  }

  function opLaneMix(geo, S, op) {
    var total = geo.rows * geo.cols;
    var target = op.target != null ? op.target : 0;
    var srcs = op.sources || [0, 1, 2];
    var rots = op.rotations || null;
    function pos(i) { return [i % geo.cols, Math.floor(i / geo.cols)]; }
    var tp = pos(target);
    var zoneLines = [op.exprLabel || '', op.supportNote || '', op.note || ''];
    var sh = shell(geo, S, 104, zoneLines), b = sh.head;
    if (op.leftTitle) b = b.replace(IN_TITLE(), esc(op.leftTitle));
    if (op.rightTitle) b = b.replace(OUT_TITLE(), esc(op.rightTitle));
    if (!op.sourceLabels) b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) {
      var i = r * geo.cols + c, k = srcs.indexOf(i);
      return k >= 0 ? { cls: HOT[k % 4], text: (op.sourceLabels && op.sourceLabels[i]) || ('X' + i), textOn: true } : { cls: 'dim', text: (op.sourceLabels && op.sourceLabels[i]) || ('X' + i) };
    });
    b += drawGrid(S.R, function (c, r) {
      var i = r * geo.cols + c;
      return i === target ? { cls: 'hot4', text: op.outputLabel || ('Y' + i), textOn: true } : { cls: 'dim', text: '' };
    });
    var ob = opBox(S.mid, S.cy, op.sym || '⊕', op.cap || L('旋转后异或', 'rotate, then XOR'), op.formula);
    b += ob.svg;
    srcs.forEach(function (i, k) {
      var p = pos(i), y1 = S.L.cy(p[1]);
      b += '<path class="d-arrow ' + AC[k % 4] + '" d="M' + (S.L.right() + 10) + ' ' + y1 + ' C ' + (S.mid - 160) + ' ' + y1 + ', ' + (S.mid - 150) + ' ' + S.cy + ', ' + (S.mid - ob.hw - 6) + ' ' + S.cy + '" opacity=".85"/>';
    });
    b += '<path class="d-arrow green" d="M' + (S.mid + ob.hw + 6) + ' ' + S.cy + ' C ' + (S.mid + 150) + ' ' + S.cy + ', ' + (S.R.x - 60) + ' ' + S.R.cy(tp[1]) + ', ' + (S.R.x - 10) + ' ' + S.R.cy(tp[1]) + '"/>';
    var UNM = geo.unitName || 'lane';
    b += caps(S, op.inCap || L('输出 Y' + target + ' 依赖的 ' + srcs.length + ' 个输入' + UNM, 'output Y' + target + ' depends on ' + srcs.length + ' input ' + plural(srcs.length, UNM)), op.depNote || L('其余输出' + UNM + '用同样规则、不同下标', 'other output ' + plural(2, UNM) + ' follow the same rule, other indices'));
    var lines = [op.exprLabel || ('Y' + target + ' = ' + srcs.map(function (i, k) { return (rots ? 'ROTL(X' + i + ', ' + rots[k] + ')' : 'X' + i); }).join(' ⊕ '))];
    if (op.supportNote) lines.push(op.supportNote);
    lines.push(op.note || '');
    b += zoneSvg(34, sh.zoneY, W - 68, 104, op.detailTitle || L('支撑集：' + total + ' 条 lane，每条输出用 ' + srcs.length + ' 条输入', 'Support: ' + total + ' lanes; each output uses ' + srcs.length + ' ' + plural(srcs.length, 'input')), lines);
    return { H: sh.H, body: b };
  }

  /* 蝶形交织：n 条 lane，多级按 i ⊕ 2^s 配对 */
  function opButterfly(geo, S, op) {
    var n = op.lanes || (geo.rows * geo.cols);
    var stages = op.stages || [1, 2, 4];
    var laneGap0 = 40, y00 = 112;
    var zBody = zone(34, 0, W - 68, 66, op.detailTitle || L('三级配对覆盖全部 lane', 'Three pairing stages cover all lanes'), [op.note || '']);
    var H = y00 + (n - 1) * laneGap0 + 60 + zBody.h + 26;
    var b = '<rect class="d-bg" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      '<text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>' +
      wrap(geo.subtitle || '', W - 76).map(function (t, k) { return '<text class="d-sub" x="34" y="' + (58 + k * 17) + '">' + esc(t) + '</text>'; }).join('');
    var x0 = 150, colW = (W - 300) / (stages.length), laneGap = laneGap0, y0 = y00;
    var i, sIdx;
    for (i = 0; i < n; i++) {
      b += '<text class="d-axis" x="' + (x0 - 22) + '" y="' + (y0 + i * laneGap + 4) + '" text-anchor="end">L' + i + '</text>';
      b += '<path class="c-rail" stroke="#dbe3ec" stroke-width="1.6" fill="none" d="M' + x0 + ' ' + (y0 + i * laneGap) + ' H ' + (x0 + stages.length * colW) + '"/>';
    }
    var colors = ['#3f85d6', '#d98324', '#7c5cd6'];
    stages.forEach(function (d, sI) {
      var cx = x0 + sI * colW + colW / 2;
      b += '<text class="d-panel-label" x="' + cx + '" y="' + (y0 - 30) + '" text-anchor="middle" fill="' + colors[sI % 3] + '">' + L('第 ' + (sI + 1) + ' 级 · i ⊕ ' + d, 'stage ' + (sI + 1) + ' · i ⊕ ' + d) + '</text>';
      if (op.granularity) b += '<text class="d-axis" x="' + cx + '" y="' + (y0 - 14) + '" text-anchor="middle">' + L('粒度 ', 'granularity ') + esc(op.granularity[sI] || '') + '</text>';
      for (var k = 0; k < n; k++) {
        var p = k ^ d;
        if (p <= k) continue;
        var ya = y0 + k * laneGap, yb = y0 + p * laneGap;
        b += '<path fill="none" stroke="' + colors[sI % 3] + '" stroke-width="1.5" opacity=".85" d="M' + (cx - 26) + ' ' + ya + ' C ' + (cx - 4) + ' ' + ya + ', ' + (cx + 4) + ' ' + yb + ', ' + (cx + 26) + ' ' + yb + '"/>';
        b += '<path fill="none" stroke="' + colors[sI % 3] + '" stroke-width="1.5" opacity=".85" d="M' + (cx - 26) + ' ' + yb + ' C ' + (cx - 4) + ' ' + yb + ', ' + (cx + 4) + ' ' + ya + ', ' + (cx + 26) + ' ' + ya + '"/>';
        b += '<circle cx="' + (cx - 26) + '" cy="' + ya + '" r="3.2" fill="' + colors[sI % 3] + '"/>';
        b += '<circle cx="' + (cx - 26) + '" cy="' + yb + '" r="3.2" fill="' + colors[sI % 3] + '"/>';
      }
    });
    b += zoneSvg(34, H - zBody.h - 26, W - 68, 66, op.detailTitle || L('三级配对覆盖全部 lane', 'Three pairing stages cover all lanes'), [op.note || '']);
    return { H: H, body: b };
  }

  /* lane 内的位级重排（几种类型按轮号轮换） */
  function opBitShuffle(geo, S, op) {
    var n = op.bitsShown || 20;
    var map = op.map || function (i) { return (i * 7 + 3) % n; };
    var UNB = geo.unitName || 'lane';
    var zlines = wrap(op.note || '', W - 130).concat(wrap(op.variants || '', W - 130));
    var zhB = 132 + zlines.length * 20;
    var sh = shell(geo, S, zhB), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) { return { cls: 'touch', text: bgName(geo, c, r) }; });
    b += drawGrid(S.R, function (c, r) { return { cls: 'warmtouch', text: bgName(geo, c, r) }; });
    var ob = opBox(S.mid, S.cy, '⤨', op.cap || L('位级重排', 'bit-level permutation'), op.formula);
    b += ob.svg;
    b += '<path class="d-arrow faint" d="M' + (S.L.right() + 16) + ' ' + S.cy + ' H ' + (S.mid - ob.hw - 8) + '"/>';
    b += '<path class="d-arrow faint" d="M' + (S.mid + ob.hw + 8) + ' ' + S.cy + ' H ' + (S.R.x - 14) + '"/>';
    b += caps(S, op.inCap || L(UNB + '的坐标不变', UNB + ' coordinates unchanged'), op.depNote || L('变的是每个比特落在哪个位置', 'what changes is where each bit lands'));
    b += '<rect class="d-zone" x="34" y="' + sh.zoneY + '" width="' + (W - 68) + '" height="' + zhB + '" rx="12"/>';
    b += '<text class="d-zone-t" x="52" y="' + (sh.zoneY + 22) + '">' + esc(op.detailTitle || L('同一个' + UNB + '内的比特位置（示意 ' + n + ' 位）', 'Bit positions within one ' + UNB + ' (' + n + ' bits shown)')) + '</text>';
    zlines.forEach(function (t, k) { b += '<text class="d-note" x="52" y="' + (sh.zoneY + 122 + k * 20) + '">' + esc(t) + '</text>'; });
    var x = 130, wpx = 540, cw = wpx / n, y1 = sh.zoneY + 36, y2 = sh.zoneY + 84;
    var marks = op.marks || [1, 4, 9, 14];
    var i;
    for (i = 0; i < n; i++) {
      var on = marks.indexOf(i) >= 0;
      b += '<rect x="' + (x + i * cw) + '" y="' + y1 + '" width="' + (cw - 1) + '" height="18" rx="2" fill="' + (on ? '#3f85d6' : '#eef2f7') + '" stroke="#dbe3ec" stroke-width=".6"/>';
      var on2 = marks.some(function (mm) { return map(mm) === i; });
      b += '<rect x="' + (x + i * cw) + '" y="' + y2 + '" width="' + (cw - 1) + '" height="18" rx="2" fill="' + (on2 ? '#d98324' : '#eef2f7') + '" stroke="#dbe3ec" stroke-width=".6"/>';
    }
    b += '<text class="d-axis" x="' + (x - 14) + '" y="' + (y1 + 13) + '" text-anchor="end">' + L('重排前', 'before') + '</text>';
    b += '<text class="d-axis" x="' + (x - 14) + '" y="' + (y2 + 13) + '" text-anchor="end">' + L('重排后', 'after') + '</text>';
    marks.forEach(function (mm, k) {
      var sx = x + mm * cw + cw / 2, dx = x + map(mm) * cw + cw / 2;
      b += '<path class="d-arrow ' + AC[k % 4] + '" d="M' + sx + ' ' + (y1 + 19) + ' C ' + sx + ' ' + (y1 + 34) + ', ' + dx + ' ' + (y2 - 20) + ', ' + dx + ' ' + (y2 - 4) + '" opacity=".85"/>';
    });
    return { H: sh.H, body: b };
  }

  /* AES 轮：每条 lane 是一个 4 × 4 字节矩阵 */
  function opAesRound(geo, S, op) {
    var steps = op.steps || ['SubBytes', 'ShiftRows', 'MixColumns'];
    var skip = op.skip || [];                       // 不参与这一层的 lane
    function isSkip(c, r) { return skip.some(function (p) { return p[0] === c && p[1] === r; }); }
    var cell = 28, gp = 4, gw = 4 * cell + 3 * gp;
    var noteLines = wrap(op.note || '', W - 130);
    var capLines = 2;                               // 每个小图下的两行标注
    if (LANG === 'en') (op.captions || []).forEach(function (t) { capLines = Math.max(capLines, Math.min(3, wrap(t || '', (W - 150) / steps.length - 30).length)); });
    var zh = 46 + 4 * cell + 3 * gp + 22 + capLines * 17 + 10 + noteLines.length * 20;
    var sh = shell(geo, S, zh), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    b += drawGrid(S.L, function (c, r) {
      var nm = nameOf(geo, c, r);
      return { cls: isSkip(c, r) ? 'dim' : 'hot', text: nm || '', textOn: !isSkip(c, r) };
    });
    b += drawGrid(S.R, function (c, r) {
      var nm = nameOf(geo, c, r);
      return { cls: isSkip(c, r) ? 'dim' : 'hot4', text: nm || '', textOn: !isSkip(c, r) };
    });
    var laneN = op.laneCount || (geo.rows * geo.cols - skip.length);
    var ob = opBox(S.mid, S.cy, 'A', op.cap || L('AES 轮 · ' + laneN + ' 条 lane 并行', 'AES round · ' + laneN + ' ' + plural(laneN, 'lane') + ' in parallel'), op.formula);
    b += ob.svg;
    b += '<path class="d-arrow" d="M' + (S.L.right() + 16) + ' ' + S.cy + ' H ' + (S.mid - ob.hw - 8) + '"/>';
    b += '<path class="d-arrow green" d="M' + (S.mid + ob.hw + 8) + ' ' + S.cy + ' H ' + (S.R.x - 14) + '"/>';
    var UNA = geo.unitName || 'lane';
    b += caps(S, op.inCap || L(laneN + ' 个 ' + UNA + ' 各自过一次 AES 轮', 'each of the ' + laneN + ' ' + plural(laneN, UNA) + ' passes one AES round'),
      op.depNote || (skip.length ? L('高亮之外的 ' + skip.length + ' 个 ' + UNA + ' 不走这条路', 'the ' + skip.length + ' ' + plural(skip.length, UNA) + ' outside the highlight skip this path') : L('这一层不跨 ' + UNA, 'nothing crosses ' + plural(2, UNA) + ' in this layer')));
    // 说明区：一条 lane 内部摊成 4×4 字节矩阵
    b += '<rect class="d-zone" x="34" y="' + sh.zoneY + '" width="' + (W - 68) + '" height="' + zh + '" rx="12"/>';
    b += '<text class="d-zone-t" x="52" y="' + (sh.zoneY + 22) + '">' + esc(op.detailTitle || L('一条 128 位 ' + UNA + ' 摊成 4 × 4 字节矩阵，' + laneN + ' 条同时执行', 'One 128-bit ' + UNA + ' as a 4 × 4 byte matrix, ' + laneN + ' in parallel')) + '</text>';
    var slot = (W - 150) / steps.length, y0 = sh.zoneY + 42;
    steps.forEach(function (label, si) {
      var gx = 64 + si * slot + (slot - gw) / 2 - 20;
      var kind = /Shift/i.test(label) ? 'shift' : (/Sub/i.test(label) ? 'sub' : (/Mix/i.test(label) ? 'mix' : 'other'));
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var on = kind === 'sub' ? true : (kind === 'shift' ? (c < r) : (kind === 'mix' ? c === 1 : true));
        var cls = 'd-cell ' + (on ? (kind === 'sub' ? 'hot' : (kind === 'shift' ? 'hot2' : 'hot4')) : 'touch');
        b += '<rect class="' + cls + '" x="' + (gx + c * (cell + gp)) + '" y="' + (y0 + r * (cell + gp)) + '" width="' + cell + '" height="' + cell + '" rx="4"/>';
        if (kind === 'sub') b += '<text class="d-ct on" x="' + (gx + c * (cell + gp) + cell / 2) + '" y="' + (y0 + r * (cell + gp) + cell / 2 + 3.5) + '" text-anchor="middle">S</text>';
      }
      if (kind === 'shift') for (var r2 = 1; r2 < 4; r2++) {
        b += '<path class="d-arrow warm" d="M' + (gx + gw + 4) + ' ' + (y0 + r2 * (cell + gp) + cell / 2) + ' h 13" opacity=".85"/>';
        b += '<text class="d-axis" x="' + (gx - 8) + '" y="' + (y0 + r2 * (cell + gp) + cell / 2 + 3.5) + '" text-anchor="end">←' + r2 + '</text>';
      }
      if (kind === 'mix') b += '<path class="d-bracket" d="M' + (gx + cell + gp - 4) + ' ' + (y0 - 4) + ' h -6 v ' + (4 * cell + 3 * gp + 8) + ' h 6"/>';
      var bx = gx + gw / 2;
      b += '<text class="d-op-cap" x="' + bx + '" y="' + (y0 + 4 * cell + 3 * gp + 22) + '">' + esc(label) + '</text>';
      wrap((op.captions || [])[si] || '', slot - 30).slice(0, capLines).forEach(function (t, k) {
        b += '<text class="d-axis" x="' + bx + '" y="' + (y0 + 4 * cell + 3 * gp + 40 + k * 15) + '" text-anchor="middle">' + esc(t) + '</text>';
      });
      if (si < steps.length - 1) b += '<path class="d-arrow" d="M' + (gx + gw + 24) + ' ' + (y0 + 2 * cell) + ' h ' + Math.max(16, slot - gw - 48) + '"/>';
    });
    noteLines.forEach(function (t, k) {
      b += '<text class="d-note" x="52" y="' + (y0 + 4 * cell + 3 * gp + 40 + capLines * 17 + k * 20) + '">' + esc(t) + '</text>';
    });
    return { H: sh.H, body: b };
  }

  /* MDS 作用方向在若干族平行线之间轮换 */
  function opDirections(geo, S, op) {
    var dirs = op.directions || [];
    var cur = op.current != null ? op.current : 0;
    var H = 440;
    var b = '<rect class="d-bg" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      '<text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>' +
      wrap(geo.subtitle || '', W - 76).map(function (t, k) { return '<text class="d-sub" x="34" y="' + (58 + k * 17) + '">' + esc(t) + '</text>'; }).join('');
    var n = geo.rows, m = geo.cols;
    var slot = (W - 80) / dirs.length;
    var gap = m > 12 ? 2 : 3;
    var cell = Math.max(5, Math.min(22, (slot - 46 - (m - 1) * gap) / m, (300 - (n - 1) * gap) / n));
    var gw = m * cell + (m - 1) * gap;
    dirs.forEach(function (d, di) {
      var gx = 52 + di * slot + (slot - gw - 28) / 2, gy = 122 + Math.max(0, wrap(geo.subtitle || '', W - 76).length - 1) * 17;
      var on = op.showAll || op.sequential ? true : di === cur;
      b += '<rect class="d-frame" x="' + (gx - 14) + '" y="' + (gy - 34) + '" width="' + (gw + 28) + '" height="' + (n * cell + (n - 1) * gap + 72) + '" rx="10"' + (on ? ' stroke="#3f85d6" stroke-dasharray="none"' : '') + '/>';
      var dlw = slot - 10, dadj = (LANG === 'en' && panelTitleW(d.label) > dlw) ? ' textLength="' + dlw.toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
      b += '<text class="d-panel-label" x="' + (gx - 12) + '" y="' + (gy - 42) + '"' + (on ? ' fill="#1c4f86"' : '') + dadj + '>' + esc(d.label) + '</text>';
      var GC = ['hot', 'hot2', 'hot3', 'hot4', 'hot5'];
      var distinct = new Set();
      for (var rr = 0; rr < n; rr++) for (var cc = 0; cc < m; cc++) distinct.add(d.group(cc, rr));
      var many = distinct.size > 6;              // 组太多时用双色条纹表示分组粒度
      var pal = many ? ['hot', 'touch'] : GC;
      b += '<g opacity="' + (on ? 1 : 0.42) + '">';
      for (var r = 0; r < n; r++) for (var c = 0; c < m; c++) {
        var g = d.group(c, r);
        b += '<rect class="d-cell ' + pal[g % pal.length] + '" x="' + (gx + c * (cell + gap)) + '" y="' + (gy + r * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" rx="' + (cell > 9 ? 3 : 1) + '"/>';
      }
      b += '</g>';
      b += '<text class="d-axis" x="' + (gx + gw / 2) + '" y="' + (gy - 8) + '" text-anchor="middle">' + ((op.groupCounts && op.groupCounts[di]) || distinct.size) + L(' 组', ' ' + plural((op.groupCounts && op.groupCounts[di]) || distinct.size, 'group')) + (many ? L(' · 深浅相间', ' · alternating shades') : '') + '</text>';
      // 行列刻度，让小图能对回主状态的坐标
      var stp = Math.max(1, Math.ceil(m / 6)), stq = Math.max(1, Math.ceil(n / 6));
      for (var ci = 0; ci < m; ci += stp) b += '<text class="d-axis" x="' + (gx + ci * (cell + gap) + cell / 2) + '" y="' + (gy + n * (cell + gap) + 6) + '" text-anchor="middle" font-size="8">' + ci + '</text>';
      for (var ri = 0; ri < n; ri += stq) b += '<text class="d-axis" x="' + (gx - 4) + '" y="' + (gy + ri * (cell + gap) + cell / 2 + 3) + '" text-anchor="end" font-size="8">' + ri + '</text>';
      var foot = (op.panelLabels && op.panelLabels[di]) || (op.sequential ? L('第 ' + (di + 1) + ' 遍', 'pass ' + (di + 1)) : (on ? L('本轮', 'this round') : L('其他轮', 'other rounds')));
      wrap(foot, LANG === 'en' ? Math.max(gw + 20, Math.min(slot - 24, gw + 100)) : gw + 20).forEach(function (t, k) {
        b += '<text class="d-axis" x="' + (gx + gw / 2) + '" y="' + (gy + n * (cell + gap) + 18 + k * 14) + '" text-anchor="middle">' + esc(t) + '</text>';
      });
    });
    var dTitle = op.detailTitle || (op.sequential ? L('同一轮里依次执行的几遍', 'Passes run in sequence within one round') : L('分组方式逐轮轮换', 'The grouping changes from round to round'));
    var zd = zone(34, 0, W - 68, 74, dTitle, [op.formula || '', op.note || ''].concat(op.examples || []));
    var gyTop = 122 + Math.max(0, wrap(geo.subtitle || '', W - 76).length - 1) * 17;
    H = gyTop + n * (cell + gap) + 74 + zd.h + 26;
    b += zoneSvg(34, H - zd.h - 26, W - 68, 74, dTitle, [op.formula || '', op.note || ''].concat(op.examples || []));
    return { H: H, body: b };
  }


  /* 没有格子状状态的算法：画构造级的步骤链 */
  function noLattice(alg, step) {
    var r=alg.rounds[step], b='<text class="d-title" x="34" y="36">' + L('CHAMP · 2×2 模 p 矩阵', 'CHAMP · 2×2 matrix mod p') + '</text><text class="d-sub" x="34" y="58">' + L('数学状态 H_M 与摘要编码分开：CHAMP-512 元素宽 128 位，CHAMP-1024 为 256 位', 'The mathematical state H_M is kept apart from the digest encoding: entries are 128 bits wide in CHAMP-512, 256 bits in CHAMP-1024') + '</text>';
    (LANG === 'en' ? ['INIT · identity matrix','SEL · select by bit','MUL · right-multiply mod p','FIN · invertible encoding'] : ['INIT · 单位矩阵','SEL · 按 bit 选择','MUL · 右乘 mod p','FIN · 可逆编码']).forEach(function(t,i){
      var x=38+i*250;
      b+='<rect class="d-node '+(i===step?'on':'')+'" x="'+x+'" y="90" width="222" height="42" rx="10"/>'+fitText('d-node-t',x+111,116,200,t,' text-anchor="middle"');
      if(i<3)b+='<path class="d-arrow faint" d="M'+(x+224)+' 111 h22"/>';
    });
    function matrix(x,y,title,values,on){
      var q='<text class="d-panel-label" x="'+x+'" y="'+(y-16)+'">'+esc(title)+'</text>';
      values.forEach(function(v,i){var cx=x+(i%2)*96,cy=y+Math.floor(i/2)*62;q+='<rect class="d-node '+(on?'on':'')+'" x="'+cx+'" y="'+cy+'" width="88" height="54" rx="9"/>'+fitText('d-node-t',cx+44,cy+32,78,v,' text-anchor="middle"');});return q;
    }
    b+=matrix(52,188,L('H_M · 当前状态', 'H_M · current state'),step===0?['1','0','0','1']:['a','b','c','d'],step===0||step===2);
    b+=matrix(330,188,'G₀ = A · bit 0',['−2','1','4','−3'],step===1);
    b+=matrix(610,188,'G₁ = B · bit 1',['−5','2','−6','2'],step===1);
    b+='<text class="d-op-cap" x="908" y="216">H′ = H_M · G_bit</text><text class="d-note" x="834" y="241">' + L('右乘后逐元素模 p', 'each entry reduced mod p') + '</text><text class="d-note" x="834" y="266">' + L('未做长度填充', 'no length padding') + '</text>';
    var lines=String(r[3]).split('\n');
    if(step===2)lines=[L('G=[[u,v],[w,z]]；H′=[a·u+b·w, a·v+b·z; c·u+d·w, c·v+d·z] mod p', 'G=[[u,v],[w,z]]; H′=[a·u+b·w, a·v+b·z; c·u+d·w, c·v+d·z] mod p')].concat(lines);
    if(step===3)lines.push(L('C 实现：按列主序 (a,c,b,d) 各自 inv₀，再按元素小端序写出；inv₀(0)=0。', 'C implementation: apply inv₀ to each entry in column-major order (a,c,b,d), then write each entry little-endian; inv₀(0)=0.'));
    var zz=zone(34,356,W-68,94,r[0]+' · '+r[1],lines);
    b+=zz.svg;
    var nn=zone(34,356+zz.h+18,W-68,74,L('同态性质属于矩阵状态', 'The homomorphism belongs to the matrix state'), LANG === 'en' ? ['H_M(XY)=H_M(X)·H_M(Y). Digests must be decoded into matrices, multiplied and re-encoded; the digest byte strings themselves cannot be multiplied as matrices.','No author revision seen as of 2026-09-30.'] : ['H_M(XY)=H_M(X)·H_M(Y)。摘要先解码为矩阵再相乘、重新编码；摘要字节串本身不能直接做矩阵乘法。','截至 2026-09-30 未见作者修订。']);
    b+=nn.svg;var H=356+zz.h+18+nn.h+26;
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="CHAMP"><title>'+esc(r[1])+'</title>'+defs()+'<rect class="d-bg" width="'+W+'" height="'+H+'"/>'+b+'</svg>';
  }


  /* 每个单元自带操作清单，再叠加已知的依赖链 */
  function opParallelBranches(geo, op) {
    var sub = wrap(geo.subtitle || '', W - 76), y = 180 + sub.length * 17;
    var zy = y + 150, z = zone(34, zy, W - 68, 104, L('双分支的计算与修订边界', 'Computation of the two branches and the revision boundary'), op.summary || []);
    var H = zy + z.h + 26;
    var b = '<rect class="d-bg" width="' + W + '" height="' + H + '"/><text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>';
    sub.forEach(function (t, k) { b += '<text class="d-sub" x="34" y="' + (58 + k * 17) + '">' + esc(t) + '</text>'; });
    b += '<text class="d-panel-label" x="60" y="' + (y - 48) + '">' + L('A · 本步输入', 'A · step input') + '</text><text class="d-panel-label" x="850" y="' + (y - 48) + '">' + L('本步输出', 'step output') + '</text>';
    b += '<rect class="d-node on" x="60" y="' + (y - 24) + '" width="145" height="48" rx="9"/><text class="d-node-t" x="132" y="' + (y + 5) + '">' + L('同一个 A · 1536 位', 'same A · 1536 bits') + '</text>';
    op.branches.forEach(function (branch, i) {
      var by = y + (i === 0 ? -85 : 85), cls = i === 0 ? '' : 'warm';
      b += '<path class="d-arrow ' + cls + '" d="M205 ' + y + ' H265 V' + by + ' H330"/>';
      b += '<rect class="d-op" x="338" y="' + (by - 35) + '" width="360" height="70" rx="10"/>';
      b += '<text class="d-op-t" x="518" y="' + (by - 7) + '">' + esc(branch.label) + '</text><text class="d-op-f" x="518" y="' + (by + 17) + '">' + esc(branch.constant) + '</text>';
      b += '<path class="d-arrow ' + cls + '" d="M700 ' + by + ' H786 V' + y + ' H812"/>';
    });
    b += '<circle class="c-xor" cx="830" cy="' + y + '" r="17"/><text class="d-op-sym" x="830" y="' + (y + 7) + '">⊕</text><path class="d-arrow green" d="M850 ' + y + ' H894"/>';
    b += '<rect class="d-node on" x="900" y="' + (y - 24) + '" width="105" height="48" rx="9"/><text class="d-node-t" x="952" y="' + (y + 5) + '">Cube-f(A)</text>';
    b += z.svg;
    return { H: H, body: b };
  }

  function opWire(geo, S, op) {
    if (op.branches) return opParallelBranches(geo, op);
    var per = op.perCell || {};                 // { "A0": ["ROL29","<<7"], ... }
    var chain = op.chain || [];                 // [{from:"C1",to:"B1",label:"⊕"}, ...]
    var lines = op.summary || [];
    var zh = 46 + lines.length * 21;
    var sh = shell(geo, S, zh), b = sh.head;
    b += bandsSvg(geo, S.L) + bandsSvg(geo, S.R);
    function nm(c, r) { return nameOf(geo, c, r) || (c + ',' + r); }
    var inM = op.inMarks || null, outM = op.outMarks || null;   // 单元标注：读 / 写的步骤编号或来源
    b += drawGrid(S.L, function (c, r) { var k = nm(c, r); return { cls: (inM ? inM[k] : per[k]) ? 'hot' : 'touch', text: '', textOn: true }; });
    b += drawGrid(S.R, function (c, r) { return { cls: (!outM || outM[nm(c, r)]) ? 'hot4' : 'touch', text: '', textOn: true }; });
    // 单元名 + 操作清单；格子太小就改成按行汇总，放到说明区
    var small = S.L.cw < 26;
    var rowSummary = [];
    if (small) {
      // 按「运算清单相同」归组，组内名称压成区间，避免一格一行
      var order = [], byOps = {};
      for (var rr = 0; rr < geo.rows; rr++) for (var cc = 0; cc < geo.cols; cc++) {
        var key = (per[nm(cc, rr)] || []).join(' ');
        if (!key) continue;
        if (!byOps[key]) { byOps[key] = []; order.push(key); }
        byOps[key].push(nm(cc, rr));
      }
      order.forEach(function (key) {
        var names = byOps[key], parts = [], st = 0;
        for (var i = 1; i <= names.length; i++) {
          var contiguous = i < names.length &&
            names[i].slice(0, -1) === names[i - 1].slice(0, -1) &&
            names[i].charCodeAt(names[i].length - 1) === names[i - 1].charCodeAt(names[i - 1].length - 1) + 1;
          if (!contiguous) {
            parts.push(i - st > 2 ? (names[st] + '–' + names[i - 1]) : names.slice(st, i).join(L('、', ', ')));
            st = i;
          }
        }
        rowSummary.push(parts.join(L('、', ', ')) + L('：', ': ') + key);
      });
    }
    [S.L, S.R].forEach(function (g, gi) {
      for (var r = 0; r < geo.rows; r++) for (var c = 0; c < geo.cols; c++) {
        var name = nm(c, r);
        var ops = small ? [] : gi === 0 ? ((inM && inM[name]) || (inM ? [] : (per[name] || []))) : ((outM && outM[name]) || []);
        if (g.cw < 26 || g.ch < 16) continue;
        if (ops.length && g.ch < 26 + ops.length * 12) ops = ops.slice(0, Math.max(1, Math.floor((g.ch - 20) / 12)));
        var top = g.top(r) + (ops.length ? 15 : g.ch / 2 + 4);
        b += fitText('d-cellname', g.cx(c), top, g.cw - 5, name, ' text-anchor="middle"');
        ops.forEach(function (t, k) {
          b += fitText('d-cellop', g.cx(c), top + 15 + k * 12, g.cw - 5, t, ' text-anchor="middle"');
        });
      }
    });
    var ob = opBox(S.mid, S.cy, op.sym || 'λ', op.cap || L('线性层', 'linear layer'), op.formula);
    b += ob.svg;
    b += '<path class="d-arrow faint" d="M' + (S.L.right() + 16) + ' ' + S.cy + ' H ' + (S.mid - ob.hw - 8) + '"/>';
    b += '<path class="d-arrow faint" d="M' + (S.mid + ob.hw + 8) + ' ' + S.cy + ' H ' + (S.R.x - 14) + '"/>';
    b += caps(S, op.leftCap || L('格内列出该数组本层承受的运算', 'each cell lists the operations applied to it in this layer'), op.rightCap || L('全部单元都被改写', 'every unit is rewritten'));
    var zb = zone(34, sh.zoneY, W - 68, zh, op.detailTitle || L('这一层由哪些运算组成', 'What this layer is made of'), rowSummary.concat(lines));
    b += zb.svg;
    var H2 = Math.max(sh.H, sh.zoneY + zb.h + 26);
    if (op.assignments && op.assignments.length) {
      var ay = sh.zoneY + zb.h + 14, count = Math.ceil(op.assignments.length / 2);
      var ah = 60 + count * 26;
      b += '<rect class="d-zone" x="34" y="' + ay + '" width="' + (W - 68) + '" height="' + ah + '" rx="12"/>';
      b += '<text class="d-zone-t" x="52" y="' + (ay + 24) + '">' + L('按编号 01 → ' + String(op.assignments.length).padStart(2, '0') + ' 顺序执行；读取此前更新后的值', 'Executed in order 01 → ' + String(op.assignments.length).padStart(2, '0') + '; each statement reads values already updated') + '</text>';
      op.assignments.forEach(function (t, i) {
        var ax = i < count ? 52 : W / 2 + 18, ry = i % count;
        b += '<text class="d-op-f d-l" x="' + ax + '" y="' + (ay + 54 + ry * 26) + '">' + esc(String(i + 1).padStart(2, '0') + '  ' + t) + '</text>';
      });
      H2 = ay + ah + 26;
    }
    if (chain.length) {
      var cy2 = op.assignments && op.assignments.length ? H2 + 8 : sh.zoneY + zb.h + 34;
      b += '<rect class="d-zone" x="34" y="' + (cy2 - 24) + '" width="' + (W - 68) + '" height="76" rx="12"/>';
      b += '<text class="d-zone-t" x="52" y="' + (cy2 - 2) + '">' + esc(op.chainTitle || L('已知的一条依赖链', 'A known dependency chain')) + '</text>';
      var seq = [chain[0].from].concat(chain.map(function (ed) { return ed.to; }));
      var gp = 46;
      chain.forEach(function (ed) { if (ed.label) gp = Math.max(gp, textWidth(ed.label) * 11 / 12 + 26); });
      var bw2 = 92, x0c = 56, yc = cy2 + 24;
      seq.forEach(function (nmx, i) {
        b += '<rect class="d-node on" x="' + (x0c + i * (bw2 + gp)) + '" y="' + yc + '" width="' + bw2 + '" height="30" rx="8"/>';
        b += '<text class="d-node-t" x="' + (x0c + i * (bw2 + gp) + bw2 / 2) + '" y="' + (yc + 20) + '">' + esc(nmx) + '</text>';
        if (i < seq.length - 1) {
          b += '<path class="d-arrow" d="M' + (x0c + i * (bw2 + gp) + bw2 + 4) + ' ' + (yc + 15) + ' h ' + (gp - 12) + '"/>';
          if (chain[i].label) b += '<text class="d-axis" x="' + (x0c + i * (bw2 + gp) + bw2 + gp / 2 - 4) + '" y="' + (yc - 4) + '" text-anchor="middle">' + esc(chain[i].label) + '</text>';
        }
      });
      if (op.chainNote) {
        var cnX = x0c + seq.length * (bw2 + gp) + 8;
        wrap(op.chainNote, Math.max(170, W - cnX - 40)).forEach(function (t, k) {
          b += '<text class="d-note" x="' + cnX + '" y="' + (yc + 20 + k * 18) + '">' + esc(t) + '</text>';
        });
      }
      H2 = cy2 + 76;
    }
    return { H: H2, body: b };
  }

  /* 按轮号奇偶切换的分组（例如 χ 的交叉配对） */
  function opPairing(geo, S, op) {
    var groups = op.groups || [];               // [{label:"偶数轮", sets:[["A0","B0","C0"],["A1","B1","C1"]]}, ...]
    var lines = op.summary || [];
    var W2 = W, H = 0;
    var b = '';
    var cell = 74, chH = 44, gapx = 14, gapy = 12;
    var panelW = geo.cols * (cell + gapx) - gapx + 76;
    var startX = (W2 - (groups.length * panelW + (groups.length - 1) * 40)) / 2;
    var y0 = 116 + Math.max(0, wrap(geo.subtitle || '', W - 76).length - 1) * 17;
    groups.forEach(function (gr, gi) {
      var px = startX + gi * (panelW + 40);
      b += '<rect class="d-frame" x="' + px + '" y="' + (y0 - 26) + '" width="' + panelW + '" height="' + (geo.rows * (chH + gapy) - gapy + 50) + '" rx="12"' + (gr.active ? ' stroke="#3f85d6" stroke-dasharray="none"' : '') + '/>';
      b += '<text class="d-panel-label" x="' + (px + 14) + '" y="' + (y0 - 36) + '"' + (gr.active ? ' fill="#1c4f86"' : '') + '>' + esc(gr.label) + '</text>';
      for (var r = 0; r < geo.rows; r++) for (var c = 0; c < geo.cols; c++) {
        var name = nameOf(geo, c, r) || (c + ',' + r);
        var si = gr.sets.findIndex(function (st) { return st.indexOf(name) >= 0; });
        var cls = si === 0 ? 'hot' : si === 1 ? 'hot2' : si === 2 ? 'hot3' : 'dim';
        var x = px + 20 + c * (cell + gapx), y = y0 + r * (chH + gapy);
        b += '<rect class="d-cell ' + cls + '" x="' + x + '" y="' + y + '" width="' + cell + '" height="' + chH + '" rx="7"/>';
        b += '<text class="d-cellname" x="' + (x + cell / 2) + '" y="' + (y + chH / 2 + 5) + '" text-anchor="middle">' + esc(name) + '</text>';
      }
      // 组内连线：底部彩色括号
      gr.sets.forEach(function (st, si2) {
        var xs = st.map(function (nmx) {
          for (var r3 = 0; r3 < geo.rows; r3++) for (var c3 = 0; c3 < geo.cols; c3++)
            if ((nameOf(geo, c3, r3) || (c3 + ',' + r3)) === nmx) return px + 20 + c3 * (cell + gapx) + cell / 2;
          return null;
        }).filter(function (v) { return v !== null; });
        var ys = st.map(function (nmx) {
          for (var r4 = 0; r4 < geo.rows; r4++) for (var c4 = 0; c4 < geo.cols; c4++)
            if ((nameOf(geo, c4, r4) || (c4 + ',' + r4)) === nmx) return y0 + r4 * (chH + gapy) + chH;
          return null;
        }).filter(function (v) { return v !== null; });
        if (xs.length < 2) return;
        var col = si2 === 0 ? '#3f85d6' : '#d98324';
        var yy = y0 + geo.rows * (chH + gapy) - gapy + 12 + si2 * 16;
        var x1 = Math.min.apply(null, xs), x2 = Math.max.apply(null, xs);
        b += '<path fill="none" stroke="' + col + '" stroke-width="1.6" d="M' + x1 + ' ' + yy + ' H ' + x2 + '"/>';
        xs.forEach(function (xv, k) {
          b += '<path fill="none" stroke="' + col + '" stroke-width="1.6" d="M' + xv + ' ' + ys[k] + ' V ' + yy + '"/>';
        });
        b += '<text class="d-axis" x="' + (x2 + 10) + '" y="' + (yy + 4) + '" fill="' + col + '">' + L('组 ', 'group ') + (si2 + 1) + '</text>';
      });
    });
    var bodyBottom = y0 + geo.rows * (chH + gapy) - gapy + 62;
    var zb = zone(34, bodyBottom + 16, W2 - 68, 46, op.detailTitle || L('同一个 S 盒，两种配对', 'One S-box, two pairings'), lines);
    H = bodyBottom + 16 + zb.h + 26;
    var head = '<rect class="d-bg" x="0" y="0" width="' + W2 + '" height="' + H + '"/>' +
      '<text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>' +
      '<text class="d-sub" x="34" y="58">' + esc(op.cap || geo.subtitle) + '</text>';
    b = head + b + zoneSvg(34, bodyBottom + 16, W2 - 68, 46, op.detailTitle || L('同一个 S 盒，两种配对', 'One S-box, two pairings'), lines);
    return { H: H, body: b };
  }

  /* 单元整体按一个循环置换轮转（例如 τ） */
  function opCycle(geo, S, op) {
    var order = op.order || [];                 // 环上的名称顺序
    var n = order.length;
    var cx = W / 2 - 150, cy0 = 250 + Math.max(0, wrap(geo.subtitle || '', W - 76).length - 1) * 17, R = 130;
    var fwd = op.direction !== 'reverse';
    var lines = op.summary || [];
    var zb = zone(34, 0, W - 68, 46, op.detailTitle || L('这一层怎么调度', 'How this layer is scheduled'), lines);
    var H = cy0 + R + 90 + zb.h;
    var b = '<rect class="d-bg" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      '<text class="d-title" x="34" y="36">' + esc(geo.title) + '</text>' +
      '<text class="d-sub" x="34" y="58">' + esc(op.cap || geo.subtitle) + '</text>';
    var pts = order.map(function (_, i) {
      var th = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + R * Math.cos(th), cy0 + R * Math.sin(th)];
    });
    pts.forEach(function (p, i) {
      var q = pts[(i + 1) % n];
      var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      var ox = (mx - cx) * 0.22, oy = (my - cy0) * 0.22;
      var from = fwd ? p : q, to = fwd ? q : p;
      // 起止点退到节点圆外，箭头才看得见
      var dx = to[0] - from[0], dy = to[1] - from[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
      var s0 = [from[0] + dx / L * 30, from[1] + dy / L * 30];
      var e0 = [to[0] - dx / L * 32, to[1] - dy / L * 32];
      b += '<path class="d-arrow" d="M' + s0[0] + ' ' + s0[1] + ' Q ' + (mx + ox) + ' ' + (my + oy) + ' ' + e0[0] + ' ' + e0[1] + '" opacity=".9"/>';
    });
    pts.forEach(function (p, i) {
      b += '<circle class="d-node on" cx="' + p[0] + '" cy="' + p[1] + '" r="26"/>';
      b += '<text class="d-node-t" x="' + p[0] + '" y="' + (p[1] + 5) + '">' + esc(order[i]) + '</text>';
    });
    b += '<text class="d-axis" x="' + cx + '" y="' + (cy0 + 5) + '" text-anchor="middle">' + esc(fwd ? L('σ 正向', 'σ forward') : L('σ⁻¹ 逆向', 'σ⁻¹ inverse')) + '</text>';
    // 调度条
    var sx = cx + R + 70, sw = W - sx - 50;
    var sched = op.schedule || [];
    b += '<text class="d-panel-label" x="' + sx + '" y="' + (cy0 - R + 4) + '">' + L('轮次调度', 'Round schedule') + '</text>';
    var bw = sw / Math.max(1, sched.length);
    sched.forEach(function (t, i) {
      var on = i === (op.current || 0);
      b += '<rect class="d-cell ' + (t.dir === 'fwd' ? 'hot' : 'hot2') + '" x="' + (sx + i * bw) + '" y="' + (cy0 - R + 18) + '" width="' + (bw - 4) + '" height="34" rx="6"' + (on ? '' : ' opacity=".45"') + '/>';
      var sl = LANG === 'en' ? wrap(t.label, (bw - 12) * 12 / 10.5).slice(0, 2) : [t.label];
      sl.forEach(function (q, k) {
        b += '<text class="d-ct on" x="' + (sx + i * bw + (bw - 4) / 2) + '" y="' + (cy0 - R + 39 - (sl.length - 1) * 6 + k * 12) + '" text-anchor="middle">' + esc(q) + '</text>';
      });
    });
    var rightLines = [op.netNote || ''].concat(op.rightNotes || []).flatMap(function (t) { return wrap(t, sw); });
    rightLines.forEach(function (t, i) {
      b += '<text class="d-note" x="' + sx + '" y="' + (cy0 - R + 78 + i * 22) + '">' + esc(t) + '</text>';
    });
    b += zoneSvg(34, H - zb.h - 26, W - 68, 46, op.detailTitle || L('这一层怎么调度', 'How this layer is scheduled'), lines);
    return { H: H, body: b };
  }

  var OPS = {
    const: opConst, laneRotate: opLaneRotate, laneShift: opLaneShift,
    permute: opPermute, sbox: opSbox, columnMix: opColumnMix, parity: opParity,
    laneFunc: opLaneFunc, laneMix: opLaneMix, butterfly: opButterfly,
    bitShuffle: opBitShuffle, aesRound: opAesRound, directions: opDirections,
    wire: opWire, pairing: opPairing, cycle: opCycle
  };

  function render(alg, step) {
    var geo = alg.diagram;
    if (!geo) return null;
    var out;
    if (geo.kind === 'flow') out = opFlow(alg, geo, step);
    else {
      var op = geo.ops && geo.ops[step];
      if (!op || !OPS[op.kind]) return null;
      out = OPS[op.kind](geo, build(geo), op);
    }
    if (!out) return null;
    // 安全网：文字换行后可能超出预留高度，按实际内容把画布撑开
    var maxY = 0, m;
    var reRect = /<rect[^>]*\sy="(-?[\d.]+)"[^>]*\sheight="(-?[\d.]+)"/g;
    while ((m = reRect.exec(out.body))) maxY = Math.max(maxY, +m[1] + +m[2]);
    var reText = /<text[^>]*\sy="(-?[\d.]+)"/g;
    while ((m = reText.exec(out.body))) maxY = Math.max(maxY, +m[1] + 6);
    if (maxY + 20 > out.H) out.H = Math.ceil(maxY + 26);
    var r = alg.rounds[step];
    var body = out.body.replace(/<rect class="d-bg"[^>]*\/>/, '<rect class="d-bg" x="0" y="0" width="' + W + '" height="' + out.H + '"/>');
    return '<svg viewBox="0 0 ' + W + ' ' + out.H + '" role="img" aria-label="' + esc(alg.name + ' ' + r[1]) + '">' +
      '<title>' + esc(alg.name + ' · ' + r[0] + ' ' + r[1]) + '</title>' + defs() + body + '</svg>';
  }

  global.HashDiagram = {
    render: render,
    renderNoLattice: function (alg, step) { return alg.noLattice ? noLattice(alg, step) : null; },
    setLang: function (lang) { LANG = lang === 'en' ? 'en' : 'zh'; },
    getLang: function () { return LANG; }
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---------- 总体构造图 ---------- */
(function (global) {
  "use strict";
  var W = 1040;
  // 与 HashDiagram 共用同一个语言开关
  function L(zh, en) { var H = global.HashDiagram; return H && H.getLang && H.getLang() === 'en' ? en : zh; }
  var S = [
    '.c-bg{fill:#ffffff}',
    '.c-t{font:600 12px "Segoe UI",system-ui,sans-serif;fill:#0f172a;text-anchor:middle}',
    '.c-s{font:500 10.5px ui-monospace,Menlo,monospace;fill:#7c8b9d;text-anchor:middle}',
    '.c-sl{font:500 10.5px ui-monospace,Menlo,monospace;fill:#7c8b9d}',
    '.c-lab{font:500 11.5px "Segoe UI",system-ui,sans-serif;fill:#64748b}',
    '.c-lab-c{font:500 11.5px "Segoe UI",system-ui,sans-serif;fill:#64748b;text-anchor:middle}',
    '.c-tag{font:600 10.5px "Segoe UI",system-ui,sans-serif;fill:#94a3b8;letter-spacing:.06em}',
    '.c-rail{stroke:#cbd5e1;stroke-width:2.4;fill:none}',
    '.c-rail.rate{stroke:#3f85d6}',
    '.c-rail.cap{stroke:#94a3b8}',
    '.c-perm{fill:#eef4fb;stroke:#3f85d6;stroke-width:1.6}',
    '.c-perm2{fill:#f4f1fb;stroke:#7c5cd6;stroke-width:1.6}',
    '.c-perm-t{font:700 14px "Segoe UI",system-ui,sans-serif;fill:#1c4f86;text-anchor:middle}',
    '.c-perm-s{font:500 10.5px ui-monospace,Menlo,monospace;fill:#5b7796;text-anchor:middle}',
    '.c-msg{fill:#e8f1fc;stroke:#7fa9dc;stroke-width:1.3}',
    '.c-out{fill:#dff2ea;stroke:#199c7c;stroke-width:1.6}',
    '.c-ff{fill:#fdf0dc;stroke:#d98324;stroke-width:1.4}',
    '.c-xor{fill:#ffffff;stroke:#3f85d6;stroke-width:1.8}',
    '.c-xor.ff{stroke:#d98324}',
    '.c-xor-t{font:700 13px "Segoe UI",system-ui,sans-serif;fill:#334155;text-anchor:middle}',
    '.c-ar{fill:none;stroke:#3f85d6;stroke-width:1.6;marker-end:url(#cA)}',
    '.c-ar.ff{stroke:#d98324;marker-end:url(#cAW);stroke-dasharray:5 4}',
    '.c-ar.out{stroke:#199c7c;marker-end:url(#cAG)}',
    '.c-ar.plain{marker-end:none}',
    '.c-band{fill:#f8fafc;stroke:#e6ecf3}',
    '.c-dim{fill:none;stroke:#94a3b8;stroke-width:1.2}',
    '.c-phase{fill:#f3f6fa;stroke:#a9bcd2;stroke-width:1.3}',
    '.c-note{font:400 11.5px "Segoe UI",system-ui,sans-serif;fill:#64748b}'
  ].join('');
  function mk(id, c) { return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="' + c + '"/></marker>'; }
  function d() { return '<defs>' + mk('cA', '#3f85d6') + mk('cAW', '#d98324') + mk('cAG', '#199c7c') + '<style>' + S + '</style></defs>'; }
  function e(s) { var t = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); return L(t, t.replace(/ {2,}/g, function (m) { return ' ' + new Array(m.length).join('\u00a0'); })); }
  function cTextW(t, px) {
    var n = 0;
    for (var i = 0; i < String(t).length; i++) n += String(t).charCodeAt(i) > 0x2e80 ? 1 : 0.56;
    return n * px;
  }
  function wrapByWidth(t, maxPx, px) {
    if (!t) return [];
    var out = [], cur = '';
    t = String(t);
    for (var i = 0; i < t.length; i++) {
      if (L(0, 1) && cur === '' && out.length && t[i] === ' ') continue;   // 英文续行不以空格开头
      cur += t[i];
      if (cTextW(cur, px) > maxPx) {
        var cut = Math.max(1, cur.length - 1);
        for (var j = cur.length - 1; j > cur.length - 18 && j > 0; j--) {
          if (' ⊕⊞∧∨→←‖'.indexOf(cur[j]) >= 0) { cut = j; break; }
          if ('，。；：、,.)]）」'.indexOf(cur[j]) >= 0) { cut = j + 1; break; }
        }
        out.push(cur.slice(0, cut)); cur = cur.slice(cut);
        if (L(0, 1)) cur = cur.replace(/^ +/, '');
      }
    }
    if (cur) out.push(cur);
    return out;
  }
  function xor(x, y, cls) {
    return '<circle class="c-xor ' + (cls || '') + '" cx="' + x + '" cy="' + y + '" r="11"/><text class="c-xor-t" x="' + x + '" y="' + (y + 4.5) + '">⊕</text>';
  }
  /* 底部说明条：按宽度折行，高度随行数增长 */
  function band(y, note) {
    var nl = wrapByWidth(note || '', W - 104, 11.5);
    if (!nl.length) nl = [''];
    var bh = 22 + nl.length * 17, o = '<rect class="c-band" x="34" y="' + y + '" width="' + (W - 68) + '" height="' + bh + '" rx="10"/>';
    nl.forEach(function (t, k) { o += '<text class="c-note" x="52" y="' + (y + 22 + k * 17) + '">' + e(t) + '</text>'; });
    return { svg: o, h: bh };
  }
  /* 一个带标题与若干副标题行的方框，文字一律折行，绝不溢出 */
  function labelBox(cls, x, y, w, title, subs, tCls, sCls) {
    var tl = wrapByWidth(title || '', w - 18, 13);
    var sl = [];
    (subs || []).forEach(function (t) { if (t) wrapByWidth(t, w - 18, 10.5).forEach(function (q) { sl.push(q); }); });
    var h = 18 + tl.length * 17 + sl.length * 14 + 10;
    var o = '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12"/>';
    function put(cls, px, t, yy) {
      var tw = cTextW(t, px), maxW = w - 12;
      var adj = tw > maxW ? ' textLength="' + maxW.toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
      return '<text class="' + cls + '" x="' + (x + w / 2) + '" y="' + yy + '"' + adj + '>' + e(t) + '</text>';
    }
    tl.forEach(function (t, k) { o += put(tCls || 'c-perm-t', tCls === 'c-t' ? 13 : 14, t, y + 22 + k * 17); });
    sl.forEach(function (t, k) { o += put(sCls || 'c-perm-s', 10.5, t, y + 22 + tl.length * 17 + k * 14); });
    return { svg: o, h: h };
  }
  function svgOf(H, b) { return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + L('总体构造', 'overall construction') + '">' + d() + b + '</svg>'; }
  function msgName(c, i, n) {
    if (c.msgLabels && c.msgLabels[i]) return c.msgLabels[i];
    return (i === n - 1 ? 'M' + (i + 1) + '‖pad' : 'M' + (i + 1));
  }

  /* ---------- 标准海绵 / 前馈海绵 ---------- */
  function sponge(c) {
    var x0 = 96, stageW = 218, n = c.finalPerm ? 2 : 3;
    var rateY = 140, capY = 204;
    var full = c.ffScope === 'full';                 // 前馈整个状态，而不是只有容量
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('吸收阶段', 'absorbing phase')) + '</text>';
    b += '<text class="c-lab" x="44" y="' + (rateY + 4) + '">rate</text>';
    b += '<text class="c-lab" x="44" y="' + (capY + 4) + '">' + e(c.capName || 'capacity') + '</text>';
    b += '<text class="c-sl" x="44" y="' + (rateY - 20) + '">' + e(c.rateBits || '') + '</text>';
    b += '<text class="c-sl" x="44" y="' + (capY + 22) + '">' + e(c.capBits || '') + '</text>';
    b += '<text class="c-lab" x="44" y="' + (rateY - 40) + '">' + e(c.ivLabel || 'IV = 0') + '</text>';
    var i, endX = x0 + n * stageW + 22;
    b += '<path class="c-rail rate" d="M' + x0 + ' ' + rateY + ' H ' + endX + '"/>';
    b += '<path class="c-rail cap" d="M' + x0 + ' ' + capY + ' H ' + endX + '"/>';
    var bottom = capY + 34;
    for (i = 0; i < n; i++) {
      var sx = x0 + i * stageW, px = sx + 110;
      var pw = Math.min(stageW - 56, 150), px0 = px + 38 - pw / 2;
      var mx = c.absorbAfter ? (px0 + pw + 26) : (sx + 42);
      b += '<rect class="c-msg" x="' + (mx - 42) + '" y="34" width="84" height="34" rx="8"/>';
      b += (function (t) { var tw = cTextW(t, 13), adj = tw > 74 ? ' textLength="74" lengthAdjust="spacingAndGlyphs"' : ''; return '<text class="c-t" x="' + mx + '" y="55"' + adj + '>' + e(t) + '</text>'; })(msgName(c, i, n));
      b += '<path class="c-ar" d="M' + mx + ' 68 V ' + (rateY - 13) + '"/>';
      b += xor(mx, rateY);
      var pl = [];
      String(c.perm).split('\n').forEach(function (t) { wrapByWidth(t, pw - 18, 13).forEach(function (q) { pl.push(q); }); });
      b += '<rect class="c-perm" x="' + px0 + '" y="' + (rateY - 34) + '" width="' + pw + '" height="' + (capY - rateY + 68) + '" rx="12"/>';
      pl.forEach(function (t, k) {
        b += '<text class="c-perm-t" x="' + (px0 + pw / 2) + '" y="' + ((rateY + capY) / 2 + 5 - (pl.length - 1) * 9 + k * 18) + '">' + e(t) + '</text>';
      });
      if (c.feedforward) {
        var fy = capY + 62, ffL = px0 - 16, ffR = px0 + pw + 18;
        var tapY = full ? rateY : capY, hitY = full ? rateY : capY;
        if (full) {
          // 取值与写回都跨 rate + capacity 两条轨道
          b += '<path class="c-dim" d="M' + ffL + ' ' + rateY + ' V ' + capY + '" stroke="#d98324"/>';
          b += '<path class="c-ar ff" d="M' + ffL + ' ' + capY + ' V ' + fy + ' H ' + ffR + ' V ' + (capY + 13) + '"/>';
          b += '<path class="c-ar ff plain" d="M' + ffR + ' ' + fy + ' V ' + fy + '"/>';
          b += '<path class="c-dim" d="M' + ffR + ' ' + rateY + ' V ' + capY + '" stroke="#d98324"/>';
          b += xor(ffR, capY, 'ff') + xor(ffR, rateY, 'ff');
        } else {
          b += '<path class="c-ar ff" d="M' + ffL + ' ' + tapY + ' V ' + fy + ' H ' + ffR + ' V ' + (hitY + 13) + '"/>';
          b += xor(ffR, hitY, 'ff');
        }
        if (i === 0) b += '<text class="c-lab" x="' + (ffL - 4) + '" y="' + (fy + 20) + '" fill="#b06a17">' + e(c.ffLabel || L('把置换前的容量侧前馈回来', 'capacity before the permutation is fed forward')) + '</text>';
        bottom = fy + 28;
      }
    }
    if (c.finalTag) {
      var tx = x0 + (n - 1) * stageW + 42;
      b += xor(tx, capY, 'ff');
      b += '<text class="c-lab" x="' + (tx - 40) + '" y="' + (capY - 18) + '">' + e(c.finalTag) + '</text>';
      if (c.finalTagNote) { var tb = band(bottom + 12, c.finalTagNote); b += tb.svg; bottom += tb.h + 12; }
    }
    if (c.finalPerm) {
      var fx = endX + 24, fw = 116;
      b += '<rect class="c-perm" x="' + fx + '" y="' + (rateY - 34) + '" width="' + fw + '" height="' + (capY-rateY+68) + '" rx="12"/>';
      b += '<text class="c-perm-t" x="' + (fx+fw/2) + '" y="' + ((rateY+capY)/2) + '">' + e(c.finalPerm) + '</text><text class="c-perm-s" x="' + (fx+fw/2) + '" y="' + ((rateY+capY)/2+22) + '">' + L('终结 · 无前馈', 'final · no feed-forward') + '</text>';
      b += '<path class="c-rail rate" d="M' + endX + ' ' + rateY + ' H ' + fx + ' M' + (fx + fw) + ' ' + rateY + ' H ' + (fx + fw + 10) + '"/>';
      b += '<path class="c-rail cap" d="M' + endX + ' ' + capY + ' H ' + fx + ' M' + (fx + fw) + ' ' + capY + ' H ' + (fx + fw + 10) + '"/>';
      endX = fx + fw + 10;
    }
    var both = c.outFrom === 'both';
    var ox = endX + 26, oy = both ? (rateY + capY) / 2 : (c.outFrom === 'capacity' ? capY : rateY);
    var subLines = wrapByWidth(c.outSub || '', 150, 10.5);
    var ow = Math.max(112, Math.min(200, cTextW(c.outLabel || '', 13) + 24));
    subLines.forEach(function (t) { ow = Math.max(ow, Math.min(200, cTextW(t, 10.5) + 20)); });
    var oh = 30 + subLines.length * 14;
    if (both) {
      b += '<path class="c-ar out plain" d="M' + endX + ' ' + rateY + ' H ' + (endX + 14) + ' V ' + oy + '"/>';
      b += '<path class="c-ar out plain" d="M' + endX + ' ' + capY + ' H ' + (endX + 14) + ' V ' + oy + '"/>';
      b += '<path class="c-ar out" d="M' + (endX + 14) + ' ' + oy + ' H ' + (ox + 8) + '"/>';
    } else
    b += '<path class="c-ar out" d="M' + endX + ' ' + oy + ' H ' + (ox + 8) + '"/>';
    b += '<rect class="c-out" x="' + (ox + 10) + '" y="' + (oy - oh / 2) + '" width="' + ow + '" height="' + oh + '" rx="10"/>';
    b += '<text class="c-t" x="' + (ox + 10 + ow / 2) + '" y="' + (oy - oh / 2 + 20) + '">' + e(c.outLabel || L('摘要 h 位', 'h-bit digest')) + '</text>';
    subLines.forEach(function (t, k) {
      b += '<text class="c-s" x="' + (ox + 10 + ow / 2) + '" y="' + (oy - oh / 2 + 36 + k * 14) + '">' + e(t) + '</text>';
    });
    var nb = band(bottom + 18, c.note);
    b += nb.svg;
    var H = bottom + 18 + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  /* ---------- 中点前馈海绵：置换拆成 g / h 两半 ---------- */
  function midSponge(c) {
    var x0 = 90, stageW = 338, n = 2;
    var rateY = 136, capY = 200;
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('中点前馈', 'midpoint feed-forward')) + '</text>';
    b += '<text class="c-lab" x="44" y="' + (rateY + 4) + '">rate</text>';
    b += '<text class="c-lab" x="44" y="' + (capY + 4) + '">' + e(c.capName || 'capacity') + '</text>';
    b += '<text class="c-sl" x="44" y="' + (rateY - 20) + '">' + e(c.rateBits || '') + '</text>';
    b += '<text class="c-sl" x="44" y="' + (capY + 22) + '">' + e(c.capBits || '') + '</text>';
    b += '<text class="c-lab" x="44" y="' + (rateY - 40) + '">' + e(c.ivLabel || 'IV = 0') + '</text>';
    var i, endX = x0 + n * stageW + 10;
    b += '<path class="c-rail rate" d="M' + x0 + ' ' + rateY + ' H ' + endX + '"/>';
    b += '<path class="c-rail cap" d="M' + x0 + ' ' + capY + ' H ' + endX + '"/>';
    var pw = 110, boxTop = rateY - 34, boxH = capY - rateY + 68;
    function permBox(bx, lines) {
      var o = '<rect class="c-perm" x="' + bx + '" y="' + boxTop + '" width="' + pw + '" height="' + boxH + '" rx="12"/>';
      var ls = [];
      String(lines).split('\n').forEach(function (t) { wrapByWidth(t, pw - 16, 13).forEach(function (q) { ls.push(q); }); });
      ls.forEach(function (t, k) {
        o += '<text class="c-perm-t" x="' + (bx + pw / 2) + '" y="' + ((rateY + capY) / 2 + 5 - (ls.length - 1) * 9 + k * 18) + '">' + e(t) + '</text>';
      });
      return o;
    }
    for (i = 0; i < n; i++) {
      var sx = x0 + i * stageW, mx = sx + 40;
      b += '<rect class="c-msg" x="' + (mx - 40) + '" y="34" width="84" height="34" rx="8"/>';
      b += (function (t) { var tw = cTextW(t, 13), adj = tw > 74 ? ' textLength="74" lengthAdjust="spacingAndGlyphs"' : ''; return '<text class="c-t" x="' + (mx + 2) + '" y="55"' + adj + '>' + e(t) + '</text>'; })(msgName(c, i, n));
      b += '<path class="c-ar" d="M' + mx + ' 68 V ' + (rateY - 13) + '"/>';
      b += xor(mx, rateY);
      var gx = sx + 72, midX = gx + pw + 24, hx = midX + 24;
      b += permBox(gx, c.permG || 'g') + permBox(hx, c.permH || 'h');
      var fy = capY + 52, ffL = gx - 16;
      b += '<path class="c-ar ff" d="M' + ffL + ' ' + capY + ' V ' + fy + ' H ' + midX + ' V ' + (capY + 13) + '"/>';
      b += xor(midX, capY, 'ff');
      if (c.midLabel) b += '<text class="c-s" x="' + (midX + 56) + '" y="' + (capY + 44) + '" fill="#b06a17">' + e(c.midLabel) + '</text>';
      if (c.spanLabel) {
        var sy = capY + 80, gL = gx, gR = hx + pw;
        b += '<path class="c-dim" d="M' + gL + ' ' + (sy - 6) + ' V ' + (sy + 6) + ' M' + gL + ' ' + sy + ' H ' + gR + ' M' + gR + ' ' + (sy - 6) + ' V ' + (sy + 6) + '"/>';
        b += '<text class="c-s" x="' + ((gL + gR) / 2) + '" y="' + (sy + 20) + '">' + e(c.spanLabel) + '</text>';
      }
    }
    var ffy = capY + 126;
    if (c.ffLabel) {
      wrapByWidth(c.ffLabel, W - 100, 11.5).forEach(function (t, k) {
        b += '<text class="c-lab" x="44" y="' + (ffy + k * 17) + '" fill="#b06a17">' + e(t) + '</text>';
      });
      ffy += wrapByWidth(c.ffLabel, W - 100, 11.5).length * 17;
    }
    var ox = endX + 18, oy = (c.outFrom === 'capacity' ? capY : rateY);
    var subLines = wrapByWidth(c.outSub || '', 150, 10.5);
    var ow = Math.max(112, Math.min(196, cTextW(c.outLabel || '', 13) + 24));
    subLines.forEach(function (t) { ow = Math.max(ow, Math.min(196, cTextW(t, 10.5) + 20)); });
    var oh = 30 + subLines.length * 14;
    b += '<path class="c-ar out" d="M' + endX + ' ' + oy + ' H ' + (ox + 8) + '"/>';
    b += '<rect class="c-out" x="' + (ox + 10) + '" y="' + (oy - oh / 2) + '" width="' + ow + '" height="' + oh + '" rx="10"/>';
    b += '<text class="c-t" x="' + (ox + 10 + ow / 2) + '" y="' + (oy - oh / 2 + 20) + '">' + e(c.outLabel || L('摘要', 'digest')) + '</text>';
    subLines.forEach(function (t, k) {
      b += '<text class="c-s" x="' + (ox + 10 + ow / 2) + '" y="' + (oy - oh / 2 + 36 + k * 14) + '">' + e(t) + '</text>';
    });
    var nb = band(ffy + 8, c.note);
    b += nb.svg;
    var H = ffy + 8 + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  /* ---------- 交替双分支海绵：A / 共享 C / B ---------- */
  function dualSponge(c) {
    var x0 = 108, stageW = 172, n = 4;
    var aY = 128, cY = 208, bY = 288;
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('交替双分支', 'alternating dual branch')) + '</text>';
    var endX = x0 + n * stageW + 22, i;
    b += '<path class="c-rail rate" d="M' + x0 + ' ' + aY + ' H ' + endX + '"/>';
    b += '<path class="c-rail cap" d="M' + x0 + ' ' + cY + ' H ' + endX + '"/>';
    b += '<path class="c-rail rate" d="M' + x0 + ' ' + bY + ' H ' + endX + '"/>';
    // 第三项：折行时向上（-1）、居中（-0.5）还是向下（0）展开，避开轨道上下的位宽标注
    [[aY, (c.railNames || [])[0] || L('分支 A', 'branch A'), 0], [cY, (c.railNames || [])[1] || L('共享 C', 'shared C'), -1], [bY, (c.railNames || [])[2] || L('分支 B', 'branch B'), -0.5]].forEach(function (rl) {
      // 英文轨道名较长：放不进轨道左端时折行（中文保持单行）
      var ls = L(0, 1) ? wrapByWidth(rl[1], x0 - 42, 11.5).slice(0, 3) : [rl[1]];
      ls.forEach(function (t, k) { b += '<text class="c-lab" x="40" y="' + (rl[0] + 4 + rl[2] * (ls.length - 1) * 14 + k * 14) + '">' + e(t) + '</text>'; });
    });
    b += '<text class="c-sl" x="40" y="' + (aY - 14) + '">' + e(c.rateBits || '') + '</text>';
    b += '<text class="c-sl" x="40" y="' + (cY + 22) + '">' + e(c.capBits || '') + '</text>';
    for (i = 0; i < n; i++) {
      var sx = x0 + i * stageW, mx = sx + 42, px = sx + 112;
      var up = i % 2 === 0, mY = up ? aY : bY;
      var top = up ? aY - 26 : cY - 26, bot = up ? cY + 26 : bY + 26;
      b += '<rect class="c-msg" x="' + (mx - 42) + '" y="' + (up ? 34 : 330) + '" width="84" height="30" rx="8"/>';
      b += '<text class="c-t" x="' + mx + '" y="' + (up ? 54 : 350) + '">' + e((c.msgLabels && c.msgLabels[i]) || ('M' + (i + 1))) + '</text>';
      b += '<path class="c-ar" d="M' + mx + ' ' + (up ? 64 : 330) + ' V ' + (up ? aY - 13 : bY + 13) + '"/>';
      b += xor(mx, mY);
      b += '<rect class="c-perm" x="' + px + '" y="' + top + '" width="72" height="' + (bot - top) + '" rx="12"/>';
      b += '<text class="c-perm-t" x="' + (px + 36) + '" y="' + ((top + bot) / 2 + 5) + '">' + (up ? 'f₁' : 'f₂') + '</text>';
      if (c.capFeedback) {                       // 每次置换之后把输出容量异或回共享轨
        var fx = px + 72 + 20;
        b += xor(fx, cY, 'ff');
        b += '<path class="c-ar ff" d="M' + (px - 14) + ' ' + cY + ' V ' + (cY + 34) + ' H ' + fx + ' V ' + (cY + 13) + '"/>';
      }
    }
    var oy = cY;
    b += '<path class="c-ar out" d="M' + endX + ' ' + oy + ' H ' + (endX + 34) + '"/>';
    var dw = L(118, Math.max(118, Math.min(W - endX - 44, Math.max(cTextW(c.outLabel || 'trunc(C)', 13), cTextW(c.outSub || '', 10.5)) + 20)));
    b += '<rect class="c-out" x="' + (endX + 36) + '" y="' + (oy - 21) + '" width="' + dw + '" height="42" rx="10"/>';
    b += '<text class="c-t" x="' + (endX + 36 + dw / 2) + '" y="' + (oy - 2) + '">' + e(c.outLabel || 'trunc(C)') + '</text>';
    b += '<text class="c-s" x="' + (endX + 36 + dw / 2) + '" y="' + (oy + 13) + '">' + e(c.outSub || '') + '</text>';
    var bottom = 380;
    if (c.capFeedback && c.ffLabel) { b += '<text class="c-lab" x="40" y="398" fill="#b06a17">' + e(c.ffLabel) + '</text>'; bottom = 410; }
    var nb = band(bottom, c.note);
    b += nb.svg;
    var H = bottom + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  /* ---------- 交织 Feistel 海绵：1 条 rate + 2 条 capacity，两次置换串行 ---------- */
  function ifsSponge(c) {
    var b = '<text class="c-tag" x="34" y="26">' + e(c.tag) + L(' · 一个完整 Step', ' · one complete step') + '</text>';
    var sx=140, ly=230, ry=342, p1=292, p2=592, pw=128;
    function rail(x1,y1,x2,y2,cls) { return '<path class="c-ar ' + (cls||'plain') + '" d="M'+x1+' '+y1+' H'+x2+' V'+y2+'"/>'; }
    b += '<text class="c-lab" x="34" y="144">S · rate</text><text class="c-lab" x="34" y="234">L · capacity</text><text class="c-lab" x="34" y="346">R · capacity</text>';
    b += '<text class="c-sl" x="34" y="116">' + e(c.rateBits) + '</text><text class="c-sl" x="34" y="376">' + e(c.capBits) + '</text>';
    b += labelBox('c-msg',150,40,80,'Mᵢ',[],'c-t','c-s').svg;
    b += '<path class="c-ar" d="M190 74 V127"/>' + xor(190,sx);
    b += rail(132,sx,p1,sx,'plain') + rail(132,ly,p1,ly,'plain');
    b += xor(190,ly,'ff') + '<text class="c-lab" x="145" y="205">⊕ enc(D)</text>';
    [[p1,L('P1 · 12 轮', 'P1 · 12 rounds')],[p2,L('P2 · 12 轮', 'P2 · 12 rounds')]].forEach(function(q){b+='<rect class="c-perm" x="'+q[0]+'" y="105" width="'+pw+'" height="162" rx="12"/><text class="c-perm-t" x="'+(q[0]+pw/2)+'" y="184">'+q[1]+'</text><text class="c-perm-s" x="'+(q[0]+pw/2)+'" y="205">'+L('1920 位', '1920 bits')+'</text>';});
    b += rail(p1+pw,sx,p2,sx,'plain') + '<text class="c-lab" x="465" y="125">A</text>';
    b += rail(p1+pw,ly,p2,ly,'plain') + '<text class="c-lab" x="438" y="214">B</text>';
    b += '<path class="c-ar" d="M132 342 H500 V243"/>' + xor(500,ly,'ff') + '<text class="c-lab" x="520" y="215">R ⊕ B</text>';
    b += '<path class="c-ar plain" d="M448 230 V342 H804"/>';
    b += '<circle cx="448" cy="230" r="3" fill="#3f85d6"/>';
    b += rail(p2+pw,ly,946,ly,'plain') + '<text class="c-lab" x="802" y="214">L′ = C</text>';
    b += '<circle cx="784" cy="230" r="3" fill="#3f85d6"/><path class="c-ar" d="M784 230 V295 H816 V329"/>';
    b += xor(816,ry,'ff') + rail(829,ry,946,ry,'plain') + '<text class="c-lab" x="850" y="326">R′ = B ⊕ C</text>';
    b += rail(p2+pw,sx,806,sx,'out') + labelBox('c-out',808,108,184,L('S′ → 摘要', 'S′ → digest'),[L('从 rate 取前 512 位', 'first 512 bits of rate')],'c-t','c-s').svg;
    var nb=band(402,c.note), H=402+nb.h+18;
    return svgOf(H,'<rect class="c-bg" width="'+W+'" height="'+H+'"/>'+b+nb.svg);
  }

  /* 压缩盒内画 b 路并行分支（Counter-bDM 等）：标题 + 纵向排列的分支小盒 */
  function parallelBox(x, y, w, c) {
    var items = c.parallel.items, capL = c.parallel.caption ? wrapByWidth(c.parallel.caption, w - 20, 10.5) : [];
    var hh = 34 + items.length * 27 + 8 + capL.length * 14 + (capL.length ? 4 : 0);
    var q = '<rect class="c-perm" x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="12"/>';
    q += '<text class="c-perm-t" x="' + (x + w / 2) + '" y="' + (y + 24) + '">' + e(c.box || 'F') + '</text>';
    items.forEach(function (t, k) {
      var yy = y + 34 + k * 27;
      if (t === '⋮') { q += '<text class="c-t" x="' + (x + w / 2) + '" y="' + (yy + 16) + '">⋮</text>'; return; }
      q += '<rect class="c-msg" x="' + (x + 12) + '" y="' + yy + '" width="' + (w - 24) + '" height="22" rx="6"/>';
      var tw = cTextW(t, 11.5), adj = tw > w - 34 ? ' textLength="' + (w - 34).toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
      q += '<text class="c-s" x="' + (x + w / 2) + '" y="' + (yy + 15) + '"' + adj + '>' + e(t) + '</text>';
    });
    capL.forEach(function (t, k) {
      q += '<text class="c-s" x="' + (x + w / 2) + '" y="' + (y + 34 + items.length * 27 + 12 + k * 14) + '">' + e(t) + '</text>';
    });
    return { svg: q, h: hh };
  }

  function chain(c) {
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('迭代压缩', 'iterated compression')) + '</text>';
    var x0 = 92, stageW = 286, n = 2, cy = 178, bw = 156;
    var i, boxes = [];
    for (i = 0; i < n; i++) {
      var sx = x0 + i * stageW, bx = sx + 88;
      var lb = c.parallel ? parallelBox(bx, cy - 46, bw, c) : labelBox('c-perm', bx, cy - 46, bw, c.box || 'F', [c.boxSub1, c.boxSub2]);
      boxes.push({ x: bx, top: cy - 46, h: lb.h, svg: lb.svg });
    }
    var boxH = Math.max.apply(null, boxes.map(function (o) { return o.h; }));
    var top = cy - boxH / 2, bottomBox = cy + boxH / 2;
    b += '<path class="c-rail cap" d="M' + (x0 - 48) + ' ' + cy + ' H ' + (x0 + (n - 1) * stageW + 88 + bw + 56) + '"/>';
    for (i = 0; i < n; i++) {
      var sx2 = x0 + i * stageW, bx2 = sx2 + 88;
      var lab = (c.msgLabels && c.msgLabels[i]) || ('m' + (i + 1) + L('　', '  ') + 'Cnt' + (i + 1));
      var mw = Math.max(110, Math.min(268, cTextW(lab, 13) + 26));
      b += '<rect class="c-msg" x="' + (bx2 + bw / 2 - mw / 2) + '" y="40" width="' + mw + '" height="34" rx="8"/>';
      var mtw = cTextW(lab, 13), madj = mtw > mw - 12 ? ' textLength="' + (mw - 12).toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
      b += '<text class="c-t" x="' + (bx2 + bw / 2) + '" y="61"' + madj + '>' + e(lab) + '</text>';
      b += '<path class="c-ar" d="M' + (bx2 + bw / 2) + ' 74 V ' + (top - 4) + '"/>';
      b += (c.parallel ? parallelBox(bx2, top, bw, c) : labelBox('c-perm', bx2, top, bw, c.box || 'F', [c.boxSub1, c.boxSub2])).svg;
      if (c.preLast && i === n - 1) { b += '<rect class="c-msg" x="' + (bx2-56) + '" y="' + (cy-16) + '" width="40" height="32" rx="8"/><text class="c-t" x="' + (bx2-36) + '" y="' + (cy+5) + '">π</text>'; }
      // 消息绕过置换、在盒后再异或一次（JH 式宽管）
      if (c.msgBypass) {
        var mbY = top - 22, mbX = bx2 + bw + 20;
        b += '<path class="c-ar ff" d="M' + (bx2 + bw / 2 + 12) + ' ' + (top - 6) + ' V ' + mbY + ' H ' + mbX + ' V ' + (cy - 13) + '"/>';
        b += xor(mbX, cy, 'ff');
      }
      // 块内 Davies–Meyer 前馈：链值绕过压缩盒再异或回来
      if (c.dmFeedback) {
        var tapX = bx2 - 18, hitX = bx2 + bw + 20, fy = bottomBox + 34;
        b += '<path class="c-ar ff" d="M' + tapX + ' ' + cy + ' V ' + fy + ' H ' + hitX + ' V ' + (cy + 13) + '"/>';
        b += xor(hitX, cy, 'ff');
      }
      b += '<text class="c-lab-c" x="' + (sx2 + 24) + '" y="' + (cy - 12) + '">' + (i === 0 ? (c.ivLabel || 'H₀ = IV') : 'H' + i) + '</text>';
    }
    var ffBottom = c.dmFeedback ? bottomBox + 34 + 24 : bottomBox + 12;
    if ((c.dmFeedback || c.msgBypass) && c.dmLabel) {
      wrapByWidth(c.dmLabel, W - 100, 11.5).forEach(function (t, k) {
        b += '<text class="c-lab" x="' + (x0 - 40) + '" y="' + (ffBottom + 6 + k * 17) + '" fill="#b06a17">' + e(t) + '</text>';
      });
      ffBottom += 22 + (wrapByWidth(c.dmLabel, W - 100, 11.5).length - 1) * 17;
    }
    if (c.skipEdge) {
      var sxA = x0 + 88 + bw / 2, sxB = x0 + stageW + 88 + bw / 2, sy = ffBottom + 26;
      b += '<path class="c-ar ff" d="M' + sxA + ' ' + bottomBox + ' V ' + sy + ' H ' + sxB + ' V ' + (bottomBox + 4) + '"/>';
      b += '<text class="c-lab" x="' + (x0 - 40) + '" y="' + (sy + 22) + '" fill="#b06a17">' + e(c.skipLabel || L('新链值同时依赖前两个链值', 'each new chaining value depends on the previous two')) + '</text>';
      ffBottom = sy + 34;
    }
    var cbLines = wrapByWidth(c.chainBits || '', c.dmFeedback ? 116 : 132, 10.5).slice(0, 3);
    cbLines.forEach(function (t, k) {
      var yy = c.dmFeedback ? (cy - 30 - (cbLines.length - 1 - k) * 14) : (cy + 24 + k * 14);
      b += '<text class="c-sl" x="' + (x0 - 48) + '" y="' + yy + '">' + e(t) + '</text>';
    });
    var lastX = x0 + (n - 1) * stageW + 88 + bw;
    b += '<text class="c-lab-c" x="' + (lastX + 28) + '" y="' + (cy - 12) + '">H' + n + '</text>';
    var fb = labelBox('c-out', lastX + 56, top, 182, c.finalBox || L('终结函数', 'finalisation'), [c.finalSub1, c.finalSub2], 'c-t', 'c-s');
    b += fb.svg;
    var bottom = Math.max(ffBottom, top + fb.h + 12, bottomBox + 12) + 12;
    var nb = band(bottom, c.note);
    b += nb.svg;
    var H = bottom + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  /* ---------- 流式（逐拍注入，不是块吸收） ---------- */
  function stream(c) {
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('流式驱动', 'stream-driven')) + '</text>';
    var phases = c.phases || [];
    var gap = 22, x = 46, cy = 172;
    var pw = Math.floor((W - 92 - gap * phases.length - 180) / Math.max(1, phases.length));
    pw = Math.max(120, Math.min(210, pw));
    var maxH = 0, xs = [];
    phases.forEach(function (p) {
      var lb = labelBox('c-phase', 0, 0, pw, p.title, [p.sub1, p.sub2]);
      maxH = Math.max(maxH, lb.h);
    });
    phases.forEach(function (p, i) {
      xs.push(x);
      b += labelBox('c-phase', x, cy - maxH / 2, pw, p.title, [p.sub1, p.sub2]).svg;
      if (p.feed) {
        var fw = L(104, Math.max(104, Math.min(pw + 40, cTextW(p.feed, 13) + 20)));
        b += '<rect class="c-msg" x="' + (x + pw / 2 - fw / 2) + '" y="' + (cy - maxH / 2 - 62) + '" width="' + fw + '" height="32" rx="8"/>';
        b += '<text class="c-t" x="' + (x + pw / 2) + '" y="' + (cy - maxH / 2 - 41) + '">' + e(p.feed) + '</text>';
        b += '<path class="c-ar" d="M' + (x + pw / 2) + ' ' + (cy - maxH / 2 - 30) + ' V ' + (cy - maxH / 2 - 6) + '"/>';
      }
      if (i < phases.length - 1) b += '<path class="c-ar" d="M' + (x + pw) + ' ' + cy + ' H ' + (x + pw + gap - 2) + '"/>';
      x += pw + gap;
    });
    var subLines = wrapByWidth(c.outSub || '', 150, 10.5);
    var oh = 30 + subLines.length * 14;
    b += '<path class="c-ar out" d="M' + x + ' ' + cy + ' H ' + (x + 18) + '"/>';
    b += '<rect class="c-out" x="' + (x + 20) + '" y="' + (cy - oh / 2) + '" width="158" height="' + oh + '" rx="10"/>';
    b += '<text class="c-t" x="' + (x + 99) + '" y="' + (cy - oh / 2 + 20) + '">' + e(c.outLabel || L('摘要', 'digest')) + '</text>';
    subLines.forEach(function (t, k) { b += '<text class="c-s" x="' + (x + 99) + '" y="' + (cy - oh / 2 + 36 + k * 14) + '">' + e(t) + '</text>'; });
    // 状态说明
    var sy = cy + maxH / 2 + 26;
    if (c.stateLabel) { b += '<text class="c-lab" x="46" y="' + sy + '">' + e(c.stateLabel) + '</text>'; sy += 24; }
    var nb = band(sy, c.note);
    b += nb.svg;
    var H = sy + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  /* ---------- 树哈希 ---------- */
  function tree(c) {
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('二叉树哈希', 'binary tree hash')) + '</text>';
    var leafY = 92, parentY = 218, rootY = 318;
    var chunks = c.chunks || 4, perChunk = c.blocksPerChunk || 2;
    var cw = 84, cgap = 14, groupGap = 46;
    var groupW = perChunk * cw + (perChunk - 1) * cgap;
    var totalW = chunks * groupW + (chunks - 1) * groupGap;
    var x0 = (W - totalW) / 2 - 40, i, j;
    var leafCx = [];
    for (i = 0; i < chunks; i++) {
      var gx = x0 + i * (groupW + groupGap);
      for (j = 0; j < perChunk; j++) {
        var bx = gx + j * (cw + cgap);
        b += '<rect class="c-perm" x="' + bx + '" y="' + leafY + '" width="' + cw + '" height="42" rx="10"/>';
        b += '<text class="c-perm-t" x="' + (bx + cw / 2) + '" y="' + (leafY + 20) + '">' + e(c.leafBox || 'F') + '</text>';
        b += '<text class="c-perm-s" x="' + (bx + cw / 2) + '" y="' + (leafY + 34) + '">' + e('M' + (i * perChunk + j + 1)) + '</text>';
        if (j) b += '<path class="c-ar plain" d="M' + (bx - cgap) + ' ' + (leafY + 21) + ' H ' + bx + '" marker-end="url(#cA)"/>';
      }
      b += '<text class="c-s" x="' + (gx + groupW / 2) + '" y="' + (leafY - 10) + '">chunk ' + i + L('（块内串行）', ' (serial inside)') + '</text>';
      leafCx.push(gx + groupW / 2);
    }
    b += '<text class="c-lab" x="34" y="58">' + e(c.leafLabel || L('chunk 之间互不依赖，可以并行', 'chunks are independent and can run in parallel')) + '</text>';
    var parentCx = [];
    for (i = 0; i < chunks / 2; i++) {
      var a = leafCx[2 * i], d2 = leafCx[2 * i + 1], px = (a + d2) / 2;
      b += '<rect class="c-perm" x="' + (px - 58) + '" y="' + parentY + '" width="116" height="40" rx="10"/>';
      b += '<text class="c-perm-t" x="' + px + '" y="' + (parentY + 25) + '">' + e(c.parentBox || 'PARENT') + '</text>';
      b += '<path class="c-ar" d="M' + a + ' ' + (leafY + 42) + ' V ' + (parentY - 18) + ' H ' + px + ' V ' + (parentY - 4) + '"/>';
      b += '<path class="c-ar" d="M' + d2 + ' ' + (leafY + 42) + ' V ' + (parentY - 18) + ' H ' + px + ' V ' + (parentY - 4) + '"/>';
      parentCx.push(px);
    }
    var rx = (parentCx[0] + parentCx[parentCx.length - 1]) / 2;
    b += '<rect class="c-out" x="' + (rx - 66) + '" y="' + rootY + '" width="132" height="40" rx="10"/>';
    b += '<text class="c-t" x="' + rx + '" y="' + (rootY + 25) + '">' + e(c.rootBox || 'ROOT') + '</text>';
    parentCx.forEach(function (px2) {
      b += '<path class="c-ar" d="M' + px2 + ' ' + (parentY + 40) + ' V ' + (rootY - 18) + ' H ' + rx + ' V ' + (rootY - 4) + '"/>';
    });
    var subLines = wrapByWidth(c.outSub || '', 160, 10.5);
    var oh = 30 + subLines.length * 14, ox = rx + 96;
    b += '<path class="c-ar out" d="M' + (rx + 66) + ' ' + (rootY + 20) + ' H ' + (ox - 4) + '"/>';
    b += '<rect class="c-out" x="' + ox + '" y="' + (rootY + 20 - oh / 2) + '" width="172" height="' + oh + '" rx="10"/>';
    b += '<text class="c-t" x="' + (ox + 86) + '" y="' + (rootY + 20 - oh / 2 + 20) + '">' + e(c.outLabel || L('摘要', 'digest')) + '</text>';
    subLines.forEach(function (t, k) { b += '<text class="c-s" x="' + (ox + 86) + '" y="' + (rootY + 20 - oh / 2 + 36 + k * 14) + '">' + e(t) + '</text>'; });
    if (c.flagLabel) b += '<text class="c-lab" x="34" y="' + (rootY + 66) + '">' + e(c.flagLabel) + '</text>';
    var bottom = rootY + (c.flagLabel ? 82 : 60);
    var nb = band(bottom, c.note);
    b += nb.svg;
    var H = bottom + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  /* ---------- 分阶段海绵：初始化 → 吸收 → 长度注入与中间处理 → 挤出前置换（Garnet） ---------- */
  function phasedSponge(c) {
    var ph = c.phases, rateY = 140, capY = 204, x0 = 96;
    var b = '<rect class="c-bg" x="0" y="0" width="' + W + '" height="600"/>';
    b += '<text class="c-tag" x="34" y="26">' + e(c.tag || L('分阶段海绵', 'phased sponge')) + '</text>';
    b += '<text class="c-lab" x="44" y="' + (rateY + 4) + '">rate</text>';
    b += '<text class="c-lab" x="44" y="' + (capY + 4) + '">' + e(c.capName || 'capacity') + '</text>';
    b += '<text class="c-sl" x="44" y="' + (rateY - 20) + '">' + e(c.rateBits || '') + '</text>';
    b += '<text class="c-sl" x="44" y="' + (capY + 22) + '">' + e(c.capBits || '') + '</text>';
    b += '<text class="c-lab" x="44" y="' + (rateY - 58) + '">' + e(c.ivLabel || 'IV') + '</text>';
    var boxTop = rateY - 34, boxH = capY - rateY + 68;
    function box(x, w, text, cls, sub) {
      var ls = String(text).split('\n');
      var o = '<rect class="' + (cls || 'c-perm') + '" x="' + x + '" y="' + boxTop + '" width="' + w + '" height="' + boxH + '" rx="12"/>';
      ls.forEach(function (t, k) {
        var tw = cTextW(t, 14), adj = (L(0, 1) && tw > w - 8) ? ' textLength="' + (w - 8).toFixed(1) + '" lengthAdjust="spacingAndGlyphs"' : '';
        o += '<text class="c-perm-t" x="' + (x + w / 2) + '" y="' + ((rateY + capY) / 2 + 5 - (ls.length - 1) * 9 + k * 18) + '"' + adj + '>' + e(t) + '</text>';
      });
      if (sub) o += '<text class="c-perm-s" x="' + (x + w / 2) + '" y="' + (boxTop + boxH + 18) + '">' + e(sub) + '</text>';
      return o;
    }
    function msg(x, t) {
      var o = '<rect class="c-msg" x="' + (x - 42) + '" y="34" width="84" height="34" rx="8"/>';
      var tw = cTextW(t, 13), adj = tw > 74 ? ' textLength="74" lengthAdjust="spacingAndGlyphs"' : '';
      o += '<text class="c-t" x="' + x + '" y="55"' + adj + '>' + e(t) + '</text>';
      return o + '<path class="c-ar" d="M' + x + ' 68 V ' + (rateY - 13) + '"/>' + xor(x, rateY);
    }
    var endX = 808;
    b += '<path class="c-rail rate" d="M' + x0 + ' ' + rateY + ' H ' + endX + '"/>';
    b += '<path class="c-rail cap" d="M' + x0 + ' ' + capY + ' H ' + endX + '"/>';
    b += box(150, 74, ph.init, 'c-perm', ph.initSub);
    [0, 1].forEach(function (i) {
      var sx = 236 + i * 186;
      b += msg(sx + 30, i === 0 ? 'M1' : 'Mℓ‖pad');
      b += box(sx + 62, 110, c.perm, 'c-perm', i === 0 ? ph.absorbSub : '');
    });
    b += msg(624, ph.lenTag || 'mlength');
    b += box(652, 72, ph.mid, 'c-perm');
    b += box(730, 72, ph.squeeze, 'c-perm');
    b += '<text class="c-perm-s" x="727" y="' + (boxTop + boxH + 18) + '">' + e(ph.tailSub || '') + '</text>';
    var oy = (rateY + capY) / 2, ox = endX + 20;
    var subLines = wrapByWidth(c.outSub || '', 150, 10.5);
    var ow = Math.max(112, Math.min(196, cTextW(c.outLabel || '', 13) + 24));
    subLines.forEach(function (t) { ow = Math.max(ow, Math.min(196, cTextW(t, 10.5) + 20)); });
    var oh = 30 + subLines.length * 14;
    b += '<path class="c-ar out plain" d="M' + endX + ' ' + rateY + ' H ' + (endX + 10) + ' V ' + oy + '"/>';
    b += '<path class="c-ar out plain" d="M' + endX + ' ' + capY + ' H ' + (endX + 10) + ' V ' + oy + '"/>';
    b += '<path class="c-ar out" d="M' + (endX + 10) + ' ' + oy + ' H ' + (ox + 8) + '"/>';
    b += '<rect class="c-out" x="' + (ox + 10) + '" y="' + (oy - oh / 2) + '" width="' + ow + '" height="' + oh + '" rx="10"/>';
    b += '<text class="c-t" x="' + (ox + 10 + ow / 2) + '" y="' + (oy - oh / 2 + 20) + '">' + e(c.outLabel || L('摘要', 'digest')) + '</text>';
    subLines.forEach(function (t, k) { b += '<text class="c-s" x="' + (ox + 10 + ow / 2) + '" y="' + (oy - oh / 2 + 36 + k * 14) + '">' + e(t) + '</text>'; });
    var bottom = boxTop + boxH + 34;
    var nb = band(bottom + 10, c.note);
    b += nb.svg;
    var H = bottom + 10 + nb.h + 16;
    return svgOf(H, b.replace('height="600"', 'height="' + H + '"'));
  }

  global.HashConstruction = {
    setLang: function (lang) { if (global.HashDiagram && global.HashDiagram.setLang) global.HashDiagram.setLang(lang); },
    render: function (a) {
      var c = a.construction;
      if (!c) return null;
      if (c.kind === 'sponge') {
        if (c.ifs) return ifsSponge(c);
        if (c.dual) return dualSponge(c);
        if (c.midFeedforward) return midSponge(c);
        if (c.phases) return phasedSponge(c);
        return sponge(c);
      }
      if (c.kind === 'chain') return chain(c);
      if (c.kind === 'stream') return stream(c);
      if (c.kind === 'tree') return tree(c);
      return null;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
