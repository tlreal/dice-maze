// ─── 平台能力薄封装:Lamps 优先,小黑盒兜底,浏览器纯本机 ────────────────
// 原则:任何平台能力失败都不阻断游戏主流程。
// - 在 Lamps 小游戏内(window.LampsPlatform / window.LampsGame 存在):
//   云存档走 saveGameProgress/getGameProgress,榜单走 LampsPlatform,激励视频走 LampsGame,
//   状态栏安全区走 LampsGame.applyStatusBarSafeTop。
// - 在小黑盒内:沿用原来的 hb-sdk。
// - 纯浏览器:本机缓存照常可玩。
import hbSDK, { onHandshakeStateChange, type MiniProgramSDKHandshakeState } from '@heybox/hb-sdk'
import { heyboxNickname } from './platform/heybox-user'

export const LEADERBOARD_KEY = 'dice_maze_score_v1'

type Listener = (state: MiniProgramSDKHandshakeState) => void

/** 云端进度的一条记录:整局存档 + 跨局设置/图鉴/最佳分 */
interface ProgressPayload {
  v: 1
  run: unknown | null
  meta: unknown | null
}

interface LampsApi {
  getGameProgress?: () => Promise<{ ok: boolean; message?: string; data?: { record?: { gamePayload?: unknown } } | null }>
  saveGameProgress?: (p: Record<string, unknown>) => Promise<{ ok: boolean; message?: string; data?: unknown }>
  submitLeaderboardScore?: (score: number, rankType?: string, dataLoad?: Record<string, unknown>) => Promise<{ ok: boolean; message?: string; data?: unknown }>
  getLeaderboard?: (rankType?: string) => Promise<{ ok: boolean; message?: string; data?: { list?: { rank: number; nickname?: string; score: number; isCurrentUser?: boolean; dataLoad?: Record<string, unknown> }[] } | null }>
  getMyLeaderboardRecord?: (rankType?: string) => Promise<{ ok: boolean; message?: string; data?: { record?: { rank: number; score: number } | null } | null }>
  getLeaderboardInfo?: (rankType?: string) => Promise<{ ok: boolean; data?: { totalCount?: number } | null }>
  showRewardedVideo?: (o?: { source?: string }) => Promise<{ ok: boolean; code?: string; message?: string }>
  applyStatusBarSafeTop?: () => Promise<{ ok: boolean; data: { height: number } }>
}

interface LampsGameApi {
  showRewardedVideo?: (o?: { source?: string }) => Promise<{ ok: boolean; code?: string; message?: string }>
  applyStatusBarSafeTop?: () => Promise<{ ok: boolean; data: { height: number } }>
}

const w = window as unknown as { LampsPlatform?: LampsApi; LampsGame?: LampsGameApi }
const lampsPlatform = (): LampsApi | undefined => w.LampsPlatform
const lampsGame = (): LampsGameApi | undefined => w.LampsGame
/** 是否运行在 Lamps 宿主内 */
export const inLamps = (): boolean => !!(lampsPlatform() && lampsGame())

export type CloudState = 'none' | 'loading' | 'ready' | 'empty' | 'error'

const EMPTY_PROGRESS = (): ProgressPayload => ({ v: 1, run: null, meta: null })
const META_KEY = 'meta_v1'
const SAVE_KEY = 'save_v1'
const MIN_SAVE_GAP = 3000   // 连续自动保存的最小间隔(平台规范要求 ≥3 秒)

class SdkBridge {
  handshake: MiniProgramSDKHandshakeState = { status: 'connecting' }
  private listeners = new Set<Listener>()

  // ── 云端进度状态 ──
  cloudState: CloudState = 'none'
  cloudMessage = ''
  private progress: ProgressPayload = EMPTY_PROGRESS()
  private dirty = false
  private saving = false
  private saveTimer: number | null = null
  private lastSaveAt = 0

  init(): void {
    try {
      onHandshakeStateChange((state) => {
        this.handshake = state
        for (const l of this.listeners) l(state)
      })
    } catch (e) {
      console.warn('[sdk] 握手订阅失败(浏览器环境属正常)', e)
      this.handshake = { status: 'ready' }
    }
    if (inLamps()) {
      this.handshake = { status: 'ready' }
      this.cloudState = 'loading'
    }
  }

