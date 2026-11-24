// ─── 画面区:常驻的场景插画 / 战斗舞台 ────────────────────────────────
// 三件事:换图(交叉淡入)、段落聚焦(高亮 + 轻推镜头)、战斗演出(冲撞/受击/闪避/倒下)。
import { svgFor, type ArtSpec } from '../art/render'
import type { BgId } from '../art/backdrops'
import { COMBAT_ART, ENDING_ART, IMAGE_OVERRIDES, SCENE_ART } from '../art/sceneArt'
import type { ClassId, EndingId } from '../game/types'

export type StageAnim =
  | 'playerStrike' | 'monsterStrike' | 'playerHit' | 'monsterHit'
  | 'playerDodge' | 'monsterDodge' | 'playerHeal' | 'monsterDown'

const ANIM: Record<StageAnim, [fig: string, cls: string]> = {
  playerStrike: ['player', 'strike'], monsterStrike: ['monster', 'strike'],
  playerHit: ['player', 'hit'], monsterHit: ['monster', 'hit'],
  playerDodge: ['player', 'dodge'], monsterDodge: ['monster', 'dodge'],
  playerHeal: ['player', 'heal'], monsterDown: ['monster', 'down'],
}
const ANIM_CLASSES = ['strike', 'hit', 'dodge', 'heal', 'down']

interface Cam { k: number; x: number; y: number }   // 镜头:缩放 + 平移(画布单位)

class Stage {
  private root: HTMLElement | null = null
  private restore: HTMLElement | null = null
  private card: HTMLElement | null = null
  private layers: HTMLElement[] = []
  private active = 0
  private spec: ArtSpec | null = null
  private bg: BgId = 'corridor'
  private cls: ClassId = 'fighter'
  private caption = ''
  private enabled = true
  private collapsed = false
  private inGame = true
  onChange: ((collapsed: boolean) => void) | null = null

