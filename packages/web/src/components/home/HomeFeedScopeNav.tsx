import { Link, useLocation } from 'react-router-dom'
import {
  homeFollowingHref,
  homeNearYouHref,
  homeDiscoverHref,
  resolveCommunityNavState,
} from '@/lib/community-nav'
import { EXPLORE_DASHBOARD_PATH } from '@/lib/app-routes'

const feedTabClass = (selected: boolean) =>
  `inline-flex min-h-touch items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface ${
    selected ?
      'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
    : 'border-dc-border bg-transparent text-dc-muted hover:border-dc-border-strong hover:text-dc-text'
  }`

type Props = {
  className?: string
}

const SCOPE_HELPER: Record<'following' | 'near-you' | 'trending', string> = {
  following: 'Activity from people you follow or connect with.',
  'near-you': 'Public posts from the wider community, shaped by privacy and safety settings.',
  trending: 'Explore community highlights across people, groups, events, and spaces.',
}

/**
 * Home feed scope tabs: Following, Near you, Trending.
 * Mobile/tablet: rendered inside CommunityNavBar (below lg).
 * Desktop: rendered in HomePageClient at lg+ when three-column feed shell is active.
 */
export default function HomeFeedScopeNav({ className = '' }: Props) {
  const { pathname, search } = useLocation()
  const { mode, tab } = resolveCommunityNavState(pathname, search)
  const trendingActive = pathname === EXPLORE_DASHBOARD_PATH || (mode === 'discover' && tab === 'Trending')
  const activeScope =
    mode === 'following' ? 'following'
    : mode === 'discover' && tab === 'Local' ? 'near-you'
    : trendingActive ? 'trending'
    : 'trending'

  return (
    <div className={className}>
    <nav
      className="flex gap-1 overflow-x-auto pb-0.5 c2k-no-scrollbar"
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
        aria-selected={trendingActive}
        className={feedTabClass(trendingActive)}
      >
        Trending
      </Link>
    </nav>
    <p className="mt-2 text-xs leading-relaxed text-dc-muted" id="home-feed-scope-helper">
      {SCOPE_HELPER[activeScope]}
    </p>
    </div>
  )
}
