/* ============================================================
 * 《暗渊回廊》核心引擎 —— 文字版暗黑/流放
 * 战斗演出三档节奏 / 词缀装备 / 手搓打造 / 天赋树 / 异界终局
 * ============================================================ */
'use strict';

// ---------- 事件与效果应用 ----------
function applyFx(fx) {
  if (!fx) return [];
  const notes = [];
  const HM = { hp: '气血', morale: '心情' };
  for (const [k, v] of Object.entries(fx)) {
    if (k === 'yuanjing' || k === 'canxiang' || k === 'xinghe') {
      S.cur[k] = Math.max(0, (S.cur[k] || 0) + v);
      notes.push({ yuanjing: '渊晶', canxiang: '残响', xinghe: '星核尘' }[k] + (v > 0 ? '+' : '') + v);
    } else if (k === 'yinliang' || k === 'shengwang' || k === 'muliao') {
      S[k] = Math.max(0, S[k] + v);
      notes.push({ yinliang: '金币', shengwang: '声望', muliao: '木料' }[k] + (v > 0 ? '+' : '') + v);
    } else if (k in HM) {
      S[k] = Math.min(100, Math.max(0, S[k] + v));
      notes.push(HM[k] + (v > 0 ? '+' : '') + v);
    } else if (k === 'gamble') {
      const slot = Object.keys(SLOTS)[rnd(Object.keys(SLOTS).length)];
      const roll = Math.random();
      const rar = roll < 0.08 ? 'legendary' : roll < 0.3 ? 'epic' : roll < 0.65 ? 'rare' : 'magic';
      const g = makeItem(slot, rar, S.level + 2);
      S.bag.push(g); notes.push('获得 ' + g.name);
    } else if (k === 'sacrifice') {
      if (S.bag.length) {
        const worst = S.bag.reduce((a, b) => ((a.affixes || []).length <= (b.affixes || []).length ? a : b));
        S.bag = S.bag.filter(x => x.uid !== worst.uid);
        S.cur.yuanjing += 3;
        notes.push('献祭 ' + worst.name + ' · 渊晶+3');
      } else notes.push('背包空空，深渊表示失望');
    } else if (k === 'hire') {
      S.mercNext = true; notes.push('佣兵随你出战一场（伤害+35%）');
    }
  }
  return notes;
}
function showEvent(ev) {
  $('#ev-title').textContent = ev.title;
  $('#ev-text').textContent = ev.text;
  const box = $('#ev-choices'); box.innerHTML = '';
  ev.choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn'; btn.textContent = '➤ ' + c.t;
    btn.addEventListener('click', () => {
      let msg = c.msg, fx = c.fx;
      if (c.rand) { const r = c.rand[Math.random() < c.rand[0].ch ? 0 : 1]; msg = r.msg; fx = r.fx; }
      const notes = applyFx(fx) || [];
      log(`🗝【${ev.title}】${msg}`);
      $('#ev-text').innerHTML = `${msg}${notes.length ? `<br><span class="gold">（${notes.join(' · ')}）</span>` : ''}`;
      box.innerHTML = '';
      const again = document.createElement('button');
      again.className = 'choice-btn'; again.textContent = '➤ 继续深入';
      again.addEventListener('click', () => { $('#modal').classList.add('hidden'); refresh(); });
      box.appendChild(again);
    });
    box.appendChild(btn);
  });
  $('#modal').classList.remove('hidden');
}

const SAVE_KEY = 'abyss_save_v1';
const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

let S = null;

function newState() {
  return {
    class: null,
    level: 1, xp: 0, hp: 100,
    gold: 50,
    mats: { transmute: 3, augment: 2, exalted: 1, chaos: 1, lock: 0, sublimate: 0 },
    cur: { yuanjing: 3, canxiang: 0, xinghe: 0 },
    talents: { used: 0, nodes: [] },
    equip: {}, // slot -> item
    bag: [],
    pot: { hp: 2, focus: 1 },
    stock: [], stockSeed: 0,
    mapIdx: 0,
    abyssTier: 1, abyssDiff: 'normal',
    kills: 0, bossKills: [], finds: [],
    stats: { kills: 0, elites: 0, drops: 0 },
    log: [],
  };
}
function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }
function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!d || !d.level) return null;
    if (!d.pot) d.pot = { hp: 2, focus: 1 };
    if (!d.class) d.class = 'elementalist';
    (d.bag || []).forEach(it => { if (!it.name && BASES[it.slot]) { const a = AFFIXES[it.affixes?.[0]?.id]; it.name = (a ? a.pre[0] + '的' : '朴素的') + BASES[it.slot][0]; } });
    Object.values(d.equip || {}).forEach(it => { if (it && !it.name && BASES[it.slot]) { const a = AFFIXES[it.affixes?.[0]?.id]; it.name = (a ? a.pre[0] + '的' : '朴素的') + BASES[it.slot][0]; } });
    if (!d.stats) d.stats = { kills: 0, elites: 0, drops: 0 };
    return d;
  } catch (e) { return null; }
}
function log(msg, cls) { S.log.unshift({ msg, cls: cls || '' }); if (S.log.length > 150) S.log.pop(); }
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}
function barRow(label, val, color, extra) {
  return `<div class="bar-row"><span class="bar-label">${label}</span>
    <div class="bar"><div style="width:${Math.max(0, Math.min(100, val))}%;background:${color}"></div></div>
    <span class="bar-val">${extra !== undefined ? extra : Math.round(val)}</span></div>`;
}

// ---------- 属性派生 ----------
const xpNeed = lv => Math.round(40 * Math.pow(1.32, lv - 1));
const TALENT_FX = () => {
  const acc = {};
  for (const br of Object.values(TALENTS)) {
    for (const k of [...br.nodes, ...br.keys]) {
      if (!S.talents.nodes.includes(k.id)) continue;
      for (const [key, v] of Object.entries(k.fx || {})) acc[key] = (acc[key] || 0) + v;
    }
  }
  return acc;
};
function gearFx(key) {
  let sum = 0;
  for (const it of Object.values(S.equip)) {
    if (!it) continue;
    for (const a of (it.affixes || [])) if (a.id === key) sum += a.val;
    if (it.stat && it.stat[key]) sum += it.stat[key];
  }
  return sum;
}
function setCount(setId) {
  return Object.values(S.equip).filter(it => it && it.set === setId).length;
}
function setFx(key) {
  let sum = 0;
  for (const [sid, set] of Object.entries(SETS)) {
    const n = setCount(sid);
    for (const [need, fx] of Object.entries(set.bonus)) {
      if (n >= +need && fx[key] !== undefined) sum += fx[key];
    }
  }
  return sum;
}
function hasFx(key) {
  // 布尔型特效：装备 fx / 套装 bonus / 天赋
  for (const it of Object.values(S.equip)) if (it && it.fx && it.fx[key]) return true;
  for (const [sid, set] of Object.entries(SETS)) {
    const n = setCount(sid);
    for (const [need, fx] of Object.entries(set.bonus)) if (n >= +need && fx[key]) return true;
  }
  return !!TALENT_FX()[key];
}
function talentV(key) { return TALENT_FX()[key] || 0; }

function calc() {
  const wdmgFlat = gearFx('wdmg') + talentV('wdmg');
  let wdmg = 10 + S.level * 3 + wdmgFlat;
  let hp = 100 + S.level * 12 + gearFx('hp') + talentV('hp');
  const crit = Math.min(75, 5 + gearFx('crit') + talentV('crit'));
  const critdmg = 50 + gearFx('critdmg') + talentV('critdmg');
  let fire = gearFx('fire') + talentV('fire') + setFx('fire');
  let ice = gearFx('ice') + talentV('ice') + setFx('ice');
  const sFlame = gearFx('sFlame') + talentV('sFlame') + setFx('sFlame');
  const sIce = gearFx('sIce') + talentV('sIce') + setFx('sIce');
  const burn = gearFx('burn') + talentV('burn');
  const chill = Math.min(60, gearFx('chill') + talentV('chill') + setFx('chill') + (hasFx('chillPlus') ? 50 : 0));
  let vul = gearFx('vul') + talentV('vul') + (hasFx('vulBonus') ? 60 : 0);
  const cast = Math.min(80, gearFx('cast') + talentV('cast'));
  let armor = gearFx('armor') + talentV('armor');
  // 暗金百分比修正
  for (const it of Object.values(S.equip)) {
    if (!it || !it.fx) continue;
    if (it.fx.hpPct) hp *= 1 + it.fx.hpPct;
    if (it.fx.armorPct) armor *= 1 + it.fx.armorPct;
  }
  const legCount = Object.values(S.equip).filter(it => it && it.rarity === 'legendary').length;
  if (hasFx('perLegendary')) wdmg *= 1 + legCount * 0.04;
  if (hasFx('atkPct')) wdmg *= 1 + 0;
  let proj = 1 + setFx('projPlus') + (hasFx('projPlus') ? talentV('projPlus') : 0);
  const sShadow = gearFx('sShadow') + talentV('sShadow') + setFx('sShadow');
  const combo = Math.min(60, gearFx('combo') + talentV('combo') + setFx('combo'));
  const poison = gearFx('poison') + talentV('poison') + setFx('poison');
  let dodge = talentV('dodge') + (S.class === 'shadowblade' ? 15 : 0);
  const armorT = talentV('armorPctT');
  if (armorT) armor *= (1 + armorT);
  return { wdmg: Math.round(wdmg), hp: Math.round(hp), crit, critdmg, fire: Math.round(fire), ice: Math.round(ice), sFlame, sIce, sShadow, combo, poison: Math.round(poison), dodge, burn, chill, vul: Math.round(vul), cast, armor: Math.round(armor), proj, maxHp: Math.round(hp) };
}

