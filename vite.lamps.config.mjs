// ─── Lamps H5 构建配置:产物是可直接上传的小游戏包 ─────────────────────
// 与小黑盒构建的区别:
//   1) 不引入 miniappManifest 插件(否则页面带小黑盒运行时放行检查,在小黑盒外会白屏)
//   2) 把 @heybox/hb-sdk 换成空实现,平台能力改走 window.LampsPlatform / LampsGame
//   3) index.html 注入 Lamps 平台脚本(状态栏 / 激励视频 / 云存档 / 排行榜)
//   4) 产物根目录直接是 index.html,符合平台「入口必须在游戏根目录」的要求
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const scripts = [
  'lamps/status-bar-bridge.js',
  'lamps/status-bar-platform.js',
  'lamps/rewarded-video-bridge.js',
  'lamps/rewarded-video-platform.js',
  'lamps/progress-bridge.js',
  'lamps/progress-platform.js',
  'lamps/leaderboard-bridge.js',
  'lamps/leaderboard-platform.js',
]

/** 把平台脚本插到 <head> 前面:普通脚本按顺序执行,早于入口 module */
function injectLampsPlatform() {
  return {
    name: 'lamps-platform-scripts',
    transformIndexHtml(html) {
      const tags = scripts
        .map((s) => `<script src="./${s}"></script>`)
        .join('\n    ')
      return html.replace('<head>', `<head>\n    ${tags}`)
    },
  }
}

/** 把「站内昵称」模块整体换成 stub,确保产物里没有任何站外标识 */
function stubHeyboxUser() {
  return {
    name: 'lamps-stub-heybox-user',
    enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('/heybox-user') || id.endsWith('heybox-user.ts')) {
        return resolve(root, 'src/platform/heybox-user.stub.ts')
      }
      return null
    },
  }
}

/** 构建后打印关键文件大小,便于确认单文件不超限 */
function reportSizes() {
  return {
    name: 'lamps-report-sizes',
    closeBundle() {
      const files = ['lamps-dist/index.html']
      for (const f of files) {
        try {
          const size = readFileSync(resolve(root, f)).length
          console.log(`[lamps] ${f}  ${(size / 1024).toFixed(1)} KB`)
        } catch { /* 忽略 */ }
      }
    },
  }
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'lamps-dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2019',
  },
  resolve: {
    alias: {
      '@heybox/hb-sdk': resolve(root, 'src/platform/hb-stub.ts'),
    },
  },
  define: {
    __LAMPS_BUILD__: 'true',
  },
  plugins: [stubHeyboxUser(), injectLampsPlatform(), reportSizes()],
})
