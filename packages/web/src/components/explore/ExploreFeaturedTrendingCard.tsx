import { Link } from 'react-router-dom'
import type { TrendingItemCardModel } from '@/components/home/TrendingItemCard'
import MediaSurfaceFallback from '@/components/ui/MediaSurfaceFallback'
import { demoMockImageUrl } from '@/data/mock-data'
import { trendingKindLabel } from '@/lib/explore-hub'

type Props = {
  item: TrendingItemCardModel
}

/** Compact featured trending pick — prominent but not a full-width hero. */
export default function ExploreFeaturedTrendingCard({ item }: Props) {
  const thumb = item.imageUrl ?? demoMockImageUrl(`trend-featured-${item.kind}-${item.id}`, 112, 80)

  return (
    <Link to={item.href} className="xpl-featured-card group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent">
      <div className="xpl-featured-card__media">
        {thumb ?
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
            loading="lazy"
          />
        : <MediaSurfaceFallback variant="generic" className="h-full min-h-0 rounded-none" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-dc-accent sm:text-xs">{trendingKindLabel(item.kind)}</p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-dc-text sm:text-base">{item.title}</p>
        {item.subtitle ?
          <p className="mt-0.5 line-clamp-1 text-xs text-dc-text-muted">{item.subtitle}</p>
        : null}
      </div>
    </Link>
  )
}
