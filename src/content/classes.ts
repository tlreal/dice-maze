// ─── 职业、战斗技能与专长 ───────────────────────────────────────────
import type { ClassDef, CombatAbilityDef, CombatAbilityId, SkillKey } from '../game/types'

export const COMBAT_ABILITIES: Record<CombatAbilityId, CombatAbilityDef> = {
  attack: { id: 'attack', name: '攻击', desc: '掷 d20 + 属性加值 + 熟练加值，命中造成武器伤害', costsResource: 0, requiresResource: false },
  second_wind: { id: 'second_wind', name: '二次风', desc: '深吸一口气，回复 1d10 + 等级 生命', costsResource: 1, requiresResource: true },
  spell_bolt: { id: 'spell_bolt', name: '烬火矢', desc: '凝聚一簇蓝白色的火焰，造成 2d6 火焰伤害', costsResource: 1, requiresResource: true },
  sneak_strike: { id: 'sneak_strike', name: '偷袭', desc: '武器伤害 + 1d6，必中要害的快刀', costsResource: 1, requiresResource: true },
  channel_heal: { id: 'channel_heal', name: '引导神力', desc: '圣光涌起，回复 1d8 + 感知加值 生命', costsResource: 1, requiresResource: true },
  bardic_dice: { id: 'bardic_dice', name: '激励骰', desc: '班卓式的吆喝！你接下来的攻击与检定 +1d6（本场战斗）', costsResource: 1, requiresResource: true },
  divine_smite: { id: 'divine_smite', name: '神圣打击', desc: '誓约燃烧：武器伤害 + 2d8 光耀伤害', costsResource: 1, requiresResource: true },
  use_item: { id: 'use_item', name: '道具', desc: '使用背包里的药水与投掷物', costsResource: 0, requiresResource: false },
  flee: { id: 'flee', name: '逃跑', desc: '敏捷检定 DC 12，成功则脱离战斗', costsResource: 0, requiresResource: false },
}

export const CLASSES: Record<string, ClassDef> = {
  fighter: {
    id: 'fighter',
    name: '战士',
    emoji: '⚔️',
    tagline: '钢铁即答案',
    desc: '血线最厚，锤炼过千百次的长剑从不说谎。标志性资源「战气」：消耗一点即可发动二次风，在濒死边缘把自己拉回来。',
    hitDie: 10,
    attackAttr: 'str',
    baseWeapon: 'longsword',
    baseArmor: 'chain',
    profSkills: ['athletics', 'intimidation'],
    resourceName: '战气',
    resourceMax: 2,
    resourceAbility: 'second_wind',
  },
  mage: {
    id: 'mage',
    name: '法师',
    emoji: '🔮',
    tagline: '知识即武器',
    desc: '体格羸弱，但读过迷城地砖上的每一个古老音节。标志性资源「法术位」：消耗一点释放烬火矢，也常能看穿别人看不见的东西。',
    hitDie: 8,
    attackAttr: 'int',
    baseWeapon: 'staff',
    baseArmor: 'robe',
    profSkills: ['arcana', 'investigation'],
    resourceName: '法术位',
    resourceMax: 4,
    resourceAbility: 'spell_bolt',
  },
  rogue: {
    id: 'rogue',
    name: '游荡者',
    emoji: '🗡️',
    tagline: '锁与规矩都是建议',
    desc: '习惯走别人不走的路。标志性资源「灵巧」：消耗一点发动偷袭，短刃补上致命的 1d6；锁匠、耳目、影子里的人。',
    hitDie: 8,
    attackAttr: 'dex',
    baseWeapon: 'shortsword',
    baseArmor: 'leather',
    profSkills: ['stealth', 'sleight', 'perception'],
    resourceName: '灵巧',
    resourceMax: 2,
    resourceAbility: 'sneak_strike',
  },
  cleric: {
    id: 'cleric',
    name: '牧师',
    emoji: '✨',
    tagline: '光在深处也不熄',
    desc: '神明在烬疫之地沉默了百年，你仍握着圣徽。标志性资源「神力」：消耗一点引导治疗；对亡灵与低语有天然的抵抗力。',
    hitDie: 8,
    attackAttr: 'wis',
    baseWeapon: 'mace',
    baseArmor: 'leather',
    profSkills: ['religion', 'medicine', 'insight'],
    resourceName: '神力',
    resourceMax: 2,
    resourceAbility: 'channel_heal',
  },
  bard: {
    id: 'bard',
    name: '吟游诗人',
    emoji: '🎻',
    tagline: '歌谣比剑活得久',
    desc: '班卓的继承者。标志性资源「激励」：消耗一点为自己注入 1d6 的好运；一张嘴能说开石门，一身胆敢与魔王对赌。',
    hitDie: 8,
    attackAttr: 'dex',
    baseWeapon: 'shortsword',
    baseArmor: 'leather',
    profSkills: ['persuasion', 'investigation', 'perception'],
    resourceName: '激励',
    resourceMax: 3,
    resourceAbility: 'bardic_dice',
    hidden: true,
    unlockHint: '在冒险中与骷髅诗人班卓结下完整友谊后解锁',
  },
  paladin: {
    id: 'paladin',
    name: '圣武士',
    emoji: '🛡️',
    tagline: '誓约重于性命',
    desc: '听闻烬王的真相后立誓而来的人。标志性资源「誓约」：消耗一点发动神圣打击，光耀伤害对亡灵特效；血线与信仰同样坚硬。',
    hitDie: 10,
    attackAttr: 'str',
    baseWeapon: 'longsword',
    baseArmor: 'chain',
    profSkills: ['religion', 'intimidation', 'insight'],
    resourceName: '誓约',
    resourceMax: 2,
    resourceAbility: 'divine_smite',
    hidden: true,
    unlockHint: '达成真结局「归还」后解锁',
  },
}

export const BASE_CLASS_IDS = ['fighter', 'mage', 'rogue', 'cleric'] as const

export function classDef(id: string): ClassDef {
  const c = CLASSES[id]
  if (!c) throw new Error(`未知职业: ${id}`)
  return c
}

export function isProficient(classId: string, skill: SkillKey): boolean {
  return classDef(classId).profSkills.includes(skill)
}

// ─── 专长（升级二选一池） ───────────────────────────────────────────
export interface FeatDef {
  id: string
  name: string
  emoji: string
  desc: string
}

export const FEATS: Record<string, FeatDef> = {
  fury: { id: 'fury', name: '狂怒', emoji: '😡', desc: '你的武器伤害 +2。疼就对了。' },
  tough: { id: 'tough', name: '坚韧', emoji: '🫀', desc: '最大生命 +7，并立即回复 7 点。' },
  lucky: { id: 'lucky', name: '骰运眷顾', emoji: '🍀', desc: '每场战斗中你的第一次大失败（天然 1）会被命运宽恕一次，重骰之。' },
  echo: { id: 'echo', name: '法术回响', emoji: '🌀', desc: '职业资源上限 +2，并全部回满。' },
  swift: { id: 'swift', name: '灵巧步伐', emoji: '👟', desc: 'AC +1。打不中就等于没挨打。' },
  sage: { id: 'sage', name: '学者', emoji: '📖', desc: '所有智力与感知类检定 +2。' },
  silvertongue: { id: 'silvertongue', name: '铜嗓', emoji: '🗣️', desc: '所有魅力类检定 +2。' },
  ironstomach: { id: 'ironstomach', name: '铁胃', emoji: '🛡️', desc: '毒素与烬疫类豁免检定享有优势（2d20 取高）。' },
}
