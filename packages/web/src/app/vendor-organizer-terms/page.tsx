import LegalDraftPage from '@/components/ui/LegalDraftPage'

const legalPublished = import.meta.env.VITE_LEGAL_PUBLISHED === 'true'

export default function VendorOrganizerTermsPage() {
  return (
    <LegalDraftPage
      published={legalPublished}
      effectiveDate={legalPublished ? 'June 5, 2026' : undefined}
      title="Vendor & Organizer Terms"
      intro="These terms apply if you organize events, run conventions, or list as a vendor or presenter on Kink Social. They supplement our Terms of Service and Event Guidelines."
      relatedLinks={[
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Event guidelines', href: '/policies/events' },
        { label: 'Community guidelines', href: '/guidelines' },
      ]}
      sections={[
        {
          id: 'organizers',
          title: 'Organizers',
          body: (
            <>
              <p>You are responsible for:</p>
              <ul>
                <li>Event safety and on-site staffing appropriate to what you advertise.</li>
                <li>Venue rules and compliance with local law.</li>
                <li>Attendee communications about schedules, policy changes, and safety information.</li>
              </ul>
              <p className="mt-3">
                If you use Kink Social software for registration, door check-in, messaging, or other event operations, attendee
                and registration data may be used <strong className="text-dc-text">only to run that event</strong>. You
                may not sell it, share it with third parties, export it for unrelated marketing, or use it for any purpose
                outside the event it was collected for.
              </p>
              <p className="mt-2">
                Do not share attendee lists outside of Kink Social. Keep roster and check-in information inside the platform
                unless you have a separate lawful basis and explicit consent where required.
              </p>
            </>
          ),
        },
        {
          id: 'payments',
          title: 'Payments (alpha)',
          body: (
            <p>
              Payment processing is <strong className="text-dc-text">not enabled during alpha</strong>. Ticket sales,
              paid admission, and in-platform checkout are not available yet. Organizers handle paid admission offline
              until we launch payment features. Stay tuned for updates when we are ready to support payments safely and
              in compliance with applicable law.
            </p>
          ),
        },
        {
          id: 'vendors',
          title: 'Vendors & presenters',
          body: (
            <>
              <ul>
                <li>
                  Keep directory listings accurate. Do not impersonate other businesses, presenters, or artists.
                </li>
                <li>
                  Commission arrangements and shop links must comply with applicable commercial and tax laws in the
                  jurisdictions where you operate.
                </li>
                <li>
                  If you vend in the United States, products offered through your Kink Social shop or linked storefront should be
                  lawful to sell as retail goods in the U.S. Do not list illegal items, prohibited weapons, or other
                  goods that violate federal or state law.
                </li>
                <li>
                  Content you upload to Kink Social remains subject to our Community Guidelines and copyright rules, even when
                  you import listings, images, or descriptions from a third-party shop such as Etsy or Shopify. You are
                  responsible for rights to use and sell what you display.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'data',
          title: 'Integrations & attendee data',
          body: (
            <>
              <p>
                Do not route attendee or registration data through unapproved third-party tools. Email, storage, and
                other subprocessors used in production must be documented in our vendor registry when that process is
                required for your deployment.
              </p>
              <p className="mt-2">
                Plugging unregistered vendors into attendee data flows without authorization may result in loss of
                organizer tools or removal from the platform.
              </p>
            </>
          ),
        },
        {
          id: 'enforcement',
          title: 'Enforcement',
          body: (
            <p>
              Violations of these terms may lead to restricted features, delisted events, or removal of your organization
              or vendor profile. See our <a href="/policies/events">Event Guidelines</a> for how repeated safety issues
              are handled.
            </p>
          ),
        },
        {
          id: 'not-legal-advice',
          title: 'Not legal advice',
          body: (
            <p>
              These terms are alpha copy and may change after counsel review. They are not legal advice about commerce,
              tax, or event liability in your jurisdiction.
            </p>
          ),
        },
      ]}
    />
  )
}
