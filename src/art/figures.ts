// ─── 人物与怪物剪影 ─────────────────────────────────────────────────
// 每个函数返回以「底部中心」为原点的 SVG 片段;朝向 +x 为正面。
import { C, curve, disc, fig, figure, flat, glow, lit, line, shape, sil, stroke } from './kit'
import type { ClassId } from '../game/types'

let PLAYER: ClassId = 'fighter'
/** 渲染器摆放 player 物件前调用:决定画面里「你」的职业剪影 */
export const setPlayer = (c: ClassId): void => { PLAYER = c }

const CLASS_FIG: Record<ClassId, Parameters<typeof fig>[0]> = {
  fighter: { h: 48, bw: 1.12, head: 'helmet', cloak: 'short', hand: 'sword' },
  mage: { h: 48, bw: 0.9, head: 'hat', cloak: 'robe', hand: 'staff' },
  rogue: { h: 47, bw: 0.94, head: 'hood', cloak: 'short', hand: 'dagger' },
  cleric: { h: 48, bw: 1, head: 'none', cloak: 'long', hand: 'mace' },
  bard: { h: 47, bw: 0.96, head: 'hat', cloak: 'short', hand: 'lute' },
  paladin: { h: 48, bw: 1.14, head: 'helmet', cloak: 'long', hand: 'swordUp' },
}

/** 你(按职业变化) */
export const player = (): string => {
  const cls = PLAYER
  const extra = cls === 'cleric'
    ? `${lit(0, -0.66 * 48, 1.7, 'gold', C.goldHi)}`
    : cls === 'paladin'
      ? `<path d="${line([[-0.1 * 48, -0.72 * 48], [0, -0.78 * 48], [0.1 * 48, -0.72 * 48]], false)}" fill="none" stroke="${C.gold}" stroke-width="1.1" opacity=".7"/>`
      : cls === 'bard'
        ? `<path d="${line([[-2, -1.0 * 47], [-7, -1.2 * 47]], false)}" fill="none" stroke="${C.red}" stroke-width="1.6" stroke-linecap="round"/>`
        : ''
  return figure({ ...CLASS_FIG[cls] }, extra)
}

/** 单个职业剪影(创建角色页等处使用) */
export const playerOfClass = (c: ClassId): string => figure({ ...CLASS_FIG[c] })

/** 炉火婆婆:发髻、披肩、围裙、拨火棍 */
export const granny = (): string => {
  const h = 39
  const p = fig({ h, bw: 1.06, head: 'bun', cloak: 'short', hand: 'poker', lean: 9 })
  return sil(p.body, `
    <path d="${line([[-0.07 * h, -0.5 * h], [0.07 * h, -0.5 * h], [0.095 * h, -0.2 * h], [-0.095 * h, -0.2 * h]])}" fill="#7a6248" opacity=".5"/>
    <path d="${curve([[-0.105 * h, -0.74 * h], [0, -0.64 * h], [0.105 * h, -0.74 * h]], false)}" fill="none" stroke="${C.gold}" stroke-width="1" opacity=".5"/>
    <path d="${line([[-0.08 * h, -0.86 * h], [-0.12 * h, -0.74 * h]], false)}" fill="none" stroke="${C.gold}" stroke-width=".9" opacity=".55"/>
  `)
}

/** 火焰借着热浪画出来的婆婆(篝火对面的火影):半透明、会晃 */
export const flameGranny = (opacity = 0.9): string => {
  const h = 42
  const p = fig({ h, bw: 1.06, head: 'bun', cloak: 'short', hand: 'none', pose: 'sit', lean: 6 })
  return `${glow(0, -0.4 * h, 0.9 * h, 'ember', 0.5 * opacity)}
    <g class="a-flick" style="animation-duration:2.3s" opacity="${opacity}">
      <g fill="url(#§f-fire)" opacity=".72">${p.body}</g>
      <g fill="${C.goldHi}" opacity=".5">${p.body.replace(/stroke-width="[^"]*"/g, 'stroke-width="1"')}</g>
    </g>
    ${p.detail}`
}

