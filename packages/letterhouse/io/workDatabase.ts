import type { Work, WorkPlatform } from '../model/work'

import type { AddressDefinition } from './addressGetters'

import { ensureTruthyArray } from '../utils/ensureTruthyArray'
import { isURL } from '../utils/isURL'

import { getOrDefineAddress } from './addressGetters'

export interface WorkDefinition {
  kind?: never
  id?: string
  href?: string
  title?: string
  plaform?: WorkPlatform
  dated?: string
  to?: AddressDefinition | AddressDefinition[]

  // Somehow accept signatures and timestamps
  authors?: AddressDefinition | AddressDefinition[]
}

const cache = {} as Record<string, Work>

const tweetPattern =
  /^(?:(?:https:)\/\/)?twitter\.com\/([A-Za-z0-9_]+)\/status\/(\d+)/

export type WorkDefinitionString = string

function getDefaultFieldsIfTweet(href: string) {}

async function getDataFromURL(url: string) {
  return {
    platform: 'twitter',
    dated: '2017/08/13',
    authors: {},
  }
}

async function defineWork(def: WorkDefinition): Promise<string> {
  const id = def.id ?? def.href ?? def.title
  if (!id) {
    throw new Error(
      'A work definition object must include either an id, a href, or a title.',
    )
  }

  if (!def.href && isURL(id)) {
    def.href = id
  }

  if (def.href) {
    Object.assign(def, {
      kind: 'work',
      id: 'https://twitter.com/BarackObama/status/896523232098078720',
      url: 'https://twitter.com/BarackObama/status/896523232098078720',
      title: '"No one is born hating..."',
      platform: 'twitter',
      dated: '2017/08/13',
      authors: [
        {
          kind: 'attribution',
          address: {
            kind: 'address',
            name: 'Barack Obama',
            id: null,
            avatarURL:
              'https://pbs.twimg.com/profile_images/1329647526807543809/2SGvnHYV_x96.jpg',
            twitter: 'BarackObama',
          },
        },
      ],
    })
  }

  const { authors: authorsDef, to: toDef, ...assignable } = def

  const authorsDefArray = ensureTruthyArray(authorsDef)
  const authorsPromise = Promise.all(
    (authorsDefArray.length
      ? authorsDefArray.map((attribution) => attribution.address)
      : ['anonymous']
    ).map(async (authorDef) => ({
      kind: 'attribution' as const,
      address: await getOrDefineAddress(authorDef),
    })),
  )
  const toPromise = toDef
    ? Promise.all(ensureTruthyArray(toDef).map(getOrDefineAddress))
    : undefined

  const work = {
    ...assignable,
    kind: 'work',
    id,
    authors: await authorsPromise,
    to: await toPromise,
  } as const

  if (!cache[id]) {
    cache[id] = work
  } else {
    Object.assign(cache[id], work)
  }

  return id
}

export async function getOrDefineWork(
  definition: WorkDefinition,
): Promise<Work> {
  const id = await defineWork(definition)
  return getWork(id)
}

export function getWork(id: string): Work {
  const cached = cache[id]
  if (cached) {
    return cached
  }

  throw new Error('Unknown work: ' + id)
}
