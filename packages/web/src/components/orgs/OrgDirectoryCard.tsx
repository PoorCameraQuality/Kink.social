import { Link } from 'react-router-dom'
import { formatOrgRating } from '@/lib/org-reputation-display'
import { stripHtml } from '@/lib/stripHtml'
import { isVerifiedOrganizer, type OrgDirectoryModel } from '@/lib/org-directory-utils'

const BADGE_CLASS: Record<string, string> = {
  gold: 'border-dc-accent/50 bg-dc-accent-muted/30 text-dc-accent',
  green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  blue: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  purple: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  muted: 'border-dc-border bg-dc-elevated-solid text-dc-muted',
}

function orgInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

function bioPreview(org: OrgDirectoryModel): string | null {
  if (!org.bio?.trim()) return null
  if (org.bioFormat === 'html' || org.bio.includes('<')) return stripHtml(org.bio)
  return org.bio.trim()
}

function regionDisplay(region: string | null): string | null {
  if (!region) return null
  if (region.includes(',')) return region
  if (region === 'Multi-region') return 'Global reach'
  return `${region}, USA`
}

type Props = {
  org: OrgDirectoryModel
  canManage: boolean
}

function StatItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-dc-muted">
      <span className="text-dc-accent/80" aria-hidden>
        {icon}
      </span>
      {children}
    </span>
  )
}

export default function OrgDirectoryCard({ org, canManage }: Props) {
  const publicHref = `/orgs/${encodeURIComponent(org.slug)}`
  const consoleHref = `/organizer/orgs/${encodeURIComponent(org.slug)}`
  const preview = bioPreview(org)
  const region = regionDisplay(org.regionLabel)
  const verified = isVerifiedOrganizer(org)

  const outlineBtn =
    'inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border border-dc-accent/60 px-2.5 text-xs font-semibold text-dc-accent hover:bg-dc-accent-muted/30'
  const solidBtn =
    'inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-dc-accent px-2.5 text-xs font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover'

  return (
    <article className="flex h-full flex-col rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)] transition-colors hover:border-dc-accent-border/40">
      <div className="flex gap-3">
        {org.logoUrl ?
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 p-1 ring-1 ring-dc-border/60">
            <img src={org.logoUrl} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
          </div>
        : <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dc-accent-muted text-xs font-bold text-dc-accent"
            aria-hidden
          >
            {orgInitials(org.displayName)}
          </div>
        }
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-dc-text line-clamp-2">
              {org.displayName}
            </h3>
            {verified ?
              <span className="flex shrink-0 items-center gap-0.5 text-dc-accent" title="Verified organizer">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 013.296-1.043 3.745 3.745 0 013.296 1.043A3.745 3.745 0 0121 12Z" />
                </svg>
                <svg className="h-3.5 w-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9c0 5.591 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </span>
            : null}
          </div>
          <p className="mt-0.5 text-[10px] text-dc-muted truncate">/{org.slug}</p>
        </div>
      </div>

      <span className="mt-2.5 inline-flex w-fit max-w-full rounded-md border border-violet-500/35 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-200 line-clamp-1">
        {org.roleLabel}
      </span>

      {region ?
        <p className="mt-1.5 text-[11px] text-dc-text-muted">{region}</p>
      : null}

      {preview ?
        <p className="mt-2 text-xs leading-relaxed text-dc-text-muted line-clamp-3">{preview}</p>
      : null}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        <StatItem
          icon={
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        >
          {formatOrgRating(org.rating, org.reviewCount)} ({org.reviewCount})
        </StatItem>
        <StatItem
          icon={
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          {org.memberCount ?? 0}
        </StatItem>
        {(org.upcomingEventsCount ?? 0) > 0 ?
          <StatItem
            icon={
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            {org.upcomingEventsCount} upcoming
          </StatItem>
        : null}
        {(org.groupCount ?? 0) > 0 ?
          <StatItem
            icon={
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          >
            {org.groupCount} {org.groupCount === 1 ? 'group' : 'groups'}
          </StatItem>
        : null}
      </div>

      {org.badges.length > 0 ?
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {org.badges.map((badge) => (
            <span
              key={badge.id}
              className={`inline-flex rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${BADGE_CLASS[badge.tone] ?? BADGE_CLASS.muted}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      : null}

      <div className="mt-auto flex gap-2 pt-4">
        {canManage ?
          <>
            <Link to={consoleHref} className={solidBtn}>
              Open dashboard
            </Link>
            <Link to={publicHref} className={outlineBtn}>
              Public page
            </Link>
          </>
        : (
          <Link to={publicHref} className={`${solidBtn} w-full`}>
            View organization
          </Link>
        )}
      </div>
    </article>
  )
}
