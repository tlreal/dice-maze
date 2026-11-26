// ─── 小黑盒昵称(仅小黑盒构建使用;Lamps 构建会把这个模块整体替换成 stub) ───
import hbSDK from '@heybox/hb-sdk'

export async function heyboxNickname(): Promise<string | null> {
  try {
    const info = await hbSDK.user.getInfo()
    if (info.isHeyboxAppLoggedIn && info.userInfo?.profile?.nickname) {
      return info.userInfo.profile.nickname
    }
    return null
  } catch {
    return null
  }
}
