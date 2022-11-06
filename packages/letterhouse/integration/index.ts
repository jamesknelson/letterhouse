import { type AstroIntegration } from 'astro'

import { type Theme } from '../model/theme'
import { getPatternFromPagePath } from '../utils/getPatternFromPagePath'

import remarkPlugins from './remarkPlugins'

export interface LetterhouseIntegrationOptions {
  theme: Theme
}

export default function letterhouseIntegration({
  theme,
}: LetterhouseIntegrationOptions): AstroIntegration {
  return {
    name: 'letterhouse',
    hooks: {
      'astro:config:setup': async function ({ injectRoute, updateConfig }) {
        const sitePageModules = import.meta.glob('/src/pages/**/*')
        const sitePagePatterns = Object.keys(sitePageModules).map(
          getPatternFromPagePath,
        )

        // Inject the theme's default routes, where they're not overridden by
        // the app itself.
        for (const [pattern, entryPoint] of Object.entries(theme.pages)) {
          if (!sitePagePatterns.includes(pattern)) {
            injectRoute({
              pattern,
              entryPoint,
            })
          }
        }

        updateConfig({
          markdown: {
            remarkPlugins: remarkPlugins,
            extendDefaultPlugins: true,
          },
        })
      },
    },
  }
}
