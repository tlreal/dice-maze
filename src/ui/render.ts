// ─── UI 渲染层:装配界面 + 播放引擎演出事件 ──────────────────────────
import type { InteractionInput, GameEvent, ChoiceView } from '../game/engine'
import { GameEngine } from '../game/engine'
import type { ClassId, MetaState, RunState, LuckGrade } from '../game/types'
import { ATTR_NAMES } from '../game/types'
import { classDef, FEATS } from '../content/classes'
import { itemDef, SHOPS } from '../content/items'
import { attrMod, classPresetAttrs, rollAbility4d6DropLowest, STANDARD_ARRAY, totalAc, maxResource, luckGrade } from '../game/rules'
import { typewrite } from '../fx/typewriter'
import { playDiceRoll, playDeathSave } from '../fx/dice3d'
import { particles } from '../fx/particles'
import { flash as _flash, shake, hurtVignette, hitStop, sleep } from '../fx/screenfx'
void _flash
import { sfx } from '../fx/audio'
import { sdk } from '../sdk'

const ACT_NAMES: Record<number, string> = { 1: '烬痕镇与迷城之门', 2: '幽暗深处', 3: '烬王殿' }

const el = (id: string): HTMLElement => {
  const e = document.getElementById(id)
  if (!e) throw new Error(`缺少 #${id}`)
  return e
}

export class GameUI {
  engine: GameEngine | null = null
  meta: MetaState
  private currentAttrs: RunState['player']['attrs'] | null = null
  private currentClass: ClassId = 'fighter'
  private attrMode: 'preset' | 'array' | 'roll' = 'preset'
  private rolledAttrs: number[] | null = null

  constructor(meta: MetaState) {
    this.meta = meta
    this.buildSkeleton()
    this.applyFontScale()
  }

  // ═══ 骨架 ═══
  private buildSkeleton(): void {
    const app = el('app')
    app.innerHTML = `
      <div id="status-bar" class="hidden"></div>
      <div id="scene-header" class="hidden"></div>
      <div id="monster-card" class="hidden"></div>
      <main id="log"></main>
      <div id="action-area"></div>

      <section id="screen-title" class="screen">
        <div class="title-art"><div class="title-d20">20</div></div>
        <h1 class="game-title">骰运<span>迷城</span></h1>
        <p class="game-sub">一场十五分钟的 DnD 跑团肉鸽</p>
        <div class="title-menu" id="title-menu"></div>
        <p class="title-stats" id="title-stats"></p>
      </section>

      <section id="screen-chargen" class="screen hidden">
        <header class="cg-head"><button class="btn-ghost" id="cg-back">← 返回</button><h2>创建角色</h2><span></span></header>
        <div class="cg-body">
          <label class="cg-name">冒险者姓名 <input id="cg-name" maxlength="8" placeholder="无名者" value=""></label>
          <div class="cg-sec-title">选择职业</div>
          <div class="cg-classes" id="cg-classes"></div>
          <div class="cg-sec-title">属性生成方式</div>
          <div class="cg-attr-modes" id="cg-attr-modes"></div>
          <div class="cg-attrs" id="cg-attrs"></div>
          <button class="btn-primary" id="cg-start">🚪 踏入迷城</button>
        </div>
      </section>

      <section id="screen-ending" class="screen hidden">
        <div class="ending-inner" id="ending-inner"></div>
      </section>

      <section id="screen-score" class="screen hidden"><div id="score-inner"></div></section>
      <section id="screen-board" class="screen hidden"><div id="board-inner"></div></section>

      <div id="overlay-shop" class="overlay hidden"><div id="shop-inner"></div></div>
      <div id="overlay-modal" class="overlay hidden"><div id="modal-inner"></div></div>
      <div id="overlay-codex" class="overlay hidden"><div id="codex-inner"></div></div>
      <div id="overlay-settings" class="overlay hidden"><div id="settings-inner"></div></div>
    `
  }

  private show(id: string): void {
    for (const s of document.querySelectorAll('.screen')) s.classList.add('hidden')
    if (id) el(id).classList.remove('hidden')
    const inGame = id === ''
    el('status-bar').classList.toggle('hidden', !inGame)
    el('scene-header').classList.toggle('hidden', !inGame)
    el('log').classList.toggle('hidden', !inGame)
    el('action-area').classList.toggle('hidden', !inGame)
    el('monster-card').classList.add('hidden')
  }

  // ═══ 标题屏 ═══
  async showTitle(): Promise<void> {
    this.engine = null
    this.show('screen-title')
    el('monster-card').classList.add('hidden')
    particles.setEmberDensity(0.12)
    const save = await sdk.kvGet<string>('save_v1')
    const menu = el('title-menu')
    menu.innerHTML = ''
    const mk = (text: string, cls: string, fn: () => void) => {
      const b = document.createElement('button')
      b.className = cls
      b.textContent = text
      b.addEventListener('click', () => { sfx.unlock(); sfx.click(); fn() })
      menu.appendChild(b)
    }
    mk('🎲 新的冒险', 'btn-primary', () => void this.showChargen())
    if (save) mk('📖 继续冒险', 'btn-secondary', () => void this.resumeRun(save))
    mk('🏆 排行榜', 'btn-ghost', () => void this.showLeaderboard())
    mk('📚 图鉴', 'btn-ghost', () => this.showCodex())
    mk('⚙️ 设置', 'btn-ghost', () => this.showSettings())
    const nick = await sdk.getNickname()
    el('title-stats').textContent =
      `${nick ? `${nick} · ` : ''}冒险 ${this.meta.runsPlayed} 次 · 最佳 ${this.meta.bestScore} 分`
  }

