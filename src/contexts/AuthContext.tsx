'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_VIEWER_USERNAME } from '@/data/mock-data'

type SessionJson = {
  authenticated: boolean
  username: string | null
  fallback: boolean
}

export type AuthContextValue = {
  /** Session fetch finished */
  status: 'loading' | 'ready'
  /** Resolved viewer username for mock actions (may be empty if strict unauthenticated). */
  viewerUsername: string
  /** True when valid session cookie exists */
  isAuthenticated: boolean
  /** True when using unauthenticated fallback viewer (see NEXT_PUBLIC_AUTH_ALLOW_FALLBACK) */
  isFallback: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const [viewerUsername, setViewerUsername] = useState(MOCK_VIEWER_USERNAME)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isFallback, setIsFallback] = useState(true)

  const refresh = useCallback(async () => {
    const r = await fetch('/api/auth/session', { credentials: 'same-origin' })
    const data = (await r.json()) as SessionJson
    setIsAuthenticated(!!data.authenticated)
    setIsFallback(!!data.fallback)
    if (typeof data.username === 'string' && data.username.length > 0) {
      setViewerUsername(data.username)
    } else if (data.fallback) {
      setViewerUsername(MOCK_VIEWER_USERNAME)
    } else {
      setViewerUsername('')
    }
    setStatus('ready')
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      status,
      viewerUsername,
      isAuthenticated,
      isFallback,
      refresh,
      logout,
    }),
    [status, viewerUsername, isAuthenticated, isFallback, refresh, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Current viewer username for permissions / “own post” checks (client only). */
export function useViewerUsername(): string {
  return useAuth().viewerUsername
}
