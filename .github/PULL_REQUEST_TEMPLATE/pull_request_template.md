## Summary

<!-- One paragraph: what does this PR do and why? -->

## Type of Change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (requires version bump + CHANGELOG entry)
- [ ] Refactor (no behaviour change)
- [ ] Documentation update
- [ ] CI / tooling change

## Security Checklist

<!-- Required for any change touching auth, token, oauth, rbac, or middleware -->

- [ ] No secrets, API keys, or credentials added to source
- [ ] Input validation added/updated for new endpoints
- [ ] RBAC permissions verified for new/changed routes
- [ ] Rate limiting considered for new public endpoints
- [ ] Audit log event added for new auth actions
- [ ] Cookie options unchanged (httpOnly, Secure, SameSite)
- [ ] No token data exposed in URLs, logs, or response bodies

## Testing

- [ ] Unit tests added / updated
- [ ] Integration tests added / updated
- [ ] All existing tests pass (`npm test`)
- [ ] Coverage threshold maintained (≥80%)

## Documentation

- [ ] JSDoc added for public functions / classes
- [ ] `docs/api-reference.md` updated if endpoints changed
- [ ] `docs/rbac-model.md` updated if permissions changed
- [ ] `CHANGELOG.md` entry added (or handled by semantic-release)
- [ ] `.env.example` updated if new env vars added

## Linked Issues

Closes #<!-- issue number -->

## Screenshots / Logs (if UI or behaviour change)

<!-- Paste relevant logs, screenshots, or curl examples -->