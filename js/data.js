/* ============================================================
 * 《暗渊回廊》数据配置 —— 文字版暗黑/流放
 * 品质：白→蓝→紫→金→橙传奇→暗金→紫金神话→绿套装
 * ============================================================ */

// ---------- 装备槽位（12：用户11槽 + 法器主手） ----------
const SLOTS = {
  helm:   { n: '法冠', icon: '👑' },
  pauld:  { n: '肩甲', icon: '🧣' },
  chest:  { n: '战铠', icon: '🛡️' },
  gloves: { n: '手套', icon: '🧤' },
  bracer: { n: '护腕', icon: '💫' },
  belt:   { n: '腰带', icon: '🪢' },
  legs:   { n: '腿甲', icon: '🦵' },
  boots:  { n: '靴子', icon: '👢' },
  ring1:  { n: '戒指·一', icon: '💍', jewelry: true },
  ring2:  { n: '戒指·二', icon: '💍', jewelry: true },
  amulet: { n: '护符', icon: '🔮', jewelry: true },
  weapon: { n: '法器', icon: '🔮', mainhand: true },
};
const ARMOR_SLOTS = ['helm', 'pauld', 'chest', 'gloves', 'bracer', 'belt', 'legs', 'boots'];

// 各槽位基底名（用于生成装备名）
const BASES = {
  helm: ['法冠', '秘冠', '星冕'], pauld: ['肩甲', '护肩', '披肩'],
  chest: ['战铠', '法袍', '胸铠'], gloves: ['手套', '灵手', '织手'],
  bracer: ['护腕', '符腕', '缠腕'], belt: ['腰带', '束带', '系带'],
  legs: ['腿甲', '法裤', '护胫'], boots: ['靴子', '疾靴', '踏靴'],
  ring1: ['戒指', '指环', '印戒'], ring2: ['戒指', '指环', '印戒'],
  amulet: ['护符', '坠饰', '灵符'], weapon: ['法珠', '魔杖', '咒典'],
};

// ---------- 品质 ----------
const RARITY = {
  common:   { n: '普通', color: '#b8b8b8', affixes: 0 },
  magic:    { n: '魔法', color: '#6fa8ff', affixes: [1, 2] },
  rare:     { n: '稀有', color: '#c58aff', affixes: [3, 4] },
  epic:     { n: '传说品质', color: '#ffd24a', affixes: [4, 6] },
  legendary:{ n: '传奇', color: '#ff9a3d', affixes: [4, 5] },
  unique:   { n: '暗金', color: '#d4b06a', affixes: 0 },
  mythic:   { n: '神话', color: '#e87aff', affixes: 0 },
  set:      { n: '套装', color: '#7fe08a', affixes: 0 },
};

// ---------- 词缀池 ----------
// v:[基础最小,基础最大] perLvl:每装等成长 unit:'%'或''；rare:词缀稀有度权重(小=稀有)
const AFFIXES = {
  wdmg:     { n: '武器伤害', pre: ['沉重', '凶蛮', '裂石'], v: [3, 8], perLvl: 2.4, unit: '' },
  fire:     { n: '火焰伤害', pre: ['燃火', '炽烈', '熔核'], v: [5, 12], perLvl: 0.9, unit: '%' },
  ice:      { n: '冰霜伤害', pre: ['霜寒', '凛冬', '凝霜'], v: [5, 12], perLvl: 0.9, unit: '%' },
  sFlame:   { n: '烈焰弹伤害', pre: ['焰心', '烈阳', '焚天'], v: [8, 18], perLvl: 1.3, unit: '%', w: 0.5 },
  sIce:     { n: '寒冰箭伤害', pre: ['冰心', '玄冰', '寒渊'], v: [8, 18], perLvl: 1.3, unit: '%', w: 0.5 },
  crit:     { n: '暴击率', pre: ['锐利', '精准', '致命'], v: [2, 6], perLvl: 0.16, unit: '%' },
  critdmg:  { n: '暴击伤害', pre: ['暴虐', '嗜血', '断罪'], v: [15, 40], perLvl: 2.2, unit: '%' },
  vul:      { n: '对易伤敌人伤害', pre: ['猎首', '破军', '屠弱'], v: [8, 20], perLvl: 1.1, unit: '%' },
  hp:       { n: '气血上限', pre: ['坚韧', '巨岩', '不灭'], v: [15, 40], perLvl: 6 },
  armor:    { n: '护甲', pre: ['铁壁', '磐石', '壁垒'], v: [4, 10], perLvl: 2 },
  burn:     { n: '点燃伤害', pre: ['灼魂', '业火', '余烬'], v: [10, 25], perLvl: 1.5, unit: '%' },
  chill:    { n: '冰冻概率', pre: ['凝霜', '寒潭', '凛冽'], v: [3, 8], perLvl: 0.22, unit: '%' },
  cast:     { n: '施法加速', pre: ['迅捷', '风语', '疾风'], v: [3, 8], perLvl: 0.22, unit: '%' },
};

