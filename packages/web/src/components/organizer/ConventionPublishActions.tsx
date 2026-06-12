import { useCallback, useEffect, useState } from 'react'

import OrganizerPublishConfirmDialog from '@/components/organizer/ui/OrganizerPublishConfirmDialog'

import { patchConventionOrganizerSettings } from '@/lib/organizer/conventionProgramApi'

import { canEckePublishConvention, canPublishConventionProgram } from '@/lib/organizer/org-tools-utils'



type Props = {

  conventionSlug: string

  conventionTitle: string

  /** Compact: single Publish button. Full: Publish + Preview. */

  variant?: 'compact' | 'full'

  viewerRole?: string | null

  /** Convention command full admin - required for ECKE API publish. */

  isFullAdmin?: boolean

  onPublished?: () => void

}



export default function ConventionPublishActions({

  conventionSlug,

  conventionTitle,

  variant = 'full',

  viewerRole = null,

  isFullAdmin = false,

  onPublished,

}: Props) {

  const [busy, setBusy] = useState<'preview' | 'publish' | null>(null)

  const [message, setMessage] = useState<string | null>(null)

  const [messageKind, setMessageKind] = useState<'success' | 'error' | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [includeEcke, setIncludeEcke] = useState(false)

  const [bridgeConnected, setBridgeConnected] = useState<boolean | null>(null)



  const canPublishC2k = canPublishConventionProgram(viewerRole)

  const showEckeOption =

    canEckePublishConvention(viewerRole, isFullAdmin) && bridgeConnected !== false



  const eckeBase = `/api/v1/organizer/ecke-publish/conventions/${encodeURIComponent(conventionSlug)}`



  useEffect(() => {

    if (!canEckePublishConvention(viewerRole, isFullAdmin)) return

    let cancelled = false

    void (async () => {

      try {

        const r = await fetch(eckeBase, { credentials: 'include' })

        const j = (await r.json()) as { bridgeConnected?: boolean }

        if (!cancelled) setBridgeConnected(Boolean(j.bridgeConnected))

      } catch {

        if (!cancelled) setBridgeConnected(false)

      }

    })()

    return () => {

      cancelled = true

    }

  }, [eckeBase, viewerRole, isFullAdmin])



  const runEcke = useCallback(

    async (action: 'preview' | 'publish') => {

      if (action === 'publish' && bridgeConnected === false) {

        throw new Error('East Coast Kink Events publish bridge is not connected on this server.')

      }

      const r = await fetch(`${eckeBase}/${action}`, { method: 'POST', credentials: 'include' })

      const j = (await r.json()) as { error?: string; targets?: { ok?: boolean; error?: string }[] }

      if (!r.ok) throw new Error(j.error ?? `${action} failed`)

      const failed = j.targets?.find((t) => t.ok === false)

      if (failed) throw new Error(failed.error ?? 'One or more targets failed')

    },

    [eckeBase, bridgeConnected],

  )



  const makePublicOnC2k = useCallback(async () => {

    await patchConventionOrganizerSettings(conventionSlug, {

      settings: {

        publicProgramListing: true,

        dancecardPublishStatus: 'published',

      },

    })

  }, [conventionSlug])



  const confirmPublish = async () => {

    if (includeEcke && bridgeConnected === false) {

      setMessageKind('error')

      setMessage('East Coast Kink Events publish bridge is not connected on this server.')

      return

    }

    setBusy('publish')

    setMessage(null)

    setMessageKind(null)

    try {

      if (includeEcke) {

        await runEcke('publish')

      }

      await makePublicOnC2k()

      setMessageKind('success')

      setMessage(

        includeEcke ?

          `${conventionTitle} is now public and listed on East Coast Kink Events.`

        : `${conventionTitle} is now public.`,

      )

      setDialogOpen(false)

      onPublished?.()

    } catch (e) {

      setMessageKind('error')

      setMessage(e instanceof Error ? e.message : 'Publish failed')

    } finally {

      setBusy(null)

    }

  }



  const runPreview = async () => {

    setBusy('preview')

    setMessage(null)

    setMessageKind(null)

    try {

      await runEcke('preview')

      setMessageKind('success')

      setMessage(`Preview saved for ${conventionTitle}.`)

    } catch (e) {

      setMessageKind('error')

      setMessage(e instanceof Error ? e.message : 'Preview failed')

    } finally {

      setBusy(null)

    }

  }



  if (!canPublishC2k) return null



  return (

    <>

      <div className="flex flex-col gap-1 items-end">

        <div className="flex flex-wrap gap-2">

          {variant === 'full' && showEckeOption ?

            <button

              type="button"

              disabled={!!busy}

              onClick={() => void runPreview()}

              className="min-h-9 inline-flex items-center rounded-lg border border-dc-border px-3 text-xs text-dc-text-muted hover:text-dc-text disabled:opacity-50"

            >

              {busy === 'preview' ? 'Preview…' : 'Preview'}

            </button>

          : null}

          <button

            type="button"

            data-testid="program-convention-publish-open"

            disabled={!!busy}

            onClick={() => setDialogOpen(true)}

            className="min-h-9 inline-flex items-center rounded-lg bg-dc-accent px-3 text-xs font-medium text-dc-text hover:bg-dc-accent-hover disabled:opacity-50"

          >

            {busy === 'publish' ? 'Publishing…' : 'Publish'}

          </button>

        </div>

        {bridgeConnected === false && canEckePublishConvention(viewerRole, isFullAdmin) ?

          <p className="text-xs max-w-xs text-right text-amber-200/90">

            Public directory listing unavailable · Kink Social publish only until bridge is connected.

          </p>

        : null}

        {message ?

          <p

            className={`text-xs max-w-xs text-right ${messageKind === 'error' ? 'text-red-300' : 'text-emerald-200/90'}`}

          >

            {message}

          </p>

        : null}

      </div>



      <OrganizerPublishConfirmDialog

        open={dialogOpen}

        title="Publish convention?"

        itemLabel={conventionTitle}

        itemKind="convention"

        includeEcke={includeEcke}

        onIncludeEckeChange={setIncludeEcke}

        showEckeOption={showEckeOption}

        busy={busy === 'publish'}

        onConfirm={() => void confirmPublish()}

        onCancel={() => {

          if (busy !== 'publish') setDialogOpen(false)

        }}

      />

    </>

  )

}


