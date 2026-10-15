import { BOOKS, listChapters } from '../../data/novels'
import { chapterWordCount } from '../../data/novelsCore'
import { formatPostDate } from '../../data/postsCore'
import { Section } from '../Section'

/** Novel shelf: one card per book with its chapter list. Seed-only, read-only. */
export default function NovelList() {
  return (
    <Section id="novel" prompt="ls novels/" titleCn="小说" titleEn="FICTION">
      {BOOKS.map((book) => {
        const chapters = listChapters(book.id)
        const words = chapters.reduce((sum, c) => sum + chapterWordCount(c.body), 0)
        return (
          <div key={book.id} className="rounded-lg border border-linedim bg-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-xl font-bold tracking-tighter2 text-ink">《{book.title}》</h3>
              <span className="rounded-full border border-linedim px-2.5 py-0.5 text-[10px] tracking-wider text-amber">
                {book.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-dim">{book.blurb}</p>
            <p className="mt-1.5 text-xs text-faint">
              # {chapters.length} 章 · {words.toLocaleString('zh-Hans-CN')} 字
            </p>

            <ul className="mt-4 border-t border-linedim">
              {chapters.map((c) => (
                <li key={c.slug} className="border-b border-linedim">
                  <a
                    href={`#/novels/${encodeURIComponent(c.slug)}`}
                    className="group flex items-baseline justify-between gap-4 py-3.5"
                  >
                    <span className="text-[15px] text-ink transition-colors group-hover:text-amber">
                      {c.title}
                      <span className="ml-2.5 text-[11px] text-faint">
                        {chapterWordCount(c.body).toLocaleString('zh-Hans-CN')} 字
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-faint">{formatPostDate(c.date)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </Section>
  )
}
