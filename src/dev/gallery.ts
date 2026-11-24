// ─── 插画总览页(仅开发用,不进构建产物):一页排开全部插画,方便加场景时对照 ───
// 打开 /art-gallery.html?cls=mage 可换「你」的职业剪影。
import '../ui/styles.css'
import { BACKDROPS } from '../art/backdrops'
import { PROPS } from '../art/props'
import { svgFor, type ArtSpec } from '../art/render'
import { DEFS } from '../art/kit'
import { COMBAT_ART, ENDING_ART, SCENE_ART } from '../art/sceneArt'
import { MONSTERS } from '../content/monsters'
import { SCENES } from '../content/scenes'
import { ENDINGS } from '../content/scenes'
import type { ClassId } from '../game/types'

const CLASSES: ClassId[] = ['fighter', 'mage', 'rogue', 'cleric', 'bard', 'paladin']
const wanted = new URLSearchParams(location.search).get('cls')
const cls: ClassId = CLASSES.find((c) => c === wanted) ?? 'fighter'

const mount = (host: string, spec: ArtSpec, caption: string): HTMLElement => {
  const fig = document.createElement('figure')
  fig.innerHTML = `<div class="art">${svgFor(spec, cls)}</div><figcaption>${caption}</figcaption>`
  document.querySelector(host)!.appendChild(fig)
  return fig.querySelector('.art')!
}

// 场景:还没配插画的场景也会列出来(只有背景),一眼看出缺哪些
for (const [id, scene] of Object.entries(SCENES)) {
  const art = SCENE_ART[id]
  mount('#scenes', art ?? { bg: scene.bg ?? 'corridor', items: [] }, `${id} · ${scene.title ?? ''}${art ? '' : ' · ⚠ 未配置插画'}`)
}
for (const [id, spec] of Object.entries(COMBAT_ART)) mount('#combat', spec, `⚔ ${id} · ${MONSTERS[id]?.name ?? ''}`)
for (const [id, spec] of Object.entries(ENDING_ART)) mount('#combat', spec, `🏁 ${id} · ${ENDINGS[id]?.name ?? ''}`)

for (const [id, make] of Object.entries(BACKDROPS)) {
  const fig = document.createElement('figure')
  fig.innerHTML = `<div class="art"><svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice">${make().replaceAll('§', `b-${id}-`)}</svg></div><figcaption>背景 · ${id}</figcaption>`
  document.querySelector('#bgs')!.appendChild(fig)
}

// 物件:单独出一张图,视野裁到物件包围盒(渐变 id 换成每个物件自己的前缀)
for (const [id, make] of Object.entries(PROPS)) {
  const fig = document.createElement('figure')
  fig.innerHTML = `<div class="art"><svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><rect class="sheet-bg" fill="#241a12"/></svg></div><figcaption>物件 · ${id}</figcaption>`
  document.querySelector('#props')!.appendChild(fig)
  const el = fig.querySelector<HTMLElement>('.art')!
  const svg = el.querySelector('svg')!
  const u = `p-${id}-`
  svg.insertAdjacentHTML('afterbegin', DEFS.replaceAll('§', u))
  svg.insertAdjacentHTML('beforeend', `<g transform="translate(200 150) scale(1.6)">${make().replaceAll('§', u)}</g>`)
  const b = (svg.lastElementChild as SVGGraphicsElement).getBBox()   // 注意:getBBox 不含元素自身的 transform
  const pad = 8
  const box = { x: 200 + b.x * 1.6 - pad, y: 150 + b.y * 1.6 - pad, w: b.width * 1.6 + pad * 2, h: b.height * 1.6 + pad * 2 }
  svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`)
  const bg = svg.querySelector('rect')!
  for (const [k, v] of Object.entries(box)) bg.setAttribute(k === 'w' ? 'width' : k === 'h' ? 'height' : k, String(v))
  el.style.aspectRatio = `${box.w} / ${Math.max(1, box.h)}`
}
