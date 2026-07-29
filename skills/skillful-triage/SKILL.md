---
name: skillful-triage
description: Use when user wants to build something new, create a project, add a feature, or start development work. This is the entry point for the skillful build workflow - triages scope, asks broad questions, then triggers skill discovery before deeper work.
---

# Skillful Triage

## Overview

This is the first step in the skillful build workflow. It determines whether the request is a small fix or a real project, asks broad initial questions, then hands off to skill discovery.

**Core principle:** Establish scope first, gather broad context, then let skill discovery power deeper work.

**Expectation:** "I'll ask a few questions about your project, then search for relevant skills, install dependencies, and generate a design spec. About 5 minutes before you see the first results."

## Process

**Fast-path:** If the dispatch prompt says "spec exists, skip to Step 5" — skip Steps 0-4 and go directly to Step 5 (Grill). The handoff already contains the context you need.

### Step 0: Scope Check — Small Fix or Real Project?

Check against concrete criteria:

**Small fix** — ALL of these must be true:
- Changes 1 existing file, creates 0 new files
- No new dependencies
- No architecture change
- No database, API, auth, or state management changes
- Fixes a bug or tweaks existing behavior

→ Skip the heavy workflow. Build with TDD, verify, done.

**Real project** — ANY of these are true:
- Creates multiple new files
- Adds dependencies
- Changes architecture or data model
- Adds new feature end-to-end (UI → logic → storage)
- Requires design decisions

→ Continue with the full build workflow below.

**If unclear:** Ask the user one question: "This looks like it could go either way — is this a quick fix or a larger project?"

<HARD-GATE>
Do NOT proceed to Step 1 until scope is determined. If ANY doubt, ask the user.
</HARD-GATE>

### Step 1: Broad Questions (No Skills Needed)

Ask broad questions about the project. Keep it concise — 3-5 questions. Cover:

1. **What are you building?** — One sentence summary
2. **Tech stack** — Languages, frameworks, libraries
3. **Project type** — Web app, CLI tool, library, mobile, etc.
4. **Key features** — What does it need to do?
5. **Constraints** — Platforms, performance, deployment, timeline

**One question at a time.** Wait for answer before next question.

<HARD-GATE>
Do NOT proceed to Step 2 until you have answers for at least: tech stack, project type, and key features. Skills discovery needs these to search effectively.
</HARD-GATE>

### Step 2: Handoff to Skill Discovery

Announce: "I'll now search for skills relevant to this project."

**REQUIRED SUB-SKILL:** Dispatch a subagent to use find-skills. **Pass the tech stack and project domain gathered in Step 1** so the subagent knows what to search for:

1. Subagent searches for skills matching the project's tech stack and domain (passed from Step 1)
2. Evaluates each skill for quality and relevance
3. **Mandatory design skills:** If the project has a UI (web app, mobile app, desktop app, dashboard, landing page, etc.), design skills are REQUIRED — not optional. Search for and install at minimum:
   - `ui-design` / `frontend-design` — component layout, spacing, typography, color
   - `ux-patterns` — navigation, forms, feedback, accessibility
   - Any tech-specific design skills matching the framework (React, Vue, SwiftUI, etc.)
4. Categorizes found skills:
   - **Planning skills** — For both main agent and sub-agents (design patterns, guidelines, best practices)
   - **Implementation skills** — For sub-agents only (framework specifics, tooling)
5. Installs selected skills
6. Reports back: skill names, what each does, which category
7. The main agent reads this report but does NOT load full skill files yet

**Keep it lean for everything else:** Only install non-design skills that are genuinely valuable. Context window is limited. But design skills for UI projects are mandatory — AI-generated UIs are consistently sloppy without them.

**Fallback:** If `npx skills` is not available or fails, skip skill discovery and proceed without it — the project can still move forward with built-in skills.

<HARD-GATE>
Do NOT proceed to Step 3 until the subagent has reported back (or failed gracefully). You need the skill list for the brainstorming phase.
</HARD-GATE>

### Step 3: Dependency Check

After skills are installed, identify and install project dependencies:

1. **Existing project?** Check for dependency files (package.json, Cargo.toml, requirements.txt, Gemfile, etc.)
   - If found, install: `npm install`, `cargo build`, `pip install -r requirements.txt`, etc.
   - If missing key files, warn and ask before creating
2. **New project?** Ask user what dependency manager to use (npm, cargo, pip, go mod, etc.)
3. **Install critical deps** — The frameworks, runtimes, and tools the project needs
   - Only install what's essential for the dev phase
   - Leave optional/advanced deps for the implementation phase

**Keep it minimal — don't pre-install every possible dependency.**

### Step 4: Handoff to Brainstorming Subagent

After skills are discovered and dependencies are installed, announce:

"Skills loaded, dependencies ready. I'll now generate the design spec."

**REQUIRED SUB-SKILL:** Dispatch a subagent that uses skillful:brainstorming. Pass the following in the dispatch prompt:
- Tech stack, project type, features, constraints (from Step 1)
- Discovered skill names and categories (from Step 2)
- **Design skills found (if any) — the subagent must load these before generating the spec**
- The output path: `.skillful/spec.md`

The subagent produces `.skillful/spec.md` autonomously. After it returns, read the spec file.

<HARD-GATE>
Do NOT proceed to Step 5 until `.skillful/spec.md` exists and you have read it. If the subagent failed, tell the user and ask how to proceed.
</HARD-GATE>

### Step 5: Handoff to Grill

After reading the spec, announce:

"Spec generated. Let me validate it with you — one question at a time, should take 2-5 minutes."

**REQUIRED SUB-SKILL:** Use skillful:skillful-grill to validate the spec with the user interactively.

<HARD-GATE>
Do NOT skip grill or proceed to writing-plans without user validation. The spec has holes — find them now.
</HARD-GATE>

## Key Principles

- **Be concise** — This is the first phase, don't burn context
- **Broad strokes** — Save details for the brainstorming phase
- **Scope discipline** — Use the concrete criteria, don't let a fix balloon into a project
- **Skill quality** — The subagent must verify skills before installing