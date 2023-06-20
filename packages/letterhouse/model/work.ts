import type { Address } from './address'
import type { Attribution } from './attribution'

export interface Work {
  kind: 'work'

  id: string

  // A missing URL indicates that the line is only available offline.
  url?: string

  platform?: WorkPlatform

  // If no author is known, this should include an "anonymous" address.
  // Note: any non-author signatories should go in a new and different field.
  authors: Attribution[]

  // As many works typically don't include an address, it's possible
  // to omit the address here. However, you can still include this field if
  // you'd like to specify who the referenced material was addressed to.
  to?: Address[]

  title?: string
  blurb?: string
  dated?: string

  // Optionally includes the canonical source of the work, as used to compute
  // the hash.
  // TODO:
  // - support binary blobs, e.g. .zip files containing a .mdx and any included
  //   images - perhaps through a URL to a hosted version of the source zip?
  // source?: string

  // An IPFS CID hash of the work's source, which can be used to retrieve it
  // from IPFS if it is available.
  hash?: string
}

// When the reference is from a well-known platform, it can be set here. This
// can then be used by the theme to adjust how the reference is displayed.
// For print books and articles with no online source, set this to "print".
// TODO:
// - update types so different platforms include different fields,
//   e.g. twitter has a date and at least one author
// - for twitter type, add a "threadId" to the work object, so that it's
//   possible to only automatically add the earliest tweet in a thread
//   to a letter's re: line.
export type WorkPlatform = 'twitter'
