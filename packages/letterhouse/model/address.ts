import { AstroContent } from '../types/astro'

export interface Address {
  kind: 'address'
  name: string
  id: string | null // Present iff the address is in the site's address book
  email?: string
  twitter?: string
  blurb?: string
  avatarURL: string
  siteURL?: string // Could be a twitter if that's all they've got
  Notes?: AstroContent
}

export function getDefaultAddressAvatarURL(name: string) {
  return `https://ui-avatars.com/api/?size=256&background=d8dbde&color=606672&name=${name.replace(
    /\s+/g,
    '+',
  )}`
}
