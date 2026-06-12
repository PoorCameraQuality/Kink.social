import { Suspense } from 'react'
import { OrganizerLoginClient } from './OrganizerLoginClient'

export default function OrganizerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Suspense fallback={<p className="p-8 text-slate-400">Loading…</p>}>
        <OrganizerLoginClient />
      </Suspense>
    </div>
  )
}
