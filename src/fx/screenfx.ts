// ─── 屏幕特效:震屏/闪光/受击暗角/hit-stop ──────────────────────────

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** 震屏 */
export function shake(power: 1 | 2 | 3 = 1): void {
  if (reducedMotion()) return
  const app = document.getElementById('app')
  if (!app) return
  app.classList.remove('shake-1', 'shake-2', 'shake-3')
  void app.offsetWidth // reflow 重启动画
  app.classList.add(`shake-${power}`)
  setTimeout(() => app.classList.remove('shake-1', 'shake-2', 'shake-3'), 500)
}

/** 全屏闪光 */
export async function flash(color: 'white' | 'gold' | 'red', ms = 120): Promise<void> {
  const layer = document.getElementById('flash-layer')
  if (!layer || reducedMotion()) { await sleep(ms); return }
  layer.style.background =
    color === 'white' ? 'rgba(255,255,255,.75)' :
    color === 'gold' ? 'rgba(255,196,77,.55)' :
    'rgba(200,30,30,.5)'
  layer.classList.add('on')
  await sleep(ms)
  layer.classList.remove('on')
  layer.style.background = 'transparent'
}

/** 受击红暗角 */
export async function hurtVignette(): Promise<void> {
  const layer = document.getElementById('vignette-layer')
  if (!layer || reducedMotion()) return
  layer.classList.remove('on')
  void layer.offsetWidth
  layer.classList.add('on')
  await sleep(450)
  layer.classList.remove('on')
}

/** hit-stop:时间凝滞(节奏停顿 + 白闪) */
export async function hitStop(ms = 90): Promise<void> {
  await flash('white', ms)
}
