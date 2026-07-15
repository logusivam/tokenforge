import axios from 'axios'
import { env } from '@/config/env'

export interface GoogleProfile {
  id: string
  email: string
  name: string
  picture?: string
  email_verified: boolean
}

export class GoogleProvider {
  async getTokens(code: string, codeVerifier: string): Promise<{ accessToken: string }> {
    const response = await axios.post<{ access_token: string }>(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }
    )
    return { accessToken: response.data.access_token }
  }

  async getUserProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await axios.get<GoogleProfile>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
    return response.data
  }
}
