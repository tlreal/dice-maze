// ─── 插画渲染:把「背景 + 物件摆放」组装成一张内联 SVG ────────────────
import type { ClassId } from '../game/types'
import { BACKDROPS, type BgId } from './backdrops'
import { DEFS, H, VIGNETTE, W, setRim } from './kit'
import { PROPS, type PropId } from './props'
import { setPlayer } from './figures'

export interface Place {
  prop: PropId
  x: number                  // 物件原点(底部中心)在画布中的位置
  y: number
  s?: number                 // 缩放,默认 1
  flip?: boolean             // 水平镜像
  id?: string                // 可聚焦的标识(段落聚焦用)
  fig?: 'player' | 'monster' // 战斗演出中会被驱动的角色
  layer?: 0 | 1 | 2          // 0 远景(无边缘光) 1 中景 2 前景,默认 2
  rim?: [number, number] | null  // 覆盖边缘光方向;null = 无边缘光
  op?: number                // 整体不透明度
}

export interface ArtSpec {
  bg: BgId
  light?: [number, number]   // 主光源位置,决定各物件的边缘光朝向,默认 [200, 30]
  items: Place[]
}

/** 场景插画:focus[i] = 第 i 段旁白朗读时要高亮的物件 id */
export interface SceneArt extends ArtSpec {
  focus?: string[][]
}

const r = (v: number): number => Math.round(v * 100) / 100
const TOPSHADE = `<linearGradient id="§top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".4" stop-color="#000" stop-opacity="0"/></linearGradient>`

let seq = 0

/**
 * 生成一张插画的 SVG 字符串。player 决定画面里「你」的职业剪影。
 * 每次调用都会替换渐变 id 前缀,多个内联 SVG 同屏也不会串 id。
 */
export function svgFor(spec: ArtSpec, player: ClassId = 'fighter'): string {
  const u = `s${(seq = (seq + 1) % 9973)}-`
  setPlayer(player)
  const [lx, ly] = spec.light ?? [200, 30]
  const layers: string[] = ['', '', '']
  for (const it of spec.items) {
    const make = PROPS[it.prop]
    if (!make) continue
    const s = it.s ?? 1
    const layer = it.layer ?? 2
    if (it.rim === null || layer === 0) setRim(0, 0)
    else {
      const dx = it.rim ? it.rim[0] : lx - it.x
      const dy = it.rim ? it.rim[1] : ly - (it.y - 24 * s)
      const len = Math.hypot(dx, dy) || 1
      const k = (it.rim ? 1 : 2.4 / len) / s * (it.flip ? -1 : 1)
      setRim(dx * k, dy * k)
    }
    const attrs = `${it.id ? ` data-fid="${it.id}"` : ''}${it.fig ? ` data-fig="${it.fig}"` : ''}`
    const tf = `translate(${r(it.x)} ${r(it.y)}) scale(${r(it.flip ? -s : s)} ${r(s)})`
    const body = make()
    // 战斗角色:定位写在外层,CSS 动画驱动内层(.fig)——两者不能写在同一个 <g> 上,否则 transform 会被动画覆盖
    if (it.fig) layers[layer] += `<g${attrs} transform="${tf}"><g class="fig" style="--u:${r(1 / s)}">${body}</g></g>`
    else if (it.op !== undefined) layers[layer] += `<g${attrs}><g transform="${tf}" opacity="${it.op}">${body}</g></g>`
    else layers[layer] += `<g${attrs} transform="${tf}">${body}</g>`
  }
  const world = `<g class="ly ly-bg">${BACKDROPS[spec.bg]()}</g><rect width="${W}" height="76" fill="url(#§top)"/>` +
    `<g class="ly ly-far">${layers[0]}</g><g class="ly ly-mid">${layers[1]}</g><g class="ly ly-near">${layers[2]}</g>`
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    (DEFS + TOPSHADE + `<g class="world">${world}</g>` + VIGNETTE).replaceAll('§', u) + '</svg>'
}

/** 单个人物的小图(创建角色页的职业卡):视野裁到人物四周 */
export function figureSvg(html: string): string {
  return `<svg viewBox="-34 -70 68 74" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${html.replace(/§/g, 'f-')}</svg>`
}
