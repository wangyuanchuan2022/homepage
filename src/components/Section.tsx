import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Scroll-into-view reveal. Disabled under prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/** Shared section shell: terminal prompt line + bilingual heading. */
export function Section({
  id,
  prompt,
  titleCn,
  titleEn,
  children,
}: {
  id: string
  prompt: string
  titleCn: string
  titleEn: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <p className="text-[11px] sm:text-xs text-faint" aria-hidden="true">
            <span className="text-dim">visitor@wyc</span>
            <span className="text-faint">:</span>
            <span className="text-dim">~</span>
            <span className="text-faint">$ </span>
            <span className="text-amber">{prompt}</span>
          </p>
          <div className="mt-2 flex items-baseline gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter2 text-ink">{titleCn}</h2>
            <span className="text-[10px] sm:text-xs tracking-[0.3em] text-faint">{titleEn}</span>
          </div>
          <div className="mt-6 sm:mt-8">{children}</div>
        </Reveal>
      </div>
    </section>
  )
}
