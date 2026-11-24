// ─── 背景库:每种场景类型一套「底色 + 远中景 + 地面」 ───────────────────
// 画布 400×170,地面线 y=150。背景只负责空间与氛围,主体物件由 sceneArt 摆放。
import { C, GROUND, H, W, flat, glow, line, mist, shape } from './kit'
import type { SceneBg } from '../game/types'

export type BgId = SceneBg | 'forge' | 'street' | 'lake' | 'hall' | 'garden' | 'tower' | 'cellar'

const floor = (color: string, lines = 0): string =>
  `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="${color}"/>` +
  (lines ? `<g stroke="#000" stroke-opacity=".35" stroke-width="1">${Array.from({ length: lines }, (_, i) => `<path d="M${-40 + ((i * 97) % 480)} ${GROUND + 3 + ((i * 7) % 14)}h${50 + (i * 31) % 60}"/>`).join('')}</g>` : '')

/** 确定性伪随机:同一张背景每次生成完全一致 */
const seeded = (s: number): (() => number) => {
  let x = s
  return () => (x = (x * 16807) % 2147483647) / 2147483647
}

const base = (id: string, stops: [number, string][]): string =>
  `<linearGradient id="§b-${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
   <rect width="${W}" height="${H}" fill="url(#§b-${id})"/>`

const stars = (n: number, seed: number, maxY = 110): string => {
  const r = seeded(seed)
  let s = ''
  for (let i = 0; i < n; i++) {
    s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * maxY).toFixed(0)}" r="${(0.4 + r() * 0.8).toFixed(1)}" fill="#fff6e0" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`
  }
  return s
}

const stalactites = (seed: number, color: string, maxLen = 52): string => {
  const r = seeded(seed)
  let d = 'M0 0'
  let x = 0
  while (x < W + 20) {
    const w = 14 + r() * 34
    d += `L${x} 0L${(x + w * 0.5).toFixed(0)} ${(10 + r() * maxLen).toFixed(0)}L${(x + w).toFixed(0)} 0`
    x += w
  }
  return `<path d="${d}Z" fill="${color}"/>`
}

// ─── 室内:酒馆 ─────────────────────────────────────────────────────
const tavern = (): string => `
  ${base('tavern', [[0, '#2f1b0f'], [0.6, '#1c110a'], [1, '#120a06']])}
  <g stroke="#000" stroke-opacity=".26" stroke-width="1">${[50, 72, 94, 116, 138].map((y) => `<path d="M0 ${y}H400"/>`).join('')}</g>
  ${flat(`${shape(line([[0, 0], [400, 0], [400, 24], [0, 24]]))}${shape(line([[0, 24], [400, 24], [400, 31], [0, 31]]))}${[52, 344].map((x) => `<rect x="${x}" y="0" width="10" height="150"/>`).join('')}`, '#1f120a')}
  ${floor('#1c120b', 9)}
  <rect y="148" width="400" height="3" fill="#3a2617" opacity=".55"/>
`

// ─── 室内:铁匠铺(酒馆的变体,炉火更烈) ─────────────────────────────
const forge = (): string => `
  ${base('forge', [[0, '#26120a'], [0.55, '#1a0d07'], [1, '#100705']])}
  ${flat(`${shape(line([[0, 0], [400, 0], [400, 22], [0, 22]]))}${[36, 362].map((x) => `<rect x="${x}" y="0" width="12" height="150"/>`).join('')}${shape(line([[0, 132], [400, 132], [400, 150], [0, 150]]))}`, '#1a0f09')}
  <g stroke="#000" stroke-opacity=".4" stroke-width="1">${[40, 62, 84, 106].map((y) => `<path d="M0 ${y}H400"/>`).join('')}</g>
  ${floor('#170e09', 7)}
`

