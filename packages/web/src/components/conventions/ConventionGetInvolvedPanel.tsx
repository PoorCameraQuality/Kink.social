'use client'

import { Link } from 'react-router-dom'
import { useApiConventionParticipation } from '@/hooks/useApiConventionParticipation'

type Props = {
  conventionSlug: string
  isAuthenticated: boolean
}

function pathwayBadge(open: boolean, pending?: boolean) {
  if (pending) return { label: 'Pending review', className: 'bg-sky-500/20 text-sky-200' }
  if (open) return { label: 'Open', className: 'bg-emerald-500/20 text-emerald-200' }
  return { label: 'Closed', className: 'bg-dc-elevated-muted text-dc-muted' }
}

export default function ConventionGetInvolvedPanel({ conventionSlug, isAuthenticated }: Props) {
  const { data, loading, err } = useApiConventionParticipation(conventionSlug)

  if (loading) return <p className="text-sm text-dc-muted">Loading ways to participate…</p>
  if (err) return null

  const pathways = data?.pathways
  if (!pathways) return null

  const anyOpen =
    pathways.present.open ||
    pathways.vendor.open ||
    pathways.staff.open ||
    pathways.volunteer.open

  const my = data?.myStatus
  const cards = [
    {
      key: 'present',
      title: 'Apply to present',
      blurb: 'Submit classes from your presenter catalog for program review.',
      pathway: pathways.present,
      pending: my?.presenterPending,
    },
    {
      key: 'vendor',
      title: 'Apply to vend',
      blurb: 'Request a vendor booth for this event.',
      pathway: pathways.vendor,
    },
    {
      key: 'staff',
      title: 'Apply as staff',
      blurb: 'Join the event team with a structured application.',
      pathway: pathways.staff,
    },
    {
      key: 'volunteer',
      title: 'Apply as volunteer',
      blurb: 'Help run the event with a flexible volunteer application.',
      pathway: pathways.volunteer,
    },
  ]

  return (
    <section id="get-involved" className="scroll-mt-24 rounded-2xl border border-dc-border bg-dc-elevated/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-dc-accent">Get involved</p>
          <h2 className="mt-1 text-lg font-semibold text-dc-text">Participate in this event</h2>
          <p className="mt-1 max-w-xl text-sm text-dc-muted">
            Present, vend, or join as staff or volunteer. Organizers review applications and send formal offer letters.
          </p>
          <p className="mt-2 max-w-xl text-xs text-dc-muted">
            You do not need to register as an attendee to apply. Sign in with your presenter or vendor profile when
            a path is open.
          </p>
          {!anyOpen ?
            <p className="mt-2 text-xs text-dc-muted">No apply paths are open yet. Check back or sign in if you have a pending offer.</p>
          : null}
        </div>
        {isAuthenticated && my && (my.pendingOffers ?? 0) > 0 ?
          <Link
            to={`/conventions/${conventionSlug}/my-offers`}
            className="rounded-xl bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/30"
          >
            {my.pendingOffers} offer{(my.pendingOffers ?? 0) === 1 ? '' : 's'} waiting
          </Link>
        : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => {
          const badge = pathwayBadge(c.pathway.open, c.key === 'present' ? c.pending : undefined)
          const canApply = c.pathway.open && c.pathway.applyUrl && isAuthenticated
          return (
            <div
              key={c.key}
              className="rounded-xl border border-dc-border bg-dc-surface-muted/60 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-dc-text">{c.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-dc-muted">{c.blurb}</p>
              {canApply ?
                <Link
                  to={c.pathway.applyUrl!}
                  className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-dc-accent px-3 text-xs font-medium text-dc-text hover:bg-dc-accent-hover"
                >
                  Apply
                </Link>
              : c.pathway.open && c.pathway.applyUrl ?
                <Link
                  to={`/login?returnTo=${encodeURIComponent(c.pathway.applyUrl)}`}
                  className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-dc-accent-border/50 px-3 text-xs font-medium text-dc-accent hover:bg-dc-accent/10"
                >
                  Sign in to apply
                </Link>
              : (
                <p className="mt-3 text-xs text-dc-muted">Not open at this time.</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