// ---------- 传奇（橙）：专属特效 + 名称前缀称号库 ----------
const LEGENDARY_EFFECTS = [
  { id: 'L1', n: '烈焰弹分裂为两枚', sys: 'flame', titles: ['焚天', '赤炎', '燃火'] },
  { id: 'L2', n: '烈焰弹必定点燃目标', sys: 'flame', titles: ['业火', '灼魂', '余烬'] },
  { id: 'L3', n: '点燃伤害+100%，且可蔓延至另一名敌人', sys: 'flame', titles: ['燎原', '野火'] },
  { id: 'L4', n: '寒冰箭冻结概率翻倍，冻结的敌人受到伤害+25%', sys: 'ice', titles: ['玄冰', '凛冬', '凝渊'] },
  { id: 'L5', n: '专注叠层上限+3，且不再随时间衰减', sys: 'gen', titles: ['凝神', '静水'] },
  { id: 'L6', n: '暴击时回复3%气血', sys: 'gen', titles: ['嗜血', '贪狼'] },
  { id: 'L7', n: '施法加速效果必定触发追加施放', sys: 'gen', titles: ['时之', '疾风'] },
  { id: 'L8', n: '击杀敌人后攻击+6%，持续整场战斗', sys: 'gen', titles: ['滚雪', '增援'] },
  { id: 'L9', n: '你的攻击对易伤敌人必定暴击', sys: 'gen', titles: ['猎首', '破军'] },
  { id: 'L10', n: '战斗开始时获得护盾（30%气血上限）', sys: 'gen', titles: ['磐石', '守誓'] },
  { id: 'L11', n: '寒冰箭每命中一名敌人，下一击伤害+25%（可叠加）', sys: 'ice', titles: ['叠霜', '层冰'] },
  { id: 'L12', n: '战斗前3回合，伤害+80%', sys: 'gen', titles: ['先声', '惊雷'] },
  { id: 'L13', n: '毒刃淬毒概率触发双重施毒，毒层上限+2', sys: 'poison', titles: ['万毒', '蛇渊'] },
  { id: 'L14', n: '敌人身上的每一层毒素，使其受到你的伤害+8%', sys: 'poison', titles: ['蚀骨', '浸毒'] },
];

