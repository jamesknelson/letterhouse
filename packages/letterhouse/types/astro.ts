import type { MarkdownInstance } from 'astro'
import type * as hast from 'hast'
import type * as unified from 'unified'

export type AstroContent = MarkdownInstance<{}>['Content']

export type RehypePlugin<PluginParameters extends any[] = any[]> =
  unified.Plugin<PluginParameters, hast.Root>