/** 骷髅诗人班卓:单弦鲁特琴,眼窝里两点蓝火,肋骨隐约可见 */
export const banjo = (sitting = false): string => {
  const h = 43
  const p = fig({ h, bw: 0.86, head: 'skull', cloak: 'none', hand: 'lute', pose: sitting ? 'sit' : 'stand', eyes: C.blue })
  const yw = -0.52 * h + (sitting ? 0.2 * h : 0)
  const ribs = [0.02, 0.05, 0.08].map((d) => `<path d="${curve([[-0.055 * h, yw + d * h + 0.1 * h], [0, yw + d * h + 0.13 * h], [0.05 * h, yw + d * h + 0.1 * h]], false)}" fill="none" stroke="${C.bone}" stroke-width=".8" opacity=".55"/>`).join('')
  return sil(p.body, ribs + p.detail)
}

/** 酒馆里其他签字的冒险者(一组背影) */
export const signers = (): string => {
  const a = fig({ h: 45, bw: 1.08, head: 'helmet', cloak: 'short', hand: 'none', lean: 6 })
  const b = fig({ h: 43, bw: 0.92, head: 'hood', cloak: 'long', hand: 'none', pose: 'stand', lean: 8 })
  return `<g transform="translate(-9 0)">${sil(a.body)}</g><g transform="translate(13 0) scale(-1 1)">${sil(b.body)}</g>`
}

/** 酒馆伙计(推人那个) */
export const worker = (): string => figure({ h: 44, bw: 1.1, head: 'none', cloak: 'short', hand: 'none', lean: 14 })

/** 围观的人(远处一排,只做剪影) */
export const onlookers = (): string => {
  const hs = [36, 40, 34, 41, 37]
  return hs.map((h, i) => `<g transform="translate(${(i - 2) * 17} 0)">${flat(fig({ h, bw: 0.95 + (i % 2) * 0.14, head: i % 2 ? 'hood' : 'none', cloak: i % 3 ? 'short' : 'long', hand: 'none' }).body, C.far)}</g>`).join('')
}

/** 六指的乞丐(坐着,碗里的硬币码得整整齐齐)。第六根手指单独可聚焦 */
export const beggar = (): string => {
  const h = 42
  const p = fig({ h, bw: 1.1, head: 'hood', cloak: 'long', hand: 'bowl', pose: 'sit', lean: 16 })
  const coins = Array.from({ length: 6 }, (_, i) => `<rect x="${-2 + (i % 2) * 3}" y="${(-0.3 - Math.floor(i / 2) * 0.028) * h - 2}" width="4.2" height="1.8" rx=".8" fill="${C.gold}" opacity=".9"/>`).join('')
  return `${sil(p.body)}
    <g data-fid="hand">${sil(shape(line([[0.14 * h, -0.37 * h], [0.23 * h, -0.38 * h], [0.25 * h, -0.355 * h], [0.15 * h, -0.345 * h]])) + shape(line([[0.17 * h, -0.36 * h], [0.2 * h, -0.43 * h], [0.215 * h, -0.42 * h], [0.195 * h, -0.35 * h]])))}
      <path d="${curve([[0.2 * h, -0.42 * h], [0.215 * h, -0.46 * h], [0.23 * h, -0.44 * h]], false)}" fill="none" stroke="${C.ice}" stroke-width="1.3" stroke-linecap="round" opacity=".9"/></g>
    <g transform="translate(${0.13 * h} ${-0.075 * h})">${coins}</g>`
}

