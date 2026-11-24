// ─── 画具库:调色板 · 剪影边缘光 · 辉光 · 人物剪影生成器 ───────────────
// 画布 400×170,地面线 y=150。物件以「底部中心」为原点 (0,0),向上为负 y。
// 渐变 id 一律以 § 开头,svgFor() 渲染时替换成实例前缀,避免多个内联 SVG 互相串 id。

export const W = 400
export const H = 170
export const GROUND = 150

export const C = {
  ink: '#0d0805',     // 最前景剪影
  ink2: '#17100a',    // 中景
  mid: '#1f150d',
  far: '#2c1e14',     // 远景
  haze: '#3a281b',
  gold: '#e8b45a',
  goldHi: '#ffd98a',
  ember: '#ff7a33',
  red: '#e05545',
  green: '#8fe07a',
  blue: '#7ab8ff',
  ice: '#cfeaff',
  violet: '#b48cff',
  bone: '#efe4cc',
} as const

/** 收敛到两位小数:产物字符串更短 */
const f = (v: number): string => String(Math.round(v * 100) / 100)

/** 画布上的一个点 */
export type Pt = [number, number]

/** 折线/多边形 path。pts = [[x,y],…];close=false 为不闭合的线 */
export const line = (pts: Pt[], close = true): string =>
  `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}${close ? 'Z' : ''}`

/** 平滑曲线 path(每两点之间用 Q 过弯,画披风/火焰/山脊这类有机轮廓) */
export const curve = (pts: Pt[], close = true): string => {
  if (pts.length < 3) return line(pts, close)
  let d = `M${f(pts[0]![0]!)} ${f(pts[0]![1]!)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i]![0]! + pts[i + 1]![0]!) / 2
    const my = (pts[i]![1]! + pts[i + 1]![1]!) / 2
    d += `Q${f(pts[i]![0]!)} ${f(pts[i]![1]!)} ${f(mx)} ${f(my)}`
  }
  const last = pts[pts.length - 1]!
  d += `L${f(last[0]!)} ${f(last[1]!)}${close ? 'Z' : ''}`
  return d
}

/** 填充形(继承剪影颜色) */
export const shape = (d: string): string => `<path d="${d}"/>`
/** 线条形(继承剪影颜色),用来画四肢、杆柄 */
export const stroke = (d: string, w: number): string =>
  `<path d="${d}" fill="none" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`
export const disc = (cx: number, cy: number, r: number): string => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>`
export const oval = (cx: number, cy: number, rx: number, ry: number, extra = ''): string =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"${extra}/>`
/** 圆角矩形(继承剪影颜色) */
export const rect = (x: number, y: number, w: number, h: number): string =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(w, h) * 0.18)}"/>`

// ─── 剪影 + 边缘光 ──────────────────────────────────────────────────
// 同一组形状先朝光源方向错位画一层亮色,再盖上墨色——亮色只从受光一侧露出,自动形成边缘光。
let RIM: [number, number] = [-2.2, -1.6]

/** 渲染器在摆放每个物件前调用:告诉画具「光从哪边来」(错位方向,画布单位) */
export const setRim = (dx: number, dy: number): void => { RIM = [dx, dy] }

/**
 * 剪影双层。shapes 内不要写 fill(继承分组颜色);
 * detail 是画在最上层、不参与边缘光的细节(发光的眼睛、剑刃寒光等),自带 fill。
 */
export function sil(shapes: string, detail = '', ink: string = C.ink): string {
  const [dx, dy] = RIM
  const lit = dx === 0 && dy === 0
    ? ''
    : `<g fill="#7d6a54" stroke="#7d6a54" transform="translate(${f(-dx * 0.6)} ${f(-dy * 0.6)})" opacity=".34">${shapes}</g>` +
      `<g fill="${C.gold}" stroke="${C.gold}" transform="translate(${f(dx)} ${f(dy)})" opacity=".72">${shapes}</g>`
  return `<g fill="${ink}" stroke="${ink}">${lit}${shapes}</g>${detail}`
}

/** 纯剪影(远景/中景,无边缘光) */
export const flat = (shapes: string, color: string): string => `<g fill="${color}" stroke="${color}">${shapes}</g>`

// ─── 光 ─────────────────────────────────────────────────────────────
export type Glow = 'ember' | 'gold' | 'blue' | 'ice' | 'violet' | 'green' | 'red' | 'white'

