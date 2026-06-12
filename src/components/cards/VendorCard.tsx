'use client'

import Image from 'next/image'
import Link from 'next/link'

export type VendorCardProps = {
  vendor: {
    id?: number | string
    name: string
    categories?: string[]
    rating?: number
    shipsTo?: string
    upcomingEvents?: number
    logoUrl?: string | null
  }
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const { id, name, categories = [], rating = 0, shipsTo, upcomingEvents = 0, logoUrl } = vendor

  return (
    <Link
      href={id ? `/vendors/${id}` : '#'}
      className="block bg-c2k-bg-card rounded-2xl border border-white/10 p-4 shadow-c2k-soft hover:border-c2k-accent-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="relative w-12 h-12 rounded-xl bg-c2k-bg-elevated flex items-center justify-center flex-shrink-0 overflow-hidden">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={48}
              height={48}
              className="object-cover"
              unoptimized
            />
          ) : (
            <svg className="w-6 h-6 text-c2k-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{name}</p>
          {categories.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {categories.slice(0, 3).map((cat) => (
                <span key={cat} className="px-2 py-0.5 text-xs bg-c2k-bg-elevated text-c2k-text-secondary rounded-md">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-c2k-text-muted">
            {rating > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating.toFixed(1)}
              </span>
            )}
            {shipsTo && <span>Ships to {shipsTo}</span>}
            {upcomingEvents > 0 && <span>{upcomingEvents} events</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
