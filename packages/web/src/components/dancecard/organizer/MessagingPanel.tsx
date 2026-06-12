'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchAllOrganizerRegistrants, organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { DancecardPanelSkeleton, useOrganizerToast } from '@/components/dancecard/organizer/ui'
import { copy } from '@/lib/dancecard/productCopy'
import { supportCopy } from '@/lib/dancecard/supportCopy'

type Campaign = {
  id: string
  templateId: string
  templateName: string
  status: string
  createdAt: string
  sentAt: string | null
  deliveryTotal: number
  deliverySent: number
}

type TemplateRow = { id: string; name: string; subject: string; bodyText: string }

type PublishResult = {
  sent?: number
  failed?: number
  emailsSkipped?: boolean
  emailSkipReason?: string | null
  recipientCount?: number
}

const STARTER_MESSAGES = [
  {
    id: 'welcome',
    label: 'Welcome',
    subject: 'Welcome to the event',
    bodyText:
      'Hi there,\n\nWe are glad you are joining us. Your dancecard has your schedule, room info, and updates.\n\nSee you soon!',
  },
  {
    id: 'schedule',
    label: 'Schedule update',
    subject: 'Schedule update',
    bodyText:
      'Hi there,\n\nWe updated the program. Open your dancecard for the latest class times and rooms.\n\nThanks for your flexibility.',
  },
  {
    id: 'room',
    label: 'Room change',
    subject: 'Room change for upcoming classes',
    bodyText:
      'Hi there,\n\nOne or more classes moved to a new room. Check your dancecard for the latest location details.\n\nSorry for any confusion.',
  },
  {
    id: 'thanks',
    label: 'Thank you / post-event',
    subject: 'Thank you for joining us',
    bodyText:
      'Hi there,\n\nThank you for being part of the event. We hope you had a great time.\n\nStay tuned for photos and next-year news.',
  },
] as const

type ConfirmStep = 'compose' | 'confirm' | 'success'

