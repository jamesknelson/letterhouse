import { type Site } from '../model/site'

export type SiteModule = Site

export function validateSiteModule(maybeSiteModule: any): string[] {
  if (!maybeSiteModule || !maybeSiteModule.title) {
    // TODO: return useful errors via a JSON schema validation
    return ['not a site module']
  }
  return []
}

export function isSiteModule(
  maybeSiteModule: any,
): maybeSiteModule is SiteModule {
  return validateSiteModule(maybeSiteModule).length === 0
}

export function getSiteFromModule(siteModule: Omit<SiteModule, 'wip'>): Site {
  return {
    wip: import.meta.env.MODE === 'development',
    ...siteModule,
  }
}
