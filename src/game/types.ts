// ─── 《骰运迷城》核心类型 ───────────────────────────────────────────
// 全部可序列化结构保持 JSON 兼容（存档直接 structuredClone + JSON.stringify）。

export type AttrKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface Attrs {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export const ATTR_NAMES: Record<AttrKey, string> = {
  str: '力量',
  dex: '敏捷',
  con: '体质',
  int: '智力',
  wis: '感知',
  cha: '魅力',
}

// 技能 → 属性映射（12 技能，5e 风格）
export type SkillKey =
  | 'athletics' | 'sleight' | 'stealth'
  | 'arcana' | 'religion' | 'medicine'
  | 'insight' | 'persuasion' | 'intimidation'
  | 'investigation' | 'perception' | 'survival'

export const SKILL_NAMES: Record<SkillKey, string> = {
  athletics: '运动',
  sleight: '巧手',
  stealth: '隐匿',
  arcana: '奥秘',
  religion: '宗教',
  medicine: '医药',
  insight: '洞悉',
  persuasion: '游说',
  intimidation: '威吓',
  investigation: '调查',
  perception: '察觉',
  survival: '生存',
}

export const SKILL_ATTR: Record<SkillKey, AttrKey> = {
  athletics: 'str',
  sleight: 'dex',
  stealth: 'dex',
  arcana: 'int',
  religion: 'wis',
  medicine: 'wis',
  insight: 'wis',
  persuasion: 'cha',
  intimidation: 'cha',
  investigation: 'int',
  perception: 'wis',
  survival: 'wis',
}

export type DamageType =
  | 'slash' | 'pierce' | 'blunt' | 'fire' | 'radiant' | 'necrotic' | 'magic'

export const DAMAGE_NAMES: Record<DamageType, string> = {
  slash: '挥砍',
  pierce: '穿刺',
  blunt: '钝击',
  fire: '火焰',
  radiant: '光耀',
  necrotic: '死灵',
  magic: '魔法',
}

export type Material = 'normal' | 'silver' | 'magic'

export type ClassId = 'fighter' | 'mage' | 'rogue' | 'cleric' | 'bard' | 'paladin'

export interface ClassDef {
  id: ClassId
  name: string
  emoji: string
  tagline: string
  desc: string
  hitDie: number // 升级时的 HP 骰面
  attackAttr: AttrKey
  baseWeapon: string   // items.ts 中的 id
  baseArmor: string
  profSkills: SkillKey[]
  // 职业标志性资源（短休回复）
  resourceName: string       // 如「法术位」
  resourceMax: number
  resourceAbility: CombatAbilityId // 消耗资源的主动技能
  unlockHint?: string        // 隐藏职业解锁说明
  hidden?: boolean
}

// ─── 战斗技能 ───────────────────────────────────────────────────────
export type CombatAbilityId =
  | 'attack'          // 普通攻击
  | 'second_wind'     // 战士：二次风（自愈 1d10+等级）
  | 'spell_bolt'      // 法师：烬火矢（2d6 火焰，耗法术位）
  | 'sneak_strike'    // 游荡者：偷袭（武器骰+1d6，需灵巧动作? 简化：耗灵巧点）
  | 'channel_heal'    // 牧师：引导神力（治疗 1d8+感知，耗神力）
  | 'bardic_dice'     // 吟游诗人：激励骰（+1d6 于下次攻击/检定，耗激励）
  | 'divine_smite'    // 圣武士：神圣打击（+2d8 光耀，耗誓约）
  | 'use_item'        // 道具
  | 'flee'            // 逃跑

export interface CombatAbilityDef {
  id: CombatAbilityId
  name: string
  desc: string
  costsResource: number  // 消耗职业资源点数；0 = 不消耗
  requiresResource: boolean
}

// ─── 物品 ───────────────────────────────────────────────────────────
export interface ItemDef {
  id: string
  name: string
  emoji: string
  desc: string
  price: number
  kind: 'weapon' | 'armor' | 'trinket' | 'consumable'
  // 武器
  damageDice?: string          // '1d8'
  damageType?: DamageType
  attackAttr?: AttrKey
  material?: Material
  // 护甲
  acBonus?: number
  // 饰品/消耗品效果（引擎解释）
  effect?: ItemEffect
}

export type ItemEffect =
  | { t: 'heal'; dice: string; bonus?: number }
  | { t: 'inspiration' }                       // 获得 1 灵感
  | { t: 'cleanse' }                           // 清除「低语」状态
  | { t: 'fire_bomb' }                         // 投掷火油瓶 2d6 火焰
  | { t: 'ac_up'; value: number }              // 永久 +AC（饰品佩戴时）
  | { t: 'resource_up'; value: number }        // 永久 +职业资源上限（饰品佩戴时）

// ─── 怪物 ───────────────────────────────────────────────────────────
export interface LegendaryAction {
  name: string
  desc: string
  damageDice: string
  damageType: DamageType
}

export interface LairAction {
  name: string
  desc: string
  everyNRounds: number
  saveSkill: SkillKey   // 豁免用属性检定
  dc: number
  damageDice: string
  damageType: DamageType
}

export interface MonsterDef {
  id: string
  name: string
  emoji: string
  desc: string
  act: 1 | 2 | 3
  hp: number
  ac: number
  attackBonus: number
  damageDice: string
  damageType: DamageType
  specialChance?: number         // 0~1 特殊攻击概率
  special?: { name: string; desc: string; damageDice: string; damageType: DamageType }
  vulnerabilities?: DamageType[] // 易伤 ×2
  resistances?: DamageType[]     // 抗性 ×½
  requiresMagicToHit?: boolean   // 非银/非魔法武器伤害减半
  quotes?: string[]              // 战斗台词
  legendary?: LegendaryAction
  lair?: LairAction
  xp: number
  gold: [number, number]
  introText: string
}

// ─── 场景图 ─────────────────────────────────────────────────────────
export type Thread = 'main' | 'fragment' | 'granny' | 'banjo' | 'side'

export type OutcomeEffect =
  | { t: 'hp'; v: number }                 // 正负皆可
  | { t: 'gold'; v: number }
  | { t: 'item'; id: string; count?: number }
  | { t: 'loseItem'; id: string }
  | { t: 'forgetItem' }                    // 烬疫：随机遗忘（卸下）一件装备栏物品
  | { t: 'flag'; id: string; v?: boolean }
  | { t: 'fragment' }                      // 获得英雄残章
  | { t: 'inspiration' }
  | { t: 'companion' }                     // 招募班卓
  | { t: 'xp'; v: number }
  | { t: 'heal_full' }
  | { t: 'heal_pct'; v: number }             // 回复最大生命的百分比
  | { t: 'short_rest' }                    // 恢复职业资源（效果结算时）
  | { t: 'toast'; v: string }

export type GotoTarget =
  | { to: string }                         // 下一场景 id
  | { act: 'next' }                        // 结束当前幕（长休 + 幕间演出）
  | { combat: string; onWin: string; onLose?: string }
  | { shop: string }                       // 商店 id
  | { ending: EndingId }

export interface SceneOutcome {
  text: string                // DM 旁白（支持 **高亮** 标记）
  fx?: 'gold' | 'heal' | 'hurt' | 'fragment' | 'ember'
  effects?: OutcomeEffect[]
  goto: GotoTarget
}

export interface SceneChoice {
  id: string
  text: string
  hint?: string                         // 附加说明（如「消耗：金币×20」）
  check?: { skill: SkillKey; dc: number }  // 选择后触发检定
  advantage?: boolean                    // 本检定带优势（如同伴协助）
  requireFlag?: string                   // 需要 flag 为 true
  requireItem?: string                   // 需要持有物品（消耗品）
  requireFragment?: number               // 需要残章数
  requireCompanion?: boolean
  requireClass?: ClassId
  requireGold?: number
  hideLocked?: boolean                   // 不满足条件时隐藏（默认禁用显示）
  grantsInspiration?: boolean            // 勇敢/性格选择 → 灵感
  cost?: { gold?: number }
  // 无检定：直接 outcome；有检定：success / failure
  outcome?: SceneOutcome
  success?: SceneOutcome
  failure?: SceneOutcome
}

export type SceneBg =
  | 'tavern' | 'gate' | 'corridor' | 'cavern' | 'shrine' | 'library'
  | 'market' | 'camp' | 'throne' | 'maze'

export interface SceneNode {
  id: string
  act: 1 | 2 | 3
  thread: Thread
  fixed: boolean          // true = 幕内固定锚点；false = 随机池
  title?: string
  text: string[]          // 多段旁白
  choices: SceneChoice[]
  bg?: SceneBg
  onEnterEffects?: OutcomeEffect[]
}

export interface ShopDef {
  id: string
  name: string
  keeper: string
  greeting: string
  items: string[]         // ItemDef ids
  next: string            // 离开后场景
}

// ─── 结局 ───────────────────────────────────────────────────────────
export type EndingId = 'end_slay' | 'end_return' | 'end_fall' | 'end_death'

export interface EndingDef {
  id: EndingId
  name: string
  trueEnding?: boolean
  lines: string[]         // 结局长镜头文本
}

// ─── 运行时状态（全部可序列化） ─────────────────────────────────────
export interface InventoryEntry {
  itemId: string
  count: number
}

export interface PlayerState {
  name: string
  classId: ClassId
  attrs: Attrs
  level: number
  xp: number
  hp: number
  maxHp: number
  baseAc: number
  gold: number
  weaponId: string
  armorId: string
  trinketIds: string[]
  inventory: InventoryEntry[]
  resource: number
  maxResource: number
  inspiration: number
  feats: string[]
  flags: Record<string, boolean>
  fragments: number
  companionBanjo: boolean
  forgottenNames: string[]   // 被烬疫烧毁的记忆（墓志铭/结局引用）
}

export interface DeathSaveState {
  successes: number
  failures: number
}

export interface CombatState {
  monsterId: string
  monsterHp: number
  monsterMaxHp: number
  round: number
  playerTurn: boolean
  deathSaves: DeathSaveState | null
  pendingFlee: boolean
  onWin: string
  onLose: string
  banjoUsedThisCombat: boolean
}

export interface RunState {
  player: PlayerState
  act: 1 | 2 | 3
  sceneQueue: string[]        // 本幕剩余场景（随机池已展开）
  currentSceneId: string
  visited: string[]
  kills: number
  rolls: number
  nat20: number
  nat1: number
  combat: CombatState | null
  startedAt: number
  lastRecap: string           // 「上回说到」复述文本
  pendingFeatChoices?: string[]  // 升级后待选专长
  pendingEquipId?: string        // 待定装备决策
  bardicActive?: boolean         // 吟游诗人激励骰生效中（本场战斗）
}

export type ScreenId =
  | 'title' | 'chargen' | 'scene' | 'combat' | 'ending' | 'score' | 'leaderboard' | 'codex'

// ─── 结算 ───────────────────────────────────────────────────────────
export interface ScoreBreakdown {
  chapters: number
  kills: number
  hpLeft: number
  fragments: number
  trueEnding: number
  gold: number
  achievements: number
  total: number
}

export type LuckGrade = 'S' | 'A' | 'B' | 'C'

// ─── 持久化（跨局，本地 storage） ───────────────────────────────────
export interface MetaState {
  emberMarks: number                 // 烬痕（解锁货币）
  unlockedClasses: ClassId[]
  endings: EndingId[]
  epitaphs: string[]                 // 墓志铭图鉴
  bestScore: number
  runsPlayed: number
  soundOn: boolean
  fontScale: 0 | 1 | 2               // 字号三档
}
