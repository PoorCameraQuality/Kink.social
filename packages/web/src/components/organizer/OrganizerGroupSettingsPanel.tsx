import { useCallback, useEffect, useState } from 'react'
import EckePublishStub from '@/components/organizer/EckePublishStub'
import GroupSettingsPanel from '@/components/organizer/admin/GroupSettingsPanel'
import ScopeBrandingPanel from '@/components/organizer/ScopeBrandingPanel'
import PaymentsPlaceholder from '@/components/organizer/PaymentsPlaceholder'
import ScopeEmailBroadcastPanel from '@/components/email/ScopeEmailBroadcastPanel'
import OrganizerPanel from '@/components/organizer/ui/OrganizerPanel'
import { useGroupBrandingSettings } from '@/hooks/useGroupBrandingSettings'

type GroupRecord = {
  id: string
  slug: string
  name: string
  visibility: string
  bannerUrl?: string | null
  logoUrl?: string | null
  shareImageUrl?: string | null
}

type Props = {
  groupId: string
  groupName: string
}

export default function OrganizerGroupSettingsPanel({ groupId, groupName }: Props) {
  const [group, setGroup] = useState<GroupRecord | null>(null)

  const reloadGroup = useCallback(async () => {
    const r = await fetch(`/api/v1/groups/${encodeURIComponent(groupId)}`, { credentials: 'include' })
    if (!r.ok) return
    const j = (await r.json()) as { group?: GroupRecord }
    if (j.group) setGroup(j.group)
  }, [groupId])

  useEffect(() => {
    void reloadGroup()
  }, [reloadGroup])

  const { msg, uploading, uploadAsset, clearAsset } = useGroupBrandingSettings(groupId, reloadGroup)

  return (
    <div className="space-y-4 max-w-3xl">
      <OrganizerPanel
        title="Group settings"
        description="Metadata, branding, and ECKE listing for this group."
      />
      {msg ?
        <p className="text-sm rounded-xl border border-dc-border bg-dc-elevated/95 px-3 py-2 text-dc-text-muted" role="status">
          {msg}
        </p>
      : null}
      <OrganizerPanel title="Branding" description="Banner, logo, and link preview image for shares.">
        <ScopeBrandingPanel
          scopeLabel={group?.name ?? groupName}
          title={group?.name ?? groupName}
          bannerUrl={group?.bannerUrl ?? null}
          logoUrl={group?.logoUrl ?? null}
          shareImageUrl={group?.shareImageUrl ?? null}
          onUpload={(k) => void uploadAsset(k)}
          onClear={(k) => void clearAsset(k)}
          uploading={uploading}
        />
      </OrganizerPanel>
      <GroupSettingsPanel groupId={groupId} onGroupUpdated={() => void reloadGroup()} />
      <ScopeEmailBroadcastPanel scopeType="group" scopeKey={groupId} canManage />
      <EckePublishStub scopeLabel={groupName} scopeType="group" scopeSlug={groupId} />
      <PaymentsPlaceholder />
    </div>
  )
}
