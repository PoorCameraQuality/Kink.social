'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site.config'
import { useAuth } from '@/contexts/AuthContext'

/** Mock counts for icon badges */
const MOCK_MAILBOX_COUNT = 1
const MOCK_NOTIFICATIONS_COUNT = 3

export default function Header() {
  const { status, viewerUsername, isAuthenticated, isFallback, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const showAppNav = status === 'loading' || viewerUsername.length > 0

  return (
    <header className="sticky top-0 z-50 bg-c2k-bg-elevated/95 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 h-16">
          {/* Logo - left */}
          <Link
            href={showAppNav ? '/home' : '/'}
            className="flex items-center gap-2 text-white font-display font-bold text-lg tracking-tight hover:text-c2k-accent-primary transition-colors flex-shrink-0"
          >
            <span className="text-c2k-accent-primary">{siteConfig.logoAcronym}</span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </Link>

          {/* Search bar - center, dominant (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-c2k-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search events, people, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-c2k-bg-card border border-white/10 rounded-lg text-white placeholder-c2k-text-muted text-sm focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none"
                aria-label="Search"
              />
            </div>
          </div>

          {/* Right actions: Create | Messages | Notifications | Profile */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {showAppNav ? (
              <>
                <button
                  type="button"
                  data-create-trigger
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover text-white text-sm font-medium transition-colors"
                  aria-label="Create"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden lg:inline">Create</span>
                </button>
                <Link
                  href="/discovery"
                  className="md:hidden p-2 text-c2k-text-secondary hover:text-white rounded-lg"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
                <Link
                  href="/notifications"
                  className="relative p-2 text-c2k-text-secondary hover:text-white rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {MOCK_NOTIFICATIONS_COUNT > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-c2k-danger text-white rounded-full">
                      {MOCK_NOTIFICATIONS_COUNT > 99 ? '99+' : MOCK_NOTIFICATIONS_COUNT}
                    </span>
                  )}
                </Link>
                <Link
                  href="/messaging"
                  className="relative p-2 text-c2k-text-secondary hover:text-white rounded-lg transition-colors"
                  aria-label="Messages"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {MOCK_MAILBOX_COUNT > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-c2k-danger text-white rounded-full">
                      {MOCK_MAILBOX_COUNT > 99 ? '99+' : MOCK_MAILBOX_COUNT}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full bg-c2k-bg hover:ring-2 hover:ring-c2k-accent-primary/50 transition-colors"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-c2k-accent-primary/30 flex items-center justify-center text-c2k-accent-primary text-sm font-medium">
                      ?
                    </div>
                  </button>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" aria-hidden onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-c2k-bg-card border border-white/10 rounded-xl shadow-c2k-soft z-50">
                        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{viewerUsername || 'Guest'}</p>
                            {isFallback && !isAuthenticated && (
                              <p className="text-xs text-c2k-text-muted">Demo viewer (not signed in)</p>
                            )}
                            <Link href="/profile" className="text-sm text-c2k-accent-primary hover:underline" onClick={() => setIsProfileOpen(false)}>
                              view profile
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileOpen(false)
                              void logout()
                            }}
                            className="text-sm text-c2k-text-muted hover:text-white"
                          >
                            log out
                          </button>
                        </div>
                        <div className="px-4 py-2 border-b border-white/10 space-y-1">
                          <Link href="/discovery?view=me" className="block text-sm text-c2k-text-secondary hover:text-white" onClick={() => setIsProfileOpen(false)}>
                            Who checked me out?
                          </Link>
                          <Link href="/events" className="flex items-center justify-between text-sm text-c2k-text-secondary hover:text-white" onClick={() => setIsProfileOpen(false)}>
                            Upcoming Events
                            <span className="text-c2k-accent-primary font-medium">5</span>
                          </Link>
                        </div>
                        <div className="px-4 py-2 space-y-1">
                          <Link href="/profile/edit" className="block text-sm text-c2k-text-secondary hover:text-white" onClick={() => setIsProfileOpen(false)}>
                            Edit Profile
                          </Link>
                          <Link href="/settings" className="block text-sm text-c2k-text-secondary hover:text-white" onClick={() => setIsProfileOpen(false)}>
                            Account Settings
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-c2k-text-secondary hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/" className="inline-flex px-4 py-2 text-sm font-medium bg-c2k-accent-primary hover:bg-c2k-accent-primary-hover text-white rounded-lg transition-colors">
                  Sign Up
                </Link>
              </>
            )}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-c2k-text-secondary hover:text-white hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - nav links when hamburger open */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-fade-in">
            <nav className="flex flex-col gap-1">
              <Link href="/home" className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/home' ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'}`} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/discovery" className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/discovery' ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'}`} onClick={() => setIsMenuOpen(false)}>
                Explore
              </Link>
              <Link href="/events" className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/events' ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'}`} onClick={() => setIsMenuOpen(false)}>
                Events
              </Link>
              <Link href="/groups" className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/groups' ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'}`} onClick={() => setIsMenuOpen(false)}>
                Groups
              </Link>
              <Link href="/vendors" className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/vendors' ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'}`} onClick={() => setIsMenuOpen(false)}>
                Vendors
              </Link>
              <Link href="/education" className={`px-4 py-3 rounded-lg text-sm font-medium ${pathname === '/education' ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'}`} onClick={() => setIsMenuOpen(false)}>
                Education
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
