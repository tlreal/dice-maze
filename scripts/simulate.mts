// ─── 无头模拟器:随机策略自动跑局,验证引擎稳定性/结局可达/数值 ───
// 用法: npx tsx scripts/simulate.mts [runs]
import { GameEngine, type GameEvent, type InteractionInput } from '../src/game/engine'
import type { ClassId, RunState } from '../src/game/types'
import { classPresetAttrs } from '../src/game/rules'
import { itemDef } from '../src/content/items'

type Strategy = 'aggressive' | 'greedy' | 'safe' | 'story'

const CLASSES: ClassId[] = ['fighter', 'mage', 'rogue', 'cleric']

interface RunResult {
  crash: string | null
  ending: string
  act: number
  kills: number
  level: number
  fragments: number
  score: number
  scenes: number
  banjo: boolean
  killedBy: string
  hpAtEnd: number
  classId: string
}

function driveOne(classId: ClassId, strategy: Strategy): RunResult {
  const run = GameEngine.createRun(`sim`, classId, classPresetAttrs(classId))
  const engine = new GameEngine(run)
  const res: RunResult = {
    crash: null, ending: '', act: 1, kills: 0, level: 1, fragments: 0,
    score: 0, scenes: 0, banjo: false, killedBy: '', hpAtEnd: 0, classId: classId,
  }
  const pickWeighted = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!
  try {
    const it = engine.flow()
    let input: InteractionInput | undefined
    let result = it.next()
    let guard = 0
    while (!result.done && guard < 6000) {
      guard += 1
      const ev: GameEvent = result.value
      input = undefined
      switch (ev.kind) {
        case 'choices': {
          res.scenes += 1
          const avail = ev.views.filter((v) => !v.locked)
          if (avail.length === 0) throw new Error(`场景无可选项: ${run.currentSceneId}`)
          let chosen: typeof avail[number] | undefined
          if (strategy === 'story') {
            // 剧情党:优先无检定的直选(听故事/询问),其次检定
            chosen = avail.find((v) => !v.checkLabel) ?? pickWeighted(avail)
          } else if (strategy === 'greedy') {
            chosen = avail.find((v) => v.checkLabel && v.checkLabel.includes('%')) ?? pickWeighted(avail)
          } else {
            chosen = pickWeighted(avail)
          }
          input = chosen.id
          break
        }
        case 'askInspiration': {
          input = strategy === 'safe' || Math.random() < 0.6
          break
        }
        case 'levelUp': {
          input = pickWeighted(ev.feats)
          break
        }
        case 'equipPrompt': {
          input = Math.random() < 0.85 ? 'equip' : 'sell'
          break
        }
        case 'shop': {
          const shopId = ev.shopId
          const p = run.player
          const buyable = ['potion', 'hipotion', 'silverdagger', 'warhammer', 'breastplate', 'silverlongsword', 'guardcharm', 'censer', 'emberbrand']
          for (const id of buyable) {
            if (p.gold >= itemDef(id).price && engine.buyItem(shopId, id)) {
              engine.leaveShop()
              break
            }
          }
          engine.leaveShop()
          break
        }
        case 'combatLog': {
          if (ev.lines.length === 0) {
            const p = run.player
            const lowHp = p.hp / p.maxHp < (strategy === 'safe' ? 0.6 : 0.45)
            const potion = p.inventory.find((e) => itemDef(e.itemId).effect?.t === 'heal')
            if (lowHp && potion) { input = `item:${potion.itemId}`; break }
            if (p.resource > 0 && Math.random() < 0.45) { input = 'ability'; break }
            input = 'attack'
          }
          break
        }
        case 'combatStart': {
          res.killedBy = ev.monster.id
          break
        }
        case 'ending': {
          res.ending = ev.ending.id
          break
        }
        case 'gameOver': {
          const { score } = engine.finishRun()
          res.score = score.total
          break
        }
        default:
          break
      }
      result = it.next(input)
    }
    if (guard >= 6000) throw new Error('步数守卫触发(疑似死循环)')
    res.hpAtEnd = run.player.hp
    res.act = run.act
    res.kills = run.kills
    res.level = run.player.level
    res.fragments = run.player.fragments
    res.banjo = run.player.companionBanjo
    if (!res.ending) {
      // 队列耗尽但无结局 = 流程卡死
      throw new Error(`无结局终止: act=${run.act} scene=${run.currentSceneId} combat=${!!run.combat}`)
    }
  } catch (e) {
    res.crash = `${(e as Error).message} @ scene=${run.currentSceneId} combat=${run.combat?.monsterId ?? '-'}`
  }
  return res
}

