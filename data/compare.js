/* Comparison UI. Editorial profiles live in comparison.json (English: i18n/en/comparison.json). */
(function () {
  /* 中文为默认；英文由 window.atlasComparisonEn 与下方 TX.en 提供，render(algs, reset, 'en') 切换 */
  let lang = 'zh';
  let data = window.atlasComparison;
  let profiles = new Map(data.profiles.map(p => [p.id, p]));
  function setLang(l) {
    const next = l === 'en' && window.atlasComparisonEn ? 'en' : 'zh';
    if (next === lang) return;
    lang = next; data = next === 'en' ? window.atlasComparisonEn : window.atlasComparison;
    profiles = new Map(data.profiles.map(p => [p.id, p]));
  }
  const state = {mode: 'width', group: '1600', output: '512', selected: [], differences: false};
  const $ = s => document.querySelector(s);
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const variant = p => p.variants[state.output];
  const MAX_PICK = 6, DEFAULT_PICK = 4;
  let algorithms;
  let allGroups = [];
  let available = [];
  const TX = {
    zh: {
      kind: {permutation:'置换',transform:'内部变换',cipher:'分组密码',compression:'压缩核',feedback:'反馈生成器',matrix:'矩阵运算'},
      outer: {
        sponge: ['标准海绵','消息异或进吸收区，再调用置换','无模式前馈','从速率区截取；不足时继续挤出','吸收串行','容量占用状态空间，影响每次吸收量'],
        capacity: ['容量前馈海绵','消息异或进吸收区，再调用置换','置换后异或回旧容量','从容量区截取摘要','吸收串行','需保存容量；输出区与挤出量影响终结成本'],
        controlled: ['带额外控制的容量前馈海绵','按算法定义吸收消息','容量前馈','按算法定义终结输出','吸收串行','块计数器或预置总长度参与控制'],
        full: ['全状态前馈海绵','消息异或进吸收区，再调用置换','置换后异或回完整输入状态','从速率区读取；不足时裸置换挤出','吸收串行','每块保存整个状态，前馈范围更大'],
        mid: ['中途前馈海绵','注入消息，再执行两段内部调用','两段之间回馈容量或对齐窗口','从速率区读取；不足时裸置换挤出','两段内部调用前后依赖','保存前馈窗口；置换调用分为两段'],
        dual: ['双分支海绵','同一块经两次内部调用混合','按分支规则更新容量','按分支规则输出','两次内部调用串联','持久状态比单次置换宽'],
        counter: ['计数器前馈迭代'], jh: ['JH 式宽管迭代'], cipher: ['分组密码压缩迭代'], haifa: ['HAIFA 式压缩迭代'], chain: ['链值反馈与校验和'], tree: ['树哈希'], transform: ['变换型海绵','消息异或进速率区，再调用内部变换'], stream: ['流式 / 生成器构造'], homomorphic: ['群同态哈希']
      },
      seeDef: '见算法定义', workState: w => `${w} 位工作状态`, zcedmcFF: '两段之间前馈容量；公开论坛报告提交实现重复后六轮',
      bits: w => `${w} 位`, widthNote: '固定内部变换宽度，观察非线性、扩散和轮内顺序。', otherNote: '这些对象单独比较；工作状态不等于置换宽度。',
      shared: {'litchi-laurus':'Litchi / Laurus 共用原语', xrh:'XRH 共用原语', zc:'ZC 共用原语'},
      outerRows: {route:'外层构造',primitive:'核心原语',logical:'持久状态',input:'每块消息 / 输入',inject:'消息如何进入',feedforward:'前馈位置与范围',output:'摘要如何生成',parallel:'并行与调用依赖',impact:'结构带来的性质'},
      innerRows: {width:'内部变换宽度',layout:'状态布局',nonlinear:'非线性组件',diffusion:'扩散组件',pipeline:'轮内 / 状态更新步骤',rounds:'轮数 / 阶段安排',implementation:'实现性质',relation:'结构联系'},
      core: (p, w, k) => `${p} · ${w} 位${k}`, widthKind: (w, k) => `${w} 位 · ${k}`, coreHead: (w, k) => `${w} 位${k}`,
      doc: n => `${n} 文档 ↗`, outBits: o => `${o} 位输出`, details: n => `${n} 详情 →`, diff: '差异',
      caption: (g, o) => `${g}，${o} 位输出对比`, dim: '比较维度', none: '当前选择没有不同项。关闭“只看差异”可查看全部维度。', docs: '设计文档',
      count: (n, max, merged) => `已选 ${n} / ${max} 项${merged ? ' · 共用原语合并展示' : ''}`,
      catHead: ['分组', '比较重点', '本输出版本包含的算法'], catTitle: o => `浏览全部分组（${o} 位输出）`
    },
    en: {
      kind: {permutation:'permutation',transform:'internal transform',cipher:'block cipher',compression:'compression core',feedback:'feedback generator',matrix:'matrix operation'},
      outer: {
        sponge: ['Standard sponge','Message XORed into the absorbing part, then the permutation','No mode feed-forward','Taken from the rate; squeeze again if short','Absorption is serial','Capacity takes state space and limits each absorption'],
        capacity: ['Capacity feed-forward sponge','Message XORed into the absorbing part, then the permutation','Old capacity XORed back after the permutation','Digest taken from the capacity','Absorption is serial','Capacity must be kept; output part and squeeze amount set the finalisation cost'],
        controlled: ['Capacity feed-forward sponge with extra control','Message absorbed as the algorithm defines','Capacity feed-forward','Final output as the algorithm defines','Absorption is serial','Block counter or preset total length takes part in control'],
        full: ['Full-state feed-forward sponge','Message XORed into the absorbing part, then the permutation','Full input state XORed back after the permutation','Read from the rate; bare permutation squeezes if short','Absorption is serial','Whole state kept per block; wider feed-forward'],
        mid: ['Mid-point feed-forward sponge','Message injected, then two internal calls','Capacity or aligned window fed back between the two halves','Read from the rate; bare permutation squeezes if short','The two internal calls depend on each other','Feed-forward window kept; permutation call split in two'],
        dual: ['Two-branch sponge','Each block mixed by two internal calls','Capacity updated by the branch rules','Output by the branch rules','Two internal calls in series','Persistent state wider than one permutation'],
        counter: ['Counter feed-forward iteration'], jh: ['JH-style wide-pipe iteration'], cipher: ['Block-cipher compression iteration'], haifa: ['HAIFA-style compression iteration'], chain: ['Chaining-value feedback with checksum'], tree: ['Tree hash'], transform: ['Transform-based sponge','Message XORed into the rate, then the internal transform'], stream: ['Stream / generator construction'], homomorphic: ['Group-homomorphic hash']
      },
      seeDef: 'See the algorithm definition', workState: w => `${w}-bit working state`, zcedmcFF: 'Capacity fed forward between the two halves; public forum report: submitted implementation repeats the last six rounds',
      bits: w => `${w} bit`, widthNote: 'Fixed internal transform width: compare nonlinearity, diffusion and step order.', otherNote: 'Compared separately; the working state is not a permutation width.',
      shared: {'litchi-laurus':'Litchi / Laurus shared primitive', xrh:'XRH shared primitive', zc:'ZC shared primitive'},
      outerRows: {route:'Outer construction',primitive:'Core primitive',logical:'Persistent state',input:'Message / input per block',inject:'How the message enters',feedforward:'Feed-forward position and scope',output:'How the digest is produced',parallel:'Parallelism and call dependency',impact:'Resulting properties'},
      innerRows: {width:'Internal transform width',layout:'State layout',nonlinear:'Nonlinear component',diffusion:'Diffusion component',pipeline:'Steps in a round / state update',rounds:'Rounds / phases',implementation:'Implementation properties',relation:'Structural relation'},
      core: (p, w, k) => `${p} · ${w}-bit ${k}`, widthKind: (w, k) => `${w} bit · ${k}`, coreHead: (w, k) => `${w}-bit ${k}`,
      doc: n => `${n} document ↗`, outBits: o => `${o}-bit output`, details: n => `${n} details →`, diff: 'differs',
      caption: (g, o) => `${g}, ${o}-bit output comparison`, dim: 'Dimension', none: 'No differences in the current selection. Turn off “Differences only” to see all dimensions.', docs: 'Design documents',
      count: (n, max, merged) => `${n} / ${max} selected${merged ? ' · shared primitives merged' : ''}`,
      catHead: ['Group', 'What to compare', 'Algorithms in this output length'], catTitle: o => `Browse all groups (${o}-bit output)`
    }
  };
  const T = () => TX[lang];
  function outer(p) {
    const v = variant(p), d = T().outer[v.mode], keys = ['route','inject','feedforward','output','parallel','impact'];
    const result = Object.fromEntries(keys.map((k,i)=>[k,d[i] || T().seeDef]));
    Object.assign(result,p.outer);
    if(v.output) result.output=v.output;
    result.logical = v.logical || T().workState(v.width);
    if(p.algorithm==='zcedmc') result.feedforward=T().zcedmcFF;
    return result;
  }
  function pool() { return data.profiles.filter(p=>variant(p)&&!p.reference); }
  function groups() {
    const list=pool();
    if(state.mode==='outer') return data.outerGroups.map(([id,name,note,ids,modes])=>({id,name,note,ids:ids?ids.filter(key=>list.some(p=>p.id===key)):list.filter(p=>(modes||[id]).includes(variant(p).mode)).map(p=>p.id)})).filter(g=>g.ids.length);
    if(state.mode==='family') return data.families.map(([id,name,note])=>({id,name,note,ids:list.filter(p=>p.family===id).map(p=>p.id)})).filter(g=>g.ids.length);
    const core=list.filter(p=>['permutation','transform'].includes(p.kind));
    const widths=[...new Set(core.map(p=>variant(p).width))].sort((a,b)=>a-b);
    const entries=widths.map(w=>({id:String(w),name:T().bits(w),note:T().widthNote,ids:[...core.filter(p=>variant(p).width===w).map(p=>p.id)]}));
    for(const kind of ['cipher','compression','feedback','matrix']) {
      const ids=list.filter(p=>p.kind===kind).map(p=>p.id);
      if(ids.length)entries.push({id:kind,name:T().kind[kind],note:T().otherNote,ids});
    }
    return entries;
  }
  function merge(ids) {
    const found=new Map();
    for(const id of ids) {
      const p=profiles.get(id), key=state.mode==='outer'?id:`${p.primitive}-${variant(p).width}`;
      if(found.has(key))found.get(key).members.push(p);
      else found.set(key,{key,id,members:[p],p});
    }
    return [...found.values()].map(item=>{
      const members=item.members.slice().sort((a,b)=>(a.id==='litchi'?-1:b.id==='litchi'?1:0));
      return {...item,members,id:members[0].id,p:members[0],name:members.map(p=>p.name).join(' / ')};
    });
  }
  function defaults(items) {
    // “同一置换 · 不同模式”默认只选第一组（同一置换的三种模式）
    const n=state.mode==='outer'&&state.group==='same-core'?3:DEFAULT_PICK;
    return items.slice(0,Math.min(n,items.length)).map(i=>i.id);
  }
  function resolve(reset=false) {
    allGroups=groups();
    if(!allGroups.some(g=>g.id===state.group))state.group=allGroups[0].id;
    const group=allGroups.find(g=>g.id===state.group);
    available=merge(group.ids);
    const old=reset?[]:state.selected.filter(id=>available.some(i=>i.id===id));
    state.selected=old.length?old:defaults(available);
    return group;
  }
  function syncURL() {
    if($('#compare-view').classList.contains('active')) history.replaceState(null,'',`#compare/${state.mode}/${state.group}/${state.output}`);
  }
  const outerRows = [
    ['route',p=>outer(p).route],
    ['primitive',p=>T().core(T().shared[p.primitive]||p.name,variant(p).width,T().kind[p.kind])],
    ['logical',p=>outer(p).logical],['input',p=>variant(p).input],
    ['inject',p=>outer(p).inject],['feedforward',p=>outer(p).feedforward],
    ['output',p=>outer(p).output],['parallel',p=>outer(p).parallel],
    ['impact',p=>outer(p).impact]
  ];
  const innerRows = [
    ['width',p=>T().widthKind(variant(p).width,T().kind[p.kind])],['layout',p=>variant(p).layout||p.layout],
    ['nonlinear',p=>p.nonlinear],['diffusion',p=>p.diffusion],
    ['pipeline',p=>p.pipeline],['rounds',p=>variant(p).rounds],
    ['implementation',p=>p.implementation],['relation',p=>p.relation]
  ];
  const docUrl = u => /^https?:/.test(u) ? u : ((window.SITE_ROOTS && window.SITE_ROOTS.atlas) || '') + u.split('/').map(encodeURIComponent).join('/');
  function sources(item) {
    return item.members.map(p=>`<a href="${escape(docUrl(p.source.url))}" target="_blank" rel="noopener">${escape(T().doc(p.name))}</a>`).join('');
  }
  function header(item) {
    const p=item.p, v=variant(p);
    return `<span class="comparison-kicker">${escape(T().outBits(state.output))}</span><strong>${escape(item.name)}</strong><span class="comparison-core">${escape(T().coreHead(v.width,T().kind[p.kind]))}</span>${`<div class="comparison-open">${[...new Set(item.members.map(p=>p.algorithm))].map(id=>`<button type="button" data-algorithm="${escape(id)}">${escape(T().details(algorithms[id].name))}</button>`).join('')}</div>`}`;
  }
  function matrix() {
    const items=state.selected.map(id=>available.find(i=>i.id===id));
    const rows=state.mode==='outer'?outerRows:innerRows;
    let shown=0;
    const labels=state.mode==='outer'?T().outerRows:T().innerRows;
    const body=rows.map(([key,value])=>{const label=labels[key];
      const values=items.map(i=>value(i.p));
      const different=new Set(values.map(v=>JSON.stringify(v))).size>1;
      if(state.differences&&!different)return '';
      shown++;
      return `<tr class="${different?'comparison-different':'comparison-same'}"><th scope="row">${escape(label)}${different?`<span class="difference-mark">${T().diff}</span>`:''}</th>${values.map(v=>`<td>${key==='pipeline'?`<div class="comparison-pipeline">${v.map((step,i)=>`<span class="pipeline-step ${step.type}"><b>${escape(step.code)}</b><small>${escape(step.label)}</small></span>${i<v.length-1?'<span class="pipeline-arrow" aria-hidden="true">→</span>':''}`).join('')}</div>`:escape(v)}</td>`).join('')}</tr>`;
    }).join('');
    $('#comparison-matrix').innerHTML=`<caption class="sr-only">${escape(T().caption(allGroups.find(g=>g.id===state.group).name,state.output))}</caption><thead><tr><th scope="col">${T().dim}</th>${items.map(i=>`<th scope="col">${header(i)}</th>`).join('')}</tr></thead><tbody>${body}${shown?'':`<tr><td colspan="${items.length+1}">${escape(T().none)}</td></tr>`}</tbody><tfoot><tr><th scope="row">${T().docs}</th>${items.map(i=>`<td><div class="comparison-sources">${sources(i)}</div></td>`).join('')}</tr></tfoot>`;
    $('#comparison-matrix').style.setProperty('--compare-columns',items.length);
    $('#comparison-count').textContent=T().count(items.length,MAX_PICK,state.mode!=='outer');
    $('#comparison-picker').innerHTML=available.map(i=>`<label class="comparison-choice ${state.selected.includes(i.id)?'selected':''}"><input type="checkbox" data-compare-profile="${escape(i.id)}" ${state.selected.includes(i.id)?'checked':''} ${state.selected.length>=MAX_PICK&&!state.selected.includes(i.id)?'disabled':''}><span>${escape(i.name)}</span></label>`).join('');
  }
  function catalogue() {
    const rows=allGroups.map(g=>{
      const items=merge(g.ids);
      return `<tr><th scope="row"><button type="button" data-compare-group="${escape(g.id)}">${escape(g.name)} →</button></th><td>${escape(g.note)}</td><td>${items.map(i=>`<span class="catalogue-member">${escape(i.name)}</span>`).join('')}</td></tr>`;
    }).join('');
    $('#comparison-catalogue').innerHTML=`<thead><tr>${T().catHead.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody>`;
    $('#comparison-catalogue-title').textContent=T().catTitle(state.output);
  }
  function render(a, reset=false, l) {
    if(l)setLang(l);
    algorithms=a||algorithms;
    const group=resolve(reset), mode=data.modes.find(m=>m.id===state.mode);
    $('#comparison-mode-title').textContent=mode.name;
    $('#comparison-mode-intro').textContent=mode.intro;
    $('#comparison-group-note').textContent=group.note;
    $('#comparison-group').innerHTML=allGroups.map(g=>`<option value="${escape(g.id)}">${escape(g.name)}</option>`).join('');
    $('#comparison-group').value=state.group;
    $('#comparison-output').value=state.output;
    document.querySelectorAll('[data-compare-mode]').forEach(el=>{
      const active=el.dataset.compareMode===state.mode;
      el.setAttribute('aria-selected',String(active));el.setAttribute('tabindex',active?'0':'-1');el.classList.toggle('active',active);
    });
    $('#comparison-panel').setAttribute('aria-labelledby',`compare-tab-${state.mode}`);
    $('#comparison-differences').checked=state.differences;
    $('#comparison-inner-legend').hidden=state.mode==='outer';
    matrix();catalogue();syncURL();
  }
  function restore() {
    const match=location.hash.match(/^#compare\/(outer|width|family)\/([a-z0-9-]+)\/(512|768|1024)$/);
    if(match) {state.mode=match[1];state.group=match[2];state.output=match[3];state.selected=[];}
  }
  restore();
  document.addEventListener('click',e=>{
    const tab=e.target.closest('[data-compare-mode]');
    if(tab){state.mode=tab.dataset.compareMode;state.group=state.mode==='width'?'1600':state.mode==='outer'?'sponge':'chi';render(null,true);return;}
    const group=e.target.closest('[data-compare-group]');
    if(group){state.group=group.dataset.compareGroup;render(null,true);$('#comparison-group').focus();}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='comparison-group'){state.group=e.target.value;render(null,true);}
    if(e.target.id==='comparison-output'){state.output=e.target.value;render(null,true);}
    if(e.target.id==='comparison-differences'){state.differences=e.target.checked;matrix();}
    if(e.target.dataset.compareProfile){
      const id=e.target.dataset.compareProfile;
      if(e.target.checked&&state.selected.length<MAX_PICK)state.selected.push(id);
      else if(!e.target.checked&&state.selected.length>1)state.selected=state.selected.filter(x=>x!==id);
      matrix();
      const checkbox=$(`[data-compare-profile="${id}"]`);if(checkbox)checkbox.focus();
    }
  });
  document.addEventListener('keydown',e=>{
    const tab=e.target.closest('[data-compare-mode]');
    if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    const ids=data.modes.map(m=>m.id), i=ids.indexOf(tab.dataset.compareMode);
    const next=e.key==='Home'?0:e.key==='End'?ids.length-1:(i+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length;
    e.preventDefault();$(`#compare-tab-${ids[next]}`).click();$(`#compare-tab-${ids[next]}`).focus();
  });
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#compare/')){restore();render();}});
  window.HashAtlasCompare={render,setLang};
})();
