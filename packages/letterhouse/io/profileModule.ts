import { AstroContent } from '../types/astro'

export interface ProfileModuleFrontmatter {
  name: string
  blurb?: string
  email?: string
  siteURL?: string
}

export interface ProfileModule {
  Content: AstroContent | null
  frontmatter: ProfileModuleFrontmatter
}

export function validateProfileModule(maybeProfileModule: any): string[] {
  return maybeProfileModule && maybeProfileModule.frontmatter?.name
    ? []
    : [
        // TODO: return something useful via JSON schema validation
        'not a profile',
      ]
}

export function isProfileModule(
  maybeProfileModule: any,
): maybeProfileModule is ProfileModule {
  return (
    maybeProfileModule &&
    maybeProfileModule.Content &&
    maybeProfileModule.frontmatter?.name
  )
}
