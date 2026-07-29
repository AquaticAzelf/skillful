# Hard Gate Pattern

Hard gates prevent phase transitions until a required condition is met.
They are the mechanism that enforces the Skillful workflow discipline.

## Format

```markdown
<HARD-GATE>
Do NOT proceed until [condition is met]. [Consequence of skipping].
</HARD-GATE>
```

## Rules

- Place immediately before the step that depends on the condition
- State the condition clearly: what must be true before proceeding
- State the consequence: what breaks if skipped
- When a skill says "HARD-GATE" in the context of another skill (e.g.,
  "the `skillful:writing-plans` HARD-GATE"), read that skill's HARD-GATE
  and obey it

## When to Use

- Before any irreversible action (spec write, plan creation, code implementation)
- Before any phase transition that depends on user input
- When skipping a step silently produces wrong output

## When NOT to Use

- For simple validation that can be expressed as a conditional
- For advisory guidance ("recommend" — use a softer pattern)
