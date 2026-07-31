import { Request, Response, NextFunction } from 'express'
import { Schema } from 'joi'

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      })
      return
    }

    // Override request body with validated & sanitized value
    req.body = value
    next()
  }
}
