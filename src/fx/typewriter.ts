// ─── 打字机旁白:逐字入场 + **关键词高亮** ──────────────────────────

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Segment { text: string; hl: boolean; italic?: boolean }

function parseHighlight(text: string): Segment[] {
  // 先切 **高亮**,再在剩余部分切 *斜体*(歌词/引文)
  const segs: Segment[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ text: text.slice(last, m.index), hl: false })
    const raw = m[0]!
    if (raw.startsWith('**')) segs.push({ text: raw.slice(2, -2), hl: true })
    else segs.push({ text: raw.slice(1, -1), hl: false, italic: true })
    last = m.index + raw.length
  }
  if (last < text.length) segs.push({ text: text.slice(last), hl: false })
  return segs
}

/**
 * 将一段文本打字机式写入容器。支持点击容器立即完成。
 * 返回 Promise,完成时全文就位。
 */
export function typewrite(container: HTMLElement, text: string, cps = 46): Promise<void> {
  const segs = parseHighlight(text)
  container.innerHTML = ''
  const spans: { span: HTMLElement; full: string }[] = []
  for (const s of segs) {
    const tag = s.hl ? 'b' : s.italic ? 'i' : 'span'
    const span = document.createElement(tag)
    if (s.hl) span.className = 'hl'
    if (s.italic) span.className = 'lyric'
    container.appendChild(span)
    spans.push({ span, full: s.text })
  }
  if (reduced()) {
    for (const { span, full } of spans) span.textContent = full
    return Promise.resolve()
  }
  let skipped = false
  const finishNow = () => { skipped = true }
  container.addEventListener('click', finishNow, { once: true })
  const interval = 1000 / cps
  return new Promise<void>((resolve) => {
    let si = 0
    let ci = 0
    const step = () => {
      if (si >= spans.length) {
        container.removeEventListener('click', finishNow)
        resolve()
        return
      }
      if (skipped) {
        for (; si < spans.length; si++) spans[si]!.span.textContent = spans[si]!.full
        container.removeEventListener('click', finishNow)
        resolve()
        return
      }
      const cur = spans[si]!
      ci += 1
      cur.span.textContent = cur.full.slice(0, ci)
      if (ci >= cur.full.length) { si += 1; ci = 0 }
      setTimeout(step, interval)
    }
    step()
  })
}
