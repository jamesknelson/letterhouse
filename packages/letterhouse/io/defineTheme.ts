import { filter, mapObjIndexed } from 'ramda'
import { existsSync } from 'node:fs'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Theme } from '../model/theme'

// TODO:
// - find all pages in the theme's /pages directory and export them
// - error if required pages (e.g. /sent/[slug], /address-book/[slug]) aren't there
// - validate input against a schema

export const defaultPages = {
  '/': './pages/index.astro',

  '/address-book': './pages/address-book/index.astro',
  '/address-book/[slug]': './pages/address-book/[slug].astro',

  '/draft': './pages/draft/index.astro',
  '/draft/[slug]': './pages/draft/[slug].astro',

  '/received': './pages/received/index.astro',
  '/received/[slug]': './pages/received/[slug].astro',

  '/sent/[slug]': './pages/sent/[slug].astro',
}
export const defaultStylesheets = {
  global: './styles/_global.css',
  root: './styles/_root.css',
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

  await Promise.all([
    validateExistence(Object.values(stylesheets)),
    validateExistence(Object.values(pages)),
  ])

  return {
    pages,
    stylesheets,
  }
}

async function validateExistence(
  resolvedPaths: (undefined | string)[],
): Promise<void> {
  await Promise.all(resolvedPaths.map((path) => path && access(path)))
}
