import Button from '@/components/ui/Button'
import StatusBanner from '@/components/ui/StatusBanner'
import { useSettingsContext } from '@/app/settings/SettingsContext'

export default function SettingsBundleSaveBar() {
  const { saveError, saving, saved, saveSettings } = useSettingsContext()

  return (
    <div className="mt-8 space-y-3 border-t border-dc-border pt-6">
      {saveError ? <StatusBanner tone="error">{saveError}</StatusBanner> : null}
      {saved ? <StatusBanner tone="success">Saved.</StatusBanner> : null}
      <Button type="button" disabled={saving} onClick={() => void saveSettings()}>
        {saving ? 'Saving…' : 'Save settings'}
      </Button>
    </div>
  )
}
