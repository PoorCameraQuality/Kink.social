'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/discovery', label: 'Explore', icon: ExploreIcon },
  { href: '#create', label: 'Create', icon: CreateIcon, isCreate: true },
  { href: '/messaging', label: 'Messages', icon: MessagesIcon },
  { href: '/profile', label: 'Profile', icon: ProfileIcon },
] as const

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ExploreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function CreateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function MessagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-c2k-bg-card/95 backdrop-blur-md border-t border-white/10 safe-area-pb"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isCreate = 'isCreate' in item && item.isCreate
          const isActive = isCreate
            ? false
            : pathname === item.href ||
              (item.href === '/home' && (pathname === '/' || pathname === '/feed' || pathname === '/home'))
          const Icon = item.icon

          if (isCreate) {
            return (
              <button
                key={item.label}
                type="button"
                data-create-trigger
                className="flex flex-col items-center justify-center w-14 h-14 -mt-4 rounded-full bg-c2k-accent-primary text-white shadow-lg hover:bg-c2k-accent-primary-hover transition-colors"
                aria-label="Create"
              >
                <Icon className="w-6 h-6" />
              </button>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 ${
                isActive ? 'text-c2k-accent-primary font-semibold' : 'text-c2k-text-muted hover:text-white'
              } transition-colors`}
            >
              <Icon className="w-6 h-6" />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
