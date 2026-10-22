// ─── 骰学与随机 ─────────────────────────────────────────────────────
// 所有随机都走这里，方便统计骰运（nat20/nat1 计数是结算评级依据）。

export interface RollResult {
  dice: number[]          // 原始骰值（优势/劣势为两个）
  value: number           // 取用值
  nat: 20 | 1 | 0         // 天然 20 / 天然 1 / 普通
  modifier: number        // 最终加值（含熟练/优势说明由调用方组织）
  total: number           // value + modifier
}

export interface RollStats {
  rolls: number
  nat20: number
  nat1: number
}

export const rollStats: RollStats = { rolls: 0, nat20: 0, nat1: 0 }

export function resetRollStats(): void {
  rollStats.rolls = 0
  rollStats.nat20 = 0
  rollStats.nat1 = 0
}

export function d(n: number): number {
  return 1 + Math.floor(Math.random() * n)
}

/** 掷骰表达式，如 '1d8+3' / '2d6' / '1d10+2'；返回 [总值, 明细] */
export function rollDice(expr: string): { total: number; detail: string } {
  const m = /^(\d+)d(\d+)([+-]\d+)?$/.exec(expr.replace(/\s+/g, ''))
  if (!m) return { total: 0, detail: expr }
  const count = Number(m[1])
  const faces = Number(m[2])
  const bonus = m[3] ? Number(m[3]) : 0
  const parts: number[] = []
  for (let i = 0; i < count; i++) parts.push(d(faces))
  const total = parts.reduce((a, b) => a + b, 0) + bonus
  return {
    total,
    detail: count > 1 ? `${expr} → [${parts.join('+')}]${bonus ? (bonus > 0 ? '+' : '') + bonus : ''}` : expr,
  }
}

/** 核心 d20 检定掷骰 */
export function rollCheck(modifier: number, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal'): RollResult {
  const raw = mode === 'normal' ? [d(20)] : [d(20), d(20)]
  rollStats.rolls += 1
  let value: number
  if (mode === 'advantage') value = Math.max(raw[0]!, raw[1]!)
  else if (mode === 'disadvantage') value = Math.min(raw[0]!, raw[1]!)
  else value = raw[0]!
  if (value === 20) rollStats.nat20 += 1
  if (value === 1) rollStats.nat1 += 1
  return {
    dice: raw,
    value,
    nat: value === 20 ? 20 : value === 1 ? 1 : 0,
    modifier,
    total: value + modifier,
  }
}

/** 洗牌（Fisher-Yates） */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
