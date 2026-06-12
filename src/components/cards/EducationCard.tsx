'use client'

import Link from 'next/link'
import TagLink from '@/components/TagLink'

export type EducationCardProps = {
  article: {
    id?: number | string
    title: string
    category?: string
    readTime?: string
    credibilityScore?: number
    slug?: string
    tags?: string[]
  }
}

export default function EducationCard({ article }: EducationCardProps) {
  const { id, title, category, readTime, credibilityScore, slug, tags } = article
  const href = slug ? `/education/${slug}` : id ? `/education/${id}` : '#'

  return (
    <div className="bg-c2k-bg-card rounded-2xl border border-white/10 p-4 shadow-c2k-soft hover:border-c2k-accent-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link href={href} className="flex-1 min-w-0 block">
          {category && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-c2k-accent-primary/20 text-c2k-accent-primary rounded-md mb-2">
              {category}
            </span>
          )}
          <h3 className="font-medium text-white line-clamp-2">{title}</h3>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.slice(0, 3).map((t) => (
                <TagLink key={t} tag={t} />
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-c2k-text-muted">
            {readTime && <span>{readTime} read</span>}
            {credibilityScore != null && credibilityScore > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-c2k-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {credibilityScore} credibility
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          className="p-2 rounded-lg text-c2k-text-muted hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
          aria-label="Bookmark"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
