import { ArrowUpRight, Star } from 'lucide-react'
import { Section, Reveal } from './Section'
import { featuredProjects, gridProjects, moreRepos, type Project } from '../data/profile'

function StatusLine({ status }: { status: Project['status'] }) {
  return (
    <p className={`text-xs ${status.tone === 'ok' ? 'text-ok' : 'text-amber'}`}>
      <span className="text-faint">[{status.tone}]</span> {status.label}
    </p>
  )
}

function StackChips({ stack }: { stack: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {stack.map((s) => (
        <span key={s} className="rounded-sm border border-linedim px-1.5 py-0.5 text-[11px] text-dim">
          {s}
        </span>
      ))}
    </div>
  )
}

function LinkRow({ links }: { links: Project['links'] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {links.map((l) =>
        l.url ? (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-amber underline decoration-line underline-offset-4 transition-colors hover:text-amber-bright"
          >
            {l.label}
            {l.external && <ArrowUpRight size={12} aria-hidden="true" />}
          </a>
        ) : (
          <span key={l.label} className="text-xs text-faint">
            {l.label}
          </span>
        ),
      )}
    </div>
  )
}

function PrivacyBadge({ privacy }: { privacy: Project['privacy'] }) {
  const map = {
    open: { text: 'open-source', cls: 'border-ok/40 text-ok' },
    private: { text: 'private', cls: 'border-linedim text-faint' },
    fork: { text: 'fork', cls: 'border-linedim text-faint' },
  } as const
  const m = map[privacy]
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] tracking-wider ${m.cls}`}>{m.text}</span>
}

export default function Projects() {
  return (
    <Section id="projects" prompt="ls projects/ --detail" titleCn="项目" titleEn="SELECTED WORK">
      {/* Featured */}
      <div className="space-y-6">
        {featuredProjects.map((p) => (
          <Reveal key={p.name}>
            <article className="overflow-hidden rounded-lg border border-linedim bg-panel/50 transition-colors hover:border-line">
              <div className="flex items-center gap-2 border-b border-linedim px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f56]/70" aria-hidden="true" />
                <span className="h-2 w-2 rounded-full bg-[#ffbd2e]/70" aria-hidden="true" />
                <span className="h-2 w-2 rounded-full bg-[#27c93f]/70" aria-hidden="true" />
                <span className="ml-3 text-[11px] text-dim">
                  {p.name.split(/[·\s]/)[0].toLowerCase().replace(/[^a-z0-9_]+/g, '-')} — featured
                </span>
                <span className="ml-auto text-[10px] tracking-[0.25em] text-faint">{p.tag}</span>
              </div>
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold text-ink" data-edit-id={`${p.name}-title`}>
                      {p.name}
                    </h3>
                    <PrivacyBadge privacy={p.privacy} />
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-dim">
                    <span className="text-faint"># 问题 / </span>
                    <span data-edit-id={`${p.name}-problem`}>{p.problem}</span>
                  </p>
                  <ul className="mt-3 space-y-2">
                    {p.detail.map((d, i) => (
                      <li key={i} className="text-[13px] leading-6 text-ink/85" data-edit-id={`${p.name}-detail-${i}`}>
                        <span className="mr-2 text-amber" aria-hidden="true">
                          &gt;
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <StackChips stack={p.stack} />
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-5 border-linedim lg:border-l lg:pl-8">
                  {p.metrics && (
                    <div className="grid grid-cols-3 gap-3">
                      {p.metrics.map((m) => (
                        <div key={m.label}>
                          <p className="text-xl font-bold text-amber">{m.value}</p>
                          <p className="mt-0.5 text-[11px] text-faint">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    <StatusLine status={p.status} />
                    <LinkRow links={p.links} />
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {gridProjects.map((p, i) => (
          <Reveal key={p.name} delay={(i % 2) * 0.1}>
            <article className="flex h-full flex-col rounded-lg border border-linedim bg-panel/35 p-5 transition-all hover:-translate-y-0.5 hover:border-line hover:bg-panel/60">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-ink" data-edit-id={`${p.name}-title`}>
                  {p.name}
                </h3>
                <span className="text-[10px] tracking-[0.25em] text-faint">{p.tag}</span>
              </div>
              <p className="mt-2.5 text-xs text-faint">
                <span># </span>
                <span data-edit-id={`${p.name}-problem`}>{p.problem}</span>
              </p>
              <p className="mt-2.5 flex-1 text-[13px] leading-6 text-dim" data-edit-id={`${p.name}-detail`}>
                {p.detail[0]}
              </p>
              <div className="mt-4 space-y-3">
                <StackChips stack={p.stack} />
                <StatusLine status={p.status} />
                <LinkRow links={p.links} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* More repos */}
      <div className="mt-8 border-t border-linedim pt-5">
        <p className="text-[11px] tracking-wider text-faint" aria-hidden="true">
          $ find ~/repos -type public | head -5
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {moreRepos.map((r) => (
            <li key={r.name}>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-baseline gap-2 text-xs text-dim transition-colors hover:text-amber"
              >
                <span className="underline decoration-linedim underline-offset-4 group-hover:decoration-amber">
                  {r.name}
                </span>
                <span className="text-[11px] text-faint">{r.note}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] text-faint">
                  <Star size={10} aria-hidden="true" />
                  {r.stars}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
