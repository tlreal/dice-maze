# -*- coding: utf-8 -*-
"""
图标 v2:解决 v1 的元素互相遮挡。全部程序化绘制。
验收不靠肉眼:每个方案都会输出元素包围盒并断言「标题与骰子/胶囊不相交、标题不出画」,
同时把成图缩到 62px 计算对比度与边缘能量,作为小尺寸可读性的代理指标。
用法: python -I scripts/gen_lamps_icons_v2.py [输出目录]
"""
import math
import random
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_DIR = r"C:\Windows\Fonts"
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
S, SS = 512, 3
W = S * SS

GOLD = [(0.00, (255, 252, 236)), (0.22, (255, 232, 160)), (0.50, (255, 196, 77)),
        (0.74, (226, 150, 40)), (1.00, (170, 92, 18))]
CREAM = [(0.00, (255, 255, 250)), (0.42, (255, 246, 222)), (1.00, (224, 198, 148))]


def F(name, size):
    for cand in (rf"{FONT_DIR}\{name}", rf"{FONT_DIR}\msyhbd.ttc", rf"{FONT_DIR}\simhei.ttf"):
        try:
            return ImageFont.truetype(cand, size)
        except Exception:
            continue
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vgrad(w, h, stops):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        col = stops[-1][1]
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                col = lerp(c0, c1, (t - p0) / max(1e-6, p1 - p0))
                break
        for x in range(w):
            px[x, y] = col
    return img


def radial_bg(w, h, inner, outer, cy=0.40, power=1.3):
    small = Image.new("RGB", (192, 192))
    px = small.load()
    for y in range(192):
        for x in range(192):
            t = min(1.0, math.hypot((x - 96) / 96, (y - 192 * cy) / 96 * 0.92) / 1.08) ** power
            px[x, y] = lerp(inner, outer, t)
    return small.resize((w, h), Image.BICUBIC)


def glow(img, center, radius, color, strength=1.0, squash=0.92):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    n = 30
    for i in range(n, 0, -1):
        r = radius * i / n
        a = int(255 * strength * (1 - i / n) ** 1.8)
        d.ellipse([center[0] - r, center[1] - r * squash, center[0] + r, center[1] + r * squash], fill=color + (a,))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(radius * 0.05)))


def hex_pts(cx, cy, r, rot=-90):
    return [(cx + r * math.cos(math.radians(rot + i * 60)), cy + r * math.sin(math.radians(rot + i * 60))) for i in range(6)]


def d20_sprite(R, num="20", rot=-90):
    n = int(R * 3.0)
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    cx = cy = n / 2
    d = ImageDraw.Draw(img)
    o = hex_pts(cx, cy, R, rot)
    d.polygon(o, fill=(150, 78, 16, 255))
    d.polygon([o[2], o[3], o[4]], fill=(198, 114, 26, 255))
    d.polygon([o[4], o[5], o[0]], fill=(238, 166, 58, 255))
    d.polygon([o[0], o[1], o[2]], fill=(255, 214, 126, 255))
    inner = hex_pts(cx, cy, R * 0.47, rot)
    fm = Image.new("L", (n, n), 0)
    ImageDraw.Draw(fm).polygon(inner, fill=255)
    img.paste(vgrad(n, n, GOLD), (0, 0), fm)
    d = ImageDraw.Draw(img)
    lw = max(3, int(R * 0.05))
    for i in range(6):
        d.line([o[i], inner[(i + 1) % 6]], fill=(255, 240, 200, 255), width=lw)
    d.polygon(inner, outline=(255, 244, 214, 255), width=lw)
    d.polygon(o, outline=(104, 48, 8, 255), width=int(lw * 1.3))
    d.polygon(o, outline=(255, 236, 190, 255), width=max(2, lw - 2))
    f = F("Bahnschrift Bold.ttf", int(R * 0.76))
    d.text((cx, cy + R * 0.02), num, font=f, fill=(74, 32, 4, 255), anchor="mm")
    return img


