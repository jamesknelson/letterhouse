import { type AstroIntegration } from 'astro'
import postCSSImport from 'postcss-import'
import postCSSPresetEnv from 'postcss-preset-env'

import { type Theme } from '../model/theme'
import { getPatternFromPagePath } from '../utils/getPatternFromPagePath'

import remarkPlugins from './remarkPlugins'

export interface LetterhouseIntegrationOptions {
  theme: Theme | Promise<Theme>
}

export default function letterhouseIntegration({
  theme: themeOrPromise,
}: LetterhouseIntegrationOptions): AstroIntegration {
  return {
    name: 'letterhouse',
    hooks: {
      'astro:config:setup': async function ({
        config,
        injectRoute,
        injectScript,
        updateConfig,
      }) {
        const theme = await themeOrPromise

        const sitePageModules = import.meta.glob('/src/pages/**/*')
        const sitePagePatterns = Object.keys(sitePageModules).map(
          getPatternFromPagePath,
        )

        if (theme.stylesheets.global) {
          injectScript('page-ssr', `import "${theme.stylesheets.global}";`)
        }

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

        const hasPostCSSConfig =
          Object.keys(import.meta.glob('/src/postcss.config.js')).length > 0
        if (!hasPostCSSConfig) {
          config.style.postcss.plugins.push(
            postCSSImport,
            postCSSPresetEnv({
              stage: 2,
              features: {
                // Modern browsers can handle custom properties without transpilation,
                // and this plugin also complains about the `importFrom` which is
                // necessary to get custom media to work reliably, so I'm leaving
                // this one out.
                'custom-properties': false,

                // At the time of writing, nesting rules aren't yet at stage 2, but in
                // my judgement they make a big positive (and intuitive) impact to the
                // theme's CSS quality, and I can't see the downside to including them.
                'nesting-rules': true,
              },
              importFrom: theme.stylesheets.root
                ? [theme.stylesheets.root]
                : [],
            }),
          )
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
