import type { UserSettingsBundle } from '@c2k/shared'
import type { ProfileFieldVisibilityLevel } from '@c2k/shared'
import BlockedMembersPanel from '@/components/settings/BlockedMembersPanel'
import SettingsMutedTagsPanel from '@/components/settings/SettingsMutedTagsPanel'
import type { ApiMutedTag } from '@/hooks/useApiMutedTags'
import { SettingsActivityFeedPanel } from './SettingsPrivacyPanels'
import {
  SettingsEventHistoryPanel,
  SettingsFollowingPanel,
  SettingsInboxPanel,
  SettingsDataRetentionPanel,
  SettingsLocationVisibilityPanel,
  SettingsProfileFieldsPanel,
  SettingsRequestsPanel,
  SettingsSearchDiscoveryPanel,
} from './SettingsPrivacySections'

type Props = {
  privacy: UserSettingsBundle['privacy']
  onPrivacyChange: (next: UserSettingsBundle['privacy']) => void
  feed: UserSettingsBundle['feed']
  onFeedChange: (next: UserSettingsBundle['feed']) => void
  profSectionLoading: boolean
  profDiscoverable: boolean
  onProfDiscoverableChange: (value: boolean) => void
  fvGender: ProfileFieldVisibilityLevel
  onFvGenderChange: (value: ProfileFieldVisibilityLevel) => void
  fvAge: ProfileFieldVisibilityLevel
  onFvAgeChange: (value: ProfileFieldVisibilityLevel) => void
  fvSexuality: ProfileFieldVisibilityLevel
  onFvSexualityChange: (value: ProfileFieldVisibilityLevel) => void
  fvPronouns: ProfileFieldVisibilityLevel
  onFvPronounsChange: (value: ProfileFieldVisibilityLevel) => void
  fvLocation: ProfileFieldVisibilityLevel
  onFvLocationChange: (value: ProfileFieldVisibilityLevel) => void
  profPrivacyError: string | null
  profPrivacySaved: boolean
  profPrivacySaving: boolean
  onSaveProfilePrivacy: () => void
  mutedTags: ApiMutedTag[]
  mutedTagsLoading: boolean
  mutedTagsError: string | null
  onUnmuteTag: (muteId: string) => void
  unmuteTagBusy: boolean
  profLocationLabel?: string | null
  profDisplayName?: string | null
  viewerUsername?: string | null
}

/** Legacy composite - prefer tab routes under `/settings/*`. */
export default function SettingsPrivacySection(props: Props) {
  const {
    privacy,
    onPrivacyChange,
    feed,
    onFeedChange,
    profSectionLoading,
    profDiscoverable,
    onProfDiscoverableChange,
    fvGender,
    onFvGenderChange,
    fvAge,
    onFvAgeChange,
    fvSexuality,
    onFvSexualityChange,
    fvPronouns,
    onFvPronounsChange,
    fvLocation,
    onFvLocationChange,
    profPrivacyError,
    profPrivacySaved,
    profPrivacySaving,
    onSaveProfilePrivacy,
    mutedTags,
    mutedTagsLoading,
    mutedTagsError,
    onUnmuteTag,
    unmuteTagBusy,
    profLocationLabel = null,
    profDisplayName = null,
    viewerUsername = null,
  } = props

  return (
    <>
      <SettingsFollowingPanel privacy={privacy} onPrivacyChange={onPrivacyChange} />
      <div className="mt-6">
        <SettingsRequestsPanel privacy={privacy} onPrivacyChange={onPrivacyChange} />
      </div>
      <div className="mt-6">
        <BlockedMembersPanel />
      </div>
      <div className="mt-6">
        <SettingsSearchDiscoveryPanel
          privacy={privacy}
          onPrivacyChange={onPrivacyChange}
          profDiscoverable={profDiscoverable}
          onProfDiscoverableChange={onProfDiscoverableChange}
          profSectionLoading={profSectionLoading}
        />
      </div>
      <div className="mt-6">
        <SettingsLocationVisibilityPanel
          fvLocation={fvLocation}
          onFvLocationChange={onFvLocationChange}
          locationLabel={profLocationLabel}
          displayName={profDisplayName}
          username={viewerUsername}
          profSectionLoading={profSectionLoading}
        />
      </div>
      <div className="mt-6">
        <SettingsEventHistoryPanel privacy={privacy} onPrivacyChange={onPrivacyChange} />
      </div>
      <div className="mt-6">
        <SettingsInboxPanel privacy={privacy} onPrivacyChange={onPrivacyChange} />
      </div>
      <div className="mt-6">
        <SettingsDataRetentionPanel privacy={privacy} onPrivacyChange={onPrivacyChange} />
      </div>
      <div className="mt-6">
        <SettingsProfileFieldsPanel
          profSectionLoading={profSectionLoading}
          fvGender={fvGender}
          onFvGenderChange={onFvGenderChange}
          fvAge={fvAge}
          onFvAgeChange={onFvAgeChange}
          fvSexuality={fvSexuality}
          onFvSexualityChange={onFvSexualityChange}
          fvPronouns={fvPronouns}
          onFvPronounsChange={onFvPronounsChange}
          profPrivacyError={profPrivacyError}
          profPrivacySaved={profPrivacySaved}
          profPrivacySaving={profPrivacySaving}
          onSaveProfilePrivacy={onSaveProfilePrivacy}
        />
      </div>
      <div className="mt-6">
        <SettingsActivityFeedPanel feed={feed} onFeedChange={onFeedChange} />
      </div>
      <div className="mt-6">
        <SettingsMutedTagsPanel
          mutedTags={mutedTags}
          mutedTagsLoading={mutedTagsLoading}
          mutedTagsError={mutedTagsError}
          onUnmuteTag={onUnmuteTag}
          unmuteTagBusy={unmuteTagBusy}
        />
      </div>
    </>
  )
}

export { SettingsActivityFeedPanel } from './SettingsPrivacyPanels'