/** 带路的幽灵小孩:半透明、脚不沾地、衣角飘 */
export const ghostChild = (): string => {
  const h = 25
  const p = fig({ h, bw: 0.9, head: 'none', cloak: 'short', pose: 'sit', eyes: C.ice })
  return `<g class="a-float">${glow(0, -0.35 * h, 0.9 * h, 'ice', 0.6)}<g fill="${C.ice}" stroke="${C.ice}" opacity=".55">${p.body}</g>
    <path d="${curve([[-0.09 * h, -0.28 * h], [-0.16 * h, -0.16 * h], [-0.1 * h, -0.06 * h]], false)}" fill="none" stroke="${C.ice}" stroke-width="2.2" stroke-linecap="round" opacity=".4"/></g>${p.detail}`
}

/** 地精(哨兵持矛 / 赌徒摇骰盅) */
export const goblin = (kind: 'sentry' | 'gambler' | 'cook' = 'sentry'): string => {
  const h = kind === 'sentry' ? 34 : 30
  const p = fig({ h, bw: 1.15, head: kind === 'cook' ? 'hat' : 'ears', cloak: 'none', hand: kind === 'sentry' ? 'spear' : 'bowl', pose: kind === 'sentry' ? 'crouch' : 'sit', eyes: C.green, lean: 10 })
  return sil(p.body, p.detail)
}

/** 石像鬼:蹲伏、张开砂砾般的翅膀 */
export const gargoyle = (): string => {
  const b = `
    ${shape(curve([[-40, -6], [-30, -44], [-12, -30], [-6, -46]]))}
    ${shape(curve([[40, -6], [30, -44], [12, -30], [6, -46]]))}
    ${shape(curve([[-9, 0], [-11, -30], [-4, -46], [8, -47], [13, -34], [11, -20], [13, 0]]))}
    ${shape(curve([[-3, -45], [-2, -57], [9, -58], [13, -48], [8, -43]]))}
    ${shape(line([[-2, -57], [-6, -64], [1, -58]]))}
    ${shape(line([[9, -58], [13, -65], [13, -56]]))}
    ${stroke(line([[-9, -22], [-22, -12], [-20, -2]], false), 5)}
    ${stroke(line([[11, -22], [22, -13], [21, -2]], false), 5)}
    ${stroke(line([[-6, -2], [-9, 0]], false), 6)}
    ${stroke(line([[9, -2], [13, 0]], false), 6)}`
  return sil(b, `${lit(1, -51, 1.6, 'ember', C.goldHi)}${lit(8, -51.5, 1.6, 'ember', C.goldHi)}`)
}

/** 洞穴巨蛛:比马还大,从穹顶垂下一根丝 */
export const spider = (): string => {
  const legs = (side: 1 | -1): string => [-14, -4, 7, 18].map((a, i) =>
    stroke(line([[side * 8, -30 + a * 0.2], [side * (26 + i * 2), -54 - a * 0.5 + i * 4], [side * (44 + i * 5), -40 + a * 0.9 + i * 5]], false), 3.4 - i * 0.25)).join('')
  return `<path d="M0 -170V-62" stroke="#cfd8e2" stroke-width=".7" opacity=".45"/>
    ${sil(`${shape(curve([[0, -62], [19, -52], [22, -34], [12, -22], [-12, -22], [-22, -34], [-19, -52]]))}${disc(0, -58, 9)}${legs(1)}${legs(-1)}`,
    `${lit(-3.4, -59, 1.3, 'green', C.green)}${lit(3.4, -59, 1.3, 'green', C.green)}${glow(0, -36, 20, 'green', 0.35)}<ellipse cx="0" cy="-34" rx="9" ry="11" fill="#6fbf4a" opacity=".5"/>`)}`
}

/** 骷髅兵:锈剑上系着褪色的平安结 */
export const skeleton = (climbing = false): string => {
  const h = 44
  const p = fig({ h, bw: 0.9, head: 'skull', cloak: 'none', hand: 'sword', pose: climbing ? 'kneel' : 'stand', eyes: C.red })
  return sil(p.body, `<path d="${line([[0.3 * h, -0.1 * h], [0.29 * h, -0.05 * h]], false)}" stroke="${C.red}" stroke-width="3" stroke-linecap="round" fill="none" data-fid="knot"/><path d="${line([[0.265 * h, -0.045 * h], [0.25 * h, 0.012 * h]], false)}M${line([[0.315 * h, -0.045 * h], [0.33 * h, 0.012 * h]], false)}" stroke="${C.red}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".85"/>${p.detail}`)
}

