import { Link } from 'react-router-dom'
import OrganizerOrgCommunicationsPanel from '@/components/organizer/communications/OrganizerOrgCommunicationsPanel'
import GroupCommunicationsAdminPanel from '@/components/organizer/admin/GroupCommunicationsAdminPanel'
import GroupForumModerationPanel from '@/components/organizer/admin/GroupForumModerationPanel'
import OrganizerPanel from '@/components/organizer/ui/OrganizerPanel'

type Props = {
  scopeKind?: 'org' | 'group'
  orgSlug?: string
  groupId?: string
  forumsEnabled?: boolean
  chatEnabled?: boolean
  showSettings?: boolean
  viewerRole?: string | null
}

export default function OrganizerCommunicationsPanel({
  scopeKind = 'org',
  orgSlug,
  groupId,
  forumsEnabled = true,
  chatEnabled = true,
  showSettings = false,
  viewerRole = null,
}: Props) {
  if (scopeKind === 'org' && orgSlug) {
    return (
      <OrganizerOrgCommunicationsPanel
        orgSlug={orgSlug}
        forumsEnabled={forumsEnabled !== false}
        chatEnabled={chatEnabled !== false}
        showSettings={showSettings}
        viewerRole={viewerRole}
      />
    )
  }

  const publicGroupHref = scopeKind === 'group' && groupId ? `/groups/${encodeURIComponent(groupId)}` : undefined

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(12rem,16rem)]">
      <div className="min-w-0 space-y-4">
        <OrganizerPanel
          title="Communications"
          description="Set up the structure for your member forums and chat. Members participate from the public organization hub."
        />
        {scopeKind === 'group' && groupId ?
          <>
            <GroupForumModerationPanel groupId={groupId} />
            <GroupCommunicationsAdminPanel groupId={groupId} />
          </>
        : null}
      </div>
      {publicGroupHref ?
        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <OrganizerPanel title="Member-facing spaces" description="Open the group page where members interact.">
            <Link
              to={publicGroupHref}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-dc-accent px-3 text-sm font-medium text-dc-text hover:bg-dc-accent-hover"
            >
              Open group page
            </Link>
          </OrganizerPanel>
        </aside>
      : null}
    </div>
  )
}
