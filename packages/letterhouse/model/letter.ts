import type { AstroContent } from '../types/astro'

import type { Address } from './address'
import type { Attribution } from './attribution'
import type { Work } from './work'

export interface Letter {
  kind: 'letter'

  category: LetterCategory

  // The path within `data` where the letter file was located,
  // excluding the letter file itself.
  id: string
  file: string

  // An undated letter is considered a draft.
  dated: null | string

  // If not specified, will be extracted from the letter id by default.
  authors: Attribution[]

  to: Address[]
  cc: Address[]

  // A list of works, #hashtags or text descriptions of what subject this
  // letter is addressing.
  re: LetterRegarding[]

  // An optional key which can be used for human-readable URLs.
  slug: string | null

  // If not specified, will by default be extracted from the first heading.
  // If no headings are present, it will be null – and where necessary for
  // display purposes, a title should be generated from the date/from/to/etc.
  title: string | null

  // An optional short text description of the letter, which can be used for
  // cards, social media, search engines, etc. If present, this will also be
  // rendered above the content (and after any title).
  blurb: string | null

  wordCount: number

  quotes: LetterQuote[]

  Body: AstroContent
}

export type LetterCategory = 'sent' | 'received' | 'draft'

export interface LetterQuote {
  text: string
  work?: Work
}

export type LetterRegarding =
  | { type: 'topic'; value: string }
  | { type: 'text'; value: string }
  | { type: 'work'; value: Work }
