import { Link } from 'react-router-dom'
import SiteWordmark from '@/components/brand/SiteWordmark'

type Props = {
  minimal?: boolean
  loginFocus?: boolean
}

export default function PublicNav({ minimal = false }: Props) {
  return (
    <div className="public-nav-wrap public-container pub-animate">
      <header className={`public-nav${minimal ? ' public-nav--minimal' : ''}`} aria-label="Site">
        <Link to="/" className="public-nav__brand">
          <SiteWordmark className="text-base font-semibold tracking-tight text-[var(--pub-text)] sm:text-lg" />
        </Link>
      </header>
    </div>
  )
}
