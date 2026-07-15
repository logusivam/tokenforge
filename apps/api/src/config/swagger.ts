import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TokenForge API',
    version: '1.0.0',
    description: 'JWT auth system with refresh token rotation, OAuth2 PKCE, and RBAC',
    contact: { name: 'Dark', url: 'https://tokenforge.dev' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [
    { url: 'http://localhost:3000/api/v1', description: 'Local development' },
    { url: 'https://tokenforge-api.railway.app/api/v1', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'RS256-signed JWT access token (15 min expiry)',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 8, example: 'Secure123!' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'RS256 JWT — store in memory only' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string', enum: ['admin', 'moderator', 'user', 'guest'] },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          statusCode: { type: 'integer', example: 401 },
          message: { type: 'string' },
          requestId: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Login successful — refresh token set in httpOnly cookie',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Invalid credentials' },
          429: { description: 'Rate limit exceeded (5 attempts / 15 min)' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token using httpOnly cookie',
        description: 'Rotates refresh token. Old token is invalidated immediately.',
        responses: {
          200: {
            description: 'New access token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { accessToken: { type: 'string' } },
                },
              },
            },
          },
          401: { description: 'Refresh token invalid, expired, or reuse detected' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout — revoke current refresh token + blacklist access token',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile object' },
          401: { description: 'Not authenticated' },
        },
      },
    },
  },
}

export function setupSwagger(app: Express): void {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'TokenForge API Docs',
      customCss: '.swagger-ui .topbar { background-color: #0A0A0F; }',
    })
  )
}
