# Changelog

## v1.0.1 (2026-07-31)

### Bug Fixes

- **Fix startup crash on OpenCode 1.18.x** — the plugin engine exported six helper functions alongside the plugin itself. OpenCode calls every exported function as a plugin factory, which broke server initialization on launch ("Unexpected server error"). Helpers moved to `.opencode/helpers.js`; `.opencode/plugins/plugin.js` now exports only `SkillfulPlugin`.

### Migration Notes

- **If you pinned `#v1.0.0`, update your pin to `#v1.0.1`** — the v1.0.0 tag points at the crashing build. Unpinned installs (no version ref) automatically receive the fix.
- If OpenCode fails to pick up the update, clear OpenCode's package cache or reinstall.

---

## v1.0.0 (2026-07-31)

Initial release. Core pipeline: triage → skill discovery → brainstorming → grill → writing plans → subagent-driven development.

### Major Features

- **Handoff validation & branch tracking** — state machine (`design → spec → plan → executing → review → complete`) with `validateHandoffTransition`, `parseHandoff`, `readHandoff`, and `getCurrentBranch`. 27 new tests.
- **Context leak prevention** — shared component with three-question self-check for subagent dispatch, artifact references over history copies, poor vs good dispatch examples.
- **Shared prompt components** — `hard-gates.md`, `rationalization-tables.md`, `red-flags.md` for consistent enforcement patterns across all skills.
- **Token efficiency** — ~1,500 lines (38%) trimmed across all 19 skills. Pure duplication and padding removed. Behavioral guardrails preserved.

### Infrastructure

- Plugin engine hardening — null guards, BOM handling, error handling, cache invalidation with mtime tracking.
- 55 tests across 7 suites (up from 0).
- Benchmark suite — 5 manual scenarios for regression detection.
- Release-ready README, CHANGELOG, and license documentation.

### Breaking Changes

None. This is the initial release.

### Migration Notes

- If you previously cloned the repo manually, switch to the `opencode.json` plugin method:
  ```json
  { "plugin": ["skillful@git+https://github.com/AquaticAzelf/skillful.git"] }
  ```
- Then remove the old manual install:
  ```bash
  rm -f ~/.config/opencode/plugins/plugin.js
  rm -rf ~/.config/opencode/skills/skillful
  ```
