import type { ReactNode } from 'react'

export default function DancecardLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-950 antialiased">{children}</div>
}
