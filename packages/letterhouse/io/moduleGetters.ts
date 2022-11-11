export function getAddressBookAvatarModules() {
  return import.meta.glob('/src/addressBook/*/avatar.{jpg,png}')
}
export function getAddressBookProfileModules() {
  return import.meta.glob('/src/addressBook/*/profile.mdx')
}
export function getReceivedLetterModules() {
  return import.meta.glob('/src/received/*/letter.mdx')
}
export function getSentLetterModules() {
  return import.meta.glob('/src/sent/*/letter.mdx')
}
