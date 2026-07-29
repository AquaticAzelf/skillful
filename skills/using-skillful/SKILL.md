---
name: using-skillful
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, ignore this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Session Start: Check for Existing Project

### Step 0: Load Project Handoff

At the very start of a session, check if this project already has context:

1. Look for `.skillful/handoff.md` in the project root (or wherever the project is)
2. If found, read it — it contains the project summary, tech stack, architecture, current state, and last action
3. **Do NOT re-ask questions the handoff already answers.** Use it as context and continue from where work left off

Report found:
```
Found project handoff for [project name]. Resuming from [last action].
```

Then route based on the handoff's `state` field:

| Handoff state | Route to | Notes |
|---------------|----------|-------|
| `design` | `skillful:skillful-triage` | Spec exists. Tell triage to skip Steps 0-3 and go to Step 5 (Grill). The spec path is in the handoff. |
| `spec` | `skillful:skillful-grill` | Spec validated, write tasks. The spec path is in the handoff. |
| `plan` | `skillful:writing-plans` | Plan approved, execute. The plan path is in the handoff. |
| `executing` | `skillful:subagent-driven-development` | Tasks in progress, check ledger for state. The plan path is in the handoff. |
| `review` | `skillful:requesting-code-review` | Work done, needs review. |
| `complete` | Normal flow | Project context loaded, wait for user request. |
| (missing) | Normal flow | No handoff, start fresh from triage. |

Extract the plan path from the handoff and pass it to the routed skill so it can pick up where it left off.

If no handoff is found, proceed normally.

**After handoff check**, continue with the standard skill loading rules below.

> Formats: This skill uses `skills/_shared/red-flags.md` for its common pattern.

## The Rule

**Invoke relevant or requested skills BEFORE any response or action** — including clarifying questions, exploring the codebase, or checking files. If it turns out wrong for the situation, you don't have to use it.

Then announce "Using [skill] to [purpose]" and follow the skill exactly. If it has a checklist, create a todo per item.

## Skill Priority

When multiple skills apply, process skills come first — they set the approach, then implementation skills carry it out. skillful-triage and systematic-debugging are skillful's most common process skills, but the rule holds for any of them.

- "Let's build X" → skillful:skillful-triage first. It owns the full build pipeline including brainstorming dispatch.
- "Fix this bug" → skillful:systematic-debugging first, then domain skills.

## Red Flags

**"I'll just do this one thing first"** — no. Check for skills before any action, including questions, exploration, and context gathering.

## Platform Adaptation

If your harness appears here, read its reference file for special instructions:

- Codex: `references/codex-tools.md`
- Pi: `references/pi-tools.md`
- Antigravity: `references/antigravity-tools.md`

## User Instructions

User instructions (CLAUDE.md, AGENTS.md, GEMINI.md, etc, direct requests) take precedence over skills, which in turn override default behavior. Only skip skill workflows or instructions when your human partner has explicitly told you to.
