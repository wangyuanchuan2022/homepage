# wangyuanchuan2022 · Personal Homepage

终端身份卡风格的个人主页（Terminal Identity Hero），中英双语，React 工程。
内容全部来自真实项目与公开仓库，无可验证实数的地方明确标注「待补充」。

## 快速开始

```bash
npm install        # 沙箱内需 --ignore-scripts --cache <workspace>，用户终端直接 npm install
npm run dev        # 开发预览 http://localhost:5173
npm run build      # 产物 → dist/（静态托管用）
npm run build:single  # 产物 → dist-single/index.html（单文件，双击即开）
```

DSH 沙箱内注意：npm 生命周期脚本与 vite/esbuild 的子进程会撞 `spawn EPERM`，
用 `node .\node_modules\vite\bin\vite.js build` 直跑 + 提权（danger-full-access）。

## 改内容

所有文案集中在 `src/data/profile.ts`：身份、使命、简介（双语）、数字、技能、项目、
近况、联系方式（email 当前为待补充占位）。改这一个文件即可，无需动组件。

页面还内置左上角隐藏编辑器（悬停左上角或按 `E`）：
- `编辑` 开关 → 直接在页面上改文案，`Ctrl/Cmd+S` 保存到 localStorage（按 `data-edit-id` 稳定存储）
- `导出 HTML` → 把当前页面（含修改）导出为独立 .html 文件

## 部署

- GitHub Pages（根路径）：把 `dist/` 内容推到 `wangyuanchuan2022.github.io` 仓库即可
  替换现有占位页。
- 单文件分享：`dist-single/index.html` 零依赖，直接发文件对方双击就能打开。

## 博客

入口：导航「博客」或任意页面 `#/blog`。支持 Markdown 发布 / 列表 / 详情 / 编辑 / 删除 / 分享
（详情页「分享」复制 `#/posts/:slug` 唯一链接）。

**存储模型**（静态托管下的最小实现，免后端）：
- **内置文章**：`src/content/posts/*.md`（frontmatter: `slug/title/date`），构建时打包，所有访客可见——
  永久发布 = 把 .md 丢进该目录再构建推送；
- **本地文章**：页面编辑器新建/编辑的内容存 localStorage（仅当前浏览器），与内置文章合并展示、
  按时间倒序；编辑内置文章 = 生成本地同 slug 影子位，删除内置文章 = 墓碑标记。

**第三方依赖与理由**：`markdown-it`（`html:false`，用户输入的原始 HTML 一律转义为文本）
+ `DOMPurify`（对渲染结果二次消毒，禁 script/iframe/事件属性）——防 XSS 的行业标准最小组合，
自写解析器/消毒器风险远高于收益。

**路由**：自写 ~50 行 hash 路由（`#/blog`、`#/posts/:slug`、`#/editor`），GitHub Pages 无 SPA
rewrite 也能直达深链；未识别的 hash（如 `#about`）回落主页并保留原生锚点滚动。

## 小说

入口：导航「小说」或任意页面 `#/novel`。书目 + 章节两级：书架页展示《断链》卡片与章节列表，
章节阅读页 `#/novels/:slug` 含本章节目（小节锚点跳转）、字数与上一章/下一章导航。

**存储模型**：seed-only（纯静态，无 localStorage 编辑层）——章节构建时打包自
`src/content/novels/*.md`（frontmatter: `slug/novel/number/title/date`），所有访客可见。
发布新章 = 把 .md 丢进该目录再构建。正文逐字保真入库（上传稿经机检 VERBATIM-MATCH），
仅首行 `# 第一章` 标题由页面头部替代展示，数据层解析时也会剥离冗余 h1。
与博客不同不设编辑器：小说是策展内容，不做访客本地改写。

**渲染差异**：章节用独立渲染器 `renderChapter`（`breaks:true`）——稿面「一句对话一行」
的换行保留为 `<br>` 不并段；博客正文维持 CommonMark 默认（`breaks:false`）。
两者同一安全模型：markdown-it（`html:false`）+ DOMPurify 二次消毒。

**字数口径**：非空白字符数（含标点），整行剔除 Markdown 标题行（含标题文字，标题属结构
不计入正文）；站点自洽展示口径。

**决策记录（2026-10-14 深夜，用户休息期自主落定，均可回退）**：
- 板块入口只加在导航（桌面 + 移动），首页落地页不新增板块——与博客的露出方式一致；
  回退：删 `src/components/Nav.tsx` 两处 `#/novel` 链接即可。
- 路由命名 `#/novel`、`#/novels/:slug`，对齐博客 `#/posts/:slug` 模式。
- 《断链》书目简介仅由第一章内容归纳（粮/盐/井/烽燧/账目），不引入章节外设定；
  章节日期字段取入库日 2026-10-14。

## 测试

```bash
node tests/posts.test.mjs                        # 博客纯逻辑单测（slug/frontmatter/合并/墓碑）
node tests/novels.test.mjs                       # 小说纯逻辑单测（节目解析/字数/排序/上下章）
python -X utf8 tests/capture_qa.py               # 主页视觉 QA（13 断言）
python -X utf8 tests/blog_qa.py                  # 博客 E2E 验收（发布/XSS/分享/编辑/删除）
python -X utf8 tests/novel_qa.py                 # 小说 E2E 验收（书架/阅读页/节目/404/移动端）
```

## 视觉 QA

```bash
python -X utf8 tests/capture_qa.py
```

13 项断言（桌面/移动端布局、溢出、章节齐全、终端打字机时序、控制台零报错）+
截图输出到 `qa/`。上次运行：13/13 通过。
