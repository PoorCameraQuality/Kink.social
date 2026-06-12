import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  /** Optional page header slot (use PageHeader) */
  header?: ReactNode
  className?: string
}

/**
 * Authenticated mobile app shell — max-width, overflow guard, consistent horizontal padding.
 * Site chrome (Header, BottomNav) remains in RootLayout.
 */
export default function AppShell({ children, header, className }: Props) {
  return (
    <div className={cn('app-shell mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden', className)}>
      {header}
      {children}
    </div>
  )
}
