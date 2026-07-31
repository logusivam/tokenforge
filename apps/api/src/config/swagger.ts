import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TokenForge API',
    version: '1.0.0',
    description:
      'Stateless, high-performance JWT authentication engine with Refresh Token Rotation, OAuth2 PKCE, and RBAC - built from scratch.',
    contact: {
      name: 'TokenForge Security',
      email: 'devbridgeenquirz@gmail.com',
      url: 'https://tokenforge-dev.vercel.app',
    },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: '/api/v1', description: 'API v1 Root' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'RS256-signed JWT access token (15 min expiry). Passed in Authorization header: Bearer <token>',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 8, example: 'SuperSecure123!' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 8, example: 'Secure123!' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Jane Smith' },
          avatar: {
            type: 'string',
            description: 'URL or base64 Data URI',
            example: 'https://avatar.url/image.png',
          },
          password: { type: 'string', minLength: 8 },
          oldPassword: { type: 'string' },
        },
      },
      UserObject: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65c9e2b172a1e002fa88cd1a' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          role: { type: 'string', enum: ['admin', 'moderator', 'user', 'guest'], example: 'user' },
          avatar: { type: 'string', example: 'https://avatar.url/image.png' },
          providers: {
            type: 'array',
            items: { type: 'string' },
            example: ['google'],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'Short-lived JWT (store in-memory only)' },
          user: { $ref: '#/components/schemas/UserObject' },
        },
      },
      AuditLogObject: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          action: { type: 'string', example: 'auth:login' },
          status: { type: 'string', enum: ['success', 'failure'] },
          ip: { type: 'string', example: '127.0.0.1' },
          userAgent: { type: 'string' },
          details: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      StatsResponse: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer', example: 1250 },
          activeSessions: { type: 'integer', example: 87 },
          registrations24h: { type: 'integer', example: 12 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          statusCode: { type: 'integer', example: 401 },
          message: { type: 'string', example: 'Invalid credentials or expired session' },
          requestId: { type: 'string', example: 'req-982ac-912' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Registration successful - returns access token & user object',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } },
            },
          },
          400: { description: 'Validation error or email already in use' },
          429: { description: 'Too many registrations from this IP' },
        },
      },
    },
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
            description: 'Login successful - sets secure httpOnly refresh token cookie',
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
        summary: 'Rotate credentials using httpOnly Refresh Token cookie',
        description:
          'Exchanges active Refresh Token cookie for a new short-lived Access Token and rotated Refresh Token cookie.',
        responses: {
          200: {
            description: 'Access token successfully refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { accessToken: { type: 'string' } },
                },
              },
            },
          },
          401: {
            description:
              'Refresh token invalid, expired, or reuse detected (triggers family revocation)',
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Invalidate active sessions',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully, cookies cleared' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/oauth/google': {
      get: {
        tags: ['OAuth2 PKCE'],
        summary: 'Redirect to Google OAuth2 flow',
        responses: {
          302: { description: 'Redirects browser to Google authentication prompt' },
        },
      },
    },
    '/oauth/github': {
      get: {
        tags: ['OAuth2 PKCE'],
        summary: 'Redirect to GitHub OAuth2 flow',
        responses: {
          302: { description: 'Redirects browser to GitHub authentication prompt' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['User Management'],
        summary: 'Get active profile details',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Active profile details returned',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserObject' } },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['User Management'],
        summary: 'Update user profile details',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserObject' } },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
      delete: {
        tags: ['User Management'],
        summary: 'Self-delete active user account',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Account deleted successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin Console'],
        summary: 'Get listing of registered users',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of users returned',
            content: {
              'application/json': {
                type: 'array',
                items: { $ref: '#/components/schemas/UserObject' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires users:read or audit:read permissions' },
        },
      },
    },
    '/admin/audit': {
      get: {
        tags: ['Admin Console'],
        summary: 'Get system security audit trail events',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Audit log listing returned',
            content: {
              'application/json': {
                type: 'array',
                items: { $ref: '#/components/schemas/AuditLogObject' },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - requires audit:read permission' },
        },
      },
    },
    '/admin/stats': {
      get: {
        tags: ['Admin Console'],
        summary: 'Get global system activity metrics',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Metrics returned',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/admin/users/{id}/role': {
      patch: {
        tags: ['Admin Console'],
        summary: 'Change role assignment for a user',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['admin', 'moderator', 'user', 'guest'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User role updated successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/admin/users/{id}/sessions': {
      delete: {
        tags: ['Admin Console'],
        summary: 'Force revoke all sessions for a user',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Sessions successfully revoked' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
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
