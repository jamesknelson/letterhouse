export interface Theme {
  pages: Record<string, string>
  stylesheets: {
    global?: string
    root?: string
  }
}