/** 食尸鬼:弓着身子、长臂、头前伸,贴着墙皮爬行 */
export const ghoul = (): string => {
  const b = `
    ${shape(curve([[-14, 0], [-19, -13], [-13, -31], [-2, -41], [12, -45], [23, -41], [29, -31], [23, -21], [19, -9], [17, 0]]))}
    ${shape(curve([[17, -47], [25, -56], [36, -52], [37, -43], [28, -38]]))}
    ${stroke(line([[-9, -31], [-27, -17], [-35, -2]], false), 4.2)}
    ${stroke(line([[15, -29], [32, -15], [41, -1]], false), 4.2)}
    ${stroke(line([[-8, -6], [-11, 0]], false), 5.4)}
    ${stroke(line([[10, -6], [13, 0]], false), 5.4)}`
  return sil(b, `${lit(31, -48, 1.3, 'green', C.green)}${lit(34.5, -46, 1.3, 'green', C.green)}`)
}
export const ghouls = (): string => `<g transform="translate(-62 0) scale(.9)">${ghoul()}</g><g transform="translate(54 0) scale(-1 1)">${ghoul()}</g>${ghoul()}`

/** 宝箱怪:橡木包黄铜,盖上一块红绒布——以及咧开的獠牙 */
export const mimic = (open = false): string => {
  const lid = open
    ? shape(curve([[-30, -30], [-26, -56], [20, -58], [30, -30]]))
    : shape(curve([[-30, -26], [-28, -38], [0, -41], [28, -38], [30, -26]]))
  const teeth = open ? Array.from({ length: 7 }, (_, i) => shape(line([[-22 + i * 7.4, -27], [-18.4 + i * 7.4, -17], [-14.8 + i * 7.4, -27]]))).join('') : ''
  return sil(`${shape(line([[-30, 0], [30, 0], [30, -28], [-30, -28]]))}${lid}`, `
    ${open ? `<rect x="-27" y="-29" width="54" height="3.2" fill="#e05545"/>${teeth}${lit(-9, -35, 1.5, 'red', C.red)}${lit(9, -35, 1.5, 'red', C.red)}` : ''}
    <rect x="-30" y="-20" width="60" height="2.6" fill="${C.gold}" opacity=".55"/>
    <rect x="-4" y="-27" width="8" height="9" rx="1.5" fill="${C.gold}" opacity=".7"/>
    ${open ? '' : `<path d="${curve([[-18, -40], [0, -44.5], [18, -40], [22, -33], [0, -36], [-22, -33]])}" fill="#b3262a"/>`}
    <g stroke="${C.gold}" stroke-width="1.4" opacity=".5"><path d="M-30 -4h60M-30 -24h60"/></g>`)
}

/** 暗影:人形的黑暗,凡铁穿不过 */
export const shadow = (): string => {
  const b = `
    ${shape(curve([[-13, 0], [-15, -26], [-9, -50], [0, -58], [9, -50], [14, -28], [11, -12], [15, 0], [4, -5], [-3, 1]]))}
    ${shape(curve([[-12, -44], [-27, -36], [-30, -20], [-22, -26]]))}
    ${shape(curve([[11, -44], [25, -38], [28, -22], [20, -27]]))}`
  return `<g class="a-sway">${glow(0, -34, 40, 'violet', 0.3)}${sil(b, `${lit(-3.6, -50, 1.5, 'violet', C.violet)}${lit(3.6, -50, 1.5, 'violet', C.violet)}`, '#05030a')}</g>`
}
export const shadows = (): string => `<g transform="translate(-44 0) scale(.8)">${shadow()}</g><g transform="translate(48 0) scale(.9)">${shadow()}</g>${shadow()}`

