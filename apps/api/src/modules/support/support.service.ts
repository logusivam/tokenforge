import axios from 'axios'
import { env } from '@/config/env'
import { logger } from '@/shared/logger'

export class SupportService {
  /**
   * Fetches an access token from Google OAuth2 server using the refresh token.
   */
  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: env.GOOGLE_CLIENT_ID_MAIL,
        client_secret: env.GOOGLE_CLIENT_SECRET_MAIL,
        refresh_token: env.GMAIL_REFRESH_TOKEN_MAIL,
        grant_type: 'refresh_token',
      })
      return response.data.access_token
    } catch (err: any) {
      logger.error('Failed to retrieve OAuth2 access token for Gmail', {
        error: err.response?.data || err.message,
      })
      throw new Error('Support system email integration authorization failure', { cause: err })
    }
  }

  /**
   * Sends an email via Google Gmail HTTP REST API.
   * Target recipient: devbridgeenquirz@gmail.com
   */
  async sendContactEmail(name: string, email: string, message: string): Promise<void> {
    const accessToken = await this.getAccessToken()

    const recipient = 'devbridgeenquirz@gmail.com'
    const subject = `Support Enquiry from ${name}`

    // Construct Raw RFC 2822 Message format
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
    const messageParts = [
      `From: TokenForge Support <${recipient}>`,
      `To: ${recipient}`,
      `Reply-To: ${email}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      `<div style="font-family: sans-serif; max-width: 600px; color: #333;">`,
      `  <h2>New Support Contact Enquiry</h2>`,
      `  <p><strong>Name:</strong> ${name}</p>`,
      `  <p><strong>Email Address:</strong> ${email}</p>`,
      `  <p><strong>Message:</strong></p>`,
      `  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</div>`,
      `</div>`,
    ]

    const rawMessage = Buffer.from(messageParts.join('\r\n')).toString('base64url')

    try {
      await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        { raw: rawMessage },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      logger.info('Support email successfully sent via Gmail HTTPS OAuth REST API', { name, email })
    } catch (err: any) {
      logger.error('Gmail HTTP API message delivery failure', {
        error: err.response?.data || err.message,
      })
      throw new Error('Failed to send contact support message', { cause: err })
    }
  }
}
