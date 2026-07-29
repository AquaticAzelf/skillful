# Skillful

Ever told an AI agent "let's build a thing" and watched it produce a mess? Skillful is an OpenCode plugin that fixes that. It walks you through a proper build pipeline so you don't end up with sloppy designs, missing tests, or code that doesn't match what you asked for.

**What it does:** triage → skill discovery → brainstorming → validation → planning → subagent-driven execution. Think of it as training wheels that turn into a rocket.

## Installation

Add this to your `opencode.json` (global or project-level):

```json
{
  "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git"]
}
```

Restart OpenCode. That's it. Check it worked by asking: "What skills are available?"

### Or just paste this to OpenCode

Copy this into any OpenCode session and the agent handles everything:

> Install the skillful plugin from https://github.com/AquaticAzelf/skillful. If you're on Windows and the git-backed install doesn't work, use npm instead: `npm install skillful@git+https://github.com/AquaticAzelf/skillful.git --prefix "$HOME\.config\opencode"`, then add `"~/.config/opencode/node_modules/skillful"` to your opencode.json plugin array. Tell me when it's ready.

### Updating

OpenCode pins resolved git deps in a cache, so a restart sometimes keeps the old version. If you're not seeing new features, clear OpenCode's package cache or reinstall. To lock a specific version (not recommended unless you have a reason):

```json
{
  "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git#v1.0.0"]
}
```

### Moving from an old install

If you previously cloned the repo manually, switch to the `opencode.json` method above, then clean up:

```bash
rm -f ~/.config/opencode/plugins/plugin.js
rm -rf ~/.config/opencode/skills/skillful
```

## The Workflow

### Building something new

```
Session starts
  └─ using-skillful checks for existing project context
       └─ skillful-triage
            ├─ Is this a small fix or a real project?
            ├─ A few questions about what you're building
            ├─ Finds and installs relevant skills
            │  └─ (design skills are mandatory for UI projects — AI UIs are consistently sloppy without them)
            ├─ Sets up dependencies
            ├─ brainstorming subagent writes a spec
            │  └─ Loads design skills so the spec isn't generic slop
            ├─ skillful-grill pokes holes in the spec (one question at a time)
            ├─ writing-plans turns the spec into bite-sized tasks
            └─ subagent-driven-development executes each task
                 ├─ One subagent per task, fresh context, loads the right skills
                 ├─ Task review after each (spec compliance + code quality)
                 ├─ Fix loop if issues found (max 5 rounds, escalates to smarter model)
                 └─ finishing-a-development-branch (merge / PR / keep / discard)
```

### Fixing a bug

```
systematic-debugging → find root cause → TDD fix → verify → done
```

### Running things in parallel

Multiple independent failures? `dispatching-parallel-agents` fires off one subagent per problem domain — they investigate simultaneously, you integrate the results.

Got a plan but need to run it in a separate session? `executing-plans` handles that. Same session with subagents per task? That's `subagent-driven-development`.

## The 19 Skills

| Skill | What it's for |
|-------|---------------|
| **`using-skillful`** | Boots the plugin, checks for handoff context |
| **`skillful-triage`** | Entry point for new projects: scope, questions, skill discovery |
| **`find-skills`** | Searches and installs skills from the ecosystem |
| **`brainstorming`** | Writes a design spec (subagent mode) or Q&A (interactive) |
| **`skillful-grill`** | Stress-tests the spec before you commit to building |
| **`writing-plans`** | Breaks the spec into tasks with skill assignments |
| **`subagent-driven-development`** | Executes plans task-by-task with review loops |
| **`executing-plans`** | Runs a plan in a separate session |
| **`dispatching-parallel-agents`** | Parallel investigation of independent failures |
| **`writing-skills`** | TDD-based skill creation (test-driven docs) |
| **`security`** | Threat modeling, auth, OWASP during design |
| **`law`** | Licensing, GDPR/HIPAA/compliance checks |
| **`systematic-debugging`** | Root cause investigation before any fix |
| **`test-driven-development`** | Red-green-refactor for every feature or fix |
| **`verification-before-completion`** | Evidence before claims — no lying about passing tests |
| **`requesting-code-review`** | Dispatches a reviewer per task |
| **`receiving-code-review`** | How to handle feedback without being a doormat |
| **`finishing-a-development-branch`** | Merge, PR, keep, or discard with handoff update |
| **`using-git-worktrees`** | Isolated workspaces so you don't break the main branch |

## The Handoff System

Skillful remembers where you left off. Every project gets a `.skillful/handoff.md` that stores your project summary, tech stack, architecture, and last action. Next session, `using-skillful` reads it and picks up where you stopped — no re-asking the same questions.

## Requirements

- [OpenCode.ai](https://opencode.ai)
- Node.js (for `npx skills` skill discovery)

## License

MIT — see [LICENSE](./LICENSE).

**Attribution:** This project is a derivative of [obra/superpowers](https://github.com/obra/superpowers) (MIT, © 2025 Jesse Vincent). The original Superpowers workflow skills have been modified and extended for the skillful pipeline. Superpowers is the philosophical parent; Skillful is the opinionated kid who added training wheels and a design gate.
