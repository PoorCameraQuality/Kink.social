'use client'

import { useMemo, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { formatTimeLabel } from '@/components/dancecard/organizer/organizerTimeline'

export type StaffShiftRow = {
  id: string
  personName: string
  role: string
  startsAt: string
  endsAt: string
  sortOrder: number
}

export function StaffShiftsPanel({
  eventSlug,
  timezone,
  shifts,
  onRefresh,
}: {
  eventSlug: string
  timezone: string
  shifts: StaffShiftRow[]
  onRefresh: () => Promise<void>
}) {
  const [personName, setPersonName] = useState('')
  const [role, setRole] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...shifts].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [shifts]
  )

  async function addShift() {
    setErr(null)
    if (!personName.trim() || !role.trim() || !startsAt || !endsAt) {
      setErr('Fill all fields')
      return
    }
    setBusy(true)
    try {
      await organizerDancecardFetch(eventSlug, '/staff-shifts', {
        method: 'POST',
        body: JSON.stringify({
          personName: personName.trim(),
          role: role.trim(),
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
        }),
      })
      setPersonName('')
      setRole('')
      setStartsAt('')
      setEndsAt('')
      await onRefresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this staff shift?')) return
    try {
      await organizerDancecardFetch(eventSlug, `/staff-shifts/${id}`, { method: 'DELETE' })
      await onRefresh()
    } catch {
      setErr('Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      {err ? <p className="text-sm text-rose-300">{err}</p> : null}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Add shift</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-400">
            Person name
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Role
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Starts (local / ISO)
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Ends
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          className="mt-3 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
          onClick={() => void addShift()}
        >
          {busy ? 'Saving…' : 'Add shift'}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/25">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Person</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-3 py-2 text-slate-300">
                  {formatTimeLabel(s.startsAt, timezone)} – {formatTimeLabel(s.endsAt, timezone)}
                </td>
                <td className="px-3 py-2 text-white">{s.personName}</td>
                <td className="px-3 py-2 text-slate-300">{s.role}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="text-xs text-rose-300 hover:text-rose-200" onClick={() => void remove(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 ? <p className="px-3 py-6 text-center text-sm text-slate-500">No staff shifts yet.</p> : null}
      </div>
    </div>
  )
}
