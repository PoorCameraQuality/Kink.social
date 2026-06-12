import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ConventionHeroPreviewRole = 'attendee' | 'staff' | 'safety' | 'public'

type RegistrationCta = {
  href: string
  label: string
  /** When true, renders the secondary "You're registered" pill instead of a CTA button. */
  registered?: boolean
}

type OrgChip = {
  href: string
  label: string
}

type AnchorChip = {
  href: string
  label: string
}

export type ConventionHeroProps = {
  banner: string | null
  logo: string | null
  eyebrow: string | null
  title: string
  subtitle: string | null
  startsAt: string | null
  endsAt: string | null
  timezone: string | null
  themeAccent?: string | null
  organization?: OrgChip | null
  anchorEvent?: AnchorChip | null
  registrationCta?: RegistrationCta | null
  /** In-page or route link for present/vend/staff apply - separate from attendee registration. */
  participateHref?: string | null
  organizerConsoleHref?: string | null
  showPin?: boolean
  isPinned?: boolean
  onTogglePin?: () => void | Promise<void>
  previewRole?: ConventionHeroPreviewRole | null
  onExitPreview?: () => void
}

function formatDateRange(startsAt: string | null, endsAt: string | null, timezone: string | null): string {
  if (!startsAt) return ''
  try {
    const tz = timezone ?? 'America/New_York'
    const start = new Date(startsAt)
    const end = endsAt ? new Date(endsAt) : null
    const dayFmt = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: tz,
    })
    const startLabel = dayFmt.format(start)
    if (!end) return startLabel
    const sameDay =
      start.toDateString() === end.toDateString() ||
      dayFmt.format(start) === dayFmt.format(end)
    if (sameDay) {
      const timeFmt = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: tz,
      })
      return `${startLabel} · ${timeFmt.format(start)}\u2013${timeFmt.format(end)}`
    }
    const endLabel = dayFmt.format(end)
    return `${startLabel} \u2013 ${endLabel}`
  } catch {
    return ''
  }
}

function PreviewBanner({
  role,
  onExitPreview,
}: {
  role: ConventionHeroPreviewRole
  onExitPreview?: () => void
}) {
  const roleLabel: Record<ConventionHeroPreviewRole, string> = {
    attendee: 'Attendee',
    staff: 'Staff',
    safety: 'Safety team',
    public: 'Public (signed out)',
  }
  return (
    <div className="bg-dc-accent text-dc-accent-foreground text-sm font-semibold">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-dc-surface-muted animate-pulse" />
          Previewing as <span className="underline decoration-dc-surface/40 underline-offset-2">{roleLabel[role]}</span>
        </span>
        <button
          type="button"
          onClick={onExitPreview}
          className="rounded-full bg-dc-surface-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-dc-accent hover:opacity-90"
        >
          Exit preview
        </button>
      </div>
    </div>
  )
}

/**
 * Public convention hero. Composes the anchor event's banner photo with the
 * convention logo overlay, applies the theme accent if provided, and renders
 * the registration CTA + organizer console link. Falls back gracefully when
 * banner / logo are missing.
 */
