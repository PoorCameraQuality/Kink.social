/** Routes where the member bottom nav should not appear (focused flows). */
export function suppressMobileBottomNav(pathname: string, search?: URLSearchParams | null): boolean {
  if (pathname.startsWith('/onboarding')) return true
  if (pathname.startsWith('/profile/edit')) return true
  if (pathname.endsWith('/door')) return true
  if (
    (pathname === '/messaging' || pathname.startsWith('/messaging/')) &&
    Boolean(search?.get('c')?.trim())
  ) {
    return true
  }
  return false
}

/** Main `#main-content` padding class for mobile bottom clearance. */
export function mobileMainPadClass(pathname: string, showCreateFab: boolean, search?: URLSearchParams | null): string {
  if (pathname.endsWith('/door')) return 'pb-0'
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/profile/edit')) {
    return 'c2k-onboarding-no-bottom-nav'
  }
  if (
    (pathname === '/messaging' || pathname.startsWith('/messaging/')) &&
    Boolean(search?.get('c')?.trim())
  ) {
    return 'pb-0'
  }
  return showCreateFab ? 'c2k-main-mobile-pb' : 'c2k-mobile-nav-pb'
}
