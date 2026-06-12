'use client'

import { useCallback, useEffect, useState } from 'react'
import { Panel } from '@/components/dancecard/ui/Panel'
import { useAuth } from '@/contexts/AuthContext'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export default function SettingsPushEnableBanner() {
  const { isAuthenticated, isFallback } = useAuth()
  const [configured, setConfigured] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const r = await fetch('/api/v1/me/push/status', { credentials: 'include' })
    if (!r.ok) return
    const d = (await r.json()) as { configured?: boolean; vapidPublicKey?: string | null; subscribed?: boolean }
    setConfigured(Boolean(d.configured && d.vapidPublicKey))
    setSubscribed(Boolean(d.subscribed))
  }, [])

  useEffect(() => {
    if (!isAuthenticated || isFallback) return
    void refresh()
  }, [isAuthenticated, isFallback, refresh])

  const enable = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setMsg('Push not supported in this browser')
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const statusRes = await fetch('/api/v1/me/push/status', { credentials: 'include' })
      const status = (await statusRes.json()) as { vapidPublicKey?: string | null }
      if (!status.vapidPublicKey) {
        setMsg('Push not configured on server (VAPID keys required)')
        return
      }
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setMsg('Notification permission denied')
        return
      }
      await navigator.serviceWorker.register('/sw-push.js')
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(status.vapidPublicKey),
      })
      const json = sub.toJSON()
      const r = await fetch('/api/v1/me/push/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      })
      if (!r.ok) {
        setMsg('Could not save subscription')
        return
      }
      setSubscribed(true)
      setMsg('Push enabled for this browser')
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthenticated || isFallback) return null

  return (
    <Panel className="scroll-mt-24 border-dc-accent/30 bg-dc-accent/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-dc-text">Enable push notifications</h2>
          <p className="mt-1 text-sm text-dc-muted max-w-prose">
            Get convention hub alerts and message pings on this device. Email columns below still control digests and
            slower notices.
          </p>
          {!configured ?
            <p className="mt-2 text-xs text-dc-muted">Server push is off until VAPID keys are configured on the API.</p>
          : null}
          {msg ? <p className="mt-2 text-xs text-dc-muted">{msg}</p> : null}
        </div>
        <button
          type="button"
          disabled={busy || !configured}
          onClick={() => void enable()}
          className="shrink-0 rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
        >
          {busy ? 'Enabling…' : subscribed ? 'Re-enable push' : 'Turn on'}
        </button>
      </div>
    </Panel>
  )
}