/** 兽人督军:会呼吸的铁塔,双手巨斧 */
export const orc = (seated = false): string => {
  const h = 62
  const p = fig({ h, bw: 1.5, head: 'none', cloak: 'none', hand: 'axe', pose: seated ? 'sit' : 'stand', eyes: C.red })
  return sil(p.body, `<path d="${line([[-0.075 * h, -0.845 * h], [-0.05 * h, -0.79 * h]], false)}M${line([[0.075 * h, -0.845 * h], [0.05 * h, -0.79 * h]], false)}" stroke="${C.bone}" stroke-width="2" stroke-linecap="round" fill="none"/>${p.detail}`)
}

/** 死灵法师:兜帽长袍,指尖缠着幽紫的雾 */
export const necromancer = (kneel = false): string => {
  const h = 47
  const p = fig({ h, bw: 0.98, head: 'hood', cloak: 'robe', hand: 'none', pose: kneel ? 'kneel' : 'stand', eyes: C.violet, lean: kneel ? 12 : 0 })
  return sil(p.body, `${glow(0.17 * h, -0.56 * h, 0.34 * h, 'violet', 0.85)}<circle cx="${0.17 * h}" cy="${-0.56 * h}" r="2.2" fill="${C.violet}"/>${p.detail}`)
}

/** 牛头怪:三层楼高的看守,门板般的巨斧 */
export const minotaur = (kneel = false): string => {
  const dy = kneel ? 16 : 0
  const b = `
    ${stroke(line([[-10, 0], [-14, -34 + dy]], false), 15)}
    ${kneel ? stroke(line([[14, 0], [22, -14], [12, -30 + dy]], false), 15) : stroke(line([[12, 0], [15, -34 + dy]], false), 15)}
    ${shape(curve([[-26, -34 + dy], [-30, -78 + dy], [-12, -92 + dy], [14, -92 + dy], [30, -76 + dy], [26, -34 + dy], [0, -28 + dy]]))}
    ${stroke(line([[24, -80 + dy], [44, -58 + dy], [50, -36 + dy]], false), 12)}
    ${stroke(line([[-24, -80 + dy], [-34, -60 + dy], [-30, -46 + dy]], false), 11)}
    ${shape(curve([[0, -90 + dy], [-17, -96 + dy], [-15, -122 + dy], [0, -130 + dy], [15, -122 + dy], [17, -96 + dy]]))}
    ${shape(curve([[-14, -116 + dy], [-34, -122 + dy], [-46, -146 + dy], [-40, -118 + dy], [-18, -108 + dy]]))}
    ${shape(curve([[14, -116 + dy], [34, -122 + dy], [46, -146 + dy], [40, -118 + dy], [18, -108 + dy]]))}
    ${stroke(line([[0, -130 + dy], [2, -170 + dy]], false), 1)}
    ${stroke(line([[50, -30 + dy], [56, -128 + dy]], false), 5)}
    ${shape(curve([[51, -128 + dy], [78, -122 + dy], [80, -98 + dy], [54, -100 + dy]]))}`
  return sil(b, `${lit(-6, -112 + dy, 1.9, 'ember', C.ember)}${lit(7, -112 + dy, 1.9, 'ember', C.ember)}`)
}

/** 烬疫触须:烧红的藤蔓从地砖下钻出 */
export const tendril = (): string => {
  const vine = (d: string): string => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#§f-fire)" stroke-width="2.2" stroke-linecap="round" opacity=".9" class="a-flick"/>`
  return `${glow(0, -40, 54, 'ember', 0.45)}${vine('M-6 0C-14 -30 6 -44 -8 -78S10 -110 2 -132')}${vine('M4 0C16 -22 -4 -40 14 -62S30 -96 24 -112')}${vine('M-2 0C-26 -18 -30 -44 -40 -58')}`
}
export const tendrils = (): string => `<g transform="translate(-92 0) scale(.7)">${tendril()}</g><g transform="translate(84 0) scale(-.8 .8)">${tendril()}</g><g transform="translate(-30 0) scale(.9)">${tendril()}</g>${tendril()}<g transform="translate(46 0) scale(-1 1)">${tendril()}</g>`

