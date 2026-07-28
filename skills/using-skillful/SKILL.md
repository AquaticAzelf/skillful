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

## The Rule

**Invoke relevant or requested skills BEFORE any response or action** — including clarifying questions, exploring the codebase, or checking files. If it turns out wrong for the situation, you don't have to use it.

**Before entering plan mode:** if you haven't already brainstormed, invoke the brainstorming skill first.

Then announce "Using [skill] to [purpose]" and follow the skill exactly. If it has a checklist, create a todo per item.

## Skill Priority

When multiple skills apply, process skills come first — they set the approach, then implementation skills carry it out.

- "Let's build X" → skillful:skillful-triage first (triages scope, discovers skills, deep-dives, validates), then planning skills.
- "Fix this bug" → skillful:systematic-debugging first, then domain skills.

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Platform Adaptation

If your harness appears here, read its reference file for special instructions:

- Codex: `references/codex-tools.md`
- Pi: `references/pi-tools.md`
- Antigravity: `references/antigravity-tools.md`

## User Instructions

User instructions (CLAUDE.md, AGENTS.md, GEMINI.md, etc, direct requests) take precedence over skills, which in turn override default behavior. Only skip skill workflows or instructions when your human partner has explicitly told you to.
