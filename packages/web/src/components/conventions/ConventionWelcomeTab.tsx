import type { PublicAttendeeGuide } from '@/lib/dancecard/attendeeGuideJson'

type Props = {
  guide: PublicAttendeeGuide
  convention: { name: string; description: string | null }
}

function MarkdownBlock({ value }: { value: string }) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return (
    <div className="prose-c2k text-dc-text-muted whitespace-pre-wrap leading-relaxed text-[15px]">
      {trimmed}
    </div>
  )
}

export default function ConventionWelcomeTab({ guide, convention }: Props) {
  const sections = (guide.sections ?? []).filter((s) => (s.markdown ?? '').trim().length > 0 || (s.title ?? '').trim().length > 0)
  const hasTicketing = Boolean(guide.ticketingUrl || guide.rabbitsignUrl)
  return (
    <article className="convention-welcome mx-auto max-w-[720px] space-y-10">
      <header className="space-y-3 border-b border-dc-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">Welcome</p>
        <h2 className="font-serif text-2xl font-bold text-dc-text sm:text-3xl">
          Welcome to {convention.name || 'the convention'}
        </h2>
        {convention.description ? (
          <p className="text-dc-text-muted leading-relaxed">{convention.description}</p>
        ) : null}
      </header>

      {guide.checkInMarkdown.trim().length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-dc-text">Check-in</h3>
          <MarkdownBlock value={guide.checkInMarkdown} />
        </section>
      ) : null}

      {hasTicketing ? (
        <section className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-5 space-y-3">
          <h3 className="text-lg font-semibold text-dc-text">Tickets &amp; waivers</h3>
          <ul className="space-y-2 text-sm">
            {guide.ticketingUrl ? (
              <li>
                <a
                  href={guide.ticketingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dc-accent font-medium hover:underline"
                >
                  Buy a ticket &rarr;
                </a>
              </li>
            ) : null}
            {guide.rabbitsignUrl ? (
              <li>
                <a
                  href={guide.rabbitsignUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dc-accent font-medium hover:underline"
                >
                  Sign waivers (RabbitSign) &rarr;
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.id} className="space-y-3">
          <h3 className="text-lg font-semibold text-dc-text">{section.title}</h3>
          <MarkdownBlock value={section.markdown ?? ''} />
        </section>
      ))}

      {guide.conductCheckpoints.length > 0 ? (
        <section className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
          <h3 className="text-lg font-semibold text-amber-100">Conduct &amp; safety acknowledgements</h3>
          <ul className="space-y-3 text-sm text-dc-text-muted">
            {guide.conductCheckpoints.map((cp) => (
              <li key={cp.id}>
                <p className="font-semibold text-dc-text">{cp.title}</p>
                {cp.body ? <MarkdownBlock value={cp.body} /> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
