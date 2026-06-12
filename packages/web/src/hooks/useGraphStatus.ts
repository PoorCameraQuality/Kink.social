import { useCallback, useEffect, useState } from 'react'

export type GraphStatus = {
  connectionStatus: string | null
  isFollowing: boolean
  isFollowedBy: boolean
  connectionId: string | null
}

export function useGraphStatus(username: string | null, enabled: boolean) {
  const [status, setStatus] = useState<GraphStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!username || !enabled) {
      setStatus(null)
      return
    }
    setLoading(true)
    try {
      const r = await fetch(`/api/v1/users/${encodeURIComponent(username)}/graph-status`, {
        credentials: 'include',
      })
      if (!r.ok) {
        setStatus(null)
        return
      }
      const data = (await r.json()) as GraphStatus
      setStatus(data)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [username, enabled])

  useEffect(() => {
    void reload()
  }, [reload])

  return { status, loading, reload }
}
