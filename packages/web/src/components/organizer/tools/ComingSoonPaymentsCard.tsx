import { ToolsSection } from '@/components/organizer/tools/tools-ui'
import Badge from '@/components/ui/Badge'

export default function ComingSoonPaymentsCard() {
  return (
    <ToolsSection className="border-dc-border/60 bg-dc-surface/15 opacity-95">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-dc-text-muted">Ticketing & payments</h3>
        <Badge variant="neutral">Coming soon</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-dc-text-muted">
        Ticketing, native checkout, and vendor payouts are not active yet. Use external ticket URLs on individual events
        or convention settings for now.
      </p>
      <a href="/support" className="mt-4 inline-block text-sm font-medium text-dc-accent hover:underline">
        Learn about external ticket URLs →
      </a>
    </ToolsSection>
  )
}
