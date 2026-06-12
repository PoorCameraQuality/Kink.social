import { useId, useState } from 'react'
import {
  MediaUploadProgressOverlay,
  MediaUploadSpinner,
  type MediaUploadStage,
} from '@/components/media/MediaUploadProgress'

export type PhotoUploadResult = {
  file: File
  caption?: string
  objectUrl?: string
}

type PhotoUploadProps = {
  onSelect: (result: PhotoUploadResult) => void | Promise<void>
  accept?: string
  maxSize?: number
  guidelines?: Array<{ text: string; bold?: string }>
  uploading?: boolean
  uploadStage?: MediaUploadStage | null
}

export default function PhotoUpload({
  onSelect,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
  guidelines,
  uploading = false,
  uploadStage = null,
}: PhotoUploadProps) {
  const activeStage = uploadStage ?? (uploading ? 'uploading' : null)
  const inputId = useId()
  const [caption, setCaption] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<{ file: File; objectUrl: string } | null>(null)

  const handleFileSelect = (file: File | undefined) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (maxSize && file.size > maxSize) {
      setError(`File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB.`)
      return
    }
    if (pendingFile) URL.revokeObjectURL(pendingFile.objectUrl)
    setPendingFile({ file, objectUrl: URL.createObjectURL(file) })
  }

  const handleConfirm = async () => {
    if (!pendingFile || activeStage) return
    setError(null)
    try {
      await onSelect({
        file: pendingFile.file,
        caption: caption.trim() || undefined,
        objectUrl: pendingFile.objectUrl,
      })
      setPendingFile(null)
      setCaption('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save photo.')
    }
  }

  const handleCancel = () => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.objectUrl)
    setPendingFile(null)
    setCaption('')
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (activeStage) return
    handleFileSelect(e.dataTransfer.files?.[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0])
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      {pendingFile ? (
        <div className="space-y-3 dc-panel-enter motion-reduce:animate-none">
          <div className="relative aspect-video rounded-lg bg-dc-elevated-solid flex items-center justify-center overflow-hidden">
            <img src={pendingFile.objectUrl} alt="" className="max-h-full object-contain" />
            {activeStage ?
              <MediaUploadProgressOverlay stage={activeStage} />
            : null}
          </div>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full px-3 py-2 bg-dc-surface-muted border border-dc-border rounded-lg text-dc-text placeholder-dc-muted text-sm focus:border-dc-accent focus:ring-1 focus:ring-dc-accent outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={Boolean(activeStage)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-dc-accent text-dc-accent-foreground text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {activeStage ?
                <>
                  <MediaUploadSpinner size="sm" />
                  {activeStage === 'uploading' ? 'Uploading…' : 'Saving…'}
                </>
              : 'Add photo'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={Boolean(activeStage)}
              className="px-4 py-2 bg-dc-elevated-solid text-dc-text-muted text-sm rounded-lg hover:text-dc-text disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/*
            Native <label> + sr-only file input — reliable file picker on mobile/desktop.
            Avoid display:none + programmatic input.click() (often blocked by browsers).
          */}
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!activeStage) setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors min-h-[8.5rem] sm:min-h-[10rem] ${
              activeStage ? 'cursor-wait opacity-70' : 'cursor-pointer'
            } ${
              isDragging ? 'border-dc-accent bg-dc-accent/10' : 'border-dc-border-strong bg-dc-elevated/95 hover:border-dc-accent-border/50'
            }`}
          >
            <input
              id={inputId}
              data-testid="photo-upload-input"
              type="file"
              accept={accept}
              onChange={handleChange}
              disabled={Boolean(activeStage)}
              className="sr-only"
            />
            <svg className="w-12 h-12 text-dc-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-dc-text-muted text-sm font-medium">Click or drag an image here</span>
            <span className="text-dc-muted text-xs mt-1">JPG, PNG, or WebP · up to {Math.round(maxSize / 1024 / 1024)}MB</span>
          </label>
          {guidelines && guidelines.length > 0 && (
            <ul className="space-y-2 text-xs leading-snug text-dc-muted">
              {guidelines.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-dc-accent" aria-hidden>
                    •
                  </span>
                  <span className="min-w-0 flex-1 text-dc-text-muted">
                    {g.bold ?
                      <>
                        <strong className="font-semibold text-dc-text">{g.bold}</strong> {g.text}
                      </>
                    : g.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {error ?
        <div
          className="rounded-xl border border-red-500/30 bg-red-950/25 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="min-h-10 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      : null}
    </div>
  )
}
