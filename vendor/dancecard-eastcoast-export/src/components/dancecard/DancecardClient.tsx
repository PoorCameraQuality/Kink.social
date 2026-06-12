'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import {
  extractDancecardShareToken,
  formatRange,
  formatTime,
  groupSlotsByDay,
  toDatetimeLocalValue,
  utcMillisAtZonedWallClock,
  zonedCalendarDateFromUtc,
} from '@/components/dancecard/time'
import type { StaffShift, StaffShiftPerson, StaffShiftRoster } from '@/lib/dancecard/staffSchedule'
import { formatStaffShiftTitle, staffShiftKey } from '@/lib/dancecard/staffSchedule'
import { buildDancecardIcs, countDancecardIcsEvents, downloadIcsFile, googleCalendarImportHintUrl } from '@/lib/dancecard/dancecardIcs'
import { MutualAvailabilityStrip } from '@/components/dancecard/MutualAvailabilityStrip'
import { dayRangesFromSchedule } from '@/components/dancecard/eventAvailability'
import { DancecardTopBar } from '@/components/dancecard/DancecardTopBar'
import { DancecardCompactList } from '@/components/dancecard/DancecardCompactList'
import { roleColor } from '@/lib/dancecard/roleColors'
import { locationColor } from '@/lib/dancecard/locationColors'

type ScheduleMeta = {
  productTitle: string
  eventTitle: string
  subtitle: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  sharedByLabel: string
  sharedByDetail: string | null
  logoUrl: string | null
}

type ProgramSlot = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  track: string | null
  room: string | null
  description: string | null
  sortOrder: number
}

type MeResponse = {
  account: { id: string; username: string; displayName: string; isStaff: boolean }
  prefs: { bufferMinutes: number }
  selections: {
    id: string
    kind: string
    slotId: string | null
    startsAt: string
    endsAt: string
    programTitle?: string | null
    programRoom?: string | null
    programTrack?: string | null
    note?: string | null
  }[]
}

/** Payload from GET /share/:token (availability + optional mutual gaps). */
type MutualSharePayload = {
  meta: ScheduleMeta | null
  host: { displayName: string }
  viewerYou: string | null
  hostFreeGaps: { start: string; end: string }[]
  hostBusy: { start: string; end: string }[]
  mutualFreeGaps: { start: string; end: string }[] | null
}

type Tab = 'program' | 'dancecard' | 'mutual' | 'reservations'
type ScheduleView = 'simple' | 'venue' | 'grid'

type ReservationRow = {
  id: string
  status: string
  startsAt: string
  endsAt: string
  note: string | null
  role: string
  host: { id: string; displayName: string }
  guest: { id: string; displayName: string }
}

const TAB_OPTIONS: Array<{ key: Tab; label: string; blurb: string }> = [
  { key: 'program', label: 'Program', blurb: 'Scan the festival and add sessions instantly.' },
  { key: 'dancecard', label: 'My dancecard', blurb: 'See your saved classes and custom busy blocks.' },
  { key: 'mutual', label: 'Mutual', blurb: 'Compare calendars, then tap green slots to reserve.' },
  { key: 'reservations', label: 'Reservations', blurb: 'Track confirmed scenes and requests.' },
]

const VIEW_OPTIONS: Array<{ key: ScheduleView; label: string }> = [
  { key: 'simple', label: 'Timeline' },
  { key: 'venue', label: 'By venue' },
  { key: 'grid', label: 'Grid' },
]

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function shortDayLabel(day: string) {
  return day.split(',')[0]?.trim() ?? day
}

type ProgramPolicyTone = 'amber' | 'rose' | 'sky' | 'violet'
type ProgramPolicy = { key: string; label: string; tone: ProgramPolicyTone }

const PROGRAM_POLICY_RULES: Array<{ key: string; label: string; tone: ProgramPolicyTone; patterns: string[] }> = [
  { key: 'no-late-entry', label: 'No late entry', tone: 'amber', patterns: ['no late entry', 'no-late-entry', 'late entry not allowed'] },
  { key: 'no-reentry', label: 'No re-entry', tone: 'rose', patterns: ['no re-entry', 'no reentry', 're-entry not allowed', 'no ins and outs'] },
  { key: 'hard-start', label: 'Hard start', tone: 'sky', patterns: ['hard start', 'starts promptly', 'arrive early'] },
  { key: 'closed-door', label: 'Closed door', tone: 'violet', patterns: ['closed door', 'doors closed'] },
]

function programPoliciesForSlots(slots: ProgramSlot[]): ProgramPolicy[] {
  const found = new Map<string, ProgramPolicy>()
  for (const slot of slots) {
    const text = `${slot.title} ${slot.description ?? ''}`.toLowerCase()
    for (const rule of PROGRAM_POLICY_RULES) {
      if (rule.patterns.some((p) => text.includes(p))) {
        found.set(rule.key, { key: rule.key, label: rule.label, tone: rule.tone })
      }
    }
  }
  return Array.from(found.values())
}

function policyChipClass(tone: ProgramPolicyTone): string {
  if (tone === 'amber') return 'border-amber-400/35 bg-amber-500/15 text-amber-100'
  if (tone === 'rose') return 'border-rose-400/35 bg-rose-500/15 text-rose-100'
  if (tone === 'sky') return 'border-sky-400/35 bg-sky-500/15 text-sky-100'
  return 'border-violet-400/35 bg-violet-500/15 text-violet-100'
}

type MutualReserveBanner = null | { kind: 'success' } | { kind: 'error'; message: string }

function reservationPartnerName(r: ReservationRow): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

function eventWindowLabel(meta: ScheduleMeta | null) {
  if (!meta) return ''
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: meta.timezone || 'America/New_York',
  })
  return `${fmt.format(new Date(meta.windowStartsAt))} - ${fmt.format(new Date(meta.windowEndsAt))}`
}

function todayLabel(tz: string) {
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: tz,
  }).format(now)
  const date = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: tz,
  }).format(now)
  return `${weekday.toUpperCase()} ${date}`
}

