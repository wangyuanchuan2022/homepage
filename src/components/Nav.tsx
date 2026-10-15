import { useEffect, useState } from 'react'
import { Github, Menu, X } from 'lucide-react'
import { identity } from '../data/profile'

const links = [
  { href: '#about', label: '关于' },
  { href: '#skills', label: '技能' },
  { href: '#projects', label: '项目' },
  { href: '#contact', label: '联系' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  // any hash change (anchor jump or route switch) collapses the mobile menu
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  const mobileLinkCls = 'block py-2.5 text-sm text-dim transition-colors hover:text-amber'

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-linedim bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
        <a href="#/" className="text-sm font-bold tracking-tight text-ink hover:text-amber">
          ~/wangyuanchuan2022
        </a>
        <nav className="flex items-center gap-5 sm:gap-7" aria-label="主导航">
          <div className="hidden sm:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-xs text-dim transition-colors hover:text-amber">
                {l.label}
              </a>
            ))}
            <a href="#/blog" className="text-xs text-dim transition-colors hover:text-amber">
              博客
            </a>
            <a href="#/novel" className="text-xs text-dim transition-colors hover:text-amber">
              小说
            </a>
          </div>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded border border-linedim px-2.5 py-1.5 text-xs text-dim transition-colors hover:border-line hover:text-amber"
            aria-label="GitHub 主页（新窗口打开）"
          >
            <Github size={13} aria-hidden="true" />
            GitHub
          </a>
          <button
            type="button"
            className="flex items-center rounded border border-linedim p-1.5 text-dim transition-colors hover:border-line hover:text-amber sm:hidden"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={15} aria-hidden="true" /> : <Menu size={15} aria-hidden="true" />}
          </button>
        </nav>
      </div>
      {open && (
        <nav aria-label="移动端导航" className="border-t border-linedim bg-bg/95 backdrop-blur-md sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col px-5 py-2">
            {links.map((l) => (
              <a key={l.href} href={l.href} className={mobileLinkCls} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="#/blog" className={mobileLinkCls} onClick={() => setOpen(false)}>
              博客
            </a>
            <a href="#/novel" className={mobileLinkCls} onClick={() => setOpen(false)}>
              小说
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
