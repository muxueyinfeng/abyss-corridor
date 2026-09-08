/* ============================================================
 * 《暗渊回廊》P1+P2 功能注入（背包批量/木桩/任务/过滤器）
 * 加载于 game.js 之后，用运行时覆盖方式挂接
 * ============================================================ */
'use strict';

// ---------- P1-1 批量分解/出售 ----------
window.__bagSel = new Set();
function toggleBagSel(uid) {
  if (window.__bagSel.has(uid)) window.__bagSel.delete(uid); else window.__bagSel.add(uid);
}
function bulkSalvage() {
  const sel = window.__bagSel;
  if (!sel.size) { toast('先勾选要分解的装备。'); return; }
  let cx = 0, cnt = 0;
  S.bag = S.bag.filter(it => {
    if (sel.has(it.uid)) { cx += SALVAGE_VAL[it.rarity] || 2; cnt++; return false; }
    return true;
  });
  S.cur.canxiang += cx;
  log(`🗑️ 批量分解 ${cnt} 件装备（残响+${cx}）。`);
  sel.clear(); save(); refresh();
}
function bulkSell() {
  const sel = window.__bagSel;
  if (!sel.size) { toast('先勾选要出售的装备。'); return; }
  let g = 0, cnt = 0;
  S.bag = S.bag.filter(it => {
    if (sel.has(it.uid)) { g += SELL_VAL[it.rarity] || 5; cnt++; return false; }
    return true;
  });
  S.gold += g;
  log(`💰 批量出售 ${cnt} 件装备（金币+${g}）。`);
  sel.clear(); save(); refresh();
}

// ---------- P1-2 卡手 ----------
function equipBlocked(it) {
  if (it.slot === 'weapon' && it.wtype && S.class) {
    const need = WEAPON_TYPES[it.wtype];
    if (need && need.forClass !== S.class) return need.n;
  }
  return null;
}

// ---------- P2-1 木桩 ----------
window.__dummy = null;
function hitDummy(skill) {
  const st = calc();
  let dmg, crit = Math.random() * 100 < st.crit, desc = '';
  if (skill === 'flame') { dmg = st.wdmg * 1.6 * (1 + st.fire / 100) * (1 + st.sFlame / 100); desc = '烈焰弹'; }
  else if (skill === 'ice') { dmg = st.wdmg * 0.95 * (1 + st.ice / 100) * (1 + st.sIce / 100); desc = '寒冰箭'; }
  else if (skill === 'shadow') { dmg = st.wdmg * 0.65 * (1 + st.sShadow / 100); desc = '影袭(单段)'; }
  else { dmg = st.wdmg * 0.8 * (1 + st.poison / 100); desc = '毒刃'; }
  if (crit) dmg *= 1 + st.critdmg / 100;
  window.__dummy = { dmg: Math.round(dmg), crit, desc };
  refresh();
}

