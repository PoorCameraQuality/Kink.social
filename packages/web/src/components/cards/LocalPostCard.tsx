import { useId, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import UserAvatar from '@/components/UserAvatar'
import CopyLinkOverflowMenu from '@/components/ui/CopyLinkOverflowMenu'
import ReportAction from '@/components/moderation/ReportAction'
import { feedPostTarget } from '@/lib/moderation/report-targets'
import FeedPostTypeBadge from '@/components/feed/FeedPostTypeBadge'
import FeedReactionsRow from '@/components/feed/FeedReactionsRow'
import FeedTapControl from '@/components/feed/FeedTapControl'
import { renderFeedAttachments, feedAttachmentHeroUrl } from '@/components/media/FeedMediaCard'
import AlphaTestBadge from '@/components/alpha/AlphaTestBadge'
import FeedPostDiscussion from '@/components/feed/FeedPostDiscussion'
import FeedPostActionBar from '@/components/feed/FeedPostActionBar'
import { feedActivityLeadLine, inferFeedPostBadge } from '@/components/feed/feedPostBadge'
import { formatFeedTimeShort } from '@/lib/following-feed-present'
import {
  IconDiscuss,
  IconRepost,
  IconShare,
} from '@/components/feed/FeedInteractionIcons'
import { useAuth } from '@/contexts/AuthContext'
import { useFeedPostReactions } from '@/hooks/useFeedPostReactions'
import { emptyFeedReactionCounts, FEED_ACTION_LABELS, type FeedReactionId } from '@c2k/shared'
import { BOOKMARK_OBJECT_FEED_POST, useApiBookmarks } from '@/hooks/useApiBookmarks'
import type { ConnectionLikerPreview, HomeFeedPost } from '@/lib/feed-types'
import { cardSurfaceInteractiveClass, cardSurfaceSolidClass } from '@/lib/card-surface'
import { feedStreamPostSurface, feedStreamPostSurfaceClass } from '@/lib/feed-stream-surface'
import { cn } from '@/lib/cn'

export type LocalPostCardProps = {
  post: HomeFeedPost
  layout?: 'default' | 'feed'
  isOwnPost?: boolean
  onEdit?: (text: string) => void
  onDelete?: () => void
  onRepost?: (originalPostId: string) => void
  /** Inline discussion thread (share page / expanded detail). */
  showDiscussion?: boolean
  /** Parent renders FollowingFeedItemContext above the card. */
  feedContextExternal?: boolean
  /** Inline Following-feed verb (replaces external context row). */
  feedStreamReason?: string | null
}

function MentionChips({ mentions }: { mentions: HomeFeedPost['mentions'] }) {
  if (!mentions.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {mentions.map((m, i) => (
        <span key={`${m.type}-${m.id ?? m.label}-${i}`} className="inline-flex items-center rounded-md bg-dc-elevated-muted px-2 py-0.5 text-xs text-dc-accent">
          @{m.label}
        </span>
      ))}
    </div>
  )
}

function QuotedPostBody({ post, dense, flat }: { post: HomeFeedPost; dense?: boolean; flat?: boolean }) {
  const primaryText = post.bodyFormat === 'html' ? null : post.body
  if (flat) {
    return (
      <div className={`border-l-2 border-l-white/10 pl-3 ${dense ? 'mt-2' : 'mt-3'}`}>
        <p className="text-[11px] text-dc-muted">
          <Link to={`/profile/${post.authorUsername}`} className="font-medium text-dc-accent hover:underline">
            @{post.authorUsername}
          </Link>
          <span className="text-dc-muted"> · {post.timeAgo}</span>
        </p>
        {post.title ? <p className="mt-1 font-display font-semibold text-dc-text">{post.title}</p> : null}
        {post.bodyFormat === 'html' ?
          <div
            className="mt-1 text-sm text-dc-text-muted prose prose-invert max-w-none [&_a]:text-dc-accent"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        : <p className="mt-1 text-sm text-dc-text-muted whitespace-pre-wrap">{primaryText}</p>}
      </div>
    )
  }
  return (
    <div className={`rounded-xl border border-dc-border bg-dc-surface-muted/80 ${dense ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center gap-2 text-sm">
        <Link to={`/profile/${post.authorUsername}`} className="font-medium text-dc-accent hover:underline">
          {post.authorUsername}
        </Link>
        <span className="text-dc-muted text-xs">{post.timeAgo}</span>
      </div>
      {post.title ? <p className="mt-1 font-display font-medium text-dc-text">{post.title}</p> : null}
      {post.bodyFormat === 'html' ? (
        <div
          className={`${dense ? 'mt-1 text-sm' : 'mt-2 text-sm'} text-dc-text-muted [&_a]:text-dc-accent prose prose-invert max-w-none`}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : (
        <p className={`${dense ? 'mt-1' : 'mt-2'} text-sm text-dc-text-muted whitespace-pre-wrap`}>{primaryText}</p>
      )}
      {post.attachments.length > 0 ?
        renderFeedAttachments(post.attachments, { maxHeightClass: 'max-h-40', className: 'mt-2' })
      : null}
    </div>
  )
}

function ConnectionLikerStack({ preview }: { preview: ConnectionLikerPreview[] }) {
  const avatars = preview.slice(0, 3)
  if (avatars.length === 0) return null
  return (
    <div className="mt-1 flex items-center gap-2 pl-1">
      <span className="flex items-center -space-x-1.5" aria-hidden>
        {avatars.map((person, i) => (
          <Link
            key={person.username}
            to={`/profile/${encodeURIComponent(person.username)}`}
            style={{ zIndex: i + 1 }}
            title={person.username}
            aria-label={`${person.username} loved this post`}
            className="relative inline-flex rounded-full ring-2 ring-[var(--dc-surface-card)]"
          >
            {person.avatarUrl ?
              <img
                src={person.avatarUrl}
                alt=""
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                className="h-5 w-5 rounded-full object-cover"
              />
            : <UserAvatar size="sm" className="!h-5 !w-5 !min-h-5 !min-w-5 [&>svg]:!h-2.5 [&>svg]:!w-2.5" />}
          </Link>
        ))}
      </span>
      <span className="text-xs text-dc-muted">Loved by connections</span>
    </div>
  )
}

export default function LocalPostCard({
  post,
  layout = 'default',
  isOwnPost,
  onEdit,
  onDelete,
  onRepost,
  showDiscussion = false,
  feedContextExternal = false,
  feedStreamReason = null,
}: LocalPostCardProps) {
  const { isAuthenticated } = useAuth()
  const bookmarkApi = useApiBookmarks(isAuthenticated && post.source === 'api')
  const editFieldId = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(post.body)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const { authorUsername, kind } = post
  const [localLikes, setLocalLikes] = useState(post.likes)
  const [connectionPreview, setConnectionPreview] = useState(post.connectionLikerPreview ?? [])

  const reactions = useFeedPostReactions(post.id, {
    reactionCounts: post.reactionCounts,
    viewerReaction: post.viewerReaction ?? (post.likedByViewer ? 'love' : null),
  })

  useEffect(() => {
    setLocalLikes(post.likes)
    setConnectionPreview(post.connectionLikerPreview ?? [])
    reactions.setReactionCounts(post.reactionCounts ?? emptyFeedReactionCounts())
    reactions.setViewerReaction(post.viewerReaction ?? (post.likedByViewer ? 'love' : null))
  }, [
    post.id,
    post.likes,
    post.likedByViewer,
    post.viewerReaction,
    post.reactionCounts,
    post.connectionLikerPreview,
    reactions.setReactionCounts,
    reactions.setViewerReaction,
  ])

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit && post.source === 'mock') {
      onEdit(editText.trim())
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (deleteConfirm && onDelete && post.source === 'mock') {
      onDelete()
      setDeleteConfirm(false)
    } else {
      setDeleteConfirm(true)
      setTimeout(() => setDeleteConfirm(false), 3000)
    }
  }

  const feedLayout = layout === 'feed'
  const isRepost = kind === 'repost' && post.quotedPost
  const displayPost = isRepost && post.quotedPost ? post.quotedPost : post
  const contentBadge = inferFeedPostBadge(displayPost)
  const activityLead = feedLayout ? feedActivityLeadLine(contentBadge, displayPost.kind) : null
  const heroAttachment = displayPost.attachments.find(
    (a) => a.type === 'image' || (a.type === 'media' && a.mediaKind === 'image'),
  )
  const heroImageUrl = heroAttachment ? feedAttachmentHeroUrl(heroAttachment) : null
  const headerUsername = displayPost.authorUsername
  const headerTime = displayPost.timeAgo
  const showOrganizerBadge = displayPost.mentions.some((m) => m.type === 'org' || m.type === 'organizer')

  const canShare = post.source === 'api'
  const canReact = post.source === 'api' && isAuthenticated
  const showMockActions = post.source === 'mock' && isOwnPost && onEdit && onDelete
  const postBookmarked = bookmarkApi.isBookmarked(BOOKMARK_OBJECT_FEED_POST, post.id)
  const commentCount = post.comments

  const handleMockReaction = (_kind: FeedReactionId) => {
    setLocalLikes((n) => n + 1)
  }

  const feedDivider = 'border-dc-border/35'

  const plainBodyText = displayPost.bodyFormat !== 'html' ? displayPost.body.trim() : ''
  const centerFeedBody =
    feedLayout &&
    !displayPost.title &&
    !heroImageUrl &&
    displayPost.attachments.length === 0 &&
    plainBodyText.length > 0 &&
    plainBodyText.length <= 140

  const showFeedActivityLead =
    feedLayout &&
    !feedContextExternal &&
    activityLead &&
    activityLead !== 'Shared an update' &&
    activityLead !== 'Posted an update'

  const actionButtonClass = feedLayout ?
    'inline-flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text sm:min-h-9 sm:gap-1.5 sm:px-2.5 sm:text-xs'
  : 'inline-flex min-h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-dc-text-muted transition-colors hover:bg-dc-elevated-hover hover:text-dc-text sm:text-xs'

  const streamVerb =
    feedStreamReason ??
    (activityLead && activityLead !== 'Shared an update' && activityLead !== 'Posted an update' ? activityLead : null)
  const streamTime = formatFeedTimeShort(headerTime)
  const reactionCounts =
    post.source === 'api' ?
      reactions.reactionCounts
    : { love: localLikes, respect: 0, sympathize: 0, helpful: 0 }
  const viewerReaction =
    post.source === 'api' ?
      reactions.viewerReaction ?? (post.likedByViewer ? 'love' : null)
    : null

  const cardClass = feedLayout ?
    cn(
      'feed-stream-post',
      feedStreamPostSurfaceClass(
        feedStreamPostSurface(post, { isRepost: !!isRepost, streamVerb: feedStreamReason ?? null }),
      ),
    )
  : `${cardSurfaceSolidClass} ${cardSurfaceInteractiveClass} p-4 transition-colors hover:bg-[var(--dc-elevated-hover)]`

  if (feedLayout) {
    return (
      <article className={cardClass}>
        {isRepost ?
          <p className="feed-repost-banner">
            <Link to={`/profile/${authorUsername}`}>@{authorUsername}</Link> reposted
          </p>
        : null}

        <header className="feed-stream-post__head">
          <Link to={`/profile/${headerUsername}`} className="feed-stream-post__avatar">
            <UserAvatar
              avatarUrl={displayPost.authorAvatarUrl}
              alt=""
              size="sm"
              className="!h-full !w-full !min-h-0 !min-w-0"
            />
          </Link>
          <div className="feed-stream-post__meta">
            <div className="feed-stream-post__title-row">
              <Link to={`/profile/${headerUsername}`} className="feed-stream-post__user">
                @{headerUsername}
              </Link>
              {streamVerb ?
                <span className="feed-stream-post__verb">{streamVerb}</span>
              : null}
              <span className="feed-stream-post__time">{streamTime}</span>
              {showOrganizerBadge ?
                <span className="rounded-full border border-[rgba(214,178,59,0.25)] bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">
                  Organizer
                </span>
              : null}
              <AlphaTestBadge label={post.alphaLabel} />
              {canShare ?
                <CopyLinkOverflowMenu path={`/share/post/${post.id}`} className="feed-stream-post__menu" />
              : null}
            </div>
          </div>
        </header>

        <div className="feed-stream-post__body">
          {displayPost.title ?
            <h3 className="mb-1.5 font-display text-base font-semibold leading-snug text-dc-text">{displayPost.title}</h3>
          : null}
          {displayPost.bodyFormat === 'html' ?
            <div
              className="text-[15px] leading-relaxed text-dc-text prose prose-invert max-w-none [&_a]:text-dc-accent"
              dangerouslySetInnerHTML={{ __html: displayPost.body }}
            />
          : <p className={`${centerFeedBody ? 'mx-auto max-w-[34ch] text-center' : ''} whitespace-pre-wrap text-[15px] leading-relaxed text-dc-text`}>
              {displayPost.body}
            </p>}
          <MentionChips mentions={displayPost.mentions} />
        </div>

        {heroImageUrl ?
          <div className="feed-stream-post__media">
            <img src={heroImageUrl} alt="" loading="lazy" decoding="async" />
          </div>
        : null}

        <div className="feed-stream-post__actions">
          <FeedPostActionBar
            reactionCounts={reactionCounts}
            viewerReaction={viewerReaction}
            reactionBusy={reactions.busy}
            reactionDisabled={!canReact}
            onReaction={(kind) => {
              if (post.source === 'mock') handleMockReaction(kind)
              else void reactions.toggleReaction(kind)
            }}
            commentCount={commentCount}
            commentHref={canShare ? `/share/post/${post.id}#discuss` : undefined}
            commentDisabled={!canShare}
            shareHref={canShare ? `/share/post/${post.id}` : undefined}
            shareDisabled={!canShare}
            bookmarked={postBookmarked}
            bookmarkBusy={bookmarkApi.bookmarkBusy}
            bookmarkDisabled={!canShare || !isAuthenticated}
            onBookmarkToggle={
              canShare && isAuthenticated ?
                () => {
                  void bookmarkApi.toggleBookmark(BOOKMARK_OBJECT_FEED_POST, post.id)
                }
              : undefined
            }
            report={
              post.source === 'api' && isAuthenticated && !isOwnPost ?
                (() => {
                  const target = feedPostTarget(post.id)
                  return {
                    targetType: target.targetType,
                    targetId: target.targetId,
                    targetLabel: 'feed post',
                  }
                })()
              : undefined
            }
          />
          <ConnectionLikerStack preview={connectionPreview} />
        </div>

        {showDiscussion && post.source === 'api' ?
          <div className="feed-stream-post__body mt-3 border-t border-dc-border/40 pt-3">
            <FeedPostDiscussion postId={post.id} initialCount={commentCount} compact />
          </div>
        : null}
      </article>
    )
  }

  return (
    <article className={cardClass}>
      {isRepost && feedLayout ?
        <p className={`mb-2.5 flex items-center gap-1.5 rounded-lg border ${feedDivider} bg-dc-elevated-muted/80 px-2.5 py-1.5 text-xs text-dc-muted`}>
          <svg className="h-3.5 w-3.5 shrink-0 text-dc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h5M20 20v-5h-5M5 19a9 9 0 0014-7M19 5a9 9 0 00-14 7" />
          </svg>
          <span>
            <Link to={`/profile/${authorUsername}`} className="font-medium text-dc-accent hover:underline">
              @{authorUsername}
            </Link>
            <span> reposted</span>
          </span>
        </p>
      : kind === 'repost' && !feedLayout ?
        <p className="mb-2 text-xs font-medium text-dc-muted">
          Reposted by{' '}
          <Link to={`/profile/${authorUsername}`} className="text-dc-accent hover:underline">
            @{authorUsername}
          </Link>
        </p>
      : null}

      <div className={feedLayout ? 'flex gap-3' : 'flex gap-3'}>
        <Link to={`/profile/${headerUsername}`} className="flex-shrink-0">
          <UserAvatar
            avatarUrl={displayPost.authorAvatarUrl}
            alt=""
            size="sm"
            className={feedLayout ? '!h-12 !w-12 !min-h-12 !min-w-12 lg:!h-10 lg:!w-10 lg:!min-h-10 lg:!min-w-10 [&>svg]:!h-5 [&>svg]:!w-5' : ''}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div
            className={
              feedLayout ?
                'flex items-start gap-x-2 gap-y-1 flex-wrap pb-1'
              : 'flex items-center gap-x-2 gap-y-1 flex-wrap'
            }
          >
            <Link
              to={`/profile/${headerUsername}`}
              className={`font-semibold text-dc-text hover:text-dc-accent truncate ${feedLayout ? 'text-base' : ''}`}
            >
              {feedLayout ? `@${headerUsername}` : headerUsername}
            </Link>
            {showOrganizerBadge ?
              <span className="rounded-full border border-[rgba(214,178,59,0.25)] bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">
                Organizer
              </span>
            : null}
            <AlphaTestBadge label={post.alphaLabel} />
            <span className="text-dc-muted text-xs flex-shrink-0">{headerTime}</span>
            {canShare ?
              <CopyLinkOverflowMenu
                path={`/share/post/${post.id}`}
                className="ml-auto flex-shrink-0"
                bookmark={{
                  saved: postBookmarked,
                  busy: bookmarkApi.bookmarkBusy,
                  onToggle: () => {
                    void bookmarkApi.toggleBookmark(BOOKMARK_OBJECT_FEED_POST, post.id)
                  },
                }}
              />
            : null}
            {showMockActions ? (
              <div className="flex gap-1 ml-auto">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="min-h-11 min-w-[44px] px-2 text-xs font-medium text-dc-accent hover:underline"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setEditText(post.body)
                      }}
                      className="min-h-11 min-w-[44px] px-2 text-xs font-medium text-dc-muted hover:text-dc-text"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true)
                        setEditText(post.body)
                      }}
                      className="min-h-11 min-w-[44px] px-2 text-xs font-medium text-dc-muted hover:text-dc-text"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className={`min-h-11 min-w-[44px] px-2 text-xs font-medium ${
                        deleteConfirm ? 'text-dc-danger' : 'text-dc-muted hover:text-dc-danger'
                      }`}
                      aria-label={deleteConfirm ? 'Confirm delete post' : 'Delete post'}
                    >
                      {deleteConfirm ? 'Confirm delete?' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {feedLayout && (contentBadge || (!feedContextExternal && showFeedActivityLead)) ?
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {contentBadge ?
                <FeedPostTypeBadge badge={contentBadge} />
              : null}
              {!feedContextExternal && showFeedActivityLead ?
                <p className="text-xs text-dc-muted">{activityLead}</p>
              : null}
            </div>
          : !feedContextExternal && showFeedActivityLead ?
            <p className="mt-1 text-xs text-dc-muted">{activityLead}</p>
          : contentBadge ?
            <div className="mt-2">
              <FeedPostTypeBadge badge={contentBadge} />
            </div>
          : null}

          {isRepost && post.quotedPost && !feedLayout ?
            <QuotedPostBody post={post.quotedPost} dense />
          : (
            <>
              {feedLayout && heroImageUrl ?
                <>
                  {displayPost.title ?
                    <h3 className="mt-2 font-display text-base font-semibold text-dc-text leading-snug">{displayPost.title}</h3>
                  : null}
                  {displayPost.bodyFormat === 'html' ?
                    <div
                      className={`${displayPost.title ? 'mt-1.5' : 'mt-2'} text-[15px] leading-relaxed text-dc-text prose prose-invert max-w-none [&_a]:text-dc-accent line-clamp-6`}
                      dangerouslySetInnerHTML={{ __html: displayPost.body }}
                    />
                  : <p className={`${displayPost.title ? 'mt-1.5' : centerFeedBody ? 'mt-1' : 'mt-2'} ${centerFeedBody ? 'mx-auto max-w-[34ch] text-center' : ''} text-[15px] leading-relaxed text-dc-text whitespace-pre-wrap line-clamp-6`}>
                      {displayPost.body}
                    </p>}
                  <MentionChips mentions={displayPost.mentions} />
                  <img
                    src={heroImageUrl}
                    alt=""
                    className="mt-3 w-full max-h-56 rounded-xl border border-white/[0.08] object-cover"
                  />
                </>
              : <>
                  {displayPost.title ?
                    <h3 className={`${feedLayout ? 'mt-2' : 'mt-2'} font-display font-semibold text-dc-text`}>{displayPost.title}</h3>
                  : null}
                  {isEditing && onEdit && post.source === 'mock' && !isRepost ?
                    <>
                      <label htmlFor={editFieldId} className="sr-only">
                        Edit post text
                      </label>
                      <textarea
                        id={editFieldId}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="mt-2 w-full resize-none rounded-lg border border-dc-border bg-[var(--dc-input)] px-3 py-2 text-sm text-dc-text"
                        rows={3}
                      />
                    </>
                  : displayPost.bodyFormat === 'html' ?
                    <div
                      className={`${feedLayout ? 'mt-2 text-[15px] leading-relaxed line-clamp-6' : 'mt-2 text-sm leading-relaxed'} text-dc-text prose prose-invert max-w-none [&_a]:text-dc-accent`}
                      dangerouslySetInnerHTML={{ __html: displayPost.body }}
                    />
                  : <p className={`${feedLayout ? 'mt-2' : 'mt-2'} ${centerFeedBody ? 'mx-auto max-w-[34ch] text-center' : ''} text-[15px] leading-relaxed line-clamp-6 text-dc-text whitespace-pre-wrap`}>{displayPost.body}</p>}
                  <MentionChips mentions={displayPost.mentions} />
                  {!feedLayout && displayPost.attachments.length > 0 ?
                    renderFeedAttachments(displayPost.attachments, { maxHeightClass: 'max-h-64', className: 'mt-3' })
                  : null}
                </>
              }
            </>
          )}

          {feedLayout ?
            <>
              <div
                className={`mt-3 overflow-x-auto c2k-no-scrollbar rounded-xl border ${feedDivider} bg-dc-elevated-muted/25 px-1.5 py-1 sm:px-2`}
              >
                <div
                  className="mx-auto flex w-max min-w-full max-w-full items-center justify-center gap-0.5 sm:gap-1"
                  role="group"
                  aria-label="Post interactions"
                >
                  <FeedReactionsRow
                    inline
                    compact
                    centered
                    reactionCounts={post.source === 'api' ? reactions.reactionCounts : { love: localLikes, respect: 0, sympathize: 0, helpful: 0 }}
                    viewerReaction={post.source === 'api' ? reactions.viewerReaction : null}
                    busy={reactions.busy}
                    disabled={post.source === 'api' && !canReact}
                    onReaction={(kind) => {
                      if (post.source === 'mock') handleMockReaction(kind)
                      else void reactions.toggleReaction(kind)
                    }}
                  />
                  <span className="mx-0.5 h-5 w-px shrink-0 bg-dc-border/35" aria-hidden />
                  {canShare ?
                    <FeedTapControl
                      as="link"
                      to={`/share/post/${post.id}#discuss`}
                      className={actionButtonClass}
                      aria-label="Comment on this post"
                      title="View and add comments"
                    >
                      <IconDiscuss className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">{FEED_ACTION_LABELS.discuss}</span>
                      {commentCount > 0 ?
                        <span className="tabular-nums text-[10px] opacity-80">{commentCount}</span>
                      : null}
                    </FeedTapControl>
                  : (
                    <FeedTapControl
                      disabled
                      className={`${actionButtonClass} opacity-70 cursor-not-allowed`}
                      aria-label="Comments coming soon"
                      title="Comments coming soon"
                    >
                      <IconDiscuss className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">{FEED_ACTION_LABELS.discuss}</span>
                    </FeedTapControl>
                  )}
                  {post.source === 'api' && onRepost && post.kind !== 'repost' ?
                    <FeedTapControl className={`${actionButtonClass} hidden sm:inline-flex`} onClick={() => onRepost(post.id)}>
                      <IconRepost className="h-4 w-4 shrink-0" />
                      <span>Repost</span>
                    </FeedTapControl>
                  : null}
                  {canShare ?
                    <FeedTapControl as="link" to={`/share/post/${post.id}`} className={`${actionButtonClass} hidden sm:inline-flex`}>
                      <IconShare className="h-4 w-4 shrink-0" />
                      <span>Share</span>
                    </FeedTapControl>
                  : (
                    <FeedTapControl
                      disabled
                      className={`${actionButtonClass} hidden opacity-70 cursor-not-allowed sm:inline-flex`}
                      title="Share coming soon"
                    >
                      <IconShare className="h-4 w-4 shrink-0" />
                      <span>Share</span>
                    </FeedTapControl>
                  )}
                  {post.source === 'api' && isAuthenticated && !isOwnPost ?
                    (() => {
                      const target = feedPostTarget(post.id)
                      return (
                        <ReportAction
                          variant="button"
                          targetType={target.targetType}
                          targetId={target.targetId}
                          targetLabel="feed post"
                          surface="feed"
                          className="!min-h-8 !min-w-0 shrink-0 !px-2 !text-[11px] !text-dc-muted/70 hover:!text-dc-muted sm:!min-h-9"
                        />
                      )
                    })()
                  : null}
                </div>
              </div>
              <ConnectionLikerStack preview={connectionPreview} />
            </>
          : <div className="mt-4 space-y-2 border-t border-dc-border pt-3">
            <FeedReactionsRow
              reactionCounts={post.source === 'api' ? reactions.reactionCounts : { love: localLikes, respect: 0, sympathize: 0, helpful: 0 }}
              viewerReaction={post.source === 'api' ? reactions.viewerReaction : null}
              busy={reactions.busy}
              disabled={post.source === 'api' && !canReact}
              onReaction={(kind) => {
                if (post.source === 'mock') handleMockReaction(kind)
                else void reactions.toggleReaction(kind)
              }}
            />
            <ConnectionLikerStack preview={connectionPreview} />
            <div className="flex flex-wrap items-center gap-0.5 pt-1" role="group" aria-label="Post actions">
              {canShare ? (
                <Link
                  to={`/share/post/${post.id}#discuss`}
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-dc-text-muted transition-colors hover:bg-dc-elevated-hover hover:text-dc-text"
                  aria-label="Comment on this post"
                  title="View and add comments"
                >
                  <IconDiscuss className="h-4 w-4" />
                  <span className="hidden sm:inline">{FEED_ACTION_LABELS.discuss}</span>
                  {commentCount > 0 ?
                    <span className="tabular-nums text-[11px] opacity-80">{commentCount}</span>
                  : null}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-dc-muted opacity-70 cursor-not-allowed"
                  aria-label="Comments coming soon"
                  title="Comments coming soon"
                >
                  <IconDiscuss className="h-4 w-4" />
                  <span className="hidden sm:inline">{FEED_ACTION_LABELS.discuss}</span>
                </button>
              )}
              {post.source === 'api' && onRepost && post.kind !== 'repost' ? (
                <button
                  type="button"
                  onClick={() => onRepost(post.id)}
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-dc-text-muted transition-colors hover:bg-dc-elevated-hover hover:text-dc-text"
                >
                  <IconRepost className="h-4 w-4" />
                  <span className="hidden sm:inline">Repost</span>
                </button>
              ) : null}
              {canShare ? (
                <Link
                  to={`/share/post/${post.id}`}
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-dc-text-muted transition-colors hover:bg-dc-elevated-hover hover:text-dc-text"
                >
                  <IconShare className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-dc-muted opacity-70 cursor-not-allowed"
                  title="Share coming soon"
                >
                  <IconShare className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}
              {post.source === 'api' && isAuthenticated && !isOwnPost ?
                (() => {
                  const target = feedPostTarget(post.id)
                  return (
                    <ReportAction
                      variant="button"
                      targetType={target.targetType}
                      targetId={target.targetId}
                      targetLabel="feed post"
                      surface="feed"
                      className="!min-h-11 !min-w-[44px] !px-2.5 !text-xs !text-dc-muted/80 hover:!text-dc-muted ml-auto"
                    />
                  )
                })()
              : null}
            </div>
          </div>}
          {showDiscussion && post.source === 'api' ?
            <FeedPostDiscussion postId={post.id} initialCount={commentCount} compact />
          : null}
        </div>
      </div>
    </article>
  )
}
