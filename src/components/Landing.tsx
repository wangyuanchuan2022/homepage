import Nav from './Nav'
import TerminalHero from './TerminalHero'
import About from './About'
import Highlights from './Highlights'
import Skills from './Skills'
import Projects from './Projects'
import NowContact from './NowContact'
import Footer from './Footer'
import InlineEditor from './InlineEditor'

/** The landing page (home route) — content unchanged from v1. */
export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Nav />
      <main>
        <TerminalHero />
        <div className="mt-20 space-y-20 sm:mt-24 sm:space-y-28">
          <About />
          <Highlights />
          <Skills />
          <Projects />
          <NowContact />
        </div>
      </main>
      <Footer />
      <InlineEditor />
    </div>
  )
}
