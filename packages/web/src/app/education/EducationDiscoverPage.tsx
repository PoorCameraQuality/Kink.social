import { useCallback, useEffect, useId, useMemo, useState } from 'react'

import { useSearchParams } from 'react-router-dom'



import EducationComingSoonPanel from '@/components/education/EducationComingSoonPanel'

import EducationDiscoverShell from '@/components/education/EducationDiscoverShell'

import EducationDiscoverCenter, { buildStripSectionsFromApi } from '@/components/education/EducationDiscoverCenter'

import EducationLeftRail from '@/components/education/EducationLeftRail'

import EducationPathsPage from '@/components/education/EducationPathsPage'

import EducationRightRail from '@/components/education/EducationRightRail'

import EducationSectionHeader from '@/components/education/EducationSectionHeader'

import { useAuth } from '@/contexts/AuthContext'

import { useApiEducationArticles } from '@/hooks/useApiEducationArticles'

import { useApiPresenters } from '@/hooks/useApiPresenters'

import {

  apiArticleToStrip,

  apiArticleToRecent,

  computeEducationHubStats,

  getMockFeaturedEducators,

  pickRecentFromMock,

  pickTrendingFromMock,

  pickVideosFromMock,

  presenterToFeaturedEducator,

} from '@/lib/education-discover-data'

import { EDUCATION_VIEW_META, parseEducationHubView } from '@/lib/education-section-mode'

import { getMockEducationCatalog } from '@/data/mock-home-surface'