export function MessagingPanel({ eventSlug, readOnly }: { eventSlug: string; readOnly: boolean }) {
  const slug = eventSlug.toLowerCase()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templatesById, setTemplatesById] = useState<Record<string, TemplateRow>>({})
  const [needsMigration, setNeedsMigration] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [starterId, setStarterId] = useState('')
  const [busy, setBusy] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [step, setStep] = useState<ConfirmStep>('compose')
  const [audience, setAudience] = useState<{ dancecardReach: number; emailReach: number } | null>(null)
  const [audienceErr, setAudienceErr] = useState<string | null>(null)
  const [lastPublish, setLastPublish] = useState<PublishResult | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const toast = useOrganizerToast()

  const load = useCallback(async () => {
    setErr(null)
    try {
      const [t, c] = await Promise.all([
        organizerDancecardFetch<{ templates: TemplateRow[]; needsMigration?: boolean }>(slug, '/message-templates'),
        organizerDancecardFetch<{ campaigns: Campaign[]; needsMigration?: boolean }>(slug, '/message-campaigns'),
      ])
      const map: Record<string, TemplateRow> = {}
      for (const row of t.templates ?? []) map[row.id] = row
      setTemplatesById(map)
      setCampaigns(c.campaigns ?? [])
      setNeedsMigration(Boolean(t.needsMigration || c.needsMigration))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load announcements')
    } finally {
      setInitialLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const loadAudience = useCallback(async () => {
    setAudience(null)
    setAudienceErr(null)
    try {
      const regs = await fetchAllOrganizerRegistrants<{ status: string; email: string | null }>(slug)
      const eligible = regs.filter((r) => r.status !== 'cancelled')
      const emails = new Set(
        eligible.map((r) => String(r.email ?? '').trim().toLowerCase()).filter((e) => e.includes('@')),
      )
      setAudience({ dancecardReach: eligible.length, emailReach: emails.size })
    } catch (e) {
      setAudienceErr(e instanceof Error ? e.message : 'Could not estimate recipients')
    }
  }, [slug])

  function applyStarter(id: string) {
    setStarterId(id)
    if (!id) return
    const preset = STARTER_MESSAGES.find((p) => p.id === id)
    if (!preset) return
    setSubject(preset.subject)
    setBodyText(preset.bodyText)
  }

  function reuseFromCampaign(c: Campaign) {
    const tpl = templatesById[c.templateId]
    if (!tpl) return
    setSubject(tpl.subject)
    setBodyText(tpl.bodyText)
    setStarterId('')
    setStep('compose')
    setErr(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function openConfirm() {
    if (readOnly || !subject.trim() || !bodyText.trim()) return
    setErr(null)
    setStep('confirm')
    await loadAudience()
  }

  async function publishNow() {
    if (readOnly) return
    setBusy(true)
    setErr(null)
    try {
      const label =
        subject.trim().slice(0, 72) ||
        `Announcement ${new Date().toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}`
      const tplRes = await organizerDancecardFetch<{ template: { id: string } }>(slug, '/message-templates', {
        method: 'POST',
        body: JSON.stringify({ name: label, subject: subject.trim(), bodyText: bodyText.trim() }),
      })
      const campRes = await organizerDancecardFetch<{ campaign: { id: string } }>(slug, '/message-campaigns', {
        method: 'POST',
        body: JSON.stringify({ templateId: tplRes.template.id }),
      })
      const res = await organizerDancecardFetch<PublishResult>(
        slug,
        `/message-campaigns/${campRes.campaign.id}/send`,
        { method: 'POST' },
      )
      setLastPublish(res)
      setStep('success')
      setSubject('')
      setBodyText('')
      setStarterId('')
      await load()
      if (res.emailsSkipped) {
        toast.push(
          `Posted to dancecard.${res.emailSkipReason ? ` Email skipped: ${res.emailSkipReason}` : ''}`,
        )
      } else {
        toast.push(`Posted to dancecard. Email: ${res.sent ?? 0} sent, ${res.failed ?? 0} failed.`)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Publish failed')
      setStep('confirm')
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    if (readOnly || !testEmail.trim() || !subject.trim() || !bodyText.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await organizerDancecardFetch(slug, '/message-templates/test-send', {
        method: 'POST',
        body: JSON.stringify({
          to: testEmail.trim(),
          subject: subject.trim(),
          body: bodyText.trim(),
        }),
      })
      toast.push(`Test email sent to ${testEmail.trim()}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Test send failed')
    } finally {
      setBusy(false)
    }
  }

  const sentCampaigns = campaigns.filter((c) => c.status === 'sent')
  const canPublish = Boolean(subject.trim() && bodyText.trim())

  if (initialLoading) {
    return (
      <div className="space-y-6 text-sm text-dc-text" aria-busy="true">
        <div>
          <h2 className="font-serif text-xl text-dc-text sm:text-2xl">Post an announcement</h2>
          <p className="mt-2 text-sm text-dc-muted">Loading templates and recent posts…</p>
        </div>
        <DancecardPanelSkeleton lines={5} />
        <DancecardPanelSkeleton lines={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-sm text-dc-text dc-tab-content-enter">
      <div>
        <h2 className="font-serif text-xl text-dc-text sm:text-2xl">Post an announcement</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dc-muted">
          Write your message, review it once, then publish. It appears immediately in every attendee&apos;s Dancecard
          announcements feed. Email is optional and only sends if Resend is configured on the server.
        </p>
      </div>

      {needsMigration ? <p className="text-xs text-amber-800">{supportCopy.messagingNotReady}</p> : null}
      {err ? <p className="rounded-lg border border-dc-danger-border bg-dc-danger-muted px-3 py-2 text-sm text-dc-danger">{err}</p> : null}

      {step === 'compose' ? (
        <section className="rounded-xl border border-dc-border bg-dc-elevated-muted p-4 sm:p-5">
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-dc-muted">
            Start from a starter (optional)
            <select
              className="min-h-11 w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2 text-base font-normal normal-case text-dc-text"
              value={starterId}
              disabled={readOnly || busy}
              onChange={(e) => applyStarter(e.target.value)}
            >
              <option value="">Blank message</option>
              {STARTER_MESSAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-dc-muted">
            Headline (shown in Dancecard)
            <input
              className="min-h-11 w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2 text-base font-normal normal-case text-dc-text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={readOnly || busy}
              placeholder="e.g. Room change for Saturday classes"
            />
          </label>

          <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-dc-muted">
            Message
            <textarea
              className="min-h-[10rem] w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2 text-base font-normal normal-case leading-relaxed text-dc-text"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              disabled={readOnly || busy}
              placeholder="Write what attendees should know…"
            />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              disabled={readOnly || busy || !canPublish}
              className="min-h-12 w-full rounded-xl bg-dc-accent px-5 py-3 text-base font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40 sm:w-auto"
              onClick={() => void openConfirm()}
            >
              Review &amp; publish to Dancecard
            </button>
            <p className="text-xs text-dc-muted sm:max-w-xs">
              You will see a confirmation screen with audience counts before anything goes live.
            </p>
          </div>

          <details className="mt-4 rounded-lg border border-dc-border bg-dc-surface-muted/80 px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-dc-accent">Send a test email first (optional)</summary>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-dc-muted">
                Test address
                <input
                  type="email"
                  className="min-h-10 rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2 text-sm text-dc-text"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={readOnly || busy}
                  placeholder="you@example.com"
                />
              </label>
              <button
                type="button"
                disabled={readOnly || busy || !testEmail.trim() || !canPublish}
                className="min-h-10 shrink-0 rounded-xl border border-dc-border px-4 py-2 text-sm font-medium hover:bg-dc-accent-muted disabled:opacity-40"
                onClick={() => void sendTest()}
              >
                Send test
              </button>
            </div>
            <p className="mt-2 text-[11px] text-dc-muted">
              Test email does not post to Dancecard. Requires Resend on the server.
            </p>
          </details>
        </section>
      ) : null}

      {step === 'confirm' || step === 'success' ? (
        <div
          className="fixed inset-0 z-dc-modal flex items-end justify-center bg-dc-surface/85 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-confirm-title"
        >
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-dc-border bg-dc-elevated-solid p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            {step === 'success' ? (
              <>
                <h3 id="announcement-confirm-title" className="font-serif text-xl text-dc-text">
                  Published to Dancecard
                </h3>
                <p className="mt-2 text-sm text-dc-muted">
                  Your announcement is live in the attendee feed.
                </p>
                <ul className="mt-4 space-y-2 rounded-xl border border-dc-border bg-dc-surface-muted p-4 text-sm">
                  <li>
                    <span className="text-dc-muted">Dancecard feed: </span>
                    <strong className="text-dc-text">{audience?.dancecardReach ?? '-'} attendees</strong>
                  </li>
                  <li>
                    <span className="text-dc-muted">Email: </span>
                    <strong className="text-dc-text">
                      {lastPublish?.emailsSkipped
                        ? lastPublish.emailSkipReason ?? 'Not sent (Resend not configured)'
                        : `${lastPublish?.sent ?? 0} sent, ${lastPublish?.failed ?? 0} failed`}
                    </strong>
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="min-h-11 flex-1 rounded-xl bg-dc-accent px-4 py-2.5 font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
                    onClick={() => {
                      setStep('compose')
                      setLastPublish(null)
                    }}
                  >
                    Post another
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-xl border border-dc-border px-4 py-2.5 text-dc-muted hover:bg-dc-surface-muted"
                    onClick={() => {
                      setStep('compose')
                      setLastPublish(null)
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 id="announcement-confirm-title" className="font-serif text-xl text-dc-text">
                  Publish to Dancecard?
                </h3>
                <p className="mt-2 text-sm text-dc-muted">
                  This posts immediately on every attendee dancecard. Email is attempted only when Resend is configured.
                </p>
                <dl className="mt-4 space-y-3 rounded-xl border border-dc-border bg-dc-surface-muted p-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Headline</dt>
                    <dd className="mt-1 font-medium text-dc-text">{subject.trim()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Message</dt>
                    <dd className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap text-dc-muted">{bodyText.trim()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Who will see it</dt>
                    <dd className="mt-1 text-dc-muted">
                      {audienceErr ? (
                        <span className="text-dc-danger">{audienceErr}</span>
                      ) : audience ? (
                        <>
                          <span className="block">
                            Dancecard feed (non-cancelled {copy.signups.toLowerCase()}):{' '}
                            <strong className="text-dc-text">{audience.dancecardReach}</strong>
                          </span>
                          <span className="mt-1 block text-xs">
                            Emails on file (if Resend is on):{' '}
                            <strong className="text-dc-text">{audience.emailReach}</strong>
                          </span>
                        </>
                      ) : (
                        'Calculating…'
                      )}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={busy}
                    className="min-h-11 rounded-xl border border-dc-border px-4 py-2.5 text-sm text-dc-muted hover:bg-dc-surface-muted disabled:opacity-40"
                    onClick={() => setStep('compose')}
                  >
                    Back to edit
                  </button>
                  <button
                    type="button"
                    disabled={readOnly || busy}
                    className="min-h-11 rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
                    onClick={() => void publishNow()}
                  >
                    {busy ? 'Publishing…' : 'Publish now'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {sentCampaigns.length ? (
        <section className="rounded-xl border border-dc-border bg-dc-elevated-muted p-4">
          <h3 className="text-sm font-semibold text-dc-text">Recent announcements</h3>
          <p className="mt-1 text-xs text-dc-muted">Previously published to the attendee feed.</p>
          <ul className="mt-3 space-y-2">
            {sentCampaigns.slice(0, 8).map((c) => {
              const tpl = templatesById[c.templateId]
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-dc-text">{tpl?.subject ?? c.templateName}</p>
                    <p className="mt-0.5 text-xs text-dc-muted">
                      {c.sentAt ? new Date(c.sentAt).toLocaleString() : new Date(c.createdAt).toLocaleString()}
                      {c.deliveryTotal ? ` · email ${c.deliverySent}/${c.deliveryTotal}` : ' · feed only'}
                    </p>
                  </div>
                  {!readOnly && tpl ? (
                    <button
                      type="button"
                      className="shrink-0 text-xs font-medium text-dc-accent hover:underline"
                      onClick={() => reuseFromCampaign(c)}
                    >
                      Reuse message
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
