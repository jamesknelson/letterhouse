export interface MarkdownQuote {
  index: number
  text: string
  reference: {
    id: string
    href?: string
    title?: string
    dated?: string
    from?: string
    to?: string
  }
}
