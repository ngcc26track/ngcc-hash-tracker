/* 数据模型：把追踪站、设计图谱、统一实测三份数据按算法对齐。 */
(function () {
  const TR = window.TRACKER_DATA;
  const PERF = window.PERF_DATA;
  const PEN = window.PERF_DATA_EN || { notes: {}, issues: [], meta: {} };
  const EN = TR.i18n || {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 浏览器不允许存储时忽略 */ } }
  };
  const M = window.M = { TR, PERF, EN, store };
  M.lang = store.get('ngcc.lang', null) || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
  M.tx = (zh, en) => (M.lang === 'en' && en) ? en : zh;
  M.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* 界面文字中的 **重点** 渲染为加粗（先转义，只认这一种标记） */
  M.rich = s => M.esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  M.plain = s => String(s ?? '').replace(/\*\*/g, '');

  /* ---------- 设计图谱（中文与英文两份，结构相同） ---------- */
  function atlasOf(cards, specs, noLat) {
    const atlas = {};
    Object.entries(cards || {}).forEach(([id, a]) => { atlas[id] = Object.assign({}, a); });
    Object.entries(noLat || {}).forEach(([id, txt]) => { if (atlas[id]) atlas[id].noLattice = txt; });
    Object.entries(specs || {}).forEach(([id, spec]) => {
      if (!atlas[id]) return;
      if (spec.kind) atlas[id].diagram = spec;
      if (spec.construction) atlas[id].construction = spec.construction;
    });
    return atlas;
  }
  const atlasZh = atlasOf(window.extraAlgorithms2, window.diagramSpecs, window.specNoLattice);
  const atlasEn = window.extraAlgorithms2En ? atlasOf(window.extraAlgorithms2En, window.diagramSpecsEn, window.specNoLatticeEn) : atlasZh;
  Object.defineProperty(M, 'atlas', { get: () => M.lang === 'en' ? atlasEn : atlasZh });
  M.atlasZh = atlasZh;

  /* ---------- 追踪站（沿用其状态规则） ---------- */
  const ST = TR.status || {}; const SALG = ST.algorithms || {};
  M.SALG = SALG;
  M.DEF = () => M.lang === 'en' ? (EN.definitions || {}) : (ST.definitions || {});
  const RANK = { A: 4, B: 3, C: 2 };
  M.ANA_ORDER = { A: 0, B: 1, P: 2, C: 3, OK: 4, NA: 5 };
  M.MSGURL = id => (TR.source || '') + 'message/' + id + '/';
  function tinfo(m) {
    if (m.pub_utc) return { key: m.pub_utc.slice(0, 16), label: m.pub_utc.slice(5, 16) + ' UTC' };
    if (m.sender_time) return { key: m.sender_time.slice(0, 16), label: '≈' + m.sender_time.slice(5, 16) };
    return { key: '', label: '' };
  }
  const cmp = (a, b) => (a.t.key < b.t.key ? -1 : a.t.key > b.t.key ? 1 : a.position - b.position);
  const msgs = TR.messages.map(m => ({ ...m, t: tinfo(m) }));
  const st = f => (f.fix || {}).state || 'open';
  M.st = st;
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const atlasByNorm = {};
  Object.entries(atlasZh).forEach(([id, a]) => { atlasByNorm[norm(a.name)] = id; });

  const list = [];
  const byName = new Map();
  for (const t of TR.algorithms) {
    const k = norm(t.name);
    const id = atlasByNorm[k] || atlasByNorm[k + 'hash'] || k;
    const a = { ...t, id, msgs: [] };
    byName.set(t.name, a); list.push(a);
  }
  const others = [];
  for (const m of msgs) (byName.has(m.algorithm) ? byName.get(m.algorithm).msgs : others).push(m);
  for (const a of list) {
    a.msgs.sort(cmp);
    const talk = a.msgs.filter(m => m.kind === 'comment' || m.kind === 'response');
    a.nC = talk.filter(m => m.kind === 'comment').length; a.nR = talk.filter(m => m.kind === 'response').length;
    const last = talk[talk.length - 1];
    a.fstatus = !last ? 'none' : last.kind === 'response' ? 'ok' : 'pend';
    a.last = last || a.msgs[a.msgs.length - 1] || null; a.lastKey = a.last ? a.last.t.key : '';
    a.thread = (a.msgs[0] || {}).thread_url || '';
    const sa = SALG[a.name] || {};
    a.findings = sa.findings || [];
    a.versions = [{ v: 'v1.0', sub: true }].concat(sa.versions || []);
    a.curVer = a.versions[a.versions.length - 1].v;
    a.subDocs = ((TR.docs || {}).submission || {})[a.name] || [];
    a.forumDocs = ((TR.docs || {}).forum || {})[a.name] || [];
    a.sec = a.findings.filter(f => (f.kind || '安全') === '安全' && f.level && f.verify !== 'cite');
    const worst = fs => fs.reduce((w, f) => (RANK[f.level] || 0) > (RANK[w] || 0) ? f.level : w, null);
    a.openLv = worst(a.sec.filter(f => !['claimed', 'verified'].includes(st(f))));
    a.claimLv = worst(a.sec.filter(f => ['claimed', 'verified'].includes(st(f))));
    a.thirdParty = a.nC > 0;
    a.ana = a.openLv || (a.claimLv ? 'P' : (a.findings.length || a.thirdParty ? 'OK' : 'NA'));
    const IRANK = { I1: 3, I2: 2, I3: 1 };
    a.impl = a.findings.filter(f => f.kind === '实现');
    const openI = a.impl.filter(f => !['claimed', 'verified'].includes(st(f)));
    a.implLv = openI.reduce((w, f) => (IRANK[f.impl_level] || 0) > (IRANK[w] || 0) ? f.impl_level : w, null);
    a.implOpen = openI.length; a.implFixed = a.impl.length - openI.length;
    a.cand = sa.candidacy || null; a.withdrawn = !!(a.cand && a.cand.state === 'withdrawn');
    // 设计图谱与统一实测
    // a.at 随界面语言取中文或英文的设计内容；category 是逻辑键，始终取中文
    Object.defineProperty(a, 'at', { get: () => M.atlas[a.id] || null, configurable: true });
    a.category = atlasZh[a.id] ? atlasZh[a.id].category : '其他';
    const pz = PERF.zen4[a.name] || null;
    a.perf = {
      zen4: pz ? pz.zen4 : null, zen4Aes: pz ? pz.zen4_aes : null, s32: pz ? pz.s32 : null,
      s64: pz ? pz.s64 : null, s128: pz ? pz.s128 : null, mbps: pz ? pz.zen4_mbps : null,
      noteZh: pz ? pz.note : '', get note() { return M.lang === 'en' && PEN.notes[a.name] ? PEN.notes[a.name] : this.noteZh; }, xeon: PERF.xeonBest[a.name] ?? a.cpb ?? null
    };
  }
  M.algs = list;
  /* 统一实测的文字：英文界面取 perf-data.en.js */
  M.perfIssues = () => PERF.issues.map((x, i) => M.lang === 'en' && PEN.issues[i] ? Object.assign({ zh: x }, PEN.issues[i]) : Object.assign({ zh: x }, x));
  M.perfMeta = k => (M.lang === 'en' && PEN.meta[k]) || PERF.meta[k];
  M.byId = Object.fromEntries(list.map(a => [a.id, a]));
  M.byName = byName;
  M.others = others;
  M.talkAll = msgs.filter(m => m.kind === 'comment' || m.kind === 'response').sort(cmp);
  M.cmpMsg = cmp;
  M.acnt = k => list.filter(a => a.ana === k).length;

  /* 排名：按条件给出名次（只计有数据的候选） */
  /* ---------- 密码指令开关 ----------
   * 关（默认）：Zen4 与 Xeon 都只用通用指令；Pavelor、Wish（Xeon 另有 Garnet）只能取参考实现。
   * 开：允许 AES-NI / SHA-NI 等，取各算法与基线允许密码指令时的数字。 */
  M.isa = !!store.get('ngcc.isa', false);
  M.setIsa = v => { M.isa = !!v; store.set('ngcc.isa', M.isa); };
  const USERS = PERF.isaUsers || { zen4: [], xeon: [] };
  M.usesIsa = (a, key) => (key === 'xeon' ? USERS.xeon : USERS.zen4).includes(a.name);
  /* 当前开关下的数值：key ∈ zen4 / s32 / s64 / s128 / mbps / xeon */
  M.pv = (a, key) => {
    const p = a.perf, pz = PERF.zen4[a.name] || {}, on = M.isa;
    if (key === 'xeon') return on ? p.xeon : ((PERF.xeonGeneral || {})[a.name] ?? p.xeon);
    if (key === 'zen4') return on ? p.zen4Aes : p.zen4;
    if (key === 'mbps') return on && pz.mbps_aes != null ? pz.mbps_aes : p.mbps;
    if (key === 's32') return on && pz.s32_aes != null ? pz.s32_aes : p.s32;
    if (key === 's64' || key === 's128') return on && M.usesIsa(a, 'zen4') ? null : p[key];
    return p[key];
  };
  /* 标记：开关关时这几家只有参考实现（ref）；开关开时它们用了 AES 指令（aes） */
  M.pflag = (a, key) => M.usesIsa(a, key === 'xeon' ? 'xeon' : 'zen4') ? (M.isa ? 'aes' : 'ref') : '';
  /* 基线：只有 SHA-256 受 SHA-NI 影响；允许密码指令时其 64 / 128 B 未单独测 */
  M.base = (n, key) => {
    const b = PERF.base[n], on = M.isa;
    if (key === 'zen4') return on ? b.aes : b.zen4;
    if (key === 's32') return on ? b.s32_aes : b.s32;
    if (key === 's64' || key === 's128') return on && n === 'SHA-256' ? null : b[key];
    if (key === 'mbps') return on && n === 'SHA-256' ? null : b.mbps;
    return null;
  };
  M.rank = (key) => {
    const xs = list.filter(a => M.pv(a, key) != null).sort((p, q) => M.pv(p, key) - M.pv(q, key));
    const r = {}; xs.forEach((a, i) => { r[a.id] = i + 1; });
    return { of: xs.length, r };
  };

  /* ---------- 本地化的字段 ---------- */
  M.hl = a => M.tx(a.tagline, (EN.highlights || {})[a.name]);
  M.modeS = a => M.tx(a.mode_short || a.mode, (EN.mode_short || {})[a.name]);
  M.fact = (a, k) => M.tx(a[k], ((EN.facts || {})[a.name] || {})[k]);
  M.units = a => M.lang === 'en' && (EN.units || {})[a.name] ? EN.units[a.name] : (a.units || []);
  M.summary = a => M.tx((SALG[a.name] || {}).summary, (EN.summaries || {})[a.name]);
  M.fT = f => { const e = (EN.findings || {})[f.id] || {}; return { title: M.tx(f.title, e.title), detail: M.tx(f.detail, e.detail), by: M.tx(f.by, e.by), note: M.tx((f.fix || {}).note, e.fix_note) }; };
  M.vLabel = (a, v) => v.sub ? (M.lang === 'en' ? 'Initial submission (package)' : '初始提交（提交包）') : M.tx(v.label, (EN.versions || {})[a.name + '|' + v.v]);
  M.lvName = k => ((M.DEF().levels || {})[k] || {}).name || k;
  M.fxName = k => ((M.DEF().fix || {})[k] || {}).name || k;
  M.vfName = k => ((M.DEF().verify || {})[k] || {}).name || k;
  M.kindName = k => ((M.DEF().kinds || {})[k] || {}).name || k;
  M.iName = k => ((M.DEF().impl_levels || {})[k] || {}).name || k;
  /* 候选表中文界面下第一家单位的中文名（只用于表格简写；卡片里保留原文） */
  const UNIT_ZH = {
    'Guilin University of Electronic Technology': '桂林电子科技大学', 'Institute of Information Engineering, Chinese Academy of Sciences': '中国科学院信息工程研究所',
    'CETC Cyberspace Security Technology Co., Ltd.': '中电科网络安全科技股份有限公司', 'East China Normal University': '华东师范大学',
    'Xiamen University': '厦门大学', 'Shandong University': '山东大学', 'Tsinghua University': '清华大学', 'Shanghai Jiao Tong University': '上海交通大学',
    'Hefei National Laboratory': '合肥国家实验室', 'Nanyang Technological University, Singapore': '新加坡南洋理工大学', 'Nanyang Technological University': '新加坡南洋理工大学',
    'Academy of Mathematics and Systems Science, Chinese Academy of Sciences': '中国科学院数学与系统科学研究院', 'South China Normal University': '华南师范大学',
    'Zhongguancun Laboratory': '中关村实验室', 'Beijing Institute of Technology': '北京理工大学', 'Institute of Software, Chinese Academy of Sciences': '中国科学院软件研究所',
    'University of Chinese Academy of Sciences': '中国科学院大学'
  };
  /* 候选表里的单位简写：只显示第一家，去掉“School of …, ”这类院系前缀；一条里用“/”或“;”并列的按多家计 */
  M.affShort = a => {
    const parts = M.units(a).flatMap(u => u.split(/\s+\/\s+|;\s*|；/)).map(x => x.trim()).filter(Boolean);
    if (!parts.length) return '';
    let f = parts[0];
    const zhIn = f.match(/[（(]([^（）()]*[\u4e00-\u9fff][^（）()]*)[）)]/);   // 英文名后括注的中文名
    if (M.lang === 'zh' && zhIn) f = zhIn[1];
    f = f.replace(/\s*[（(][^（）()]*[）)]\s*$/, '').replace(/（.*$/, '').replace(/^(School|Department|Faculty|College) of [^,]+,\s*/, '').trim();
    f = M.lang === 'zh' ? (UNIT_ZH[f] || f) : f.replace(/, Chinese Academy of Sciences$/, ', CAS');
    return f + (parts.length > 1 ? (M.lang === 'en' ? ` +${parts.length - 1}` : ` 等 ${parts.length} 家`) : '');
  };
  M.who = a => (a.authors || []).join(M.lang === 'en' ? ', ' : '、');   // 算法卡片列出全部设计者
  M.excerpt = (s, n) => { s = String(s || '').replace(/\n\s*\n+/g, '\n').trim(); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + ' …' : s; };
  M.href = p => String(p).split('/').map(encodeURIComponent).join('/');
  M.fmtB = b => b == null ? '' : b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  M.ZIP = n => 'https://www.niccs.org.cn/niccs/Proposal/Cryptographic%20Hash%20Algorithms/Round%201%20candidates/' + encodeURIComponent(n) + '.zip';
  M.fmtCpb = v => v == null ? '—' : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
})();
