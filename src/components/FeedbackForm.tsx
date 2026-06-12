'use client'

import { useState } from 'react'

/**
 * Post-interaction feedback form for reputation.
 * Maps to swing-club-platform reputation_feedback when API exists.
 * Kink-specific tags: Consent-aware, Scene-safe.
 */
export type InteractionType = 'dm' | 'event' | 'vendor_interaction'

const SENTIMENT_OPTIONS = [
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positive' },
] as const

const FEEDBACK_TAGS = [
  'Reliable',
  'Communicative',
  'Respectful of boundaries',
  'Consent-aware',
  'Scene-safe',
  'Safety concern',
] as const

type FeedbackTag = (typeof FEEDBACK_TAGS)[number]

export default function FeedbackForm({
  targetUserId,
  interactionType,
  onSubmitted,
  className = '',
}: {
  targetUserId: string
  interactionType: InteractionType
  onSubmitted?: () => void
  className?: string
}) {
  const [sentiment, setSentiment] = useState<'negative' | 'neutral' | 'positive'>('positive')
  const [selectedTags, setSelectedTags] = useState<Set<FeedbackTag>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = (tag: FeedbackTag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: POST to /api/reputation/feedback when API exists
    setSubmitted(true)
    onSubmitted?.()
  }

  if (submitted) {
    return (
      <div className={`rounded-lg bg-c2k-success/10 text-c2k-success px-4 py-3 text-sm ${className}`}>
        Thanks for your feedback.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-c2k-text-primary mb-2">How was your experience?</h3>
        <div className="flex gap-4">
          {SENTIMENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-c2k-text-secondary cursor-pointer">
              <input
                type="radio"
                name="sentiment"
                value={opt.value}
                checked={sentiment === opt.value}
                onChange={() => setSentiment(opt.value as 'negative' | 'neutral' | 'positive')}
                className="rounded-full border-white/20"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-c2k-text-primary mb-2">Tags (optional)</h3>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TAGS.map((tag) => (
            <label
              key={tag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                selectedTags.has(tag)
                  ? 'bg-c2k-accent-primary/20 text-c2k-accent-primary'
                  : 'bg-c2k-bg-card border border-white/10 text-c2k-text-secondary hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedTags.has(tag)}
                onChange={() => toggleTag(tag)}
                className="rounded border-white/20 sr-only"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover text-white rounded-lg"
      >
        Submit feedback
      </button>
    </form>
  )
}
