"""Draw the social-share images (1200x630) from the site's own fonts and photos.

    python scripts/og-image.py

Writes public/og.jpg (portfolio), articles/og.jpg and public/apple-touch-icon.png.
Needs Pillow, fontTools and brotli (to read the self-hosted .woff2 fonts).
"""
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules"
W, H = 1200, 630


def font(woff: Path, size: int, axes: dict | None = None) -> ImageFont.FreeTypeFont:
    tt = TTFont(woff)
    tt.flavor = None
    buf = BytesIO()
    tt.save(buf)
    buf.seek(0)
    f = ImageFont.truetype(buf, size)
    if axes:
        names = [a["name"] if isinstance(a["name"], str) else a["name"].decode() for a in f.get_variation_axes()]
        f.set_variation_by_axes([axes.get(n, axes.get(n.lower(), 0)) for n in names])
    return f


ARCHIVO = NM / "@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2"
MONO = NM / "@fontsource-variable/martian-mono/files/martian-mono-latin-standard-normal.woff2"
HAND = NM / "@fontsource/gochi-hand/files/gochi-hand-latin-400-normal.woff2"


def wdth_wght(f_path, size, wght, wdth):
    f = font(f_path, size)
    axes = f.get_variation_axes()
    vals = []
    for a in axes:
        n = a["name"] if isinstance(a["name"], str) else a["name"].decode()
        n = n.lower()
        vals.append(wdth if "width" in n or n == "wdth" else wght)
    f.set_variation_by_axes(vals)
    return f


def photo(name: str, w: int, h: int, sepia: bool = False) -> Image.Image:
    im = Image.open(ROOT / "public/img" / f"{name}.webp").convert("RGB")
    im = ImageOps.fit(im, (w, h), Image.LANCZOS)
    g = ImageOps.grayscale(im)
    g = ImageOps.autocontrast(g, cutoff=1)
    if sepia:
        return ImageOps.colorize(g, "#1a0d08", "#f1c79c")
    return g.convert("RGB")


def film(img: Image.Image, top: int, names: list[str], sepia: bool, circle: str | None):
    d = ImageDraw.Draw(img)
    base = (19, 17, 16)
    d.rectangle([0, top, W, H], fill=base)
    ground = img.getpixel((4, 4)) if not sepia else (58, 38, 30)
    for row in (top + 9, H - 21):
        for x in range(10, W, 30):
            d.rounded_rectangle([x, row, x + 14, row + 10], 2, fill=ground)
    fw, fh, gap = 300, 200, 18
    x = 44
    y = top + 34
    for i, n in enumerate(names):
        p = photo(n, fw, fh, sepia)
        if i == 0 and circle:
            p = Image.open(ROOT / "public/img" / f"{n}.webp").convert("RGB")
            p = ImageOps.fit(p, (fw, fh), Image.LANCZOS)
        img.paste(p, (x, y))
        x += fw + gap
    if circle:
        d.ellipse([28, y - 16, 44 + fw + 18, y + fh + 14], outline=circle, width=5)


def portfolio():
    img = Image.new("RGB", (W, H), "#e9ecea")
    d = ImageDraw.Draw(img)
    name = wdth_wght(ARCHIVO, 104, 820, 125)
    head = wdth_wght(ARCHIVO, 34, 500, 100)
    mono = font(MONO, 15)
    hand = font(HAND, 34)
    d.text((56, 44), "Reem Basho", font=name, fill="#121314")
    d.text((60, 168), "I question things, then I build something to find out.", font=head, fill="#121314")
    d.text((60, 222), "SOFTWARE DEVELOPER · AI RESEARCHER · RHU, LEBANON", font=mono, fill="#5b6164")
    d.text((880, 52), "Who's looking?", font=hand, fill="#1f43c7")
    film(img, 300, ["controlnet", "baraem", "catalog", "speech"], False, "#7fa2ff")
    img.save(ROOT / "public/og.jpg", quality=86, optimize=True)


def articles():
    img = Image.new("RGB", (W, H), "#170d0b")
    d = ImageDraw.Draw(img)
    title = wdth_wght(ARCHIVO, 92, 800, 118)
    sub = wdth_wght(ARCHIVO, 32, 450, 100)
    mono = font(MONO, 16)
    d.text((64, 70), "Field notes", font=title, fill="#f3dfcf")
    d.text((68, 190), "Development, AI research and the questions in between.", font=sub, fill="#dcbfa9")
    d.text((68, 250), "ARTICLES BY REEM BASHO", font=mono, fill="#ffc53d")
    film(img, 330, ["circuit", "stars", "books", "edges"], True, None)
    out = ROOT / "articles"
    out.mkdir(parents=True, exist_ok=True)
    img.save(out / "og.jpg", quality=86, optimize=True)


def touch_icon():
    """The favicon (a framed film negative with a grease-pencil loop) at 180px."""
    k = 180 / 32
    img = Image.new("RGB", (180, 180), "#131110")
    d = ImageDraw.Draw(img)
    for x in (4, 14, 24):
        for y in (3, 26):
            d.rounded_rectangle([x * k, y * k, (x + 4) * k, (y + 3) * k], k, fill="#e9ecea")
    d.rounded_rectangle([4 * k, 9 * k, 28 * k, 23 * k], k, fill="#e9ecea")
    d.ellipse([6.5 * k, 11 * k, 25.5 * k, 21.4 * k], outline="#1f43c7", width=round(1.6 * k))
    img.save(ROOT / "public/apple-touch-icon.png", optimize=True)


if __name__ == "__main__":
    portfolio()
    articles()
    touch_icon()
    print("wrote public/og.jpg, articles/og.jpg, public/apple-touch-icon.png")
