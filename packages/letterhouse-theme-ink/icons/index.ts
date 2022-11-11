/**
 * Based on astro-icon
 * MIT License Copyright (c) 2021 Nate Moore
 * https://github.com/natemoo-re/astro-icon/blob/main/packages/core/lib/utils.ts
 *
 * Updated to support icons in separate packages to the app itself
 * MIT License Copyright (c) 2022 James K Nelson
 */

export default async function load(name: string, inputProps: object) {
  if (!name) {
    throw new Error('<Icon> requires a name!')
  }

  const normalizedProps = normalizeProps(inputProps)
  const filepath = `./${name}.svg`
  const files = import.meta.glob('./*.svg', { as: 'raw' })

  try {
    if (!(filepath in files)) {
      throw new Error(`Could not find the file "${filepath}"`)
    }
    const contents = await files[filepath]()
    if (!/<svg/gim.test(contents)) {
      throw new Error(
        `Unable to process "${filepath}" because it is not an SVG!
  Recieved the following content:
  ${contents}`,
      )
    }
    const { innerHTML, defaultProps } = preprocess(contents)
    if (!innerHTML.trim()) {
      throw new Error(`Unable to parse "${filepath}"!`)
    }
    return {
      innerHTML,
      props: { ...defaultProps, ...normalizedProps },
    }
  } catch (e) {
    if (import.meta.env.MODE === 'production') {
      throw new Error(`[icons] Unable to load "${name}"!\n${e}`)
    }

    console.error(e)

    return {
      innerHTML: fallback.innerHTML,
      props: { ...fallback.props, ...normalizedProps },
    }
  }
}

const fallback = {
  innerHTML:
    '<rect width="24" height="24" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />',
  props: {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    'aria-hidden': 'true',
  },
}

const splitAttrsTokenizer = /([a-z0-9_\:\-]*)\s*?=\s*?(['"]?)(.*?)\2\s+/gim
const domParserTokenizer =
  /(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!\[CDATA\[)([\s\S]*?)(\]\]>))/gm

const preprocessCache = new Map()
function preprocess(contents: string) {
  if (preprocessCache.has(contents)) {
    return preprocessCache.get(contents)
  }
  domParserTokenizer.lastIndex = 0
  let result = contents
  let token
  if (contents) {
    while ((token = domParserTokenizer.exec(contents))) {
      const tag = token[2]
      if (tag === 'svg') {
        const attrs = splitAttrs(token[3])
        result = contents
          .slice(domParserTokenizer.lastIndex)
          .replace(/<\/svg>/gim, '')
          .trim()
        const value = { innerHTML: result, defaultProps: attrs }
        preprocessCache.set(contents, value)
        return value
      }
    }
  }
}

const splitAttrs = (str: string) => {
  let res = {} as Record<string, string>
  let token
  if (str) {
    splitAttrsTokenizer.lastIndex = 0
    str = ' ' + (str || '') + ' '
    while ((token = splitAttrsTokenizer.exec(str))) {
      res[token[1]] = token[3]
    }
  }
  return res
}

function normalizeProps(inputProps: any) {
  const size = inputProps.size
  delete inputProps.size
  const w = inputProps.width ?? size
  const h = inputProps.height ?? size
  const width = w ? toAttributeSize(w) : undefined
  const height = h ? toAttributeSize(h) : undefined
  return { ...inputProps, width, height }
}

const toAttributeSize = (size: string | number) =>
  String(size).replace(/(?<=[0-9])x$/, 'em')
