import { Link } from 'react-router-dom'
import SiteWordmark from '@/components/brand/SiteWordmark'

export default function PublicNav() {
  return (
    <div className="public-nav-wrap public-container pub-animate">
      <header className="public-nav" aria-label="Site">
        <Link to="/" className="flex shrink-0 items-center">
          <SiteWordmark className="text-base font-bold tracking-tight text-[var(--pub-gold-bright)] sm:text-lg" />
        </Link>
      </header>
    </div>
  )
}
