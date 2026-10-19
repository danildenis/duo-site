"""
Видео кейсов: плавная прокрутка сайтов клиентов → media/cases/<slug>.mp4 (и мобильная версия <slug>-m.mp4).

    uv run --with playwright --with imageio-ffmpeg python duo-site/tools/record_cases.py [slug ...]

Сайт пишется в реальном времени (видео Playwright), затем перекодируется в H.264.
Анимации сайтов — настоящие: что происходит при прокрутке у клиента, то и в видео.
Вкусный компромисс не опубликован — его адрес задаётся VKUSNY_URL (локальный просмотр).
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "media" / "cases"
SITES = {
    "car-export": "https://carrexport.ru/",
    "ksenia": "https://subbotina-perm.ru/",
    "vkusny": os.environ.get("VKUSNY_URL", "http://127.0.0.1:5199/"),
}
SIZES = {"": (1440, 900), "-m": (390, 844)}
# сколько секунд срезать в начале: пока сайт грузится, кадр пустой
TRIM = {"car-export": 2.0}

# Прокрутка по остановкам: доля высоты страницы и пауза на ней. Плавность — ease-in-out.
SCROLL_JS = """
async ({ stops, pause, travel }) => {
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const max = () => document.documentElement.scrollHeight - innerHeight;
  for (const f of stops) {
    const from = scrollY, to = Math.round(max() * f), t0 = performance.now();
    await new Promise(done => {
      const step = now => {
        const k = Math.min(1, (now - t0) / travel);
        scrollTo(0, from + (to - from) * ease(k));
        k < 1 ? requestAnimationFrame(step) : done();
      };
      requestAnimationFrame(step);
    });
    await sleep(pause);
  }
}
"""


def record(browser, slug: str, url: str, suffix: str, size: tuple[int, int]) -> Path:
    tmp = Path(tempfile.mkdtemp())
    w, h = size
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                              record_video_dir=str(tmp), record_video_size={"width": w, "height": h},
                              is_mobile=suffix == "-m", has_touch=suffix == "-m", locale="ru-RU")
    page = ctx.new_page()
    page.goto(url, wait_until="networkidle")
    # плашка cookies: отказываемся — так она не закрывает сайт в видео
    for text in ("Отказаться", "Только необходимые"):
        btn = page.get_by_role("button", name=text)
        if btn.count():
            btn.first.click()
            break
    page.wait_for_timeout(2600)  # первый экран и его анимации
    stops = [0.14, 0.3, 0.46, 0.62, 0.8, 1.0]
    page.evaluate(SCROLL_JS, {"stops": stops, "pause": 900, "travel": 1500})
    page.wait_for_timeout(600)
    video = page.video.path()
    ctx.close()
    out = OUT / f"{slug}{suffix}.mp4"
    # обрезаем начало (белый экран до загрузки) и кодируем в H.264
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
                    "-ss", str(TRIM.get(slug, 0.6)), "-i", str(video), "-c:v", "libx264", "-preset", "slow", "-crf", "22",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-r", "30", str(out)], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    return out


def main() -> None:
    slugs = sys.argv[1:] or list(SITES)
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        for slug in slugs:
            for suffix, size in SIZES.items():
                out = record(browser, slug, SITES[slug], suffix, size)
                print(f"✓ {out.name} — {out.stat().st_size // 1024} КБ")
        browser.close()


if __name__ == "__main__":
    main()
