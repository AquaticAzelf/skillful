# Skillful — Handoff

**state:** complete

**Last action:** Published to GitHub. All 16 skills finalized.

**Summary:** Custom OpenCode workflow plugin with triage → skill discovery → brainstorming subagent → grill validation → writing-plans → subagent-driven-development execution.

**Tech Stack:** OpenCode plugin system, Node.js (npx skills CLI), MIT license.

**Spec:** `.skillful/spec.md` (not applicable — this was the plugin build itself)

**Plan:** None — built iteratively in conversation, not from a formal plan.

**Key decisions:**
- Brainstorming runs as a subagent (saves main agent context)
- Handoff file at `.skillful/handoff.md` with state routing
- HARD-GATEs at every phase transition to prevent skip
- Concrete small-fix criteria (not vibes-based)
- `skillful:` prefix stripped in SDD dispatch (tool expects bare names)

**Next steps (porting to other platforms):**
- Claude Code: needs `.claude/` plugin config, different tool mapping
- Codex: needs `.codex-plugin/plugin.json`, different message transform API
- Cursor: different plugin manifest format
- Each platform has its own tool set — the skill content stays the same, the bootstrap injection changes
