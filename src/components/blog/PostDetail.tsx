import { useState } from 'react'
import { ArrowLeft, Link2, Pencil, Trash2 } from 'lucide-react'
import { deletePost, formatPostDate, getPost } from '../../data/posts'
import { renderMarkdown } from '../../lib/markdown'
import { navigate } from '../../router/useHashRoute'

export default function PostDetail({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const post = getPost(slug)

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-[11px] text-faint">
          <span className="text-dim">visitor@wyc</span>
          <span className="text-faint">:~$ </span>
          <span className="text-amber">cat posts/{slug}.md</span>
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tighter2 text-ink">文章不存在</h1>
        <p className="mt-2 text-sm text-dim">
          # 没找到 <span className="text-amber">{slug}</span>。可能已被删除，或链接有误。
        </p>
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="mt-6 inline-flex items-center gap-2 rounded border border-linedim px-4 py-2 text-sm text-ink transition-colors hover:border-line hover:text-amber"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          返回列表
        </button>
      </div>
    )
  }

  const html = renderMarkdown(post.body)

  const share = async () => {
    const url = location.href
    ;(window as unknown as { __lastCopiedUrl?: string }).__lastCopiedUrl = url
    let ok = true
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard API unavailable (file://, permission denied) — execCommand fallback
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand('copy')
        ta.remove()
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  const remove = () => {
    if (window.confirm(`确定删除「${post.title}」？此操作不可撤销。`)) {
      deletePost(slug)
      navigate('/blog')
    }
  }

  return (
    <article className="mx-auto max-w-3xl px-5 sm:px-8">
      <button
        type="button"
        onClick={() => navigate('/blog')}
        className="inline-flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-amber"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        返回列表
      </button>

      <p className="mt-6 text-[11px] text-faint" aria-hidden="true">
        <span className="text-dim">visitor@wyc</span>
        <span className="text-faint">:~$ </span>
        <span className="text-amber">cat posts/{post.slug}.md</span>
      </p>

      <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tighter2 text-ink sm:text-3xl">{post.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-dim">
        <span>{formatPostDate(post.date)}</span>
        <span className="rounded-full border border-linedim px-2 py-0.5 text-[10px] tracking-wider text-faint">
          {post.source === 'seed' ? '内置文章' : '本地发布'}
        </span>
        {post.updatedAt && <span className="text-faint">已编辑</span>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded bg-amber px-4 py-2 text-xs font-bold text-bg transition-colors hover:bg-amber-bright"
          title="复制本文链接"
        >
          <Link2 size={13} aria-hidden="true" />
          {copied ? '已复制 ✓' : '分享'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/editor/${encodeURIComponent(post.slug)}`)}
          className="inline-flex items-center gap-1.5 rounded border border-linedim px-4 py-2 text-xs text-ink transition-colors hover:border-line hover:text-amber"
        >
          <Pencil size={13} aria-hidden="true" />
          编辑
        </button>
        <button
          type="button"
          onClick={remove}
          className="inline-flex items-center gap-1.5 rounded border border-linedim px-4 py-2 text-xs text-dim transition-colors hover:border-line hover:text-amber-bright"
        >
          <Trash2 size={13} aria-hidden="true" />
          删除
        </button>
      </div>

      <div className="mt-6 h-px w-full bg-linedim" aria-hidden="true" />

      {/* Content is rendered by markdown-it (html:false) and sanitized by DOMPurify. */}
      <div className="post-md mt-2 pb-10" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  )
}
