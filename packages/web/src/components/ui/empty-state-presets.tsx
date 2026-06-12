import type { ComponentProps } from 'react'
import EmptyState from '@/components/ui/EmptyState'

type EmptyPreset = Pick<
  ComponentProps<typeof EmptyState>,
  'title' | 'message' | 'ctaLabel' | 'ctaHref' | 'secondaryCtaLabel' | 'secondaryCtaHref' | 'actionLabel' | 'icon'
>

function FeedEmptyIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}

function CalendarEmptyIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function MessageEmptyIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function SearchEmptyIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export const EMPTY_STATE_PRESETS = {
  noFeedPosts: {
    title: 'No posts yet',
    message: 'Posts from people and groups you follow will show up here.',
    ctaLabel: 'Explore groups',
    ctaHref: '/groups',
    icon: <FeedEmptyIcon />,
  },  noGroupsJoined: {
    title: 'No groups yet',
    message: 'Find communities that match your interests.',
    ctaLabel: 'Explore groups',
    ctaHref: '/groups',
  },
  noGroupsFound: {
    title: 'No groups found',
    message: 'Try a different search or browse all groups.',
    ctaLabel: 'Browse groups',
    ctaHref: '/groups',
  },
  noOrgsFollowed: {
    title: 'No organizations followed',
    message: 'Follow organizers to see their events and updates.',
    ctaLabel: 'Browse organizations',
    ctaHref: '/orgs',
  },
  noEventsNearby: {
    title: 'No upcoming events nearby',
    message: 'There is nothing coming up nearby yet. Browse the calendar or widen your search.',
    ctaLabel: 'Browse events',
    ctaHref: '/events',
    icon: <CalendarEmptyIcon />,
  },
  noMessages: {
    title: 'No messages yet',
    message: 'Messages from people you connect with will appear here.',
    ctaLabel: 'Message settings',
    ctaHref: '/settings/privacy',
    secondaryCtaLabel: 'Find people',
    secondaryCtaHref: '/discovery',
    icon: <MessageEmptyIcon />,
  },  noNotifications: {
    title: 'No notifications',
    message: 'You are caught up. New activity will appear here.',
    ctaLabel: 'Go home',
    ctaHref: '/home',
  },
  noSavedItems: {
    title: 'Nothing saved yet',
    message: 'Save events and posts to find them quickly later.',
    ctaLabel: 'Browse events',
    ctaHref: '/events',
  },
  noUploadedMedia: {
    title: 'No media yet',
    message: 'Photos you upload will appear here after review.',
    ctaLabel: 'Edit profile',
    ctaHref: '/profile/edit',
  },
  alphaUploadDisabled: {
    title: 'Upload disabled during alpha',
    message:
      'This upload type is disabled during alpha while we test safety and moderation. Profile photos are currently supported.',
    ctaLabel: 'Back to profile',
    ctaHref: '/profile/edit',
  },
  noSearchResults: {
    title: 'No results',
    message: 'Try different keywords or fewer filters.',
    actionLabel: 'Clear search',
    icon: <SearchEmptyIcon />,
  },  noModerationReports: {
    title: 'Queue is clear',
    message: 'No open reports need review right now.',
    ctaLabel: 'Moderation home',
    ctaHref: '/moderation',
  },
} satisfies Record<string, EmptyPreset>

export function PresetEmptyState({
  preset,
  inline,
  onAction,
}: {
  preset: keyof typeof EMPTY_STATE_PRESETS
  inline?: boolean
  onAction?: () => void
}) {
  const p = EMPTY_STATE_PRESETS[preset]
  return (
    <EmptyState
      inline={inline}
      title={p.title}
      message={p.message}
      icon={'icon' in p ? p.icon : undefined}
      ctaLabel={'ctaLabel' in p ? p.ctaLabel : undefined}      ctaHref={'ctaHref' in p ? p.ctaHref : undefined}
      secondaryCtaLabel={'secondaryCtaLabel' in p ? p.secondaryCtaLabel : undefined}
      secondaryCtaHref={'secondaryCtaHref' in p ? p.secondaryCtaHref : undefined}
      actionLabel={'actionLabel' in p ? p.actionLabel : undefined}
      onAction={onAction}
    />
  )
}
