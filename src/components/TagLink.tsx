'use client'

import Link from 'next/link'

type TagLinkProps = {
  tag: string
  className?: string
}

export default function TagLink({ tag, className = '' }: TagLinkProps) {
  const normalized = tag.trim().toLowerCase()
  if (!normalized) return null
  return (
    <Link
      href={`/tags/${encodeURIComponent(normalized)}`}
      className={`text-c2k-accent-primary hover:text-c2k-accent-primary-hover hover:underline text-sm ${className}`}
    >
      #{normalized}
    </Link>
  )
}
