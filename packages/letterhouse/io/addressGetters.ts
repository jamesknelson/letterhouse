import mem from 'mem'

import { getDefaultAddressAvatarURL, type Address } from '../model/address'
import { NotFoundError } from '../utils/notFoundError'

import {
  type AvatarModule,
  isMaybeAvatarModule,
  validateAvatarModule,
} from './avatarModule'
import {
  getAddressBookAvatarModules,
  getAddressBookProfileModules,
} from './moduleGetters'
import {
  type ProfileModule,
  isProfileModule,
  validateProfileModule,
} from './profileModule'
import { type AddressDefinition, defineAddress } from './addressDefinition'

export async function getOrDefineAddress(
  definition: Address | AddressDefinition,
): Promise<Address> {
  if (typeof definition !== 'string' && definition.kind === 'address') {
    return definition
  }

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
