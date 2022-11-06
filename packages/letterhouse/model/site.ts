import { Address } from './address'

export interface Site {
  author: Address
  blurb?: string
  language: string
  title: string

  menu: SiteMenu

  editURLGetter?: SiteEditURLGetter
}

export type SiteMenu = SiteMenuItem[]

export interface SiteMenuItem {
  href: string
  label: string
}

export type SiteEditURLGetter = (file: string) => Promise<string | null>