// ---------- 暗金（独特 · 手写专名） ----------
const UNIQUES = [
  { slot: 'weapon', n: '灰烬之喉', d: '点燃效果可叠加至3层。', fx: { burnStack: 3 }, stat: { burn: 45 }, lore: '从灰烬之喉说出的每句话，都在燃烧。' },
  { slot: 'ring1', n: '霜语指环', d: '寒冰箭命中时有20%概率立即冻结。', fx: { instantFreeze: 0.2 }, stat: { ice: 30 }, lore: '它在你的指间低语冬天。' },
  { slot: 'chest', n: '巨岩壁垒', d: '气血上限+40%，护甲+40%，攻击-10%。', fx: { hpPct: 0.4, armorPct: 0.4, atkPct: -0.1 }, stat: { hp: 120, armor: 50 }, lore: '搬不动，也打不穿。' },
  { slot: 'bracer', n: '猎首者腕甲', d: '对易伤敌人的伤害+60%。', fx: { vulBonus: 0.6 }, stat: { vul: 35 }, lore: '每一个猎物都以为自己是猎人。' },
  { slot: 'amulet', n: '龙息坠饰', d: '烈焰弹有30%概率化为龙息，伤害×2.2。', fx: { dragonBreath: 0.3 }, stat: { fire: 40 }, lore: '龙死了，但它的呼吸还挂在脖子上。' },
  { slot: 'helm', n: '无眠之眼', d: '战斗开始时，免疫前2次攻击。', fx: { blind: 2 }, stat: { armor: 30 }, lore: '它睁了三百年，没眨过一次。' },
  { slot: 'belt', n: '潮汐束带', d: '每回合结束回复8%气血。', fx: { regen: 0.08 }, stat: { hp: 80 }, lore: '潮起，潮落，你不死。' },
  { slot: 'boots', n: '风暴踏靴', d: '施法加速的概率触发变为必定触发。', fx: { castAlways: true }, stat: { cast: 25 }, lore: '别人等风来，你就是风。' },
  { slot: 'ring2', n: '冰湖之戒', d: '被冰冻的敌人死亡时炸裂，对周围造成其剩余气血的伤害。', fx: { iceBoom: true }, stat: { ice: 35 }, lore: '湖面之下，全是碎冰的声音。' },
  { slot: 'gloves', n: '焚火纹章手套', d: '专注层数提供的伤害加成翻倍。', fx: { focusDouble: true }, stat: { sFlame: 30 }, lore: '纹章灼进掌纹的那一刻，你不再需要法术书。' },
  { slot: 'pauld', n: '荒原行者肩甲', d: '气血低于30%时，伤害+80%。', fx: { lowHpRage: 0.8 }, stat: { hp: 100 }, lore: '荒原不怜悯任何人，它只承认活下来的人。' },
  { slot: 'legs', n: '王城遗冕护胫', d: '每装备一件传奇装备，攻击+4%。', fx: { perLegendary: 0.04 }, stat: { armor: 40 }, lore: '王城陷落那夜，传说们把它踩进了泥里。' },
  { slot: 'weapon', n: '万蛇之牙', d: '毒刃的伤害+80%，淬毒层数上限+2。', fx: { poisonStackPlus: 2 }, stat: { poison: 60 }, lore: '一万条蛇把它们的牙，留在了同一柄刃上。' },
  { slot: 'amulet', n: '腐心琉璃', d: '毒素 tick 触发时，有25%概率立即结算双倍伤害。', fx: { poisonDouble: 0.25 }, stat: { poison: 50, hp: 60 }, lore: '琉璃之心早就烂了，可它还在跳。' },
];

// ---------- 神话（机制改变 · 手写专名） ----------
const MYTHICS = [
  { slot: 'weapon', n: '残阳挽歌', d: '烈焰弹不再单体：改为引燃地面3回合，全场敌人持续灼烧。', fx: { groundBurn: true }, stat: { fire: 60, burn: 80 }, lore: '最后一缕残阳沉入深渊时，它唱完了整首歌。' },
  { slot: 'ring1', n: '双子星', d: '施放烈焰弹时，额外发射一枚寒冰箭。', fx: { twinStar: true }, stat: { fire: 30, ice: 30 }, lore: '一颗星星坠落，另一颗替它照亮。' },
  { slot: 'amulet', n: '永冬之心', d: '寒冰箭无冷却限制，冰冻概率+50%。', fx: { chillPlus: true }, stat: { ice: 60, chill: 50 }, lore: '心停在那个冬天，就再没化过。' },
  { slot: 'weapon', n: '焚书者', d: '烈焰弹伤害+120%，但禁止使用寒冰箭。', fx: { banIce: true }, stat: { fire: 90, sFlame: 50 }, lore: '它烧掉的第一本书，是《元素平衡论》。' },
  { slot: 'ring2', n: '时间窃贼', d: '每场战斗前3回合，每回合追加一次免费施放。', fx: { timeThief: true }, stat: { cast: 40, crit: 15 }, lore: '偷来的时间最锋利。' },
  { slot: 'amulet', n: '学徒的奇迹', d: '每次施放有12%概率造成×3伤害（顿悟）。', fx: { epiphany: 0.12 }, stat: { sFlame: 40, sIce: 40 }, lore: '每个大师都曾是学徒，奇迹只是装作偶然。' },
];

