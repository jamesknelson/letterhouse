export interface Theme {
  kind: 'theme'
  pages: Record<string, string>
  stylesheets: {
    global?: string
    root?: string
  }
}
