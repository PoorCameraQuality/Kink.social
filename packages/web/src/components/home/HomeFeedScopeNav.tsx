import { Link, useLocation } from 'react-router-dom'
import {
  homeFollowingHref,
  homeNearYouHref,
  homeDiscoverHref,
  resolveCommunityNavState,
} from '@/lib/community-nav'

const feedTabClass = (selected: boolean) =>
  `inline-flex min-h-touch items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface ${
    selected ?
      'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
    : 'border-dc-border bg-transparent text-dc-muted hover:border-dc-border-strong hover:text-dc-text'
  }`

type Props = {
  className?: string
}

/**
 * Home feed scope tabs: Following, Near you, Trending.
 * Mobile/tablet: rendered inside CommunityNavBar (below lg).
 * Desktop: rendered in HomePageClient at lg+ when three-column feed shell is active.
 */
export default function HomeFeedScopeNav({ className = '' }: Props) {
  const { pathname, search } = useLocation()
  const { mode, tab } = resolveCommunityNavState(pathname, search)

  return (
    <nav
      className={`flex gap-1 overflow-x-auto pb-0.5 c2k-no-scrollbar ${className}`.trim()}
      aria-label="Home feed scope"
      role="tablist"
    >
      <Link
        to={homeFollowingHref()}
        role="tab"
        aria-selected={mode === 'following'}
        className={feedTabClass(mode === 'following')}
      >
        Following
      </Link>
      <Link
        to={homeNearYouHref()}
        role="tab"
        aria-selected={mode === 'discover' && tab === 'Local'}
        className={feedTabClass(mode === 'discover' && tab === 'Local')}
      >
        Near you
      </Link>
      <Link
        to={homeDiscoverHref('Trending')}
        role="tab"
        aria-selected={mode === 'discover' && tab === 'Trending'}
        className={feedTabClass(mode === 'discover' && tab === 'Trending')}
      >
        Trending
      </Link>
    </nav>
  )
}
