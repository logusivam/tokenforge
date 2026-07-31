import { Router } from 'express'
import { SupportController } from './support.controller'
import { SupportService } from './support.service'
import { validate } from '@/middleware/validate.middleware'
import { contactSchema } from './support.validator'

export const supportRouter = Router()

const supportService = new SupportService()
const supportController = new SupportController(supportService)

supportRouter.post('/contact', validate(contactSchema), supportController.submitContact)
