import ProfileStudioLivePreview, { type ProfileStudioPreviewDraft } from './ProfileStudioLivePreview'
import ProfileStudioStrengthCard from './ProfileStudioStrengthCard'
import ProfileStudioVisitorReadout from './ProfileStudioVisitorReadout'
import type { StudioCheckItem } from '@/lib/profile-studio/completion'
import type { MediaUploadStage } from '@/components/media/MediaUploadProgress'

type Props = {
  draft: ProfileStudioPreviewDraft
  publicProfileHref: string | null
  hasUnsavedChanges?: boolean
  photoUploadStage?: MediaUploadStage | null
  score: number
  essentials: StudioCheckItem[]
  boosters: StudioCheckItem[]
  nextSteps: string[]
  visitorReadout: string
}

export default function ProfileStudioCoachRail({
  draft,
  publicProfileHref,
  hasUnsavedChanges,
  photoUploadStage = null,
  score,
  essentials,
  boosters,
  nextSteps,
  visitorReadout,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
      <ProfileStudioLivePreview
        draft={draft}
        publicProfileHref={publicProfileHref}
        hasUnsavedChanges={hasUnsavedChanges}
        photoUploadStage={photoUploadStage}
      />
      <ProfileStudioStrengthCard
        score={score}
        essentials={essentials}
        boosters={boosters}
        nextSteps={nextSteps}
      />
      <ProfileStudioVisitorReadout readout={visitorReadout} />
    </div>
  )
}
