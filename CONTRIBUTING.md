# Contributing to TokenForge

Thank you for your interest in contributing.

## Prerequisites

- Node.js 22 LTS
- Docker Desktop (for local MongoDB + Redis)
- A GitHub account

## Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/logusivam/tokenforge.git
   cd tokenforge
   ```

2. **Install Dependencies** This project uses npm workspaces. Run install from
   the root:

   ```bash
   npm install
   ```

3. **Start Infrastructure Services** TokenForge requires MongoDB and Redis. Use
   Docker Compose to spin them up locally:

   ```bash
   npm run docker:up
   ```

4. **Environment Variables Config** Copy the example environment configuration
   files:
   - For backend (`apps/api`): Copy `apps/api/.env.example` to `apps/api/.env`
     and fill in secrets (e.g. `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`,
     `COOKIE_SECRET`, `MONGO_URI`, `REDIS_URL`).
   - For frontend (`apps/web`): Copy `apps/web/.env.example` to `apps/web/.env`
     and update API endpoints.

5. **Start Development Servers** Run the full monorepo dev stack (API + Web
   app):

   ```bash
   npm run dev
   ```

6. **Running Tests** Run the test suites across all packages:
   ```bash
   npm run test
   ```

## Development & Git Workflow

- **Branch Naming**: Branch out from `dev` using descriptive names like
  `feature/oauth-flow` or `bugfix/token-rotation`.
- **Commit Messages**: We enforce Conventional Commits. Use prefix types like
  `feat(auth):`, `fix(deps):`, `docs(readme):`, `chore:`, etc. Commits that
  violate this will fail hooks.
- **Pull Requests**: Pull requests must target the `dev` branch. CI checks
  (linting, typescript compilation, unit/integration tests) must pass
  successfully before merging.