// ---------- P2-3 任务系统 ----------
function questEvent(type) {
  if (!S || !S.quests) return;
  for (const qid of [...S.quests.active]) {
    const q = QUESTS.find(x => x.id === qid);
    if (!q) continue;
    const g = q.goal;
    if (g.type !== type) continue;
    S.quests.prog[qid] = (S.quests.prog[qid] || 0) + 1;
    if (S.quests.prog[qid] >= g.n) completeQuest(qid);
  }
}
function questGearCheck() {
  if (!S || !S.quests || !S.quests.active.includes('q5')) return;
  const q = QUESTS.find(x => x.id === 'q5');
  const n = Object.values(S.equip).filter(it => it && ['rare', 'epic', 'legendary', 'unique', 'mythic', 'set'].includes(it.rarity)).length;
  S.quests.prog.q5 = n;
  if (n >= q.goal.n) completeQuest('q5');
}
function completeQuest(qid) {
  const q = QUESTS.find(x => x.id === qid);
  if (!q || S.quests.done.includes(qid)) return;
  S.quests.active = S.quests.active.filter(x => x !== qid);
  S.quests.done.push(qid);
  const notes = applyFx(q.reward) || [];
  log(`📜 任务完成【${q.n}】！奖励：${notes.join(' · ')}`, 'gold');
  if (q.chain === 'main') {
    const next = QUESTS.find(x => x.chain === 'main' && x.lv <= S.level && !S.quests.done.includes(x.id) && !S.quests.active.includes(x.id));
    if (next) S.quests.active.push(next.id);
  } else if (q.repeat) {
    S.quests.active.push(qid); S.quests.prog[qid] = 0;
    log(`📜 悬赏刷新：【${q.n}】`, 'dim');
  }
}
function renderQuestsExtra() {
  const act = S.quests.active.map(id => QUESTS.find(q => q.id === id)).filter(Boolean);
  let html = '<h2 class="sec">任务</h2>';
  html += act.map(q => {
    const g = q.goal;
    let prog = S.quests.prog[q.id] || 0;
    if (g.type === 'gearScore') prog = Object.values(S.equip).filter(it => it && ['rare', 'epic', 'legendary', 'unique', 'mythic', 'set'].includes(it.rarity)).length;
    return `<div class="card-like"><b class="gold">${q.chain === 'main' ? '📜 主线' : '📄 悬赏'} · ${q.n}</b> <span class="muted">${q.lv}级+</span><br>${q.d}<br><span class="good">进度 ${Math.min(prog, g.n)}/${g.n}</span></div>`;
  }).join('') || '<p class="muted">暂无任务。</p>';
  return html;
}

// ---------- 装备弹窗增强：卡手拦截 + 对比表 ----------
const _origOpenItemModal = openItemModal;
openItemModal = function (src, ref) {
  const it = src === 'bag' ? S.bag.find(x => x.uid === ref) : S.equip[ref];
  if (!it) return;
  if (src === 'bag') {
    const blocked = it.slot === 'weapon' ? equipBlocked(it) : null;
    if (blocked) {
      $('#ev-title').textContent = '装备详情';
      $('#ev-text').innerHTML = itemCard(it).replace(/\n/g, '') + `<div class="bad">❌ 卡手：该武器类型仅限${blocked}职业装备。</div>`;
      const box = $('#ev-choices'); box.innerHTML = '';
      const mk = (t, fn) => { const b = document.createElement('button'); b.className = 'choice-btn'; b.textContent = t; if (fn) b.addEventListener('click', fn); box.appendChild(b); };
      mk(`🗑️ 分解 → 残响×${SALVAGE_VAL[it.rarity]}`, () => {
        S.cur.canxiang += SALVAGE_VAL[it.rarity];
        S.bag = S.bag.filter(x => x.uid !== ref);
        log(`🗑️ 分解了 ${it.name}。`); $('#modal').classList.add('hidden'); save(); refresh();
      });
      mk(`💰 出售 → 金币×${SELL_VAL[it.rarity]}`, () => {
        S.gold += SELL_VAL[it.rarity];
        S.bag = S.bag.filter(x => x.uid !== ref);
        log(`💰 出售了 ${it.name}。`); $('#modal').classList.add('hidden'); save(); refresh();
      });
      mk('关闭', () => $('#modal').classList.add('hidden'));
      $('#modal').classList.remove('hidden');
      return;
    }
  }
  _origOpenItemModal(src, ref);
  // 附加数值对比表
  setTimeout(() => {
    const target = src === 'bag' ? S.bag.find(x => x.uid === ref) : S.equip[ref];
    if (!target) return;
    const eq = S.equip[target.slot];
    if (!eq || eq.uid === target.uid) return;
    const ids = new Set([...(target.affixes || []).map(a => a.id), ...(eq.affixes || []).map(a => a.id)]);
    let rows = '';
    for (const id of ids) {
      const nv = (target.affixes || []).filter(a => a.id === id).reduce((s2, a) => s2 + a.val, 0);
      const ov = (eq.affixes || []).filter(a => a.id === id).reduce((s2, a) => s2 + a.val, 0);
      const d = Math.round((nv - ov) * 10) / 10;
      rows += `<div class="${d >= 0 ? 'up' : 'down'}">${AFFIXES[id].n}：${nv}${AFFIXES[id].unit || ''} vs ${ov}${AFFIXES[id].unit || ''}（${d >= 0 ? '+' : ''}${d}）</div>`;
    }
    if (rows) $('#ev-text').innerHTML += `<div class="card-like"><b>数值对比</b>${rows}</div>`;
  }, 0);
};

