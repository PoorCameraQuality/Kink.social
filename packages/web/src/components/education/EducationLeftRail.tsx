import { Link, useLocation, useSearchParams } from 'react-router-dom'

import { resolveEducationNavMatch, type EducationNavMatch } from '@/lib/education-section-mode'



const NAV: ReadonlyArray<{

  href: string

  label: string

  match: EducationNavMatch

  soon?: boolean

}> = [

  { href: '/education', label: 'Overview', match: 'overview' },

  { href: '/education?view=paths', label: 'Learning paths', match: 'paths' },

  { href: '/education?view=articles', label: 'Articles', match: 'articles' },

  { href: '/media?format=video', label: 'Videos', match: 'videos' },

  { href: '/media?format=podcast', label: 'Podcasts', match: 'podcasts' },

  { href: '/education?view=library', label: 'Class library', match: 'library', soon: true },

  { href: '/saved', label: 'Saved', match: 'saved' },

  { href: '/education?view=progress', label: 'My progress', match: 'progress', soon: true },

  { href: '/education?view=notes', label: 'Notes', match: 'notes', soon: true },

]



const FEATURED_TOPICS = [

  { icon: '🛡️', label: 'Safety', count: 48, filter: 'Safety' },

  { icon: '🪢', label: 'Rope', count: 36, filter: 'Gear' },

  { icon: '🧠', label: 'Psychology', count: 29, filter: 'Psychology' },

  { icon: '👑', label: 'Dominance', count: 22, filter: 'Advanced' },

  { icon: '🤝', label: 'Consent', count: 41, filter: 'Beginner' },

  { icon: '⚡', label: 'Dynamics', count: 18, filter: 'Event Etiquette' },

] as const



type Props = {

  selectedCategory: string | null

  onCategoryChange: (cat: string | null) => void

  onBrowseTopics: () => void

}



export default function EducationLeftRail({ selectedCategory, onCategoryChange, onBrowseTopics }: Props) {

  const { pathname, search } = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()

  const current = resolveEducationNavMatch(pathname, search)

  const onArticlesNav = () => {

    if (pathname === '/education' && searchParams.get('view') === 'articles') {

      onBrowseTopics()

      return

    }

  }



  return (

    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Education navigation">

      <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">

        <nav aria-label="Education sections">

          <ul className="space-y-0.5 border-b border-dc-border pb-4">

            {NAV.map((item) => {

              const active = item.match === current

              const isArticles = item.match === 'articles'

              return (

                <li key={item.href}>

                  <Link

                    to={item.href}

                    onClick={isArticles ? onArticlesNav : undefined}

                    className={`flex min-h-10 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${

                      active ?

                        'bg-dc-accent-muted text-dc-accent'

                      : 'text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text'

                    }`}

                  >

                    <span>{item.label}</span>

                    {item.soon ?

                      <span className="shrink-0 rounded-md border border-dc-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-dc-muted">

                        Soon

                      </span>

                    : null}

                  </Link>

                </li>

              )

            })}

          </ul>

        </nav>

      </div>



      <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">
        <h3 className="mb-2 text-sm font-semibold text-dc-text">My Learning</h3>
        <p className="text-xs leading-relaxed text-dc-muted">
          Account progress and resume-in-place are not wired yet. Browse{' '}
          <Link to="/education?view=paths" className="font-medium text-dc-accent hover:underline">
            learning paths
          </Link>{' '}
          or saved articles on{' '}
          <Link to="/saved" className="font-medium text-dc-accent hover:underline">
            Saved
          </Link>
          .
        </p>
      </div>



      <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">

        <h3 className="mb-3 text-sm font-semibold text-dc-text">Featured Topics</h3>

        <ul className="space-y-2 text-sm">

          {FEATURED_TOPICS.map((topic) => {

            const pressed = selectedCategory === topic.filter

            return (

              <li key={topic.label}>

                <button

                  type="button"

                  aria-pressed={pressed}

                  onClick={() => {

                    const next = pressed ? null : topic.filter

                    onCategoryChange(next)

                    if (pathname !== '/education' || searchParams.get('view') !== 'articles') {

                      setSearchParams({ view: 'articles' }, { replace: false })

                    }

                    onBrowseTopics()

                  }}

                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${

                    pressed ?

                      'bg-dc-accent-muted text-dc-accent'

                    : 'text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text'

                  }`}

                >

                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden>{topic.icon}</span>
                    <span>{topic.label}</span>
                  </span>

                </button>

              </li>

            )

          })}

        </ul>

      </div>

    </aside>

  )

}


