import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

type PanelVariant = 'default' | 'muted' | 'inset'

const panelChrome =
  'shadow-[0_18px_54px_rgba(45,38,28,0.12),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm'

const variantClass: Record<PanelVariant, string> = {
  default: `border-dc-border bg-dc-elevated/95 ${panelChrome}`,
  muted: `border-dc-border bg-dc-elevated-muted/95 ${panelChrome}`,
  inset: `border-dc-border/80 bg-dc-surface-muted/90 shadow-[0_8px_24px_rgba(45,38,28,0.08)]`,
}

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: PanelVariant
  children: ReactNode
}

export const Panel = forwardRef<HTMLDivElement, Props>(function Panel(
  { variant = 'default', className = '', children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border p-4 sm:p-5 ${variantClass[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
})
