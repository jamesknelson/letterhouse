import type { Address } from './address'

export interface Attribution {
  kind: 'attribution'

  address: Address

  // If the author has signed the work's hash, include the signature here.
  signature?: string

  // If the author has stamped the signature using opentimestamp, include
  // the proof here.
  // https://opentimestamps.org/
  signatureTimestamp?: string
}