// ---------- 运行时覆盖：背包渲染加多选/批量 ----------
const _origRenderChar = renderChar;
renderChar = function () {
  _origRenderChar();
  // 注入批量按钮 + 勾选框
  const bagBox = $('#side-bag');
  if (!bagBox) return;
  const sel = window.__bagSel;
  const bar = document.createElement('div');
  bar.className = 'stat-grid'; bar.style.marginBottom = '6px';
  bar.innerHTML = `<button class="cost-chip" id="bs-salv" style="cursor:pointer;padding:5px 10px">🗑️ 分解选中</button>
    <button class="cost-chip" id="bs-sell" style="cursor:pointer;padding:5px 10px">💰 出售选中</button>
    <button class="cost-chip" id="bs-clear" style="cursor:pointer;padding:5px 10px">✖ 清除选择</button>`;
  bagBox.prepend(bar);
  document.getElementById('bs-salv').addEventListener('click', bulkSalvage);
  document.getElementById('bs-sell').addEventListener('click', bulkSell);
  document.getElementById('bs-clear').addEventListener('click', () => { sel.clear(); refresh(); });
  // 给每个背包项加勾选标记
  bagBox.querySelectorAll('[data-eqview^="bag:"]').forEach(b => {
    const uid = b.dataset.eqview.slice(4);
    const mark = document.createElement('span');
    mark.textContent = sel.has(uid) ? '☑ ' : '☐ ';
    mark.style.color = sel.has(uid) ? 'var(--accent)' : '#555';
    mark.style.cursor = 'pointer';
    mark.addEventListener('click', (e) => { e.stopPropagation(); toggleBagSel(uid); refresh(); });
    b.prepend(mark);
  });
};

// ---------- 运行时覆盖：出征面板加木桩 + 任务 ----------
const _origRenderMaps = renderMaps;
renderMaps = function () {
  _origRenderMaps();
  const panel = $('#panel-maps');
  if (!panel) return;
  // 木桩块插到最前
  const clsNow = S.class || 'elementalist';
  const skList = clsNow === 'shadowblade' ? [['shadow', '🗡️ 影袭(单段)'], ['venom', '🐍 毒刃']] : [['flame', '🔥 烈焰弹'], ['ice', '❄️ 寒冰箭']];
  const dummy = document.createElement('div');
  dummy.className = 'card-like'; dummy.style.borderColor = 'var(--accent)';
  const d = window.__dummy;
  dummy.innerHTML = `<b>🎯 木桩训练场</b> <span class="muted">搓完装备来这测一发</span>
    ${d ? `<div style="margin:8px 0;font-size:15px">${d.crit ? '✦ 会心！' : ''} <b class="gold">${d.desc} ▸ ${d.dmg.toLocaleString()}</b></div>` : '<div class="muted" style="margin:6px 0">还没打。选一个技能试试。</div>'}
    <div class="stat-grid">${skList.map(([k, nm]) => `<button class="cost-chip" data-dummy="${k}" style="cursor:pointer;padding:6px 12px">${nm}</button>`).join('')}</div>`;
  panel.prepend(dummy);
  dummy.querySelectorAll('[data-dummy]').forEach(b => b.addEventListener('click', () => hitDummy(b.dataset.dummy)));
  // 任务块插到最后
  const qdiv = document.createElement('div');
  qdiv.innerHTML = renderQuestsExtra();
  panel.appendChild(qdiv);
};

