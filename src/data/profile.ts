// ---------------------------------------------------------------
// Centralized profile data — edit this file to update all content.
// 规则：只用可验证的真实信息；没有实数的地方明确标注「待补充」。
// ---------------------------------------------------------------

export const identity = {
  handle: 'wangyuanchuan2022',
  roleCn: '独立开发者 · 从 AI 系统到桌面工具',
  roleEn: 'Indie developer — from AI systems to desktop tools',
  missionCn: '把想法做成能长期服役的工具——从 AI 检索系统到桌面小物。',
  missionEn: 'Turning ideas into durable tools — from AI search systems to desktop utilities.',
  github: 'https://github.com/wangyuanchuan2022',
  githubLabel: 'github.com/wangyuanchuan2022',
}

export const terminalScript = [
  { cmd: 'whoami', output: ['wangyuanchuan2022'] },
  {
    cmd: 'cat mission.txt',
    output: ['把想法做成能长期服役的工具——从 AI 检索系统到桌面小物。', 'Turning ideas into durable tools — from AI search systems to desktop utilities.'],
  },
  { cmd: 'ls repos | wc -l', output: ['15 public repos — and counting'] },
]

export const about = {
  prompt: 'cat about.md',
  titleCn: '关于',
  titleEn: 'ABOUT',
  cn: [
    '独立开发者。写 AI 工具链（RAG 检索、agent 编排、DSH 插件生态），也写 Python 工程（计算机视觉、算法求解器）、Web 交互与各种自用小工具——包括像扫雷助手这样纯手工打造的算法项目。',
    '信奉工程纪律：安全审查前置、测试先行、指标可溯源。目标不是追单一方向，而是把每个想法沉淀成顺手的长期工具，而不是一次性的 demo。',
  ],
  en: [
    'Indie developer. I build AI tooling (RAG search, agent orchestration, DSH plugin ecosystems), Python engineering (computer vision, algorithm solvers), interactive web apps — and self-use tools, including algorithm projects hand-written without AI.',
    'Engineering discipline first: security review up front, tests before delivery, traceable metrics. The goal is not to chase a single direction, but to turn every idea into a durable tool, not a one-off demo.',
  ],
}

export const stats = [
  {
    value: '15.4亿+',
    unit: '字',
    labelCn: '可检索古籍语料',
    labelEn: 'classical Chinese chars, searchable',
    note: '殆知阁全库接入 · vec/fts/hybrid 三路检索',
  },
  {
    value: '15',
    unit: '个',
    labelCn: '公开仓库',
    labelEn: 'public repos on GitHub',
    note: '从古籍 RAG 到 WebGL 物理模拟与扫雷求解器',
  },
  {
    value: '3',
    unit: '个',
    labelCn: 'DSH 插件服役中',
    labelEn: 'DeepSeek Harness plugins in service',
    note: '零核心修改 · 随装随用 · 卸载即净',
  },
]

export const skillGroups = [
  {
    dir: 'ai-llm/',
    titleCn: 'AI · LLM 工程',
    descCn: 'RAG 三路检索与重排、agent 编排与多会话协作、MCP 工具桥接、引文查证协议。',
    descEn: 'RAG retrieval & reranking, agent orchestration, MCP tool bridging.',
    outputs: 'guji 古籍检索 · essay-arguer 写作智能体',
  },
  {
    dir: 'python-sys/',
    titleCn: 'Python · 系统',
    descCn: 'GPU 嵌入计算与吞吐调优、YOLO 推理与多线程处理、pybind11 混合编程、数据管线断点续传。',
    descEn: 'GPU embedding pipelines, YOLO inference, hybrid C++ via pybind11.',
    outputs: 'video_masking · minesweeper_help',
  },
  {
    dir: 'web-frontend/',
    titleCn: 'Web · 前端',
    descCn: 'React/Vite 交互应用、WebGL 刚体物理模拟、单文件零依赖交付、移动端体验打磨。',
    descEn: 'React/Vite apps, WebGL rigid-body physics, zero-dependency delivery.',
    outputs: 'coin-flip · code2course · dsh-mobile-ux',
  },
  {
    dir: 'discipline/',
    titleCn: '工程 · 纪律',
    descCn: '安全审查前置、冒烟测试纪律、指标可溯源、交付前自证、文档与自动化备份。',
    descEn: 'Security review up front, smoke tests, traceable metrics, self-verified delivery.',
    outputs: 'DSH 插件体系 · 记忆自动备份',
  },
]

