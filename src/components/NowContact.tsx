import { ArrowUpRight } from 'lucide-react'
import { Section } from './Section'
import { contact, identity, nowItems } from '../data/profile'

export default function NowContact() {
  return (
    <Section id="contact" prompt={contact.prompt} titleCn={contact.titleCn} titleEn={contact.titleEn}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-faint" aria-hidden="true">
            // NOW
          </p>
          <ul className="mt-4 space-y-4">
            {nowItems.map((n, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 text-amber" aria-hidden="true">
                  [•]
                </span>
                <div>
                  <p className="text-sm leading-6 text-ink/90" data-edit-id={`now-${i}-cn`}>
                    {n.text}
                  </p>
                  <p className="text-[11px] text-faint">{n.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-linedim lg:border-l lg:pl-12">
          <p className="text-[10px] tracking-[0.3em] text-faint" aria-hidden="true">
            // CONTACT
          </p>
          <p className="mt-4 text-2xl font-bold tracking-tighter2 text-ink" data-edit-id="contact-headline">
            有想法？直接敲门。
          </p>
          <p className="mt-1 text-xs text-faint">$ echo "hi" &gt;&gt; inbox.md</p>
          <div className="mt-6 space-y-3">
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded bg-amber px-5 py-3 text-sm font-bold text-bg transition-colors hover:bg-amber-bright"
            >
              {identity.githubLabel}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <p className="text-xs text-faint" data-edit-id="contact-email">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="text-dim hover:text-amber">
                  {contact.email}
                </a>
              ) : (
                <>email: 待补充 · replace with your public email in src/data/profile.ts</>
              )}
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
