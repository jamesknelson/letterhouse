import type { Letter, LetterRegarding } from '../model/letter'
import type { AstroContent } from '../types/astro'

import type { AddressDefinition } from './addressDefinition'
import type { LetterPath } from './letterPath'
import type { WorkDefinition } from './workDatabase'

import { MarkdownHeading } from 'astro'
import { uniq } from 'ramda'

import { MarkdownQuote } from '../types/markdown'
import { ensureTruthyArray } from '../utils/ensureTruthyArray'
import { isURL } from '../utils/isURL'

import { getOrDefineAddress } from './addressGetters'
import { getOrDefineWork } from './workDatabase'

export interface LetterModule {
  Content: AstroContent
  getHeadings: () => MarkdownHeading[]
  frontmatter: LetterModuleFrontmatter
}

async function getLetterRegardingFromDefinition(
  def: any,
): Promise<LetterRegarding> {
  if (typeof def === 'string') {
    if (def.startsWith('#')) {
      return {
        type: 'topic',
        value: def,
      }
    } else if (isURL(def)) {
      return {
        type: 'work',
        value: await getOrDefineWork({ href: def }),
      }
    } else {
      return {
        type: 'text',
        value: def,
      }
    }
  }

  return {
    type: 'work',
    value: await getOrDefineWork(def),
  }
}

export interface LetterModuleFrontmatter {
  from?: AddressDefinition | AddressDefinition[]
  to?: AddressDefinition | AddressDefinition[]
  cc?: AddressDefinition | AddressDefinition[]
  re?: WorkDefinition | WorkDefinition[]
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
  const { id, category, slug, dated, from: pathAuthors, to: pathTo } = path

  const {
    from: contentAuthors,
    to: contentTo,
    cc: contentCC,
    re: contentRe,
    title: contentTitle,
    blurb = null,
    quotes: contentQuotes,
    wordCount,
  } = module.frontmatter

  const quotes = await Promise.all(
    contentQuotes.map(async (quote) => {
      const work = quote.work && (await getOrDefineWork(quote.work))
      return {
        text: quote.text,
        work,
      }
    }),
  )

  const reDefs = contentRe
    ? ensureTruthyArray(contentRe)
    : quotes.map((quote) => quote.work)
  const re = await Promise.all(reDefs.map(getLetterRegardingFromDefinition))
  const reAuthorAddresses = uniq(
    re.flatMap((reference) =>
      reference.type === 'work'
        ? reference.value.authors.map((attribution) => attribution.address)
        : [],
    ),
  )

  const authorDefs = contentAuthors
    ? ensureTruthyArray(contentAuthors)
    : [pathAuthors]
  const toDefs = contentTo
    ? ensureTruthyArray(contentTo)
    : reAuthorAddresses.length
    ? reAuthorAddresses
    : [pathTo]

  const authorsPromise = await Promise.all(
    authorDefs.map(async (def) => ({
      kind: 'attribution' as const,
      address: await getOrDefineAddress(def),
    })),
  )
  const toPromise = Promise.all(toDefs.map((def) => getOrDefineAddress(def)))

  const authors = await authorsPromise
  const to = await toPromise

  const ccDefs = contentCC
    ? ensureTruthyArray(contentCC)
    : category === 'received' ||
      to.find((address) => address.id === 'the-reader')
    ? []
    : ['the-reader']

  const cc = await Promise.all(ccDefs.map((def) => getOrDefineAddress(def)))

  if ((authors[0].address.id ?? 'enclosed') !== pathAuthors) {
    throw new TypeError(
      `Letter "${id}" is missing "${pathAuthors}" from its frontmatter's "from" field.`,
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
    authors,
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
