# Release Management Guide & Notes — TokenForge

---

## 📦 Semantic Versioning Rules

We follow [Semantic Versioning (SemVer)](https://semver.org/) specifications to
maintain clear version structures:

- **Patch (`1.0.x`)**: Backward-compatible bug fixes and style updates.
- **Minor (`1.x.0`)**: Backward-compatible feature updates, route additions, or
  dependency increments.
- **Major (`x.0.0`)**: Breaking changes that alter API request/response
  properties.

---

## 🚀 Deployment Verification Checklist

Before releasing any changes to production environments:

1. Ensure all unit and integration test coverage files pass.
2. Build all monorepo components locally (`npm run build`).
3. Verify that environment schemas inside Express configuration files match
   production variables.

---

## 🛠️ Automated Deployment Rollback

If a container build fails or fails to pass health status verifications:

1. **GitHub Action Failure**: Builds are blocked, and deployment steps do not
   execute.
2. **Railway Engine Fallback**: Integrates zero-downtime healthcheck checks. If
   dynamic healthchecks fail (`/api/v1/health`), Railway rolls back to the
   previous stable build image automatically.
