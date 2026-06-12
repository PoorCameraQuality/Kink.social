'use client'

import Link from 'next/link'
import TrustRing from '@/components/TrustRing'
import TrustTierIndicator from '@/components/TrustTierIndicator'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import { getTrustTierFromScore } from '@/data/mock-data'

export type PersonCardProps = {
  person: {
    id?: number | string
    username: string
    roles?: string[]
    trustScore?: number
    verified?: boolean
    mutualCount?: number
    distance?: string
  }
}

export default function PersonCard({ person }: PersonCardProps) {
  const { username, roles = [], trustScore = 0, verified, mutualCount = 0, distance } = person

  return (
    <Link
      href={`/profile/${username}`}
      className="block bg-c2k-bg-card rounded-2xl border border-white/10 p-4 shadow-c2k-soft hover:border-c2k-accent-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <TrustRing
            score={trustScore}
            size="sm"
            showBreakdown={false}
            className="rounded-full"
          >
            <PlaceholderAvatar size="sm" className="!rounded-full" />
          </TrustRing>
          {verified && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-c2k-accent-primary rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-medium text-white truncate">{username}</p>
            <TrustTierIndicator tier={getTrustTierFromScore(trustScore)} size="sm" showLabel={false} className="flex-shrink-0" />
          </div>
          {roles.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {roles.slice(0, 3).map((role) => (
                <span key={role} className="px-2 py-0.5 text-xs bg-c2k-bg-elevated text-c2k-text-secondary rounded-md">
                  {role}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-c2k-text-muted">
            {mutualCount > 0 && <span>{mutualCount} mutual</span>}
            {distance && <span>{distance}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