// ---------- 套装（两套 · 8护甲任取6件） ----------
const SETS = {
  ember: {
    n: '焚火学徒', icon: '🔥', slots: ARMOR_SLOTS,
    pieces: { helm: 1, pauld: 1, chest: 1, gloves: 1, bracer: 1, belt: 1, legs: 1, boots: 1 },
    bonus: { 2: { fire: 25 }, 4: { sFlame: 40, projPlus: 1 }, 6: { flameBurst: true } },
    d: { 2: '火焰伤害+25%', 4: '烈焰弹伤害+40%，投射物+1', 6: '烈焰弹命中后爆裂，对周围敌人造成40%伤害' },
  },
  winter: {
    n: '永冬之拥', icon: '❄️', slots: ARMOR_SLOTS,
    pieces: { helm: 1, pauld: 1, chest: 1, gloves: 1, bracer: 1, belt: 1, legs: 1, boots: 1 },
    bonus: { 2: { ice: 25 }, 4: { chill: 15, slowAlways: true }, 6: { shatterBoom: true } },
    d: { 2: '冰霜伤害+25%', 4: '冰冻概率+15%，寒冰箭必定减速', 6: '冻结的敌人被击碎时，受到1.6倍伤害并冰爆' },
  },
};

// ---------- 词缀上限（手搓护栏） ----------
const AFFIX_CAPS = { crit: 60, chill: 35, cast: 40, fire: 150, ice: 150, sFlame: 300, sIce: 300, vul: 200, critdmg: 500 };

// ---------- 地图 ----------
const STORY_MAPS = [
  { id: 'ash', n: '灰烬荒原', lv: 1, boss: { n: '灰烬巨像', hp: 260, atk: 9 }, packs: 4,
    mobs: ['烬壳甲虫', '荒原掠食犬', '游荡的焦骨架'] },
  { id: 'gloom', n: '幽暗林地', lv: 6, boss: { n: '林中蛛母', hp: 620, atk: 15 }, packs: 5,
    mobs: ['毒牙蛛', '腐藤树人', '暗林狼群'] },
  { id: 'mist', n: '寒雾森林', lv: 12, boss: { n: '雾中猎手', hp: 1500, atk: 23 }, packs: 6,
    mobs: ['雾魇', '冰苔巨熊', '迷途卫兵的怨灵'] },
  { id: 'forge', n: '熔炉深窟', lv: 18, boss: { n: '熔核守卫', hp: 3600, atk: 33 }, packs: 7,
    mobs: ['熔岩傀儡', '铁砧魔像', '炉火小鬼'] },
  { id: 'silent', n: '静默王城', lv: 24, boss: { n: '亡语王', hp: 8200, atk: 45 }, packs: 8,
    mobs: ['静默骑士', '王城法吏', '石化的弄臣'] },
];
const ABYSS_MAPS = [
  '蚀尘回廊', '蛛网回廊', '霜墓回廊', '熔核回廊', '王陵回廊', '无光回廊', '腐潮回廊',
  '血月回廊', '回声回廊', '焚天回廊', '寒渊回廊', '星坠回廊', '虚空回廊', '终焉回廊', '暗渊之心',
];
const DIFFS = { normal: { n: '寻常', mult: 1 }, nightmare: { n: '噩梦', mult: 2.6 }, hell: { n: '炼狱', mult: 6.5 } };
const MOB_BASES = ['爬行者', '撕裂者', '咒卫', '游魂', '茧蛹', '看门者', '腐化祭司', '低语者', '颅骨收藏家', '渊裔'];

