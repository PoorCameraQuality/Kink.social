import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'neutral' | 'accent' | 'danger' | 'success'

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-dc-elevated-muted text-dc-text-muted border border-dc-border',
  accent: 'bg-dc-accent/15 text-dc-accent border border-dc-accent-border/40',
  danger: 'bg-dc-danger-muted text-dc-danger border border-dc-danger-border',
  success: 'bg-dc-success-muted text-dc-success border border-dc-success/40',
}

export default function Badge({ className, variant = 'neutral', ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-dc-micro font-semibold uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
