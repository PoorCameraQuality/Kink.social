import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import {
  buildKinkSocialRobotsTxt,
  buildKinkSocialSecurityTxt,
  buildKinkSocialSitemapXml,
  ECKE_URL,
  KINK_SOCIAL_ROBOTS_META,
  KINK_SOCIAL_X_ROBOTS_TAG,
  eckePayloadContainsPrivateAppUrls,
  isEckePublishEligible,
  isKinkSocialPublicLaunchEnabled,
  sanitizeEckePublicText,
  sanitizeEckeEducationPublicText,
  educationEckePayloadContainsLeakedPrivateUrls,
  sanitizeEckeArticleSlug,
} from './seo-policy'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const webRoot = join(repoRoot, 'packages/web')
const dockerRoot = join(repoRoot, 'docker')

describe('seo-policy', () => {
  it('isEckePublishEligible requires publishToEcke, public visibility, and approved moderation', () => {
    assert.equal(
      isEckePublishEligible({
        publishToEcke: true,
        visibility: 'PUBLIC',
        moderationStatus: 'approved',
      }),
      true,
    )
    assert.equal(isEckePublishEligible({ publishToEcke: false, visibility: 'PUBLIC' }), false)
    assert.equal(isEckePublishEligible({ publishToEcke: true, visibility: 'MEMBERS' }), false)
    assert.equal(
      isEckePublishEligible({ publishToEcke: true, visibility: 'PUBLIC', directoryVisibility: 'UNLISTED' }),
      false,
    )
    assert.equal(
      isEckePublishEligible({ publishToEcke: true, visibility: 'PUBLIC', moderationStatus: 'pending' }),
      false,
    )
    assert.equal(
      isEckePublishEligible({ publishToEcke: true, visibility: 'PUBLIC', publicationStatus: 'DRAFT' }),
      false,
    )
  })

  it('isKinkSocialPublicLaunchEnabled parses launch flags', () => {
    assert.equal(isKinkSocialPublicLaunchEnabled('true'), true)
    assert.equal(isKinkSocialPublicLaunchEnabled('1'), true)
    assert.equal(isKinkSocialPublicLaunchEnabled('false'), false)
    assert.equal(isKinkSocialPublicLaunchEnabled(null), false)
  })

  it('buildKinkSocialRobotsTxt and sitemap respond to launch flag', () => {
    assert.match(buildKinkSocialRobotsTxt(false), /Disallow:\s*\//)
    assert.match(buildKinkSocialRobotsTxt(true), /Allow:\s*\//)
    assert.match(buildKinkSocialRobotsTxt(true), /Sitemap:\s*\/sitemap\.xml/)
    const xml = buildKinkSocialSitemapXml('https://kink.social')
    assert.match(xml, /<urlset/)
    assert.match(xml, /<loc>https:\/\/kink\.social\/guidelines<\/loc>/)
  })

  it('sanitizeEckePublicText strips kink.social references', () => {
    assert.equal(
      sanitizeEckePublicText('Join us at https://kink.social/events/foo for details'),
      'Join us at  for details',
    )
    assert.equal(eckePayloadContainsPrivateAppUrls({ website: 'https://kink.social/orgs/x' }), true)
    assert.equal(eckePayloadContainsPrivateAppUrls({ website: `${ECKE_URL}/events/foo` }), false)
  })

  it('education sanitizer keeps brand mentions and strips private app URLs only', () => {
    assert.equal(
      sanitizeEckeEducationPublicText('Kink.Social alpha at https://kink.social/messages/inbox'),
      'Kink.Social alpha at',
    )
    assert.equal(sanitizeEckeArticleSlug('kink.social-goes-live'), 'kink-social-goes-live')
    const payload = {
      title: 'Kink.Social launch',
      bodyHtml: '<p>Visit kink.social today</p>',
      authorProfileUrl: 'https://kink.social/profile/demo',
    }
    assert.equal(educationEckePayloadContainsLeakedPrivateUrls(payload), false)
    assert.equal(
      educationEckePayloadContainsLeakedPrivateUrls({
        ...payload,
        bodyHtml: '<p>https://kink.social/settings/account</p>',
      }),
      true,
    )
  })
})

describe('kink.social crawl policy (source files)', () => {
  const robotsTxt = readFileSync(join(webRoot, 'public/robots.txt'), 'utf8')
  const indexHtml = readFileSync(join(webRoot, 'index.html'), 'utf8')
  const nginxConf = readFileSync(join(dockerRoot, 'nginx-spa.conf'), 'utf8')
  const caddyfile = readFileSync(join(repoRoot, 'Caddyfile'), 'utf8')
  const scopeMetaSrc = readFileSync(join(webRoot, 'src/components/seo/ScopePageMeta.tsx'), 'utf8')
  const appRobotsSrc = readFileSync(join(webRoot, 'src/components/seo/AppRobotsMeta.tsx'), 'utf8')
  const footerSrc = readFileSync(join(webRoot, 'src/components/Footer.tsx'), 'utf8')
  const viteConfigSrc = readFileSync(join(webRoot, 'vite.config.ts'), 'utf8')
  const shareRoutesSrc = readFileSync(join(repoRoot, 'packages/api/src/routes/share-routes.ts'), 'utf8')

  it('robots.txt disallows all crawling', () => {
    assert.match(robotsTxt, /User-agent:\s*\*/i)
    assert.match(robotsTxt, /Disallow:\s*\//)
  })

  it('Helmet components emit robots meta (index.html defers to AppRobotsMeta)', () => {
    assert.doesNotMatch(indexHtml, /noindex,\s*nofollow,\s*noarchive,\s*nosnippet/)
    assert.match(scopeMetaSrc, /KINK_SOCIAL_ROBOTS_META/)
    assert.match(scopeMetaSrc, /VITE_PUBLIC_LAUNCH/)
    assert.match(appRobotsSrc, /KINK_SOCIAL_ROBOTS_META/)
    assert.match(appRobotsSrc, /VITE_PUBLIC_LAUNCH/)
  })

  it('ScopePageMeta respects public launch flag and explicit noIndex override', () => {
    assert.match(scopeMetaSrc, /content=\{robots\}/)
    assert.match(scopeMetaSrc, /KINK_SOCIAL_PUBLIC_LAUNCH_ROBOTS_META/)
    assert.equal(KINK_SOCIAL_ROBOTS_META, 'noindex, nofollow, noarchive, nosnippet')
  })

  it('Caddy sets X-Robots-Tag only when public launch is disabled', () => {
    assert.match(caddyfile, /C2K_PUBLIC_LAUNCH/)
    assert.match(caddyfile, new RegExp(KINK_SOCIAL_X_ROBOTS_TAG.replace(/,\s*/g, ',\\s*')))
    assert.doesNotMatch(nginxConf, new RegExp(KINK_SOCIAL_X_ROBOTS_TAG.replace(/,\s*/g, ',\\s*')))
  })

  it('sitemap is launch-gated at build time and footer does not link to kink.social sitemap', () => {
    assert.match(nginxConf, /location\s*=\s*\/sitemap\.xml/)
    assert.match(nginxConf, /try_files\s+\/sitemap\.xml/)
    assert.match(viteConfigSrc, /\/sitemap\.xml/)
    assert.match(viteConfigSrc, /VITE_PUBLIC_LAUNCH/)
    assert.doesNotMatch(footerSrc, /to="\/sitemap\.xml"/)
  })

  it('security.txt is served at /.well-known with legacy redirect', () => {
    assert.match(nginxConf, /location\s*=\s*\/\.well-known\/security\.txt/)
    assert.match(nginxConf, /location\s*=\s*\/security\.txt/)
    assert.match(viteConfigSrc, /\.well-known\/security\.txt/)
    assert.match(buildKinkSocialSecurityTxt('https://kink.social'), /Contact: mailto:sheldonkinneymmo\.tm@gmail\.com/)
    assert.match(buildKinkSocialSecurityTxt('https://kink.social'), /Expires: 2027-06-30T09:27:00\.000Z/)
  })

  it('share crawler HTML is noindex with X-Robots-Tag header', () => {
    assert.match(shareRoutesSrc, /X-Robots-Tag/)
    assert.match(shareRoutesSrc, /KINK_SOCIAL_ROBOTS_META/)
  })
})

describe('ECKE publish boundary', () => {
  it('ECKE URLs use eastcoastkinkevents.com, not kink.social', () => {
    const dancecardPayloadSrc = readFileSync(
      join(repoRoot, 'packages/api/src/lib/ecke-publish-payload.ts'),
      'utf8',
    )
    assert.match(dancecardPayloadSrc, /eastcoastkinkevents\.com/)
    assert.doesNotMatch(dancecardPayloadSrc, /kink\.social/)
  })
})
