'use client'

import Image from 'next/image'
import Link from 'next/link'
import TagLink from '@/components/TagLink'

export type EventCardProps = {
  event: {
    id: number | string
    title: string
    date: string
    location: string
    rsvpCount: number
    hostVerified?: boolean
    imageUrl?: string | null
    tags?: string[]
  }
}

export default function EventCard({ event }: EventCardProps) {
  const { id, title, date, location, rsvpCount, hostVerified, imageUrl, tags } = event

  return (
    <div className="relative bg-c2k-bg-card rounded-2xl border border-white/10 overflow-hidden shadow-c2k-soft hover:border-c2k-accent-primary/30 transition-colors">
      <div className="relative aspect-[2/1] bg-c2k-bg-elevated">
        <Link
          href={`/events/${id}`}
          className="absolute inset-0 z-0 block"
          aria-label={`View event: ${title}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-c2k-bg-charcoal to-c2k-bg-elevated">
              <svg className="w-12 h-12 text-c2k-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </Link>
        <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-c2k-bg-card/90 backdrop-blur-sm rounded-lg text-xs font-medium text-white pointer-events-none">
          {date}
        </span>
        {hostVerified && (
          <span className="absolute top-3 right-3 z-10 px-2 py-1 bg-c2k-accent-primary/90 rounded-lg text-xs font-medium text-white flex items-center gap-1 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified Host
          </span>
        )}
        <button
          type="button"
          className="absolute bottom-3 right-3 z-20 min-h-11 min-w-11 inline-flex items-center justify-center rounded-full bg-c2k-bg-card/90 backdrop-blur-sm text-c2k-text-muted hover:text-white transition-colors"
          aria-label="Save event"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      <Link href={`/events/${id}`} className="block p-4">
        <h3 className="font-semibold text-white line-clamp-2">{title}</h3>
        <p className="mt-1 text-sm text-c2k-text-secondary flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.slice(0, 3).map((t) => (
              <TagLink key={t} tag={t} />
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-c2k-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-c2k-accent-primary rounded-full"
              style={{ width: `${Math.min(100, (rsvpCount / 100) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-c2k-text-muted">{rsvpCount} attending</span>
        </div>
      </Link>
    </div>
  )
}
