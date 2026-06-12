/** Routes where the member bottom nav should not appear (focused flows). */
export function suppressMobileBottomNav(pathname: string): boolean {
  if (pathname.startsWith('/onboarding')) return true
  if (pathname.startsWith('/profile/edit')) return true
  if (pathname.endsWith('/door')) return true
  return false
}

/** Main `#main-content` padding class for mobile bottom clearance. */
export function mobileMainPadClass(pathname: string, showCreateFab: boolean): string {
  if (pathname.endsWith('/door')) return 'pb-0'
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/profile/edit')) {
    return 'c2k-onboarding-no-bottom-nav'
  }
  return showCreateFab ? 'c2k-main-mobile-pb' : 'c2k-mobile-nav-pb'
}