  private async resumeRun(saveJson: string): Promise<void> {
    try {
      const run = JSON.parse(saveJson) as RunState
      const engine = new GameEngine(run)
      this.startRun(engine, true)
    } catch (e) {
      console.warn('存档损坏,已清除', e)
      await sdk.kvSet('save_v1', null)
      void sdk.toast('存档已损坏,请重新开始', 'error')
      await this.showTitle()
    }
  }

  // ═══ 建卡 ═══
  async showChargen(): Promise<void> {
    this.show('screen-chargen')
    this.renderClassGrid()
    this.renderAttrModes()
    this.renderAttrs()
    el('cg-back').onclick = () => { sfx.click(); void this.showTitle() }
    el('cg-start').onclick = () => this.confirmChargen()
  }

  private renderClassGrid(): void {
    const grid = el('cg-classes')
    grid.innerHTML = ''
    const ids: ClassId[] = ['fighter', 'mage', 'rogue', 'cleric', 'bard', 'paladin']
    for (const id of ids) {
      const cls = classDef(id)
      const unlocked = !cls.hidden || this.meta.unlockedClasses.includes(id)
      const card = document.createElement('button')
      card.className = `cg-class ${this.currentClass === id ? 'sel' : ''} ${unlocked ? '' : 'locked'}`
      card.innerHTML = unlocked
        ? `<div class="cg-class-emoji">${cls.emoji}</div>
           <div class="cg-class-name">${cls.name}</div>
           <div class="cg-class-tag">${cls.tagline}</div>`
        : `<div class="cg-class-emoji">🔒</div>
           <div class="cg-class-name">???</div>
           <div class="cg-class-tag">${cls.unlockHint ?? '隐藏职业'}</div>`
      if (unlocked) {
        card.addEventListener('click', () => {
          sfx.click()
          this.currentClass = id
          this.renderClassGrid()
          this.renderAttrs()
        })
      } else {
        card.addEventListener('click', () => void sdk.toast(cls.unlockHint ?? '尚未解锁', 'error'))
      }
      grid.appendChild(card)
    }
    const cls = classDef(this.currentClass)
    const descEl = document.createElement('div')
    descEl.className = 'cg-class-desc'
    descEl.textContent = cls.desc
    grid.appendChild(descEl)
  }

  private renderAttrModes(): void {
    const wrap = el('cg-attr-modes')
    wrap.innerHTML = ''
    const modes: { id: 'preset' | 'array' | 'roll'; name: string; desc: string }[] = [
      { id: 'preset', name: '职业预设', desc: '一键开局,老DM给你捏好的' },
      { id: 'array', name: '标准阵列', desc: '15/14/13/12/10/8,公平之选' },
      { id: 'roll', name: '命运掷骰', desc: '4d6弃最低×6,富贵在天' },
    ]
    for (const m of modes) {
      const b = document.createElement('button')
      b.className = this.attrMode === m.id ? 'sel' : ''
      b.innerHTML = `<b>${m.name}</b><i>${m.desc}</i>`
      b.addEventListener('click', () => {
        sfx.click()
        this.attrMode = m.id
        this.rolledAttrs = null
        this.renderAttrModes()
        this.renderAttrs()
      })
      wrap.appendChild(b)
    }
  }

  private computeAttrs(): RunState['player']['attrs'] {
    if (this.attrMode === 'preset') return classPresetAttrs(this.currentClass)
    const values = this.attrMode === 'array'
      ? STANDARD_ARRAY
      : (this.rolledAttrs ??= [0, 0, 0, 0, 0, 0].map(() => rollAbility4d6DropLowest()))
    const order: (keyof typeof ATTR_NAMES)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
    // 按职业主属性降序分配
    const main = classDef(this.currentClass).attackAttr
    const sortedOrder = [main, ...order.filter((k) => k !== main)]
    const sorted = [...values].sort((a, b) => b - a)
    const out = {} as RunState['player']['attrs']
    sortedOrder.forEach((k, i) => { out[k] = sorted[i]! })
    return out
  }

