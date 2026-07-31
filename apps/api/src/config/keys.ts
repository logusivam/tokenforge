import fs from 'fs'
import path from 'path'
import { env } from './env'

let privateKey = ''
let publicKey = ''

export function getKeys() {
  if (privateKey && publicKey) {
    return { privateKey, publicKey }
  }

  // Check if they are in env
  if (env.JWT_PRIVATE_KEY && env.JWT_PUBLIC_KEY) {
    const priv = env.JWT_PRIVATE_KEY
    const pub = env.JWT_PUBLIC_KEY

    privateKey = priv.includes('-----BEGIN') ? priv : Buffer.from(priv, 'base64').toString('utf8')
    publicKey = pub.includes('-----BEGIN') ? pub : Buffer.from(pub, 'base64').toString('utf8')

    // PEM validation (basic check)
    if (
      !privateKey.includes('-----BEGIN RSA PRIVATE KEY-----') &&
      !privateKey.includes('-----BEGIN PRIVATE KEY-----')
    ) {
      throw new Error('Invalid private key format')
    }
    if (!publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
      throw new Error('Invalid public key format')
    }

    return { privateKey, publicKey }
  }

  // Fallback to files
  const keysDir = path.join(__dirname, '../../keys')
  const privPath = path.join(keysDir, 'private.pem')
  const pubPath = path.join(keysDir, 'public.pem')

  if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
    privateKey = fs.readFileSync(privPath, 'utf8')
    publicKey = fs.readFileSync(pubPath, 'utf8')
    return { privateKey, publicKey }
  }

  throw new Error('JWT RS256 private/public keys are missing. Run key generation script.')
}
