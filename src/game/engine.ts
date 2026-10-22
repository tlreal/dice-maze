// ─── 游戏引擎:场景状态机 + 战斗循环 + 存档 ─────────────────────────
// 模式:引擎是同步生成器协程。yield 出演出事件,UI 播放动画后用
// engine.next(input) 回填用户输入(选项/专长/装备决定…)。
import type {
  ClassId, CombatState, EndingDef, GotoTarget, MonsterDef,
  OutcomeEffect, PlayerState, RunState, SceneChoice, SceneNode, SkillKey,
} from './types'
import { SKILL_ATTR, SKILL_NAMES, ATTR_NAMES } from './types'
import { SCENES, ACT_PLANS, ENDINGS, EPITAPHS } from '../content/scenes'
import { MONSTERS } from '../content/monsters'
import { SHOPS, itemDef } from '../content/items'
import { classDef, FEATS, COMBAT_ABILITIES } from '../content/classes'
import {
  applyDamageMods, attackBonus, attrMod, baseHp, computeScore, levelUpGains,
  maxResource, offerFeats, resolveCheck, rollDeathSave, rollWeaponDamage,
  skillMod, successChance, totalAc, weaponMaterial, xpForLevel,
  type CheckOutcome,
} from './rules'
import { pick, randInt, rollDice, rollCheck, shuffle, rollStats, resetRollStats } from './rng'

// ─── 演出事件(UI 播放) ─────────────────────────────────────────────
export type GameEvent =
  | { kind: 'narration'; paras: string[]; instant?: boolean }
  | { kind: 'sceneTitle'; title: string; act: 1 | 2 | 3; bg?: string }
  | { kind: 'title'; text: string; sub?: string }
  | { kind: 'fx'; fx: 'gold' | 'heal' | 'hurt' | 'fragment' | 'ember' }
  | { kind: 'check'; outcome: CheckOutcome }
  | { kind: 'askInspiration'; label: string }
  | { kind: 'choices'; views: ChoiceView[] }
  | { kind: 'combatStart'; monster: MonsterDef; firstStrike?: boolean }
  | { kind: 'combatLog'; lines: string[] }
  | { kind: 'damage'; target: 'player' | 'monster'; value: number; crit?: boolean; note?: string }
  | { kind: 'heal'; target: 'player' | 'monster'; value: number }
  | { kind: 'deathSave'; roll: number; successes: number; failures: number; note?: string }
  | { kind: 'levelUp'; level: number; hpGain: number; feats: string[] }
  | { kind: 'equipPrompt'; itemId: string }
  | { kind: 'toast'; text: string }
  | { kind: 'actTransition'; act: number }
  | { kind: 'shop'; shopId: string }
  | { kind: 'ending'; ending: EndingDef; epitaph?: string }
  | { kind: 'gameOver' }

export interface ChoiceView {
  id: string
  text: string
  hint?: string
  locked: boolean
  lockReason?: string
  checkLabel?: string   // 「感知 DC12 · 65% · 优势」
}

export type InteractionInput = string | boolean

// ─── 引擎 ───────────────────────────────────────────────────────────
export class GameEngine {
  run: RunState
  private finished = false

  constructor(run: RunState) {
    this.run = run
  }

  // ── 建档 ──
  static createRun(name: string, classId: ClassId, attrs: PlayerState['attrs']): RunState {
    resetRollStats()
    const cls = classDef(classId)
    const hp = baseHp(classId, attrs)
    const player: PlayerState = {
      name,
      classId,
      attrs,
      level: 1,
      xp: 0,
      hp,
      maxHp: hp,
      baseAc: 10 + attrMod(attrs.dex),
      gold: 20,
      weaponId: cls.baseWeapon,
      armorId: cls.baseArmor,
      trinketIds: [],
      inventory: [{ itemId: 'potion', count: 2 }],
      resource: cls.resourceMax,
      maxResource: cls.resourceMax,
      inspiration: 0,
      feats: [],
      flags: {},
      fragments: 0,
      companionBanjo: false,
      forgottenNames: [],
    }
    const run: RunState = {
      player,
      act: 1,
      sceneQueue: [],
      currentSceneId: '',
      visited: [],
      kills: 0,
      rolls: 0,
      nat20: 0,
      nat1: 0,
      combat: null,
      startedAt: Date.now(),
      lastRecap: '',
    }
    GameEngine.buildActQueue(run)
    return run
  }

  /** 展开当前幕的场景队列:锚点固定,槽位从随机池抽(不含本局已用) */
  private static buildActQueue(run: RunState) {
    const plan = ACT_PLANS[run.act]!
    const pool = shuffle(plan.pool.filter((id) => !run.visited.includes(id)))
    const queue: string[] = []
    let pi = 0
    for (const a of plan.anchors) {
      if (typeof a === 'string') queue.push(a)
      else for (let i = 0; i < a.pool; i++) {
        const s = pool[pi++]
        if (s) queue.push(s)
      }
    }
    // 确保残章场景必入(若池抽干仍缺席则补位)
    const fragId = `a${run.act}_frag${run.act}`
    if (!queue.includes(fragId) && SCENES[fragId] && !run.visited.includes(fragId)) {
      const insertAt = queue.length - 2 >= 0 ? queue.length - 2 : queue.length - 1
      queue.splice(Math.max(0, insertAt), 0, fragId)
    }
    run.sceneQueue = queue
  }

