type LocationChip = {
  bg: string
  fg: string
  ring: string
  surface: string
  border: string
}

const FIXED_ROOM_COLORS: Record<string, LocationChip> = {
  'all locations': {
    bg: 'bg-slate-500/20',
    fg: 'text-slate-100',
    ring: 'ring-slate-400/30 border-slate-400/35',
    surface: 'bg-slate-500/10',
    border: 'border-slate-400/25',
  },
  'dining hall': {
    bg: 'bg-amber-500/20',
    fg: 'text-amber-100',
    ring: 'ring-amber-400/30 border-amber-400/35',
    surface: 'bg-amber-500/10',
    border: 'border-amber-400/25',
  },
  'dining hall deck': {
    bg: 'bg-orange-500/20',
    fg: 'text-orange-100',
    ring: 'ring-orange-400/30 border-orange-400/35',
    surface: 'bg-orange-500/10',
    border: 'border-orange-400/25',
  },
  'vendor workshop': {
    bg: 'bg-lime-500/20',
    fg: 'text-lime-100',
    ring: 'ring-lime-400/30 border-lime-400/35',
    surface: 'bg-lime-500/10',
    border: 'border-lime-400/25',
  },
  "uggla's forge": {
    bg: 'bg-red-500/20',
    fg: 'text-red-100',
    ring: 'ring-red-400/30 border-red-400/35',
    surface: 'bg-red-500/10',
    border: 'border-red-400/25',
  },
}

const HASH_PALETTE: LocationChip[] = [
  {
    bg: 'bg-sky-500/20',
    fg: 'text-sky-100',
    ring: 'ring-sky-400/30 border-sky-400/35',
    surface: 'bg-sky-500/10',
    border: 'border-sky-400/25',
  },
  {
    bg: 'bg-violet-500/20',
    fg: 'text-violet-100',
    ring: 'ring-violet-400/30 border-violet-400/35',
    surface: 'bg-violet-500/10',
    border: 'border-violet-400/25',
  },
  {
    bg: 'bg-fuchsia-500/20',
    fg: 'text-fuchsia-100',
    ring: 'ring-fuchsia-400/30 border-fuchsia-400/35',
    surface: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-400/25',
  },
  {
    bg: 'bg-emerald-500/20',
    fg: 'text-emerald-100',
    ring: 'ring-emerald-400/30 border-emerald-400/35',
    surface: 'bg-emerald-500/10',
    border: 'border-emerald-400/25',
  },
  {
    bg: 'bg-cyan-500/20',
    fg: 'text-cyan-100',
    ring: 'ring-cyan-400/30 border-cyan-400/35',
    surface: 'bg-cyan-500/10',
    border: 'border-cyan-400/25',
  },
  {
    bg: 'bg-indigo-500/20',
    fg: 'text-indigo-100',
    ring: 'ring-indigo-400/30 border-indigo-400/35',
    surface: 'bg-indigo-500/10',
    border: 'border-indigo-400/25',
  },
]

function hashCode(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function locationColor(room: string | null | undefined): LocationChip {
  const name = (room ?? '').trim()
  if (!name) {
    return {
      bg: 'bg-slate-500/20',
      fg: 'text-slate-100',
      ring: 'ring-slate-400/30 border-slate-400/35',
      surface: 'bg-slate-500/10',
      border: 'border-slate-400/25',
    }
  }
  const key = name.toLowerCase()
  if (FIXED_ROOM_COLORS[key]) return FIXED_ROOM_COLORS[key]
  return HASH_PALETTE[hashCode(key) % HASH_PALETTE.length]
}
