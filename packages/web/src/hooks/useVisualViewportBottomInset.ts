import { useEffect, useState } from 'react'

/** Pixels obscured at the bottom by the on-screen keyboard (mobile browsers). */
export function useVisualViewportBottomInset(enabled: boolean): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setInset(0)
      return
    }
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const next = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      setInset(next)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])

  return inset
}
