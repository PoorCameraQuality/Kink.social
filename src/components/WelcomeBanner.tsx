'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * Fetish.com-style welcome banner for new users.
 * Dismissible; persists in sessionStorage.
 */
export default function WelcomeBanner() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    setMounted(true)
    setDismissed(sessionStorage.getItem('c2k-welcome-dismissed') === '1')
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('c2k-welcome-dismissed', '1')
    }
  }

  if (!mounted || dismissed) return null

  return (
    <div className="relative bg-c2k-accent-primary/10 border border-c2k-accent-primary/30 rounded-xl px-4 py-3 mb-6">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-c2k-text-muted hover:text-white rounded"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <p className="text-sm text-c2k-text-primary pr-8">
        Welcome to Coast to Coast Kink! We&apos;re constantly developing and improving. Need help?{' '}
        <Link href="/support" className="text-c2k-accent-primary hover:underline">Support Center</Link>
        {' '}·{' '}
        <Link href="/discovery" className="text-c2k-accent-primary hover:underline">Search for members</Link>
        {' '}·{' '}
        <Link href="/profile" className="text-c2k-accent-primary hover:underline">Upload photos</Link>
        {' '}·{' '}
        <Link href="/chat" className="text-c2k-accent-primary hover:underline">Start a chat</Link>
      </p>
    </div>
  )
}
