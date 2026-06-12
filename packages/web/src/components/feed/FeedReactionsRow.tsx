import {
  IconHelpful,
  IconLove,
  IconRespect,
  IconSympathize,
} from '@/components/feed/FeedInteractionIcons'
import { FEED_REACTION_IDS, FEED_REACTION_LABELS, type FeedReactionId } from '@c2k/shared'
import type { FeedReactionCounts } from '@/hooks/useFeedPostReactions'

type ReactionDef = {
  id: FeedReactionId
  label: string
  title: string
  hint: string
  Icon: typeof IconLove
}

const REACTIONS: ReactionDef[] = [
  { id: 'love', label: FEED_REACTION_LABELS.love, title: 'Love', hint: 'Show you love this post', Icon: IconLove },
  { id: 'respect', label: FEED_REACTION_LABELS.respect, title: 'Respect', hint: 'Acknowledge their perspective', Icon: IconRespect },
  { id: 'sympathize', label: FEED_REACTION_LABELS.sympathize, title: 'Sympathize', hint: 'Offer empathy or support', Icon: IconSympathize },
  { id: 'helpful', label: FEED_REACTION_LABELS.helpful, title: 'Helpful', hint: 'Mark this as useful', Icon: IconHelpful },
]

type Props = {
  reactionCounts: FeedReactionCounts
  viewerReaction: FeedReactionId | null
  busy?: boolean
  disabled?: boolean
  compact?: boolean
  onReaction: (kind: FeedReactionId) => void
}

export default function FeedReactionsRow({
  reactionCounts,
  viewerReaction,
  busy,
  disabled,
  compact = false,
  onReaction,
}: Props) {
  return (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-0.5' : 'gap-1'}`} role="group" aria-label="Reactions">
      {REACTIONS.map(({ id, label, title, hint, Icon }) => {
        const active = viewerReaction === id
        const count = reactionCounts[id] ?? 0
        const isDisabled = disabled || busy
        const tooltip = active ? `Remove ${title}` : `${title} — ${hint}`

        return (
          <button
            key={id}
            type="button"
            disabled={isDisabled}
            onClick={() => onReaction(id)}
            title={tooltip}
            aria-label={`${label}. ${hint}${count > 0 ? `. ${count} reactions` : ''}`}
            aria-pressed={active}
            className={`inline-flex items-center justify-center gap-1 rounded-full font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${
              compact ? 'min-h-11 min-w-[44px] px-3 py-2 text-xs' : 'min-h-11 min-w-[44px] px-3 py-2 text-xs'
            } ${
              active ?
                'bg-dc-accent-muted text-dc-accent'
              : 'text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className={compact ? 'leading-none' : 'hidden sm:inline'}>{label}</span>
            {count > 0 ?
              <span className={`tabular-nums opacity-80 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{count}</span>
            : null}
          </button>
        )
      })}
    </div>
  )
}

export type { FeedReactionId }
export { FEED_REACTION_IDS }
