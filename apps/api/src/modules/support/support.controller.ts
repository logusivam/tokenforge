import { Request, Response, NextFunction } from 'express'
import { SupportService } from './support.service'
import { success } from '@/shared/response'

export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, message } = req.body
      await this.supportService.sendContactEmail(name, email, message)
      success(res, { message: 'Support ticket successfully submitted.' })
    } catch (err) {
      next(err)
    }
  }
}