// ---------- 装备生成 ----------
const RARITY_ORDER = ['common', 'magic', 'rare', 'epic'];
function rollAffix(ilvl, exclude) {
  const keys = Object.keys(AFFIXES).filter(k => !exclude.includes(k));
  // 权重：rare 值越小越稀有
  const weighted = [];
  for (const k of keys) { const w = Math.round((AFFIXES[k].w || 1) * 10); for (let i = 0; i < w; i++) weighted.push(k); }
  const id = weighted[rnd(weighted.length)];
  const a = AFFIXES[id];
  const max = a.v[1] * (1 + 0.24 * (ilvl - 1));
  const cap = AFFIX_CAPS[id];
  let val = Math.round((a.v[0] * (1 + 0.24 * (ilvl - 1)) + Math.random() * (max - a.v[0] * (1 + 0.24 * (ilvl - 1)))) * 10) / 10;
  if (cap) val = Math.min(cap, val);
  if (!a.unit) val = Math.round(val);
  return { id, val };
}
function affixName(a) {
  const def = AFFIXES[a.id];
  return `${def.pre[rnd(def.pre.length)]}${def.unit === '%' ? '' : ''}`;
}
function itemName(slot, rarity, affixes, fxTitle) {
  const base = BASES[slot][rnd(BASES[slot].length)];
  if (rarity === 'common') return '朴素的' + base;
  if (rarity === 'magic') return affixes[0] ? AFFIXES[affixes[0].id].pre[rnd(AFFIXES[affixes[0].id].pre.length)] + '的' + base : base;
  if (rarity === 'rare') return affixes[0] ? AFFIXES[affixes[0].id].pre[rnd(AFFIXES[affixes[0].id].pre.length)] + '的' + base : '稀有' + base;
  if (rarity === 'epic') {
    const p1 = affixes[0] ? AFFIXES[affixes[0].id].pre[rnd(AFFIXES[affixes[0].id].pre.length)] : '精工';
    const p2 = affixes[1] ? AFFIXES[affixes[1].id].pre[rnd(AFFIXES[affixes[1].id].pre.length)] : '瑰丽';
    return p2 + '·' + p1 + '的' + base;
  }
  if (rarity === 'legendary') return (fxTitle || '无名') + base;
  return base;
}
function rollRarity(mapLv, isBoss, inAbyss, diffMult) {
  const maxed = S.level >= 30;
  let pool = [];
  if (!maxed) pool = [['common', 18], ['magic', 30], ['rare', 26], ['epic', 16]];
  else {
    const tierBoost = Math.min(14, (inAbyss ? S.abyssTier * 0.8 : 0) + (diffMult > 2 ? 5 : diffMult > 1 ? 2 : 0));
    pool = [['common', 6], ['magic', 14], ['rare', 20], ['epic', 22], ['legendary', 10 + tierBoost * 0.5], ['unique', 4 + tierBoost * 0.25], ['mythic', 1 + tierBoost * 0.1], ['set', 6 + tierBoost * 0.3]];
  }
  if (isBoss) pool = pool.map(([r, w]) => [r, r === 'common' || r === 'magic' ? w * 0.3 : w * 1.8]);
  if (talentV('lootQty')) pool = pool.map(([r, w]) => [r, r === 'common' || r === 'magic' ? w * 1.5 : w * 0.7]);
  const total = pool.reduce((a, [r, w]) => a + w, 0);
  let roll = Math.random() * total;
  for (const [r, w] of pool) { roll -= w; if (roll <= 0) return r; }
  return 'magic';
}
function makeItem(slot, rarity, ilvl) {
  const it = { uid: uid(), slot, rarity, ilvl, affixes: [] };
  const n = RARITY[rarity].affixes;
  if (Array.isArray(n)) {
    const ex = [];
    const count = n[0] + rnd(n[1] - n[0] + 1);
    for (let i = 0; i < count; i++) {
      const a = rollAffix(ilvl, ex);
      ex.push(a.id); it.affixes.push(a);
    }
    it.name = itemName(slot, rarity, it.affixes);
  }
  if (rarity === 'legendary') {
    const e = LEGENDARY_EFFECTS[rnd(LEGENDARY_EFFECTS.length)];
    it.fx = { [e.id]: true }; it.fxText = e.n;
    const ex = [];
    for (let i = 0; i < 4; i++) { const a = rollAffix(ilvl, ex); ex.push(a.id); it.affixes.push(a); }
    it.name = itemName(slot, 'legendary', it.affixes, e.titles[rnd(e.titles.length)]);
  }
  if (rarity === 'unique') {
    const cand = UNIQUES.filter(u => u.slot === slot);
    const u = cand.length ? cand[rnd(cand.length)] : UNIQUES[rnd(UNIQUES.length)];
    it.name = u.n; it.fx = u.fx; it.fxText = u.d; it.lore = u.lore; it.stat = u.stat; it.slot = u.slot;
    it.affixes = [rollAffix(ilvl, [])];
  }
  if (rarity === 'mythic') {
    const cand = MYTHICS.filter(m => m.slot === slot);
    const m = cand.length ? cand[rnd(cand.length)] : MYTHICS[rnd(MYTHICS.length)];
    it.name = m.n; it.fx = m.fx; it.fxText = m.d; it.lore = m.lore; it.stat = m.stat; it.slot = m.slot;
    it.affixes = [rollAffix(ilvl, []), rollAffix(ilvl, ['hp'])];
  }
  if (rarity === 'set') {
    const setId = Math.random() < 0.5 ? 'ember' : 'winter';
    it.set = setId; it.rarity = 'set';
    it.affixes = [rollAffix(ilvl, []), rollAffix(ilvl, [])];
    it.name = SETS[setId].n + '·' + BASES[slot][rnd(BASES[slot].length)];
  }
  it.name = it.name || itemName(slot, rarity, it.affixes || []);
  return it;
}
function dropGear(ilvl, isBoss, inAbyss, diffMult) {
  const slotPool = Object.keys(SLOTS);
  const slot = slotPool[rnd(slotPool.length)];
  const rarity = rollRarity(ilvl, isBoss, inAbyss, diffMult);
  const it = makeItem(slot, rarity, ilvl);
  it._new = true;
  return it;
}
function rarityTag(r) { return `<span style="color:${RARITY[r].color}">[${RARITY[r].n}]</span>`; }
function itemCard(it, compare) {
  const rc = RARITY[it.rarity].color;
  let aff = (it.affixes || []).map(a => `<div class="aff">+${a.val}${AFFIXES[a.id].unit || ''} ${AFFIXES[a.id].n}</div>`).join('');
  let fxL = it.fxText ? `<div class="fx">✦ ${it.fxText}</div>` : '';
  let lore = it.lore ? `<div class="lore">「${it.lore}」</div>` : '';
  let setL = it.set ? `<div class="fx">${SETS[it.set].icon} ${SETS[it.set].n}套装（${setCount(it.set)}/6）</div>` : '';
  let cmp = '';
  if (compare) {
    const eq = S.equip[it.slot];
    if (eq && eq.uid !== it.uid) {
      const score = i => (i.affixes || []).reduce((s, a) => s + a.val * (AFFIXES[a.id].unit === '%' ? 2 : 1), 0) + (i.stat ? Object.values(i.stat).reduce((x, y) => x + y, 0) : 0);
      const d = score(it) - score(eq);
      cmp = `<div class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲ 优于' : '▼ 弱于'}已装备（${d >= 0 ? '+' : ''}${d}）</div>`;
    } else cmp = '<div class="up">当前槽位空</div>';
  }
  return `<div class="item" style="border-color:${rc}">
    <div class="iname" style="color:${rc}">${it.name} ${rarityTag(it.rarity)}</div>
    <div class="imeta">装等 ${it.ilvl} · ${SLOTS[it.slot].icon}${SLOTS[it.slot].n}</div>
    ${aff}${fxL}${setL}${lore}${cmp}
  </div>`;
}

// ---------- 战斗 ----------
let B = null; // battle state
function mobHP(mlvl) { return Math.round(28 * Math.pow(1.18, mlvl - 1)); }
function mobAtk(mlvl) { return Math.round(6 * Math.pow(1.16, mlvl - 1)); }

