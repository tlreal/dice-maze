// ─── 构建替身:仅 Lamps H5 包体使用(通过 Vite alias 替换 @heybox/hb-sdk) ───
// Lamps 包体里不引入小黑盒 SDK:平台能力统一由 src/sdk.ts 走 window.LampsPlatform / LampsGame。
// 这里提供同名导出,避免其它模块的静态 import 报错;所有调用都返回失败或空操作。
/* eslint-disable @typescript-eslint/no-explicit-any */

const reject = (): Promise<never> => Promise.reject(new Error('PLATFORM_DISABLED'))
const noop = (): Promise<Record<string, unknown>> => Promise.resolve({})

const hbSDKStub: any = {
  ui: { showToast: noop },
  device: { vibrate: noop },
  storage: { getStorage: reject, setStorage: noop },
  user: { getInfo: reject },
  cloud: { leaderboard: { submit: reject, getList: reject } },
  share: { screenshot: reject },
  viewport: { setNavigationBarStyle: noop },
}

export default hbSDKStub
export const onHandshakeStateChange = (_cb: (s: { status: string }) => void): (() => void) => () => {}
export type MiniProgramSDKHandshakeState = { status: 'connecting' | 'ready' | 'error' }
