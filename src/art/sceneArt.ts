// ─── 场景插画总表:每个场景一张图 + 每段旁白的聚焦目标 ─────────────────
// focus[i] 对应 SceneNode.text[i]:读到那一段时,画面对应物件高亮、其余压暗、镜头轻推。
// 物件原点在「底部中心」;画布 400×170,地面线 y=150。人物朝 +x,flip = 朝左。
// 本地预览单个场景:npx vite 后打开 /?scene=<场景 id>&cls=<职业>。
import type { ArtSpec, Place, SceneArt } from './render'
import type { PropId } from './props'

type Item = Place

/** 画面里的「你」。默认站在左侧面朝右 */
const you = (x: number, y = 156, s = 1.4, flip = false): Item => ({ prop: 'player', x, y, s, flip, id: 'player' })

// ══════════════════════ 场景 ══════════════════════
export const SCENE_ART: Record<string, SceneArt> = {
  // ─── 新增支线 ───
  a1_ember_rain: {
    bg: 'gate', light: [200, 60],
    items: [{ prop: 'ashRain', x: 0, y: 170, id: 'rain', rim: null }, you(200, 168, 1.72)],
    focus: [['rain'], ['rain']],
  },
  a1_watchman: {
    bg: 'tower', light: [228, 70],
    items: [
      { prop: 'bell', x: 204, y: 132, s: 1.5, id: 'bell' },
      { prop: 'watchman', x: 296, y: 158, s: 1.72, flip: true, id: 'watchman' },
      you(118, 170, 1.66),
    ],
    focus: [['bell'], ['watchman']],
  },
  a1_ledger_pages: {
    bg: 'street', light: [200, 80],
    items: [
      { prop: 'doorNight', x: 60, y: 158, s: 1.45 },
      { prop: 'worker', x: 166, y: 160, s: 1.72, id: 'worker' },
      { prop: 'flyPages', x: 200, y: 150, id: 'pages', rim: null },
      you(292, 170, 1.66, true),
    ],
    focus: [['pages', 'worker'], ['pages']],
  },
  a1_ember_hound: {
    bg: 'street', light: [214, 140],
    items: [{ prop: 'hound', x: 204, y: 152, s: 1.95, id: 'hound' }, you(318, 170, 1.66, true)],
    focus: [['hound'], ['hound']],
  },
  a2_ferry: {
    bg: 'lake', light: [200, 90],
    items: [
      { prop: 'boat', x: 230, y: 150, s: 1.32, id: 'boat' },
      { prop: 'ferryman', x: 216, y: 128, s: 1.72, flip: true, id: 'ferryman' },
      you(80, 166, 1.66),
    ],
    focus: [['ferryman', 'boat'], ['ferryman', 'boat']],
  },
  a2_echo_hall: {
    bg: 'hall', light: [200, 80],
    items: [
      { prop: 'torch', x: 70, y: 96, s: 1.2, layer: 0 }, { prop: 'torch', x: 330, y: 96, s: 1.2, layer: 0 },
      you(196, 170, 1.74),
    ],
    focus: [[], ['player']],
  },
  a2_wine_cellar: {
    bg: 'cellar', light: [250, 110],
    items: [
      { prop: 'barrelStack', x: 262, y: 150, s: 1.55, id: 'barrels' },
      { prop: 'orcSeated', x: 168, y: 152, s: 1.3, id: 'orc' },
      you(82, 170, 1.62),
    ],
    focus: [['barrels'], ['orc']],
  },
  a2_bat_swarm: {
    bg: 'cavern', light: [150, 96],
    items: [
      { prop: 'emberbat', x: 240, y: 138, s: 1.5, id: 'bats', rim: null },
      { prop: 'torch', x: 128, y: 94, s: 1.3, id: 'torch' },
      you(146, 168, 1.68),
    ],
    focus: [['bats'], ['torch', 'bats']],
  },
  a3_mirror_hall: {
    bg: 'hall', light: [300, 90],
    items: [
      { prop: 'mirror', x: 92, y: 154, s: 1.22, layer: 1 },
      { prop: 'mirror', x: 360, y: 150, s: 1.1, layer: 1 },
      { prop: 'mirror', x: 292, y: 156, s: 1.5, id: 'mirror' },
      you(188, 172, 1.76),
    ],
    focus: [['mirror'], ['mirror', 'reflection']],
  },
  a3_ash_garden: {
    bg: 'garden', light: [246, 130],
    items: [
      { prop: 'ashFlowers', x: 200, y: 152, s: 1.3, id: 'flowers', rim: null },
      { prop: 'signBoard', x: 264, y: 154, s: 1.5, id: 'sign' },
      you(100, 170, 1.66),
    ],
    focus: [['flowers'], ['sign']],
  },
  a3_duet: {
    bg: 'hall', light: [256, 110],
    items: [{ prop: 'banjoSit', x: 258, y: 154, s: 2.0, flip: true, id: 'banjo' }, you(136, 170, 1.66)],
    focus: [['banjo'], ['banjo']],
  },
  a3_royal_guard: {
    bg: 'throne', light: [112, 96],
    items: [
      { prop: 'stairs', x: 262, y: 172, s: 1.2 },
      { prop: 'ashKnight', x: 254, y: 152, s: 2.0, flip: true, id: 'guard' },
      you(100, 172, 1.66),
    ],
    focus: [['guard'], ['guard']],
  },
  // ─── 第一幕:烬痕镇与迷城之门 ───
  a1_open: {
    bg: 'tavern', light: [96, 128],
    items: [
      { prop: 'window', x: 206, y: 104, layer: 0, id: 'window' },
      { prop: 'lamp', x: 262, y: 62, layer: 0 },
      { prop: 'fireplace', x: 92, y: 150, s: 1.04, id: 'fireplace' },
      { prop: 'portrait', x: 150, y: 92, s: 1.15, id: 'portrait' },
      { prop: 'granny', x: 322, y: 150, s: 1.16, flip: true, id: 'granny' },
      { prop: 'barcounter', x: 322, y: 150 },
      { prop: 'ledger', x: 300, y: 116, s: 1.1, id: 'ledger' },
      { prop: 'stool', x: 254, y: 150 }, { prop: 'stool', x: 296, y: 150 },
      you(214, 158, 1.42, true),
    ],
    focus: [['window'], ['fireplace', 'portrait'], ['granny', 'ledger']],
  },
  a1_sign: {
    bg: 'tavern', light: [200, 118],
    items: [
      { prop: 'lamp', x: 118, y: 58, layer: 0 }, { prop: 'lamp', x: 286, y: 54, layer: 0 },
      { prop: 'fireplace', x: 30, y: 150, s: 0.86, layer: 1 },
      { prop: 'signers', x: 120, y: 136, s: 1.1, id: 'signers' },
      { prop: 'signers', x: 262, y: 136, s: 1.05, flip: true, id: 'signers' },
      { prop: 'granny', x: 330, y: 150, s: 1.24, flip: true, id: 'granny' },
      { prop: 'table', x: 200, y: 152, s: 1.5 },
      { prop: 'bowl', x: 200, y: 113, s: 1.6, id: 'bowl' },
      you(186, 168, 1.9, true),
    ],
    focus: [['bowl'], ['bowl', 'granny'], ['signers', 'player']],
  },
  a1_memory_done: {
    bg: 'gate', light: [250, 118],
    items: [
      { prop: 'gateFar', x: 252, y: 134, s: 1.15, id: 'gate' },
      { prop: 'doorNight', x: 52, y: 158, s: 1.5, id: 'door' },
      { prop: 'granny', x: 84, y: 158, s: 1.5, id: 'granny' },
      { prop: 'signers', x: 176, y: 142, s: 0.72, id: 'signers' },
      { prop: 'signers', x: 206, y: 136, s: 0.56, flip: true, id: 'signers' },
    ],
    focus: [['granny', 'door'], ['granny'], ['gate']],
  },
  a1_banjo_intro: {
    bg: 'street', light: [112, 52],
    items: [
      { prop: 'lamppost', x: 104, y: 158, s: 1.1, layer: 1 },
      { prop: 'onlookers', x: 336, y: 150, s: 1.1, flip: true, layer: 1, id: 'onlookers' },
      { prop: 'luteCase', x: 176, y: 168, s: 1.5 },
      { prop: 'banjo', x: 214, y: 158, s: 1.72, id: 'banjo' },
      { prop: 'worker', x: 258, y: 158, s: 1.66, flip: true, id: 'worker' },
      you(128, 168, 1.62),
    ],
    focus: [['banjo', 'worker'], ['banjo'], ['onlookers']],
  },
  a1_well: {
    bg: 'street', light: [204, 116],
    items: [
      { prop: 'well', x: 216, y: 154, s: 1.75, id: 'well' },
      you(132, 164, 1.7),
    ],
    focus: [['well'], ['well']],
  },
  a1_beggar: {
    bg: 'street', light: [206, 150],
    items: [
      { prop: 'worker', x: 224, y: 150, s: 0.92, flip: true, layer: 1, op: 0.75 },
      { prop: 'beggar', x: 196, y: 158, s: 2.05, id: 'beggar' },
      you(300, 166, 1.7, true),
    ],
    focus: [['beggar'], ['hand']],
  },
  a1_shrine: {
    bg: 'gate', light: [196, 112],
    items: [
      { prop: 'deadTree', x: 62, y: 150, s: 1.0, layer: 1 },
      { prop: 'shrine', x: 196, y: 154, s: 1.95, id: 'shrine' },
      you(296, 166, 1.62, true),
    ],
    focus: [['shrine'], ['shrine']],
  },
  a1_lostcart: {
    bg: 'gate', light: [150, 110],
    items: [
      { prop: 'deadTree', x: 352, y: 150, s: 1.1, layer: 1 },
      { prop: 'crows', x: 268, y: 52, s: 1.7, id: 'crows', rim: null },
      { prop: 'cart', x: 196, y: 150, s: 1.72, id: 'cart' },
      { prop: 'drover', x: 106, y: 152, s: 1.85, id: 'drover' },
      { prop: 'crate', x: 286, y: 150, s: 1.3 }, { prop: 'crate', x: 312, y: 150, s: 0.95 },
      you(40, 166, 1.5),
    ],
    focus: [['cart', 'drover'], ['crows']],
  },
  a1_ghost_child: {
    bg: 'corridor', light: [214, 120],
    items: [
      { prop: 'torch', x: 72, y: 86, s: 1.1, layer: 0 },
      { prop: 'rock', x: 216, y: 152, s: 2.3 },
      { prop: 'ghostChild', x: 214, y: 132, s: 2.5, flip: true, id: 'child', rim: null },
      you(124, 162, 1.6),
    ],
    focus: [['child'], ['child']],
  },
  a1_gamblers: {
    bg: 'corridor', light: [200, 48],
    items: [
      { prop: 'lamp', x: 202, y: 40, s: 1.25, layer: 0 },
      { prop: 'goblinGambler', x: 156, y: 150, s: 1.9, flip: true, id: 'goblins' },
      { prop: 'gambitBoard', x: 214, y: 152, s: 1.95, id: 'board' },
      { prop: 'goblinGambler', x: 268, y: 150, s: 1.95, id: 'goblins' },
      { prop: 'goblinGambler', x: 214, y: 136, s: 2.15, flip: true, id: 'goblins' },
      you(92, 164, 1.6),
    ],
    focus: [['goblins', 'board'], ['board']],
  },
  a1_frag1: {
    bg: 'shrine', light: [232, 118],
    items: [
      { prop: 'shrineRuin', x: 190, y: 154, s: 2.15, id: 'shrine' },
      { prop: 'parchment', x: 244, y: 152, s: 2.3, id: 'parchment', rim: null },
      you(112, 164, 1.6),
    ],
    focus: [['shrine', 'parchment'], ['parchment'], ['parchment']],
  },
  a1_forge: {
    bg: 'forge', light: [72, 124],
    items: [
      { prop: 'fireplace', x: 58, y: 150, s: 1.1, id: 'furnace' },
      { prop: 'weaponRack', x: 262, y: 150, s: 1.55, id: 'rack' },
      { prop: 'anvil', x: 150, y: 153, s: 1.55 },
      { prop: 'smith', x: 208, y: 153, s: 1.5, id: 'smith' },
      you(350, 166, 1.5, true),
    ],
    focus: [['smith', 'rack'], ['rack']],
  },
  a1_gate: {
    bg: 'gate', light: [200, 100],
    items: [
      { prop: 'greatGate', x: 200, y: 146, s: 0.92 },
      { prop: 'stairs', x: 200, y: 170 },
      { prop: 'gargoyle', x: 262, y: 38, s: 1.0, id: 'gargoyle' },
      you(92, 166, 1.7),
    ],
    focus: [['gargoyle'], ['gargoyle'], ['gargoyle']]
  },
  a1_goblin_ambush: {
    bg: 'corridor', light: [110, 120],
    items: [
      { prop: 'closingDoor', x: 104, y: 150, s: 0.9, id: 'door' },
      { prop: 'rock', x: 294, y: 152, s: 2.3, layer: 1 },
      { prop: 'goblin', x: 282, y: 150, s: 2.2, flip: true, id: 'goblin' },
      you(186, 162, 1.7),
    ],
    focus: [['door'], ['goblin']],
  },
  a1_after_goblin: {
    bg: 'corridor', light: [200, 126],
    items: [
      { prop: 'tunnelDark', x: 206, y: 150, layer: 1, id: 'tunnel' },
      { prop: 'ashPile', x: 124, y: 152, s: 1.7 },
      { prop: 'tallySpear', x: 180, y: 150, s: 1.7, id: 'spear' },
      you(320, 166, 1.6, true),
    ],
    focus: [['spear'], ['tunnel']],
  },
  a1_camp1: {
    bg: 'camp', light: [200, 132],
    items: [
      { prop: 'rock', x: 128, y: 150, s: 1.5 }, { prop: 'rock', x: 278, y: 150, s: 1.8 },
      { prop: 'campfire', x: 200, y: 152, s: 1.12, id: 'fire' },
      { prop: 'flamegranny', x: 268, y: 136, s: 1.32, flip: true, id: 'flamegranny', rim: null },
      you(134, 152, 1.38),
    ],
    focus: [['fire', 'flamegranny'], ['flamegranny'], ['flamegranny']],
  },
  a1_spider_lair: {
    bg: 'cavern', light: [200, 150],
    items: [
      { prop: 'web', x: 0, y: 170, id: 'web', rim: null, layer: 1 },
      { prop: 'cocoon', x: 190, y: 120, s: 1.1, id: 'cocoon', rim: null },
      { prop: 'spider', x: 278, y: 84, s: 1.5, flip: true, id: 'spider' },
      you(108, 162, 1.55),
    ],
    focus: [['cocoon'], ['spider']],
  },
  a1_end: {
    bg: 'cavern', light: [240, 110],
    items: [
      { prop: 'web', x: 0, y: 170, s: 0.7, rim: null, layer: 0 },
      { prop: 'travelerRun', x: 84, y: 150, s: 1.25, flip: true, id: 'traveler' },
      { prop: 'elevator', x: 244, y: 150, s: 1.06, id: 'elevator' },
      you(176, 164, 1.5),
    ],
    focus: [['traveler'], [], ['elevator'], ['elevator']],
  },

  // ─── 第二幕:幽暗深处 ───
  a2_descend: {
    bg: 'corridor', light: [200, 70],
    items: [
      { prop: 'torch', x: 96, y: 82, s: 1.1, layer: 0 }, { prop: 'torch', x: 306, y: 82, s: 1.1, layer: 0 },
      { prop: 'carving', x: 200, y: 150, id: 'carving', rim: null },
      you(146, 164, 1.6),
    ],
    focus: [['carving'], ['carving'], ['carving2']],
  },
  a2_banjo_truth: {
    bg: 'cavern', light: [262, 100],
    items: [
      { prop: 'mushroomRock', x: 262, y: 152, s: 1.95, id: 'rock' },
      { prop: 'banjoSit', x: 288, y: 108, s: 1.9, flip: true, id: 'banjo' },
      you(130, 164, 1.6),
    ],
    focus: [['banjo'], ['banjo', 'rock'], ['banjo']],
  },
  a2_market: {
    bg: 'market', light: [200, 60],
    items: [
      { prop: 'stallTent', x: 84, y: 150, s: 1.35, layer: 1 },
      { prop: 'stallTent', x: 322, y: 150, s: 1.35, flip: true, layer: 1 },
      { prop: 'grill', x: 310, y: 150, s: 1.35 },
      { prop: 'goblinCook', x: 276, y: 150, s: 1.9, flip: true, id: 'cook' },
      { prop: 'merchant', x: 178, y: 152, s: 1.6, id: 'merchant' },
      you(110, 166, 1.6),
    ],
    focus: [['cook', 'merchant'], ['merchant']],
  },
  a2_broken_bridge: {
    bg: 'cavern', light: [200, 60],
    items: [
      { prop: 'brokenBridge', x: 200, y: 150, id: 'bridge' },
      you(30, 128, 1.45),
    ],
    focus: [['bridge'], ['handholds']],
  },
  a2_fountain: {
    bg: 'shrine', light: [200, 140],
    items: [
      { prop: 'stele', x: 288, y: 154, s: 1.6, id: 'stele' },
      { prop: 'bloodPool', x: 196, y: 158, s: 1.4, id: 'pool' },
      you(106, 166, 1.6),
    ],
    focus: [['pool', 'stele'], ['reflection']],
  },
  a2_library: {
    bg: 'library', light: [200, 40],
    items: [
      { prop: 'burningLetters', x: 0, y: 0, id: 'letters', rim: null, layer: 1 },
      { prop: 'ashPage', x: 214, y: 98, s: 2.4, id: 'page', rim: null },
      you(146, 166, 1.68),
    ],
    focus: [['letters'], ['page']],
  },
  a2_mimic: {
    bg: 'cavern', light: [212, 130],
    items: [
      { prop: 'rock', x: 112, y: 150, s: 1.8, layer: 1 }, { prop: 'rock', x: 306, y: 150, s: 1.6, layer: 1 },
      { prop: 'mimic', x: 212, y: 154, s: 2.05, id: 'chest' },
      you(104, 166, 1.6),
    ],
    focus: [['chest'], ['chest']],
  },
  a2_shadows: {
    bg: 'corridor', light: [146, 92],
    items: [
      { prop: 'torch', x: 118, y: 92, s: 1.25, id: 'torch' },
      { prop: 'shadows', x: 282, y: 150, s: 1.75, id: 'shadows', rim: null },
      you(150, 164, 1.68),
    ],
    focus: [['player', 'torch'], ['shadows'], ['shadows']],
  },
  a2_skeleton_rubble: {
    bg: 'corridor', light: [220, 110],
    items: [
      { prop: 'rubble', x: 238, y: 152, s: 2.0, id: 'rubble' },
      { prop: 'skeletonClimb', x: 232, y: 150, s: 2.0, flip: true, id: 'skeleton' },
      you(112, 166, 1.6),
    ],
    focus: [['skeleton'], ['skeleton']],
  },
  a2_ghoul_ambush: {
    bg: 'corridor', light: [128, 90],
    items: [
      { prop: 'torch', x: 124, y: 90, s: 1.25 },
      { prop: 'ghouls', x: 250, y: 150, s: 1.5, id: 'ghouls' },
      you(128, 166, 1.68),
    ],
    focus: [['ghouls'], ['ghouls']],
  },
  a2_orc_camp: {
    bg: 'cellar', light: [214, 130],
    items: [
      { prop: 'tent', x: 74, y: 150, s: 1.85, id: 'tents' },
      { prop: 'tent', x: 344, y: 150, s: 1.6, id: 'tents' },
      { prop: 'cupFlag', x: 140, y: 150, s: 1.1, id: 'flag' },
      { prop: 'grill', x: 318, y: 150, s: 1.5 },
      { prop: 'campfire', x: 214, y: 152, s: 1.0, id: 'fire' },
      { prop: 'orcSeated', x: 280, y: 150, s: 1.5, flip: true, id: 'orc' },
      you(106, 166, 1.6),
    ],
    focus: [['flag', 'tents'], ['orc']],
  },
  a2_frag2: {
    bg: 'library', light: [196, 118],
    items: [
      { prop: 'bookPile', x: 92, y: 150, s: 1.7, layer: 1 }, { prop: 'bookPile', x: 318, y: 150, s: 1.45, layer: 1 },
      { prop: 'ward', x: 196, y: 126, id: 'ward', rim: null },
      { prop: 'stoneTable', x: 196, y: 150, s: 1.25 },
      { prop: 'diary', x: 196, y: 120, s: 2.3, id: 'diary', rim: null },
      { prop: 'necromancer', x: 356, y: 152, s: 1.6, flip: true, id: 'necromancer', layer: 1 },
      you(120, 166, 1.6),
    ],
    focus: [['ward', 'diary'], ['diary'], ['diary']],
  },
  a2_frag2_win: {
    bg: 'library', light: [204, 130],
    items: [
      { prop: 'bookPile', x: 86, y: 150, s: 1.6, layer: 1 }, { prop: 'bookPile', x: 326, y: 150, s: 1.5, layer: 1 },
      { prop: 'stoneTable', x: 140, y: 150, s: 1.1 },
      { prop: 'necromancerKneel', x: 256, y: 152, s: 1.9, flip: true, id: 'necromancer' },
      { prop: 'diary', x: 200, y: 152, s: 2.3, id: 'diary', rim: null },
      you(104, 166, 1.6),
    ],
    focus: [['necromancer'], ['diary'], ['diary']],
  },
  a2_camp2: {
    bg: 'camp', light: [200, 132],
    items: [
      { prop: 'rock', x: 118, y: 150, s: 1.4 },
      { prop: 'campfire', x: 196, y: 152, s: 1.1, id: 'fire' },
      { prop: 'flamegranny', x: 268, y: 138, s: 1.42, flip: true, id: 'flamegranny', rim: null, op: 0.82 },
      you(126, 154, 1.44),
    ],
    focus: [['flamegranny'], ['flamegranny'], ['flamegranny']],
  },
  a2_heart_maze: {
    bg: 'maze', light: [200, 70],
    items: [
      { prop: 'nameWall', x: 200, y: 150, id: 'names', rim: null },
      { prop: 'newName', x: 262, y: 76, s: 1.3, id: 'newname', rim: null },
      you(138, 166, 1.62),
    ],
    focus: [['names'], ['names'], ['newname']],
  },
  a2_boss_minotaur: {
    bg: 'hall', light: [104, 100],
    items: [
      { prop: 'minotaur', x: 270, y: 154, s: 0.96, flip: true, id: 'minotaur' },
      you(98, 166, 1.6),
    ],
    focus: [['minotaur'], ['minotaur'], ['minotaur']],
  },
  a2_end_heart: {
    bg: 'maze', light: [120, 140],
    items: [
      { prop: 'spiralStairs', x: 112, y: 150, s: 0.92, layer: 1, id: 'stairs' },
      { prop: 'minotaurKneel', x: 268, y: 154, s: 0.92, flip: true, id: 'minotaur' },
      you(196, 168, 1.5),
    ],
    focus: [['minotaur'], ['minotaur'], ['stairs']],
  },

  // ─── 第三幕:烬王殿 ───
  a3_throne_gate: {
    bg: 'throne', light: [200, 80],
    items: [
      { prop: 'whisperGate', x: 200, y: 150, s: 0.95, id: 'door' },
      you(200, 168, 1.9),
    ],
    focus: [['door'], ['door'], ['player']],
  },
  a3_frag3: {
    bg: 'throne', light: [236, 96],
    items: [
      { prop: 'wallCrack', x: 236, y: 150, id: 'crack' },
      { prop: 'letters', x: 200, y: 106, s: 2.4, id: 'letters', rim: null },
      you(118, 168, 1.68),
    ],
    focus: [['crack'], ['letters'], ['letters']],
  },
  a3_whisper: {
    bg: 'throne', light: [236, 80],
    items: [
      { prop: 'wisp', x: 238, y: 116, s: 2.4, id: 'wisp', rim: null },
      you(126, 168, 1.68),
    ],
    focus: [['wisp'], ['wisp'], ['wisp'], ['wisp']],
  },
  a3_tendril_ambush: {
    bg: 'throne', light: [200, 140],
    items: [
      { prop: 'floorTiles', x: 200, y: 150, id: 'floor', rim: null },
      { prop: 'fallenColumn', x: 150, y: 150, layer: 1 },
      { prop: 'tendrils', x: 256, y: 152, s: 1.3, id: 'tendrils' },
      you(142, 137, 1.55),
    ],
    focus: [['floor'], ['tendrils']],
  },
  a3_stall: {
    bg: 'hall', light: [290, 118],
    items: [
      { prop: 'merchantBlind', x: 164, y: 150, s: 1.95, flip: true, id: 'merchant' },
      { prop: 'stall', x: 236, y: 152, s: 1.95, id: 'stall' },
      you(84, 168, 1.62),
    ],
    focus: [['stall'], ['merchant']],
  },
  a3_lastcamp: {
    bg: 'throne', light: [190, 130],
    items: [
      { prop: 'campfire', x: 188, y: 152, s: 1.1, id: 'fire' },
      { prop: 'flamegranny', x: 262, y: 138, s: 1.5, flip: true, id: 'flamegranny', rim: null, op: 0.62 },
      { prop: 'thimble', x: 226, y: 120, s: 2.0, id: 'thimble', rim: null },
      you(120, 154, 1.5),
    ],
    focus: [['flamegranny'], ['thimble'], ['flamegranny'], ['flamegranny']],
  },
  a3_boss_king: {
    bg: 'throne', light: [200, 90],
    items: [
      { prop: 'throne', x: 262, y: 152, s: 0.92, layer: 1 },
      { prop: 'retinue', x: 300, y: 142, s: 0.95, layer: 0, rim: null, id: 'retinue' },
      { prop: 'king', x: 268, y: 154, s: 1.75, flip: true, id: 'king' },
      you(92, 168, 1.68),
    ],
    focus: [['king'], ['retinue'], ['king'], ['king']],
  },
  a3_final_choice: {
    bg: 'throne', light: [200, 70],
    items: [
      { prop: 'throne', x: 272, y: 152, s: 0.92, layer: 1 },
      { prop: 'wisp', x: 190, y: 72, s: 1.7, id: 'calamity', rim: null },
      { prop: 'kingKneel', x: 254, y: 154, s: 1.75, flip: true, id: 'king' },
      you(98, 170, 1.7),
    ],
    focus: [['king'], ['king'], ['calamity'], ['player'], ['king']],
  },
}

