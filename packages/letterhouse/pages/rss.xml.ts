import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'

import { getSite } from '../io/siteGetters'
import { getPublished } from '../io/letterGetters'
import * as url from '../url'

export const get: APIRoute = async (context) => {
  if (!context.site) {
    throw new Error('RSS not available for this site.')
  }

  const siteURL = context.site.toString()
  const site = await getSite()
  const published = await getPublished()

  return rss({
    stylesheet: '/rss/styles.xsl',
    title: site.title,
    description: site.blurb,
    site: siteURL,
    customData: `<language>${site.language}</language>`,
    items: published.map((post) => ({
      link: url.letter(post),
      title: post.title || 'Untitled note',
      // TODO: type published posts as always having a date
      pubDate: new Date(post.dated!),
      description: post.blurb || undefined,
    })),
  })
}
