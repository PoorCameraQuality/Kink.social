import {
  AGE_VERIFICATION_STATUSES,
  CURRENT_POLICY_VERSION,
  defaultFeedSettings,
  defaultNotificationSettings,
  defaultPrivacySettings,
} from '@c2k/shared'
import {
  encodeSession,
  SESSION_COOKIE_NAME,
  type SessionPayload,
} from '@c2k/shared/session-token'
import bcrypt from 'bcryptjs'
import { count, eq } from 'drizzle-orm'
import type { FastifyInstance, FastifyReply } from 'fastify'
import { z } from 'zod'
import { validatePublicUsername } from '@c2k/shared'
import { getMockPersonByUsername } from '../data/mock-seeds.js'
import { db, schema } from '../db/index.js'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import { rateLimitRoute, passwordResetIdentifierKey } from '../lib/rate-limit-config.js'
import { registrationIpPrefixFromRequest } from '../lib/client-ip.js'
import { checkIdentityBan, isUserIdentityBanned } from '../lib/peer-reputation.js'
import { changePasswordForUser } from '../lib/change-password.js'
import {
  confirmPasswordReset,
  PASSWORD_RESET_GENERIC_MESSAGE,
  requestPasswordReset,
} from '../lib/password-reset.js'
import { isPasswordResetEnabled } from '../lib/mail-config.js'
import { sessionPayloadForUser } from '../auth/session-version.js'
import { findUserByLoginIdentifier, getEmailFromUserRow, prepareEmailStorage } from '../lib/user-email.js'
import { sendAccountWelcomeEmail } from '../lib/transactional-email.js'
import { dbUnavailablePayload, isDbConnectionError } from '../lib/db-connection-error.js'

const DEMO_PASSWORD = process.env.DEMO_LOGIN_PASSWORD ?? 'demo'

function useDatabase(): boolean {
  return process.env.USE_DATABASE === 'true'
}

function requireAuthSecret(reply: FastifyReply): boolean {
  if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
    reply.status(500).send({ error: 'AUTH_SECRET is not set' })
    return false
  }
  return true
}

function sessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    ...(maxAge !== undefined ? { maxAge } : {}),
  }
}

