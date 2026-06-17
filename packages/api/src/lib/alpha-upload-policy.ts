import type { FastifyReply } from 'fastify'

export type AlphaUploadCategory =
  | 'profile_photo'
  | 'profile_media'
  | 'feed_video'
  | 'org_banner'
  | 'org_logo'
  | 'org_share'
  | 'org_gallery'
  | 'group_branding'
  | 'vendor_branding'
  | 'feed_image'
  | 'feed_audio'
  | 'event_cover'
  | 'education_hero'
  | 'education_inline'
  | 'org_rich_bio'
  | 'convention_gallery'
  | 'convention_gallery_attendee'
  | 'convention_maps'
  | 'convention_badges_logo'
  | 'convention_hero'
  | 'event_share_branding'

const CATEGORY_ENV: Record<AlphaUploadCategory, string> = {
  profile_photo: 'C2K_ALPHA_DISABLE_PROFILE_PHOTO_UPLOADS',
  profile_media: 'C2K_ALPHA_DISABLE_PROFILE_PHOTO_UPLOADS',
  feed_video: 'C2K_ALPHA_DISABLE_FEED_IMAGE_UPLOADS',
  org_banner: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  org_logo: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  org_share: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  org_gallery: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  group_branding: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  vendor_branding: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  feed_image: 'C2K_ALPHA_DISABLE_FEED_IMAGE_UPLOADS',
  feed_audio: 'C2K_ALPHA_DISABLE_FEED_IMAGE_UPLOADS',
  event_cover: 'C2K_ALPHA_DISABLE_EVENT_COVER_UPLOADS',
  education_hero: 'C2K_ALPHA_DISABLE_EDUCATION_HERO_UPLOADS',
  education_inline: 'C2K_ALPHA_DISABLE_EDUCATION_HERO_UPLOADS',
  org_rich_bio: 'C2K_ALPHA_DISABLE_ORG_BANNER_UPLOADS',
  convention_gallery: 'C2K_ALPHA_DISABLE_CONVENTION_GALLERY_UPLOADS',
  convention_gallery_attendee: 'C2K_ALPHA_DISABLE_CONVENTION_GALLERY_UPLOADS',
  convention_maps: 'C2K_ALPHA_DISABLE_CONVENTION_GALLERY_UPLOADS',
  convention_badges_logo: 'C2K_ALPHA_DISABLE_CONVENTION_GALLERY_UPLOADS',
  convention_hero: 'C2K_ALPHA_DISABLE_CONVENTION_GALLERY_UPLOADS',
  event_share_branding: 'C2K_ALPHA_DISABLE_EVENT_COVER_UPLOADS',
}

export function isAlphaUploadDisabled(category: AlphaUploadCategory): boolean {
  const envName = CATEGORY_ENV[category]
  return process.env[envName] === 'true'
}

export function alphaUploadDisabledResponse(reply: FastifyReply, category: AlphaUploadCategory) {
  return reply.status(403).send({
    error: 'This upload type is disabled for the current alpha test server',
    code: 'alpha_upload_disabled',
    category,
  })
}

export function parseUploadPurpose(raw: unknown): AlphaUploadCategory | null {
  if (typeof raw !== 'string') return null
  const value = raw.trim() as AlphaUploadCategory
  return value in CATEGORY_ENV ? value : null
}
