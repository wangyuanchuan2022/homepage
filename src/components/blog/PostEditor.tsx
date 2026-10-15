import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { createPost, getPost, updatePost } from '../../data/posts'
import { navigate } from '../../router/useHashRoute'

export default function PostEditor({ slug }: { slug?: string }) {
  const existing = slug ? getPost(slug) : undefined
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setError('标题和正文都不能为空。')
      return
    }
    const post = existing ? updatePost(existing.slug, title.trim(), body) : createPost(title.trim(), body)
    if (post) navigate(`/posts/${encodeURIComponent(post.slug)}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8">
      <p className="text-[11px] text-faint" aria-hidden="true">
        <span className="text-dim">visitor@wyc</span>
        <span className="text-faint">:~$ </span>
        <span className="text-amber">vim posts/{existing ? `${existing.slug}.md` : 'new-post.md'}</span>
        {existing?.source === 'seed' && <span className="ml-3 text-faint"># 编辑内置文章会保存为本地位</span>}
      </p>

      <h1 className="mt-3 text-2xl font-bold tracking-tighter2 text-ink">
        {existing ? '编辑文章' : '新建文章'}
      </h1>

      <form onSubmit={submit} className="mt-6 space-y-4 pb-12">
        <div>
          <label htmlFor="post-title" className="mb-1.5 block text-xs text-dim">
            标题 *
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="w-full rounded border border-linedim bg-panel px-3 py-2.5 text-sm text-ink placeholder:text-faint focus:border-line focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="post-body" className="mb-1.5 block text-xs text-dim">
            正文（Markdown）*
          </label>
          <textarea
            id="post-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={'# 标题\n\n- 列表项\n\n```python\nprint("hello")\n```'}
            rows={16}
            className="w-full rounded border border-linedim bg-panel px-3 py-2.5 font-mono text-[13px] leading-6 text-ink placeholder:text-faint focus:border-line focus:outline-none"
          />
          <p className="mt-1.5 text-[11px] text-faint">
            # 支持 GFM：标题 / 粗体 / 斜体 / 列表 / 链接 / 图片 / 代码块 / 表格。原始 HTML 会被转义，脚本不会执行。
          </p>
        </div>

        {error && (
          <p className="text-xs text-amber-bright" role="alert">
            # {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded bg-amber px-5 py-2.5 text-sm font-bold text-bg transition-colors hover:bg-amber-bright"
          >
            {existing ? '保存修改' : '发布'}
          </button>
          <button
            type="button"
            onClick={() => navigate(existing ? `/posts/${encodeURIComponent(existing.slug)}` : '/blog')}
            className="inline-flex items-center gap-1.5 rounded border border-linedim px-5 py-2.5 text-sm text-dim transition-colors hover:border-line hover:text-amber"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
