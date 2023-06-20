export function getAddressBookAvatarModules() {
  return import.meta.glob('/src/addressBook/*/avatar.{jpg,png}')
}
export function getAddressBookProfileModules() {
  return import.meta.glob('/src/addressBook/*/profile.md')
}
export function getInboxModules() {
  return import.meta.glob('/src/inbox/*/*.md')
}
export function getPostModules() {
  return import.meta.glob('/src/posts/*/*.md')
}
