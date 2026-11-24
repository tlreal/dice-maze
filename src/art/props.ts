// ─── 物件库:壁炉 / 画像 / 巨门 / 篝火 / 王座… ─────────────────────────
// 每个函数返回以「底部中心」为原点的 SVG 片段。朝向 +x 为正面。
import { C, curve, disc, flame, floorGlow, glow, line, mist, rect, shape, sil, stroke } from './kit'
import * as F from './figures'

// ─── 酒馆 ───────────────────────────────────────────────────────────
/** 壁炉:石砌炉膛、不灭的炉火、升腾的火星 */
export const fireplace = (): string => sil(`
  ${shape(line([[-38, 0], [-36, -98], [36, -98], [38, 0]]))}
  ${shape(line([[-44, 0], [-44, -7], [44, -7], [44, 0]]))}
  ${shape(line([[-41, -98], [-41, -106], [41, -106], [41, -98]]))}
`, `
  <path d="M-23 0V-40A23 23 0 0 1 23 -40V0Z" fill="#070302"/>
  ${glow(0, -18, 46, 'ember', 0.95)}${glow(0, -14, 20, 'gold', 0.7)}
  <g stroke="#1a0c06" stroke-width="5" stroke-linecap="round"><path d="M-13 -5L12 -11M-11 -11L13 -4"/></g>
  ${flame(0, -7, 30, 15)}${flame(-11, -6, 17, 8)}${flame(12, -6, 20, 9)}
  ${[-14, -4, 8, 16].map((x, i) => `<g class="a-rise" style="animation-delay:${i * 0.6}s"><circle cx="${x}" cy="-20" r="1.3" fill="#ffd98a"/></g>`).join('')}
  <path d="M-36 -98H36" stroke="${C.gold}" stroke-width="1" opacity=".3"/>
  <g stroke="#000" stroke-opacity=".3" stroke-width="1"><path d="M-36 -70H36M-37 -40H37M-18 -98V-70M16 -98V-70M-8 -70V-40M22 -70V-40"/></g>
`, C.ink2)

/** 壁炉后的画像:一个持剑的男人,笑得没心没肺 */
export const portrait = (): string => sil(`
  ${stroke(line([[0, -30], [0, -36]], false), 1)}
  ${shape(line([[-12.5, 0], [-12.5, -30], [12.5, -30], [12.5, 0]]))}
`, `
  <rect x="-9.5" y="-27.5" width="19" height="25" fill="#4a2e18"/>
  <rect x="-9.5" y="-27.5" width="19" height="25" fill="url(#§g-gold)" opacity=".55"/>
  <circle cx="0" cy="-19.5" r="4.3" fill="#1c110a"/>
  <path d="M-7.5 -4.5Q-6.5 -14 0 -14.5Q6.5 -14 7.5 -4.5Z" fill="#1c110a"/>
  <path d="M5 -6.5L10.5 -23" stroke="#c8ccd4" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>
  <path d="M-2.4 -17.6Q0 -15.4 2.4 -17.6" stroke="${C.goldHi}" stroke-width=".9" fill="none"/>
  <rect x="-9.5" y="-27.5" width="19" height="25" fill="none" stroke="${C.gold}" stroke-width=".8" opacity=".5"/>
`)

/** 酒馆的窗:乌云压在钟楼上 */
export const windowTower = (): string => sil(`
  ${shape(line([[-31, 0], [-31, -54], [31, -54], [31, 0], [27, 0], [27, -50], [-27, -50], [-27, 0]]))}
  ${shape(line([[-35, 0], [-35, -4], [35, -4], [35, 0]]))}
`, `
  <linearGradient id="§wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10162a"/><stop offset=".7" stop-color="#221826"/><stop offset="1" stop-color="#3a2018"/></linearGradient>
  <rect x="-27" y="-50" width="54" height="50" fill="url(#§wsky)"/>
  <ellipse cx="-6" cy="-42" rx="24" ry="6" fill="#080b16" opacity=".95"/>
  <ellipse cx="12" cy="-35" rx="18" ry="4.5" fill="#080b16" opacity=".85"/>
  <ellipse cx="-10" cy="-30" rx="14" ry="3" fill="#080b16" opacity=".7"/>
  <path d="M-15 0V-25L-9 -33L-3 -25V0Z" fill="#0a0d18"/>
  <circle cx="-9" cy="-22.5" r="2.8" fill="${C.gold}" opacity=".95"/>
  <path d="M-16 -6H-2" stroke="#ff9a4a" stroke-width="1.2" opacity=".5"/>
  <g stroke="#1f120a" stroke-width="2.2"><path d="M0 -50V0M-27 -25H27"/></g>
`, C.ink2)

/** 酒柜台 */
export const barcounter = (): string => sil(`
  ${shape(line([[-78, 0], [-78, -27], [78, -27], [78, 0], [72, 0], [72, -21], [-72, -21], [-72, 0]]))}
  ${shape(line([[-83, -27], [-83, -34], [83, -34], [83, -27]]))}
`, `
  <path d="M-83 -34H83" stroke="${C.gold}" stroke-width="1" opacity=".4"/>
  <g stroke="#000" stroke-opacity=".35" stroke-width="1"><path d="M-40 -21V0M0 -21V0M40 -21V0"/></g>
  ${[-56, 36].map((x) => `<path d="M${x} -34v-8h7.5v8z" fill="${C.ink}"/><path d="M${x + 7.5} -32.5h2.6a1.7 1.7 0 0 1 0 3.4h-2.6" fill="none" stroke="${C.ink}" stroke-width="1.3"/>`).join('')}
`, C.ink2)

export const stool = (): string => sil(`
  ${shape(line([[-8, 0], [-8, -12], [8, -12], [8, 0], [5.5, 0], [5.5, -10], [-5.5, -10], [-5.5, 0]]))}
  ${shape(line([[-9, -12], [-9, -15.5], [9, -15.5], [9, -12]]))}
`, '', C.ink2)

/** 吊灯(原点在灯罩处,链子向上) */
export const lamp = (): string => `
  <path d="M0 -70V-13" stroke="${C.ink2}" stroke-width="1.2"/>
  ${glow(0, 0, 38, 'gold', 0.78)}
  ${sil(shape(line([[-10, -13], [10, -13], [6.5, -3], [-6.5, -3]])), '', C.ink2)}
  <path d="M-4 -3h8l-2.4 6.5h-3.2z" fill="#ffd98a" opacity=".92"/>`

/** 路灯(柱子落地,灯头在顶端) */
export const lamppost = (): string => `
  ${sil(`${stroke(line([[0, 0], [0, -104]], false), 3)}${shape(line([[-7, 0], [7, 0], [4, -5], [-4, -5]]))}${shape(curve([[0, -104], [9, -108], [13, -100]]))}`, '', C.ink2)}
  ${glow(13, -94, 40, 'gold', 0.8)}
  ${sil(shape(line([[8, -101], [18, -101], [16.5, -88], [9.5, -88]])), '', C.ink2)}
  <rect x="10.5" y="-99" width="5" height="9" rx="1" fill="#ffd98a" opacity=".95"/>`

/** 长桌 */
export const table = (): string => sil(`
  ${rect(-74, -26, 148, 6)}${rect(-66, -20, 5, 20)}${rect(61, -20, 5, 20)}${rect(-3, -20, 5, 20)}
`, `<path d="M-74 -26H74" stroke="${C.gold}" stroke-width="1" opacity=".3"/>`, C.ink2)