export default function EducationDiscoverPage() {

  const searchId = useId()

  const [searchParams] = useSearchParams()

  const hubView = parseEducationHubView(searchParams)

  const { isAuthenticated } = useAuth()



  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)



  const homeDemoFallbackEnv = import.meta.env.VITE_HOME_DEMO_FALLBACK === 'true'

  const useDemoFallback = homeDemoFallbackEnv && !isAuthenticated



  const articlesApi = useApiEducationArticles({

    category: selectedCategory,

    q: searchQuery.trim() || undefined,

    limit: 36,

    enabled: true,

  })



  const presentersApi = useApiPresenters(!useDemoFallback, { q: '', tag: '', sort: 'popular' })



  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedCategory !== null



  const clearFilters = () => {

    setSearchQuery('')

    setSelectedCategory(null)

  }



  const scrollToTopics = useCallback(() => {

    const el = document.getElementById('education-all-articles')

    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  }, [])



  useEffect(() => {

    if (hubView === 'articles') {

      scrollToTopics()

    } else if (hubView !== 'overview') {

      window.scrollTo({ top: 0, behavior: 'smooth' })

    }

  }, [hubView, scrollToTopics])



  const catalogueArticles = articlesApi.items

  const catalogueLoading = articlesApi.status === 'loading' || articlesApi.status === 'idle'



  const stripFromApi = useMemo(() => {

    if (articlesApi.status !== 'ready' || articlesApi.items.length === 0) return null

    return buildStripSectionsFromApi(articlesApi.items)

  }, [articlesApi.status, articlesApi.items])



  const mockCatalog = useMemo(() => getMockEducationCatalog(), [])



  const trending = useMemo(() => {
    if (stripFromApi && stripFromApi.trending.length > 0) return stripFromApi.trending
    if (useDemoFallback) return pickTrendingFromMock(8)
    if (articlesApi.items.length === 0) return []
    return articlesApi.items.slice(0, 8).map(apiArticleToStrip)
  }, [stripFromApi, useDemoFallback, articlesApi.items])

  const videos = useMemo(() => {
    if (useDemoFallback) return pickVideosFromMock(8)
    return []
  }, [useDemoFallback])

  const recent = useMemo(() => {
    if (stripFromApi && stripFromApi.recent.length > 0) return stripFromApi.recent
    if (useDemoFallback) return pickRecentFromMock(6)
    if (articlesApi.items.length === 0) return []
    return articlesApi.items.slice(0, 6).map((a, i) => apiArticleToRecent(a, i))
  }, [stripFromApi, useDemoFallback, articlesApi.items])

  const educators = useMemo(() => {
    if (presentersApi.status === 'ready' && presentersApi.items.length > 0) {
      return presentersApi.items.slice(0, 4).map(presenterToFeaturedEducator)
    }
    if (useDemoFallback) return getMockFeaturedEducators()
    return []
  }, [presentersApi.status, presentersApi.items, useDemoFallback])

  const stats = useMemo(
    () =>
      computeEducationHubStats(
        articlesApi.status === 'ready' ? articlesApi.items.length : useDemoFallback ? mockCatalog.length : 0,
        undefined,
        educators.length,
      ),
    [articlesApi.status, articlesApi.items.length, mockCatalog.length, educators.length, useDemoFallback],
  )



  const sharedCatalogueProps = {

    stats,

    educators,

    trending,

    videos,

    recent,

    catalogueArticles,

    catalogueLoading,

    catalogueError: articlesApi.error,

    onCatalogueRetry: articlesApi.reload,

    searchQuery,

    onSearchChange: setSearchQuery,

    hasActiveFilters,

    onClearFilters: clearFilters,

    onBrowseTopics: scrollToTopics,

    searchId,

    showDemoLabel: useDemoFallback,

    apiBacked: !useDemoFallback && articlesApi.status === 'ready',

  }



  const mainContent = () => {

    switch (hubView) {

      case 'paths':

        return <EducationPathsPage />

      case 'articles': {

        const meta = EDUCATION_VIEW_META.articles

        return (

          <>

            <EducationSectionHeader title={meta.title} subtitle={meta.subtitle} />

            <div id="education-all-articles">

              <EducationDiscoverCenter {...sharedCatalogueProps} variant="articles-only" />

            </div>

          </>

        )

      }

      case 'library':

        return (

          <>

            <EducationSectionHeader

              title={EDUCATION_VIEW_META.library.title}

              subtitle={EDUCATION_VIEW_META.library.subtitle}

            />

            <EducationComingSoonPanel view="library" />

          </>

        )

      case 'progress':

        return (

          <>

            <EducationSectionHeader

              title={EDUCATION_VIEW_META.progress.title}

              subtitle={EDUCATION_VIEW_META.progress.subtitle}

            />

            <EducationComingSoonPanel view="progress" />

          </>

        )

      case 'notes':

        return (

          <>

            <EducationSectionHeader title={EDUCATION_VIEW_META.notes.title} subtitle={EDUCATION_VIEW_META.notes.subtitle} />

            <EducationComingSoonPanel view="notes" />

          </>

        )

      default:

        return (

          <div id="education-all-articles">

            <EducationDiscoverCenter {...sharedCatalogueProps} variant="overview" />

          </div>

        )

    }

  }



  return (

    <EducationDiscoverShell>

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 c2k-mobile-scroll-pad">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr_280px]">

          <div className="hidden lg:block">

            <EducationLeftRail

              selectedCategory={selectedCategory}

              onCategoryChange={setSelectedCategory}

              onBrowseTopics={scrollToTopics}

            />

          </div>



          <main className="min-w-0">

            <div className="mb-4 flex justify-end lg:hidden">

              <button

                type="button"

                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}

                className="inline-flex min-h-11 items-center rounded-xl border border-dc-border bg-dc-elevated-solid px-4 text-sm font-medium text-dc-accent"

              >

                Topics

              </button>

            </div>



            {filterDrawerOpen ?

              <div className="mb-6 lg:hidden">

                <EducationLeftRail

                  selectedCategory={selectedCategory}

                  onCategoryChange={setSelectedCategory}

                  onBrowseTopics={() => {

                    setFilterDrawerOpen(false)

                    scrollToTopics()

                  }}

                />

              </div>

            : null}



            {mainContent()}

          </main>



          <div className="hidden lg:block">

            <EducationRightRail />

          </div>

        </div>

      </div>

    </EducationDiscoverShell>

  )

}