  onHandshake(l: Listener): () => void {
    this.listeners.add(l)
    l(this.handshake)
    return () => this.listeners.delete(l)
  }

  /** SDK 能力调用超时保护:握手异常时避免永久挂起(会白屏) */
  private withTimeout<T>(p: Promise<T>, ms = 2200): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('SDK_CALL_TIMEOUT')), ms)
      p.then(
        (v) => { clearTimeout(timer); resolve(v) },
        (e) => { clearTimeout(timer); reject(e) },
      )
    })
  }

  // ═══ 云端进度 ═══
  /**
   * 启动时读取云存档。Lamps 内读失败必须让玩家知道(不能当成无存档),
   * 由 UI 决定「重试 / 仅本机」;纯浏览器与小黑盒直接走本机缓存。
   */
  async loadCloudProgress(): Promise<void> {
    if (!inLamps()) { this.cloudState = 'none'; return }
    const api = lampsPlatform()
    if (!api?.getGameProgress) { this.cloudState = 'none'; return }
    this.cloudState = 'loading'
    try {
      // 首屏不能等父页面 15 秒:6 秒没回包按读取失败处理,由玩家选择重试或仅本机
      const res = await Promise.race([
        api.getGameProgress(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('云存档读取超时')), 6000)),
      ])
      if (!res.ok) {
        this.cloudState = 'error'
        this.cloudMessage = res.message || '云存档读取失败'
        return
      }
      const payload = res.data?.record?.gamePayload
      if (!payload || typeof payload !== 'object') {
        this.progress = EMPTY_PROGRESS()
        this.cloudState = 'empty'
        this.readLocalMirror()
        return
      }
      const p = payload as Partial<ProgressPayload>
      this.progress = {
        v: 1,
        run: p.run ?? null,
        meta: p.meta ?? null,
      }
      this.cloudState = this.progress.run || this.progress.meta ? 'ready' : 'empty'
      this.writeLocalMirror()
    } catch (e) {
      this.cloudState = 'error'
      this.cloudMessage = (e as Error).message || '云存档读取失败'
    }
  }

  /** 云读失败时玩家明确选择「仅本机」:用本机缓存继续 */
  useLocalOnly(): void {
    this.readLocalMirror()
    this.cloudState = this.progress.run || this.progress.meta ? 'ready' : 'empty'
  }

  /** 立刻把当前进度写入云端(例如一局结束清档时) */
  async flushProgress(): Promise<boolean> {
    if (!inLamps()) return true
    const api = lampsPlatform()
    if (!api?.saveGameProgress) return false
    if (this.saving) { this.dirty = true; return true }
    this.saving = true
    this.dirty = false
    const snapshot: ProgressPayload = { v: 1, run: this.progress.run, meta: this.progress.meta }
    try {
      const res = await api.saveGameProgress(snapshot as unknown as Record<string, unknown>)
      if (!res.ok || !res.data) {
        this.cloudMessage = res.message || '云存档写入失败'
        this.dirty = true          // 保留待保存状态,等下一次变化再写,不自动重试
        return false
      }
      this.lastSaveAt = Date.now()
      return true
    } catch (e) {
      this.cloudMessage = (e as Error).message || '云存档写入失败'
      this.dirty = true
      return false
    } finally {
      this.saving = false
      if (this.dirty && Date.now() - this.lastSaveAt >= MIN_SAVE_GAP) this.scheduleSave()
    }
  }

  private scheduleSave(): void {
    this.dirty = true
    if (this.saveTimer !== null) return
    const wait = Math.max(0, MIN_SAVE_GAP - (Date.now() - this.lastSaveAt))
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null
      if (this.dirty) void this.flushProgress()
    }, wait)
  }

  private readLocalMirror(): void {
    try {
      const raw = localStorage.getItem('dm_cloud_cache')
      if (!raw) return
      const p = JSON.parse(raw) as Partial<ProgressPayload>
      this.progress = { v: 1, run: p.run ?? null, meta: p.meta ?? null }
    } catch { /* 缓存损坏就当没有 */ }
  }

  private writeLocalMirror(): void {
    try { localStorage.setItem('dm_cloud_cache', JSON.stringify(this.progress)) } catch { /* 满了就算了 */ }
  }

  // ═══ 提示 ═══
  async toast(message: string, status: 'success' | 'error' = 'success'): Promise<void> {
    if (inLamps()) { this.domToast(message, status); return }
    try {
      await this.withTimeout(hbSDK.ui.showToast({ message: message.slice(0, 120), status }), 1500)
    } catch { /* 静默 */ }
  }

  /** Lamps 没有平台 toast,自己画一个(样式跟随黑金主题) */
  private domToast(message: string, status: 'success' | 'error'): void {
    let box = document.getElementById('lamps-toast') as HTMLElement | null
    if (!box) {
      box = document.createElement('div')
      box.id = 'lamps-toast'
      document.body.appendChild(box)
    }
    box.textContent = message.slice(0, 120)
    box.className = status === 'error' ? 'show err' : 'show'
    window.clearTimeout(Number(box.dataset.timer ?? 0))
    const timer = window.setTimeout(() => { box!.className = '' }, 2000)
    box.dataset.timer = String(timer)
  }

  async vibrate(): Promise<void> {
    if (inLamps()) {
      try { navigator.vibrate?.(12) } catch { /* 静默 */ }
      return
    }
    try { await this.withTimeout(hbSDK.device.vibrate(), 1200) } catch { /* 静默 */ }
  }

  // ═══ 键值(本地缓存 + Lamps 云端进度) ═══
  async kvGet<T>(key: string): Promise<T | undefined> {
    if (inLamps()) {
      if (key === META_KEY) return (this.progress.meta ?? undefined) as T | undefined
      if (key === SAVE_KEY) return (this.progress.run ? JSON.stringify(this.progress.run) : undefined) as T | undefined
      return undefined
    }
    try {
      const r = await this.withTimeout(hbSDK.storage.getStorage<T>({ key }))
      return r.data
    } catch (e) {
      console.warn('[sdk] storage 读取失败,降级 localStorage', e)
      try {
        const raw = localStorage.getItem(`dm_${key}`)
        return raw ? (JSON.parse(raw) as T) : undefined
      } catch { return undefined }
    }
  }

  async kvSet(key: string, data: unknown): Promise<void> {
    if (inLamps()) {
      if (key === META_KEY) this.progress.meta = data ?? null
      else if (key === SAVE_KEY) {
        // 存档以字符串形式传入,云端存成对象更紧凑
        if (typeof data === 'string') {
          try { this.progress.run = JSON.parse(data) } catch { this.progress.run = null }
        } else {
          this.progress.run = data ?? null
        }
        this.writeLocalMirror()
        // 清档(一局结束)要尽快落盘,避免旧存档复活;其余变化走防抖
        if (this.progress.run === null) { void this.flushProgress() } else { this.scheduleSave() }
        return
      } else return
      this.writeLocalMirror()
      this.scheduleSave()
      return
    }
    try {
      await this.withTimeout(hbSDK.storage.setStorage({ key, data }))
    } catch (e) {
      console.warn('[sdk] storage 写入失败,降级 localStorage', e)
      try { localStorage.setItem(`dm_${key}`, JSON.stringify(data)) } catch { /* 满了就算了 */ }
    }
  }

  // ═══ 用户 ═══
  async getNickname(): Promise<string | null> {
    if (inLamps()) return null   // Lamps 只通过榜单返回昵称,不额外取玩家资料
    return heyboxNickname()
  }

  // ═══ 激励视频 ═══
  get adsAvailable(): boolean { return inLamps() && !!lampsGame()?.showRewardedVideo }

  /**
   * 申请播放一条激励视频。只有 ok === true 才发奖。
   * 失败不 reject;带上可直接展示的 message。
   */
  async showRewardedVideo(source: string): Promise<{ ok: boolean; code?: string; message?: string }> {
    const g = lampsGame()
    if (!g?.showRewardedVideo) return { ok: false, code: 'UNAVAILABLE', message: '激励视频暂不可用' }
    try {
      const res = await g.showRewardedVideo({ source })
      if (res.ok) return { ok: true }
      return { ok: false, code: res.code, message: res.message || '观看视频失败,请重试' }
    } catch (e) {
      return { ok: false, code: 'UNAVAILABLE', message: (e as Error).message || '观看视频失败,请重试' }
    }
  }

  // ═══ 状态栏安全区 ═══
  async applySafeTop(): Promise<void> {
    const g = lampsGame()
    if (!g?.applyStatusBarSafeTop) return
    try { await g.applyStatusBarSafeTop() } catch { /* 子页面 env() 兜底 */ }
  }

  // ═══ 排行榜 ═══
  async submitScore(score: number, extra: Record<string, unknown>): Promise<{ rank: number; ranked: boolean } | null> {
    if (inLamps()) {
      const api = lampsPlatform()
      if (!api?.submitLeaderboardScore) return null
      try {
        const res = await api.submitLeaderboardScore(Math.trunc(score), '', extra)
        if (!res.ok) return null
        const mine = await api.getMyLeaderboardRecord?.()
        const record = mine?.ok ? mine.data?.record ?? null : null
        return { rank: record?.rank ?? 0, ranked: true }
      } catch { return null }
    }
    try {
      const entry = await this.withTimeout(hbSDK.cloud.leaderboard.submit({ key: LEADERBOARD_KEY, score, extra }), 5000)
      return { rank: entry.rank, ranked: entry.ranked }
    } catch (e) {
      const code = (e as { code?: string })?.code
      if (code === 'UNAUTHORIZED') return null
      console.warn('[sdk] 排行榜提交失败', code ?? e)
      return null
    }
  }

  async fetchLeaderboard(): Promise<{
    entries: { rank: number; score: number; appUserId: string; nickname?: string; extra: Record<string, unknown> }[]
    hasMore: boolean
    cursor?: string
    myRecord?: { rank: number; score: number } | null
    totalCount?: number
  } | null> {
    if (inLamps()) {
      const api = lampsPlatform()
      if (!api?.getLeaderboard) return null
      try {
        const [board, mine, info] = await Promise.all([
          api.getLeaderboard(''),
          api.getMyLeaderboardRecord?.('') ?? Promise.resolve(null),
          api.getLeaderboardInfo?.('') ?? Promise.resolve(null),
        ])
        if (!board.ok) return null
        const list = board.data?.list ?? []
        return {
          entries: list.map((e) => ({
            rank: e.rank,
            score: e.score,
            appUserId: e.nickname ?? '',
            nickname: e.nickname ?? '',
            extra: (e.dataLoad ?? {}) as Record<string, unknown>,
          })),
          hasMore: false,
          myRecord: mine?.ok ? (mine.data?.record ?? null) : null,
          totalCount: info?.ok ? (info.data?.totalCount ?? list.length) : list.length,
        }
      } catch { return null }
    }
    try {
      const page = await this.withTimeout(hbSDK.cloud.leaderboard.getList({ key: LEADERBOARD_KEY, limit: 50, cursor: undefined }), 6000)
      return {
        entries: page.entries.map((e) => ({
          rank: e.rank, score: e.score, appUserId: e.appUserId, extra: e.extra,
        })),
        hasMore: page.hasMore,
        cursor: page.cursor,
      }
    } catch (e) {
      console.warn('[sdk] 排行榜读取失败', (e as { code?: string })?.code ?? e)
      return null
    }
  }

  // ═══ 分享截图(Lamps 无此能力) ═══
  screenshotSupported = true

  async shareScreenshot(): Promise<boolean> {
    if (inLamps()) return false
    try {
      await this.withTimeout(hbSDK.share.screenshot({ saveToAlbum: true }), 8000)
      return true
    } catch (e) {
      const code = (e as { code?: string })?.code
      if (code === 'METHOD_FORBIDDEN' || code === 'PERMISSION_NOT_IN_SNAPSHOT') this.screenshotSupported = false
      console.warn('[sdk] 截图分享不可用', code ?? e)
      return false
    }
  }
}

export const sdk = new SdkBridge()
