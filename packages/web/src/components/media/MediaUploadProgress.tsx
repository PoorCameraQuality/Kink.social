/** Shared upload in-flight UI for profile photos and gallery adds. */

export type MediaUploadStage = 'uploading' | 'processing' | 'saving'

export function mediaUploadStageLabel(stage: MediaUploadStage): string {
  if (stage === 'uploading') return 'Sending to server…'
  return 'Scanning & saving…'
}

export function MediaUploadSpinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-3.5 w-3.5 border-[1.5px]' : 'h-5 w-5 border-2'
  return (
    <span
      className={`inline-block shrink-0 rounded-full border-dc-accent-border border-t-dc-accent animate-spin motion-reduce:animate-none ${dim}`}
      aria-hidden
    />
  )
}

type StatusRowProps = {
  stage: MediaUploadStage
  onCancel?: () => void
  className?: string
}

/** Inline status row — spinner + stage copy + optional cancel. */
export function MediaUploadStatusRow({ stage, onCancel, className = '' }: StatusRowProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 dc-panel-enter motion-reduce:animate-none ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <MediaUploadSpinner size="sm" />
      <p className="text-xs text-dc-muted">{mediaUploadStageLabel(stage)}</p>
      {onCancel ?
        <button type="button" onClick={onCancel} className="text-xs text-dc-accent hover:underline">
          Cancel
        </button>
      : null}
    </div>
  )
}

type OverlayProps = {
  stage: MediaUploadStage
  compact?: boolean
  className?: string
}

/** Dimmed overlay with spinner — sits on top of image previews during upload. */
export function MediaUploadProgressOverlay({ stage, compact = false, className = '' }: OverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-dc-surface/85 backdrop-blur-[2px] dc-panel-enter motion-reduce:animate-none ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={mediaUploadStageLabel(stage)}
    >
      <MediaUploadSpinner size={compact ? 'sm' : 'md'} />
      <p className={`font-medium text-dc-text text-center px-3 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {mediaUploadStageLabel(stage)}
      </p>
      <div
        className="h-0.5 w-16 overflow-hidden rounded-full bg-dc-border/60 motion-reduce:hidden"
        aria-hidden
      >
        <div className="h-full w-full origin-left animate-[media-upload-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-dc-accent/80" />
      </div>
    </div>
  )
}
