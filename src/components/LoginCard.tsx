'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { safeInternalPath } from '@/lib/auth/safe-redirect'

type Tab = 'signup' | 'login'

export type LoginCardProps = {
  /** When `redirect` was set (e.g. by middleware), start on Login tab */
  defaultTab?: Tab
  /** After successful demo login (must be same-origin path, e.g. from `?redirect=`) */
  redirectAfterLogin?: string
}

export default function LoginCard({ defaultTab = 'signup', redirectAfterLogin }: LoginCardProps = {}) {
  const router = useRouter()
  const { refresh } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError(null)
    setLoginSubmitting(true)
    try {
      const r = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      })
      const data = (await r.json()) as { error?: string }
      if (!r.ok) {
        setLoginError(typeof data.error === 'string' ? data.error : 'Login failed')
        return
      }
      await refresh()
      const next = safeInternalPath(redirectAfterLogin) ?? '/home'
      router.push(next)
    } catch {
      setLoginError('Network error. Try again.')
    } finally {
      setLoginSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-c2k-bg-card border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('signup')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'signup'
              ? 'bg-c2k-bg-elevated text-white border-b-2 border-c2k-accent-primary'
              : 'text-c2k-text-secondary hover:text-white bg-c2k-accent-primary/20'
          }`}
        >
          New here?
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'login'
              ? 'bg-c2k-bg-elevated text-white border-b-2 border-c2k-accent-primary'
              : 'text-c2k-text-secondary hover:text-white bg-c2k-accent-primary/20'
          }`}
        >
          Login
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'signup' ? (
          <>
            <p className="text-sm text-c2k-text-secondary mb-6">
              Sign up today – It&apos;s free, non-binding, and risk-free!
            </p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="signup-email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-c2k-text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-3 bg-c2k-bg border border-white/10 rounded-lg text-white placeholder-c2k-text-muted focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-c2k-text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-c2k-bg border border-white/10 rounded-lg text-white placeholder-c2k-text-muted focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-identity" className="sr-only">
                  Identify as you are
                </label>
                <div className="relative">
                  <select
                    id="signup-identity"
                    className="w-full pl-4 pr-10 py-3 bg-c2k-bg border border-white/10 rounded-lg text-white appearance-none focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Identify as you are...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="couple">Couple</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="trans">Trans</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-c2k-text-muted pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover text-white font-semibold uppercase tracking-wide rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-c2k-accent-primary focus:ring-offset-2 focus:ring-offset-c2k-bg"
              >
                Create profile
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-c2k-text-secondary mb-6">
              Welcome back! Log in to your account.
            </p>
            <p className="text-xs text-c2k-text-muted mb-4">
              Demo: password <code className="text-c2k-text-secondary">demo</code> with any seed username (e.g.{' '}
              <code className="text-c2k-text-secondary">RopeDreamer</code>).
            </p>
            <form className="space-y-4" onSubmit={handleLoginSubmit} noValidate>
              <div>
                <label htmlFor="login-email" className="sr-only">
                  Username or email
                </label>
                <input
                  id="login-email"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Username or email"
                  aria-invalid={loginError ? true : undefined}
                  aria-describedby={loginError ? 'login-error' : undefined}
                  className="w-full px-4 py-3 bg-c2k-bg border border-white/10 rounded-lg text-white placeholder-c2k-text-muted focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  aria-invalid={loginError ? true : undefined}
                  aria-describedby={loginError ? 'login-error' : undefined}
                  className="w-full px-4 py-3 bg-c2k-bg border border-white/10 rounded-lg text-white placeholder-c2k-text-muted focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none transition-colors"
                />
              </div>
              {loginError && (
                <p id="login-error" className="text-sm text-c2k-danger" role="alert">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-3 px-4 bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold uppercase tracking-wide rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-c2k-accent-primary focus:ring-offset-2 focus:ring-offset-c2k-bg"
              >
                {loginSubmitting ? 'Signing in…' : 'Login'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