function enterCombat(kind, mapIdx) {
  if (mapIdx === undefined) mapIdx = Math.min(S.mapIdx, STORY_MAPS.length - 1);
  const inAbyss = mapIdx >= STORY_MAPS.length;
  const tier = inAbyss ? mapIdx - STORY_MAPS.length + 1 : 0;
  if (inAbyss) S.abyssTier = tier;
  const abysName = inAbyss ? ABYSS_MAPS[tier - 1] : null;
  const diff = DIFFS[S.abyssDiff];
  const storyMap = inAbyss ? null : STORY_MAPS[mapIdx];
  const mlvl = inAbyss ? 29 + tier : storyMap.lv + rnd(3);
  const isBoss = kind === 'boss';
  const packN = isBoss ? 1 : (inAbyss ? 2 + rnd(2) + (S.abyssDiff === 'hell' ? 1 : 0) : 1 + rnd(2));
  const mobs = [];
  const names = inAbyss ? MOB_BASES : storyMap.mobs;
  const bossName = isBoss ? (inAbyss ? '回廊守卫·' + abysName : storyMap.boss.n) : '';
  for (let i = 0; i < packN; i++) {
    const hp = Math.round(mobHP(mlvl) * (isBoss ? 6 : 1) * (inAbyss ? diff.mult : 1) * (0.85 + Math.random() * 0.3));
    const atk = Math.round(mobAtk(mlvl) * (isBoss ? 1.8 : 1) * (inAbyss ? Math.sqrt(diff.mult) : 1));
    mobs.push({ n: (isBoss ? bossName : names[rnd(names.length)]) + (packN > 1 ? '·' + '甲乙丙丁'[i] : ''), hp, maxHp: hp, atk, vulnerable: false, frozen: 0, burn: 0 });
  }
  B = { mobs, mlvl, isBoss, inAbyss, mapIdx, diff: diff.mult, turn: 0, focus: 0, castBonus: 0, shield: hasFx('blind') ? 2 : 0, killAtk: 0, earlyBuff: hasFx('L12') ? 3 : 0, iceStack: 0, over: false, merc: !!S.mercNext, potHp: 0, potFocus: 0 };
  if (S.mercNext) { S.mercNext = false; bline('cine', '🗡 雇佣兵掂了掂手里的刀：「这一场，算我的。」（伤害+35%）'); }
  if (isBoss) S.stats.elites++;
  $('#battle-title').textContent = isBoss ? `💀 首领战 · ${mobs[0].n}` : `⚔️ 遭遇战 · ${mobs.length} 名敌人`;
  $('#battle').classList.remove('hidden');
  $('#blog').innerHTML = '';
  bline('div', `⚔️ 战斗开始！${mobs.map(m => m.n).join('、')}（气血 ${mobs.map(m => m.hp).join('/')}）`, 'sys');
  if (hasFx('blind')) bline('div', '👁 无眠之眼睁开——前2次攻击被格挡。', 'sys');
  if (hasFx('L10')) { B.shieldHp = Math.round(calc().maxHp * 0.3); bline('div', `🛡 磐石守誓展开护盾（${B.shieldHp}）。`, 'sys'); }
  bline('sys2', '');
  refreshCombat();
}
function bline(kind, text, cls) {
  const box = $('#blog');
  if (kind === 'crit') box.innerHTML += `<div class="b-crit">${text}</div>`;
  else if (kind === 'cine') box.innerHTML += `<div class="b-cine">${text}</div>`;
  else if (kind === 'sys') box.innerHTML += `<div class="b-sys">${text}</div>`;
  else if (kind === 'sys2') box.innerHTML += '<div style="height:8px"></div>';
  else box.innerHTML += `<div class="b-line">${text}</div>`;
  box.scrollTop = box.scrollHeight;
}
function dmgLine(target, dmg, isCrit, flavor) {
  const critPart = isCrit ? `✦ 会心一击 ▸ ${dmg.toLocaleString()} ✦` : null;
  if (isCrit) {
    bline('crit', critPart);
    const box = document.querySelector('.bwrap-box');
    if (box) { box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 300); }
  } else bline('line', `${flavor} ▸ ${dmg.toLocaleString()}`);
}
// 程序化音效：品质越高音越亮（Web Audio 合成，零素材）
let _audio = null;
function lootSound(rarity) {
  try {
    _audio = _audio || new (window.AudioContext || window.webkitAudioContext)();
    const freqs = { common: 440, magic: 550, rare: 660, epic: 784, legendary: 880, unique: 988, mythic: 1175, set: 784 };
    const f = freqs[rarity] || 440;
    const o = _audio.createOscillator(), g = _audio.createGain();
    o.type = rarity === 'mythic' || rarity === 'unique' ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(f, _audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(f * 2, _audio.currentTime + 0.18);
    g.gain.setValueAtTime(0.12, _audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _audio.currentTime + 0.35);
    o.connect(g); g.connect(_audio.destination);
    o.start(); o.stop(_audio.currentTime + 0.35);
  } catch (e) { }
}
function playerCast(skill) {
  if (B.over) return;
  if (S.class === 'shadowblade') return castShadow(skill);
  if (skill === 'ice' && hasFx('banIce')) { toast('焚书者封印了寒冰箭！'); return; }
  const st = calc();
  B.turn++;
  const early = B.earlyBuff > 0;
  if (early) B.earlyBuff--;
  const focusMult = 1 + B.focus * 0.03 * (hasFx('focusDouble') ? 2 : 1);
  const lowRage = (S.hp < st.maxHp * 0.3 && hasFx('lowHpRage')) ? 1.8 : 1;
  let total = 0, killed = [];
  const alive = B.mobs.filter(m => m.hp > 0);
  const castTimes = 1 + ((Math.random() < st.cast / 100 || hasFx('castAlways')) ? 1 : 0);
  let epiphany = false;

  for (let c = 0; c < castTimes; c++) {
    if (skill === 'flame') {
      let targets = alive.filter(m => m.hp > 0);
      const main = targets[0];
      if (!main) break;
      let mult = 1.6, crit = Math.random() * 100 < st.crit, dmg = st.wdmg * mult;
      dmg *= 1 + st.fire / 100; dmg *= 1 + st.sFlame / 100; dmg *= focusMult;
      if (early) dmg *= 1.8;
      if (B.killAtk) dmg *= 1 + B.killAtk;
      if (main.vulnerable) dmg *= 1.3 + st.vul / 100;
      if (crit) dmg *= 1 + st.critdmg / 100;
      if (lowRage > 1) dmg *= lowRage;
      if (hasFx('dragonBreath') && Math.random() < 0.3) { dmg *= 2.2; bline('cine', '🐉 龙息坠饰轰然作响——这一发是龙的呼吸！'); }
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
      if (hasFx('epiphany') && Math.random() < 0.12) { dmg *= 3; epiphany = true; }
      main.hp -= dmg; total += dmg;
      if (main.hp <= 0) killed.push(main);
      let extraProj = st.proj - 1;
      if (extraProj > 0 && targets.length > 1) {
        for (let p = 0; p < extraProj; p++) {
          const t2 = targets[(p + 1) % targets.length];
          if (t2.hp > 0) { const d2 = Math.round(dmg * 0.6 * (1 + talentV('projDmg'))); t2.hp -= d2; total += d2; if (t2.hp <= 0) killed.push(t2); }
        }
      }
      if (hasFx('L2') || Math.random() < 0.5) main.burn = hasFx('burnStack') ? 3 : 2;
      if (epiphany) bline('crit', `✦ 顿悟！奇迹般的施放 ▸ ${dmg.toLocaleString()} ✦`);
      else dmgLine(main, dmg, crit, '烈焰弹撕开护盾');
      if (hasFx('groundBurn')) { for (const m of B.mobs) if (m.hp > 0) m.burn = 3; }
    } else {
      for (const m of B.mobs) {
        if (m.hp <= 0) continue;
        let crit = Math.random() * 100 < st.crit;
        let dmg = st.wdmg * 0.95;
        dmg *= 1 + st.ice / 100; dmg *= 1 + st.sIce / 100; dmg *= focusMult;
        if (m.frozen > 0) dmg *= 1.6 * (1 + talentV('shatterDmg') / 100);
        if (m.frozen > 0 && hasFx('shatterBoom')) dmg *= 1.6;
        if (m.vulnerable) dmg *= 1.3;
        if (crit) dmg *= 1 + st.critdmg / 100;
        if (lowRage > 1) dmg *= lowRage;
        dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
        if (hasFx('instantFreeze') && Math.random() < 0.2) m.frozen = 2;
        m.hp -= dmg; total += dmg;
        if (Math.random() * 100 < st.chill || hasFx('slowAlways')) m.frozen = Math.max(m.frozen, 2);
        if (m.hp <= 0) killed.push(m);
        dmgLine(m, dmg, crit, '寒冰箭洞穿躯壳');
      }
      if (hasFx('L11')) B.iceStack++;
    }
    if (epiphany) break;
  }
  // 双子星：烈焰弹附带寒冰箭
  if (skill === 'flame' && hasFx('twinStar')) {
    let ts = 0;
    for (const m of B.mobs) {
      if (m.hp <= 0) continue;
      const d2 = Math.round(st.wdmg * 0.6 * (1 + st.ice / 100) * (0.9 + Math.random() * 0.2));
      m.hp -= d2; ts += d2;
      if (Math.random() * 100 < st.chill) m.frozen = Math.max(m.frozen, 2);
      if (m.hp <= 0) killed.push(m);
    }
    if (ts) { total += ts; bline('line', `✨ 双子星闪耀——伴随一枚寒冰箭 ▸ ${ts.toLocaleString()}`); }
  }
  B.focus = Math.min(hasFx('L5') ? 8 : 5, B.focus + 1);
  if (killed.length) {
    if (hasFx('killHeal')) S.hp = Math.min(st.maxHp, S.hp + Math.round(st.maxHp * 0.04));
    if (hasFx('L8')) B.killAtk = (B.killAtk || 0) + 0.06;
    for (const m of killed) {
      if (m.frozen > 0 && hasFx('iceBoom')) {
        const boom = Math.round(m.maxHp * 0.5);
        for (const o of B.mobs) if (o !== m && o.hp > 0) o.hp -= boom;
        bline('cine', `💥 冰湖炸裂！${m.n}的残躯爆出冰晶风暴！`);
      }
      onKill(m);
    }
  }
  bline('sys2', '');
  if (B.mobs.every(m => m.hp <= 0)) { victory(); return; }
  enemyTurn();
}
function castShadow(skill) {
  const st = calc();
  B.turn++;
  const early = B.earlyBuff > 0;
  if (early) B.earlyBuff--;
  const focusMult = 1 + B.focus * 0.03;
  const lowRage = (S.hp < st.maxHp * 0.3 && hasFx('lowHpRage')) ? 1.8 : 1;
  let killed = [];

  const strikeOnce = (mult, isVenom) => {
    const targets = B.mobs.filter(m => m.hp > 0);
    const main = targets[0];
    if (!main) return 0;
    let crit = Math.random() * 100 < st.crit;
    let dmg = st.wdmg * mult * (1 + st.sShadow / 100) * focusMult;
    if (isVenom) dmg = st.wdmg * 0.8 * focusMult;
    if (main.vulnerable) dmg *= 1.3 + st.vul / 100;
    if (crit) { dmg *= 1 + st.critdmg / 100; S.hp = Math.min(st.maxHp, S.hp + Math.round(st.maxHp * 0.04)); }
    if (lowRage > 1) dmg *= lowRage;
    dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
    main.hp -= dmg;
    if (isVenom) main.poison = hasFx('poisonStack5') ? 5 : 3;
    dmgLine(main, dmg, crit, isVenom ? '毒刃没入甲缝，毒液顺着伤口渗入' : '影刃划出一道残光');
    if (main.hp <= 0) killed.push(main);
    return dmg;
  };

  if (skill === 'shadow') {
    const hits = 2 + rnd(3);
    let total = 0;
    bline('sys', `🗡️ 影袭——${hits} 段连击！`);
    for (let h = 0; h < hits; h++) total += strikeOnce(0.65, false);
    if (Math.random() < 0.2 + st.combo / 100) {
      total += strikeOnce(0.35, false);
      bline('sys', '↪ 连击本能触发——残影追击！');
    }
    if (hasFx('shadowDouble') && Math.random() < 0.15) {
      let t2 = 0;
      for (let h = 0; h < hits; h++) t2 += strikeOnce(0.65, false);
      total += t2;
      bline('cine', '👥 影分身同出——两道身影，一刀两段！');
    }
    if (early) bline('cine', '⚡ 先发制人！伤害提升。');
  } else {
    let total = strikeOnce(0.8, true);
    bline('sys', '🐍 淬毒生效——毒素开始侵蚀。');
    if (early) bline('cine', '⚡ 先发制人！伤害提升。');
  }
  if (killed.length) {
    for (const m of killed) {
      if (m.poison > 0 && hasFx('poisonStack5')) {
        const boom = Math.round(st.wdmg * 0.5 * m.poison);
        for (const o of B.mobs) if (o !== m && o.hp > 0) o.hp -= boom;
        bline('cine', `🐍 毒雾爆裂！波及同伴 ${boom} 点！`);
      }
      onKill(m);
    }
  }
  bline('sys2', '');
  if (B.mobs.every(m => m.hp <= 0)) { victory(); return; }
  enemyTurn();
}

function enemyTurn() {
  const st = calc();
  let taken = 0;
  if (B.shieldHp > 0) { B.shield -= 1; }
  for (const m of B.mobs) {
    if (m.hp <= 0) continue;
    if (m.frozen > 0) { m.frozen--; bline('line', `${m.n}被冻在原地，无法行动！`); continue; }
    if (Math.random() * 100 < st.dodge) { bline('line', `${m.n}挥空——你早已不在原地。`); continue; }
    if (B.shieldHp > 0) { B.shieldHp -= m.atk; bline('line', `${m.n}的攻击被护盾吸收（剩余 ${Math.max(0, B.shieldHp)}）。`); continue; }
    if (B.shield > 0) { B.shield--; bline('line', `👁 无眠之眼吸收了 ${m.n} 的攻击（剩余${B.shield}次）。`); continue; }
    let dmg = Math.round(m.atk * (0.85 + Math.random() * 0.3));
    const armorRed = st.armor / (st.armor + 300 + 14 * B.mlvl);
    dmg = Math.round(dmg * (1 - armorRed) * (1 + talentV('taken')));
    if (hasFx('regen')) { /* 潮汐 */ }
    S.hp -= dmg; taken += dmg;
    bline('line', `${m.n}反击 ▸ ${dmg}`);
  }
  const regen = gfR();
  if (regen) S.hp = Math.min(st.maxHp, S.hp + regen);
  // 灼烧tick
  for (const m of B.mobs) {
    if (m.hp > 0 && m.burn > 0) {
      const bd = Math.round(calc().wdmg * 0.35 * (1 + calc().burn / 100));
      m.hp -= bd; m.burn--;
      bline('cine', `🔥 灼烧啃噬着${m.n} ▸ ${bd}`);
      if (m.hp <= 0) onKill(m);
    }
  }
  for (const m of B.mobs) {
    if (m.hp > 0 && m.poison > 0) {
      const pd = Math.round(calc().wdmg * 0.3 * (1 + st.poison / 100)) * m.poison;
      m.hp -= pd; m.poison--;
      bline('cine', `🐍 毒液侵蚀着${m.n} ▸ ${pd}`);
      if (m.hp <= 0) onKill(m);
    }
  }
  bline('sys2', '');
  if (S.hp <= 0) { defeat(); return; }
  if (B.mobs.every(m => m.hp <= 0)) { victory(); return; }
  refreshCombat();
}
function gfR() { return hasFx('regen') ? Math.round(calc().maxHp * 0.08) : 0; }
function onKill(m) {
  S.kills++; S.stats.kills++;
  if (hasFx('killHeal')) S.hp = Math.min(calc().maxHp, S.hp + Math.round(calc().maxHp * hasFx('killHeal')));
  bline('cine', `☠ ${m.n}倒下了！`);
}
function victory() {
  B.over = true;
  const inAbyss = S.mapIdx >= STORY_MAPS.length;
  const mlvl = B.mlvl;
  const xpGain = Math.round(mlvl * 6 * (B.isBoss ? 3 : 1));
  S.xp += xpGain;
  const gold = Math.round(mlvl * 4 * (0.8 + Math.random() * 0.5));
  S.gold += gold;
  const cx = Math.round(mlvl * 1.5 * (0.5 + Math.random() * 0.8));
  S.cur.canxiang += cx;
  let drops = [];
  const nDrops = (B.isBoss ? 3 : 1 + rnd(2)) * (hasFx('lootQty') ? 1.5 : 1);
  for (let i = 0; i < Math.ceil(nDrops); i++) {
    drops.push(dropGear(mlvl, B.isBoss, inAbyss, B.diff || 1));
  }
  bline('cine', `🏆 战斗胜利！经验+${xpGain} · 金币+${gold} · 残响+${cx}`);
  for (const d of drops) {
    S.stats.drops++;
    S.bag.push(d);
    bline('div', `${['', '·', '··', '···'][Math.min(3, drops.indexOf(d))]} 掉落：${itemCard(d).replace(/\n/g, '')}`, '');
    boxPillar(d);
  }
  if (S.bag.length > 80) {
    const overflow = S.bag.splice(0, S.bag.length - 80);
    const cx2 = overflow.length * 3;
    S.cur.canxiang += cx2;
    bline('div', `🎒 背包已满，${overflow.length}件旧装备自动分解为残响×${cx2}。`, 'sys');
  }
  // Boss 首杀（重复挑战只给掉落，不给首杀奖励）
  if (B.isBoss) {
    const killId = B.inAbyss ? (ABYSS_MAPS[B.mapIdx - STORY_MAPS.length] + S.abyssDiff) : STORY_MAPS[B.mapIdx].id;
    if (!S.bossKills.includes(killId)) {
      S.bossKills.push(killId);
      grantTalentPoint();
      bline('cine', '🗝 首领首杀：获得1天赋点！');
      if (!B.inAbyss) {
        if (B.mapIdx < STORY_MAPS.length - 1) {
          if (B.mapIdx + 1 > S.mapIdx) {
            S.mapIdx = B.mapIdx + 1;
            log(`🗺 新地图解锁：【${STORY_MAPS[S.mapIdx].n}】（${STORY_MAPS[S.mapIdx].lv}级起，可随时回刷旧图）`, 'gold');
          }
        } else if (S.level >= 30) {
          S.mapIdx = STORY_MAPS.length;
          log('🌌 异界回廊的入口在你面前打开……', 'gold');
        } else {
          log('🗝 首领已伏诛！达到30级后，异界回廊将为你敞开。（旧图可继续回刷练级）', 'gold');
        }
      } else {
        S.cur.yuanjing += 2 + S.abyssTier;
        if (Math.random() < 0.3) S.cur.xinghe++;
        bline('cine', `🗝 异界首杀：渊晶+${2 + S.abyssTier} · 星核尘+1`);
      }
    } else {
      S.gold += Math.round(10 * (B.mlvl + 1) * 0.5);
      bline('div', `💰 重复讨伐奖励：金币+${Math.round(10 * (B.mlvl + 1) * 0.5)}`);
    }
  }
  $('#bactions').innerHTML = '';
  const b = document.createElement('button');
  b.className = 'choice-btn'; b.textContent = '➤ 收取战利品';
  b.addEventListener('click', () => { $('#battle').classList.add('hidden'); B = null; checkLevelUp(); refresh(); });
  $('#bactions').appendChild(b);
  save();
}
function boxPillar(d) {
  bline('div', `<div class="pillar" style="--pc:${RARITY[d.rarity].color}">${['▍', '▊', '█'][Math.min(2, ['common', 'magic', 'rare', 'epic', 'legendary', 'unique', 'mythic', 'set'].indexOf(d.rarity) > 3 ? 2 : 1)]} ${d.name} ${rarityTag(d.rarity)}</div>`);
  lootSound(d.rarity);
  if (['legendary', 'unique', 'mythic'].includes(d.rarity)) {
    let f = document.getElementById('flash');
    if (!f) { f = document.createElement('div'); f.id = 'flash'; document.body.appendChild(f); }
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }
}
function grantTalentPoint() { S.talents.used = S.talents.used; S.talentPts = (S.talentPts || 0) + 1; log('🌟 获得天赋点+1！', 'gold'); }
function checkLevelUp() {
  while (S.xp >= xpNeed(S.level) && S.level < 30) {
    S.xp -= xpNeed(S.level); S.level++;
    S.talentPts = (S.talentPts || 0) + 1;
    log(`⬆️ 等级提升到 ${S.level}！天赋点+1。`, 'gold');
    toast(`⬆️ Lv.${S.level}！天赋点+1`);
  }
  if (S.level >= 30 && !S.abyssUnlocked) {
    S.abyssUnlocked = true;
    log('🌌 你达到了30级——【异界回廊】的入口轰然打开！', 'gold');
    toast('🌌 异界回廊已开放！');
  }
}
function defeat() {
  B.over = true;
  const lost = Math.round(S.gold * 0.1);
  S.gold -= lost;
  bline('cine', `💀 你倒下了……被同伴拖回营地。医疗费 ${lost} 金币。`);
  const acts = $('#bactions'); acts.innerHTML = '';
  const retry = document.createElement('button');
  retry.className = 'choice-btn'; retry.textContent = '➤ 疗伤再战（敌人血量保留50%，气血回满）';
  retry.addEventListener('click', () => {
    for (const m of B.mobs) m.hp = Math.ceil(m.maxHp * 0.5);
    S.hp = calc().maxHp; B.over = false;
    $('#blog').innerHTML += '<div class="b-sys">↺ 你重新站了起来！</div>';
    refreshCombat(); save();
  });
  acts.appendChild(retry);
  const flee = document.createElement('button');
  flee.className = 'choice-btn flee'; flee.textContent = '🏃 撤退回营（放弃本场，稍后再来）';
  flee.addEventListener('click', () => { $('#battle').classList.add('hidden'); B = null; toast('已撤回营地，随时可重新挑战。'); refresh(); });
  acts.appendChild(flee);
  save();
}
function refreshCombat() {
  $('#bmobs').innerHTML = B.mobs.map(m => m.hp <= 0 ? '' :
    `<div class="mob ${m.frozen > 0 ? 'frozen' : ''}"><div class="mn">${m.n}${m.vulnerable ? ' 🩸易伤' : ''}${m.frozen > 0 ? ' ❄️冻结' : ''}${m.burn > 0 ? ' 🔥灼烧' : ''}</div>
     <div class="bar"><div style="width:${m.hp / m.maxHp * 100}%;background:var(--bad)"></div></div>
     <div class="mhp">${m.hp}/${m.maxHp}</div></div>`).join('');
  const st = calc();
  $('#bplayer').innerHTML = `
    ${barRow('❤️ 气血', S.hp, S.hp > 50 ? 'var(--good)' : 'var(--bad)', `${Math.round(S.hp)}/${st.maxHp}`)}
    <div class="muted">${S.class === 'shadowblade'
      ? `影遁闪避 ${st.dodge}% · 影袭三段合计 ${Math.round(st.wdmg * 0.65 * (1 + st.sShadow / 100)) * 3} · 毒伤 ${st.poison}%`
      : `专注 ${B.focus}/8 · 烈焰弹 ${Math.round(st.wdmg * 1.6 * (1 + st.fire / 100) * (1 + st.sFlame / 100))} · 寒冰箭(全体) ${Math.round(st.wdmg * 0.95 * (1 + st.ice / 100) * (1 + st.sIce / 100))}`}</div>`;
  const acts = $('#bactions'); acts.innerHTML = '';
  const mk = (label, fn) => {
    const b = document.createElement('button');
    b.className = 'choice-btn skill'; b.innerHTML = label;
    b.addEventListener('click', fn); acts.appendChild(b);
  };
  if (S.class === 'shadowblade') {
    mk(`🗡️ 影袭（连击2~4段·单体）<span class="sub">每段 ${Math.round(st.wdmg * 0.65 * (1 + st.sShadow / 100))} · 连击${st.combo}%</span>`, () => playerCast('shadow'));
    mk(`🐍 毒刃（0.8×+淬毒3层）<span class="sub">毒伤 ${st.poison}%</span>`, () => playerCast('venom'));
  } else {
    mk(`🔥 烈焰弹（单体·1.6×）${st.proj > 1 ? `<span class="sub">投射物×${st.proj}</span>` : ''}`, () => playerCast('flame'));
    mk(`❄️ 寒冰箭（全体·0.95×）${st.chill ? `<span class="sub">冰冻${Math.round(st.chill)}%</span>` : ''}`, () => playerCast('ice'));
  }
  mk(`🧪 血药（回复40%气血）<span class="sub">持有${S.pot.hp || 0} · 本场已用${B.potHp || 0}/3</span>`, useHpPotion, (S.pot.hp || 0) < 1 || (B.potHp || 0) >= 3);
  mk(`🔵 专注瓶（专注+2）<span class="sub">持有${S.pot.focus || 0} · 本场限1</span>`, useFocusPotion, (S.pot.focus || 0) < 1 || B.potFocus);
  const flee = document.createElement('button');
  flee.className = 'choice-btn flee'; flee.textContent = '🏃 撤退（放弃本次战斗）';
  flee.addEventListener('click', () => { $('#battle').classList.add('hidden'); B = null; refresh(); });
  acts.appendChild(flee);
}

// ---------- 地图面板（全部已解锁地图可自由回刷） ----------
function renderMaps() {
  const inAbyss = S.mapIdx >= STORY_MAPS.length;
  let html = '';
  if (S.level >= 30) {
    html += `<div class="card-like" style="border-color:var(--accent)"><b>🌌 异界回廊已开放</b> — 满级后的无尽深刷。套装/暗金/神话只在异界掉落。怪物血量随层数指数增长，掉落逐层加厚。</div>
      <h2 class="sec">回廊层数与难度</h2>
      <div class="muted">当前层数：第 <b>${S.abyssTier}</b> 层 · ${ABYSS_MAPS[S.abyssTier - 1]}</div>`;
    html += `<div class="stat-grid">${Object.entries(DIFFS).map(([k, d]) =>
      `<button class="cost-chip ${S.abyssDiff === k ? 'ok' : ''}" data-diff="${k}" style="cursor:pointer;padding:6px 14px">${d.n}(×${d.mult})</button>`).join('')}</div>`;
    html += `<div class="stat-grid" style="margin:10px 0">${[-1, 0, 1].map(d => {
      const t = S.abyssTier + d;
      if (t < 1 || t > 15) return '';
      return `<button class="cost-chip ${d === 0 ? 'ok' : ''}" data-tier="${t}" style="cursor:pointer;padding:6px 14px">${d < 0 ? '⬅ ' : ''}${ABYSS_MAPS[t - 1]} (T${t})${d > 0 ? ' ➡' : ''}</button>`;
    }).join('')}</div>`;
    html += `<button class="btn btn-primary" id="abys-go">🌌 深入【${ABYSS_MAPS[S.abyssTier - 1]}】（2波怪+首领 · ${DIFFS[S.abyssDiff].n}）</button>`;
  }
  html += '<h2 class="sec">主线地图（全部可自由回刷 · 打怪练级两相宜）</h2>';
  STORY_MAPS.forEach((m, i) => {
    const unlocked = i <= S.mapIdx;
    const cleared = S.bossKills.includes(m.id);
    html += `<div class="build-item ${unlocked ? (cleared ? 'done' : '') : 'locked'}">
      <div class="build-icon">${unlocked ? '🗺️' : '🔒'}</div>
      <div class="build-info">
        <div class="build-name">${m.n}<span class="build-lv">建议 ${m.lv}级起 · ${cleared ? '✅首领已伏诛（可重复挑战）' : unlocked ? '待讨伐' : ''}</span></div>
        <div class="muted">怪物：${m.mobs.join('、')} · 首领：${m.boss.n}</div>
      </div>
      ${unlocked ? `<div style="display:flex;flex-direction:column;gap:6px">
        <button class="build-btn" data-hunt="${i}">清剿小怪</button>
        <button class="build-btn" data-boss="${i}" style="border-color:var(--bad);color:var(--bad)">💀 挑战首领</button>
      </div>` : ''}
    </div>`;
  });
  if (S.mapIdx >= STORY_MAPS.length) html += '<p class="muted">主线已全部通关——异界回廊才是你的家。</p>';
  $('#panel-maps').innerHTML = html;

  document.querySelectorAll('[data-hunt]').forEach(b => b.addEventListener('click', () => {
    S.stats.events = (S.stats.events || 0) + 1;
    if (ABYSS_EVENTS && Math.random() < 0.25) {
      const ev = ABYSS_EVENTS[rnd(ABYSS_EVENTS.length)];
      S.seenEvents.unshift(ev.id);
      showEvent(ev); save(); refresh(); return;
    }
    enterCombat('pack', +b.dataset.hunt); save();
  }));
  document.querySelectorAll('[data-boss]').forEach(b => b.addEventListener('click', () => enterCombat('boss', +b.dataset.boss)));
  document.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', () => { S.abyssDiff = b.dataset.diff; refresh(); }));
  document.querySelectorAll('[data-tier]').forEach(b => b.addEventListener('click', () => { S.abyssTier = +b.dataset.tier; refresh(); }));
  const ag = $('#abys-go');
  if (ag) ag.addEventListener('click', () => enterCombat('pack', STORY_MAPS.length + S.abyssTier - 1));
}

// ---------- 主城：商人/赌博/打造 ----------
function ensureStock() {
  const lv = Math.max(1, Math.min(30, S.level + (S.mapIdx >= STORY_MAPS.length ? S.abyssTier : 0)));
  if (S.stockSeed !== S.level + '-' + S.mapIdx) {
    S.stockSeed = S.level + '-' + S.mapIdx;
    S.stock = [];
    for (let i = 0; i < 6; i++) {
      const slotPool = Object.keys(SLOTS);
      const it = makeItem(slotPool[rnd(slotPool.length)], ['magic', 'rare', 'rare', 'epic'][rnd(4)], lv);
      it.price = Math.round((20 + it.ilvl * 8) * (1 + it.affixes.length * 0.5));
      S.stock.push(it);
    }
    // 极小概率神装
    if (Math.random() < 0.05) {
      const it = makeItem(Object.keys(SLOTS)[rnd(Object.keys(SLOTS).length)], 'legendary', lv);
      it.price = Math.round(300 + it.ilvl * 40); S.stock[rnd(S.stock.length)] = it;
    }
  }
}
function renderHub() {
  ensureStock();
  let html = '<h2 class="sec">🏪 装备商人 · 余烬镇</h2><p class="muted">库存随进度刷新。据说偶尔会从暗处进到……不得了的东西。</p>';
  S.stock.forEach((it, i) => {
    if (!it) return;
    html += `<div style="position:relative">${itemCard(it, true)}
      <button class="build-btn" data-buy="${i}" style="position:absolute;right:12px;top:12px" ${S.gold >= it.price ? '' : 'disabled'}>购买 ${it.price}金</button></div>`;
  });
  html += `<button class="btn" id="restock">🔁 恳求商人进新货（清剿一波怪后自动到货）</button>`;
  html += `<h2 class="sec">🎲 赌博商人 · 老瞎子</h2>
    <p class="muted">「渊晶给老朽，老朽给你命运。」花费渊晶换取随机部位装备，品质随机——小概率直接传奇。</p>
    <div class="stat-grid"><span class="stat-cell">💠 渊晶 <b>${S.cur.yuanjing}</b></span></div>
    <button class="btn" id="gamble" ${S.cur.yuanjing < 5 ? 'disabled' : ''}>🎲 赌一件（渊晶×5）<span class="sub">随机部位 · 品质大随机（约5%传奇）</span></button>`;
  html += `<h2 class="sec">🧪 药剂铺</h2><p class="muted">战斗中使用：血药回复40%气血（每场限3瓶），专注瓶+2专注（每场限1瓶）。</p>
    <div class="stat-grid"><span class="stat-cell">🧪 血药 <b>${S.pot.hp || 0}</b></span><span class="stat-cell">🔵 专注瓶 <b>${S.pot.focus || 0}</b></span></div>
    <button class="btn" id="buy-hp" ${S.gold < 40 ? 'disabled' : ''}>🧪 血药（金币40）</button>
    <button class="btn" id="buy-fc" ${S.gold < 60 ? 'disabled' : ''}>🔵 专注瓶（金币60）</button>`;
  html += `<h2 class="sec">⚗️ 材料商人</h2><div class="stat-grid">
    <span class="stat-cell">🎐 残响 <b>${S.cur.canxiang}</b></span>
    ${Object.entries(CURRENCIES).map(([id, c]) => `<span class="stat-cell">${c.icon} ${c.n} <b>${S.mats[id] || 0}</b></span>`).join('')}</div>
    <button class="btn" id="buy-stone" ${S.cur.canxiang < 20 ? 'disabled' : ''}>🍶 残响×20 → 开灵石×2</button>
    <button class="btn" id="buy-chaos" ${S.cur.canxiang < 60 || S.gold < 100 ? 'disabled' : ''}>🌀 残响×60+金币100 → 混沌石×1</button>`;
  $('#panel-hub').innerHTML = html;
  document.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
    const it = S.stock[+b.dataset.buy];
    if (!it || S.gold < it.price) return;
    S.gold -= it.price; S.stock[+b.dataset.buy] = null; S.bag.push(it);
    log(`🛒 购入 ${it.name}。`); save(); refresh();
  }));
  $('#restock').addEventListener('click', () => { S.stockSeed = ''; ensureStock(); refresh(); });
  $('#gamble').addEventListener('click', () => {
    if (S.cur.yuanjing < 5) return;
    S.cur.yuanjing -= 5;
    const lv = Math.max(1, Math.min(30, S.level + 2));
    const slot = Object.keys(SLOTS)[rnd(Object.keys(SLOTS).length)];
    const roll = Math.random();
    const rarity = roll < 0.05 ? 'legendary' : roll < 0.2 ? 'epic' : roll < 0.55 ? 'rare' : 'magic';
    const it = makeItem(slot, rarity, lv);
    S.bag.push(it);
    log(`🎲 老瞎子递来一件${RARITY[rarity].n}装：${it.name}`, rarity === 'legendary' ? 'gold' : '');
    toast(`🎲 ${it.name}`);
    save(); refresh();
  });
  $('#buy-stone').addEventListener('click', () => {
    if (S.cur.canxiang < 20) return;
    S.cur.canxiang -= 20; S.mats.transmute += 2;
    log('🍶 换得开灵石×2。'); save(); refresh();
  });
  $('#buy-chaos').addEventListener('click', () => {
    if (S.cur.canxiang < 60 || S.gold < 100) return;
    S.cur.canxiang -= 60; S.gold -= 100; S.mats.chaos += 1;
    log('🌀 换得混沌石×1。'); save(); refresh();
  });
  const bh = $('#buy-hp'); if (bh) bh.addEventListener('click', () => {
    if (S.gold < 40) return;
    S.gold -= 40; S.pot.hp = (S.pot.hp || 0) + 1;
    log('🧪 购得血药×1。'); save(); refresh();
  });
  const bf = $('#buy-fc'); if (bf) bf.addEventListener('click', () => {
    if (S.gold < 60) return;
    S.gold -= 60; S.pot.focus = (S.pot.focus || 0) + 1;
    log('🔵 购得专注瓶×1。'); save(); refresh();
  });
}

