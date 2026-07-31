# Red Flags Pattern

Red flags are self-diagnostic checks that help agents recognize when they are
about to violate a rule. They appear before the rationalization table and
serve as an early warning system.

## Format

```markdown
## Red Flags — STOP

[Trigger thoughts that signal the agent is rationalizing, in any format:
- Bullet list
- Table with "Thought" and "Reality" columns
- Inline code block

End with: **All of these mean: [action to take].**]
```

## Rules

- Red flags are about to STOP the current approach, not about the problem domain
- Each flag must be a thought pattern an agent would recognize in themselves
- End with a clear directive of what to do instead
- The more specific the flag, the more useful it is

## When to Use

- In enforcement skills where agents commonly rationalize
- When a specific thought pattern ("I'll test after", "Should work now") leads to violations
- After observing the same rationalization across multiple testing sessions

## When NOT to Use

- For checklists of technical requirements (that's a different pattern)
- For warnings about external risks (use a regular caution section)
