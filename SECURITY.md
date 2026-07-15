# Security Policy — TokenForge

## Supported Versions

| Version | Supported |
|---|---|
| Latest (`main`) | ✅ |
| Older tags | ❌ No backport patches |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

1. Go to the **Security** tab of this repository
2. Click **"Report a vulnerability"**
3. Fill in the template

Send details to: **security@tokenforge.dev**  
PGP key available at: `https://tokenforge.dev/.well-known/security.txt`

## Response Timeline

| Stage | SLA |
|---|---|
| Acknowledgement | 48 hours |
| Severity assessment | 5 business days |
| Fix + patch release | 14 days (critical) / 30 days (high) |
| Public disclosure | 90 days after fix (coordinated) |

## Scope

In scope for responsible disclosure:
- Authentication bypass
- Refresh token theft or reuse bypass
- RBAC privilege escalation
- JWT signature bypass
- OAuth2 state/PKCE bypass
- Rate limit bypass leading to brute force
- NoSQL injection

Out of scope:
- Denial of service via resource exhaustion (no SLA)
- Social engineering
- Issues in third-party dependencies (report to upstream)