// ---------- 打造 ----------
let craftSel = null;
function renderCraft() {
  let html = '<h2 class="sec">选择装备</h2>';
  const items = S.bag.filter(it => it.rarity !== 'mythic' || true);
  if (craftSel) {
    const it = S.bag.find(x => x.uid === craftSel);
    if (it) {
      html += `<div class="stat-grid" style="margin-bottom:10px">${itemCard(it)}</div>`;
      const defs = [
        ['transmute', it.rarity === 'common'],
        ['augment', it.rarity === 'magic'],
        ['exalted', it.rarity === 'rare' && it.affixes.length < 6],
        ['chaos', ['rare', 'epic'].includes(it.rarity)],
        ['lock', ['rare', 'epic'].includes(it.rarity) && it.affixes.length > 1],
        ['sublimate', it.rarity === 'epic' && S.level >= 30],
      ];
      html += '<h2 class="sec">打造操作</h2>';
      for (const [id, ok] of defs) {
        const c = CURRENCIES[id];
        html += `<button class="btn" data-craft="${id}" ${ok && (S.mats[id] || 0) > 0 ? '' : 'disabled'}>
          ${c.icon} ${c.n}（持有${S.mats[id] || 0}）<span class="sub">${c.d}</span></button>`;
      }
      html += '<p class="muted">⚠️ 护栏：每条词缀有上限值；改规则类特效只能来自传奇/神话，不可手搓。</p>';
    }
  } else {
    html += '<p class="muted">从背包中选择一件装备开始手搓。白装是底材，蓝紫金都能加工——这就是流放的乐趣。</p>';
  }
  html += '<h2 class="sec">背包</h2>' + S.bag.map(it =>
    `<button class="btn ${craftSel === it.uid ? 'sel' : ''}" data-sel="${it.uid}" style="text-align:left">${itemCard(it).replace(/\n/g, '')}</button>`).join('');
  $('#panel-craft').innerHTML = html;
  document.querySelectorAll('[data-sel]').forEach(b => b.addEventListener('click', () => { craftSel = b.dataset.sel; renderCraft(); }));
  document.querySelectorAll('[data-craft]').forEach(b => b.addEventListener('click', () => doCraft(b.dataset.craft)));
}
function doCraft(id) {
  const it = S.bag.find(x => x.uid === craftSel);
  if (!it || !(S.mats[id] > 0)) return;
  S.mats[id]--;
  if (id === 'transmute' && it.rarity === 'common') {
    it.rarity = 'magic'; it.affixes.push(rollAffix(it.ilvl, []));
    it.name = itemName(it.slot, 'magic', it.affixes);
    log(`🔹 蜕变！${it.name} 觉醒了魔力。`);
  } else if (id === 'augment' && it.rarity === 'magic') {
    it.rarity = 'rare'; it.affixes.push(rollAffix(it.ilvl, it.affixes.map(a => a.id)));
    it.affixes.push(rollAffix(it.ilvl, it.affixes.map(a => a.id)));
    it.name = itemName(it.slot, 'rare', it.affixes);
    log(`🔷 增幅！${it.name} 变得更加稀有。`);
  } else if (id === 'exalted' && it.rarity === 'rare' && it.affixes.length < 6) {
    it.affixes.push(rollAffix(it.ilvl, it.affixes.map(a => a.id)));
    log(`🟣 崇高之力灌入！词缀+1。`);
  } else if (id === 'chaos' && ['rare', 'epic'].includes(it.rarity)) {
    it.affixes = [];
    const n = it.rarity === 'epic' ? 4 + rnd(3) : 3 + rnd(2);
    for (let i = 0; i < n; i++) it.affixes.push(rollAffix(it.ilvl, it.affixes.map(a => a.id)));
    it.name = itemName(it.slot, it.rarity, it.affixes);
    log(`🌀 混沌石轰鸣——词缀全部重随！听天由命。`);
  } else if (id === 'lock' && ['rare', 'epic'].includes(it.rarity) && it.affixes.length > 1) {
    const keep = it.affixes[rnd(it.affixes.length)];
    const n = it.affixes.length;
    it.affixes = [keep];
    for (let i = 1; i < n; i++) it.affixes.push(rollAffix(it.ilvl, it.affixes.map(a => a.id)));
    log(`🔒 词缀「${AFFIXES[keep.id].n}」已锁定，其余重随。`);
  } else if (id === 'sublimate' && it.rarity === 'epic' && S.level >= 30) {
    const e = LEGENDARY_EFFECTS[rnd(LEGENDARY_EFFECTS.length)];
    it.rarity = 'legendary'; it.fx = { [e.id]: true }; it.fxText = e.n;
    it.name = itemName(it.slot, 'legendary', it.affixes, e.titles[rnd(e.titles.length)]);
    log(`⬆️ 升华！${it.name} 成为传奇！✦ ${e.n}`, 'gold');
  }
  save(); renderCraft();
}

