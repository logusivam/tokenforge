const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

console.log('Generating RS256 key pair...')
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

const apiDir = path.join(__dirname, '../apps/api')
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true })
}

// Base64 encode for env file compatibility
const privateKeyBase64 = Buffer.from(privateKey).toString('base64')
const publicKeyBase64 = Buffer.from(publicKey).toString('base64')

const envContent = `# System
NODE_ENV=development
PORT=5000

# Databases
MONGO_URI=mongodb://127.0.0.1:27017/tokenforge
REDIS_URL=redis://127.0.0.1:6379

# Cryptography & Security
JWT_PRIVATE_KEY="${privateKeyBase64}"
JWT_PUBLIC_KEY="${publicKeyBase64}"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECRET="somesupersecretcookiekeyforsecuringcookiessss"

# OAuth Google
GOOGLE_CLIENT_ID="placeholder-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="placeholder-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/v1/oauth/google/callback"

# OAuth GitHub
GITHUB_CLIENT_ID="placeholder-github-client-id"
GITHUB_CLIENT_SECRET="placeholder-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/v1/oauth/github/callback"

# Frontend Client URL
CLIENT_URL="http://localhost:5173"
`

const envPath = path.join(apiDir, '.env')
fs.writeFileSync(envPath, envContent, 'utf8')
console.log(`Successfully generated default .env file at: ${envPath}`)
