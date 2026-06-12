import { Link } from 'react-router-dom'

const PREVIEW_CARDS = [
  {
    id: 'event',
    eyebrow: 'Upcoming event',
    title: 'Friday Munch · Center City',
    meta: 'Sat 7 PM · 24 going',
    href: '/events',
    accent: 'from-red-950/40 to-dc-elevated-solid',
    border: 'border-red-500/25',
  },
  {
    id: 'group',
    eyebrow: 'Local group',
    title: 'Philly Rope Collective',
    meta: '128 members · Education focus',
    href: '/groups',
    accent: 'from-violet-950/40 to-dc-elevated-solid',
    border: 'border-violet-500/25',
  },
  {
    id: 'post',
    eyebrow: 'Community post',
    title: '“Great class last night — thanks to everyone who showed up.”',
    meta: 'Alex · 12 reactions',
    href: '/home',
    accent: 'from-dc-surface-muted to-dc-elevated-solid',
    border: 'border-dc-border',
  },
  {
    id: 'organizer',
    eyebrow: 'Organizer tool',
    title: 'Door check-in & roster',
    meta: 'Mobile-ready for event night',
    href: '/events',
    accent: 'from-amber-950/35 to-dc-elevated-solid',
    border: 'border-amber-500/25',
  },
  {
    id: 'safety',
    eyebrow: 'Privacy & safety',
    title: 'You control visibility',
    meta: 'Block, report, and consent-first tools',
    href: '/guidelines',
    accent: 'from-sky-950/35 to-dc-elevated-solid',
    border: 'border-sky-500/25',
  },
] as const

export default function LandingProductPreview() {
  return (
    <section className="public-container py-10 sm:py-14" aria-labelledby="landing-preview-heading">
      <div className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pub-gold-muted)]">Inside kink.social</p>
        <h2 id="landing-preview-heading" className="mt-2 text-2xl font-bold text-[var(--pub-text)] sm:text-3xl">
          Real community energy — not just a signup form
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--pub-text-muted)] sm:text-base">
          Events, groups, conversations, and organizer tools in one place — built for adults who show up in person.
        </p>
      </div>

      <div className="c2k-snap-carousel">
        <div className="c2k-snap-carousel__track sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-5">
          {PREVIEW_CARDS.map((card) => (
            <Link
              key={card.id}
              to={card.href}
              className={`group w-[min(78vw,17rem)] sm:w-auto rounded-2xl border ${card.border} bg-gradient-to-br ${card.accent} p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 sm:min-h-[9.5rem]`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--pub-gold-muted)]">{card.eyebrow}</p>
              <p className="mt-2 line-clamp-3 text-sm font-semibold leading-snug text-[var(--pub-text)]">{card.title}</p>
              <p className="mt-2 text-xs text-[var(--pub-text-muted)]">{card.meta}</p>
              <span className="mt-3 inline-flex text-xs font-medium text-[var(--pub-gold-bright)] group-hover:underline">
                Explore →
              </span>
            </Link>
          ))}
        </div>
        <div className="c2k-snap-carousel__fade sm:hidden" aria-hidden />
        <p className="mt-2 text-xs text-[var(--pub-text-muted)] sm:hidden">Swipe to explore the product →</p>
      </div>
    </section>
  )
}
