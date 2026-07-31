# Context Leak Prevention

Dispatch prompts grow when controllers paste accumulated conversation history
into every subagent call. A real dispatch hit 42k characters of which 99% was
carried-over narration, prior-task summaries, and tool output the subagent
will never read. This shared component defines the pattern to prevent that.

## Format

A self-check block before every subagent dispatch. The controller answers
three questions; if any answer is "no," the dispatch needs trimming.

## Self-Check

Before dispatching any subagent, run through these three checks:

1. **Is this prompt carrying unnecessary history?**
   - Check for past task summaries, tool output from unrelated work,
     "as previously discussed" paragraphs, session narration
   - If the subagent doesn't need it to do its job, cut it

2. **Can this information be referenced from an artifact instead?**
   - Task briefs, report files, review packages, diff files, plans, specs,
     handoff files — these are persistent, single-purpose, and stay in sync
   - A file path costs <50 chars. Repeating that file's content costs
     hundreds or thousands and drifts when the file changes

3. **Is the dispatch concise enough for a fresh context?**
   - A fresh subagent has no memory of earlier turns. Everything it needs
     must fit in its first message. Every token spent on background noise
     is a token stolen from the actual work
   - If you would not want to receive the dispatch as your first and only
     message, it is too long

**All of these mean: trim the dispatch. Reference artifacts. Trust the brief.**

## Principles

- **Task briefs are the single source of requirements.** The controller
  extracts them from the plan once. The implementer reads exactly one file.
  Never inline a brief's content into a dispatch — the path is enough.

- **Reports stay in files.** The implementer writes its full report to a file;
  the controller reads only the short status (under 15 lines). The reviewer
  reads the report file directly. The full account never enters any
  controller's context.

- **Diff packages stay in files.** `scripts/review-package` writes a diff
  snapshot to a unique file. The reviewer reads it in one Read call. The
  diff never enters the controller's context.

- **Ledger entries replace "as previously discussed."** When a past task
  parked a finding or made a decision that the current task needs, point at
  the ledger line — don't re-summarize the debate that produced it.

- **Prior-task summaries are the most common leak.** A "brief summary of what
  Task 1 did" in the Task 2 dispatch is the leading cause of prompt bloat.
  If Task 2 needs Task 1's interfaces, put those interfaces in the plan or
  the brief. If Task 2 doesn't need them, the summary is noise.

## Examples

### Poor Dispatch (Context Leak)

```
Subagent (general-purpose):
  description: "Implement Task 2: user authentication"
  prompt: |
    You are implementing Task 2: user authentication.

    [300 words of conversation recap:]
    Earlier we discussed the project architecture. The user wants a Node.js
    CLI tool built with ESM modules. In Task 1 we set up the project structure
    with package.json, installed dependencies, and created the entry point.
    The user confirmed the tech stack during brainstorming and approved the
    spec in the grill phase. We decided on single-file output, no CSS
    embedding. The project uses marked library.
    [more history dump — easily 2-5k chars of context the subagent
     already has in its brief or doesn't need at all]

    Read your task brief: .skillful/sdd/plan/task-2-brief.md

    Work from: /repo
```

**Problems:** The opening history dump copies accumulated conversation into
the subagent's context. The brief already contains the task requirements.
The tech-stack decisions are in the plan and spec — both referenceable by
path. This dispatch wastes thousands of tokens on information the subagent
either already has (it reads the brief) or doesn't need (Task 1's setup).

### Good Dispatch (Artifact References)

```
Subagent (general-purpose):
  description: "Implement Task 2: user authentication"
  prompt: |
    You are implementing Task 2: user authentication.

    ## Task Description

    Read your task brief: .skillful/sdd/plan/task-2-brief.md
    It contains the full task requirements.

    ## Context

    Global constraints from the plan:
    - Node.js, ESM modules, marked library
    - Single-file CLI output (no CSS embedding)
    - User-level config (~/.config/skillful/)

    Task 1's `ConfigManager` interface (from plan section "Interfaces"):
    - `new ConfigManager(configDir)` — loads config from directory
    - `.get(key)` — returns config value
    - `.set(key, value)` — writes config value
    Auth extends this with a `UserSession` type.
    See ledger: Task 1 parked a finding on token storage —
    `.skillful/sdd/plan/progress.md` line "Task 1: parked — token storage".
    Read that entry if you touch credential persistence.

    ## Load Required Skills

    test-driven-development

    Work from: /repo
```

**Why this works:** No history dump — three bullet points of context that
actually constrain the task. Interface contracts come from the plan, not
from a re-summarized Task 1. The parked finding is a ledger pointer, not a
paragraph of prior review debate. The entire dispatch stays under 30 lines
of substantive instruction; the brief file carries the detail.
