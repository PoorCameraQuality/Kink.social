import { useCallback, useState } from 'react'
import type { OrgFlags } from '@/components/org/OrgAdminDashboard'

export type OrgAdminSettingsOrg = {
  displayName: string
  slug: string
  visibility: string
  logoUrl: string | null
  bannerUrl: string | null
  shareImageUrl?: string | null
  featureFlags: OrgFlags
  externalSiteUrl: string | null
  showExternalEmbed: boolean
  galleryPublic?: boolean
}

export function useOrgAdminSettings(orgKey: string, reloadOrg: () => Promise<void>) {
  const [adminMsg, setAdminMsg] = useState<string | null>(null)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [shareUploading, setShareUploading] = useState(false)

  const patchFlags = useCallback(
    async (org: OrgAdminSettingsOrg | null, next: Partial<OrgFlags>) => {
      if (!org) return
      setAdminMsg(null)
      try {
        const r = await fetch(`/api/v1/organizations/${orgKey}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureFlags: { ...org.featureFlags, ...next } }),
        })
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        if (!r.ok) {
          setAdminMsg(j.error ?? 'Update failed')
          return
        }
        await reloadOrg()
        setAdminMsg('Saved.')
      } catch {
        setAdminMsg('Network error')
      }
    },
    [orgKey, reloadOrg],
  )

  const patchOrganization = useCallback(
    async (body: Record<string, unknown>, successMessage?: string) => {
      setAdminMsg(null)
      try {
        const r = await fetch(`/api/v1/organizations/${orgKey}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        if (!r.ok) {
          setAdminMsg(j.error ?? 'Update failed')
          return false
        }
        await reloadOrg()
        if (successMessage) setAdminMsg(successMessage)
        return true
      } catch {
        setAdminMsg('Network error')
        return false
      }
    },
    [orgKey, reloadOrg],
  )

  const patchGalleryPublic = useCallback(
    async (next: boolean) => {
      setAdminMsg(null)
      try {
        const r = await fetch(`/api/v1/organizations/${orgKey}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryPublic: next }),
        })
        if (!r.ok) {
          setAdminMsg('Could not update gallery visibility')
          return
        }
        await reloadOrg()
      } catch {
        setAdminMsg('Network error')
      }
    },
    [orgKey, reloadOrg],
  )

  const uploadOrgBanner = useCallback(
    async (isAdmin: boolean) => {
      if (!isAdmin) return
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        setBannerUploading(true)
        setAdminMsg(null)
        try {
          const fd = new FormData()
          fd.append('file', file)
          const up = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
          const data = (await up.json().catch(() => ({}))) as { url?: string; error?: string }
          if (!up.ok || !data.url) {
            setAdminMsg(data.error ?? 'Banner upload failed')
            return
          }
          const r = await fetch(`/api/v1/organizations/${orgKey}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bannerUrl: data.url }),
          })
          if (!r.ok) {
            setAdminMsg('Could not save banner')
            return
          }
          await reloadOrg()
          setAdminMsg('Banner updated.')
        } finally {
          setBannerUploading(false)
        }
      }
      input.click()
    },
    [orgKey, reloadOrg],
  )

  const clearOrgBanner = useCallback(
    async (isAdmin: boolean) => {
      if (!isAdmin) return
      setAdminMsg(null)
      try {
        const r = await fetch(`/api/v1/organizations/${orgKey}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bannerUrl: null }),
        })
        if (!r.ok) {
          setAdminMsg('Could not remove banner')
          return
        }
        await reloadOrg()
        setAdminMsg('Banner removed.')
      } catch {
        setAdminMsg('Network error')
      }
    },
    [orgKey, reloadOrg],
  )

  const uploadOrgLogo = useCallback(
    async (isAdmin: boolean) => {
      if (!isAdmin) return
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        setLogoUploading(true)
        setAdminMsg(null)
        try {
          const fd = new FormData()
          fd.append('file', file)
          const up = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
          const data = (await up.json().catch(() => ({}))) as { url?: string; error?: string }
          if (!up.ok || !data.url) {
            setAdminMsg(data.error ?? 'Logo upload failed')
            return
          }
          const r = await fetch(`/api/v1/organizations/${orgKey}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl: data.url }),
          })
          if (!r.ok) {
            setAdminMsg('Could not save logo')
            return
          }
          await reloadOrg()
          setAdminMsg('Logo updated.')
        } finally {
          setLogoUploading(false)
        }
      }
      input.click()
    },
    [orgKey, reloadOrg],
  )

  const clearOrgLogo = useCallback(
    async (isAdmin: boolean) => {
      if (!isAdmin) return
      setAdminMsg(null)
      try {
        const r = await fetch(`/api/v1/organizations/${orgKey}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: null }),
        })
        if (!r.ok) {
          setAdminMsg('Could not remove logo')
          return
        }
        await reloadOrg()
        setAdminMsg('Logo removed.')
      } catch {
        setAdminMsg('Network error')
      }
    },
    [orgKey, reloadOrg],
  )

  const uploadOrgShareImage = useCallback(
    async (isAdmin: boolean) => {
      if (!isAdmin) return
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/png,image/jpeg,image/webp'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        setShareUploading(true)
        setAdminMsg(null)
        try {
          const fd = new FormData()
          fd.append('file', file)
          const up = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
          const data = (await up.json().catch(() => ({}))) as { url?: string; error?: string }
          if (!up.ok || !data.url) {
            setAdminMsg(data.error ?? 'Share image upload failed')
            return
          }
          const ok = await patchOrganization({ shareImageUrl: data.url }, 'Link preview image updated.')
          if (!ok) setAdminMsg('Could not save share image')
        } finally {
          setShareUploading(false)
        }
      }
      input.click()
    },
    [patchOrganization],
  )

  const clearOrgShareImage = useCallback(
    async (isAdmin: boolean) => {
      if (!isAdmin) return
      await patchOrganization({ shareImageUrl: null }, 'Link preview image removed.')
    },
    [patchOrganization],
  )

  return {
    adminMsg,
    setAdminMsg,
    bannerUploading,
    logoUploading,
    shareUploading,
    patchFlags,
    patchOrganization,
    patchGalleryPublic,
    uploadOrgBanner,
    clearOrgBanner,
    uploadOrgLogo,
    clearOrgLogo,
    uploadOrgShareImage,
    clearOrgShareImage,
  }
}
