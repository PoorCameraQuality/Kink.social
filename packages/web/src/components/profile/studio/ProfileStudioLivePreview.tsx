import { Link } from 'react-router-dom'
import {
  effectiveFieldVisibility,
  PROFILE_HERO_PHOTO_FRAME_CLASS,
  type ProfileFieldVisibilityMap,
  type ProfilePhotoDisplaySettings,
} from '@c2k/shared'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import ProfilePhotoImage from '@/components/profile/ProfilePhotoImage'
import ProfilePhotoCredit from '@/components/profile/ProfilePhotoCredit'
import ProfilePill from '@/components/profile/story/ProfilePill'
import ProfileCard from '@/components/profile/story/ProfileCard'
import { profileStudioInsetCardClass, profileStudioSectionCardClass } from './profile-studio-classes'
import { IconMapPin } from '@/components/profile/story/ProfileStoryIcons'
import { deriveProfileTagline, deriveRoleHeadline } from '@/lib/profile-story/derive'
import MarkdownContent from '@/components/ui/MarkdownContent'
import {
  MediaUploadProgressOverlay,
  type MediaUploadStage,
} from '@/components/media/MediaUploadProgress'

export type ProfileStudioPreviewDraft = {
  displayName: string
  username: string
  bio: string
  locationLabel: string
  ageLabel?: string
  pronouns?: string
  roles: string[]
  lifestyleActivity: string
  lookingFor: string[]
  photoUrl: string | null
  photoCaption?: string | null
  photoDisplaySettings?: ProfilePhotoDisplaySettings | null
  fieldVisibility: ProfileFieldVisibilityMap
}

type Props = {
  draft: ProfileStudioPreviewDraft
  publicProfileHref: string | null
  hasUnsavedChanges?: boolean
  photoUploadStage?: MediaUploadStage | null
}

export default function ProfileStudioLivePreview({
  draft,
  publicProfileHref,
  hasUnsavedChanges,
  photoUploadStage = null,
}: Props) {
  const roleHeadline = deriveRoleHeadline({
    roles: draft.roles,
    ecosystem: null,
    lifestyleActivity: draft.lifestyleActivity,
  })
  const tagline = deriveProfileTagline(draft.bio)

  const locationLevel = effectiveFieldVisibility('location', draft.fieldVisibility)
  const pronounsLevel = effectiveFieldVisibility('pronouns', draft.fieldVisibility)
  const showLocation = locationLevel !== 'hidden' && draft.locationLabel.trim().length > 0
  const showPronouns = pronounsLevel !== 'hidden' && Boolean(draft.pronouns?.trim())
  const metaParts = [
    showLocation ? draft.locationLabel : null,
    draft.ageLabel,
    showPronouns ? draft.pronouns : null,
  ].filter(Boolean)

  return (
    <ProfileCard
      title="Live public preview"
      className={profileStudioSectionCardClass}
      action={
        publicProfileHref ?
          <Link to={publicProfileHref} className="text-xs font-medium text-dc-accent hover:underline">
            Open full preview
          </Link>
        : null
      }
    >
      <p
        className={`mb-4 text-xs ${hasUnsavedChanges ? 'text-amber-200/90' : 'text-emerald-300/80'}`}
        role="status"
      >
        {hasUnsavedChanges ? 'Save to update what others see' : 'Reflects your current draft'}
      </p>

      <div className={`${profileStudioInsetCardClass} p-3`}>
        <div className="flex gap-3">
          <div className="min-w-0 shrink-0">
            <div
              className={`${PROFILE_HERO_PHOTO_FRAME_CLASS} !h-[88px] !w-[70px] border border-dc-border shadow-none ring-0`}
            >
              {draft.photoUrl ?
                <ProfilePhotoImage
                  src={draft.photoUrl}
                  displaySettings={draft.photoDisplaySettings}
                  className="h-full w-full"
                />
              : (
                <div className="flex h-full items-center justify-center">
                  <PlaceholderAvatar size="md" className="!rounded-xl" />
                </div>
              )}
              {photoUploadStage ?
                <MediaUploadProgressOverlay stage={photoUploadStage} compact />
              : null}
            </div>
            <ProfilePhotoCredit caption={draft.photoCaption} className="mt-1 max-w-[70px] text-center" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight text-dc-text break-words">{draft.displayName}</p>
            {draft.displayName !== draft.username ?
              <p className="text-xs text-dc-muted">@{draft.username}</p>
            : null}
            {roleHeadline ?
              <p className="mt-1 text-xs font-semibold text-dc-accent">{roleHeadline}</p>
            : null}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-dc-text-muted italic">&ldquo;{tagline}&rdquo;</p>

        {metaParts.length > 0 ?
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-dc-text-muted">
            {showLocation ?
              <span className="inline-flex items-center gap-1">
                <IconMapPin className="h-3 w-3 shrink-0" aria-hidden />
                {draft.locationLabel}
              </span>
            : null}
            {draft.ageLabel ?
              <span>{draft.ageLabel}</span>
            : null}
            {showPronouns ?
              <span>{draft.pronouns}</span>
            : null}
          </p>
        : null}

        {draft.lookingFor.length > 0 ?
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-dc-muted mb-1.5">Looking for</p>
            <div className="flex flex-wrap gap-1.5">
              {draft.lookingFor.slice(0, 4).map((goal) => (
                <ProfilePill key={goal} className="text-xs px-2 py-1">
                  {goal}
                </ProfilePill>
              ))}
            </div>
          </div>
        : null}

        <div className="mt-3 border-t border-dc-border/50 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-dc-muted mb-1">About preview</p>
          {draft.bio.trim() ?
            <MarkdownContent markdown={draft.bio} className="text-xs line-clamp-4 text-dc-text-muted [&_p]:my-0.5" />
          : <p className="text-xs italic text-dc-muted">Your bio will appear here.</p>}
        </div>
      </div>
    </ProfileCard>
  )
}
