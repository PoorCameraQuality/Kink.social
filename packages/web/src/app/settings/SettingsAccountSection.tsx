import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from '@/components/dancecard/ui/Panel'
import SectionHeader from '@/components/ui/SectionHeader'
import StatusBanner from '@/components/ui/StatusBanner'
import AccountDeleteButton from '@/components/settings/AccountDeleteButton'
import SettingsAccountRow, {
  SettingsAccountActionLink,
} from '@/components/settings/SettingsAccountRow'
import { clearProfileEditLocalOverrides, hasProfileEditLocalOverrides } from '@/lib/profileEditLocalStorage'
import { useSettingsContext } from '@/app/settings/SettingsContext'

type Props = {
  viewerUsername: string | null
  viewerEmail: string | null
  apiBackedAccount?: boolean
  showModerationLink: boolean
}

export default function SettingsAccountSection({
  viewerUsername,
  viewerEmail,
  apiBackedAccount = false,
  showModerationLink,
}: Props) {
  const [profileLocalOverrides, setProfileLocalOverrides] = useState(false)

  useEffect(() => {
    if (apiBackedAccount) {
      clearProfileEditLocalOverrides()
    }
    setProfileLocalOverrides(hasProfileEditLocalOverrides())
  }, [apiBackedAccount])

  return (
    <>
      <Panel id="account" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Account"
          title="General"
          description="Login credentials and account type. Profile details live under Profile or Edit profile."
        />
        <div className="mt-2">
          <SettingsAccountRow
            label="Username"
            value={viewerUsername ? `@${viewerUsername}` : '-'}
            action={
              <Link to="/support" className="text-sm font-medium text-dc-accent hover:underline">
                Request change
              </Link>
            }
            hint="Permanent @handle for profile URLs and mentions. To change it, contact support. Display name is editable under Profile edit."
          />
          <SettingsAccountRow
            label="Display name"
            value="Edit on your profile"
            action={<SettingsAccountActionLink to="/profile/edit">Edit profile</SettingsAccountActionLink>}
            hint="Shown at the top of your public profile. This is not your login username."
          />
          <SettingsAccountRow
            label="Email"
            value={viewerEmail ?? 'Not on file'}
            action={
              <Link to="/support" className="text-sm font-medium text-dc-accent hover:underline">
                Contact support
              </Link>
            }
            hint="Login email changes are handled by support for security."
          />
          <SettingsAccountRow
            label="Password"
            value="••••••••••••"
            action={
              <span className="text-sm text-dc-muted" title="Coming soon">
                Change (soon)
              </span>
            }
          />
          <SettingsAccountRow
            label="Two-factor authentication"
            value={<span className="text-dc-danger">Disabled</span>}
            action={
              <span className="text-sm text-dc-muted" title="Coming soon">
                Enable (soon)
              </span>
            }
            hint="Extra sign-in protection will be available in a future release."
          />
          <SettingsAccountRow label="Account type" value="Personal" />
        </div>
      </Panel>

      {profileLocalOverrides ?
        <StatusBanner tone="warning" className="mt-6">
          Demo profile edits in this browser may differ from your saved account settings. Others may see outdated
          information until you save from{' '}
          <Link to="/profile/edit" className="underline font-medium">
            Profile edit
          </Link>
          . Clear site data for this site if your public profile looks wrong.
        </StatusBanner>
      : null}

      {showModerationLink ?
        <Panel className="mt-6">
          <SectionHeader
            eyebrow="Staff"
            title="Moderation tools"
            description="Platform moderator shortcuts. These do not change your personal privacy settings."
          />
          <div className="mt-4 space-y-2">
            <Link to="/moderation/dashboard" className="text-sm text-dc-accent hover:underline block">
              Trust &amp; Safety dashboard
            </Link>
            <Link to="/moderation/queues" className="text-sm text-dc-muted hover:text-dc-accent hover:underline block">
              Moderation queues
            </Link>
            <Link to="/moderation/cases" className="text-sm text-dc-muted hover:text-dc-accent hover:underline block">
              Moderation cases
            </Link>
            <Link
              to="/moderation/profile-flags"
              className="text-sm text-dc-muted hover:text-dc-accent hover:underline block"
            >
              Profile review flags (legacy)
            </Link>
          </div>
        </Panel>
      : null}
    </>
  )
}

export function SettingsAccountDangerPanel() {
  const { settingsEnabled } = useSettingsContext()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <Panel className="scroll-mt-24">
      <SectionHeader
        eyebrow="Account"
        title="Deactivate or delete"
        description="There is no going back once your account is deleted. Self-service deletion disables your account immediately and schedules private data for purge."
      />
      <div className="mt-4 space-y-3 text-sm">
        <p className="text-dc-muted">
          Export your data first if you need a copy.{' '}
          <Link to="/settings/privacy" className="text-dc-accent hover:underline">
            Privacy settings
          </Link>{' '}
          has download and full data controls.
        </p>
        {settingsEnabled ?
          <AccountDeleteButton onResult={setMsg} />
        : <p className="text-dc-muted">Sign in with a live account to delete from here.</p>}
        {msg ?
          <p className="text-dc-text-muted" role="status">
            {msg}
          </p>
        : null}
        <p className="text-dc-muted">
          Need help?{' '}
          <Link to="/support" className="text-dc-accent hover:underline">
            Contact support
          </Link>
          .
        </p>
      </div>
    </Panel>
  )
}
