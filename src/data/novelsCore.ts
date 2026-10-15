// Pure logic for the novel module — no browser/Vite APIs, so node can import
// and test this file directly (Node 24 strips types natively).

export interface Chapter {
  slug: string
  novelId: string
  number: number // chapter number, ascending within a book
  title: string
  date: string // 'YYYY-MM-DD'
  body: string
}

export interface Book {
  id: string
  title: string
  status: string // e.g. 连载中
  blurb: string
}

export interface ChapterSection {
  id: string // anchor id, stable by section order: sec-0, sec-1, ...
  title: string // heading text (e.g. 节1-配给照旧); '' for an untitled pre-heading block
  content: string // markdown of the section body (the ## heading line excluded)
}

/**
 * Split a chapter body into sections at '## ' headings.
 * - a redundant leading '# ' title line is dropped (the page header renders the title)
 * - content before the first '## ' heading becomes an untitled epigraph section (id 'sec-0')
 * - titled sections get sequential ids sec-1, sec-2, ... by heading order
 */
export function parseSections(body: string): ChapterSection[] {
  const stripped = body.replace(/^#\s+.+\n+/, '')
  const sections: ChapterSection[] = []
  let headings = 0
  for (const line of stripped.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      headings += 1
      sections.push({ id: `sec-${headings}`, title: heading[1], content: '' })
    } else if (sections.length === 0) {
      sections.push({ id: 'sec-0', title: '', content: line + '\n' })
    } else {
      sections[sections.length - 1].content += line + '\n'
    }
  }
  return sections
}

/** Non-whitespace char count (punctuation included); whole md heading lines excluded
 *  (headings are structural — chapter/section titles must not inflate the count). */
export function chapterWordCount(body: string): number {
  return body
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/\s+/g, '').length
}

/** Ascending by chapter number; date as tiebreaker. */
export function sortChapters(chapters: Chapter[]): Chapter[] {
  return [...chapters].sort((a, b) => a.number - b.number || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export interface ChapterNeighbors {
  prev?: Chapter // 上一章（更早）
  next?: Chapter // 下一章（更新）
}

/** Neighbors of a chapter within a number-sorted list; {} when the slug is unknown. */
export function chapterNeighbors(sorted: Chapter[], slug: string): ChapterNeighbors {
  const i = sorted.findIndex((c) => c.slug === slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? sorted[i - 1] : undefined,
    next: i < sorted.length - 1 ? sorted[i + 1] : undefined,
  }
}
