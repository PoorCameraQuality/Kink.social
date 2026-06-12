import type { FastifyRequest } from 'fastify'

export function getRequestIpRaw(req: FastifyRequest): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0]?.trim() ?? '127.0.0.1'
  }
  const addr = req.socket.remoteAddress
  return addr && addr.length > 0 ? addr : '127.0.0.1'
}

/**
 * Registration / ban bucket: IPv4 as-is (strip IPv4-mapped IPv6 wrapper).
 * IPv6: store the first four hextets (IPv6 slash-64 style grouping).
 */
export function registrationIpPrefixFromRequest(req: FastifyRequest): string {
  const raw = getRequestIpRaw(req)
  const v4mapped = raw.replace(/^::ffff:/i, '')
  if (!v4mapped.includes(':')) {
    return v4mapped.slice(0, 64)
  }
  const host = v4mapped.split('%')[0] ?? v4mapped
  const parts = host.split(':').filter((p) => p.length > 0)
  if (parts.length >= 4) {
    return parts.slice(0, 4).join(':').toLowerCase()
  }
  return host.toLowerCase().slice(0, 64)
}

/** Full normalized client IP for reputation events (best-effort). */
export function clientIpLabel(req: FastifyRequest): string {
  return getRequestIpRaw(req).replace(/^::ffff:/i, '').slice(0, 64)
}
