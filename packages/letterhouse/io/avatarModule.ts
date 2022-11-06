export interface AvatarModule {
  default: string
}

export function validateAvatarModule(maybeAvatarModule: any): string[] {
  if (!maybeAvatarModule || typeof maybeAvatarModule.default !== 'string') {
    // TODO:
    // - validate the path as well as the module, and use the path in any
    //   error messages
    // - return useful errors via a JSON schema validation
    return ['not an avatar']
  }

  return []
}

export function isMaybeAvatarModule(
  maybeAvatarModule: any,
): maybeAvatarModule is AvatarModule | undefined {
  return (
    maybeAvatarModule === undefined ||
    validateAvatarModule(maybeAvatarModule).length === 0
  )
}
