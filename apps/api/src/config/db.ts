import mongoose from 'mongoose'
import { env } from './env'
import { logger } from '@/shared/logger'

export async function connectDB(): Promise<void> {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully')
    })

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { err })
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })

    await mongoose.connect(env.MONGO_URI)
  } catch (err) {
    logger.error('Failed to connect to MongoDB', { err })
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}
