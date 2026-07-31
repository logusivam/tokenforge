import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/shared/errors'
import { logger } from '@/shared/logger'

interface ErrorResponse {
  status: 'error'
  statusCode: number
  message: string
  requestId?: string | undefined
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string | undefined

  if (err instanceof AppError) {
    // Known operational error — safe to expose message
    const body: ErrorResponse = {
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      requestId,
    }
    if (err.message === 'Refresh token missing') {
      logger.debug('Refresh check bypassed: no refresh token cookie present', {
        path: req.path,
        method: req.method,
      })
    } else {
      logger.warn('Operational error', { ...body, path: req.path, method: req.method })
    }
    res.status(err.statusCode).json(body)
    return
  }

  // Unknown error — do NOT expose internals
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId,
  })

  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'An unexpected error occurred',
    requestId,
  })
}
