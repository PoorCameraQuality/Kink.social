/**
 * Education discover hub - mock learning paths, stats, and card mappers.
 * Extends existing article/presenter types; no new API tables.
 */
import { demoMockImageUrl, mockPeople } from '@/data/mock-data'
import { getMockEducationCatalog, mockEducationExtras } from '@/data/mock-home-surface'
import type { MockArticle } from '@/data/types'
import type { ApiEducationArticle } from '@/hooks/useApiEducationArticles'
import type { ApiPresenterListItem } from '@/hooks/useApiPresenters'

export type EducationHubStats = {
  articles: number
  videos: number
  educators: number
  endorsements: number
}

export type EducationLearningPath = {
  id: string
  title: string
  href: string
  imageUrl: string
  modules: { label: string; completed: boolean }[]
  progressPercent: number
}

export type EducationFeaturedEducator = {
  userId: string
  username: string
  displayName: string
  handle: string
  avatarUrl: string | null
  articleCount: number
  followerCount: number
  endorsementCount: number
}

export type EducationStripArticle = {
  slug: string
  title: string
  category: string
  readLabel: string
  thumbnailUrl: string | null
}

export type EducationStripVideo = {
  slug: string
  title: string
  category: string
  durationLabel: string
  thumbnailUrl: string | null
}

export type EducationRecentTextItem = {
  slug: string
  title: string
  category: string
  addedLabel: string
  excerpt: string | null
}

export const EDUCATION_CATEGORY_FILTERS = [
  'Beginner',
  'Advanced',
  'Safety',
  'Psychology',
  'Gear',
  'Event Etiquette',
] as const

export const MOCK_LEARNING_PATHS: EducationLearningPath[] = [
  {
    id: 'path-foundations',
    title: 'BDSM Foundations',
    href: '/education?view=paths',
    imageUrl: demoMockImageUrl('c2k-edu-path-foundations', 640, 360),
    modules: [
      { label: 'Consent & negotiation', completed: true },
      { label: 'Roles & dynamics', completed: true },
      { label: 'Scene planning basics', completed: false },
      { label: 'Aftercare essentials', completed: false },
    ],
    progressPercent: 48,
  },
  {
    id: 'path-rope',
    title: 'Rope Bondage Basics',
    href: '/education?view=paths',
    imageUrl: demoMockImageUrl('c2k-edu-path-rope', 640, 360),
    modules: [
      { label: 'Single-column tie', completed: true },
      { label: 'Double-column tie', completed: false },
      { label: 'Frictions & lock-offs', completed: false },
      { label: 'Safety & nerve awareness', completed: false },
    ],
    progressPercent: 22,
  },
  {
    id: 'path-leadership',
    title: 'Dominance & Leadership',
    href: '/education?view=paths',
    imageUrl: demoMockImageUrl('c2k-edu-path-leadership', 640, 360),
    modules: [
      { label: 'Ethical dominance', completed: false },
      { label: 'Communication under stress', completed: false },
      { label: 'Community accountability', completed: false },
    ],
    progressPercent: 0,
  },
]

const EDUCATOR_USERNAMES = ['RopeDreamer', 'ConsentCoach', 'TherapyKink', 'PresenterNova'] as const

export function getMockFeaturedEducators(): EducationFeaturedEducator[] {
  return EDUCATOR_USERNAMES.map((username, i) => {
    const person = mockPeople.find((p) => p.username === username) ?? mockPeople[i % mockPeople.length]
    return {
      userId: person.id,
      username: person.username,
      displayName: person.sceneName ?? person.username,
      handle: `@${person.username}`,
      avatarUrl: person.avatarUrl ?? null,
      articleCount: 4 + (i % 5) * 3,
      followerCount: 120 + i * 87,
      endorsementCount: 18 + i * 11,
    }
  })
}

