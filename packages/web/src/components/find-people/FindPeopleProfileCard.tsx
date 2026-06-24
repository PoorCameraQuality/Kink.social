import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import PersonAvatar from '@/components/PersonAvatar'
import ReportAction from '@/components/moderation/ReportAction'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { profileTarget } from '@/lib/moderation/report-targets'
import { activityIndicatorFromISO } from '@/lib/profile-activity'
import {
  formatPersonContextLine,
  getPersonCommunityBadges,
} from '@/lib/people-directory-utils'
import type { MockPerson } from '@/data/types'

type Props = {
  person: MockPerson
  /** Highlight card when surfaced as a recommended pick (not merely first in list). */
  recommended?: boolean
  /** Lower visual weight on mobile for cards deeper in the list */
  mobileCompact?: boolean
}

// Quiet, single-language role pills. Reserve color/accent for the verified pill
// only; community roles read as calm context, not loud rainbow tags.
const BADGE_TONE_CLASS: Record<string, string> = {
  gold: 'border-dc-accent/30 bg-dc-accent-muted/30 text-dc-accent/90',
  green: 'border-dc-border bg-dc-elevated-muted/60 text-dc-text-muted',
  blue: 'border-dc-border bg-dc-elevated-muted/60 text-dc-text-muted',
  purple: 'border-dc-border bg-dc-elevated-muted/60 text-dc-text-muted',
  orange: 'border-dc-border bg-dc-elevated-muted/60 text-dc-text-muted',
}