// ─── 室外:镇子 / 城门外(黄昏,阴云,地平线有余烬色) ───────────────────
const gate = (): string => `
  ${base('gate', [[0, '#3d1b12'], [0.42, '#24120d'], [0.72, '#170c09'], [1, '#0e0706']])}
  ${glow(236, 132, 120, 'ember', 0.5)}
  ${flat(`${[[30, 14, 70, 15], [120, 6, 96, 18], [250, 12, 120, 14], [350, 4, 80, 20], [190, 30, 90, 11], [60, 36, 70, 9]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}`, '#170b08')}
  ${glow(150, 40, 110, 'ember', 0.14)}
  ${flat(`
    ${shape(line([[0, 150], [0, 132], [14, 132], [14, 124], [34, 112], [56, 126], [56, 150]]))}
    ${shape(line([[46, 150], [46, 120], [74, 104], [104, 122], [104, 150]]))}
    ${shape(line([[96, 150], [96, 130], [150, 130], [150, 118], [178, 106], [210, 120], [210, 150]]))}
    ${shape(line([[200, 150], [200, 128], [262, 128], [262, 136], [330, 136], [330, 150]]))}
    ${shape(line([[316, 150], [316, 120], [352, 100], [392, 122], [392, 150]]))}
    ${shape(line([[356, 150], [356, 132], [400, 132], [400, 150]]))}
    ${shape(line([[62, 150], [62, 78], [60, 60], [72, 44], [84, 60], [82, 78], [82, 150]]))}
  `, '#2a1911')}
  <circle cx="72" cy="72" r="6.5" fill="#e8b45a" opacity=".85"/>
  <circle cx="72" cy="72" r="6.5" fill="none" stroke="#5a3a14" stroke-width="1"/>
  <path d="M72 68.5V72L74.6 74" stroke="#3a220c" stroke-width="1.2" fill="none"/>
  ${mist(126, 26, '#4a2c1c', 0, 0.34, 'a-drift')}
  ${floor('#130b07', 5)}
`

// ─── 室外:镇内街道(两侧屋檐,巷口) ─────────────────────────────────
const street = (): string => `
  ${base('street', [[0, '#341a12'], [0.5, '#1e100c'], [1, '#100907']])}
  ${flat(`
    ${shape(line([[0, 0], [96, 0], [96, 26], [128, 26], [128, 150], [0, 150]]))}
    ${shape(line([[400, 0], [292, 0], [292, 20], [262, 20], [262, 150], [400, 150]]))}
    ${shape(line([[150, 150], [150, 96], [238, 96], [238, 150]]))}
  `, '#24150e')}
  ${flat(`${shape(line([[128, 150], [128, 104], [150, 104], [150, 150]]))}${shape(line([[238, 150], [238, 104], [262, 104], [262, 150]]))}`, '#150c08')}
  <rect x="18" y="44" width="30" height="34" fill="#f0b860" opacity=".2"/>
  <rect x="336" y="50" width="28" height="30" fill="#f0b860" opacity=".13"/>
  ${glow(33, 60, 34, 'gold', 0.3)}
  ${floor('#150c08', 8)}
  <rect y="148" width="400" height="3" fill="#3a2617" opacity=".4"/>
`

// ─── 地城:甬道(层叠拱门 + 火把) ────────────────────────────────────
const arch = (cx: number, halfW: number, top: number, thick: number, color: string): string =>
  `<path fill-rule="evenodd" fill="${color}" d="M${cx - halfW - thick} 150V${top + halfW * 0.55}A${halfW + thick} ${halfW + thick} 0 0 1 ${cx + halfW + thick} ${top + halfW * 0.55}V150Z
     M${cx - halfW} 150V${top + halfW * 0.55}A${halfW} ${halfW} 0 0 1 ${cx + halfW} ${top + halfW * 0.55}V150Z"/>`

const corridor = (): string => `
  ${base('corridor', [[0, '#1d120c'], [0.6, '#120b07'], [1, '#090504']])}
  ${glow(200, 118, 175, 'ember', 0.26)}
  ${glow(200, 128, 60, 'ember', 0.6)}
  ${arch(200, 30, 92, 9, '#1c110a')}
  ${arch(200, 74, 62, 15, '#150c07')}
  ${arch(200, 138, 26, 26, '#0e0805')}
  <g stroke="#000" stroke-opacity=".3" stroke-width="1"><path d="M110 150V92M290 150V92M96 150V70M304 150V70M62 150V40M338 150V40"/></g>
  ${floor('#0f0906')}
  <g stroke="#3a2818" stroke-opacity=".5" stroke-width="1"><path d="M0 158H400M0 165H400M120 150L70 170M280 150L330 170M170 150L150 170M230 150L250 170"/></g>
`

// ─── 洞穴(钟乳石 + 幽光) ───────────────────────────────────────────
const cavern = (water = false): string => {
  const r = seeded(7)
  let dots = ''
  for (let i = 0; i < 16; i++) {
    const x = 16 + r() * 368
    const y = 22 + r() * 118
    dots += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + r() * 1.1).toFixed(1)}" fill="#9fe8d0" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`
  }
  return `
  ${base(water ? 'lake' : 'cavern', water
    ? [[0, '#101a22'], [0.62, '#0b141b'], [1, '#060a0e']]
    : [[0, '#1f1320'], [0.55, '#130b13'], [1, '#080507']])}
  ${glow(200, 118, 190, water ? 'blue' : 'violet', water ? 0.42 : 0.4)}
  ${stalactites(11, '#1a1018', 46)}
  ${flat(`${shape(line([[0, 150], [0, 96], [14, 86], [30, 112], [46, 124], [60, 150]]))}${shape(line([[400, 150], [400, 90], [384, 80], [366, 110], [350, 126], [334, 150]]))}${shape(line([[64, 150], [72, 128], [82, 134], [90, 150]]))}${shape(line([[318, 150], [326, 124], [338, 132], [344, 150]]))}`, '#150d13')}
  ${dots}
  ${water ? `<rect y="150" width="400" height="20" fill="#0c1a24"/><g stroke="#7ab8ff" stroke-opacity=".22" stroke-width="1" class="a-drift"><path d="M20 156h50M96 160h70M210 155h46M290 162h60M60 166h40M330 157h36M170 165h50"/></g>`
    : `${floor('#0c0709')}${mist(138, 22, '#2a1a30', 0, 0.3, 'a-drift')}`}
`
}
const lake = (): string => cavern(true)

