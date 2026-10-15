// Minimal hash router — GitHub Pages has no SPA rewrite, so routes live in the hash:
//   #/            home (landing)
//   #/blog        post list
//   #/posts/:slug post detail
//   #/editor      new post
//   #/editor/:slug edit post
//   #/novel        novel shelf (books + chapter lists)
//   #/novels/:slug chapter reading page
// Unknown hashes (e.g. plain #about anchors) fall back to home; the browser's native
// anchor scrolling still applies because the landing stays rendered.
import { useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'blog' }
  | { name: 'post'; slug: string }
  | { name: 'editor'; slug?: string }
  | { name: 'novel' }
  | { name: 'chapter'; slug: string }

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '').replace(/^\/+/, '')
  if (h === 'blog') return { name: 'blog' }
  const post = h.match(/^posts\/([^/]+)$/)
  if (post) {
    try {
      return { name: 'post', slug: decodeURIComponent(post[1]) }
    } catch {
      return { name: 'post', slug: post[1] }
    }
  }
  if (h === 'novel') return { name: 'novel' }
  const chapter = h.match(/^novels\/([^/]+)$/)
  if (chapter) {
    try {
      return { name: 'chapter', slug: decodeURIComponent(chapter[1]) }
    } catch {
      return { name: 'chapter', slug: chapter[1] }
    }
  }
  if (h === 'editor') return { name: 'editor' }
  const ed = h.match(/^editor\/([^/]+)$/)
  if (ed) {
    try {
      return { name: 'editor', slug: decodeURIComponent(ed[1]) }
    } catch {
      return { name: 'editor', slug: ed[1] }
    }
  }
  return { name: 'home' }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(to: string): void {
  location.hash = to
}
