import { useMemo } from 'react'
import LocalPostCard from '@/components/cards/LocalPostCard'

import ActivityFeedCard from '@/components/home/ActivityFeedCard'
import { followingFeedItemReason } from '@/lib/following-feed-present'
import HomeFeedRichComposer from '@/components/home/HomeFeedRichComposer'
import HomeMobileComposer from '@/components/home/HomeMobileComposer'
import FeedScopeTabs from '@/components/home/FeedScopeTabs'

import Button from '@/components/ui/Button'

import { Panel } from '@/components/dancecard/ui/Panel'
import TabShell, { TabShellButton } from '@/components/ui/TabShell'

import EmptyState from '@/components/ui/EmptyState'

import LoadErrorBanner from '@/components/ui/LoadErrorBanner'

import { FeedCardSkeleton } from '@/components/ui/skeleton'


import { useFollowingFeed } from '@/hooks/useApiFeed'
import { presentFollowingFeedItems } from '@/lib/following-feed-demo'

import {

  FOLLOWING_FILTERS,

  isFollowingFilterComingSoon,

  useFollowingFeedCounts,

  useFollowingFilterPrefs,

} from '@/hooks/useFollowingFilterPrefs'

import { useAuth, useViewerUsername } from '@/contexts/AuthContext'



type Props = {
  onPosted?: () => void
  onRepost?: (originalPostId: string) => void
  feedShell?: boolean
}

export default function FollowingFeedTab({ onPosted, onRepost, feedShell = false }: Props) {

  const viewerUsername = useViewerUsername()
  const { viewerDisplayName } = useAuth()
  const composerName = viewerDisplayName ?? viewerUsername ?? 'there'

  const { filter, setFilter, loaded: filterLoaded } = useFollowingFilterPrefs(true)

  const filterComingSoon = isFollowingFilterComingSoon(filter)

  const feed = useFollowingFeed(!filterComingSoon, filter)

  const counts = useFollowingFeedCounts(true, feed.items.length)

  const presentedItems = useMemo(
    () => (feed.status === 'ready' ? presentFollowingFeedItems(feed.items) : []),
    [feed.items, feed.status],
  )

  const composerPlaceholder = feedShell
    ? 'Share an update with your community…'
    : `What's on your mind, ${composerName}?`

  return (
    <div className="w-full dc-panel-enter">
      {feedShell ?
        <HomeMobileComposer
          viewerUsername={viewerUsername ?? ''}
          viewerInitial={viewerUsername ? viewerUsername.charAt(0).toUpperCase() : '?'}
          useDbComposer
          composerPlaceholder={composerPlaceholder}
          onPosted={() => {
            feed.reload()
            onPosted?.()
          }}
        />
      : <section
        id="home-feed-composer"
        className="scroll-mt-24 mb-4"
        aria-label="Share an update"
      >
        <Panel className="border-dc-border bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]">
            <div className="flex gap-3">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-dc-accent/30 text-base font-semibold text-dc-accent"
                aria-hidden
              >
                {viewerUsername ? viewerUsername.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="min-w-0 flex-1">
                <HomeFeedRichComposer
                  showQuickActions
                  composerPlaceholder={composerPlaceholder}
                  onPosted={() => {
                    feed.reload()
                    onPosted?.()
                  }}
                />
              </div>
            </div>
          </Panel>
      </section>}

      {!feedShell ? <FeedScopeTabs showHeading /> : null}

      {filterLoaded ?
        <TabShell className="mb-4 w-full max-w-full overflow-x-auto" aria-label="Following feed filters">
          {FOLLOWING_FILTERS.map(({ id, label }) => {
            const badge = counts?.[id]
            const showBadge = typeof badge === 'number' && badge > 0 && id !== 'all'
            return (
              <TabShellButton key={id} selected={filter === id} onClick={() => setFilter(id)}>
                {showBadge ? `${label} (${badge})` : label}
              </TabShellButton>
            )
          })}
        </TabShell>
      : null}

      {filterComingSoon ?
        <EmptyState
          inline
          variant="surface"
          align="center"
          className="rounded-2xl border border-dc-border/80 bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]"
          title="Video feed coming soon"
          message="A dedicated view for video from your connections is on the way. Browse all activity for now, or explore community media channels."
          actions={[
            { label: 'All activity', onClick: () => setFilter('all'), primary: true },
            { label: 'Browse media', href: '/media' },
          ]}
        />
      : null}

      {!filterComingSoon && feed.status === 'loading' ? (
        <div className="mb-4 dc-panel-enter" aria-busy="true" aria-live="polite">
          <p className="mb-3 text-sm text-dc-muted">Loading your feed…</p>
          <FeedCardSkeleton count={4} />
        </div>
      ) : null}

      {!filterComingSoon && feed.status === 'error' && feed.error ? <LoadErrorBanner className="mb-4" message={feed.error} onRetry={() => feed.reload()} /> : null}



      {!filterComingSoon && feed.status === 'ready' && presentedItems.length === 0 ?
        feed.connectionCount === 0 ?

          <EmptyState

            title="Follow people to see their activity here"

            message="Connect with people you know. Their posts and event activity will show up in this feed."

            nextSteps={['Open Discover People', 'Send a connection request', 'Return here for updates']}

            ctaLabel="Find people"

            ctaHref="/people"

          />

        : <EmptyState

            title="Nothing yet"

            message="Check Discover for events and conventions near you."

            nextSteps={['Browse local events', 'Pin conventions to follow']}

            ctaLabel="Open Discover"

            ctaHref="/home?mode=discover&tab=Local"

          />

      : null}

      {!filterComingSoon && feed.status === 'ready' && presentedItems.length > 0 ?
        <p className="mb-3 text-sm leading-relaxed text-dc-text-muted">
          Updates from people you are connected with, newest first.
        </p>
      : null}

      {!filterComingSoon ?
        <div className="feed-stream dc-feed-stagger">

        {presentedItems.map((item) => {
          const key = item.kind === 'post' ? `post-${item.post.id}` : `activity-${item.cursor}`
          return item.kind === 'post' ?
              <LocalPostCard
                key={key}
                post={item.post}
                layout="feed"
                feedStreamReason={followingFeedItemReason(item)}
                onRepost={onRepost}
              />
            : <ActivityFeedCard key={key} item={item} />
        })}

      </div>
      : null}



      {!filterComingSoon && feed.nextCursor ?

        <div className="mt-6 flex justify-center">

          <Button

            type="button"

            variant="secondary"

            disabled={feed.loadingMore}

            onClick={() => feed.loadMore()}

            className="rounded-xl"

          >

            {feed.loadingMore ? 'Loading…' : 'Load more'}

          </Button>

        </div>

      : null}

    </div>

  )

}

