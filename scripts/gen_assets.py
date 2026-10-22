# -*- coding: utf-8 -*-
"""生成《骰运迷城》图标与封面(全程序化,无外部素材)"""
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

def hexagon(cx: float, cy: float, r: float) -> list:
    # 顶点朝上的六边形
    pts = []
    for i in range(6):
        a = math.radians(-90 + i * 60)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def draw_d20(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float,
             fill=(64, 42, 18), edge=(255, 214, 130), width=4, text="20"):
    hexa = hexagon(cx, cy, r)
    draw.polygon(hexa, fill=fill, outline=edge, width=max(2, width - 1))
    # 内部三角棱线(二十面体暗示)
    inner = hexagon(cx, cy, r * 0.42)
    for i in range(6):
        draw.line([hexa[i], inner[(i + 1) % 6]], fill=edge, width=max(1, width - 3))
    draw.polygon(inner, fill=(90, 60, 26), outline=edge, width=max(1, width - 3))
    # 中心数字
    f = font("Bahnschrift Bold.ttf", int(r * 0.66)) if text else None
    if f:
        bbox = draw.textbbox((0, 0), text, font=f)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1]), text, font=f, fill=(255, 236, 190))

def embers(img: Image.Image, n: int, seed: int, ymin: float = 0.0) -> None:
    rnd = random.Random(seed)
    d = ImageDraw.Draw(img)
    w, h = img.size
    for _ in range(n):
        x = rnd.uniform(0, w)
        y = rnd.uniform(h * ymin, h)
        r = rnd.uniform(0.8, 2.6)
        c = rnd.choice([(255, 150, 60), (255, 100, 45), (255, 200, 110)])
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)

def vignette(img: Image.Image, strength: float = 0.55) -> None:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([-w * 0.25, -h * 0.25, w * 1.25, h * 1.25], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) / 5))
    dark = Image.new("RGB", (w, h), (4, 2, 1))
    img.paste(dark, (0, 0), mask.point(lambda v: int((255 - v) * strength)))

# ─── 图标 200×200 ───
icon = Image.new("RGB", (200, 200), (13, 9, 6))
d = ImageDraw.Draw(icon)
# 径向底
for i in range(100, 0, -1):
    t = i / 100
    c = (int(13 + 50 * (1 - t)), int(9 + 34 * (1 - t)), int(6 + 20 * (1 - t)))
    d.ellipse([100 - i, 100 - i, 100 + i, 100 + i], fill=c)
embers(icon, 26, seed=7)
icon = icon.filter(ImageFilter.GaussianBlur(0.6))
draw_d20(ImageDraw.Draw(icon), 100, 100, 78, fill=(58, 36, 14), edge=(255, 210, 120), width=5, text="20")
vignette(icon, 0.5)
icon.save("assets/icon.png")
print("icon.png 200x200 OK")

# ─── 封面 510×272 ───
W, H = 510, 272
cov = Image.new("RGB", (W, H), (10, 7, 5))
d = ImageDraw.Draw(cov)
# 背景渐变(上暖下暗)
for y in range(H):
    t = y / H
    c = (int(30 - 18 * t), int(20 - 13 * t), int(13 - 9 * t))
    d.line([(0, y), (W, y)], fill=c)
# 底部地平线光
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([W * 0.18, H * 0.55, W * 0.82, H * 1.5], fill=(90, 40, 14))
glow = glow.filter(ImageFilter.GaussianBlur(48))
cov = Image.blend(cov, Image.composite(glow, Image.new("RGB", (W, H), (0, 0, 0)), Image.new("L", (W, H), 90)), 0.55)
embers(cov, 90, seed=42, ymin=0.25)
d = ImageDraw.Draw(cov)
# 左侧 d20
draw_d20(d, 118, 128, 74, fill=(64, 40, 16), edge=(255, 214, 130), width=5, text="20")
# 标题
f_big = font("simhei.ttf", 66)
title = "骰运迷城"
bbox = d.textbbox((0, 0), title, font=f_big)
tw = bbox[2] - bbox[0]
tx, ty = 212, 78
# 金色描边+阴影
d.text((tx + 3, ty + 4), title, font=f_big, fill=(120, 60, 16))
for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2)):
    d.text((tx + dx, ty + dy), title, font=f_big, fill=(90, 55, 20))
d.text((tx, ty), title, font=f_big, fill=(255, 216, 130))
# 副标题
f_sub = font("msyh.ttc", 22)
sub = "一场十五分钟的 DnD 跑团肉鸽"
bbox = d.textbbox((0, 0), sub, font=f_sub)
d.text((218 + (tw - (bbox[2] - bbox[0])) / 2, 168), sub, font=f_sub, fill=(214, 190, 150))
# 底部提示条
f_tip = font("Bahnschrift.ttf", 21)
tip = "d20 检定 · 云端排行"
bbox = d.textbbox((0, 0), tip, font=f_tip)
d.text((218 + (tw - (bbox[2] - bbox[0])) / 2, 202), tip, font=f_tip, fill=(190, 145, 85))
vignette(cov, 0.42)
cov.save("assets/cover.png")
print("cover.png 510x272 OK")
