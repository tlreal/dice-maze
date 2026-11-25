# -*- coding: utf-8 -*-
"""
Lamps 上架图标(512×512)。对标榜单:大字标题 + 画面即内容 + 高对比。
标题用系统粗黑体做字形,再自己做「游戏标题特效」:
  斜切 → 金属竖向渐变(白→金→深金) → 多层厚描边 → 投影 → 高光。
全部程序化绘制,无外部素材。  用法: python -I scripts/gen_lamps_icons.py
"""
import math
import random
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_DIR = r"C:\Windows\Fonts"
OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "."
S = 512      # 输出尺寸
SS = 3       # 超采样倍数
W = S * SS

# 金属渐变(从上到下):白高光 → 亮金 → 金 → 深金
GOLD_STOPS = [(0.00, (255, 252, 236)), (0.22, (255, 232, 160)), (0.50, (255, 196, 77)),
              (0.74, (226, 150, 40)), (1.00, (170, 92, 18))]
CREAM_STOPS = [(0.00, (255, 255, 250)), (0.40, (255, 246, 222)), (1.00, (226, 200, 150))]


def font(name: str, size: int):
    for cand in (rf"{FONT_DIR}\{name}", rf"{FONT_DIR}\msyhbd.ttc", rf"{FONT_DIR}\simhei.ttf"):
        try:
            return ImageFont.truetype(cand, size)
        except Exception:
            continue
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size, stops, skew=0.18):
    """竖向渐变图;skew 让色带斜一点,更像金属反光"""
    w, h = size
    g = Image.new("RGB", (w, h))
    px = g.load()
    rows = []
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                k = (t - p0) / max(1e-6, p1 - p0)
                rows.append(lerp(c0, c1, k))
                break
        else:
            rows.append(stops[-1][1])
    for y in range(h):
        off = int((y - h / 2) * skew)
        for x in range(w):
            px[x, y] = rows[min(h - 1, max(0, y + (x - w // 2) * 0))] if off == 0 else rows[min(h - 1, max(0, y - off // 6))]
    return g


def radial_bg(w, h, inner, outer, cy=0.40, power=1.3):
    small = Image.new("RGB", (160, 160))
    px = small.load()
    for y in range(160):
        for x in range(160):
            t = min(1.0, math.hypot(x - 80, (y - 160 * cy) * 1.0) / (160 * 0.78)) ** power
            px[x, y] = lerp(inner, outer, t)
    return small.resize((w, h), Image.BICUBIC)


def glow(img, center, radius, color, strength=1.0, squash=0.92):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    n = 34
    for i in range(n, 0, -1):
        r = radius * i / n
        a = int(255 * strength * (1 - i / n) ** 1.7)
        d.ellipse([center[0] - r, center[1] - r * squash, center[0] + r, center[1] + r * squash], fill=color + (a,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.05))
    img.alpha_composite(layer)


def hex_pts(cx, cy, r, rot=-90):
    return [(cx + r * math.cos(math.radians(rot + i * 60)), cy + r * math.sin(math.radians(rot + i * 60))) for i in range(6)]


def draw_d20(size, R, num="20", rot=-90):
    """一枚立体感的金色 d20,返回 RGBA 图(中心在图中)"""
    n = int(R * 2.9)
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    cx = cy = n / 2
    d = ImageDraw.Draw(img)
    outer = hex_pts(cx, cy, R, rot)
    grad = gradient((n, n), GOLD_STOPS, skew=0.0)
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).polygon(outer, fill=255)
    # 暗面
    d.polygon(outer, fill=(150, 78, 16, 255))
    d.polygon([outer[2], outer[3], outer[4]], fill=(196, 112, 24, 255))
    d.polygon([outer[4], outer[5], outer[0]], fill=(236, 164, 56, 255))
    d.polygon([outer[0], outer[1], outer[2]], fill=(255, 210, 120, 255))
    # 中心面(用渐变)
    inner = hex_pts(cx, cy, R * 0.47, rot)
    face = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    fm = Image.new("L", (n, n), 0)
    ImageDraw.Draw(fm).polygon(inner, fill=255)
    face.paste(grad, (0, 0), fm)
    img.alpha_composite(face)
    d = ImageDraw.Draw(img)
    lw = max(3, int(R * 0.05))
    for i in range(6):
        d.line([outer[i], inner[(i + 1) % 6]], fill=(255, 240, 200, 255), width=lw)
    d.polygon(inner, outline=(255, 244, 214, 255), width=lw)
    d.polygon(outer, outline=(110, 52, 8, 255), width=int(lw * 1.25))
    d.polygon(outer, outline=(255, 236, 190, 255), width=max(2, lw - 2))
    f = font("Bahnschrift Bold.ttf", int(R * 0.74))
    d.text((cx, cy + R * 0.03), num, font=f, fill=(96, 44, 6, 255), anchor="mm")
    d.text((cx, cy + R * 0.03 - R * 0.03), num, font=f, fill=(58, 26, 4, 255), anchor="mm")
    return img


def title(text, f, grad_stops, outline, width, slant=0.0, spacing=0):
    """带描边和渐变的标题字(逐字绘制,可加字距与斜切)"""
    pad = width * 3 + 20
    boxes = [f.getbbox(ch) for ch in text]
    adv = []
    for ch in text:
        adv.append(f.getlength(ch) + spacing)
    total_w = int(sum(adv)) + pad * 2
    asc, desc = f.getmetrics()
    total_h = asc + desc + pad * 2
    # 字形遮罩
    mask = Image.new("L", (total_w, total_h), 0)
    md = ImageDraw.Draw(mask)
    x = pad
    for ch, a in zip(text, adv):
        md.text((x, pad), ch, font=f, fill=255)
        x += a
    if slant:
        mask = mask.transform((total_w + int(total_h * slant), total_h), Image.AFFINE,
                              (1, slant, -slant * total_h, 0, 1, 0), resample=Image.BICUBIC)
        total_w = mask.size[0]
    # 多层描边:由外向内收缩,形成深→浅的立体边缘
    out = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    for k in range(width, 0, -1):
        m = mask.filter(ImageFilter.MaxFilter(k * 2 + 1))
        shade = lerp(outline[1], outline[0], (k - 1) / max(1, width - 1))
        out.paste(shade + (255,), (0, 0), m)
    grad = gradient((total_w, total_h), grad_stops, skew=0.0)
    out.paste(grad, (0, 0), mask)
    # 顶部高光
    hi = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    hi.paste((255, 255, 255, 110), (0, 0), mask)
    hi = hi.crop((0, 0, total_w, int(total_h * 0.34)))
    hm = mask.crop((0, 0, total_w, int(total_h * 0.34)))
    out.paste((255, 255, 255, 120), (0, 0), hm.point(lambda v: v * 90 // 255))
    return out, mask


def paste_center(base, layer, cx, cy, anchor='mm'):
    x = int(cx - layer.size[0] / 2)
    y = int(cy - layer.size[1] / 2) if anchor == 'mm' else int(cy - layer.size[1])
    base.alpha_composite(layer, (x, y))
    return x, y


def pill(d, box, radius, fill, outline=None, lw=0):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=lw)


# ═══════════════════════ 图标 A:标题为主 ═══════════════════════
def icon_a():
    base = radial_bg(W, W, (150, 62, 14), (26, 9, 4), cy=0.36).convert("RGBA")
    glow(base, (W * 0.50, W * 0.40), W * 0.56, (255, 150, 50), 0.50)
    d = ImageDraw.Draw(base)
    rnd = random.Random(11)
    for _ in range(64):
        x, y = rnd.uniform(0, W), rnd.uniform(W * 0.40, W)
        r = rnd.uniform(3, 10) * SS / 3
        d.ellipse([x - r, y - r, x + r, y + r], fill=rnd.choice([(255, 170, 80), (255, 110, 50), (255, 220, 140)]) + (220,))
    # 主标题:两行,斜切,占画面 55%
    f = font("msyhbd.ttc", int(W * 0.335))
    t1, m1 = title("骰运", f, CREAM_STOPS, ((44, 14, 4), (150, 70, 14)), int(W * 0.028), slant=-0.13, spacing=int(W * 0.012))
    t2, m2 = title("迷城", f, GOLD_STOPS, ((44, 14, 4), (150, 70, 14)), int(W * 0.028), slant=-0.13, spacing=int(W * 0.012))
    # 投影
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 170), (0, 0), Image.new("L", base.size, 0))
    for t, cx, cy in ((t1, W * 0.44, W * 0.285), (t2, W * 0.47, W * 0.575)):
        shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
        alpha = t.split()[3].point(lambda v: int(v * 0.62))
        shadow.paste((40, 8, 0, 255), (0, 0), alpha)
        shadow = shadow.filter(ImageFilter.GaussianBlur(W * 0.012))
        paste_center(base, shadow, cx + W * 0.014, cy + W * 0.026)
        paste_center(base, t, cx, cy)
    # d20 放右下,只露出 2/3,不压字
    die = draw_d20(W, R=W * 0.155, rot=-78)
    base.alpha_composite(die.rotate(-18, resample=Image.BICUBIC), (int(W * 0.665), int(W * 0.605)))
    d = ImageDraw.Draw(base)
    # 顶部卖点胶囊
    f_top = font("msyhbd.ttc", int(W * 0.083))
    tw = d.textlength("DND跑团 · 掷骰肉鸽", font=f_top)
    bx0 = (W - tw) / 2 - W * 0.062
    pill(d, [bx0, W * 0.068, W - bx0, W * 0.196], int(W * 0.064), (255, 236, 196, 255))
    d.text((W / 2, W * 0.132 + W * 0.004), "DND跑团 · 掷骰肉鸽", font=f_top, fill=(140, 48, 8, 255), anchor="mm")
    return base


# ═══════════════════════ 图标 B:骰子为主 ═══════════════════════
def icon_b():
    base = radial_bg(W, W, (86, 30, 10), (20, 7, 4), cy=0.42).convert("RGBA")
    glow(base, (W * 0.50, W * 0.43), W * 0.58, (255, 170, 60), 0.65)
    d = ImageDraw.Draw(base)
    # 放射光
    for i in range(36):
        a = math.radians(i * 10 + 5)
        r0, r1 = W * 0.255, W * (0.58 if i % 2 else 0.70)
        d.polygon([(W * 0.5 + math.cos(a - 0.022) * r0, W * 0.43 + math.sin(a - 0.022) * r0),
                   (W * 0.5 + math.cos(a + 0.022) * r0, W * 0.43 + math.sin(a + 0.022) * r0),
                   (W * 0.5 + math.cos(a) * r1, W * 0.43 + math.sin(a) * r1)], fill=(255, 190, 90, 46))
    # 大骰子
    die = draw_d20(W, R=W * 0.205, rot=-74)
    die = die.rotate(-12, resample=Image.BICUBIC)
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh.paste((30, 6, 0, 170), (int(W * 0.30), int(W * 0.26)), die.split()[3])
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(W * 0.016)))
    paste_center(base, die, W * 0.50, W * 0.43)
    # 底部标题条
    d = ImageDraw.Draw(base)
    d.rounded_rectangle([W * 0.045, W * 0.705, W * 0.955, W * 0.955], radius=int(W * 0.07), fill=(28, 10, 6, 236), outline=(255, 214, 130, 255), width=int(W * 0.016))
    f = font("msyhbd.ttc", int(W * 0.19))
    t, _ = title("骰运迷城", f, GOLD_STOPS, ((44, 14, 4), (150, 70, 14)), int(W * 0.024), slant=-0.10, spacing=int(W * 0.004))
    paste_center(base, t, W * 0.50, W * 0.832)
    # 顶部胶囊
    d = ImageDraw.Draw(base)
    f_top = font("msyhbd.ttc", int(W * 0.078))
    tw = d.textlength("DND跑团 · 四个结局", font=f_top)
    bx0 = (W - tw) / 2 - W * 0.058
    pill(d, [bx0, W * 0.055, W - bx0, W * 0.172], int(W * 0.058), (255, 236, 196, 255))
    d.text((W / 2, W * 0.114 + W * 0.004), "DND跑团 · 四个结局", font=f_top, fill=(140, 48, 8, 255), anchor="mm")
    return base


