// Pure logic for the blog module — no browser/Vite APIs, so node can import
// and test this file directly (Node 24 strips types natively).

export type PostSource = 'seed' | 'local'

export interface Post {
  slug: string
  title: string
  date: string // 'YYYY-MM-DD' for seeds, local ISO-ish 'YYYY-MM-DDTHH:mm:ss' for local posts
  body: string
  source: PostSource
  updatedAt?: string
}

/** Minimal frontmatter parser: leading `---` block of `key: value` lines. */
export function parseFrontmatter(raw: string): { attrs: Record<string, string>; body: string } {
  if (!raw.startsWith('---')) return { attrs: {}, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { attrs: {}, body: raw }
  const head = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).replace(/^\n+/, '')
  const attrs: Record<string, string> = {}
  for (const line of head.split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) attrs[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { attrs, body }
}

/** ASCII slug from a title; falls back when the title has no ASCII at all (e.g. pure CJK). */
export function slugifyTitle(title: string, fallbackSeed = 'post'): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return ascii || fallbackSeed
}

/** Dedupe a slug against existing ones by appending -2, -3, ... */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const set = new Set(taken)
  if (!set.has(base)) return base
  let i = 2
  while (set.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

/**
 * Merge seed posts (bundled) with locally published/edited posts.
 * - a local post with the same slug shadows the seed (edit override)
 * - tombstoned slugs disappear from both sources
 * - result sorted by date descending
 */
export function mergePosts(seeds: Post[], local: Post[], deletedSlugs: string[]): Post[] {
  const deleted = new Set(deletedSlugs)
  const bySlug = new Map<string, Post>()
  for (const s of seeds) if (!deleted.has(s.slug)) bySlug.set(s.slug, { ...s })
  for (const l of local) if (!deleted.has(l.slug)) bySlug.set(l.slug, { ...l, source: 'local' })
  return [...bySlug.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** Display formatting for mixed date shapes; pure string ops, timezone-free. */
export function formatPostDate(iso: string): string {
  const d = iso.slice(0, 10)
  const t = iso.length > 10 ? iso.slice(11, 16) : ''
  return t ? `${d} ${t}` : d
}
