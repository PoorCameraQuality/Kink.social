import { useEffect, useMemo, useState } from 'react'

import type { UserEcosystemPayload } from '@/lib/user-ecosystem'
import type { ProfileStoryKink } from '@/lib/profile-story/types'
import {
  buildStudioCompletionFromStory,
  deriveStudioBoosters,
  deriveStudioEssentials,
  deriveStudioNextSteps,
  deriveStudioStrengthScore,
} from '@/lib/profile-studio/completion'
import { derivePersonalityParagraph } from '@/lib/profile-story/derive'
import ProfileAboutCard from './ProfileAboutCard'
import ProfileLookingForCard from './ProfileLookingForCard'
import ProfilePersonalityCard from './ProfilePersonalityCard'
import ProfileStudioStrengthCard from '../studio/ProfileStudioStrengthCard'
import ProfileCommunitySnapshotCard from './ProfileCommunitySnapshotCard'
import ProfileOrganizationsCard from './ProfileOrganizationsCard'
import ProfileUpcomingEventsCard from './ProfileUpcomingEventsCard'
import ProfileFeedbackCard from './ProfileFeedbackCard'

export type ProfileStorySidebarProps = {
  displayName: string
  username: string
  bio: string | null
  location: string
  roles: string[]
  lookingFor: string[]
  kinks: ProfileStoryKink[]
  lifestyleActivity?: string | null
  memberSince?: string | null
  photoUrl?: string | null
  ecosystem: UserEcosystemPayload | null
  referencesCount: number
  eventsAttended?: number
  educationContributions?: number
  viewerIsOwner: boolean
  linksCount?: number
  relationshipsCount?: number
  pronounTags?: string[]
  onAddReference?: () => void
  canOfferReference?: boolean
}

/** Condensed story cards for desktop left rail. */
export default function ProfileStorySidebar(props: ProfileStorySidebarProps) {
  const [linksCount, setLinksCount] = useState(props.linksCount ?? 0)

  useEffect(() => {
    if (props.linksCount != null) {
      setLinksCount(props.linksCount)
      return
    }
    if (!props.viewerIsOwner) return

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/profile/me/links', { credentials: 'include' })
        if (!res.ok || cancelled) return
        const data = (await res.json()) as { links?: unknown[] }
        if (!cancelled) setLinksCount(Array.isArray(data.links) ? data.links.length : 0)
      } catch {
        /* keep last value */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [props.linksCount, props.viewerIsOwner])

  const interests = props.kinks.map((k) => k.displayName)
  const personality = derivePersonalityParagraph({
    bio: props.bio,
    lifestyleActivity: props.lifestyleActivity,
    kinks: props.kinks,
    presenterHeadline: props.ecosystem?.presenter?.headline,
  })

  const completionInput = useMemo(
    () =>
      buildStudioCompletionFromStory({
        displayName: props.displayName,
        bio: props.bio,
        location: props.location,
        photoUrl: props.photoUrl,
        photoCount: 0,
        roles: props.roles,
        lifestyleActivity: props.lifestyleActivity,
        lookingFor: props.lookingFor,
        kinksCount: props.kinks.length,
        linksCount,
        relationshipsCount: props.relationshipsCount ?? 0,
        pronounTags: props.pronounTags,
      }),
    [
      props.displayName,
      props.bio,
      props.location,
      props.photoUrl,
      props.roles,
      props.lifestyleActivity,
      props.lookingFor,
      props.kinks.length,
      linksCount,
      props.relationshipsCount,
      props.pronounTags,
    ],
  )

  const essentials = useMemo(() => deriveStudioEssentials(completionInput), [completionInput])
  const boosters = useMemo(() => deriveStudioBoosters(completionInput), [completionInput])
  const strengthScore = useMemo(
    () => deriveStudioStrengthScore(essentials, boosters),
    [essentials, boosters],
  )
  const nextSteps = useMemo(() => deriveStudioNextSteps(boosters), [boosters])

  return (
    <div className="space-y-4">
      {props.viewerIsOwner || props.lookingFor.length > 0 ?
        <ProfileLookingForCard lookingFor={props.lookingFor} viewerIsOwner={props.viewerIsOwner} />
      : null}
      <ProfileAboutCard
        displayName={props.displayName}
        bio={props.bio}
        interests={interests}
        viewerIsOwner={props.viewerIsOwner}
      />
      <ProfileCommunitySnapshotCard
        ecosystem={props.ecosystem}
        memberSince={props.memberSince}
        roles={props.roles}
        lifestyleActivity={props.lifestyleActivity}
        referencesCount={props.referencesCount}
        eventsAttended={props.eventsAttended}
        educationContributions={props.educationContributions}
      />
      {props.viewerIsOwner ?
        <ProfileStudioStrengthCard
          score={strengthScore}
          essentials={essentials}
          boosters={boosters}
          nextSteps={nextSteps}
        />
      : null}
      <ProfileUpcomingEventsCard
        ecosystem={props.ecosystem}
        username={props.username}
        viewerIsOwner={props.viewerIsOwner}
      />
      <ProfileOrganizationsCard ecosystem={props.ecosystem} username={props.username} />
      <ProfileFeedbackCard
        displayName={props.displayName}
        referencesCount={props.referencesCount}
        viewerIsOwner={props.viewerIsOwner}
        onAddReference={props.onAddReference}
        canOfferReference={props.canOfferReference}
      />
      <ProfilePersonalityCard paragraph={personality} displayName={props.displayName} />
    </div>
  )
}