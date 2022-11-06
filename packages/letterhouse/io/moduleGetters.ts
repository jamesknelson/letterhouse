export function getAddressBookAvatarModules() {
  return import.meta.glob('/src/addressBook/*/avatar.{jpg,png}')
}
export function getAddressBookProfileModules() {
  return import.meta.glob('/src/addressBook/*/profile.{md,mdx}')
}
export function getReceivedLetterModules() {
  return import.meta.glob('/src/received/*/letter.{md,mdx}')
}
export function getSentLetterModules() {
  return import.meta.glob('/src/sent/*/letter.{md,mdx}')
}