// ---------- 天赋 ----------
function renderTalents() {
  const pts = S.talentPts || 0;
  let html = `<p class="muted">天赋点：<b>${pts}</b>（升级/首领首杀获得）· 已用 ${S.talents.nodes.length} 节点<br>普通节点1点；<b>关键天赋改写规则，不可逆</b>——想好再点。</p>`;
  for (const [bid, br] of Object.entries(TALENTS)) {
    html += `<h2 class="sec">${br.icon} ${br.n}</h2>`;
    const doneCount = br.nodes.filter(n => S.talents.nodes.includes(n.id)).length;
    br.nodes.forEach((n, i) => {
      const has = S.talents.nodes.includes(n.id);
      const can = !has && pts > 0 && (n.need || 0) <= doneCount && (i === 0 || S.talents.nodes.includes(br.nodes[i - 1].id));
      html += `<button class="btn ${has ? 'sel' : ''}" data-t="${n.id}" ${can ? '' : 'disabled'} style="text-align:left">
        ${has ? '✅' : '⬜'} ${n.n} <span class="sub">${n.d}${n.need ? ` · 需先点亮${n.need}个本系节点` : ''}</span></button>`;
    });
    html += `<div class="muted" style="margin:6px 0">— 关键天赋 —</div>`;
    br.keys.forEach(k => {
      const has = S.talents.nodes.includes(k.id);
      const can = !has && pts > 0 && doneCount >= 4;
      html += `<button class="btn ${has ? 'sel' : ''}" data-t="${k.id}" ${can ? '' : 'disabled'} style="text-align:left;border-color:${has ? 'var(--accent)' : 'var(--bad)'}">
        ${has ? '🔷' : '🔶'} <b>${k.n}</b> <span class="sub">${k.d}${has ? '' : ' · 需本系4节点，不可逆'}</span></button>`;
    });
  }
  $('#panel-talents').innerHTML = html;
  document.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.t;
    if (S.talentPts > 0 && !S.talents.nodes.includes(id)) {
      S.talents.nodes.push(id); S.talentPts--;
      const all = [...TALENTS.flame.nodes, ...TALENTS.flame.keys, ...TALENTS.ice.nodes, ...TALENTS.ice.keys, ...TALENTS.gen.nodes, ...TALENTS.gen.keys];
      const n = all.find(x => x.id === id);
      log(`🌳 天赋点亮【${n.n}】：${n.d}`, 'gold');
      save(); renderTalents();
    }
  }));
}

