"""
Сайты кейсов целиком: снимок всей страницы → img/cases/<slug>-N.jpg (компьютер) и <slug>-m-N.jpg (телефон).
В кейсе снимок листается внутри рамки ноутбука или телефона. Живой сайт встроить нельзя:
carrexport.ru и subbotina-perm.ru запрещают показ в чужой рамке (X-Frame-Options: DENY).

    uv run --with playwright --with pillow python duo-site/tools/shoot_cases.py [slug ...]

Вкусный компромисс не опубликован — адрес задаётся VKUSNY_URL (локальный просмотр).
"""
import io
import os
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "img" / "cases"
SITES = {
    "car-export": "https://carrexport.ru/",
    "ksenia": "https://subbotina-perm.ru/",
    "vkusny": os.environ.get("VKUSNY_URL", "http://127.0.0.1:5199/"),
}
# ширина окна, плотность пикселей, ширина итоговой картинки
SIZES = {"": (1440, 900, 1, 1440), "-m": (390, 844, 2, 780)}
MAX_H = 8000  # высокие картинки режем: браузеры плохо держат JPEG выше ~16 тыс. пикселей

# Снимаем экран за экраном и склеиваем: целиковый снимок ломает блоки высотой в экран и анимации прокрутки.
# После первого кадра прячем закреплённую шапку и кнопки, иначе они повторялись бы на каждом экране.
HIDE_FIXED_JS = """
() => { for (const el of document.querySelectorAll('body *')) {
  // только мелкое закреплённое (шапка, плавающие кнопки); крупное — это сцены прокрутки, их оставляем
  if (['fixed', 'sticky'].includes(getComputedStyle(el).position) && el.getBoundingClientRect().height < innerHeight * .4)
    el.style.setProperty('visibility', 'hidden', 'important');
} }
"""


def shoot(browser, slug: str, url: str, suffix: str, size) -> list[Path]:
    w, h, dpr, out_w = size
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr,
                              is_mobile=suffix == "-m", has_touch=suffix == "-m", locale="ru-RU")
    page = ctx.new_page()
    page.goto(url, wait_until="networkidle")
    btn = page.get_by_role("button", name="Отказаться")  # плашка cookies
    try:
        btn.first.wait_for(state="visible", timeout=5000)
        btn.first.click()
    except Exception:
        pass
    page.wait_for_timeout(2500)
    frames, y = [], 0
    while True:
        page.evaluate(f"scrollTo(0, {y})")
        page.wait_for_timeout(900)
        real = page.evaluate("scrollY")
        frames.append((real, Image.open(io.BytesIO(page.screenshot())).convert("RGB")))
        if y == 0:
            page.evaluate(HIDE_FIXED_JS)
        total = page.evaluate("document.documentElement.scrollHeight")
        if real + h >= total or len(frames) > 120:
            break
        y = real + h // 2
    ctx.close()
    # шаг — полэкрана, от кадра берём верхнюю половину: внизу экрана блоки ещё доезжают анимацией.
    # Последний кадр — целиком.
    full = Image.new("RGB", (w * dpr, (frames[-1][0] + h) * dpr))
    for i, (real, im) in enumerate(frames):
        part = im if i == len(frames) - 1 else im.crop((0, 0, im.width, (h // 2) * dpr))
        full.paste(part, (0, real * dpr))
    img = full
    if img.width != out_w:
        img = img.resize((out_w, round(img.height * out_w / img.width)), Image.LANCZOS)
    # длинную страницу режем на части <slug><suffix>-1.jpg, -2.jpg… — в кейсе они идут подряд
    for old in OUT.glob(f"{slug}{suffix}-[0-9]*.jpg"):
        old.unlink()
    parts = []
    for i, top in enumerate(range(0, img.height, MAX_H), 1):
        out = OUT / f"{slug}{suffix}-{i}.jpg"
        img.crop((0, top, img.width, min(img.height, top + MAX_H))).save(out, "JPEG", quality=72, optimize=True, progressive=True)
        parts.append(out)
    return parts


def main() -> None:
    slugs = sys.argv[1:] or list(SITES)
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        for slug in slugs:
            for suffix, size in SIZES.items():
                for out in shoot(browser, slug, SITES[slug], suffix, size):
                    with Image.open(out) as im:
                        print(f"✓ {out.name} — {im.width}×{im.height}, {out.stat().st_size // 1024} КБ")
        browser.close()


if __name__ == "__main__":
    main()