export default function FindPeopleProfileCard({ person, recommended, mobileCompact = false }: Props) {
  const { isAuthenticated, isFallback, viewerUserId } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [connectBusy, setConnectBusy] = useState(false)
  const [localConnectionStatus, setLocalConnectionStatus] = useState(person.connectionStatus ?? null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalConnectionStatus(person.connectionStatus ?? null)
  }, [person.connectionStatus])

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  const canReport =
    Boolean(isAuthenticated && !isFallback && viewerUserId && viewerUserId !== person.id)

  const {
    username,
    sceneName,
    location,
    verified,
    distance,
    avatarUrl,
    lastActiveAt,
    bio,
    canMessageDirectly,
  } = person

  const displayName = sceneName?.trim() || username
  const communityBadges = getPersonCommunityBadges(person)
  const visibleBadges = mobileCompact ? communityBadges.slice(0, 2) : communityBadges
  const extraBadgeCount = mobileCompact ? Math.max(0, communityBadges.length - visibleBadges.length) : 0
  const contextLine = formatPersonContextLine(person)
  const activity = activityIndicatorFromISO(lastActiveAt ?? undefined)
  const showActivity = activity.label && !activity.hidden
  const locationLine = location?.trim() || ''
  const distanceSuffix = distance?.trim() ? distance.trim() : null
  const showMessage = localConnectionStatus === 'connected' || canMessageDirectly === true
  const apiConnectEnabled = isAuthenticated && !isFallback

  const profileHref = `/profile/${username}`
  // Primary card action: View profile (neutral-strong, no rose). Rose is reserved
  // for page-level actions, not repeated per-card CTAs.
  const primaryActionClass =
    'inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-dc-border-strong bg-dc-elevated-solid px-3 text-xs font-semibold text-dc-text transition-colors hover:border-dc-accent-border/60 hover:text-dc-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dc-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface sm:min-h-11'
  // Intentional secondary (Message / Respond): accent outline, never solid.
  const secondaryAccentClass =
    'inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-dc-accent/50 bg-transparent px-3 text-xs font-semibold text-dc-accent transition-colors hover:bg-dc-accent-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dc-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface disabled:opacity-60 sm:min-h-11 sm:flex-none sm:min-w-[5.5rem]'
  // Quiet secondary (Connect): de-emphasized outline.
  const quietActionClass =
    'inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-dc-border bg-transparent px-3 text-xs font-medium text-dc-text-muted transition-colors hover:border-dc-accent-border/50 hover:text-dc-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dc-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:flex-none sm:min-w-[5.5rem]'

  const sendConnectRequest = async () => {
    if (!apiConnectEnabled || connectBusy) return
    setConnectBusy(true)
    try {
      const r = await fetch('/api/v1/connections/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientUsername: username }),
      })
      if (r.ok) {
        setLocalConnectionStatus('pending_outgoing')
        return
      }
    } catch {
      /* fall through */
    } finally {
      setConnectBusy(false)
    }
  }

  return (
    <Card
      interactive
      className={`flex h-full min-w-0 flex-col p-4 ${mobileCompact ? 'max-sm:p-3' : ''} ${
        recommended ? 'border-dc-accent-border/50 ring-1 ring-dc-accent/15' : ''
      }`}
    >
      <div className={`relative flex min-w-0 gap-3 pr-8 ${mobileCompact ? 'max-sm:gap-2.5' : ''}`}>
        <Link to={`/profile/${username}`} className="shrink-0" aria-hidden tabIndex={-1}>
          <PersonAvatar
            username={username}
            sceneName={sceneName}
            avatarUrl={avatarUrl}
            verified={verified}
            size="md"
          />
        </Link>

        <div className="min-w-0 flex-1">
          {recommended ?
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">Recommended</p>
          : null}
          <Link to={`/profile/${username}`} className="block min-w-0 hover:text-dc-accent">
            <h3 className="line-clamp-1 text-base font-semibold text-dc-text">{displayName}</h3>
            <p className="text-xs text-dc-muted">@{username}</p>
          </Link>
          {locationLine || distanceSuffix ?
            <p className="mt-0.5 line-clamp-1 text-xs text-dc-text-muted">
              {[locationLine, distanceSuffix].filter(Boolean).join(' · ')}
            </p>
          : null}
          {!mobileCompact && bio?.trim() ?
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-dc-text-muted">{bio.trim()}</p>
          : null}
          {!mobileCompact && contextLine ?
            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] leading-snug text-dc-muted">
              <svg className="h-3 w-3 shrink-0 text-dc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {contextLine}
            </p>
          : null}
          {!mobileCompact && showActivity ?
            <p className="mt-1 text-[11px] text-dc-muted">{activity.label}</p>
          : null}
          {visibleBadges.length > 0 ?
            <div className="mt-1.5 flex flex-wrap gap-1">
              {visibleBadges.map((badge) => (
                <span
                  key={badge.id}
                  className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_TONE_CLASS[badge.tone] ?? BADGE_TONE_CLASS.gold}`}
                >
                  {badge.label}
                </span>
              ))}
              {extraBadgeCount > 0 ?
                <span className="inline-flex rounded-md border border-dc-border px-1.5 py-0.5 text-[10px] font-medium text-dc-muted">
                  +{extraBadgeCount}
                </span>
              : null}
            </div>
          : null}
        </div>

        <div className="absolute right-0 top-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dc-border text-dc-muted hover:border-dc-accent-border/50 hover:text-dc-accent"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`More options for ${displayName}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {menuOpen ?
            <ul
              role="menu"
              className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded-xl border border-dc-border bg-dc-elevated-solid py-1 shadow-lg"
            >
              <li role="none">
                <Link
                  to={`/profile/${username}`}
                  role="menuitem"
                  className="block w-full px-4 py-2 text-left text-sm text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text"
                  onClick={() => setMenuOpen(false)}
                >
                  View profile
                </Link>
              </li>
              {canReport ?
                <li role="none" onClick={() => setMenuOpen(false)}>
                  <ReportAction
                    variant="menu-item"
                    targetType={profileTarget(String(person.id)).targetType}
                    targetId={profileTarget(String(person.id)).targetId}
                    targetLabel="profile"
                    surface="people_directory"
                    className="px-4 py-2 text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text"
                  />
                </li>
              : null}
            </ul>
          : null}
        </div>
      </div>

      <div className={`mt-4 flex flex-wrap items-center gap-2 border-t border-dc-border pt-3 ${mobileCompact ? 'max-sm:mt-3 max-sm:pt-2' : ''}`}>
        <Link to={profileHref} className={primaryActionClass}>
          View profile
        </Link>
        {showMessage ?
          <Link to={`/messaging?user=${encodeURIComponent(username)}`} className={secondaryAccentClass}>
            Message
          </Link>
        : localConnectionStatus === 'pending_incoming' ?
          <Link to="/connections?tab=requests" className={secondaryAccentClass}>
            Respond
          </Link>
        : localConnectionStatus === 'pending_outgoing' ?
          <button type="button" disabled className={quietActionClass}>
            Request sent
          </button>
        : apiConnectEnabled ?
          <button
            type="button"
            disabled={connectBusy}
            onClick={() => void sendConnectRequest()}
            className={quietActionClass}
          >
            {connectBusy ? 'Sending…' : 'Connect'}
          </button>
        : null}
      </div>
    </Card>
  )
}
