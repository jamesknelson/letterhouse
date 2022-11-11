import { toString } from 'mdast-util-to-string'
import { fromPairs } from 'ramda'
import { visit, SKIP } from 'unist-util-visit'

import type { RehypePlugin } from '../types/astro'
import type { MarkdownQuote } from '../types/markdown'

const quoteMetaLinePattern = /^\s*(dated|from|href|title|to):\s+(.*)\s*$/i

// Extract quote-related metadata and add it to both the frontmatter, and to
// the blockquote's attributes where appropriate.
function rehypeQuotes(): RehypePlugin {
  return (tree, { data }) => {
    if (!data.astro.frontmatter.quotes) {
      data.astro.frontmatter.quotes = []
    }

    let hasTitle = false
    let elementIndex = 0
    let quoteIndex = 0
    let lastBlockquote: any = null
    let paragraphsVisitedSinceLastBlockquote = 0

    visit(tree, 'element', (node, i, parent) => {
      elementIndex += 1

      // Add an "md" class to everything rendered by markdown, so that we're
      // able to apply text styles selectively to only the markdown text, and
      // not to components embedded within it.
      node.properties = {
        ...node.properties,
        class:
          'md' + (node.properties?.class ? ' ' + node.properties.class : ''),
      }

      if (elementIndex === 1 && node.tagName === 'h1') {
        hasTitle = true
      } else if (node.tagName === 'blockquote') {
        lastBlockquote = node
        paragraphsVisitedSinceLastBlockquote = 0

        const blurb = elementIndex === 1 || (hasTitle && elementIndex === 2)
        const text = toString(node).trim()

        if (blurb) {
          node.tagName = 'p'

          for (const child of node.children) {
            child.properties = {
              ...child.properties,
              class:
                'blurb' +
                (child.properties?.class ? ' ' + child.properties.class : ''),
            }
          }

          data.astro.frontmatter.blurb = text

          parent.children.splice(i, 1, ...node.children)

          return [SKIP, i]
        } else {
          const index = quoteIndex++
          const quote: MarkdownQuote = {
            index,
            text,
            meta: {},
          }

          data.astro.frontmatter.quotes.push(quote)

          node.properties = {
            'data-quote-index': index,
            ...node.properties,
          }
        }
      } else if (node.tagName === 'p') {
        ++paragraphsVisitedSinceLastBlockquote
        if (
          parent === lastBlockquote &&
          paragraphsVisitedSinceLastBlockquote === 1
        ) {
          const pairs = [] as [string, string][]
          if (node.children.length === 1 && node.children[0].tagName === 'a') {
            const anchorNode = node.children[0]
            const href = anchorNode.properties.href.trim()
            const text = toString(anchorNode).trim()

            pairs.push(['href', href])

            if (text !== href) {
              pairs.push(['title', text])
            }
          } else {
            const lines = toString(node).split('\n')

            for (const line of lines) {
              const match = line.match(quoteMetaLinePattern)
              if (!match) {
                return
              }

              const [, key, value] = match
              pairs.push([key, value.trim()])
            }
          }

          if (pairs.length === 0) {
            return
          }

          const meta =
            data.astro.frontmatter.quotes[
              data.astro.frontmatter.quotes.length - 1
            ].meta

          for (const [key, value] of pairs) {
            lastBlockquote.properties['data-' + key] = value
            meta[key] = value
          }

          parent.children.splice(i, 1)
          return [SKIP, i]
        }
      }
    })
  }
}

function rehypeFrontmatterWordCount(): RehypePlugin {
  return (tree, { data }) => {
    data.astro.frontmatter.wordCount = toString(tree).split(/\s+/g).length - 1
  }
}

export const rehypePlugins = [rehypeQuotes, rehypeFrontmatterWordCount]
export const remarkPlugins = []
