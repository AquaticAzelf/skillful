---
name: law
description: Use when building projects that may require licensing decisions, regulatory compliance, or legal considerations around data handling, distribution, or third-party code
---

# Law Skill

## Overview

A planning skill that ensures legal and compliance considerations are surfaced during project design and correctly handled during implementation.

**When loaded:** Brainstorming loads this to surface legal and compliance considerations during spec generation. SDD subagents load it when implementing compliance-related tasks.

**Announce at start:** "I'm using the law skill to identify legal and compliance requirements."

## Design Phase (for Brainstorming)

When this skill is loaded during brainstorming, consider these areas:

### Licensing

1. **What license does this project use?**
   - **Permissive** (MIT, Apache 2.0, BSD) — do anything, no warranty
   - **Copyleft** (GPL, AGPL) — derivatives must be same license
   - **Weak copyleft** (LGPL, MPL) — copyleft only for modified files
   - **Custom** — consult a lawyer, never draft your own

2. **What are the dependencies' licenses?**
   - Ensure compatibility (GPL + MIT = OK, MIT + GPL = derivative is GPL)
   - Keep an audit trail (license file headers, NOTICE files)
   - Flag copyleft dependencies early — they affect distribution

3. **How will this be distributed?**
   - Open source → choose license, add headers, write LICENSE file
   - Internal → no distribution restrictions
   - SaaS → AGPL applies if using AGPL dependencies; no distribution otherwise
   - Commercial → consider dual-licensing

### Compliance

| Regulation | When it applies | Key requirements |
|-----------|----------------|-----------------|
| **GDPR** | EU users, any size | Consent, right to deletion, data portability, breach notification (72h) |
| **CCPA** | California, for-profit, revenue thresholds | Right to know, delete, opt-out; privacy policy |
| **HIPAA** | US health data | BAAs, audit logs, access controls, encryption |
| **COPPA** | US children under 13 | Parental consent, privacy policy, limited data collection |
| **PCI-DSS** | Credit card processing | Encrypted storage, limited retention, annual attestation |
| **SOC 2** | Enterprise SaaS | Controls for security, availability, processing integrity |
| **Export controls** | International distribution | Encryption classification, restricted countries |

### Intellectual Property

1. **Does this project use third-party code?**
   - Copied code snippets → verify license, attribute
   - Generated code (LLM output) → unclear copyright, document sources
   - APIs / SDKs → review terms of service
   - Images, fonts, assets → verify license, no unlicensed use

2. **Trademark considerations**
   - Project name conflicts with existing trademarks?
   - Using trademarked logos/branding in your project? Get permission.

3. **Contributor agreements**
   - Accepting contributions? Consider CLA (Contributor License Agreement)
   - DCO (Developer Certificate of Origin) — lighter alternative

## Implementation Phase (for SDD)

When this skill is loaded by a subagent implementing a task:

### License Headers

```python
# Copyright (c) [year] [author]
# SPDX-License-Identifier: MIT
```

Add to every source file. Check the plan for the exact license and year.

### NOTICE File

If the project or its dependencies require attribution:

```
This project includes:
- library-name (MIT) — Copyright (c) [year] [author]
- other-library (Apache 2.0) — Copyright (c) [year] [author]
```

### Privacy Compliance Implementation

**Consent:**
```
- Record consent with: user ID, timestamp, scope, version of policy
- Allow withdrawal of consent
- Don't collect before consent given
```

**Right to deletion:**
```
- Delete all user data on request endpoint
- Cascade to backups, logs, analytics
- Verify deletion (return confirmation)
```

**Data inventory:**
```
- What data is collected (schema-level)
- Where it's stored (DB, files, logs, third-party)
- How long it's retained
- How it's deleted
```

### Regulatory Data Handling

```
GDPR:
- Data Processing Agreement (DPA) if using third-party processors
- Data Protection Impact Assessment (DPIA) for high-risk processing
- Breach notification procedure (72 hours)

HIPAA:
- Business Associate Agreement (BAA) with all vendors
- Audit trails on all PHI access
- Encryption at rest and in transit
- Automatic session timeout

PCI-DSS:
- Never store CVV, track data, or PINs
- Tokenize card numbers or use PCI-certified processor
- Cardholder data environment (CDE) isolation
```

## When Not to Use

Skip this skill for:
- Personal projects with no distribution
- Internal tools with no user data
- Quick prototypes (note the gap for later)

## Red Flags

- "We'll handle compliance later" — almost never happens
- Custom license written by a developer — always use standard licenses
- No license file in a public repo — defaults to exclusive copyright
- Using GPL/AGPL without understanding the implications
- Collecting data without consent mechanisms
- No privacy policy on a public-facing site

## Supporting Resources

- SPDX License List: https://spdx.org/licenses/
- Choose a License: https://choosealicense.com/
- GDPR Full Text: https://gdpr-info.eu/
- OWASP Top 10 Privacy Risks: https://owasp.org/www-project-top-10-privacy-risks/
