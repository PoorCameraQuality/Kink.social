import { Outlet, useLocation } from 'react-router-dom'
import AppProviders from '@/components/AppProviders'
import AppRobotsMeta from '@/components/seo/AppRobotsMeta'
import OnboardingGate from '@/components/onboarding/OnboardingGate'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/BottomNav'
import CreateFlowModal from '@/components/CreateFlowModal'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import CommunityNavBar from '@/components/CommunityNavBar'
import MockDataBanner from '@/components/MockDataBanner'
import RouteNavigationPending from '@/components/RouteNavigationPending'
import AppShell from '@/components/shell/AppShell'
import CreateFab from '@/components/shell/CreateFab'
import CreateSheet from '@/components/shell/CreateSheet'
import { CreateSheetProvider } from '@/contexts/CreateSheetContext'
import { useAuth } from '@/contexts/AuthContext'
import { hideMarketingFooterOnMobile } from '@/lib/community-nav'
import { hideMockDataBannerForPath } from '@/lib/focused-personal-shell'
import { isTierAAppShellRoute, showCreateFabForPath } from '@/lib/app-shell-routes'
import { mobileMainPadClass, suppressMobileBottomNav } from '@/lib/mobile-chrome'
import { useMaxMd } from '@/hooks/useMaxMd'

/** Must render under `AppProviders` / `AuthProvider` - see `RootLayout`. */
function RootLayoutInner() {
  const { pathname } = useLocation()
  const { isAuthenticated, isFallback } = useAuth()
  const maxMd = useMaxMd()
  const showMemberChrome = isAuthenticated && !isFallback
  const hideFooterMobile = hideMarketingFooterOnMobile(pathname)
  const hideMarketingFooter = showMemberChrome
  const suppressBottomNav = suppressMobileBottomNav(pathname)
  const useAppShell = showMemberChrome && isTierAAppShellRoute(pathname)
  const showMobileChrome = maxMd
  const showCreateFab =
    showMobileChrome && showMemberChrome && showCreateFabForPath(pathname) && !suppressBottomNav

  const mainMobilePadClass = showMemberChrome ? mobileMainPadClass(pathname, showCreateFab) : 'pb-0'

  const pageContent = (
    <AuthGate>
      <OnboardingGate>
        {useAppShell ?
          <AppShell>
            <Outlet />
          </AppShell>
        : <Outlet />}
      </OnboardingGate>
    </AuthGate>
  )

  return (
    <>
      <AppRobotsMeta />
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[500] -translate-y-[200%] rounded-lg bg-dc-accent px-4 py-2 text-sm font-medium text-dc-accent-foreground shadow-[var(--dc-shadow-soft)] outline-none ring-2 ring-dc-surface ring-offset-2 ring-offset-dc-accent transition-transform focus-visible:translate-y-0"
      >
        Skip to main content
      </a>
      {showMemberChrome ? <Header /> : null}
      <RouteNavigationPending />
      <CommunityNavBar />
      {!hideMockDataBannerForPath(pathname) ? <MockDataBanner /> : null}
      <main
        id="main-content"
        className={`min-h-screen min-w-0 overflow-x-hidden md:pb-0 ${mainMobilePadClass}`}
      >
        {pageContent}
      </main>
      {hideMarketingFooter || pathname === '/' ? null : (
        <div className={hideFooterMobile ? 'hidden md:block' : undefined}>
          <Footer />
        </div>
      )}
      <CreateFab show={showCreateFab} />
      <CreateSheet />
      {showMobileChrome && !suppressBottomNav ? <BottomNav /> : null}
      <CreateFlowModal />
    </>
  )
}

export default function RootLayout() {
  return (
    <AppProviders>
      <CreateSheetProvider>
        <RootLayoutInner />
      </CreateSheetProvider>
    </AppProviders>
  )
}
