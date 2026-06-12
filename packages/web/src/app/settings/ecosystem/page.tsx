import PresenterCatalogSection from '@/components/settings/PresenterCatalogSection'
import SettingsStaffSection from '@/components/settings/SettingsStaffSection'
import SettingsSupportSection from '@/components/settings/SettingsSupportSection'
import { useSettingsContext } from '../SettingsContext'

export default function SettingsEcosystemPage() {
  const { settingsEnabled } = useSettingsContext()

  return (
    <div className="space-y-6">
      <PresenterCatalogSection />
      <SettingsStaffSection enabled={settingsEnabled} />
      <SettingsSupportSection enabled={settingsEnabled} />
    </div>
  )
}
