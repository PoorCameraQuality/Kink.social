import Link from 'next/link'
import PlaceholderPanel from '@/components/ui/PlaceholderPanel'

type Cta = { label: string; href: string }

/**
 * Consistent “coming soon” shell for placeholder routes (audit §4.4 / §4.6).
 */
export default function ComingSoonLayout({
  heading,
  body,
  primaryCta = { label: 'Browse events', href: '/events' },
  secondaryCta = { label: 'Back to home', href: '/home' },
}: {
  heading: string
  body: string
  primaryCta?: Cta | null
  secondaryCta?: Cta | null
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">{heading}</h1>
      <PlaceholderPanel title="Coming soon" description={body}>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-c2k-accent-primary px-4 text-sm font-medium text-white hover:bg-c2k-accent-primary-hover"
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-c2k-bg-elevated px-4 text-sm font-medium text-c2k-text-secondary hover:text-white"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </PlaceholderPanel>
    </div>
  )
}