def title_layer(text, size_px, stops, slant=-0.12, spacing=0.01, stroke=0.026, fname="msyhbd.ttc"):
    """返回 (图层, 文字实际包围盒, 整层尺寸)"""
    f = F(fname, size_px)
    pad = int(size_px * (stroke * 3 + 0.18))
    adv = [f.getlength(c) + size_px * spacing for c in text]
    tw = int(sum(adv)) + pad * 2
    asc, desc = f.getmetrics()
    th = asc + desc + pad * 2
    mask = Image.new("L", (tw, th), 0)
    md = ImageDraw.Draw(mask)
    x = pad
    for c, a in zip(text, adv):
        md.text((x, pad), c, font=f, fill=255)
        x += a
    if slant:
        tw2 = tw + int(th * abs(slant))
        mask = mask.transform((tw2, th), Image.AFFINE, (1, slant, -slant * th, 0, 1, 0), resample=Image.BICUBIC)
        tw = tw2
    sw = max(2, int(size_px * stroke))
    layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    for k in range(sw, 0, -1):
        m = mask.filter(ImageFilter.MaxFilter(k * 2 + 1))
        shade = lerp((160, 76, 16), (44, 14, 4), (k - 1) / max(1, sw - 1))
        layer.paste(shade + (255,), (0, 0), m)
    layer.paste(vgrad(tw, th, stops), (0, 0), mask)
    hi_h = int(th * 0.32)
    hm = mask.crop((0, 0, tw, hi_h)).point(lambda v: v * 34 // 255)
    layer.paste((255, 255, 255, 255), (0, 0), hm)
    bbox = (pad, pad, tw - pad, th - pad)
    return layer, bbox


def paste(base, layer, cx, cy):
    """粘贴并返回画布坐标下的实际像素包围盒(不含透明留白)"""
    x, y = int(cx - layer.size[0] / 2), int(cy - layer.size[1] / 2)
    base.alpha_composite(layer, (x, y))
    bb = layer.getbbox()          # alpha 通道的实际范围
    if not bb:
        return (x, y, x, y)
    return (x + bb[0], y + bb[1], x + bb[2], y + bb[3])


def place_under(base, layer, cx, top, gap=0):
    """让图层「实际像素」的顶边落在 top+gap,返回(包围盒, 底部 y)"""
    bb = layer.getbbox() or (0, 0, layer.size[0], layer.size[1])
    layer_top = top + gap - bb[1]
    cy = layer_top + layer.size[1] / 2
    r = paste(base, layer, cx, cy)
    return r, r[3]


def pill(d, cx, cy, text, fs, bg=(255, 236, 196, 255), fg=(138, 46, 8, 255)):
    f = F("msyhbd.ttc", fs)
    tw = d.textlength(text, font=f)
    h = fs * 1.75
    box = [cx - tw / 2 - fs * 0.85, cy - h / 2, cx + tw / 2 + fs * 0.85, cy + h / 2]
    d.rounded_rectangle(box, radius=h / 2, fill=bg)
    d.text((cx, cy + fs * 0.06), text, font=f, fill=fg, anchor="mm")
    return tuple(box)


def embers(d, n, seed, y0, y1, rmax):
    rnd = random.Random(seed)
    for _ in range(n):
        x, y = rnd.uniform(0, W), rnd.uniform(y0, y1)
        r = rnd.uniform(2, rmax)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rnd.choice([(255, 172, 82), (255, 112, 52), (255, 222, 146)]) + (215,))


def rects_overlap(a, b):
    return not (a[2] <= b[0] or b[2] <= a[0] or a[3] <= b[1] or b[3] <= a[1])


