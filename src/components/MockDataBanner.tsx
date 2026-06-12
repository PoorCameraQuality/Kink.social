'use client'

/**
 * Dev-only strip so stakeholders never confuse mock data with production.
 * TODO: remove before release or gate behind env flag only.
 */
export default function MockDataBanner() {
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div
      className="bg-amber-900/40 border-b border-amber-600/40 px-4 py-2 text-center text-xs text-amber-100"
      role="status"
    >
      <strong className="font-semibold">Mock prototype</strong>
      {' — '}
      Data is in-memory / demo storage only. No account or messages are sent to a server.
    </div>
  )
}
