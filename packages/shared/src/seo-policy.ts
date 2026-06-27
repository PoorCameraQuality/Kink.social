/** kink.social is the private member app — never an SEO surface unless public launch is enabled. */

export const KINK_SOCIAL_X_ROBOTS_TAG = 'noindex, nofollow, noarchive, nosnippet'

export const KINK_SOCIAL_ROBOTS_META = 'noindex, nofollow, noarchive, nosnippet'

export const KINK_SOCIAL_PUBLIC_LAUNCH_ROBOTS_META = 'index, follow'



/** Public marketing and policy paths eligible for sitemap when launch is enabled. */

export const KINK_SOCIAL_PUBLIC_SITEMAP_PATHS = [

  '/',

  '/about',

  '/contact',

  '/support',

  '/guidelines',

  '/terms',

  '/privacy',

  '/accessibility',

  '/adult-content-consent',

  '/law-enforcement',

  '/dmca',

  '/ncii',

  '/minor-safety',

  '/vendor-organizer-terms',

  '/policies',

] as const



/** eastcoastkinkevents.com is the public SEO directory. */

export const ECKE_DOMAIN = 'eastcoastkinkevents.com'

export const ECKE_URL = 'https://www.eastcoastkinkevents.com'

export const ECKE_KINK_SOCIAL_EXPLAINER_PATH = '/kink-social'



export function isKinkSocialPublicLaunchEnabled(flag?: string | boolean | null): boolean {

  if (typeof flag === 'boolean') return flag

  const raw = flag ?? ''

  return raw === 'true' || raw === '1'

}



export function buildKinkSocialRobotsTxt(publicLaunch: boolean): string {

  if (!publicLaunch) {

    return 'User-agent: *\nDisallow: /\n'

  }

  const allowLines = KINK_SOCIAL_PUBLIC_SITEMAP_PATHS.map((path) => `Allow: ${path}`).join('\n')

  return [

    'User-agent: *',

    allowLines,

    'Disallow: /home',

    'Disallow: /settings',

    'Disallow: /messaging',

    'Disallow: /moderation',

    'Disallow: /admin',

    'Disallow: /organizer',

    '',

    'Sitemap: /sitemap.xml',

  ].join('\n')

}



/** RFC 9116 security contact file for kink.social (/.well-known/security.txt). */

export const KINK_SOCIAL_SECURITY_TXT_CONTACT = 'mailto:sheldonkinneymmo.tm@gmail.com'

export const KINK_SOCIAL_SECURITY_TXT_EXPIRES = '2027-06-30T09:27:00.000Z'



export function buildKinkSocialSecurityTxt(siteUrl: string): string {

  const base = siteUrl.replace(/\/$/, '')

  return [

    `Contact: ${KINK_SOCIAL_SECURITY_TXT_CONTACT}`,

    `Expires: ${KINK_SOCIAL_SECURITY_TXT_EXPIRES}`,

    'Preferred-Languages: en',

    `Canonical: ${base}/.well-known/security.txt`,

    '',

  ].join('\n')

}



export function buildKinkSocialSitemapXml(siteUrl: string): string {

  const base = siteUrl.replace(/\/$/, '')

  const urls = KINK_SOCIAL_PUBLIC_SITEMAP_PATHS.map((path) => {

    const loc = path === '/' ? `${base}/` : `${base}${path}`

    return `  <url><loc>${loc}</loc></url>`

  }).join('\n')

  return [

    '<?xml version="1.0" encoding="UTF-8"?>',

    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',

    urls,

    '</urlset>',

  ].join('\n')

}



export type EckePublishEligibilityInput = {

  /** Maps to `eckePublish` / `publishToEcke` toggles on source rows. */

  publishToEcke?: boolean | null

  visibility?: string | null

  moderationStatus?: string | null

  directoryVisibility?: 'PUBLIC' | 'UNLISTED' | string | null

  publicationStatus?: string | null

}



function isPublicVisibility(visibility: string | null | undefined): boolean {

  if (!visibility) return false

  const normalized = visibility.trim().toUpperCase()

  return normalized === 'PUBLIC'

}



/** Gate outbound ECKE publish — only sanitized, public-safe records. */