  private renderAttrs(): void {
    const wrap = el('cg-attrs')
    const attrs = this.computeAttrs()
    this.currentAttrs = attrs
    let html = ''
    for (const k of Object.keys(ATTR_NAMES) as (keyof typeof ATTR_NAMES)[]) {
      const v = attrs[k]!
      const m = attrMod(v)
      html += `<div class="attr-cell"><span class="attr-name">${ATTR_NAMES[k]}</span>
        <span class="attr-val">${v}</span><span class="attr-mod">${m >= 0 ? `+${m}` : m}</span></div>`
    }
    if (this.attrMode === 'roll') {
      html += `<button class="btn-reroll" id="attr-reroll">🎲 重掷</button>`
    }
    wrap.innerHTML = html
    const rr = document.getElementById('attr-reroll')
    if (rr) rr.addEventListener('click', () => { sfx.diceRoll(); this.rolledAttrs = null; this.renderAttrs() })
  }

  private confirmChargen(): void {
    const name = (el('cg-name') as HTMLInputElement).value.trim() || '无名者'
    const attrs = this.currentAttrs ?? classPresetAttrs(this.currentClass)
    const run = GameEngine.createRun(name, this.currentClass, attrs as RunState['player']['attrs'])
    this.startRun(new GameEngine(run), false)
  }

  // ═══ 局内装配 ═══
  private startRun(engine: GameEngine, isResume: boolean): void {
    this.engine = engine
    engine.onAutosave = (snap) => { void sdk.kvSet('save_v1', snap) }
    this.show('')
    el('log').innerHTML = ''
    el('action-area').innerHTML = ''
    this.updateStatus()
    if (isResume) {
      this.appendLogLine(`**【上回说到】** ${engine.run.lastRecap || '你在迷城之中。'} —— 冒险继续。`, true)
      void sdk.toast('冒险继续')
    } else {
      this.meta.runsPlayed += 1
      void this.saveMeta()
    }
    void this.driveLoop(engine)
  }

  private async saveMeta(): Promise<void> {
    await sdk.kvSet('meta_v1', this.meta)
  }

  // ═══ 事件驱动主循环 ═══
  private async driveLoop(engine: GameEngine): Promise<void> {
    const it = engine.flow()
    let result = it.next()
    while (!result.done) {
      const input = await this.playEvent(result.value, engine)
      result = it.next(input as InteractionInput)
    }
  }

  private async playEvent(ev: GameEvent, engine: GameEngine): Promise<InteractionInput | undefined> {
    switch (ev.kind) {
      case 'sceneTitle': {
        const header = el('scene-header')
        header.innerHTML = `<span class="act-badge">第${ev.act}幕 · ${ACT_NAMES[ev.act]}</span><span class="scene-name">${ev.title}</span>`
        header.classList.remove('hidden')
        header.classList.remove('pulse')
        void header.offsetWidth
        header.classList.add('pulse')
        particles.setEmberDensity(0.1 + ev.act * 0.1)
        return undefined
      }
      case 'narration': {
        for (const para of ev.paras) await this.appendLogLine(para, ev.instant === true)
        return undefined
      }
      case 'fx': {
        this.playFx(ev.fx)
        return undefined
      }
      case 'check': {
        await playDiceRoll(ev.outcome)
        if (ev.outcome.critSuccess) { shake(2); void sdk.vibrate() }
        if (ev.outcome.critFail) { shake(3); void sdk.vibrate() }
        return undefined
      }
      case 'askInspiration': {
        return await this.modal({
          title: '🎲 灵感',
          body: ev.label,
          buttons: [{ text: '消耗 1 灵感,重骰!', value: true, cls: 'btn-primary' }, { text: '认命', value: false, cls: 'btn-ghost' }],
        })
      }
      case 'choices': {
        this.updateStatus()
        this.updateMonsterCard()
        return await this.renderChoices(ev.views)
      }
      case 'combatStart': {
        const card = el('monster-card')
        const m = ev.monster
        card.classList.remove('hidden')
        card.innerHTML = `
          <div class="mc-emoji">${m.emoji}</div>
          <div class="mc-info">
            <div class="mc-name">${m.name}</div>
            <div class="mc-hp"><div class="mc-hp-bar" id="mc-hp-bar"></div></div>
            <div class="mc-hp-text" id="mc-hp-text">${engine.run.combat?.monsterHp ?? m.hp} / ${m.hp}</div>
          </div>`
        card.classList.remove('mc-enter')
        void card.offsetWidth
        card.classList.add('mc-enter')
        sfx.ember()
        return undefined
      }
      case 'combatLog': {
        if (ev.lines.length === 0) {
          this.updateStatus()
          this.updateMonsterCard()
          return await this.renderCombatMenu()
        }
        for (const line of ev.lines) await this.appendLogLine(line, false)
        return undefined
      }
      case 'damage': {
        if (ev.target === 'player') {
          this.updateStatus()
          hurtVignette()
          shake(ev.crit ? 3 : 2)
          void sdk.vibrate()
          ev.crit ? await hitStop(110) : await sleep(60)
          particles.floatText(`-${ev.value}${ev.crit ? '!' : ''}`, ev.crit ? 'crit' : 'dmg', 'player')
          sfx.hit()
        } else {
          this.updateMonsterCard()
          particles.floatText(`-${ev.value}${ev.crit ? ' 会心!' : ''}`, ev.crit ? 'crit' : 'dmg', 'monster')
          if (ev.crit) { await hitStop(90); shake(2) }
          sfx.hit()
          await sleep(ev.crit ? 260 : 140)
        }
        return undefined
      }
      case 'heal': {
        this.updateStatus()
        particles.floatText(`+${ev.value}`, 'heal', ev.target === 'player' ? 'player' : 'monster')
        particles.burst('heal')
        sfx.heal()
        await sleep(140)
        return undefined
      }
      case 'deathSave': {
        await playDeathSave(ev.roll, ev.successes, ev.failures, ev.note)
        await this.appendLogLine(`死亡豁免:d20 → **${ev.roll}**(成功 ${Math.min(ev.successes, 3)}/3,失败 ${Math.min(ev.failures, 3)}/3)${ev.note ? ` — ${ev.note}` : ''}`, true)
        return undefined
      }
      case 'levelUp': {
        sfx.levelup()
        particles.burst('gold')
        const featViews = ev.feats.map((f) => FEATS[f]!)
        const choice = await this.modal({
          title: `⬆️ 升级!等级 ${ev.level}`,
          body: '选择一项专长(二选一):',
          custom: () => {
            const wrap = document.createElement('div')
            wrap.className = 'feat-list'
            for (const f of featViews) {
              const card = document.createElement('button')
              card.className = 'feat-card'
              card.innerHTML = `<div class="feat-head">${f.emoji} ${f.name}</div><div class="feat-desc">${f.desc}</div>`
              card.dataset.value = f.id
              wrap.appendChild(card)
            }
            return wrap
          },
        })
        return typeof choice === 'string' ? choice : undefined
      }
      case 'equipPrompt': {
        const it = itemDef(ev.itemId)
        const choice = await this.modal({
          title: `获得 ${it.emoji} ${it.name}`,
          body: it.desc + (it.kind === 'weapon' ? `（伤害 ${it.damageDice}）` : it.kind === 'armor' ? `（AC +${it.acBonus}）` : ''),
          buttons: [
            { text: '装备', value: 'equip', cls: 'btn-primary' },
            { text: `折价卖掉 +${Math.floor(it.price / 2)}金`, value: 'sell', cls: 'btn-ghost' },
          ],
        })
        return typeof choice === 'string' ? choice : undefined
      }
      case 'shop': {
        await this.playShop(ev.shopId, engine)
        return undefined
      }
      case 'toast': {
        void sdk.toast(ev.text)
        return undefined
      }
      case 'actTransition': {
        await this.actCard(ev.act)
        return undefined
      }
      case 'ending': {
        await this.playEnding(ev.ending, ev.epitaph)
        return undefined
      }
      case 'gameOver': {
        await this.showScore(engine)
        return undefined
      }
      case 'title': {
        await this.actCardNamed(ev.text, ev.sub)
        return undefined
      }
    }
  }