function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    ...sessionCookieOptions(60 * 60 * 24 * 7),
  })
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get('/api/auth/session', async (req, reply) => {
    if (!requireAuthSecret(reply)) return
    const r = resolveViewerFromRequest(req)
    let email: string | null = null
    let displayName: string | null = null
    if (r.authenticated && r.payload?.sub && useDatabase()) {
      try {
        const uid = r.payload.sub
        const [row] = await db
          .select({
            email: schema.users.email,
            emailCiphertext: schema.users.emailCiphertext,
            emailKeyVersion: schema.users.emailKeyVersion,
            displayName: schema.profiles.displayName,
          })
          .from(schema.users)
          .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
          .where(eq(schema.users.id, uid))
          .limit(1)
        if (row) {
          email = getEmailFromUserRow(row)
          displayName = row.displayName ?? null
        }
      } catch (err) {
        req.log.error({ err }, 'GET /api/auth/session profile lookup failed')
      }
    }
    return reply.send({
      authenticated: r.authenticated,
      username: r.username,
      fallback: r.fallback,
      userId: r.authenticated ? (r.payload?.sub ?? null) : null,
      email,
      displayName,
    })
  })

  app.post('/api/auth/session', { ...rateLimitRoute('login') }, async (req, reply) => {
    if (!requireAuthSecret(reply)) return

    const body = req.body as { username?: unknown; password?: unknown } | null
    if (body === null || typeof body !== 'object') {
      return reply.status(400).send({ error: 'Invalid JSON' })
    }

    const loginIdentifier = typeof body.username === 'string' ? body.username.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!loginIdentifier || !password) {
      return reply.status(400).send({ error: 'Username or email and password required' })
    }

    if (useDatabase()) {
      try {
        if (await checkIdentityBan(req)) {
          return reply.status(403).send({ error: 'Access denied' })
        }
        const user = await findUserByLoginIdentifier(loginIdentifier)
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
          return reply.status(401).send({ error: 'Invalid credentials' })
        }
        if (await isUserIdentityBanned(user.id)) {
          return reply.status(403).send({ error: 'Access denied' })
        }
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
        // Reactivation / cleanup based on last-online proxy (profiles.updatedAt).
        const [profile] = await db
          .select({ updatedAt: schema.profiles.updatedAt })
          .from(schema.profiles)
          .where(eq(schema.profiles.userId, user.id))
          .limit(1)
        if (profile?.updatedAt && profile.updatedAt <= twoYearsAgo) {
          // Dormant accounts are handled by abandoned-account-sweep — never delete on login.
          return reply.status(403).send({
            error: 'Account inactive. Contact support or sign up again.',
            code: 'account_dormant',
          })
        }
        // Login makes the user active again and restarts the countdown.
        if (!profile) {
          await db.insert(schema.profiles).values({ userId: user.id })
        } else if (profile.updatedAt && profile.updatedAt <= oneYearAgo) {
          await db
            .update(schema.profiles)
            .set({ updatedAt: new Date() })
            .where(eq(schema.profiles.userId, user.id))
        } else {
          await db
            .update(schema.profiles)
            .set({ updatedAt: new Date() })
            .where(eq(schema.profiles.userId, user.id))
        }
        await db
          .update(schema.users)
          .set({ lastSeenAt: new Date() })
          .where(eq(schema.users.id, user.id))
        const payload = await sessionPayloadForUser({
          id: user.id,
          username: user.username,
          sessionVersion: user.sessionVersion,
        })
        const token = encodeSession(payload)
        setSessionCookie(reply, token)
        return reply.send({
          authenticated: true,
          username: payload.username,
          fallback: false,
        })
      } catch (err) {
        if (isDbConnectionError(err)) {
          req.log.error({ err }, 'POST /api/auth/session database unavailable')
          return reply.status(503).send(dbUnavailablePayload())
        }
        throw err
      }
    }

    if (password !== DEMO_PASSWORD) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const person = getMockPersonByUsername(loginIdentifier)
    if (!person) {
      return reply.status(400).send({ error: 'Unknown username (demo only allows seed users)' })
    }

    const payload: SessionPayload = { username: person.username, sub: person.id }
    const token = encodeSession(payload)
    setSessionCookie(reply, token)
    return reply.send({
      authenticated: true,
      username: payload.username,
      fallback: false,
    })
  })

  app.get('/api/auth/me', async (req, reply) => {
    if (!requireAuthSecret(reply)) return
    const r = resolveViewerFromRequest(req)
    const username = r.username
    const person = username ? (getMockPersonByUsername(username) ?? null) : null

    return reply.send({
      viewer: {
        authenticated: r.authenticated,
        fallback: r.fallback,
        username,
        sub: r.payload?.sub ?? null,
        person,
      },
    })
  })

  app.post('/api/auth/logout', async (_req, reply) => {
    reply.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions(0))
    return reply.send({ ok: true })
  })

  const registerBody = z.object({
    username: z.string().min(2).max(64),
    email: z.string().email(),
    password: z.string().min(8),
    inviteCode: z.string().optional(),
    ageAffirmed: z.literal(true, {
      errorMap: () => ({ message: 'You must confirm you are at least 18 years old' }),
    }),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and community rules' }),
    }),
  })

  app.get('/api/auth/registration-policy', async () => {
    const registrationOpen = process.env.C2K_REGISTRATION_OPEN !== 'false'
    const inviteRequired = Boolean(process.env.C2K_REGISTRATION_INVITE_CODE?.trim())
    return {
      registrationOpen,
      inviteRequired,
    }
  })

  app.post('/api/auth/register', { ...rateLimitRoute('register') }, async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Registration requires USE_DATABASE=true' })
    }
    if (process.env.C2K_REGISTRATION_OPEN === 'false') {
      return reply.status(403).send({ error: 'Registration is closed for this test server' })
    }
    const requiredInvite = process.env.C2K_REGISTRATION_INVITE_CODE?.trim()
    if (requiredInvite) {
      const body = req.body as { inviteCode?: unknown } | null
      const provided = typeof body?.inviteCode === 'string' ? body.inviteCode.trim() : ''
      if (provided !== requiredInvite) {
        return reply.status(403).send({ error: 'Valid invite code required' })
      }
    }
    try {
      if (await checkIdentityBan(req)) {
        return reply.status(403).send({ error: 'Access denied' })
      }
    } catch (err) {
      if (isDbConnectionError(err)) {
        req.log.error({ err }, 'POST /api/auth/register database unavailable (identity ban check)')
        return reply.status(503).send(dbUnavailablePayload())
      }
      throw err
    }
    const parsed = registerBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body' })
    }
    const { username, email, password } = parsed.data
    const usernameError = validatePublicUsername(username, email)
    if (usernameError) {
      return reply.status(400).send({ error: usernameError })
    }
    const now = new Date()
    const regIpPrefix = registrationIpPrefixFromRequest(req)
    const hash = await bcrypt.hash(password, 12)
    const emailFields = prepareEmailStorage(email)
    try {
      if (process.env.C2K_ONE_PROFILE_PER_IP_STRICT === 'true' && regIpPrefix.length > 0) {
        const [row] = await db
          .select({ c: count() })
          .from(schema.users)
          .where(eq(schema.users.registrationIpPrefix, regIpPrefix))
        if (Number(row?.c ?? 0) > 0) {
          return reply.status(409).send({ error: 'An account already exists from this network' })
        }
      }
      const [user] = await db
        .insert(schema.users)
        .values({
          username,
          ...emailFields,
          passwordHash: hash,
          registrationIpPrefix: regIpPrefix,
          ageAffirmedAt: now,
          termsAcceptedAt: now,
          policyVersionAccepted: CURRENT_POLICY_VERSION,
          ageVerificationStatus: AGE_VERIFICATION_STATUSES.selfAttested,
        })
        .returning()
      if (!user) throw new Error('insert failed')
      await db.insert(schema.profiles).values({ userId: user.id })
      await db.insert(schema.userSettings).values({
        userId: user.id,
        privacySettings: defaultPrivacySettings,
        notificationSettings: defaultNotificationSettings,
        feedSettings: defaultFeedSettings,
      })
      const payload = await sessionPayloadForUser({
        id: user.id,
        username: user.username,
        sessionVersion: user.sessionVersion,
      })
      const token = encodeSession(payload)
      setSessionCookie(reply, token)
      void (async () => {
        const sent = await sendAccountWelcomeEmail({ to: email, username: user.username })
        if (!sent.ok) {
          req.log.warn({ err: sent.error, userId: user.id }, 'account welcome email failed')
        }
      })()
      return reply.send({ authenticated: true, username: user.username, fallback: false })
    } catch (err) {
      if (isDbConnectionError(err)) {
        req.log.error({ err }, 'POST /api/auth/register database unavailable')
        return reply.status(503).send(dbUnavailablePayload())
      }
      return reply.status(409).send({ error: 'Username or email already taken' })
    }
  })

  const passwordResetRequestBody = z.object({
    identifier: z.string().min(1).max(320),
  })

  app.post('/api/auth/password-reset/request', {
    ...rateLimitRoute('passwordResetRequest', { keySuffix: passwordResetIdentifierKey }),
  }, async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Password reset requires USE_DATABASE=true' })
    }
    if (!isPasswordResetEnabled()) {
      return reply.status(503).send({ error: 'Password reset is disabled on this server' })
    }
    const parsed = passwordResetRequestBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body' })
    }
    const result = await requestPasswordReset({
      identifier: parsed.data.identifier,
      req,
      log: req.log,
    })
    return reply.send({ ok: true, message: result.message })
  })

  const passwordResetConfirmBody = z.object({
    token: z.string().min(16).max(256),
    password: z.string().min(12).max(128),
  })

  app.post('/api/auth/password-reset/confirm', { ...rateLimitRoute('passwordResetConfirm') }, async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Password reset requires USE_DATABASE=true' })
    }
    if (!isPasswordResetEnabled()) {
      return reply.status(503).send({ error: 'Password reset is disabled on this server' })
    }
    const parsed = passwordResetConfirmBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body' })
    }
    const result = await confirmPasswordReset({
      rawToken: parsed.data.token,
      newPassword: parsed.data.password,
      log: req.log,
    })
    if (!result.ok) {
      return reply.status(result.status).send({ error: result.error })
    }
    return reply.send({ ok: true })
  })

  app.get('/api/auth/password-reset/policy', async () => ({
    enabled: isPasswordResetEnabled(),
    genericMessage: PASSWORD_RESET_GENERIC_MESSAGE,
  }))

  const passwordChangeBody = z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(12).max(128),
  })

  app.post('/api/auth/password/change', { ...rateLimitRoute('passwordChange') }, async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Password change requires USE_DATABASE=true' })
    }
    const v = resolveViewerFromRequest(req)
    if (!v.authenticated || !v.payload?.sub) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const userId = v.payload.sub
    const parsed = passwordChangeBody.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body' })
    }
    const result = await changePasswordForUser({
      userId,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      log: req.log,
    })
    if (!result.ok) {
      return reply.status(result.status).send({ error: result.error })
    }
    return reply.send({ ok: true })
  })
}
