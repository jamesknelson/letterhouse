import { filter, mapObjIndexed } from 'ramda'
import { existsSync } from 'node:fs'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Theme } from '../model/theme'

// TODO:
// - find all pages in the theme's /pages directory and export them
// - error if required pages (e.g. /[dated]/[slug], /address-book/[slug]) aren't there
// - validate input against a schema

export const defaultPages = {
  '/': './pages/index.astro',
  '/[dated]/[slug]': './pages/[dated]/[slug].astro',

  '/address-book': './pages/address-book/index.astro',
  '/address-book/[slug]': './pages/address-book/[slug].astro',

  '/wip': './pages/wip.astro',
  '/draft/[slug]': './pages/draft/[slug].astro',
  '/preview/[slug]': './pages/preview/[slug].astro',

  '/inbox': './pages/inbox/index.astro',
  '/inbox/[slug]': './pages/inbox/[slug].astro',
}
export const defaultStylesheets = {
  global: './styles/_global.css',
  root: './styles/_root.css',
}
export const defaultLayouts = {
  default: './layouts/SiteLayout.astro',
}

export type ThemeDefinition = Partial<Theme>

export async function defineTheme(
  definitionURL: string,
  definition: ThemeDefinition,
): Promise<Theme> {
  const src = resolve(fileURLToPath(definitionURL), '..')

  const definitionStylesheets = definition.stylesheets || {}
  const defaultStylesheetsExistingInFilesystem = filter(
    (value) => existsSync(resolve(src, value)),
    defaultStylesheets,
  )
  const stylesheets = mapObjIndexed((value) => value && resolve(src, value), {
    ...defaultStylesheetsExistingInFilesystem,
    ...definitionStylesheets,
  })
  const pages = mapObjIndexed((value) => resolve(src, value), {
    ...defaultPages,
    ...definition.pages,
  })
  const layouts = mapObjIndexed((value) => resolve(src, value), {
    ...defaultLayouts,
    ...definition.layouts,
  })

  await Promise.all([
    validateExistence(Object.values(stylesheets)),
    validateExistence(Object.values(pages)),
    validateExistence(Object.values(layouts)),
  ])

  return {
    kind: 'theme',
    layouts,
    pages,
    stylesheets,
  }
}

async function validateExistence(
  resolvedPaths: (undefined | string)[],
): Promise<void> {
  await Promise.all(resolvedPaths.map((path) => path && access(path)))
}