export function isEckePublishEligible(input: EckePublishEligibilityInput): boolean {

  if (input.publishToEcke !== true) return false

  if (!isPublicVisibility(input.visibility ?? null)) return false

  if (input.directoryVisibility === 'UNLISTED') return false

  if (input.moderationStatus && input.moderationStatus !== 'approved') return false

  if (input.publicationStatus && input.publicationStatus !== 'PUBLISHED') return false

  return true

}



const KINK_SOCIAL_URL_RE = /https?:\/\/(?:www\.)?kink\.social[^\s"'<>]*/gi

const KINK_SOCIAL_HOST_RE = /\bkink\.social\b/i

/** Member-only or internal kink.social paths — must not appear on ECKE public pages. */
const KINK_SOCIAL_PRIVATE_URL_RE =
  /https?:\/\/(?:www\.)?kink\.social(?:\/api\b|\/messages\b|\/dm\b|\/inbox\b|\/settings\b|\/profile\/edit\b|\/education\/write\b|\/organizer\b)[^\s"'<>]*/gi

/** Strip private-app URLs from text destined for ECKE public pages. */
export function sanitizeEckePublicText(text: string | null | undefined): string | null {
  if (text == null) return null

  const cleaned = text.replace(KINK_SOCIAL_URL_RE, '').replace(KINK_SOCIAL_HOST_RE, '').trim()

  return cleaned || null
}

const KINK_SOCIAL_ANY_URL_RE = /https?:\/\/(?:www\.)?kink\.social\b[^\s"'<>]*/gi
const KINK_SOCIAL_IMG_TAG_RE =
  /<img\b[^>]*\ssrc\s*=\s*["']https?:\/\/(?:www\.)?kink\.social\b[^"']*["'][^>]*\/?>/gi

/**
 * Education body HTML for ECKE: keep brand mentions, drop all kink.social URLs and proxy images.
 * Inline/hero media on kink.social requires auth; ECKE must not embed those links.
 */
export function sanitizeEckeEducationBodyHtml(html: string | null | undefined): string | null {
  if (html == null) return null
  const cleaned = html
    .replace(KINK_SOCIAL_IMG_TAG_RE, '')
    .replace(KINK_SOCIAL_PRIVATE_URL_RE, '')
    .replace(KINK_SOCIAL_ANY_URL_RE, '')
    .trim()
  return cleaned || null
}

/**
 * Education articles may mention kink.social by name and link to public member pages.
 * Only strip URLs that point at private app surfaces.
 */
export function sanitizeEckeEducationPublicText(text: string | null | undefined): string | null {
  if (text == null) return null
  const cleaned = text.replace(KINK_SOCIAL_PRIVATE_URL_RE, '').trim()
  return cleaned || null
}

/** True when serialized ECKE payload still references the private app domain. */
export function eckePayloadContainsPrivateAppUrls(payload: unknown): boolean {
  return KINK_SOCIAL_HOST_RE.test(JSON.stringify(payload))
}

/** Education ingest may include brand mentions and public kink.social profile links. */
export const ECKE_EDUCATION_ATTRIBUTION_URL_KEYS = ['authorProfileUrl', 'presenterProfileUrl'] as const

/** True when education payload contains member-only kink.social URLs (not brand mentions). */
export function educationEckePayloadContainsLeakedPrivateUrls(payload: Record<string, unknown>): boolean {
  return KINK_SOCIAL_PRIVATE_URL_RE.test(JSON.stringify(payload))
}

/** Slug safe for ECKE public URLs — normalize without stripping the kink.social brand name. */
export function sanitizeEckeArticleSlug(slug: string): string {
  const lowered = slug.toLowerCase().trim()
  const withoutUrls = lowered.replace(KINK_SOCIAL_URL_RE, '')
  const normalized = withoutUrls
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
  return normalized || 'article'
}

/** Hero images must be public CDN URLs; drop kink.social media proxy links. */
export function sanitizeEckeHeroImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (KINK_SOCIAL_HOST_RE.test(trimmed)) return null
  return trimmed
}

/**
 * Organizer-supplied external links (official site CTA) destined for public ECKE pages.
 * Must be an absolute http(s) URL and never a kink.social app URL.
 */
export function sanitizeEckeExternalUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (!/^https?:\/\//i.test(trimmed)) return null
  if (KINK_SOCIAL_HOST_RE.test(trimmed)) return null
  return trimmed
}