export default function ConventionHero({
  banner,
  logo,
  eyebrow,
  title,
  subtitle,
  startsAt,
  endsAt,
  timezone,
  themeAccent,
  organization,
  anchorEvent,
  registrationCta,
  participateHref,
  organizerConsoleHref,
  showPin,
  isPinned,
  onTogglePin,
  previewRole,
  onExitPreview,
}: ConventionHeroProps) {
  const dateLabel = formatDateRange(startsAt, endsAt, timezone)
  const accentStyle: CSSProperties = themeAccent
    ? { ['--hero-accent' as string]: themeAccent, ['--event-accent' as string]: themeAccent }
    : {
        ['--hero-accent' as string]: 'var(--dc-accent, rgba(45, 212, 191, 0.95))',
        ['--event-accent' as string]: 'var(--dc-accent, rgba(45, 212, 191, 0.95))',
      }

  const gradientStyle: CSSProperties = banner
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(8, 8, 12, 0.15) 0%, rgba(8, 8, 12, 0.55) 60%, rgba(8, 8, 12, 0.92) 100%), url(${JSON.stringify(banner)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(135deg, var(--hero-accent) 0%, rgba(15, 23, 42, 0.92) 75%)`,
      }

  const ctaNode: ReactNode =
    registrationCta || participateHref ?
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
        {registrationCta?.registered ?
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/50 backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Registered
          </span>
        : null}
        {registrationCta ?
          <Link
            to={registrationCta.href}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold shadow-lg ${
              registrationCta.registered ?
                'border border-white/30 bg-dc-elevated-muted text-dc-text backdrop-blur-sm hover:bg-white/20'
              : 'bg-dc-accent text-dc-accent-foreground hover:bg-dc-accent-hover'
            }`}
            style={
              registrationCta.registered ?
                undefined
              : { backgroundColor: 'var(--hero-accent, var(--event-accent))', color: 'var(--dc-surface, #0b0d12)' }
            }
          >
            {registrationCta.registered ? 'Manage registration' : registrationCta.label}
          </Link>
        : null}
        {participateHref ?
          <a
            href={participateHref}
            className="inline-flex min-h-10 items-center justify-center text-sm font-medium text-dc-accent/95 underline-offset-2 hover:text-dc-accent hover:underline sm:rounded-xl sm:border sm:border-white/35 sm:bg-dc-elevated-muted sm:px-4 sm:text-dc-text sm:no-underline sm:hover:bg-white/20"
          >
            Present, vend, or volunteer
          </a>
        : null}
      </div>
    : null

  return (
    <header className="convention-hero" style={accentStyle}>
      {previewRole ? <PreviewBanner role={previewRole} onExitPreview={onExitPreview} /> : null}
      <div className="relative isolate flex min-h-[12.5rem] flex-col sm:min-h-[360px]" style={gradientStyle}>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-4 py-5 sm:gap-4 sm:px-6 sm:py-10">
          {/* Top row: org chip + organizer console link */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              {eyebrow ? (
                <span className="rounded-full bg-dc-elevated-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-dc-text/85 ring-1 ring-white/20 backdrop-blur-sm">
                  {eyebrow}
                </span>
              ) : null}
              {organization ? (
                <Link
                  to={organization.href}
                  className="rounded-full bg-dc-elevated-muted px-2.5 py-1 text-xs font-medium text-dc-text/90 ring-1 ring-white/15 backdrop-blur-sm hover:bg-white/15 hover:text-dc-text"
                >
                  {organization.label}
                </Link>
              ) : null}
              {anchorEvent ? (
                <Link
                  to={anchorEvent.href}
                  className="rounded-full bg-dc-elevated-muted px-2.5 py-1 text-xs font-medium text-dc-text/80 ring-1 ring-white/15 backdrop-blur-sm hover:bg-white/15 hover:text-dc-text"
                >
                  Calendar event &rarr;
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {showPin && onTogglePin ?
                <button
                  type="button"
                  onClick={() => void onTogglePin()}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold backdrop-blur-sm ${
                    isPinned ?
                      'border-dc-accent-border/50 bg-dc-accent/20 text-dc-accent'
                    : 'border-white/30 bg-dc-elevated-muted text-dc-text hover:bg-white/20'
                  }`}
                  aria-pressed={isPinned}
                  aria-label={isPinned ? 'Unpin from home feed' : 'Pin to home feed'}
                >
                  <span aria-hidden>{isPinned ? '★' : '☆'}</span>
                  {isPinned ? 'Pinned' : 'Pin'}
                </button>
              : null}
              {organizerConsoleHref ?
                <Link
                  to={organizerConsoleHref}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/30 bg-dc-elevated-muted px-3 text-xs font-semibold text-dc-text backdrop-blur-sm hover:bg-white/20"
                >
                  Organizer dashboard
                </Link>
              : null}
            </div>
          </div>

          {/* Spacer to push title to bottom of hero */}
          <div className="flex-1" />

          {/* Bottom row: logo + title block + CTA */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {logo ? (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-2 shadow-xl ring-1 ring-white/40 sm:h-24 sm:w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt="" className="h-full w-full object-contain" />
                </div>
              ) : null}
              <div className="min-w-0">
                <h1 className="font-serif text-2xl font-bold leading-tight text-dc-text drop-shadow sm:text-3xl lg:text-4xl">
                  {title}
                </h1>
                {dateLabel ? (
                  <p className="mt-2 text-sm text-dc-text/85 drop-shadow sm:text-base">{dateLabel}</p>
                ) : null}
                {subtitle ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dc-text/80 drop-shadow sm:text-[15px]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            {ctaNode}
          </div>
        </div>
      </div>
    </header>
  )
}