/** 烬王:铠甲缝隙里流动的火星,护腕上密密麻麻的刻痕,凝固火焰的长剑 */
export const emberKing = (kneel = false): string => {
  const h = 74
  const p = fig({ h, bw: 1.34, head: 'crown', cloak: 'long', hand: 'flameSword', pose: kneel ? 'kneel' : 'stand', lean: kneel ? 10 : 0 })
  const dy = kneel ? 0.14 * h : 0
  const ys = -0.8 * h + dy
  const cracks = `<g stroke="${C.ember}" stroke-width="1.2" stroke-linecap="round" fill="none" class="a-flick">
    <path d="M${-0.07 * h} ${ys + 0.06 * h}l${0.03 * h} ${0.1 * h}l-${0.02 * h} ${0.1 * h}M${0.09 * h} ${ys + 0.04 * h}l-${0.02 * h} ${0.12 * h}l${0.04 * h} ${0.09 * h}M${-0.01 * h} ${ys + 0.2 * h}l${0.03 * h} ${0.09 * h}M${-0.12 * h} ${ys + 0.3 * h}l${0.05 * h} ${0.08 * h}"/></g>`
  const bracer = `<g data-fid="bracer"><rect x="${0.14 * h}" y="${ys + 0.02 * h}" width="${0.075 * h}" height="${0.11 * h}" rx="2" fill="${C.ink}"/><g stroke="${C.goldHi}" stroke-width=".7" opacity=".9">${Array.from({ length: 6 }, (_, i) => `<path d="M${0.147 * h} ${ys + (0.032 + i * 0.015) * h}h${0.058 * h}"/>`).join('')}</g>${glow(0.178 * h, ys + 0.075 * h, 0.1 * h, 'gold', 0.55)}</g>`
  return sil(p.body, `${glow(0, ys + 0.25 * h, 0.55 * h, 'ember', 0.5)}${cracks}${bracer}${p.detail}`)
}

/** 烬王身后的火焰剪影:五个人的队伍,其中四个已经暗得快看不见 */
export const retinue = (): string => {
  const members: [number, number][] = [[-62, 0.22], [-32, 0.3], [0, 1], [32, 0.26], [62, 0.2]]
  return members.map(([x, o], i) => {
    const p = fig({ h: 52, bw: i === 2 ? 1.3 : 0.95, head: i === 2 ? 'crown' : i === 0 ? 'skull' : 'none', cloak: 'long', hand: i === 2 ? 'flameSword' : i === 3 ? 'staff' : i === 4 ? 'lute' : 'none' })
    return `<g transform="translate(${x} 0)" class="a-flick" style="animation-duration:${(1.4 + i * 0.37).toFixed(2)}s"><g fill="url(#§f-fire)" opacity="${o}">${p.body}</g></g>`
  }).join('')
}

