import type { FeedReactionId } from '@c2k/shared'
import type { FeedReactionCounts } from '@/hooks/useFeedPostReactions'

export type FeedAttachment = { type: 'image' | 'audio'; url: string }

export type FeedMention = { type: string; id?: string; slug?: string; label: string }

export type ConnectionLikerPreview = { username: string; avatarUrl?: string | null }

/** Unified post for home Local feed, trending, share page, and profile journal. */
export type HomeFeedPost = {
  id: string
  authorUsername: string
  authorAvatarUrl?: string | null
  /** @deprecated Phase 0 - not returned by API; mock-only */
  authorTrustScore?: number
  kind: string
  title: string | null
  body: string
  bodyFormat: 'text' | 'html'
  attachments: FeedAttachment[]
  mentions: FeedMention[]
  repostOfId: string | null
  quotedPost?: HomeFeedPost
  createdAt?: string
  timeAgo: string
  likes: number
  likedByViewer?: boolean
  reactionCounts?: FeedReactionCounts
  viewerReaction?: FeedReactionId | null
  connectionLikerPreview?: ConnectionLikerPreview[]
  comments: number
  source: 'api' | 'mock'
}

export type FollowingFeedActor = {
  id: string
  username: string
  /** @deprecated Phase 0 - not returned by API */
  trustScore?: number
}

export type ApiFollowingFeedItem = {
  kind: 'post' | 'activity'
  verb?: string
  cursor: string
  createdAt: string
  deepLink: string
  actor: FollowingFeedActor
  object?: Record<string, unknown>
  post?: Record<string, unknown>
}

export type FollowingFeedItem =
  | { kind: 'post'; cursor: string; createdAt: string; deepLink: string; post: HomeFeedPost }
  | {
      kind: 'activity'
      verb: string
      cursor: string
      createdAt: string
      deepLink: string
      actor: FollowingFeedActor
      object?: Record<string, unknown>
    }