// ══════════════════════ 战斗 ══════════════════════
// 你在左、怪在右;脚离画布底约 24,底下那条留给怪物名与血条。
const YOU: Item = { prop: 'player', x: 112, y: 146, s: 1.7, fig: 'player', id: 'player' }
const foe = (prop: PropId, s: number, x = 288, y = 146): Item => ({ prop, x, y, s, flip: true, fig: 'monster', id: 'monster' })

export const COMBAT_ART: Record<string, ArtSpec> = {
  goblin: { bg: 'corridor', light: [64, 86], items: [{ prop: 'torch', x: 62, y: 90, s: 1.1, layer: 0 }, { prop: 'rock', x: 296, y: 148, s: 2.4, layer: 1 }, foe('goblin', 2.3, 284), YOU] },
  gargoyle: { bg: 'gate', light: [200, 100], items: [{ prop: 'greatGate', x: 200, y: 146, s: 0.92 }, { prop: 'stairs', x: 200, y: 170 }, foe('gargoyle', 2.0, 288, 124), YOU] },
  giant_spider: { bg: 'cavern', light: [130, 140], items: [{ prop: 'web', x: 0, y: 170, rim: null, layer: 1 }, foe('spider', 1.65, 292, 92), YOU] },
  skeleton: { bg: 'corridor', light: [200, 126], items: [{ prop: 'rubble', x: 300, y: 148, s: 1.6, layer: 1 }, foe('skeleton', 2.0, 280), YOU] },
  ghoul: { bg: 'corridor', light: [110, 90], items: [{ prop: 'torch', x: 60, y: 88, s: 1.1, layer: 0 }, foe('ghoul', 2.0, 288), { prop: 'ghoul', x: 338, y: 140, s: 1.5, layer: 1 }, YOU] },
  mimic: { bg: 'cavern', light: [212, 130], items: [{ prop: 'rock', x: 330, y: 146, s: 1.8, layer: 1 }, { prop: 'mimicOpen', x: 288, y: 148, s: 2.3, fig: 'monster', id: 'monster' }, YOU] },
  shadow: { bg: 'corridor', light: [112, 92], items: [{ prop: 'torch', x: 62, y: 88, s: 1.2, layer: 0 }, { prop: 'shadows', x: 292, y: 146, s: 1.9, rim: null, fig: 'monster', id: 'monster' }, YOU] },
  orc: { bg: 'cellar', light: [214, 130], items: [{ prop: 'tent', x: 70, y: 148, s: 1.7, layer: 1 }, { prop: 'cupFlag', x: 338, y: 146, s: 1.0, layer: 1 }, { prop: 'campfire', x: 196, y: 150, s: 0.9 }, foe('orc', 1.45, 286), YOU] },
  necromancer: { bg: 'library', light: [288, 60], items: [{ prop: 'stoneTable', x: 200, y: 146, s: 1.1, layer: 1 }, { prop: 'ward', x: 200, y: 122, rim: null, layer: 1 }, foe('necromancer', 1.8, 288), YOU] },
  minotaur: { bg: 'hall', light: [104, 100], items: [foe('minotaur', 0.98, 284, 150), YOU] },
  tendril: { bg: 'throne', light: [200, 140], items: [{ prop: 'floorTiles', x: 200, y: 150, rim: null }, { prop: 'fallenColumn', x: 130, y: 146, layer: 1 }, { prop: 'tendrils', x: 290, y: 148, s: 1.35, flip: true, fig: 'monster', id: 'monster' }, YOU] },
  emberking: { bg: 'throne', light: [200, 90], items: [{ prop: 'throne', x: 268, y: 150, s: 0.9, layer: 1 }, { prop: 'retinue', x: 300, y: 140, s: 0.92, layer: 0, rim: null }, foe('king', 1.7, 284, 150), YOU] },
  emberbat: { bg: 'cavern', light: [130, 140], items: [{ prop: 'emberbat', x: 286, y: 152, s: 1.5, fig: 'monster', id: 'monster' }, YOU] },
  ashKnight: { bg: 'throne', light: [104, 96], items: [{ prop: 'fallenColumn', x: 330, y: 146, s: 0.9, layer: 1, flip: true }, foe('ashKnight', 1.75, 288), YOU] },
}

