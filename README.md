# 骰运迷城 · dice-maze

小黑盒小程序工坊的 DnD 跑团肉鸽文字冒险游戏。

- **玩法**：15~25 分钟单局肉鸽。掷骰建卡（六属性 / 四+二职业）→ 三幕随机地城 → 死亡或通关结算分数上传云端排行榜。
- **骰学**：透明检定（DC + 成功率 + 优势）、nat20/nat1 专属演出、死亡豁免、暴击骰翻倍、抗性与武器材质、灵感重骰、升级专长。
- **剧情**：三暗线（英雄残章 / 炉火婆婆 / 骷髅诗人班卓）× 四结局（斩王 / 归还·真结局 / 堕落 / 殒命墓志铭），全原创文本。
- **演出**：CSS 3D d20 掷骰仪式、打字机旁白、Canvas 余烬粒子、hit-stop/震屏/受击暗角、WebAudio 程序化音效（零素材）。

## 命令

```bash
npm install
npm run dev      # hb-sdk dev(需 CLI 登录并绑定远端小程序)
npx vite         # 纯浏览器调试(SDK 降级,无排行榜/分享)
npm run build    # 类型检查 + hb-sdk build → dist/
npm run deploy -- --release-note "更新说明"
```

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
- `src/fx/` 演出（dice3d / particles / typewriter / screenfx / audio）
- `src/ui/` 渲染（render 事件播放器 / styles 黑金主题）
- `src/sdk.ts` hb-sdk 薄封装（全部优雅降级：未登录/能力缺失不阻断主流程）
- `scripts/gen_assets.py` 图标封面生成（程序化，无外部素材）
- `scripts/simulate.mts` 无头模拟器（`npx tsx scripts/simulate.mts 400`）
- `qa-harness.html` + `scripts/qa_proxy.py` 本地 QA 挂具（绕过 dev gate 做纯浏览器调试，**不进入构建产物**）

## 平衡基线（无头模拟 800 局）

Bot 总胜率 ~9%（牧师 16% / 游荡者 10% / 战士 7% / 法师 ~1%——高难职业，Boss 战需买烬焰魔剑应对）。死亡分布 1/2/3 幕 ≈ 83/283/366，四结局全部可达，零崩溃。人类玩家有商店对策、暗号先手（对暗号可在烬王战获得先手轮）与专长构筑，实际胜率显著更高。

更多内容见 [CLI 指南](https://docs.xiaoheihe.cn/hb_sdk/guide/cli) 和 [SDK 文档](https://docs.xiaoheihe.cn/hb_sdk/)。
