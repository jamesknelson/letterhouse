import mem from 'mem'

import { type Address, getDefaultAddressAvatarURL } from '../model/address'
import { humanize } from '../utils/humanize'

export type AddressDefinition = string | AddressDefinitionObject

export interface AddressDefinitionObject {
  name: string
}

function unmemoizedDefineAddress(definition: AddressDefinition): Address {
  if (typeof definition === 'string') {
    const name = humanize(definition)

    return {
      type: 'address',
      name,
      id: null,
      avatarURL: getDefaultAddressAvatarURL(name),
      Notes: null,
    }
  } else {
    // TODO: validate

    return {
      avatarURL: getDefaultAddressAvatarURL(definition.name),
      ...definition,
      type: 'address',
      id: null,
      Notes: null,
    }
  }
}

export const defineAddress = mem(unmemoizedDefineAddress)
