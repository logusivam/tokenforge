import { Request, Response, NextFunction } from 'express'
import mongoSanitize from 'mongo-sanitize'

export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = mongoSanitize(req.body)
  }
  if (req.query) {
    const sanitizedQuery = mongoSanitize({ ...req.query })
    for (const key of Object.keys(req.query)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (req.query as any)[key]
    }
    Object.assign(req.query, sanitizedQuery)
  }
  if (req.params) {
    const sanitizedParams = mongoSanitize({ ...req.params })
    for (const key of Object.keys(req.params)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (req.params as any)[key]
    }
    Object.assign(req.params, sanitizedParams)
  }
  next()
}
