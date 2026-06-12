import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  getAuthedUserId,
  isUserOrganizerForSlug,
  organizerDevBypassEnabled,
} from '@/lib/dancecard/organizerAuth'

export default async function OrganizerDancecardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { eventSlug: string }
}) {
  const bypass = organizerDevBypassEnabled()
  if (!bypass) {
    const userId = await getAuthedUserId()
    if (!userId) {
      redirect(`/organizer/login?next=${encodeURIComponent(`/organizer/dancecard/${params.eventSlug}`)}`)
    }
    const ok = await isUserOrganizerForSlug(userId, params.eventSlug)
    if (!ok) {
      redirect('/unauthorized')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {bypass ? (
        <div className="border-b border-amber-500/40 bg-amber-950/50 px-4 py-2 text-center text-sm text-amber-100">
          Local dev preview: <strong>DANCECARD_ORGANIZER_DEV_BYPASS=1</strong> — organizer auth is off. Do not set in
          production.
        </div>
      ) : null}
      <header className="border-b border-white/10 bg-black/50 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
            East Coast Kink Events
          </Link>
          <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Dancecard organizer</span>
        </div>
      </header>
      {children}
    </div>
  )
}
