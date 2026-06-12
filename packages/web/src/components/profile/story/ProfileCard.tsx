import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'



type Props = {

  title?: string

  icon?: ReactNode

  action?: ReactNode

  children: ReactNode

  className?: string

  id?: string

  /** Hero uses a softer, borderless treatment. */

  variant?: 'default' | 'hero'

}



export default function ProfileCard({

  title,

  icon,

  action,

  children,

  className,

  id,

  variant = 'default',

}: Props) {

  return (

    <section

      id={id}

      className={cn(

        'rounded-2xl',

        variant === 'hero' ?

          'c2k-profile-hero dc-card-polish bg-gradient-to-br from-dc-accent/[0.07] via-dc-elevated/45 to-dc-elevated/35 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-white/[0.07]'

        : 'border border-white/[0.06] bg-dc-elevated/50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] sm:p-7',

        className,

      )}

    >

      {title ?

        <div className="mb-5 flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-2.5">

            {icon ?

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dc-accent/[0.08] text-dc-accent">

                {icon}

              </span>

            : null}

            <h2 className="text-base font-semibold tracking-tight text-dc-text sm:text-[17px]">{title}</h2>

          </div>

          {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}

        </div>

      : null}

      {children}

    </section>

  )

}


