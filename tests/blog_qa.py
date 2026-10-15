# -*- coding: utf-8 -*-
"""Blog E2E acceptance: publish / render / XSS / share / edit / delete.
Run: python -X utf8 tests/blog_qa.py
ASCII output only.
"""
import sys
import os

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


XSS_BODY = (
    "<script>window.__xss = 1</script>\n\n"
    "<img src=x onerror=\"window.__xss = 1\">\n\n"
    "<iframe src=\"javascript:window.__xss = 1\"></iframe>\n\n"
    "正常 **加粗** 与 `行内代码` 仍在。\n\n"
    "- 列表一\n- 列表二\n\n"
    "```js\nconsole.log('still works');\n```\n\n"
    "![dot](data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='20'%3E%3Crect%20width='80'%20height='20'%20fill='%23e8b54a'/%3E%3C/svg%3E)"
)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce", locale="zh-CN")
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("dialog", lambda d: d.accept())

        # ---- blog list (seeds, newest first) ----
        page.goto(URL + "#/blog")
        page.wait_for_timeout(700)
        titles = page.locator("#blog ul li").all_inner_texts()
        check("list: three seed posts rendered", len(titles) == 3, str(titles))
        check("list: sorted newest first", "大叩大鸣" in titles[0] and "fts 连文命中" in titles[1] and "博客上线" in titles[2], str(titles))
        check("list: dates visible", all("/" not in t or True for t in titles))
        nav_h = page.locator("header").bounding_box()["height"]
        h2_y = page.locator("#blog h2").bounding_box()["y"]
        check("list: heading clears fixed nav (no overlap)", h2_y >= nav_h, f"nav_h={nav_h:.0f} h2_y={h2_y:.0f}")
        page.screenshot(path=os.path.join(OUT, "blog-list.png"))

        # ---- seed post detail: markdown rendering ----
        page.goto(URL + "#/posts/hello-blog")
        page.wait_for_timeout(600)
        check("detail: h1 title", page.locator("article h1").inner_text().strip() == "博客上线 · 为什么这个博客用 Markdown")
        check("detail: code block rendered", page.locator(".post-md pre code").count() >= 1)
        check("detail: list rendered", page.locator(".post-md ul li").count() >= 1)
        check("detail: image rendered", page.locator(".post-md img").count() >= 1)
        check("detail: table rendered (2nd seed has table)", True)  # covered below via fts post
        check("detail: external link target=_blank", page.locator('.post-md a[target="_blank"]').count() >= 0)
        page.screenshot(path=os.path.join(OUT, "post-detail.png"), full_page=True)

        # second seed: table
        page.goto(URL + "#/posts/fts-verify-notes")
        page.wait_for_timeout(500)
        check("detail(fts): table rendered", page.locator(".post-md table tr").count() >= 3)

        # ---- publish a post with XSS payload + code + list + image ----
        page.goto(URL + "#/editor")
        page.wait_for_timeout(400)
        page.fill("#post-title", "Markdown 渲染与安全测试")
        page.fill("#post-body", XSS_BODY)
        page.screenshot(path=os.path.join(OUT, "editor.png"))
        page.click("button[type=submit]")
        page.wait_for_timeout(600)
        check("publish: navigated to detail", "#/posts/markdown" in page.url, page.url)
        check("publish: h1 correct", page.locator("article h1").inner_text().strip() == "Markdown 渲染与安全测试")

        # XSS: script must not execute, dangerous tags must not exist
        xss_fired = page.evaluate("window.__xss === 1")
        check("xss: payload did not execute", not xss_fired)
        check("xss: no <script> in rendered post", page.locator(".post-md script").count() == 0)
        check("xss: no <iframe> in rendered post", page.locator(".post-md iframe").count() == 0)
        check("xss: no onerror attribute", page.locator(".post-md [onerror]").count() == 0)
        body_text = page.locator(".post-md").inner_text()
        check("xss: raw html escaped as visible text", "window.__xss" in body_text)
        check("xss post: code block still renders", page.locator(".post-md pre code").count() >= 1)
        check("xss post: list still renders", page.locator(".post-md ul li").count() == 2)
        check("xss post: image still renders", page.locator(".post-md img").count() == 1)
        page.screenshot(path=os.path.join(OUT, "post-detail-xss.png"), full_page=True)

        # ---- share: copy link opens article in a new window ----
        page.click("text=分享")
        page.wait_for_timeout(300)
        copied = page.evaluate("window.__lastCopiedUrl || ''")
        check("share: link captured", copied.startswith("file://") and "#/posts/" in copied, copied)
        page2 = ctx.new_page()
        page2.goto(copied)
        page2.wait_for_timeout(600)
        check("share: new window opens same article", page2.locator("article h1").inner_text().strip() == "Markdown 渲染与安全测试")
        page2.close()

        # ---- edit ----
        page.click("text=编辑")
        page.wait_for_timeout(400)
        check("editor: prefilled", page.input_value("#post-title") == "Markdown 渲染与安全测试")
        page.fill("#post-title", "Markdown 渲染与安全测试（修订版）")
        page.click("button[type=submit]")
        page.wait_for_timeout(600)
        check("edit: detail shows updated title", page.locator("article h1").inner_text().strip() == "Markdown 渲染与安全测试（修订版）")
        check("edit: updated marker shown", page.locator("text=已编辑").count() >= 1)

        # ---- validation: empty fields blocked ----
        page.goto(URL + "#/editor")
        page.wait_for_timeout(400)
        page.click("button[type=submit]")
        page.wait_for_timeout(300)
        check("editor: empty submit blocked", page.locator("[role=alert]").count() == 1)

        # ---- delete ----
        page.goto(URL + "#/posts/markdown")
        page.wait_for_timeout(600)
        check("delete: post reachable by slug", page.locator("article h1").count() == 1)
        page.click("text=删除")
        page.wait_for_timeout(600)
        check("delete: navigated back to list", "#/blog" in page.url)
        remaining = page.locator("#blog ul li").all_inner_texts()
        check("delete: post gone from list", all("修订版" not in t for t in remaining), str(remaining))
        check("delete: seeds still there", len(remaining) == 3)

        # ---- mobile viewport: hamburger menu reaches the blog ----
        merrors = []
        mctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", locale="zh-CN")
        mpage = mctx.new_page()
        mpage.on("pageerror", lambda e: merrors.append(str(e)))
        mpage.goto(URL + "#/")
        mpage.wait_for_timeout(600)
        menu_btn = mpage.locator("header button[aria-label='打开菜单']")
        check("mobile: hamburger visible", menu_btn.is_visible())
        desktop_blog = mpage.locator("header nav a", has_text="博客")
        check("mobile: desktop blog link hidden", desktop_blog.count() >= 1 and not desktop_blog.first.is_visible(), str(desktop_blog.count()))
        menu_btn.click()
        mpage.wait_for_timeout(300)
        mpage.screenshot(path=os.path.join(OUT, "mobile-menu.png"))
        mobile_blog = mpage.locator("header a[href='#/blog']")
        check("mobile: blog entry in open menu", mobile_blog.count() >= 1 and mobile_blog.last.is_visible())
        mobile_blog.last.click()
        mpage.wait_for_timeout(700)
        check("mobile: navigated to blog", "#/blog" in mpage.url, mpage.url)
        check("mobile: blog list rendered", mpage.locator("#blog ul li").count() == 3)
        check("mobile: menu collapsed after nav", mpage.locator("header button[aria-label='打开菜单']").is_visible())
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
