import type { ReactNode } from 'react'

import type { ProfilePhotoDisplaySettings } from '@c2k/shared'

import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import ProfilePhotoImage from '@/components/profile/ProfilePhotoImage'
import ProfilePhotoCredit from '@/components/profile/ProfilePhotoCredit'
import ProfilePill from '@/components/profile/story/ProfilePill'
import { IconMapPin } from '@/components/profile/story/ProfileStoryIcons'
import { cn } from '@/lib/cn'

type Props = {
  displayName: string
  username: string
  ageLabel?: string
  pronouns?: string
  genders?: string[]
  sexualOrientations?: string[]
  romanticOrientations?: string[]
  location?: string
  roles?: string[]
  photoUrl?: string | null
  photoCaption?: string | null
  photoDisplaySettings?: ProfilePhotoDisplaySettings | null
  photoCount?: number
  onOpenGallery?: () => void
  actions: ReactNode
  className?: string
}

function joinLabels(values: string[] | undefined): string | null {
  if (!values) return null
  const items = values.map((v) => v.trim()).filter(Boolean)
  return items.length > 0 ? items.join(' · ') : null
}

/**
 * Unified responsive profile hero — cover banner, overlapping circular avatar,
 * compact identity line, role pills, and primary actions. Replaces the old
 * desktop cover header / mobile hero card split with one photo-forward header.
 */
export default function ProfileHero({
  displayName,
  username,
  ageLabel,
  pronouns,
  genders,
  sexualOrientations = [],
  romanticOrientations = [],
  location,
  roles = [],
  photoUrl,
  photoCaption,
  photoDisplaySettings,
  photoCount = 0,
  onOpenGallery,
  actions,
  className,
}: Props) {
  const genderLabel = joinLabels(genders)
  const orientationLabel = joinLabels([...sexualOrientations, ...romanticOrientations])
  const showLocation = Boolean(location && location.trim() && location !== 'Unknown')

  const primaryMeta = [ageLabel, genderLabel, pronouns].filter(Boolean).join(' · ')
  const hasSecondaryMeta = Boolean(orientationLabel) || showLocation

  const avatarFrameClass =
    'h-24 w-24 overflow-hidden rounded-full bg-dc-surface-muted ring-4 ring-dc-elevated-solid shadow-[0_14px_36px_-14px_rgba(0,0,0,0.7)] sm:h-28 sm:w-28 lg:h-32 lg:w-32'

  const avatarInner =
    photoUrl ?
      <ProfilePhotoImage src={photoUrl} displaySettings={photoDisplaySettings} className="h-full w-full" />
    : <PlaceholderAvatar size="lg" className="h-full w-full !rounded-full" />

  const canOpenGallery = Boolean(onOpenGallery)
  const avatarLabel =
    photoCount > 0 ?
      `Open photo gallery, ${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`
    : 'Add profile photos'

  const avatar =
    canOpenGallery ?
      <button
        type="button"
        onClick={onOpenGallery}
        aria-label={avatarLabel}
        className="group block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface"
      >
        <span className={cn(avatarFrameClass, 'block transition-transform group-hover:scale-[1.02] group-active:scale-[0.99]')}>
          {avatarInner}
        </span>
      </button>
    : <span className={cn(avatarFrameClass, 'block')}>{avatarInner}</span>

  return (
    <header
      className={cn(
        'overflow-hidden rounded-2xl border border-white/[0.07] bg-dc-elevated/40 shadow-[var(--dc-shadow-soft)]',
        className,
      )}
    >
      <div className="c2k-profile-hero relative h-32 w-full sm:h-40 lg:h-48">
        {photoUrl ?
          <ProfilePhotoImage
            src={photoUrl}
            displaySettings={photoDisplaySettings}
            className="absolute inset-0 h-full w-full scale-110 opacity-40 blur-2xl"
          />
        : null}
        <div className="absolute inset-0 bg-gradient-to-t from-dc-elevated/95 via-dc-elevated/30 to-transparent" aria-hidden />
      </div>

      <div className="px-5 pb-6 sm:px-6 lg:px-8">
        <div className="-mt-12 flex items-end justify-between gap-4 sm:-mt-14 lg:-mt-16">
          <div className="shrink-0">{avatar}</div>
        </div>

        <div className="mt-4 min-w-0">
          <h1 className="break-words font-display text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">
            {displayName}
          </h1>
          {displayName !== username ?
            <p className="mt-0.5 text-sm text-dc-muted">@{username}</p>
          : null}
          {primaryMeta ?
            <p className="mt-1.5 text-sm text-dc-text-muted">{primaryMeta}</p>
          : null}
          {hasSecondaryMeta ?
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dc-muted">
              {orientationLabel ? <span>{orientationLabel}</span> : null}
              {showLocation ?
                <span className="inline-flex items-center gap-1.5">
                  <IconMapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  {location}
                </span>
              : null}
            </div>
          : null}
        </div>

        {roles.length > 0 ?
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((role) => (
              <ProfilePill key={role} className="px-3 py-1 text-xs">
                {role}
              </ProfilePill>
            ))}
          </div>
        : null}

        <div className="mt-5">{actions}</div>

        <ProfilePhotoCredit caption={photoCaption} className="mt-3" />
      </div>
    </header>
  )
}
