import Link from 'next/link'
import { siteConfig } from '@/config/site.config'

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section aria-labelledby={title.toLowerCase().replace(/\s+/g, '-')}>
    <h3
      id={title.toLowerCase().replace(/\s+/g, '-')}
      className="text-sm font-semibold tracking-wide text-c2k-text-primary mb-3"
    >
      {title}
    </h3>
    <ul className="space-y-2">{children}</ul>
  </section>
)

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link
      href={href}
      className="text-c2k-text-secondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c2k-accent-primary rounded"
    >
      {children}
    </Link>
  </li>
)

export default function Footer() {
  return (
    <footer className="bg-c2k-bg-card border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-c2k-accent-primary font-bold text-lg">{siteConfig.logoAcronym}</span>
              <span className="text-c2k-text-secondary font-medium">{siteConfig.name}</span>
            </div>
            <p className="text-sm text-c2k-text-secondary max-w-prose">
              The kink-positive community for events and connection. Find munches, dungeons, and
              like-minded people coast to coast.
            </p>
          </div>

          <nav className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="Footer">
            <Section title="Explore">
              {siteConfig.footer.directory.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </Section>
            <Section title="Community">
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/support">Support</FooterLink>
            </Section>
            <Section title="Legal">
              {siteConfig.footer.legal.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </Section>
          </nav>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-c2k-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <li>
              <Link href="/sitemap.xml" className="text-c2k-text-muted hover:text-c2k-text-secondary">
                Sitemap
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="text-c2k-text-muted hover:text-c2k-text-secondary">
                Accessibility
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
