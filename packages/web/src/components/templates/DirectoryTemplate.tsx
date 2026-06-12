import type { ReactNode } from 'react'
import PageHeader from '@/components/shell/PageHeader'
import { cn } from '@/lib/cn'
import { shellDirectoryClass } from '@/lib/shell-contract'

type Props = {
  title: string
  description?: string
  headerActions?: ReactNode
  /** Search row + filter trigger area */
  toolbar?: ReactNode
  resultSummary?: ReactNode
  /** Desktop left rail (filters, nav) */
  desktopSidebar?: ReactNode
  /** Optional right rail on xl+ */
  desktopAside?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  /** Skip default PageHeader when custom header provided */
  header?: ReactNode
}

/**
 * Directory / list pages — search, filters, responsive grid or list.
 */
export default function DirectoryTemplate({
  title,
  description,
  headerActions,
  toolbar,
  resultSummary,
  desktopSidebar,
  desktopAside,
  children,
  footer,
  className,
  header,
}: Props) {
  const hasSidebars = desktopSidebar || desktopAside

  return (
    <div className={cn(shellDirectoryClass, 'py-6', className)}>
      {header ?? (
        <PageHeader title={title} description={description} actions={headerActions} sticky={false} className="mb-6" />
      )}

      {toolbar ? <div className="mb-4 space-y-3">{toolbar}</div> : null}
      {resultSummary ? <div className="mb-4 text-sm text-dc-muted">{resultSummary}</div> : null}

      {hasSidebars ?
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(240px,260px)_minmax(0,1fr)_minmax(260px,300px)]">
          {desktopSidebar ?
            <div className="hidden lg:block">{desktopSidebar}</div>
          : <div className="hidden lg:block" />}
          <main className="min-w-0">{children}</main>
          {desktopAside ?
            <div className="hidden xl:block">{desktopAside}</div>
          : null}
        </div>
      : <main className="min-w-0">{children}</main>}

      {footer}
    </div>
  )
}

export function DirectoryFilterButton({
  onClick,
  activeFilterCount = 0,
  className,
}: {
  onClick: () => void
  activeFilterCount?: number
  className?: string
}) {
  const label = activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-touch shrink-0 items-center justify-center rounded-xl border border-dc-border bg-dc-elevated-solid px-5 text-sm font-semibold text-dc-text hover:border-dc-accent-border/50 hover:bg-dc-elevated-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent lg:hidden',
        className,
      )}
    >
      {label}
    </button>
  )
}
