import { loadEckeIngestApiConfig, loadEckePublishClientConfig } from './ecke-publish-client.js'

export type EckeHealthMode = 'disabled' | 'ingest-api' | 'supabase' | 'misconfigured'

export type EckeHealthResult = {
  ok: boolean
  enabled: boolean
  mode: EckeHealthMode
  ingestConfigured: boolean
  supabaseConfigured: boolean
  listingWebhookConfigured: boolean
  issues: string[]
}

/** Config-only ECKE bridge diagnostic — no outbound publish or ingest calls. */
export function eckeHealthDiagnostic(): EckeHealthResult {
  const enabled = process.env.ECKE_PUBLISH_ENABLED === 'true'
  if (!enabled) {
    return {
      ok: true,
      enabled: false,
      mode: 'disabled',
      ingestConfigured: false,
      supabaseConfigured: false,
      listingWebhookConfigured: false,
      issues: [],
    }
  }

  const ingestConfigured = loadEckeIngestApiConfig() !== null
  const supabaseConfigured = loadEckePublishClientConfig() !== null
  const listingWebhookConfigured = Boolean(process.env.ECKE_PUBLISH_LISTING_WEBHOOK_URL?.trim())

  const issues: string[] = []
  let mode: EckeHealthMode

  if (ingestConfigured) {
    mode = 'ingest-api'
  } else if (supabaseConfigured) {
    mode = 'supabase'
  } else {
    mode = 'misconfigured'
    const hasIngestEndpoint = Boolean(process.env.ECKE_PUBLISH_ENDPOINT?.trim())
    const hasIngestSecret = Boolean(process.env.ECKE_PUBLISH_SECRET?.trim())
    const hasSupabaseUrl = Boolean(process.env.ECKE_SUPABASE_URL?.trim())
    const hasSupabaseKey = Boolean(process.env.ECKE_SUPABASE_SERVICE_ROLE_KEY?.trim())

    if (!hasIngestEndpoint && !hasSupabaseUrl) {
      issues.push('ECKE publish enabled but neither ingest endpoint nor Supabase URL is configured')
    }
    if (hasIngestEndpoint && !hasIngestSecret) {
      issues.push('ECKE_PUBLISH_SECRET missing for ingest API mode')
    }
    if (hasSupabaseUrl && !hasSupabaseKey) {
      issues.push('ECKE_SUPABASE_SERVICE_ROLE_KEY missing for Supabase mode')
    }
    if (issues.length === 0) {
      issues.push('ECKE publish enabled but bridge configuration is incomplete')
    }
  }

  return {
    ok: issues.length === 0,
    enabled: true,
    mode,
    ingestConfigured,
    supabaseConfigured,
    listingWebhookConfigured,
    issues,
  }
}
