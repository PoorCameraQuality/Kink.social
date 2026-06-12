/**
 * Production runtime guards - auth fallback and destructive DB operations.
 * Import from server/worker startup and destructive DB scripts only.
 */

import {
  isProductionRuntime as sharedIsProductionRuntime,
  mediaScannerAllowNoopEnabled,
  readMediaScannerStartupConfig,
} from '@c2k/shared'

export function isProductionRuntime(): boolean {
  return sharedIsProductionRuntime()
}

function authFallbackEnvValue(): string | undefined {
  return process.env.AUTH_ALLOW_FALLBACK ?? process.env.VITE_AUTH_ALLOW_FALLBACK
}

/** True only when env explicitly sets fallback to "true". */
export function isAuthFallbackExplicitlyEnabled(): boolean {
  return authFallbackEnvValue() === 'true'
}

/**
 * Session mock viewer (RopeDreamer) for unauthenticated reads in dev/demo.
 * Always false in production; in non-production, disabled only when env is literally "false".
 */
export function allowAuthFallback(): boolean {
  if (isProductionRuntime()) return false
  return authFallbackEnvValue() !== 'false'
}

/**
 * Refuse API/worker startup when auth fallback is explicitly enabled in production.
 */
const DEV_AUTH_SECRET = 'dev-insecure-auth-secret-change-me-in-env'
const DEV_COOKIE_SECRET = 'dev-cookie-secret-change-in-production'

/**
 * Refuse API/worker startup when production uses missing or dev-default session/cookie secrets.
 */
export function assertProductionSecretsForStartup(log: Pick<Console, 'info' | 'error'> = console): void {
  if (!isProductionRuntime()) return

  const authSecret = process.env.AUTH_SECRET?.trim() ?? ''
  const cookieSecret = process.env.COOKIE_SECRET?.trim() ?? ''
  const problems: string[] = []

  if (!authSecret || authSecret === DEV_AUTH_SECRET) {
    problems.push('AUTH_SECRET must be set to a strong unique value in production')
  }
  if (!cookieSecret || cookieSecret === DEV_COOKIE_SECRET) {
    problems.push('COOKIE_SECRET must be set to a strong unique value in production')
  }

  if (problems.length > 0) {
    for (const msg of problems) log.error(`Fatal: ${msg}`)
    process.exit(1)
  }

  log.info('Production auth/cookie secrets configured.')
}

export function assertAuthFallbackSafeForStartup(log: Pick<Console, 'info' | 'error'> = console): void {
  if (!isProductionRuntime()) {
    if (allowAuthFallback()) {
      log.info('Auth fallback enabled for non-production (mock viewer when unauthenticated).')
    }
    return
  }

  if (isAuthFallbackExplicitlyEnabled()) {
    log.error(
      'Fatal: auth fallback cannot be enabled in production. Set AUTH_ALLOW_FALLBACK=false or unset AUTH_ALLOW_FALLBACK.',
    )
    process.exit(1)
  }

  log.info('Auth fallback disabled in production.')
}

/**
 * Refuse API/worker startup when production enables scanner noop without operator ack.
 */
export function assertMediaScannerSafeForStartup(log: Pick<Console, 'info' | 'error'> = console): void {
  const config = readMediaScannerStartupConfig()
  log.info(
    `Media scanner profile=${config.runtimeProfile} strict=${config.strictMode} allowNoop=${config.allowNoop} malwareMode=${config.malwareMode}`,
  )

  if (!isProductionRuntime()) return

  const noopAck = process.env.MEDIA_SCANNER_ALLOW_NOOP_PRODUCTION_ACK === 'true'
  if (mediaScannerAllowNoopEnabled() && !noopAck) {
    log.error(
      'Fatal: MEDIA_SCANNER_ALLOW_NOOP=true in production requires MEDIA_SCANNER_ALLOW_NOOP_PRODUCTION_ACK=true.',
    )
    process.exit(1)
  }
}

/**
 * Block seed/wipe in production unless operator sets C2K_ALLOW_DESTRUCTIVE_DB_RESET=true.
 */
export function assertDestructiveDbAllowed(
  operation: 'seed' | 'wipe',
  log: Pick<Console, 'error' | 'warn'> = console,
): void {
  if (!isProductionRuntime()) return

  if (process.env.C2K_ALLOW_DESTRUCTIVE_DB_RESET !== 'true') {
    log.error(
      `Fatal: db:${operation} refused in production. Do not run destructive commands against production data.`,
    )
    log.error(
      'If you truly intend to destroy production data, set C2K_ALLOW_DESTRUCTIVE_DB_RESET=true (not recommended).',
    )
    process.exit(1)
  }

  log.warn(`WARNING: destructive db:${operation} running in production (C2K_ALLOW_DESTRUCTIVE_DB_RESET=true).`)
}

/** Warn when DATABASE_URL hostname looks like a managed/production host (non-blocking). */
export function warnIfProductionDatabaseUrl(log: Pick<Console, 'warn'> = console): void {
  const url = process.env.DATABASE_URL
  if (!url) return
  try {
    const host = new URL(url.replace(/^postgresql:\/\//, 'postgres://')).hostname.toLowerCase()
    const suspicious =
      /(?:\.rds\.|\.supabase\.|neon\.tech|render\.com|railway\.|planetscale|azure|cloud\.google)/.test(host) ||
      (!isProductionRuntime() && !['localhost', '127.0.0.1', 'postgres', 'host.docker.internal'].includes(host))
    if (suspicious && !isProductionRuntime()) {
      log.warn(
        `DATABASE_URL host "${host}" may be non-local. Confirm before running db:seed or db:wipe (destructive in default seed path).`,
      )
    }
  } catch {
    /* ignore parse errors */
  }
}