// ── 真结局定向验证:强行注入残章与暗号,在终幕选择「归还」 ──
function trueEndingTest(): { ok: boolean; detail: string } {
  const run = GameEngine.createRun('seeker', 'fighter', classPresetAttrs('fighter'))
  const engine = new GameEngine(run)
  // 直接把状态推到终幕抉择前
  run.act = 3
  run.player.fragments = 3
  run.player.flags['granny_password'] = true
  run.currentSceneId = 'a3_final_choice'
  run.sceneQueue = []
  try {
    const it = engine.flow()
    let result = it.next()
    let input: InteractionInput | undefined
    let ending = ''
    while (!result.done) {
      const ev = result.value
      input = undefined
      if (ev.kind === 'choices') {
        const back = ev.views.find((v) => v.text.includes('归还'))
        if (!back) return { ok: false, detail: '终幕未见【归还】选项' }
        input = back.id
      } else if (ev.kind === 'ending') {
        ending = ev.ending.id
      }
      result = it.next(input)
    }
    const { score } = engine.finishRun()
    return ending === 'end_return' && score.trueEnding > 0
      ? { ok: true, detail: `end_return 达成,真结局加成 ${score.trueEnding},总分 ${score.total}` }
      : { ok: false, detail: `ending=${ending} trueBonus=${score.trueEnding}` }
  } catch (e) {
    return { ok: false, detail: (e as Error).message }
  }
}

// ── 主流程 ──
const N = Number(process.argv[2] ?? 300)
const strategies: Strategy[] = ['aggressive', 'greedy', 'safe', 'story']
const results: RunResult[] = []
for (let i = 0; i < N; i++) {
  const cls = CLASSES[i % CLASSES.length]!
  const st = strategies[i % strategies.length]!
  results.push(driveOne(cls, st))
}

const crashes = results.filter((r) => r.crash)
const endCount: Record<string, number> = {}
for (const r of results) if (r.ending) endCount[r.ending] = (endCount[r.ending] ?? 0) + 1
const finished = results.filter((r) => !r.crash)
const avg = (f: (r: RunResult) => number) =>
  finished.length ? (finished.reduce((a, r) => a + f(r), 0) / finished.length).toFixed(1) : '-'
const trueTest = trueEndingTest()

console.log('═══ 《骰运迷城》无头模拟报告 ═══')
console.log(`总局数 ${N} · 崩溃 ${crashes.length} · 完成率 ${((finished.length / N) * 100).toFixed(0)}%`)
console.log('结局分布:', JSON.stringify(endCount))
console.log(`平均击杀 ${avg((r) => r.kills)} · 平均等级 ${avg((r) => r.level)} · 平均分 ${avg((r) => r.score)}`)
console.log(`平均残章 ${avg((r) => r.fragments)} · 班卓招募率 ${(finished.filter((r) => r.banjo).length / Math.max(1, finished.length) * 100).toFixed(0)}%`)
const actDeath: Record<number, number> = {}
for (const r of finished) if (r.ending === 'end_death') actDeath[r.act] = (actDeath[r.act] ?? 0) + 1
console.log('死亡幕分布:', JSON.stringify(actDeath))
console.log(`真结局定向测试: ${trueTest.ok ? '✅ ' + trueTest.detail : '❌ ' + trueTest.detail}`)
if (crashes.length > 0) {
  console.log('── 崩溃明细(前10) ──')
  for (const c of crashes.slice(0, 10)) console.log(' ❌', c.crash)
}
console.log(crashes.length === 0 ? '✅ 零崩溃' : `❌ ${crashes.length} 次崩溃`)
const killedBy: Record<string, number> = {}
for (const r of finished) if (r.ending === 'end_death') killedBy[r.killedBy] = (killedBy[r.killedBy] ?? 0) + 1
console.log('死亡凶手:', JSON.stringify(killedBy))
const byClass: Record<string, { n: number; wins: number }> = {}
for (const r of finished) {
  byClass[r.classId] ??= { n: 0, wins: 0 }
  byClass[r.classId]!.n += 1
  if (r.ending !== 'end_death') byClass[r.classId]!.wins += 1
}
console.log('职业胜率:', JSON.stringify(byClass))
