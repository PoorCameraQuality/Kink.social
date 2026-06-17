import SiteWordmark from '@/components/brand/SiteWordmark'
import '@/components/landing/public-auth.css'
import LandingAuthIntro from '@/components/landing/LandingAuthIntro'
import LandingPublicFooter from '@/components/landing/LandingPublicFooter'
import LandingSideHero from '@/components/landing/LandingSideHero'
import LandingSignupBlock from '@/components/landing/LandingSignupBlock'
import { LANDING_ALPHA_BADGE } from '@/lib/alpha-activation-copy'
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
    <div className="public-page public-page--split">
      <main className="landing-split">
        <div className="landing-split__auth">
          <div className="landing-split__auth-inner">
            <Link to="/" className="landing-split__brand" aria-label="Kink Social home">
              <SiteWordmark className="text-xl font-semibold tracking-tight text-[var(--pub-text)] sm:text-2xl" />
              <span className="landing-auth-only__alpha-badge" aria-hidden="true">
                {LANDING_ALPHA_BADGE}
              </span>
            </Link>

            <div className="landing-split__intro-mobile">
              <LandingAuthIntro />
            </div>

            <div id="auth" className="landing-split__card scroll-mt-24">
              <LandingSignupBlock {...signupProps} />
            </div>
          </div>
        </div>

        <div className="landing-split__hero landing-split__hero--desktop">
          <LandingSideHero />
        </div>
      </main>

      <LandingPublicFooter compact />
    </div>
  )
}
