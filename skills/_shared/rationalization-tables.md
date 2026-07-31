# Rationalization Table Pattern

Rationalization tables pair common excuses with their technical reality.
They prevent agents from justifying rule violations.

## Format

```markdown
| Excuse | Reality |
|--------|---------|
| "[common rationalization]" | "[why it's wrong]" |
```

## Rules

- Each entry must be a real rationalization observed in testing (not hypothetical)
- Reality side must explain WHY the excuse is wrong, not just say "it's wrong"
- Tables should be ordered by most common rationalization first
- Keep entries concise — one sentence per cell

## When to Use

- In enforcement skills (TDD, verification, debugging) where agents commonly rationalize violations
- After observing a new rationalization in testing — add it immediately
- When the skill prohibits a behavior that agents naturally find reasons to skip

## When NOT to Use

- For positive guidance ("do this") — use direct instructions instead
- For rare edge cases that no agent has rationalized about
- When a simple prohibition suffices ("Never do X")
