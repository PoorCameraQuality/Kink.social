import { Link } from 'react-router-dom'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import type { ExploreSuggestedItem } from '@/lib/explore-hub'
import { demoMockImageUrl } from '@/data/mock-data'

type Props = {
  item: ExploreSuggestedItem
}

export default function ExploreSuggestedRow({ item }: Props) {
  const thumb =
    item.imageUrl ??
    (item.type === 'Person' ? null : demoMockImageUrl(`suggest-${item.type}-${item.id}`, 64, 64))

  return (
    <li>
      <Link
        to={item.href}
        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-dc-elevated-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent"
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-dc-border bg-dc-elevated-solid">
          {thumb ?
            <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
          : <PlaceholderAvatar size="sm" className="h-10 w-10" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-dc-text truncate">{item.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-dc-muted">{item.type}</p>
          <p className="text-xs text-dc-muted truncate">{item.reason}</p>
        </div>
      </Link>
    </li>
  )
}
