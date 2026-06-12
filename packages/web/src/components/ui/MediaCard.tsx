import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/cn'

type Props = {
  to: string
  media: React.ReactNode
  children: React.ReactNode
  className?: string
  mediaClassName?: string
}

export default function MediaCard({ to, media, children, className, mediaClassName }: Props) {
  return (
    <Card className={cn('overflow-hidden transition-colors hover:border-dc-accent-border/40', className)}>
      <Link to={to} className={cn('relative block bg-dc-surface-muted', mediaClassName)}>
        {media}
      </Link>
      <div className="p-4">{children}</div>
    </Card>
  )
}