// ---------- 角色面板 ----------
// ---------- 装备查看 / 对比 / 分解 / 出售 ----------
const SALVAGE_VAL = { common: 2, magic: 5, rare: 12, epic: 25, legendary: 50, unique: 80, mythic: 150, set: 25 };
const SELL_VAL = { common: 5, magic: 12, rare: 30, epic: 60, legendary: 120, unique: 200, mythic: 400, set: 60 };

function compareTable(it) {
  const eq = S.equip[it.slot];
  if (!eq || eq.uid === it.uid) return '<div class="muted">该部位暂无装备对比。</div>';
  const ids = new Set([...(it.affixes || []).map(a => a.id), ...(eq.affixes || []).map(a => a.id)]);
  let rows = '';
  for (const id of ids) {
    const nv = (it.affixes || []).filter(a => a.id === id).reduce((s, a) => s + a.val, 0);
    const ov = (eq.affixes || []).filter(a => a.id === id).reduce((s, a) => s + a.val, 0);
    const def = AFFIXES[id];
    const d = Math.round((nv - ov) * 10) / 10;
    rows += `<div class="cmp-row ${d >= 0 ? 'up' : 'down'}">${def.n}：${nv}${def.unit || ''} <span class="muted">vs</span> ${ov}${def.unit || ''}（${d >= 0 ? '+' : ''}${d}）</div>`;
  }
  return rows;
}
function openItemModal(src, ref) {
  const it = src === 'bag' ? S.bag.find(x => x.uid === ref) : S.equip[ref];
  if (!it) return;
  $('#ev-title').textContent = '装备详情';
  const cmp = src === 'bag' ? `<div class="card-like"><b>数值对比（身上同部位）</b>${compareTable(it)}</div>` : '';
  $('#ev-text').innerHTML = itemCard(it).replace(/\n/g, '') + cmp;
  const box = $('#ev-choices'); box.innerHTML = '';
  const mk = (t, fn, dis) => {
    const b = document.createElement('button');
    b.className = 'choice-btn'; b.textContent = t; b.disabled = !!dis;
    if (!dis) b.addEventListener('click', fn);
    box.appendChild(b);
  };
  if (src === 'bag') {
    mk('⚔️ 装备', () => {
      const idx = S.bag.findIndex(x => x.uid === ref);
      const old = S.equip[it.slot];
      S.equip[it.slot] = it; S.bag.splice(idx, 1);
      if (old) S.bag.push(old);
      S.hp = Math.min(S.hp, calc().maxHp);
      log(`🧤 装备了 ${it.name}。`);
      $('#modal').classList.add('hidden'); save(); refresh();
    });
    mk(`🗑️ 分解 → 残响×${SALVAGE_VAL[it.rarity]}`, () => {
      S.cur.canxiang += SALVAGE_VAL[it.rarity];
      S.bag = S.bag.filter(x => x.uid !== ref);
      craftSel = craftSel === ref ? null : craftSel;
      log(`🗑️ 分解了 ${it.name}（残响+${SALVAGE_VAL[it.rarity]}）。`);
      $('#modal').classList.add('hidden'); save(); refresh();
    });
    mk(`💰 出售 → 金币×${SELL_VAL[it.rarity]}`, () => {
      S.gold += SELL_VAL[it.rarity];
      S.bag = S.bag.filter(x => x.uid !== ref);
      craftSel = craftSel === ref ? null : craftSel;
      log(`💰 出售了 ${it.name}（金币+${SELL_VAL[it.rarity]}）。`);
      $('#modal').classList.add('hidden'); save(); refresh();
    });
  } else {
    mk('卸下到背包', () => {
      if (S.bag.length >= 80) { toast('背包已满（80）。'); return; }
      S.bag.push(it); delete S.equip[ref];
      log(`📦 卸下了 ${it.name}。`);
      $('#modal').classList.add('hidden'); save(); refresh();
    });
  }
  mk('关闭', () => $('#modal').classList.add('hidden'));
  $('#modal').classList.remove('hidden');
}

