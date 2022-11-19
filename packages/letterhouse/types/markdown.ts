export interface MarkdownQuote {
  index: number
  text: string
  work: {
    id: string
    href?: string
    title?: string
    dated?: string
    authors?: string
    to?: string
  }
}