// ─── 地窖 / 营地洞穴(酒桶、帐篷由物件提供) ──────────────────────────
const cellar = (): string => `
  ${base('cellar', [[0, '#1a100c'], [0.6, '#100907'], [1, '#080504']])}
  ${arch(200, 150, 20, 40, '#120b07')}
  ${glow(200, 120, 170, 'ember', 0.24)}
  ${stalactites(23, '#150c08', 20)}
  ${floor('#0d0806')}
  <g stroke="#3a2818" stroke-opacity=".45" stroke-width="1"><path d="M0 158H400M0 165H400M100 150L60 170M300 150L340 170"/></g>
`

// ─── 神龛(石壁凹龛 + 烛光) ─────────────────────────────────────────
const shrine = (): string => `
  ${base('shrine', [[0, '#24170e'], [0.6, '#160d08'], [1, '#0d0705']])}
  <g stroke="#000" stroke-opacity=".3" stroke-width="1">${[22, 44, 66, 88, 110, 132].map((y, i) => `<path d="M0 ${y}H400M${60 + i * 37} ${y}v22M${210 + i * 29} ${y}v22M${320 - i * 13} ${y}v22"/>`).join('')}</g>
  <path fill="#0e0805" d="M138 150V86A62 62 0 0 1 262 86V150Z"/>
  <path fill="none" stroke="#3a2818" stroke-width="3" d="M138 150V86A62 62 0 0 1 262 86V150"/>
  ${glow(200, 126, 70, 'gold', 0.42)}
  ${glow(200, 128, 170, 'gold', 0.2)}
  ${floor('#140c07', 4)}
`

// ─── 焚烧的图书馆(高耸书架 + 飘起的火屑) ────────────────────────────
const library = (): string => {
  const r = seeded(5)
  let books = ''
  let fires = ''
  for (let sx = 4; sx < W; sx += 56) {
    books += `<rect x="${sx}" y="0" width="5" height="150" fill="#1a0e08"/>`
    for (let sy = 8; sy < 150; sy += 25) {
      books += `<rect x="${sx}" y="${sy + 18}" width="56" height="4" fill="#1a0e08"/>`
      let bx = sx + 6
      while (bx < sx + 48) {
        const bw = 3 + r() * 4
        const bh = 11 + r() * 6
        books += `<rect x="${bx.toFixed(0)}" y="${(sy + 18 - bh).toFixed(0)}" width="${bw.toFixed(1)}" height="${bh.toFixed(0)}" fill="${r() < 0.5 ? '#2a160e' : '#21100b'}"/>`
        if (r() < 0.07) fires += `<rect x="${bx.toFixed(0)}" y="${(sy + 18 - bh).toFixed(0)}" width="${bw.toFixed(1)}" height="${bh.toFixed(0)}" fill="url(#§f-fire)" opacity=".9"/>`
        bx += bw + 1
      }
    }
  }
  return `
  ${base('library', [[0, '#3a160b'], [0.45, '#200f09'], [1, '#0e0705']])}
  ${books}${fires}
  ${Array.from({ length: 26 }, (_, i) => { const x = (i * 61 + 17) % 400; const y = (i * 37 + 9) % 150; return `<g class="a-rise" style="animation-delay:${(i * 0.37).toFixed(2)}s;animation-duration:${(5 + (i % 5) * 0.9).toFixed(1)}s"><rect x="${x}" y="${y}" width="2.4" height="1.5" fill="#ffb060" opacity=".8"/></g>` }).join('')}
  ${mist(0, 46, '#5a2a14', 0.5, 0.1)}
  ${floor('#120a06')}
`
}

