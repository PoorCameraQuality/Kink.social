import FeedReactionsRow from '@/components/feed/FeedReactionsRow'
import {
  IconDiscuss,
  IconShare,
} from '@/components/feed/FeedInteractionIcons'
import FeedTapControl from '@/components/feed/FeedTapControl'
import ReportAction from '@/components/moderation/ReportAction'
import { FEED_ACTION_LABELS, type FeedReactionId } from '@c2k/shared'
import type { FeedReactionCounts } from '@/hooks/useFeedPostReactions'
import { formatFeedCommentActionLabel } from '@/lib/feed-comment-label'
import { cn } from '@/lib/cn'

type ReportProps = {
  targetType: string
  targetId: string
  targetLabel?: string
}

type Props = {
  reactionCounts: FeedReactionCounts
  viewerReaction: FeedReactionId | null
  reactionBusy?: boolean
  reactionDisabled?: boolean
  onReaction: (kind: FeedReactionId) => void
  commentCount: number
  commentHref?: string
  commentDisabled?: boolean
  shareHref?: string
  shareDisabled?: boolean
  bookmarked?: boolean
  bookmarkBusy?: boolean
  bookmarkDisabled?: boolean
  onBookmarkToggle?: () => void
  report?: ReportProps
}

function IconBookmark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4.5h12v16l-6-4-6 4v-16Z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function FeedPostActionBar({
  reactionCounts,
  viewerReaction,
  reactionBusy,
  reactionDisabled,
  onReaction,
  commentCount,
  commentHref,
  commentDisabled,
  shareHref,
  shareDisabled,
  bookmarked = false,
  bookmarkBusy,
  bookmarkDisabled,
  onBookmarkToggle,
  report,
}: Props) {
  return (
    <div className="feed-action-bar" role="group" aria-label="Post interactions">
      <div className="feed-action-bar__track c2k-no-scrollbar">
        <FeedReactionsRow
          inline
          compact
          centered
          reactionCounts={reactionCounts}
          viewerReaction={viewerReaction}
          busy={reactionBusy}
          disabled={reactionDisabled}
          onReaction={onReaction}
        />

        <span className="feed-action-bar__vdivider" aria-hidden />

        {commentHref && !commentDisabled ?
          <FeedTapControl
            as="link"
            to={commentHref}
            className="feed-action-bar__btn"
            aria-label="Comment on this post"
            title="View and add comments"
          >
            <IconDiscuss className="h-4 w-4 shrink-0" />
            <span className="feed-action-bar__label">{formatFeedCommentActionLabel(commentCount)}</span>
          </FeedTapControl>
        : (
          <FeedTapControl
            disabled
            className="feed-action-bar__btn opacity-70"
            aria-label="Comments unavailable"
          >
            <IconDiscuss className="h-4 w-4 shrink-0" />
            <span className="feed-action-bar__label">{FEED_ACTION_LABELS.discuss}</span>
          </FeedTapControl>
        )}

        {shareHref && !shareDisabled ?
          <FeedTapControl as="link" to={shareHref} className="feed-action-bar__btn" aria-label="Share post">
            <IconShare className="h-4 w-4 shrink-0" />
            <span className="feed-action-bar__label">Share</span>
          </FeedTapControl>
        : (
          <FeedTapControl disabled className="feed-action-bar__btn opacity-70" aria-label="Share unavailable">
            <IconShare className="h-4 w-4 shrink-0" />
            <span className="feed-action-bar__label">Share</span>
          </FeedTapControl>
        )}

        {onBookmarkToggle ?
          <FeedTapControl
            disabled={bookmarkDisabled || bookmarkBusy}
            ringOnTap
            aria-pressed={bookmarked}
            onClick={onBookmarkToggle}
            className={cn('feed-action-bar__btn', bookmarked && 'text-dc-accent')}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <IconBookmark className={cn('h-4 w-4 shrink-0', bookmarked && 'fill-current')} />
            <span className="feed-action-bar__label">{bookmarked ? 'Saved' : 'Save'}</span>
          </FeedTapControl>
        : null}

        {report ?
          <ReportAction
            variant="button"
            targetType={report.targetType}
            targetId={report.targetId}
            targetLabel={report.targetLabel ?? 'feed post'}
            surface="feed"
            className="feed-action-bar__btn !min-h-0 !min-w-0 !px-2 !py-1 !text-[11px] !font-medium !text-dc-muted hover:!text-dc-text sm:!text-xs"
          />
        : null}
      </div>
    </div>
  )
}
