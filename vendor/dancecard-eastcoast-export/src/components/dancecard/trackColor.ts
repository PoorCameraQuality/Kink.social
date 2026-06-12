import type { CSSProperties } from 'react'

/** Stable HSL for Sched-style track chips. */
export function trackHue(track: string | null | undefined): number {
  if (!track) return 210
  let h = 0
  for (let i = 0; i < track.length; i++) {
    h = (h * 31 + track.charCodeAt(i)) % 360
  }
  return h
}

export function trackChipClass(): string {
  return 'border border-white/15 text-white/90'
}

export function trackChipStyle(track: string | null | undefined): CSSProperties {
  const h = trackHue(track)
  return {
    background: `hsla(${h}, 45%, 28%, 0.55)`,
  }
}
