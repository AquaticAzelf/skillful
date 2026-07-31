# Skillful

Structured AI build pipeline for [OpenCode](https://opencode.ai). Triage your idea, brainstorm a spec, stress-test it, plan the work, and execute with subagent-driven development — all without leaving your chat session.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Why Skillful?

Telling an AI agent "let's build a thing" usually produces a mess — sloppy designs, missing tests, code that doesn't match what you asked for. Skillful replaces that with a proven pipeline:

```
idea → triage → brainstorm → validate → plan → execute → review
```

Each phase is a skill that checks its inputs, produces a concrete artifact, and gates progression. You get a design spec before anyone writes code, a plan before anyone starts, and a review after every task.

---

## Features

- **Handoff system** — pick up where you left off across sessions. No re-asking questions.
- **Design-first pipeline** — spec, grill, and plan phases prevent premature implementation.
- **Subagent-driven development** — one agent per task with isolated context, review after every task, and a 5-round fix loop with model escalation.
- **Context leak prevention** — structured dispatch guidance keeps subagent prompts lean.
- **19 specialized skills** — from threat modeling to licensing checks to parallel debugging.
- **55 automated tests** — plugin engine and handoff validation.

---

## Installation

### Prerequisites

- [OpenCode](https://opencode.ai)
- Node.js 18+

### Quick Install

Add this to your `opencode.json` (global or project-level):

```json
{
  "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git"]
}
```

Restart OpenCode. Verify it works by asking: "What skills are available?"

### Windows Notes

If the git-backed install fails, use npm directly:

```bash
npm install skillful@git+https://github.com/AquaticAzelf/skillful.git --prefix "%USERPROFILE%\.config\opencode"
```

Then add `"~/.config/opencode/node_modules/skillful"` to your `opencode.json` plugin array.

### Updating

OpenCode pins resolved git dependencies in its cache. If a restart doesn't pick up new features, clear OpenCode's package cache or reinstall. To pin a specific version:

```json
{
  "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git#v1.0.1"]
}
```

### Migration from Manual Install

If you previously cloned the repo manually:

1. Switch to the `opencode.json` method above
2. Clean up old files:

```bash
rm -f ~/.config/opencode/plugins/plugin.js
rm -rf ~/.config/opencode/skills/skillful
```

---

## Quick Start

Start a new project by describing what you want to build:

```
Let's build a CLI tool that converts Markdown to HTML.
It should read a .md file, support headings/bold/italic/lists,
and write HTML to stdout or a file. Use Node.js with ESM modules.
```

Skillful walks you through:

1. **Triage** — a few questions about scope and tech stack
2. **Skill discovery** — finds and installs relevant skills
3. **Brainstorming** — writes a design spec
4. **Grill** — stress-tests the spec one question at a time
5. **Planning** — breaks the spec into tasks
6. **Execution** — one subagent per task with review after each

---

## Workflow

### Building Something New

```
Session starts
  └─ using-skillful checks for handoff context
       └─ skillful-triage
            ├─ Scope check: small fix or real project?
            ├─ A few questions about what you're building
            ├─ Discovers and installs relevant skills
            ├─ Brainstorming subagent writes a spec
            ├─ skillful-grill stress-tests the spec
            ├─ writing-plans turns the spec into tasks
            └─ subagent-driven-development executes each task
                 ├─ One subagent per task with fresh context
                 ├─ Task review after each (spec + quality)
                 ├─ Fix loop (max 5 rounds, escalates model)
                 └─ finishing-a-development-branch
```

### Fixing a Bug

```
systematic-debugging → find root cause → TDD fix → verify → done
```

### Debugging in Parallel

Multiple independent failures? `dispatching-parallel-agents` fires one subagent per problem domain.

---

## The 19 Skills

| Skill | Purpose |
|-------|---------|
| `using-skillful` | Bootstraps the plugin, checks handoff context |
| `skillful-triage` | Entry point for new projects |
| `find-skills` | Searches and installs skills from the ecosystem |
| `brainstorming` | Writes a design spec (subagent) or guides Q&A (interactive) |
| `skillful-grill` | Stress-tests the spec before committing to build |
| `writing-plans` | Breaks the spec into tasks with skill assignments |
| `subagent-driven-development` | Executes plans task-by-task with review loops |
| `executing-plans` | Runs a plan in a separate session |
| `dispatching-parallel-agents` | Parallel investigation of independent problems |
| `writing-skills` | TDD-based skill creation |
| `security` | Threat modeling, auth patterns, OWASP review |
| `law` | Licensing, GDPR/HIPAA compliance checks |
| `systematic-debugging` | Root cause investigation before any fix |
| `test-driven-development` | Red-green-refactor for every feature |
| `verification-before-completion` | Evidence before claims — never lie about passing tests |
| `requesting-code-review` | Dispatches a reviewer per task |
| `receiving-code-review` | How to handle feedback without being a doormat |
| `finishing-a-development-branch` | Merge, PR, keep, or discard with handoff update |
| `using-git-worktrees` | Isolated workspaces — never break the main branch |

---

## Project Structure

```
.opencode/plugins/plugin.js   # Plugin engine — bootstraps skills
skills/                        # 19 skill directories
  _shared/                     # Shared prompt components
    hard-gates.md              # Phase-gate enforcement
    rationalization-tables.md  # Excuse-reality pairs
    red-flags.md               # Self-diagnostic checks
    context-leak-prevention.md # Dispatch hygiene
  <skill-name>/SKILL.md        # Each skill's instructions
  <skill-name>/scripts/        # Optional helper scripts
test/                          # 55 tests (Node --test)
  plugin.test.js               # Plugin engine + handoff tests
  fixtures/                    # Test fixture files
CHANGELOG.md                   # Release history
package.json                   # Project metadata
```

---

## Architecture

Skillful is an OpenCode plugin that injects bootstrap instructions into the first user message of every session. The plugin engine (`.opencode/plugins/plugin.js`) registers a `skills/` directory and provides a message transform that loads the `using-skillful` skill automatically.

### How It Works

1. **Session starts** — plugin injects bootstrap with tool mappings
2. **Handoff check** — `using-skillful` reads `.skillful/handoff.md` if it exists
3. **State routing** — handoff state determines which skill runs next
4. **Pipeline execution** — each skill produces an artifact (spec, plan, commits)
5. **Handoff update** — state advances through the workflow DAG

### State Machine

```
design → spec → plan → executing → review → complete → (new cycle) design
```

Each transition is validated by `validateHandoffTransition()` in the plugin engine. Invalid transitions (skipping phases, going backwards) are rejected with clear error messages.

---

## Testing

```bash
npm test              # Run all 55 tests
npm run test:verbose  # Run with spec reporter
```

Tests use Node.js built-in `--test` (no Jest, no Mocha).

### Benchmark Suite

Five manual benchmark scenarios are documented in `.skillful/tests/benchmark-suite.md`. Run each scenario as a prompt in a fresh OpenCode session to detect prompt regressions.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes — prefer small, focused commits
4. Run the full test suite: `npm test`
5. Run the benchmark suite for prompt changes
6. Open a pull request

### Development Notes

- The plugin engine is at `.opencode/plugins/plugin.js`
- Skills live in `skills/<name>/SKILL.md`
- Shared prompt patterns live in `skills/_shared/`
- Tests go in `test/` using Node.js `--test`
- The `.skillful/` directory is gitignored — it contains per-session workspace state

---

## License

MIT — see [LICENSE](./LICENSE).

**Attribution:** This project is a derivative of [obra/superpowers](https://github.com/obra/superpowers) (MIT, Copyright 2025 Jesse Vincent). The original Superpowers workflow skills have been modified and extended for the Skillful pipeline. Superpowers is the philosophical parent; Skillful is the opinionated child who added training wheels and a design gate.

## Credits

- [Jesse Vincent](https://github.com/obra) — original Superpowers concept and implementation
- [AquaticAzelf](https://github.com/AquaticAzelf) — Skillful pipeline, hardening, and extensions
