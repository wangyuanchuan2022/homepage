import { Plus } from 'lucide-react'
import { formatPostDate, listPosts } from '../../data/posts'
import { navigate } from '../../router/useHashRoute'
import { Section } from '../Section'

export default function BlogList() {
  const posts = listPosts()

  return (
    <Section id="blog" prompt="ls posts/ --sort time" titleCn="博客" titleEn="BLOG">
      <div className="-mt-3 mb-6 flex items-center justify-between">
        <p className="text-xs text-faint"># {posts.length} 篇 · 按发布时间倒序</p>
        <button
          type="button"
          onClick={() => navigate('/editor')}
          className="inline-flex items-center gap-1.5 rounded bg-amber px-4 py-2 text-xs font-bold text-bg transition-colors hover:bg-amber-bright"
        >
          <Plus size={13} aria-hidden="true" />
          新建文章
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-dim">
          # 还没有文章。<button type="button" onClick={() => navigate('/editor')} className="text-amber underline decoration-line underline-offset-4">写第一篇</button>
        </p>
      ) : (
        <ul>
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-linedim">
              <a
                href={`#/posts/${encodeURIComponent(p.slug)}`}
                className="group flex items-baseline justify-between gap-4 py-4"
              >
                <span className="text-[15px] text-ink transition-colors group-hover:text-amber">
                  {p.title}
                  {p.updatedAt && <span className="ml-2 text-[10px] text-faint">已编辑</span>}
                </span>
                <span className="shrink-0 text-xs text-faint">{formatPostDate(p.date)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
