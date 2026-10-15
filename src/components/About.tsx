import { Section } from './Section'
import { about } from '../data/profile'

export default function About() {
  return (
    <Section id="about" prompt={about.prompt} titleCn={about.titleCn} titleEn={about.titleEn}>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <div className="space-y-4 text-[15px] leading-8 text-ink/90">
          {about.cn.map((p, i) => (
            <p key={i} data-edit-id={`about-cn-${i + 1}`}>
              {p}
            </p>
          ))}
        </div>
        <div className="border-l-2 border-line pl-5 lg:pl-6">
          <p className="mb-3 text-[10px] tracking-[0.3em] text-faint" aria-hidden="true">
            // EN
          </p>
          <div className="space-y-4 text-[12.5px] leading-6 text-dim">
            {about.en.map((p, i) => (
              <p key={i} data-edit-id={`about-en-${i + 1}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
