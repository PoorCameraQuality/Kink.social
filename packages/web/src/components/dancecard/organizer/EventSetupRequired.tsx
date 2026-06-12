'use client'

export function EventSetupRequired({ onGoSettings }: { onGoSettings: () => void }) {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-100 p-6 text-sm text-amber-900">
      <p className="text-xs uppercase tracking-[0.25em] text-amber-800/80">Setup required</p>
      <h2 className="mt-2 text-lg font-semibold text-dc-text">Set your event dates first</h2>
      <p className="mt-2 leading-relaxed text-amber-900/90">
        Program grid, venue grid, DM coverage, and schedule import need a start and end date for this event. Open
        Event settings (Basics or the setup guide), set the event window, then return here.
      </p>
      <button
        type="button"
        className="mt-4 rounded-full bg-dc-accent px-4 py-2 text-xs font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
        onClick={onGoSettings}
      >
        Go to event settings
      </button>
    </div>
  )
}
