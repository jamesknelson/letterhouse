import mem from 'mem'

import { type Site } from '../model/site'
import {
  getSiteFromModule,
  isSiteModule,
  validateSiteModule,
} from './siteModule'

async function unmemoizedGetSite(): Promise<Site> {
  const candidates = import.meta.glob('/src/site.*')
  const loader = Object.values(candidates)[0]
  const maybeSiteModule = await loader()

  if (!isSiteModule(maybeSiteModule)) {
    throw validateSiteModule(maybeSiteModule)
  }

  return getSiteFromModule(maybeSiteModule)
}

export const getSite = mem(unmemoizedGetSite)
