export interface Theme {
  kind: 'theme'
  layouts: Record<string, string>
  pages: Record<string, string>
  stylesheets: {
    global?: string
    root?: string
  }
}
