import { Link } from 'react-router-dom'
import type { TrendingItemCardModel } from '@/components/home/TrendingItemCard'
import MediaSurfaceFallback from '@/components/ui/MediaSurfaceFallback'
import { trendingKindLabel } from '@/lib/explore-hub'

type Props = {
  item: TrendingItemCardModel
}

/** Hero-style featured trending card for Explore mobile curation. */
export default function ExploreFeaturedTrendingCard({ item }: Props) {
  const thumb = item.imageUrl ?? null

  return (
    <Link
      to={item.href}
      className="group mb-2 block overflow-hidden rounded-2xl border border-dc-accent-border/30 bg-gradient-to-br from-dc-accent/10 via-dc-elevated-solid to-dc-surface-muted shadow-[var(--dc-shadow-soft)] transition-[border-color,box-shadow] hover:border-dc-accent-border/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent"
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden sm:aspect-[21/9]">
        {thumb ?
          <img src={thumb} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" loading="lazy" />
        : <MediaSurfaceFallback variant="generic" />}
        <div className="absolute inset-0 bg-gradient-to-t from-dc-bg/95 via-dc-bg/35 to-transparent" aria-hidden />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-dc-accent">{trendingKindLabel(item.kind)}</p>
          <p className="mt-0.5 text-[11px] font-medium text-dc-text-muted">Active community signal</p>
          <p className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-dc-text sm:text-lg">{item.title}</p>
          {item.subtitle ?
            <p className="mt-1 line-clamp-1 text-xs text-dc-text-muted sm:text-sm">{item.subtitle}</p>
          : null}
        </div>
      </div>
    </Link>
  )
}
