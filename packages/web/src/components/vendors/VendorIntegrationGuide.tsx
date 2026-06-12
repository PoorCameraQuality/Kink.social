import { Link } from 'react-router-dom'

type Props = {
  shopSlug?: string | null
  compact?: boolean
}

const ROWS = [
  {
    surface: 'Event pages',
    how: 'Org or event staff add your shop as a contributor on the event.',
    action: 'Share your shop slug with the host and ask them to list you under Partners.',
  },
  {
    surface: 'Convention Partners strip',
    how: 'Same contributor list on the convention anchor event.',
    action: 'Register for the con and coordinate with the organizer team.',
  },
  {
    surface: 'Home & discovery rails',
    how: 'Spotlight and in-person vendor rails pull from published shops with synced listings.',
    action: 'Publish your shop and run Sync after connecting Etsy, Shopify, Woo, or a storefront link.',
  },
  {
    surface: 'Org spotlight',
    how: 'Organization admins can feature vendors on their community hub.',
    action: 'Ask an org you work with to add you to their featured vendors list.',
  },
] as const

export default function VendorIntegrationGuide({ shopSlug, compact = false }: Props) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <p className="text-sm text-dc-text-muted">
        Kink Social showcases your catalog and sends buyers to your external checkout. We do not process payments on-platform.
      </p>
      {shopSlug ?
        <p className="text-sm text-dc-text">
          Your shop link:{' '}
          <Link to={`/vendors/${encodeURIComponent(shopSlug)}`} className="text-dc-accent hover:underline">
            /vendors/{shopSlug}
          </Link>
        </p>
      : null}
      <ul className={`divide-y divide-dc-border rounded-xl border border-dc-border ${compact ? '' : 'bg-dc-elevated/40'}`}>
        {ROWS.map((row) => (
          <li key={row.surface} className="px-4 py-3">
            <p className="text-sm font-medium text-dc-text">{row.surface}</p>
            <p className="text-xs text-dc-text-muted mt-0.5">{row.how}</p>
            <p className="text-xs text-dc-muted mt-1">{row.action}</p>
          </li>
        ))}
      </ul>
      {!compact ?
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/vendors" className="text-dc-accent hover:underline">
            Browse vendor directory
          </Link>
          <Link to="/events" className="text-dc-accent hover:underline">
            Find events to vend at
          </Link>
        </div>
      : null}
    </div>
  )
}
