# Skillful

A custom OpenCode workflow plugin with a structured build pipeline: **triage → skill discovery → brainstorming → validation → planning → subagent-driven execution**.

## Workflow

### Build Path ("Let's build X")

```
Session Start
  └─ using-skillful (bootstrap)
       └─ skillful-triage
            ├─ Scope check (small fix or real project?)
            ├─ Broad questions (tech stack, features, constraints)
            ├─ Skill discovery via find-skills subagent
            ├─ Dependency installation
            ├─ brainstorming subagent (autonomous spec generation)
            ├─ skillful-grill (spec validation, one question at a time)
            ├─ writing-plans (per-task plan with skill assignments)
            └─ subagent-driven-development
                 ├─ Each task: dispatch implementer with assigned skills
                 ├─ Task reviewer checks spec + quality
                 └─ finishing-a-development-branch (merge/PR/keep/discard)
                      └─ Saves/updates .skillful/handoff.md
```

### Fix Path ("Fix this bug")

```
systematic-debugging → root cause → TDD fix → verification
```

## Handoff System

When returning to a project, `using-skillful` checks for `.skillful/handoff.md` and resumes from where work left off — no re-asking questions.

## Skills

| Skill | Type | Purpose |
|-------|------|---------|
| `using-skillful` | Bootstrap | Session routing, handoff detection |
| `skillful-triage` | Build | Scope, questions, skill discovery, deps |
| `find-skills` | Discovery | Find and install relevant skills |
| `brainstorming` | Design | Autonomous spec generation (subagent) or interactive Q&A |
| `skillful-grill` | Validation | Stress-test spec for holes |
| `writing-plans` | Planning | Per-task plans, skill assignments |
| `subagent-driven-development` | Execution | Task-by-task implementation |
| `security` | Planning | Threat modeling, auth, OWASP |
| `law` | Planning | Licensing, GDPR/HIPAA/compliance |
| `systematic-debugging` | Fix | Root cause investigation |
| `test-driven-development` | Implementation | Red-green-refactor |
| `verification-before-completion` | Gate | Evidence before claims |
| `requesting-code-review` | Review | Per-task code review dispatch |
| `receiving-code-review` | Review | Technical rigor in feedback |
| `finishing-a-development-branch` | Finish | Merge/PR/cleanup + handoff update |
| `using-git-worktrees` | Infrastructure | Isolated workspaces |

## Installation

1. Clone this repo into your OpenCode plugins directory
2. The plugin auto-registers via `package.json` and `.opencode/plugins/plugin.js`
3. Skills are automatically loaded from `skills/`

## Requirements

- OpenCode CLI
- Node.js (for `npx skills` skill discovery)
- Plugin loaded via OpenCode's plugin system

## License

MIT — see [LICENSE](./LICENSE).

**Attribution:** This project is a derivative of [obra/superpowers](https://github.com/obra/superpowers) (MIT, © 2025 Jesse Vincent). The original Superpowers workflow skills have been modified and extended for the skillful pipeline.
