type MediaItem = {
  url: string
  alt?: string
}

type Props = {
  items: MediaItem[]
  /** Max thumbnails in the strip. */
  limit?: number
  className?: string
}

/** Horizontal thumbnail strip for aggregated media activity. */
export default function FeedMediaStrip({ items, limit = 6, className = '' }: Props) {
  const visible = items.slice(0, limit)
  if (visible.length === 0) return null
  const overflow = items.length - visible.length

  return (
    <div className={`feed-media-strip ${className}`.trim()} aria-label="Media preview">
      {visible.map((item) => (
        <div key={item.url} className="feed-media-strip__thumb">
          <img src={item.url} alt={item.alt ?? ''} loading="lazy" decoding="async" />
        </div>
      ))}
      {overflow > 0 ?
        <div className="feed-media-strip__more" aria-hidden>
          +{overflow}
        </div>
      : null}
    </div>
  )
}