/** 黑铁碗,盛着不冒烟的火 */
export const bowl = (): string => sil(shape(curve([[-14, -10], [-11, -3], [0, 0], [11, -3], [14, -10]])), `
  ${glow(0, -11, 32, 'ember', 0.85)}${glow(0, -10, 13, 'gold', 0.7)}
  <path d="${curve([[-6.5, -9.5], [-4.5, -18], [0, -22.5], [1, -14], [4.5, -20], [6.5, -9.5]])}" fill="url(#§f-fire)" class="a-flick" opacity=".9"/>
`)

/** 登记簿(原点在书脊底部) */
export const ledger = (): string => sil(shape(line([[-12, 0], [-13.5, -4.5], [11, -4.5], [13, 0]])), `
  <path d="M-11.5 -2.2H11.5" stroke="#c8b48a" stroke-width="1" opacity=".55"/>
  <path d="M-8 -3.4H2" stroke="${C.goldHi}" stroke-width=".8" opacity=".9"/>
`, C.ink2)

/** 推开一条缝的酒馆门,门外是夜(原点在门槛中央) */
export const doorNight = (): string => sil(`
  ${shape(line([[-26, 0], [-26, -82], [26, -82], [26, 0], [21, 0], [21, -77], [-21, -77], [-21, 0]]))}
  ${shape(line([[-21, 0], [-21, -77], [-4, -70], [-4, -3]]))}
`, `
  <linearGradient id="§dnight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2240"/><stop offset="1" stop-color="#3a2418"/></linearGradient>
  <path d="M-4 -70L21 -77L21 0L-4 -3Z" fill="url(#§dnight)" opacity=".9"/>
  <path d="M-19 -72L-6 -66M-19 -40L-6 -37" stroke="${C.gold}" stroke-width=".9" opacity=".35"/>
`, C.ink2)

// ─── 迷城之门 ───────────────────────────────────────────────────────
/** 迷城之门:两扇高过城墙的黑石门虚掩,门缝里渗出带灰烬味的热气 */
export const greatGate = (): string => `
  ${glow(0, -64, 96, 'ember', 0.6)}
  <path d="M-7 -170H7L10 0H-10Z" fill="#ff9a4a" opacity=".6"/>
  ${sil(`
    ${shape(line([[-122, 0], [-122, -170], [-14, -170], [-9, 0]]))}
    ${shape(line([[122, 0], [122, -170], [14, -170], [9, 0]]))}
    ${shape(line([[-156, 0], [-156, -170], [-122, -170], [-122, 0]]))}
    ${shape(line([[156, 0], [156, -170], [122, -170], [122, 0]]))}
  `, `
    <g stroke="#3a2416" stroke-width="1.3" opacity=".75">${[34, 86, 138].map((y) => `<path d="M-116 -${y}H-15M15 -${y}H116"/>`).join('')}</g>
    <g fill="#4a2f1c">${[-102, -72, -42].flatMap((x) => [34, 86].map((y) => `<circle cx="${x}" cy="-${y}" r="1.9"/>`)).join('')}${[102, 72, 42].flatMap((x) => [34, 86].map((y) => `<circle cx="${x}" cy="-${y}" r="1.9"/>`)).join('')}</g>
    <g stroke="${C.ember}" stroke-width="1" opacity=".5" class="a-flick"><path d="M-62 -160l6 22-4 18M72 -150l-5 20 4 16M-84 -60l5 18"/></g>
  `)}
  ${mist(-36, 42, '#ff9a4a', 0, 0.2, 'a-drift')}
`

/** 台阶 */
export const stairs = (wide = 160): string => sil(`
  ${rect(-wide, -6, wide * 2, 6)}${rect(-wide * 0.88, -12, wide * 1.76, 6)}${rect(-wide * 0.76, -18, wide * 1.52, 6)}
`, `<g stroke="${C.gold}" stroke-width=".8" opacity=".22"><path d="M${-wide} -6H${wide}M${-wide * 0.88} -12H${wide * 0.88}M${-wide * 0.76} -18H${wide * 0.76}"/></g>`, C.ink2)

/** 晨雾里镇子尽头的迷城之门(远景) */
export const gateFar = (): string => `
  <path d="M-82 0L-56 -54L-38 -66L-22 -58L-6 -80L12 -60L30 -70L50 -48L82 0Z" fill="#120a08"/>
  <path d="M-3.5 0V-54A3.5 6 0 0 1 3.5 -54V0Z" fill="#ff8a3a" opacity=".85"/>
  ${glow(0, -30, 36, 'ember', 0.55)}
`

// ─── 路边 / 镇子 ────────────────────────────────────────────────────
/** 古井:石砌井栏、冒热水的井口 */
export const well = (): string => `
  ${glow(0, -34, 30, 'ember', 0.4)}
  ${sil(`
    ${shape(line([[-30, 0], [-30, -30], [30, -30], [30, 0]]))}
    ${shape(line([[-34, -30], [-34, -36], [34, -36], [34, -30]]))}
    ${stroke(line([[-24, -36], [-24, -72]], false), 3)}${stroke(line([[24, -36], [24, -72]], false), 3)}
    ${shape(line([[-33, -70], [0, -84], [33, -70], [33, -66], [0, -80], [-33, -66]]))}
  `, `
    <ellipse cx="0" cy="-33" rx="24" ry="4.5" fill="#1a0c08"/>
    <ellipse cx="0" cy="-33" rx="19" ry="3.2" fill="#ff6a2a" opacity=".55"/>
    ${stroke(line([[-24, -62], [24, -62]], false), 2.4)}${rect(-1.6, -62, 3.2, 16)}
    <g stroke="#000" stroke-opacity=".35" stroke-width="1"><path d="M-30 -15H30M-15 -30V-15M15 -30V-15M0 -15V0"/></g>
    <g class="a-rise" style="animation-duration:3.2s"><path d="M-8 -38q4 -8 0 -14t3 -14" fill="none" stroke="#ffe0c0" stroke-width="2.2" stroke-linecap="round" opacity=".35"/></g>
    <g class="a-rise" style="animation-duration:3.8s;animation-delay:1.1s"><path d="M9 -38q-4 -8 0 -14t-3 -12" fill="none" stroke="#ffe0c0" stroke-width="1.8" stroke-linecap="round" opacity=".28"/></g>
  `, C.ink2)}`

/** 路边神龛:没有脸的神像 + 签筒 */
export const shrineStone = (ruined = false): string => `
  ${glow(0, -34, 40, 'gold', 0.4)}
  ${sil(`
    ${shape(line([[-26, 0], [-26, -8], [26, -8], [26, 0]]))}
    ${shape(line([[-20, -8], [-20, -62], [0, -74], [20, -62], [20, -8]]))}
    ${ruined ? shape(line([[4, -60], [20, -48], [20, -34], [8, -44]])) : ''}
    ${shape(line([[-9, -8], [-9, -36], [-4, -44], [5, -44], [9, -36], [9, -8]]))}
    <circle cx="0" cy="-50" r="5.6"/>
    ${stroke(line([[20, 0], [20, -22]], false), 5)}
  `, `
    ${ruined ? '' : `<path d="M-20 -62L0 -74L20 -62" fill="none" stroke="${C.gold}" stroke-width="1" opacity=".35"/>`}
    <path d="M-9 -8V-36L-4 -44H5L9 -36V-8" fill="#120b07" opacity=".85"/>
    <circle cx="0" cy="-50" r="5.2" fill="#3a2a1c"/>
    <circle cx="0" cy="-50" r="3.4" fill="#5a4430" opacity=".7"/>
    <g stroke="#c8b48a" stroke-width="1.1" stroke-linecap="round"><path d="M19 -22l-1 -9M21 -22l2 -8M20 -22v-10"/></g>
    <g class="a-rise" style="animation-duration:4.4s"><path d="M0 -58q3 -6 0 -10t2 -10" fill="none" stroke="#d8c8a8" stroke-width="1.4" stroke-linecap="round" opacity=".3"/></g>
    <rect x="12" y="-6" width="14" height="6" rx="1" fill="${C.ink2}"/>
  `, C.ink2)}`

