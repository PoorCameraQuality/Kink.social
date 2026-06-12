import { useCallback, useEffect, useState } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import LoadErrorBanner from '@/components/ui/LoadErrorBanner'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'dungeon_club', label: 'Dungeons & clubs' },
  { value: 'nude_beach', label: 'Nude beaches' },
  { value: 'kink_friendly_hotel', label: 'Kink-friendly hotels' },
  { value: 'web_resource', label: 'Web resources' },
  { value: 'other', label: 'Other' },
] as const

type PlaceRow = {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  city: string | null
  region: string | null
  country: string | null
}

export default function CommunityPlacesBrowse({ initialCategory = '' }: { initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory)
  const [items, setItems] = useState<PlaceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestName, setSuggestName] = useState('')
  const [suggestBusy, setSuggestBusy] = useState(false)
  const [suggestNotice, setSuggestNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = new URLSearchParams()
      if (category) p.set('category', category)
      const r = await fetch(`/api/v1/community-places?${p.toString()}`, { credentials: 'include' })
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        setError(j.error ?? `HTTP ${r.status}`)
        setItems([])
        return
      }
      const data = (await r.json()) as { items: PlaceRow[] }
      setItems(data.items ?? [])
    } catch {
      setError('Failed to load places')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    void load()
  }, [load])

  const submitSuggestion = async () => {
    const name = suggestName.trim()
    if (!name || suggestBusy) return
    setSuggestBusy(true)
    setSuggestNotice(null)
    try {
      const r = await fetch('/api/v1/community-places/suggestions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: category || 'other',
        }),
      })
      if (r.ok) {
        setSuggestName('')
        setSuggestNotice('Thanks. Your suggestion is pending moderation.')
      } else {
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        setSuggestNotice(j.error ?? 'Could not submit suggestion.')
      }
    } catch {
      setSuggestNotice('Network error. Try again.')
    } finally {
      setSuggestBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value || 'all'}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              category === c.value ?
                'bg-dc-accent/15 text-dc-accent border-dc-accent-border/40'
              : 'border-dc-border text-dc-text-muted hover:text-dc-text'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-dc-text-muted rounded-xl border border-dc-border bg-dc-elevated/60 px-4 py-3 max-w-prose">
        Location filters coming soon
      </p>

      {error ? <LoadErrorBanner message={error} onRetry={() => void load()} /> : null}
      {loading ?
        <p className="text-sm text-dc-muted">Loading places…</p>
      : items.length === 0 ?
        <EmptyState inline title="No places yet" message="Be the first to suggest a venue for the community directory." />
      : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((p) => (
            <li key={p.id} className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-4">
              <h3 className="font-semibold text-dc-text">{p.name}</h3>
              <p className="text-xs text-dc-muted mt-1 capitalize">{p.category.replace(/_/g, ' ')}</p>
              {(p.city || p.region || p.country) ?
                <p className="text-sm text-dc-text-muted mt-2">
                  {[p.city, p.region, p.country].filter(Boolean).join(', ')}
                </p>
              : null}
              {p.description ?
                <p className="text-sm text-dc-text-muted mt-2 line-clamp-3">{p.description}</p>
              : null}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl border border-dc-border p-4 space-y-2">
        <h3 className="text-sm font-semibold text-dc-text">Suggest a place</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={suggestName}
            onChange={(e) => setSuggestName(e.target.value)}
            placeholder="Venue name"
            className="flex-1 px-3 py-2 rounded-xl border border-dc-border bg-dc-elevated-solid text-sm"
          />
          <button
            type="button"
            disabled={suggestBusy || !suggestName.trim()}
            onClick={() => void submitSuggestion()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-dc-accent text-dc-accent-foreground disabled:opacity-50"
          >
            {suggestBusy ? 'Sending…' : 'Submit'}
          </button>
        </div>
        {suggestNotice ? <p className="text-sm text-dc-muted">{suggestNotice}</p> : null}
      </div>
    </div>
  )
}
