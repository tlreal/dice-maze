// ─── 入口:握手门控 + 安全区 + 启动 UI ───────────────────────────────
import './ui/styles.css'
import hbSDK from '@heybox/hb-sdk'
import { sdk } from './sdk'
import { GameUI } from './ui/render'
import { particles } from './fx/particles'
import { sfx } from './fx/audio'
import { SCENES } from './content/scenes'
import type { ClassId, MetaState } from './game/types'

const DEFAULT_META: MetaState = {
  emberMarks: 0,
  unlockedClasses: [],
  endings: [],
  epitaphs: [],
  bestScore: 0,
  runsPlayed: 0,
  soundOn: true,
  fontScale: 1,
  stageOn: true,
  stageCollapsed: false,
  skipSeen: true,
  seenScenes: [],
}

async function boot(): Promise<void> {
  sdk.init()
  // 音效:首次手势解锁
  window.addEventListener('pointerdown', () => sfx.unlock(), { once: true, capture: true })

  // 粒子层
  particles.mount()

  // 读取持久化设置
  const meta = { ...DEFAULT_META, ...((await sdk.kvGet<Partial<MetaState>>('meta_v1')) ?? {}) } as MetaState
  sfx.setEnabled(meta.soundOn)

  // 等握手(带超时兜底,浏览器直开时也能玩)
  await new Promise<void>((resolve) => {
    const done = () => resolve()
    if (sdk.handshake.status !== 'connecting') { done(); return }
    const stop = sdk.onHandshake((s) => { if (s.status !== 'connecting') { stop(); done() } })
    setTimeout(done, 3000)
  })

  const ui = new GameUI(meta)
  await ui.showTitle()

  // 开发用:打开 /?scene=a1_gate&cls=mage 直接跳进某个场景看画面(不进生产构建)
  if (import.meta.env.DEV) {
    const q = new URLSearchParams(location.search)
    const sceneId = q.get('scene') ?? ''
    const classes: ClassId[] = ['fighter', 'mage', 'rogue', 'cleric', 'bard', 'paladin']
    const cls = q.get('cls') as ClassId | null
    if (sceneId && SCENES[sceneId]) ui.devJump(sceneId, cls && classes.includes(cls) ? cls : 'fighter')
  }

  // 导航栏深色前景(模板同款逻辑)
  try {
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      hbSDK.viewport.setNavigationBarStyle({ foregroundStyle: dark.matches ? 'light' : 'dark' }).catch(() => {})
    }
    sync()
    dark.addEventListener?.('change', sync)
  } catch { /* 忽略 */ }

  // 生命周期:隐藏时降粒子,展示时恢复
  const vis = () => {
    if (document.visibilityState === 'visible') sfx.setEnabled(meta.soundOn)
  }
  document.addEventListener('visibilitychange', vis)
}

// 引导守卫:dev 环境 runtime gate 的脚本恢复可能造成模块双执行,
// 第二个实例会重置 DOM、打断进行中的局。只允许引导一次。
const bootFlag = (window as unknown as { __DICE_MAZE_BOOTED__?: boolean })
if (!bootFlag.__DICE_MAZE_BOOTED__) {
  bootFlag.__DICE_MAZE_BOOTED__ = true
  void boot()
}
