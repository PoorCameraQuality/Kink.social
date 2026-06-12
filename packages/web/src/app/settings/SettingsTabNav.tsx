import { NavLink } from 'react-router-dom'

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
    <nav aria-label="Settings sections" className="mb-8 flex flex-col sm:flex-row gap-6">
      <ul className="sm:w-44 shrink-0 space-y-1">
        {TABS.map((tab) => (
          <li key={tab.id}>
            <NavLink
              to={tab.path}
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ?
                    'bg-dc-elevated-muted text-dc-text'
                  : 'text-dc-muted hover:text-dc-text hover:bg-dc-elevated/60'
                }`
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
