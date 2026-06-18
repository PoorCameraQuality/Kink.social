import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type SettingsTabId =
  | 'account'
  | 'profile'
  | 'privacy'
  | 'notifications'
  | 'activity'
  | 'muted'
  | 'blocked'
  | 'payment-history'
  | 'trust'
  | 'ecosystem'
  | 'vendor'

const TABS: { id: SettingsTabId; label: string; path: string }[] = [
  { id: 'account', label: 'Account', path: '/settings/account' },
  { id: 'profile', label: 'Profile', path: '/settings/profile' },
  { id: 'privacy', label: 'Privacy', path: '/settings/privacy' },
  { id: 'notifications', label: 'Notifications', path: '/settings/notifications' },
  { id: 'activity', label: 'Activity feed', path: '/settings/activity' },
  { id: 'muted', label: 'Muted', path: '/settings/muted' },
  { id: 'blocked', label: 'Blocked', path: '/settings/blocked' },
  { id: 'payment-history', label: 'Event access', path: '/settings/payment-history' },
  { id: 'trust', label: 'Trust & standing', path: '/settings/trust' },
  { id: 'ecosystem', label: 'Presenter & roles', path: '/settings/ecosystem' },
  { id: 'vendor', label: 'Vendor shop', path: '/settings/vendor' },
]

export default function SettingsTabNav() {
  return (
    <nav aria-label="Settings sections" className="lg:mb-0">
      <ul
        className={cn(
          'flex gap-1 overflow-x-auto pb-1 c2k-no-scrollbar',
          'lg:w-44 lg:shrink-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0',
        )}
      >
        {TABS.map((tab) => (
          <li key={tab.id} className="shrink-0 lg:shrink">
            <NavLink
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ?
                    'bg-dc-elevated-muted text-dc-text'
                  : 'text-dc-muted hover:bg-dc-elevated/60 hover:text-dc-text',
                )
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { TABS }