export function presenterToFeaturedEducator(p: ApiPresenterListItem): EducationFeaturedEducator {
  return {
    userId: p.userId,
    username: p.username,
    displayName: p.displayName ?? p.username,
    handle: `@${p.username}`,
    avatarUrl: p.avatarUrl,
    articleCount: p.publishedArticleCount ?? 0,
    followerCount: Math.max(p.reviewCount * 12, p.reviewCount),
    endorsementCount: Math.round(p.ratingAvg * p.reviewCount) || 0,
  }
}

function mockReadLabel(a: MockArticle): string {
  if (a.contentType === 'video' && a.durationLabel) return a.durationLabel
  return a.readTime.includes('min') ? a.readTime : `${a.readTime} read`
}

export function mockArticleToStrip(a: MockArticle): EducationStripArticle {
  return {
    slug: a.slug,
    title: a.title,
    category: a.category,
    readLabel: mockReadLabel(a),
    thumbnailUrl: a.thumbnailUrl ?? null,
  }
}

export function apiArticleToStrip(a: ApiEducationArticle): EducationStripArticle {
  const minutes = a.readingMinutes
  const readLabel = minutes != null && minutes >= 1 ? `${minutes} min read` : 'Article'
  return {
    slug: a.slug,
    title: a.title,
    category: a.categories[0] ?? 'Education',
    readLabel,
    thumbnailUrl: a.heroImageUrl,
  }
}

export function mockArticleToVideo(a: MockArticle): EducationStripVideo {
  return {
    slug: a.slug,
    title: a.title,
    category: a.category,
    durationLabel: a.durationLabel ?? a.readTime,
    thumbnailUrl: a.thumbnailUrl ?? null,
  }
}

export function mockArticleToRecent(a: MockArticle, index: number): EducationRecentTextItem {
  const days = index + 1
  return {
    slug: a.slug,
    title: a.title,
    category: a.category,
    addedLabel: days === 1 ? 'Added today' : `Added ${days} days ago`,
    excerpt: a.content.split('\n').find((l) => l.trim() && !l.startsWith('#'))?.slice(0, 120) ?? null,
  }
}

export function apiArticleToRecent(a: ApiEducationArticle, index: number): EducationRecentTextItem {
  const published = a.publishedAt ? new Date(a.publishedAt) : null
  let addedLabel = 'Recently published'
  if (published && !Number.isNaN(published.getTime())) {
    const diffDays = Math.floor((Date.now() - published.getTime()) / 86_400_000)
    addedLabel = diffDays <= 0 ? 'Added today' : diffDays === 1 ? 'Added yesterday' : `Added ${diffDays} days ago`
  } else if (index === 0) {
    addedLabel = 'Added today'
  }
  return {
    slug: a.slug,
    title: a.title,
    category: a.categories[0] ?? 'Education',
    addedLabel,
    excerpt: a.excerpt,
  }
}

export function computeEducationHubStats(
  articleCount: number,
  videoCount?: number,
  educatorCount?: number,
): EducationHubStats {
  const catalog = getMockEducationCatalog()
  const videos = videoCount ?? catalog.filter((a) => a.contentType === 'video').length + mockEducationExtras.length
  const educators = educatorCount ?? getMockFeaturedEducators().length
  return {
    articles: articleCount > 0 ? articleCount : catalog.filter((a) => a.contentType !== 'video').length,
    videos,
    educators,
    endorsements: 0,
  }
}

export function pickTrendingFromMock(limit = 8): EducationStripArticle[] {
  return getMockEducationCatalog()
    .filter((a) => a.contentType !== 'video')
    .slice(0, limit)
    .map(mockArticleToStrip)
}

export function pickVideosFromMock(limit = 8): EducationStripVideo[] {
  return getMockEducationCatalog()
    .filter((a) => a.contentType === 'video')
    .slice(0, limit)
    .map(mockArticleToVideo)
}

export function pickRecentFromMock(limit = 6): EducationRecentTextItem[] {
  return getMockEducationCatalog()
    .slice(0, limit)
    .map((a, i) => mockArticleToRecent(a, i))
}
