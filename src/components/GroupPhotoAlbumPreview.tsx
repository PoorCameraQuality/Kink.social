'use client'

import Link from 'next/link'
import type { MockGroupPhoto } from '@/data/mock-data'

type GroupPhotoAlbumPreviewProps = {
  photos: MockGroupPhoto[]
  groupId: string
}

/** Compact photo grid for sidebar. Photos require approval before appearing. */
export default function GroupPhotoAlbumPreview({ photos, groupId }: GroupPhotoAlbumPreviewProps) {
  const previewCount = 6
  const displayPhotos = photos.slice(0, previewCount)

  return (
    <div className="bg-c2k-bg-card rounded-2xl border border-white/10 p-4 shadow-c2k-soft">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Photo Album</h3>
        <Link
          href={`/groups/${groupId}?tab=Photos`}
          className="text-xs text-c2k-accent-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <p className="text-xs text-c2k-text-muted mb-3">Members can upload; photos require approval.</p>
      {displayPhotos.length === 0 ? (
        <p className="text-sm text-c2k-text-muted py-4 text-center">No approved photos yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {displayPhotos.map((p) => (
            <div
              key={p.id}
              className="aspect-square rounded-lg bg-c2k-bg-elevated flex items-center justify-center overflow-hidden"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-c2k-bg-charcoal to-c2k-bg-elevated">
                <svg className="w-6 h-6 text-c2k-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