// ─── 无光集市(鬼火灯笼串 + 摊位雨棚) ────────────────────────────────
const market = (): string => {
  const r = seeded(19)
  let crowd = ''
  for (let i = 0; i < 9; i++) {
    const x = 24 + i * 44 + r() * 12
    const hh = 16 + r() * 8
    crowd += `<path d="M${x.toFixed(0)} 150v-${(hh * 0.72).toFixed(0)}a${(hh * 0.2).toFixed(1)} ${(hh * 0.2).toFixed(1)} 0 0 1 ${(hh * 0.4).toFixed(1)} 0V150Z" fill="#1c1118"/>`
  }
  let lanterns = ''
  const strands: [number, number, number][] = [[0, 34, 200], [200, 22, 400], [0, 74, 130], [270, 66, 400]]
  strands.forEach(([x1, y1, x2], si) => {
    const y2 = si === 3 ? 54 : y1
    const sag = 16 + si * 3
    lanterns += `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.max(y1, y2) + sag * 2} ${x2} ${y2}" fill="none" stroke="#0a0608" stroke-width="1.2"/>`
    for (let t = 0.14; t < 1; t += 0.18) {
      const cx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2
      const cy = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag * 2) + t * t * y2
      const kind = (Math.round(t * 10) + si) % 3
      const col = kind === 0 ? C.green : kind === 1 ? C.blue : C.violet
      const g: 'green' | 'blue' | 'violet' = kind === 0 ? 'green' : kind === 1 ? 'blue' : 'violet'
      lanterns += `${glow(cx, cy + 5, 13, g, 0.7)}<ellipse cx="${cx.toFixed(0)}" cy="${(cy + 5).toFixed(0)}" rx="2.6" ry="3.6" fill="${col}" opacity=".92"/>`
    }
  })
  return `
  ${base('market', [[0, '#120d16'], [0.6, '#0c0810'], [1, '#070508']])}
  ${stalactites(31, '#100a12', 22)}
  ${glow(200, 122, 180, 'violet', 0.22)}
  ${flat(`${shape(line([[0, 150], [0, 104], [86, 104], [98, 88], [112, 104], [124, 150]]))}${shape(line([[400, 150], [400, 100], [318, 100], [306, 84], [292, 100], [280, 150]]))}${shape(line([[132, 150], [132, 118], [176, 118], [182, 108], [188, 118], [190, 150]]))}`, '#1a1018')}
  ${crowd}
  ${lanterns}
  ${floor('#0b070c', 6)}
`
}

// ─── 篝火旁(夜空 + 远处岩壁) ────────────────────────────────────────
const camp = (): string => `
  ${base('camp', [[0, '#0c0914'], [0.55, '#1a100e'], [0.78, '#120a08'], [1, '#080505']])}
  ${stars(46, 3, 92)}
  ${flat(`${shape(line([[0, 150], [0, 112], [40, 98], [96, 118], [140, 108], [176, 122], [176, 150]]))}${shape(line([[224, 150], [224, 120], [268, 104], [316, 116], [360, 100], [400, 112], [400, 150]]))}${shape(line([[150, 150], [152, 134], [250, 134], [252, 150]]))}`, '#100a0a')}
  ${mist(126, 24, '#241a2e', 0, 0.3, 'a-drift')}
  ${floor('#0a0606', 6)}
`

