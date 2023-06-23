import { Address } from './address'

export interface Site {
  kind: 'site'

  // Will be true if this is an wip version of the site, not meant for
  // public consumption.
  wip: boolean

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