/** 烧焦的羊皮纸(残章) */
export const parchment = (): string => `
  ${glow(0, -10, 26, 'gold', 0.55)}
  <g class="a-float"><path d="${curve([[-15, 0], [-17, -9], [-12, -18], [-3, -16], [4, -22], [13, -15], [16, -6], [10, -1], [2, -3]])}" fill="#6a4a2a"/>
  <path d="${curve([[-13, -1], [-14, -9], [-10, -16], [-2, -14], [5, -19], [11, -13], [13, -6], [8, -2]])}" fill="#a8844e" opacity=".8"/>
  <g stroke="#3a220c" stroke-width="1" opacity=".8"><path d="M-9 -6H9M-9 -9.5H6M-9 -13H8"/></g>
  <path d="M6 -4.5l3 0" stroke="#e05545" stroke-width="1.6" data-fid="seal"/></g>`

/** 翻在沟里的商车 */
export const cart = (): string => sil(`
  ${shape(line([[-52, -4], [-46, -40], [22, -52], [46, -30], [38, -6]]))}
  ${shape(line([[-30, -22], [-6, -14], [20, -34]]))}
  <circle cx="-14" cy="-14" r="15"/><circle cx="-14" cy="-14" r="6"/>
  ${stroke(line([[26, -44], [58, -20], [70, -12]], false), 3.4)}
`, `
  <g stroke="#000" stroke-opacity=".4" stroke-width="1.4"><path d="M-40 -22L20 -40M-36 -34L22 -48M-30 -12L30 -30"/></g>
  <circle cx="-14" cy="-14" r="9.5" fill="none" stroke="#3a2a1c" stroke-width="1.6"/>
`, C.ink2)

export const crate = (s = 1): string => `<g transform="scale(${s})">${sil(shape(line([[-9, 0], [-9, -15], [9, -15], [9, 0]])), `<path d="M-9 -7.5H9M0 -15V0" stroke="#000" stroke-opacity=".4" stroke-width="1"/>`, C.ink2)}</g>`

/** 枯树 */
export const deadTree = (): string => sil(`
  ${shape(curve([[-5, 0], [-3, -40], [-6, -70], [-30, -96], [-40, -118], [-22, -100], [-8, -84], [-4, -104], [2, -128], [6, -100], [14, -112], [30, -124], [18, -104], [8, -80], [5, -44], [6, 0]]))}
  ${shape(curve([[4, -74], [28, -84], [44, -82], [26, -78], [8, -66]]))}
`, '', C.ink2)

// ─── 地城 ───────────────────────────────────────────────────────────
/** 火把(插在墙上,原点在火焰底部) */
export const torch = (): string => `
  ${glow(0, -8, 44, 'ember', 0.85)}
  ${sil(`${stroke(line([[0, 14], [0, -2]], false), 3.4)}${shape(line([[-4, 8], [4, 8], [4, 12], [-4, 12]]))}`, '', C.ink2)}
  ${flame(0, -2, 15, 6.5)}`

/** 岩石 */
export const rock = (w = 30, h = 16): string => sil(shape(curve([[-w, 0], [-w * 0.8, -h * 0.7], [-w * 0.3, -h], [w * 0.35, -h * 0.85], [w * 0.85, -h * 0.35], [w, 0]])), `<path d="${curve([[-w * 0.55, -h * 0.5], [-w * 0.2, -h * 0.78], [w * 0.3, -h * 0.66]], false)}" fill="none" stroke="${C.gold}" stroke-width=".8" opacity=".22"/>`, C.ink2)

/** 蛛网:从右上角的锚点向左下铺开 */
export const web = (): string => {
  const ax = 300, ay = -10, N = 9
  const ang = (i: number): number => Math.PI * (0.06 + (i / (N - 1)) * 0.94)
  const px = (i: number, r: number): number => ax - Math.cos(ang(i)) * r
  const py = (i: number, r: number): number => ay + Math.sin(ang(i)) * r * 0.72
  let spokes = ''
  for (let i = 0; i < N; i++) spokes += `M${ax} ${ay}L${px(i, 300).toFixed(0)} ${py(i, 300).toFixed(0)}`
  let rings = ''
  for (const r of [46, 92, 142, 198, 262]) {
    let d = ''
    for (let i = 0; i < N - 1; i++) {
      const x1 = px(i, r), y1 = py(i, r), x2 = px(i + 1, r), y2 = py(i + 1, r)
      const cx = (x1 + x2) / 2 * 0.86 + ax * 0.14, cy = (y1 + y2) / 2 * 0.86 + ay * 0.14
      d += `${i ? '' : `M${x1.toFixed(0)} ${y1.toFixed(0)}`}Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`
    }
    rings += `<path d="${d}"/>`
  }
  return `<g stroke="#cfd8e2" stroke-width=".55" fill="none" opacity=".42"><path d="${spokes}"/>${rings}</g>`
}

/** 吊茧(人的形状) */
export const cocoon = (): string => `
  <path d="M0 -150V-96" stroke="#cfd8e2" stroke-width="1" opacity=".55"/>
  <g class="a-sway" style="animation-duration:5s">${glow(0, -56, 30, 'ice', 0.3)}
  <path d="${curve([[0, -14], [-13, -22], [-15, -48], [-11, -78], [-5, -96], [6, -96], [12, -76], [15, -46], [12, -22]])}" fill="#d8dde6" opacity=".82"/>
  <g stroke="#8a94a2" stroke-width=".8" opacity=".7"><path d="M-13 -30Q0 -22 13 -32M-14 -50Q0 -40 14 -52M-11 -70Q0 -62 12 -72M-8 -88Q0 -82 9 -90"/></g>
  <ellipse cx="1" cy="-86" rx="6.5" ry="7.5" fill="#3a404c" opacity=".55"/></g>`

/** 古老的升降机吊笼 */
export const elevator = (): string => `
  <g stroke="#5a4a30" stroke-width="2"><path d="M-30 -170V-84M30 -170V-84"/></g>
  ${glow(0, -40, 60, 'gold', 0.45)}
  ${sil(`
    ${shape(line([[-40, 0], [-40, -86], [40, -86], [40, 0], [36, 0], [36, -82], [-36, -82], [-36, 0]]))}
    ${shape(line([[-44, 0], [-44, -5], [44, -5], [44, 0]]))}
    ${shape(line([[-44, -86], [-44, -91], [44, -91], [44, -86]]))}
    ${stroke(line([[-24, -82], [-24, -5]], false), 2)}${stroke(line([[-8, -82], [-8, -5]], false), 2)}${stroke(line([[8, -82], [8, -5]], false), 2)}${stroke(line([[24, -82], [24, -5]], false), 2)}
    ${stroke(line([[-36, -30], [36, -30]], false), 2)}${stroke(line([[-36, -60], [36, -60]], false), 2)}
  `, `
    <rect x="-12" y="-79" width="24" height="10" rx="1.5" fill="#8a6a2a"/>
    <text x="0" y="-71.5" text-anchor="middle" font-size="5.4" fill="#2a1a06" font-family="serif" letter-spacing=".6">二层</text>
    <g stroke="${C.gold}" stroke-width=".8" opacity=".4"><path d="M-40 -86H40"/></g>
  `, C.ink2)}`

