import type { Reference } from '../model/reference'

import mem from 'mem'

export type ReferenceDefinition =
  | ReferenceDefinitionString
  | ReferenceDefinitionObject

// TODO: should have different fields for different types
export interface ReferenceDefinitionObject {
  href?: string
  title?: string
  icon?: string
  dated?: string
  from?: string
  to?: string
}

export type ReferenceDefinitionString = string

async function getReferenceDefinitionObjectFromString(
  def: ReferenceDefinitionString,
): Promise<ReferenceDefinitionObject> {
  if (def !== 'https://twitter.com/BarackObama/status/896523232098078720') {
    throw new Error('Unimplemented')
  }

  return {
    href: 'https://twitter.com/BarackObama/status/896523232098078720',
    title: '"No one is born hating..."',
  }
}

async function unmemoizedDefineReference(
  definition: ReferenceDefinition,
): Promise<Reference> {
  const rdo =
    typeof definition === 'string'
      ? await getReferenceDefinitionObjectFromString(definition)
      : definition

  if (
    rdo.href !== 'https://twitter.com/BarackObama/status/896523232098078720' ||
    !rdo.title
  ) {
    throw new Error('Unimplemented')
  }

  return {
    kind: 'reference',
    type: 'external',

    url: 'https://twitter.com/BarackObama/status/896523232098078720',
    title: rdo.title,
    icon: 'twitter',
    dated: '2017/08/13',
    from: [
      {
        kind: 'address',
        name: 'Barack Obama',
        id: null,
        avatarURL:
          'https://pbs.twimg.com/profile_images/1329647526807543809/2SGvnHYV_x96.jpg',
        twitter: 'BarackObama',
      },
    ],
  }
}

export const defineReference = mem(unmemoizedDefineReference)
