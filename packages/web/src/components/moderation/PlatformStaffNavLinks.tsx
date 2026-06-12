import { Link } from 'react-router-dom'
import { useApiPlatformStaff } from '@/hooks/useApiPlatformStaff'

type Props = {
  onNavigate?: () => void
  /** Desktop account dropdown uses compact block links; mobile hamburger uses full-width rows. */
  variant?: 'dropdown' | 'mobile'
}

const linkClass = {
  dropdown:
    'flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-dc-text hover:bg-dc-elevated-muted md:min-h-0 md:text-dc-text-muted md:hover:text-dc-text',
  mobile:
    'px-4 py-2 rounded-lg text-sm font-medium text-dc-text-muted hover:text-dc-text hover:bg-dc-elevated-muted',
} as const

export default function PlatformStaffNavLinks({ onNavigate, variant = 'dropdown' }: Props) {
  const cls = linkClass[variant]
  const { staff } = useApiPlatformStaff(true)
  const showLegal = staff?.siteAdmin || staff?.legalAdmin
  const showDmca = staff?.siteAdmin || staff?.trustSafetyAdmin || staff?.legalAdmin

  return (
    <>
      <Link to="/moderation/dashboard" className={cls} onClick={onNavigate}>
        Trust &amp; Safety dashboard
      </Link>
      <Link to="/moderation/queues" className={cls} onClick={onNavigate}>
        Moderation queues
      </Link>
      <Link to="/moderation/cases" className={cls} onClick={onNavigate}>
        Moderation cases
      </Link>
      {showLegal ?
        <Link to="/moderation/legal" className={cls} onClick={onNavigate}>
          Legal requests
        </Link>
      : null}
      {showDmca ?
        <Link to="/moderation/dmca" className={cls} onClick={onNavigate}>
          DMCA cases
        </Link>
      : null}
      {showDmca ?
        <Link to="/moderation/contact" className={cls} onClick={onNavigate}>
          Contact inbox
        </Link>
      : null}
    </>
  )
}
