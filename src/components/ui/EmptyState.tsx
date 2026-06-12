'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'

interface EmptyStateProps {
  message: string
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

export default function EmptyState({ message, ctaLabel, ctaHref, className = '' }: EmptyStateProps) {
  return (
    <Card className={`p-12 text-center ${className}`.trim()}>
      <p className="text-c2k-text-secondary">{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="inline-block mt-4 text-c2k-accent-primary hover:underline">
          {ctaLabel}
        </Link>
      )}
    </Card>
  )
}
