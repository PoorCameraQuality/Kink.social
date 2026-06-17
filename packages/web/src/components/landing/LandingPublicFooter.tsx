import { Link } from 'react-router-dom'
import SiteWordmark from '@/components/brand/SiteWordmark'
import { siteConfig } from '@/config/site.config'

const legalFooterLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/guidelines', label: 'Guidelines' },
  { href: '/policies', label: 'All policies' },
] as const

type Props = {
  compact?: boolean
}

export default function LandingPublicFooter({ compact = false }: Props) {
  return (
    <footer className={`landing-public-footer${compact ? ' landing-public-footer--compact' : ''}`}>
      <div className="public-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">
              <SiteWordmark className="text-lg font-bold text-[var(--pub-gold-bright)]" />
            </div>
            <p className="landing-footer-tagline">
              {siteConfig.description}
              <span className="landing-footer-age">18+ adults only</span>
            </p>
          </div>

          <div className="footer-link-col">
            <h3 className="footer-link-heading">Legal</h3>
            <ul className="footer-link-list">
              {legalFooterLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
