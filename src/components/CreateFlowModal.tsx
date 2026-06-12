'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const CREATE_OPTIONS = [
  { id: 'post', label: 'Post', description: 'Share a status or update', href: '/home?tab=Local' },
  { id: 'event', label: 'Event', description: 'Create a new event', href: '/events' },
  { id: 'group', label: 'Group', description: 'Start a community group', href: '/groups' },
  { id: 'vendor', label: 'Vendor Listing', description: 'Add your business', href: '/vendors' },
  { id: 'article', label: 'Article', description: 'Write an education article', href: '/education' },
] as const

export default function CreateFlowModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [eventStep, setEventStep] = useState(1)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setSelectedOption(null)
    setEventStep(1)
    queueMicrotask(() => {
      previousFocusRef.current?.focus?.()
      previousFocusRef.current = null
    })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-create-trigger]')) {
        e.preventDefault()
        previousFocusRef.current = document.activeElement as HTMLElement
        setIsOpen(true)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'))
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const t = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      first?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(t)
    }
  }, [isOpen, handleClose, selectedOption, eventStep])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[310] w-full max-w-md max-h-[90vh] overflow-y-auto bg-c2k-bg-card border border-white/10 rounded-2xl shadow-c2k-soft p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="create-modal-title" className="text-lg font-semibold text-white">
            Create
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-c2k-text-muted hover:text-white rounded-lg"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!selectedOption ? (
          <div className="space-y-2">
            {CREATE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-c2k-accent-primary/30 hover:bg-white/5 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-c2k-accent-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-c2k-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">{opt.label}</p>
                  <p className="text-sm text-c2k-text-muted">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : selectedOption === 'event' ? (
          <div>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full ${eventStep >= s ? 'bg-c2k-accent-primary' : 'bg-c2k-bg-elevated'}`}
                />
              ))}
            </div>
            {eventStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Step 1: Basics</h3>
                <div>
                  <label htmlFor="create-event-title" className="sr-only">
                    Event title
                  </label>
                  <input
                    id="create-event-title"
                    type="text"
                    placeholder="Event title"
                    className="w-full px-4 py-2 bg-c2k-bg border border-white/10 rounded-xl text-white placeholder-c2k-text-muted text-sm"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="create-event-location" className="sr-only">
                    Location
                  </label>
                  <input
                    id="create-event-location"
                    type="text"
                    placeholder="Location"
                    className="w-full px-4 py-2 bg-c2k-bg border border-white/10 rounded-xl text-white placeholder-c2k-text-muted text-sm"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label htmlFor="create-event-datetime" className="sr-only">
                    Date and time
                  </label>
                  <input
                    id="create-event-datetime"
                    type="datetime-local"
                    className="w-full px-4 py-2 bg-c2k-bg border border-white/10 rounded-xl text-white text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedOption(null)} className="px-4 py-2 text-c2k-text-secondary hover:text-white">
                    Back
                  </button>
                  <button type="button" onClick={() => setEventStep(2)} className="px-4 py-2 bg-c2k-accent-primary text-white rounded-xl">
                    Next
                  </button>
                </div>
              </div>
            )}
            {eventStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Step 2: Description</h3>
                <div>
                  <label htmlFor="create-event-description" className="sr-only">
                    Description
                  </label>
                  <textarea
                    id="create-event-description"
                    placeholder="Description"
                    rows={3}
                    className="w-full px-4 py-2 bg-c2k-bg border border-white/10 rounded-xl text-white placeholder-c2k-text-muted text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="create-event-rules" className="sr-only">
                    Rules
                  </label>
                  <textarea
                    id="create-event-rules"
                    placeholder="Rules"
                    rows={2}
                    className="w-full px-4 py-2 bg-c2k-bg border border-white/10 rounded-xl text-white placeholder-c2k-text-muted text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEventStep(1)} className="px-4 py-2 text-c2k-text-secondary hover:text-white">
                    Back
                  </button>
                  <button type="button" onClick={() => setEventStep(3)} className="px-4 py-2 bg-c2k-accent-primary text-white rounded-xl">
                    Next
                  </button>
                </div>
              </div>
            )}
            {eventStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Step 3: Visibility</h3>
                <label className="flex items-center gap-2 text-sm text-c2k-text-secondary cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20" />
                  Verification required
                </label>
                <label className="flex items-center gap-2 text-sm text-c2k-text-secondary cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20" />
                  Vendor slots available
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEventStep(2)} className="px-4 py-2 text-c2k-text-secondary hover:text-white">
                    Back
                  </button>
                  <button type="button" onClick={() => setEventStep(4)} className="px-4 py-2 bg-c2k-accent-primary text-white rounded-xl">
                    Next
                  </button>
                </div>
              </div>
            )}
            {eventStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Step 4: Preview & Publish</h3>
                <p className="text-sm text-c2k-text-muted">Review your event and publish when ready.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEventStep(3)} className="px-4 py-2 text-c2k-text-secondary hover:text-white">
                    Back
                  </button>
                  <button type="button" onClick={handleClose} className="px-4 py-2 bg-c2k-accent-primary text-white rounded-xl">
                    Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-c2k-text-secondary text-sm">
              You will be redirected to create a {CREATE_OPTIONS.find((o) => o.id === selectedOption)?.label}.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelectedOption(null)} className="px-4 py-2 text-c2k-text-secondary hover:text-white">
                Back
              </button>
              <Link
                href={CREATE_OPTIONS.find((o) => o.id === selectedOption)?.href ?? '/home'}
                className="px-4 py-2 bg-c2k-accent-primary text-white rounded-xl inline-block text-center"
                onClick={handleClose}
              >
                Continue
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
