/* ============================================================
 * 《暗渊回廊》P1+P2 扩展数据
 * 武器卡手 / 职业专精 / 任务链
 * ============================================================ */

// ---------- 武器类型（卡手系统） ----------
const WEAPON_TYPES = {
  staff: { n: '法杖', icon: '🪄', forClass: 'elementalist', d: '施法者的延伸。' },
  blade: { n: '利刃', icon: '🗡️', forClass: 'shadowblade', d: '刺客的獠牙。' },
};

// 法器基底分配武器类型（同类基底共享类型）
const BASE_WEAPON_TYPES = {
  '法珠': 'staff', '魔杖': 'staff', '咒典': 'staff',
  '断刃': 'blade', '双刺': 'blade', '影刃': 'blade',
};
// 影刃可用基底（追加进 BASES.weapon 与掉落池）
BASES.weapon = ['法珠', '魔杖', '咒典', '断刃', '双刺', '影刃'];

// ---------- 职业专精 ----------
// 同职业装备：词缀全额生效；异职业装备：词缀打7折（武器则是彻底卡手）
const OFFCLASS_PENALTY = 0.7;

// ---------- 任务链（主线引导 + 支线刷级，填15→30真空） ----------
const QUESTS = [
  // 主线（顺序解锁，一次性）
  { id: 'q1', chain: 'main', n: '初临深渊', lv: 1, d: '在灰烬荒原清剿 3 波怪物。', goal: { type: 'packs', n: 3 }, reward: { xp: 80, gold: 30 } },
  { id: 'q2', chain: 'main', n: '荒原的Boss', lv: 3, d: '击败灰烬荒原的首领。', goal: { type: 'boss', map: 0 }, reward: { xp: 250, gold: 80, mats: { transmute: 2 } } },
  { id: 'q3', chain: 'main', n: '手搓入门', lv: 6, d: '在打造面板完成 1 次打造操作。', goal: { type: 'craft', n: 1 }, reward: { xp: 400, gold: 60 } },
  { id: 'q4', chain: 'main', n: '林地的阴影', lv: 8, d: '击败幽暗林地的蛛母。', goal: { type: 'boss', map: 1 }, reward: { xp: 900, gold: 150, mats: { augment: 2 } } },
  { id: 'q5', chain: 'main', n: '武装到牙齿', lv: 12, d: '身上装备 6 件紫色（稀有）及以上装备。', goal: { type: 'gearScore', n: 6 }, reward: { xp: 1800, gold: 200, mats: { exalted: 1 } } },
  { id: 'q6', chain: 'main', n: '雾中猎手', lv: 15, d: '击败寒雾森林的猎手。', goal: { type: 'boss', map: 2 }, reward: { xp: 3200, gold: 300, mats: { chaos: 1 } } },
  { id: 'q7', chain: 'main', n: '熔核之怒', lv: 20, d: '击败熔炉深窟的守卫。', goal: { type: 'boss', map: 3 }, reward: { xp: 6000, gold: 450, mats: { lock: 1 } } },
  { id: 'q8', chain: 'main', n: '亡语的终章', lv: 25, d: '击败静默王城的亡语王。', goal: { type: 'boss', map: 4 }, reward: { xp: 11000, gold: 600, mats: { sublimate: 1 } } },
  { id: 'q9', chain: 'main', n: '异界之门', lv: 30, d: '踏入异界回廊并完成一次清剿。', goal: { type: 'abyss', n: 1 }, reward: { xp: 20000, gold: 1000, yuanjing: 10 } },
  // 支线（循环刷级用，完成一轮自动接取下一轮）
  { id: 's_hunt', chain: 'side', n: '悬赏：清剿令', lv: 10, repeat: true, d: '清剿任意 5 波怪物。', goal: { type: 'packs', n: 5 }, reward: { xp: 1200, gold: 120 } },
  { id: 's_boss', chain: 'side', n: '悬赏：弑首领', lv: 14, repeat: true, d: '击败任意 2 名首领。', goal: { type: 'bossAny', n: 2 }, reward: { xp: 2500, gold: 200 } },
  { id: 's_salvage', chain: 'side', n: '悬赏：废铁收购', lv: 16, repeat: true, d: '分解 8 件装备。', goal: { type: 'salvage', n: 8 }, reward: { xp: 2000, canxiang: 30 } },
  { id: 's_deep', chain: 'side', n: '悬赏：深入回廊', lv: 30, repeat: true, d: '在异界完成 3 次清剿。', goal: { type: 'abyss', n: 3 }, reward: { xp: 15000, yuanjing: 8 } },
];
