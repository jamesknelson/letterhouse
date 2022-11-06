export class NotFoundError extends Error {
  constructor(readonly id: string, readonly type: string) {
    super(`Entity "${id}" of type "${type}" not found.`)

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}
