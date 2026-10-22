// ─── d20 骰子演出:全屏掷骰仪式 ─────────────────────────────────────
import { sleep } from './screenfx'
import { particles } from './particles'
import { sfx } from './audio'
import type { CheckOutcome } from '../game/rules'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let overlay: HTMLElement | null = null
let skipRequested = false

function ensureOverlay(): HTMLElement {
  if (overlay) return overlay
  overlay = document.createElement('div')
  overlay.id = 'dice-overlay'
  overlay.innerHTML = `
    <div class="dice-stage">
      <div class="dice-label"></div>
      <div class="d20-wrap">
        <div class="d20"><div class="d20-face"></div></div>
        <div class="d20-glow"></div>
      </div>
      <div class="dice-breakdown"></div>
      <div class="dice-verdict"></div>
      <div class="dice-skip">点击跳过</div>
    </div>`
  overlay.addEventListener('click', () => { skipRequested = true })
  document.body.appendChild(overlay)
  return overlay
}

function fmtBreakdown(o: CheckOutcome): string {
  const mod = o.roll.modifier
  const modeNote = o.roll.dice.length > 1
    ? (Math.max(...o.roll.dice) === o.roll.value ? ` · 优势 [${o.roll.dice.join(',')}] 取高` : ` · 劣势 [${o.roll.dice.join(',')}] 取低`)
    : ''
  const modStr = mod >= 0 ? `+${mod}` : `${mod}`
  const verdict = o.critSuccess ? '大成功!' : o.critFail ? '大失败!' : o.success ? '成功' : '失败'
  return `d20 ${modStr} = ${o.roll.total} vs DC${o.request.dc}${modeNote} → ${verdict}`
}

/**
 * 播放一次完整掷骰演出。
 * duration: 玩家主动检定较长,战斗快速掷骰较短
 */
export async function playDiceRoll(o: CheckOutcome, opts: { quick?: boolean } = {}): Promise<void> {
  const el = ensureOverlay()
  const label = el.querySelector<HTMLElement>('.dice-label')!
  const face = el.querySelector<HTMLElement>('.d20-face')!
  const d20 = el.querySelector<HTMLElement>('.d20')!
  const glow = el.querySelector<HTMLElement>('.d20-glow')!
  const breakdown = el.querySelector<HTMLElement>('.dice-breakdown')!
  const verdict = el.querySelector<HTMLElement>('.dice-verdict')!
  skipRequested = false

  label.textContent = o.label
  breakdown.textContent = ''
  verdict.textContent = ''
  verdict.className = 'dice-verdict'
  face.textContent = ''
  d20.className = 'd20 rolling'
  glow.className = 'd20-glow'
  el.classList.add('on')

  const isReduced = reduced()
  const spinMs = isReduced ? 240 : (opts.quick ? 620 : 1050)
  sfx.diceRoll()
  const start = performance.now()
  await new Promise<void>((resolve) => {
    const cycle = () => {
      if (skipRequested || performance.now() - start > spinMs) { resolve(); return }
      face.textContent = String(1 + Math.floor(Math.random() * 20))
      setTimeout(cycle, isReduced ? 90 : 65)
    }
    cycle()
  })

  // 定格
  face.textContent = String(o.roll.value)
  d20.className = 'd20 landed'
  if (o.roll.nat === 20) {
    d20.classList.add('nat20')
    glow.className = 'd20-glow gold'
    sfx.crit()
    particles.burst('gold', window.innerWidth / 2, window.innerHeight * 0.38)
    particles.burst('fragment', window.innerWidth / 2, window.innerHeight * 0.38)
    verdict.textContent = '大成功!'
    verdict.classList.add('gold')
  } else if (o.roll.nat === 1) {
    d20.classList.add('nat1')
    glow.className = 'd20-glow red'
    sfx.fail()
    particles.burst('hurt', window.innerWidth / 2, window.innerHeight * 0.38)
    verdict.textContent = '大失败!'
    verdict.classList.add('red')
  } else {
    sfx.diceLand()
    verdict.textContent = o.success ? '通过' : '未通过'
    verdict.classList.add(o.success ? 'ok' : 'miss')
  }
  breakdown.textContent = fmtBreakdown(o)
  await sleep(isReduced ? 200 : (o.roll.nat === 20 || o.roll.nat === 1) ? 1050 : 680)
  el.classList.remove('on')
  await sleep(120)
}

/** 死亡豁免专用:更凝重的一次掷骰,返回用户点击「继续」 */
export async function playDeathSave(roll: number, successes: number, failures: number, note?: string): Promise<void> {
  const el = ensureOverlay()
  const label = el.querySelector<HTMLElement>('.dice-label')!
  const face = el.querySelector<HTMLElement>('.d20-face')!
  const d20 = el.querySelector<HTMLElement>('.d20')!
  const glow = el.querySelector<HTMLElement>('.d20-glow')!
  const breakdown = el.querySelector<HTMLElement>('.dice-breakdown')!
  const verdict = el.querySelector<HTMLElement>('.dice-verdict')!
  skipRequested = false
  label.textContent = `死亡豁免 · 成功 ${successes}/3 · 失败 ${failures}/3`
  breakdown.textContent = ''
  verdict.textContent = ''
  verdict.className = 'dice-verdict'
  d20.className = 'd20 rolling'
  glow.className = 'd20-glow'
  el.classList.add('on')
  sfx.diceRoll()
  const start = performance.now()
  await new Promise<void>((resolve) => {
    const cycle = () => {
      if (skipRequested || performance.now() - start > 900) { resolve(); return }
      face.textContent = String(1 + Math.floor(Math.random() * 20))
      setTimeout(cycle, 80)
    }
    cycle()
  })
  face.textContent = String(roll)
  d20.className = 'd20 landed'
  if (roll >= 10) { verdict.textContent = '撑住了…'; verdict.classList.add('ok'); sfx.diceLand() }
  else { verdict.textContent = '在沉下去…'; verdict.classList.add('red'); sfx.fail() }
  breakdown.textContent = note ?? `掷出 ${roll}${roll >= 10 ? ' ≥ 10,记一次成功' : ' < 10,记一次失败'}`
  await sleep(1100)
  el.classList.remove('on')
  await sleep(100)
}
