export function assertSlotInsideWindow(args: {
  windowStartsAt: string
  windowEndsAt: string
  startsAt: string
  endsAt: string
}): void {
  const ws = new Date(args.windowStartsAt).getTime()
  const we = new Date(args.windowEndsAt).getTime()
  const s = new Date(args.startsAt).getTime()
  const e = new Date(args.endsAt).getTime()
  if (![ws, we, s, e].every((t) => Number.isFinite(t))) {
    throw new Error('BAD_REQUEST: Invalid timestamps')
  }
  if (s >= e) {
    throw new Error('BAD_REQUEST: Start must be before end')
  }
  if (s < ws || e > we) {
    throw new Error('BAD_REQUEST: Slot must fall inside the event window')
  }
}
