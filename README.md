# TokenForge

[![CI](https://github.com/logusivam/tokenforge/actions/workflows/ci.yml/badge.svg)](https://github.com/logusivam/tokenforge/actions/workflows/ci.yml)
[![CodeQL](https://github.com/logusivam/tokenforge/actions/workflows/codeql.yml/badge.svg)](https://github.com/logusivam/tokenforge/security/code-scanning)
[![Coverage](https://codecov.io/gh/logusivam/tokenforge/branch/main/graph/badge.svg)](https://codecov.io/gh/logusivam/tokenforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)

> **Forge Your Auth. Own Every Token.**
>
> JWT access tokens · Refresh token rotation · OAuth2 PKCE (Google + GitHub) ·
> Role-based access control · Built from scratch — zero Auth0, zero Clerk.

## Live Demo

🔗 [tokenforge.dev](https://tokenforge.dev) · [API Docs](https://tokenforge-api.railway.app/api/docs)

## Features

- 🔐 **JWT RS256** — asymmetric signing, 15-min access tokens
- 🔄 **Refresh Token Rotation** — sliding window, token family tracking, reuse detection
- 🛡️ **OAuth2 + PKCE** — Google and GitHub, state CSRF protection
- 👥 **RBAC** — 4 roles, per-resource permission matrix, middleware guards
- ⚡ **Redis** — token store, AT blacklist, rate limit counters
- 🗄️ **MongoDB** — users, roles, audit logs (90-day TTL auto-purge)
- 🔒 **Security hardened** — Helmet, CORS, mongo-sanitize, timing-safe auth
- 📋 **Audit logging** — every auth event with IP, user agent, request ID

## Quick Start
