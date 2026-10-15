# -*- coding: utf-8 -*-
"""Visual QA for wangyuanchuan2022 homepage.

Captures desktop/mobile full-page screenshots and runs deterministic DOM checks.
Run: python -X utf8 tests/capture_qa.py
Output ASCII only (GBK console safe).
"""
import sys
import os

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "dist-single", "index.html")
OUT = os.path.join(ROOT, "qa")
os.makedirs(OUT, exist_ok=True)

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(f"[{'OK' if ok else 'FAIL'}] {name}" + (f" -- {detail}" if detail else ""))


def probe_overflow(page):
    return page.evaluate(
        "() => document.scrollingElement.scrollWidth - document.documentElement.clientWidth"
    )


def main():
    url = "file:///" + TARGET.replace("\\", "/")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ---- Desktop, reduced motion (instant final state) ----
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            reduced_motion="reduce",
            locale="zh-CN",
        )
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.goto(url)
        page.wait_for_timeout(1200)

        check("desktop: page title", "wangyuanchuan2022" in page.title())
        for sel in ["#about", "#skills", "#projects", "#contact"]:
            check(f"desktop: section {sel} present", page.locator(sel).count() == 1)
        check(
            "desktop: hero terminal lines rendered",
            "mission.txt" in page.locator("#top").inner_text(),
        )
        check(
            "desktop: featured projects rendered",
            page.get_by_text("guji").count() >= 1 and page.get_by_text("code2course").count() >= 1,
        )
        ovf = probe_overflow(page)
        check("desktop: no horizontal overflow", ovf <= 0, f"overflow_px={ovf}")
        check("desktop: no js/console errors", len(errors) == 0, "; ".join(errors[:3]))

        page.screenshot(path=os.path.join(OUT, "desktop-full.png"), full_page=True)
        page.screenshot(path=os.path.join(OUT, "desktop-hero.png"))
        ctx.close()

        # ---- Mobile 390x844 ----
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            reduced_motion="reduce",
            locale="zh-CN",
            is_mobile=True,
            has_touch=True,
            device_scale_factor=2,
        )
        page = ctx.new_page()
        page.goto(url)
        page.wait_for_timeout(1000)
        ovf = probe_overflow(page)
        check("mobile: no horizontal overflow", ovf <= 0, f"overflow_px={ovf}")
        check(
            "mobile: hero name visible",
            page.locator('[data-edit-id="hero-name"]').is_visible(),
        )
        page.screenshot(path=os.path.join(OUT, "mobile-full.png"), full_page=True)
        page.screenshot(path=os.path.join(OUT, "mobile-hero.png"))
        ctx.close()

        # ---- Animated mode: terminal typewriter progresses ----
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN")
        page = ctx.new_page()
        page.goto(url)
        page.wait_for_timeout(2500)
        mid = page.locator("#top").inner_text()
        check("animated: typing started by 2.5s", "whoami" in mid or "$" in mid)
        page.wait_for_timeout(8000)
        end = page.locator("#top").inner_text()
        check(
            "animated: full script finished by 10.5s",
            ("mission.txt" in end) and ("repos | wc -l" in end),
        )
        page.screenshot(path=os.path.join(OUT, "desktop-hero-animated.png"))
        ctx.close()
        browser.close()

    fails = [r for r in results if not r[1]]
    print(f"\nSUMMARY: {len(results) - len(fails)}/{len(results)} passed")
    if fails:
        print("FAILED:", ", ".join(r[0] for r in fails))
        sys.exit(1)
    print("ALL-PASS")


if __name__ == "__main__":
    main()
