import { Section, Reveal } from './Section'
import { stats } from '../data/profile'

export default function Highlights() {
  return (
    <Section id="stats" prompt="./stats --honest" titleCn="数字" titleEn="BY THE NUMBERS">
      <p className="-mt-3 mb-6 text-xs text-faint" data-edit-id="stats-note">
        # 只放可验证的实数，不编造指标。no vanity metrics — only verifiable facts.
      </p>
      <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
        {stats.map((s, i) => (
          <Reveal key={s.labelCn} delay={i * 0.12}>
            <div className="border-t-2 border-line pt-5">
              <p className="text-4xl font-bold tracking-tighter2 text-amber sm:text-5xl">
                {s.value}
                <span className="ml-1 text-base font-normal text-dim">{s.unit}</span>
              </p>
              <p className="mt-2 text-sm text-ink" data-edit-id={`stat-${i}-label-cn`}>
                {s.labelCn}
              </p>
              <p className="text-[11px] text-faint" data-edit-id={`stat-${i}-label-en`}>
                {s.labelEn}
              </p>
              <p className="mt-3 text-xs leading-5 text-dim">
                <span className="text-faint"># </span>
                {s.note}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
