import axios from 'axios'
import { env } from '@/config/env'

export interface GitHubProfile {
  id: number
  email: string | null
  name: string
  avatar_url?: string
}

export class GitHubProvider {
  async getTokens(code: string): Promise<{ accessToken: string }> {
    const response = await axios.post<{ access_token: string }>(
      'https://github.com/login/oauth/access_token',
      {
        code,
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        redirect_uri: env.GITHUB_CALLBACK_URL,
      },
      {
        headers: { Accept: 'application/json' },
      }
    )
    return { accessToken: response.data.access_token }
  }

  async getUserProfile(accessToken: string): Promise<GitHubProfile> {
    const userResponse = await axios.get<GitHubProfile>('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const profile = userResponse.data
    if (!profile.email) {
      const emailsResponse = await axios.get<
        Array<{ email: string; primary: boolean; verified: boolean }>
      >('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const primaryEmail = emailsResponse.data.find((e) => e.primary) || emailsResponse.data[0]
      profile.email = primaryEmail ? primaryEmail.email : null
    }

    return profile
  }
}
