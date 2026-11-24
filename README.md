# 骰运迷城 · dice-maze

小黑盒小程序工坊的 DnD 跑团肉鸽文字冒险游戏。

- **玩法**：15~25 分钟单局肉鸽。掷骰建卡（六属性 / 四+二职业）→ 三幕随机地城 → 死亡或通关结算分数上传云端排行榜。
- **骰学**：透明检定（DC + 成功率 + 优势）、nat20/nat1 专属演出、死亡豁免、暴击骰翻倍、抗性与武器材质、灵感重骰、升级专长。
- **剧情**：三暗线（英雄残章 / 炉火婆婆 / 骷髅诗人班卓）× 四结局（斩王 / 归还·真结局 / 堕落 / 殒命墓志铭），全原创文本；三幕共 55 个场景，每局只走到其中一部分。
- **画面**：文字上方常驻画面区。每个场景配一张黑金余烬风的剪影插画，读到哪一段，画面对应部位就高亮、镜头轻推；选项结算用图示标出得失；战斗时变成左右对峙的打斗画面（冲撞 / 受击 / 闪避 / 倒下）。全部由代码绘制，不含图片素材。
- **演出**：CSS 3D d20 掷骰仪式、打字机旁白、Canvas 余烬粒子、hit-stop/震屏/受击暗角、WebAudio 程序化音效（零素材）。

## 命令

```bash
npm install
npm run dev      # hb-sdk dev(需 CLI 登录并绑定远端小程序)
npm run build    # 类型检查 + hb-sdk build → dist/
npm run deploy -- --release-note "更新说明"
```

### 本地浏览器预览（不登录）

dev 页面带运行时放行检查，直接用 `npx vite` 打开会停在「请在小黑盒 APP 内打开」。走仓库自带的 QA 挂具即可：

```bash
npx vite                      # 终端 1(挂具默认转发到 5173)
python scripts/qa_proxy.py    # 终端 2
```

然后打开 <http://127.0.0.1:8124/qa-harness.html>。挂具会把地址栏参数转给内嵌的游戏页：

- `qa-harness.html?scene=a1_gate&cls=mage` — 直接跳进某个场景（无敌），对照画面与文案。`cls` 可选 fighter / mage / rogue / cleric / bard / paladin
- `qa-harness.html?page=/art-gallery.html` — 插画总览：全部场景插画、战斗与结局画面、背景、物件

没有 SDK 宿主时，启动要等几层超时兜底，约 10 秒才进游戏。

## 发布准备

```bash
npm run hb-sdk -- login
npm run hb-sdk -- remote create          # 或 remote bind <mini-program-id>
npm run hb-sdk -- remote cloud leaderboard create dice_maze_score_v1 --order desc --rank-limit 500
```

- `heybox.category` 已声明为 `game`；`desc` / 图标（200×200）/ 封面（510×272）均已就绪。
- 权限声明：storage / leaderboard / userInfo / share —— 全部免平台审批，无 network、无后端。
- `platforms` 默认五平台（android/ios/ohos/windows/macos）；未验收的平台发布前可删除。

## 目录

- `src/game/` 引擎（types / rng 骰学 / rules 规则 / engine 状态机协程）
- `src/content/` 内容（classes / items / monsters / scenes 三幕全量剧情）
- `src/art/` 插画（kit 画具库 / backdrops 背景 / props 物件 / figures 人物与怪物 / sceneArt 场景总表与段落聚焦 / render 渲染）。新增场景时在 `sceneArt.ts` 配一张插画，`focus` 的段数要和正文段数一致（模拟器会检查）；想换成现成图片，在 `IMAGE_OVERRIDES` 登记一行即可
- `src/fx/` 演出（dice3d / particles / typewriter / screenfx / audio）
- `src/ui/` 渲染（render 事件播放器 / stage 画面区 / styles 黑金主题）
- `src/sdk.ts` hb-sdk 薄封装（全部优雅降级：未登录/能力缺失不阻断主流程）
- `scripts/gen_assets.py` 图标封面生成（程序化，无外部素材）
- `scripts/simulate.mts` 无头模拟器（`npx tsx scripts/simulate.mts 400`）：稳定性 / 结局可达 / 数值，外加「场景零重播」「插画全覆盖」两项检查
- `art-gallery.html` 插画总览页（开发用，**不进入构建产物**）
- `qa-harness.html` + `scripts/qa_proxy.py` 本地 QA 挂具（应答 dev 放行检查，并把地址栏参数转给内嵌页，**不进入构建产物**）

## 平衡基线（无头模拟 800 局）

Bot 总胜率 ~11%（牧师 26% / 战士 8.5% / 游荡者 8.5% / 法师 ~1%——高难职业，Boss 战需买烬焰魔剑应对）。死亡分布 1/2/3 幕 ≈ 39/240/433，四结局全部可达，零崩溃、零场景重播。人类玩家有商店对策、暗号先手（对暗号可在烬王战获得先手轮）与专长构筑，实际胜率显著更高。

更多内容见 [CLI 指南](https://docs.xiaoheihe.cn/hb_sdk/guide/cli) 和 [SDK 文档](https://docs.xiaoheihe.cn/hb_sdk/)。
