import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-dc-accent text-dc-accent-foreground hover:bg-dc-accent-hover border border-dc-accent-border',
  secondary:
    'bg-transparent text-dc-text border border-dc-border-strong hover:bg-dc-elevated-muted',
  ghost:
    'bg-transparent text-dc-text-muted border border-transparent hover:bg-dc-elevated-muted hover:text-dc-text',
  danger: 'bg-dc-danger text-dc-accent-foreground border border-dc-danger-border hover:opacity-90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-touch px-3 py-2 text-sm',
  md: 'min-h-touch px-4 py-2.5 text-sm',
}

export default function Button({ className, variant = 'primary', size = 'md', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecke-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-dc-surface',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
