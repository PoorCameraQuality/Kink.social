import type { PresenterOnboardingTrack } from '@/lib/presenter-focus'
import { PRESENTER_TRACK_LABELS } from '@/lib/presenter-focus'

const TRACK_CARDS: {
  track: PresenterOnboardingTrack
  title: string
  description: string
}[] = [
  {
    track: 'educator',
    title: 'Educator or instructor',
    description:
      'For people who teach classes, workshops, skills, consent, safety, technique, or community education.',
  },
  {
    track: 'speaker',
    title: 'Presenter, speaker, or panelist',
    description:
      'For people who give talks, facilitate discussions, appear on panels, demo with others, or present at events.',
  },
  {
    track: 'author',
    title: 'Author or writer',
    description:
      'For people who publish guides, essays, education articles, interviews, or written resources.',
  },
  {
    track: 'photographer',
    title: 'Photographer or media creator',
    description:
      'For people offering event photography, portraits, media work, documentation, or visual storytelling.',
  },
  {
    track: 'hybrid',
    title: 'Hybrid profile',
    description: 'For people who do more than one of these.',
  },
]

type Props = {
  selected: PresenterOnboardingTrack | null
  onSelect: (track: PresenterOnboardingTrack) => void
  onContinue: () => void
}

export default function PresenterTrackChooser({ selected, onSelect, onContinue }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-dc-text">What kind of profile are you setting up?</h2>
        <p className="mt-2 text-sm text-dc-text-muted">
          Choose the profile type that best fits how you want organizers and community members to find you.
        </p>
      </div>
      <div className="grid gap-3" role="radiogroup" aria-label="Profile type">
        {TRACK_CARDS.map((card) => {
          const isSelected = selected === card.track
          return (
            <button
              key={card.track}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(card.track)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                isSelected ?
                  'border-dc-accent bg-dc-accent/10 ring-2 ring-dc-accent/30'
                : 'border-dc-border bg-dc-elevated-solid hover:border-dc-accent/40'
              }`}
            >
              <p className="font-medium text-dc-text">{card.title}</p>
              <p className="mt-1 text-sm text-dc-text-muted">{card.description}</p>
              {isSelected ?
                <p className="mt-2 text-xs font-medium text-dc-accent" aria-live="polite">
                  Selected · {PRESENTER_TRACK_LABELS[card.track]}
                </p>
              : null}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        disabled={!selected}
        onClick={onContinue}
        className="w-full min-h-11 rounded-xl bg-dc-accent px-4 py-3 font-medium text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}
