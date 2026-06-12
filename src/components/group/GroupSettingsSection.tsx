'use client'

import Card from '@/components/ui/Card'
import GroupRoleBadge from '@/components/GroupRoleBadge'
import GroupTagsEditor from './GroupTagsEditor'
import { useGroupDetailContext } from '@/contexts/GroupDetailContext'
import type { MockGroupMember } from '@/data/mock-data'

interface GroupSettingsSectionProps {
  members: MockGroupMember[]
}

export default function GroupSettingsSection({
  members,
}: GroupSettingsSectionProps) {
  const { group, canManage, refreshPhotos } = useGroupDetailContext()
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-c2k-text-muted uppercase mb-4">Group Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-c2k-text-secondary mb-1">Group name</label>
            <input
              type="text"
              value={group.name}
              readOnly
              className="w-full px-3 py-2 bg-c2k-bg border border-white/10 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-c2k-text-secondary mb-1">Description</label>
            <textarea
              value={group.description ?? ''}
              readOnly
              rows={3}
              className="w-full px-3 py-2 bg-c2k-bg border border-white/10 rounded-lg text-white text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-c2k-text-secondary mb-1">Visibility</label>
            <input
              type="text"
              value={group.visibility ?? 'public'}
              readOnly
              className="w-full px-3 py-2 bg-c2k-bg border border-white/10 rounded-lg text-white text-sm capitalize"
            />
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-c2k-text-muted uppercase mb-4">Group Tags</h3>
        <p className="text-xs text-c2k-text-muted mb-3">Add or remove tags to help others discover this group.</p>
        {/* Triggers re-render so updated group.tags are visible; no dedicated refreshGroup in context yet */}
        <GroupTagsEditor groupId={group.id} currentTags={group.tags ?? []} onSave={refreshPhotos} />
      </Card>
      {canManage && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-c2k-text-muted uppercase mb-4">Role Management</h3>
          <p className="text-xs text-c2k-text-muted mb-4">
            Assign roles to members. Changes are not persisted (mock).
          </p>
          <ul className="space-y-3">
            {members.map((member) => (
              <li
                key={`${member.groupId}-${member.userId}`}
                className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-c2k-bg-elevated flex items-center justify-center text-c2k-text-muted flex-shrink-0 text-sm">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white truncate">{member.username}</span>
                  <GroupRoleBadge role={member.role} />
                </div>
                <select
                  defaultValue={member.role}
                  className="px-3 py-1.5 bg-c2k-bg border border-white/10 rounded-lg text-sm text-white"
                  aria-label={`Role for ${member.username}`}
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="event_host">Event Host</option>
                  <option value="vetted">Vetted</option>
                  <option value="member">Member</option>
                </select>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-c2k-accent-primary/20 text-c2k-accent-primary rounded-lg text-sm font-medium cursor-not-allowed"
            disabled
            title="Mock: no persistence"
          >
            Save
          </button>
        </Card>
      )}
      <p className="text-xs text-c2k-text-muted">Placeholder: invite link, vetting queue — coming soon.</p>
    </div>
  )
}
