// Blog storage & CRUD — wires pure logic (postsCore) to Vite seed imports and localStorage.
// Storage model (documented in README):
// - seed posts: bundled at build time from src/content/posts/*.md, visible to every visitor
// - local posts: created/edited from the page editor, stored in localStorage (per-browser)
// - a local post with the same slug shadows the seed (edit override); seed deletions are tombstoned
import { formatPostDate, mergePosts, parseFrontmatter, slugifyTitle, uniqueSlug, type Post } from './postsCore'

export { formatPostDate }

const seedModules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const SEEDS: Post[] = Object.entries(seedModules).map(([path, raw]) => {
  const { attrs, body } = parseFrontmatter(raw)
  const slug = attrs.slug || slugifyTitle(attrs.title || path, 'post')
  return { slug, title: attrs.title || slug, date: attrs.date || '1970-01-01', body, source: 'seed' as const }
})

const STORE_KEY = 'homepage-posts:v1'
const DELETED_KEY = 'homepage-posts-deleted:v1'

interface Store {
  posts: Post[]
  deleted: string[]
}

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    const posts = raw ? (JSON.parse(raw) as Post[]) : []
    const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]') as string[]
    return {
      posts: Array.isArray(posts) ? posts.filter((p) => p && p.slug && p.title && typeof p.body === 'string') : [],
      deleted: Array.isArray(deleted) ? deleted : [],
    }
  } catch {
    return { posts: [], deleted: [] }
  }
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store.posts))
    localStorage.setItem(DELETED_KEY, JSON.stringify(store.deleted))
  } catch {
    // storage unavailable (private mode etc.) — page still renders bundled posts
  }
}

function nowLocalIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** All posts: seeds + local (overrides applied), newest first. */
export function listPosts(): Post[] {
  const { posts, deleted } = readStore()
  return mergePosts(SEEDS, posts, deleted)
}

export function getPost(slug: string): Post | undefined {
  return listPosts().find((p) => p.slug === slug)
}

export function isSeedSlug(slug: string): boolean {
  return SEEDS.some((s) => s.slug === slug)
}

export function createPost(title: string, body: string): Post {
  const store = readStore()
  const taken = new Set([...SEEDS.map((s) => s.slug), ...store.posts.map((p) => p.slug)])
  const base = slugifyTitle(title, 'post')
  const post: Post = {
    slug: uniqueSlug(base, taken),
    title,
    date: nowLocalIso(),
    body,
    source: 'local',
  }
  writeStore({ ...store, posts: [...store.posts, post] })
  return post
}

/** Update by slug. Editing a seed creates a local shadow copy with the same slug. */
export function updatePost(slug: string, title: string, body: string): Post | undefined {
  const store = readStore()
  const current = mergePosts(SEEDS, store.posts, store.deleted).find((p) => p.slug === slug)
  if (!current) return undefined
  const updated: Post = {
    ...current,
    title,
    body,
    source: 'local',
    updatedAt: nowLocalIso(),
  }
  const others = store.posts.filter((p) => p.slug !== slug)
  writeStore({ ...store, posts: [...others, updated] })
  return updated
}

/** Delete by slug. Local posts are removed; bundled seeds are tombstoned so they stay hidden. */
export function deletePost(slug: string): void {
  const store = readStore()
  const posts = store.posts.filter((p) => p.slug !== slug)
  const deleted = isSeedSlug(slug) && !store.deleted.includes(slug) ? [...store.deleted, slug] : store.deleted
  writeStore({ posts, deleted })
}
