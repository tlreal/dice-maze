# -*- coding: utf-8 -*-
"""把用户提供的图标图处理成平台规格(1:1, 512/1024),并生成「加标题」版本。

用法: python -I scripts/prepare_user_icon.py <输入png> <输出前缀>
输出: <前缀>-plain.png / <前缀>-titled.png (1024) 与 -512 版本
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_lamps_icons_v2 import GOLD, title_layer  # noqa: E402


def square(im: Image.Image) -> Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    s = min(w, h)
    return im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))


def add_title(base: Image.Image, cy_frac=0.855, width_frac=0.82) -> Image.Image:
    S = base.size[0]
    im = base.convert("RGBA").copy()
    # 底部暗带:保证标题在任意背景上都读得出来
    h = int(S * 0.42)
    band = Image.new("RGBA", (S, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    for y in range(h):
        a = int(215 * (y / h) ** 0.55)
        d.line([(0, y), (S, y)], fill=(8, 4, 2, a))
    im.alpha_composite(band, (0, S - h))

    size = int(S * 0.20)
    while size > 40:
        layer, _ = title_layer("骰运迷城", size, GOLD, spacing=0.006)
        bb = layer.getbbox()
        if (bb[2] - bb[0]) <= S * width_frac:
            break
        size -= 4
    bb = layer.getbbox()
    lw, lh = bb[2] - bb[0], bb[3] - bb[1]
    x = int(S / 2 - lw / 2 - bb[0])
    y = int(S * cy_frac - lh / 2 - bb[1])
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 210), (x + 5, y + 11), layer.split()[3])
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(max(2, S // 90))))
    im.alpha_composite(layer, (x, y))
    return im.convert("RGB")


def save(im: Image.Image, path: str) -> None:
    im.save(path, optimize=True)
    print("%-42s %6.0f KB" % (os.path.basename(path), os.path.getsize(path) / 1024))


def main() -> None:
    src = sys.argv[1]
    prefix = sys.argv[2]
    im = square(Image.open(src))
    big = im.resize((1024, 1024), Image.LANCZOS)
    plain = big.copy()
    titled = add_title(big)
    save(plain, f"{prefix}-plain.png")
    save(plain.resize((512, 512), Image.LANCZOS), f"{prefix}-plain-512.png")
    save(titled, f"{prefix}-titled.png")
    save(titled.resize((512, 512), Image.LANCZOS), f"{prefix}-titled-512.png")

    import numpy as np
    for name, img in (("plain", plain), ("titled", titled)):
        sm = np.asarray(img.resize((62, 62), Image.LANCZOS).convert("L"), dtype="float32")
        print("%-8s 62px std %.1f edge %.1f" % (
            name, sm.std(), np.abs(np.diff(sm, axis=0)).mean() + np.abs(np.diff(sm, axis=1)).mean()))


if __name__ == "__main__":
    main()
