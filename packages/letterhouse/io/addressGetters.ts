import type { Address } from '../model/address'

import type { AvatarModule } from './avatarModule'
import type { ProfileModule } from './profileModule'

import mem from 'mem'

import { NotFoundError } from '../utils/notFoundError'

import { isMaybeAvatarModule, validateAvatarModule } from './avatarModule'
import {
  getAddressBookAvatarModules,
  getAddressBookProfileModules,
} from './moduleGetters'
import { isProfileModule, validateProfileModule } from './profileModule'

import { humanize } from '../utils/humanize'

export type AddressDefinition = string | AddressDefinitionObject

export type AddressDefinitionObject =
  | {
      kind?: never
      name: string
      twitter?: string
    }
  | {
      kind?: never
      name?: string
      twitter: string
    }

export async function getOrDefineAddress(
  definition: Address | AddressDefinition,
): Promise<Address> {
  if (typeof definition !== 'string' && definition.kind === 'address') {
    return definition
  }

  // TODO: how do we fall back to defaults for an address?
  // - regardless of whether an address is defined from a definition object,
  //   or defined in a file, if an address has a twitter field, we want the
  //   *default* name and photo to come from it

  try {
    return getAddress(definition as string)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Promise.resolve(defineAddress(definition))
    } else {
      throw error
    }
  }
}

export function getAddress(id: string): Promise<Address> {
  const loader = getAddressLoaderMap().get(id)
  if (!loader) {
    throw new NotFoundError(id, 'address')
  }
  return loader()
}

export function getAddressBook(): Promise<Address[]> {
  return Promise.all(
    [...getAddressLoaderMap().values()].map((loader) => loader()),
  )
}

///

const getAddressLoaderMap: {
  (): Map<string, () => Promise<Address>>
  cache?: Map<string, () => Promise<Address>>
} = () => {
  if (!getAddressLoaderMap.cache) {
    const avatarLoaderMap = new Map(
      [...Object.entries(getAddressBookAvatarModules())].map(
        ([path, moduleLoader]) => {
          const pattern = /\/([\d\w-]+)\/avatar\.\w+$/
          const match = path.match(pattern)
          if (!match) {
            throw new TypeError(
              `File "${path}" of unknown type found in content directory.`,
            )
          }
          const [, id] = match
          return [id, moduleLoader]
        },
      ),
    )

    getAddressLoaderMap.cache = new Map(
      [...Object.entries(getAddressBookProfileModules())].map(
        ([path, moduleLoader]) => {
          const pattern = /\/([\d\w-]+)\/profile\.\w+$/
          const match = path.match(pattern)
          if (!match) {
            throw new TypeError(
              `File "${path}" of unknown type found in content directory.`,
            )
          }
          const [, id] = match
          const loader = async (): Promise<Address> => {
            const avatarLoader = avatarLoaderMap.get(id)
            const [avatarModule, profileModule] = await Promise.all([
              avatarLoader?.(),
              moduleLoader(),
            ])

            if (
              isProfileModule(profileModule) &&
              isMaybeAvatarModule(avatarModule)
            ) {
              return createAddressFromModules(id, profileModule, avatarModule)
            } else {
              const messages = validateProfileModule(profileModule).concat(
                validateAvatarModule(avatarModule),
              )
              throw new Error(messages.join('\n'))
            }
          }

          return [id, mem(loader)] as const
        },
      ),
    )
  }
  return getAddressLoaderMap.cache
}

function createAddressFromModules(
  id: string,
  profileModule: ProfileModule,
  maybeAvatarModule?: AvatarModule,
): Address {
  return {
    kind: 'address',
    id,
    ...profileModule.frontmatter,
    avatarURL:
      maybeAvatarModule?.default ??
      getDefaultAddressAvatarURL(profileModule.frontmatter.name),
    Notes: profileModule.Content ?? undefined,
  }
}

function unmemoizedDefineAddress(definition: AddressDefinition): Address {
  if (typeof definition === 'string') {
    const name = humanize(definition)

    return {
      kind: 'address',
      name,
      id: definition,
      avatarURL: getDefaultAddressAvatarURL(name),
      Notes: undefined,
    }
  } else {
    // TODO: validate

    return {
      ...getDefaultAddressDetails(definition),
      kind: 'address',
      id: null,
      Notes: undefined,
    }
  }
}

const defineAddress = mem(unmemoizedDefineAddress)

function getDefaultAddressAvatarURL(name: string) {
  return `https://ui-avatars.com/api/?size=256&background=d8dbde&color=606672&name=${name.replace(
    /\s+/g,
    '+',
  )}`
}

// TODO: memoize
async function getDefaultAddressDetails(def: AddressDefinitionObject): Promise<{
  name: string
  avatarURL: string
}> {
  if (!def.twitter) {
    const name = def.name!
    return {
      name,
      avatarURL: getDefaultAddressAvatarURL(name),
    }
  } else {
    return {
      name: 'TODO',
      avatarURL: getDefaultAddressAvatarURL('Alpha'),
    }
  }
}
