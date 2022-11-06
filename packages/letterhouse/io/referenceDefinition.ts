import mem from 'mem'

import { type Address } from '../model/address'
import { type Reference, type ReferenceKind } from '../model/reference'

export type ReferenceDefinition =
  | ReferenceDefinitionString
  | ReferenceDefinitionObject

// TODO: should have different fields for different types
export interface ReferenceDefinitionObject {
  kind: ReferenceKind
  label: string
  sourceURL: string

  author?: Address
  embedURL?: string
  title?: string
}

export type ReferenceDefinitionString = string

async function defineReferenceFromString(
  definition: ReferenceDefinitionString,
): Promise<Reference> {
  if (definition.startsWith('@')) {
  } else if (definition) {
  }
}

async function unmemoizedDefineReference(
  definition: ReferenceDefinition,
): Promise<Reference> {
  if (typeof definition === 'string') {
    return {
      type: 'reference',
    }
  } else {
    // TODO: validate

    return {
      type: 'reference',
    }
  }
}

export const defineReference = mem(unmemoizedDefineReference)
