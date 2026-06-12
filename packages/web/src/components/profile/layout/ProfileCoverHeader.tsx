import type { ReactNode } from 'react'

import type { ProfilePhotoDisplaySettings } from '@c2k/shared'
import { PROFILE_HERO_PHOTO_FRAME_CLASS } from '@c2k/shared'

import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import ProfilePhotoImage from '@/components/profile/ProfilePhotoImage'
import ProfilePhotoCredit from '@/components/profile/ProfilePhotoCredit'
import ProfilePill from '@/components/profile/story/ProfilePill'
import { profileStoryEyebrow } from '@/components/profile/story/profile-story-classes'
import { cn } from '@/lib/cn'

type Props = {
  displayName: string
  username: string
  tagline: string
  location: string
  ageLabel?: string
  pronouns?: string
  genders?: string[]
  sexualOrientations?: string[]
  romanticOrientations?: string[]
  roles?: string[]
  photoUrl?: string | null
  photoCaption?: string | null
  photoDisplaySettings?: ProfilePhotoDisplaySettings | null
  photoCount?: number
  onOpenGallery?: () => void
  actions: ReactNode
  className?: string
}

function joinLabels(values: string[]): string | null {
  const items = values.map((v) => v.trim()).filter(Boolean)
  return items.length > 0 ? items.join(' · ') : null
}

function galleryCountLabel(count: number): string {
  if (count === 0) return 'Add photos'
  return count === 1 ? '1 photo' : `${count} photos`
}

/** Desktop cover band with overlapping avatar — identity zone top-left, actions top-right. */
export default function ProfileCoverHeader({
  displayName,
  username,
  tagline,
  location,
  ageLabel,
  pronouns,
  genders = [],
  sexualOrientations = [],
  romanticOrientations = [],
  roles = [],
  photoUrl,
  photoCaption,
  photoDisplaySettings,
  photoCount = 0,
  onOpenGallery,
  actions,
  className,
}: Props) {
  const showLocation = Boolean(location && location !== 'Unknown')
  const orientationLabel = joinLabels([...sexualOrientations, ...romanticOrientations])
  const genderLabel = joinLabels(genders)
  const showGalleryAffordance = Boolean(onOpenGallery)
  const galleryLabel = showGalleryAffordance ? galleryCountLabel(photoCount) : null

  const metaParts: string[] = []
  if (ageLabel) metaParts.push(ageLabel)
  if (genderLabel) metaParts.push(genderLabel)
  if (orientationLabel) metaParts.push(orientationLabel)
  if (showLocation) metaParts.push(location)
  if (pronouns) metaParts.push(pronouns)

  const photoFrameClass = `${PROFILE_HERO_PHOTO_FRAME_CLASS} shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] ring-2 ring-dc-surface ring-offset-2 ring-offset-dc-bg`

  const photoContent =
    photoUrl ?
      <ProfilePhotoImage src={photoUrl} displaySettings={photoDisplaySettings} className="h-full w-full" />
    : <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-dc-accent/15 via-dc-surface-muted to-dc-elevated-solid p-4 text-center">
        <PlaceholderAvatar size="lg" className="!rounded-2xl" />
      </div>

  return (
    <header
      className={cn(
        'relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-dc-elevated/40 shadow-[var(--dc-shadow-soft)] c2k-profile-hero',
        className,
      )}
    >
      <div className="h-28 bg-gradient-to-br from-dc-accent/20 via-dc-surface-muted to-dc-elevated-solid sm:h-32" aria-hidden />

      <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="-mt-14 flex min-w-0 flex-1 items-end gap-4 sm:-mt-16">
            {showGalleryAffordance ?
              <button
                type="button"
                onClick={onOpenGallery}
                className="group shrink-0"
                aria-label={
                  photoCount > 0 ?
                    `Open photo gallery, ${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`
                  : 'Add profile photos'
                }
              >
                <div
                  className={`${photoFrameClass} relative h-[112px] w-[112px] overflow-hidden transition-transform group-hover:scale-[1.02] sm:h-[128px] sm:w-[128px]`}
                >
                  {photoContent}
                  {galleryLabel ?
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-[10px] font-medium text-white">
                      {galleryLabel}
                    </span>
                  : null}
                </div>
              </button>
            : <div className={`${photoFrameClass} relative h-[112px] w-[112px] overflow-hidden sm:h-[128px] sm:w-[128px]`}>{photoContent}</div>}

            <div className="min-w-0 pb-1">
              <h1 className="font-display text-2xl font-bold tracking-tight text-dc-text sm:text-3xl break-words">
                {displayName}
              </h1>
              {displayName !== username ?
                <p className="mt-0.5 text-sm text-dc-muted">@{username}</p>
              : null}
              {tagline ?
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-dc-text-muted italic line-clamp-2">
                  &ldquo;{tagline}&rdquo;
                </p>
              : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pb-1">{actions}</div>
        </div>

        <ProfilePhotoCredit caption={photoCaption} className="mt-2 max-w-[128px]" />

        {metaParts.length > 0 ?
          <p className="mt-3 text-sm text-dc-text-muted">{metaParts.join(' · ')}</p>
        : null}

        {roles.length > 0 ?
          <div className="mt-3">
            <p className={profileStoryEyebrow}>Roles</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <ProfilePill key={role} className="text-xs px-2.5 py-0.5">
                  {role}
                </ProfilePill>
              ))}
            </div>
          </div>
        : null}
      </div>
    </header>
  )
}