// ---------- 运行时覆盖：主城面板加过滤器 ----------
const _origRenderHub = renderHub;
renderHub = function () {
  _origRenderHub();
  const panel = $('#panel-hub');
  if (!panel || !S.filter) return;
  const fdiv = document.createElement('div');
  fdiv.innerHTML = `<h2 class="sec">⚙️ 拾取过滤器</h2>
    <p class="muted">品质 ≤ 所选档位：跳过拾取，或自动分解成残响。</p>
    <div class="stat-grid">${[['off', '关闭'], ['common', '跳过白装'], ['magic', '≤蓝装'], ['rare', '≤紫装']].map(([k, n]) =>
      `<button class="cost-chip ${S.filter.mode === k ? 'ok' : ''}" data-filter="${k}" style="cursor:pointer;padding:5px 12px">${n}</button>`).join('')}
      <button class="cost-chip ${S.filter.autoSalvage ? 'ok' : ''}" data-autosalv="1" style="cursor:pointer;padding:5px 12px">${S.filter.autoSalvage ? '♻️ 自动分解:开' : '自动分解:关'}</button></div>`;
  panel.appendChild(fdiv);
  fdiv.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { S.filter.mode = b.dataset.filter; toast('过滤器：' + b.textContent); save(); refresh(); }));
  fdiv.querySelectorAll('[data-autosalv]').forEach(b => b.addEventListener('click', () => { S.filter.autoSalvage = !S.filter.autoSalvage; save(); refresh(); }));
};

// ---------- 掉落过滤 + 任务埋点（覆盖victory与enterCombat挂钩） ----------
const _origVictory = victory;
victory = function () {
  const preBag = S.bag.length;
  _origVictory();
  // 战后处理新增掉落：应用过滤器
  const newItems = S.bag.slice(preBag);
  if (S.filter && S.filter.mode !== 'off' && newItems.length) {
    const order = ['common', 'magic', 'rare', 'epic'];
    const lim = order.indexOf(S.filter.mode);
    let salv = 0, removed = 0;
    for (const it of newItems) {
      const ri = order.indexOf(it.rarity);
      if (ri >= 0 && ri <= lim) {
        S.bag = S.bag.filter(x => x.uid !== it.uid);
        if (S.filter.autoSalvage) { S.cur.canxiang += SALVAGE_VAL[it.rarity] || 2; salv++; }
        removed++;
      }
    }
    if (removed) log(`⚙️ 过滤器：${removed} 件低品质装备未拾取${salv ? `（自动分解 ${salv} 件，残响+${S.cur.canxiang}）` : ''}`, 'dim');
  }
  // 任务埋点
  if (B === null || B === undefined) { /* 战斗已关 */ }
  questEvent(S.__lastCombatBoss ? 'bossAny' : 'packs');
  if (S.mapIdx >= STORY_MAPS.length) questEvent('abyss');
  questGearCheck();
};

// enterCombat 包一层记录Boss标记（原victory里用B.isBoss，但B此时已null）
const _origEnterCombat = enterCombat;
enterCombat = function (kind, mapIdx) {
  _origEnterCombat(kind, mapIdx);
  if (B) S.__lastCombatBoss = B.isBoss;
};

// 影刃/元素使击杀埋点：挂在playerCast后的敌人死亡路径上
const _origOnKill = onKill;
onKill = function (m) {
  _origOnKill(m);
  S.__killsThisFight = (S.__killsThisFight || 0) + 1;
};

// 初始化任务（老档兼容）
const _origRefresh = refresh;
refresh = function () {
  if (S && !S.quests) S.quests = { active: ['q1'], done: [], prog: {} };
  if (S && !S.filter) S.filter = { mode: 'off', autoSalvage: false };
  _origRefresh();
  if (S && S.quests) { /* renderQuestsExtra 已由 renderMaps 注入 */ }
};
