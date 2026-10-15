import { useEffect } from 'react'
import Landing from './components/Landing'
import BlogList from './components/blog/BlogList'
import PostDetail from './components/blog/PostDetail'
import PostEditor from './components/blog/PostEditor'
import NovelList from './components/novel/NovelList'
import ChapterDetail from './components/novel/ChapterDetail'
import Nav from './components/Nav'
import Footer from './components/Footer'
import { useHashRoute } from './router/useHashRoute'

export default function App() {
  const route = useHashRoute()

  useEffect(() => {
    if (route.name === 'home') {
      const raw = location.hash
      if (raw && raw !== '#' && raw !== '#/') {
        const el = document.getElementById(raw.slice(1))
        if (el) {
          el.scrollIntoView()
          return
        }
      }
      window.scrollTo(0, 0)
    } else {
      window.scrollTo(0, 0)
    }
  }, [route])

  if (route.name === 'home') return <Landing />

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Nav />
      <main className="pb-16 pt-24">
        {route.name === 'blog' && <BlogList />}
        {route.name === 'post' && <PostDetail slug={route.slug} />}
        {route.name === 'editor' && <PostEditor slug={route.slug} />}
        {route.name === 'novel' && <NovelList />}
        {route.name === 'chapter' && <ChapterDetail slug={route.slug} />}
      </main>
      <Footer />
    </div>
  )
}
