export type EducationHubView =
  | 'overview'
  | 'paths'
  | 'articles'
  | 'library'
  | 'progress'
  | 'notes'

export type EducationNavMatch = EducationHubView | 'videos' | 'podcasts' | 'saved'

const VALID_VIEWS: ReadonlySet<string> = new Set([
  'overview',
  'paths',
  'articles',
  'library',
  'progress',
  'notes',
])

export function parseEducationHubView(params: URLSearchParams): EducationHubView {
  const view = params.get('view')
  if (view && VALID_VIEWS.has(view) && view !== 'overview') {
    return view as EducationHubView
  }
  return 'overview'
}

export function resolveEducationNavMatch(pathname: string, search: string): EducationNavMatch {
  if (pathname === '/saved') return 'saved'
  if (pathname !== '/education') return 'overview'
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const view = parseEducationHubView(params)
  return view
}

export const EDUCATION_VIEW_META: Record<
  Exclude<EducationHubView, 'overview'>,
  { title: string; subtitle: string; comingSoon?: boolean }
> = {
  paths: {
    title: 'Learning paths',
    subtitle: 'Curated sequences to build skills step by step. Progress is saved to your account when paths launch.',
  },
  articles: {
    title: 'Articles',
    subtitle: 'In-depth knowledge and real experience from trusted educators.',
  },
  library: {
    title: 'Class library',
    subtitle: 'Workshops, classes, and session outlines from educators. Coming after alpha.',
    comingSoon: true,
  },
  progress: {
    title: 'My progress',
    subtitle: 'Track paths, completions, and saved lessons in one place.',
    comingSoon: true,
  },
  notes: {
    title: 'Notes',
    subtitle: 'Private study notes tied to articles and paths.',
    comingSoon: true,
  },
}
