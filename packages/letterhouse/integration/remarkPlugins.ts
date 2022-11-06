import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

import type { RehypePlugin } from '../types/astro'
import type { MarkdownQuote } from '../types/markdown'

function remarkFrontmatterQuotes(): RehypePlugin {
  return (tree, { data }) => {
    if (!data.astro.frontmatter.quotes) {
      data.astro.frontmatter.quotes = []
    }

    let hasTitle = false

    visit(tree, (node, i) => {
      if (i === 0 && node.type === 'heading' && node.depth == 1) {
        hasTitle = true
      }
      if (node.type !== 'blockquote') {
        return
      }

      const quote: MarkdownQuote = {
        blurb: i == 0 || (hasTitle && i == 1),
        text: toString(node),
      }

      data.astro.frontmatter.quotes.push(quote)
    })
  }
}

function remarkFrontmatterWordCount(): RehypePlugin {
  return (tree, { data }) => {
    data.astro.frontmatter.wordCount = toString(tree).split(/\s+/g).length - 1
  }
}

export default [remarkFrontmatterQuotes, remarkFrontmatterWordCount]
