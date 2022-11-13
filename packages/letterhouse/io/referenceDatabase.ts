import type { Reference } from '../model/reference'

// If a string is passed in, the string is treated as the id.
export type ReferenceDefinition =
  | ReferenceDefinitionString
  | ReferenceDefinitionObject

export interface ReferenceDefinitionObject {
  id: string
  href?: string
  title?: string
  icon?: string
  dated?: string
  from?: string
  to?: string
}

// TODO:
// - if called w/ a previously defined href, return the previous definition,
//   ignoring any other parameters.

export type ReferenceDefinitionString = string

async function getReferenceDefinitionObjectFromString(
  def: ReferenceDefinitionString,
): Promise<ReferenceDefinitionObject> {
  if (def !== 'https://twitter.com/BarackObama/status/896523232098078720') {
    throw new Error('Unimplemented')
  }

  return {
    id: 'https://twitter.com/BarackObama/status/896523232098078720',
    href: 'https://twitter.com/BarackObama/status/896523232098078720',
    title: '"No one is born hating..."',
  }
}

// TODO:
// - this should merge any existing data for the specified id with new data
export async function defineReference(
  definition: ReferenceDefinition,
): Promise<void> {
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
}

export async function getOrDefineReference(
  definition: ReferenceDefinition,
): Promise<Reference> {
  return {
    kind: 'reference',
    type: 'external',

    id: 'https://twitter.com/BarackObama/status/896523232098078720',
    url: 'https://twitter.com/BarackObama/status/896523232098078720',
    title: '"No one is born hating..."',
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

export async function getReference(id: string): Promise<Reference> {
  return {
    kind: 'reference',
    type: 'external',

    id: 'https://twitter.com/BarackObama/status/896523232098078720',
    url: 'https://twitter.com/BarackObama/status/896523232098078720',
    title: '"No one is born hating..."',
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
