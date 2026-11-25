// ─── 封面渲染(仅开发用):用游戏插画 + 标题排版,截图为 16:9 封面 ───
// 打开 /cover.html?scene=a1_gate 可换背景场景;?badge=... 可换右上角角标。
import { svgFor } from '../art/render'
import { SCENE_ART } from '../art/sceneArt'
import type { ClassId } from '../game/types'

const q = new URLSearchParams(location.search)
const sceneId = q.get('scene') ?? 'a1_gate'
const cls = (q.get('cls') as ClassId | null) ?? 'fighter'
const badge = q.get('badge')

const art = document.getElementById('art')!
const spec = SCENE_ART[sceneId]
art.innerHTML = svgFor(spec ?? { bg: 'gate', items: [] }, cls)
// 巨门场景整体偏暗:封面里略提亮,让小图下也能看清门楣与门板
if (sceneId === 'a1_gate') art.style.filter = 'brightness(1.14) saturate(1.04)'
if (badge !== null) {
  const el = document.getElementById('badge')
  if (el) el.textContent = badge
}
document.body.dataset.ready = '1'
