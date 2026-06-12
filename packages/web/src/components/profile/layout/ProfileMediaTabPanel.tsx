import type { ReactNode } from 'react'

type Props = {
  writing: ReactNode
  photos: ReactNode
  id?: string
}

/** Desktop: writing left, photos right. Mobile: stacked. */
export default function ProfileMediaTabPanel({ writing, photos, id }: Props) {
  return (
    <div id={id} className="scroll-mt-24 space-y-6 sm:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:items-start lg:gap-8">
      <section className="min-w-0 space-y-3 sm:space-y-4">
        <header className="border-b border-dc-border/70 pb-2 sm:border-dc-border sm:pb-3">
          <h2 className="text-sm font-semibold text-dc-text sm:text-base">Writing & education</h2>
          <p className="mt-0.5 text-[11px] text-dc-muted sm:mt-1 sm:text-xs">Articles, journal entries, and teaching credits.</p>
        </header>
        {writing}
      </section>
      <section className="min-w-0 space-y-3 border-t border-dc-border/60 pt-6 sm:space-y-4 sm:border-0 sm:pt-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
        <header className="border-b border-dc-border/70 pb-2 sm:border-dc-border sm:pb-3">
          <h2 className="text-sm font-semibold text-dc-text sm:text-base">Photos</h2>
          <p className="mt-0.5 text-[11px] text-dc-muted sm:mt-1 sm:text-xs">Gallery shared on this public profile.</p>
        </header>
        {photos}
      </section>
    </div>
  )
}
