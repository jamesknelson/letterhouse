export function getPatternFromPagePath(pagePath: string): string {
  const pathWithoutExtension = pagePath.split('.').slice(0, -1).join('.')
  const pathParts = pathWithoutExtension.replace('/src/pages', '').split('/')

  if (pathParts[pathParts.length - 1] === 'index') {
    pathParts.pop()
  }
  if (pathParts[0] !== '') {
    pathParts.unshift('')
  }

  return pathParts.length === 1 ? '/' : pathParts.join('/')
}