export type Project = {
  name: string
  tag: string
  privacy: 'open' | 'private' | 'fork'
  problem: string
  detail: string[]
  stack: string[]
  status: { label: string; tone: 'ok' | 'wip' }
  metrics?: { value: string; label: string }[]
  links: { label: string; url: string | null; external?: boolean }[]
}

export const featuredProjects: Project[] = [
  {
    name: 'guji · 古籍知识库检索',
    tag: 'RAG SYSTEM',
    privacy: 'private',
    problem: '古籍引文查证难：检索结果不可溯源，冷门书永远沉底。',
    detail: [
      '接入殆知阁 15.4 亿字语料，vec / fts / hybrid 三路检索；',
      '以 zh.wikipedia 近 12 个月阅读量做「名书优先」有界重排，冷门书不被硬过滤；',
      'fts 连文命中作为直引唯一标准，引文逐条可查证；MCP 服务化，agent 会话内直接调用。',
    ],
    stack: ['Python', 'Ollama qwen3-embedding', 'GPU 调优', 'MCP', 'SQLite FTS5'],
    status: { label: '三路检索 + 名书优先重排已上线，日常服役中', tone: 'ok' },
    metrics: [
      { value: '15.4亿', label: '字语料' },
      { value: '3 路', label: 'vec/fts/hybrid' },
      { value: '≤25 位', label: '名书有界提升' },
    ],
    links: [{ label: '私有系统 · 仓库整理中', url: null }],
  },
  {
    name: 'DSH 插件生态',
    tag: 'PLUGIN SUITE',
    privacy: 'open',
    problem: 'agent 运行时缺原生工具桥接、移动端体验与提示词工具。',
    detail: [
      'dsh-memory-evolve（fork 维护）：跨会话五轨记忆 + 技能自我进化，回传修复已被上游吸收合入；',
      'dsh-mobile-ux：网页版移动宽度体验从头打磨，≥44px 触控目标、安全区适配；',
      'dsh-prompt-optimizer：输入框内一键把草稿重写为结构更清晰的提示词。',
    ],
    stack: ['JavaScript', '零运行时依赖', '宿主 bundle 契约'],
    status: { label: '多插件服役中 · 上游吸收合入 2 项修复', tone: 'ok' },
    links: [
      { label: 'dsh-memory-evolve', url: 'https://github.com/wangyuanchuan2022/dsh-memory-evolve', external: true },
      { label: 'dsh-mobile-ux', url: 'https://github.com/wangyuanchuan2022/dsh-mobile-ux', external: true },
      { label: 'dsh-prompt-optimizer', url: 'https://github.com/wangyuanchuan2022/dsh-prompt-optimizer', external: true },
    ],
  },
  {
    name: 'minesweeper_help · 扫雷求解助手',
    tag: 'HAND-CRAFTED SOLVER',
    privacy: 'open',
    problem: '高级扫雷总是差一口气——人脑算不过来的概率，交给算法。',
    detail: [
      '概率推理 + 自动操作：逐格计算安全概率，代做高危点击；',
      '高级模式胜率 46%+，持续迭代；',
      '全部代码纯人工手写——算法、界面、测试均不经 AI 生成。',
    ],
    stack: ['Python', '概率推理', '纯人工手写'],
    status: { label: '开源 · 持续迭代', tone: 'ok' },
    metrics: [
      { value: '46%+', label: '高级模式胜率' },
      { value: '0 行', label: 'AI 生成代码' },
    ],
    links: [{ label: 'GitHub', url: 'https://github.com/wangyuanchuan2022/minesweeper_help', external: true }],
  },
]

