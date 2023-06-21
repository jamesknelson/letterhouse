import { Address } from './address'

export interface Site {
  kind: 'site'

  // Will be true if this is an unpublished version of the site, not meant for
  // public consumption.
  unpublished: boolean

  author: Address
  blurb: string
  language: string
  title: string

  menu: SiteMenu
}

export type SiteMenu = SiteMenuItem[]

export interface SiteMenuItem {
  href: string
  label: string
}
