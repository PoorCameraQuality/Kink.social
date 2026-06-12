import { copyCanonicalLink } from '@c2k/shared'
import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  path: string
  className?: string
  bookmark?: {
    saved: boolean
    busy?: boolean
    onToggle: () => void
  }
  extraMenuItems?: Array<{
    label: string
    onClick: () => void
    destructive?: boolean
  }>
}

export default function CopyLinkOverflowMenu({ path, className = '', bookmark, extraMenuItems }: Props) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = () => {
    void copyCanonicalLink(path).then((ok) => {
      if (ok) setCopied(true)
      setOpen(false)
    })
  }

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-dc-muted transition-colors hover:bg-dc-elevated-muted hover:text-dc-text"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
      {open ?
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-dc-border bg-dc-elevated-solid py-1 shadow-[var(--dc-shadow-panel)]"
        >
          {bookmark ?
            <button
              type="button"
              role="menuitem"
              disabled={bookmark.busy}
              className="block w-full min-h-11 px-3 py-2 text-left text-sm text-dc-text hover:bg-dc-elevated-muted disabled:opacity-60"
              onClick={() => {
                bookmark.onToggle()
                setOpen(false)
              }}
            >
              {bookmark.saved ? 'Remove bookmark' : 'Bookmark'}
            </button>
          : null}
          {extraMenuItems?.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`block w-full min-h-11 px-3 py-2 text-left text-sm hover:bg-dc-elevated-muted ${
                item.destructive ? 'text-dc-danger' : 'text-dc-text'
              }`}
              onClick={() => {
                item.onClick()
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            className="block w-full min-h-11 px-3 py-2 text-left text-sm text-dc-text hover:bg-dc-elevated-muted"
            onClick={handleCopy}
          >
            Copy link
          </button>
        </div>
      : null}
      {copied ?
        <div
          role="status"
          className="absolute right-0 top-full z-30 mt-1 whitespace-nowrap rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-1.5 text-xs font-medium text-dc-text shadow-[var(--dc-shadow-panel)]"
        >
          Link copied
        </div>
      : null}
    </div>
  )
}
