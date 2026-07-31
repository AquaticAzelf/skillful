---
name: brainstorming
description: Use when dispatched as a subagent by triage to autonomously produce a design spec. When loaded by a user directly (not as a subagent), guides them through design Q&A.
---

# Brainstorming — Spec Generator

> Formats: This skill uses `skills/_shared/hard-gates.md` for its gate pattern.

## Subagent Mode (Default)

When dispatched by triage as a subagent, work autonomously with the triage context passed to you.

### What You Receive

The dispatch prompt contains:
- **Triage context**: tech stack, project type, features, constraints
- **Discovered skills**: skill names and categories (planning vs implementation)
- **Output path**: `.skillful/spec.md`

### Process

1. **Load the brainstorming skill** (this file) — you're already following it
2. **Load all planning skills** from the discovered list (e.g., security, law) — use the skill tool to load by bare name (no `skillful:` prefix)
3. **Review triage context** — extract tech stack, project goals, constraints
4. **Propose 2-3 approaches** with trade-offs. Write them to the spec file
5. **Design the recommended approach** covering: architecture, components, data flow, error handling, testing strategy
6. **Check against loaded skills** — do security, law, or other planning skills impose requirements? Include them
7. **Self-review the spec**: no placeholders, no contradictions, scoped correctly
8. **Save spec** to `.skillful/spec.md`
9. **Return** with: spec path, key decisions made, any open questions the main agent should ask the user during grill

<HARD-GATE>
Do NOT return until the spec file is written to `.skillful/spec.md` and self-reviewed. No placeholders, no contradictions.
</HARD-GATE>

### Spec Format

```markdown
# [Project] — Design Spec

**Generated from triage context.** Validated interactively in the next phase.

## Summary
[One-line project summary]

## Tech Stack
- [list]

## Architecture
[2-3 sentence overview]

## Components
[Each component: responsibility, interface, dependencies]

## Data Flow
[How data moves through the system]

## Security Considerations
[From security skill if loaded — auth, validation, encryption]

## Legal/Compliance
[From law skill if loaded — licensing, regulation]

## Approach Trade-offs
[2-3 approaches with reasoning]

## Open Questions
[Things the grill phase should ask the user about]
```

---

## Interactive Mode

When loaded directly by a user (not as a subagent), follow the original design Q&A flow below.

### Skill-Aware Questioning

Check what skills are installed and use domain knowledge from them to ask deeper questions.

### Checklist

1. Review triage context
2. Check loaded skills
3. Ask clarifying questions — one at a time, deeper than usual
4. Propose 2-3 approaches with trade-offs
5. Present design sections, get user approval after each
6. Write design doc to `docs/skillful/specs/YYYY-MM-DD-<topic>-design.md`
7. Spec self-review
8. User reviews written spec
9. Transition to skillful-grill


