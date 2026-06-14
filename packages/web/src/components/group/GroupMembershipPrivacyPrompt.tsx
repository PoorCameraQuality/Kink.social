import { useId, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { GroupMemberListVisibility } from '@c2k/shared'

export type GroupJoinPrivacyChoices = {
  memberListVisibility: GroupMemberListVisibility
  showGroupOnProfile: boolean
  announceGroupJoinInFeed: boolean
  rememberAsDefault: boolean
}

type Props = {
  open: boolean
  groupName: string
  defaults: Omit<GroupJoinPrivacyChoices, 'rememberAsDefault'>
  joining?: boolean
  onCancel: () => void
  onConfirm: (choices: GroupJoinPrivacyChoices) => void
}

export default function GroupMembershipPrivacyPrompt({
  open,
  groupName,
  defaults,
  joining = false,
  onCancel,
  onConfirm,
}: Props) {
  const baseId = useId()
  const [memberListVisibility, setMemberListVisibility] = useState<GroupMemberListVisibility>(
    defaults.memberListVisibility,
  )
  const [showGroupOnProfile, setShowGroupOnProfile] = useState(defaults.showGroupOnProfile)
  const [announceGroupJoinInFeed, setAnnounceGroupJoinInFeed] = useState(defaults.announceGroupJoinInFeed)
  const [rememberAsDefault, setRememberAsDefault] = useState(false)

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title="Show your name in this group's member list?"
      description="Some groups can reveal location, identity, interests, or scene participation. You can choose whether other members can see you in the member list. Group owners and moderators can always see members for safety and moderation."
      maxWidthClass="max-w-lg"
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={joining}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={joining}
            onClick={() =>
              onConfirm({
                memberListVisibility,
                showGroupOnProfile,
                announceGroupJoinInFeed,
                rememberAsDefault,
              })
            }
          >
            {joining ? 'Joining…' : 'Join group'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-dc-text-muted">
          Joining <span className="font-medium text-dc-text">{groupName}</span>.
        </p>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-dc-text">Member list visibility</legend>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-dc-border p-3">
            <input
              type="radio"
              name={`${baseId}-visibility`}
              checked={memberListVisibility === 'visible'}
              onChange={() => setMemberListVisibility('visible')}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-dc-text">Show me in the member list</span>
              <span className="block text-xs text-dc-text-muted">Other members can see you joined.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-dc-border p-3">
            <input
              type="radio"
              name={`${baseId}-visibility`}
              checked={memberListVisibility === 'hidden'}
              onChange={() => setMemberListVisibility('hidden')}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-dc-text">Keep me hidden from the member list</span>
              <span className="block text-xs text-dc-text-muted">Group staff can still see you for moderation.</span>
            </span>
          </label>
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={showGroupOnProfile}
            onChange={(e) => setShowGroupOnProfile(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-dc-text-muted">Show this group on my profile</span>
        </label>

        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={announceGroupJoinInFeed}
            onChange={(e) => setAnnounceGroupJoinInFeed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-dc-text-muted">Allow joining this group to appear in feed activity</span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 border-t border-dc-border pt-3">
          <input
            type="checkbox"
            checked={rememberAsDefault}
            onChange={(e) => setRememberAsDefault(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-dc-text-muted">Remember this as my default for future groups</span>
        </label>
      </div>
    </Dialog>
  )
}