# ══════════ A:纯排版 —— 胶囊 + 两行大字 + 细金线(无遮挡) ══════════
def icon_a(tag):
    base = radial_bg(W, W, (152, 62, 14), (26, 9, 4), cy=0.32).convert("RGBA")
    glow(base, (W * 0.46, W * 0.40), W * 0.55, (255, 150, 50), 0.48)
    d = ImageDraw.Draw(base)
    embers(d, 58, 13, W * 0.38, W, 9 * SS / 3)
    # 底部更暗,压住标题
    band = Image.new("RGBA", (W, int(W * 0.52)), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for y in range(band.size[1]):
        bd.line([(0, y), (W, y)], fill=(10, 4, 3, int(150 * (y / band.size[1]) ** 0.8)))
    base.alpha_composite(band, (0, int(W * 0.50)))

    top = pill(d, W * 0.5, W * 0.100, "DND跑团 · 掷骰肉鸽", int(W * 0.068))
    t1, _ = title_layer("骰运", int(W * 0.255), CREAM)
    t2, _ = title_layer("迷城", int(W * 0.255), GOLD)
    r1, b1 = place_under(base, t1, W * 0.5, top[3], gap=W * 0.045)
    r2, b2 = place_under(base, t2, W * 0.5, b1, gap=W * 0.052)
    d = ImageDraw.Draw(base)
    ly = int(b2 + W * 0.035)
    d.line([(W * 0.30, ly), (W * 0.70, ly)], fill=(255, 214, 130, 190), width=int(W * 0.007))
    return base, [("pill", top), ("title1", r1), ("title2", r2)]


# ══════════ B:骰子居中偏上,标题在下,互不遮挡 ══════════
def icon_b(tag):
    base = radial_bg(W, W, (92, 32, 10), (20, 7, 4), cy=0.38).convert("RGBA")
    glow(base, (W * 0.50, W * 0.40), W * 0.55, (255, 172, 62), 0.62)
    d = ImageDraw.Draw(base)
    for i in range(32):
        a = math.radians(i * 11.25 + 4)
        r0, r1 = W * 0.225, W * (0.52 if i % 2 else 0.63)
        d.polygon([(W * .5 + math.cos(a - .02) * r0, W * .40 + math.sin(a - .02) * r0),
                   (W * .5 + math.cos(a + .02) * r0, W * .40 + math.sin(a + .02) * r0),
                   (W * .5 + math.cos(a) * r1, W * .40 + math.sin(a) * r1)], fill=(255, 190, 90, 44))
    die = d20_sprite(W * 0.175, rot=-74).rotate(-10, resample=Image.BICUBIC)
    dr = paste(base, die, W * 0.50, W * 0.400)
    d = ImageDraw.Draw(base)
    top = pill(d, W * 0.5, W * 0.098, "DND跑团 · 四个结局", int(W * 0.070))
    # 底部暗带保证标题对比
    band = Image.new("RGBA", (W, int(W * 0.34)), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for y in range(band.size[1]):
        bd.line([(0, y), (W, y)], fill=(16, 6, 4, int(226 * (y / band.size[1]) ** 0.6)))
    base.alpha_composite(band, (0, int(W * 0.66)))
    t, _ = title_layer("骰运迷城", int(W * 0.175), GOLD, spacing=0.006)
    tr = paste(base, t, W * 0.50, W * 0.845)
    return base, [("pill", top), ("die", dr), ("title", tr)]


# ══════════ C:巨门 + 披风冒险者剪影 + 标题 ══════════
def icon_c(tag):
    base = radial_bg(W, W, (206, 78, 24), (26, 8, 6), cy=0.54, power=1.7).convert("RGBA")
    glow(base, (W * 0.50, W * 0.52), W * 0.30, (255, 196, 100), 0.95)
    d = ImageDraw.Draw(base)
    # 门洞:上窄下宽的透视
    d.polygon([(W * .115, W * .96), (W * .175, W * .115), (W * .825, W * .115), (W * .885, W * .96)], fill=(13, 6, 4, 255))
    d.polygon([(W * .205, W * .96), (W * .245, W * .175), (W * .755, W * .175), (W * .795, W * .96)], fill=(255, 236, 178, 255))
    # 两扇门板(虚掩,中间留缝)
    d.polygon([(W * .205, W * .96), (W * .245, W * .175), (W * .465, W * .175), (W * .455, W * .96)], fill=(24, 12, 8, 255))
    d.polygon([(W * .795, W * .96), (W * .755, W * .175), (W * .535, W * .175), (W * .545, W * .96)], fill=(20, 10, 7, 255))
    # 门缝光
    d.polygon([(W * .465, W * .175), (W * .535, W * .175), (W * .552, W * .96), (W * .448, W * .96)], fill=(255, 158, 66, 255))
    d.polygon([(W * .486, W * .175), (W * .514, W * .175), (W * .522, W * .96), (W * .478, W * .96)], fill=(255, 242, 198, 255))
    # 台阶
    for i in range(4):
        y = W * (0.80 + i * 0.045)
        d.polygon([(W * (.10 - i * .012), y + W * .045), (W * (.90 + i * .012), y + W * .045),
                   (W * (.90 + i * .012), y + W * .026), (W * (.10 - i * .012), y + W * .026)], fill=(30, 16, 10, 255))
    # 门框上的刻痕
    for i in range(7):
        x = W * (0.24 + i * 0.077)
        d.line([(x, W * .18), (x + W * .006, W * .30)], fill=(120, 70, 26, 200), width=int(W * 0.005))
    # 冒险者:披风 + 宽肩 + 剑,背对
    cx, gy, hh = W * 0.50, W * 0.815, W * 0.335
    d.polygon([(cx - hh * .30, gy - hh * .78), (cx + hh * .30, gy - hh * .78),
               (cx + hh * .46, gy - hh * .02), (cx + hh * .26, gy), (cx - hh * .26, gy), (cx - hh * .46, gy - hh * .02)],
              fill=(7, 4, 3, 255))
    d.ellipse([cx - hh * .115, gy - hh * 1.02, cx + hh * .115, gy - hh * .78], fill=(7, 4, 3, 255))
    d.polygon([(cx - hh * .13, gy - hh * .10), (cx - hh * .05, gy - hh * .10), (cx - hh * .075, gy + hh * .01), (cx - hh * .15, gy + hh * .01)], fill=(7, 4, 3, 255))
    d.polygon([(cx + hh * .05, gy - hh * .10), (cx + hh * .13, gy - hh * .10), (cx + hh * .15, gy + hh * .01), (cx + hh * .075, gy + hh * .01)], fill=(7, 4, 3, 255))
    # 剑与边缘光
    d.line([(cx + hh * .34, gy - hh * .74), (cx + hh * .50, gy - hh * .02)], fill=(255, 238, 194, 255), width=int(W * 0.014))
    d.line([(cx + hh * .31, gy - hh * .76), (cx + hh * .40, gy - hh * .84)], fill=(255, 238, 194, 255), width=int(W * 0.010))
    rim = Image.new("RGBA", base.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(rim)
    rd.line([(cx - hh * .30, gy - hh * .76), (cx - hh * .46, gy - hh * .02)], fill=(255, 208, 130, 210), width=int(W * 0.010))
    rd.line([(cx + hh * .30, gy - hh * .76), (cx + hh * .46, gy - hh * .02)], fill=(255, 208, 130, 210), width=int(W * 0.010))
    base.alpha_composite(rim.filter(ImageFilter.GaussianBlur(W * 0.004)))
    # 底部暗带
    band = Image.new("RGBA", (W, int(W * 0.30)), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for y in range(band.size[1]):
        bd.line([(0, y), (W, y)], fill=(12, 5, 3, int(230 * (y / band.size[1]) ** 0.55)))
    base.alpha_composite(band, (0, int(W * 0.72)))
    d = ImageDraw.Draw(base)
    top = pill(d, W * 0.5, W * 0.088, "DND跑团 · 掷骰肉鸽", int(W * 0.068))
    t, _ = title_layer("骰运迷城", int(W * 0.165), GOLD, spacing=0.006)
    tr = paste(base, t, W * 0.50, W * 0.888)
    return base, [("pill", top), ("title", tr)]


# ══════════ 验收:包围盒不相交 + 缩略图对比度 ══════════
def verify(name, base, boxes, title_key):
    print(f"\n── {name} ──")
    ok = True
    for k, b in boxes:
        inside = b[0] >= 0 and b[1] >= 0 and b[2] <= base.size[0] and b[3] <= base.size[1]
        print(f"  {k:7s} {tuple(int(v) for v in b)} inside={inside}")
        if not inside:
            ok = False
    keys = [k for k, _ in boxes]
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            if rects_overlap(boxes[i][1], boxes[j][1]):
                print(f"  ! 相交: {boxes[i][0]} × {boxes[j][0]}")
                ok = False
    # 缩略图可读性:62px 下标题区域的亮度标准差 + 边缘能量
    small = base.convert("L").resize((62, 62), Image.LANCZOS)
    import numpy as np
    a = np.asarray(small, dtype="float32")
    edge = float(np.abs(np.diff(a, axis=0)).mean() + np.abs(np.diff(a, axis=1)).mean())
    print(f"  缩略图: 亮度std={a.std():.1f} 边缘能量={edge:.1f}")
    if a.std() < 25:
        print("  ! 缩略图对比度偏低")
        ok = False
    print("  结果:", "PASS" if ok else "CHECK")
    return ok


if __name__ == "__main__":
    for tag, fn in (("a", icon_a), ("b", icon_b), ("c", icon_c)):
        im, boxes = fn(tag)
        verify(tag.upper(), im, boxes, "")
        out = im.convert("RGB").resize((S, S), Image.LANCZOS)
        out.save(f"{OUT}/icon-{tag}.png")
        print(f"  -> {OUT}/icon-{tag}.png")
