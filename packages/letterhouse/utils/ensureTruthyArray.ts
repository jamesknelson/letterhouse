export function ensureTruthyArray(to: any): any[] {
  return Array.isArray(to) ? to : to ? [to] : []
}