# ═══════════════════════ 图标 C:门 + 王座剪影(游戏画面) ═══════════════════════
def icon_c():
    base = radial_bg(W, W, (196, 74, 22), (28, 8, 6), cy=0.50, power=1.6).convert("RGBA")
    glow(base, (W * 0.50, W * 0.56), W * 0.36, (255, 190, 90), 0.85)
    d = ImageDraw.Draw(base)
    # 迷城巨门:两扇黑石门虚掩,缝里透出烬光
    d.polygon([(W * 0.06, W * 0.98), (W * 0.06, W * 0.20), (W * 0.18, W * 0.04), (W * 0.82, W * 0.04), (W * 0.94, W * 0.20), (W * 0.94, W * 0.98)], fill=(14, 7, 5, 255))
    d.polygon([(W * 0.13, W * 0.98), (W * 0.13, W * 0.23), (W * 0.22, W * 0.10), (W * 0.47, W * 0.10), (W * 0.47, W * 0.98)], fill=(26, 13, 9, 255))
    d.polygon([(W * 0.87, W * 0.98), (W * 0.87, W * 0.23), (W * 0.78, W * 0.10), (W * 0.53, W * 0.10), (W * 0.53, W * 0.98)], fill=(22, 11, 8, 255))
    # 门缝光
    d.polygon([(W * 0.47, W * 0.10), (W * 0.53, W * 0.10), (W * 0.585, W * 0.98), (W * 0.415, W * 0.98)], fill=(255, 150, 60, 255))
    d.polygon([(W * 0.488, W * 0.10), (W * 0.512, W * 0.10), (W * 0.545, W * 0.98), (W * 0.455, W * 0.98)], fill=(255, 236, 180, 255))
    glow(base, (W * 0.50, W * 0.72), W * 0.26, (255, 170, 70), 0.9, squash=0.55)
    # 冒险者剪影(背对,站在门前)
    d = ImageDraw.Draw(base)
    cx, gy = W * 0.50, W * 0.70
    hh = W * 0.30
    d.ellipse([cx - hh * 0.13, gy - hh * 0.98, cx + hh * 0.13, gy - hh * 0.72], fill=(8, 4, 3, 255))
    d.polygon([(cx - hh * 0.26, gy - hh * 0.72), (cx + hh * 0.26, gy - hh * 0.72), (cx + hh * 0.20, gy - hh * 0.05), (cx - hh * 0.20, gy - hh * 0.05)], fill=(8, 4, 3, 255))
    d.polygon([(cx - hh * 0.13, gy - hh * 0.08), (cx - hh * 0.04, gy - hh * 0.08), (cx - hh * 0.07, gy), (cx - hh * 0.17, gy)], fill=(8, 4, 3, 255))
    d.polygon([(cx + hh * 0.04, gy - hh * 0.08), (cx + hh * 0.13, gy - hh * 0.08), (cx + hh * 0.17, gy), (cx + hh * 0.07, gy)], fill=(8, 4, 3, 255))
    # 剑
    d.line([(cx + hh * 0.27, gy - hh * 0.70), (cx + hh * 0.40, gy - hh * 0.02)], fill=(255, 236, 190, 255), width=int(W * 0.016))
    # 底部渐变 + 标题
    band = Image.new("RGBA", (W, int(W * 0.42)), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    for y in range(band.size[1]):
        a = int(215 * (y / band.size[1]) ** 0.7)
        bd.line([(0, y), (W, y)], fill=(14, 6, 4, a))
    base.alpha_composite(band, (0, int(W * 0.58)))
    f = font("msyhbd.ttc", int(W * 0.215))
    t, _ = title("骰运迷城", f, GOLD_STOPS, ((44, 14, 4), (150, 70, 14)), int(W * 0.027), slant=-0.11, spacing=int(W * 0.004))
    paste_center(base, t, W * 0.50, W * 0.835)
    # 顶部胶囊
    d = ImageDraw.Draw(base)
    f_top = font("msyhbd.ttc", int(W * 0.08))
    tw = d.textlength("DND跑团 · 掷骰肉鸽", font=f_top)
    bx0 = (W - tw) / 2 - W * 0.060
    pill(d, [bx0, W * 0.048, W - bx0, W * 0.170], int(W * 0.061), (255, 236, 196, 255))
    d.text((W / 2, W * 0.109 + W * 0.004), "DND跑团 · 掷骰肉鸽", font=f_top, fill=(140, 48, 8, 255), anchor="mm")
    return base


if __name__ == "__main__":
    for name, fn in (("a", icon_a), ("b", icon_b), ("c", icon_c)):
        im = fn().convert("RGB").resize((S, S), Image.LANCZOS)
        im.save(f"{OUT_DIR}/icon-{name}.png")
        print(f"icon-{name}.png", im.size)
