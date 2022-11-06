import { defineConfig } from 'astro/config'
import letterhouseIntegration from 'letterhouse/integration'
import theme from 'letterhouse-theme-ink/theme'

// https://astro.build/config
export default defineConfig({
  integrations: [
    letterhouseIntegration({
      theme,
    })
  ]
});