/** 断桥:深渊裂谷上的石桥,断掉了中间三丈 */
export const brokenBridge = (): string => `
  ${sil(`
    ${shape(line([[-200, 0], [-200, -34], [-46, -34], [-52, -22], [-58, -6], [-62, 0]]))}
    ${shape(line([[200, 0], [200, -34], [40, -34], [46, -24], [50, -8], [54, 0]]))}
    ${shape(line([[-160, 0], [-160, -62], [-148, -62], [-148, -34]]))}${shape(line([[140, 0], [140, -62], [152, -62], [152, -34]]))}
    ${stroke(line([[-160, -62], [-62, -34]], false), 3)}${stroke(line([[152, -62], [52, -34]], false), 3)}
  `, `
    <g fill="#c8b48a" opacity=".85" data-fid="handholds">${[[-70, -30], [-78, -38], [-84, -46], [-90, -54], [60, -31], [68, -40], [74, -48]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.8"/>`).join('')}</g>
    <g stroke="#000" stroke-opacity=".4" stroke-width="1"><path d="M-200 -22H-58M60 -22H200M-110 -34V0M100 -34V0"/></g>
    <g stroke="${C.gold}" stroke-width=".8" opacity=".25"><path d="M-200 -34H-48M44 -34H200"/></g>
  `, C.ink2)}
  <g class="a-drift">${mist(-30, 30, '#000', 0.1, 0.5)}</g>`

/** 墙上的刻字 */
export const carving = (): string => `
  <g fill="${C.goldHi}" opacity=".92" class="a-glow" font-family="'Noto Serif SC','Songti SC',serif" font-weight="700">
    <text x="-70" y="-92" font-size="15" letter-spacing="2">别唤醒他。</text>
    <text x="-70" y="-74" font-size="15" letter-spacing="2">他已经很累了。</text>
  </g>
  <text x="-70" y="-60" font-size="7.2" fill="#a3906f" font-family="'Noto Serif SC','Songti SC',serif" font-style="italic" data-fid="carving2">他认得每一个下来的人。他只是……装作不认得。</text>
  <g stroke="#000" stroke-opacity=".5" stroke-width=".8"><path d="M-72 -96l4 3M22 -78l5 2M-68 -80l3 4"/></g>`

/** 血泉 + 石碑 */
export const bloodPool = (): string => `
  <linearGradient id="§blood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a3a"/><stop offset="1" stop-color="#7a0f0a"/></linearGradient>
  ${glow(0, -6, 80, 'red', 0.5)}
  <ellipse cx="0" cy="-8" rx="74" ry="15" fill="#2a0906"/>
  <ellipse cx="0" cy="-9" rx="68" ry="12.5" fill="url(#§blood)" opacity=".9"/>
  <ellipse cx="0" cy="-9" rx="46" ry="7.5" fill="none" stroke="#ffb49e" stroke-width=".6" opacity=".5"/>
  <g data-fid="reflection"><ellipse cx="0" cy="-11" rx="20" ry="6" fill="#ffd0c0" opacity=".22"/><circle cx="0" cy="-15" r="3.4" fill="#ffe4d8" opacity=".6"/><path d="M-6 -8Q0 -4 6 -8" fill="none" stroke="#ffe4d8" stroke-width="1" opacity=".45"/></g>
  <g class="a-rise" style="animation-duration:4.6s"><path d="M-20 -14q5 -8 0 -14t4 -14" fill="none" stroke="#ffb49e" stroke-width="2" stroke-linecap="round" opacity=".3"/></g>`

export const stele = (): string => sil(shape(line([[-12, 0], [-12, -50], [-6, -58], [7, -58], [12, -50], [12, 0]])), `
  <text x="0" y="-40" text-anchor="middle" font-size="11" fill="${C.red}" font-family="'Noto Serif SC','Songti SC',serif" font-weight="700" letter-spacing="1">饮</text>
  <text x="0" y="-26" text-anchor="middle" font-size="11" fill="${C.red}" font-family="'Noto Serif SC','Songti SC',serif" font-weight="700" letter-spacing="1">我</text>
`, C.ink2)

/** 燃烧的书架间飘的字句 */
export const burningLetters = (): string => {
  const chars = '火焰记得名字烬疫食欲记忆路堵头灯回家'.split('')
  return Array.from({ length: 22 }, (_, i) => {
    const x = (i * 173 + 40) % 380 + 10
    const y = (i * 97 + 20) % 120 + 18
    return `<g class="a-float" style="animation-delay:${(i * 0.31).toFixed(2)}s;animation-duration:${(3 + i % 4).toFixed(1)}s"><text x="${x}" y="${y}" font-size="${(7 + (i * 7) % 5).toFixed(0)}" fill="${i % 3 ? '#ffb060' : '#ffe08a'}" font-family="'Noto Serif SC','Songti SC',serif" opacity="${(0.35 + (i * 13 % 50) / 100).toFixed(2)}">${chars[i % chars.length]}</text></g>`
  }).join('')
}

/** 飘到眼前的一片灰烬 */
export const ashPage = (): string => `
  <g class="a-float">${glow(0, -12, 30, 'ember', 0.45)}
  <path d="${curve([[-14, -2], [-15, -14], [-8, -24], [0, -20], [7, -26], [14, -16], [13, -4], [4, -8]])}" fill="#3a2416" stroke="#ff9a4a" stroke-width=".7"/>
  <path d="M-9 -13H8M-8 -9H5" stroke="#ffb060" stroke-width="1.2" opacity=".8"/>
  <path d="M10 -24q3 -6 6 -9" fill="none" stroke="#ff7a33" stroke-width="1" opacity=".7"/></g>`

/** 石室上的结界(不烧的书) */
export const ward = (): string => `
  ${glow(0, -30, 90, 'blue', 0.22)}
  <ellipse cx="0" cy="-34" rx="86" ry="62" fill="none" stroke="${C.blue}" stroke-width="1" opacity=".3" class="a-flick"/>
  <ellipse cx="0" cy="-34" rx="80" ry="56" fill="none" stroke="${C.blue}" stroke-width=".6" opacity=".16"/>`

/** 摊开的日记 */
export const diary = (): string => `
  ${glow(0, -8, 36, 'gold', 0.6)}
  <path d="${curve([[-22, 0], [-21, -5], [0, -7], [21, -5], [22, 0], [0, -2]])}" fill="#efe4cc"/>
  <path d="M0 -2V-7" stroke="#5a3a1c" stroke-width="1"/>
  <g stroke="#3a220c" stroke-width=".7" opacity=".75"><path d="M-18 -3.4H-3M-18 -4.8H-4M3 -3.6H18M3 -5H16"/></g>
  <path d="M-16 -6.2H-6" stroke="${C.red}" stroke-width=".8" opacity=".9"/>`

/** 墙上的名字(迷宫之心) */
export const nameWall = (): string => {
  let rows = ''
  const names = '阿岚 石头 小满 林秋 白鸦 陈九 阿禾 大川 月娘 铁柱 云舟 顾远 苏叶 秦风 何欢 洛桑 陆离 半夏 青禾'.split(' ')
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 9; c++) {
      const x = -150 + c * 34 + (r % 2) * 9
      const y = -120 + r * 14.5
      rows += `<text x="${x}" y="${y}" font-size="${(6.5 + ((r * 7 + c * 3) % 4) * 0.6).toFixed(1)}" fill="${C.goldHi}" font-family="'Noto Serif SC','Songti SC',serif" opacity="${(0.22 + ((r * 11 + c * 5) % 7) * 0.07).toFixed(2)}">${names[(r * 9 + c) % names.length]}</text>`
    }
  }
  return rows
}
export const newName = (): string => `
  ${glow(0, -6, 30, 'gold', 0.7)}
  <text x="0" y="0" font-size="12" fill="${C.goldHi}" font-family="'Noto Serif SC','Songti SC',serif" font-weight="700" letter-spacing="2" class="a-glow">第七个</text>
  <path d="M-20 3H24" stroke="#ffd98a" stroke-width=".8" opacity=".5"/>`

