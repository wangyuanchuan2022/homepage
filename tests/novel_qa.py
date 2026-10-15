# -*- coding: utf-8 -*-
"""Novel section E2E acceptance: shelf / chapter reading / TOC / dialogue breaks / 404 / blog regression / mobile.
Run (after a production build): python -X utf8 tests/novel_qa.py
ASCII output only.
"""
import sys
import os
import re

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "dist-single", "index.html")
OUT = os.path.join(ROOT, "qa")
os.makedirs(OUT, exist_ok=True)
URL = "file:///" + TARGET.replace("\\", "/")

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(f"[{'OK' if ok else 'FAIL'}] {name}" + (f" -- {detail}" if detail else ""))


# Expected word count computed from the source manuscript (same rule as novelsCore.ts:
# strip md heading markers, strip all whitespace, count the rest, punctuation included).
SRC = os.path.join(ROOT, "src", "content", "novels", "duanlian-ch01.md")
with open(SRC, "r", encoding="utf-8") as f:
    raw = f.read()
m = re.match(r"^---\n[\s\S]*?\n---\n", raw)
body = raw[m.end():] if m else raw
EXPECTED_WORDS = len(re.sub(r"\s+", "", re.sub(r"^#{1,6}\s+", "", body, flags=re.M)))
EXPECTED_FMT = f"{EXPECTED_WORDS:,}"
SECTION_TITLES = ["节1-配给照旧", "节2-锅不够分", "节3-三倍", "节4-一盏灯", "节5-照账", "节6-不动声色"]


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce", locale="zh-CN")
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        # ---- novel shelf ----
        page.goto(URL + "#/novel")
        page.wait_for_timeout(700)
        check("shelf: book title rendered", page.locator("#novel h3", has_text="断链").count() == 1)
        check("shelf: status badge", page.locator("#novel").inner_text().find("连载中") >= 0)
        rows = page.locator("#novel ul li a[href='#/novels/duanlian-ch01']")
        check("shelf: chapter row links to detail", rows.count() == 1)
        check("shelf: row shows chapter title", rows.first.inner_text().find("第一章") >= 0)
        check(
            "shelf: row word count matches source manuscript",
            rows.first.inner_text().find(EXPECTED_FMT) >= 0,
            f"expected {EXPECTED_FMT}",
        )
        nav_h = page.locator("header").bounding_box()["height"]
        h2_y = page.locator("#novel h2").bounding_box()["y"]
        check("shelf: heading clears fixed nav (no overlap)", h2_y >= nav_h, f"nav_h={nav_h:.0f} h2_y={h2_y:.0f}")
        page.screenshot(path=os.path.join(OUT, "novel-list.png"))

        # ---- desktop nav entry ----
        check("nav: desktop 小说 entry", page.locator("header nav a[href='#/novel']").first.is_visible())

        # ---- chapter reading page ----
        page.goto(URL + "#/novels/duanlian-ch01")
        page.wait_for_timeout(600)
        check("detail: h1 title", page.locator("article h1").inner_text().strip() == "第一章")
        check("detail: book title shown", page.locator("article").inner_text().find("《断链》") >= 0)
        check("detail: meta shows expected word count", page.locator("article").inner_text().find(EXPECTED_FMT) >= 0, EXPECTED_FMT)
        check("detail: six sections rendered", page.locator("article > section").count() == 6)
        h2_texts = page.locator(".post-md h2").all_inner_texts()
        check("detail: six section headings verbatim", h2_texts == SECTION_TITLES, str(h2_texts))
        body_text = page.locator("article").inner_text()
        check("detail: opening line present", body_text.find("围城第二十一天，卯时。") >= 0)
        check("detail: closing line present", body_text.find("还亮到后半夜。") >= 0)

        # dialogue: one utterance per line must stay separate lines (breaks renderer)
        para = page.locator(".post-md p", has_text="老赵。").first
        html = para.evaluate("el => el.innerHTML")
        check("detail: dialogue soft breaks preserved", html.count("<br") >= 5, html[:80])

        # TOC: six entries, first label correct, click scrolls
        toc_btns = page.locator("nav[aria-label='本章节目'] button")
        check("detail: TOC has six entries", toc_btns.count() == 6, str(toc_btns.count()))
        if toc_btns.count() == 6:
            check("detail: TOC first label", toc_btns.nth(0).inner_text().strip() == SECTION_TITLES[0])
            check("detail: TOC last label", toc_btns.nth(5).inner_text().strip() == SECTION_TITLES[5])
        before = page.evaluate("window.scrollY")
        toc_btns.last.click()
        page.wait_for_timeout(500)
        after = page.evaluate("window.scrollY")
        check("detail: TOC click scrolls to section", after > before + 200, f"{before:.0f} -> {after:.0f}")
        page.screenshot(path=os.path.join(OUT, "chapter-detail.png"), full_page=True)

        # prev/next: single chapter -> no prev, latest-chapter hint
        check("detail: no prev button on first chapter", page.locator("nav[aria-label='章节导航'] button", has_text="上一章").count() == 0)
        check("detail: latest-chapter hint", page.locator("nav[aria-label='章节导航']").inner_text().find("已是最新章节") >= 0)

        # ---- 404 route ----
        page.goto(URL + "#/novels/nope")
        page.wait_for_timeout(400)
        check("404: missing chapter message", page.locator("h1", has_text="章节不存在").count() == 1)
        page.click("text=返回书架")
        page.wait_for_timeout(400)
        check("404: back to shelf works", "#/novel" in page.url and page.locator("#novel h3").count() == 1)

        # ---- blog regression (markdown.ts refactor must not change blog rendering) ----
        page.goto(URL + "#/posts/hello-blog")
        page.wait_for_timeout(500)
        check(
            "blog regression: seed post renders",
            page.locator("article h1").inner_text().strip() == "博客上线 · 为什么这个博客用 Markdown"
            and page.locator(".post-md pre code").count() >= 1,
        )
        page.goto(URL + "#/blog")
        page.wait_for_timeout(400)
        check("blog regression: list still has 3 seed posts", page.locator("#blog ul li").count() == 3)

        # ---- mobile viewport: hamburger menu reaches the novel shelf ----
        merrors = []
        mctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", locale="zh-CN")
        mpage = mctx.new_page()
        mpage.on("pageerror", lambda e: merrors.append(str(e)))
        mpage.goto(URL + "#/")
        mpage.wait_for_timeout(600)
        menu_btn = mpage.locator("header button[aria-label='打开菜单']")
        check("mobile: hamburger visible", menu_btn.is_visible())
        menu_btn.click()
        mpage.wait_for_timeout(300)
        mpage.screenshot(path=os.path.join(OUT, "mobile-menu.png"))
        mobile_novel = mpage.locator("header a[href='#/novel']")
        check("mobile: 小说 entry in open menu", mobile_novel.count() >= 1 and mobile_novel.last.is_visible())
        mobile_novel.last.click()
        mpage.wait_for_timeout(700)
        check("mobile: navigated to shelf", "#/novel" in mpage.url, mpage.url)
        check("mobile: shelf rendered", mpage.locator("#novel ul li").count() == 1)
        check("mobile: menu collapsed after nav", mpage.locator("header button[aria-label='打开菜单']").is_visible())
        mpage.screenshot(path=os.path.join(OUT, "mobile-novel.png"), full_page=True)
        check("mobile: no js/console errors", len(merrors) == 0, "; ".join(merrors[:3]))
        mctx.close()

        check("global: no js/console errors", len(errors) == 0, "; ".join(errors[:3]))
        ctx.close()
        browser.close()

    fails = [r for r in results if not r[1]]
    print(f"\nSUMMARY: {len(results) - len(fails)}/{len(results)} passed")
    if fails:
        print("FAILED:", ", ".join(n for n, ok in fails if not ok))
        sys.exit(1)
    print("ALL-PASS")


if __name__ == "__main__":
    main()
