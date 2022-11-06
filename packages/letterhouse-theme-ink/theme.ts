import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// TODO: create a helper for this in the letterhouse package
const filename = fileURLToPath(import.meta.url)
const theme = {
  pages: {
    '/': resolve(filename, '../pages/index.astro'),
  },
}

export default theme
