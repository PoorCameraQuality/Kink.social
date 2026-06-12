'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import { useGroupDetailContext } from '@/contexts/GroupDetailContext'
import type { MockResource } from '@/data/mock-data'

interface GroupResourcesSectionProps {
  resources: MockResource[]
  addResourceOpen: boolean
  setAddResourceOpen: (open: boolean) => void
  newResourceName: string
  setNewResourceName: (value: string) => void
  newResourceLink: string
  setNewResourceLink: (value: string) => void
  newResourceType: string
  setNewResourceType: (value: string) => void
  onAddResource: () => void
  onRemoveResource: (id: string) => void
}

export default function GroupResourcesSection({
  resources,
  addResourceOpen,
  setAddResourceOpen,
  newResourceName,
  setNewResourceName,
  newResourceLink,
  setNewResourceLink,
  newResourceType,
  setNewResourceType,
  onAddResource,
  onRemoveResource,
}: GroupResourcesSectionProps) {
  const { group, canManage } = useGroupDetailContext()
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-c2k-text-muted uppercase">Shared Resources</h3>
        {canManage ? (
          <button
            type="button"
            onClick={() => setAddResourceOpen(true)}
            className="px-3 py-1.5 text-sm bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover text-white rounded-lg font-medium"
          >
            Add resource
          </button>
        ) : (
          <button
            type="button"
            className="px-3 py-1.5 text-sm text-c2k-accent-primary/70 cursor-not-allowed"
            disabled
            title="Owner/admin only"
          >
            Add resource
          </button>
        )}
      </div>
      {addResourceOpen && canManage && (
        <div className="mb-4 p-4 bg-c2k-bg rounded-xl border border-white/10 space-y-2">
          <input
            value={newResourceName}
            onChange={(e) => setNewResourceName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 bg-c2k-bg-elevated border border-white/10 rounded text-sm text-white"
          />
          <input
            value={newResourceLink}
            onChange={(e) => setNewResourceLink(e.target.value)}
            placeholder="Link (e.g. https://...)"
            className="w-full px-3 py-2 bg-c2k-bg-elevated border border-white/10 rounded text-sm text-white"
          />
          <select
            value={newResourceType}
            onChange={(e) => setNewResourceType(e.target.value)}
            className="px-3 py-2 bg-c2k-bg-elevated border border-white/10 rounded text-sm text-white"
          >
            <option value="Link">Link</option>
            <option value="Document">Document</option>
            <option value="PDF">PDF</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAddResource}
              className="px-3 py-1.5 text-sm bg-c2k-accent-primary text-white rounded"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAddResourceOpen(false)
                setNewResourceName('')
                setNewResourceLink('')
              }}
              className="px-3 py-1.5 text-sm text-c2k-text-muted hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <ul className="space-y-3">
        {resources.map((resource) => (
          <li key={resource.id} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
            <Link href={resource.link} className="font-medium text-white hover:text-c2k-accent-primary">
              {resource.name}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-c2k-text-muted">{resource.type}</span>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onRemoveResource(resource.id)}
                  className="text-xs text-c2k-danger hover:text-c2k-danger/90"
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {resources.length === 0 && !addResourceOpen && (
        <p className="text-sm text-c2k-text-muted py-4">No resources yet.</p>
      )}
    </Card>
  )
}
