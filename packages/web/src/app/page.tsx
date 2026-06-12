import LandingProductPreview from '@/components/landing/LandingProductPreview'
import '@/components/landing/public-auth.css'
import LandingHeroBackdrop from '@/components/landing/LandingHeroBackdrop'
import LandingPublicFooter from '@/components/landing/LandingPublicFooter'
import LandingSignupBlock from '@/components/landing/LandingSignupBlock'
import LandingTrustPillRow from '@/components/landing/LandingTrustPillRow'
import MobilePublicNav from '@/components/landing/MobilePublicNav'
import PublicNav from '@/components/landing/PublicNav'
import { LANDING_SUPPORTING_COPY } from '@/components/landing/landing-content'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useSearchParams } from 'react-router-dom'
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
    <div className={loginTab ? 'public-page public-page--login-focus' : 'public-page'}>
      <PublicNav />
      <MobilePublicNav />

      <section className="hero-section">
        <LandingHeroBackdrop />
        <div className="public-container hero-grid">
          <div className="hero-copy pub-animate">
            <p className="hero-eyebrow">18+ • COMMUNITY • CONSENT-CENTERED • PRIVACY-FIRST</p>
            <h1 className="hero-title">
              Friends, Events,
              <span>Conventions &amp; Education.</span>
            </h1>
            <p className="hero-tagline">Build community. Organize events. Make friends.</p>
            <p className="hero-body">{LANDING_SUPPORTING_COPY}</p>
            <LandingTrustPillRow />
          </div>

          <div id="auth" className="auth-column scroll-mt-24 pub-animate pub-animate-delay-1">
            <LandingSignupBlock {...signupProps} />
          </div>
        </div>
      </section>

      <LandingProductPreview />

      <LandingPublicFooter />
    </div>
  )
}
