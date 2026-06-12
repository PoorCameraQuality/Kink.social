'use client'

import Link from 'next/link'

export function DancecardTopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#050b18]/92 backdrop-blur">
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-3 px-4 sm:h-12 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-slate-100 transition hover:text-white">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 text-[10px] font-serif font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
            EC
          </span>
          <span className="truncate text-sm font-medium text-slate-200">East Coast Kink Events</span>
        </Link>
        <Link
          href="/"
          className="shrink-0 text-xs font-medium text-cyan-200/90 underline-offset-4 hover:text-cyan-100 hover:underline"
        >
          Back to main site
        </Link>
      </div>
    </header>
  )
}
