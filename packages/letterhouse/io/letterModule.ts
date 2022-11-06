import { MarkdownHeading } from 'astro'

import { type Letter } from '../model/letter'
import { type AstroContent } from '../types/astro'
import { MarkdownQuote } from '../types/markdown'
import { ensureTruthyArray } from '../utils/ensureTruthyArray'

import { type AddressDefinition } from './addressDefinition'
import { getOrDefineAddress } from './addressGetters'
import { type LetterPath } from './letterPath'
import {
  type ReferenceDefinition,
  defineReference,
} from './referenceDefinition'

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
    quotes,
    blurb = quotes.find((quote) => quote.blurb)?.text ?? null,
    wordCount,
  } = module.frontmatter

  const fromDefs = contentFrom ? ensureTruthyArray(contentFrom) : [pathFrom]
  const toDefs = contentTo ? ensureTruthyArray(contentTo) : [pathTo]
  const ccDefs = ensureTruthyArray(contentCC)
  const reDefs = ensureTruthyArray(contentRe)

  const fromPromise = Promise.all(
    fromDefs.map((def) => getOrDefineAddress(def)),
  )
  const toPromise = Promise.all(toDefs.map((def) => getOrDefineAddress(def)))
  const ccPromise = Promise.all(ccDefs.map((def) => getOrDefineAddress(def)))

  const rePromise = Promise.all(reDefs.map((def) => defineReference(def)))

  const from = await fromPromise
  const to = await toPromise
  const cc = await ccPromise
  const re = await rePromise

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
    type: 'letter',
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
    blurb,
    title: contentTitle || module.getHeadings()?.[0]?.text,
    Body: module.Content,
  }
}
