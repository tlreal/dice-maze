// ─── hb-sdk 薄封装:全部能力优雅降级 ────────────────────────────────
// 原则:SDK 任何失败都不阻断游戏主流程;browser dev host 可能不支持的能力
// (截图/震动等)静默吞掉并记录。
import hbSDK, { onHandshakeStateChange, type MiniProgramSDKHandshakeState } from '@heybox/hb-sdk'

export const LEADERBOARD_KEY = 'dice_maze_score_v1'

type Listener = (state: MiniProgramSDKHandshakeState) => void

class SdkBridge {
  handshake: MiniProgramSDKHandshakeState = { status: 'connecting' }
  private listeners = new Set<Listener>()

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

  async toast(message: string, status: 'success' | 'error' = 'success'): Promise<void> {
    try {
      await this.withTimeout(hbSDK.ui.showToast({ message: message.slice(0, 120), status }), 1500)
    } catch { /* 静默 */ }
  }

  async vibrate(): Promise<void> {
    try { await this.withTimeout(hbSDK.device.vibrate(), 1200) } catch { /* 静默 */ }
  }

  // ── 本地存储 ──
  async kvGet<T>(key: string): Promise<T | undefined> {
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
    try {
      await this.withTimeout(hbSDK.storage.setStorage({ key, data }))
    } catch (e) {
      console.warn('[sdk] storage 写入失败,降级 localStorage', e)
      try { localStorage.setItem(`dm_${key}`, JSON.stringify(data)) } catch { /* 满了就算了 */ }
    }
  }
  // ── 用户 ──
  async getNickname(): Promise<string | null> {
    try {
      const info = await this.withTimeout(hbSDK.user.getInfo(), 2500)
      if (info.isHeyboxAppLoggedIn && info.userInfo?.profile?.nickname) {
        return info.userInfo.profile.nickname
      }
      return null
    } catch { return null }
  }

  // ── 排行榜 ──
  async submitScore(score: number, extra: Record<string, unknown>): Promise<{ rank: number; ranked: boolean } | null> {
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

  async fetchLeaderboard(cursor?: string): Promise<{
    entries: { rank: number; score: number; appUserId: string; extra: Record<string, unknown> }[]
    hasMore: boolean
    cursor?: string
  } | null> {
    try {
      const page = await this.withTimeout(hbSDK.cloud.leaderboard.getList({ key: LEADERBOARD_KEY, limit: 50, cursor }), 6000)
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

  // ── 分享截图 ──
  screenshotSupported = true

  async shareScreenshot(): Promise<boolean> {
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
