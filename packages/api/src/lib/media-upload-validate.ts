import { fileTypeFromBuffer } from 'file-type'

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number]

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024

export type MediaUploadValidationResult =
  | {
      ok: true
      detectedMime: AllowedImageMime
      extension: string
    }
  | {
      ok: false
      reason:
        | 'empty_file'
        | 'file_too_large'
        | 'unsupported_type'
        | 'mime_mismatch'
        | 'suspicious_extension'
        | 'malformed_image'
    }

const ALLOWED_SET = new Set<string>(ALLOWED_IMAGE_MIMES)

const MIME_TO_EXT: Record<AllowedImageMime, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

function normalizeExtension(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.jpeg')) return '.jpg'
  const dot = lower.lastIndexOf('.')
  if (dot === -1) return ''
  return lower.slice(dot)
}

function extensionMatchesMime(ext: string, mime: AllowedImageMime): boolean {
  const expected = MIME_TO_EXT[mime]
  if (ext === expected) return true
  if (mime === 'image/jpeg' && (ext === '.jpg' || ext === '.jpeg')) return true
  return false
}

/** Centralized image upload validation (magic bytes + size + extension sanity). */
export async function validateImageUploadBuffer(
  buffer: Buffer,
  filename: string,
  declaredMime?: string | null,
): Promise<MediaUploadValidationResult> {
  if (!buffer.length) {
    return { ok: false, reason: 'empty_file' }
  }
  if (buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false, reason: 'file_too_large' }
  }

  const ext = normalizeExtension(filename)
  if (ext.includes('..') || filename.includes('\0')) {
    return { ok: false, reason: 'suspicious_extension' }
  }

  const detected = await fileTypeFromBuffer(buffer)
  if (!detected || !ALLOWED_SET.has(detected.mime)) {
    return { ok: false, reason: 'unsupported_type' }
  }

  const detectedMime = detected.mime as AllowedImageMime

  if (declaredMime && declaredMime !== 'application/octet-stream' && declaredMime !== detectedMime) {
    return { ok: false, reason: 'mime_mismatch' }
  }

  if (ext && !extensionMatchesMime(ext, detectedMime)) {
    return { ok: false, reason: 'mime_mismatch' }
  }

  return {
    ok: true,
    detectedMime,
    extension: MIME_TO_EXT[detectedMime],
  }
}

export function validationErrorMessage(reason: MediaUploadValidationResult & { ok: false }): string {
  switch (reason.reason) {
    case 'empty_file':
      return 'Upload is empty'
    case 'file_too_large':
      return 'File exceeds the maximum upload size (10 MB)'
    case 'unsupported_type':
      return 'Unsupported image type. Use JPEG, PNG, WebP, or GIF'
    case 'mime_mismatch':
      return 'File type does not match the file extension'
    case 'suspicious_extension':
      return 'Invalid filename'
    case 'malformed_image':
      return 'Could not read image file'
    default:
      return 'Invalid upload'
  }
}
