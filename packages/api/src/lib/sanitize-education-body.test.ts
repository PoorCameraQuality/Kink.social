import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { estimateReadingMinutes, sanitizeEducationHtml } from './sanitize-education-body.js'

describe('sanitizeEducationHtml', () => {
  it('allows YouTube embed iframe with safe src', () => {
    const html =
      '<p>Intro</p><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>'
    const out = sanitizeEducationHtml(html)
    assert.match(out, /youtube\.com\/embed\/dQw4w9WgXcQ/)
  })

  it('strips unsafe iframe src', () => {
    const html = '<iframe src="https://evil.example/phish"></iframe>'
    assert.equal(sanitizeEducationHtml(html).includes('<iframe'), false)
  })

  it('estimateReadingMinutes returns at least 1', () => {
    assert.equal(estimateReadingMinutes('<p>' + 'word '.repeat(250) + '</p>'), 2)
  })
})
