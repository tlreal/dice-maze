// ─── 怪物图鉴 ───────────────────────────────────────────────────────
import type { MonsterDef } from '../game/types'

export const MONSTERS: Record<string, MonsterDef> = {
  goblin: {
    id: 'goblin', name: '哥布林哨兵', emoji: '👺', act: 1,
    desc: '迷城门口的看门小鬼，兵器比它本人还长。',
    hp: 9, ac: 12, attackBonus: 3, damageDice: '1d6+1', damageType: 'pierce',
    quotes: ['「吱——有活的！有活的！」', '「金币！金币是我的！」'],
    xp: 2, gold: [3, 8],
    introText: '岩石后蹿出一团绿影——哥布林哨兵举着锈钉长矛，尖笑着堵住去路。',
  },
  gargoyle: {
    id: 'gargoyle', name: '石像鬼', emoji: '🗿', act: 1,
    desc: '门楣上的守卫。你数到第三遍时它眨了眼。',
    hp: 14, ac: 14, attackBonus: 4, damageDice: '1d6+2', damageType: 'slash',
    quotes: ['「……回答。错误。」', '石头摩擦声碾过你的骨髓。'],
    xp: 3, gold: [5, 10],
    introText: '门楣上的石雕骤然张开砂砾般的翅膀——石像鬼俯冲而下！',
  },
  giant_spider: {
    id: 'giant_spider', name: '洞穴巨蛛', emoji: '🕷️', act: 1,
    desc: '第一层的女主人。她的网织了一百年，等的就是你。',
    hp: 22, ac: 13, attackBonus: 4, damageDice: '1d8+2', damageType: 'pierce',
    specialChance: 0.3,
    special: { name: '束缚之网', desc: '粘稠的蛛网罩住你，你下一击更难命中', damageDice: '1d6+1', damageType: 'pierce' },
    quotes: ['「我的网里……还差一个……会挣扎的。」', '她八只眼睛同时眨了一下。'],
    xp: 5, gold: [15, 25],
    introText: '整面墙的蛛网同时颤动。一只比马还大的洞穴巨蛛从穹顶垂落，腹部毒腺泛着幽绿的光。',
  },
  skeleton: {
    id: 'skeleton', name: '骷髅兵', emoji: '💀', act: 2,
    desc: '百年前的应召者。骨头还保持着持剑的姿势。',
    hp: 12, ac: 13, attackBonus: 4, damageDice: '1d6+2', damageType: 'slash',
    vulnerabilities: ['blunt'],
    quotes: ['「……回家……让我……回家……」'],
    xp: 2, gold: [2, 6],
    introText: '瓦砾堆里立起一具骷髅，锈剑指向你——那是百年前没能走出去的冒险者。',
  },
  ghoul: {
    id: 'ghoul', name: '食尸鬼', emoji: '🧟', act: 2,
    desc: '在二层游荡的食腐者，闻得到活人的暖意。',
    hp: 16, ac: 12, attackBonus: 4, damageDice: '1d8+2', damageType: 'slash',
    specialChance: 0.25,
    special: { name: '腐尸之爪', desc: '带着尸毒的爪痕让你头晕目眩', damageDice: '1d6+2', damageType: 'necrotic' },
    xp: 3, gold: [4, 10],
    introText: '坟墓味的阴影贴着墙皮扑来——食尸鬼张开了满口烂牙。',
  },
  mimic: {
    id: 'mimic', name: '宝箱怪', emoji: '🧰', act: 2,
    desc: '它不是宝箱。宝箱不会长牙。',
    hp: 20, ac: 12, attackBonus: 5, damageDice: '1d8+3', damageType: 'blunt',
    quotes: ['箱盖咧成一排獠牙的笑。', '「咕噜。」它吞下了你刚放进嘴边的金币。'],
    xp: 4, gold: [20, 40],
    introText: '你的手刚碰到锁扣，整只箱子「咔」地咬了过来——是宝箱怪！',
  },
  shadow: {
    id: 'shadow', name: '暗影', emoji: '🌫️', act: 2,
    desc: '从记忆的裂缝里漏出来的东西。凡铁穿不过它。',
    hp: 14, ac: 13, attackBonus: 5, damageDice: '1d6+3', damageType: 'necrotic',
    requiresMagicToHit: true,
    quotes: ['「把……名字……留下……」'],
    xp: 3, gold: [0, 0],
    introText: '火炬的光够不到的角落，一团人形的黑暗慢慢立起——暗影。你的铁剑开始变凉。',
  },
  orc: {
    id: 'orc', name: '兽人督军', emoji: '👹', act: 2,
    desc: '占据了第二层的佣兵头子，为烬王卖命换酒喝。',
    hp: 24, ac: 14, attackBonus: 5, damageDice: '1d10+3', damageType: 'slash',
    quotes: ['「百年才等来一个对手，别让我失望太快！」'],
    xp: 5, gold: [15, 30],
    introText: '营火边轰然站起一座铁塔——兽人督军抡起双手巨斧，笑着舔了舔獠牙。',
  },
  necromancer: {
    id: 'necromancer', name: '死灵法师', emoji: '🧙', act: 2,
    desc: '守着焚烧图书馆的学者。他说他只是「替烬王整理记忆」。',
    hp: 18, ac: 12, attackBonus: 5, damageDice: '2d6', damageType: 'necrotic',
    resistances: ['necrotic'],
    quotes: ['「记忆是燃料，孩子。烧掉别人的一百年的那一位……才是最痛的。」', '「我也读过他的日记。读完之后我就再没上去过。」'],
    xp: 7, gold: [25, 45],
    introText: '焚烧的图书馆中央，一位死灵法师从书页的灰烬里抬起头，指尖缠着幽紫的雾。',
  },
  minotaur: {
    id: 'minotaur', name: '牛头怪', emoji: '🐂', act: 2,
    desc: '迷宫之心的看守。它记不清守了多少年，但记得每一条路。',
    hp: 26, ac: 13, attackBonus: 5, damageDice: '1d10+3', damageType: 'pierce',
    quotes: ['「走到这里的人……都成了墙上的名字。」', '大地的震动随着它的冲锋逼近。'],
    xp: 8, gold: [30, 50],
    introText: '迷宫之心的甬道猛地拓宽——一头三层楼高的牛头怪拖着一柄门板般的巨斧，喘出白汽转身。',
  },
  tendril: {
    id: 'tendril', name: '烬疫触须', emoji: '🪸', act: 3,
    desc: '从王座殿地砖下钻出的灼热藤蔓。',
    hp: 16, ac: 13, attackBonus: 5, damageDice: '1d8+3', damageType: 'fire',
    resistances: ['fire'],
    xp: 3, gold: [0, 0],
    introText: '地砖裂开，数条烧红的触须破土而出，抽打着空气里的记忆尘埃。',
  },
  emberking: {
    id: 'emberking', name: '烬王', emoji: '👑', act: 3,
    desc: '传说吞下灾厄的存在。没有人告诉过你，他的铠甲上刻着一个英雄的名字。',
    hp: 55, ac: 14, attackBonus: 6, damageDice: '2d6+3', damageType: 'fire',
    resistances: ['fire'],
    legendary: {
      name: '余烬鞭击',
      desc: '王座后的灰烬凝成长鞭，在回合末尾抽向你',
      damageDice: '1d6+2', damageType: 'fire',
    },
    lair: {
      name: '烬浪',
      desc: '整座大殿的地火每隔三轮齐齐喷发，你必须敏捷豁免',
      everyNRounds: 3, saveSkill: 'athletics', dc: 13, damageDice: '2d6', damageType: 'fire',
    },
    quotes: [
      '「又来了一个……记不住教训的。」',
      '「你们上来，烧掉一段记忆，以为那就是代价。」他的声音像烧穿的木头，「我烧掉的是全部。」',
      '「打赢我，然后呢？回镇上喝酒，等一百年后它再醒？」',
    ],
    xp: 20, gold: [60, 100],
    introText: '灰烬的王座上，「烬王」缓缓起身。铠甲的缝隙里没有血肉，只有缓缓流动的火星——和一枚你依稀眼熟的军徽。',
  },
}

export function monsterDef(id: string): MonsterDef {
  const m = MONSTERS[id]
  if (!m) throw new Error(`未知怪物: ${id}`)
  return m
}
