/**
 * Login identifier + password reset integration tests.
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, before, describe, test } from 'node:test'
import bcrypt from 'bcryptjs'
import { desc, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import {
  confirmPasswordReset,
  generatePasswordResetToken,
  hashPasswordResetToken,
  requestPasswordReset,
} from '../lib/password-reset.js'
import { prepareEmailStorage } from '../lib/user-email.js'
import { buildCookieApp, deleteUsers, ensureCiAuthSecret } from './ci-db-harness.js'

const runDbTests = process.env.USE_DATABASE === 'true'

async function buildAuthApp() {
  return buildCookieApp(async (a) => {
    const { registerAuthRoutes } = await import('../routes/auth.js')
    const { registerApiRateLimit } = await import('../lib/register-rate-limit.js')
    await registerApiRateLimit(a)
    await registerAuthRoutes(a)
  })
}

async function login(app: Awaited<ReturnType<typeof buildAuthApp>>, identifier: string, password: string) {
  return app.inject({
    method: 'POST',
    url: '/api/auth/session',
    payload: { username: identifier, password },
  })
}

describe('auth login identifier', { skip: !runDbTests }, () => {
  const tag = randomUUID().slice(0, 8)
  let userId: string
  let username: string
  let email: string
  const password = 'OldPassword!234'
  const userIds: string[] = []

  before(async () => {
    ensureCiAuthSecret()
    process.env.C2K_MAIL_TRANSPORT = 'disabled'
    userId = randomUUID()
    username = `login_${tag}`
    email = `${username}@ci.c2k.test`
    userIds.push(userId)
    const hash = await bcrypt.hash(password, 12)
    await db.insert(schema.users).values({
      id: userId,
      username,
      ...prepareEmailStorage(email),
      passwordHash: hash,
    })
    await db.insert(schema.profiles).values({ userId })
  })

  after(async () => {
    await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId))
    await deleteUsers(userIds)
  })

  test('login by username works', async () => {
    const app = await buildAuthApp()
    const res = await login(app, username, password)
    assert.equal(res.statusCode, 200)
    const body = res.json() as { authenticated?: boolean; username?: string }
    assert.equal(body.authenticated, true)
    assert.equal(body.username, username)
    await app.close()
  })

  test('login by email works', async () => {
    const app = await buildAuthApp()
    const res = await login(app, email, password)
    assert.equal(res.statusCode, 200)
    const body = res.json() as { authenticated?: boolean; username?: string }
    assert.equal(body.authenticated, true)
    assert.equal(body.username, username)
    await app.close()
  })

  test('login by email with different casing works', async () => {
    const app = await buildAuthApp()
    const res = await login(app, email.toUpperCase(), password)
    assert.equal(res.statusCode, 200)
    await app.close()
  })

  test('wrong password returns generic invalid credentials', async () => {
    const app = await buildAuthApp()
    const res = await login(app, email, 'NotThePassword!234')
    assert.equal(res.statusCode, 401)
    const body = res.json() as { error?: string }
    assert.equal(body.error, 'Invalid credentials')
    await app.close()
  })

  test('unknown identifier returns generic invalid credentials', async () => {
    const app = await buildAuthApp()
    const res = await login(app, `missing_${tag}@example.com`, password)
    assert.equal(res.statusCode, 401)
    const body = res.json() as { error?: string }
    assert.equal(body.error, 'Invalid credentials')
    await app.close()
  })

  test('dormant account returns 403 without deleting user', async () => {
    const dormantId = randomUUID()
    const dormantUsername = `dormant_${tag}`
    userIds.push(dormantId)
    const hash = await bcrypt.hash(password, 12)
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000)
    await db.insert(schema.users).values({
      id: dormantId,
      username: dormantUsername,
      ...prepareEmailStorage(`${dormantUsername}@ci.c2k.test`),
      passwordHash: hash,
    })
    await db.insert(schema.profiles).values({ userId: dormantId, updatedAt: threeYearsAgo })

    const app = await buildAuthApp()
    const res = await login(app, dormantUsername, password)
    assert.equal(res.statusCode, 403)
    const body = res.json() as { error?: string; code?: string }
    assert.equal(body.code, 'account_dormant')
    assert.match(body.error ?? '', /inactive/i)

    const [stillThere] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, dormantId))
      .limit(1)
    assert.ok(stillThere, 'dormant login must not delete the user row')
    await app.close()
  })

  test('reset by email then login by username and email with new password', async () => {
    await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId))
    const newPassword = 'NewPassword!234567'

    await requestPasswordReset({
      identifier: email,
      req: { log: { warn: () => {} } } as never,
      log: { warn: () => {} },
    })

    const [tokenRow] = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.userId, userId))
      .orderBy(desc(schema.passwordResetTokens.createdAt))
      .limit(1)
    assert.ok(tokenRow)

    const raw = generatePasswordResetToken()
    await db
      .update(schema.passwordResetTokens)
      .set({ tokenHash: hashPasswordResetToken(raw) })
      .where(eq(schema.passwordResetTokens.id, tokenRow!.id))

    const confirm = await confirmPasswordReset({
      rawToken: raw,
      newPassword,
      log: { warn: () => {} },
    })
    assert.equal(confirm.ok, true)

    const app = await buildAuthApp()
    const oldLogin = await login(app, username, password)
    assert.equal(oldLogin.statusCode, 401)

    const byUsername = await login(app, username, newPassword)
    assert.equal(byUsername.statusCode, 200)

    const byEmail = await login(app, email, newPassword)
    assert.equal(byEmail.statusCode, 200)
    await app.close()
  })
})
