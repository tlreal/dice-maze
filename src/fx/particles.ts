// ─── Canvas 粒子层:环境余烬 + 金币/治疗/火星爆发 + 飘字 ─────────────
interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number
  size: number; color: string; kind: 'ember' | 'spark' | 'coin' | 'text'
  text?: string; cls?: string; gravity?: number; spin?: number
}

class ParticleLayer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private particles: Particle[] = []
  private raf = 0
  private emberRate = 0.25          // 环境余烬密度(0=关)
  private running = false
  private domLayer: HTMLElement | null = null

  mount(): void {
    if (this.canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'particle-canvas'
    Object.assign(this.canvas.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '60',
    } satisfies Partial<CSSStyleDeclaration>)
    document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.start()
  }

  private resize() {
    if (!this.canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.canvas.width = window.innerWidth * dpr
    this.canvas.height = window.innerHeight * dpr
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  setEmberDensity(v: number): void { this.emberRate = v }

  private start() {
    if (this.running) return
    this.running = true
    const tick = () => {
      this.step()
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  private step() {
    const ctx = this.ctx
    const cvs = this.canvas
    if (!ctx || !cvs) return
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    const w = window.innerWidth
    const h = window.innerHeight
    // 环境余烬
    if (this.emberRate > 0 && Math.random() < this.emberRate && document.visibilityState === 'visible') {
      this.particles.push({
        x: Math.random() * w, y: h + 8,
        vx: (Math.random() - 0.5) * 0.4, vy: -(0.35 + Math.random() * 0.7),
        life: 0, maxLife: 240 + Math.random() * 160,
        size: 1 + Math.random() * 2.2,
        color: Math.random() < 0.75 ? 'rgba(255,140,50,' : 'rgba(255,80,40,',
        kind: 'ember',
      })
    }
    // 更新 & 绘制
    this.particles = this.particles.filter((p) => p.life < p.maxLife && p.y < h + 60 && p.y > -80)
    for (const p of this.particles) {
      p.life += 1
      p.x += p.vx
      p.y += p.vy
      if (p.kind === 'coin') { p.vy += 0.12 }
      const alpha = 1 - p.life / p.maxLife
      if (p.kind === 'ember' || p.kind === 'spark') {
        ctx!.beginPath()
        ctx!.fillStyle = `${p.color}${(alpha * 0.85).toFixed(2)})`
        ctx!.arc(p.x, p.y, p.size * (p.kind === 'spark' ? alpha : 1), 0, Math.PI * 2)
        ctx!.fill()
      }
    }
  }

  /** 火花爆发 */
  burst(kind: 'gold' | 'heal' | 'hurt' | 'fragment' | 'ember', cx?: number, cy?: number): void {
    if (!this.ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const w = window.innerWidth
    const h = window.innerHeight
    const x = cx ?? w / 2
    const y = cy ?? h * 0.4
    const palette: Record<string, string> = {
      gold: 'rgba(255,196,77,', heal: 'rgba(110,231,150,', hurt: 'rgba(240,70,60,',
      fragment: 'rgba(255,240,200,', ember: 'rgba(255,120,40,',
    }
    const n = kind === 'fragment' ? 60 : kind === 'gold' ? 36 : 28
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2
      const spd = kind === 'fragment' ? 1 + Math.random() * 3.2 : 0.6 + Math.random() * 2.2
      this.particles.push({
        x, y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - (kind === 'heal' ? 1.2 : 0),
        life: 0, maxLife: 40 + Math.random() * 40,
        size: 1.5 + Math.random() * 2.5,
        color: palette[kind] ?? 'rgba(255,255,255,',
        kind: 'spark',
      })
    }
  }

  /** 飘字(DOM 实现,便于中文字体渲染) */
  floatText(text: string, cls: string, target: 'player' | 'monster' | 'center'): void {
    if (!this.domLayer) {
      this.domLayer = document.createElement('div')
      this.domLayer.id = 'float-layer'
      document.body.appendChild(this.domLayer)
    }
    const el = document.createElement('div')
    el.className = `float-text ${cls} ${target}`
    el.textContent = text
    if (target !== 'center') {
      const anchor = document.querySelector(target === 'player' ? '#status-bar' : '#monster-card')
      if (anchor) {
        const r = anchor.getBoundingClientRect()
        el.style.left = `${r.left + r.width / 2}px`
        el.style.top = `${r.top + 24}px`
        el.style.position = 'fixed'
      }
    }
    this.domLayer.appendChild(el)
    setTimeout(() => el.remove(), 1400)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.running = false
  }
}

export const particles = new ParticleLayer()
