import { Response } from 'express'

export function success(res: Response, data: unknown, statusCode = 200): void {
  res.status(statusCode).json({
    status: 'success',
    data,
  })
}

export function error(res: Response, message: string, statusCode = 500): void {
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  })
}
