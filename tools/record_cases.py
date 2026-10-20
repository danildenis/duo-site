"""
Видео кейсов: сайт клиента листает «человек» → media/cases/<slug>.mp4 (компьютер, 1920×1080)
и <slug>-m.mp4 (телефон, 1080×2208 — экран iPhone под строкой состояния, Full HD).

    uv run --with playwright --with imageio-ffmpeg python duo-site/tools/record_cases.py [slug ...]

Как снимаем: Chrome сам транслирует кадры экрана (Page.startScreencast) в полном разрешении,
а страницу листаем колесом мыши, как человек: рывок с разгоном и торможением, пауза «почитать»,
иногда немного назад. Кадры с отметками времени склеиваются в ровные 60 кадров в секунду.
Анимации сайтов — настоящие, в реальном времени.
Вкусный компромисс не опубликован — его адрес задаётся VKUSNY_URL (локальный просмотр).
"""
import base64
import os
import random
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
# окно (CSS-пиксели), плотность пикселей, итоговый размер видео
SIZES = {
    "": dict(view=(1920, 1080), dpr=1, out=(1920, 1080)),
    # экран iPhone 390×844 минус строка состояния 47 px — её рисует рамка телефона на сайте
    "-m": dict(view=(390, 797), dpr=3, out=(1080, 2208)),
}
FPS = 60


# Прокрутка идёт внутри страницы, кадр в кадр с экраном (requestAnimationFrame): из Python шаги приходили
# с задержкой и движение рвалось. План движений — рывки разной длины, паузы, изредка чуть назад —
# задаёт Python, чтобы у каждого сайта он был свой, но одинаковый при повторной записи.
HUMAN_JS = """
async ({ moves, first, last }) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(r));
  const ease = t => 1 - Math.pow(1 - t, 3);  // быстро начинаем, плавно тормозим
  const bottom = () => document.documentElement.scrollHeight - innerHeight;
  await sleep(first);
  let back = 0;
  for (const m of moves) {
    if (scrollY >= bottom() - 2) break;
    let dist = m.k * innerHeight;
    if (m.back && back < 2 && scrollY > innerHeight * 2) { dist = -dist * .45; back++; }
    const from = scrollY, to = Math.max(0, Math.min(bottom(), from + dist)), t0 = performance.now();
    for (;;) {
      const k = Math.min(1, (performance.now() - t0) / m.dur);
      scrollTo(0, from + (to - from) * ease(k));
      if (k >= 1) break;
      await frame();
    }
    await sleep(m.pause);
  }
  await sleep(last);
}
"""


def human_plan(seed: int, mobile: bool) -> dict:
    rnd = random.Random(seed)
    reach = 1.5 if mobile else 1.0  # пальцем листают крупнее, чем колесом
    moves = [dict(k=rnd.uniform(.55, .9) * reach, dur=rnd.uniform(650, 950), pause=rnd.uniform(900, 1700),
                  back=rnd.random() < .12) for _ in range(80)]
    return dict(moves=moves, first=1800, last=1500)


def record(browser, slug: str, url: str, suffix: str, cfg: dict) -> Path:
    tmp = Path(tempfile.mkdtemp())
    (w, h), dpr, (ow, oh) = cfg["view"], cfg["dpr"], cfg["out"]
    mobile = suffix == "-m"
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr,
                              is_mobile=mobile, has_touch=mobile, locale="ru-RU")
    page = ctx.new_page()
    page.goto(url, wait_until="networkidle")
    btn = page.get_by_role("button", name="Отказаться")  # плашка cookies — до начала записи
    try:
        btn.first.wait_for(state="visible", timeout=5000)
        btn.first.click()
    except Exception:
        pass
    page.wait_for_timeout(2500)  # заставка и анимации первого экрана

    frames: list[tuple[float, Path]] = []
    cdp = ctx.new_cdp_session(page)

    raw: list[str] = []

    def on_frame(ev):  # сначала подтверждаем кадр, файлы пишем потом — так Chrome не ждёт
        p = tmp / f"{len(frames):05d}.jpg"
        raw.append(ev["data"])
        frames.append((ev["metadata"]["timestamp"], p))
        try:
            cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]})
        except Exception:
            pass  # страница уже закрыта

    cdp.on("Page.screencastFrame", on_frame)
    cdp.send("Page.startScreencast", {"format": "jpeg", "quality": 92, "maxWidth": w * dpr, "maxHeight": h * dpr, "everyNthFrame": 1})
    page.wait_for_timeout(300)
    page.evaluate(HUMAN_JS, human_plan(sum(map(ord, slug)), mobile))
    cdp.send("Page.stopScreencast")
    ctx.close()
    for data, (_, p) in zip(raw, frames):
        p.write_bytes(base64.b64decode(data))

    # кадры приходят неравномерно — задаём каждому его настоящую длительность, ffmpeg выравнивает в 60 к/с
    lst = tmp / "list.txt"
    with lst.open("w") as f:
        for (t, p), (t2, _) in zip(frames, frames[1:] + [(frames[-1][0] + 1 / FPS, None)]):
            f.write(f"file '{p}'\nduration {max(t2 - t, 1 / FPS):.4f}\n")
        f.write(f"file '{frames[-1][1]}'\n")
    out = OUT / f"{slug}{suffix}.mp4"
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
                    "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-vf", f"scale={ow}:{oh}:flags=lanczos,fps={FPS}",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "24" if mobile else "21", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", "-an", str(out)], check=True)
    gaps = sorted(t2 - t for (t, _), (t2, _) in zip(frames, frames[1:]))
    moving = [g for g in gaps if g < .1]  # паузы «почитать» не считаем
    print(f"  кадров: {len(frames)} за {frames[-1][0] - frames[0][0]:.1f} с; при прокрутке ~{1 / (sum(moving) / len(moving)):.0f} к/с")
    shutil.rmtree(tmp, ignore_errors=True)
    return out


def main() -> None:
    args = sys.argv[1:]
    slugs = [a for a in args if a in SITES] or list(SITES)
    only = "-m" if "--phone" in args else "" if "--desktop" in args else None
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        for slug in slugs:
            for suffix, cfg in SIZES.items():
                if only is not None and suffix != only:
                    continue
                out = record(browser, slug, SITES[slug], suffix, cfg)
                print(f"✓ {out.name} — {out.stat().st_size // 1024} КБ")
        browser.close()


if __name__ == "__main__":
    main()
