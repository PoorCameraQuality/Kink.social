'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  getMockChannelsForGroup,
  getMockEventsForGroup,
  getMockGroupById,
  getMockGroupBySlug,
  getMockGroupMembers,
  getMockPhotosForGroup,
  getMockPendingPhotosByAuthor,
  getMockPendingPhotosForGroup,
  getMockResourcesForGroup,
} from '@/data/mock-data'
import { useViewerUsername } from '@/contexts/AuthContext'
import type { GroupRole } from '@/data/mock-data'
import type { MockGroup, MockGroupChannel, MockGroupMember, MockEvent, MockGroupPhoto, MockResource } from '@/data/mock-data'

export interface UseGroupDetailReturn {
  group: MockGroup | null
  channels: MockGroupChannel[]
  members: MockGroupMember[]
  events: MockEvent[]
  photos: MockGroupPhoto[]
  pendingPhotos: MockGroupPhoto[]
  myPendingPhotos: MockGroupPhoto[]
  resources: MockResource[]
  viewerRole: GroupRole | undefined
  canManage: boolean
  canModerate: boolean
  isMember: boolean
  refreshPhotos: () => void
  refreshChannels: () => void
  refreshResources: () => void
  refreshMembers: () => void
}

export function useGroupDetail(groupIdOrSlug: string | undefined): UseGroupDetailReturn {
  const viewerUsername = useViewerUsername()
  const [photosRefreshKey, setPhotosRefreshKey] = useState(0)
  const [channelsRefreshKey, setChannelsRefreshKey] = useState(0)
  const [resourcesRefreshKey, setResourcesRefreshKey] = useState(0)
  const [membersRefreshKey, setMembersRefreshKey] = useState(0)

  const group = useMemo(() => {
    if (!groupIdOrSlug) return null
    return getMockGroupById(groupIdOrSlug) ?? getMockGroupBySlug(groupIdOrSlug) ?? null
  }, [groupIdOrSlug])

  const refreshPhotos = useCallback(() => setPhotosRefreshKey((k) => k + 1), [])
  const refreshChannels = useCallback(() => setChannelsRefreshKey((k) => k + 1), [])
  const refreshResources = useCallback(() => setResourcesRefreshKey((k) => k + 1), [])
  const refreshMembers = useCallback(() => setMembersRefreshKey((k) => k + 1), [])

  const channels = useMemo(() => {
    if (!group) return []
    return getMockChannelsForGroup(group.id)
  }, [group, channelsRefreshKey])

  const members = useMemo(() => {
    if (!group) return []
    return getMockGroupMembers(group.id)
  }, [group, membersRefreshKey])

  const events = useMemo(() => {
    if (!group) return []
    return getMockEventsForGroup(group.id)
  }, [group])

  const photos = useMemo(() => {
    if (!group) return []
    return getMockPhotosForGroup(group.id)
  }, [group, photosRefreshKey])

  const pendingPhotos = useMemo(() => {
    if (!group) return []
    return getMockPendingPhotosForGroup(group.id)
  }, [group, photosRefreshKey])

  const myPendingPhotos = useMemo(() => {
    if (!group || !viewerUsername) return []
    return getMockPendingPhotosByAuthor(group.id, viewerUsername)
  }, [group, photosRefreshKey, viewerUsername])

  const resources = useMemo(() => {
    if (!group) return []
    return getMockResourcesForGroup(group.id)
  }, [group, resourcesRefreshKey])

  const viewerMember = group && viewerUsername ? members.find((m) => m.username === viewerUsername) : undefined
  const viewerRole: GroupRole | undefined = viewerMember?.role
  const canManage = viewerRole === 'owner' || viewerRole === 'admin'
  const canModerate = canManage || viewerRole === 'moderator'
  const isMember = !!viewerMember

  return {
    group,
    channels,
    members,
    events,
    photos,
    pendingPhotos,
    myPendingPhotos,
    resources,
    viewerRole,
    canManage,
    canModerate,
    isMember,
    refreshPhotos,
    refreshChannels,
    refreshResources,
    refreshMembers,
  }
}
