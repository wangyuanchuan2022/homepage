import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { identity, terminalScript } from '../data/profile'

type Line = { type: 'cmd' | 'out'; text: string }

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Types each command, then reveals its output — the page's single motion system. */
function useTerminalSequence() {
  const [lines, setLines] = useState<Line[]>([])
  const [typing, setTyping] = useState('')
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const flat: Line[] = terminalScript.flatMap((e) => [
      { type: 'cmd' as const, text: e.cmd },
      ...e.output.map((t) => ({ type: 'out' as const, text: t })),
    ])

    if (reducedMotion()) {
      setLines(flat)
      setDone(true)
      return
    }

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
      timers.push(t)
    }

    let entryIdx = 0
    const runEntry = () => {
      if (entryIdx >= terminalScript.length) {
        setDone(true)
        return
      }
      const entry = terminalScript[entryIdx]
      let ci = 0
      const typeChar = () => {
        ci++
        setTyping(entry.cmd.slice(0, ci))
        if (ci < entry.cmd.length) {
          later(typeChar, 34 + Math.random() * 46)
        } else {
          later(() => {
            setTyping('')
            setLines((prev) => [...prev, { type: 'cmd', text: entry.cmd }])
            entry.output.forEach((out, oi) => {
              later(() => {
                setLines((prev) => [...prev, { type: 'out', text: out }])
                if (oi === entry.output.length - 1) {
                  entryIdx++
                  later(runEntry, 480)
                }
              }, 300 * (oi + 1))
            })
          }, 260)
        }
      }
      typeChar()
    }

    later(runEntry, 700)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [])

  return { lines, typing, done }
}

export default function TerminalHero() {
  const { lines, typing, done } = useTerminalSequence()
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines, typing])

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* watermark glyph */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[4%] top-[14%] hidden select-none text-[34vw] font-bold leading-none text-amber/[0.045] sm:block"
      >
        &gt;_
      </div>

      <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[1.12fr_1fr] lg:gap-12 lg:pt-24">
        {/* Terminal window */}
        <div className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-lg border border-linedim bg-panel/80 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-linedim px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80" aria-hidden="true" />
              <span className="ml-3 text-[11px] text-dim">wangyuanchuan2022@dev: ~</span>
            </div>
            <div
              ref={bodyRef}
              className="min-h-[280px] p-5 text-[12.5px] leading-6 sm:min-h-[300px] sm:text-[13px]"
              aria-label="终端自我介绍"
              aria-live="polite"
            >
              {lines.map((line, i) =>
                line.type === 'cmd' ? (
                  <p key={i} className="text-ink">
                    <span className="mr-2 text-amber">$</span>
                    {line.text}
                  </p>
                ) : (
                  <p key={i} className="whitespace-pre-wrap text-dim">
                    {line.text}
                  </p>
                ),
              )}
              {!done && (
                <p className="text-ink">
                  <span className="mr-2 text-amber">$</span>
                  {typing}
                  <span className="caret" aria-hidden="true" />
                </p>
              )}
              {done && (
                <p className="text-faint">
                  <span className="mr-2 text-dim">guest@wyc:~</span>
                  <span className="caret-idle" aria-hidden="true" />
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Identity block */}
        <div className="order-1 lg:order-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-linedim px-3 py-1 text-[11px] text-ok">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
            open to collaborate
          </p>
          <h1
            className="mt-5 break-words text-[1.7rem] font-bold leading-tight tracking-tighter2 text-ink sm:text-4xl lg:text-[2.55rem]"
            data-edit-id="hero-name"
          >
            {identity.handle}
          </h1>
          <p className="mt-3 text-lg text-ink" data-edit-id="hero-role-cn">
            {identity.roleCn}
          </p>
          <p className="mt-1 text-[13px] text-dim" data-edit-id="hero-role-en">
            {identity.roleEn}
          </p>
          <div className="my-6 h-px w-16 bg-line" aria-hidden="true" />
          <p className="max-w-md text-[15px] leading-7 text-dim" data-edit-id="hero-mission-cn">
            {identity.missionCn}
          </p>
          <p className="mt-1 max-w-md text-xs leading-5 text-faint" data-edit-id="hero-mission-en">
            {identity.missionEn}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded bg-amber px-5 py-3 text-sm font-bold text-bg transition-colors hover:bg-amber-bright"
            >
              浏览项目
              <ArrowDown size={15} aria-hidden="true" />
            </a>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-linedim px-5 py-3 text-sm text-ink transition-colors hover:border-line hover:text-amber"
            >
              GitHub
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none pb-6 text-center text-[11px] tracking-[0.25em] text-faint">
        scroll <ArrowDown className="inline" size={11} aria-hidden="true" />
      </div>
    </section>
  )
}
