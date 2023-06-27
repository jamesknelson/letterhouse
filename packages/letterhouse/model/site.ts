import type { AstroComponentFactory } from 'astro/dist/runtime/server'
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

  intro: AstroComponentFactory
}

export type SiteMenu = SiteMenuItem[]

export interface SiteMenuItem {
  href: string
  label: string
}
