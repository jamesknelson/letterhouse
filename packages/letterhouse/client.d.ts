declare module '*.md' {
  import type { MarkdownInstance } from 'astro'

  const value: MarkdownInstance<any>
  export default value
}
