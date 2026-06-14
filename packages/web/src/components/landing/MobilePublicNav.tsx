import { Link } from 'react-router-dom'
import SiteWordmark from '@/components/brand/SiteWordmark'

type Props = {
  minimal?: boolean
  loginFocus?: boolean
}

export default function MobilePublicNav({ minimal = false }: Props) {
  return (
    <header className={`mobile-public-nav${minimal ? ' mobile-public-nav--minimal' : ''} pub-animate`} aria-label="Site mobile">
      <Link to="/" className="inline-flex min-h-touch min-w-touch items-center">
        <SiteWordmark className="text-base font-semibold tracking-tight text-[var(--pub-text)]" />
      </Link>
    </header>
  )
}
