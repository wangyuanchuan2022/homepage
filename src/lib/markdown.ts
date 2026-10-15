// Markdown → sanitized HTML.
// Third-party choice (documented in README):
// - markdown-it: battle-tested CommonMark renderer; configured with html:false so raw HTML
//   in user input is escaped as text (first XSS layer).
// - DOMPurify: industry-standard sanitizer applied to the rendered HTML (second XSS layer)
//   before it ever reaches dangerouslySetInnerHTML.
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

function createRenderer(opts: { breaks: boolean }) {
  const instance = new MarkdownIt({ html: false, linkify: true, breaks: opts.breaks })

  // External links open in a new tab with noopener.
  const defaultLinkOpen =
    instance.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

  instance.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const href = token.attrGet('href') || ''
    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener noreferrer')
    }
    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  // markdown-it only allows data:image/(gif|png|jpeg|webp) by default; widen to any
  // data:image/* so self-contained SVG illustrations work offline. Output still goes
  // through DOMPurify below (img src with data: URI cannot execute script).
  const defaultValidateLink = instance.validateLink
  instance.validateLink = (url: string) => {
    if (url.trim().toLowerCase().startsWith('data:image/')) return true
    return defaultValidateLink(url)
  }

  return instance
}

const md = createRenderer({ breaks: false })
// Fiction renderer: soft line breaks become <br> — chapter manuscripts write one
// dialogue utterance per line, which must not merge into single paragraphs.
const mdChapter = createRenderer({ breaks: true })

function sanitize(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'iframe', 'form'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload'],
  })
}

export function renderMarkdown(src: string): string {
  return sanitize(md.render(src))
}

/** Chapter renderer: same security model as renderMarkdown, line breaks preserved. */
export function renderChapter(src: string): string {
  return sanitize(mdChapter.render(src))
}
