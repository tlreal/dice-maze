# -*- coding: utf-8 -*-
"""生成 Lamps 上架用 512×512 图标(沿用游戏的黑金 d20 风格)"""
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_DIR = r"C:\Windows\Fonts"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    for cand in (rf"{FONT_DIR}\{name}", rf"{FONT_DIR}\msyh.ttc", rf"{FONT_DIR}\simhei.ttf"):
        try:
            return ImageFont.truetype(cand, size)
        except Exception:
            continue
    return ImageFont.load_default()


def hexagon(cx, cy, r):
    return [(cx + r * math.cos(math.radians(-90 + i * 60)), cy + r * math.sin(math.radians(-90 + i * 60))) for i in range(6)]


S = 512
img = Image.new("RGB", (S, S), (10, 7, 5))
d = ImageDraw.Draw(img)

# 径向暖光底
for i in range(S // 2, 0, -1):
    t = i / (S / 2)
    c = (int(12 + 62 * (1 - t) ** 1.6), int(8 + 40 * (1 - t) ** 1.6), int(5 + 22 * (1 - t) ** 1.6))
    d.ellipse([S / 2 - i, S / 2 - i, S / 2 + i, S / 2 + i], fill=c)

# 余烬
rnd = random.Random(11)
for _ in range(120):
    x, y = rnd.uniform(0, S), rnd.uniform(S * 0.15, S)
    r = rnd.uniform(0.8, 3.2)
    col = rnd.choice([(255, 150, 60), (255, 100, 45), (255, 200, 110)])
    d.ellipse([x - r, y - r, x + r, y + r], fill=col)

img = img.filter(ImageFilter.GaussianBlur(0.8))
d = ImageDraw.Draw(img)

# 金环
d.ellipse([S * 0.075, S * 0.075, S * 0.925, S * 0.925], outline=(120, 78, 30), width=6)

# d20
cx = cy = S / 2
R = S * 0.335
hexa = hexagon(cx, cy, R)
d.polygon(hexa, fill=(58, 36, 14), outline=(255, 210, 120), width=8)
inner = hexagon(cx, cy, R * 0.44)
for i in range(6):
    d.line([hexa[i], inner[(i + 1) % 6]], fill=(255, 210, 120), width=4)
d.polygon(inner, fill=(96, 62, 26), outline=(255, 214, 130), width=4)

# 数字 20
f = font("Bahnschrift Bold.ttf", int(S * 0.30))
text = "20"
bbox = d.textbbox((0, 0), text, font=f)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
d.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1] - S * 0.01), text, font=f, fill=(255, 236, 190))

# 暗角
mask = Image.new("L", (S, S), 0)
md = ImageDraw.Draw(mask)
md.ellipse([-S * 0.22, -S * 0.22, S * 1.22, S * 1.22], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(S / 5))
dark = Image.new("RGB", (S, S), (4, 2, 1))
img.paste(dark, (0, 0), mask.point(lambda v: int((255 - v) * 0.5)))

img.save("assets/icon-512.png")
print("icon-512.png OK", img.size)
