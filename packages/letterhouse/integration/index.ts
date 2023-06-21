import type { AstroIntegration } from 'astro'

import type { Theme } from '../model/theme'

import mdxIntegration from '@astrojs/mdx'
import rss from '@astrojs/rss'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postCSSImport from 'postcss-import'
import postCSSPresetEnv from 'postcss-preset-env'

import { getPatternFromPagePath } from '../utils/getPatternFromPagePath'

import { getRehypePlugins } from './markdown'

export interface LetterhouseIntegrationOptions {
  theme: Theme
}

export default function letterhouseIntegration({
  theme,
}: LetterhouseIntegrationOptions): AstroIntegration[] {
  return [
    {
      name: 'letterhouse',
      hooks: {
        'astro:config:setup': async function ({
          config,
          injectRoute,
          injectScript,
          updateConfig,
        }) {
          const hasPostCSSConfig =
            Object.keys(import.meta.glob('/src/postcss.config.js')).length > 0
          const postCSSConfig = config.vite.css?.postcss
          // TODO: Using `unknown` here as the types seem to be wrong
          const postCSSPlugins: unknown[] =
            typeof postCSSConfig === 'string' || !postCSSConfig?.plugins
              ? []
              : postCSSConfig.plugins
          if (!hasPostCSSConfig) {
            postCSSPlugins.push(
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

          // Inject the RSS route
          injectRoute({
            pattern: '/rss.xml',
            entryPoint: resolve(
              fileURLToPath(import.meta.url),
              '../../pages/rss.xml.ts',
            ),
          })

          updateConfig({
            vite: {
              css: {
                postcss: {
                  plugins: postCSSPlugins,
                },
              },
            },
            markdown: {
              rehypePlugins: getRehypePlugins(theme.layouts),
              extendDefaultPlugins: true,
            },
          })

          if (theme.stylesheets.global) {
            injectScript('page-ssr', `import "${theme.stylesheets.global}";`)
          }
        },
      },
    },
    mdxIntegration({
      rehypePlugins: getRehypePlugins(theme.layouts),
      extendMarkdownConfig: true,
    }),
  ]
}
