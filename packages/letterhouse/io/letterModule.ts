import type { Letter } from '../model/letter'
import type { AstroContent } from '../types/astro'

import type { AddressDefinition } from './addressDefinition'
import type { LetterPath } from './letterPath'
import type { ReferenceDefinition } from './referenceDatabase'

import { MarkdownHeading } from 'astro'
import { uniq } from 'ramda'

import { MarkdownQuote } from '../types/markdown'
import { ensureTruthyArray } from '../utils/ensureTruthyArray'

import { getOrDefineAddress } from './addressGetters'
import { defineReference, getOrDefineReference } from './referenceDatabase'

export interface LetterModule {
  Content: AstroContent
  getHeadings: () => MarkdownHeading[]
  frontmatter: LetterModuleFrontmatter
}

export interface LetterModuleFrontmatter {
  from?: AddressDefinition | AddressDefinition[]
  to?: AddressDefinition | AddressDefinition[]
  cc?: AddressDefinition | AddressDefinition[]
  re?: ReferenceDefinition | ReferenceDefinition[]
  title?: string
  blurb?: string
  quotes: MarkdownQuote[]
  wordCount: number
}

export function validateLetterModule(maybeLetterModule: any): string[] {
  if (
    !maybeLetterModule ||
    typeof maybeLetterModule.frontmatter.wordCount !== 'number' ||
    !maybeLetterModule.Content
  ) {
    // TODO: return useful errors via a JSON schema validation
    return ['not a letter module']
  }
  return []
}

export function isLetterContent(
  maybeLetterModule: any,
): maybeLetterModule is LetterModule {
  return validateLetterModule(maybeLetterModule).length === 0
}

export async function getLetterFromModuleAndPath(
  module: LetterModule,
  path: LetterPath,
): Promise<Letter> {
  const { id, category, slug, dated, from: pathFrom, to: pathTo } = path

  const {
    from: contentFrom,
    to: contentTo,
    cc: contentCC,
    re: contentRe,
    title: contentTitle,
    blurb = null,
    quotes,
    wordCount,
  } = module.frontmatter

  // Define all quote references before defining any `re` references (including
  // a default), so that any data specified in quotes will be available in the
  // Reference objects on the letter.re array.
  await Promise.all(
    quotes
      .map((quote) => quote.reference)
      .filter(Boolean)
      .map(defineReference),
  )

  const reDefs = contentRe
    ? ensureTruthyArray(contentRe)
    : quotes.map((quote) => quote.reference)
  const re = await Promise.all(reDefs.map((def) => getOrDefineReference(def)))
  const reFrom = uniq(re.flatMap((reference) => reference.from))

  const fromDefs = contentFrom ? ensureTruthyArray(contentFrom) : [pathFrom]
  const toDefs = contentTo
    ? ensureTruthyArray(contentTo)
    : reFrom.length
    ? reFrom
    : [pathTo]

  const fromPromise = Promise.all(
    fromDefs.map((def) => getOrDefineAddress(def)),
  )
  const toPromise = Promise.all(toDefs.map((def) => getOrDefineAddress(def)))

  const from = await fromPromise
  const to = await toPromise

  const ccDefs = contentCC
    ? ensureTruthyArray(contentCC)
    : category === 'received' ||
      to.find((address) => address.id === 'the-reader')
    ? []
    : ['the-reader']

  const cc = await Promise.all(ccDefs.map((def) => getOrDefineAddress(def)))

  if ((from[0].id ?? 'enclosed') !== pathFrom) {
    throw new TypeError(
      `Letter "${id}" is missing "${pathFrom}" from its frontmatter's "from" field.`,
    )
  }
  if ((to[0].id ?? 'enclosed') !== pathTo) {
    throw new TypeError(
      `Letter "${id}" is missing "${pathTo}" from its frontmatter's "to" field.`,
    )
  }

  return {
    kind: 'letter',
    id,
    file: path.file,
    category,
    slug,
    dated,
    from,
    to,
    cc,
    re,
    wordCount,
    quotes,
    blurb,
    title: contentTitle || module.getHeadings()?.[0]?.text,
    Body: module.Content,
  }
}
