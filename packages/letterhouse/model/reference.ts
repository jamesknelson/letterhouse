import { Address } from './address'

export type ReferenceKind = 'book' | 'tweet' | 'letter' | 'web' | 'youtube'
// as all reference require a source URL, before adding topic
// support, I probably should have a /topics route that we can reference as
// the source, and possibly a /content/topics directory so the site owner can
// write their own notes on topics
// | 'topic'

export interface Reference {
  type: 'reference'
  kind: ReferenceKind
  sourceURL: string
  iconURL: string
  label: string

  author?: Address
  embedURL?: string
  title?: string
}