// ---------- 天赋树（3分支 · 关键天赋） ----------
const TALENTS = {
  flame: { n: '焚火之道', icon: '🔥', nodes: [
    { id: 'f1', n: '火之亲和', d: '火焰伤害+8%', fx: { fire: 8 } },
    { id: 'f2', n: '灼热余烬', d: '点燃伤害+15%', fx: { burn: 15 } },
    { id: 'f3', n: '烈焰掌控', d: '烈焰弹伤害+12%', fx: { sFlame: 12 } },
    { id: 'f4', n: '焚风压顶', d: '火焰伤害+8%', fx: { fire: 8 } },
    { id: 'f5', n: '余温灼人', d: '点燃伤害+20%', fx: { burn: 20 } },
    { id: 'f6', n: '焰核共鸣', d: '烈焰弹伤害+15%', fx: { sFlame: 15 }, need: 3 },
    { id: 'f7', n: '烧尽一切', d: '火焰伤害+12%', fx: { fire: 12 }, need: 3 },
    { id: 'f8', n: '龙瞳', d: '暴击率+5%', fx: { crit: 5 }, need: 4 },
  ], keys: [
    { id: 'fk1', n: '冰火同源', d: '火系伤害也可触发"碎冰"效果（对减速/冻结敌人+30%伤害）', fx: { icefire: true } },
    { id: 'fk2', n: '弹幕大师', d: '烈焰弹投射物+1，每枚伤害-25%', fx: { projPlus: 1, projDmg: -0.25 } },
    { id: 'fk3', n: '玻璃大炮', d: '暴击伤害+150%，受到伤害+50%', fx: { critdmg: 150, taken: 0.5 } },
  ] },
  ice: { n: '寒冰之道', icon: '❄️', nodes: [
    { id: 'i1', n: '寒潭之基', d: '冰霜伤害+8%', fx: { ice: 8 } },
    { id: 'i2', n: '凝霜触感', d: '冰冻概率+3%', fx: { chill: 3 } },
    { id: 'i3', n: '寒箭淬锋', d: '寒冰箭伤害+12%', fx: { sIce: 12 } },
    { id: 'i4', n: '北风呼啸', d: '冰霜伤害+8%', fx: { ice: 8 } },
    { id: 'i5', n: '深冬之握', d: '冰冻概率+4%', fx: { chill: 4 } },
    { id: 'i6', n: '冰川共鸣', d: '寒冰箭伤害+15%', fx: { sIce: 15 }, need: 3 },
    { id: 'i7', n: '凛冬将至', d: '冰霜伤害+12%', fx: { ice: 12 }, need: 3 },
    { id: 'i8', n: '碎冰者之瞳', d: '对减速敌人伤害+12%', fx: { slowDmg: 12 }, need: 4 },
  ], keys: [
    { id: 'ik1', n: '永冻之心', d: '寒冰箭命中必定减速，减速敌人受到伤害+20%', fx: { slowAlways: true, slowDmg: 20 } },
    { id: 'ik2', n: '碎冰专家', d: '对冻结敌人的伤害+60%（与关键天赋叠乘）', fx: { shatterDmg: 60 } },
  ] },
  gen: { n: '生存与混沌', icon: '🌿', nodes: [
    { id: 'g1', n: '强健体魄', d: '气血上限+30', fx: { hp: 30 } },
    { id: 'g2', n: '铁皮肤', d: '护甲+12', fx: { armor: 12 } },
    { id: 'g3', n: '致命直觉', d: '暴击率+3%', fx: { crit: 3 } },
    { id: 'g4', n: '残暴本性', d: '暴击伤害+25%', fx: { critdmg: 25 } },
    { id: 'g5', n: '武器大师', d: '武器伤害+10', fx: { wdmg: 10 } },
    { id: 'g6', n: '猎手标记', d: '对易伤敌人伤害+15%', fx: { vul: 15 }, need: 3 },
    { id: 'g7', n: '坚韧意志', d: '气血上限+50', fx: { hp: 50 }, need: 3 },
    { id: 'g8', n: '完美平衡', d: '火焰与冰霜伤害+6%', fx: { fire: 6, ice: 6 }, need: 4 },
  ], keys: [
    { id: 'gk1', n: '永动法核', d: '击杀回复法力翻倍，每次击杀回复4%气血', fx: { killHeal: 0.04 } },
    { id: 'gk2', n: '拾荒者', d: '掉落数量+50%，平均品质-1档', fx: { lootQty: 0.5, lootQ: -1 } },
    { id: 'gk3', n: '燃命施法', d: '气血不足时可消耗气血施法，伤害+40%', fx: { lifeCast: true } },
  ] },
};