  private playFx(fx: string): void {
    switch (fx) {
      case 'gold': particles.burst('gold'); sfx.coin(); break
      case 'heal': particles.burst('heal'); sfx.heal(); break
      case 'hurt': particles.burst('hurt'); shake(1); break
      case 'fragment': particles.burst('fragment'); sfx.crit(); shake(1); break
      case 'ember': particles.burst('ember'); sfx.ember(); break
    }
    this.updateStatus()
    this.updateMonsterCard()
  }

  // ═══ 日志 ═══
  private async appendLogLine(text: string, instant: boolean): Promise<void> {
    const log = el('log')
    const p = document.createElement('p')
    p.className = 'dm-line'
    log.appendChild(p)
    log.scrollTop = log.scrollHeight
    if (instant) {
      p.innerHTML = this.markup(text)
      return
    }
    await typewrite(p, text)
    log.scrollTop = log.scrollHeight
  }

  private markup(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<b class="hl">$1</b>')
      .replace(/\*(.+?)\*/g, '<i class="lyric">$1</i>')
  }

  // ═══ 状态栏 ═══
  private updateStatus(): void {
    const engine = this.engine
    if (!engine) return
    const p = engine.run.player
    const cls = classDef(p.classId)
    const bar = el('status-bar')
    const hpPct = Math.max(0, Math.round((p.hp / p.maxHp) * 100))
    const low = p.hp / p.maxHp <= 0.25
    const resPips = '●'.repeat(p.resource) + '○'.repeat(Math.max(0, maxResource(p) - p.resource))
    const insPips = p.inspiration > 0 ? '🎲'.repeat(p.inspiration) : '—'
    bar.innerHTML = `
      <div class="sb-left">
        <span class="sb-class">${cls.emoji}</span>
        <div class="sb-id">
          <span class="sb-name">${p.name} <i>Lv.${p.level}</i></span>
          <div class="sb-hp ${low ? 'low' : ''}">
            <div class="sb-hp-bar" style="width:${hpPct}%"></div>
            <span class="sb-hp-text">${p.hp}/${p.maxHp}</span>
          </div>
        </div>
      </div>
      <div class="sb-right">
        <span class="sb-item" title="金币">💰${p.gold}</span>
        <span class="sb-item" title="AC">🛡️${totalAc(p)}</span>
        <span class="sb-item" title="${cls.resourceName}">${cls.resourceName} ${resPips}</span>
        <span class="sb-item" title="灵感">${insPips}</span>
        ${p.companionBanjo ? '<span class="sb-item" title="同伴">🎻</span>' : ''}
        ${p.fragments > 0 ? `<span class="sb-item frag" title="英雄残章">📜×${p.fragments}</span>` : ''}
        <button class="sb-gear" id="sb-gear" title="设置">⚙️</button>
      </div>`
    const gear = document.getElementById('sb-gear')
    if (gear) gear.addEventListener('click', () => { sfx.click(); this.showSettings() })
  }

