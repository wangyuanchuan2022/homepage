import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getBook, getChapter, neighborsOf } from '../../data/novels'
import { chapterWordCount, parseSections } from '../../data/novelsCore'
import { formatPostDate } from '../../data/postsCore'
import { renderChapter } from '../../lib/markdown'
import { navigate } from '../../router/useHashRoute'

/** Chapter reading page. In-section anchors are JS scrolls on purpose — a plain
 *  '#sec-n' href would mutate location.hash and hijack the hash router to home. */
export default function ChapterDetail({ slug }: { slug: string }) {
  const chapter = getChapter(slug)

  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-[11px] text-faint">
          <span className="text-dim">visitor@wyc</span>
          <span className="text-faint">:~$ </span>
          <span className="text-amber">cat novels/{slug}.md</span>
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tighter2 text-ink">章节不存在</h1>
        <p className="mt-2 text-sm text-dim">
          # 没找到 <span className="text-amber">{slug}</span>。可能链接有误。
        </p>
        <button
          type="button"
          onClick={() => navigate('/novel')}
          className="mt-6 inline-flex items-center gap-2 rounded border border-linedim px-4 py-2 text-sm text-ink transition-colors hover:border-line hover:text-amber"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          返回书架
        </button>
      </div>
    )
  }

  const book = getBook(chapter.novelId)
  const { prev, next } = neighborsOf(slug)
  const sections = parseSections(chapter.body)
  const toc = sections.filter((s) => s.title)
  const words = chapterWordCount(chapter.body)

  // no behavior:'smooth' — CSS scroll-behavior (with its reduced-motion override) decides
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }

  return (
    <article className="mx-auto max-w-3xl px-5 sm:px-8">
      <button
        type="button"
        onClick={() => navigate('/novel')}
        className="inline-flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-amber"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        返回书架
      </button>

      <p className="mt-6 text-[11px] text-faint" aria-hidden="true">
        <span className="text-dim">visitor@wyc</span>
        <span className="text-faint">:~$ </span>
        <span className="text-amber">cat novels/{chapter.slug}.md</span>
      </p>

      {book && <p className="mt-3 text-xs tracking-wider text-amber">《{book.title}》</p>}
      <h1 className="mt-1.5 text-2xl font-bold tracking-tighter2 text-ink sm:text-3xl">{chapter.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-dim">
        <span>{formatPostDate(chapter.date)} 更新</span>
        <span>{words.toLocaleString('zh-Hans-CN')} 字</span>
        {book && (
          <span className="rounded-full border border-linedim px-2 py-0.5 text-[10px] tracking-wider text-faint">
            {book.status}
          </span>
        )}
      </div>

      <div className="mt-5 h-px w-full bg-linedim" aria-hidden="true" />

      {toc.length > 1 && (
        <nav aria-label="本章节目" className="mt-4 rounded-lg border border-linedim bg-panel px-4 py-3">
          <p className="text-[11px] text-faint"># 本章节目</p>
          <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5">
            {toc.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className="text-xs text-dim transition-colors hover:text-amber"
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-24">
          <div
            className="post-md mt-2"
            dangerouslySetInnerHTML={{
              // section titles were stripped into the TOC; render them back as h2 dividers
              __html: renderChapter(s.title ? `## ${s.title}\n\n${s.content}` : s.content),
            }}
          />
        </section>
      ))}

      <div className="mt-6 h-px w-full bg-linedim" aria-hidden="true" />

      <nav aria-label="章节导航" className="mt-5 flex items-center justify-between gap-3 pb-10">
        {prev ? (
          <button
            type="button"
            onClick={() => navigate(`/novels/${encodeURIComponent(prev.slug)}`)}
            className="inline-flex items-center gap-1.5 rounded border border-linedim px-4 py-2 text-xs text-ink transition-colors hover:border-line hover:text-amber"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            上一章 {prev.title}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => navigate(`/novels/${encodeURIComponent(next.slug)}`)}
            className="inline-flex items-center gap-1.5 rounded border border-linedim px-4 py-2 text-xs text-ink transition-colors hover:border-line hover:text-amber"
          >
            下一章 {next.title}
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        ) : (
          <span className="text-xs text-faint">已是最新章节</span>
        )}
      </nav>
    </article>
  )
}