// ---------- 通货 ----------
const CURRENCIES = {
  transmute: { n: '开灵石', icon: '🔹', d: '白装→蓝装，附加1条词缀' },
  augment:   { n: '蕴华石', icon: '🔷', d: '蓝装→紫装，追加1条词缀' },
  exalted:   { n: '点睛石', icon: '🟣', d: '紫装追加1条词缀（至多6）' },
  chaos:     { n: '混元石', icon: '🌀', d: '重随紫/金装全部词缀' },
  lock:      { n: '锁词石', icon: '🔒', d: '锁定1条词缀，重随其余（保Build核心）' },
  sublimate: { n: '加冕石', icon: '⬆️', d: '金装→传奇（赋予专属特效）', rare: true },
};

// ---------- 异界奇遇（清剿时概率触发） ----------
const ABYSS_EVENTS = [
  { id: 'a_caravan', title: '深渊商队', text: '一支蒙着黑纱的商队在回廊深处支起摊子，摊上货物的价格牌全部朝下。「远道而来的施法者，要不要试试手气？」',
    choices: [
      { t: '买下一个未开封的包裹', fx: { yinliang: -60, gamble: 1 }, msg: '包裹里的东西可遇不可求——但你总觉得这钱花得值。' },
      { t: '用一枚渊晶换情报', fx: { yuanjing: -1, morale: 3 }, msg: '商队头目压低声音告诉了你一处无人知晓的宝藏位置。虽然具体位置他自己也忘了。' },
      { t: '路过', msg: '商队的目标客户显然不是你这样的穷人。', fx: {} },
    ] },
  { id: 'a_altar', title: '血月祭坛', text: '一座渗着暗红光晕的祭坛挡在路中央，献上一件装备，就能换取深渊的凝视。',
    choices: [
      { t: '献祭背包中最差的一件', fx: { sacrifice: 1, morale: 2 }, msg: '装备化作血雾渗入祭坛。你感到深渊看了你一眼—— Neutral 的，但记住了你。' },
      { t: '无视并绕过', msg: '祭坛的光晕在你身后黯淡下去。有些便宜，占不得。', fx: {} },
    ] },
  { id: 'a_merc', title: '落单的佣兵', text: '一个浑身绷带的佣兵靠墙坐着，面前的破盔上丢着几枚金币。「猜单双，赢走它们。或者……雇我打一场。」',
    choices: [
      { t: '猜！单双一决胜负', rand: [
        { ch: 0.5, msg: '你赢了！佣兵爽快付账，还传授了一手杀敌的窍门。', fx: { yinliang: 40, lili: 1 } },
        { ch: 0.5, msg: '你输了，但佣兵的战斗直觉让你受益匪浅。', fx: { yinliang: -15, shenfa: 1 } } ] },
      { t: '雇他同行（金币-40）', msg: '佣兵的刀快得像笑话讲得好。这一层清剿格外轻松。', fx: { yinliang: -40, hire: 1 } },
    ] },
  { id: 'a_cache', title: '上一次轮回的遗物', text: '一具穿着你这样装束的骸骨靠在墙角——他也曾是个元素使。手边有个上锁的箱子，没有钥匙。',
    choices: [
      { t: '砸开箱子（小心：也许有陷阱）', rand: [
        { ch: 0.6, msg: '箱子里是他攒下的全部家当。你对着骸骨敬了个礼：「我会带着它们走得更深。」', fx: { yinliang: 50, gamble: 1 } },
        { ch: 0.4, msg: '箱子崩开了，东西炸得满地都是，你的眉毛烧掉了一半。捡回来的没剩几件。', fx: { hp: -10, yinliang: 20 } } ] },
      { t: '让他安息', msg: '你用石头垒了个小小的坟。深渊里，同行者值得这点体面。', fx: { morale: 6, shengwang: 1 } },
    ] },
];

