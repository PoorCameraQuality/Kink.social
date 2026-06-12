'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { toggleArrayItem } from '@/lib/utils/toggleArrayItem'
import { mockGroups, mockEvents, mockPeople, mockVendors } from '@/data/mock-data'
import { MAX_DISTANCE_MI, rankEvents, rankGroups, rankPeople, rankVendors } from '@/lib/discovery-utils'
import type { MockPerson, MockEvent, MockVendor, MockGroup } from '@/data/mock-data'

export const RESULT_TYPES = ['People', 'Events', 'Vendors', 'Groups'] as const
export const STREAM_TABS = ['Recommended', 'Near you', 'New', 'Popular'] as const
export const PAGE_SIZE = 12

export const ROLE_TAGS = ['Top', 'Bottom', 'Switch', 'Rigger', 'Educator', 'Mentor', 'Organizer']

export const EXPERIENCE_OPTIONS = ['any', 'curious', 'new', 'intermediate', 'experienced', 'professional'] as const

const EXPERIENCE_TO_SCORE: Record<string, { min: number; max: number }> = {
  any: { min: 0, max: 100 },
  curious: { min: 0, max: 20 },
  new: { min: 20, max: 40 },
  intermediate: { min: 40, max: 60 },
  experienced: { min: 60, max: 80 },
  professional: { min: 80, max: 100 },
}

import { getSortBy } from '@/lib/discovery-sort-config'

export interface UseDiscoveryFiltersReturn {
  resultType: string
  setResultType: (value: string) => void
  streamTab: string
  setStreamTab: (value: string) => void
  distance: number
  setDistance: (value: number) => void
  selectedRoles: string[]
  toggleRole: (role: string) => void
  experienceLevel: string
  setExperienceLevel: (value: string) => void
  verifiedOnly: boolean
  setVerifiedOnly: (value: boolean) => void
  eventActiveOnly: boolean
  setEventActiveOnly: (value: boolean) => void
  reputationThreshold: number
  setReputationThreshold: (value: number) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  people: MockPerson[]
  events: MockEvent[]
  vendors: MockVendor[]
  groups: MockGroup[]
  displayPeople: MockPerson[]
  displayEvents: MockEvent[]
  displayVendors: MockVendor[]
  displayGroups: MockGroup[]
  hasMore: boolean
  loadMore: () => void
}

export function useDiscoveryFilters(): UseDiscoveryFiltersReturn {
  const [resultType, setResultType] = useState<string>(RESULT_TYPES[0])
  const [distance, setDistance] = useState(50)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [experienceLevel, setExperienceLevel] = useState('any')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [eventActiveOnly, setEventActiveOnly] = useState(false)
  const [reputationThreshold, setReputationThreshold] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [streamTab, setStreamTab] = useState<string>(STREAM_TABS[0])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedRoles, verifiedOnly, reputationThreshold, eventActiveOnly, distance, experienceLevel, resultType, streamTab])

  const toggleRole = useCallback((role: string) => {
    setSelectedRoles((previousRoles) => toggleArrayItem(previousRoles, role))
  }, [])

  const experienceRange = EXPERIENCE_TO_SCORE[experienceLevel] ?? EXPERIENCE_TO_SCORE.any
  const reputationMin = Math.max(reputationThreshold, experienceRange.min)
  const reputationMax = experienceRange.max
  const distanceMi = streamTab === 'Near you' ? distance : MAX_DISTANCE_MI

  const { people, events, vendors, groups } = useMemo(() => {
    const peopleSortBy = getSortBy(resultType, streamTab)
    const people = rankPeople(mockPeople, {
      searchQuery,
      roles: selectedRoles.length ? selectedRoles : undefined,
      verifiedOnly,
      reputationMin: reputationMin || undefined,
      eventActiveOnly,
      distanceMi,
      sortBy: resultType === 'People' ? (peopleSortBy as 'relevance' | 'trust' | 'diverse' | 'nearby' | 'new') : 'diverse',
    })
    const peopleFiltered = reputationMax < 100
      ? people.filter((person) => person.trustScore >= reputationMin && person.trustScore <= reputationMax)
      : people

    const eventsSortBy = getSortBy(resultType, streamTab)
    const events = rankEvents(mockEvents, {
      searchQuery,
      distanceMi,
      verifiedOnly: false,
      sortBy: eventsSortBy as 'soon' | 'relevance' | 'new' | 'diverse',
    })

    const vendorsSortBy = getSortBy(resultType, streamTab)
    const vendors = rankVendors(mockVendors, {
      searchQuery,
      sortBy: resultType === 'Vendors' ? (vendorsSortBy as 'relevance' | 'rating' | 'diverse' | 'new' | 'nearby') : 'diverse',
    })

    const groupsSortBy = getSortBy(resultType, streamTab)
    const groups = rankGroups(mockGroups, {
      searchQuery,
      distanceMi,
      sortBy: resultType === 'Groups' ? (groupsSortBy as 'relevance' | 'new' | 'nearby' | 'diverse') : 'diverse',
    })

    return {
      people: peopleFiltered,
      events,
      vendors,
      groups,
    }
  }, [searchQuery, selectedRoles, verifiedOnly, reputationMin, reputationMax, eventActiveOnly, distance, streamTab, resultType])

  const displayPeople = people.slice(0, page * PAGE_SIZE)
  const displayEvents = events.slice(0, page * PAGE_SIZE)
  const displayVendors = vendors.slice(0, page * PAGE_SIZE)
  const displayGroups = groups.slice(0, page * PAGE_SIZE)

  const hasMorePeople = displayPeople.length < people.length
  const hasMoreEvents = displayEvents.length < events.length
  const hasMoreVendors = displayVendors.length < vendors.length
  const hasMoreGroups = displayGroups.length < groups.length
  const HAS_MORE_MAP: Record<string, boolean> = {
    People: hasMorePeople,
    Events: hasMoreEvents,
    Vendors: hasMoreVendors,
    Groups: hasMoreGroups,
  }
  const hasMore = HAS_MORE_MAP[resultType] ?? false

  const loadMore = useCallback(() => setPage((pageNum) => pageNum + 1), [])

  return {
    resultType,
    setResultType,
    streamTab,
    setStreamTab,
    distance,
    setDistance,
    selectedRoles,
    toggleRole,
    experienceLevel,
    setExperienceLevel,
    verifiedOnly,
    setVerifiedOnly,
    eventActiveOnly,
    setEventActiveOnly,
    reputationThreshold,
    setReputationThreshold,
    searchQuery,
    setSearchQuery,
    people,
    events,
    vendors,
    groups,
    displayPeople,
    displayEvents,
    displayVendors,
    displayGroups,
    hasMore,
    loadMore,
  }
}
