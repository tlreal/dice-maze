// ─── WebAudio 程序化音效(零素材) ────────────────────────────────────
// 首次用户手势后解锁 AudioContext;设置里可关。

class Sfx {
  private ctx: AudioContext | null = null
  enabled = true

  unlock(): void {
    if (this.ctx) { void this.ctx.resume(); return }
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AC) this.ctx = new AC()
    } catch { /* 无音频环境 */ }
  }

  setEnabled(on: boolean): void {
    this.enabled = on
    if (on) this.unlock()
  }

  private env(gain: GainNode, t0: number, peak: number, decay: number): void {
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay)
  }

  private tone(freq: number, type: OscillatorType, peak: number, decay: number, slideTo?: number): void {
    const ctx = this.ctx
    if (!ctx || !this.enabled) return
    const t0 = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + decay * 0.9)
    this.env(gain, t0, peak, decay)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + decay + 0.05)
  }

  private noise(peak: number, decay: number, hp: number): void {
    const ctx = this.ctx
    if (!ctx || !this.enabled) return
    const t0 = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * decay)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = hp
    const gain = ctx.createGain()
    this.env(gain, t0, peak, decay)
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start(t0)
  }

  click(): void { this.tone(660, 'triangle', 0.05, 0.06) }
  diceRoll(): void { this.noise(0.09, 0.32, 2400); this.tone(320, 'square', 0.03, 0.28, 180) }
  diceLand(): void { this.tone(180, 'triangle', 0.12, 0.16, 120); this.noise(0.06, 0.1, 1200) }
  crit(): void {
    this.tone(523, 'triangle', 0.1, 0.4)
    setTimeout(() => this.tone(659, 'triangle', 0.1, 0.4), 90)
    setTimeout(() => this.tone(784, 'triangle', 0.12, 0.55), 180)
    this.noise(0.05, 0.3, 3000)
  }
  fail(): void { this.tone(220, 'sawtooth', 0.08, 0.4, 110); this.noise(0.05, 0.2, 500) }
  hit(): void { this.tone(140, 'square', 0.1, 0.14, 70); this.noise(0.08, 0.12, 800) }
  heal(): void { this.tone(523, 'sine', 0.06, 0.3); setTimeout(() => this.tone(784, 'sine', 0.06, 0.35), 110) }
  coin(): void { this.tone(1200, 'square', 0.04, 0.1); setTimeout(() => this.tone(1600, 'square', 0.04, 0.14), 70) }
  levelup(): void {
    this.tone(392, 'triangle', 0.08, 0.3)
    setTimeout(() => this.tone(523, 'triangle', 0.08, 0.3), 120)
    setTimeout(() => this.tone(659, 'triangle', 0.1, 0.45), 240)
  }
  death(): void { this.tone(110, 'sine', 0.12, 1.2, 55) }
  ember(): void { this.noise(0.04, 0.5, 600); this.tone(90, 'sine', 0.05, 0.5, 60) }
}

export const sfx = new Sfx()
