import Joi from 'joi'

export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  email: Joi.string().email().required().trim(),
  message: Joi.string().min(10).max(1000).required().trim(),
})