// ---------- 职业二：影刃（近战刺客 · 毒/连击/暴击） ----------
const CLASSES = {
  elementalist: { n: '元素使', icon: '🔥', d: '烈焰与寒冰的施法者。技能：烈焰弹（单体爆发）、寒冰箭（全体控场）。' },
  shadowblade: { n: '影刃', icon: '🗡️', d: '行走于刀锋与毒雾之间的刺客。技能：影袭（单体连击爆发）、毒刃（淬毒消耗）。被动：影遁（闪避+15%）· 嗜血（暴击回血4%）· 连击本能（20%概率追击半击）· 用毒大师（毒伤+60%）' },
};

// 新词缀：连击 / 毒伤
AFFIXES.combo = { n: '连击概率', pre: ['残影', '鬼魅', '连环'], v: [3, 8], perLvl: 0.22, unit: '%', w: 0.6 };
AFFIXES.poison = { n: '毒素伤害', pre: ['蛇信', '淬毒', '腐心'], v: [10, 25], perLvl: 1.5, unit: '%', w: 0.6 };
AFFIX_CAPS.combo = 45;
AFFIX_CAPS.poison = 300;

// 第三套装：蛇吻之袭（影刃向）
SETS.snake = {
  n: '蛇吻之袭', icon: '🐍', slots: ARMOR_SLOTS,
  pieces: { helm: 1, pauld: 1, chest: 1, gloves: 1, bracer: 1, belt: 1, legs: 1, boots: 1 },
  bonus: { 2: { poison: 25 }, 4: { combo: 10, sShadow: 30 }, 6: { poisonStack5: true } },
  d: { 2: '毒素伤害+25%', 4: '连击概率+10%，影袭伤害+30%', 6: '毒刃的淬毒可叠加至5层，敌人死亡时毒雾伤及同伴' },
};

// 影之道天赋分支
TALENTS.shadow = { n: '影刃之道', icon: '🗡️', nodes: [
  { id: 's1', n: '淬毒基础', d: '毒素伤害+15%', fx: { poison: 15 } },
  { id: 's2', n: '鬼魅步伐', d: '闪避+5%', fx: { dodge: 5 } },
  { id: 's3', n: '连击本能·改', d: '连击概率+5%', fx: { combo: 5 } },
  { id: 's4', n: '刃上喂毒', d: '毒素伤害+18%', fx: { poison: 18 } },
  { id: 's5', n: '影袭精研', d: '影袭伤害+15%', fx: { sShadow: 15 } },
  { id: 's6', n: '弱点洞察', d: '暴击率+4%', fx: { crit: 4 }, need: 3 },
  { id: 's7', n: '连环三影', d: '连击概率+7%', fx: { combo: 7 }, need: 3 },
  { id: 's8', n: '无影者之速', d: '闪避+6%', fx: { dodge: 6 }, need: 4 },
], keys: [
  { id: 'sk1', n: '影分身', d: '所有攻击有15%概率双重施放', fx: { shadowDouble: 0.15 } },
  { id: 'sk2', n: '无影之影', d: '闪避+15%，但护甲-30%', fx: { dodge: 15, armorPctT: -0.3 } },
] };
