import mem from 'mem'

import { type Address, getDefaultAddressAvatarURL } from '../model/address'
import { humanize } from '../utils/humanize'

export type AddressDefinition = string | AddressDefinitionObject

export interface AddressDefinitionObject {
  kind?: never
  name: string
}

function unmemoizedDefineAddress(definition: AddressDefinition): Address {
  if (typeof definition === 'string') {
    const name = humanize(definition)

    return {
      kind: 'address',
      name,
      id: null,
      avatarURL: getDefaultAddressAvatarURL(name),
      Notes: undefined,
    }
  } else {
    // TODO: validate

    return {
      avatarURL: getDefaultAddressAvatarURL(definition.name),
      ...definition,
      kind: 'address',
      id: null,
      Notes: undefined,
    }
  }
}

export const defineAddress = mem(unmemoizedDefineAddress)
