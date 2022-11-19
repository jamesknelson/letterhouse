const urlPattern = /^(?:(?:https?:)\/\/)?/

export function isURL(x: string): boolean {
  return urlPattern.test(x)
}
