import { LetterCategory } from '../model/letter'

export interface LetterPath {
  id: string
  file: string
  category: LetterCategory
  to: string
  from: string
  dated: string | null
  slug: string | null
}

export function parseLetterPath(path: string): LetterPath {
  const result: LetterPath = {
    // These are both set to "myself" as all formats must override at least
    // one of these.
    id: path.replace(/\/letter\.mdx?$/, ''),
    file: path.split('../content/')[1],
    category: 'draft',
    to: 'myself',
    from: 'myself',
    dated: null,
    slug: null,
  }

  for (const { category, pattern, parts } of formats) {
    const match = path.match(pattern)
    if (match) {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const value = match[i + 1]

        // TODO: sanity check on value based on part

        result[part] = value
      }
      result.category = category
      return result
    }
  }

  throw new TypeError('Unknown letter id format: ' + path)
}

type FormatPart = 'dated' | 'from' | 'to' | 'slug'

interface Format {
  pattern: RegExp
  parts: FormatPart[]
  category: LetterCategory
}

const formats: Format[] = [
  {
    pattern:
      /received\/(\d{4}-\d{2}-\d{2})-from-((?:(?!--).)+)(?:--(.+))?\/letter\.mdx?$/,
    parts: ['dated', 'from', 'slug'],
    category: 'received',
  },
  {
    pattern:
      /sent\/(\d{4}-\d{2}-\d{2})-to-((?:(?!--).)+)(?:--(.+))?\/letter\.mdx?$/,
    parts: ['dated', 'to', 'slug'],
    category: 'sent',
  },
  {
    pattern: /sent\/draft-to-((?:(?!--).)+)(?:--(.+))?\/letter\.mdx?$/,
    parts: ['to', 'slug'],
    category: 'draft',
  },
]
