import { LetterCollection, LetterStatus } from '../model/letter'

const pattern = /\/(posts|inbox)\/(draft|preview|published)\/([^\.\/]+)\.md$/

export interface LetterPath {
  id: string
  collection: LetterCollection
  status: LetterStatus
  slug: string

  dated?: string
  to?: string
  from?: string
}

export function parseLetterPath(path: string): LetterPath {
  const match = path.match(pattern)
  if (match) {
    const [, collection, status, slug] = match
    const result: LetterPath = {
      id: path.replace(/\.md$/, ''),
      collection: collection as LetterCollection,
      status: status as LetterStatus,
      slug,
    }

    for (const { pattern, property } of extractables) {
      const match = slug.match(pattern)
      if (match) {
        const value = match[1]
        if (property === 'dated') {
          result.slug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
          result[property] = value
        } else if (
          (property === 'to' || property === 'from') &&
          value !== 'enclosed'
        ) {
          result[property] = value.replace(/-et-al$/, '')
        }
      }
    }

    return result
  }

  throw new TypeError('Unknown letter id format: ' + path)
}

interface Extractable {
  pattern: RegExp
  property: Extract<keyof LetterPath, 'dated' | 'to' | 'from'>
}

const extractables: Extractable[] = [
  {
    pattern: /(?:^|-)(\d{4}-\d{2}-\d{2})-/,
    property: 'dated',
  },
  {
    pattern: /(?:^|-)to-((?:(?!-re-).)+)(?:-re-(.+))?$/,
    property: 'to',
  },
  {
    pattern: /(?:^|-)from-((?:(?!-re-).)+)(?:-re-(.+))?$/,
    property: 'from',
  },
]
