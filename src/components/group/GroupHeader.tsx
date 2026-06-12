'use client'

import TagLink from '@/components/TagLink'
import type { MockGroup } from '@/data/mock-data'

interface GroupHeaderProps {
  group: MockGroup
  /** Viewer is already a member (from mock group members). */
  isMember: boolean
  /** Join (mock adds member + refreshes parent). */
  onJoin: () => void
  /** Leave (mock removes member unless owner). */
  onLeave: () => void
}

export default function GroupHeader({ group, isMember, onJoin, onLeave }: GroupHeaderProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-6">
      <div className="h-32 sm:h-40 bg-gradient-to-br from-c2k-bg-charcoal to-c2k-bg-elevated" />
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-c2k-bg to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            <p className="text-sm text-c2k-text-muted mt-1">{group.members} members</p>
            {group.tags && group.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.tags.map((tag) => (
                  <TagLink key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>
          {isMember ? (
            <button
              type="button"
              onClick={onLeave}
              className="px-4 py-2 rounded-xl text-sm font-medium min-h-11 border border-white/20 text-c2k-danger hover:bg-white/5"
            >
              Leave group
            </button>
          ) : (
            <button
              type="button"
              onClick={onJoin}
              className="px-4 py-2 rounded-xl text-sm font-medium min-h-11 bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover text-white"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
