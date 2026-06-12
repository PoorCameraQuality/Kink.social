'use client'

import { useState, useRef } from 'react'

export type PhotoUploadResult = {
  file: File
  caption?: string
  objectUrl?: string
}

type PhotoUploadProps = {
  onSelect: (result: PhotoUploadResult) => void
  accept?: string
  maxSize?: number
  guidelines?: Array<{ text: string; bold?: string }>
}

export default function PhotoUpload({ onSelect, accept = 'image/*', maxSize = 10 * 1024 * 1024, guidelines }: PhotoUploadProps) {
  const [caption, setCaption] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<{ file: File; objectUrl: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleConfirm = () => {
    if (!pendingFile) return
    onSelect({ file: pendingFile.file, caption: caption.trim() || undefined, objectUrl: pendingFile.objectUrl })
    setPendingFile(null)
    setCaption('')
  }

  const handleCancel = () => {
    if (pendingFile) URL.revokeObjectURL(pendingFile.objectUrl)
    setPendingFile(null)
    setCaption('')
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files?.[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0])
    e.target.value = ''
  }

  const handleClick = () => inputRef.current?.click()

  return (
    <div className="space-y-4">
      {pendingFile ? (
        <div className="space-y-3">
          <div className="aspect-video rounded-lg bg-c2k-bg-elevated flex items-center justify-center overflow-hidden">
            <img src={pendingFile.objectUrl} alt="" className="max-h-full object-contain" />
          </div>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full px-3 py-2 bg-c2k-bg border border-white/10 rounded-lg text-white placeholder-c2k-text-muted text-sm focus:border-c2k-accent-primary focus:ring-1 focus:ring-c2k-accent-primary outline-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleConfirm} className="px-4 py-2 bg-c2k-accent-primary text-white text-sm font-medium rounded-lg">
              Add photo
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-c2k-bg-elevated text-c2k-text-secondary text-sm rounded-lg hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[160px] ${
              isDragging ? 'border-c2k-accent-primary bg-c2k-accent-primary/10' : 'border-white/20 bg-c2k-bg-card hover:border-c2k-accent-primary/50'
            }`}
          >
            <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
            <svg className="w-12 h-12 text-c2k-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-c2k-text-secondary text-sm">Click or drag to upload</span>
          </div>
          {guidelines && guidelines.length > 0 && (
            <ul className="space-y-1 text-xs text-c2k-text-muted">
              {guidelines.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-c2k-accent-primary">•</span>
                  {g.bold ? <><strong className="text-white">{g.bold}</strong> {g.text}</> : g.text}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {error && <p className="text-sm text-c2k-danger">{error}</p>}
    </div>
  )
}
