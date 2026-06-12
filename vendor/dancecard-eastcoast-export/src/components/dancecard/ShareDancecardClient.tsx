'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { MutualAvailabilityStrip } from '@/components/dancecard/MutualAvailabilityStrip'
import { dayRangesFromSchedule } from '@/components/dancecard/eventAvailability'
import { toDatetimeLocalValue, utcMillisAtZonedWallClock, zonedCalendarDateFromUtc } from '@/components/dancecard/time'

type SharePayload = {
  meta: {
    eventTitle: string
    timezone: string
    windowStartsAt: string
    windowEndsAt: string
  } | null
  host: { displayName: string }
  viewerYou: string | null
  hostFreeGaps: { start: string; end: string }[]
  hostBusy: { start: string; end: string }[]
  mutualFreeGaps: { start: string; end: string }[] | null
  slots: {
    id: string
    startsAt: string
    endsAt: string
    title: string
    track: string | null
    room: string | null
    description: string | null
  }[]
}

type MeLight = { account: { displayName: string } } | null

export function ShareDancecardClient(props: { eventSlug: string; token: string }) {
  const { eventSlug, token } = props
  const [data, setData] = useState<SharePayload | null>(null)
  const [me, setMe] = useState<MeLight>(null)
  const [err, setErr] = useState<string | null>(null)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<{ ok: boolean } | null>(null)
  const [reserveNotice, setReserveNotice] = useState<null | { kind: 'ok' } | { kind: 'error'; text: string }>(null)

  const tz = data?.meta?.timezone ?? 'America/New_York'

  const shortDayLabel = (day: string) => day.split(',')[0]?.trim() ?? day

  const shareDayWindows = useMemo(() => {
    if (!data?.meta) return []
    return dayRangesFromSchedule(data.slots, data.meta, tz, shortDayLabel)
  }, [data, tz])

  const shareStripDays = useMemo(() => {
    if (shareDayWindows.length) return shareDayWindows
    if (!data?.meta) return []
    const s = Date.parse(data.meta.windowStartsAt)
    const e = Date.parse(data.meta.windowEndsAt)
    if (!(e > s)) return []
    return [{ label: 'Event', startMs: s, endMs: e }]
  }, [shareDayWindows, data])

  const activePlayableWindow = useMemo(() => {
    if (!data?.meta) return null
    let startMs = Date.parse(data.meta.windowStartsAt)
    let endMs = Date.parse(data.meta.windowEndsAt)
    if (!(endMs > startMs)) return null

    if (eventSlug === 'paf26' && shareStripDays.length) {
      const firstYmd = zonedCalendarDateFromUtc(shareStripDays[0].startMs, tz)
      const lastYmd = zonedCalendarDateFromUtc(shareStripDays[shareStripDays.length - 1].startMs, tz)
      const pafStart = utcMillisAtZonedWallClock(tz, firstYmd, 10, 0)
      const pafEnd = utcMillisAtZonedWallClock(tz, lastYmd, 4, 0)
      if (pafStart != null) startMs = pafStart
      if (pafEnd != null) endMs = pafEnd
    }
    return endMs > startMs ? { startMs, endMs } : null
  }, [data, eventSlug, shareStripDays, tz])

  useEffect(() => {
    void (async () => {
      try {
        const s = await dancecardFetch<SharePayload>(eventSlug, `/share/${encodeURIComponent(token)}`)
        setData(s)
        const first = s.mutualFreeGaps?.[0]
        if (first) {
          setStart(toDatetimeLocalValue(new Date(first.start)))
          setEnd(toDatetimeLocalValue(new Date(first.end)))
        }
      } catch (e) {
        setErr(e instanceof DancecardApiError ? e.body : 'Not found')
      }
    })()
  }, [eventSlug, token])

  useEffect(() => {
    void (async () => {
      try {
        const m = await dancecardFetch<{ account: { displayName: string } }>(eventSlug, '/me')
        setMe(m)
      } catch {
        setMe(null)
      }
    })()
  }, [eventSlug])

  const fillReserveFromStep = useCallback((startMs: number, endMs: number) => {
    setStart(toDatetimeLocalValue(new Date(startMs)))
    setEnd(toDatetimeLocalValue(new Date(endMs)))
    setPreview(null)
    setReserveNotice(null)
    setErr(null)
  }, [])

  const onShareStripSlotClick = useCallback(
    (startMs: number, endMs: number) => {
      if (!me?.account) {
        setReserveNotice({
          kind: 'error',
          text: 'Sign in on the main dancecard page, then reload this share link.',
        })
        return
      }
      if (!data?.viewerYou) {
        setReserveNotice({
          kind: 'error',
          text: 'Sign in as someone other than the host so green shows when you’re both free — then tap a green block.',
        })
        return
      }
      fillReserveFromStep(startMs, endMs)
    },
    [me?.account, data?.viewerYou, fillReserveFromStep]
  )

  async function runPreview() {
    setReserveNotice(null)
    if (!start || !end) {
      setReserveNotice({ kind: 'error', text: 'Pick start and end times — tap a green half-hour on the strips above.' })
      return
    }
    try {
      const p = await dancecardFetch<{ ok: boolean }>(eventSlug, '/preview', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: token,
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
          note: note || undefined,
        }),
      })
      setPreview(p)
    } catch (e) {
      setPreview({ ok: false })
      setReserveNotice({ kind: 'error', text: formatDancecardApiMessage(e) })
    }
  }

  async function submitReserve() {
    setReserveNotice(null)
    if (!start || !end) {
      setReserveNotice({ kind: 'error', text: 'Pick start and end times — tap a green block on the schedule above.' })
      return
    }
    const sMs = new Date(start).getTime()
    const eMs = new Date(end).getTime()
    if (!Number.isFinite(sMs) || !Number.isFinite(eMs) || eMs <= sMs) {
      setReserveNotice({ kind: 'error', text: 'End time must be after start time.' })
      return
    }
    try {
      await dancecardFetch(eventSlug, '/reserve', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: token,
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
          note: note || undefined,
        }),
      })
      setErr(null)
      setPreview(null)
      setReserveNotice({ kind: 'ok' })
    } catch (e) {
      setReserveNotice({ kind: 'error', text: formatDancecardApiMessage(e) })
    }
  }

  if (err && !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-6 text-slate-100">
          <h1 className="mb-2 text-lg font-semibold">Share link</h1>
          <p className="text-sm text-slate-400">{err}</p>
          <Link href={`/dancecard/${eventSlug}`} className="mt-4 inline-block text-amber-300 hover:underline">
            Back to dancecard
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="px-4 py-10 text-slate-400">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-40 text-slate-100 lg:max-w-6xl lg:pb-10">
      <div className="mb-4">
        <Link href={`/dancecard/${eventSlug}`} className="text-sm text-amber-300 hover:underline">
          ← Back to dancecard
        </Link>
      </div>
      <header className="mb-4 border-b border-white/10 pb-4">
        <p className="text-xs uppercase tracking-wide text-amber-200/80">East Coast Kink Events</p>
        <h1 className="font-serif text-xl font-semibold text-white sm:text-2xl">{data.meta?.eventTitle ?? 'Dancecard'}</h1>
        <p className="mt-1 text-sm text-slate-300">
          <span className="font-medium text-white">{data.host.displayName}</span>
          <span className="text-slate-500"> · shared availability</span>
        </p>
        {data.viewerYou ? (
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            Signed in as <span className="text-white">{data.viewerYou}</span>.{' '}
            <span className="text-emerald-200">Green</span> = both free when comparing; otherwise host-only free time.
            {me?.account ? (
              <span className="mt-1 block text-emerald-100/90">
                Tap or click a green half-hour to drop it into the reserve form below (adjust the window if you need longer).
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            Log in on the main dancecard page to compare both calendars and reserve.
          </p>
        )}
      </header>

      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
        <span className="rounded-full border border-rose-500/30 bg-rose-950/40 px-2 py-1 text-rose-100">Red = busy</span>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-emerald-100">
          {data.viewerYou ? 'Green = both free' : 'Green = host free'}
        </span>
      </div>

      <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1 sm:max-h-none">
        {shareStripDays.map((d) => (
          <MutualAvailabilityStrip
            key={`${d.label}-${d.startMs}`}
            dayLabel={d.label}
            rangeStartMs={d.startMs}
            rangeEndMs={d.endMs}
            freeIntervals={data.viewerYou ? (data.mutualFreeGaps ?? []) : data.hostFreeGaps}
            tz={tz}
            mode={data.viewerYou ? 'mutual' : 'host'}
            onFreeStepClick={data ? onShareStripSlotClick : undefined}
            activeWindowStartMs={activePlayableWindow?.startMs}
            activeWindowEndMs={activePlayableWindow?.endMs}
          />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-950/30 px-4 py-3 text-sm leading-relaxed text-cyan-50/95">
        <p className="font-semibold text-white">How to reserve</p>
        {data.viewerYou && me?.account ? (
          <p className="mt-1.5 text-cyan-100/95">
            <span className="text-white">Tap or click a green half-hour</span> on the strips above. That fills the
            form; adjust the times if you need a longer window, tap Preview, then Reserve.
          </p>
        ) : (
          <p className="mt-1.5 text-cyan-100/95">
            Green shows the host&apos;s free time. Log in on the main dancecard page (as someone other than the host)
            to see when you are <span className="text-white">both</span> free, then tap or click green to fill the form.
          </p>
        )}
      </div>

      {me?.account ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:relative lg:z-0 lg:mt-6 lg:rounded-xl lg:border lg:bg-slate-900/70 lg:p-4">
          <h3 className="text-sm font-semibold text-white">Reserve together</h3>
          {reserveNotice?.kind === 'ok' ? (
            <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/45 p-3 text-sm text-emerald-50">
              <p className="font-semibold text-white">Reservation sent</p>
              <p className="mt-1 text-emerald-100/95">It is saved on both dancecards. You can close this page.</p>
            </div>
          ) : (
            <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-400">Start</label>
              <input
                type="datetime-local"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value)
                  setReserveNotice(null)
                  setPreview(null)
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400">End</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value)
                  setReserveNotice(null)
                  setPreview(null)
                }}
              />
            </div>
          </div>
          <label className="mt-3 block text-xs text-slate-400">Note (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white"
            value={note}
            maxLength={500}
            onChange={(e) => {
              setNote(e.target.value)
              setReserveNotice(null)
            }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 sm:flex-none"
              onClick={() => void runPreview()}
            >
              Preview
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400 sm:flex-none"
              onClick={() => void submitReserve()}
            >
              Reserve
            </button>
          </div>
          {preview ? (
            <p className={`mt-2 text-xs ${preview.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
              {preview.ok ? 'Looks mutually free.' : 'Not mutually free or conflicts.'}
            </p>
          ) : null}
          {reserveNotice?.kind === 'error' ? (
            <p className="mt-2 text-sm text-rose-200">{reserveNotice.text}</p>
          ) : null}
          {err ? <p className="mt-2 text-xs text-rose-300">{err}</p> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