  /** root = #stage(内含 #monster-card);restore = 折叠后用来展开的那条细栏 */
  mount(root: HTMLElement, restore: HTMLElement): void {
    this.root = root
    this.restore = restore
    this.card = root.querySelector('#monster-card')
    root.insertAdjacentHTML('afterbegin',
      '<div class="stage-layer"></div><div class="stage-layer"></div><button class="stage-btn" type="button" title="收起画面">▾</button>')
    this.layers = [...root.querySelectorAll<HTMLElement>('.stage-layer')]
    root.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.stage-btn')) { this.setCollapsed(true); return }
      this.openLarge()
    })
    restore.addEventListener('click', () => this.setCollapsed(false))
  }

  configure(o: { enabled: boolean; collapsed: boolean; cls: ClassId }): void {
    this.cls = o.cls
    this.setEnabled(o.enabled)
    this.setCollapsed(o.collapsed)
  }

  setClass(cls: ClassId): void { this.cls = cls }

  setEnabled(on: boolean): void {
    this.enabled = on
    this.sync()
  }

  setCollapsed(on: boolean): void {
    this.collapsed = on
    this.sync()
    this.onChange?.(on)
  }

  /** 是否处于局内画面(标题/结算等整屏界面时整体隐藏) */
  setInGame(on: boolean): void {
    this.inGame = on
    this.sync()
  }

  /** 开启且展开时,怪物卡叠在画面底部(省出纵向空间);否则回到画面区下方做普通条 */
  private sync(): void {
    const root = this.root
    if (!root || !this.card || !this.restore) return
    const show = this.enabled && !this.collapsed
    root.classList.toggle('hidden', !this.inGame || !this.enabled)
    root.classList.toggle('collapsed', this.collapsed)
    this.restore.classList.toggle('hidden', !(this.inGame && this.enabled && this.collapsed))
    if (this.restore.textContent !== undefined) this.restore.textContent = `▸ 画面 · ${this.caption}`
    const btn = root.querySelector<HTMLElement>('.stage-btn')
    if (btn) btn.hidden = !show
    if (show) {
      if (this.card.parentElement !== root) root.insertBefore(this.card, btn ?? null)
    } else if (this.card.parentElement === root) {
      this.restore.after(this.card)
    }
  }

  setCaption(title: string): void {
    this.caption = title
    this.sync()
  }

  // ── 换图 ──
  private paint(spec: ArtSpec | null, image: string | undefined): void {
    this.spec = spec
    const next = 1 - this.active
    const layer = this.layers[next]
    if (!layer) return
    layer.innerHTML = image
      ? `<img src="${image}" alt="">`
      : svgFor(spec ?? { bg: this.bg, items: [] }, this.cls)
    layer.classList.add('show')
    this.layers[this.active]?.classList.remove('show')
    this.active = next
  }

  showScene(sceneId: string, title: string, fallbackBg: BgId): void {
    this.bg = fallbackBg
    this.setCaption(title)
    this.paint(SCENE_ART[sceneId] ?? null, IMAGE_OVERRIDES[sceneId])
  }

  showCombat(monsterId: string, fallbackBg: BgId): void {
    this.bg = fallbackBg
    this.paint(COMBAT_ART[monsterId] ?? null, IMAGE_OVERRIDES[monsterId])
  }

  /** 结局插画(结局页自己摆) */
  endingSvg(endingId: EndingId): string {
    const spec = ENDING_ART[endingId]
    return spec ? svgFor(spec, this.cls) : ''
  }

  // ── 段落聚焦 ──
  /** 高亮 ids 指向的物件并把镜头轻轻推过去;null/空 = 还原全景 */
  focus(ids: readonly string[] | null | undefined): void {
    const root = this.root
    const svg = this.layers[this.active]?.querySelector('svg')
    if (!root || !svg) return
    const want = ids ?? []
    const all = [...svg.querySelectorAll<SVGGraphicsElement>('[data-fid]')]
    const on = want.map((id) => svg.querySelector(`[data-fid="${id}"]`)).filter((el): el is Element => !!el)
    root.classList.toggle('focusing', on.length > 0)
    for (const el of all) el.classList.toggle('on', on.includes(el))
    if (!on.length) { this.moveCam({ k: 1, x: 0, y: 0 }); return }
    const world = svg.querySelector<SVGGraphicsElement>('.world')
    if (!world) return
    const boxes = on.map((el) => boxOf(el as SVGGraphicsElement, world)).filter((b): b is Box => !!b)
    if (!boxes.length) { this.moveCam({ k: 1, x: 0, y: 0 }); return }
    const x1 = Math.min(...boxes.map((b) => b.x)), y1 = Math.min(...boxes.map((b) => b.y))
    const x2 = Math.max(...boxes.map((b) => b.x + b.w)), y2 = Math.max(...boxes.map((b) => b.y + b.h))
    const w = x2 - x1, h = y2 - y1
    const k = Math.max(1, Math.min(1.6, 210 / Math.max(w, 1), 112 / Math.max(h, 1)))
    let tx = 200 - k * (x1 + w / 2)
    let ty = 85 - k * (y1 + h / 2)
    tx = Math.min(0, Math.max(400 * (1 - k), tx))   // 镜头不出画
    ty = Math.min(0, Math.max(170 * (1 - k), ty))
    this.moveCam({ k, x: tx, y: ty })
  }

  private moveCam(cam: Cam): void {
    const world = this.layers[this.active]?.querySelector<SVGGraphicsElement>('.world')
    if (world) world.style.transform = `translate(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px) scale(${cam.k.toFixed(3)})`
  }

  // ── 战斗演出 ──
  anim(name: StageAnim): void {
    const [fig, cls] = ANIM[name]
    const el = this.layers[this.active]?.querySelector<SVGGraphicsElement>(`[data-fig="${fig}"] > .fig`)
    if (!el) return
    el.classList.remove(...ANIM_CLASSES)
    void el.getBoundingClientRect()   // 重启动画
    el.classList.add(cls)
    const done = (): void => { el.classList.remove(cls); el.removeEventListener('animationend', done) }
    el.addEventListener('animationend', done)
  }

  // ── 全屏看图 ──
  private openLarge(): void {
    const ov = document.getElementById('overlay-art')
    if (!ov || !this.spec) return
    const fig = document.createElement('figure')
    const art = document.createElement('div')
    art.className = 'art'
    art.innerHTML = svgFor(this.spec, this.cls)
    const cap = document.createElement('figcaption')
    cap.textContent = this.caption
    fig.append(art, cap)
    ov.replaceChildren(fig)
    ov.classList.remove('hidden')
    const close = (): void => { ov.classList.add('hidden'); ov.replaceChildren(); ov.removeEventListener('click', close) }
    ov.addEventListener('click', close)
  }
}

interface Box { x: number; y: number; w: number; h: number }

/** 物件在画布坐标里的包围盒。getBBox 不含元素自身的 transform,这里用矩阵补上 */
function boxOf(el: SVGGraphicsElement, world: SVGGraphicsElement): Box | null {
  const mEl = el.getCTM()
  const mWorld = world.getCTM()
  if (!mEl || !mWorld) return null
  const rel = mWorld.inverse().multiply(mEl)
  const b = el.getBBox()
  const pts = [[b.x, b.y], [b.x + b.width, b.y + b.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(rel))
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
}

export const stage = new Stage()