/** 螺旋长阶,向下,尽头有红光 */
export const spiralStairs = (): string => `
  <path d="M-64 -170H64V0H-64Z" fill="#060303"/>
  ${glow(0, -6, 70, 'ember', 0.75)}
  ${sil(Array.from({ length: 9 }, (_, i) => { const w = 56 - i * 5.6; const y = -120 + i * 13.4; return rect(-w, y, w * 2, 5) }).join(''), '', C.ink2)}
  <g stroke="${C.ember}" stroke-width="1" opacity=".3" class="a-flick"><path d="M-58 -170l5 30-3 24M56 -160l-4 26 3 20"/></g>`

/** 灰烬堆成的王座 */
export const throne = (): string => `
  ${glow(0, -60, 110, 'ember', 0.5)}
  ${sil(`
    ${shape(line([[-74, 0], [-74, -10], [74, -10], [74, 0]]))}
    ${shape(line([[-62, -10], [-62, -20], [62, -20], [62, -10]]))}
    ${shape(line([[-30, -20], [-32, -118], [-20, -140], [-8, -126], [0, -146], [9, -126], [21, -140], [32, -118], [30, -20]]))}
    ${shape(line([[-44, -20], [-44, -66], [-30, -72]]))}${shape(line([[44, -20], [44, -66], [30, -72]]))}
  `, `
    <g fill="${C.ember}" opacity=".55" class="a-flick">${[[-18, -60], [8, -84], [16, -44], [-6, -104], [22, -68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2"/>`).join('')}</g>
    <g class="a-rise" style="animation-duration:3.4s"><circle cx="-12" cy="-70" r="1.1" fill="#ffd98a"/></g>
  `, C.ink2)}`

/** 低语之门:自己开了的大门,门后是无边的暖光 */
export const whisperGate = (): string => `
  <linearGradient id="§warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b8"/><stop offset=".6" stop-color="#ff9a4a"/><stop offset="1" stop-color="#b8361a"/></linearGradient>
  <path d="M-92 -170V-70A92 92 0 0 1 92 -70V0H-92Z" fill="url(#§warm)" opacity=".9"/>
  ${glow(0, -60, 150, 'gold', 0.55)}
  ${sil(`
    ${shape(line([[-150, 0], [-150, -170], [-96, -170], [-96, -70], [-84, -96], [-72, -70], [-72, 0]]))}
    ${shape(line([[150, 0], [150, -170], [96, -170], [96, -70], [84, -96], [72, -70], [72, 0]]))}
    ${shape(line([[-160, 0], [-160, -170], [-150, -170], [-150, 0]]))}${shape(line([[160, 0], [160, -170], [150, -170], [150, 0]]))}
  `, '', C.ink)}
  ${Array.from({ length: 12 }, (_, i) => { const x = ((i * 83) % 176) - 88; const y = -14 - ((i * 37) % 120); return `<g class="a-float" style="animation-delay:${(i * 0.42).toFixed(2)}s;animation-duration:${(2.4 + i % 3).toFixed(1)}s"><text x="${x}" y="${y}" font-size="${(6 + i % 3).toFixed(0)}" fill="#fff2d0" font-family="'Noto Serif SC','Songti SC',serif" opacity=".7">${'放下名字脸雪孩子酒'.split('')[i % 8]}</text></g>` }).join('')}`

/** 王座殿侧壁上仅容手臂的缝 */
export const wallCrack = (): string => `
  ${sil(shape(line([[-96, 0], [-96, -170], [96, -170], [96, 0], [3, 0], [5, -60], [2, -104], [-2, -150], [-4, -104], [-5, -60], [-3, 0]])), '', C.ink2)}
  ${glow(0, -90, 34, 'gold', 0.4)}
  <path d="M-3 0L-5 -60L-2 -104L2 -150L5 -104L3 0Z" fill="#050302"/>`

/** 三封没寄出的信 */
export const letters = (): string => `
  <g class="a-float">${glow(0, -10, 34, 'gold', 0.65)}
  ${[[-9, -5, -8], [1, -2, 4], [9, -7, 12]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-9" y="-14" width="18" height="11" rx="1" fill="#efe4cc"/><path d="M-9 -14L0 -7.5L9 -14" fill="none" stroke="#8a6a44" stroke-width=".8"/><circle cx="0" cy="-6.5" r="2.2" fill="#b3262a"/></g>`).join('')}</g>`

/** 烧黑的顶针 */
export const thimble = (): string => `
  ${glow(0, -6, 26, 'gold', 0.8)}
  <g class="a-float"><path d="M-5 0V-6A5 5 0 0 1 5 -6V0Z" fill="#1a1410" stroke="${C.gold}" stroke-width=".9"/>
  <g fill="#3a3028">${[-3, -1, 1, 3].map((x) => `<circle cx="${x}" cy="-6.5" r=".5"/>`).join('')}</g></g>`

/** 王座殿的地砖(会呼吸) */
export const floorTiles = (): string => {
  let d = ''
  for (let r = 0; r < 3; r++) { const y = -2 + r * 6.5; const hw = 70 + r * 70; d += `M${-hw} ${y}H${hw}` }
  for (let i = -6; i <= 6; i++) d += `M${i * 12} -2L${i * 30} 18`
  return `<g stroke="#ff9a50" stroke-opacity=".3" stroke-width=".9" class="a-flick"><path d="${d}"/></g>`
}

/** 深渊尽头的小摊:板凳 + 摊布 + 气若游丝的灯 */
const goods: [number, string][] = [[-12, 'sword'], [4, 'charm'], [20, 'potion'], [36, 'potion']]
export const stall = (): string => `
  ${glow(58, -30, 34, 'ice', 0.7)}
  ${sil(`
    ${rect(-70, -17, 40, 4.5)}${rect(-68, -13, 4, 13)}${rect(-36, -13, 4, 13)}
    ${shape(curve([[-20, 0], [-26, -6], [4, -9], [40, -7], [62, -5], [74, 0]]))}
    ${stroke(line([[58, -5], [58, -26]], false), 1.6)}
    ${shape(line([[53, -27], [63, -27], [61.5, -16], [54.5, -16]]))}
  `, `
    <rect x="55" y="-25.5" width="6" height="8" rx="1" fill="#dff2ff" opacity=".95"/>
    ${(goods as [number, string][]).map(([x, k]) => k === 'sword'
      ? `<path d="M${x} -8l16 -3" stroke="#e8b45a" stroke-width="1.6" stroke-linecap="round"/><path d="M${x + 1} -8.5l-3 -1.2M${x + 1} -8.5l1 2.6" stroke="${C.ink2}" stroke-width="1.4"/>`
      : k === 'charm' ? `<circle cx="${x}" cy="-10" r="3" fill="#7ab8ff" opacity=".9"/>`
        : `<rect x="${x - 1.8}" y="-13" width="3.6" height="5.5" rx="1" fill="${k === 'potion' && x > 10 ? '#ff6a5a' : '#6ee796'}" opacity=".9"/><rect x="${x - 0.7}" y="-15" width="1.4" height="2.4" fill="${C.ink2}"/>`).join('')}
    <path d="${curve([[-20, 0], [-26, -6], [4, -9], [40, -7], [62, -5], [74, 0]], false)}" fill="none" stroke="${C.gold}" stroke-width=".7" opacity=".3"/>
  `, C.ink2)}`

/** 篝火:前人垒起的石灶 */
export const campfire = (): string => `
  ${glow(0, -14, 120, 'ember', 0.75)}${glow(0, -10, 46, 'gold', 0.6)}${floorGlow(0, 2, 110, 'ember', 0.55)}
  ${sil(`${Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2; return shape(curve([[Math.cos(a) * 24 - 7, 0], [Math.cos(a) * 24, -8 - (i % 2) * 2], [Math.cos(a) * 24 + 7, 0]])) }).join('')}
    ${stroke(line([[-12, -5], [12, -9]], false), 4.4)}${stroke(line([[-10, -9], [12, -4]], false), 4.4)}`, '', C.ink2)}
  ${flame(0, -8, 34, 16)}${flame(-10, -7, 20, 9)}${flame(11, -7, 23, 10)}
  ${[-12, -3, 7, 14, 1].map((x, i) => `<g class="a-rise" style="animation-delay:${i * 0.5}s;animation-duration:${2.6 + i * 0.4}s"><circle cx="${x}" cy="-22" r="1.2" fill="#ffd98a"/></g>`).join('')}`

/** 蘑菇状的岩石 */
export const mushroomRock = (): string => sil(`
  ${shape(line([[-12, 0], [-12, -16], [16, -16], [16, 0]]))}
  ${shape(curve([[-34, -16], [-28, -30], [-8, -38], [16, -36], [32, -26], [34, -16]]))}
`, `<g stroke="#000" stroke-opacity=".35" stroke-width="1"><path d="M-24 -22Q0 -30 26 -21"/></g>${glow(0, -34, 34, 'blue', 0.2)}`, C.ink2)

/** 集市摊位(带雨棚) */
export const stallTent = (flipColors = false): string => sil(`
  ${stroke(line([[-40, 0], [-40, -52]], false), 2.4)}${stroke(line([[40, 0], [40, -52]], false), 2.4)}
  ${shape(line([[-48, -50], [48, -50], [42, -60], [-42, -60]]))}
  ${shape(line([[-44, -22], [44, -22], [44, -18], [-44, -18]]))}
`, `
  <g stroke="${flipColors ? C.red : C.gold}" stroke-width="3" opacity=".35">${[-36, -24, -12, 0, 12, 24, 36].map((x) => `<path d="M${x} -50V-60"/>`).join('')}</g>
  <g stroke="${C.gold}" stroke-width="1" opacity=".3"><path d="M-44 -22H44"/></g>
`, C.ink2)

/** 帐篷(兽皮) */
export const tent = (): string => sil(`
  ${shape(line([[-36, 0], [0, -54], [36, 0], [10, 0], [0, -26], [-10, 0]]))}
`, `<path d="M0 -54L10 0M0 -54L-10 0" stroke="#000" stroke-opacity=".45" stroke-width="1.2"/>`, C.ink2)

/** 倒置酒杯的旗 */
export const cupFlag = (): string => `
  ${stroke(line([[0, 0], [0, -96]], false), 2.4)}
  <path d="${curve([[1, -94], [22, -90], [44, -96], [42, -66], [22, -60], [1, -64]])}" fill="#5a1410" class="a-sway"/>
  <g fill="#e8ddc8" opacity=".9" transform="translate(22 -79)"><path d="M-6 -7h12l-3 8h-6z"/><rect x="-7" y="-9" width="14" height="2"/></g>`

/** 烤架上的不明肉块 */
export const grill = (): string => sil(`
  ${stroke(line([[-20, 0], [-14, -30]], false), 2.4)}${stroke(line([[20, 0], [14, -30]], false), 2.4)}${stroke(line([[-22, -30], [22, -30]], false), 2.2)}
  ${stroke(line([[-16, -30], [-16, -42]], false), 1)}${stroke(line([[0, -30], [0, -44]], false), 1)}${stroke(line([[16, -30], [16, -41]], false), 1)}
`, `
  <path d="${curve([[-20, -43], [-12, -48], [-10, -40]])}" fill="#6a2a1c"/><path d="${curve([[-4, -45], [4, -49], [6, -41]])}" fill="#6a2a1c"/><path d="${curve([[12, -42], [20, -46], [21, -38]])}" fill="#6a2a1c"/>
  <g class="a-rise" style="animation-duration:3.6s"><path d="M0 -48q4 -8 0 -14t3 -12" fill="none" stroke="#d8c8b8" stroke-width="1.6" stroke-linecap="round" opacity=".28"/></g>
`, C.ink2)

/** 酒桶 */
export const barrel = (s = 1): string => `<g transform="scale(${s})">${sil(shape(curve([[-11, 0], [-13, -15], [-11, -30], [11, -30], [13, -15], [11, 0]])), `<g stroke="${C.gold}" stroke-width="1.1" opacity=".4"><path d="M-12.4 -8H12.4M-12.4 -22H12.4"/></g>`, C.ink2)}</g>`

/** 石桌 */
export const stoneTable = (): string => sil(`
  ${rect(-46, -24, 92, 6)}${rect(-38, -18, 8, 18)}${rect(30, -18, 8, 18)}
`, `<path d="M-46 -24H46" stroke="${C.gold}" stroke-width=".9" opacity=".3"/>`, C.ink2)

/** 赌档:木板 + 骰盅 */
export const gambitBoard = (): string => sil(`
  ${rect(-58, -22, 116, 5)}${stroke(line([[-46, -17], [-50, 0]], false), 3)}${stroke(line([[46, -17], [50, 0]], false), 3)}
  ${shape(curve([[-8, -22], [-7, -34], [7, -34], [8, -22]]))}
`, `
  <path d="M-7 -34Q0 -40 7 -34" fill="none" stroke="${C.ink}" stroke-width="2"/>
  <g fill="${C.bone}">${[[-22, -24], [-16, -25.5], [30, -24.5]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3.4" height="3.4" rx=".6"/>`).join('')}</g>
  <g fill="${C.ink2}"><circle cx="-20.3" cy="-22.3" r=".5"/><circle cx="-14.3" cy="-23.8" r=".5"/><circle cx="31.7" cy="-22.8" r=".5"/></g>
`, C.ink2)

/** 哥布林的长矛:矛杆上密密麻麻刻着正字,七个半组 */
export const tallySpear = (): string => `
  ${glow(0, -4, 60, 'gold', 0.28)}
  <g transform="rotate(-7)">${sil(`${stroke(line([[-104, -3], [74, -3]], false), 5.4)}${shape(line([[74, -7], [93, -3], [74, 1]]))}`, `
    <text x="-92" y="-1.1" font-size="5.2" fill="${C.goldHi}" font-family="'Noto Serif SC','Songti SC',serif" letter-spacing="2.6" opacity=".92">正正正正正正正下</text>
    <path d="M78 -6L91 -3L78 0" fill="none" stroke="#c8ccd4" stroke-width=".8" opacity=".5"/>
  `)}</g>`

/** 一小堆灰 + 落地的长矛 */
export const ashPile = (): string => `${floorGlow(0, 0, 40, 'gold', 0.3)}<path d="${curve([[-22, 0], [-14, -6], [-2, -9], [12, -7], [22, 0]])}" fill="#8a8078" opacity=".55"/><g class="a-drift"><ellipse cx="4" cy="-12" rx="16" ry="4" fill="#a3988a" opacity=".22"/></g>`

/** 身后合拢的门 */
export const closingDoor = (): string => sil(`
  ${shape(line([[-150, 0], [-150, -170], [-24, -170], [-28, 0]]))}
  ${shape(line([[150, 0], [150, -170], [30, -170], [26, 0]]))}
`, `
  <path d="M-26 0L-25 -170M27 0L29 -170" stroke="#ff9a4a" stroke-width="1.6" opacity=".5" class="a-flick"/>
  <g stroke="#3a2416" stroke-width="1.2" opacity=".7"><path d="M-140 -50H-30M-140 -120H-28M34 -50H140M36 -120H140"/></g>
`, C.ink)

/** 隧道深处的黑暗 */
export const tunnelDark = (): string => `${sil(shape(line([[-44, 0], [-46, -46], [-30, -74], [0, -84], [30, -74], [46, -46], [44, 0]])), `<path d="M-30 0V-44A30 30 0 0 1 30 -44V0Z" fill="#030201"/>${glow(0, -30, 40, 'ember', 0.16)}`, C.ink)}`

/** 倒塌的立柱 */
export const fallenColumn = (): string => sil(`
  ${rect(-92, -13, 150, 13)}${shape(line([[58, -13], [74, -4], [74, 0], [58, 0]]))}
  ${shape(curve([[-104, 0], [-104, -16], [-92, -19], [-90, 0]]))}
`, `<g stroke="#000" stroke-opacity=".4" stroke-width="1.2"><path d="M-80 -13V0M-48 -13V0M-16 -13V0M16 -13V0M48 -13V0"/></g><path d="M-92 -13H58" stroke="${C.gold}" stroke-width=".8" opacity=".25"/>`, C.ink2)

/** 「炉火与骰子」酒馆的外观:矮房子、烟囱、暖黄的窗 */
export const inn = (): string => `
  ${glow(-20, -26, 64, 'gold', 0.4)}
  ${sil(`
    ${shape(line([[-96, 0], [-96, -50], [0, -92], [96, -50], [96, 0]]))}
    ${shape(line([[34, -66], [34, -104], [48, -104], [48, -58]]))}
  `, `
    <rect x="-62" y="-40" width="26" height="22" rx="2" fill="#f0b860" opacity=".75"/>
    <rect x="8" y="-40" width="26" height="22" rx="2" fill="#f0b860" opacity=".6"/>
    <rect x="-14" y="-36" width="18" height="36" rx="2" fill="#2a180c"/>
    <g stroke="#3a2416" stroke-width="1.2" opacity=".8"><path d="M-96 -50H96M-48 -71V0M48 -71V0"/></g>
    <g class="a-rise" style="animation-duration:4s"><path d="M41 -106q5 -8 0 -14t4 -12" fill="none" stroke="#c8b8a8" stroke-width="3" stroke-linecap="round" opacity=".3"/></g>
  `, C.ink2)}`

/** 一粒向下落的火星(原点 = 落点) */
export const sparkFall = (): string => `<g class="a-fall">${glow(0, 0, 16, 'gold', 0.9)}<circle r="2" fill="#ffd98a"/></g>`

// ─── 铁匠铺 / 街角 / 图书馆 / 塌方处 ────────────────────────────────
/** 墙上的武器架:剑、斧、锤、矛 */
export const weaponRack = (): string => sil(`
  ${rect(-52, -44, 104, 4)}
  ${rect(-48, -40, 4, 40)}${rect(44, -40, 4, 40)}
  ${stroke(line([[-34, -44], [-34, -82]], false), 3)}${shape(line([[-38, -86], [-30, -86], [-34, -98]]))}
  ${stroke(line([[-12, -44], [-12, -80]], false), 3)}${shape(curve([[-12, -98], [7, -93], [9, -76], [-10, -78]]))}
  ${stroke(line([[12, -44], [12, -80]], false), 3)}${rect(3, -92, 18, 10)}
  ${stroke(line([[36, -44], [36, -100]], false), 2.6)}${shape(line([[31.5, -100], [36, -113], [40.5, -100]]))}
`, `<g stroke="#c8ccd4" stroke-width="1" stroke-linecap="round" opacity=".6"><path d="M-34 -84V-54M36 -98V-56M4 -87H20"/></g><path d="M-52 -44H52" stroke="${C.gold}" stroke-width=".9" opacity=".45"/>`, C.ink2)

/** 铁砧 */
export const anvil = (): string => sil(`
  ${shape(line([[-24, -18], [20, -18], [29, -24], [12, -30], [-23, -30]]))}
  ${shape(line([[-9, -18], [-12, -6], [-19, 0], [17, 0], [10, -6], [8, -18]]))}
`, `<path d="M-23 -30H12" stroke="#c8ccd4" stroke-width="1.1" opacity=".6"/>`, C.ink2)

/** 地上的琴盒,里面几枚赏钱 */
export const luteCase = (): string => sil(shape(curve([[-23, 0], [-25, -8], [0, -11], [25, -8], [23, 0], [0, -3]])), `
  <ellipse cx="0" cy="-6.4" rx="18" ry="2.8" fill="#3a2a1c"/>
  <g fill="${C.gold}"><circle cx="-8" cy="-6.6" r="1.4"/><circle cx="-2.5" cy="-5.7" r="1.4"/><circle cx="5" cy="-6.6" r="1.4"/></g>`, C.ink2)

/** 一摞书 */
export const bookPile = (): string => sil(Array.from({ length: 6 }, (_, i) => {
  const w = 30 - i * 2.4
  return `<g transform="translate(${i % 2 ? 3 : -2} ${(-i * 4.2).toFixed(1)})"><rect x="${(-w / 2).toFixed(1)}" y="-4" width="${w.toFixed(1)}" height="4" rx=".8"/></g>`
}).join(''), `<g stroke="${C.gold}" stroke-width=".6" opacity=".35">${[0, 1, 2, 3, 4, 5].map((i) => { const w = 30 - i * 2.4; return `<path d="M${((i % 2 ? 3 : -2) - w / 2).toFixed(1)} ${(-i * 4.2 - 3.6).toFixed(1)}h${w.toFixed(1)}"/>` }).join('')}</g>`, C.ink2)

/** 塌方的瓦砾堆 */
export const rubble = (): string => sil(shape(curve([[-46, 0], [-38, -16], [-23, -12], [-13, -31], [2, -24], [15, -39], [29, -22], [41, -14], [47, 0]])), `
  <g stroke="#000" stroke-opacity=".45" stroke-width="1.1"><path d="M-30 -9l9 -6M5 -19l10 -5M22 -13l8 -4M-9 -23l7 -5M-40 -6l6 -3"/></g>
  <g stroke="${C.gold}" stroke-width=".7" opacity=".2"><path d="M-38 -16l15 4M-13 -31l15 7M15 -39l14 17"/></g>`, C.ink2)

// ─── 新增支线用:钟 / 飞舞的纸页 / 渡魂船 / 灰烬镜 / 灰烬花 / 酒桶墙 / 烬雨 ───
/** 钟楼里的大钟(原点在钟口) */
export const bell = (): string => sil(`
  ${stroke(line([[0, -80], [0, -120]], false), 4)}
  ${shape(curve([[-7, -78], [-9, -86], [-21, -80], [-31, -50], [-36, -10], [-41, 0], [41, 0], [36, -10], [31, -50], [21, -80], [9, -86], [7, -78]]))}
  ${stroke(line([[0, -8], [0, 4]], false), 3.4)}${disc(0, 7, 5.2)}
`, `
  <g stroke="${C.gold}" stroke-width="1" opacity=".42"><path d="M-35 -14Q0 -4 35 -14M-25 -56Q0 -48 25 -56"/></g>
  <g stroke="${C.gold}" stroke-width=".7" opacity=".22"><path d="M-13 -72V-10M13 -72V-10M0 -76V-12"/></g>
  <g class="a-flick" style="animation-duration:2.6s">${glow(0, -40, 50, 'gold', 0.3)}</g>
`, C.ink2)

/** 被风吹上天的登记簿纸页 */
export const flyPages = (): string => ([[-46, -74, -18], [-10, -108, 12], [24, -88, -30], [54, -122, 20], [2, -146, -8], [74, -64, 28], [-70, -128, 36]] as [number, number, number][]).map(([x, y, r], i) =>
  `<g transform="translate(${x} ${y}) rotate(${r})"><g class="a-float" style="animation-delay:${(i * 0.5).toFixed(1)}s;animation-duration:${(2.6 + (i % 3) * 0.5).toFixed(1)}s"><path d="${curve([[-8, -11], [7, -12], [8, 10], [-7, 11]])}" fill="#e6dcc4"/><g stroke="#5a4a36" stroke-width=".7" opacity=".7"><path d="M-5 -7H4M-5 -3.5H5M-5 0H2M-5 3.5H5M-5 7H3"/></g><path d="M-5 -7H1" stroke="#1a120c" stroke-width="1.6" opacity=".75"/></g></g>`).join('')

/** 渡魂船(原点在水线中央),船夫由场景另摆 */
export const boat = (): string => `
  ${glow(0, -14, 100, 'blue', 0.28)}
  ${sil(`${shape(curve([[-98, -18], [-70, -7], [0, -3], [70, -7], [98, -20], [84, 0], [0, 5], [-84, 0]]))}${stroke(line([[78, -22], [94, -104]], false), 2.6)}`,
    `<path d="${curve([[-92, -16], [0, -5], [92, -17]], false)}" fill="none" stroke="${C.gold}" stroke-width=".8" opacity=".35"/>`, C.ink2)}
  <g stroke="#7ab8ff" stroke-opacity=".28" stroke-width="1" class="a-drift"><path d="M-150 2h54M60 5h70M-40 9h64"/></g>`

/** 磨平的灰烬立镜:照得出影,照不出色。镜中的影可聚焦 */
export const mirror = (): string => sil(`
  ${shape(line([[-22, 0], [-26, -98], [-20, -112], [20, -112], [26, -98], [22, 0]]))}
  ${shape(line([[-30, 0], [30, 0], [26, -5], [-26, -5]]))}
`, `
  <path d="${line([[-19, -6], [-22, -96], [-17, -107], [17, -107], [22, -96], [19, -6]])}" fill="#3a333a"/>
  <g data-fid="reflection" opacity=".55"><circle cx="0" cy="-80" r="8" fill="#8a8088"/><path d="${curve([[-13, -10], [-15, -60], [0, -70], [15, -60], [13, -10]])}" fill="#7a707a"/><path d="${curve([[-13, -56], [-24, -30], [-20, -14]], false)}" fill="none" stroke="#7a707a" stroke-width="5" stroke-linecap="round"/></g>
  <g stroke="#fff" stroke-width=".8" opacity=".16"><path d="M-14 -98L4 -12M-6 -100L12 -14"/></g>
`, C.ink2)

/** 灰烬花园:从地砖缝里堆出来的一朵朵灰花,没有茎也没有叶 */
export const ashFlowers = (): string => {
  const flower = (x: number, y: number, r: number, litUp: boolean): string =>
    `<g transform="translate(${x} ${y})">${glow(0, 0, r * 3.2, 'gold', litUp ? 0.6 : 0.22)}<g fill="${litUp ? '#efe4cc' : '#cfc3b0'}">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="0" cy="${(-r * 0.62).toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" ry="${(r * 0.62).toFixed(1)}" transform="rotate(${a})"/>`).join('')}</g><circle r="${(r * 0.3).toFixed(1)}" fill="${C.goldHi}" opacity=".85"/></g>`
  return Array.from({ length: 19 }, (_, i) => {
    const x = -180 + i * 20 + (i % 3) * 4
    const y = -((i * 7) % 9)
    return flower(x, y, 5.5 + (i * 5) % 4.5, i === 12)
  }).join('')
}

/** 一整面墙的酒桶 */
export const barrelStack = (): string => Array.from({ length: 12 }, (_, i) => {
  const c = i % 4
  const r = Math.floor(i / 4)
  return `<g transform="translate(${-58 + c * 38 + (r % 2) * 19} ${-r * 29})">${barrel()}</g>`
}).join('')

/** 烬雨:温热的灰从天上慢慢飘下来(原点在地面) */
export const ashRain = (): string => Array.from({ length: 40 }, (_, i) => {
  const x = (i * 113) % 400
  return `<g class="a-ashfall" style="animation-delay:-${((i * 0.37) % 5).toFixed(2)}s;animation-duration:${5 + (i % 5)}s"><circle cx="${x}" cy="0" r="${(0.7 + (i % 3) * 0.4).toFixed(1)}" fill="#e8dcc8" opacity=".65"/></g>`
}).join('')

/** 花园里的小木牌 */
export const signBoard = (): string => sil(`${rect(-2, -26, 4, 26)}${shape(line([[-19, -45], [19, -45], [19, -26], [-19, -26]]))}`,
    `<g stroke="#3a2a1c" stroke-width="1" opacity=".7"><path d="M-13 -39H13M-13 -34.5H8M-13 -30H11"/></g><path d="M-19 -45H19" stroke="${C.gold}" stroke-width=".8" opacity=".3"/>`, C.ink2)

// ─── 物件注册表(零参函数;sceneArt 用键名引用) ──────────────────────
export const PROPS = {
  fireplace, portrait, window: windowTower, barcounter, stool, lamp, lamppost, table, bowl, ledger, doorNight,
  greatGate, stairs, gateFar,
  well, shrine: shrineStone, shrineRuin: () => shrineStone(true), parchment, cart, crate, deadTree,
  torch, rock, web, cocoon, elevator, brokenBridge, carving, bloodPool, stele, burningLetters, ashPage,
  ward, diary, nameWall, newName, spiralStairs, throne, whisperGate, wallCrack, letters, thimble, floorTiles,
  stall, campfire, mushroomRock, stallTent, tent, cupFlag, grill, barrel, stoneTable, gambitBoard, tallySpear,
  ashPile, closingDoor, tunnelDark, fallenColumn, inn, sparkFall,
  weaponRack, anvil, luteCase, bookPile, rubble,
  bell, flyPages, boat, mirror, ashFlowers, barrelStack, ashRain, signBoard,
  // 人物与怪物
  player: F.player, granny: F.granny, flamegranny: () => F.flameGranny(0.9), banjo: F.banjo, banjoSit: () => F.banjo(true),
  signers: F.signers, worker: F.worker, onlookers: F.onlookers, beggar: F.beggar, ghostChild: F.ghostChild,
  goblin: F.goblin, goblinGambler: () => F.goblin('gambler'), goblinCook: () => F.goblin('cook'),
  gargoyle: F.gargoyle, spider: F.spider, skeleton: F.skeleton, skeletonClimb: () => F.skeleton(true), ghoul: F.ghoul, ghouls: F.ghouls,
  mimic: F.mimic, mimicOpen: () => F.mimic(true), shadow: F.shadow, shadows: F.shadows, orc: F.orc, orcSeated: () => F.orc(true),
  necromancer: F.necromancer, necromancerKneel: () => F.necromancer(true), minotaur: F.minotaur, minotaurKneel: () => F.minotaur(true),
  tendril: F.tendril, tendrils: F.tendrils, king: F.emberKing, kingKneel: () => F.emberKing(true), retinue: F.retinue,
  wisp: F.wisp, emberbat: F.emberbat, ashKnight: F.ashKnight, merchant: F.merchant, merchantBlind: () => F.merchant(true),
  smith: F.smith, watchman: F.watchman, ferryman: F.ferryman, hound: F.hound, traveler: F.merchantMan, travelerRun: () => F.merchantMan(true),
  drover: F.drover, crows: F.crows,
} satisfies Record<string, () => string>

export type PropId = keyof typeof PROPS
export type PropFn = () => string
