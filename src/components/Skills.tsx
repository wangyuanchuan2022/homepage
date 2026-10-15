import { Folder } from 'lucide-react'
import { Section } from './Section'
import { skillGroups } from '../data/profile'

export default function Skills() {
  return (
    <Section id="skills" prompt="ls -la ~/skills/" titleCn="能力" titleEn="CAPABILITIES">
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {skillGroups.map((g, i) => (
          <div key={g.dir} className="border-t border-linedim pt-5">
            <p className="flex items-baseline gap-2.5">
              <Folder size={14} className="translate-y-0.5 text-amber" aria-hidden="true" />
              <span className="text-sm font-bold text-amber">{g.dir}</span>
              <span className="text-sm font-bold text-ink" data-edit-id={`skill-${i}-title`}>
                {g.titleCn}
              </span>
            </p>
            <p className="mt-2.5 text-[13px] leading-6 text-dim" data-edit-id={`skill-${i}-desc`}>
              {g.descCn}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-faint">{g.descEn}</p>
            <p className="mt-2.5 text-xs leading-5 text-ok/85">
              <span className="text-faint">└─ </span>
              {g.outputs}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}
