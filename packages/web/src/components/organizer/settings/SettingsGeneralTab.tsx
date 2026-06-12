import { useEffect, useState } from 'react'
import {
  PublicHubPreviewCard,
  SettingsSection,
  SettingsSubsectionHeader,
} from '@/components/organizer/settings/settings-ui'
import { cn } from '@/lib/cn'
import { VISIBILITY_OPTIONS } from '@/lib/organizer/org-settings-utils'
import type { OrgFlags } from '@/components/org/OrgAdminDashboard'

type OrgSlice = {
  displayName: string
  visibility: string
  featureFlags: OrgFlags
  externalSiteUrl: string | null
  showExternalEmbed: boolean
  logoUrl: string | null
  bannerUrl: string | null
}

type Props = {
  org: OrgSlice
  publicHubHref: string
  aboutHref: string
  onPatch: (body: Record<string, unknown>, msg?: string) => Promise<boolean>
}

export default function SettingsGeneralTab({ org, publicHubHref, aboutHref, onPatch }: Props) {
  const [displayName, setDisplayName] = useState(org.displayName)
  const [visibility, setVisibility] = useState(org.visibility)
  const [externalUrl, setExternalUrl] = useState(org.externalSiteUrl ?? '')
  const [embedOn, setEmbedOn] = useState(org.showExternalEmbed)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingExternal, setSavingExternal] = useState(false)

  useEffect(() => {
    setDisplayName(org.displayName)
    setVisibility(org.visibility)
    setExternalUrl(org.externalSiteUrl ?? '')
    setEmbedOn(org.showExternalEmbed)
  }, [org])

  const profileDirty =
    displayName.trim() !== org.displayName || visibility !== org.visibility
  const externalDirty =
    externalUrl.trim() !== (org.externalSiteUrl ?? '').trim() || embedOn !== org.showExternalEmbed

  async function saveProfile() {
    setSavingProfile(true)
    try {
      await onPatch(
        { displayName: displayName.trim(), visibility },
        'Public profile saved.',
      )
    } finally {
      setSavingProfile(false)
    }
  }

  async function saveExternal() {
    setSavingExternal(true)
    try {
      const trimmed = externalUrl.trim()
      await onPatch(
        {
          externalSiteUrl: trimmed.length > 0 ? trimmed : null,
          showExternalEmbed: embedOn,
        },
        'External site settings saved.',
      )
    } finally {
      setSavingExternal(false)
    }
  }

  const embedFeatureOff = !org.featureFlags.externalEmbedEnabled

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
      <div className="space-y-5">
        <SettingsSection>
          <SettingsSubsectionHeader
            title="Public profile"
            subtitle="How your organization appears in discovery and on the hub header."
          />
          <label className="block text-sm font-medium text-dc-text" htmlFor="org-display-name">
            Display name
          </label>
          <input
            id="org-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={255}
            className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-3 py-2.5 text-sm text-dc-text"
          />

          <p className="mt-5 text-sm font-medium text-dc-text">Visibility</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition-colors',
                  visibility === opt.value ?
                    'border-dc-accent bg-dc-accent/10'
                  : 'border-dc-border bg-dc-surface/30 hover:border-dc-border-strong',
                )}
              >
                <p className="text-sm font-semibold text-dc-text">{opt.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-dc-text-muted">{opt.description}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={savingProfile || !displayName.trim() || !profileDirty}
            onClick={() => void saveProfile()}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-dc-accent px-5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
          >
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </SettingsSection>

        <SettingsSection>
          <SettingsSubsectionHeader
            title="External site embed"
            subtitle="Show an approved external website on the About tab of your public hub."
          />
          {embedFeatureOff ?
            <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90">
              External site embeds are currently disabled.{' '}
              <span className="text-dc-text-muted">Enable them in </span>
              <span className="font-medium text-dc-accent">Features</span> first.
            </p>
          : null}

          <label className="block text-sm font-medium text-dc-text" htmlFor="external-site-url">
            Site URL
          </label>
          <input
            id="external-site-url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://your-organization-site.com"
            disabled={embedFeatureOff}
            className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-3 py-2.5 text-sm text-dc-text disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-dc-muted">
            The URL must be approved by the server allowlist before it can be embedded on About.
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-dc-text-muted">
            <input
              type="checkbox"
              checked={embedOn}
              disabled={embedFeatureOff}
              onChange={(e) => setEmbedOn(e.target.checked)}
              className="mt-1"
            />
            <span>Allow embedded site on About (when URL is approved)</span>
          </label>

          <button
            type="button"
            disabled={savingExternal || embedFeatureOff || !externalDirty}
            onClick={() => void saveExternal()}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-dc-accent px-5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
          >
            {savingExternal ? 'Saving…' : 'Save external site'}
          </button>
        </SettingsSection>
      </div>

      <aside>
        <PublicHubPreviewCard
          displayName={displayName.trim() || org.displayName}
          visibility={visibility}
          logoUrl={org.logoUrl}
          bannerUrl={org.bannerUrl}
          publicHubHref={publicHubHref}
          aboutHref={aboutHref}
          externalEnabled={org.featureFlags.externalEmbedEnabled}
          externalUrl={externalUrl.trim() || null}
          embedOn={embedOn}
        />
      </aside>
    </div>
  )
}
