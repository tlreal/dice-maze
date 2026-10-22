// ─── 规则引擎：骰学数学都在这里 ─────────────────────────────────────
import type {
  AttrKey, Attrs, ClassId, DamageType, LuckGrade, PlayerState, ScoreBreakdown,
  SkillKey, Material,
} from './types'
import { ATTR_NAMES, SKILL_ATTR, SKILL_NAMES } from './types'
import { classDef, isProficient, FEATS } from '../content/classes'
import { itemDef } from '../content/items'
import { d, rollCheck, shuffle, rollDice, type RollResult } from './rng'

export function attrMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function profBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4)
}

export function attrOf(p: PlayerState, key: AttrKey): number {
  return p.attrs[key]
}

export function totalAc(p: PlayerState): number {
  let ac = 10 + attrMod(p.attrs.dex)
  ac += itemDef(p.armorId).acBonus ?? 0
  for (const tid of p.trinketIds) {
    const eff = itemDef(tid).effect
    if (eff?.t === 'ac_up') ac += eff.value
  }
  if (p.feats.includes('swift')) ac += 1
  return ac
}

export function maxResource(p: PlayerState): number {
  const base = classDef(p.classId).resourceMax
  let bonus = 0
  for (const tid of p.trinketIds) {
    const eff = itemDef(tid).effect
    if (eff?.t === 'resource_up') bonus += eff.value
  }
  if (p.feats.includes('echo')) bonus += 2
  return base + bonus
}

export function weaponDamageBonus(p: PlayerState): number {
  const w = itemDef(p.weaponId)
  let bonus = attrMod(p.attrs[w.attackAttr ?? 'str'])
  if (p.feats.includes('fury')) bonus += 2
  return bonus
}

export function weaponMaterial(p: PlayerState): Material {
  return itemDef(p.weaponId).material ?? 'normal'
}

export function attackBonus(p: PlayerState): number {
  const w = itemDef(p.weaponId)
  return attrMod(p.attrs[w.attackAttr ?? 'str']) + profBonus(p.level)
}

// ─── 技能检定 ───────────────────────────────────────────────────────
export interface CheckRequest {
  skill: SkillKey
  dc: number
  advantage?: boolean
  disadvantage?: boolean
}

export interface CheckOutcome {
  request: CheckRequest
  roll: RollResult
  success: boolean
  critSuccess: boolean   // nat20
  critFail: boolean      // nat1
  label: string          // 「感知（宗教）检定 DC13」
  chance: number         // 事前成功率（%）
}

/** 事前成功率估算（含优势/劣势），用于透明展示 */
export function successChance(mod: number, dc: number, mode: 'normal' | 'advantage' | 'disadvantage'): number {
  const need = dc - mod // 需要 ≥ need 的骰值
  const pSingle = (v: number) => {
    if (v <= 1) return 1
    if (v >= 20) return 0.05 // nat20 总是成功
    return (21 - v) / 20
  }
  const ps = pSingle(need)
  if (mode === 'advantage') return Math.min(1, 1 - (1 - ps) * (1 - ps))
  if (mode === 'disadvantage') return ps * ps
  return ps
}

export function skillMod(p: PlayerState, skill: SkillKey): { mod: number; proficient: boolean } {
  const attrKey = SKILL_ATTR[skill]
  let mod = attrMod(p.attrs[attrKey])
  const proficient = isProficient(p.classId, skill)
  if (proficient) mod += profBonus(p.level)
  if (p.feats.includes('sage') && (attrKey === 'int' || attrKey === 'wis')) mod += 2
  if (p.feats.includes('silvertongue') && attrKey === 'cha') mod += 2
  return { mod, proficient }
}

export function resolveCheck(p: PlayerState, req: CheckRequest, extraAdvantage = false): CheckOutcome {
  let advantage = (req.advantage ?? false) || extraAdvantage
  const disadvantage = req.disadvantage ?? false
  if (p.flags['banjo_help'] && advantage) advantage = advantage // 班卓协助已折算在外
  const mode: 'normal' | 'advantage' | 'disadvantage' =
    advantage && !disadvantage ? 'advantage' : disadvantage && !advantage ? 'disadvantage' : 'normal'
  const { mod, proficient } = skillMod(p, req.skill)
  const chance = successChance(mod, req.dc, mode)
  const roll = rollCheck(mod, mode)
  const success = roll.nat === 20 || (roll.nat !== 1 && roll.total >= req.dc)
  return {
    request: req,
    roll,
    success,
    critSuccess: roll.nat === 20,
    critFail: roll.nat === 1,
    label: `${ATTR_NAMES[SKILL_ATTR[req.skill]]}（${SKILL_NAMES[req.skill]}）检定 DC${req.dc}${proficient ? ' · 熟练' : ''}`,
    chance: Math.round(chance * 100),
  }
}

// ─── 伤害结算（易伤/抗性/魔法武器需求） ──────────────────────────────
export interface DamageResult {
  raw: number
  applied: number
  detail: string
  multiplierNote: string
}

export function applyDamageMods(
  raw: number,
  type: DamageType,
  material: Material,
  vuln: DamageType[] = [],
  res: DamageType[] = [],
  requiresMagicToHit = false,
): DamageResult {
  let mult = 1
  let note = ''
  if (vuln.includes(type)) { mult = 2; note = '易伤！伤害翻倍' }
  else if (res.includes(type)) { mult = 0.5; note = '抗性，伤害减半' }
  if (requiresMagicToHit && material === 'normal') {
    mult *= 0.5
    note = note ? `${note}；凡铁难伤` : '凡铁难伤，伤害减半'
  }
  const applied = Math.max(1, Math.floor(raw * mult))
  return { raw, applied, detail: '', multiplierNote: note }
}