// ---------- 药剂 ----------
function useHpPotion() {
  if (!B || B.over || (B.potHp || 0) >= 3 || (S.pot.hp || 0) < 1) return;
  S.pot.hp--; B.potHp = (B.potHp || 0) + 1;
  const heal = Math.round(calc().maxHp * 0.4);
  S.hp = Math.min(calc().maxHp, S.hp + heal);
  bline('cine', `🧪 血药下肚，温热的气流涌遍全身（+${heal}）。`);
  save(); enemyTurn();
}
function useFocusPotion() {
  if (!B || B.over || B.potFocus || (S.pot.focus || 0) < 1) return;
  S.pot.focus--; B.potFocus = true;
  B.focus = Math.min(8, B.focus + 2);
  bline('cine', '🔵 专注瓶碎裂——思绪如镜面般澄澈（专注+2）。');
  save(); enemyTurn();
}

function renderChar() {
  const st = calc();
  $('#side-equip').innerHTML = Object.entries(SLOTS).map(([slot, s]) => {
    const it = S.equip[slot];
    if (!it) return `<div class="eq empty" data-eqview="${slot}"><span>${s.icon}</span><span>${s.n}</span></div>`;
    return `<div class="eq" data-eqview="${slot}" title="点击查看详情"><span style="color:${RARITY[it.rarity].color}">${it.name}</span></div>`;
  }).join('');
  $('#side-stats').innerHTML = `
    ${barRow('❤️ 气血', S.hp, S.hp > st.maxHp * 0.5 ? 'var(--good)' : 'var(--bad)', `${Math.round(S.hp)}/${st.maxHp}`)}
    <div class="stat-grid">
      <span class="stat-cell">⚔️ 武器伤害 <b>${st.wdmg}</b></span>
      <span class="stat-cell">🔥 火伤 <b>${st.fire}%</b></span>
      <span class="stat-cell">❄️ 冰伤 <b>${st.ice}%</b></span>
      <span class="stat-cell">🎯 暴击 <b>${Math.round(st.crit)}%</b></span>
      <span class="stat-cell">💥 暴伤 <b>${Math.round(st.critdmg)}%</b></span>
      <span class="stat-cell">🩸 易伤增伤 <b>${st.vul}%</b></span>
      <span class="stat-cell">🪖 护甲 <b>${st.armor}</b></span>
      <span class="stat-cell">🔥 点燃 <b>${st.burn}%</b></span>
    </div>
    <div class="stat-grid">
      <span class="stat-cell">🧪 血药 <b>${S.pot.hp || 0}</b></span>
      <span class="stat-cell">🔵 专注瓶 <b>${S.pot.focus || 0}</b></span>
    </div>
    <h2 class="sec">套装</h2>
    ${Object.entries(SETS).map(([sid, set]) => {
      const n = setCount(sid);
      const active = [2, 4, 6].map(need => n >= need
        ? '<span class="good">✅' + need + '件:' + set.d[need] + '</span>'
        : '<span class="muted">⬜' + need + '件:' + set.d[need] + '</span>').join('<br>');
      return '<div class="card-like"><b>' + set.icon + ' ' + set.n + '</b> <span class="gold">' + n + '/6</span><br>' + active + '</div>';
    }).join('')}
    <p class="muted" style="margin-top:6px">等级 <b>${S.level}</b> · 经验 ${S.xp}/${xpNeed(S.level)} · 天赋点 <b>${S.talentPts || 0}</b></p>`;
  $('#side-bag').innerHTML = S.bag.slice(0, 30).map(it =>
    `<button class="btn" data-eqview="bag:${it.uid}" style="text-align:left">${itemCard(it, true).replace(/\n/g, '')}<span class="sub">点击：详情 / 装备 / 分解 / 出售</span></button>`).join('') || '<p class="muted">背包空空如也。</p>';
  document.querySelectorAll('[data-eqview]').forEach(b => b.addEventListener('click', () => {
    const ref = b.dataset.eqview;
    if (ref.startsWith('bag:')) openItemModal('bag', ref.slice(4));
    else openItemModal('equip', ref);
  }));
}