  private updateMonsterCard(): void {
    const engine = this.engine
    if (!engine?.run.combat) { el('monster-card').classList.add('hidden'); return }
    const cs = engine.run.combat
    const pct = Math.max(0, Math.round((cs.monsterHp / cs.monsterMaxHp) * 100))
    const bar = document.getElementById('mc-hp-bar')
    const text = document.getElementById('mc-hp-text')
    if (bar) bar.style.width = `${pct}%`
    if (text) text.textContent = `${cs.monsterHp} / ${cs.monsterMaxHp}`
  }

  // ═══ 选项与战斗菜单 ═══
  private renderChoices(views: ChoiceView[]): Promise<string> {
    return new Promise((resolve) => {
      const area = el('action-area')
      area.innerHTML = ''
      views.forEach((v, i) => {
        const btn = document.createElement('button')
        btn.className = `choice-btn ${v.locked ? 'locked' : ''}`
        btn.style.animationDelay = `${i * 70}ms`
        btn.innerHTML = `
          <span class="choice-text">${this.escapeHtml(v.text)}</span>
          ${v.checkLabel ? `<span class="choice-check">${v.checkLabel}</span>` : ''}
          ${v.hint ? `<span class="choice-hint">${v.hint}</span>` : ''}
          ${v.locked && v.lockReason ? `<span class="choice-lock">🔒 ${v.lockReason}</span>` : ''}`
        btn.addEventListener('click', () => {
          if (v.locked) { void sdk.toast(v.lockReason ?? '条件未满足', 'error'); return }
          sfx.click()
          area.innerHTML = ''
          resolve(v.id)
        })
        area.appendChild(btn)
      })
    })
  }

  private renderCombatMenu(): Promise<string> {
    return new Promise((resolve) => {
      const engine = this.engine!
      const p = engine.run.player
      const cls = classDef(p.classId)
      const area = el('action-area')
      area.innerHTML = ''
      const mk = (html: string, fn: () => void, cls2 = '') => {
        const b = document.createElement('button')
        b.className = `combat-btn ${cls2}`
        b.innerHTML = html
        b.addEventListener('click', () => { sfx.click(); fn() })
        area.appendChild(b)
      }
      const done = (v: string) => { area.innerHTML = ''; resolve(v) }
      mk('⚔️ 攻击', () => done('attack'))
      mk(`${cls.emoji} ${this.abilityName(p.classId)}<i>${cls.resourceName} ${p.resource}</i>`, () => done('ability'), p.resource > 0 ? '' : 'disabled')
      // 道具
      const consumables = p.inventory.filter((e) => itemDef(e.itemId).kind === 'consumable')
      mk(`🎒 道具<i>${consumables.reduce((a, b) => a + b.count, 0)}</i>`, () => {
        if (consumables.length === 0) { void sdk.toast('背包空空如也', 'error'); return }
        this.itemMenu(consumables, (itemId) => done(`item:${itemId}`), () => this.renderCombatMenu().then(resolve))
      }, consumables.length > 0 ? '' : 'disabled')
      mk('🏃 逃跑', () => done('flee'))
    })
  }

  private abilityName(classId: ClassId): string {
    const map: Record<string, string> = {
      fighter: '二次风', mage: '烬火矢', rogue: '偷袭', cleric: '引导神力', bard: '激励骰', paladin: '神圣打击',
    }
    return map[classId] ?? '技能'
  }

  private itemMenu(entries: { itemId: string; count: number }[], onPick: (id: string) => void, onCancel: () => void): void {
    const area = el('action-area')
    area.innerHTML = ''
    for (const e of entries) {
      const it = itemDef(e.itemId)
      const b = document.createElement('button')
      b.className = 'combat-btn item-btn'
      b.innerHTML = `${it.emoji} ${it.name}<i>×${e.count}</i>`
      b.addEventListener('click', () => { sfx.click(); onPick(e.itemId) })
      area.appendChild(b)
    }
    const back = document.createElement('button')
    back.className = 'combat-btn back-btn'
    back.textContent = '← 返回'
    back.addEventListener('click', () => { sfx.click(); onCancel() })
    area.appendChild(back)
  }

