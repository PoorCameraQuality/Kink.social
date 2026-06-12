const ALLOWED_IFRAME_SRC =
  /^(https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+(?:\?[^"']*)?|https?:\/\/player\.vimeo\.com\/video\/\d+(?:\?[^"']*)?)$/i

function sanitizeIframeTags(html: string): string {
  return html.replace(/<iframe\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\ssrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
    const src = srcMatch?.[2] ?? srcMatch?.[3] ?? srcMatch?.[4] ?? ''
    if (!ALLOWED_IFRAME_SRC.test(src.trim())) return ''
    return `<iframe src="${src.trim()}" allowfullscreen loading="lazy"></iframe>`
  })
}

/** Sanitize educator article HTML - allows YouTube/Vimeo embed iframes only. */
export function sanitizeEducationHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?(?:object|embed|form|input|button|meta|link)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
  const withIframes = sanitizeIframeTags(withoutScripts.replace(/<\/iframe>/gi, ''))
  return withIframes.slice(0, 500_000)
}

export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').length : 0
  return Math.max(1, Math.ceil(words / 200))
}
