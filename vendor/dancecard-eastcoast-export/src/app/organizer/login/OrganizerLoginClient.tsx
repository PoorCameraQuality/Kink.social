'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

export function OrganizerLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next')
  const nextUrl =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext.startsWith('/organizer/')
      ? rawNext
      : '/organizer/dancecard/paf26'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signErr) {
      setError(signErr.message || 'Sign-in failed')
      setLoading(false)
      return
    }
    router.replace(nextUrl)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Organizer</p>
      <h1 className="mt-2 font-serif text-3xl text-white">Sign in</h1>
      <p className="mt-2 text-sm text-slate-400">
        Use the same email and password as your East Coast site account. You must be listed as an organizer for the
        event.
      </p>
      <form className="mt-8 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <label className="block text-xs uppercase tracking-wide text-slate-400">
          Email
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-slate-400">
          Password
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Continue'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/" className="text-cyan-400 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  )
}
