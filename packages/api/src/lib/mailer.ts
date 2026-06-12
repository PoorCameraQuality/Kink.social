/**

 * Pluggable outbound email (SMTP or Resend). Default: disabled (dev-safe).

 * Set C2K_PLATFORM_MAIL_BCC to BCC the site owner on every outbound message.

 */

import { APP_NAME } from '@c2k/shared'
import nodemailer from 'nodemailer'



export type SendEmailInput = {

  to: string | string[]

  subject: string

  text: string

  html?: string

  headers?: Record<string, string>

  /** Extra BCC recipients (merged with C2K_PLATFORM_MAIL_BCC). */

  bcc?: string | string[]

}



export function mailTransportMode(): 'disabled' | 'smtp' | 'resend' {

  const t = (process.env.C2K_MAIL_TRANSPORT ?? 'disabled').toLowerCase().trim()

  if (t === 'smtp' || t === 'resend') return t

  return 'disabled'

}



export function platformMailBcc(): string[] {

  const raw = process.env.C2K_PLATFORM_MAIL_BCC?.trim()

  if (!raw) return []

  return raw

    .split(',')

    .map((s) => s.trim())

    .filter((s) => s.length > 0 && s.includes('@'))

}



function normalizeRecipients(v: string | string[]): string[] {

  const list = Array.isArray(v) ? v : [v]

  return list.map((s) => s.trim()).filter((s) => s.includes('@'))

}



function mergeBcc(explicit?: string | string[]): string[] | undefined {

  const merged = [...platformMailBcc(), ...normalizeRecipients(explicit ?? [])]

  const uniq = [...new Set(merged.map((e) => e.toLowerCase()))]

  return uniq.length > 0 ? uniq : undefined

}



function escapeHtml(s: string): string {

  return s

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

}



export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {

  const mode = mailTransportMode()

  if (mode === 'disabled') {

    return { ok: false, error: 'mail_transport_disabled' }

  }



  const from = process.env.C2K_MAIL_FROM ?? `${APP_NAME} <noreply@localhost>`

  const toList = normalizeRecipients(input.to)

  if (toList.length === 0) return { ok: false, error: 'no_recipients' }

  const bcc = mergeBcc(input.bcc)



  if (mode === 'resend') {

    const key = process.env.RESEND_API_KEY?.trim()

    if (!key) return { ok: false, error: 'RESEND_API_KEY_missing' }

    const body: Record<string, unknown> = {

      from,

      to: toList.length === 1 ? toList[0] : toList,

      subject: input.subject,

      text: input.text,

      html: input.html ?? `<pre style="white-space:pre-wrap">${escapeHtml(input.text)}</pre>`,

    }

    if (bcc) body.bcc = bcc

    if (input.headers && Object.keys(input.headers).length > 0) {

      body.headers = input.headers

    }

    const r = await fetch('https://api.resend.com/emails', {

      method: 'POST',

      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },

      body: JSON.stringify(body),

    })

    if (!r.ok) {

      const errText = await r.text().catch(() => '')

      return { ok: false, error: `resend_${r.status}: ${errText.slice(0, 200)}` }

    }

    return { ok: true }

  }



  const host = process.env.SMTP_HOST?.trim()

  if (!host) return { ok: false, error: 'SMTP_HOST_missing' }

  const port = Number(process.env.SMTP_PORT ?? 587)

  const secure = process.env.SMTP_SECURE === 'true'

  const user = process.env.SMTP_USER?.trim()

  const pass = process.env.SMTP_PASS ?? ''



  const transporter = nodemailer.createTransport({

    host,

    port,

    secure,

    auth: user ? { user, pass } : undefined,

  })



  try {

    await transporter.sendMail({

      from,

      to: toList.length === 1 ? toList[0] : toList,

      bcc: bcc?.join(', '),

      subject: input.subject,

      text: input.text,

      html: input.html,

      headers: input.headers,

    })

    return { ok: true }

  } catch (e) {

    const msg = e instanceof Error ? e.message : String(e)

    return { ok: false, error: msg }

  }

}


