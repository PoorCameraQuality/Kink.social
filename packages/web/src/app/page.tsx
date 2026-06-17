import SiteWordmark from '@/components/brand/SiteWordmark'
import '@/components/landing/public-auth.css'
import LandingSignupBlock from '@/components/landing/LandingSignupBlock'
import { useAuth } from '@/contexts/AuthContext'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { safeInternalPath } from '@c2k/shared'

export default function LandingPage() {
  const { status, isAuthenticated, isFallback } = useAuth()
  const [searchParams] = useSearchParams()
  const rawRedirect = searchParams.get('redirect') ?? undefined
  const redirectAfterLogin = safeInternalPath(rawRedirect)
  const loginParam = searchParams.get('login')
  const loginTab = loginParam === '1' || loginParam === 'true'

  const signupProps = {
    defaultTab: loginTab ? ('login' as const) : ('signup' as const),
    redirectAfterLogin,
    variant: 'landing' as const,
  }

  if (status === 'ready' && isAuthenticated && !isFallback) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="public-page public-page--auth-only">
      <main className="landing-auth-only">
        <Link to="/" className="landing-auth-only__brand" aria-label="Kink Social home">
          <SiteWordmark className="text-xl font-semibold tracking-tight text-[var(--pub-text)] sm:text-2xl" />
          <span className="landing-auth-only__alpha-badge" aria-hidden="true">
            Alpha Test
          </span>
        </Link>

        <div id="auth" className="landing-auth-only__card scroll-mt-24">
          <LandingSignupBlock {...signupProps} />
        </div>
      </main>
    </div>
  )
}
