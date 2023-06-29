import type { Letter, LetterRegarding } from '../model/letter'
import type { AstroContent } from '../types/astro'

import type { AddressDefinition } from './addressGetters'
import type { LetterPath } from './letterPath'
import type { WorkDefinition } from './workDatabase'

import { MarkdownHeading } from 'astro'

import { MarkdownQuote } from '../types/markdown'
import { ensureTruthyArray } from '../utils/ensureTruthyArray'
import { isURL } from '../utils/isURL'

import { getOrDefineAddress } from './addressGetters'
import { getOrDefineWork } from './workDatabase'
import { getSite } from './siteGetters'

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
  dated?: string
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
  modifiedTime: Date,
): Promise<Letter> {
  const {
    id,
    collection,
    status,
    slug,
    dated: pathDated,
    to: pathTo,
    from: pathAuthor,
  } = path

  const sitePromise = getSite()

  const {
    dated: contentDated,
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

  const re = await Promise.all(
    ensureTruthyArray(contentRe).map(getLetterRegardingFromDefinition),
  )
  const siteAuthorId = (await sitePromise).author.id

  const toDefs = contentTo
    ? ensureTruthyArray(contentTo)
    : pathTo
    ? [pathTo]
    : collection === 'inbox'
    ? [siteAuthorId]
    : []
  const to = await Promise.all(toDefs.map(getOrDefineAddress))

  const authorDefs = contentAuthors
    ? ensureTruthyArray(contentAuthors)
    : collection === 'inbox'
    ? pathAuthor
      ? [pathAuthor]
      : []
    : [siteAuthorId]
  const authors = await Promise.all(
    authorDefs.map(async (def) => ({
      kind: 'attribution' as const,
      address: await getOrDefineAddress(def),
    })),
  )

  const ccDefs = contentCC
    ? ensureTruthyArray(contentCC)
    : collection === 'inbox' ||
      to.find((address) => address.id === 'the-reader') ||
      !to.length
    ? []
    : ['the-reader']

  const cc = await Promise.all(ccDefs.map((def) => getOrDefineAddress(def)))

  const dated = contentDated || pathDated || null

  if (contentDated && pathDated && contentDated !== pathDated) {
    throw new TypeError(
      `Letter "${id}" is has a path date that doesn't match its content date (${contentDated})`,
    )
  }
  if (status === 'published' && !dated) {
    throw new TypeError(
      `For letter "${id}" to be published, it must specify a date.`,
    )
  }

  if (pathAuthor && contentAuthors && pathAuthor !== authors[0].address.id) {
    throw new TypeError(
      `Letter "${id}" is missing "${pathAuthor}" from its frontmatter's "from" field.`,
    )
  }
  if (pathTo && contentTo && pathTo !== to[0].id) {
    throw new TypeError(
      `Letter "${id}" is missing "${pathTo}" from its frontmatter's "to" field.`,
    )
  }

  return {
    kind: 'letter',
    id,
    collection,
    status,
    slug,
    dated,
    authors,
    to,
    cc,
    re,
    modifiedTime,
    wordCount,
    quotes,
    blurb,
    title: contentTitle || module.getHeadings()?.[0]?.text,
    Body: module.Content,
  }
}