// ---------- 地图进度推进 ----------

// ---------- 主渲染 ----------
function refresh() {
  renderTop(); renderMaps(); renderHub(); renderCraft(); renderTalents(); renderChar(); renderLog();
}
function renderTop() {
  $('#tb-res').innerHTML = `
    <span class="res-chip">${CLASSES[S.class] ? CLASSES[S.class].icon : '🔥'} <b>${S.level}</b></span>
    <span class="res-chip">💰 <b>${S.gold}</b></span>
    <span class="res-chip">💠 渊晶 <b>${S.cur.yuanjing}</b></span>
    <span class="res-chip">🎐 残响 <b>${S.cur.canxiang}</b></span>
    <span class="res-chip">✨ 星核 <b>${S.cur.xinghe}</b></span>
    <span class="res-chip">天赋点 <b>${S.talentPts || 0}</b></span>`;
}
function renderLog() {
  $('#panel-log').innerHTML = '<div id="log-list">' + S.log.map(l => `<div class="${l.cls}">${l.msg}</div>`).join('') + '</div>';
}

// ---------- 标题 ----------
function showTitle() {
  const s = loadSave();
  $('#overlay').classList.remove('hidden');
  $('#overlay-content').innerHTML = `
    <h1>暗渊回廊</h1>
    <p class="center muted">大灾变之夜，裂缝撕开了天空。<br>
    你是元素使——一个能用烈焰与寒冰改写战场的施法者。<br>
    杀死怪物，捡起装备，拼出你的Build，然后走向更深的黑暗。<br>
    <b class="gold">满级不是结束——异界回廊，才是开始。</b></p>
    ${s ? `<button class="btn btn-primary" id="t-continue">▶ 继续冒险（Lv.${s.level}）</button>` : ''}
    <button class="btn btn-primary" id="t-new" style="text-align:center">🔥 觉醒元素之力（新开始）</button>`;
  $('#t-new').addEventListener('click', showClassSelect);
  if (s) $('#t-continue').addEventListener('click', () => {
    S = s; $('#overlay').classList.add('hidden'); refresh();
  });
}

function showClassSelect() {
  $('#overlay-content').innerHTML = `
    <h1>职业选择</h1>
    <p class="center muted">大灾变之夜，觉醒的力量有两种形态。<br>选择你的战斗之道——这将决定你的技能、Build与命运。</p>
    ${Object.entries(CLASSES).map(([id, c]) => `
      <button class="diff-btn" data-c="${id}">${c.icon} <b>${c.n}</b>
        <small>${c.d}${c.d2 ? '<br>➤ ' + c.d2 : ''}</small></button>`).join('')}`;
  document.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => startGame(b.dataset.c)));
}
function startGame(classId) {
  S = newState();
  S.class = classId;
  const c = CLASSES[classId];
  log(`🔥 你在灰烬荒原的边缘醒来，${c.n}的力量在血管里燃烧。杀出去。`);
  log('💡 出征面板：清剿小队→首领→下一张图。掉落的装备在「角色」面板装备。', 'dim');
  $('#overlay').classList.add('hidden'); refresh();
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  $('#panel-' + t.dataset.tab).classList.add('active');
  refresh();
}));

showTitle();