export const gridProjects: Project[] = [
  {
    name: 'homework_board · 班级写作网站',
    tag: 'SCHOOL WEB',
    privacy: 'open',
    problem: '班级的作业与写作展示，需要一块随时能看的公共屏。',
    detail: ['为学校开发的班级写作网站：每日作业发布与班级写作展示，浏览器打开即用。'],
    stack: ['HTML', 'Web'],
    status: { label: '开源 · 仓库最高星标 5★', tone: 'ok' },
    links: [{ label: 'GitHub', url: 'https://github.com/wangyuanchuan2022/homework_board', external: true }],
  },
  {
    name: 'code2course',
    tag: 'AI SKILL',
    privacy: 'open',
    problem: '接手陌生代码库门槛高。',
    detail: ['把任意代码库变成单文件、零依赖、离线可开的 HTML 交互式课程：对照翻译、动画可视化、真实数据图表、应用测验。'],
    stack: ['JavaScript', 'AI Skill'],
    status: { label: '已开源', tone: 'ok' },
    links: [{ label: 'GitHub', url: 'https://github.com/wangyuanchuan2022/code2course', external: true }],
  },
  {
    name: 'coin-flip',
    tag: 'WEBGL',
    privacy: 'open',
    problem: '想要一枚物理上诚实的硬币。',
    detail: ['three.js + cannon-es 刚体物理硬币翻转模拟器，完全离线可用，已部署 GitHub Pages。'],
    stack: ['three.js', 'cannon-es', 'Vite'],
    status: { label: 'LIVE · 已部署', tone: 'ok' },
    links: [
      { label: '在线体验', url: 'https://wangyuanchuan2022.github.io/coin-flip/', external: true },
      { label: 'GitHub', url: 'https://github.com/wangyuanchuan2022/coin-flip', external: true },
    ],
  },
  {
    name: 'video_masking',
    tag: 'CV · GPU',
    privacy: 'open',
    problem: '视频隐私保护需要批量处理。',
    detail: ['YOLOv9 视频人脸匿名化：像素化 / 图像覆盖双掩码模式，多线程 + GPU 加速。'],
    stack: ['Python', 'YOLOv9', 'CUDA'],
    status: { label: '开源', tone: 'ok' },
    links: [{ label: 'GitHub', url: 'https://github.com/wangyuanchuan2022/video_masking', external: true }],
  },
]

export const moreRepos = [
  { name: '2048python', note: '2048 终端版 + 自动演示', stars: 4, url: 'https://github.com/wangyuanchuan2022/2048python' },
  { name: 'auto_select_course', note: '自动选课抢课工具', stars: 4, url: 'https://github.com/wangyuanchuan2022/auto_select_course' },
  { name: 'threebody', note: '三体模拟器', stars: 0, url: 'https://github.com/wangyuanchuan2022/threebody' },
  { name: 'auto_timetable', note: '课程表自动化', stars: 1, url: 'https://github.com/wangyuanchuan2022/auto_timetable' },
  { name: 'biology-self-improvement', note: '自训练 / 自进化 agent 实验', stars: 1, url: 'https://github.com/wangyuanchuan2022/biology-self-improvement' },
]

export const nowItems = [
  { text: '打磨古籍检索的引文查证协议与流传度重排', sub: 'citation-checkable search for classical texts' },
  { text: '维护 DSH 插件生态与记忆自动备份体系', sub: 'DSH plugin suite & memory backup' },
  { text: '待补充：下一个开源计划', sub: 'placeholder — replace with your next thing' },
]

export const contact = {
  prompt: 'tail -f now.log',
  titleCn: '近况与联系',
  titleEn: 'NOW & CONTACT',
  email: null as string | null, // 待补充：公开邮箱
}
