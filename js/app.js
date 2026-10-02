/* 合并站原型：页面与路由 */
(function () {
  const { esc } = M;
  const $ = s => document.querySelector(s);
  const T = () => window.UI[M.lang];
  const ROOT = window.SITE_ROOTS || { tracker: '', atlas: '' };
  const B = M.PERF.base, BN = ['SHA-512', 'SHA-256', 'SM3', 'SHA3-512'];
  const BASES = key => (key === 'zen4' || key === 's32') ? BN.map(n => ({ name: n, value: M.base(n, key) })) : [];
  /* 密码指令开关：各页面共用一个状态 */
  const isaSwitch = (withNote) => { const x = T().perf.isa; return `<div class="isa-box"><button type="button" class="isa-switch" role="switch" aria-checked="${M.isa}" data-isa><span class="track"><i></i></span><span>${esc(x.label)}<small>${esc(x.hint)}</small></span></button>${withNote ? `<p class="isa-note">${M.rich(x.note(M.isa))}</p>` : ''}</div>`; };
  const condName = k => `${T().perf.conds[k]} · ${T().perf.isa[M.isa ? 'on' : 'off']}`;
  const flagOf = (a, k) => { const f = M.pflag(a, k); return f ? T().perf.flag[f] : ''; };
  const FS = f => f ? (M.lang === 'en' ? ' ' : '') + f : '';   // 中文标注是全角括号，不加空格

  /* ---------- 小部件 ---------- */
  function anaPill(a) {
    const t = T().ana;
    if (a.ana === 'NA') return `<span class="lv lv-NA">${t.NA}</span>`;
    if (a.ana === 'OK') return `<span class="lv lv-OK">${t.OK}</span>`;
    if (a.ana === 'P') return `<span class="lv lv-P"><b>${a.claimLv}</b>${t.P}</span>`;
    return `<span class="lv lv-${a.ana}"><b>${a.ana}</b>${esc(t[a.ana])}</span>`;
  }
  const fPill = a => `<span class="pill ${a.fstatus}"><i class="dot ${a.fstatus}"></i>${esc(T().fstat[a.fstatus])}</span>`;
  const iTag = k => `<span class="lv lv-${esc(k)}" title="${esc(M.iName(k))}"><b>${esc(k)}</b>${esc(M.iName(k))}</span>`;
  const implCell = a => a.implLv ? iTag(a.implLv) : a.implFixed ? `<span class="lv lv-P">${M.lang === 'en' ? 'Revised' : '已修订'}</span>` : '<span class="muted">—</span>';
  const verCell = a => `<span class="ver">${a.versions.length > 1 ? `<span class="up">${esc(a.curVer)}</span> ↑` : esc(a.curVer)}</span>`;
  const algLink = (a, text) => `<a class="alg-link" href="#alg/${esc(a.id)}">${esc(text || a.name)}</a>`;
  const srcLinks = ids => (ids || []).map(id => `<a href="${esc(M.MSGURL(id))}" target="_blank" rel="noopener">${esc(id.slice(0, 8))} ↗</a>`).join(' ');
  /* 撤回：沿用追踪站的显示方式 */
  const wdTag = a => a.withdrawn ? `<span class="wdtag">${M.lang === 'en' ? 'Withdrawn' : '已撤回'}${a.cand.date ? ' · ' + esc(a.cand.date.slice(5)) : ''}</span>` : '';
  const wdBanner = a => a.withdrawn ? `<div class="wdban"><b>${M.lang === 'en' ? `Withdrawn by the submitters${a.cand.date ? ' on ' + esc(a.cand.date) : ''}.` : `提交方${a.cand.date ? '于 ' + esc(a.cand.date) + ' ' : ''}宣布撤回该算法。`}</b> ${esc(M.tx(a.cand.note, a.cand.note_en) || '')} ${(a.cand.msgs || []).map(id => `<a href="${esc(M.MSGURL(id))}" target="_blank" rel="noopener">${M.lang === 'en' ? 'Forum post' : '原帖'} ↗</a>`).join(' ')}<br><span class="wdsub">${M.lang === 'en' ? 'Findings and levels below are kept as they stood at withdrawal.' : '以下发现与等级保留撤回时的记录。'}</span></div>` : '';
  /* 设计内容晚于核对日期的修订：提示尚未纳入 */
  const driftNote = a => {
    const at = a.at, chk = at && at.revision && at.revision.checkedOn;
    if (!chk) return '';
    const later = a.versions.filter(v => !v.sub && v.date && v.date > chk);
    if (!later.length) return '';
    const vs = later.map(v => `${v.v}（${v.date}）`).join(M.lang === 'en' ? ', ' : '、').replace(/（/g, M.lang === 'en' ? ' (' : '（').replace(/）/g, M.lang === 'en' ? ')' : '）');
    return `<p class="drift">${M.lang === 'en' ? `The design content was compiled from material up to ${chk}; the later ${later.length > 1 ? 'revisions' : 'revision'} ${vs} ${later.length > 1 ? 'are' : 'is'} not yet reflected. See “Versions & documents” for what changed.` : `设计内容依据 ${chk} 前的材料整理，之后发布的 ${vs}尚未纳入；修订内容见“版本与资料”。`}</p>`;
  };
  const CO = () => M.lang === 'en' ? ': ' : '：', SE = () => M.lang === 'en' ? '; ' : '；', PAR = n => M.lang === 'en' ? ` (${n})` : `（${n}）`;
  const catName = c => M.lang === 'en' ? ({ '标准海绵': 'Standard sponge', '前馈海绵': 'Feed-forward sponge', '中途前馈': 'Mid-point feed-forward', '多分支海绵': 'Multi-branch sponge', '压缩函数迭代': 'Compression-function iteration', '其他': 'Other' }[c] || c) : c;
  const CATS = ['标准海绵', '前馈海绵', '中途前馈', '多分支海绵', '压缩函数迭代', '其他'];
  const atlasUrl = u => /^https?:/.test(u) ? u : ROOT.atlas + M.href(u);   // 本地文档路径逐段编码（含空格、中文）

  function feedItem(m) {
    const a = M.byName.get(m.algorithm);
    return `<li><i class="dot ${m.kind === 'response' ? 'ok' : m.kind === 'comment' ? 'pend' : 'none'}"></i><div>
      <div class="l1">${a ? algLink(a) : esc(m.algorithm)}<span class="kind ${m.kind}">${esc(T().kind[m.kind] || m.kind)}</span><span>${esc(m.author)}</span><span class="t">${esc(m.t.label)}</span></div>
      <div class="ex">${esc(M.excerpt(m.body, 200))} <a href="${esc(m.url)}" target="_blank" rel="noopener">${T().orig}</a></div></div></li>`;
  }

  /* ---------- 概览 ---------- */
  function viewHome() {
    const t = T();
    const last = M.talkAll[M.talkAll.length - 1];
    const kpis = [
      [t.kpi.cands, M.algs.length, (n => n ? (M.lang === 'en' ? `${n} withdrawn · ` : `已撤回 ${n} · `) : '')(M.algs.filter(a => a.withdrawn).length) + t.kpis.cands(M.algs.filter(a => a.thirdParty).length), 'candidates'],
      [`<span class="lv lv-A sm"><b>A</b></span>${t.kpi.A}`, M.acnt('A'), t.kpis.A, 'candidates/A'],
      [`<span class="lv lv-B sm"><b>B</b></span>${t.kpi.B}`, M.acnt('B'), t.kpis.B, 'candidates/B'],
      [`<span class="lv lv-P sm"><b>↻</b></span>${t.kpi.P}`, M.acnt('P'), t.kpis.P, 'candidates/P'],
      [`<i class="dot pend"></i>${t.kpi.pend}`, M.algs.filter(a => a.fstatus === 'pend').length, t.kpis.pend, 'candidates/pend'],
      [t.kpi.last, last ? last.t.label.replace(' UTC', '') : '—', last ? `${last.author} · ${last.algorithm}` : '', 'forum']
    ];
    // 安全现状 × 速度
    // 分界取同口径基线并按速度排序（允许密码指令时 SHA-256 快于 SHA-512）
    const cutB = ['SHA-512', 'SHA-256', 'SM3', 'SHA3-512'].map(n => ({ n, v: M.base(n, 'zen4') })).sort((p, q) => p.v - q.v);
    const cuts = cutB.map(c => c.v), NC = cuts.length;
    const col = v => v == null ? NC + 1 : cuts.findIndex(c => v < c) < 0 ? NC : cuts.findIndex(c => v < c);
    const heads = cutB.map(c => t.matrix.faster(c.n)).concat([t.matrix.slower(cutB[NC - 1].n), t.matrix.none]);
    const rows = ['A', 'B', 'P', 'C', 'OK', 'NA'];
    const pz = a => M.pv(a, 'zen4');
    const cell = (r, c) => M.algs.filter(a => a.ana === r && col(pz(a)) === c).sort((p, q) => (pz(p) ?? 1e9) - (pz(q) ?? 1e9));
    const matrix = `<div class="matrix-wrap"><table class="matrix"><thead><tr><th></th>${heads.map((c, i) => `<th>${esc(c)}${i < NC ? `<small>&lt; ${cuts[i].toFixed(2)}</small>` : ''}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr><th>${anaPill({ ana: r, claimLv: '↻' })}</th>${heads.map((_, c) => `<td>${cell(r, c).map(a => `<a class="chip${M.pflag(a, 'zen4') === 'ref' ? ' ref' : ''}" href="#alg/${a.id}" title="${esc(pz(a) != null ? M.fmtCpb(pz(a)) + ' cpb' + FS(flagOf(a, 'zen4')) : '')}">${esc(a.name)}</a>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const ups = M.algs.flatMap(a => a.versions.filter(v => !v.sub).map(v => ({ a, v })).concat(a.withdrawn ? [{ a, v: { v: M.lang === 'en' ? 'withdrawn' : '撤回', date: a.cand.date || '', wd: true, label: M.tx(a.cand.note, a.cand.note_en) || '' } }] : [])).sort((x, y) => (y.v.date || '').localeCompare(x.v.date || ''));
    const recent = M.talkAll.slice(-6).reverse();
    const routes = CATS.map(c => {
      const xs = M.algs.filter(a => a.category === c);
      return xs.length ? `<div class="route-row"><h3>${esc(catName(c))}<span>${xs.length}</span></h3><div>${xs.map(a => `<a class="route-chip ana-${a.ana}" href="#alg/${a.id}"><b>${esc(a.name)}</b><span>${esc(a.at ? a.at.subtitle : '')}</span></a>`).join('')}</div></div>` : '';
    }).join('');
    return `<section class="hero"><h1>${esc(t.site)}</h1><p class="lede">${M.rich(t.lede)}</p></section>
      <div class="note-bar"><span class="nb-i">ⓘ</span><span>${M.rich(t.disclaimer)}</span></div>
      <section class="kpis">${kpis.map(([k, v, s, go]) => `<a class="kpi kpi-${go.split('/').pop()}" href="#${go}"><span class="k">${k}</span><span class="v">${esc(v)}</span><span class="s">${esc(s)}</span></a>`).join('')}</section>
      <section class="panel"><div class="panel-h"><h2>${esc(t.matrix.title)}</h2>${isaSwitch(false)}</div><p class="note">${M.rich(t.matrix.note(M.isa))}</p>${matrix}</section>
      <div class="grid2">
        <section class="panel"><div class="panel-h"><h2>${esc(t.updates)}</h2></div>
          <ul class="upd">${ups.slice(0, 8).map(({ a, v }) => `<li><span class="d">${esc(v.date || '')}</span><span>${algLink(a, a.name + ' ' + v.v)} · ${esc(v.wd ? v.label : M.vLabel(a, v))}</span></li>`).join('')}</ul></section>
        <section class="panel"><div class="panel-h"><h2>${esc(t.recent)}</h2><a href="#forum">${esc(t.more)}</a></div><ul class="feed">${recent.map(feedItem).join('')}</ul></section>
      </div>
      <section class="panel"><div class="panel-h"><h2>${esc(t.routes)}</h2><a href="#compare">${esc(t.nav.compare)} →</a></div><div class="routes">${routes}</div></section>`;
  }

  /* ---------- 候选算法 ---------- */
  const cs = { ana: 'all', route: 'all', q: '', sort: M.store.get('ngcc.sort2', 'ana') };
  function viewCandidates(arg) {
    const t = T(), c = t.cand;
    if (arg) { cs.ana = arg === 'pend' ? 'all' : arg; cs.pend = arg === 'pend'; } else cs.pend = false;
    const segs = [['all', c.all, M.algs.length], ['A', 'A', M.acnt('A')], ['B', 'B', M.acnt('B')], ['P', t.ana.P, M.acnt('P')], ['C', 'C', M.acnt('C')], ['OK', t.ana.OK, M.acnt('OK')], ['NA', t.ana.NA, M.acnt('NA')]];
    return `<section class="panel"><div class="panel-h"><h2>${esc(c.title)} <small id="shown"></small></h2>
      <div class="controls"><div class="seg" id="f-ana">${segs.map(([k, l, n]) => `<button type="button" data-k="${k}" aria-pressed="${cs.ana === k}">${esc(l)}<span class="c">${n}</span></button>`).join('')}</div>
      <select id="f-route" aria-label="${esc(c.route)}"><option value="all">${esc(c.route)}${CO()}${esc(c.all)}</option>${CATS.map(k => `<option value="${k}" ${cs.route === k ? 'selected' : ''}>${esc(catName(k))}</option>`).join('')}</select>
      <input type="search" id="q" placeholder="${esc(c.search)}" value="${esc(cs.q)}">
      <select id="sort">${Object.entries(c.sort).map(([k, v]) => `<option value="${k}" ${cs.sort === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>${isaSwitch(false)}</div></div>
      <div class="tbl-wrap"><table class="cands"><thead><tr>${c.cols.map((h, i) => `<th${i >= 6 ? ' class="r"' : ''}>${esc(h)}${i >= 6 ? `<small class="th-sub">${esc(t.perf.isa[M.isa ? 'on' : 'off'])}</small>` : ''}</th>`).join('')}</tr></thead><tbody id="rows"></tbody></table><p class="empty" id="no-rows" hidden>${esc(c.none)}</p></div></section>`;
  }
  function renderRows() {
    const q = cs.q.toLowerCase(), rz = M.rank('zen4');
    let xs = M.algs.filter(a => (cs.ana === 'all' || a.ana === cs.ana) && (!cs.pend || a.fstatus === 'pend') && (cs.route === 'all' || a.category === cs.route) &&
      (!q || [a.name, a.mode, M.modeS(a), ...(a.units || []), ...M.units(a), ...(a.authors || [])].join(' ').toLowerCase().includes(q)));
    const by = {
      ana: (x, y) => M.ANA_ORDER[x.ana] - M.ANA_ORDER[y.ana] || y.lastKey.localeCompare(x.lastKey),
      active: (x, y) => y.lastKey.localeCompare(x.lastKey),
      zen4: (x, y) => (M.pv(x, 'zen4') ?? 1e9) - (M.pv(y, 'zen4') ?? 1e9),
      xeon: (x, y) => (M.pv(x, 'xeon') ?? 1e9) - (M.pv(y, 'xeon') ?? 1e9),
      name: (x, y) => x.name.localeCompare(y.name, 'en', { sensitivity: 'base' })
    }[cs.sort];
    xs.sort((x, y) => (x.withdrawn - y.withdrawn) || by(x, y));
    $('#shown').textContent = T().cand.shown(xs.length, M.algs.length);
    $('#no-rows').hidden = xs.length > 0;
    $('#rows').innerHTML = xs.map(a => `<tr data-go="alg/${a.id}" tabindex="0"${a.withdrawn ? ' class="wd"' : ''}>
      <td class="alg"><a href="#alg/${a.id}">${a.withdrawn ? `<s class="wdn">${esc(a.name)}</s>` : esc(a.name)}</a>${wdTag(a)}<span class="sub aff" title="${esc(M.units(a).join(M.lang === 'en' ? '; ' : '；'))}">${esc(M.affShort(a))}</span></td>
      <td>${anaPill(a)}</td><td>${implCell(a)}</td><td>${verCell(a)}</td><td>${fPill(a)}</td>
      <td><span class="route">${esc(catName(a.category))}</span><span class="sub">${esc(a.at ? a.at.subtitle : M.modeS(a))}</span></td>
      <td class="r num">${M.fmtCpb(M.pv(a, 'zen4'))}${rz.r[a.id] ? `<span class="sub">#${rz.r[a.id]}${esc(FS(flagOf(a, 'zen4')))}</span>` : ''}</td>
      <td class="r num">${M.fmtCpb(M.pv(a, 'xeon'))}${flagOf(a, 'xeon') ? `<span class="sub">${esc(flagOf(a, 'xeon'))}</span>` : ''}</td></tr>`).join('');
  }

  /* ---------- 算法页 ---------- */
  function glanceHtml(a, full) {
    const t = T(), id = a.id, rz = M.rank('zen4'), pz = M.pv(a, 'zen4'), F = full ? ' data-full' : '';
    const faster = pz ? ['SHA-512', 'SHA-256', 'SM3'].map(n => ({ n, r: M.base(n, 'zen4') / pz })) : [];
    return `<div class="glance">
      <a class="g-card" href="#alg/${id}/security"${F}><span class="g-k">${esc(t.alg.glance.sec)}</span><div class="g-v">${anaPill(a)}${fPill(a)}</div><p class="g-sum">${esc(M.summary(a) || (a.thirdParty ? '' : t.alg.noFind.NA))}</p><span class="g-more">${esc(t.alg.more)} →</span></a>
      <a class="g-card" href="#alg/${id}/perf"${F}><span class="g-k">${esc(t.alg.glance.perf)}</span>${pz ? `<div class="g-v"><strong>${M.fmtCpb(pz)}</strong><span>cycles/byte · ${esc(condName('zen4'))}${esc(FS(flagOf(a, 'zen4')))}</span></div>
        <p>${esc(t.alg.rankOf(rz.r[id], rz.of))}${SE()}${faster.map(f => M.lang === 'en' ? `${f.r >= 1 ? f.r.toFixed(2) + '× faster' : (1 / f.r).toFixed(2) + '× slower'} than ${f.n}` : `${f.r >= 1 ? '快于' : '慢于'} ${f.n} ${(f.r >= 1 ? f.r : 1 / f.r).toFixed(2)} 倍`).join(M.lang === 'en' ? '; ' : '，')}</p>` : `<p>${esc(t.alg.perfNone)}</p>`}
        <p class="g-sub">Xeon ${esc((t.perf.conds.xeon.split('·')[1] || '').trim())}${CO()}${M.fmtCpb(M.pv(a, 'xeon'))} cycles/byte${esc(FS(flagOf(a, 'xeon')))}</p><span class="g-more">${esc(t.alg.more)} →</span></a>
      <a class="g-card" href="#alg/${id}/design"${F}><span class="g-k">${esc(t.alg.glance.design)}</span><dl class="g-facts">
        <dt>${M.lang === 'en' ? 'Mode' : '外层'}</dt><dd>${esc(M.modeS(a))}</dd><dt>${M.lang === 'en' ? 'State' : '状态'}</dt><dd>${esc(M.fact(a, 'state'))}</dd><dt>${M.lang === 'en' ? 'Rounds' : '轮数'}</dt><dd>${esc(M.fact(a, 'rounds'))}</dd><dt>${M.lang === 'en' ? 'Digest' : '摘要'}</dt><dd>${esc(M.fact(a, 'digest'))}</dd></dl><span class="g-more">${esc(t.alg.more)} →</span></a></div>`;
  }
  const TABS = ['security', 'design', 'perf', 'docs'];
  const bodyOf = (a, tab, full) => ({ design: algDesign, security: algSecurity, perf: algPerf, docs: algDocs }[tab])(a, full);
  function viewAlg(id, tab) {
    const a = M.byId[id]; if (!a) return viewHome();
    tab = TABS.includes(tab) ? tab : 'design';
    const t = T(), at = a.at;
    const idx = M.algs.slice().sort((p, q) => p.name.localeCompare(q.name, 'en', { sensitivity: 'base' }));
    const i = idx.indexOf(a), prev = idx[(i - 1 + idx.length) % idx.length], next = idx[(i + 1) % idx.length];
    return `<nav class="crumb"><a href="#candidates">${esc(t.alg.back)}</a> / <span>${esc(a.name)}</span><span class="pn"><a data-full href="#alg/${prev.id}/${tab}">← ${esc(prev.name)}</a><a data-full href="#alg/${next.id}/${tab}">${esc(next.name)} →</a></span></nav>
      <header class="alg-head"><div class="ah-main"><span class="eyebrow">${esc(catName(a.category))}${at ? ' · ' + esc(at.facts?.[1]?.[1] || '') : ''}</span>
        <h1>${esc(a.name)}</h1><p class="who">${esc(M.who(a))}</p>${M.units(a).length ? `<p class="who units">${esc(M.units(a).join(M.lang === 'en' ? '; ' : '；'))}</p>` : ''}
        <p class="position">${esc(at ? at.position : M.hl(a))}</p></div>
        <div class="ah-side"><div class="badges">${wdTag(a)}${anaPill(a)}${verCell(a)}${fPill(a)}</div>${at ? `<div class="tags">${at.tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : ''}</div></header>
      ${wdBanner(a)}${glanceHtml(a, true)}
      <nav class="alg-tabs" role="tablist">${TABS.map(k => `<a role="tab" data-full href="#alg/${id}/${k}" aria-selected="${k === tab}">${esc(t.alg.tabs[k])}</a>`).join('')}</nav>
      <div class="alg-body">${bodyOf(a, tab, true)}</div>`;
  }

  /* 右侧卡片：页面本身不变，算法详情在右侧展开 */
  function drawerHtml(a, tab) {
    const t = T(), at = a.at;
    return `<div class="dr-intro"><span class="eyebrow">${esc(catName(a.category))}${at ? ' · ' + esc(at.facts?.[1]?.[1] || '') : ''}</span>
        <p class="who">${esc(M.who(a))}</p>${M.units(a).length ? `<p class="who units">${esc(M.units(a).join(M.lang === 'en' ? '; ' : '；'))}</p>` : ''}
        <p class="position">${esc(at ? at.position : M.hl(a))}</p>${at ? `<div class="tags">${at.tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : ''}</div>
      ${wdBanner(a)}${glanceHtml(a, false)}
      <nav class="alg-tabs dr-tabs" role="tablist">${TABS.map(k => `<button type="button" role="tab" data-dtab="${k}" aria-selected="${k === tab}">${esc(t.alg.tabs[k])}</button>`).join('')}</nav>
      <div class="alg-body">${bodyOf(a, tab, false)}</div>`;
  }

  /* 设计：总体构造、状态、轮函数、设计特点 */
  function refLinks(a, ids) {
    return (ids || []).map(n => `<a class="ref" href="#alg/${a.id}/docs" data-ref title="${esc((a.at.sources.find(s => s.id === n) || {}).label || '')}">[${n}]</a>`).join('');
  }
  function algDesign(a) {
    const at = a.at;
    if (!at) return `<p class="muted">—</p>`;
    const con = (at.construction && window.HashConstruction) ? window.HashConstruction.render(at) : '';
    const steps = at.rounds.map(([code, title], i) => `<button type="button" class="round-step${i === 0 ? ' active' : ''}" data-step="${i}" data-alg="${a.id}"><span>${String(i + 1).padStart(2, '0')} · ${esc(code)}</span><strong>${esc(title)}</strong></button>`).join('');
    const d = at.analysis && at.analysis.design;
    return `${driftNote(a)}<section class="panel"><div class="panel-h"><h2>${M.lang === 'en' ? 'Overall construction' : '总体构造'}</h2><p>${esc(at.caption)}</p></div><div class="diagram">${con}</div></section>
      <section class="panel"><div class="panel-h"><h2>${M.lang === 'en' ? 'State and parameters' : '状态与参数'}</h2></div>
        <div class="state-bar">${at.state.segments.map(([l, w, k]) => `<div class="seg-${k}" style="flex:${w}">${esc(l)}</div>`).join('')}</div><p class="note">${esc(at.state.note)}</p>
        <div class="tbl-wrap"><table class="params"><thead><tr>${(M.lang === 'en' ? ['Instance', 'Core width', 'Rate / input', 'Rounds'] : ['实例', '核心宽度', '速率 / 输入', '轮数']).map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${at.parameters.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
      <section class="panel"><div class="panel-h"><h2>${M.lang === 'en' ? 'Round function' : '轮函数'}</h2><p>${esc(at.roundCaption || '')}</p></div>
        <div class="round-steps">${steps}</div><div class="round-panel">${roundPanel(a, 0)}</div></section>
      ${d ? `<section class="panel"><div class="panel-h"><h2>${M.lang === 'en' ? 'Design notes' : '设计特点'}</h2></div><p class="lead">${esc(d.lead)}</p>
        <div class="points">${d.points.map(p => `<article><span class="kind">${esc(p.label)}</span><h3>${esc(p.title)}</h3><p>${esc(p.body)}${refLinks(a, p.refs)}</p></article>`).join('')}</div></section>` : ''}`;
  }
  function roundPanel(a, i) {
    const at = a.at, [code, title, copy, formula, notes] = at.rounds[i];
    let svg = '';
    if (!at.diagram && window.HashDiagram?.renderNoLattice) svg = window.HashDiagram.renderNoLattice(at, i) || '';
    else if (at.diagram && window.HashDiagram) svg = window.HashDiagram.render(at, i) || '';
    return `<div class="op-card"><div><span class="op-code">${String(i + 1).padStart(2, '0')} · ${esc(code)}</span><h3>${esc(title)}</h3><pre class="formula">${esc(formula)}</pre></div>
      <div><p>${esc(copy)}</p><ul>${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div></div><div class="diagram">${svg}</div>`;
  }

  /* 安全与讨论 */
  function algSecurity(a) {
    const t = T(), c = t.alg;
    const KORD = { '安全': 0, '性质': 1, '规范': 2, '提示': 3 };
    const RANK = { A: 4, B: 3, C: 2 };
    const fs = a.findings.filter(f => f.kind !== '实现').sort((x, y) => (KORD[x.kind || '安全'] - KORD[y.kind || '安全']) || (RANK[y.level] || 0) - (RANK[x.level] || 0));
    const kindTag = f => (f.kind && f.kind !== '安全') ? `<span class="lv lv-K">${esc(M.kindName(f.kind))}</span>` : `<span class="lv lv-${esc(f.level)}"><b>${esc(f.level)}</b>${esc(M.lvName(f.level))}</span>`;
    const ext = f => (f.links || []).map(l => ` <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(M.lang === 'en' && l.label_en ? l.label_en : l.label)} ↗</a>`).join('') + (f.ngcc_dev ? ` <a href="${esc(f.ngcc_dev.url)}" target="_blank" rel="noopener">ngcc.dev ${esc(f.ngcc_dev.id)} ↗</a>` : '');
    const list = fs.length ? `<ul class="findings">${fs.map(f => { const fx = f.fix || {}, s = M.fT(f); return `<li>
        <div class="f-h">${kindTag(f)}<span class="f-t">${esc(s.title)}</span>${f.kind === '提示' ? '' : `<span class="fx fx-${esc(M.st(f))}">${esc(M.fxName(M.st(f)))}${fx.version ? ' · ' + esc(fx.version) : ''}</span>`}</div>
        ${s.detail ? `<p>${esc(s.detail)}</p>` : ''}${s.note ? `<p class="f-note"><b>${['claimed', 'verified', 'failed'].includes(M.st(f)) ? c.noteRev : c.noteResp}</b>${esc(s.note)}</p>` : ''}
        <div class="f-src"><span><b>${c.src}</b>${CO()}${esc(s.by || '—')}</span>${srcLinks(f.msgs)}${ext(f)}${fx.msgs ? `<span><b>${c.resp}</b></span>${srcLinks(fx.msgs)}` : ''}${f.verify ? `<span class="vtag" title="${esc(c.mview)}">${c.verify}${CO()}${esc(M.vfName(f.verify))}</span>` : ''}</div></li>`; }).join('')}</ul>`
      : `<p class="muted">${a.ana === 'NA' ? c.noFind.NA : c.noFind.x}</p>`;
    const sec = a.at && a.at.analysis && a.at.analysis.security;
    // 设计者论证按中文标签挑出，再取当前语言同一位置的条目（中英文结构一致）
    const secZh = M.atlasZh[a.id] && M.atlasZh[a.id].analysis && M.atlasZh[a.id].analysis.security;
    const designer = sec && secZh ? secZh.points.map((p, i) => /^设计者(分析|给出|说明)?$/.test(p.label) ? sec.points[i] : null).filter(Boolean) : [];
    const thread = a.msgs.length ? `<details class="thread"><summary>${esc(c.thread)}${PAR(a.msgs.length)}</summary>${a.msgs.map(m => `<article class="msg ${m.kind}"><div class="msg-h"><span class="kind ${m.kind}">${esc(t.kind[m.kind] || m.kind)}</span><b>${esc(m.author)}</b><span class="t">${esc(m.t.label)}</span><a href="${esc(m.url)}" target="_blank" rel="noopener">${t.orig}</a></div><div class="msg-b">${esc(M.excerpt(m.body, 700))}</div></article>`).join('')}</details>` : `<p class="muted">${c.noThread}</p>`;
    return `<section class="panel"><div class="panel-h"><h2>${esc(c.findings)}</h2>${a.thread ? `<a href="${esc(a.thread)}" target="_blank" rel="noopener">${c.openThread}</a>` : ''}</div>
        <div class="stbox">${anaPill(a)}<p>${esc(M.summary(a) || '')}</p></div>${list}
        ${M.hl(a) ? `<div class="hl"><span>${esc(c.hl)} <em>${esc(c.mview)}</em></span><p>${esc(M.hl(a))}</p></div>` : ''}</section>
      ${designer.length ? `<section class="panel"><div class="panel-h"><h2>${esc(c.designerSec)}</h2></div><div class="points">${designer.map(p => `<article><span class="kind">${esc(p.label)}</span><h3>${esc(p.title)}</h3><p>${esc(p.body)}${refLinks(a, p.refs)}</p></article>`).join('')}</div></section>` : ''}
      <section class="panel">${thread}</section>`;
  }

  /* 性能与实现 */
  function algPerf(a) {
    const t = T(), c = t.alg, p = a.perf;
    const tiles = ['zen4', 's32', 'xeon'].map(k => { const v = M.pv(a, k), r = M.rank(k), f = flagOf(a, k); return `<div class="tile"><span class="k">${esc(t.perf.conds[k])}</span><span class="v">${M.fmtCpb(v)}</span><span class="s">${v != null ? 'cycles/byte · ' + esc(c.rankOf(r.r[a.id], r.of)) + esc(FS(f)) : esc(c.perfNone)}</span></div>`; }).join('');
    const z = M.pv(a, 'zen4');
    const ruler = z ? `<div class="ruler-box"><span>${esc(c.vsBase)} · ${esc(condName('zen4'))}</span>${PerfChart.ruler(z, BASES('zen4'), a.name)}<span class="r-leg">● ${esc(a.name)} ${M.fmtCpb(z)}</span></div>` : '';
    // 关于参考实现的说明只在“只用通用指令”时有意义
    const note = (p.note && !(M.isa && M.usesIsa(a, 'zen4')) ? p.note : '') || (M.pv(a, 'zen4') == null ? t.perf.noZen4 : '');
    const imp = a.at && a.at.analysis && a.at.analysis.implementation;
    const iss = a.findings.filter(f => f.kind === '实现');
    const pubIss = M.perfIssues().filter(x => x.zh.item.toLowerCase().includes(a.name.toLowerCase()));
    return `<section class="panel"><div class="panel-h"><h2>${esc(c.perfDetail)}</h2><a href="#perf">${esc(t.nav.perf)} →</a></div>${isaSwitch(M.usesIsa(a, 'xeon'))}<div class="tiles">${tiles}</div>${ruler}
        ${note ? `<p class="note">${M.rich(note)}</p>` : ''}</section>
      ${imp ? `<section class="panel"><div class="panel-h"><h2>${esc(c.implNotes)}</h2></div><p class="lead">${esc(imp.lead)}</p><div class="points">${imp.points.map(q => `<article><span class="kind">${esc(q.label)}</span><h3>${esc(q.title)}</h3><p>${esc(q.body)}${refLinks(a, q.refs)}</p></article>`).join('')}</div></section>` : ''}
      ${iss.length || pubIss.length ? `<section class="panel"><div class="panel-h"><h2>${esc(c.implIssues)}</h2></div><ul class="findings">${iss.map(f => { const s = M.fT(f); return `<li><div class="f-h"><span class="lv lv-K">${esc(M.kindName('实现'))}</span>${f.impl_level ? iTag(f.impl_level) : ''}<span class="f-t">${esc(s.title)}</span><span class="fx fx-${esc(M.st(f))}">${esc(M.fxName(M.st(f)))}</span></div>${s.detail ? `<p>${esc(s.detail)}</p>` : ''}<div class="f-src"><span><b>${c.src}</b>${CO()}${esc(s.by || '—')}</span>${srcLinks(f.msgs)}</div></li>`; }).join('')}
        ${pubIss.map(x => `<li><div class="f-h"><span class="lv lv-K">${M.lang === 'en' ? 'Benchmark' : '统一实测'}</span><span class="f-t">${esc(x.item)}${M.lang === 'en' ? ': ' : '：'}${esc(x.what)}</span></div>${/^见/.test(x.zh.verdict) ? '' : `<p>${esc(x.verdict)}</p>`}</li>`).join('')}</ul></section>` : ''}`;
  }

  /* 版本与资料 */
  function algDocs(a) {
    const c = T().alg;
    const docLi = (cat, text, url, sz) => `<li><span class="cat">${esc(cat)}</span><a href="${url}" target="_blank" rel="noopener">${esc(text)}</a>${sz ? `<span class="sz">${esc(sz)}</span>` : ''}</li>`;
    const tl = a.versions.map((v, i) => {
      let ds = '';
      if (v.sub) ds = `<ul class="docs">${docLi('zip', c.zip.replace(' ↗', ''), M.ZIP(a.name), '')}${a.subDocs.map(d => docLi(M.lang === 'en' ? 'PDF' : (d.category || 'PDF'), (d.title || d.name) + '.pdf', ROOT.tracker + M.href(d.path), M.fmtB(d.bytes))).join('')}</ul>`;
      else { const fd = a.forumDocs.filter(d => (v.msgs || []).includes(d.msg_id)); if (fd.length) ds = `<ul class="docs">${fd.map(d => docLi(M.lang === 'en' ? 'attachment' : '论坛附件', d.name, esc(d.url), d.size || M.fmtB(d.bytes))).join('')}</ul>`; }
      const cur = i === a.versions.length - 1;
      return `<li class="${cur ? 'cur' : ''}"><div class="vh"><b>${esc(v.v)}</b>${v.date ? `<span>${esc(v.date)}</span>` : ''}${cur ? `<span class="fx fx-claimed">${c.cur}</span>` : ''}${(v.msgs || []).length ? `<span>${c.ann} ${srcLinks(v.msgs)}</span>` : ''}</div><div class="vl">${esc(v.wd ? v.label : M.vLabel(a, v))}</div>${ds}</li>`;
    }).join('');
    const r = a.at && a.at.revision;
    const rev = r && r.changes && r.changes.length ? `<section class="panel"><div class="panel-h"><h2>${esc(c.revDetail)}</h2><span class="muted">${esc(r.diagramVersion)}</span></div>
      <div class="changes">${r.changes.map(x => `<article><h3>${esc(x.title)}</h3><dl><dt>${M.lang === 'en' ? 'Before' : '原始材料'}</dt><dd>${esc(x.before)}</dd><dt>${M.lang === 'en' ? 'After' : '修订或说明'}</dt><dd>${esc(x.after)}</dd></dl><p>${esc(x.impact)}</p></article>`).join('')}</div></section>` : '';
    const srcs = a.at ? `<section class="panel"><div class="panel-h"><h2>${esc(c.atlasSrc)}</h2></div><ol class="srcs">${a.at.sources.map(s => `<li><span class="no">${s.id}</span><div><span class="skind">${esc(s.kind)}</span><a href="${esc(atlasUrl(s.url))}" target="_blank" rel="noopener">${esc(s.label)}${/^https?:/.test(s.url) ? ' ↗' : ''}</a><p>${esc(s.note)}</p></div></li>`).join('')}</ol></section>` : '';
    return `<section class="panel"><div class="panel-h"><h2>${esc(c.versions)}</h2></div><ul class="tl">${tl}</ul></section>${rev}${srcs}`;
  }

  /* ---------- 性能 ---------- */
  const ps = { cond: 'zen4', hl: '' };
  function viewPerf(cond) {
    const t = T(), p = t.perf;
    if (cond === 'zen4Aes') { M.setIsa(true); ps.cond = 'zen4'; }   // 旧链接
    else if (cond && p.conds[cond]) ps.cond = cond;
    const take = M.lang === 'en' ? [
      'With general-purpose instructions only, of the 34 candidates measured on Zen4 (Garnet is not included; see the note below the chart), **20 are faster than SM3**, **23 faster than SHA3-512**, **10 faster than SHA-256** and **2 faster than SHA-512**.',
      '**32 of the 35 candidates use no crypto instructions** at all, so their numbers are the same under both settings. The optimised implementations of Pavelor and Wish require hardware AES rounds; with crypto instructions allowed **Pavelor is the fastest**, 1.25 cycles/byte on long messages and 9.02 at 32 bytes.',
      '**Short messages reorder the field**: the ratio of 32-byte to long-message cost ranges from 1.6 to 151.6 (median 4.5). AXIS drops from 6th to 31st and ZC-DMC from 5th to 25th, while Duet rises from 26th to 11th and MasterCube from 19th to 10th.',
      '**Changing the compiler** (gcc 13.3 → 11.4) **moves the ranking more than changing the CPU**; the same source differs by up to 2.6×.'
    ] : [
      '只用通用指令时，Zen4 上可测的 34 个候选（Garnet 未纳入，原因见图表下方说明）中 **20 个快于 SM3**，**23 个快于 SHA3-512**，**10 个快于 SHA-256**，**2 个快于 SHA-512**。',
      '**35 个候选中 32 个不依赖任何密码指令**，两种口径下数字相同。Pavelor 与 Wish 的优化实现必须使用硬件 AES 轮；允许密码指令时 Pavelor 长消息 1.25、32 字节 9.02 cycles/byte，**均为最快**。',
      '**短消息上格局不同**：32 字节与长消息的成本比为 1.6 到 151.6（中位 4.5）。AXIS 从第 6 名落到第 31 名，ZC-DMC 从第 5 名落到第 25 名；Duet 从第 26 名升到第 11 名，MasterCube 从第 19 名升到第 10 名。',
      '**换编译器**（gcc 13.3 → 11.4）**对名次的影响大于换 CPU**，同一份源码最多相差 2.6 倍。'
    ];
    const opts = M.algs.slice().sort((x, y) => x.name.localeCompare(y.name, 'en', { sensitivity: 'base' }));
    const tbl = M.algs.slice().sort((x, y) => (M.pv(x, ps.cond) ?? 1e9) - (M.pv(y, ps.cond) ?? 1e9));
    return `<section class="hero"><h1>${esc(p.title)}</h1><p class="lede">${M.rich(p.lede)}</p></section>
      <section class="panel"><div class="panel-h"><h2>${esc(p.takeaways)}</h2></div><ol class="takeaways">${take.map(x => `<li>${M.rich(x)}</li>`).join('')}</ol></section>
      <section class="panel">${isaSwitch(true)}<div class="controls perf-controls"><div class="seg" id="f-cond">${Object.entries(p.conds).map(([k, l]) => `<button type="button" data-k="${k}" aria-pressed="${ps.cond === k}">${esc(l)}</button>`).join('')}</div>
        <select id="f-hl" aria-label="${esc(p.search)}"><option value="">${esc(p.search)}…</option>${opts.map(a => `<option value="${a.id}" ${ps.hl === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
        <p class="note">${M.rich(p.condNote[ps.cond](M.isa))}${ps.cond === 'xeon' ? '' : (M.lang === 'en' ? ' ' : '') + M.rich(p.noZen4)}</p><div id="chart" class="chart"></div></section>
      <section class="panel"><details><summary>${esc(p.table)} · ${esc(p.isa[M.isa ? 'on' : 'off'])}</summary><div class="tbl-wrap"><table class="perf-table"><thead><tr>${p.cols.map((h, i) => `<th${i ? ' class="r"' : ''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>
        ${tbl.map(a => `<tr><td>${algLink(a)}${flagOf(a, 'zen4') ? `<span class="sub">${esc(flagOf(a, 'zen4'))}</span>` : ''}</td>${['zen4', 's32', 's64', 's128', 'mbps', 'xeon'].map(k => `<td class="r num">${k === 'mbps' ? (M.pv(a, 'mbps') ?? '—') : M.fmtCpb(M.pv(a, k))}</td>`).join('')}</tr>`).join('')}
        ${BN.map(n => `<tr class="base-row"><td>${esc(n)}</td>${['zen4', 's32', 's64', 's128'].map(k => `<td class="r num">${M.fmtCpb(M.base(n, k))}</td>`).join('')}<td class="r num">${M.base(n, 'mbps') ?? '—'}</td><td class="r">—</td></tr>`).join('')}
      </tbody></table></div></details></section>
      <section class="panel"><details><summary>${esc(p.issues)}${M.lang === 'en' ? ` (${M.PERF.issues.length})` : `（${M.PERF.issues.length}）`}</summary><ul class="issues">${M.perfIssues().map(x => M.lang === 'en' ? `<li><b>${esc(x.item)}</b>: ${esc(x.what)}. ${esc(x.verdict)}</li>` : `<li><b>${esc(x.item)}</b>：${esc(x.what)}。${esc(x.verdict)}</li>`).join('')}</ul></details>
        <details><summary>${esc(p.caveats)}</summary><ul class="issues"><li>${esc(M.perfMeta('zen4'))}</li><li>${esc(M.perfMeta('xeon'))}</li></ul></details></section>`;
  }
  function drawPerf() {
    const t = T(), k = ps.cond;
    const rows = M.algs.filter(a => M.pv(a, k) != null).sort((x, y) => M.pv(x, k) - M.pv(y, k)).map((a, i, arr) => ({
      id: a.id, name: a.name, value: M.pv(a, k), flag: flagOf(a, k), fk: M.pflag(a, k),
      tip: `${a.name}\n${M.fmtCpb(M.pv(a, k))} cycles/byte · ${t.alg.rankOf(i + 1, arr.length)}${k === 'zen4' && M.pv(a, 'mbps') ? `\n${M.pv(a, 'mbps')} MB/s` : ''}`
    }));
    $('#chart').innerHTML = PerfChart.bars(rows, { width: $('#chart').clientWidth, baselines: BASES(k), highlight: ps.hl || null, axis: t.perf.axis, label: condName(k) });
    PerfChart.bindTips($('#chart'));
  }

  /* ---------- 路线对比（沿用图谱的对比视图） ---------- */
  function viewCompare() {
    const en = M.lang === 'en';
    const L = en ? { title: 'Design routes', lede: 'Group candidates by outer construction, primitive width or round-function family and compare up to six side by side.',
        tabs: ['Outer construction', 'Same-width primitives', 'Round-function family'], group: 'Group', output: 'Output length', bits: n => `${n} bit`, pick: 'Choose items to compare', diff: 'Differences only',
        legend: ['Nonlinear', 'Mixing / diffusion', 'Rotation / transposition', 'Constant / key'] }
      : { title: '设计路线对比', lede: '按外层构造、同宽原语和轮函数类型分组，把同类候选并排比较，最多可同时选 6 项。',
        tabs: ['外层构造', '同宽原语', '轮函数类型'], group: '对照组', output: '输出长度', bits: n => `${n} 位`, pick: '选择对照项', diff: '只看差异',
        legend: ['非线性', '混合 / 扩散', '旋转 / 换位', '常数 / 密钥'] };
    const tab = (id, i) => `<button id="compare-tab-${id}" type="button" role="tab" data-compare-mode="${id}" aria-selected="${id === 'width'}">${L.tabs[i]}</button>`;
    return `<section id="compare-view" class="page-view active">
      <section class="hero"><h1>${L.title}</h1><p class="lede">${L.lede}</p></section>
      <div class="comparison-tabs" role="tablist">${['outer', 'width', 'family'].map(tab).join('')}</div>
      <section id="comparison-panel" class="panel comparison-panel" role="tabpanel">
        <div class="comparison-panel-heading"><h2 id="comparison-mode-title"></h2><p id="comparison-mode-intro"></p></div>
        <div class="comparison-toolbar"><label>${L.group}<select id="comparison-group"></select></label><label>${L.output}<select id="comparison-output">${[512, 768, 1024].map(n => `<option value="${n}">${L.bits(n)}</option>`).join('')}</select></label></div>
        <p id="comparison-group-note" class="note"></p>
        <fieldset class="comparison-picker-field"><legend>${L.pick}</legend><div id="comparison-picker" class="comparison-picker"></div></fieldset>
        <div class="comparison-matrix-toolbar"><span id="comparison-count"></span><label><input id="comparison-differences" type="checkbox">${L.diff}</label></div>
        <div class="tbl-wrap"><table id="comparison-matrix"></table></div>
        <div id="comparison-inner-legend" class="comparison-legend">${['nonlinear', 'linear', 'permute', 'constant'].map((k, i) => `<span class="${k}">${L.legend[i]}</span>`).join('')}</div></section>
      <details class="panel"><summary id="comparison-catalogue-title"></summary><div class="tbl-wrap"><table id="comparison-catalogue"></table></div></details></section>`;
  }

  /* ---------- 论坛 ---------- */
  const fs = { kind: 'all', alg: 'all' };
  function viewForum() {
    const t = T(), f = t.forum;
    const names = [...new Set(M.talkAll.map(m => m.algorithm))].sort((a, b) => a.localeCompare(b));
    return `<section class="panel"><div class="panel-h"><h2>${esc(f.title)} <small>${esc(f.excerpt)}</small></h2>
      <div class="controls"><div class="seg" id="f-kind">${[['all', f.all], ['comment', f.c], ['response', f.r]].map(([k, l]) => `<button type="button" data-k="${k}" aria-pressed="${fs.kind === k}">${esc(l)}</button>`).join('')}</div>
      <select id="f-falg"><option value="all">${esc(f.algAll)}</option>${names.map(n => `<option ${fs.alg === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div></div><ul class="feed" id="feed"></ul></section>`;
  }
  function renderFeed() {
    const xs = M.talkAll.filter(m => (fs.kind === 'all' || m.kind === fs.kind) && (fs.alg === 'all' || m.algorithm === fs.alg)).slice().reverse();
    $('#feed').innerHTML = xs.map(feedItem).join('');
  }

  /* ---------- 说明 ---------- */
  function viewAbout() {
    const t = T(), d = M.DEF(), ab = t.about;
    const dl = (obj, fmt) => `<dl class="defs">${Object.entries(obj || {}).map(([k, v]) => `<dt>${fmt(k, v)}</dt><dd>${esc(v.desc)}</dd>`).join('')}</dl>`;
    const method = M.lang === 'en' ? [
      '**Forum content** is fetched from the CryptHash archive on list.niccs.org.cn; findings, fix states and verification are curated by the maintainers.',
      '**Design content** (constructions, state layouts, round functions) is drawn from the designers\' documents and updates, cited per algorithm.',
      '**Software measurements**: ' + M.perfMeta('zen4') + '. **Cloud Xeon numbers**: ' + M.perfMeta('xeon') + '.'
    ] : [
      '**论坛内容**抓取自 list.niccs.org.cn 的 CryptHash 存档；发现清单、修补状态与核验结果由维护方整理。',
      '**设计内容**（外层构造、状态布局、轮函数）依据设计者文档与作者更新整理，各算法页列出来源。',
      '**软件实测**：' + M.PERF.meta.zen4 + '。**云端 Xeon 数字**：' + M.PERF.meta.xeon + '。'
    ];
    return `<section class="panel doc"><h2>${esc(ab.title)}</h2><p>${M.rich(t.disclaimer)}</p><h3>${esc(ab.method)}</h3><ul>${method.map(x => `<li>${M.rich(x)}</li>`).join('')}</ul>
      <h3>${esc(ab.overall)}</h3><p>${esc(d.overall || '')}</p>
      <h3>${esc(ab.kinds)}</h3>${dl(d.kinds, (k, v) => `<span class="lv lv-K">${esc(v.name)}</span>`)}
      <h3>${esc(ab.levels)}</h3>${dl(d.levels, (k, v) => `<span class="lv lv-${k}"><b>${k}</b>${esc(v.name)}</span>`)}
      <h3>${esc(ab.impls)}</h3>${dl(d.impl_levels, (k, v) => `<span class="lv lv-${k}"><b>${k}</b>${esc(v.name)}</span>`)}
      <h3>${esc(ab.fixes)}</h3>${dl(d.fix, (k, v) => `<span class="fx fx-${k}">${esc(v.name)}</span>`)}
      <h3>${esc(ab.verifies)}</h3>${dl(d.verify, (k, v) => esc(v.name))}</section>`;
  }

  /* ---------- 外框与路由 ---------- */
  function route() {
    const raw = decodeURIComponent(location.hash.slice(1));
    const [base, dr] = raw.split('@');
    const [r, a1, a2] = base.split('/');
    const [did, dtab] = (dr || '').split('/');
    return { r: r || 'home', a1, a2, base, did, dtab };
  }
  let renderedBase = null;
  function render() {
    const t = T(), R = route();
    document.documentElement.lang = M.lang === 'zh' ? 'zh-CN' : 'en';
    if (window.HashDiagram && window.HashDiagram.setLang) window.HashDiagram.setLang(M.lang);
    const navKey = R.r === 'alg' ? 'candidates' : R.r;
    $('#brand').innerHTML = `<a href="#"><strong>${esc(t.site)}</strong><span>${esc(t.siteSub)}</span></a>`;
    $('#nav').innerHTML = ['home', 'candidates', 'perf', 'compare', 'forum', 'about'].map(k => `<a href="#${k === 'home' ? '' : k}" aria-current="${navKey === k ? 'page' : 'false'}">${esc(t.nav[k])}</a>`).join('');
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === M.lang));
    $('#gen').textContent = `${t.gen} ${M.TR.generated}`;
    const v = $('#view');
    if (R.r === 'candidates') { v.innerHTML = viewCandidates(R.a1); renderRows(); }
    else if (R.r === 'alg') { v.innerHTML = viewAlg(R.a1, R.a2); }
    else if (R.r === 'perf') { v.innerHTML = viewPerf(R.a1); drawPerf(); }
    else if (R.r === 'compare') { v.innerHTML = viewCompare(); window.HashAtlasCompare.render(M.atlas, false, M.lang); }
    else if (R.r === 'forum') { v.innerHTML = viewForum(); renderFeed(); }
    else if (R.r === 'about') { v.innerHTML = viewAbout(); }
    else v.innerHTML = viewHome();
    $('#foot').textContent = t.foot;
    renderedBase = R.base;
    syncDrawer();
  }

  /* ---------- 右侧卡片 ---------- */
  let lastFocus = null;
  function defaultTab() { const r = route().r; return r === 'perf' ? 'perf' : r === 'compare' ? 'design' : 'security'; }
  function syncDrawer() {
    const R = route(), a = R.did && M.byId[R.did];
    const dr = $('#drawer');
    if (!a) { if (!dr.hidden) { dr.hidden = true; $('#scrim').hidden = true; document.body.classList.remove('dr-open'); if (lastFocus) lastFocus.focus(); } return; }
    const tab = TABS.includes(R.dtab) ? R.dtab : defaultTab();
    const t = T();
    $('#dr-title').textContent = a.name;
    $('#dr-badges').innerHTML = `${wdTag(a)}${anaPill(a)}${verCell(a)}${fPill(a)}`;
    $('#dr-full').href = '#alg/' + a.id + '/' + tab;
    $('#dr-full').textContent = M.lang === 'en' ? 'Open full page ↗' : '展开为整页 ↗';
    $('#dr-close').setAttribute('aria-label', M.lang === 'en' ? 'Close' : '关闭');
    const keep = !dr.hidden && dr.dataset.id === a.id;
    $('#dr-body').innerHTML = drawerHtml(a, tab);
    dr.dataset.id = a.id;
    if (dr.hidden) { lastFocus = document.activeElement; dr.hidden = false; $('#scrim').hidden = false; document.body.classList.add('dr-open'); $('#dr-close').focus({ preventScroll: true }); }
    if (!keep) $('#dr-body').scrollTop = 0;
  }
  function openDrawer(id, tab) {
    const base = route().base;
    history.pushState(null, '', '#' + base + '@' + id + (tab ? '/' + tab : ''));
    syncDrawer();
  }
  function closeDrawer() {
    history.pushState(null, '', '#' + route().base);
    syncDrawer();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#dr-close') || e.target.closest('#scrim')) { closeDrawer(); return; }
    const dt = e.target.closest('[data-dtab]'); if (dt) { openDrawer(route().did, dt.dataset.dtab); return; }
    const al = e.target.closest('a[href^="#alg/"]');
    if (al && !al.hasAttribute('data-full') && !al.id && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      const [, id, tab] = al.getAttribute('href').slice(1).split('/');
      if (route().r === 'alg' && al.hasAttribute('data-ref')) { location.hash = 'alg/' + id + '/docs'; return; }
      openDrawer(id, tab || (route().did === id ? route().dtab : undefined)); return;
    }
    const isw = e.target.closest('[data-isa]'); if (isw) { M.setIsa(!M.isa); render(); const s = document.querySelector('[data-isa]'); if (s && !$('#drawer').hidden && $('#drawer').contains(isw)) { const d = $('#drawer [data-isa]'); if (d) d.focus({ preventScroll: true }); } else if (s) s.focus({ preventScroll: true }); return; }
    const lb = e.target.closest('.lang button'); if (lb) { M.lang = lb.dataset.lang; M.store.set('ngcc.lang', M.lang); render(); return; }
    const seg = e.target.closest('#f-ana button'); if (seg) { cs.ana = seg.dataset.k; cs.pend = false; document.querySelectorAll('#f-ana button').forEach(b => b.setAttribute('aria-pressed', b === seg)); renderRows(); return; }
    const cb = e.target.closest('#f-cond button'); if (cb) { ps.cond = cb.dataset.k; history.replaceState(null, '', '#perf/' + ps.cond); render(); return; }
    const kb = e.target.closest('#f-kind button'); if (kb) { fs.kind = kb.dataset.k; document.querySelectorAll('#f-kind button').forEach(b => b.setAttribute('aria-pressed', b === kb)); renderFeed(); return; }
    const step = e.target.closest('[data-step]');
    if (step) { const a = M.byId[step.dataset.alg], box = step.closest('section'); box.querySelectorAll('.round-step').forEach(b => b.classList.toggle('active', b === step)); box.querySelector('.round-panel').innerHTML = roundPanel(a, +step.dataset.step); return; }
    const row = e.target.closest('#chart .bar-row'); if (row) { openDrawer(row.dataset.id, 'perf'); return; }
    const tr = e.target.closest('tr[data-go]'); if (tr && !e.target.closest('a')) { openDrawer(tr.dataset.go.split('/')[1]); return; }
    const ca = e.target.closest('[data-algorithm]'); if (ca) { openDrawer(ca.dataset.algorithm, 'design'); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'q') { cs.q = e.target.value.trim(); renderRows(); } });
  document.addEventListener('change', e => {
    if (e.target.id === 'sort') { cs.sort = e.target.value; M.store.set('ngcc.sort2', cs.sort); renderRows(); }
    if (e.target.id === 'f-route') { cs.route = e.target.value; renderRows(); }
    if (e.target.id === 'f-hl') { ps.hl = e.target.value; drawPerf(); }
    if (e.target.id === 'f-falg') { fs.alg = e.target.value; renderFeed(); }
  });
  function sync() {
    const R = route();
    if (R.base.startsWith('compare/') && renderedBase && renderedBase.startsWith('compare')) { syncDrawer(); return; }
    if (R.base !== renderedBase) { render(); window.scrollTo(0, 0); } else syncDrawer();
  }
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (route().r === 'perf' && $('#chart')) drawPerf(); }, 150); });
  window.addEventListener('hashchange', sync);
  window.addEventListener('popstate', sync);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#drawer').hidden) { closeDrawer(); return; }
    const tr = e.target.closest && e.target.closest('tr[data-go]'); if (tr && e.key === 'Enter') openDrawer(tr.dataset.go.split('/')[1]);
  });
  render();
})();