/** 低语凝成的实体:一缕缠着火星的雾,顶端摊开成一只手 */
export const wisp = (): string => {
  const ribbon = (d: string): string =>
    `<path d="${d}" fill="none" stroke="url(#§f-fire)" stroke-width="7" stroke-linecap="round" opacity=".2"/>` +
    `<path d="${d}" fill="none" stroke="${C.goldHi}" stroke-width=".9" stroke-linecap="round" opacity=".5"/>`
  const hand = curve([[-16, -96], [-21, -112], [-13, -117], [-9, -102], [-7, -123], [1, -125], [2, -105], [9, -120], [17, -115], [12, -99], [20, -104], [21, -96], [8, -87], [-6, -87]])
  return `<g class="a-sway" style="animation-duration:4.4s">${glow(3, -50, 66, 'ember', 0.55)}
    ${ribbon('M-14 0C-26 -22 -2 -30 -8 -52S8 -70 2 -84')}
    ${ribbon('M11 0C25 -18 5 -34 15 -54S5 -74 12 -88')}
    ${ribbon('M-2 0C-10 -26 12 -40 2 -64S-6 -84 4 -96')}
    <path d="${hand}" fill="${C.goldHi}" opacity=".34"/>
    <path d="${hand}" fill="none" stroke="${C.goldHi}" stroke-width=".9" opacity=".7"/>
    ${[[-18, -34], [-2, -50], [13, -40], [5, -70], [-8, -76], [16, -94], [0, -112]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><g class="a-float" style="animation-delay:${(i * 0.4).toFixed(1)}s">${spark2(0, 0, C.goldHi)}</g></g>`).join('')}
  </g>`
}
const spark2 = (x: number, y: number, c: string): string => `${glow(x, y, 7, 'ember', 0.6)}<circle cx="${x}" cy="${y}" r="1.5" fill="${c}"/>`

/** 烬蝠群:围绕原点上方约 55 处成团,翅膀边缘带火星 */
export const emberbat = (): string => {
  // 注意:带 CSS transform 动画的分组不能再写 transform 属性(会被覆盖),定位要套在外层
  const bat = (s: number, x: number, y: number, d: number): string => `<g transform="translate(${x} ${y}) scale(${s})"><g class="a-flap" style="animation-delay:${d}s">${shape(curve([[-26, -6], [-12, -14], [-3, -6], [0, -13], [3, -6], [12, -14], [26, -6], [10, -1], [4, 5], [0, 2], [-4, 5], [-10, -1]]))}</g></g>`
  const swarm: [number, number, number, number][] = [[1, 0, -58, 0], [0.8, -48, -76, 0.3], [0.7, 46, -84, 0.55], [0.55, -24, -98, 0.15], [0.5, 30, -40, 0.7], [0.6, 62, -46, 1.1], [0.45, -66, -44, 0.4]]
  return `<g>${swarm.map(([s, x, y, d]) => bat(s, x, y, d)).join('')}
    ${glow(0, -62, 74, 'ember', 0.32)}${lit(-2, -56, 1.1, 'ember', C.ember)}${lit(2, -56, 1.1, 'ember', C.ember)}</g>`
}

/** 烬甲近卫:溃散的空甲,甲缝里还漏着火 */
export const ashKnight = (): string => {
  const h = 56
  const p = fig({ h, bw: 1.26, head: 'helmetHorns', cloak: 'none', hand: 'spear' })
  return sil(p.body, `<g stroke="${C.ember}" stroke-width="1" stroke-linecap="round" fill="none" class="a-flick"><path d="M${-0.05 * h} ${-0.74 * h}l${0.02 * h} ${0.1 * h}M${0.06 * h} ${-0.66 * h}l-${0.01 * h} ${0.08 * h}M${-0.08 * h} ${-0.3 * h}l${0.04 * h} ${0.06 * h}"/></g>${p.detail}`)
}

/** 兜帽商人 / 盲眼商贩 */
export const merchant = (blind = false): string => {
  const h = 44
  const p = fig({ h, bw: 1.04, head: 'hood', cloak: 'robe', hand: 'none', pose: blind ? 'sit' : 'stand' })
  return sil(p.body, blind ? `<path d="${curve([[-0.045 * h, -0.705 * h], [0, -0.69 * h], [0.045 * h, -0.705 * h]], false)}" fill="none" stroke="${C.gold}" stroke-width="1" opacity=".8"/>` : '')
}

/** 独臂铁匠 */
export const smith = (): string => {
  const h = 46
  const p = fig({ h, bw: 1.22, head: 'none', cloak: 'short', hand: 'hammer', lean: 10 })
  const body = p.body.replace(stroke(line([[-0.1 * h * 1.22 * 0.92, -0.8 * h + 0.05 * h + 0 * h], [-0.125 * h * 1.22, -0.52 * h - 0.02 * h]], false), 0.05 * h), '')
  return sil(body, `<path d="${line([[-0.07 * h, -0.5 * h], [0.07 * h, -0.5 * h], [0.1 * h, -0.06 * h], [-0.1 * h, -0.06 * h]])}" fill="#4a3626" opacity=".75"/>${p.detail}`)
}

/** 钟楼守夜人:裹着斗篷打瞌睡的老人 */
export const watchman = (): string => figure({ h: 42, bw: 1.02, head: 'hood', cloak: 'long', hand: 'lantern', lean: 12 })

/** 渡魂船的船夫:一袭空袍,撑一根长篙 */
export const ferryman = (): string => figure({ h: 46, bw: 0.96, head: 'hood', cloak: 'robe', hand: 'staff', lean: -8 })

/** 瘸腿烬犬:两条尾巴,一条摇一条不摇;眼里有火星 */
export const hound = (): string => {
  const b = `
    ${shape(curve([[-27, -23], [-18, -29], [-6, -31], [10, -30], [19, -27], [23, -21], [17, -16], [6, -17], [-7, -17], [-19, -16]]))}
    ${shape(curve([[18, -29], [22, -37], [31, -41], [41, -37], [46, -32], [39, -27], [30, -25], [23, -24]]))}
    ${shape(line([[25, -40], [23, -49], [30, -42]]))}
    ${stroke(line([[-20, -18], [-23, -6], [-26, 0]], false), 4)}
    ${stroke(line([[-11, -18], [-9, -6], [-8, 0]], false), 4)}
    ${stroke(line([[8, -17], [10, -6], [9, 0]], false), 4)}
    ${stroke(line([[15, -18], [19, -6], [22, 0]], false), 4)}
    ${shape(curve([[-26, -25], [-45, -31], [-60, -46], [-51, -29], [-33, -19]]))}
    ${shape(curve([[-25, -20], [-47, -18], [-64, -22], [-47, -13], [-30, -13]]))}`
  return sil(b, lit(37, -37, 1.3, 'ember', C.ember))
}

/** 行商(昏迷/逃跑) */
export const merchantMan = (fleeing = false): string => figure({ h: 43, bw: 1.04, head: 'wrap', cloak: 'short', hand: 'sack', pose: fleeing ? 'walk' : 'stand', lean: fleeing ? 16 : 0 })

/** 翻倒在沟里的车夫(俯卧,手里攥着拨浪鼓) */
export const drover = (): string => {
  const p = fig({ h: 42, bw: 1.06, head: 'none', cloak: 'short', hand: 'none' })
  return `<g transform="translate(-14 -7) rotate(-84)">${sil(p.body)}</g>${glow(22, -5, 10, 'gold', 0.5)}<circle cx="22" cy="-5" r="3" fill="${C.ink}"/><circle cx="22" cy="-5" r="3" fill="none" stroke="${C.gold}" stroke-width=".9"/><path d="M22 -8.5V-12" stroke="${C.ink}" stroke-width="1.4"/>`
}

/** 盘旋的乌鸦(一组) */
export const crows = (): string => {
  const crow = (x: number, y: number, s: number, d: number): string => `<g transform="translate(${x} ${y}) scale(${s})"><g class="a-float" style="animation-delay:${d}s"><path d="M-11 0Q-5 -6 0 -1Q5 -6 11 0Q5 -2 0 1Q-5 -2 -11 0Z" fill="${C.ink}"/></g></g>`
  return crow(0, 0, 1, 0) + crow(-26, 10, 0.8, 0.5) + crow(24, 14, 0.7, 1.1) + crow(-8, 22, 0.55, 1.6)
}