  // ── 主流程 ──
  *flow(): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    // 存档恢复:若停在战斗中,先打完这场,再回到场景循环
    if (run.combat) {
      yield* this.combatLoop()
      if (this.finished) return
      this.maybeOfferFeats()
      if (run.pendingFeatChoices?.length) yield* this.resolveFeatChoice()
      if (run.pendingEquipId) yield* this.resolveEquip()
    }
    if (run.pendingFeatChoices && run.pendingFeatChoices.length > 0) {
      yield* this.resolveFeatChoice()
    }
    if (run.pendingEquipId) {
      yield* this.resolveEquip()
    }
    if (!run.currentSceneId) run.currentSceneId = run.sceneQueue.shift() ?? ''
    yield* this.sceneLoop()
  }

  private *sceneLoop(): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    while (run.currentSceneId) {
      if (this.actCardPending) {
        this.actCardPending = false
        yield { kind: 'actTransition', act: run.act }
      }
      // 商店停留:离开后继续
      while (this.activeShop) {
        yield { kind: 'shop', shopId: this.activeShop }
      }
      const scene = SCENES[run.currentSceneId]
      if (!scene) { this.advanceScene(); continue }
      run.visited.push(scene.id)
      run.lastRecap = scene.title ?? scene.id
      this.autosave()
      if (scene.onEnterEffects) this.applyEffects(scene.onEnterEffects)
      yield { kind: 'sceneTitle', title: scene.title ?? '', act: run.act, bg: scene.bg }
      yield { kind: 'narration', paras: scene.text, instant: run.visited.filter((v) => v === scene.id).length > 1 }
      // 选择循环(同一场景可能因 flag 变化重渲染)
      while (true) {
        const input = yield { kind: 'choices', views: this.choiceViews(scene) }
        if (typeof input !== 'string') continue
        const choice = scene.choices.find((c) => c.id === input)
        if (!choice || !this.choiceAvailable(choice)) continue
        const target = yield* this.resolveChoice(scene, choice)
        if (target) this.route(target)
        if (this.pendingEnding) { yield* this.endRun(this.pendingEnding); return }
        if (this.finished) return
        if (run.combat) { yield* this.combatLoop(); if (this.finished) return }
        this.maybeOfferFeats()
        if (run.pendingFeatChoices?.length) yield* this.resolveFeatChoice()
        if (run.pendingEquipId) yield* this.resolveEquip()
        break
      }
      // 若 route 未改变去向(选项无跳转等),推进队列
      if (!run.combat && !this.activeShop && run.currentSceneId === scene.id) this.advanceScene()
    }
  }

  /** 战斗/场景经验结算后,若有待处理升级 → 出专长题 */
  private maybeOfferFeats() {
    const run = this.run
    if (this.pendingLevelUps && this.pendingLevelUps.length > 0 && !run.pendingFeatChoices) {
      run.pendingFeatChoices = offerFeats(run.player)
      this.pendingLevelUps = null
    }
  }

  private advanceScene() {
    const run = this.run
    run.currentSceneId = run.sceneQueue.shift() ?? ''
    if (!run.currentSceneId) {
      // 队列耗尽 = 本幕内容走完 → 过幕
      this.route({ act: 'next' })
    }
  }

  /** 解析跳转目标,设置下一步 */
  private route(target: GotoTarget) {
    const run = this.run
    if ('to' in target) {
      if (target.to === 'POOL' || target.to === 'NEXT_POOL') {
        this.advanceScene()
      } else {
        run.currentSceneId = target.to
      }
    } else if ('combat' in target) {
      this.startCombat(target.combat, target.onWin, target.onLose ?? 'ending:death')
    } else if ('shop' in target) {
      const shop = SHOPS[target.shop]
      if (shop) {
        run.currentSceneId = shop.next
        this.activeShop = shop.id
      }
    } else if ('act' in target) {
      this.finishAct()
      this.actCardPending = true
    } else if ('ending' in target) {
      this.pendingEnding = target.ending
    }
  }

  private activeShop: string | null = null
  private actCardPending = false

  get shopId(): string | null { return this.activeShop }

  private finishAct() {
    const run = this.run
    if (run.act < 3) {
      run.act = (run.act + 1) as 1 | 2 | 3
      GameEngine.buildActQueue(run)
      run.currentSceneId = run.sceneQueue.shift() ?? ''
    }
  }

  // ── 选项解析 ──
  private *resolveChoice(scene: SceneNode, choice: SceneChoice): Generator<GameEvent, GotoTarget | null, InteractionInput> {
    void scene
    const p = this.run.player
    // 消耗
    if (choice.cost?.gold) { p.gold = Math.max(0, p.gold - choice.cost.gold) }
    let outcome = choice.outcome
    if (choice.check && (choice.success || choice.failure)) {
      const adv = choice.advantage === true || (this.run.player.companionBanjo && choice.requireCompanion === true)
      let co = resolveCheck(p, { skill: choice.check.skill, dc: choice.check.dc, advantage: adv })
      yield { kind: 'check', outcome: co }
      // 灵感重骰(失败时且持有灵感)
      if (!co.success && p.inspiration > 0) {
        const use = yield { kind: 'askInspiration', label: `${SKILL_NAMES[choice.check.skill]}检定失败。消耗 1 点灵感重骰？` }
        if (use === true) {
          p.inspiration -= 1
          co = resolveCheck(p, { skill: choice.check.skill, dc: choice.check.dc, advantage: true })
          yield { kind: 'check', outcome: co }
        }
      }
      outcome = co.success ? choice.success : choice.failure
    }
    if (!outcome) return null
    this.applyEffects(outcome.effects ?? [])
    if (outcome.fx) yield { kind: 'fx', fx: outcome.fx }
    yield { kind: 'narration', paras: [outcome.text] }
    return outcome.goto
  }

  private choiceViews(scene: SceneNode): ChoiceView[] {
    const p = this.run.player
    return scene.choices.map((c) => {
      const ok = this.choiceAvailable(c)
      const v: ChoiceView = { id: c.id, text: c.text, locked: !ok }
      if (!ok) v.lockReason = this.lockReason(c)
      if (c.cost?.gold) v.hint = `💰 ${c.cost.gold}`
      if (c.check) {
        const adv = c.advantage === true
        const { mod } = skillMod(p, c.check.skill)
        const chance = successChance(mod, c.check.dc, adv ? 'advantage' : 'normal')
        v.checkLabel = `${SKILL_NAMES[c.check.skill]} DC${c.check.dc} · ${Math.round(chance * 100)}%${adv ? ' · 优势' : ''}`
      }
      return v
    })
  }

  private choiceAvailable(c: SceneChoice): boolean {
    const p = this.run.player
    if (c.requireFlag && !p.flags[c.requireFlag]) return false
    if (c.requireItem && !p.inventory.some((i) => i.itemId === c.requireItem)) return false
    if (c.requireFragment !== undefined && p.fragments < c.requireFragment) return false
    if (c.requireCompanion && !p.companionBanjo) return false
    if (c.requireClass && p.classId !== c.requireClass) return false
    if (c.requireGold !== undefined && p.gold < c.requireGold) return false
    if (c.cost?.gold && p.gold < c.cost.gold) return false
    return true
  }

  private lockReason(c: SceneChoice): string {
    const p = this.run.player
    if (c.requireFlag && !p.flags[c.requireFlag]) return '条件未满足'
    if (c.requireItem) {
      const rid = c.requireItem
      if (!p.inventory.some((i) => i.itemId === rid)) return `需要物品:${itemDef(rid).name}`
    }
    if (c.requireFragment !== undefined && p.fragments < c.requireFragment) return `需要 ${c.requireFragment} 枚残章`
    if (c.requireCompanion && !p.companionBanjo) return '需要同伴班卓'
    if (c.requireGold !== undefined && p.gold < c.requireGold) return '金币不足'
    if (c.cost?.gold && p.gold < c.cost.gold) return '金币不足'
    return '条件未满足'
  }

  // ── 效果结算 ──
  private applyEffects(effects: OutcomeEffect[]) {
    const p = this.run.player
    for (const e of effects) {
      switch (e.t) {
        case 'hp': p.hp = Math.min(p.maxHp, Math.max(0, p.hp + e.v)); break
        case 'gold': p.gold = Math.max(0, p.gold + e.v); break
        case 'heal_full': p.hp = p.maxHp; break
        case 'heal_pct': p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * e.v)); break
        case 'short_rest': p.maxResource = maxResource(p); p.resource = p.maxResource; break
        case 'inspiration': p.inspiration = Math.min(3, p.inspiration + 1); break
        case 'fragment': p.fragments += 1; break
        case 'companion': p.companionBanjo = true; break
        case 'flag': p.flags[e.id] = e.v !== false; break
        case 'xp': this.addXp(e.v); break
        case 'item': this.giveItem(e.id, e.count ?? 1); break
        case 'loseItem': this.consumeItem(e.id); break
        case 'forgetItem': this.forgetEquipment(); break
        case 'toast': break
      }
    }
    this.autosave()
  }

  private addXp(v: number) {
    const p = this.run.player
    p.xp += v
    // 升级检测在战斗/场景节奏点处理(levelUpPending)
    while (p.level < 4 && p.xp >= xpForLevel(p.level + 1)) {
      p.level += 1
      const gain = levelUpGains(p)
      p.maxHp += gain
      p.hp += gain
      p.maxResource = maxResource(p)
      p.resource = p.maxResource
      if (!this.pendingLevelUps) this.pendingLevelUps = []
      this.pendingLevelUps.push(p.level)
    }
  }

  private pendingLevelUps: number[] | null = null

  private *resolveFeatChoice(): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    while (run.pendingFeatChoices && run.pendingFeatChoices.length > 0) {
      const feats = run.pendingFeatChoices
      const input = yield { kind: 'levelUp', level: run.player.level, hpGain: 0, feats }
      if (typeof input === 'string' && feats.includes(input)) {
        run.player.feats.push(input)
        if (input === 'tough') { run.player.maxHp += 7; run.player.hp += 7 }
        if (input === 'echo') { run.player.maxResource = maxResource(run.player); run.player.resource = run.player.maxResource }
        run.pendingFeatChoices = undefined
      }
    }
    // 若还有排队的升级(多重升级),继续出题
    if (this.pendingLevelUps && this.pendingLevelUps.length > 0) {
      this.pendingLevelUps.shift()
      if (this.pendingLevelUps.length > 0) {
        run.pendingFeatChoices = offerFeats(run.player)
        yield* this.resolveFeatChoice()
      }
    }
  }

  private giveItem(id: string, count: number) {
    const it = itemDef(id)
    const p = this.run.player
    if (it.kind === 'consumable') {
      const entry = p.inventory.find((i) => i.itemId === id)
      if (entry) entry.count += count
      else p.inventory.push({ itemId: id, count })
      return
    }
    if (it.kind === 'trinket') {
      if (!p.trinketIds.includes(id)) {
        if (p.trinketIds.length >= 3) p.trinketIds.shift()
        p.trinketIds.push(id)
      }
      return
    }
    // 武器/护甲 → 待玩家决定
    if ((it.kind === 'weapon' && id !== p.weaponId) || (it.kind === 'armor' && id !== p.armorId)) {
      this.run.pendingEquipId = id
    }
  }

  private *resolveEquip(): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    while (run.pendingEquipId) {
      const id = run.pendingEquipId
      const input = yield { kind: 'equipPrompt', itemId: id }
      const it = itemDef(id)
      if (input === 'equip') {
        if (it.kind === 'weapon') run.player.weaponId = id
        else if (it.kind === 'armor') run.player.armorId = id
      } else if (input === 'sell') {
        run.player.gold += Math.floor(it.price / 2)
      }
      run.pendingEquipId = undefined
    }
  }

  private consumeItem(id: string) {
    const p = this.run.player
    const idx = p.inventory.findIndex((i) => i.itemId === id)
    if (idx < 0) return
    const e = p.inventory[idx]!
    e.count -= 1
    if (e.count <= 0) p.inventory.splice(idx, 1)
  }

  private forgetEquipment() {
    const p = this.run.player
    const options: string[] = []
    if (p.weaponId !== classDef(p.classId).baseWeapon) options.push(p.weaponId)
    if (p.armorId !== classDef(p.classId).baseArmor) options.push(p.armorId)
    if (p.trinketIds.length > 0) options.push(p.trinketIds[p.trinketIds.length - 1]!)
    if (options.length === 0) { p.gold = Math.max(0, p.gold - 5); return }
    const lost = pick(options)
    p.forgottenNames.push(itemDef(lost).name)
    if (lost === p.weaponId) p.weaponId = classDef(p.classId).baseWeapon
    else if (lost === p.armorId) p.armorId = classDef(p.classId).baseArmor
    else p.trinketIds = p.trinketIds.filter((t) => t !== lost)
  }

  // ── 战斗 ──
  private startCombat(monsterId: string, onWin: string, onLose: string) {
    const m = MONSTERS[monsterId]
    if (!m) { this.advanceScene(); return }
    const cs: CombatState = {
      monsterId,
      monsterHp: m.hp,
      monsterMaxHp: m.hp,
      round: 1,
      playerTurn: true,
      deathSaves: null,
      pendingFlee: false,
      onWin: onWin === 'NEXT_POOL' ? '' : onWin,
      onLose,
      banjoUsedThisCombat: false,
    }
    // NEXT_POOL → 用队列推进
    if (onWin === 'NEXT_POOL') {
      this.advanceSceneRaw()
      cs.onWin = ''
    }
    this.run.combat = cs
    this.run.bardicActive = false
  }

  private advanceSceneRaw() {
    this.run.currentSceneId = this.run.sceneQueue.shift() ?? ''
  }

  *combatLoop(): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const cs = run.combat!
    const m = MONSTERS[cs.monsterId]!
    const p = run.player
    yield { kind: 'combatStart', monster: m }
    yield { kind: 'narration', paras: [m.introText] }
    // 教学提示
    yield { kind: 'combatLog', lines: [`【${m.name}】HP ${cs.monsterHp} · AC ${m.ac}${m.requiresMagicToHit ? ' · 凡铁难伤' : ''}${m.vulnerabilities?.length ? ` · 弱点:${m.vulnerabilities.join('、')}` : ''}`] }

    let openingMercy = false
    if (cs.round === 1 && (p.flags['king_password_said'] || p.flags['king_banjo_word'])) {
      openingMercy = true
      yield { kind: 'combatLog', lines: ['🕯️ 他握剑的手,在半空停了一瞬——百年里第一次,烬王在出手前迟疑了。(你获得先手!)'] }
    }
    while (true) {
      this.autosave()
      // ── 玩家回合:由 UI 驱动 combatAction ──
      yield* this.playerTurn(m)
      if (this.finished) return
      if (cs.pendingFlee) { // 逃跑成功
        const parting = rollDice('1d6')
        p.hp = Math.max(1, p.hp - parting.total)
        yield { kind: 'combatLog', lines: [`你且战且退,${m.name}的最后一击擦过你——${parting.total} 点擦伤。`] }
        yield { kind: 'damage', target: 'player', value: parting.total }
        run.combat = null
        this.autosave()
        return
      }
      if (cs.monsterHp <= 0) { yield* this.winCombat(m); return }
      if (p.hp <= 0) {
        yield* this.deathSequence(m)
        if (this.finished) return
        if (p.hp <= 0) return // 死亡结局已触发
        // 稳定后继续:怪物继续行动
      }
      // ── 怪物回合(先手轮跳过) ──
      if (openingMercy && cs.round === 1) {
        yield { kind: 'combatLog', lines: ['他缓缓收势,重新摆正剑姿——像在等你准备好。'] }
      } else {
        yield* this.monsterTurn(m)
      }
      if (this.finished) return
      if (p.hp <= 0) {
        yield* this.deathSequence(m)
        if (this.finished) return
      }
      // ── 传奇动作 ──
      if (m.legendary && !openingMercy && cs.round % 2 === 0 && cs.monsterHp > 0) {
        const lg = rollDice(m.legendary.damageDice)
        p.hp = Math.max(0, p.hp - lg.total)
        yield { kind: 'combatLog', lines: [`⟳ 传奇动作【${m.legendary.name}】:${m.legendary.desc}——${lg.total} 点伤害!`] }
        yield { kind: 'damage', target: 'player', value: lg.total, note: m.legendary.name }
        if (p.hp <= 0) { yield* this.deathSequence(m); if (this.finished) return }
      }
      // ── 领域动作 ──
      if (m.lair && cs.round % m.lair.everyNRounds === 0 && cs.monsterHp > 0) {
        yield { kind: 'combatLog', lines: [`⚠ 领域动作【${m.lair.name}】:${m.lair.desc}`] }
        const save = resolveCheck(p, { skill: m.lair.saveSkill as SkillKey, dc: m.lair.dc })
        yield { kind: 'check', outcome: save }
        const dmg = rollDice(m.lair.damageDice)
        const applied = save.success ? Math.floor(dmg.total / 2) : dmg.total
        p.hp = Math.max(0, p.hp - applied)
        yield { kind: 'combatLog', lines: [save.success ? `豁免成功,半伤——${applied} 点。` : `豁免失败——${applied} 点${m.lair.name}伤害!`] }
        yield { kind: 'damage', target: 'player', value: applied }
        if (p.hp <= 0) { yield* this.deathSequence(m); if (this.finished) return }
      }
      cs.round += 1
      cs.playerTurn = true
    }
  }

  /** 玩家回合:循环等待合法动作输入 */
  private *playerTurn(m: MonsterDef): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const cs = run.combat!
    const p = run.player
    while (true) {
      const input = yield { kind: 'combatLog', lines: [] } // UI 展示行动菜单(空行 = 刷新菜单信号)
      if (typeof input !== 'string') continue
      if (input.startsWith('item:')) {
        const itemId = input.slice(5)
        yield* this.useCombatItem(itemId)
        return
      }
      switch (input) {
        case 'attack':
          yield* this.playerAttack(m, false)
          return
        case 'ability':
          yield* this.classAbility(m)
          return
        case 'flee': {
          if (m.legendary || m.lair) {
            yield { kind: 'combatLog', lines: ['这里的空间被它的意志锁死了——逃不掉!'] }
            continue
          }
          const fleeCheck = resolveCheck(p, { skill: 'athletics', dc: 12 })
          yield { kind: 'check', outcome: fleeCheck }
          if (fleeCheck.success) { cs.pendingFlee = true; return }
          yield { kind: 'combatLog', lines: ['逃跑失败!它挡在你和出口之间。'] }
          return
        }
        default:
          continue
      }
    }
  }

  private *playerAttack(m: MonsterDef, isSneak: boolean): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const p = run.player
    let atk = rollCheck(attackBonus(p), 'normal')
    // 班卓协防:大失败重骰(每场一次)
    if (atk.value === 1 && p.companionBanjo && run.combat && !run.combat.banjoUsedThisCombat) {
      run.combat.banjoUsedThisCombat = true
      yield { kind: 'combatLog', lines: ['🎸 班卓:「别慌!就当它没看见——再来!」(大失败被重骰)'] }
      atk = rollCheck(attackBonus(p), 'normal')
    }
    // 骰运眷顾专长:同理(每场一次,复用班卓标记位以免叠加)
    else if (atk.value === 1 && p.feats.includes('lucky') && run.combat && !run.combat.banjoUsedThisCombat) {
      run.combat.banjoUsedThisCombat = true
      yield { kind: 'combatLog', lines: ['🍀 骰运眷顾:命运宽恕了这次大失败,重骰!'] }
      atk = rollCheck(attackBonus(p), 'normal')
    }
    const crit = atk.value === 20
    const hit = crit || (atk.value !== 1 && atk.total >= m.ac)
    yield { kind: 'check', outcome: this.attackToCheckOutcome(atk, m) }
    if (!hit) {
      if (atk.value === 1) {
        // 破绽:借机打击
        const opp = rollDice(m.damageDice)
        p.hp = Math.max(0, p.hp - Math.floor(opp.total / 2))
        yield { kind: 'combatLog', lines: [`💥 大失败!破绽毕露——${m.name}顺势补了一记,${Math.floor(opp.total / 2)} 点伤害。`] }
        yield { kind: 'damage', target: 'player', value: Math.floor(opp.total / 2), note: '破绽' }
      } else {
        yield { kind: 'combatLog', lines: [`攻击 ${atk.total} vs AC ${m.ac}——未命中。${crit ? '' : ''}`] }
      }
      return
    }
    // 命中:掷伤害
    const extra = isSneak ? '1d6' : undefined
    const dmgRoll = rollWeaponDamage(p, crit, extra)
    const w = itemDef(p.weaponId)
    const dmgRes = applyDamageMods(
      dmgRoll.total, w.damageType ?? 'slash', weaponMaterial(p),
      m.vulnerabilities, m.resistances, m.requiresMagicToHit,
    )
    if (run.bardicActive) {
      const bd = rollDice('1d6')
      dmgRes.applied += bd.total
      yield { kind: 'combatLog', lines: [`🎵 激励骰生效:+${bd.total}`] }
      run.bardicActive = false
    }
    run.combat!.monsterHp = Math.max(0, run.combat!.monsterHp - dmgRes.applied)
    yield {
      kind: 'combatLog',
      lines: [
        `${crit ? '⚔️ 大成功!伤害骰翻倍!' : '命中!'}${dmgRoll.parts.join(' ')} → **${dmgRes.applied}** 点伤害${dmgRes.multiplierNote ? `(${dmgRes.multiplierNote})` : ''}`,
      ],
    }
    yield { kind: 'damage', target: 'monster', value: dmgRes.applied, crit }
  }

  private attackToCheckOutcome(roll: ReturnType<typeof rollCheck>, m: MonsterDef): CheckOutcome {
    return {
      request: { skill: 'athletics', dc: m.ac },
      roll,
      success: roll.value === 20 || (roll.value !== 1 && roll.total >= m.ac),
      critSuccess: roll.value === 20,
      critFail: roll.value === 1,
      label: `攻击掷骰 vs AC ${m.ac}`,
      chance: 0,
    }
  }

  private *classAbility(m: MonsterDef): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const p = run.player
    const cls = classDef(p.classId)
    if (p.resource < 1) {
      yield { kind: 'combatLog', lines: [`${cls.resourceName}不足!篝火短休可恢复。`] }
      return
    }
    p.resource -= 1
    switch (cls.resourceAbility) {
      case 'second_wind': {
        const heal = rollDice(`1d10+${p.level}`)
        p.hp = Math.min(p.maxHp, p.hp + heal.total)
        yield { kind: 'combatLog', lines: [`💪 二次风!深吸一口气——回复 ${heal.total} 点生命。`] }
        yield { kind: 'heal', target: 'player', value: heal.total }
        break
      }
      case 'spell_bolt': {
        const atk = rollCheck(attackBonus(p), 'normal')
        const crit = atk.value === 20
        const hit = crit || (atk.value !== 1 && atk.total >= m.ac)
        yield { kind: 'check', outcome: this.attackToCheckOutcome(atk, m) }
        if (!hit) { yield { kind: 'combatLog', lines: ['烬火矢擦着它的肩膀飞过,在岩壁上烧出一个洞。'] }; break }
        const dmg = rollDice(crit ? '4d6' : '2d6')
        const res = applyDamageMods(dmg.total, 'fire', 'magic', m.vulnerabilities, m.resistances, false)
        run.combat!.monsterHp = Math.max(0, run.combat!.monsterHp - res.applied)
        yield { kind: 'combatLog', lines: [`🔥 烬火矢${crit ? '(大成功,翻倍!)' : ''}命中——${res.applied} 点火焰伤害${res.multiplierNote ? `(${res.multiplierNote})` : ''}!`] }
        yield { kind: 'damage', target: 'monster', value: res.applied, crit }
        break
      }
      case 'sneak_strike': {
        yield* this.playerAttack(m, true)
        break
      }
      case 'channel_heal': {
        const wis = attrMod(p.attrs.wis)
        const heal = rollDice(`1d8+${Math.max(0, wis)}`)
        p.hp = Math.min(p.maxHp, p.hp + heal.total)
        yield { kind: 'combatLog', lines: [`✨ 引导神力!圣光涌起——回复 ${heal.total} 点生命。`] }
        yield { kind: 'heal', target: 'player', value: heal.total }
        break
      }
      case 'bardic_dice': {
        run.bardicActive = true
        yield { kind: 'combatLog', lines: ['🎵 激励骰!「你行!你上!你最棒!」——本回合攻击 +1d6。'] }
        break
      }
      case 'divine_smite': {
        yield* this.playerAttack(m, false)
        const smite = rollDice('2d8')
        const res = applyDamageMods(smite.total, 'radiant', 'magic', m.vulnerabilities, m.resistances, false)
        if (run.combat && run.combat.monsterHp > 0) {
          run.combat.monsterHp = Math.max(0, run.combat.monsterHp - res.applied)
          yield { kind: 'combatLog', lines: [`⚡ 神圣打击追加——${res.applied} 点光耀伤害!`] }
          yield { kind: 'damage', target: 'monster', value: res.applied }
        }
        break
      }
      default:
        yield* this.playerAttack(m, false)
    }
  }

  private *useCombatItem(id: string): Generator<GameEvent, void, InteractionInput> {
    const p = this.run.player
    const it = itemDef(id)
    if (!p.inventory.some((i) => i.itemId === id)) return
    this.consumeItem(id)
    const eff = it.effect
    if (eff?.t === 'heal') {
      const heal = rollDice(eff.dice)
      p.hp = Math.min(p.maxHp, p.hp + heal.total)
      yield { kind: 'combatLog', lines: [`🧪 ${it.name}——回复 ${heal.total} 点生命。`] }
      yield { kind: 'heal', target: 'player', value: heal.total }
    } else if (eff?.t === 'fire_bomb' && this.run.combat) {
      const m = MONSTERS[this.run.combat.monsterId]!
      const dmg = rollDice('2d6')
      const res = applyDamageMods(dmg.total, 'fire', 'magic', m.vulnerabilities, m.resistances, false)
      this.run.combat.monsterHp = Math.max(0, this.run.combat.monsterHp - res.applied)
      yield { kind: 'combatLog', lines: [`🍾 火油瓶砸个正着——${res.applied} 点火焰伤害${res.multiplierNote ? `(${res.multiplierNote})` : ''}!`] }
      yield { kind: 'damage', target: 'monster', value: res.applied }
    } else if (eff?.t === 'inspiration') {
      p.inspiration = Math.min(3, p.inspiration + 1)
      yield { kind: 'combatLog', lines: ['🎲 骰子在手心焐了焐——获得 1 点灵感。'] }
    } else {
      yield { kind: 'combatLog', lines: ['现在用不上这个。'] }
      // 不消耗
      const entry = p.inventory.find((i) => i.itemId === id)
      if (entry) entry.count += 1
    }
  }

  private *monsterTurn(m: MonsterDef): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const p = run.player
    if (m.quotes && m.quotes.length > 0 && Math.random() < 0.4) {
      yield { kind: 'combatLog', lines: [pick(m.quotes)] }
    }
    const useSpecial = m.special && m.specialChance !== undefined && Math.random() < m.specialChance
    const atk = rollCheck(m.attackBonus, 'normal')
    const ac = totalAc(p)
    const crit = atk.value === 20
    const hit = crit || (atk.value !== 1 && atk.total >= ac)
    yield { kind: 'check', outcome: this.attackToCheckOutcome(atk, { ...m, ac }) }
    if (!hit) {
      yield { kind: 'combatLog', lines: [`${m.name}的攻击 ${atk.total} vs 你的 AC ${ac}——被你挡开了!${crit ? '' : ''}`] }
      return
    }
    const source = useSpecial ? m.special! : null
    const dmg = rollDice(source ? source.damageDice : m.damageDice)
    if (crit) {
      const baseExpr = (source ? source.damageDice : m.damageDice).split('+')[0] ?? '1d6'
      dmg.total += rollDice(baseExpr).total
    }
    p.hp = Math.max(0, p.hp - dmg.total)
    yield {
      kind: 'combatLog',
      lines: [`${source ? `⚠ ${source.name}!${source.desc}——` : ''}${m.name}${crit ? ' 大成功!伤害骰翻倍——' : ' 命中——'}**${dmg.total}** 点伤害!`],
    }
    yield { kind: 'damage', target: 'player', value: dmg.total, crit }
  }

  private *deathSequence(_m: MonsterDef): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const p = run.player
    yield { kind: 'combatLog', lines: ['🩸 你的视野在缩小。膝盖先着了地——', '**弥留之际。死亡豁免:三次成功稳定,三次失败……阵亡。**'] }
    let saves = { successes: 0, failures: 0 }
    p.flags['cleric_grace_used'] = false
    while (true) {
      const res = rollDeathSave(p, saves)
      saves = { successes: res.successes, failures: res.failures }
      let note: string | undefined
      if (res.roll === 20) note = '天然 20!勇气爆发的瞬间,你自己撑住了!'
      else if (res.roll === 1) note = '天然 1!伤势急剧恶化……'
      if (p.classId === 'cleric' && res.failures >= 3 && !p.flags['cleric_grace_used']!) {
        p.flags['cleric_grace_used'] = true
        note = '✨ 神的眷顾:本该致命的伤,被圣徽接住了最后一刻。'
      }
      yield { kind: 'deathSave', roll: res.roll, successes: res.successes, failures: res.failures, note }
      if (res.stable) {
        p.hp = 1
        run.combat!.deathSaves = null
        yield { kind: 'combatLog', lines: ['你稳住了!牙关咬出血味,重新站起来——1 点生命,但没有倒下!'] }
        yield { kind: 'heal', target: 'player', value: 1 }
        return
      }
      if (res.dead) {
        yield* this.endRun('end_death')
        return
      }
    }
  }

  private *winCombat(m: MonsterDef): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    const p = run.player
    const csOnWin = run.combat?.onWin ?? ''
    const gold = randInt(m.gold[0], m.gold[1])
    p.gold += gold
    run.kills += 1
    this.addXp(m.xp)
    yield {
      kind: 'combatLog',
      lines: [`🏆 ${m.name}倒下了!化作灰烬前,它留下了 ${gold} 金币。(击杀+1,经验+${m.xp})`],
    }
    yield { kind: 'fx', fx: 'gold' }
    run.combat = null
    // 升级?
    this.maybeOfferFeats()
    // 战后跳转:onWin 非空 → 路由到指定场景;为空(NEXT_POOL)则已在开局时推进
    if (csOnWin) this.route({ to: csOnWin })
    this.autosave()
  }

  // ── 结局与结算 ──
  private pendingEnding: string | null = null

  get endingPending(): string | null { return this.pendingEnding }

  private *endRun(endingId: string): Generator<GameEvent, void, InteractionInput> {
    const run = this.run
    this.finished = true
    run.combat = null
    const ending = ENDINGS[endingId]!
    let epitaph: string | undefined
    if (endingId === 'end_death') {
      const tpl = pick(EPITAPHS)
      epitaph = tpl.replace('{nat20}', String(run.nat20)).replace('{nat1}', String(run.nat1))
    }
    yield { kind: 'ending', ending, epitaph }
    yield { kind: 'gameOver' }
  }

  /** 结束流程(由 UI 在结局演出后调用):结算分数 */
  finishRun(): { score: ReturnType<typeof computeScore>; endingId: string } {
    const run = this.run
    run.rolls = rollStats.rolls
    run.nat20 = rollStats.nat20
    run.nat1 = rollStats.nat1
    const endingId = this.pendingEnding ?? 'end_death'
    const isTrue = endingId === 'end_return'
    const score = computeScore(
      run.act,
      run.kills,
      run.player.hp,
      run.player.fragments,
      isTrue,
      run.player.gold,
      run.player.feats.length,
    )
    return { score, endingId }
  }

  // ── 商店 ──
  buyItem(shopId: string, itemId: string): boolean {
    const shop = SHOPS[shopId]
    const it = itemDef(itemId)
    const p = this.run.player
    if (!shop || !shop.items.includes(itemId) || p.gold < it.price) return false
    p.gold -= it.price
    this.giveItem(itemId, 1)
    this.autosave()
    return true
  }

  leaveShop() {
    this.activeShop = null
  }

  // ── 存档 ──
  private autosave() {
    // 同步骰运统计到运行状态(结算评级依据)
    this.run.rolls = rollStats.rolls
    this.run.nat20 = rollStats.nat20
    this.run.nat1 = rollStats.nat1
    try {
      const snapshot = JSON.stringify(this.run)
      this.onAutosave?.(snapshot)
    } catch { /* 存档失败不阻断游戏 */ }
  }

  onAutosave: ((snapshot: string) => void) | null = null

  /** 局末图鉴/墓志铭数据 */
  epitaphForDeath(): string {
    return pick(EPITAPHS).replace('{nat20}', String(this.run.nat20)).replace('{nat1}', String(this.run.nat1))
  }
}

// ─── 供 UI 使用的静态辅助 ───────────────────────────────────────────
export function skillLabel(skill: SkillKey): string {
  return `${ATTR_NAMES[SKILL_ATTR[skill]]}（${SKILL_NAMES[skill]}）`
}

export { FEATS, COMBAT_ABILITIES, SHOPS, SCENES, MONSTERS, ENDINGS }
export type { MonsterDef, SceneNode, PlayerState, RunState }
