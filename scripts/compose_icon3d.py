# -*- coding: utf-8 -*-
"""把 3D 底图与金属标题合成 1024 图标,并输出 512 版本。"""
import io
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_lamps_icons_v2 import GOLD, CREAM, title_layer, F  # noqa: E402

SRC = sys.argv[1] if len(sys.argv) > 1 else "../.lamps-work/icons3d/bare.png"
OUT = sys.argv[2] if len(sys.argv) > 2 else "../.lamps-work/icons3d/icon3d-title.png"
S = 1024


def soft_band(base, top_frac=0.62, alpha=205, color=(8, 3, 2)):
    h = int(S * (1 - top_frac))
    band = Image.new("RGBA", (S, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    for y in range(h):
        a = int(alpha * (y / h) ** 0.55)
        d.line([(0, y), (S, y)], fill=color + (a,))
    base.alpha_composite(band, (0, int(S * top_frac)))


def pill(d, cx, cy, text, fs):
    f = F("msyhbd.ttc", fs)
    tw = d.textlength(text, font=f)
    h = fs * 1.72
    box = [cx - tw / 2 - fs * 0.9, cy - h / 2, cx + tw / 2 + fs * 0.9, cy + h / 2]
    d.rounded_rectangle(box, radius=h / 2, fill=(255, 238, 200, 255))
    d.rounded_rectangle([box[0], box[1], box[2], box[3] - h * 0.18], radius=h / 2, fill=(255, 248, 224, 255))
    d.text((cx, cy + fs * 0.05), text, font=f, fill=(140, 46, 8, 255), anchor="mm")
    return tuple(box)


def main():
    im = Image.open(SRC).convert("RGBA")
    if im.size != (S, S):
        im = im.crop((0, 0, S, S))
    base = im.copy()
    soft_band(base)

    # 标题:按可用宽度自动缩放
    target_w = S * 0.80
    size = int(S * 0.20)
    while size > 40:
        layer, _ = title_layer("骰运迷城", size, GOLD, spacing=0.006)
        bb = layer.getbbox()
        if (bb[2] - bb[0]) <= target_w:
            break
        size -= 4
    bb = layer.getbbox()
    lw, lh = bb[2] - bb[0], bb[3] - bb[1]
    cx, cy = S / 2, S * 0.845
    x = int(cx - lw / 2 - bb[0])
    y = int(cy - lh / 2 - bb[1])
    # 投影
    sh = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 200), (x + 6, y + 12), layer.split()[3])
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    base.alpha_composite(layer, (x, y))

    d = ImageDraw.Draw(base)
    pill(d, S / 2, S * 0.098, "DND跑团 · 掷骰肉鸽", int(S * 0.066))

    out = base.convert("RGB")
    out.save(OUT)
    out.resize((512, 512), Image.LANCZOS).save(OUT.replace(".png", "-512.png"))
    print("saved", OUT, out.size)

    import numpy as np
    A = np.asarray(out, dtype="float32")
    r, g, b = A[:, :, 0], A[:, :, 1], A[:, :, 2]
    gold = ((r > 150) & (g > 90) & (b < 120) & (r > b * 1.5)).mean() * 100
    t = A[int(S * 0.76):int(S * 0.97), int(S * 0.06):int(S * 0.94)]
    tl = t.mean(axis=2)
    print("gold %.1f%% · title bright(>200) %.1f%%" % (gold, (tl > 200).mean() * 100))
    sm = out.resize((62, 62), Image.LANCZOS)
    g62 = np.asarray(sm.convert("L"), dtype="float32")
    print("62px std %.1f edge %.1f" % (g62.std(), np.abs(np.diff(g62, axis=0)).mean() + np.abs(np.diff(g62, axis=1)).mean()))


if __name__ == "__main__":
    main()
