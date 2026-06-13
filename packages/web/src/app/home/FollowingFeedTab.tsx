import LocalPostCard from '@/components/cards/LocalPostCard'

import ActivityFeedCard from '@/components/home/ActivityFeedCard'

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

import {

  FOLLOWING_FILTERS,

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

  const feed = useFollowingFeed(true, filter)

  const counts = useFollowingFeedCounts(true, feed.items.length)



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

      <FeedScopeTabs showHeading={feedShell} hideOnDesktop={feedShell} />

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

      {feed.status === 'loading' ? (
        <div className="mb-4 dc-panel-enter" aria-busy="true" aria-live="polite">
          <p className="mb-3 text-sm text-dc-muted">Loading your feed…</p>
          <FeedCardSkeleton count={4} />
        </div>
      ) : null}

      {feed.status === 'error' && feed.error ? <LoadErrorBanner className="mb-4" message={feed.error} onRetry={() => feed.reload()} /> : null}



      {feed.status === 'ready' && feed.items.length === 0 ?
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



      <div className="space-y-4">

        {feed.items.map((item) =>

          item.kind === 'post' ?

            <LocalPostCard key={`post-${item.post.id}`} post={item.post} layout="feed" onRepost={onRepost} />

          : <ActivityFeedCard key={`activity-${item.cursor}`} item={item} />,

        )}

      </div>



      {feed.nextCursor ?

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