// ─── 烬王殿(巨柱 + 升腾火星 + 王座高台) ─────────────────────────────
const throne = (soft = false): string => {
  let embers = ''
  const r = seeded(13)
  for (let i = 0; i < 34; i++) {
    const x = r() * W
    const y = r() * 150
    embers += `<g class="a-rise" style="animation-delay:${(r() * 6).toFixed(2)}s;animation-duration:${(4.5 + r() * 4).toFixed(1)}s"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.7 + r() * 1.1).toFixed(1)}" fill="${r() < 0.7 ? '#ffb060' : '#ff6a2a'}" opacity=".85"/></g>`
  }
  return `
  ${base(soft ? 'hall' : 'throne', soft
    ? [[0, '#3a1c14'], [0.5, '#22120e'], [1, '#0f0806']]
    : [[0, '#54170a'], [0.4, '#2e0d07'], [0.75, '#1a0705'], [1, '#0c0303']])}
  ${soft ? '' : glow(200, 150, 210, 'ember', 0.42)}
  ${flat(`
    ${shape(line([[0, 0], [44, 0], [44, 150], [0, 150]]))}
    ${shape(line([[400, 0], [356, 0], [356, 150], [400, 150]]))}
    ${shape(line([[66, 0], [92, 0], [92, 150], [66, 150]]))}
    ${shape(line([[334, 0], [308, 0], [308, 150], [334, 150]]))}
    ${shape(line([[0, 0], [400, 0], [400, 12], [0, 12]]))}
    ${shape(line([[136, 150], [136, 134], [264, 134], [264, 150]]))}
    ${shape(line([[158, 150], [158, 142], [242, 142], [242, 150]]))}
  `, '#170a07')}
  <g stroke="#000" stroke-opacity=".38" stroke-width="1"><path d="M8 12V150M36 12V150M364 12V150M392 12V150M74 12V150M86 12V150M314 12V150M326 12V150"/></g>
  ${soft ? '' : `<g stroke="#ff7a33" stroke-width="1" stroke-linecap="round" opacity=".55" class="a-flick"><path d="M22 34l3 16-4 12 5 20M380 50l-4 18 3 14M80 20l2 22M320 60l-3 20 4 16"/></g>`}
  ${embers}
  ${floor('#100605')}
  <rect y="148" width="400" height="3" fill="#6a2a14" opacity=".5"/>
  <g stroke="#ff9a50" stroke-opacity=".16" stroke-width="2"><path d="M150 152H250M110 158H290M60 165H340"/></g>
`
}
const hall = (): string => throne(true)

// ─── 灰烬花园(烬王殿的柔光变体) ─────────────────────────────────────
const garden = (): string => `
  ${base('garden', [[0, '#2e1a16'], [0.5, '#1e100d'], [1, '#0d0706']])}
  ${glow(200, 150, 230, 'gold', 0.3)}
  ${flat(`${shape(line([[0, 0], [30, 0], [30, 150], [0, 150]]))}${shape(line([[400, 0], [370, 0], [370, 150], [400, 150]]))}${shape(line([[0, 150], [0, 128], [70, 118], [150, 130], [250, 122], [330, 130], [400, 120], [400, 150]]))}`, '#150b09')}
  ${mist(132, 26, '#4a2a24', 0, 0.3, 'a-drift')}
  ${floor('#110908')}
`

// ─── 钟楼(高处,拱窗外的夜) ─────────────────────────────────────────
const tower = (): string => `
  ${base('tower', [[0, '#241610'], [0.6, '#150d09'], [1, '#0b0705']])}
  <path fill="#0c101c" d="M150 150V54A50 50 0 0 1 250 54V150Z"/>
  <circle cx="228" cy="62" r="9" fill="#fff3d6" opacity=".8"/>
  ${stars(18, 9, 120)}
  <g clip-path="url(#§tw)"><path fill="#0e0705" d="M156 150V58A44 44 0 0 1 244 58V150Z" opacity="0"/></g>
  <clipPath id="§tw"><path d="M150 150V54A50 50 0 0 1 250 54V150Z"/></clipPath>
  <g clip-path="url(#§tw)">${flat(shape(line([[158, 150], [158, 108], [176, 96], [196, 110], [196, 150]])), '#070a12')}${stars(14, 21, 60)}</g>
  <path fill="none" stroke="#2c1d14" stroke-width="5" d="M150 150V54A50 50 0 0 1 250 54V150M200 54V150"/>
  ${floor('#120b07', 5)}
`

// ─── 迷宫之心(石墙甬道) ────────────────────────────────────────────
const maze = (): string => `
  ${base('maze', [[0, '#1e150f'], [0.6, '#130c08'], [1, '#0a0604']])}
  <g stroke="#000" stroke-opacity=".32" stroke-width="1">${[20, 40, 60, 80, 100, 120].map((y, i) => `<path d="M0 ${y}H400M${(i * 53) % 400} ${y}v20M${(i * 53 + 180) % 400} ${y}v20"/>`).join('')}</g>
  ${arch(200, 120, 14, 22, '#0f0906')}
  ${glow(200, 120, 180, 'gold', 0.2)}
  ${floor('#0c0705', 5)}
`

export const BACKDROPS: Record<BgId, () => string> = {
  tavern, forge, gate, street, corridor, cavern, lake, cellar, shrine, library, market, camp, throne, hall, garden, tower, maze,
}
