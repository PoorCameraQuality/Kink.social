/**
 * Deterministic role / track colors for staff shifts and program chips.
 */

export type RoleColor = { bg: string; fg: string; ring: string }

const MOD: RoleColor = { bg: 'bg-violet-500/25', fg: 'text-violet-100', ring: 'ring-violet-400/40' }
const TAXI: RoleColor = { bg: 'bg-amber-500/25', fg: 'text-amber-100', ring: 'ring-amber-400/40' }
const TRACK: RoleColor = { bg: 'bg-indigo-500/20', fg: 'text-indigo-100', ring: 'ring-indigo-400/35' }

const FALLBACK: RoleColor[] = [
  { bg: 'bg-teal-500/25', fg: 'text-teal-100', ring: 'ring-teal-400/40' },
  { bg: 'bg-lime-500/20', fg: 'text-lime-100', ring: 'ring-lime-400/35' },
  { bg: 'bg-pink-500/25', fg: 'text-pink-100', ring: 'ring-pink-400/40' },
  { bg: 'bg-yellow-500/20', fg: 'text-yellow-100', ring: 'ring-yellow-400/35' },
  { bg: 'bg-blue-500/25', fg: 'text-blue-100', ring: 'ring-blue-400/40' },
  { bg: 'bg-purple-500/25', fg: 'text-purple-100', ring: 'ring-purple-400/40' },
  { bg: 'bg-red-500/20', fg: 'text-red-100', ring: 'ring-red-400/35' },
  { bg: 'bg-green-500/25', fg: 'text-green-100', ring: 'ring-green-400/40' },
]

function hashLabel(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * @param role — staff role label, program track, or "track" fallback
 */
export function roleColor(role: string | null | undefined): RoleColor {
  const r = (role ?? '').trim()
  if (!r) return TRACK
  const key = r.toLowerCase()

  if (key.startsWith('mod')) return MOD
  if (key.startsWith('taxi')) return TAXI
  if (key.includes('strike')) return { bg: 'bg-slate-500/30', fg: 'text-slate-100', ring: 'ring-slate-400/35' }
  if (key.includes('build crew')) return { bg: 'bg-orange-500/25', fg: 'text-orange-100', ring: 'ring-orange-400/40' }
  if (key.startsWith('hq')) return { bg: 'bg-cyan-500/25', fg: 'text-cyan-100', ring: 'ring-cyan-400/40' }
  if (key.startsWith('floater')) return { bg: 'bg-emerald-500/25', fg: 'text-emerald-100', ring: 'ring-emerald-400/40' }
  if (key.startsWith('registration')) return { bg: 'bg-sky-500/25', fg: 'text-sky-100', ring: 'ring-sky-400/40' }
  if (key.startsWith('burrow')) return { bg: 'bg-rose-500/25', fg: 'text-rose-100', ring: 'ring-rose-400/40' }
  if (key.includes('presenter') && key.includes('liaison'))
    return { bg: 'bg-fuchsia-500/25', fg: 'text-fuchsia-100', ring: 'ring-fuchsia-400/40' }

  return FALLBACK[hashLabel(r) % FALLBACK.length]
}