/** 径向辉光(不用 SVG 滤镜,手机 WebView 上开销小) */
export const glow = (x: number, y: number, r: number, kind: Glow = 'ember', opacity = 1, cls = ''): string =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.82)}" fill="url(#§g-${kind})" opacity="${opacity}"${cls ? ` class="${cls}"` : ''}/>`

/** 地面上的光斑(压扁的辉光) */
export const floorGlow = (x: number, y: number, r: number, kind: Glow = 'ember', opacity = 0.6): string =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.22)}" fill="url(#§g-${kind})" opacity="${opacity}"/>`

/** 火焰:三层渐变色火舌,带跳动动画 */
export function flame(x: number, y: number, h: number, w = h * 0.5, cls = 'a-flick'): string {
  const tongue = (hh: number, ww: number, lean: number): string =>
    shape(curve([[x - ww, y], [x - ww * 1.05, y - hh * 0.45], [x - ww * 0.25 + lean, y - hh * 0.8], [x + lean, y - hh], [x + ww * 0.3 + lean, y - hh * 0.72], [x + ww * 1.05, y - hh * 0.4], [x + ww, y]]))
  return `<g${cls ? ` class="${cls}"` : ''}>
    <g fill="url(#§f-fire)">${tongue(h, w, 0)}${tongue(h * 0.78, w * 0.62, w * 0.5)}</g>
    <g fill="${C.goldHi}" opacity=".85">${tongue(h * 0.46, w * 0.34, -w * 0.1)}</g>
  </g>`
}

/** 一颗火星/幽灵火(自带辉光) */
export const spark = (x: number, y: number, r: number, color: string): string =>
  `${glow(x, y, r * 4, 'ember', 0.5)}<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}"/>`

/** 自发光的小细节(眼睛、符文),附带一圈小辉光 */
export const lit = (x: number, y: number, r: number, kind: Glow, color: string): string =>
  `${glow(x, y, r * 5, kind, 0.7)}<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}"/>`

// ─── 全局 defs(§ 由 svgFor 替换) ────────────────────────────────────
export const DEFS = `<defs>
  <radialGradient id="§g-ember"><stop offset="0" stop-color="#ffc070" stop-opacity=".9"/><stop offset=".32" stop-color="#ff7a33" stop-opacity=".4"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-gold"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".75"/><stop offset=".35" stop-color="#e8b45a" stop-opacity=".28"/><stop offset="1" stop-color="#e8b45a" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-blue"><stop offset="0" stop-color="#d6ecff" stop-opacity=".8"/><stop offset=".32" stop-color="#7ab8ff" stop-opacity=".3"/><stop offset="1" stop-color="#7ab8ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-ice"><stop offset="0" stop-color="#f2fbff" stop-opacity=".9"/><stop offset=".3" stop-color="#bfe6ff" stop-opacity=".3"/><stop offset="1" stop-color="#bfe6ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-violet"><stop offset="0" stop-color="#e6d6ff" stop-opacity=".8"/><stop offset=".32" stop-color="#b48cff" stop-opacity=".32"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-green"><stop offset="0" stop-color="#e2ffcf" stop-opacity=".8"/><stop offset=".32" stop-color="#8fe07a" stop-opacity=".28"/><stop offset="1" stop-color="#8fe07a" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-red"><stop offset="0" stop-color="#ffb49e" stop-opacity=".8"/><stop offset=".32" stop-color="#e05545" stop-opacity=".34"/><stop offset="1" stop-color="#e05545" stop-opacity="0"/></radialGradient>
  <radialGradient id="§g-white"><stop offset="0" stop-color="#fffaf0" stop-opacity=".95"/><stop offset=".35" stop-color="#fff2d0" stop-opacity=".35"/><stop offset="1" stop-color="#fff2d0" stop-opacity="0"/></radialGradient>
  <linearGradient id="§f-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b8361a"/><stop offset=".42" stop-color="#ff7a33"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>
  <linearGradient id="§f-steel" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8f98"/><stop offset="1" stop-color="#eef2f8"/></linearGradient>
  <radialGradient id="§vig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
</defs>`

/** 暗角:每张图最后盖一层 */
export const VIGNETTE = `<rect width="${W}" height="${H}" fill="url(#§vig)"/>`

/** 柔光带(雾/烟/热浪),c 为颜色 */
export const mist = (y: number, h: number, c: string, o0 = 0, o1 = 0.5, cls = ''): string => {
  const id = `§m-${Math.round(y)}-${Math.round(h)}-${c.slice(1)}`
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="${o0}"/><stop offset=".5" stop-color="${c}" stop-opacity="${o1}"/><stop offset="1" stop-color="${c}" stop-opacity="${o0}"/></linearGradient>
    <rect x="-40" y="${f(y)}" width="${W + 80}" height="${f(h)}" fill="url(#${id})"${cls ? ` class="${cls}"` : ''}/>`
}

// ─── 人物剪影生成器 ─────────────────────────────────────────────────
export type Head = 'none' | 'hood' | 'hat' | 'helmet' | 'crown' | 'bun' | 'ears' | 'wrap' | 'skull' | 'helmetHorns'
export type Hand =
  | 'none' | 'sword' | 'swordUp' | 'staff' | 'spear' | 'axe' | 'lute' | 'mace' | 'dagger' | 'shield'
  | 'hammer' | 'torch' | 'poker' | 'bowl' | 'sack' | 'flameSword' | 'lantern' | 'scythe'
export interface FigOpts {
  h?: number                 // 身高(画布单位),默认 44
  bw?: number                // 体宽系数,1 = 标准
  pose?: 'stand' | 'walk' | 'sit' | 'kneel' | 'crouch'
  head?: Head
  cloak?: 'none' | 'long' | 'short' | 'robe'
  hand?: Hand
  eyes?: string              // 发光眼睛的颜色
  lean?: number              // 上身前倾(度,正值朝 +x)
}

/**
 * 生成一个人物剪影(原点在两脚之间)。返回 body(参与边缘光)与 detail(最上层细节)。
 * 朝向 +x 为正面;需要朝左时在外层 scale(-1,1)。
 */
export function fig(o: FigOpts = {}): { body: string; detail: string } {
  const h = o.h ?? 44
  const bw = o.bw ?? 1
  const pose = o.pose ?? 'stand'
  const cloak = o.cloak ?? 'none'
  const sw = 0.1 * h * bw
  const ww = 0.068 * h * bw
  const lw = 0.066 * h * Math.min(bw, 1.2)
  const aw = 0.05 * h * Math.min(bw, 1.2)
  // 蹲/跪/坐:胯部上移或下移,上身整体跟着走
  const dy = pose === 'sit' ? 0.2 * h : pose === 'kneel' ? 0.14 * h : pose === 'crouch' ? 0.17 * h : 0
  const ys = -0.8 * h + dy      // 肩
  const yw = -0.52 * h + dy     // 腰
  const yh = -0.47 * h + dy     // 胯
  const tilt = (o.lean ?? 0) * Math.PI / 180
  const tx = (y: number): number => (ys - y) * Math.tan(tilt)   // 上身倾斜带来的横向偏移

  const b: string[] = []
  const d: string[] = []

  // ── 腿 ──
  if (cloak !== 'robe') {
    if (pose === 'sit') {
      b.push(stroke(line([[-0.03 * h, yh], [0.15 * h, yh + 0.01 * h], [0.165 * h, -0.01 * h]], false), lw))
      b.push(stroke(line([[0.03 * h, yh], [0.13 * h, yh + 0.015 * h], [0.145 * h, -0.01 * h]], false), lw * 0.92))
    } else if (pose === 'kneel') {
      b.push(stroke(line([[-0.02 * h, yh], [-0.07 * h, -0.03 * h], [-0.21 * h, -0.03 * h]], false), lw))
      b.push(stroke(line([[0.04 * h, yh], [0.11 * h, -0.17 * h], [0.125 * h, -0.01 * h]], false), lw))
    } else if (pose === 'crouch') {
      b.push(stroke(line([[-0.03 * h, yh], [-0.13 * h, -0.12 * h], [-0.1 * h, -0.01 * h]], false), lw))
      b.push(stroke(line([[0.03 * h, yh], [0.13 * h, -0.12 * h], [0.11 * h, -0.01 * h]], false), lw))
    } else if (pose === 'walk') {
      b.push(stroke(line([[-0.03 * h, yh], [0.07 * h, -0.2 * h], [0.13 * h, -0.012 * h]], false), lw))
      b.push(stroke(line([[0.03 * h, yh], [-0.05 * h, -0.2 * h], [-0.13 * h, -0.03 * h]], false), lw))
    } else {
      b.push(stroke(line([[-0.03 * h, yh], [-0.05 * h, -0.012 * h]], false), lw))
      b.push(stroke(line([[0.03 * h, yh], [0.062 * h, -0.012 * h]], false), lw))
    }
  }

  // ── 躯干 ──
  const x0 = tx(yw)
  if (cloak === 'robe') {
    b.push(shape(curve([[-sw, ys + 0.02 * h], [0, ys - 0.03 * h], [sw, ys + 0.02 * h], [0.14 * h * bw, yw], [0.17 * h * bw, -0.012 * h], [0, -0.03 * h], [-0.17 * h * bw, -0.012 * h], [-0.14 * h * bw, yw]])))
  } else {
    b.push(shape(curve([[-sw, ys + 0.03 * h], [0, ys - 0.025 * h], [sw, ys + 0.03 * h], [ww * 1.05 + x0, yw], [ww, yh + 0.02 * h], [-ww, yh + 0.02 * h], [-ww * 1.05 + x0, yw]])))
    if (cloak === 'long') {
      b.push(shape(curve([[-sw * 0.98, ys + 0.035 * h], [-0.15 * h * bw, -0.03 * h], [-0.04 * h, -0.05 * h], [0.05 * h, -0.03 * h], [0.15 * h * bw, -0.04 * h], [sw * 0.98, ys + 0.035 * h], [0, ys + 0.07 * h]])))
    } else if (cloak === 'short') {
      b.push(shape(curve([[-sw * 0.98, ys + 0.035 * h], [-0.125 * h * bw, yh - 0.02 * h], [0, yh - 0.05 * h], [0.125 * h * bw, yh - 0.02 * h], [sw * 0.98, ys + 0.035 * h], [0, ys + 0.07 * h]])))
    }
  }

  // ── 头 ──
  const hx = tx(ys - 0.1 * h)
  const hy = ys - 0.105 * h
  const hr = 0.073 * h
  const head = o.head ?? 'none'
  if (head === 'skull') {
    b.push(shape(curve([[hx - hr, hy - 0.01 * h], [hx, hy - hr * 1.05], [hx + hr, hy - 0.01 * h], [hx + hr * 0.72, hy + hr * 1.05], [hx - hr * 0.72, hy + hr * 1.05]])))
  } else {
    b.push(disc(hx, hy, hr))
  }
  switch (head) {
    case 'hood':
      b.push(shape(curve([[hx - hr * 1.22, hy + hr * 0.9], [hx - hr * 1.25, hy - hr * 0.9], [hx - hr * 0.2, hy - hr * 1.75], [hx + hr * 1.15, hy - hr * 0.75], [hx + hr * 1.25, hy + hr * 0.9], [hx, hy + hr * 0.55]])))
      break
    case 'hat':
      b.push(oval(hx, hy - hr * 0.72, hr * 2.3, hr * 0.32))
      b.push(shape(line([[hx - hr * 1.15, hy - hr * 0.8], [hx + hr * 0.25, hy - hr * 4.4], [hx + hr * 1.15, hy - hr * 0.8]])))
      break
    case 'helmet': case 'helmetHorns': {
      b.push(shape(curve([[hx - hr * 1.12, hy + hr * 0.2], [hx - hr * 1.1, hy - hr * 0.95], [hx, hy - hr * 1.25], [hx + hr * 1.1, hy - hr * 0.95], [hx + hr * 1.12, hy + hr * 0.2]])))
      b.push(rect(hx - hr * 1.12, hy - hr * 0.05, hr * 2.24, hr * 0.75))
      d.push(`<rect x="${f(hx - hr * 0.72)}" y="${f(hy - hr * 0.08)}" width="${f(hr * 1.44)}" height="${f(hr * 0.2)}" rx="${f(hr * 0.1)}" fill="${o.eyes ?? C.ember}"/>`)
      if (head === 'helmetHorns') {
        b.push(shape(curve([[hx - hr, hy - hr * 0.8], [hx - hr * 2.3, hy - hr * 1.2], [hx - hr * 2.9, hy - hr * 3.1], [hx - hr * 1.5, hy - hr * 1.7]])))
        b.push(shape(curve([[hx + hr, hy - hr * 0.8], [hx + hr * 2.3, hy - hr * 1.2], [hx + hr * 2.9, hy - hr * 3.1], [hx + hr * 1.5, hy - hr * 1.7]])))
      }
      break
    }
    case 'crown':
      b.push(shape(line([[hx - hr * 1.05, hy - hr * 0.62], [hx - hr * 1.1, hy - hr * 1.9], [hx - hr * 0.5, hy - hr * 1.25], [hx, hy - hr * 2.2], [hx + hr * 0.5, hy - hr * 1.25], [hx + hr * 1.1, hy - hr * 1.9], [hx + hr * 1.05, hy - hr * 0.62]])))
      break
    case 'bun':
      b.push(disc(hx - hr * 0.55, hy - hr * 0.95, hr * 0.5))
      b.push(shape(curve([[hx - hr * 1.05, hy + hr * 0.5], [hx - hr * 1.12, hy - hr * 0.7], [hx, hy - hr * 1.1], [hx + hr * 1.1, hy - hr * 0.55], [hx + hr * 1.05, hy + hr * 0.2], [hx - hr * 0.3, hy - hr * 0.2]])))
      break
    case 'ears':
      b.push(shape(line([[hx - hr * 0.7, hy - hr * 0.35], [hx - hr * 3, hy - hr * 1.25], [hx - hr * 0.75, hy + hr * 0.45]])))
      b.push(shape(line([[hx + hr * 0.7, hy - hr * 0.35], [hx + hr * 3, hy - hr * 1.25], [hx + hr * 0.75, hy + hr * 0.45]])))
      break
    case 'wrap':
      b.push(shape(curve([[hx - hr * 1.12, hy + hr * 0.25], [hx - hr * 1.12, hy - hr * 0.9], [hx, hy - hr * 1.2], [hx + hr * 1.12, hy - hr * 0.9], [hx + hr * 1.12, hy + hr * 0.25]])))
      break
    case 'skull':
      d.push(`<rect x="${f(hx - hr * 1.02)}" y="${f(hy + hr * 0.18)}" width="${f(hr * 2.04)}" height="${f(hr * 0.24)}" rx="${f(hr * 0.1)}" fill="${C.ink}"/>`)
      break
    default:
      break
  }
  if (o.eyes && head !== 'helmet' && head !== 'helmetHorns') {
    const ec = o.eyes
    const ex = hr * 0.42
    const kind: Glow = ec === C.blue || ec === C.ice ? 'ice' : ec === C.violet ? 'violet' : ec === C.green ? 'green' : ec === C.red ? 'red' : 'ember'
    d.push(lit(hx - ex, hy + hr * 0.05, hr * 0.16 * (head === 'skull' ? 1.5 : 1), kind, ec))
    d.push(lit(hx + ex, hy + hr * 0.05, hr * 0.16 * (head === 'skull' ? 1.5 : 1), kind, ec))
  }

  // ── 手臂与持物 ──
  const shL: [number, number] = [-sw * 0.92, ys + 0.05 * h]
  const shR: [number, number] = [sw * 0.92, ys + 0.05 * h]
  const arm = (a: [number, number], c: [number, number] | null, e: [number, number]): string =>
    c ? stroke(line([a, c, e], false), aw) : stroke(line([a, e], false), aw)
  const hangL: [number, number] = [-0.125 * h * bw, yw - 0.02 * h]
  const hangR: [number, number] = [0.125 * h * bw, yw - 0.02 * h]
  const hand = o.hand ?? 'none'
  const blade = (x1: number, y1: number, x2: number, y2: number, wd: number): void => {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len * wd, ny = dx / len * wd
    const tipX = x2 + dx / len * wd * 2.4, tipY = y2 + dy / len * wd * 2.4
    b.push(shape(line([[x1 + nx, y1 + ny], [x2 + nx * 0.7, y2 + ny * 0.7], [tipX, tipY], [x2 - nx * 0.7, y2 - ny * 0.7], [x1 - nx, y1 - ny]])))
    d.push(`<path d="${line([[x1 + nx * 0.3, y1 + ny * 0.3], [x2 + nx * 0.2, y2 + ny * 0.2], [tipX, tipY]], false)}" fill="none" stroke="url(#§f-steel)" stroke-width="${f(wd * 0.7)}" stroke-linecap="round" opacity=".8"/>`)
  }
  switch (hand) {
    case 'none':
      b.push(arm(shL, null, hangL), arm(shR, null, hangR))
      break
    case 'sword':
      b.push(arm(shL, null, hangL), arm(shR, [0.15 * h, yw - 0.04 * h], [0.185 * h, yw - 0.07 * h]))
      b.push(stroke(line([[0.13 * h, yw - 0.03 * h], [0.23 * h, yw - 0.1 * h]], false), 0.022 * h))
      blade(0.23 * h, yw - 0.1 * h, 0.36 * h, yw - 0.17 * h, 0.021 * h)
      break
    case 'swordUp':
      b.push(arm(shL, null, hangL), arm(shR, [0.17 * h, ys + 0.02 * h], [0.2 * h, ys - 0.09 * h]))
      b.push(stroke(line([[0.17 * h, ys - 0.02 * h], [0.2 * h, ys - 0.16 * h]], false), 0.022 * h))
      blade(0.2 * h, ys - 0.16 * h, 0.3 * h, ys - 0.62 * h, 0.021 * h)
      break
    case 'flameSword':
      b.push(arm(shL, null, hangL), arm(shR, [0.17 * h, ys + 0.02 * h], [0.21 * h, ys - 0.1 * h]))
      b.push(stroke(line([[0.17 * h, ys - 0.02 * h], [0.21 * h, ys - 0.18 * h]], false), 0.024 * h))
      d.push(`<path d="${line([[0.185 * h, ys - 0.17 * h], [0.31 * h, ys - 0.7 * h], [0.25 * h, ys - 0.18 * h]], false)}" fill="none" stroke="url(#§f-fire)" stroke-width="${f(0.034 * h)}" stroke-linecap="round" class="a-flick"/>`)
      d.push(glow(0.27 * h, ys - 0.45 * h, 0.24 * h, 'ember', 0.75))
      break
    case 'dagger':
      b.push(arm(shL, null, hangL), arm(shR, [0.14 * h, yw - 0.02 * h], [0.19 * h, yw - 0.09 * h]))
      blade(0.19 * h, yw - 0.09 * h, 0.27 * h, yw - 0.16 * h, 0.018 * h)
      break
    case 'staff':
      b.push(arm(shL, null, hangL), arm(shR, [0.12 * h, yw], [0.16 * h, yw - 0.05 * h]))
      b.push(stroke(line([[0.2 * h, 0.02 * h], [0.16 * h, -1.2 * h]], false), 0.026 * h))
      d.push(lit(0.16 * h, -1.22 * h, 0.03 * h, 'ember', C.goldHi))
      break
    case 'scythe':
      b.push(arm(shL, null, hangL), arm(shR, [0.12 * h, yw], [0.16 * h, yw - 0.05 * h]))
      b.push(stroke(line([[0.2 * h, 0.02 * h], [0.13 * h, -1.28 * h]], false), 0.024 * h))
      b.push(shape(curve([[0.13 * h, -1.28 * h], [-0.12 * h, -1.36 * h], [-0.3 * h, -1.2 * h], [-0.1 * h, -1.24 * h]])))
      break
    case 'spear':
      b.push(arm(shL, null, hangL), arm(shR, [0.13 * h, yw - 0.02 * h], [0.18 * h, yw - 0.08 * h]))
      b.push(stroke(line([[0.3 * h, 0.03 * h], [0.2 * h, -1.36 * h]], false), 0.022 * h))
      b.push(shape(line([[0.2 * h, -1.36 * h], [0.155 * h, -1.5 * h], [0.2 * h, -1.66 * h], [0.245 * h, -1.5 * h]])))
      break
    case 'mace':
      b.push(arm(shL, null, hangL), arm(shR, [0.14 * h, yw - 0.03 * h], [0.2 * h, yw - 0.12 * h]))
      b.push(stroke(line([[0.16 * h, yw - 0.06 * h], [0.27 * h, yw - 0.28 * h]], false), 0.022 * h))
      b.push(disc(0.28 * h, yw - 0.3 * h, 0.05 * h))
      break
    case 'axe':
      b.push(arm(shL, null, hangL), arm(shR, [0.16 * h, yw - 0.02 * h], [0.2 * h, yw - 0.09 * h]))
      b.push(stroke(line([[0.12 * h, yw + 0.06 * h], [0.29 * h, ys - 0.3 * h]], false), 0.024 * h))
      b.push(shape(curve([[0.24 * h, ys - 0.34 * h], [0.46 * h, ys - 0.3 * h], [0.48 * h, ys - 0.02 * h], [0.3 * h, ys - 0.04 * h]])))
      break
    case 'hammer':
      b.push(arm(shL, null, hangL), arm(shR, [0.15 * h, yw - 0.03 * h], [0.2 * h, yw - 0.1 * h]))
      b.push(stroke(line([[0.16 * h, yw + 0.04 * h], [0.27 * h, yw - 0.2 * h]], false), 0.024 * h))
      b.push(rect(0.2 * h, yw - 0.3 * h, 0.17 * h, 0.09 * h))
      break
    case 'lute': {
      b.push(arm(shL, [-0.06 * h, yw - 0.08 * h], [0.05 * h, yw - 0.1 * h]))
      b.push(arm(shR, [0.14 * h, yw - 0.14 * h], [0.06 * h, yw - 0.22 * h]))
      b.push(oval(0.1 * h, yw - 0.09 * h, 0.085 * h, 0.1 * h))
      b.push(stroke(line([[0.07 * h, yw - 0.16 * h], [-0.1 * h, ys - 0.14 * h]], false), 0.022 * h))
      d.push(`<path d="${line([[0.1 * h, yw - 0.02 * h], [-0.09 * h, ys - 0.13 * h]], false)}" fill="none" stroke="${C.bone}" stroke-width=".7" opacity=".7"/>`)
      break
    }
    case 'shield':
      b.push(arm(shR, null, hangR), arm(shL, null, [-0.13 * h, yw - 0.04 * h]))
      b.push(shape(curve([[-0.2 * h * bw, ys + 0.02 * h], [-0.1 * h * bw, ys], [-0.1 * h * bw, yw - 0.02 * h], [-0.15 * h * bw, yw + 0.03 * h], [-0.2 * h * bw, yw - 0.02 * h]])))
      break
    case 'torch':
      b.push(arm(shL, null, hangL), arm(shR, [0.16 * h, yw - 0.05 * h], [0.21 * h, yw - 0.13 * h]))
      b.push(stroke(line([[0.18 * h, yw - 0.08 * h], [0.24 * h, yw - 0.28 * h]], false), 0.022 * h))
      d.push(glow(0.24 * h, yw - 0.34 * h, 0.3 * h, 'ember', 0.85) + flame(0.24 * h, yw - 0.27 * h, 0.15 * h, 0.06 * h))
      break
    case 'lantern':
      b.push(arm(shL, null, hangL), arm(shR, [0.14 * h, yw - 0.01 * h], [0.17 * h, yw - 0.05 * h]))
      b.push(stroke(line([[0.17 * h, yw - 0.05 * h], [0.17 * h, yw - 0.11 * h]], false), 0.012 * h))
      b.push(rect(0.125 * h, yw - 0.25 * h, 0.09 * h, 0.14 * h))
      d.push(glow(0.17 * h, yw - 0.18 * h, 0.22 * h, 'gold', 0.8))
      break
    case 'poker':
      b.push(arm(shL, null, hangL), arm(shR, [0.15 * h, yw - 0.04 * h], [0.19 * h, yw - 0.06 * h]))
      b.push(stroke(line([[0.26 * h, 0.02 * h], [0.17 * h, -0.78 * h]], false), 0.018 * h))
      break
    case 'bowl':
      b.push(arm(shL, [0.06 * h, yw - 0.1 * h], [0.13 * h, yw - 0.1 * h]), arm(shR, [0.14 * h, yw - 0.13 * h], [0.13 * h, yw - 0.1 * h]))
      b.push(shape(curve([[0.05 * h, yw - 0.09 * h], [0.1 * h, yw - 0.03 * h], [0.21 * h, yw - 0.09 * h]])))
      break
    case 'sack':
      b.push(arm(shL, [-0.13 * h, yw - 0.06 * h], [-0.16 * h, yw - 0.2 * h]), arm(shR, [0.13 * h, yw - 0.06 * h], [0.16 * h, yw - 0.2 * h]))
      b.push(shape(curve([[-0.16 * h, yw - 0.2 * h], [-0.26 * h, yw + 0.02 * h], [0, yw + 0.06 * h], [0.26 * h, yw + 0.02 * h], [0.16 * h, yw - 0.2 * h]])))
      break
    default:
      b.push(arm(shL, null, hangL), arm(shR, null, hangR))
  }
  return { body: b.join(''), detail: d.join('') }
}

/** 人物剪影(已套边缘光)。detail 额外追加的最上层细节 */
export function figure(o: FigOpts, detail = ''): string {
  const p = fig(o)
  return sil(p.body, p.detail + detail)
}
