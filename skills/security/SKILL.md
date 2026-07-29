---
name: security
description: Use when building any project that handles user data, authentication, network communication, or sensitive operations - guides security considerations during planning and implementation
---

# Security Skill

## Overview

A planning skill that ensures security considerations are surfaced during design and implemented correctly during development.

**When loaded:** Brainstorming loads this to surface security considerations during spec generation. SDD subagents load it when implementing security-related tasks.

## Design Phase (for Brainstorming)

When this skill is loaded during brainstorming, consider these areas:

### Threat Modeling

1. **What data does this system handle?**
   - User credentials, personal data (PII), payment info, health data
   - Classification: public, internal, confidential, restricted

2. **Who can access what?**
   - Authentication: how do users prove identity?
   - Authorization: what can each role do?
   - Session management: how long does access last?

3. **Where does data travel?**
   - Client → Server: TLS, API keys, CORS
   - Service → Service: mTLS, service accounts
   - External: third-party API security

4. **Where is data stored?**
   - Database: encryption at rest, connection security
   - Files: access controls, encryption
   - Cache: Redis, CDN, browser storage

### Common Vulnerabilities

Check relevance by domain:

| Domain | Common Issues |
|--------|--------------|
| Web app | XSS, CSRF, SQL injection, SSRF, open redirects |
| API | Rate limiting, input validation, auth bypass |
| CLI | Command injection, file path traversal, config secrets |
| Mobile | Insecure storage, certificate pinning, deep link hijacking |
| Desktop | Code injection, privilege escalation, update hijacking |
| IoT | Firmware extraction, default credentials, network sniffing |

### Security Boundaries

Identify trust boundaries in the architecture:

```
Untrusted Zone (user) → Auth Boundary → Trusted Zone (app) → Data Boundary → Data Store
                                     ↓
                              Admin Zone (privileged ops)
```

Each boundary crossing requires validation, authentication, or encryption.

## Implementation Phase (for SDD)

Follow standard security practices: encrypt secrets, hash passwords (bcrypt/argon2), parameterize queries, validate all input, use TLS 1.2+, pin dependency versions, and audit regularly. Never roll your own crypto, store secrets in code, or trust client-supplied identity.

## When Not to Use

Skip this skill for:
- Read-only/static projects
- Local-only CLI tools with no data
- Internal-only tools on isolated networks
- Quick prototypes (note the gap for later)

## Supporting Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- CWE: https://cwe.mitre.org/
