import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { and, eq, gt, isNull } from 'drizzle-orm'
import type { FastifyRequest } from 'fastify'
import { db, schema } from '../db/index.js'
import { clientIpLabel } from './client-ip.js'
import {
  mailProductName,
  passwordChangedEmailSubject,
  passwordResetEmailSubject,
} from './mail-branding.js'
import { sendEmail } from './mailer.js'
import { findUserByLoginIdentifier, getEmailFromUserRow } from './user-email.js'

export const PASSWORD_RESET_GENERIC_MESSAGE =
  'If an account matches that information, you will receive password recovery instructions shortly.'

const TOKEN_TTL_MS = Number(process.env.C2K_PASSWORD_RESET_TTL_MS ?? 45 * 60 * 1000)

export function hashPasswordResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('base64url')
}

export function passwordResetPublicWebUrl(): string {
  const base = (process.env.C2K_PUBLIC_WEB_URL ?? 'http://127.0.0.1:5173').replace(/\/+$/, '')
  return base
}

export function buildPasswordResetLink(rawToken: string): string {
  return `${passwordResetPublicWebUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`
}

export function buildPasswordResetEmail(rawToken: string): { subject: string; text: string; html: string } {
  const link = buildPasswordResetLink(rawToken)
  const product = mailProductName()
  const subject = passwordResetEmailSubject()
  const ttlMinutes = Math.round(TOKEN_TTL_MS / 60_000)
  const text = [
    `We received a request to recover your ${product} password.`,
    '',
    `Recover your password (link expires in about ${ttlMinutes} minutes):`,
    link,
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n')
  const html = [
    `<p>We received a request to recover your ${product} password.</p>`,
    `<p><a href="${link}">Recover your password</a> (link expires in about ${ttlMinutes} minutes).</p>`,
    '<p>If you did not request this, you can ignore this email.</p>',
  ].join('')
  return { subject, text, html }
}

export function buildPasswordChangedEmail(): { subject: string; text: string; html: string } {
  const product = mailProductName()
  const subject = passwordChangedEmailSubject()
  const text = [
    `Your ${product} password was changed.`,
    '',
    'If you did not make this change, contact support immediately.',
  ].join('\n')
  const html = [
    `<p>Your ${product} password was changed.</p>`,
    '<p>If you did not make this change, contact support immediately.</p>',
  ].join('')
  return { subject, text, html }
}

export async function requestPasswordReset(input: {
  identifier: string
  req: FastifyRequest
  log: { warn: (obj: object, msg?: string) => void }
}): Promise<{ ok: true; message: string }> {
  const identifier = input.identifier.trim()
  if (!identifier) {
    return { ok: true, message: PASSWORD_RESET_GENERIC_MESSAGE }
  }

  const user = await findUserByLoginIdentifier(identifier)
  if (!user) {
    return { ok: true, message: PASSWORD_RESET_GENERIC_MESSAGE }
  }

  const rawToken = generatePasswordResetToken()
  const tokenHash = hashPasswordResetToken(rawToken)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
  const requestIp = clientIpLabel(input.req).slice(0, 64)

  await db.insert(schema.passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
    requestIp,
  })

  const emailContent = buildPasswordResetEmail(rawToken)
  const recipient = getEmailFromUserRow(user)
  if (recipient) {
    const sent = await sendEmail({
      to: recipient,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      sensitive: true,
      category: 'password_reset',
    })
    if (!sent.ok) {
      input.log.warn({ err: sent.error, userId: user.id }, 'password reset email failed')
    }
  }

  return { ok: true, message: PASSWORD_RESET_GENERIC_MESSAGE }
}

export type PasswordResetConfirmResult =
  | { ok: true }
  | { ok: false; status: 400 | 410; error: string }

export async function confirmPasswordReset(input: {
  rawToken: string
  newPassword: string
  log: { warn: (obj: object, msg?: string) => void }
}): Promise<PasswordResetConfirmResult> {
  const rawToken = input.rawToken.trim()
  if (!rawToken || rawToken.length < 16) {
    return { ok: false, status: 400, error: 'Invalid or expired reset link' }
  }
  if (input.newPassword.length < 12 || input.newPassword.length > 128) {
    return { ok: false, status: 400, error: 'Password must be 12–128 characters' }
  }

  const tokenHash = hashPasswordResetToken(rawToken)
  const [row] = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!row) {
    return { ok: false, status: 410, error: 'Invalid or expired reset link' }
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12)
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, row.userId)).limit(1)
  if (!user) {
    return { ok: false, status: 410, error: 'Invalid or expired reset link' }
  }

  await db
    .update(schema.users)
    .set({ passwordHash, sessionVersion: (user.sessionVersion ?? 0) + 1 })
    .where(eq(schema.users.id, row.userId))

  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, row.id))

  const recipient = getEmailFromUserRow(user)
  if (recipient) {
    const changed = buildPasswordChangedEmail()
    const sent = await sendEmail({
      to: recipient,
      subject: changed.subject,
      text: changed.text,
      html: changed.html,
      sensitive: true,
      category: 'password_changed',
    })
    if (!sent.ok) {
      input.log.warn({ err: sent.error, userId: row.userId }, 'password changed email failed')
    }
  }

  return { ok: true }
}

/** Constant-time compare for tests / optional validation helpers. */
export function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}
