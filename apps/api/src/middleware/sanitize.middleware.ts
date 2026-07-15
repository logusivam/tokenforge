import { Request, Response, NextFunction } from 'express'
import mongoSanitize from 'mongo-sanitize'

export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  req.body = mongoSanitize(req.body)
  req.query = mongoSanitize(req.query)
  req.params = mongoSanitize(req.params)
  next()
}