function groupSlotsByStart(slots: ProgramSlot[]): [string, ProgramSlot[]][] {
  const m = new Map<string, ProgramSlot[]>()
  for (const s of slots) {
    const k = s.startsAt
    const arr = m.get(k) ?? []
    arr.push(s)
    m.set(k, arr)
  }
  return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

function groupByVenue(slots: ProgramSlot[]): { room: string; items: ProgramSlot[] }[] {
  const m = new Map<string, ProgramSlot[]>()
  for (const s of slots) {
    const r = s.room?.trim() || 'Other'
    const arr = m.get(r) ?? []
    arr.push(s)
    m.set(r, arr)
  }
  return Array.from(m.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([room, items]) => ({
      room,
      items: items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    }))
}

export function DancecardClient({ eventSlug }: { eventSlug: string }) {
  const slug = eventSlug.toLowerCase()
  const entryGateKey = `eck_dc_entry_gate_${slug}`
  const regCodeKey = useMemo(() => `eck_dc_reg_code_${slug}`, [slug])
  const [schedule, setSchedule] = useState<{ meta: ScheduleMeta | null; slots: ProgramSlot[] } | null>(null)
  const [staffRoster, setStaffRoster] = useState<StaffShiftRoster | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState<Tab>('program')
  const [scheduleView, setScheduleView] = useState<ScheduleView>('simple')
  const [selectedStaffName, setSelectedStaffName] = useState('')
  const [trackFilter, setTrackFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [staffUnlockCode, setStaffUnlockCode] = useState('')
  const [staffUnlockBusy, setStaffUnlockBusy] = useState(false)
  const [staffUnlockErr, setStaffUnlockErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [entryGateInput, setEntryGateInput] = useState('')
  const [entryGateErr, setEntryGateErr] = useState<string | null>(null)
  const [entryGateUnlocked, setEntryGateUnlocked] = useState(false)
  const [gateReady, setGateReady] = useState(false)
  const [buffer, setBuffer] = useState(0)
  const [manualOpen, setManualOpen] = useState(false)
  const [mStart, setMStart] = useState('')
  const [mEnd, setMEnd] = useState('')
  const [mutualToken, setMutualToken] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(`eck_dc_mutual_${slug}`) ?? '' : ''
  )
  const [mutualData, setMutualData] = useState<MutualSharePayload | null>(null)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [reserveMutualOpen, setReserveMutualOpen] = useState(false)
  const [reserveMutualStart, setReserveMutualStart] = useState('')
  const [reserveMutualEnd, setReserveMutualEnd] = useState('')
  const [reserveMutualNote, setReserveMutualNote] = useState('')
  const [reserveMutualPreview, setReserveMutualPreview] = useState<boolean | null>(null)
  const [reserveMutualBusy, setReserveMutualBusy] = useState(false)
  const [reserveMutualBanner, setReserveMutualBanner] = useState<MutualReserveBanner>(null)
  const saveTimer = useRef<number | null>(null)
  const selectionsRef = useRef<MeResponse['selections']>([])
  const mutualTokenRef = useRef(mutualToken)

  const tz = schedule?.meta?.timezone ?? 'America/New_York'

  useLayoutEffect(() => {
    mutualTokenRef.current = mutualToken
  }, [mutualToken])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (entryGateUnlocked) window.sessionStorage.setItem(entryGateKey, 'ok')
  }, [entryGateKey, entryGateUnlocked])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const g = await dancecardFetch<{ requiresRegistrationCode: boolean }>(slug, '/gate')
        if (cancelled) return
        if (!g.requiresRegistrationCode) {
          setEntryGateUnlocked(true)
        } else if (typeof window !== 'undefined') {
          const ok = window.sessionStorage.getItem(entryGateKey) === 'ok'
          const code = window.sessionStorage.getItem(regCodeKey)
          if (ok && code) setEntryGateUnlocked(true)
        }
      } catch {
        if (!cancelled) setEntryGateUnlocked(true)
      } finally {
        if (!cancelled) setGateReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, entryGateKey, regCodeKey])

  const loadSchedule = useCallback(async () => {
    try {
      const s = await dancecardFetch<{ meta: ScheduleMeta | null; slots: ProgramSlot[] }>(slug, '/schedule')
      setSchedule(s)
      setLoadErr(null)
    } catch (e) {
      setLoadErr(e instanceof DancecardApiError ? e.body : 'Could not load schedule')
    }
  }, [slug])

  const loadStaffRoster = useCallback(async () => {
    try {
      const roster = await dancecardFetch<StaffShiftRoster>(slug, '/staff')
      if (roster?.people?.length) setStaffRoster(roster)
      else setStaffRoster(null)
    } catch {
      setStaffRoster(null)
    }
  }, [slug])

  const checkSession = useCallback(async () => {
    try {
      const m = await dancecardFetch<MeResponse>(slug, '/me')
      setMe({
        ...m,
        account: { ...m.account, isStaff: Boolean(m.account.isStaff) },
      })
      setBuffer(m.prefs.bufferMinutes)
    } catch {
      setMe(null)
    } finally {
      setAuthChecked(true)
    }
  }, [slug])

  useEffect(() => {
    void loadSchedule()
  }, [loadSchedule])

  useEffect(() => {
    if (me?.account.isStaff) void loadStaffRoster()
    else setStaffRoster(null)
  }, [me?.account.isStaff, loadStaffRoster])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  // Before paint so selectionsRef is never stale when the user taps buffer (useEffect ran too late).
  useLayoutEffect(() => {
    selectionsRef.current = me?.selections ?? []
  }, [me])

  useEffect(() => {
    if (typeof window === 'undefined' || !staffRoster) return
    const saved = window.localStorage.getItem(`eck_dc_staff_${slug}`) ?? ''
    setSelectedStaffName(saved)
  }, [slug, staffRoster])

  useEffect(() => {
    if (typeof window === 'undefined' || !staffRoster) return
    window.localStorage.setItem(`eck_dc_staff_${slug}`, selectedStaffName)
  }, [selectedStaffName, slug, staffRoster])

  const tracks = useMemo(() => {
    const s = schedule?.slots ?? []
    return Array.from(new Set(s.map((x) => x.track).filter(Boolean))) as string[]
  }, [schedule])

  const rooms = useMemo(() => {
    const s = schedule?.slots ?? []
    return Array.from(new Set(s.map((x) => x.room).filter(Boolean))) as string[]
  }, [schedule])

  const filteredSlots = useMemo(() => {
    let s = schedule?.slots ?? []
    if (trackFilter) s = s.filter((x) => (x.track ?? '') === trackFilter)
    if (roomFilter) s = s.filter((x) => (x.room ?? '') === roomFilter)
    return s
  }, [schedule, trackFilter, roomFilter])

  const grouped = useMemo(() => groupSlotsByDay(filteredSlots, tz), [filteredSlots, tz])
  const venueGroups = useMemo(() => groupByVenue(filteredSlots), [filteredSlots])
  const uniqueRoomsForGrid = useMemo(() => {
    const r = Array.from(new Set(filteredSlots.map((s) => s.room || 'Other'))).sort()
    return r.slice(0, 8)
  }, [filteredSlots])

  const programSelected = useMemo(() => {
    const set = new Set<string>()
    for (const x of me?.selections ?? []) {
      if (x.kind === 'program' && x.slotId) set.add(x.slotId)
    }
    return set
  }, [me])

  const selectedProgramCount = useMemo(
    () => (me?.selections ?? []).filter((s) => s.kind === 'program').length,
    [me]
  )

  const manualSelectionCount = useMemo(
    () => (me?.selections ?? []).filter((s) => s.kind === 'manual').length,
    [me]
  )

  const calendarExportCount = useMemo(
    () => (me ? countDancecardIcsEvents(me.selections ?? [], reservations) : 0),
    [me, reservations]
  )

  type NextAgendaItem =
    | { type: 'selection'; selection: MeResponse['selections'][number] }
    | { type: 'reservation'; reservation: ReservationRow }

  const nextAgendaItem = useMemo(() => {
    const now = Date.now()
    const cands: NextAgendaItem[] = []
    for (const s of me?.selections ?? []) {
      if (new Date(s.endsAt).getTime() >= now) cands.push({ type: 'selection', selection: s })
    }
    for (const r of reservations) {
      if (new Date(r.endsAt).getTime() >= now) cands.push({ type: 'reservation', reservation: r })
    }
    cands.sort(
      (a, b) =>
        new Date(a.type === 'selection' ? a.selection.startsAt : a.reservation.startsAt).getTime() -
        new Date(b.type === 'selection' ? b.selection.startsAt : b.reservation.startsAt).getTime()
    )
    return cands[0] ?? null
  }, [me, reservations])

  type DancecardAgendaRow =
    | { type: 'selection'; selection: MeResponse['selections'][number] }
    | { type: 'reservation'; reservation: ReservationRow }

  const dancecardGrouped = useMemo(() => {
    const rows: DancecardAgendaRow[] = []
    for (const selection of me?.selections ?? []) {
      rows.push({ type: 'selection', selection })
    }
    for (const reservation of reservations) {
      rows.push({ type: 'reservation', reservation })
    }
    const map = new Map<string, DancecardAgendaRow[]>()
    for (const row of rows) {
      const startsAt = row.type === 'selection' ? row.selection.startsAt : row.reservation.startsAt
      const key = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: tz,
      }).format(new Date(startsAt))
      const arr = map.get(key) ?? []
      arr.push(row)
      map.set(key, arr)
    }
    return Array.from(map.entries()).map(([day, items]) => ({
      day,
      items: items.sort(
        (a, b) =>
          new Date(a.type === 'selection' ? a.selection.startsAt : a.reservation.startsAt).getTime() -
          new Date(b.type === 'selection' ? b.selection.startsAt : b.reservation.startsAt).getTime()
      ),
    }))
  }, [me, reservations, tz])

  const dancecardFlat = useMemo(
    () =>
      [...dancecardGrouped.flatMap((g) => g.items)].sort(
        (a, b) =>
          new Date(a.type === 'selection' ? a.selection.startsAt : a.reservation.startsAt).getTime() -
          new Date(b.type === 'selection' ? b.selection.startsAt : b.reservation.startsAt).getTime()
      ),
    [dancecardGrouped]
  )

  const mutualAvailabilityDays = useMemo(
    () => (schedule ? dayRangesFromSchedule(schedule.slots, schedule.meta, tz, shortDayLabel) : []),
    [schedule, tz]
  )

  const mutualStripDays = useMemo(() => {
    if (mutualAvailabilityDays.length) return mutualAvailabilityDays
    if (!schedule?.meta) return []
    const s = Date.parse(schedule.meta.windowStartsAt)
    const e = Date.parse(schedule.meta.windowEndsAt)
    if (!(e > s)) return []
    return [{ label: 'Event', startMs: s, endMs: e }]
  }, [mutualAvailabilityDays, schedule])

  const mutualPlayableWindow = useMemo(() => {
    if (!schedule?.meta) return null
    let startMs = Date.parse(schedule.meta.windowStartsAt)
    let endMs = Date.parse(schedule.meta.windowEndsAt)
    if (!(endMs > startMs)) return null

    // PAF26 requested playable hours: Thu 10:00 AM → Mon 4:00 AM.
    if (slug === 'paf26' && mutualStripDays.length) {
      const firstYmd = zonedCalendarDateFromUtc(mutualStripDays[0].startMs, tz)
      const lastYmd = zonedCalendarDateFromUtc(mutualStripDays[mutualStripDays.length - 1].startMs, tz)
      const pafStart = utcMillisAtZonedWallClock(tz, firstYmd, 10, 0)
      const pafEnd = utcMillisAtZonedWallClock(tz, lastYmd, 4, 0)
      if (pafStart != null) startMs = pafStart
      if (pafEnd != null) endMs = pafEnd
    }
    return endMs > startMs ? { startMs, endMs } : null
  }, [schedule, slug, mutualStripDays, tz])

  const staffPeople = useMemo(() => staffRoster?.people ?? [], [staffRoster])
  const selectedStaffEntry = useMemo(
    () => staffPeople.find((person) => person.name === selectedStaffName) ?? null,
    [staffPeople, selectedStaffName]
  )

  const loadReservations = useCallback(async () => {
    try {
      const r = await dancecardFetch<{ reservations: ReservationRow[] }>(slug, '/reservations')
      setReservations((r.reservations ?? []).filter((x) => x.status === 'confirmed'))
    } catch {
      setReservations([])
    }
  }, [slug])

  const refreshMe = useCallback(async () => {
    const m = await dancecardFetch<MeResponse>(slug, '/me')
    setMe({
      ...m,
      account: { ...m.account, isStaff: Boolean(m.account.isStaff) },
    })
    setBuffer(m.prefs.bufferMinutes)
    void loadReservations()
  }, [slug, loadReservations])

  useEffect(() => {
    if (!me) {
      setReservations([])
      return
    }
    void loadReservations()
  }, [me, loadReservations])

  const persist = useCallback(
    async (nextSelections: MeResponse['selections'], nextBuffer: number) => {
      setSaving(true)
      try {
        await dancecardFetch(slug, '/dancecard', {
          method: 'PUT',
          body: JSON.stringify({
            bufferMinutes: nextBuffer,
            selections: nextSelections.map((s) => ({
              kind: s.kind,
              slotId: s.slotId ?? undefined,
              startsAt: s.startsAt,
              endsAt: s.endsAt,
              note: s.note?.trim() ? s.note.trim().slice(0, 1000) : undefined,
            })),
          }),
        })
        await refreshMe()
      } catch (e) {
        setToast(e instanceof DancecardApiError ? e.body : 'Save failed')
      } finally {
        setSaving(false)
      }
    },
    [slug, refreshMe]
  )

  const queueSave = useCallback(
    (nextSelections: MeResponse['selections'], nextBuffer: number) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void persist(nextSelections, nextBuffer)
      }, 450)
    },
    [persist]
  )

  function toggleProgram(slot: ProgramSlot) {
    const cur = me?.selections ?? []
    const isOn = programSelected.has(slot.id)
    let next: MeResponse['selections']
    if (isOn) {
      next = cur.filter((s) => !(s.kind === 'program' && s.slotId === slot.id))
    } else {
      next = [
        ...cur,
        {
          id: crypto.randomUUID(),
          kind: 'program',
          slotId: slot.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          note: null,
        },
      ]
    }
    setMe((m) => (m ? { ...m, selections: next } : m))
    queueSave(next, buffer)
  }

  function removeSelection(id: string) {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => s.id !== id)
    setMe((m) => (m ? { ...m, selections: next } : m))
    queueSave(next, buffer)
  }

  function applyBuffer(next: number) {
    setBuffer(next)
    setMe((m) => (m ? { ...m, prefs: { bufferMinutes: next } } : m))
    queueSave(selectionsRef.current, next)
  }

  async function addManualBlock() {
    if (!mStart || !mEnd) return
    const cur = me?.selections ?? []
    const next = [
      ...cur,
      {
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt: new Date(mStart).toISOString(),
        endsAt: new Date(mEnd).toISOString(),
        note: null,
      },
    ]
    setMe((m) => (m ? { ...m, selections: next } : m))
    setManualOpen(false)
    setMStart('')
    setMEnd('')
    await persist(next, buffer)
  }

  async function copyShare() {
    try {
      const res = await dancecardFetch<{ token: string }>(slug, '/share', { method: 'POST' })
      const token = res.token.trim()
      await navigator.clipboard.writeText(token)
      setToast('Copied share code — paste that token for your friend.')
      sessionStorage.setItem(`eck_dc_mutual_${slug}`, token)
      setMutualToken(token)
    } catch {
      setToast('Could not create share code.')
    }
  }

  function exportDancecardCalendar(target: 'ical' | 'google') {
    if (!me) return
    const n = countDancecardIcsEvents(me.selections ?? [], reservations)
    if (n === 0) {
      setToast('Add program classes, reservations, or busy blocks to export your dancecard.')
      return
    }
    const eventTitle = schedule?.meta?.eventTitle ?? slug
    const body = buildDancecardIcs({
      calendarName: `${eventTitle} — dancecard`,
      attendeeDisplayName: me.account.displayName,
      selections: me.selections ?? [],
      reservations,
    })
    downloadIcsFile(`${slug}-dancecard.ics`, body)
    if (target === 'google') {
      window.open(googleCalendarImportHintUrl(), '_blank', 'noopener,noreferrer')
      setToast('Download started. In Google Calendar use Settings → Import (help opened in a new tab).')
    } else {
      setToast('Downloaded .ics file — open it in Apple Calendar, Outlook, or another calendar app.')
    }
  }

  const refreshMutual = useCallback(async () => {
    const raw = mutualTokenRef.current.trim()
    if (!raw) {
      setMutualData(null)
      return
    }
    const clean = extractDancecardShareToken(raw)
    try {
      sessionStorage.setItem(`eck_dc_mutual_${slug}`, clean)
      const d = await dancecardFetch<MutualSharePayload>(
        slug,
        `/share/${encodeURIComponent(clean)}`
      )
      setMutualData(d)
      if (clean !== raw) setMutualToken(clean)
    } catch {
      setMutualData(null)
      setToast('Could not load share preview.')
    }
  }, [slug])

  const openMutualReserveFromStep = useCallback((startMs: number, endMs: number) => {
    setReserveMutualStart(toDatetimeLocalValue(new Date(startMs)))
    setReserveMutualEnd(toDatetimeLocalValue(new Date(endMs)))
    setReserveMutualNote('')
    setReserveMutualPreview(null)
    setReserveMutualBanner(null)
    setReserveMutualOpen(true)
  }, [])

  /** Always wired when mutual data is shown so green slots stay clickable; explains when reserve is not available yet. */
  const onMutualStripSlotClick = useCallback(
    (startMs: number, endMs: number) => {
      if (!me) {
        setToast('Sign in to request a mutual reservation.')
        return
      }
      if (!mutualData?.viewerYou) {
        setToast(
          'Green here is the host’s free time only. Use an account that isn’t the host, tap Load — then green is when you’re both free and you can reserve.'
        )
        return
      }
      openMutualReserveFromStep(startMs, endMs)
    },
    [me, mutualData?.viewerYou, openMutualReserveFromStep]
  )

  async function runMutualReservePreview() {
    setReserveMutualBanner(null)
    if (!reserveMutualStart || !reserveMutualEnd) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Set start and end times first — tap a green half-hour on the strips below.',
      })
      return
    }
    const tok = extractDancecardShareToken(mutualToken)
    if (!tok) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Paste the host’s share token above and tap or click Load first.',
      })
      return
    }
    setReserveMutualBusy(true)
    try {
      const p = await dancecardFetch<{ ok: boolean }>(slug, '/preview', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: tok,
          startsAt: new Date(reserveMutualStart).toISOString(),
          endsAt: new Date(reserveMutualEnd).toISOString(),
          note: reserveMutualNote.trim() || undefined,
        }),
      })
      setReserveMutualPreview(p.ok)
    } catch (e) {
      setReserveMutualPreview(false)
      const msg = formatDancecardApiMessage(e)
      setReserveMutualBanner({ kind: 'error', message: msg })
      setToast(msg)
    } finally {
      setReserveMutualBusy(false)
    }
  }

  async function submitMutualReserve() {
    setReserveMutualBanner(null)
    if (!reserveMutualStart || !reserveMutualEnd) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Set start and end times — tap a green half-hour on the strips below to fill this form.',
      })
      return
    }
    const sMs = new Date(reserveMutualStart).getTime()
    const eMs = new Date(reserveMutualEnd).getTime()
    if (!Number.isFinite(sMs) || !Number.isFinite(eMs) || eMs <= sMs) {
      setReserveMutualBanner({ kind: 'error', message: 'End time must be after start time.' })
      return
    }
    const tok = extractDancecardShareToken(mutualToken)
    if (!tok) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Paste the host’s share token above and tap or click Load first.',
      })
      return
    }
    setReserveMutualBusy(true)
    try {
      await dancecardFetch(slug, '/reserve', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: tok,
          startsAt: new Date(reserveMutualStart).toISOString(),
          endsAt: new Date(reserveMutualEnd).toISOString(),
          note: reserveMutualNote.trim() || undefined,
        }),
      })
      setReserveMutualPreview(null)
      setReserveMutualBanner({ kind: 'success' })
      setToast('Reservation saved — see the confirmation below.')
      void loadReservations()
      void refreshMutual()
      void refreshMe()
    } catch (e) {
      const msg = formatDancecardApiMessage(e)
      setReserveMutualBanner({ kind: 'error', message: msg })
      setToast(msg)
    } finally {
      setReserveMutualBusy(false)
    }
  }

  useEffect(() => {
    if (tab === 'mutual' && mutualTokenRef.current.trim()) void refreshMutual()
  }, [tab, refreshMutual])

  // After sign-in, mutual share payload must reload so `viewerYou` + green blocks get click handlers.
  useEffect(() => {
    if (tab !== 'mutual' || !mutualTokenRef.current.trim() || !me) return
    void refreshMutual()
  }, [me?.account.id, tab, refreshMutual, me])

  function findMatchingStaffShift(selection: MeResponse['selections'][number]): StaffShift | null {
    if (!selectedStaffEntry || selection.kind !== 'manual') return null
    return (
      selectedStaffEntry.shifts.find(
        (shift) =>
          shift.startsAt === selection.startsAt &&
          shift.endsAt === selection.endsAt
      ) ?? null
    )
  }

  function staffManualBlockTitle(selection: MeResponse['selections'][number], fallback: string): string {
    const shift = findMatchingStaffShift(selection)
    return shift ? formatStaffShiftTitle(shift, tz) : fallback
  }

  async function applyStaffSchedule(nextName: string) {
    if (!me) {
      setSelectedStaffName(nextName)
      return
    }
    const prevEntry = selectedStaffEntry
    const nextEntry = staffPeople.find((person) => person.name === nextName) ?? null
    const removable = new Set<string>()
    ;[...(prevEntry?.shifts ?? []), ...(nextEntry?.shifts ?? [])].forEach((shift) => {
      removable.add(staffShiftKey(shift.startsAt, shift.endsAt))
    })

    const kept = (me.selections ?? []).filter((selection) => {
      if (selection.kind === 'program') return true
      return !removable.has(staffShiftKey(selection.startsAt, selection.endsAt))
    })

    const additions =
      nextEntry?.shifts.map((shift) => ({
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt: shift.startsAt,
        endsAt: shift.endsAt,
        note: null,
      })) ?? []

    const merged = [...kept, ...additions].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    )
    setSelectedStaffName(nextName)
    setMe((current) => (current ? { ...current, selections: merged } : current))
    await persist(merged, buffer)
    if (nextName) {
      setToast(`Applied staff schedule for ${nextName}.`)
    } else {
      setToast('Removed staff schedule autofill.')
    }
  }

  async function submitAuth() {
    try {
      if (authMode === 'register') {
        if (password !== passwordConfirm) {
          setToast('Passwords do not match.')
          return
        }
        const regCode =
          typeof window !== 'undefined' ? window.sessionStorage.getItem(regCodeKey) : null
        await dancecardFetch(slug, '/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            displayName,
            ...(regCode ? { registrationAccessCode: regCode } : {}),
          }),
        })
      } else {
        const regCode =
          typeof window !== 'undefined' ? window.sessionStorage.getItem(regCodeKey) : null
        await dancecardFetch(slug, '/login', {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            ...(regCode ? { registrationAccessCode: regCode } : {}),
          }),
        })
      }
      setPassword('')
      setPasswordConfirm('')
      await checkSession()
    } catch (e) {
      setToast(e instanceof DancecardApiError ? e.body : 'Auth failed')
    }
  }

  async function logout() {
    await dancecardFetch(slug, '/logout', { method: 'POST' })
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(regCodeKey)
    }
    setMe(null)
    setStaffRoster(null)
    await checkSession()
  }

  async function unlockStaff() {
    setStaffUnlockErr(null)
    setStaffUnlockBusy(true)
    try {
      await dancecardFetch(slug, '/staff/unlock', {
        method: 'POST',
        body: JSON.stringify({ code: staffUnlockCode.trim() }),
      })
      setStaffUnlockCode('')
      await refreshMe()
      setToast('Staff access unlocked.')
    } catch (e) {
      setStaffUnlockErr(formatDancecardApiMessage(e))
    } finally {
      setStaffUnlockBusy(false)
    }
  }

  async function rename() {
    const next = window.prompt('New display name', me?.account.displayName ?? '')
    if (!next) return
    try {
      await dancecardFetch(slug, '/me', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: next }),
      })
      await refreshMe()
    } catch {
      setToast('Rename failed.')
    }
  }

  async function unlockEntryGate() {
    setEntryGateErr(null)
    try {
      await dancecardFetch(slug, '/verify-entry-code', {
        method: 'POST',
        body: JSON.stringify({ code: entryGateInput.trim() }),
      })
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(entryGateKey, 'ok')
        window.sessionStorage.setItem(regCodeKey, entryGateInput.trim())
      }
      setEntryGateUnlocked(true)
      setEntryGateInput('')
    } catch (e) {
      setEntryGateErr(e instanceof DancecardApiError ? formatDancecardApiMessage(e) : 'That code is not correct.')
    }
  }

  if (!gateReady) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] px-4 py-20 text-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),linear-gradient(180deg,#040816_0%,#070d1e_100%)]" />
          <div className="relative mx-auto max-w-lg text-center text-sm text-slate-400">Loading…</div>
        </div>
      </>
    )
  }

  if (!entryGateUnlocked) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] px-4 py-20 text-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),linear-gradient(180deg,#040816_0%,#070d1e_100%)]" />
          <div className="relative mx-auto max-w-lg">
            <GlassPanel className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Dancecard access</p>
              <h1 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Enter event password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This event requires a password before sign-in or registration.
              </p>
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  void unlockEntryGate()
                }}
              >
                <input
                  type="password"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  value={entryGateInput}
                  onChange={(e) => {
                    setEntryGateInput(e.target.value)
                    setEntryGateErr(null)
                  }}
                  placeholder="Event access password"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
                >
                  Unlock dancecard
                </button>
              </form>
              {entryGateErr ? <p className="mt-3 text-sm text-rose-300">{entryGateErr}</p> : null}
            </GlassPanel>
          </div>
        </div>
      </>
    )
  }

  if (!schedule && loadErr) {
    return (
      <>
        <DancecardTopBar />
        <div className="mx-auto max-w-lg px-4 py-12 text-slate-100">
        <div className="rounded-xl border border-cyan-500/30 bg-[#0b1426] p-6 text-center">
          <h1 className="text-lg font-semibold text-cyan-100">Dance card temporarily disabled</h1>
          <p className="mt-2 text-sm text-slate-300">
            The event is disabled for now. Please check back later.
          </p>
        </div>
      </div>
      </>
    )
  }

  if (!schedule || !authChecked) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] px-4 py-20 text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,#040816_0%,#070d1e_100%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-14 text-center shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur-xl">
            <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-full border border-cyan-300/40 bg-cyan-400/10" />
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Loading dancecard</p>
            <h1 className="mt-4 font-serif text-3xl text-white">Preparing your premium schedule view…</h1>
          </div>
        </div>
      </div>
      </>
    )
  }

  if (!me) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(236,72,153,0.14),transparent_20%),radial-gradient(circle_at_25%_75%,rgba(251,191,36,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#081120_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-10">
          <GlassPanel className="overflow-hidden p-8 lg:p-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/75">{schedule.meta?.productTitle}</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                {schedule.meta?.eventTitle ?? 'Dancecard'}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                {schedule.meta?.subtitle ||
                  'A luxury planning surface for classes, scenes, and mutual availability across the full event.'}
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Today</p>
                <div className="mt-3 font-serif text-3xl text-white sm:text-4xl">{todayLabel(tz)}</div>
                <p className="mt-3 text-sm text-slate-400">{tz}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Coming up next on your dancecard</p>
                <div className="mt-3 text-2xl font-semibold text-white">Sign in to personalize this view.</div>
                <p className="mt-2 text-sm text-slate-400">
                  Once you log in, this panel will show the next class or busy block on your dancecard.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview the experience</p>
                  <h2 className="mt-2 font-serif text-2xl text-white">See the schedule before you log in</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  Time stays legible on every card
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {(schedule.slots.slice(0, 3) || []).map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_15px_45px_rgba(2,6,23,0.32)]"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-50">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/70">Time</div>
                        <div className="mt-1 text-base font-semibold">{formatTime(slot.startsAt, tz)}</div>
                        <div className="text-xs text-cyan-100/70">{formatTime(slot.endsAt, tz)}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-lg font-semibold text-white">{slot.title}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                          {slot.room ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{slot.room}</span> : null}
                          {slot.track ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{slot.track}</span> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="self-center p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Access</p>
                <h2 className="mt-2 font-serif text-3xl text-white">Enter your dancecard</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                Username + password only
              </div>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-black/20 p-1">
              {(['login', 'register'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cx(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    authMode === mode ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-300 hover:text-white'
                  )}
                  onClick={() => {
                    setAuthMode(mode)
                    setPasswordConfirm('')
                    setShowPassword(false)
                  }}
                >
                  {mode === 'login' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                void submitAuth()
              }}
            >
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Username</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="rope-dreamer"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Password</label>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-cyan-300/90 hover:text-cyan-200"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="Enter your password"
                />
              </div>
              {authMode === 'register' ? (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Confirm password</label>
                      <button
                        type="button"
                        className="text-[11px] font-medium text-cyan-300/90 hover:text-cyan-200"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Display name</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How friends see you"
                    />
                  </div>
                  <div className="rounded-2xl border border-amber-500/35 bg-amber-950/40 p-4 text-sm leading-6 text-amber-50/95">
                    <p className="font-semibold text-amber-100">There is no password reset.</p>
                    <p className="mt-2 text-amber-50/90">
                      If you forget this password you will need to create a brand new account and re-enter your dancecard.
                      Write it down or save it in a password manager before you continue.
                    </p>
                  </div>
                </>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)] transition hover:scale-[1.01]"
              >
                {authMode === 'register' ? 'Create premium access' : 'Open my dancecard'}
              </button>
            </form>
            {toast ? <p className="mt-4 text-sm text-rose-300">{toast}</p> : null}
          </GlassPanel>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <DancecardTopBar />
      <div className="relative min-h-screen overflow-hidden bg-[#050b18] pb-24 text-slate-100 lg:pb-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_26%),radial-gradient(circle_at_88%_14%,rgba(129,140,248,0.10),transparent_24%),linear-gradient(180deg,#040a16_0%,#081121_55%,#07111e_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:92px_92px] opacity-10" />

      <div className="relative mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <GlassPanel className="overflow-hidden p-3 sm:p-4 lg:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/75 sm:text-xs sm:tracking-[0.38em]">
                    {schedule.meta?.productTitle}
                  </p>
                  <h1 className="mt-2 font-serif text-xl leading-tight text-white sm:mt-2 sm:text-3xl lg:text-[2.1rem]">
                    {schedule.meta?.eventTitle}
                  </h1>
                  <p className="mt-1 hidden max-w-3xl text-sm leading-6 text-slate-300 md:block">
                    The live program here matches the official schedule in Supabase. Organizers can edit sessions in
                    the{' '}
                    <a
                      href={`/organizer/dancecard/${slug}`}
                      className="text-cyan-200 underline underline-offset-2 hover:text-cyan-100"
                    >
                      organizer console
                    </a>
                    .
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => void loadSchedule()}
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:rounded-xl sm:p-3.5">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Today</p>
                  <div className="mt-2 font-serif text-lg text-white sm:mt-2 sm:text-2xl">{todayLabel(tz)}</div>
                  <p className="mt-2 text-xs text-slate-400 sm:text-sm">{tz}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:rounded-xl sm:p-3.5">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Coming up next</p>
                  {nextAgendaItem ? (
                    nextAgendaItem.type === 'selection' ? (
                      <>
                        <div className="mt-2 text-base font-semibold text-white sm:mt-2 sm:text-xl">
                          {staffManualBlockTitle(
                            nextAgendaItem.selection,
                            nextAgendaItem.selection.kind === 'program'
                              ? nextAgendaItem.selection.programTitle || 'Program session'
                              : 'Manual busy block'
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-300">
                          {findMatchingStaffShift(nextAgendaItem.selection)
                            ? 'From PAF staff & volunteer schedule'
                            : `${nextAgendaItem.selection.kind === 'program' && nextAgendaItem.selection.programRoom ? `${nextAgendaItem.selection.programRoom} · ` : ''}${formatRange(nextAgendaItem.selection.startsAt, nextAgendaItem.selection.endsAt, tz)}`}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-base font-semibold text-white sm:mt-2 sm:text-xl">
                          Together with {reservationPartnerName(nextAgendaItem.reservation)}
                        </div>
                        <p className="mt-1 text-sm text-slate-300">
                          {formatRange(nextAgendaItem.reservation.startsAt, nextAgendaItem.reservation.endsAt, tz)}
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <div className="mt-2 text-base font-semibold text-white sm:text-xl">Nothing scheduled yet.</div>
                      <p className="mt-1 text-sm text-slate-400">Add from Program or Reservations.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:rounded-xl sm:p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in</p>
                  <h2 className="mt-1 truncate text-base font-semibold text-white sm:text-xl">{me.account.displayName}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-sm">@{me.account.username}</p>
                </div>
                <div className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200 sm:px-3 sm:text-xs">
                  Live
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => void rename()}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => setManualOpen(true)}
                >
                  Busy block
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => void copyShare()}
                >
                  Copy code
                </button>
                <button
                  type="button"
                  className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100 transition hover:bg-rose-400/20"
                  onClick={() => void logout()}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <GlassPanel className="hidden p-2.5 lg:block">
              <div className="flex flex-wrap gap-1.5" role="tablist">
                {TAB_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === option.key}
                    onClick={() => setTab(option.key)}
                    className={cx(
                      'flex min-w-0 flex-1 flex-col rounded-xl border px-3 py-2.5 text-left transition sm:min-w-[130px]',
                      tab === option.key
                        ? 'border-cyan-300/30 bg-white text-slate-950'
                        : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className={cx('mt-0.5 text-[11px]', tab === option.key ? 'text-slate-600' : 'text-slate-400')}>
                      {option.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </GlassPanel>

            {tab === 'program' ? (
              <div className="space-y-4">
                <GlassPanel className="p-3 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">View</span>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                      {VIEW_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className={cx(
                            'rounded-full px-3 py-2 text-xs transition sm:px-4 sm:text-sm',
                            scheduleView === option.key
                              ? 'bg-white text-slate-950'
                              : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
                          )}
                          onClick={() => setScheduleView(option.key)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {grouped.length > 1 && scheduleView !== 'venue' && scheduleView !== 'grid' ? (
                    <nav className="mt-5 flex flex-wrap gap-2">
                      {grouped.map((g, idx) => (
                        <a
                          key={g.day}
                          href={`#dc-day-${idx}`}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-300 transition hover:bg-white/[0.08]"
                        >
                          {shortDayLabel(g.day)}
                        </a>
                      ))}
                    </nav>
                  ) : null}
                </GlassPanel>

                {scheduleView === 'venue' ? (
                  <div className="space-y-5">
                    {venueGroups.map((vg) => (
                      <GlassPanel key={vg.room} className="p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Venue</p>
                            <h3 className="mt-2 font-serif text-2xl text-white">{vg.room}</h3>
                          </div>
                          <div className="rounded-full border border-slate-800 bg-[#111a2c] px-3 py-1 text-xs text-slate-300">
                            Focused by venue
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
                          {vg.items.map((slot) => (
                            <SessionCard
                              key={slot.id}
                              slot={slot}
                              tz={tz}
                              selected={programSelected.has(slot.id)}
                              onToggle={() => toggleProgram(slot)}
                            />
                          ))}
                        </div>
                      </GlassPanel>
                    ))}
                  </div>
                ) : scheduleView === 'grid' ? (
                  <>
                  <GlassPanel className="hidden overflow-hidden p-3 lg:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-2 text-left text-xs">
                        <thead>
                          <tr>
                            <th className="rounded-2xl bg-white/[0.05] p-3 text-slate-400">Time</th>
                            {uniqueRoomsForGrid.map((room) => (
                              <th key={room} className="rounded-2xl bg-white/[0.05] p-3 text-slate-200">
                                {room}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {groupSlotsByStart(filteredSlots).map(([startIso, slotsAt]) => (
                            <tr key={startIso}>
                              <td className="min-w-[110px] rounded-2xl border border-white/10 bg-black/30 p-3 align-top">
                                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Time</div>
                                <div className="mt-1 text-base font-semibold text-white">{formatTime(startIso, tz)}</div>
                              </td>
                              {uniqueRoomsForGrid.map((room) => {
                                const slot = slotsAt.find((s) => (s.room || 'Other') === room)
                                return (
                                  <td key={room} className="min-w-[180px] align-top">
                                    {slot ? (
                                      <button
                                        type="button"
                                        className={cx(
                                          'h-full w-full rounded-[24px] border p-3 text-left transition',
                                          programSelected.has(slot.id)
                                            ? 'border-cyan-300/35 bg-cyan-400/12 shadow-[0_20px_45px_rgba(34,211,238,0.12)]'
                                            : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                                        )}
                                        onClick={() => toggleProgram(slot)}
                                      >
                                        <div className="text-sm font-semibold text-white">{slot.title}</div>
                                        <div className="mt-2 text-[11px] text-slate-400">{room}</div>
                                      </button>
                                    ) : (
                                      <div className="rounded-[24px] border border-white/5 bg-black/20 p-3 text-slate-600">—</div>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassPanel>
                  <GlassPanel className="border-amber-400/25 bg-amber-400/10 p-4 lg:hidden">
                    <p className="text-sm text-amber-50">
                      Grid view is built for wider screens. On your phone, use <strong>Timeline</strong> for the easiest
                      browsing.
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                      onClick={() => setScheduleView('simple')}
                    >
                      Switch to timeline
                    </button>
                  </GlassPanel>
                  </>
                ) : (
                  grouped.map((g, dayIdx) => (
                    <GlassPanel key={g.day} className="scroll-mt-24 p-3 sm:p-4" >
                      <section id={`dc-day-${dayIdx}`}>
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Day {dayIdx + 1}</p>
                            <h3 className="mt-1.5 font-serif text-2xl text-white">{g.day}</h3>
                          </div>
                          <div className="rounded-full border border-slate-800 bg-[#111a2c] px-3 py-1 text-xs text-slate-300">{tz}</div>
                        </div>
                        <div className="mt-4 space-y-2.5">
                          {groupSlotsByStart(g.items).map(([startIso, slotsAt]) => {
                            const policies = programPoliciesForSlots(slotsAt)
                            const hasPolicy = policies.length > 0
                            return (
                            <div
                              key={startIso}
                              className="grid grid-cols-1 gap-2 rounded-xl border border-white/8 bg-black/20 p-2.5 md:grid-cols-[96px_minmax(0,1fr)]"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const first = slotsAt[0]
                                  if (!first) return
                                  const target = document.getElementById(`dc-slot-${first.id}`)
                                  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }}
                                className={cx(
                                  'rounded-lg border px-2.5 py-2 text-left transition hover:bg-white/10',
                                  hasPolicy
                                    ? 'border-amber-300/25 bg-amber-500/10'
                                    : 'border-cyan-300/15 bg-cyan-300/10'
                                )}
                                aria-label={`Jump to ${formatTime(startIso, tz)} sessions`}
                              >
                                <div
                                  className={cx(
                                    'text-[9px] uppercase tracking-[0.24em]',
                                    hasPolicy ? 'text-amber-100/80' : 'text-cyan-100/70'
                                  )}
                                >
                                  Start
                                </div>
                                <div className="mt-1 text-lg font-semibold text-white">{formatTime(startIso, tz)}</div>
                                {hasPolicy ? (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {policies.slice(0, 2).map((policy) => (
                                      <span
                                        key={policy.key}
                                        className={cx(
                                          'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
                                          policyChipClass(policy.tone)
                                        )}
                                      >
                                        {policy.label}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-1.5 text-[10px] text-cyan-100/70">Tap to jump</div>
                                )}
                              </button>
                              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                                {slotsAt.map((slot) => (
                                  <SessionCard
                                    key={slot.id}
                                    htmlId={`dc-slot-${slot.id}`}
                                    slot={slot}
                                    tz={tz}
                                    showTime={false}
                                    selected={programSelected.has(slot.id)}
                                    onToggle={() => toggleProgram(slot)}
                                  />
                                ))}
                              </div>
                            </div>
                          )})}
                        </div>
                      </section>
                    </GlassPanel>
                  ))
                )}

                {!schedule.slots.length ? (
                  <GlassPanel className="border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-50">
                    <p className="font-medium text-amber-100">No program is loaded for this event yet.</p>
                    <p className="mt-2 text-amber-50/80">
                      The schedule API returned an empty list for this event. Common causes: no rows in{' '}
                      <code className="rounded bg-black/30 px-1">dancecard_program_slots</code>, production env pointed at
                      a different project, or the live deploy is older than the latest Dancecard routes.
                    </p>
                  </GlassPanel>
                ) : !filteredSlots.length ? (
                  <GlassPanel className="p-5 text-sm text-slate-400">No sessions match the current filters.</GlassPanel>
                ) : null}
              </div>
            ) : null}

            {tab === 'dancecard' ? (
              <div className="space-y-4">
                <GlassPanel className="p-3 sm:p-4">
                  <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Personal buffer</p>
                        <h2 className="mt-1 font-serif text-2xl text-white sm:text-[2rem]">Your dancecard</h2>
                        <p className="mt-1.5 hidden text-sm leading-6 text-slate-300 sm:block">
                          Buffer + staff autofill settings for your saved schedule.
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                        <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Buffer minutes</label>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[0, 15, 30].map((minutes) => (
                            <button
                              key={minutes}
                              type="button"
                              className={cx(
                                'rounded-full border px-3 py-1.5 text-sm transition',
                                buffer === minutes
                                  ? 'border-cyan-300 bg-cyan-100 text-slate-950'
                                  : 'border-slate-700 bg-[#111a2c] text-slate-200 hover:border-slate-500'
                              )}
                              onClick={() => applyBuffer(minutes)}
                            >
                              {minutes === 0 ? 'No buffer' : `${minutes} min`}
                            </button>
                          ))}
                        </div>
                      </div>
                      {!me.account.isStaff ? (
                        <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                          <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">
                            Staff only — unlock roster
                          </label>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            Enter your staff access code once.
                          </p>
                          <input
                            type="password"
                            autoComplete="off"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300"
                            value={staffUnlockCode}
                            onChange={(e) => {
                              setStaffUnlockCode(e.target.value)
                              setStaffUnlockErr(null)
                            }}
                            placeholder="Staff access code"
                          />
                          {staffUnlockErr ? <p className="mt-2 text-sm text-rose-300">{staffUnlockErr}</p> : null}
                          <button
                            type="button"
                            disabled={staffUnlockBusy || !staffUnlockCode.trim()}
                            className="mt-2.5 w-full rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => void unlockStaff()}
                          >
                            {staffUnlockBusy ? 'Unlocking…' : 'Unlock staff autofill'}
                          </button>
                        </div>
                      ) : staffPeople.length ? (
                        <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                          <label
                            htmlFor="staff-schedule"
                            className="block text-xs uppercase tracking-[0.25em] text-slate-400"
                          >
                            Staff and volunteer autofill
                          </label>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            Choose your official staff/volunteer name.
                          </p>
                          <select
                            id="staff-schedule"
                            value={selectedStaffName}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300"
                            onChange={(event) => void applyStaffSchedule(event.target.value)}
                          >
                            <option value="">Choose your staff or volunteer name</option>
                            {staffPeople.map((person) => (
                              <option key={person.name} value={person.name}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                          {selectedStaffEntry ? (
                            <div className="mt-2.5 space-y-2 border-t border-white/10 pt-2.5">
                              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">
                                {selectedStaffEntry.shifts.length} shifts ready on your dancecard
                              </p>
                              <ul className="space-y-2">
                                {selectedStaffEntry.shifts.map((sh, i) => {
                                  const rc = roleColor(sh.role)
                                  return (
                                    <li key={`${sh.startsAt}-${i}`} className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                                      <span
                                        className={cx(
                                          'rounded-full border px-2 py-0.5 font-semibold ring-1',
                                          rc.bg,
                                          rc.fg,
                                          rc.ring
                                        )}
                                      >
                                        {sh.role}
                                      </span>
                                      <span className="text-slate-400">{formatStaffShiftTitle(sh, tz)}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3 text-sm text-slate-400">
                          Staff roster could not be loaded, or no shifts are published yet.
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
                          onClick={() => void copyShare()}
                        >
                          Copy share code
                        </button>
                        <button
                          type="button"
                          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200"
                          onClick={() => setManualOpen(true)}
                        >
                          Add manual busy block
                        </button>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Export calendar</label>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={calendarExportCount === 0}
                            className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => exportDancecardCalendar('ical')}
                          >
                            Apple / iCal
                          </button>
                          <button
                            type="button"
                            disabled={calendarExportCount === 0}
                            className="rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-50 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => exportDancecardCalendar('google')}
                          >
                            Google Calendar
                          </button>
                        </div>
                        {calendarExportCount === 0 ? (
                          <p className="mt-2 text-xs text-slate-500">Nothing to export yet.</p>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">{calendarExportCount} event(s) in this export.</p>
                        )}
                        <p className="mt-2.5 text-xs uppercase tracking-[0.16em] text-slate-500">Selections only</p>
                        {countDancecardIcsEvents(me?.selections ?? [], []) === 0 ? (
                          <p className="mt-2 text-xs text-slate-500">Add items to your dancecard first.</p>
                        ) : (
                          <a
                            href={`/api/dancecard/${slug}/ics`}
                            download
                            className="mt-1.5 inline-flex rounded-xl border border-violet-400/35 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-50 transition hover:bg-violet-500/25"
                          >
                            Download selections (.ics)
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {dancecardFlat.length ? (
                        <DancecardCompactList
                          rows={dancecardFlat}
                          tz={tz}
                          findMatchingStaffShift={findMatchingStaffShift}
                          staffManualBlockTitle={staffManualBlockTitle}
                          onRemoveSelection={(id) => removeSelection(id)}
                          onNoteBlur={(s, note) => {
                            const cur = me?.selections ?? []
                            const next = cur.map((x) =>
                              x.id === s.id ? { ...x, note: note.trim() ? note.trim().slice(0, 1000) : null } : x
                            )
                            setMe((m) => (m ? { ...m, selections: next } : m))
                            queueSave(next, buffer)
                          }}
                        />
                      ) : (
                        <GlassPanel className="p-5 text-sm text-slate-400">Nothing on your dancecard yet.</GlassPanel>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              </div>
            ) : null}

            {tab === 'mutual' ? (
              <GlassPanel className="p-3 sm:p-5">
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mutual</p>
                  <h2 className="mt-1 font-serif text-xl text-white sm:text-3xl">Availability</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Paste the share token or full link someone sent you, then tap or click Load.{' '}
                    <span className="text-emerald-200">Green</span> means open, <span className="text-rose-200">red</span>{' '}
                    means busy. No class names — just time.
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                    value={mutualToken}
                    onChange={(e) => setMutualToken(e.target.value)}
                    placeholder="Paste share token…"
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
                    onClick={() => void refreshMutual()}
                  >
                    Load
                  </button>
                </div>

                {mutualData && schedule.meta ? (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-cyan-400/25 bg-cyan-950/30 px-4 py-3 text-sm leading-relaxed text-cyan-50/95">
                      <p className="font-semibold text-white">Reserving a time</p>
                      {mutualData.viewerYou && me ? (
                        <p className="mt-1.5 text-cyan-100/95">
                          <span className="text-white">Tap or click a green block</span> on the strips below — each block is
                          half an hour when you are both free. That opens a form with those times; adjust the window if
                          you need longer, use <span className="text-white">Check slot</span>, then{' '}
                          <span className="text-white">Send reservation</span>.
                        </p>
                      ) : (
                        <p className="mt-1.5 text-cyan-100/95">
                          <span className="text-white">Green</span> shows when the host is free on their dancecard. Log
                          in here with an account that is <span className="text-white">not</span> the host, then tap{' '}
                          <span className="text-white">Load</span> again — green will mean you are <span className="text-white">both</span> free, and you can tap a green block to open the reserve form.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="font-medium text-white">Host:</span> {mutualData.host.displayName}
                      {mutualData.viewerYou ? (
                        <>
                          <span className="text-slate-500">·</span>
                          <span>
                            Signed in — <span className="text-emerald-200">{mutualData.viewerYou}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500"> · Sign in to compare both calendars.</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <span className="rounded-full border border-rose-500/30 bg-rose-950/40 px-2 py-1 text-rose-100">
                        Red = busy
                      </span>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-emerald-100">
                        {mutualData.viewerYou ? 'Green = both free' : 'Green = host free'}
                      </span>
                    </div>
                    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 sm:max-h-none">
                      {mutualStripDays.map((d) => (
                        <MutualAvailabilityStrip
                          key={`${d.label}-${d.startMs}`}
                          dayLabel={d.label}
                          rangeStartMs={d.startMs}
                          rangeEndMs={d.endMs}
                          freeIntervals={
                            mutualData.viewerYou ? (mutualData.mutualFreeGaps ?? []) : mutualData.hostFreeGaps
                          }
                          tz={tz}
                          mode={mutualData.viewerYou ? 'mutual' : 'host'}
                          onFreeStepClick={onMutualStripSlotClick}
                          activeWindowStartMs={mutualPlayableWindow?.startMs}
                          activeWindowEndMs={mutualPlayableWindow?.endMs}
                        />
                      ))}
                    </div>
                    {mutualData.viewerYou && !(mutualData.mutualFreeGaps?.length ?? 0) ? (
                      <p className="text-sm text-slate-400">No mutual free windows right now — try adjusting your dancecards.</p>
                    ) : null}
                  </div>
                ) : null}
              </GlassPanel>
            ) : null}

            {tab === 'reservations' ? <ReservationsPanel slug={slug} tz={tz} /> : null}
          </div>

          <aside className="hidden xl:block">
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">About Dancecard</p>
              <h2 className="mt-2 font-serif text-2xl text-white">Events &amp; conventions</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Dancecard is a feature for organizations and conventions that is baked into how events are created on
                our FetLife replacement. Stay tuned for late summer 2026 for an alpha test of the new, modern kink
                community. Name TBD.
              </p>
            </GlassPanel>
          </aside>
        </div>
      </div>

      {manualOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-md sm:items-center">
          <GlassPanel className="w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Custom block</p>
                <h3 className="mt-2 font-serif text-3xl text-white">Manual busy block</h3>
              </div>
              <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300" onClick={() => setManualOpen(false)}>
                Close
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-400">Times use your browser local timezone and are stored as UTC.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Start</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                  value={mStart}
                  onChange={(e) => setMStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">End</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                  value={mEnd}
                  onChange={(e) => setMEnd(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
              onClick={() => void addManualBlock()}
            >
              Add busy block
            </button>
          </GlassPanel>
        </div>
      ) : null}

      {reserveMutualOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-md sm:items-center">
          <GlassPanel className="w-full max-w-lg p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90">Mutual time</p>
                <h3 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Reserve together</h3>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300"
                onClick={() => {
                  setReserveMutualOpen(false)
                  setReserveMutualPreview(null)
                  setReserveMutualBanner(null)
                }}
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              With <span className="text-white">{mutualData?.host.displayName ?? 'the host'}</span>. Times use your
              browser’s local fields; stored in UTC. Extend the window if you need more than 30 minutes.
            </p>
            {reserveMutualBanner?.kind === 'success' ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/45 p-4 text-emerald-50">
                <p className="font-serif text-xl font-semibold text-white">Reservation sent</p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100/95">
                  It is on both dancecards. Open the Reservations tab anytime to see it together with other holds.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    onClick={() => {
                      setReserveMutualOpen(false)
                      setReserveMutualBanner(null)
                      setTab('reservations')
                    }}
                  >
                    View reservations
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-white/15 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
                    onClick={() => {
                      setReserveMutualOpen(false)
                      setReserveMutualBanner(null)
                    }}
                  >
                    Stay on Mutual
                  </button>
                </div>
              </div>
            ) : (
              <>
                {reserveMutualBanner?.kind === 'error' ? (
                  <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-100">
                    {reserveMutualBanner.message}
                  </div>
                ) : null}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Start</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                      value={reserveMutualStart}
                      onChange={(e) => {
                        setReserveMutualStart(e.target.value)
                        setReserveMutualPreview(null)
                        setReserveMutualBanner(null)
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">End</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                      value={reserveMutualEnd}
                      onChange={(e) => {
                        setReserveMutualEnd(e.target.value)
                        setReserveMutualPreview(null)
                        setReserveMutualBanner(null)
                      }}
                    />
                  </div>
                </div>
                <label className="mt-4 block text-xs uppercase tracking-[0.25em] text-slate-400">Note (optional)</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                  value={reserveMutualNote}
                  maxLength={500}
                  onChange={(e) => {
                    setReserveMutualNote(e.target.value)
                    setReserveMutualPreview(null)
                    setReserveMutualBanner(null)
                  }}
                />
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={reserveMutualBusy}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-50 sm:flex-none"
                    onClick={() => void runMutualReservePreview()}
                  >
                    Check slot
                  </button>
                  <button
                    type="button"
                    disabled={reserveMutualBusy}
                    className="flex-1 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 sm:flex-none"
                    onClick={() => void submitMutualReserve()}
                  >
                    Send reservation
                  </button>
                </div>
                {reserveMutualPreview !== null ? (
                  <p className={`mt-3 text-sm ${reserveMutualPreview ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {reserveMutualPreview
                      ? 'This window is still mutually free with your current dancecards.'
                      : 'Not mutually free with your current dancecards — adjust times or your schedule.'}
                  </p>
                ) : null}
              </>
            )}
          </GlassPanel>
        </div>
      ) : null}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#050b18]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
        aria-label="Dancecard sections"
      >
        <div className="mx-auto flex max-w-7xl gap-0.5">
          {TAB_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-current={tab === option.key ? 'page' : undefined}
              className={cx(
                'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-center text-[10px] font-semibold leading-tight transition sm:text-[11px]',
                tab === option.key ? 'bg-cyan-400/20 text-cyan-50' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              )}
              onClick={() => setTab(option.key)}
            >
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast ? (
        <div className="fixed bottom-24 left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-[0_18px_55px_rgba(2,6,23,0.75)] backdrop-blur-xl lg:bottom-4">
          <span>{toast}</span>
          <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
    </>
  )
}

function GlassPanel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-slate-800/90 bg-[#0d1526]/96 shadow-[0_12px_32px_rgba(2,6,23,0.30)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function SelectionCard({
  title,
  meta,
  tone = 'cyan',
  action,
}: {
  title: string
  meta: string
  tone?: 'cyan' | 'violet' | 'amber' | 'emerald'
  action?: React.ReactNode
}) {
  const toneClass =
    tone === 'violet'
      ? 'border-violet-300/20 bg-violet-300/10'
      : tone === 'amber'
        ? 'border-amber-300/20 bg-amber-300/10'
        : tone === 'emerald'
          ? 'border-emerald-300/20 bg-emerald-300/10'
          : 'border-cyan-300/20 bg-cyan-300/10'

  return (
    <div className={cx('flex items-start justify-between gap-3 rounded-xl border p-3', toneClass)}>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-5 text-white">{title}</div>
        <div className="mt-1 text-xs text-slate-200/85 sm:text-sm">{meta}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function SessionCard(props: {
  htmlId?: string
  slot: ProgramSlot
  tz: string
  showTime?: boolean
  selected: boolean
  onToggle: () => void
}) {
  const { htmlId, slot, tz, showTime = true, selected, onToggle } = props
  const addLabel = selected ? 'On your dancecard — click to remove' : 'Click to add to My dancecard'
  const compactActionLabel = selected ? 'Added' : 'Tap to add'
  const policyTags = programPoliciesForSlots([slot])
  const roomChip = locationColor(slot.room)
  const hasRoomTint = Boolean(slot.room)
  return (
    <button
      id={htmlId}
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${slot.title}. ${addLabel}`}
      className={cx(
        'group flex w-full min-w-0 flex-1 flex-col rounded-lg border p-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:flex-row sm:items-stretch',
        selected
          ? 'border-cyan-300/35 bg-cyan-300/12'
          : hasRoomTint
            ? `${roomChip.border} ${roomChip.surface} hover:bg-white/[0.06]`
            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
      )}
    >
      <div className={cx('flex flex-col gap-1.5 sm:items-stretch', showTime ? 'sm:flex-row' : '')}>
        {showTime ? (
        <div className="min-w-0 shrink-0 rounded-md border border-white/10 bg-black/35 px-2 py-2 sm:min-w-[84px]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Time</div>
          <div className="mt-1 text-sm font-semibold text-white">{formatTime(slot.startsAt, tz)}</div>
          <div className="mt-1 text-xs text-slate-400">{formatTime(slot.endsAt, tz)}</div>
        </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-5 text-white">{slot.title}</div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                {slot.room ? (
                  <span
                    className={cx(
                      'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                      roomChip.bg,
                      roomChip.fg,
                      roomChip.ring
                    )}
                  >
                    {slot.room}
                  </span>
                ) : null}
                {slot.track ? (
                  (() => {
                    const rc = roleColor(slot.track)
                    return (
                      <span
                        className={cx(
                          'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                          rc.bg,
                          rc.fg,
                          rc.ring
                        )}
                      >
                        {slot.track}
                      </span>
                    )
                  })()
                ) : null}
                {policyTags.map((policy) => (
                  <span
                    key={policy.key}
                    className={cx(
                      'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]',
                      policyChipClass(policy.tone)
                    )}
                  >
                    {policy.label}
                  </span>
                ))}
              </div>
            </div>
            <span
              className={cx(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                selected
                  ? 'border-cyan-200/40 bg-cyan-300/20 text-cyan-50'
                  : 'border-white/10 bg-black/20 text-slate-400'
              )}
              aria-hidden
            >
              {selected ? '✓' : '+'}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{compactActionLabel}</div>
            <div className="truncate text-[11px] text-slate-400">{formatRange(slot.startsAt, slot.endsAt, tz)}</div>
          </div>
        </div>
      </div>
    </button>
  )
}

function ReservationsPanel({ slug, tz }: { slug: string; tz: string }) {
  const [rows, setRows] = useState<
    {
      id: string
      status: string
      startsAt: string
      endsAt: string
      note: string | null
      role: string
      host: { id: string; displayName: string }
      guest: { id: string; displayName: string }
    }[]
  >([])

  const load = useCallback(async () => {
    const r = await dancecardFetch<{ reservations: typeof rows }>(slug, '/reservations')
    setRows(r.reservations)
  }, [slug])

  useEffect(() => {
    void load().catch(() => null)
  }, [load])

  return (
    <GlassPanel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scheduling</p>
          <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">Reservations</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 sm:px-4 sm:text-sm"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>
      <div className="mt-4 space-y-3 text-sm sm:mt-5">
        {rows.length ? (
          rows.map((b) => (
            <SelectionCard
              key={b.id}
              title={`Together with ${b.role === 'host' ? b.guest.displayName : b.host.displayName}`}
              meta={`${b.status.toUpperCase()} · ${formatRange(b.startsAt, b.endsAt, tz)}${b.note ? ` · ${b.note}` : ''}`}
              tone={b.status === 'confirmed' ? 'emerald' : 'amber'}
            />
          ))
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-slate-400">No reservations yet.</div>
        )}
      </div>
    </GlassPanel>
  )
}
