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
| `subagent-driven-development` | Execution | Task-by-task implementation with fix loops |
| `executing-plans` | Execution | Execute plans in separate sessions |
| `dispatching-parallel-agents` | Execution | Parallel independent task dispatch |
| `writing-skills` | Authoring | TDD-based skill creation and testing |
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

### Prerequisites

- [OpenCode.ai](https://opencode.ai) installed

### Quick Install

Add skillful to the `plugin` array in your `opencode.json` (global or project-level):

```json
{
  "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git"]
}
```

Restart OpenCode. The plugin installs through OpenCode's plugin manager and registers all skills.

Verify by asking: "Check what skills are available"

### Manual Install (if the plugin manager approach doesn't work)

Clone the repo and point OpenCode at the local path in `opencode.json`:

```bash
git clone https://github.com/AquaticAzelf/skillful.git
```

Then in `opencode.json`:

```json
{
  "plugin": ["path/to/skillful"]
}
```

### Migrating from an old clone/symlink install

If you previously installed skillful by cloning and symlinking, switch to the `opencode.json` method above, then remove the old files:

```bash
rm -f ~/.config/opencode/plugins/plugin.js
rm -rf ~/.config/opencode/skills/skillful
```

### Updating

OpenCode installs skillful through a git-backed package spec. Some OpenCode
and Bun versions pin the resolved git dependency in a lockfile or cache, so a
restart may not pick up the newest commit. If updates do not appear, clear
OpenCode's package cache or reinstall the plugin.

To pin a specific version:

```json
{
  "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git#v1.0.0"]
}
```

### Windows

Some Windows OpenCode builds have issues with git-backed plugin specs. If installation fails, install with npm:

```powershell
npm install skillful@git+https://github.com/AquaticAzelf/skillful.git --prefix "$HOME\.config\opencode"
```

Then point OpenCode at the local path:

```json
{
  "plugin": ["~/.config/opencode/node_modules/skillful"]
}
```

## Requirements

- OpenCode CLI
- Node.js (for `npx skills` skill discovery)
- Plugin loaded via OpenCode's plugin system

## License

MIT — see [LICENSE](./LICENSE).

**Attribution:** This project is a derivative of [obra/superpowers](https://github.com/obra/superpowers) (MIT, © 2025 Jesse Vincent). The original Superpowers workflow skills have been modified and extended for the skillful pipeline.
