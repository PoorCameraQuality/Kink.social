'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PhotoUploadResult } from '@/components/PhotoUpload'
import type { MockProfilePhoto } from '@/data/mock-data'

const PROFILE_PHOTOS_STORAGE_KEY = 'c2k_profile_photos_mock'

function loadStoredPhotos(): MockProfilePhoto[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_PHOTOS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.warn('[useProfilePhotos] Failed to load stored photos:', e)
    return null
  }
}

function saveStoredPhotos(photos: MockProfilePhoto[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROFILE_PHOTOS_STORAGE_KEY, JSON.stringify(photos))
  } catch (e) {
    console.warn('[useProfilePhotos] Failed to save photos to localStorage:', e)
  }
}

export interface UseProfilePhotosOptions {
  /** Base photos from mock person; used when no stored override */
  basePhotos?: MockProfilePhoto[]
}

export interface UseProfilePhotosReturn {
  photos: MockProfilePhoto[]
  addPhotoOpen: boolean
  setAddPhotoOpen: (open: boolean) => void
  addPhoto: (result: PhotoUploadResult) => void
  editingId: string | null
  editingCaption: string
  setEditingCaption: (value: string) => void
  startEditCaption: (id: string) => void
  saveCaption: () => void
  cancelEdit: () => void
  deleteConfirmId: string | null
  setDeleteConfirmId: (id: string | null) => void
  deletePhoto: (id: string) => void
}

export function useProfilePhotos(options: UseProfilePhotosOptions = {}): UseProfilePhotosReturn {
  const { basePhotos = [] } = options
  const [photos, setPhotos] = useState<MockProfilePhoto[]>([])
  const [storedPhotos, setStoredPhotos] = useState<MockProfilePhoto[] | null>(null)
  const [addPhotoOpen, setAddPhotoOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCaption, setEditingCaption] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setStoredPhotos(loadStoredPhotos())
  }, [])

  useEffect(() => {
    setPhotos(storedPhotos ?? basePhotos)
  }, [storedPhotos, basePhotos])

  const persist = useCallback((next: MockProfilePhoto[]) => {
    setPhotos(next)
    setStoredPhotos(next)
    saveStoredPhotos(next)
  }, [])

  const addPhoto = useCallback(
    (result: PhotoUploadResult) => {
      const newPhoto: MockProfilePhoto = {
        id: `pp-${Date.now()}`,
        url: result.objectUrl,
        caption: result.caption,
        order: photos.length,
        tags: [],
      }
      persist([...photos, newPhoto])
      setAddPhotoOpen(false)
    },
    [photos, persist]
  )

  const startEditCaption = useCallback((id: string) => {
    const photo = photos.find((photoItem) => photoItem.id === id)
    if (photo) {
      setEditingId(id)
      setEditingCaption(photo.caption ?? '')
    }
  }, [photos])

  const saveCaption = useCallback(() => {
    if (!editingId) return
    const next = photos.map((photo) =>
      photo.id === editingId ? { ...photo, caption: editingCaption } : photo
    )
    persist(next)
    setEditingId(null)
    setEditingCaption('')
  }, [editingId, editingCaption, photos, persist])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingCaption('')
  }, [])

  const deletePhoto = useCallback(
    (id: string) => {
      const removed = photos.find((photo) => photo.id === id)
      if (removed?.url?.startsWith('blob:')) URL.revokeObjectURL(removed.url)
      persist(photos.filter((photo) => photo.id !== id))
      setDeleteConfirmId(null)
    },
    [photos, persist]
  )

  return {
    photos,
    addPhotoOpen,
    setAddPhotoOpen,
    addPhoto,
    editingId,
    editingCaption,
    setEditingCaption,
    startEditCaption,
    saveCaption,
    cancelEdit,
    deleteConfirmId,
    setDeleteConfirmId,
    deletePhoto,
  }
}
