import { Address } from './address'

// Specifies the different levels of reference, going from most to least proof.
export type ReferenceType =
  // You're referencing yourself, and you have a URL to show where (hopefully
  // timestamped and signed, but it's not necessary).
  | 'self'
  // id: internal site URL
  // You have a digital signature proving that the "from" address said what you
  // claim. This means you *can* host the content yourself if you'd like, or can
  // link to the original.
  // id: content id hash
  | 'signed'
  // You have a URL that showed the "from" address publishing the claimed content
  // at a known date. This could be a HTTP or IPFS url, but cannot be an
  // internal URL for your own site.
  // id: url
  | 'external'
  // You have a reference to printed content that the reader can use to prove
  // that the "from" address published what we claim.
  // id: random
  | 'print'
  // You're saying that the "from" address said this at a given date, but you'll
  // need to trust us.
  // id: random
  | 'hearsay'
  // You're replying to a general topic, without claiming that anybody said
  // anything in particular.
  // id: #topic
  | 'topic'

export interface Reference {
  kind: 'reference'

  type: ReferenceType

  id: string

  url?: string

  title: string
  icon: string

  // This should be the date the content was published by the authors - as
  // opposed to the date we found/crawled it.
  dated?: string

  from: Address[]

  // As most reference types typically don't include an address, it's possible
  // to omit the address here. However, you can still include this field if
  // you'd like to specify who the referenced material was addressed to.
  to?: Address[]
}
