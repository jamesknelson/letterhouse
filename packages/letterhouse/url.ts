import { Address } from './model/address'
import { Letter } from './model/letter'

export function letter(letter: Letter): string {
  return [
    '',
    ...(letter.collection === 'inbox' ? ['inbox'] : []),
    letter.status === 'published' ? letter.dated : letter.status,
    ...(letter.slug ? [letter.slug] : []),
    '',
  ].join('/')
}

export function address(address: Address): string {
  if (!address.id) {
    throw new TypeError('Cannot create URL to enclosed address.')
  }

  return `/address-book/` + encodeURI(address.id)
}

export function received(): string {
  return '/inbox'
}

export function sent(): string {
  return '/'
}

export function draftIndex(): string {
  return '/wip'
}
