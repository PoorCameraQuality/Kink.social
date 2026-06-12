import { Link } from 'react-router-dom'
import SiteWordmark from '@/components/brand/SiteWordmark'

export default function MobilePublicNav() {
  return (
    <header className="mobile-public-nav pub-animate" aria-label="Site mobile">
      <Link to="/" className="inline-flex min-h-touch min-w-touch items-center">
        <SiteWordmark className="text-base font-bold tracking-tight text-[var(--pub-gold-bright)]" />
      </Link>
    </header>
  )
}
