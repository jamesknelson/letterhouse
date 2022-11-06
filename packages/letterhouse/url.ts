import { Address } from './model/address'
import { Letter } from './model/letter'

export function letter(letter: Letter): string {
  return [
    '',
    letter.category,
    letter.slug ??
      letter.dated ??
      (letter.to[0].id ? `to-${letter.to[0].id}` : 'wip'),
  ].join('/')
}

export function address(address: Address): string {
  if (!address.id) {
    throw new TypeError('Cannot create URL to enclosed address.')
  }

  return `/address-book/` + encodeURI(address.id)
}

export function received(): string {
  return '/received'
}

export function sent(): string {
  return '/sent'
}

export function draftIndex(): string {
  return '/draft'
}
