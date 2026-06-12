'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'

type EventDto = {
  id: string
  slug: string
  productTitle: string
  eventTitle: string
  subtitle: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  sharedByLabel: string
  sharedByDetail: string | null
  logoUrl: string | null
  status: string
  staffAccessCode: string
  registrationAccessCode: string
}

function toLocalInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventSettingsPanel({ eventSlug }: { eventSlug: string }) {
  const [event, setEvent] = useState<EventDto | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadErr(null)
    try {
      const res = await organizerDancecardFetch<{ event: EventDto }>(eventSlug, '/event')
      setEvent(res.event)
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Failed to load')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function save(patch: Partial<EventDto>) {
    if (!event) return
    setSaving(true)
    setMsg(null)
    try {
      const body: Record<string, unknown> = {}
      if (patch.productTitle !== undefined) body.productTitle = patch.productTitle
      if (patch.eventTitle !== undefined) body.eventTitle = patch.eventTitle
      if (patch.subtitle !== undefined) body.subtitle = patch.subtitle
      if (patch.timezone !== undefined) body.timezone = patch.timezone
      if (patch.windowStartsAt !== undefined) body.windowStartsAt = patch.windowStartsAt
      if (patch.windowEndsAt !== undefined) body.windowEndsAt = patch.windowEndsAt
      if (patch.sharedByLabel !== undefined) body.sharedByLabel = patch.sharedByLabel
      if (patch.sharedByDetail !== undefined) body.sharedByDetail = patch.sharedByDetail
      if (patch.logoUrl !== undefined) body.logoUrl = patch.logoUrl
      if (patch.status !== undefined) body.status = patch.status
      if (patch.staffAccessCode !== undefined) body.staffAccessCode = patch.staffAccessCode
      if (patch.registrationAccessCode !== undefined) body.registrationAccessCode = patch.registrationAccessCode

      const res = await organizerDancecardFetch<{ event: EventDto }>(eventSlug, '/event', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setEvent(res.event)
      setMsg('Saved.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loadErr) {
    return <p className="text-sm text-rose-300">{loadErr}</p>
  }
  if (!event) {
    return <p className="text-sm text-slate-400">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {msg ? <p className="text-sm text-cyan-200/90">{msg}</p> : null}
      <div className="grid gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Status
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.status}
            onChange={(e) => {
              const status = e.target.value as 'draft' | 'published'
              setEvent({ ...event, status })
              void save({ status })
            }}
            disabled={saving}
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Timezone (IANA)
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.timezone}
            onChange={(e) => setEvent({ ...event, timezone: e.target.value })}
            onBlur={() => void save({ timezone: event.timezone })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Window start
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={toLocalInput(event.windowStartsAt)}
            onChange={(e) =>
              setEvent({ ...event, windowStartsAt: new Date(e.target.value).toISOString() })
            }
            onBlur={() => void save({ windowStartsAt: event.windowStartsAt })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Window end
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={toLocalInput(event.windowEndsAt)}
            onChange={(e) =>
              setEvent({ ...event, windowEndsAt: new Date(e.target.value).toISOString() })
            }
            onBlur={() => void save({ windowEndsAt: event.windowEndsAt })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Event title
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.eventTitle}
            onChange={(e) => setEvent({ ...event, eventTitle: e.target.value })}
            onBlur={() => void save({ eventTitle: event.eventTitle })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Product title
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.productTitle}
            onChange={(e) => setEvent({ ...event, productTitle: e.target.value })}
            onBlur={() => void save({ productTitle: event.productTitle })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Subtitle
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.subtitle ?? ''}
            onChange={(e) => setEvent({ ...event, subtitle: e.target.value || null })}
            onBlur={() => void save({ subtitle: event.subtitle })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Shared-by label
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.sharedByLabel}
            onChange={(e) => setEvent({ ...event, sharedByLabel: e.target.value })}
            onBlur={() => void save({ sharedByLabel: event.sharedByLabel })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Logo URL
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.logoUrl ?? ''}
            onChange={(e) => setEvent({ ...event, logoUrl: e.target.value || null })}
            onBlur={() => void save({ logoUrl: event.logoUrl })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Registration access code (empty = no gate)
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.registrationAccessCode}
            onChange={(e) => setEvent({ ...event, registrationAccessCode: e.target.value })}
            onBlur={() => void save({ registrationAccessCode: event.registrationAccessCode })}
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Staff / volunteer unlock code
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={event.staffAccessCode}
            onChange={(e) => setEvent({ ...event, staffAccessCode: e.target.value })}
            onBlur={() => void save({ staffAccessCode: event.staffAccessCode })}
          />
        </label>
        <button
          type="button"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          onClick={() => void load()}
        >
          Reload
        </button>
      </div>
    </div>
  )
}
