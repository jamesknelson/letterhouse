export interface MarkdownQuote {
  index: number
  text: string
  meta: {
    href?: string
    title?: string
    dated?: string
    from?: string
    to?: string
  }
}
