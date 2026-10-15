// Novel storage — seed-only, static. Chapters are bundled at build time from
// src/content/novels/*.md (frontmatter: slug/novel/number/title/date).
// Publishing a new chapter = drop the .md into that folder and rebuild.
// No localStorage layer here on purpose: fiction is curated content, not
// visitor-edited (unlike the blog module — see src/data/posts.ts).
import { chapterNeighbors, sortChapters, type Book, type Chapter } from './novelsCore'
import { parseFrontmatter } from './postsCore'

const seedModules = import.meta.glob('../content/novels/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Bookshelf metadata — one entry per novel, displayed in this order. */
export const BOOKS: Book[] = [
  {
    id: 'duanlian',
    title: '断链',
    status: '连载中',
    blurb: '一座被围的城。粮照旧发，人照旧守——粮、盐、井、烽燧，与人心的账目。',
  },
]

const CHAPTERS: Chapter[] = Object.entries(seedModules).map(([path, raw]) => {
  const { attrs, body } = parseFrontmatter(raw)
  const slug = attrs.slug || path.replace(/^.*\//, '').replace(/\.md$/, '')
  return {
    slug,
    novelId: attrs.novel || BOOKS[0]?.id || '',
    number: Number(attrs.number) || 0,
    title: attrs.title || slug,
    date: attrs.date || '1970-01-01',
    body,
  }
})

/** All chapters of one book (or of every book), chapter number ascending. */
export function listChapters(novelId?: string): Chapter[] {
  const sorted = sortChapters(CHAPTERS)
  return novelId ? sorted.filter((c) => c.novelId === novelId) : sorted
}

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug)
}

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id)
}

/** Prev/next chapter relative to a slug, scoped to its own book. */
export function neighborsOf(slug: string) {
  const chapter = getChapter(slug)
  const scope = chapter ? listChapters(chapter.novelId) : listChapters()
  return chapterNeighbors(scope, slug)
}