/**
 * 图片覆盖口:想用现成图片替换某个场景/战斗的插画时,在这里登记一行即可,例如
 *   import tavernPng from './img/a1_open.png'
 *   export const IMAGE_OVERRIDES: Record<string, string> = { a1_open: tavernPng }
 * 画面区的段落聚焦只对代码插画生效,换成图片后该场景不再聚焦。
 */
export const IMAGE_OVERRIDES: Record<string, string> = {}

/** 结局插画:结局页顶部 */
export const ENDING_ART: Record<string, ArtSpec> = {
  end_slay: {
    bg: 'tavern', light: [200, 120],
    items: [
      { prop: 'window', x: 322, y: 100, layer: 0 },
      { prop: 'fireplace', x: 78, y: 150, s: 0.98 },
      { prop: 'granny', x: 208, y: 150, s: 1.22, flip: true },
      { prop: 'barcounter', x: 246, y: 150, s: 1.1 },
      you(300, 164, 1.5, true),
    ],
  },
  end_return: {
    bg: 'camp', light: [268, 100],
    items: [
      { prop: 'inn', x: 216, y: 150, s: 1.16 },
      { prop: 'sparkFall', x: 216 + 41 * 1.16, y: 150 - 104 * 1.16, rim: null },
      { prop: 'granny', x: 372, y: 158, s: 1.5, flip: true },
    ],
  },
  end_fall: {
    bg: 'tavern', light: [300, 90],
    items: [
      { prop: 'fireplace', x: 46, y: 150, s: 0.9, layer: 1 },
      { prop: 'portrait', x: 150, y: 96, s: 1.2, rim: null, op: 0.55 },
      { prop: 'portrait', x: 240, y: 94, s: 1.7 },
      you(330, 168, 1.7),
    ],
  },
  end_death: {
    bg: 'maze', light: [200, 80],
    items: [
      { prop: 'nameWall', x: 200, y: 150, rim: null },
      { prop: 'newName', x: 244, y: 100, s: 1.5, rim: null },
    ],
  },
}