/** 武器伤害掷骰（暴击 = 骰面翻倍） */
export function rollWeaponDamage(p: PlayerState, crit: boolean, extraDice?: string): { total: number; parts: string[] } {
  const w = itemDef(p.weaponId)
  const parts: string[] = []
  let total = 0
  const roll = (expr: string, times: number) => {
    for (let i = 0; i < times; i++) {
      const r = rollDice(expr)
      total += r.total
      parts.push(r.detail)
    }
  }
  if (w.damageDice) roll(w.damageDice, crit ? 2 : 1)
  if (extraDice) roll(extraDice, crit ? 2 : 1)
  const flat = weaponDamageBonus(p)
  if (flat !== 0) { total += flat; parts.push(`${flat > 0 ? '+' : ''}${flat}`) }
  return { total, parts }
}

// ─── 升级 ───────────────────────────────────────────────────────────
export const XP_THRESHOLDS = [0, 6, 14, 24]

export function xpForLevel(level: number): number {
  return XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)] ?? Infinity
}

export function levelUpGains(p: PlayerState): number {
  const cls = classDef(p.classId)
  const conMod = attrMod(p.attrs.con)
  return Math.max(2, Math.floor(cls.hitDie / 2) + 1 + conMod)
}

/** 随机给出两个可选专长（排除已选） */
export function offerFeats(p: PlayerState, count = 2): string[] {
  const pool = Object.keys(FEATS).filter((f) => !p.feats.includes(f))
  return shuffle(pool).slice(0, count)
}

// ─── 建卡 ───────────────────────────────────────────────────────────
export function rollAbility4d6DropLowest(): number {
  const rolls = [d(6), d(6), d(6), d(6)].sort((a, b) => a - b)
  return rolls[1]! + rolls[2]! + rolls[3]!
}

export const STANDARD_ARRAY: number[] = [15, 14, 13, 12, 10, 8]

export function classPresetAttrs(classId: ClassId): Attrs {
  const presets: Record<string, Attrs> = {
    fighter: { str: 16, dex: 12, con: 15, int: 8, wis: 10, cha: 11 },
    mage: { str: 8, dex: 13, con: 12, int: 16, wis: 12, cha: 10 },
    rogue: { str: 10, dex: 16, con: 12, int: 13, wis: 12, cha: 11 },
    cleric: { str: 12, dex: 10, con: 13, int: 10, wis: 16, cha: 12 },
    bard: { str: 9, dex: 14, con: 12, int: 12, wis: 10, cha: 16 },
    paladin: { str: 15, dex: 9, con: 14, int: 8, wis: 11, cha: 16 },
  }
  return presets[classId] ?? presets.fighter!
}

export function baseHp(classId: ClassId, attrs: Attrs): number {
  const cls = classDef(classId)
  return cls.hitDie + attrMod(attrs.con) + 14
}

// ─── 死亡豁免 ───────────────────────────────────────────────────────
export interface DeathSaveOutcome {
  roll: number
  successes: number
  failures: number
  stable: boolean
  dead: boolean
}

export function rollDeathSave(p: PlayerState, s: { successes: number; failures: number }): DeathSaveOutcome {
  const raw = d(20)
  let successes = s.successes
  let failures = s.failures
  if (raw >= 10) successes += 1
  else failures += 1
  if (raw === 1) failures += 1          // 天然 1 = 两次失败
  if (raw === 20) successes += 1        // 天然 20 = 直接稳定（5e 风）
  // 牧师被动：首个失败被神的眷顾宽恕（每场战斗一次由调用方负责）
  if (p.classId === 'cleric' && failures >= 3 && !p.flags['cleric_grace_used']) {
    failures -= 1
  }
  return {
    roll: raw,
    successes,
    failures,
    stable: successes >= 3,
    dead: failures >= 3,
  }
}

// ─── 计分与骰运评级 ─────────────────────────────────────────────────
export function computeScore(
  actReached: number,
  kills: number,
  hpLeft: number,
  fragments: number,
  isTrueEnding: boolean,
  gold: number,
  feats: number,
): ScoreBreakdown {
  const chapters = Math.max(0, actReached - 1) * 300 + (actReached >= 3 ? 0 : 0)
  const killScore = kills * 25
  const hp = hpLeft * 5
  const frag = fragments * 150
  const trueEnd = isTrueEnding ? 500 : 0
  const goldScore = Math.floor(gold * 0.5)
  const achievement = feats * 50
  return {
    chapters,
    kills: killScore,
    hpLeft: hp,
    fragments: frag,
    trueEnding: trueEnd,
    gold: goldScore,
    achievements: achievement,
    total: chapters + killScore + hp + frag + trueEnd + goldScore + achievement,
  }
}

export function luckGrade(nat20: number, nat1: number, rolls: number): LuckGrade {
  if (rolls < 5) return 'B'
  const net = nat20 - nat1
  const ratio = nat20 / Math.max(1, rolls)
  if (net >= 4 && ratio >= 0.12) return 'S'
  if (net >= 1) return 'A'
  if (net >= -2) return 'B'
  return 'C'
}
