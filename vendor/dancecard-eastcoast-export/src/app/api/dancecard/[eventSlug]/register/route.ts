import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import bcrypt from 'bcryptjs'
import { codesEqual } from '@/lib/dancecard/accessCodes'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { registerBodySchema } from '@/lib/dancecard/schemas'
import { newSessionToken, hashToken, DANCECARD_SESSION_COOKIE, DANCECARD_COOKIE_PATH, SESSION_DAYS } from '@/lib/dancecard/session'

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const body = registerBodySchema.parse(await request.json())
    const regGate = String((event as { registration_access_code?: string }).registration_access_code ?? '').trim()
    if (regGate) {
      const provided = String(body.registrationAccessCode ?? '').trim()
      if (!provided || !codesEqual(provided, regGate)) {
        return NextResponse.json({ error: 'Invalid or missing event access code' }, { status: 401 })
      }
    }
    const passwordHash = await bcrypt.hash(body.password, 10)

    const { data: account, error: insErr } = await admin
      .from('dancecard_accounts')
      .insert({
        event_id: event.id,
        username: body.username.toLowerCase(),
        password_hash: passwordHash,
        display_name: body.displayName,
      })
      .select('id, username, display_name')
      .single()
    if (insErr) {
      if (insErr.code === '23505') {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      throw insErr
    }

    const { error: prefErr } = await admin.from('dancecard_prefs').insert({
      account_id: account.id,
      buffer_minutes: 0,
    })
    if (prefErr) throw prefErr

    const token = newSessionToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString()
    const { error: sessErr } = await admin.from('dancecard_sessions').insert({
      account_id: account.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    if (sessErr) throw sessErr

    const res = NextResponse.json({
      account: { id: account.id, username: account.username, displayName: account.display_name },
    })
    res.cookies.set(DANCECARD_SESSION_COOKIE, token, {
      httpOnly: true,
      path: DANCECARD_COOKIE_PATH,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DAYS * 86400,
    })
    return res
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
