import { identity } from '../data/profile'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-linedim sm:mt-32">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-9 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="text-dim">$ exit</span>
          <span className="mx-3 text-linedim" aria-hidden="true">
            |
          </span>
          © 2026 {identity.handle}
        </p>
        <div className="flex items-center gap-5">
          <p>React + Tailwind · 中英双语 · 数据与文案集中在 src/data/profile.ts</p>
          <a href="#top" className="text-dim transition-colors hover:text-amber">
            cd ~ ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
