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

---

## 🤖 Automated Releases via Semantic Release

Releases are fully automated via `semantic-release` on push/merge to `main` and
`dev` branches.

### How it Works:

1. **Analyze Commits**: Commits are parsed using Conventional Commits rules:
   - `feat(...)` -> Bumps **Minor** version.
   - `fix(...)` or `perf(...)` -> Bumps **Patch** version.
   - Commits containing `BREAKING CHANGE:` -> Bumps **Major** version.
2. **Generate Notes**: Release notes are generated from the commit history.
3. **Update Changelog**: `CHANGELOG.md` is updated automatically.
4. **Push Release Commit**: The updated `package.json`, `package-lock.json`, and
   `CHANGELOG.md` are committed back to Git (prefixed with `chore(release):` and
   containing `[skip ci]` to prevent build loops).
5. **Publish Tag & GitHub Release**: A new git tag is created, and a release
   with changelog details is published on GitHub.
