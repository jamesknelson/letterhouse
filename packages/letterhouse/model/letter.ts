import type { AstroContent } from '../types/astro'

import type { Address } from './address'
import type { Attribution } from './attribution'
import type { Work } from './work'

// TODO: type published posts as always having a date
export interface Letter {
  kind: 'letter'

  // The path where the letter was located on the filesystem.
  id: string

  collection: LetterCollection
  status: LetterStatus

  // All published letters must be dated.
  dated: null | string

  // If not specified, will be extracted from the letter id by default.
  authors: Attribution[]

  to: Address[]
  cc: Address[]

  // A list of works, #hashtags or text descriptions of what subject this
  // letter is addressing.
  re: LetterRegarding[]

  // Used for human-readable URLs.
  slug: string

  // If not specified, will by default be extracted from the first heading.
  // If no headings are present, it will be null – and where necessary for
  // display purposes, a title should be generated from the date/from/to/etc.
  title: string | null

  // An optional short text description of the letter, which can be used for
  // cards, social media, search engines, etc. If present, this will also be
  // rendered above the content (and after any title).
  blurb: string | null

  modifiedTime: Date
  wordCount: number

  quotes: LetterQuote[]

  Body: AstroContent
}

export type LetterCollection = 'inbox' | 'posts'

export type LetterStatus = 'draft' | 'preview' | 'published'

export interface LetterQuote {
  text: string
  work?: Work
}

export type LetterRegarding =
  | { type: 'topic'; value: string }
  | { type: 'text'; value: string }
  | { type: 'work'; value: Work }

function isInbox() {}
