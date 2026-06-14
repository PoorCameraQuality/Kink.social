import HomeFeedShellComposer from '@/components/home/HomeFeedShellComposer'
import { useMaxMd } from '@/hooks/useMaxMd'

type Props = {
  viewerUsername: string
  viewerInitial: string
  useDbComposer: boolean
  composerPlaceholder: string
  onPosted: () => void
  compact?: boolean
}

export default function HomeMobileComposer({
  viewerUsername,
  viewerInitial,
  useDbComposer,
  composerPlaceholder,
  onPosted,
  compact = false,
}: Props) {
  const isMobile = useMaxMd()

  return (
    <section
      id="home-feed-composer"
      className={`scroll-mt-24 dc-rail-card rounded-2xl border border-dc-border/80 bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)] ${compact ? 'mb-2 p-2.5' : 'mb-2.5 p-3'}`}
      aria-label="Share with the community"
    >
      <h2 className={`font-semibold text-dc-text ${compact ? 'sr-only' : 'mb-2.5 text-sm'}`}>Share with the community</h2>
      <HomeFeedShellComposer
        viewerUsername={viewerUsername}
        viewerInitial={viewerInitial}
        useDbComposer={useDbComposer}
        composerPlaceholder={composerPlaceholder}
        onPosted={onPosted}
        shell={isMobile ? 'mobile' : 'desktop'}
      />
    </section>
  )
}
