---
name: security
description: Use when building any project that handles user data, authentication, network communication, or sensitive operations - guides security considerations during planning and implementation
---

# Security Skill

## Overview

A planning skill that ensures security considerations are surfaced during design and implemented correctly during development.

**When loaded:** Brainstorming loads this to surface security considerations during spec generation. SDD subagents load it when implementing security-related tasks.

**Announce at start:** "I'm using the security skill to ensure secure design and implementation."

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

When this skill is loaded by a subagent implementing a task:

### Authentication

```
ALWAYS:
- Hash passwords with bcrypt/argon2 (never plaintext)
- Use constant-time comparison for secrets
- Rate-limit login attempts
- Short-lived access tokens + refresh tokens

NEVER:
- Roll your own crypto
- Store passwords in logs
- Send credentials in URLs
- Trust client-supplied user identity
```

### Input Validation

```
VALIDATE:
- All input: type, length, range, format
- File uploads: type, size, content scanning
- URLs: protocol, host allowlist, no open redirects

SANITIZE:
- Output encoding for HTML/JS/SQL context
- Parameterized queries for database
- Structured data (JSON/XML): strict schema validation
```

### Secure Storage

```
- Secrets: use environment variables or secrets manager
- Config: never hardcode keys, tokens, passwords
- Database: encrypt sensitive columns, hash passwords
- Files: restrict permissions, sanitize paths
- Logs: no sensitive data (PII, credentials, tokens)
```

### Communication Security

```
- TLS 1.2+ for all network communication
- Certificate pinning for mobile apps
- CORS: restrict origins, don't use *
- CSP headers for web apps
- HSTS for production
```

### Dependency Security

```
- Audit regularly: npm audit, cargo audit, pip audit
- Pin versions (lock files)
- Review transitive dependencies
- No deprecated/unmaintained packages
- Verify package signatures where possible
```

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