  // ═══ 商店 ═══
  private async playShop(shopId: string, engine: GameEngine): Promise<void> {
    const shop = SHOPS[shopId]!
    const overlay = el('overlay-shop')
    const inner = el('shop-inner')
    const render = () => {
      const p = engine.run.player
      inner.innerHTML = `
        <h3>${shop.name}</h3>
        <p class="shop-keeper">${shop.greeting}</p>
        <p class="shop-gold">你的金币:💰 <b>${p.gold}</b></p>
        <div class="shop-list">
          ${shop.items.map((id) => {
            const it = itemDef(id)
            const afford = p.gold >= it.price
            const owned = (it.kind === 'consumable' && p.inventory.some((e) => e.itemId === id))
              || (it.kind === 'weapon' && p.weaponId === id) || (it.kind === 'armor' && p.armorId === id)
            return `<button class="shop-item ${afford ? '' : 'poor'}" data-id="${id}">
              <span class="si-icon">${it.emoji}</span>
              <span class="si-body"><b>${it.name}</b><i>${it.desc}</i></span>
              <span class="si-price">💰${it.price}${owned ? '<em>已持有</em>' : ''}</span>
            </button>`
          }).join('')}
        </div>
        <button class="btn-primary" id="shop-leave">离开店铺</button>`
      inner.querySelectorAll('.shop-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = (btn as HTMLElement).dataset.id!
          const ok = engine.buyItem(shopId, id)
          if (ok) {
            const it = itemDef(id)
            sfx.coin()
            particles.burst('gold')
            void sdk.toast(`购入 ${it.name}`)
            this.updateStatus()
            render()
          } else {
            void sdk.toast('金币不足', 'error')
          }
        })
      })
      const leave = document.getElementById('shop-leave')
      leave?.addEventListener('click', () => { sfx.click(); engine.leaveShop(); overlay.classList.add('hidden') })
    }
    overlay.classList.remove('hidden')
    render()
    await new Promise<void>((resolve) => {
      const check = () => {
        if (overlay.classList.contains('hidden')) resolve()
        else setTimeout(check, 120)
      }
      check()
    })
    this.updateStatus()
  }

  // ═══ 通用弹窗 ═══
  private modal(opts: {
    title: string
    body?: string
    buttons?: { text: string; value: string | boolean; cls?: string }[]
    custom?: () => HTMLElement
  }): Promise<string | boolean> {
    return new Promise((resolve) => {
      const overlay = el('overlay-modal')
      const inner = el('modal-inner')
      inner.innerHTML = `<h3>${opts.title}</h3>${opts.body ? `<p class="modal-body">${opts.body}</p>` : ''}`
      if (opts.custom) inner.appendChild(opts.custom())
      if (opts.buttons) {
        const row = document.createElement('div')
        row.className = 'modal-btns'
        for (const b of opts.buttons) {
          const btn = document.createElement('button')
          btn.className = b.cls ?? 'btn-ghost'
          btn.textContent = b.text
          btn.addEventListener('click', () => { sfx.click(); overlay.classList.add('hidden'); resolve(b.value) })
          row.appendChild(btn)
        }
        inner.appendChild(row)
      } else {
        // custom 卡片点击直接返回 value
        inner.querySelectorAll('[data-value]').forEach((card) => {
          card.addEventListener('click', () => {
            sfx.click()
            overlay.classList.add('hidden')
            resolve((card as HTMLElement).dataset.value!)
          })
        })
      }
      overlay.classList.remove('hidden')
    })
  }

  // ═══ 幕间转场 ═══
  private async actCard(act: number): Promise<void> {
    await this.actCardNamed(`第${act}幕`, ACT_NAMES[act] ?? '')
  }

  private async actCardNamed(title: string, sub?: string): Promise<void> {
    const card = document.createElement('div')
    card.className = 'act-card'
    card.innerHTML = `<div class="act-title">${title}</div>${sub ? `<div class="act-sub">${sub}</div>` : ''}`
    document.body.appendChild(card)
    sfx.ember()
    await sleep(1700)
    card.remove()
  }

  // ═══ 结局 ═══
  private async playEnding(ending: { name: string; lines: string[]; trueEnding?: boolean }, epitaph?: string): Promise<void> {
    this.show('screen-ending')
    const inner = el('ending-inner')
    inner.className = `ending-inner ${ending.trueEnding ? 'true' : ''}`
    inner.innerHTML = `<h2 class="ending-name">${ending.trueEnding ? '✦ 真结局 · ' : ''}${ending.name}</h2>`
    particles.setEmberDensity(ending.trueEnding ? 0 : 0.5)
    for (const line of ending.lines) {
      const p = document.createElement('p')
      p.className = 'ending-line'
      inner.appendChild(p)
      await typewrite(p, line, 60)
      inner.scrollTop = inner.scrollHeight
      await sleep(200)
    }
    if (epitaph) {
      const ep = document.createElement('p')
      ep.className = 'ending-epitaph'
      ep.innerHTML = `🪦 <b>墓志铭</b><br>${this.escapeHtml(epitaph)}`
      inner.appendChild(ep)
    }
    const hint = document.createElement('p')
    hint.className = 'ending-hint'
    hint.textContent = '—— 轻触任意处,查看结算 ——'
    inner.appendChild(hint)
    inner.scrollTop = inner.scrollHeight
    await new Promise<void>((resolve) => {
      const go = () => { inner.removeEventListener('click', go); resolve() }
      inner.addEventListener('click', go)
    })
  }

  // ═══ 结算 ═══
  private async showScore(engine: GameEngine): Promise<void> {
    const { score, endingId } = engine.finishRun()
    const run = engine.run
    const grade: LuckGrade = luckGrade(run.nat20, run.nat1, run.rolls)
    // meta 更新
    this.meta.bestScore = Math.max(this.meta.bestScore, score.total)
    if (!this.meta.endings.includes(endingId as never)) this.meta.endings.push(endingId as never)
    this.meta.emberMarks += Math.floor(score.total / 100)
    if (run.player.companionBanjo || run.player.flags['banjo_truth']) {
      if (!this.meta.unlockedClasses.includes('bard')) {
        this.meta.unlockedClasses.push('bard')
        void sdk.toast('解锁隐藏职业:吟游诗人!🎻')
      }
    }
    if (endingId === 'end_return' && !this.meta.unlockedClasses.includes('paladin')) {
      this.meta.unlockedClasses.push('paladin')
      void sdk.toast('真结局达成,解锁隐藏职业:圣武士!🛡️')
    }
    await this.saveMeta()
    await sdk.kvSet('save_v1', null)

    this.show('screen-score')
    const inner = el('score-inner')
    const endingName = { end_slay: '斩王', end_return: '归还·真结局', end_fall: '堕落', end_death: '殒命' }[endingId] ?? ''
    const cls = classDef(run.player.classId)
    inner.innerHTML = `
      <h2>🏁 冒险结算</h2>
      <p class="score-runinfo">${run.player.name} · ${cls.emoji}${cls.name} · 结局「${endingName}」</p>
      <div class="score-rows">
        <div class="score-row"><span>章节进度</span><b data-count="${score.chapters}">0</b></div>
        <div class="score-row"><span>击杀 ×${run.kills}</span><b data-count="${score.kills}">0</b></div>
        <div class="score-row"><span>残存生命</span><b data-count="${score.hpLeft}">0</b></div>
        <div class="score-row"><span>英雄残章 ×${run.player.fragments}</span><b data-count="${score.fragments}">0</b></div>
        <div class="score-row"><span>金币折算</span><b data-count="${score.gold}">0</b></div>
        <div class="score-row"><span>专长 ×${run.player.feats.length}</span><b data-count="${score.achievements}">0</b></div>
        ${score.trueEnding ? `<div class="score-row true"><span>真结局加成</span><b data-count="${score.trueEnding}">0</b></div>` : ''}
      </div>
      <div class="score-total">总分 <b id="score-total" data-count="${score.total}">0</b></div>
      <div class="score-luck">🎲 骰运评级 <b class="grade-${grade}">${grade}</b>
        <i>大成功×${run.nat20} · 大失败×${run.nat1} · 共${run.rolls}骰</i></div>
      <div class="score-submit" id="score-submit">正在上传成绩……</div>
      <div class="score-btns">
        <button class="btn-primary" id="score-home">返回大厅</button>
        <button class="btn-secondary" id="score-board">🏆 排行榜</button>
        <button class="btn-secondary" id="score-share">📸 分享战绩</button>
      </div>`
    // 数字滚动(setTimeout 驱动,后台标签也能完成;隐藏时直接落定)
    const counters = inner.querySelectorAll<HTMLElement>('[data-count]')
    for (const c of counters) {
      const target = Number(c.dataset.count)
      if (document.hidden) { c.textContent = String(target); continue }
      const dur = 700
      const t0 = performance.now()
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / dur)
        c.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))))
        if (k < 1) setTimeout(step, 40)
      }
      step()
      await sleep(90)
    }
    await sleep(500)
    sfx.levelup()
    // 上传
    const extra = {
      ending: endingName,
      cls: cls.name,
      luck: grade,
      frag: run.player.fragments,
    }
    const submitted = await sdk.submitScore(score.total, extra)
    const sub = document.getElementById('score-submit')
    if (sub) {
      if (submitted) {
        sub.innerHTML = submitted.ranked
          ? `✅ 已上传 · 当前排名 <b>第 ${submitted.rank} 名</b>`
          : '✅ 成绩已保存(超出榜单展示范围)'
      } else {
        sub.textContent = '📒 未登录或网络不可用,成绩已保存在本地'
      }
    }
    document.getElementById('score-home')?.addEventListener('click', () => { sfx.click(); void this.showTitle() })
    document.getElementById('score-board')?.addEventListener('click', () => { sfx.click(); void this.showLeaderboard() })
    document.getElementById('score-share')?.addEventListener('click', async () => {
      sfx.click()
      const ok = await sdk.shareScreenshot()
      if (!ok) void sdk.toast('当前环境不支持截图分享', 'error')
    })
  }

  // ═══ 排行榜 ═══
  async showLeaderboard(): Promise<void> {
    this.show('screen-board')
    const inner = el('board-inner')
    inner.innerHTML = `<h2>🏆 骰运者榜</h2><p class="board-loading">读取榜单中……</p><button class="btn-ghost" id="board-back">← 返回</button>`
    document.getElementById('board-back')?.addEventListener('click', () => { sfx.click(); void this.showTitle() })
    const page = await sdk.fetchLeaderboard()
    if (!page || page.entries.length === 0) {
      inner.querySelector('.board-loading')!.innerHTML = '榜单空空如也——<br>第一个把名字刻上去的人,就是你。<br><i>(需在小黑盒 APP 内登录并联网)</i>'
      return
    }
    const rows = page.entries.map((e) => {
      const extra = e.extra as { ending?: string; cls?: string; luck?: string }
      const tag = [extra?.cls, extra?.ending?.replace('·真结局', ''), extra?.luck ? `骰运${extra.luck}` : '']
        .filter(Boolean).join(' · ')
      return `<div class="board-row">
        <span class="br-rank ${e.rank <= 3 ? `top${e.rank}` : ''}">${e.rank}</span>
        <span class="br-name">${this.maskId(e.appUserId)}</span>
        <span class="br-tag">${tag}</span>
        <b class="br-score">${e.score}</b>
      </div>`
    }).join('')
    inner.innerHTML = `<h2>🏆 骰运者榜</h2><div class="board-rows">${rows}</div><p class="board-foot">榜单缓存约 5 分钟 · 你的最好成绩:${this.meta.bestScore}</p><button class="btn-ghost" id="board-back">← 返回</button>`
    document.getElementById('board-back')?.addEventListener('click', () => { sfx.click(); void this.showTitle() })
  }

  private maskId(id: string): string {
    if (id.length <= 4) return '冒险者'
    return `${id.slice(0, 2)}···${id.slice(-2)}`
  }

  // ═══ 图鉴 & 设置 ═══
  showCodex(): void {
    const inner = el('codex-inner')
    const endingsAll: { id: string; name: string }[] = [
      { id: 'end_slay', name: '斩王' }, { id: 'end_return', name: '归还(真结局)' },
      { id: 'end_fall', name: '堕落' }, { id: 'end_death', name: '殒命' },
    ]
    inner.innerHTML = `
      <h3>📚 图鉴</h3>
      <div class="codex-sec">结局收集 ${this.meta.endings.length}/4</div>
      <div class="codex-grid">
        ${endingsAll.map((e) => `
          <div class="codex-cell ${this.meta.endings.includes(e.id as never) ? 'got' : ''}">
            ${this.meta.endings.includes(e.id as never) ? e.name : '???'}
          </div>`).join('')}
      </div>
      <div class="codex-sec">烬痕 ${this.meta.emberMarks}(解锁货币,后续版本可用)</div>
      <div class="codex-sec">职业已解锁 ${4 + this.meta.unlockedClasses.length}/6</div>
      <button class="btn-primary" id="codex-close">关闭</button>`
    el('overlay-codex').classList.remove('hidden')
    document.getElementById('codex-close')?.addEventListener('click', () => {
      sfx.click()
      el('overlay-codex').classList.add('hidden')
    })
  }

  showSettings(): void {
    const inner = el('settings-inner')
    inner.innerHTML = `
      <h3>⚙️ 设置</h3>
      <div class="set-row"><span>音效</span>
        <button class="btn-toggle" id="set-sound">${this.meta.soundOn ? '开' : '关'}</button></div>
      <div class="set-row"><span>字号</span>
        <div class="font-scale">
          ${[0, 1, 2].map((i) => `<button data-fs="${i}" class="${this.meta.fontScale === i ? 'sel' : ''}">${['小', '中', '大'][i]}</button>`).join('')}
        </div></div>
      <p class="set-note">骰运迷城 v0.1.0 · 小黑盒工坊</p>
      <button class="btn-primary" id="set-close">关闭</button>`
    el('overlay-settings').classList.remove('hidden')
    document.getElementById('set-sound')?.addEventListener('click', (e) => {
      this.meta.soundOn = !this.meta.soundOn
      sfx.setEnabled(this.meta.soundOn)
      ;(e.target as HTMLElement).textContent = this.meta.soundOn ? '开' : '关'
      void this.saveMeta()
    })
    inner.querySelectorAll('.font-scale button').forEach((b) => {
      b.addEventListener('click', () => {
        this.meta.fontScale = Number((b as HTMLElement).dataset.fs) as 0 | 1 | 2
        this.applyFontScale()
        inner.querySelectorAll('.font-scale button').forEach((x) => x.classList.remove('sel'))
        b.classList.add('sel')
        void this.saveMeta()
      })
    })
    document.getElementById('set-close')?.addEventListener('click', () => {
      sfx.click()
      el('overlay-settings').classList.add('hidden')
    })
  }

  private applyFontScale(): void {
    document.body.dataset.fs = String(this.meta.fontScale)
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}
